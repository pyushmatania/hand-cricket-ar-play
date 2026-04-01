import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const QUICK_STATS = [
  { label: "MATCHES", value: "0", icon: "🏏" },
  { label: "WINS", value: "0", icon: "🏆" },
  { label: "HIGH SCORE", value: "—", icon: "⭐" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      {/* Background effects */}
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(4 85% 58% / 0.06) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 flex items-center justify-center glow-primary mb-4 rotate-3">
            <span className="text-4xl">🏏</span>
          </div>
          <h1 className="font-display text-2xl font-black text-foreground tracking-wider">
            HAND CRICKET
          </h1>
          <p className="font-display text-[10px] tracking-[0.3em] text-primary font-bold mt-1">
            AUGMENTED REALITY
          </p>
        </motion.div>

        {/* Quick Play CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/play")}
          className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-display font-black text-base rounded-2xl glow-primary transition-all tracking-wider mb-6"
        >
          ⚡ PLAY NOW
        </motion.button>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-2 mb-6"
        >
          {QUICK_STATS.map((s) => (
            <div key={s.label} className="glass-score p-3 text-center">
              <span className="text-xl block mb-1">{s.icon}</span>
              <span className="font-display text-lg font-black text-foreground block leading-none">
                {s.value}
              </span>
              <span className="text-[8px] text-muted-foreground font-display font-bold tracking-wider">
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Game Modes Preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h2 className="font-display text-[10px] font-bold text-muted-foreground tracking-[0.2em]">
            GAME MODES
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "📸", label: "AR Mode", desc: "Camera + hand gestures", mode: "ar" },
              { icon: "👆", label: "Tap Mode", desc: "Tap to play", mode: "tap" },
              { icon: "⚔️", label: "Multiplayer", desc: "Play with friends", mode: "multiplayer", soon: true },
              { icon: "🎯", label: "Practice", desc: "Learn gestures", mode: "practice" },
            ].map((m) => (
              <button
                key={m.mode}
                onClick={() => !m.soon && navigate(`/game/${m.mode}`)}
                className={`glass-score p-4 text-left active:scale-95 transition-transform relative ${
                  m.soon ? "opacity-50" : ""
                }`}
              >
                {m.soon && (
                  <span className="absolute top-2 right-2 text-[7px] font-display font-bold text-secondary bg-secondary/20 px-1.5 py-0.5 rounded-full">
                    SOON
                  </span>
                )}
                <span className="text-2xl block mb-2">{m.icon}</span>
                <span className="font-display text-xs font-bold text-foreground block">
                  {m.label}
                </span>
                <span className="text-[9px] text-muted-foreground">{m.desc}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Gesture Guide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex items-center justify-center gap-3"
        >
          <span className="text-[9px] text-muted-foreground/40 font-display">✊ DEF</span>
          <span className="text-[9px] text-muted-foreground/40 font-display">☝️ 1</span>
          <span className="text-[9px] text-muted-foreground/40 font-display">✌️ 2</span>
          <span className="text-[9px] text-muted-foreground/40 font-display">🤟 3</span>
          <span className="text-[9px] text-muted-foreground/40 font-display">🖖 4</span>
          <span className="text-[9px] text-muted-foreground/40 font-display">👍 6</span>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
