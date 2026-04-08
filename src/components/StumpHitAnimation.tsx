import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface StumpHitAnimationProps {
  show: boolean;
  onComplete: () => void;
}

function WoodenStump({ x, delay, tiltDir }: { x: number; delay: number; tiltDir: number }) {
  return (
    <motion.div
      initial={{ rotate: 0, y: 0, opacity: 1 }}
      animate={{
        rotate: [0, tiltDir * 30, tiltDir * 45],
        y: [0, -30, -15],
        opacity: [1, 1, 0.7],
      }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="absolute"
      style={{
        left: `calc(50% + ${x}px - 6px)`,
        bottom: 30,
        width: 12,
        height: 140,
        transformOrigin: "bottom center",
      }}
    >
      {/* Stump body with wood grain */}
      <div style={{
        width: "100%", height: "100%",
        borderRadius: "5px 5px 3px 3px",
        background: `linear-gradient(180deg, 
          hsl(38 55% 60%) 0%, 
          hsl(35 50% 48%) 20%, 
          hsl(33 48% 42%) 50%, 
          hsl(30 45% 35%) 80%, 
          hsl(28 42% 28%) 100%)`,
        boxShadow: `
          inset -3px 0 0 hsl(30 35% 22%), 
          inset 3px 0 0 hsl(38 40% 55%),
          3px 5px 12px rgba(0,0,0,0.6)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Wood grain lines */}
        {[15, 35, 55, 75, 95, 115].map((y, i) => (
          <div key={i} style={{
            position: "absolute", top: y, left: 1, right: 1,
            height: 1,
            background: `rgba(${i % 2 === 0 ? "0,0,0,0.15" : "255,255,255,0.08"})`,
          }} />
        ))}
        {/* Wood knot */}
        <div style={{
          position: "absolute", top: 50, left: 2,
          width: 6, height: 8, borderRadius: "50%",
          background: "radial-gradient(circle, hsl(28 50% 30%), hsl(25 45% 25%))",
          boxShadow: "inset 0 0 2px rgba(0,0,0,0.3)",
        }} />
        {/* Highlight edge */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: 3, height: "100%",
          background: "linear-gradient(180deg, rgba(255,230,180,0.25) 0%, rgba(255,255,255,0.05) 100%)",
          borderRadius: "5px 0 0 0",
        }} />
        {/* Top cap (polished cut) */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 6,
          background: "linear-gradient(180deg, hsl(40 50% 65%), hsl(35 45% 50%))",
          borderRadius: "5px 5px 0 0",
          boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.2)",
        }}>
          {/* Growth rings on top */}
          <div style={{
            position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)",
            width: 4, height: 2, borderRadius: "50%",
            border: "0.5px solid rgba(120,80,30,0.3)",
          }} />
        </div>
      </div>
    </motion.div>
  );
}

function Bail({ x, dir, delay }: { x: number; dir: number; delay: number }) {
  return (
    <motion.div
      initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: [0, -120, -80, 60],
        x: [0, dir * 50, dir * 80, dir * 100],
        rotate: [0, dir * -280, dir * -540, dir * -720],
        opacity: [1, 1, 1, 0],
      }}
      transition={{ duration: 1.2, delay, ease: [0.2, 0, 0.3, 1] }}
      className="absolute"
      style={{
        left: `calc(50% + ${x}px - 12px)`,
        bottom: 164,
        width: 24, height: 6,
        borderRadius: "4px",
        background: `linear-gradient(90deg, hsl(40 65% 58%), hsl(38 55% 48%), hsl(35 50% 42%))`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,240,200,0.3)",
      }}
    />
  );
}

function CricketBall({ phase }: { phase: string }) {
  return (
    <motion.div
      initial={{ x: -280, y: 150, scale: 0.3, opacity: 0 }}
      animate={
        phase === "approach"
          ? { x: -100, y: 60, scale: 0.6, opacity: 1, rotate: 360 }
          : phase === "incoming"
          ? { x: 30, y: 10, scale: 0.9, opacity: 1, rotate: 900 }
          : phase === "hit"
          ? { x: 40, y: -5, scale: 1.2, opacity: 1, rotate: 1080 }
          : { x: 40, y: -5, scale: 0, opacity: 0 }
      }
      transition={{
        duration: phase === "approach" ? 0.5 : phase === "incoming" ? 0.4 : 0.15,
        ease: phase === "hit" ? "easeOut" : "easeInOut",
      }}
      className="absolute"
      style={{ bottom: 80, width: 36, height: 36, zIndex: 10 }}
    >
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: `radial-gradient(circle at 35% 30%, 
          hsl(0 65% 58%) 0%, 
          hsl(0 70% 48%) 40%, 
          hsl(0 65% 35%) 75%, 
          hsl(0 55% 25%) 100%)`,
        boxShadow: `
          0 0 25px hsl(0 70% 45% / 0.6), 
          inset -4px -4px 8px rgba(0,0,0,0.4),
          inset 3px 3px 6px rgba(255,150,150,0.2),
          0 4px 8px rgba(0,0,0,0.5)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Seam - stitched line */}
        <div style={{
          position: "absolute", top: "50%", left: "10%", right: "10%",
          height: 2, marginTop: -1,
          background: "hsl(45 90% 75%)",
          boxShadow: "0 0 3px rgba(245,222,179,0.5)",
        }} />
        {/* Cross stitches */}
        {[20, 35, 50, 65, 80].map((pct, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${pct}%`,
            top: "calc(50% - 4px)",
            width: 1, height: 8,
            background: "hsl(45 80% 70% / 0.6)",
            transform: `rotate(${i % 2 === 0 ? 30 : -30}deg)`,
          }} />
        ))}
        {/* Specular highlight */}
        <div style={{
          position: "absolute", top: 5, left: 6,
          width: 10, height: 8, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.35), transparent)",
        }} />
        {/* Secondary highlight */}
        <div style={{
          position: "absolute", top: 8, left: 10,
          width: 4, height: 3, borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
        }} />
      </div>
    </motion.div>
  );
}

export default function StumpHitAnimation({ show, onComplete }: StumpHitAnimationProps) {
  const [phase, setPhase] = useState<"approach" | "incoming" | "hit" | "shatter" | "text" | "done">("approach");

  const sparks = useMemo(() =>
    [...Array(14)].map((_, i) => ({
      angle: (i / 14) * Math.PI * 2,
      dist: 50 + Math.random() * 40,
      size: 3 + Math.random() * 4,
      delay: i * 0.02,
      color: i % 3 === 0 ? "hsl(45 100% 70%)" : i % 3 === 1 ? "hsl(30 90% 60%)" : "hsl(0 70% 55%)",
    })), []);

  const woodChips = useMemo(() =>
    [...Array(10)].map((_, i) => ({
      x: (Math.random() - 0.5) * 120,
      y: -(40 + Math.random() * 80),
      rot: Math.random() * 360,
      size: 4 + Math.random() * 6,
      delay: 0.05 + i * 0.03,
    })), []);

  useEffect(() => {
    if (!show) { setPhase("approach"); return; }
    setPhase("approach");
    const t1 = setTimeout(() => setPhase("incoming"), 600);
    const t2 = setTimeout(() => setPhase("hit"), 1000);
    const t3 = setTimeout(() => setPhase("shatter"), 1200);
    const t4 = setTimeout(() => setPhase("text"), 1600);
    const t5 = setTimeout(() => setPhase("done"), 2800);
    const t6 = setTimeout(onComplete, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); };
  }, [show, onComplete]);

  if (!show) return null;

  const isHit = phase === "hit" || phase === "shatter" || phase === "text";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 50% 60%, hsl(220 15% 8%) 0%, hsl(222 20% 4%) 60%, hsl(225 25% 2%) 100%)" }}
      >
        {/* Stadium lights background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{
            position: "absolute", top: -40, left: "20%", width: 120, height: 120,
            background: "radial-gradient(circle, rgba(255,240,200,0.06), transparent 70%)",
          }} />
          <div style={{
            position: "absolute", top: -30, right: "15%", width: 100, height: 100,
            background: "radial-gradient(circle, rgba(255,240,200,0.04), transparent 70%)",
          }} />
        </div>

        {/* Pitch/ground surface */}
        <div className="absolute" style={{
          bottom: 0, left: 0, right: 0, height: "35%",
          background: "linear-gradient(180deg, hsl(120 25% 18%) 0%, hsl(120 20% 14%) 40%, hsl(120 15% 10%) 100%)",
          borderTop: "2px solid hsl(120 20% 25%)",
        }}>
          {/* Pitch crease lines */}
          <div style={{
            position: "absolute", top: 20, left: "35%", right: "35%", height: 1,
            background: "rgba(255,255,255,0.1)",
          }} />
          <div style={{
            position: "absolute", top: 30, left: "38%", right: "38%", height: 1,
            background: "rgba(255,255,255,0.06)",
          }} />
        </div>

        {/* Main stumps area */}
        <div className="relative" style={{ width: 200, height: 240 }}>
          {/* Three stumps */}
          <WoodenStump x={-24} delay={isHit ? 0 : 99} tiltDir={-1} />
          <WoodenStump x={0} delay={isHit ? 0.05 : 99} tiltDir={-0.3} />
          <WoodenStump x={24} delay={isHit ? 0.03 : 99} tiltDir={1} />

          {/* Bails */}
          {isHit && (
            <>
              <Bail x={-12} dir={-1} delay={0.1} />
              <Bail x={12} dir={1} delay={0.15} />
            </>
          )}

          {/* Cricket ball */}
          <CricketBall phase={phase === "shatter" || phase === "text" ? "hit" : phase === "done" ? "done" : phase} />

          {/* Impact flash */}
          {isHit && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute rounded-full"
              style={{
                bottom: 90, left: "50%", width: 50, height: 50,
                transform: "translateX(-50%)",
                background: "radial-gradient(circle, hsl(45 100% 80%) 0%, hsl(40 90% 60%) 30%, transparent 70%)",
              }}
            />
          )}

          {/* Secondary impact ring */}
          {isHit && (
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="absolute rounded-full"
              style={{
                bottom: 95, left: "50%", width: 30, height: 30,
                transform: "translateX(-50%)",
                border: "2px solid hsl(45 90% 70% / 0.5)",
              }}
            />
          )}

          {/* Sparks */}
          {isHit && sparks.map((s, i) => (
            <motion.div
              key={`spark-${i}`}
              initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos(s.angle) * s.dist,
                y: Math.sin(s.angle) * s.dist - 40,
                scale: 0,
                opacity: 0,
              }}
              transition={{ duration: 0.7, delay: s.delay }}
              className="absolute rounded-full"
              style={{
                bottom: 100, left: "50%",
                width: s.size, height: s.size,
                background: s.color,
                boxShadow: `0 0 8px ${s.color}`,
              }}
            />
          ))}

          {/* Wood chip fragments */}
          {isHit && woodChips.map((c, i) => (
            <motion.div
              key={`chip-${i}`}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: c.x,
                y: [c.y, c.y + 60],
                rotate: c.rot,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.9, delay: c.delay, ease: "easeOut" }}
              className="absolute"
              style={{
                bottom: 120, left: "50%",
                width: c.size, height: c.size * 0.5,
                background: `hsl(${30 + Math.random() * 10} ${40 + Math.random() * 20}% ${35 + Math.random() * 20}%)`,
                borderRadius: "1px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>

        {/* Dust cloud at base */}
        {isHit && (
          <motion.div
            initial={{ scaleX: 0.3, scaleY: 0.3, opacity: 0 }}
            animate={{ scaleX: 2.5, scaleY: 1.2, opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.2, delay: 0.1 }}
            className="absolute"
            style={{
              bottom: "28%", width: 160, height: 40,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(160,140,100,0.4), transparent 70%)",
              filter: "blur(6px)",
            }}
          />
        )}

        {/* HOWZAT text */}
        {(phase === "text") && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -5 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 180 }}
            className="absolute text-center"
            style={{ bottom: "22%" }}
          >
            <div style={{
              fontSize: 48, fontWeight: 900,
              fontFamily: "'Bungee Shade', 'Rubik', sans-serif",
              letterSpacing: "0.08em",
              color: "hsl(45 100% 55%)",
              textShadow: `
                0 4px 0 hsl(35 80% 30%), 
                0 6px 0 hsl(25 70% 20%),
                0 0 40px hsl(45 100% 55% / 0.5),
                0 0 80px hsl(45 100% 55% / 0.2)`,
            }}>
              HOWZAT!
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{
                marginTop: 4,
                height: 3,
                background: "linear-gradient(90deg, transparent, hsl(45 90% 55%), transparent)",
                borderRadius: 2,
              }}
            />
            {/* Cricket emoji */}
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ fontSize: 28, display: "block", marginTop: 8 }}
            >
              🏏
            </motion.span>
          </motion.div>
        )}

        {/* Screen shake simulation via whole-container jitter */}
        {isHit && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ x: [0, -4, 5, -3, 2, 0], y: [0, 3, -4, 2, -1, 0] }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
