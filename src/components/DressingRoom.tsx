// ═══════════════════════════════════════════════════
// Doc 5 §4.1 — Dressing Room Scene (Pre-Match Lobby)
// Animated waiting room while opponent loads
// ═══════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayerAvatar from "./PlayerAvatar";

interface DressingRoomProps {
  playerName: string;
  avatarIndex: number;
  avatarUrl?: string | null;
  teamColor?: string;
  onOpponentFound?: () => void;
  waiting?: boolean;
}

const IDLE_ANIMATIONS = [
  { emoji: "🏏", label: "Shadow batting...", duration: 3000 },
  { emoji: "🧤", label: "Putting on gloves...", duration: 2000 },
  { emoji: "🦵", label: "Stretching...", duration: 4000 },
  { emoji: "📱", label: "Checking phone...", duration: 5000 },
  { emoji: "💪", label: "Warming up...", duration: 3000 },
];

export default function DressingRoom({
  playerName, avatarIndex, avatarUrl, teamColor = "hsl(43 90% 55%)", waiting = true,
}: DressingRoomProps) {
  const [animIndex, setAnimIndex] = useState(0);

  useEffect(() => {
    if (!waiting) return;
    const anim = IDLE_ANIMATIONS[animIndex];
    const timer = setTimeout(() => {
      setAnimIndex((prev) => (prev + 1) % IDLE_ANIMATIONS.length);
    }, anim.duration);
    return () => clearTimeout(timer);
  }, [animIndex, waiting]);

  const currentAnim = IDLE_ANIMATIONS[animIndex];

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(25 30% 12%) 0%, hsl(25 25% 8%) 100%)",
        border: "2px solid hsl(25 20% 20%)",
      }}>
      {/* Locker background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Lockers */}
        {[0, 1, 2].map(i => (
          <div key={i} className="absolute rounded-lg"
            style={{
              top: "10%", width: "18%", height: "55%",
              left: `${65 + i * 12}%`,
              background: "linear-gradient(180deg, hsl(210 10% 25%) 0%, hsl(210 10% 18%) 100%)",
              border: "1px solid hsl(210 10% 30%)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
            }}>
            {/* Locker handle */}
            <div className="absolute right-2 top-1/2 w-1 h-4 rounded-full" style={{ background: "hsl(43 50% 60%)" }} />
            {/* Open locker with jersey */}
            {i === 1 && (
              <div className="absolute inset-1 rounded overflow-hidden" style={{ background: "hsl(210 10% 12%)" }}>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-10 rounded-t-lg"
                  style={{ background: teamColor, opacity: 0.8 }} />
              </div>
            )}
          </div>
        ))}

        {/* Bench */}
        <div className="absolute bottom-[15%] left-[5%] w-[50%] h-[8%] rounded"
          style={{
            background: "linear-gradient(180deg, hsl(25 40% 30%) 0%, hsl(25 35% 20%) 100%)",
            borderBottom: "3px solid hsl(25 30% 15%)",
          }} />

        {/* Cricket bat leaning */}
        <div className="absolute bottom-[18%] left-[58%] w-2 h-16 origin-bottom"
          style={{
            background: "linear-gradient(90deg, hsl(35 50% 45%), hsl(35 40% 35%))",
            transform: "rotate(-12deg)",
            borderRadius: "1px 1px 0 0",
          }} />

        {/* Team flag */}
        <div className="absolute top-[8%] left-[8%] w-12 h-8 rounded"
          style={{ background: teamColor, opacity: 0.4 }} />

        {/* Whiteboard */}
        <div className="absolute top-[10%] left-[25%] w-16 h-12 rounded border"
          style={{
            background: "hsl(0 0% 95%)",
            borderColor: "hsl(25 15% 25%)",
            opacity: 0.15,
          }} />
      </div>

      {/* Player character */}
      <motion.div
        className="absolute bottom-[25%] left-[25%] flex flex-col items-center"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <PlayerAvatar avatarIndex={avatarIndex} avatarUrl={avatarUrl} size="lg" />
        <AnimatePresence mode="wait">
          <motion.div
            key={animIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: "hsl(25 20% 15% / 0.8)", border: "1px solid hsl(25 20% 25%)" }}
          >
            <span className="text-sm">{currentAnim.emoji}</span>
            <span className="text-[8px] font-game-display tracking-wider text-muted-foreground">{currentAnim.label}</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Player name plate */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl"
        style={{
          background: "linear-gradient(180deg, hsl(25 20% 15%) 0%, hsl(25 15% 10%) 100%)",
          border: "1px solid hsl(25 20% 22%)",
        }}>
        <span className="font-game-display text-[10px] font-bold tracking-wider" style={{ color: teamColor }}>{playerName}</span>
      </div>

      {/* Ambient light */}
      <div className="absolute top-0 left-1/4 w-32 h-32 pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${teamColor}15, transparent 70%)` }} />
    </div>
  );
}
