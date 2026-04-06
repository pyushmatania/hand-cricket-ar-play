import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import V10PlayerAvatar from "@/components/shared/V10PlayerAvatar";
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
    try { SFX.ceremonyHorn(); } catch { /* Intentionally ignored */ }
    const t1 = setTimeout(() => setStage("vs"), 800);
    const t2 = setTimeout(() => { try { SFX.gameStart(); } catch { /* Intentionally ignored */ } setStage("flash"); }, 2400);
    const t3 = setTimeout(() => { setStage("done"); onComplete(); }, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const gameLabel = gameType === "tap" ? "TAP DUEL" : gameType === "tournament" ? "TOURNAMENT" : "AR DUEL";

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* ── V10 Diagonal Split Background ── */}
          <div className="absolute inset-0">
            {/* Player side — deep navy-blue */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, hsl(217 80% 42%) 0%, hsl(220 50% 12%) 100%)",
                clipPath: "polygon(0 0, 62% 0, 38% 100%, 0 100%)",
              }}
            />
            {/* Opponent side — deep crimson */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(225deg, hsl(4 75% 42%) 0%, hsl(4 50% 12%) 100%)",
                clipPath: "polygon(62% 0, 100% 0, 100% 100%, 38% 100%)",
              }}
            />
            {/* V10 gold diagonal slash with glow */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: stage !== "enter" ? 1 : 0, scaleX: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
              style={{
                background: "linear-gradient(153deg, transparent 47%, hsl(43 100% 65% / 0.8) 49%, hsl(43 100% 90% / 1) 50%, hsl(43 100% 65% / 0.8) 51%, transparent 53%)",
              }}
            />
            {/* Stadium-glass frost overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px)",
            }} />
            {/* Vignette */}
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.75) 100%)" }} />
          </div>

          {/* ── Impact Flash ── */}
          <motion.div
            animate={stage === "flash" ? { opacity: [0, 0.95, 0], scale: [1, 1.5, 2] } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white pointer-events-none z-30"
          />

          {/* ── Game Type Banner — scoreboard-metal ── */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="px-5 py-2 rounded-xl scoreboard-metal">
              <span className="font-display text-[10px] font-bold tracking-[0.3em]" style={{ color: "hsl(43 96% 56%)" }}>{gameLabel}</span>
            </div>
          </motion.div>

          {/* ── Characters + VS Area ── */}
          <div className="relative flex items-end justify-between w-full h-full px-2 z-10">
            {/* Player 1 — Batsman (left) */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 80, delay: 0.15 }}
              className="flex-1 flex flex-col items-center justify-end pb-36 relative"
            >
              <motion.img
                src={vsBatsman}
                alt="Batsman"
                className="w-44 h-auto max-h-[55vh] object-contain relative z-10"
                style={{ filter: "drop-shadow(0 0 30px hsl(217 80% 50% / 0.5))" }}
                animate={stage === "vs" ? { y: [0, -4, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* ── V10 Golden VS Badge — Center ── */}
            <motion.div
              initial={{ scale: 0, y: -200, rotate: -25 }}
              animate={stage !== "enter"
                ? { scale: 1, y: 0, rotate: [-8, 5, -3, 0] }
                : { scale: 0, y: -200 }
              }
              transition={{ type: "spring", damping: 8, stiffness: 100 }}
              className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 z-20"
            >
              {/* Spinning dashed ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-10 rounded-full"
                style={{ border: "2px dashed hsl(43 96% 56% / 0.2)" }}
              />
              {/* Outer glow */}
              <div className="absolute -inset-3 rounded-full" style={{
                background: `radial-gradient(circle, ${vsEffect.glowColor} 0%, transparent 70%)`,
                opacity: 0.4,
              }} />
              {/* 3D VS Coin — scoreboard-metal feel */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{
                  background: "conic-gradient(from 0deg, hsl(43 100% 65%), hsl(35 90% 50%), hsl(43 100% 60%), hsl(45 100% 70%), hsl(43 100% 65%))",
                  border: "4px solid hsl(220 30% 15%)",
                  boxShadow: `
                    0 6px 0 hsl(220 30% 8%),
                    0 8px 0 hsl(220 25% 5%),
                    0 12px 40px rgba(0,0,0,0.7),
                    0 0 60px ${vsEffect.glowColor},
                    inset 0 2px 4px hsl(45 100% 80% / 0.4)
                  `,
                }}
              >
                <span
                  className="font-display text-[32px] font-black"
                  style={{
                    color: "hsl(220 25% 10%)",
                    textShadow: "0 2px 0 hsl(43 100% 70% / 0.5), 0 -1px 0 hsl(220 30% 15%)",
                    WebkitTextStroke: "1.5px hsl(220 30% 15%)",
                  }}
                >
                  VS
                </span>
              </div>

              {/* Fire particles */}
              {stage === "vs" && [...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -35 - Math.random() * 35],
                    x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60],
                    opacity: [1, 0],
                    scale: [1, 0.2],
                  }}
                  transition={{ duration: 0.7 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.12 }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: vsEffect.particleColors[i % vsEffect.particleColors.length],
                    filter: "blur(1px)",
                  }}
                />
              ))}
            </motion.div>

            {/* Player 2 — Bowler (right) */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 80, delay: 0.15 }}
              className="flex-1 flex flex-col items-center justify-end pb-36 relative"
            >
              <motion.img
                src={vsBowler}
                alt="Bowler"
                className="w-44 h-auto max-h-[55vh] object-contain relative z-10"
                style={{ filter: "drop-shadow(0 0 30px hsl(4 80% 50% / 0.5))" }}
                animate={stage === "vs" ? { y: [0, -4, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </motion.div>
          </div>

          {/* ── Player Info Pills — stadium-glass ── */}
          <div className="absolute bottom-20 left-0 right-0 z-20 flex justify-between px-3 gap-2">
            {/* Player pill */}
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring", damping: 14 }}
              className="flex-1"
            >
              <div className="rounded-xl px-3 py-2.5 flex items-center gap-2 stadium-glass" style={{
                border: "2px solid hsl(217 60% 35% / 0.4)",
              }}>
                <V10PlayerAvatar level={1} xpProgress={0.5} size="sm" />
                <div className="flex flex-col min-w-0">
                  <span className="font-display text-[11px] font-black text-foreground tracking-wider truncate">
                    {playerName.toUpperCase()}
                  </span>
                  <span className="text-[7px] font-display font-bold tracking-widest" style={{ color: "hsl(217 91% 60%)" }}>BATSMAN</span>
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
              <div className="rounded-xl px-3 py-2.5 flex items-center gap-2 justify-end stadium-glass" style={{
                border: "2px solid hsl(4 60% 35% / 0.4)",
              }}>
                <div className="flex flex-col items-end min-w-0">
                  <span className="font-display text-[11px] font-black text-foreground tracking-wider truncate">
                    {opponentName.toUpperCase()}
                  </span>
                  <span className="text-[7px] font-display font-bold tracking-widest" style={{ color: "hsl(4 90% 58%)" }}>BOWLER</span>
                </div>
                <V10PlayerAvatar level={1} xpProgress={0.3} size="sm" />
              </div>
            </motion.div>
          </div>

          {/* ── "MATCH STARTING..." pulse ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === "vs" ? 1 : 0 }}
            className="absolute bottom-7 left-1/2 -translate-x-1/2 text-center z-20"
          >
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="font-display text-[10px] font-bold tracking-[0.3em]"
              style={{ color: "hsl(43 96% 56% / 0.7)" }}
            >
              MATCH STARTING...
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
