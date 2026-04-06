import { motion } from "framer-motion";
import handCricketLogo from "@/assets/hand-cricket-logo.png";

interface HomeScreenProps {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-8 game-screen-v11"
    >
      {/* Wood grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: "url('/assets/ui/wood-plank-texture.png')",
          backgroundRepeat: "repeat",
        }}
      />
      {/* Warm torch glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,115,85,0.08) 0%, transparent 70%)" }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,5,0,0.7) 100%)" }}
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
          <img
            src={handCricketLogo}
            alt="Hand Cricket"
            className="mx-auto w-64 sm:w-72 max-w-[80vw] drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.5)) drop-shadow(0 0 40px rgba(255,215,0,0.1))",
            }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-base mb-2 leading-relaxed px-4 font-body"
          style={{ color: "#F5E6D3" }}
        >
          The stadium is live. The crowd is ready.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm mb-8 px-4 font-body"
          style={{ color: "#8B7355" }}
        >
          Show your hand. Gestures auto-capture. Score big. Beat the AI.
        </motion.p>

        {/* Start button — Leather 3D */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.96, y: 3 }}
          onClick={onStart}
          className="btn-leather w-full max-w-xs mx-auto font-display text-base tracking-wider relative overflow-hidden"
        >
          {/* Metal studs */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle at 35% 35%, #AAAAAA, #777777 40%, #555555)",
              boxShadow: "inset -1px -1px 0 rgba(0,0,0,0.3), 0 1px 1px rgba(0,0,0,0.3)",
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle at 35% 35%, #AAAAAA, #777777 40%, #555555)",
              boxShadow: "inset -1px -1px 0 rgba(0,0,0,0.3), 0 1px 1px rgba(0,0,0,0.3)",
            }}
          />
          <span className="relative z-10">⚡ ENTER THE STADIUM</span>
        </motion.button>

        {/* Feature badges — wood panels */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 grid grid-cols-3 gap-2"
        >
          {[
            { icon: "📸", label: "Live Camera", sub: "Auto Detect" },
            { icon: "✋", label: "Auto Capture", sub: "No Buttons" },
            { icon: "🏟️", label: "Stadium AR", sub: "Immersive" },
          ].map((f) => (
            <div
              key={f.label}
              className="text-center p-3 wood-panel metal-corners"
              style={{ borderRadius: 14 }}
            >
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-[10px] font-bold font-display" style={{ color: "#F5E6D3" }}>{f.label}</div>
              <div className="text-[8px] font-body" style={{ color: "#8B7355" }}>{f.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* Gesture hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 flex items-center justify-center gap-3"
        >
          {["✊ DEF", "☝️ 1", "✌️ 2", "🤟 3", "🖖 4", "👍 6"].map((g) => (
            <span key={g} className="text-[9px] font-display" style={{ color: "rgba(139,115,85,0.4)" }}>
              {g}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
