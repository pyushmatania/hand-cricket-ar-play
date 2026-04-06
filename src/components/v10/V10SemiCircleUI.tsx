/**
 * V11 Wooden Kingdom Semi-Circle Tap UI — wooden disc buttons with leather press
 */
import { motion } from "framer-motion";
import type { Move } from "@/hooks/useHandCricket";
import { SFX, Haptics } from "@/lib/sounds";
import MatchEmotes from "@/components/MatchEmotes";

interface V10SemiCircleUIProps {
  isBatting: boolean;
  disabled: boolean;
  onMove: (move: Move) => void;
  lastPlayed: Move | null;
  noDefence?: boolean;
}

const MOVES: { move: Move; label: string; emoji: string; color: string; dark: string; glow: string }[] = [
  { move: "DEF", label: "DEF", emoji: "🛡️", color: "linear-gradient(180deg, #8B7355, #6B5640, #4A3A28)", dark: "#3E2410", glow: "rgba(139,115,85,0.3)" },
  { move: 1, label: "1", emoji: "☝️", color: "linear-gradient(180deg, #4ADE80, #22C55E, #15803D)", dark: "#0F5132", glow: "rgba(74,222,128,0.3)" },
  { move: 2, label: "2", emoji: "✌️", color: "linear-gradient(180deg, #67E8F9, #06B6D4, #0E7490)", dark: "#064E63", glow: "rgba(103,232,249,0.3)" },
  { move: 3, label: "3", emoji: "🤟", color: "linear-gradient(180deg, #60A5FA, #3B82F6, #1D4ED8)", dark: "#1E3A6E", glow: "rgba(96,165,250,0.3)" },
  { move: 4, label: "4", emoji: "🖖", color: "linear-gradient(180deg, #FDE047, #EAB308, #A16207)", dark: "#724B05", glow: "rgba(253,224,71,0.3)" },
  { move: 6, label: "6", emoji: "🖐️", color: "linear-gradient(180deg, #FCA5A5, #EF4444, #991B1B)", dark: "#7F1D1D", glow: "rgba(252,165,165,0.3)" },
];

export default function V10SemiCircleUI({ isBatting, disabled, onMove, lastPlayed, noDefence }: V10SemiCircleUIProps) {
  const activeMoves = noDefence ? MOVES.filter(m => m.move !== "DEF") : MOVES;
  const count = activeMoves.length;
  
  const RADIUS = 120;
  const ARC_START = -180;
  const ARC_END = 0;
  
  const handleTap = (move: Move) => {
    if (disabled) return;
    SFX.tap();
    Haptics.light();
    onMove(move);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative pb-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="w-9" />
        <p className="text-center text-[7px] font-display tracking-[0.2em]" style={{ color: "#8B7355" }}>
          {isBatting ? "⚡ TAP YOUR SHOT" : "🎯 TAP YOUR BOWL"}
        </p>
        <MatchEmotes disabled={disabled} />
      </div>

      {/* Semi-circle container */}
      <div className="relative mx-auto" style={{ width: 300, height: 165 }}>
        {activeMoves.map((m, i) => {
          const angleDeg = count > 1
            ? ARC_START + (ARC_END - ARC_START) * (i / (count - 1))
            : -90;
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = 150 + Math.cos(angleRad) * RADIUS;
          const y = 155 + Math.sin(angleRad) * RADIUS;

          return (
            <motion.button
              key={m.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 18 }}
              whileTap={disabled ? undefined : { scale: 0.88, y: 4 }}
              onClick={() => handleTap(m.move)}
              disabled={disabled}
              className="absolute flex flex-col items-center justify-center"
              style={{
                left: x - 32,
                top: y - 32,
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: disabled
                  ? "linear-gradient(180deg, #3E2410, #2E1A0E)"
                  : m.color,
                border: `3px solid ${disabled ? "#2E1A0E" : m.dark}`,
                borderBottom: `${disabled ? 3 : 7}px solid ${disabled ? "#2E1A0E" : m.dark}`,
                boxShadow: disabled
                  ? "inset 0 2px 0 rgba(245,230,211,0.03)"
                  : `0 6px 0 rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2), 0 0 20px ${m.glow}`,
                opacity: disabled ? 0.4 : 1,
                filter: disabled ? "grayscale(60%)" : "none",
                color: disabled ? "#5C3A1E" : "#FFFFFF",
                textShadow: disabled ? "none" : "0 2px 4px rgba(0,0,0,0.6)",
                transition: "filter 0.2s, opacity 0.2s",
              }}
            >
              <span className="text-lg leading-none">{m.emoji}</span>
              <span className="font-display text-[10px] font-bold mt-0.5">{m.label}</span>
              {/* Cooldown indicator */}
              {disabled && lastPlayed === m.move && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 0.8, ease: "linear" }}
                  className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full origin-left"
                  style={{ background: "rgba(245,230,211,0.4)" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
