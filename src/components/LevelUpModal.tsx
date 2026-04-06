import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SFX, Haptics } from "@/lib/sounds";
import { RANK_TIERS } from "@/lib/rankTiers";
import GameButton from "./shared/GameButton";

export interface MatchRewards {
  xpEarned: number;
  coinsEarned: number;
  oldLevel: number;
  newLevel: number;
  oldRankName: string | null;
  newRankName: string | null;
  streakBonus: boolean;
}

interface LevelUpModalProps {
  rewards: MatchRewards | null;
  onClose: () => void;
}

export default function LevelUpModal({ rewards, onClose }: LevelUpModalProps) {
  const [phase, setPhase] = useState(0);
  const [show, setShow] = useState(false);

  const didLevelUp = rewards ? rewards.newLevel > rewards.oldLevel : false;
  const didRankUp = rewards ? (rewards.newRankName && rewards.oldRankName && rewards.newRankName !== rewards.oldRankName) : false;
  const newRankTier = didRankUp && rewards ? RANK_TIERS.find(t => t.name === rewards.newRankName) : null;

  useEffect(() => {
    if (!rewards) return;
    setShow(true);
    setPhase(0);
    const t1 = setTimeout(() => {
      if (didLevelUp) {
        setPhase(1);
        try { SFX.levelUp(); Haptics.rewardClaim(); } catch { /* Intentionally ignored - non-critical */ }
      } else if (didRankUp) {
        setPhase(2);
        try { SFX.levelUp(); Haptics.chestOpen(); } catch { /* Intentionally ignored - non-critical */ }
      }
    }, 800);

    const t2 = setTimeout(() => {
      if (didLevelUp && didRankUp) {
        setPhase(2);
        try { SFX.levelUp(); Haptics.chestOpen(); } catch { /* Intentionally ignored - non-critical */ }
      }
    }, 2200);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [didLevelUp, didRankUp]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="relative w-[85vw] max-w-sm rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, hsl(222 40% 16%) 0%, hsl(222 40% 8%) 100%)",
              boxShadow: didRankUp && newRankTier
                ? `0 0 60px ${newRankTier.glowColor.match(/hsl\([^)]+\)/)?.[0] || "hsl(217 91% 60% / 0.3)"}, 0 0 120px ${newRankTier.glowColor.match(/hsl\([^)]+\)/)?.[0] || "hsl(217 91% 60% / 0.15)"}`
                : didLevelUp
                  ? "0 0 60px hsl(207 90% 54% / 0.3), 0 0 120px hsl(207 90% 54% / 0.15)"
                  : "0 0 40px rgba(0,0,0,0.5)",
            }}
          >
            {/* Animated particles background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {(didLevelUp || didRankUp) && Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: didRankUp && newRankTier
                      ? i % 2 === 0 ? "hsl(51 100% 50%)" : "hsl(51 100% 70%)"
                      : i % 2 === 0 ? "hsl(207 90% 54%)" : "hsl(207 90% 74%)",
                    left: `${10 + Math.random() * 80}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -120 - Math.random() * 80],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5 + Math.random(), 0],
                  }}
                  transition={{
                    duration: 1.8 + Math.random() * 1.2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 p-6 text-center">
              {/* XP & Coins earned */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <span className="font-display text-[8px] tracking-[0.3em] text-muted-foreground block mb-3">MATCH REWARDS</span>
                <div className="flex items-center justify-center gap-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className="text-center"
                  >
                    <span className="text-2xl block mb-1">⚡</span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="font-display text-xl font-black text-game-blue block"
                    >
                      +{rewards.xpEarned}
                    </motion.span>
                    <span className="text-[7px] text-muted-foreground font-display tracking-wider">XP</span>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.4 }}
                    className="text-center"
                  >
                    <span className="text-2xl block mb-1">🪙</span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="font-display text-xl font-black text-game-gold block"
                    >
                      +{rewards.coinsEarned}
                    </motion.span>
                    <span className="text-[7px] text-muted-foreground font-display tracking-wider">COINS</span>
                  </motion.div>
                </div>
                {rewards.streakBonus && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.7 }}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-game-orange/15 border border-game-orange/25"
                  >
                    <span className="text-xs">🔥</span>
                    <span className="font-display text-[8px] text-game-orange tracking-wider">STREAK BONUS!</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Level Up celebration */}
              <AnimatePresence>
                {phase >= 1 && didLevelUp && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mb-4"
                  >
                    <div className="rounded-2xl p-4 bg-gradient-to-b from-game-blue/15 to-transparent border border-game-blue/20">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 0.6 }}
                      >
                        <span className="text-5xl block mb-2">🎖️</span>
                      </motion.div>
                      <span className="font-display text-[8px] tracking-[0.3em] text-game-blue/60 block mb-1">LEVEL UP!</span>
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-display text-lg text-muted-foreground">{rewards.oldLevel}</span>
                        <motion.span
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 0.5, repeat: 2 }}
                          className="text-game-gold text-xl"
                        >→</motion.span>
                        <motion.span
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="font-display text-3xl font-black text-game-blue"
                          style={{ textShadow: "0 0 20px hsl(207 90% 54% / 0.5)" }}
                        >
                          {rewards.newLevel}
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rank Up celebration */}
              <AnimatePresence>
                {phase >= 2 && didRankUp && newRankTier && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mb-4"
                  >
                    <div className={`rounded-2xl p-5 ${newRankTier.bgColor} border ${newRankTier.borderColor}`}>
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{ duration: 0.8 }}
                      >
                        <span className="text-6xl block mb-2">{newRankTier.emoji}</span>
                      </motion.div>
                      <span className="font-display text-[8px] tracking-[0.3em] text-game-gold/60 block mb-1">RANK UP!</span>
                      <motion.span
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`font-display text-2xl font-black ${newRankTier.color} block`}
                        style={{ textShadow: "0 0 25px currentColor" }}
                      >
                        {newRankTier.name.toUpperCase()}
                      </motion.span>
                      <div className="mt-2 flex items-center justify-center gap-1">
                        <span className="text-xs">🪙</span>
                        <span className="font-display text-[10px] text-game-gold">+200 BONUS</span>
                        <span className="mx-1 text-muted-foreground">·</span>
                        <span className="text-xs">⚡</span>
                        <span className="font-display text-[10px] text-game-blue">+100 XP</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: didLevelUp || didRankUp ? 1.5 : 0.8 }}
              >
                <GameButton variant="gold" size="lg" bounce onClick={handleClose} className="w-full">
                  ⚡ CONTINUE
                </GameButton>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
