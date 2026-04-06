/**
 * Team Lineup Walkout — Cinematic player introduction
 * Players walk in from left/right with spotlight tracking.
 * Uses 3D character illustrations from assets/characters.
 * Duration: ~3.5s total
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SFX } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import { getAvatarPreset } from "@/lib/avatars";
import { CHARACTERS } from "@/assets/characters";

const FRAME_RING_STYLES: Record<string, { ring: string; glow: string }> = {
  "Bronze Ring": { ring: "hsl(25 70% 45%)", glow: "hsl(25 70% 45% / 0.4)" },
  "Silver Glow": { ring: "hsl(0 0% 75%)", glow: "hsl(0 0% 75% / 0.4)" },
  "Gold Crown": { ring: "hsl(45 93% 58%)", glow: "hsl(45 93% 58% / 0.5)" },
  "Diamond Edge": { ring: "hsl(192 91% 60%)", glow: "hsl(192 91% 60% / 0.5)" },
  "Fire Ring": { ring: "hsl(25 95% 53%)", glow: "hsl(25 95% 53% / 0.5)" },
  "Neon Pulse": { ring: "hsl(280 70% 60%)", glow: "hsl(280 70% 60% / 0.5)" },
  "Champion Aura": { ring: "hsl(45 93% 58%)", glow: "hsl(45 93% 58% / 0.6)" },
};

interface TeamLineupWalkoutProps {
  playerName: string;
  opponentName: string;
  playerAvatarIndex?: number;
  playerAvatarUrl?: string | null;
  playerFrame?: string | null;
  playerEmoji?: string;
  opponentEmoji?: string;
  /** Character illustration key: 'batsman' | 'bowler' | 'allrounder' | 'keeper' | 'captain' */
  playerCharacter?: string;
  opponentCharacter?: string;
  onComplete: () => void;
}

const WALK_DURATION = 3500;

export default function TeamLineupWalkout({
  playerName,
  opponentName,
  playerAvatarIndex = 0,
  playerAvatarUrl,
  playerFrame,
  playerEmoji,
  opponentEmoji = "🤖",
  playerCharacter,
  opponentCharacter,
  onComplete,
}: TeamLineupWalkoutProps) {
  const [phase, setPhase] = useState<"walk" | "face" | "done">("walk");
  const { soundEnabled } = useSettings();
  const preset = getAvatarPreset(playerAvatarIndex);
  const resolvedPlayerEmoji = playerEmoji || preset.emoji;
  const frameStyle = playerFrame ? FRAME_RING_STYLES[playerFrame] : null;

  // Resolve character illustration images
  const playerCharImg = playerCharacter ? CHARACTERS[playerCharacter] : CHARACTERS.batsman;
  const opponentCharImg = opponentCharacter ? CHARACTERS[opponentCharacter] : CHARACTERS.bowler;

  useEffect(() => {
    if (soundEnabled) SFX.gameStart();
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

          <SpotlightCone />
          <TrackingSpotlight side="left" phase={phase} />
          <TrackingSpotlight side="right" phase={phase} />

          {/* Player character illustration (left) */}
          <motion.div
            initial={{ x: "-120%", opacity: 0 }}
            animate={{
              x: phase === "face" ? "0%" : "-30%",
              opacity: 1,
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[15%] left-[5%] flex flex-col items-center"
          >
            <motion.img
              src={playerCharImg}
              alt={playerName}
              className="w-36 h-auto max-h-[45vh] object-contain"
              style={{ filter: "drop-shadow(0 0 24px hsl(217 80% 50% / 0.5))" }}
              animate={phase === "face" ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Name plate */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={phase === "face" ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-2 px-3 py-1 rounded-sm stadium-glass"
              style={{ border: "1px solid hsl(217 60% 50% / 0.3)" }}
            >
              <span className="text-[10px] font-display font-bold tracking-[0.2em] text-foreground">
                {playerName.toUpperCase()}
              </span>
            </motion.div>
          </motion.div>

          {/* Opponent character illustration (right) */}
          <motion.div
            initial={{ x: "120%", opacity: 0 }}
            animate={{
              x: phase === "face" ? "0%" : "30%",
              opacity: 1,
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[15%] right-[5%] flex flex-col items-center"
          >
            <motion.img
              src={opponentCharImg}
              alt={opponentName}
              className="w-36 h-auto max-h-[45vh] object-contain"
              style={{ filter: "drop-shadow(0 0 24px hsl(4 80% 50% / 0.5))", transform: "scaleX(-1)" }}
              animate={phase === "face" ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={phase === "face" ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-2 px-3 py-1 rounded-sm stadium-glass"
              style={{ border: "1px solid hsl(4 60% 50% / 0.3)" }}
            >
              <span className="text-[10px] font-display font-bold tracking-[0.2em] text-foreground">
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

/* ── Sub-components ── */

function SpotlightCone() {
  return (
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
  );
}

function TrackingSpotlight({ side, phase }: { side: "left" | "right"; phase: string }) {
  const isLeft = side === "left";
  return (
    <motion.div
      initial={{ x: isLeft ? "-60vw" : "60vw" }}
      animate={{ x: phase === "face" ? (isLeft ? "-5vw" : "5vw") : (isLeft ? "-20vw" : "20vw") }}
      transition={{ duration: 1.6, ease: "easeOut" }}
      className={`absolute top-[10%] w-20 h-[90%] ${isLeft ? "" : "right-0"}`}
      style={{
        background: "radial-gradient(ellipse at center top, hsl(43 96% 80% / 0.15) 0%, transparent 70%)",
        filter: "blur(15px)",
      }}
    />
  );
}
