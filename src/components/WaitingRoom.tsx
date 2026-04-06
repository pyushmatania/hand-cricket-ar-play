import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PlayerAvatar from "@/components/PlayerAvatar";
import GameButton from "@/components/shared/GameButton";
import DressingRoom from "@/components/DressingRoom";

interface Props {
  roomCode: string;
  playerName: string;
  playerAvatarIndex?: number;
  gameType?: string;
  onCancel: () => void;
}

const TIPS = [
  "Tip: DEF (fist) — if bowler defends, batsman scores the bowler's number",
  "Tip: 6 is risky but rewarding",
  "Tip: Watch your opponent's patterns",
  "Tip: Reserve time is precious — play fast!",
  "Tip: A good defence wins matches",
];

export default function WaitingRoom({ roomCode, playerName, playerAvatarIndex = 0, gameType = "ar", onCancel }: Props) {
  const [tip, setTip] = useState(0);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTip(t => (t + 1) % TIPS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  // Track elapsed time for heartbeat tempo
  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeLabel = gameType === "tap" ? "TAP DUEL" : gameType === "tournament" ? "TOURNAMENT" : "AR DUEL";

  // Heartbeat speed increases with time
  const heartbeatDuration = elapsed < 10 ? 2.0 : elapsed < 20 ? 1.6 : elapsed < 30 ? 1.2 : 0.8;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* ── Diagonal Split Background with scalloped texture ── */}
      <div className="absolute inset-0">
        {/* Left — player team color with scalloped */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, hsl(217 80% 50%) 0%, hsl(217 70% 25%) 100%)",
            clipPath: "polygon(0 0, 65% 0, 35% 100%, 0 100%)",
          }}
        >
          <div className="absolute inset-0 scallop-bg opacity-[0.06]" />
        </div>
        {/* Right — dark grey (unknown opponent) */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(225deg, hsl(220 15% 22%) 0%, hsl(220 20% 10%) 100%)",
            clipPath: "polygon(65% 0, 100% 0, 100% 100%, 35% 100%)",
          }}
        >
          <div className="absolute inset-0 scallop-bg opacity-[0.04]" />
        </div>

        {/* Dim golden diagonal seam */}
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0"
          style={{
            background: "linear-gradient(153deg, transparent 48%, hsl(45 80% 60% / 0.3) 49.5%, hsl(45 80% 60% / 0.5) 50%, hsl(45 80% 60% / 0.3) 50.5%, transparent 52%)",
            pointerEvents: "none",
          }}
        />

        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />
      </div>

      {/* ── Game Type Banner — wood panel ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="wood-panel px-5 py-1.5 rounded-xl">
          <span className="font-display text-[9px] font-bold text-game-gold tracking-[0.25em]">{typeLabel}</span>
        </div>
      </motion.div>

      {/* ── Dressing Room Scene ── */}
      <div className="relative z-10 flex items-center justify-between w-full h-full px-3 gap-2">
        {/* Your dressing room — left */}
        <motion.div
          initial={{ x: "-80%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 80 }}
          className="flex-1 h-[55%] max-h-[300px]"
        >
          <DressingRoom
            playerName={playerName}
            avatarIndex={playerAvatarIndex}
            teamColor="hsl(217 80% 55%)"
            waiting={true}
          />
        </motion.div>

        {/* VS block — dimmed, pulsing */}
        <motion.div
          animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: heartbeatDuration * 1.5, repeat: Infinity }}
          className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <img
            src="/assets/popups/vs-stone-block.png"
            alt="VS"
            width={80}
            height={80}
            style={{
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5)) brightness(0.6)",
            }}
          />
        </motion.div>

        {/* Opponent silhouette — right with radar scan */}
        <motion.div className="flex-1 flex flex-col items-center justify-center h-[55%] max-h-[300px]">
          <div
            className="w-full h-full rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(220 10% 15% / 0.5), hsl(220 10% 8% / 0.5))",
              border: "2px dashed hsl(220 10% 30% / 0.3)",
            }}
          >
            {/* Radar scan animation */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute w-full h-full"
              style={{
                background: "conic-gradient(from 0deg, transparent 0%, transparent 85%, hsl(120 60% 50% / 0.15) 95%, transparent 100%)",
              }}
            />

            {/* Pulsing "?" */}
            <motion.span
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: heartbeatDuration, repeat: Infinity }}
              className="text-5xl font-display font-black"
              style={{ color: "hsl(220 10% 40%)", textShadow: "0 0 20px hsl(220 10% 30% / 0.3)" }}
            >
              ?
            </motion.span>

            <span className="absolute bottom-3 font-display text-[8px] tracking-[0.2em]" style={{ color: "hsl(220 10% 40%)" }}>
              SEARCHING...
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Player Info Pills — Dark Wood ── */}
      <div className="absolute bottom-36 left-0 right-0 z-20 flex justify-between px-4 gap-3">
        {/* Your pill */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex-1"
        >
          <div
            className="rounded-xl px-3 py-2 flex items-center gap-2"
            style={{
              background: "linear-gradient(180deg, #5C3A1E, #3E2410)",
              border: "3px solid #2E1A0E",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            <PlayerAvatar avatarIndex={playerAvatarIndex} size="sm" className="border-primary/40" />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-xs tracking-wider truncate" style={{ color: "#F5E6D3" }}>
                {playerName.toUpperCase()}
              </span>
              <span className="text-[8px] font-body font-bold tracking-widest" style={{ color: "hsl(120 60% 50%)" }}>HOST</span>
            </div>
          </div>
        </motion.div>

        {/* Searching pill */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex-1"
        >
          <div
            className="rounded-xl px-3 py-2 flex items-center gap-2 justify-end opacity-60"
            style={{
              background: "linear-gradient(180deg, #4A3A2A, #2E2010)",
              border: "3px solid #2E1A0E",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex flex-col items-end min-w-0">
              <span className="font-display text-xs tracking-wider" style={{ color: "#8B7355" }}>SEARCHING...</span>
              <div className="flex gap-1 mt-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1, 0.7] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#8B7355" }}
                  />
                ))}
              </div>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(180deg, #3A3A3A, #2A2A2A)",
                border: "2px dashed #5A5A5A",
              }}
            >
              <span className="text-lg">❓</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Room Code + Loading — Dark Wood loading bar ── */}
      <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center gap-2 px-6">
        {/* Wood-framed loading bar */}
        <div
          className="w-full max-w-xs h-[10px] rounded-lg overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #3A3A4A, #2A2A3A)",
            border: "2px solid #4A4A5A",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/2 rounded-lg"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(217 80% 55%), hsl(217 80% 65%), transparent)",
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: heartbeatDuration, repeat: Infinity }}
              className="w-2 h-2 rounded-full"
              style={{ background: "hsl(120 60% 50%)", boxShadow: "0 0 6px hsl(120 60% 50%)" }}
            />
            <span className="text-[8px] font-display font-bold" style={{ color: "hsl(120 60% 50%)" }}>LIVE</span>
          </div>
          <span className="font-mono text-sm font-bold tracking-[0.15em]" style={{ color: "#FFD700" }}>{roomCode}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyCode}
            className="wood-panel px-2.5 py-1 rounded-lg text-[8px] font-display font-bold text-game-gold tracking-wider"
          >
            {copied ? "✓" : "📋"}
          </motion.button>
        </div>

        {/* Tip */}
        <motion.p
          key={tip}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.5, y: 0 }}
          className="text-[8px] font-body text-center"
          style={{ color: "#8B7355" }}
        >
          💡 {TIPS[tip]}
        </motion.p>

        {/* Cancel button — red leather */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="mt-1 px-6 py-2 rounded-xl font-display text-xs font-bold tracking-wider text-white"
          style={{
            background: "linear-gradient(180deg, hsl(4 70% 45%), hsl(4 60% 35%))",
            border: "3px solid hsl(4 50% 25%)",
            borderBottom: "5px solid hsl(4 50% 20%)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          ✕ CANCEL
        </motion.button>
      </div>
    </motion.div>
  );
}
