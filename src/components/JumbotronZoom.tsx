// ═══════════════════════════════════════════════════
// Doc 5 §4.2 — Stadium Jumbotron Zoom Transition
// Camera zooms into jumbotron displaying VS graphic
// ═══════════════════════════════════════════════════

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface JumbotronZoomProps {
  team1Name: string;
  team2Name: string;
  team1Color?: string;
  team2Color?: string;
  onComplete?: () => void;
  duration?: number;
}

export default function JumbotronZoom({
  team1Name, team2Name,
  team1Color = "hsl(207 90% 54%)", team2Color = "hsl(4 90% 58%)",
  onComplete, duration = 2000,
}: JumbotronZoomProps) {
  const [phase, setPhase] = useState<"zoom" | "done">("zoom");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "hsl(222 47% 6%)" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stadium background (blurred, out of focus) */}
      <div className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, hsl(220 30% 8%) 0%, hsl(25 20% 6%) 60%, hsl(122 20% 8%) 100%)",
          filter: "blur(8px)",
        }} />

      {/* Crowd silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%]"
        style={{
          background: "linear-gradient(180deg, transparent, hsl(222 30% 4%))",
          maskImage: "linear-gradient(to top, black 40%, transparent)",
        }} />

      {/* Jumbotron screen that zooms in */}
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        initial={{ scale: 0.3, y: -50 }}
        animate={{ scale: phase === "zoom" ? 1.2 : 1, y: 0 }}
        transition={{ duration: duration / 1000, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          width: "90%",
          maxWidth: 380,
          aspectRatio: "16/9",
          background: "hsl(222 40% 4%)",
          border: "3px solid hsl(210 10% 30%)",
          boxShadow: "0 0 60px rgba(0,0,0,0.8), 0 0 120px hsl(207 90% 54% / 0.1)",
        }}
      >
        {/* LED screen glow */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${team1Color}20, transparent 50%, ${team2Color}20)`,
        }} />

        {/* VS content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Team 1 */}
          <motion.div
            className="flex-1 flex flex-col items-center justify-center"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="text-3xl mb-1">🏏</span>
            <span className="font-display text-[10px] font-bold tracking-wider"
              style={{ color: team1Color }}>{team1Name}</span>
          </motion.div>

          {/* VS */}
          <motion.div
            className="px-4"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 12 }}
          >
            <span className="font-display text-2xl" style={{
              background: "linear-gradient(180deg, hsl(43 90% 55%), hsl(25 80% 50%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: "drop-shadow(0 2px 8px hsl(43 90% 55% / 0.4))",
            }}>VS</span>
          </motion.div>

          {/* Team 2 */}
          <motion.div
            className="flex-1 flex flex-col items-center justify-center"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="text-3xl mb-1">🏏</span>
            <span className="font-display text-[10px] font-bold tracking-wider"
              style={{ color: team2Color }}>{team2Name}</span>
          </motion.div>
        </div>

        {/* Scan line effect */}
        <motion.div
          className="absolute inset-x-0 h-px pointer-events-none"
          style={{ background: "hsl(0 0% 100% / 0.08)" }}
          animate={{ y: [0, 200] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Stadium PA audio hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-[7px] font-display tracking-[0.3em] text-muted-foreground">🔊 STADIUM PA</span>
      </motion.div>
    </motion.div>
  );
}
