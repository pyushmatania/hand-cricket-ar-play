import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState(0); // 0=dark, 1=logo, 2=loading, 3=fadeout
  const [loadPct, setLoadPct] = useState(0);

  useEffect(() => {
    // Min 2s display, phases timed for drama
    const timers = [
      setTimeout(() => setPhase(1), 300),    // Logo appears
      setTimeout(() => setPhase(2), 1000),   // Loading bar starts
      setTimeout(() => setPhase(3), 3200),   // Fade out begins
      setTimeout(() => onComplete(), 3700),  // Complete (500ms fade)
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Loading bar progress
  useEffect(() => {
    if (phase < 2) return;
    const interval = setInterval(() => {
      setLoadPct((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return Math.min(p + 3, 100);
      });
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0F172A 0%, #020617 100%)" }}
        >
          {/* Soft team-colored radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 40%, rgba(255,244,79,0.06) 0%, transparent 60%)",
            }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 2 + Math.random() * 2,
                  height: 2 + Math.random() * 2,
                  background: `rgba(255,255,255,${0.15 + Math.random() * 0.2})`,
                }}
                initial={{
                  x: Math.random() * 400,
                  y: 400 + Math.random() * 300,
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * -400],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Logo — CRICKET CLASH in Bungee Shade */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.7,
                  type: "spring",
                  damping: 12,
                  stiffness: 80,
                }}
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ marginTop: "-12%" }}
              >
                {/* Cricket ball as the "O" accent */}
                <motion.div
                  initial={{ rotate: -360, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                  className="mb-5"
                >
                  <div
                    className="w-16 h-16 rounded-full relative"
                    style={{
                      background: "radial-gradient(circle at 35% 35%, #C62828, #8B1A1A, #5D1010)",
                      boxShadow: "0 6px 24px rgba(139,26,26,0.6), inset 0 -2px 6px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,100,100,0.2)",
                    }}
                  >
                    <div
                      className="absolute inset-2 rounded-full border-[1.5px] border-dashed"
                      style={{ borderColor: "rgba(255,220,180,0.35)" }}
                    />
                  </div>
                </motion.div>

                {/* "C R I C K E T" */}
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="font-game-display-3d text-5xl font-black leading-none text-center"
                  style={{
                    letterSpacing: "8px",
                    color: "white",
                    textShadow: "4px 0 4px 8px rgba(0,0,0,0.8), 0 0 40px rgba(255,244,79,0.15)",
                  }}
                >
                  CRICKET
                </motion.h1>

                {/* "C L A S H" */}
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="font-game-display-3d text-[64px] font-black leading-none text-center mt-1"
                  style={{
                    letterSpacing: "10px",
                    color: "white",
                    textShadow: "4px 0 8px rgba(0,0,0,0.8), 0 0 60px rgba(255,244,79,0.2)",
                  }}
                >
                  CLASH
                </motion.h1>

                {/* Tagline */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="font-body text-[10px] tracking-[0.4em] mt-4 text-white/60 uppercase font-semibold"
                >
                  HAND CRICKET EVOLVED
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Bar — team accent colored */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-32 left-1/2 -translate-x-1/2 w-52"
              >
                {/* Bar track */}
                <div
                  className="relative h-2.5 rounded-full overflow-hidden"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Fill — team accent gradient */}
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${loadPct}%` }}
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #FFD700, #FFF44F, #FFD700)",
                      boxShadow: "0 0 12px rgba(255,215,0,0.5)",
                    }}
                  />
                </div>

                {/* Loading text + percentage */}
                <div className="flex items-center justify-center mt-3 gap-2">
                  <span className="font-body text-[11px] tracking-[0.15em] text-white/40">
                    Loading...
                  </span>
                  <span className="font-score text-[13px] font-bold text-white/60">
                    {loadPct}%
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom — subtle branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 0.3 : 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-0 right-0 text-center"
          >
            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-white/30">
              The Stadium Awaits
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
