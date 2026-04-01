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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={onHome}
          className="text-muted-foreground hover:text-foreground text-sm font-bold active:scale-95 transition-transform"
        >
          ← Back
        </button>
        <span className="font-display text-[9px] tracking-[0.15em] text-secondary font-bold">
          PRACTICE MODE
        </span>
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
        </div>

        {/* Detection status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-score p-5 text-center"
        >
          <p className="text-[9px] text-muted-foreground font-display tracking-wider mb-3">
            DETECTED GESTURE
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-5xl">
              {detection.detectedMove ? moveEmoji[String(detection.detectedMove)] || "❓" : "✋"}
            </span>
            <div className="text-left">
              <p className="font-display text-2xl font-black text-primary">
                {detection.detectedMove
                  ? detection.detectedMove === "DEF"
                    ? "DEFEND"
                    : `${detection.detectedMove} RUN${Number(detection.detectedMove) > 1 ? "S" : ""}`
                  : "SHOW HAND"}
              </p>
              <p className="text-xs text-muted-foreground">
                Confidence: {Math.round(detection.confidence * 100)}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Gesture guide */}
        <div className="glass-premium p-4">
          <p className="text-[9px] font-display text-muted-foreground font-bold tracking-wider mb-3">
            GESTURE GUIDE
          </p>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(moveEmoji).map(([key, emoji]) => (
              <div
                key={key}
                className={`text-center p-2 rounded-lg transition-all ${
                  String(detection.detectedMove) === key
                    ? "bg-primary/20 border border-primary/40 scale-110"
                    : "bg-muted/30"
                }`}
              >
                <span className="text-lg block">{emoji}</span>
                <span className="text-[8px] font-display font-bold text-muted-foreground">
                  {key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
