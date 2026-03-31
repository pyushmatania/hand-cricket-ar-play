import { motion, AnimatePresence } from "framer-motion";
import type { Move } from "@/hooks/useHandCricket";
import type { BallResult } from "@/hooks/useHandCricket";

interface GestureDisplayProps {
  status: string;
  detectedMove: Move | null;
  lockedMove: Move | null;
  confidence: number;
  lastResult: BallResult | null;
  onCapture: () => void;
  canCapture: boolean;
}

const moveEmoji: Record<string, string> = {
  DEF: "✊",
  "1": "☝️",
  "2": "✌️",
  "3": "🤟",
  "4": "🖖",
  "5": "🖐️",
  "6": "6️⃣",
};

function moveLabel(m: Move | null): string {
  if (m === null) return "—";
  return m === "DEF" ? "DEF" : String(m);
}

export default function GestureDisplay({
  status,
  detectedMove,
  lockedMove,
  confidence,
  lastResult,
  onCapture,
  canCapture,
}: GestureDisplayProps) {
  const displayMove = lockedMove ?? detectedMove;

  return (
    <div className="space-y-2">
      {/* Detection status */}
      <div className="glass p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === "detected"
                ? "bg-primary animate-pulse-glow"
                : status === "no_hand"
                ? "bg-out-red"
                : status === "loading"
                ? "bg-secondary animate-pulse"
                : "bg-muted-foreground"
            }`}
          />
          <span className="text-xs text-muted-foreground font-semibold">
            {status === "loading" && "Initializing…"}
            {status === "ready" && "Show your hand"}
            {status === "no_hand" && "No hand detected"}
            {status === "unclear" && "Unclear gesture"}
            {status === "detected" && `Detected: ${moveLabel(detectedMove)}`}
          </span>
        </div>
        {status === "detected" && (
          <span className="text-[10px] text-muted-foreground">
            {Math.round(confidence * 100)}%
          </span>
        )}
      </div>

      {/* Move display + capture */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1 font-semibold">YOUR MOVE</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={String(displayMove)}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-3xl"
            >
              {displayMove ? moveEmoji[String(displayMove)] || "❓" : "—"}
            </motion.div>
          </AnimatePresence>
          <p className="text-sm font-display font-bold text-primary mt-1">
            {moveLabel(displayMove)}
          </p>
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={onCapture}
            disabled={!canCapture}
            className={`w-16 h-16 rounded-full font-display font-bold text-xs transition-all ${
              canCapture
                ? "bg-primary text-primary-foreground glow-primary hover:brightness-110 active:scale-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {lockedMove ? "PLAY!" : "LOCK"}
          </button>
        </div>

        <div className="glass p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1 font-semibold">AI MOVE</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={String(lastResult?.aiMove)}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl"
            >
              {lastResult ? moveEmoji[String(lastResult.aiMove)] || "🤖" : "🤖"}
            </motion.div>
          </AnimatePresence>
          <p className="text-sm font-display font-bold text-accent mt-1">
            {lastResult ? (lastResult.aiMove === "DEF" ? "DEF" : String(lastResult.aiMove)) : "—"}
          </p>
        </div>
      </div>

      {/* Last result */}
      {lastResult && (
        <motion.div
          key={lastResult.description}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass p-2 text-center text-sm font-semibold ${
            lastResult.runs === "OUT" ? "text-out-red border-out-red/30" : "text-foreground"
          }`}
        >
          {lastResult.description}
        </motion.div>
      )}
    </div>
  );
}
