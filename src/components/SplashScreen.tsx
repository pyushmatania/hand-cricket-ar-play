import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import splashBg from "@/assets/splash-stadium.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState(0);
  const [loadPct, setLoadPct] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 3800),
      setTimeout(() => onComplete(), 4400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    if (phase < 2) return;
    const interval = setInterval(() => {
      setLoadPct((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return Math.min(p + 2, 100);
      });
    }, 35);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] overflow-hidden bg-[hsl(222_47%_4%)]"
        >
          {/* Stadium Dusk Background */}
          <motion.div
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={splashBg}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.7) saturate(1.2)" }}
              width={1080}
              height={1920}
            />
            {/* Dusk sky overlay — warm amber top, dark bottom */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(180deg,
                    hsl(25 60% 20% / 0.5) 0%,
                    hsl(222 47% 6% / 0.3) 30%,
                    hsl(222 47% 6% / 0.6) 60%,
                    hsl(222 47% 6% / 0.95) 100%
                  )
                `,
              }}
            />
          </motion.div>

          {/* Floodlight glow cones from top */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at 25% -5%, hsl(45 80% 90% / 0.1) 0%, transparent 40%),
                  radial-gradient(ellipse at 75% -5%, hsl(45 80% 90% / 0.1) 0%, transparent 40%),
                  radial-gradient(ellipse at 50% 0%, hsl(45 80% 90% / 0.06) 0%, transparent 35%)
                `,
              }}
            />
          </div>

          {/* Floating chalk dust particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 2 + Math.random() * 3,
                  height: 2 + Math.random() * 3,
                  background: `hsl(48 60% 95% / ${0.2 + Math.random() * 0.3})`,
                }}
                initial={{
                  x: Math.random() * 400,
                  y: Math.random() * 600 + 200,
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * -300],
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Chrome Logo Text */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  type: "spring",
                  damping: 14,
                  stiffness: 100,
                }}
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ marginTop: "-8%" }}
              >
                {/* Cricket ball icon */}
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                  className="mb-4"
                >
                  <div
                    className="w-20 h-20 rounded-full relative"
                    style={{
                      background: "radial-gradient(circle at 35% 35%, hsl(12 70% 40%), hsl(12 80% 25%), hsl(12 85% 15%))",
                      boxShadow: "0 8px 30px rgba(139,37,0,0.5), inset 0 -3px 6px rgba(0,0,0,0.4), inset 0 3px 6px hsl(12 60% 50% / 0.3)",
                    }}
                  >
                    {/* Seam line */}
                    <div
                      className="absolute inset-2 rounded-full border-2 border-dashed"
                      style={{ borderColor: "hsl(48 80% 85% / 0.4)" }}
                    />
                  </div>
                </motion.div>

                {/* CRICKET CLASH in chrome */}
                <h1
                  className="font-display text-4xl font-black tracking-wider leading-tight text-center"
                  style={{
                    background: "linear-gradient(180deg, hsl(0 0% 95%) 0%, hsl(230 6% 70%) 40%, hsl(230 8% 50%) 70%, hsl(230 6% 70%) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))",
                  }}
                >
                  CRICKET
                  <br />
                  CLASH
                </h1>

                {/* Tagline in chalk */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-chalk text-[10px] tracking-[0.4em] mt-2 font-bold"
                >
                  HAND CRICKET EVOLVED
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chalk-Style Loading Bar */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-28 left-1/2 -translate-x-1/2 w-56"
              >
                {/* Pitch strip track */}
                <div
                  className="relative h-3 rounded-sm overflow-hidden"
                  style={{
                    background: "linear-gradient(90deg, hsl(130 30% 18%), hsl(130 25% 22%), hsl(130 30% 18%))",
                    border: "1px solid hsl(130 20% 14%)",
                  }}
                >
                  {/* Crease marks */}
                  <div className="absolute left-[20%] top-0 bottom-0 w-px bg-white/15" />
                  <div className="absolute right-[20%] top-0 bottom-0 w-px bg-white/15" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />

                  {/* Chalk fill */}
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${loadPct}%` }}
                    className="h-full relative rounded-sm"
                    style={{
                      background: "linear-gradient(90deg, hsl(48 60% 90% / 0.9), hsl(0 0% 100% / 0.95))",
                      boxShadow: "0 0 8px hsl(0 0% 100% / 0.3)",
                    }}
                  >
                    {/* Chalk dust at leading edge */}
                    <div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                      style={{
                        background: "radial-gradient(circle, hsl(0 0% 100% / 0.5), transparent)",
                      }}
                    />
                  </motion.div>
                </div>

                {/* Percentage */}
                <motion.div
                  className="text-center mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span
                    className="font-score text-xs tracking-[0.2em] font-bold"
                    style={{ color: "hsl(48 60% 85% / 0.7)" }}
                  >
                    {loadPct}%
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 0.4 : 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 left-0 right-0 text-center"
          >
            <span className="text-chalk text-[9px] tracking-[0.3em] uppercase opacity-50">
              The Stadium Awaits
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
