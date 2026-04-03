import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PlayerAvatar from "@/components/PlayerAvatar";
import vsBatsman from "@/assets/vs-batsman.png";
import GameButton from "@/components/shared/GameButton";

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

  useEffect(() => {
    const interval = setInterval(() => setTip(t => (t + 1) % TIPS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeLabel = gameType === "tap" ? "TAP DUEL" : gameType === "tournament" ? "TOURNAMENT" : "AR DUEL";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* ── Diagonal Split Background ── */}
      <div className="absolute inset-0">
        {/* Left — player team color */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, hsl(217 80% 50%) 0%, hsl(217 70% 30%) 100%)",
            clipPath: "polygon(0 0, 65% 0, 35% 100%, 0 100%)",
          }}
        />
        {/* Right — dark/grey (unknown opponent) */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(225deg, hsl(220 15% 25%) 0%, hsl(220 20% 12%) 100%)",
            clipPath: "polygon(65% 0, 100% 0, 100% 100%, 35% 100%)",
          }}
        />
        {/* Diagonal glow */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "linear-gradient(153deg, transparent 48.5%, hsl(45 80% 60% / 0.4) 50%, transparent 51.5%)",
          }}
        />
        <div className="absolute inset-0 scallop-bg opacity-[0.05]" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />
      </div>

      {/* ── Game Type Banner ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="wood-panel px-5 py-1.5 rounded-xl">
          <span className="font-game-display text-[9px] font-bold text-game-gold tracking-[0.25em]">{typeLabel}</span>
        </div>
      </motion.div>

      {/* ── Characters ── */}
      <div className="relative flex items-end justify-between w-full h-full px-4 z-10">
        {/* Your character — left */}
        <motion.div
          initial={{ x: "-80%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 80 }}
          className="flex-1 flex flex-col items-center justify-end pb-44"
        >
          <motion.img
            src={vsBatsman}
            alt="Your Player"
            width={512}
            height={768}
            className="w-36 h-auto max-h-[45vh] object-contain drop-shadow-[0_0_25px_hsl(217_80%_50%/0.5)]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </motion.div>

        {/* VS badge — center, pulsing */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, hsl(45 100% 60%), hsl(35 90% 40%))",
              border: "3px solid hsl(25 50% 20%)",
              boxShadow: "0 4px 0 hsl(25 50% 15%), 0 8px 20px rgba(0,0,0,0.5)",
            }}
          >
            <span
              className="font-game-display text-2xl font-black text-white"
              style={{
                textShadow: "0 2px 0 hsl(25 50% 20%), 0 4px 8px rgba(0,0,0,0.4)",
                WebkitTextStroke: "1.5px hsl(25 50% 15%)",
              }}
            >
              VS
            </span>
          </div>
        </motion.div>

        {/* Opponent silhouette — right */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-end pb-44"
        >
          {/* Pulsing grey silhouette */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-28 h-40 relative"
          >
            <div
              className="w-full h-full rounded-2xl"
              style={{
                background: "linear-gradient(180deg, hsl(220 10% 40% / 0.3), hsl(220 10% 20% / 0.2))",
                border: "2px dashed hsl(220 10% 50% / 0.3)",
              }}
            />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl opacity-40">❓</span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Player Info Pills ── */}
      <div className="absolute bottom-36 left-0 right-0 z-20 flex justify-between px-4 gap-3">
        {/* Your pill */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex-1"
        >
          <div className="wood-panel-dark rounded-xl px-3 py-2 flex items-center gap-2">
            <PlayerAvatar avatarIndex={playerAvatarIndex} size="sm" className="border-primary/40" />
            <div className="flex flex-col min-w-0">
              <span className="font-game-display text-xs text-foreground tracking-wider truncate">{playerName.toUpperCase()}</span>
              <span className="text-[8px] font-game-body text-primary font-bold tracking-widest">HOST</span>
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
          <div className="wood-panel-dark rounded-xl px-3 py-2 flex items-center gap-2 justify-end opacity-60">
            <div className="flex flex-col items-end min-w-0">
              <span className="font-game-display text-xs text-muted-foreground tracking-wider">SEARCHING...</span>
              <div className="flex gap-1 mt-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1, 0.7] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                  />
                ))}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-muted/20 border border-dashed border-muted-foreground/30 flex items-center justify-center">
              <span className="text-lg">❓</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Room Code + Loading ── */}
      <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center gap-2 px-6">
        {/* Animated loading bar */}
        <div className="w-full max-w-xs h-2 rounded-full overflow-hidden" style={{ background: "hsl(220 15% 15%)", border: "1px solid hsl(220 10% 25%)" }}>
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/2 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-game-green animate-pulse" />
            <span className="text-[8px] text-game-green font-game-display font-bold">LIVE</span>
          </div>
          <span className="font-mono text-sm font-bold text-game-gold tracking-[0.15em]">{roomCode}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyCode}
            className="wood-panel px-2.5 py-1 rounded-lg text-[8px] font-game-display font-bold text-game-gold tracking-wider"
          >
            {copied ? "✓" : "📋"}
          </motion.button>
        </div>

        {/* Tip */}
        <motion.p
          key={tip}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.5, y: 0 }}
          className="text-[8px] text-muted-foreground font-game-body text-center"
        >
          💡 {TIPS[tip]}
        </motion.p>

        {/* Cancel */}
        <GameButton variant="danger" size="sm" onClick={onCancel} className="mt-1">
          ✕ CANCEL
        </GameButton>
      </div>
    </motion.div>
  );
}
