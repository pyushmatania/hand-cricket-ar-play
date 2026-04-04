import { motion } from "framer-motion";
import SpinningCricketBall from "./SpinningCricketBall";

interface HomeScreenProps {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-8"
      style={{
        background: "linear-gradient(180deg, hsl(28 35% 14%) 0%, hsl(25 30% 8%) 40%, hsl(222 40% 6%) 100%)",
      }}
    >
      {/* Leather grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='6' height='6' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
      />
      {/* Radiant glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(43 90% 55% / 0.06) 0%, transparent 70%)" }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(25 30% 4% / 0.7) 100%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="mb-6"
        >
          <SpinningCricketBall size={120} className="mx-auto mb-4" />
          <h1 className="font-game-title text-3xl sm:text-4xl text-foreground tracking-wider leading-tight"
            style={{ textShadow: "0 3px 0 hsl(25 40% 8%), 0 6px 20px rgba(0,0,0,0.5)" }}
          >
            <span className="block">AR CRICKET</span>
            <span className="block" style={{ color: "hsl(43 90% 55%)" }}>2K26</span>
          </h1>
          <p className="font-game-display text-[10px] tracking-[0.4em] mt-1 font-bold"
            style={{ color: "hsl(43 70% 50%)" }}
          >
            AUGMENTED REALITY
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-muted-foreground text-base mb-2 leading-relaxed px-4 font-game-body"
        >
          The stadium is live. The crowd is ready.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-muted-foreground/60 text-sm mb-8 px-4 font-game-body"
        >
          Show your hand. Gestures auto-capture. Score big. Beat the AI.
        </motion.p>

        {/* Start button — 3D Jersey Mesh */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.96, y: 3 }}
          onClick={onStart}
          className="w-full max-w-xs mx-auto font-game-title text-base tracking-wider relative overflow-hidden"
          style={{
            padding: "16px 32px",
            borderRadius: "16px",
            background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
            border: "2px solid hsl(142 60% 55% / 0.5)",
            borderBottom: "6px solid hsl(142 55% 25%)",
            color: "hsl(142 80% 98%)",
            textShadow: "0 2px 0 hsl(142 50% 20%)",
            boxShadow: "0 6px 24px hsl(142 71% 45% / 0.3), inset 0 1px 0 hsl(142 80% 65% / 0.4)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)",
              backgroundSize: "4px 4px",
            }}
          />
          <span className="relative z-10">⚡ ENTER THE STADIUM</span>
        </motion.button>

        {/* Feature badges — Stadium Concrete */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-10 grid grid-cols-3 gap-2"
        >
          {[
            { icon: "📸", label: "Live Camera", sub: "Auto Detect" },
            { icon: "✋", label: "Auto Capture", sub: "No Buttons" },
            { icon: "🏟️", label: "Stadium AR", sub: "Immersive" },
          ].map((f) => (
            <div key={f.label} className="text-center p-3"
              style={{
                borderRadius: "14px",
                background: "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 11%) 100%)",
                border: "1.5px solid hsl(25 18% 22%)",
                borderBottom: "4px solid hsl(25 20% 10%)",
              }}
            >
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-[10px] text-foreground font-bold font-game-card">{f.label}</div>
              <div className="text-[8px] text-muted-foreground/60 font-game-body">{f.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* Gesture hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-6 flex items-center justify-center gap-3"
        >
          {["✊ DEF", "☝️ 1", "✌️ 2", "🤟 3", "🖖 4", "👍 6"].map(g => (
            <span key={g} className="text-[9px] text-muted-foreground/40 font-game-display">{g}</span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
