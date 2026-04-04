import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface StumpHitAnimationProps {
  show: boolean;
  onComplete: () => void;
}

export default function StumpHitAnimation({ show, onComplete }: StumpHitAnimationProps) {
  const [phase, setPhase] = useState<"ball" | "hit" | "done">("ball");

  useEffect(() => {
    if (!show) { setPhase("ball"); return; }
    setPhase("ball");
    const t1 = setTimeout(() => setPhase("hit"), 600);
    const t2 = setTimeout(() => setPhase("done"), 1400);
    const t3 = setTimeout(onComplete, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center"
        style={{ background: "radial-gradient(circle, hsl(25 30% 6% / 0.95), hsl(222 40% 3% / 0.98))" }}
      >
        {/* Stumps */}
        <div className="relative" style={{ width: 160, height: 200 }}>
          {/* Three stumps */}
          {[-20, 0, 20].map((offset, i) => (
            <motion.div
              key={i}
              animate={phase === "hit" ? {
                rotate: [0, i === 0 ? -25 : i === 2 ? 25 : -5],
                y: [0, i === 1 ? -20 : -10],
                opacity: [1, 1, 0.8],
              } : {}}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute"
              style={{
                left: `calc(50% + ${offset}px - 4px)`,
                bottom: 20,
                width: 8,
                height: 120,
                borderRadius: "4px 4px 2px 2px",
                background: "linear-gradient(180deg, hsl(43 60% 55%) 0%, hsl(35 50% 35%) 100%)",
                boxShadow: "inset -2px 0 0 hsl(35 40% 25%), 2px 4px 8px rgba(0,0,0,0.5)",
                transformOrigin: "bottom center",
              }}
            />
          ))}

          {/* Bails */}
          {[-10, 10].map((offset, i) => (
            <motion.div
              key={`bail-${i}`}
              animate={phase === "hit" ? {
                y: [0, -80, -40],
                x: [0, i === 0 ? -40 : 40, i === 0 ? -60 : 60],
                rotate: [0, i === 0 ? -180 : 180, i === 0 ? -360 : 360],
                opacity: [1, 1, 0],
              } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute"
              style={{
                left: `calc(50% + ${offset}px - 10px)`,
                bottom: 136,
                width: 20,
                height: 5,
                borderRadius: "3px",
                background: "linear-gradient(90deg, hsl(43 70% 55%), hsl(35 60% 40%))",
                boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
              }}
            />
          ))}

          {/* Cricket ball */}
          <motion.div
            initial={{ x: -200, y: 100, scale: 0.5, opacity: 0 }}
            animate={
              phase === "ball"
                ? { x: 60, y: 0, scale: 1, opacity: 1, rotate: 720 }
                : phase === "hit"
                ? { x: 60, y: 0, scale: 1.3, opacity: 1, rotate: 720 }
                : { x: 60, y: 0, scale: 0, opacity: 0 }
            }
            transition={{ duration: phase === "ball" ? 0.5 : 0.2, ease: "easeOut" }}
            className="absolute"
            style={{
              bottom: 60,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, hsl(0 70% 55%), hsl(0 60% 35%))",
              boxShadow: "0 0 20px hsl(0 70% 50% / 0.6), inset -3px -3px 6px rgba(0,0,0,0.4)",
            }}
          >
            {/* Seam */}
            <div className="absolute inset-[4px] rounded-full" style={{
              border: "1.5px dashed hsl(45 80% 70% / 0.6)",
            }} />
          </motion.div>

          {/* Impact flash */}
          {phase === "hit" && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute rounded-full"
              style={{
                bottom: 60,
                left: "50%",
                width: 40,
                height: 40,
                transform: "translateX(-50%)",
                background: "radial-gradient(circle, hsl(43 90% 70%), transparent 70%)",
              }}
            />
          )}

          {/* Spark particles on hit */}
          {phase === "hit" && [...Array(8)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 8) * Math.PI * 2) * (40 + Math.random() * 30),
                y: Math.sin((i / 8) * Math.PI * 2) * (40 + Math.random() * 30) - 30,
                scale: 0,
                opacity: 0,
              }}
              transition={{ duration: 0.6, delay: i * 0.03 }}
              className="absolute rounded-full"
              style={{
                bottom: 70,
                left: "50%",
                width: 4,
                height: 4,
                background: "hsl(43 90% 60%)",
                boxShadow: "0 0 6px hsl(43 90% 60%)",
              }}
            />
          ))}
        </div>

        {/* HOWZAT text */}
        {phase === "hit" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="absolute bottom-[30%] text-center"
          >
            <span className="font-game-title text-4xl tracking-wider"
              style={{
                color: "hsl(43 90% 55%)",
                textShadow: "0 4px 0 hsl(25 40% 12%), 0 0 30px hsl(43 90% 55% / 0.5)",
              }}
            >
              HOWZAT! 🏏
            </span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
