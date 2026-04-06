import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SFX, Haptics } from "@/lib/sounds";

interface VoiceRecorderProps {
  onVoiceSent: (url: string) => void;
}

export default function VoiceRecorder({ onVoiceSent }: VoiceRecorderProps) {
  const { user } = useAuth();
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRef.current?.state === "recording") mediaRef.current.stop();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) return; // Too short

        setUploading(true);
        const fileName = `${user!.id}/${Date.now()}.webm`;
        const { error } = await supabase.storage
          .from("voice-messages")
          .upload(fileName, blob, { contentType: "audio/webm" });

        if (!error) {
          const { data: urlData } = supabase.storage
            .from("voice-messages")
            .getPublicUrl(fileName);
          onVoiceSent(urlData.publicUrl);
        }
        setUploading(false);
        setDuration(0);
      };

      mediaRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      setDuration(0);
      SFX.tap();
      Haptics.light();

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d >= 30) {
            stopRecording();
            return d;
          }
          return d + 1;
        });
      }, 1000);
    } catch {
      // Mic not available
    }
  };

  const stopRecording = () => {
    if (mediaRef.current?.state === "recording") {
      mediaRef.current.stop();
    }
    setRecording(false);
    SFX.tap();
    Haptics.medium();
  };

  const formatDur = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (uploading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
        <span className="text-[9px] text-muted-foreground font-body">Sending voice...</span>
      </div>
    );
  }

  if (recording) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-2 py-1.5"
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-3 h-3 rounded-full bg-game-red"
        />
        <span className="text-[10px] font-display text-game-red tracking-wider flex-1">
          REC {formatDur(duration)}
        </span>
        <span className="text-[7px] text-muted-foreground">max 30s</span>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={stopRecording}
          className="w-8 h-8 rounded-xl bg-game-red/20 border border-game-red/40 flex items-center justify-center"
        >
          <Square className="w-3.5 h-3.5 text-game-red fill-game-red" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={startRecording}
      className="w-8 h-8 rounded-xl bg-muted/20 border border-border/20 flex items-center justify-center"
      title="Voice message"
    >
      <Mic className="w-3.5 h-3.5 text-muted-foreground" />
    </motion.button>
  );
}
