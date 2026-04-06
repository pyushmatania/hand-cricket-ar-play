import { motion, AnimatePresence } from "framer-motion";
import type { Achievement, AchievementTier } from "@/lib/achievements";

interface AchievementUnlockToastProps {
  achievement: Achievement | null;
  onDone: () => void;
}

const TIER_COLORS: Record<AchievementTier, { bg: string; border: string; text: string; glow: string }> = {
  bronze:    { bg: "hsl(25 60% 15%)",    border: "hsl(25 60% 40%)",    text: "hsl(25 60% 70%)",   glow: "hsl(25 60% 40% / 0.4)" },
  silver:    { bg: "hsl(210 10% 18%)",   border: "hsl(210 10% 55%)",   text: "hsl(210 10% 80%)",  glow: "hsl(210 10% 55% / 0.4)" },
  gold:      { bg: "hsl(45 50% 12%)",    border: "hsl(45 93% 58%)",    text: "hsl(45 93% 70%)",   glow: "hsl(45 93% 58% / 0.5)" },
  legendary: { bg: "hsl(217 50% 12%)",   border: "hsl(217 91% 60%)",   text: "hsl(217 91% 75%)",  glow: "hsl(217 91% 60% / 0.5)" },
};

export default function AchievementUnlockToast({ achievement, onDone }: AchievementUnlockToastProps) {
  if (!achievement) return null;

  const c = TIER_COLORS[achievement.tier];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -80, opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        onAnimationComplete={() => {
          setTimeout(onDone, 3500);
        }}
        className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] w-[85%] max-w-sm"
      >
        <div
          className="rounded-2xl p-4 flex items-center gap-3 border-2 backdrop-blur-md"
          style={{
            background: `linear-gradient(135deg, ${c.bg}, hsl(222 40% 8% / 0.95))`,
            borderColor: c.border,
            boxShadow: `0 8px 32px ${c.glow}, 0 0 60px ${c.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 8, delay: 0.2 }}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: `${c.border}20`, border: `2px solid ${c.border}40` }}
          >
            {achievement.icon}
          </motion.div>

          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 mb-0.5"
            >
              <span className="text-[7px] font-display tracking-[0.3em] font-bold" style={{ color: c.text }}>
                🏅 ACHIEVEMENT UNLOCKED
              </span>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="font-display text-sm font-black text-white block"
            >
              {achievement.title}
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[9px] text-white/50 font-body block"
            >
              {achievement.desc}
            </motion.span>
          </div>

          {/* Tier badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
            className="px-2 py-1 rounded-lg text-[7px] font-display font-bold tracking-wider shrink-0"
            style={{ background: `${c.border}25`, color: c.text, border: `1px solid ${c.border}40` }}
          >
            {achievement.tier.toUpperCase()}
          </motion.div>
        </div>

        {/* Auto-dismiss progress bar */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 3.5, ease: "linear" }}
          className="h-0.5 rounded-full mt-1 origin-left"
          style={{ background: c.border }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
