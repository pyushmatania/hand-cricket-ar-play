/**
 * Team Lineup Walkout — Cinematic player introduction
 * Players walk in from left/right with spotlight tracking.
 * Duration: ~3.5s total
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SFX } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";

interface TeamLineupWalkoutProps {
  playerName: string;
  opponentName: string;
  playerEmoji?: string;
  opponentEmoji?: string;
  onComplete: () => void;
}

const WALK_DURATION = 3500;

export default function TeamLineupWalkout({
  playerName,
  opponentName,
  playerEmoji = "🏏",
  opponentEmoji = "🤖",
  onComplete,
}: TeamLineupWalkoutProps) {
  const [phase, setPhase] = useState<"walk" | "face" | "done">("walk");
  const { soundEnabled } = useSettings();

  useEffect(() => {
    if (soundEnabled) SFX.whoosh();
    const t1 = setTimeout(() => setPhase("face"), 1800);
    const t2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, WALK_DURATION);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete, soundEnabled]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[73] overflow-hidden"
          style={{ background: "hsl(220 30% 4%)" }}
        >
          {/* Pitch floor gradient */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[40%]"
            style={{
              background: "linear-gradient(180deg, hsl(100 25% 12%) 0%, hsl(100 20% 6%) 100%)",
            }}
          />

          {/* Center spotlight cone */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0.5 }}
            animate={{ opacity: 0.25, scaleY: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-32"
            style={{
              height: "100%",
              background: "linear-gradient(180deg, hsl(43 96% 80% / 0.3) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />

          {/* Moving spotlight tracking player (left side) */}
          <motion.div
            initial={{ x: "-60vw" }}
            animate={{ x: phase === "face" ? "-5vw" : "-20vw" }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="absolute top-[10%] w-20 h-[90%]"
            style={{
              background: "radial-gradient(ellipse at center top, hsl(43 96% 80% / 0.15) 0%, transparent 70%)",
              filter: "blur(15px)",
            }}
          />

          {/* Moving spotlight tracking opponent (right side) */}
          <motion.div
            initial={{ x: "60vw" }}
            animate={{ x: phase === "face" ? "5vw" : "20vw" }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="absolute top-[10%] right-0 w-20 h-[90%]"
            style={{
              background: "radial-gradient(ellipse at center top, hsl(43 96% 80% / 0.15) 0%, transparent 70%)",
              filter: "blur(15px)",
            }}
          />

          {/* Player silhouette (walks in from left) */}
          <motion.div
            initial={{ x: "-120%", opacity: 0 }}
            animate={{
              x: phase === "face" ? "0%" : "-30%",
              opacity: 1,
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[30%] left-[15%] flex flex-col items-center"
          >
            {/* Avatar circle */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{
                background: "linear-gradient(135deg, hsl(217 91% 55%), hsl(217 80% 35%))",
                boxShadow: "0 0 30px hsl(217 91% 55% / 0.4), 0 4px 20px hsl(0 0% 0% / 0.5)",
                border: "2px solid hsl(217 80% 70% / 0.5)",
              }}
            >
              {playerEmoji}
            </div>
            {/* Name plate */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={phase === "face" ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-2 px-3 py-1 rounded-sm"
              style={{
                background: "hsl(0 0% 0% / 0.6)",
                border: "1px solid hsl(43 96% 56% / 0.3)",
              }}
            >
              <span
                className="text-[10px] font-bold tracking-[0.2em]"
                style={{ color: "hsl(0 0% 95%)" }}
              >
                {playerName.toUpperCase()}
              </span>
            </motion.div>
          </motion.div>

          {/* Opponent silhouette (walks in from right) */}
          <motion.div
            initial={{ x: "120%", opacity: 0 }}
            animate={{
              x: phase === "face" ? "0%" : "30%",
              opacity: 1,
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[30%] right-[15%] flex flex-col items-center"
          >
            {/* Avatar circle */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{
                background: "linear-gradient(135deg, hsl(0 75% 55%), hsl(0 65% 35%))",
                boxShadow: "0 0 30px hsl(0 75% 55% / 0.4), 0 4px 20px hsl(0 0% 0% / 0.5)",
                border: "2px solid hsl(0 65% 70% / 0.5)",
              }}
            >
              {opponentEmoji}
            </div>
            {/* Name plate */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={phase === "face" ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-2 px-3 py-1 rounded-sm"
              style={{
                background: "hsl(0 0% 0% / 0.6)",
                border: "1px solid hsl(0 75% 50% / 0.3)",
              }}
            >
              <span
                className="text-[10px] font-bold tracking-[0.2em]"
                style={{ color: "hsl(0 0% 95%)" }}
              >
                {opponentName.toUpperCase()}
              </span>
            </motion.div>
          </motion.div>

          {/* VS flash when they face off */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={phase === "face" ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: "spring", damping: 10, delay: 0.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span
              className="font-display text-4xl font-black"
              style={{
                color: "hsl(43 96% 56%)",
                textShadow: "0 0 30px hsl(43 96% 56% / 0.5), 0 2px 10px hsl(0 0% 0% / 0.8)",
              }}
            >
              VS
            </span>
          </motion.div>

          {/* Bottom vignette */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[20%]"
            style={{ background: "linear-gradient(to top, hsl(220 30% 4%), transparent)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
