import { motion, AnimatePresence } from "framer-motion";
import type { BallResult } from "@/hooks/useHandCricket";

interface ShotResultOverlayProps {
  lastResult: BallResult | null;
  triggerKey: number;
}

/* ── Particle burst helper ─────────────────────────── */
function Particles({ count, color, spread = 120 }: { count: number; color: string; spread?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i + Math.random() * 20;
        const dist = spread + Math.random() * 60;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        const size = 4 + Math.random() * 6;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x, y, scale: 0, opacity: 0 }}
            transition={{ duration: 0.8 + Math.random() * 0.4, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: color,
              boxShadow: `0 0 6px ${color}`,
            }}
          />
        );
      })}
    </>
  );
}

/* ── Wooden signboard frame (FOUR!) ─────────────────── */
function WoodenSignboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Rope hooks */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-20">
        <div className="w-1 h-10 rounded-full" style={{ background: "linear-gradient(180deg, hsl(35 40% 35%), hsl(30 35% 25%))" }} />
        <div className="w-1 h-10 rounded-full" style={{ background: "linear-gradient(180deg, hsl(35 40% 35%), hsl(30 35% 25%))" }} />
      </div>
      {/* Board */}
      <div
        className="relative px-10 py-5 rounded-xl"
        style={{
          background: "linear-gradient(180deg, hsl(30 50% 32%), hsl(25 45% 22%))",
          border: "4px solid hsl(30 40% 18%)",
          boxShadow:
            "inset 0 2px 0 hsl(35 50% 42%), inset 0 -3px 0 hsl(25 40% 14%), 0 8px 30px hsl(0 0% 0% / 0.6), 0 0 60px hsl(43 96% 56% / 0.2)",
        }}
      >
        {/* Wood grain lines */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-10">
          {[20, 40, 60, 80].map((t) => (
            <div key={t} className="absolute w-full h-px" style={{ top: `${t}%`, background: "hsl(30 30% 15%)" }} />
          ))}
        </div>
        {/* Corner nails */}
        {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
          <div
            key={pos}
            className={`absolute ${pos} w-2.5 h-2.5 rounded-full`}
            style={{
              background: "radial-gradient(circle at 35% 35%, hsl(40 30% 60%), hsl(35 25% 30%))",
              boxShadow: "inset 0 1px 0 hsl(40 30% 70%), 0 1px 2px hsl(0 0% 0% / 0.4)",
            }}
          />
        ))}
        {children}
      </div>
    </div>
  );
}

/* ── Stone monument frame (SIX!) ─────────────────── */
function StoneMonument({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Pillar glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0.3] }}
        transition={{ duration: 1 }}
        className="absolute -inset-4 rounded-2xl"
        style={{ background: "radial-gradient(circle, hsl(280 80% 60% / 0.15), transparent 70%)" }}
      />
      {/* Stone slab */}
      <div
        className="relative px-10 py-6 rounded-xl"
        style={{
          background: "linear-gradient(180deg, hsl(220 10% 28%), hsl(220 12% 18%), hsl(220 10% 14%))",
          border: "3px solid hsl(220 8% 35%)",
          boxShadow:
            "inset 0 2px 0 hsl(220 8% 38%), inset 0 -4px 0 hsl(220 10% 10%), 0 10px 40px hsl(0 0% 0% / 0.7), 0 0 80px hsl(280 80% 50% / 0.15)",
        }}
      >
        {/* Crack texture */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <svg className="absolute w-full h-full opacity-[0.06]" viewBox="0 0 200 100">
            <path d="M30 0 L35 30 L25 60 L32 100" stroke="hsl(220 5% 50%)" strokeWidth="0.5" fill="none" />
            <path d="M160 0 L155 40 L165 70 L158 100" stroke="hsl(220 5% 50%)" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        {/* Corner stone brackets */}
        {["top-1 left-1", "top-1 right-1", "bottom-1 left-1", "bottom-1 right-1"].map((pos) => (
          <div
            key={pos}
            className={`absolute ${pos} w-4 h-4`}
            style={{
              borderTop: pos.includes("top") ? "2px solid hsl(220 10% 45%)" : "none",
              borderBottom: pos.includes("bottom") ? "2px solid hsl(220 10% 45%)" : "none",
              borderLeft: pos.includes("left") ? "2px solid hsl(220 10% 45%)" : "none",
              borderRight: pos.includes("right") ? "2px solid hsl(220 10% 45%)" : "none",
              borderRadius: "2px",
            }}
          />
        ))}
        {children}
      </div>
    </div>
  );
}

/* ── Exploding frame (OUT!) ─────────────────────── */
function ExplodingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Red pulse ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute -inset-6 rounded-2xl"
        style={{ border: "3px solid hsl(4 90% 55%)", boxShadow: "0 0 30px hsl(4 90% 55% / 0.4)" }}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0.5 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
        className="absolute -inset-6 rounded-2xl"
        style={{ border: "2px solid hsl(4 80% 50% / 0.5)" }}
      />
      {/* Shattered frame */}
      <div
        className="relative px-10 py-5 rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(4 40% 18%), hsl(0 35% 10%))",
          border: "3px solid hsl(4 60% 40%)",
          boxShadow:
            "inset 0 2px 0 hsl(4 50% 45%), inset 0 -3px 0 hsl(0 30% 8%), 0 8px 40px hsl(0 0% 0% / 0.7), 0 0 60px hsl(4 90% 50% / 0.2)",
        }}
      >
        {/* Diagonal crack */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute w-full h-full opacity-20" viewBox="0 0 200 100">
            <path d="M90 0 L105 35 L95 50 L110 65 L100 100" stroke="hsl(4 90% 55%)" strokeWidth="1.5" fill="none" />
            <path d="M105 35 L130 30" stroke="hsl(4 80% 50%)" strokeWidth="0.8" fill="none" />
            <path d="M95 50 L70 55" stroke="hsl(4 80% 50%)" strokeWidth="0.8" fill="none" />
          </svg>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Main overlay ──────────────────────────────── */
export default function ShotResultOverlay({ lastResult, triggerKey }: ShotResultOverlayProps) {
  if (!lastResult) return null;

  const isOut = lastResult.runs === "OUT";
  const absRuns = typeof lastResult.runs === "number" ? Math.abs(lastResult.runs) : 0;
  const isSix = !isOut && absRuns >= 6;
  const isFour = !isOut && absRuns >= 4;

  if (!isOut && !isSix && !isFour) return null;

  const config = isOut
    ? {
        text: "OUT!",
        glow: "hsl(4 90% 58% / 0.6)",
        textGradient: "linear-gradient(180deg, hsl(4 90% 65%), hsl(0 80% 45%))",
        particles: "hsl(4 90% 55%)",
        particleCount: 20,
        flashColor: "hsl(4 90% 50% / 0.3)",
      }
    : isSix
    ? {
        text: "SIX!",
        glow: "hsl(280 80% 60% / 0.6)",
        textGradient: "linear-gradient(180deg, hsl(280 90% 75%), hsl(270 80% 50%))",
        particles: "hsl(280 80% 60%)",
        particleCount: 24,
        flashColor: "hsl(280 80% 50% / 0.25)",
      }
    : {
        text: "FOUR!",
        glow: "hsl(43 96% 56% / 0.6)",
        textGradient: "linear-gradient(180deg, hsl(43 100% 65%), hsl(35 90% 40%))",
        particles: "hsl(43 96% 56%)",
        particleCount: 16,
        flashColor: "hsl(43 96% 56% / 0.25)",
      };

  const FrameComponent = isOut ? ExplodingFrame : isSix ? StoneMonument : WoodenSignboard;

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
        {/* Full-screen flash */}
        <motion.div
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
          style={{ background: config.flashColor }}
        />

        {/* Radial glow */}
        <motion.div
          initial={{ opacity: 0.6, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2.5 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle, ${config.glow} 0%, transparent 55%)` }}
        />

        {/* Frame + text container */}
        <motion.div
          initial={{ scale: 0, rotateZ: isOut ? 5 : -8 }}
          animate={{
            scale: [0, 1.3, 1.05],
            rotateZ: [isOut ? 5 : -8, isOut ? -2 : 3, 0],
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, times: [0, 0.55, 1] }}
          className="relative z-10 flex items-center justify-center"
        >
          {/* Particles behind the frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Particles count={config.particleCount} color={config.particles} />
          </div>

          <FrameComponent>
            <div className="text-center relative z-10">
              {/* 3D extruded text */}
              <p
                className="font-display text-5xl font-black tracking-[0.15em] relative"
                style={{
                  background: config.textGradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: `drop-shadow(0 0 20px ${config.glow})`,
                }}
              >
                {/* Shadow layers for 3D depth */}
                <span
                  className="absolute inset-0 font-display text-5xl font-black tracking-[0.15em]"
                  style={{
                    WebkitTextStroke: "2px hsl(0 0% 0% / 0.3)",
                    WebkitTextFillColor: "transparent",
                    transform: "translate(2px, 3px)",
                  }}
                  aria-hidden
                >
                  {config.text}
                </span>
                {config.text}
              </p>
              {/* Underline accent */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="mt-1.5 h-1 rounded-full mx-auto"
                style={{
                  width: "60%",
                  background: config.textGradient,
                  boxShadow: `0 0 8px ${config.glow}`,
                }}
              />
            </div>
          </FrameComponent>
        </motion.div>

        {/* Auto-hide after delay */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 1.3 }}
          className="absolute inset-0"
        />
      </motion.div>
    </AnimatePresence>
  );
}
