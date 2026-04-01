import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const MODES = [
  {
    id: "ar",
    icon: "📸",
    title: "AR MODE",
    subtitle: "Camera + Hand Gestures",
    description: "Use your real hand in front of the camera. AI detects your gesture automatically.",
    gradient: "from-primary to-primary/60",
    glow: "glow-primary",
  },
  {
    id: "tap",
    icon: "👆",
    title: "TAP MODE",
    subtitle: "Tap to Play",
    description: "Quick gameplay with on-screen buttons. No camera needed. Perfect for on-the-go.",
    gradient: "from-accent to-accent/60",
    glow: "glow-accent",
  },
  {
    id: "practice",
    icon: "🎯",
    title: "PRACTICE",
    subtitle: "Learn & Improve",
    description: "Practice your gestures without scoring. See what the AI detects in real time.",
    gradient: "from-secondary to-secondary/60",
    glow: "glow-secondary",
  },
  {
    id: "multiplayer",
    icon: "⚔️",
    title: "MULTIPLAYER",
    subtitle: "Coming Soon",
    description: "Challenge your friends in real-time hand cricket matches. Stay tuned!",
    gradient: "from-muted-foreground to-muted-foreground/60",
    glow: "",
    disabled: true,
  },
];

export default function PlayPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-xl font-black text-foreground tracking-wider">
            SELECT MODE
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Choose your play style</p>
        </motion.div>

        <div className="space-y-3">
          {MODES.map((mode, i) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={mode.disabled ? {} : { scale: 0.97 }}
              onClick={() => !mode.disabled && navigate(`/game/${mode.id}`)}
              disabled={mode.disabled}
              className={`w-full glass-score p-4 flex items-start gap-4 text-left transition-all ${
                mode.disabled ? "opacity-40 cursor-not-allowed" : "active:scale-[0.98]"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center shrink-0 ${mode.glow}`}
              >
                <span className="text-2xl">{mode.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-black text-foreground tracking-wider">
                    {mode.title}
                  </span>
                  {mode.disabled && (
                    <span className="text-[7px] font-display font-bold text-secondary bg-secondary/20 px-1.5 py-0.5 rounded-full">
                      SOON
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-primary font-display font-bold block mt-0.5">
                  {mode.subtitle}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-1 leading-relaxed">
                  {mode.description}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Tournament coming soon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass-premium p-4 text-center"
        >
          <span className="text-2xl block mb-2">🏟️</span>
          <p className="font-display text-xs font-bold text-foreground tracking-wider">
            TOURNAMENT MODE
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Best of 3 / Best of 5 series coming in the next update!
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
