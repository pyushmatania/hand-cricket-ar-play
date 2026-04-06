import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import V10PlayerAvatar from "@/components/shared/V10PlayerAvatar";
import { SFX } from "@/lib/sounds";
import { CHARACTERS } from "@/assets/characters";
import { getVSEffect } from "@/lib/cosmetics";

interface Props {
  playerName: string;
  opponentName: string;
  playerAvatarIndex?: number;
  opponentAvatarIndex?: number;
  gameType?: string;
  equippedVSEffect?: string | null;
  playerCharacter?: string;
  opponentCharacter?: string;
  onComplete: () => void;
}

/* ── Energy Sparks along diagonal seam ─────────── */
function SeamSparks() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            left: ["35%", "62%"],
            top: ["100%", "0%"],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "linear",
          }}
          className="absolute w-[3px] h-[3px] rounded-full z-20"
          style={{
            background: "hsl(43 100% 80%)",
            boxShadow: "0 0 6px hsl(43 100% 70%), 0 0 12px hsl(43 100% 60%)",
          }}
        />
      ))}
    </>
  );
}

/* ── Gold Burst Sparks from VS block ───────────── */
function VSGoldSparks() {
  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (360 / 20) * i + Math.random() * 18;
        const dist = 40 + Math.random() * 50;
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.5, delay: 0.55 + Math.random() * 0.2 }}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: "hsl(43 100% 70%)",
              boxShadow: "0 0 4px hsl(43 100% 60%)",
            }}
          />
        );
      })}
    </>
  );
}

export default function VSIntroScreen({
  playerName,
  opponentName,
  playerAvatarIndex = 0,
  opponentAvatarIndex = 1,
  gameType = "ar",
  equippedVSEffect,
  playerCharacter = "batsman",
  opponentCharacter = "bowler",
  onComplete,
}: Props) {
  const vsEffect = getVSEffect(equippedVSEffect);
  const [stage, setStage] = useState<"slash" | "flood" | "characters" | "vs" | "info" | "done">("slash");

  const playerImg = CHARACTERS[playerCharacter] || CHARACTERS.batsman;
  const opponentImg = CHARACTERS[opponentCharacter] || CHARACTERS.bowler;

  useEffect(() => {
    // 0.05s: slash sound
    try { SFX.ceremonyHorn(); } catch {}
    const t0 = setTimeout(() => setStage("flood"), 100);
    const t1 = setTimeout(() => setStage("characters"), 250);
    const t2 = setTimeout(() => {
      setStage("vs");
      try { SFX.gameStart(); } catch {}
      try { navigator.vibrate?.([30, 20, 40, 20, 50]); } catch {}
    }, 550);
    const t3 = setTimeout(() => setStage("info"), 1000);
    const t4 = setTimeout(() => { setStage("done"); onComplete(); }, 3000);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const gameLabel = gameType === "tap" ? "TAP DUEL" : gameType === "tournament" ? "TOURNAMENT" : "AR DUEL";

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#000" }}
        >
          {/* ── Scalloped BG + team colors ── */}
          <div className="absolute inset-0">
            {/* Player side — team blue with scalloped overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: stage !== "slash" ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, hsl(217 80% 42%) 0%, hsl(220 50% 15%) 100%)",
                clipPath: "polygon(0 0, 62% 0, 38% 100%, 0 100%)",
              }}
            >
              <div className="absolute inset-0 scallop-bg opacity-[0.08]" />
            </motion.div>

            {/* Opponent side — team red with scalloped overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: stage !== "slash" ? 1 : 0 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              className="absolute inset-0"
              style={{
                background: "linear-gradient(225deg, hsl(4 75% 42%) 0%, hsl(4 50% 15%) 100%)",
                clipPath: "polygon(62% 0, 100% 0, 100% 100%, 38% 100%)",
              }}
            >
              <div className="absolute inset-0 scallop-bg opacity-[0.08]" />
            </motion.div>

            {/* Golden diagonal energy seam */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{
                opacity: stage !== "slash" ? [0.7, 1, 0.7] : 0,
                scaleX: stage !== "slash" ? 1 : 0,
              }}
              transition={{
                opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                scaleX: { duration: 0.1 },
              }}
              className="absolute inset-0 z-10"
              style={{
                background: `linear-gradient(153deg, transparent 47.5%, rgba(255,215,0,0.5) 49%, rgba(255,215,0,0.9) 49.5%, rgba(255,255,255,1) 50%, rgba(255,215,0,0.9) 50.5%, rgba(255,215,0,0.5) 51%, transparent 52.5%)`,
                pointerEvents: "none",
              }}
            />

            {/* Seam sparks */}
            {stage !== "slash" && <SeamSparks />}

            {/* Vignette */}
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 100%)" }} />
          </div>

          {/* ── Slash effect (initial) ── */}
          {stage === "slash" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 z-30"
              style={{
                background: "linear-gradient(153deg, transparent 48%, rgba(255,255,255,0.9) 49.5%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 50.5%, transparent 52%)",
              }}
            />
          )}

          {/* ── Game Type Banner — wood panel ── */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="wood-panel px-5 py-2 rounded-xl">
              <span className="font-display text-[10px] font-bold tracking-[0.3em] text-game-gold">{gameLabel}</span>
            </div>
          </motion.div>

          {/* ── Characters ── */}
          <div className="relative flex items-end justify-between w-full h-full px-2 z-10">
            {/* Player character — crashes from left */}
            <motion.div
              initial={{ x: "-150%", opacity: 0 }}
              animate={{
                x: stage !== "slash" ? ["-150%", "5%", "-2%", "0%"] : "-150%",
                opacity: stage !== "slash" ? 1 : 0,
              }}
              transition={{ duration: 0.35, times: [0, 0.6, 0.85, 1], ease: "easeOut", delay: 0.2 }}
              className="flex-1 flex flex-col items-center justify-end pb-36 relative"
            >
              <motion.img
                src={playerImg}
                alt="Player"
                className="w-44 h-auto max-h-[55vh] object-contain relative z-10"
                style={{ filter: "drop-shadow(0 0 30px hsl(217 80% 50% / 0.5))" }}
                animate={stage === "info" || stage === "vs" ? { x: [0, 10, 0] } : {}}
                transition={{ delay: 0.8, duration: 0.3 }}
              />
            </motion.div>

            {/* ── VS Stone Block — center ── */}
            <motion.div
              initial={{ scale: 2, y: -200, opacity: 0 }}
              animate={
                stage === "vs" || stage === "info"
                  ? { scale: [2, 0.9, 1.05, 1], y: 0, opacity: 1 }
                  : { scale: 2, y: -200, opacity: 0 }
              }
              transition={{ duration: 0.25, times: [0, 0.5, 0.8, 1], ease: "easeOut" }}
              className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 z-20"
            >
              {/* Gold sparks on impact */}
              <div className="absolute inset-0 flex items-center justify-center">
                {(stage === "vs" || stage === "info") && <VSGoldSparks />}
              </div>

              {/* 3D stone block image */}
              <img
                src="/assets/popups/vs-stone-block.png"
                alt="VS"
                width={100}
                height={100}
                className="relative z-10"
                style={{
                  filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.7)) drop-shadow(0 0 30px hsl(43 100% 60% / 0.3))",
                }}
              />
            </motion.div>

            {/* Opponent character — crashes from right */}
            <motion.div
              initial={{ x: "150%", opacity: 0 }}
              animate={{
                x: stage !== "slash" ? ["150%", "-5%", "2%", "0%"] : "150%",
                opacity: stage !== "slash" ? 1 : 0,
              }}
              transition={{ duration: 0.35, times: [0, 0.6, 0.85, 1], ease: "easeOut", delay: 0.3 }}
              className="flex-1 flex flex-col items-center justify-end pb-36 relative"
            >
              <motion.img
                src={opponentImg}
                alt="Opponent"
                className="w-44 h-auto max-h-[55vh] object-contain relative z-10"
                style={{ filter: "drop-shadow(0 0 30px hsl(4 80% 50% / 0.5))" }}
                animate={stage === "info" || stage === "vs" ? { x: [0, -10, 0] } : {}}
                transition={{ delay: 0.8, duration: 0.3 }}
              />
            </motion.div>
          </div>

          {/* ── Player Info Pills — Dark Wood Plank ── */}
          <div className="absolute bottom-20 left-0 right-0 z-20 flex justify-between px-3 gap-2">
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: stage === "info" ? 0 : 60, opacity: stage === "info" ? 1 : 0 }}
              transition={{ type: "spring", damping: 14, delay: 0 }}
              className="flex-1"
            >
              <div
                className="rounded-xl px-3 py-2.5 flex items-center gap-2"
                style={{
                  background: "linear-gradient(180deg, #5C3A1E, #3E2410)",
                  border: "3px solid #2E1A0E",
                  boxShadow: "inset 0 2px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.5)",
                }}
              >
                <V10PlayerAvatar level={1} xpProgress={0.5} size="sm" />
                <div className="flex flex-col min-w-0">
                  <span className="font-display text-[11px] font-black tracking-wider truncate" style={{ color: "#F5E6D3" }}>
                    {playerName.toUpperCase()}
                  </span>
                  <span className="text-[7px] font-display font-bold tracking-widest" style={{ color: "hsl(217 91% 60%)" }}>BATSMAN</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: stage === "info" ? 0 : 60, opacity: stage === "info" ? 1 : 0 }}
              transition={{ type: "spring", damping: 14, delay: 0.08 }}
              className="flex-1"
            >
              <div
                className="rounded-xl px-3 py-2.5 flex items-center gap-2 justify-end"
                style={{
                  background: "linear-gradient(180deg, #5C3A1E, #3E2410)",
                  border: "3px solid #2E1A0E",
                  boxShadow: "inset 0 2px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.5)",
                }}
              >
                <div className="flex flex-col items-end min-w-0">
                  <span className="font-display text-[11px] font-black tracking-wider truncate" style={{ color: "#F5E6D3" }}>
                    {opponentName.toUpperCase()}
                  </span>
                  <span className="text-[7px] font-display font-bold tracking-widest" style={{ color: "hsl(4 90% 58%)" }}>BOWLER</span>
                </div>
                <V10PlayerAvatar level={1} xpProgress={0.3} size="sm" />
              </div>
            </motion.div>
          </div>

          {/* ── MATCH FOUND text ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === "info" ? 1 : 0 }}
            className="absolute bottom-7 left-1/2 -translate-x-1/2 text-center z-20"
          >
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2, times: [0, 0.1, 0.7, 1] }}
              className="font-display text-sm font-black tracking-[0.2em]"
              style={{
                color: "#FFF",
                textShadow: "0 0 20px hsl(43 100% 60% / 0.6), 0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              MATCH STARTING...
            </motion.span>
          </motion.div>

          {/* ── Impact flash on VS slam ── */}
          {stage === "vs" && (
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-white/40 pointer-events-none z-30"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
