import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayerAvatar from "@/components/PlayerAvatar";
import { SFX } from "@/lib/sounds";
import vsBatsman from "@/assets/vs-batsman.png";
import vsBowler from "@/assets/vs-bowler.png";
import { getVSEffect } from "@/lib/cosmetics";

interface Props {
  playerName: string;
  opponentName: string;
  playerAvatarIndex?: number;
  opponentAvatarIndex?: number;
  gameType?: string;
  equippedVSEffect?: string | null;
  onComplete: () => void;
}

export default function VSIntroScreen({
  playerName,
  opponentName,
  playerAvatarIndex = 0,
  opponentAvatarIndex = 1,
  gameType = "ar",
  equippedVSEffect,
  onComplete,
}: Props) {
  const vsEffect = getVSEffect(equippedVSEffect);
  const [stage, setStage] = useState<"enter" | "vs" | "flash" | "done">("enter");

  useEffect(() => {
    try { SFX.ceremonyHorn(); } catch {}

    const t1 = setTimeout(() => setStage("vs"), 800);
    const t2 = setTimeout(() => {
      try { SFX.gameStart(); } catch {}
      setStage("flash");
    }, 2200);
    const t3 = setTimeout(() => {
      setStage("done");
      onComplete();
    }, 3200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const gameLabel = gameType === "tap" ? "TAP DUEL" : gameType === "tournament" ? "TOURNAMENT DUEL" : "AR DUEL";

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* ── Diagonal Split Background ── */}
          <div className="absolute inset-0">
            {/* Left half — warm blue */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, hsl(217 80% 50%) 0%, hsl(217 70% 30%) 100%)",
                clipPath: "polygon(0 0, 65% 0, 35% 100%, 0 100%)",
              }}
            />
            {/* Right half — cool red */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(225deg, hsl(4 80% 50%) 0%, hsl(4 70% 25%) 100%)",
                clipPath: "polygon(65% 0, 100% 0, 100% 100%, 35% 100%)",
              }}
            />
            {/* Diagonal glow line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: stage !== "enter" ? 1 : 0 }}
              className="absolute inset-0"
              style={{
                background: "linear-gradient(153deg, transparent 48%, hsl(45 100% 70% / 0.6) 49.5%, hsl(45 100% 90% / 0.9) 50%, hsl(45 100% 70% / 0.6) 50.5%, transparent 52%)",
              }}
            />
            {/* Scalloped overlay texture */}
            <div className="absolute inset-0 scallop-bg opacity-[0.06]" />
            {/* Vignette */}
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
          </div>

          {/* ── Impact Flash ── */}
          <motion.div
            animate={stage === "flash" ? { opacity: [0, 0.9, 0], scale: [1, 1.5, 2] } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-white pointer-events-none z-30"
          />

          {/* ── Game Type Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="wood-panel px-6 py-2 rounded-xl">
              <span className="font-game-display text-[10px] font-bold text-game-gold tracking-[0.3em]">{gameLabel}</span>
            </div>
          </motion.div>

          {/* ── Characters + VS Area ── */}
          <div className="relative flex items-end justify-between w-full h-full px-2 z-10">

            {/* Player 1 — Left (Batsman) */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 80, delay: 0.15 }}
              className="flex-1 flex flex-col items-center justify-end pb-32 relative"
            >
              <motion.img
                src={vsBatsman}
                alt="Batsman"
                width={512}
                height={768}
                className="w-40 h-auto max-h-[55vh] object-contain drop-shadow-[0_0_30px_hsl(217_80%_50%/0.5)] relative z-10"
                animate={stage === "vs" ? { x: [0, 4, -4, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* VS Badge — Center */}
            <motion.div
              initial={{ scale: 0, y: -200, rotate: -20 }}
              animate={stage !== "enter"
                ? { scale: 1, y: 0, rotate: [-5, 5, -3, 0] }
                : { scale: 0, y: -200 }
              }
              transition={{ type: "spring", damping: 10, stiffness: 120 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              {/* Rotating dashed ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 rounded-full border-2 border-dashed border-game-gold/30"
              />
              {/* 3D VS text */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(180deg, hsl(45 100% 60%), hsl(35 90% 40%))",
                  border: "4px solid hsl(25 50% 20%)",
                  boxShadow: `0 6px 0 hsl(25 50% 15%), 0 10px 30px rgba(0,0,0,0.6), 0 0 50px ${vsEffect.glowColor}`,
                }}
              >
                <span
                  className="font-game-display text-3xl font-black text-white"
                  style={{
                    textShadow: "0 2px 0 hsl(25 50% 20%), 0 4px 0 hsl(25 40% 12%), 0 6px 12px rgba(0,0,0,0.5)",
                    WebkitTextStroke: "2px hsl(25 50% 15%)",
                  }}
                >
                  VS
                </span>
              </div>

              {/* Fire particles */}
              {stage === "vs" && [...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -40 - Math.random() * 30],
                    x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50],
                    opacity: [1, 0],
                    scale: [1, 0.2],
                  }}
                  transition={{ duration: 0.8 + Math.random() * 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full"
                  style={{
                    background: vsEffect.particleColors[i % vsEffect.particleColors.length],
                    filter: "blur(1px)",
                  }}
                />
              ))}
            </motion.div>

            {/* Player 2 — Right (Bowler) */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 80, delay: 0.15 }}
              className="flex-1 flex flex-col items-center justify-end pb-32 relative"
            >
              <motion.img
                src={vsBowler}
                alt="Bowler"
                width={512}
                height={768}
                className="w-40 h-auto max-h-[55vh] object-contain drop-shadow-[0_0_30px_hsl(4_80%_50%/0.5)] relative z-10"
                animate={stage === "vs" ? { x: [0, -4, 4, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>
          </div>

          {/* ── Player Info Pills ── */}
          <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-between px-4 gap-3">
            {/* Player pill */}
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring", damping: 14 }}
              className="flex-1"
            >
              <div className="wood-panel-dark rounded-xl px-3 py-2 flex items-center gap-2">
                <PlayerAvatar avatarIndex={playerAvatarIndex} size="sm" className="border-primary/40" />
                <div className="flex flex-col min-w-0">
                  <span className="font-game-display text-xs text-foreground tracking-wider truncate">
                    {playerName.toUpperCase()}
                  </span>
                  <span className="text-[8px] font-game-body text-primary font-bold tracking-widest">BATSMAN</span>
                </div>
              </div>
            </motion.div>

            {/* Opponent pill */}
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, type: "spring", damping: 14 }}
              className="flex-1"
            >
              <div className="wood-panel-dark rounded-xl px-3 py-2 flex items-center gap-2 justify-end">
                <div className="flex flex-col items-end min-w-0">
                  <span className="font-game-display text-xs text-foreground tracking-wider truncate">
                    {opponentName.toUpperCase()}
                  </span>
                  <span className="text-[8px] font-game-body text-out-red font-bold tracking-widest">BOWLER</span>
                </div>
                <PlayerAvatar avatarIndex={opponentAvatarIndex} size="sm" className="border-out-red/40" />
              </div>
            </motion.div>
          </div>

          {/* ── Bottom Loading Text ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === "vs" ? 1 : 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-20"
          >
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="font-game-display text-[10px] font-bold text-game-gold/80 tracking-[0.3em]"
            >
              MATCH STARTING...
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
