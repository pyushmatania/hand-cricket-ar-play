import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";

const STATS = [
  { label: "Matches", value: "0", icon: "🏏" },
  { label: "Wins", value: "0", icon: "🏆" },
  { label: "Losses", value: "0", icon: "💔" },
  { label: "Win Rate", value: "—", icon: "📊" },
  { label: "High Score", value: "—", icon: "⭐" },
  { label: "Streak", value: "0", icon: "🔥" },
];

const ACHIEVEMENTS = [
  { icon: "🏏", title: "First Match", desc: "Play your first match", unlocked: false },
  { icon: "🏆", title: "First Win", desc: "Win your first match", unlocked: false },
  { icon: "🔥", title: "On Fire", desc: "Win 3 in a row", unlocked: false },
  { icon: "💯", title: "Century", desc: "Score 100+ in a match", unlocked: false },
  { icon: "🎯", title: "Perfect Bowl", desc: "Bowl out AI for 0", unlocked: false },
  { icon: "⚡", title: "Speed Demon", desc: "Win in under 10 balls", unlocked: false },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 border-2 border-primary/40 flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-muted border border-glass flex items-center justify-center">
              <span className="text-xs">✏️</span>
            </div>
          </div>
          <h1 className="font-display text-lg font-black text-foreground tracking-wider mt-3">
            PLAYER
          </h1>
          <p className="text-[10px] text-muted-foreground font-display mt-1">
            Sign in to save your progress
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="mt-3 px-6 py-2.5 bg-gradient-to-r from-primary/20 to-accent/10 text-primary font-display font-bold text-xs rounded-xl border border-primary/30 tracking-wider"
          >
            🔐 SIGN IN
          </motion.button>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-secondary" />
            <h2 className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">
              CAREER STATS
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="glass-score p-3 text-center"
              >
                <span className="text-sm block mb-0.5">{s.icon}</span>
                <span className="font-display text-xl font-black text-foreground block leading-none">
                  {s.value}
                </span>
                <span className="text-[7px] text-muted-foreground font-display font-bold tracking-wider mt-1 block">
                  {s.label.toUpperCase()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <h2 className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">
              ACHIEVEMENTS
            </h2>
            <span className="text-[8px] text-muted-foreground/50 font-display">
              0 / {ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ACHIEVEMENTS.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className={`glass-score p-3 relative overflow-hidden ${!a.unlocked ? "opacity-40" : ""}`}
              >
                <span className="text-xl block mb-1">{a.icon}</span>
                <span className="font-display text-[10px] font-bold text-foreground block">
                  {a.title}
                </span>
                <span className="text-[8px] text-muted-foreground">{a.desc}</span>
                {!a.unlocked && (
                  <div className="absolute top-2 right-2">
                    <span className="text-[7px] text-muted-foreground/50 font-display">🔒</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
