import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import splashBg from "@/assets/splash-stadium-bg.jpg";
import handCricketLogo from "@/assets/hand-cricket-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState(0);
  const [loadPct, setLoadPct] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => onComplete(), 3700),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

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
        >
          {/* Stadium background */}
          <img
            src={splashBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            width={1080}
            height={1920}
          />

          {/* Dark overlay for contrast */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.4) 100%)" }}
          />

          {/* Logo */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, type: "spring", damping: 12, stiffness: 80 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ marginTop: "-15%" }}
              >
                {/* Golden glow behind logo */}
                <div
                  className="absolute w-80 h-48 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse, rgba(255,215,0,0.25) 0%, rgba(255,215,0,0.08) 40%, transparent 70%)",
                    filter: "blur(20px)",
                  }}
                />
                <img
                  src={handCricketLogo}
                  alt="Hand Cricket"
                  className="relative z-10 w-72 sm:w-80 max-w-[85vw] drop-shadow-2xl"
                  style={{
                    filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.6)) drop-shadow(0 0 60px rgba(255,215,0,0.15))",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading bar */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute left-1/2 -translate-x-1/2 w-[70%] max-w-xs"
                style={{ bottom: "22%" }}
              >
                <div
                  className="relative h-2.5 rounded-full overflow-hidden"
                  style={{
                    background: "rgba(0,40,0,0.5)",
                    border: "1px solid rgba(74,222,80,0.2)",
                  }}
                >
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${loadPct}%` }}
                    className="h-full rounded-full relative"
                    style={{
                      background: "linear-gradient(90deg, #2D8F3A, #4ADE50, #6BF178)",
                      boxShadow: "0 0 12px rgba(74,222,80,0.5)",
                    }}
                  >
                    {/* Glowing dot at leading edge */}
                    <div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full"
                      style={{
                        background: "radial-gradient(circle, #8FFF9A 0%, #4ADE50 50%, transparent 70%)",
                        boxShadow: "0 0 8px #4ADE50",
                      }}
                    />
                  </motion.div>
                </div>

                <div className="flex justify-end mt-2">
                  <span className="font-score text-sm font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {loadPct}%
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
