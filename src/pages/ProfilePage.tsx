import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";

const STATS = [
  { label: "Matches", value: "0" },
  { label: "Wins", value: "0" },
  { label: "Losses", value: "0" },
  { label: "Win Rate", value: "—" },
  { label: "High Score", value: "—" },
  { label: "Streak", value: "0" },
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
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-accent/20 border-2 border-primary/40 flex items-center justify-center mb-3">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="font-display text-lg font-black text-foreground tracking-wider">
            PLAYER
          </h1>
          <p className="text-[10px] text-muted-foreground font-display">
            Sign in to save your progress
          </p>
          <button className="mt-3 px-6 py-2 bg-primary/20 text-primary font-display font-bold text-xs rounded-xl border border-primary/30 active:scale-95 transition-transform">
            🔐 SIGN IN
          </button>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="font-display text-[10px] font-bold text-muted-foreground tracking-[0.2em] mb-3">
            CAREER STATS
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {STATS.map((s) => (
              <div key={s.label} className="glass-score p-3 text-center">
                <span className="font-display text-xl font-black text-foreground block leading-none">
                  {s.value}
                </span>
                <span className="text-[8px] text-muted-foreground font-display font-bold tracking-wider mt-1 block">
                  {s.label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-[10px] font-bold text-muted-foreground tracking-[0.2em] mb-3">
            ACHIEVEMENTS
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.title}
                className={`glass-score p-3 ${!a.unlocked ? "opacity-40" : ""}`}
              >
                <span className="text-xl block mb-1">{a.icon}</span>
                <span className="font-display text-[10px] font-bold text-foreground block">
                  {a.title}
                </span>
                <span className="text-[8px] text-muted-foreground">{a.desc}</span>
                {!a.unlocked && (
                  <span className="text-[7px] text-muted-foreground/50 font-display block mt-1">
                    🔒 LOCKED
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
