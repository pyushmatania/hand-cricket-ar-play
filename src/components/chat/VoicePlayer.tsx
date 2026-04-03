import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

interface VoicePlayerProps {
  url: string;
  isMe: boolean;
}

export default function VoicePlayer({ url, isMe }: VoicePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current) {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onloadedmetadata = () => setDuration(audio.duration);
      audio.ontimeupdate = () => setProgress(audio.currentTime / (audio.duration || 1));
      audio.onended = () => { setPlaying(false); setProgress(0); };
    }
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const formatDur = (s: number) => {
    if (!s || !isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-2xl min-w-[140px] ${
        isMe
          ? "bg-primary/20 border border-primary/30 rounded-br-sm"
          : "bg-muted/40 border border-border/30 rounded-bl-sm"
      }`}
    >
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={toggle}
        className={`w-7 h-7 rounded-full flex items-center justify-center ${
          isMe ? "bg-primary/30" : "bg-muted/60"
        }`}
      >
        {playing ? (
          <Pause className="w-3 h-3 text-foreground fill-foreground" />
        ) : (
          <Play className="w-3 h-3 text-foreground fill-foreground ml-0.5" />
        )}
      </motion.button>

      <div className="flex-1 flex flex-col gap-1">
        {/* Waveform placeholder */}
        <div className="h-3 flex items-center gap-[2px]">
          {Array.from({ length: 20 }).map((_, i) => {
            const height = Math.sin(i * 0.8) * 0.5 + 0.5;
            const filled = i / 20 <= progress;
            return (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-colors ${
                  filled
                    ? isMe ? "bg-primary" : "bg-foreground/60"
                    : isMe ? "bg-primary/30" : "bg-muted-foreground/20"
                }`}
                style={{ height: `${4 + height * 8}px` }}
              />
            );
          })}
        </div>
        <span className={`text-[7px] ${isMe ? "text-primary/60" : "text-muted-foreground/60"}`}>
          🎤 {formatDur(playing ? (audioRef.current?.currentTime ?? 0) : duration)}
        </span>
      </div>
    </div>
  );
}
