import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Hand Cricket Trophy — 12-second cinematic ceremony
 * Phases: Rise (0-3s) → Glow burst (3-5s) → Spin reveal (5-8s) → Settle (8-12s)
 */

const HAND_FINGERS = [
  // Palm base
  { d: "M35 95 Q30 75 32 60 L68 60 Q70 75 65 95 Z", fill: "hsl(43 80% 52%)" },
  // Thumb
  { d: "M32 65 Q20 55 18 40 Q17 30 25 28 Q30 26 33 35 Q35 45 35 60", fill: "hsl(43 75% 48%)" },
  // Index
  { d: "M36 60 Q35 35 34 18 Q34 10 40 10 Q46 10 46 18 Q45 35 44 60", fill: "hsl(43 80% 55%)" },
  // Middle
  { d: "M44 60 Q44 32 44 12 Q44 4 50 4 Q56 4 56 12 Q56 32 56 60", fill: "hsl(43 85% 58%)" },
  // Ring
  { d: "M56 60 Q57 35 57 18 Q57 10 62 10 Q68 10 68 18 Q67 35 64 60", fill: "hsl(43 80% 55%)" },
  // Pinky
  { d: "M64 60 Q66 42 67 28 Q67 20 72 22 Q77 24 76 32 Q74 45 68 60", fill: "hsl(43 75% 48%)" },
];

const STAR_POSITIONS = [
  { x: 20, y: 15, size: 6 }, { x: 80, y: 10, size: 4 }, { x: 15, y: 50, size: 5 },
  { x: 85, y: 45, size: 3 }, { x: 50, y: 5, size: 7 }, { x: 30, y: 80, size: 4 },
  { x: 70, y: 75, size: 5 }, { x: 10, y: 30, size: 3 },
];

interface TrophyCeremonyProps {
  playerName: string;
  stars?: number;
  onPhaseChange?: (phase: number) => void;
}

export default function TrophyCeremony({ playerName, stars = 1, onPhaseChange }: TrophyCeremonyProps) {
  const [phase, setPhase] = useState(0); // 0=rise, 1=glow, 2=spin, 3=settle

  useEffect(() => {
    const timers = [
      setTimeout(() => { setPhase(1); onPhaseChange?.(1); }, 3000),
      setTimeout(() => { setPhase(2); onPhaseChange?.(2); }, 5000),
      setTimeout(() => { setPhase(3); onPhaseChange?.(3); }, 8000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-36 h-44 mx-auto">
      {/* Radial glow behind trophy */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: phase >= 1 ? [0.4, 0.8, 0.4] : 0,
          scale: phase >= 1 ? 1.8 : 0.5,
        }}
        transition={{ duration: 2, repeat: phase >= 1 ? Infinity : 0 }}
        style={{
          background: "radial-gradient(circle, hsl(43 96% 56% / 0.4) 0%, hsl(43 96% 56% / 0.1) 40%, transparent 70%)",
        }}
      />

      {/* Sparkle stars */}
      {STAR_POSITIONS.map((star, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: phase >= 1 ? [0, 1, 0] : 0,
            scale: phase >= 1 ? [0, 1.2, 0] : 0,
            rotate: [0, 180],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.2 + 2,
            repeat: Infinity,
            repeatDelay: 1 + Math.random() * 2,
          }}
        >
          <svg viewBox="0 0 10 10" className="w-full h-full">
            <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="hsl(43 96% 70%)" />
          </svg>
        </motion.div>
      ))}

      {/* Trophy SVG — Golden Hand */}
      <motion.div
        className="relative z-10"
        initial={{ y: 120, opacity: 0, scale: 0.3 }}
        animate={{
          y: phase >= 3 ? 5 : phase >= 2 ? -5 : phase >= 1 ? 0 : 120,
          opacity: 1,
          scale: phase >= 3 ? 1 : phase >= 2 ? 1.1 : 1,
          rotateY: phase === 2 ? 360 : 0,
        }}
        transition={{
          y: { duration: phase === 0 ? 2.5 : 0.8, ease: "easeOut" },
          scale: { duration: 0.6 },
          rotateY: { duration: 2, ease: "easeInOut" },
          opacity: { duration: 1 },
        }}
        style={{ perspective: 800 }}
      >
        <svg viewBox="0 0 100 130" className="w-36 h-44 drop-shadow-[0_0_30px_hsl(43_96%_56%/0.5)]">
          {/* Base pedestal */}
          <rect x="25" y="100" width="50" height="8" rx="3"
            fill="url(#pedestalGrad)" stroke="hsl(43 60% 35%)" strokeWidth="1" />
          <rect x="30" y="108" width="40" height="6" rx="2"
            fill="url(#pedestalGrad2)" stroke="hsl(43 50% 30%)" strokeWidth="0.5" />

          {/* Stem */}
          <rect x="45" y="88" width="10" height="14" rx="2"
            fill="url(#stemGrad)" stroke="hsl(43 60% 40%)" strokeWidth="0.5" />

          {/* Hand */}
          <g transform="translate(0, -5)">
            {HAND_FINGERS.map((f, i) => (
              <path key={i} d={f.d} fill={f.fill}
                stroke="hsl(43 60% 35%)" strokeWidth="0.8" strokeLinejoin="round" />
            ))}
            {/* Palm highlight */}
            <ellipse cx="50" cy="72" rx="12" ry="8" fill="hsl(43 90% 65%)" opacity="0.3" />
          </g>

          {/* Engraved text on base */}
          <text x="50" y="106" textAnchor="middle" fontSize="4" fontWeight="bold"
            fill="hsl(43 30% 25%)" fontFamily="sans-serif">
            CHAMPION
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="pedestalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(43 50% 40%)" />
              <stop offset="100%" stopColor="hsl(43 40% 25%)" />
            </linearGradient>
            <linearGradient id="pedestalGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(43 40% 30%)" />
              <stop offset="100%" stopColor="hsl(43 35% 18%)" />
            </linearGradient>
            <linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(43 70% 50%)" />
              <stop offset="100%" stopColor="hsl(43 50% 35%)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Phase 1: Glow burst ring */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
            style={{
              border: "3px solid hsl(43 96% 56%)",
              boxShadow: "0 0 40px hsl(43 96% 56% / 0.6)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Player name plate — appears in settle phase */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max"
          >
            <div
              className="px-4 py-1.5 rounded-lg text-center"
              style={{
                background: "linear-gradient(180deg, hsl(43 50% 20%), hsl(43 40% 12%))",
                border: "1px solid hsl(43 50% 30%)",
                boxShadow: "0 4px 16px hsl(0 0% 0% / 0.4)",
              }}
            >
              <span className="font-game-display text-[8px] tracking-[0.3em] block"
                style={{ color: "hsl(43 80% 60%)" }}>
                🏆 {playerName.toUpperCase()}
              </span>
              <div className="flex justify-center gap-0.5 mt-0.5">
                {[...Array(3)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: i < stars ? 1 : 0.2, scale: 1 }}
                    transition={{ delay: 8.5 + i * 0.2 }}
                    className="text-[8px]"
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
