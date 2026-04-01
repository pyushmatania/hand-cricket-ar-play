import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import CameraFeed, { type CameraFeedHandle } from "./CameraFeed";
import HandOverlay from "./HandOverlay";
import { useHandDetection } from "@/hooks/useHandDetection";

interface PracticeScreenProps {
  onHome: () => void;
}

const moveEmoji: Record<string, string> = {
  DEF: "✊", "1": "☝️", "2": "✌️", "3": "🤟", "4": "🖖", "6": "👍",
};

const GESTURE_INFO: Record<string, { name: string; desc: string }> = {
  DEF: { name: "DEFEND", desc: "Fist closed — blocks or bowls" },
  "1": { name: "SINGLE", desc: "Index finger — 1 run" },
  "2": { name: "DOUBLE", desc: "Peace sign — 2 runs" },
  "3": { name: "TRIPLE", desc: "Rock sign — 3 runs" },
  "4": { name: "BOUNDARY", desc: "Vulcan salute — 4 runs" },
  "6": { name: "SIX!", desc: "Thumbs up — maximum runs" },
};

export default function PracticeScreen({ onHome }: PracticeScreenProps) {
  const cameraRef = useRef<CameraFeedHandle>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const detection = useHandDetection(videoElementRef);

  const handleVideoReady = useCallback(
    (video: HTMLVideoElement) => {
      videoElementRef.current = video;
      detection.startDetection();
    },
    [detection]
  );

  const videoW = videoElementRef.current?.videoWidth || 640;
  const videoH = videoElementRef.current?.videoHeight || 480;
  const moveKey = detection.detectedMove ? String(detection.detectedMove) : null;
  const info = moveKey ? GESTURE_INFO[moveKey] : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={onHome}
          className="text-muted-foreground hover:text-foreground text-sm font-bold active:scale-95 transition-transform"
        >
          ← Back
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="font-display text-[9px] tracking-[0.15em] text-neon-green font-bold">
            PRACTICE MODE
          </span>
        </div>
        <div className="w-8" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col gap-3 px-4 pb-4 max-w-lg mx-auto w-full">
        {/* Camera */}
        <div className="relative rounded-2xl overflow-hidden">
          <CameraFeed ref={cameraRef} onVideoReady={handleVideoReady} stadiumMode={false} fullscreen={false} filter="natural" />
          <HandOverlay
            landmarks={detection.landmarks}
            videoWidth={videoW}
            videoHeight={videoH}
            status={detection.status}
            gloveStyle="neon"
            mirrored={false}
          />

          {/* Detected gesture overlay on camera */}
          {moveKey && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-3 left-3 bg-card/80 backdrop-blur-xl rounded-xl px-3 py-2 border border-neon-green/30 z-[10]"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{moveEmoji[moveKey]}</span>
                <div>
                  <span className="font-display text-xs font-black text-neon-green block">{info?.name}</span>
                  <span className="text-[8px] text-muted-foreground">{Math.round(detection.confidence * 100)}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Detection result card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-score p-5 text-center"
        >
          <p className="text-[8px] text-muted-foreground font-display tracking-widest mb-3">
            DETECTED GESTURE
          </p>
          <div className="flex items-center justify-center gap-4">
            <motion.span
              key={moveKey || "none"}
              initial={{ scale: 0.5, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              className="text-5xl"
            >
              {moveKey ? moveEmoji[moveKey] || "❓" : "✋"}
            </motion.span>
            <div className="text-left">
              <p className="font-display text-2xl font-black text-primary">
                {info?.name || "SHOW HAND"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {info?.desc || "Position your hand in front of the camera"}
              </p>
              {/* Confidence bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-neon-green to-primary"
                    animate={{ width: `${Math.round(detection.confidence * 100)}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <span className="text-[9px] font-display font-bold text-muted-foreground">
                  {Math.round(detection.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Gesture guide */}
        <div className="glass-premium p-4 rounded-xl">
          <p className="text-[8px] font-display text-muted-foreground font-bold tracking-widest mb-3">
            GESTURE GUIDE
          </p>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(moveEmoji).map(([key, emoji]) => (
              <motion.div
                key={key}
                animate={
                  String(detection.detectedMove) === key
                    ? { scale: 1.15, borderColor: "hsl(145 80% 50%)" }
                    : { scale: 1 }
                }
                className={`text-center p-2 rounded-xl transition-all border ${
                  String(detection.detectedMove) === key
                    ? "bg-neon-green/10 border-neon-green/40"
                    : "bg-muted/20 border-transparent"
                }`}
              >
                <span className="text-xl block">{emoji}</span>
                <span className="text-[7px] font-display font-bold text-muted-foreground mt-0.5 block">
                  {key}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
