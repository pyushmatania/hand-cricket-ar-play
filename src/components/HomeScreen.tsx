import { motion } from "framer-motion";

interface HomeScreenProps {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div className="min-h-screen stadium-gradient flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md w-full"
      >
        {/* Logo area */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center glow-primary mb-4">
            <span className="text-5xl">🏏</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground text-glow tracking-wider">
            HAND CRICKET
          </h1>
          <p className="font-display text-xs tracking-[0.3em] text-primary mt-1">
            AR MVP
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-lg mb-8 leading-relaxed"
        >
          Play hand cricket using your camera!
          Show your hand gesture, and the AI will bowl back.
          First to outscore the other wins.
        </motion.p>

        {/* Start button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-full max-w-xs mx-auto py-4 px-8 bg-primary text-primary-foreground font-display font-bold text-lg rounded-xl glow-primary transition-all hover:brightness-110 active:brightness-90"
        >
          START GAME
        </motion.button>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 grid grid-cols-3 gap-3"
        >
          {[
            { icon: "📸", label: "Camera" },
            { icon: "✋", label: "Gestures" },
            { icon: "🤖", label: "AI Play" },
          ].map((f) => (
            <div key={f.label} className="glass p-3 text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-xs text-muted-foreground font-semibold">{f.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
