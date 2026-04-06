/**
 * V11 Wooden Kingdom Scoring Popup — carved wood frames with metallic text
 */
import { motion, AnimatePresence } from "framer-motion";
import type { BallResult } from "@/hooks/useHandCricket";

interface V10ScoringPopupProps {
  lastResult: BallResult | null;
  triggerKey: number;
}

function Burst({ count, color }: { count: number; color: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i + Math.random() * 20;
        const dist = 100 + Math.random() * 80;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        const size = 3 + Math.random() * 5;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x, y, scale: 0, opacity: 0 }}
            transition={{ duration: 0.7 + Math.random() * 0.3, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{ width: size, height: size, background: color, boxShadow: `0 0 4px ${color}` }}
          />
        );
      })}
    </>
  );
}

export default function V10ScoringPopup({ lastResult, triggerKey }: V10ScoringPopupProps) {
  if (!lastResult) return null;

  const isOut = lastResult.runs === "OUT";
  const absRuns = typeof lastResult.runs === "number" ? Math.abs(lastResult.runs) : 0;
  const isSix = !isOut && absRuns >= 6;
  const isFour = !isOut && absRuns >= 4;

  if (!isOut && !isSix && !isFour) return null;

  const cfg = isOut
    ? { text: "OUT!", gradient: "linear-gradient(180deg, #FF6B6B, #EF4444, #991B1B)", glow: "#EF4444", particles: "#EF4444", frame: "linear-gradient(180deg, #3E2410, #2E1A0E)", border: "#991B1B", woodAccent: "#5C3A1E", count: 20 }
    : isSix
    ? { text: "SIX!", gradient: "linear-gradient(180deg, #C084FC, #A855F7, #7C3AED)", glow: "#A855F7", particles: "#A855F7", frame: "linear-gradient(180deg, #3E2410, #2E1A0E)", border: "#7C3AED", woodAccent: "#5C3A1E", count: 24 }
    : { text: "FOUR!", gradient: "linear-gradient(180deg, #FDE047, #EAB308, #A16207)", glow: "#EAB308", particles: "#EAB308", frame: "linear-gradient(180deg, #3E2410, #2E1A0E)", border: "#A16207", woodAccent: "#5C3A1E", count: 18 };

  return (
    <AnimatePresence>
      <motion.div
        key={triggerKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center"
      >
        {/* Full flash */}
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0"
          style={{ background: `${cfg.glow}20` }}
        />

        {/* Radial glow */}
        <motion.div
          initial={{ opacity: 0.5, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2.5 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle, ${cfg.glow}40 0%, transparent 55%)` }}
        />

        {/* Main popup */}
        <motion.div
          initial={{ scale: 0, rotateZ: isOut ? 5 : -5 }}
          animate={{ scale: [0, 1.25, 1], rotateZ: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.45, times: [0, 0.55, 1], type: "spring", damping: 12 }}
          className="relative z-10"
        >
          {/* Particles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Burst count={cfg.count} color={cfg.particles} />
          </div>

          {/* V11 carved wood frame */}
          <div className="relative px-12 py-6 rounded-2xl overflow-hidden" style={{
            background: cfg.frame,
            border: `3px solid ${cfg.border}`,
            borderBottom: `6px solid ${cfg.border}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 60px ${cfg.glow}25, inset 0 2px 0 rgba(245,230,211,0.08)`,
          }}>
            {/* Wood grain texture */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
              backgroundImage: `url('/assets/ui/wood-plank-texture.png')`,
              backgroundSize: "150px",
              mixBlendMode: "overlay",
            }} />

            {/* Corner metal rivets */}
            {["top-2 left-2", "top-2 right-2", "bottom-3 left-2", "bottom-3 right-2"].map((pos) => (
              <div key={pos} className={`absolute ${pos} w-2.5 h-2.5 rounded-full`} style={{
                background: "radial-gradient(circle at 35% 35%, #C4A265, #8B7355, #5C3A1E)",
                border: "1px solid rgba(0,0,0,0.3)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
              }} />
            ))}

            {/* Pulsing ring for OUT */}
            {isOut && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute -inset-4 rounded-2xl"
                style={{ border: `2px solid ${cfg.glow}`, boxShadow: `0 0 20px ${cfg.glow}40` }}
              />
            )}

            {/* Text */}
            <div className="text-center relative z-10">
              <p className="font-display text-5xl font-black tracking-[0.12em]" style={{
                background: cfg.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: `drop-shadow(0 0 15px ${cfg.glow}80)`,
              }}>
                {cfg.text}
              </p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="mt-1 h-0.5 rounded-full mx-auto"
                style={{ width: "50%", background: cfg.gradient, boxShadow: `0 0 6px ${cfg.glow}60` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Auto-fade */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="absolute inset-0"
        />
      </motion.div>
    </AnimatePresence>
  );
}
