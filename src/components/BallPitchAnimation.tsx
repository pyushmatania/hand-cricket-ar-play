/**
 * ═══════════════════════════════════════════════════
 * Doc 3 — Chapter 2: Ball-by-Ball Pitch Animation
 * Top-down pitch view showing ball trajectory
 * with precise ms timings per result type.
 * ═══════════════════════════════════════════════════
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { BallResult } from "@/hooks/useHandCricket";

interface BallPitchAnimationProps {
  lastResult: BallResult | null;
  triggerKey: number;
}

// ── Timing constants (ms) from Doc 3 ──
const TIMINGS = {
  defense:   { approach: 400, impact: 200, result: 600,  total: 1200 },
  single:    { approach: 400, impact: 150, trajectory: 500, total: 1050 },
  double:    { approach: 400, impact: 150, trajectory: 600, total: 1150 },
  triple:    { approach: 400, impact: 150, trajectory: 700, total: 1250 },
  four:      { approach: 500, impact: 200, trajectory: 800, total: 1500 },
  six:       { approach: 500, impact: 250, trajectory: 1200, total: 1950 },
  wicket:    { approach: 600, impact: 300, shatter: 800, total: 1700 },
};

type AnimPhase = "idle" | "approach" | "impact" | "trajectory" | "done";

// ── Color configs ──
const RESULT_COLORS = {
  defense: { ball: "hsl(190 60% 50%)", trail: "hsl(190 40% 40% / 0.3)", impact: "hsl(190 60% 60%)" },
  runs:    { ball: "hsl(142 60% 50%)", trail: "hsl(142 40% 40% / 0.3)", impact: "hsl(142 60% 55%)" },
  four:    { ball: "hsl(43 96% 56%)",  trail: "hsl(43 80% 50% / 0.4)",  impact: "hsl(43 96% 65%)" },
  six:     { ball: "hsl(280 80% 60%)", trail: "hsl(280 60% 50% / 0.4)", impact: "hsl(280 80% 70%)" },
  wicket:  { ball: "hsl(4 90% 55%)",   trail: "hsl(4 70% 45% / 0.4)",   impact: "hsl(4 90% 60%)" },
};

function getResultType(result: BallResult): keyof typeof TIMINGS {
  if (result.runs === "OUT") return "wicket";
  const runs = typeof result.runs === "number" ? result.runs : 0;
  if (runs >= 6) return "six";
  if (runs >= 4) return "four";
  if (runs === 3) return "triple";
  if (runs === 2) return "double";
  if (runs === 1) return "single";
  return "defense";
}

function getColors(type: keyof typeof TIMINGS) {
  if (type === "wicket") return RESULT_COLORS.wicket;
  if (type === "six") return RESULT_COLORS.six;
  if (type === "four") return RESULT_COLORS.four;
  if (type === "defense") return RESULT_COLORS.defense;
  return RESULT_COLORS.runs;
}

// Ball trajectory end positions (relative to pitch, 0-100)
function getTrajectoryEnd(type: keyof typeof TIMINGS): { x: number; y: number } {
  switch (type) {
    case "defense": return { x: 50 + (Math.random() - 0.5) * 10, y: 55 };
    case "single":  return { x: 30 + Math.random() * 40, y: 20 + Math.random() * 15 };
    case "double":  return { x: 15 + Math.random() * 70, y: 10 + Math.random() * 15 };
    case "triple":  return { x: 10 + Math.random() * 80, y: 5 + Math.random() * 10 };
    case "four":    return { x: Math.random() > 0.5 ? 5 : 95, y: 15 + Math.random() * 30 };
    case "six":     return { x: 30 + Math.random() * 40, y: -10 };
    case "wicket":  return { x: 50, y: 60 };
  }
}

export default function BallPitchAnimation({ lastResult, triggerKey }: BallPitchAnimationProps) {
  const [phase, setPhase] = useState<AnimPhase>("idle");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastResult) return;

    const type = getResultType(lastResult);
    const timing = TIMINGS[type];

    setVisible(true);
    setPhase("approach");

    const t1 = setTimeout(() => setPhase("impact"), timing.approach);
    const t2 = setTimeout(() => setPhase("trajectory"), timing.approach + timing.impact);
    const t3 = setTimeout(() => setPhase("done"), timing.total - 200);
    const t4 = setTimeout(() => { setVisible(false); setPhase("idle"); }, timing.total);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [triggerKey, lastResult]);

  if (!lastResult || !visible) return null;

  const type = getResultType(lastResult);
  const colors = getColors(type);
  const timing = TIMINGS[type];
  const endPos = getTrajectoryEnd(type);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={triggerKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[55] pointer-events-none"
          style={{ width: 140, height: 200 }}
        >
          {/* Pitch strip */}
          <div className="relative w-full h-full rounded-lg overflow-hidden" style={{
            background: "linear-gradient(180deg, hsl(100 30% 28%) 0%, hsl(90 25% 32%) 40%, hsl(80 20% 28%) 100%)",
            border: "1.5px solid hsl(100 20% 22%)",
            boxShadow: "0 4px 12px hsl(0 0% 0% / 0.5), inset 0 0 20px hsl(0 0% 0% / 0.2)",
          }}>
            {/* Pitch lines */}
            <div className="absolute inset-x-0 top-[35%] h-px opacity-30" style={{ background: "hsl(45 30% 80%)" }} />
            <div className="absolute inset-x-0 top-[65%] h-px opacity-30" style={{ background: "hsl(45 30% 80%)" }} />
            {/* Crease marks */}
            <div className="absolute left-[25%] right-[25%] top-[30%] h-[2px] opacity-40" style={{ background: "hsl(0 0% 90%)" }} />
            <div className="absolute left-[25%] right-[25%] top-[70%] h-[2px] opacity-40" style={{ background: "hsl(0 0% 90%)" }} />
            {/* Stumps markers */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[28%] flex gap-[3px]">
              {[0,1,2].map(i => (
                <div key={i} className="w-[2px] h-3 rounded-sm" style={{
                  background: type === "wicket" && phase === "trajectory"
                    ? "hsl(4 90% 55%)"
                    : "hsl(35 40% 70%)",
                  boxShadow: type === "wicket" && phase === "trajectory" ? "0 0 4px hsl(4 90% 55%)" : "none",
                }} />
              ))}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-[68%] flex gap-[3px]">
              {[0,1,2].map(i => (
                <div key={i} className="w-[2px] h-3 rounded-sm" style={{ background: "hsl(35 40% 70%)" }} />
              ))}
            </div>

            {/* Ball trail */}
            {(phase === "impact" || phase === "trajectory" || phase === "done") && (
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: (timing.total - timing.approach) / 1000, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <motion.line
                    x1="50" y1="85"
                    x2={endPos.x} y2={Math.max(0, endPos.y)}
                    stroke={colors.trail}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="4 3"
                    initial={{ pathLength: 0, opacity: 0.6 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    transition={{ duration: (timing.total - timing.approach) / 1000 }}
                  />
                </svg>
              </motion.div>
            )}

            {/* The ball */}
            <motion.div
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${colors.impact}, ${colors.ball})`,
                boxShadow: `0 0 8px ${colors.ball}, 0 0 3px ${colors.impact}`,
              }}
              initial={{ left: "50%", top: "85%", x: "-50%", y: "-50%", scale: 0.6, opacity: 0 }}
              animate={
                phase === "approach"
                  ? { left: "50%", top: "60%", scale: 1, opacity: 1 }
                  : phase === "impact"
                    ? { left: "50%", top: "55%", scale: 1.5, opacity: 1 }
                    : phase === "trajectory" || phase === "done"
                      ? { left: `${endPos.x}%`, top: `${Math.max(0, endPos.y)}%`, scale: type === "six" ? 0.3 : 0.8, opacity: type === "six" ? 0 : 0.8 }
                      : {}
              }
              transition={{
                duration:
                  phase === "approach" ? timing.approach / 1000
                  : phase === "impact" ? timing.impact / 1000
                  : (timing.total - timing.approach - timing.impact) / 1000,
                ease: phase === "trajectory" ? "easeOut" : "easeInOut",
              }}
            />

            {/* Impact flash */}
            {(phase === "impact" || phase === "trajectory") && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                style={{ background: colors.impact }}
              />
            )}

            {/* Wicket shatter effect */}
            {type === "wicket" && (phase === "trajectory" || phase === "done") && (
              <>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={`bail-${i}`}
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                    animate={{
                      x: (i - 1) * 15 + Math.random() * 10,
                      y: -20 - Math.random() * 15,
                      rotate: (i - 1) * 45,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute left-1/2 top-[28%] w-[2px] h-2 rounded-sm"
                    style={{ background: "hsl(35 50% 65%)", transformOrigin: "bottom center" }}
                  />
                ))}
              </>
            )}

            {/* Six: ball disappears upward with arc glow */}
            {type === "six" && phase === "trajectory" && (
              <motion.div
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 0.2, y: -40 }}
                transition={{ duration: 0.8 }}
                className="absolute left-1/2 top-[10%] -translate-x-1/2 w-6 h-6 rounded-full"
                style={{ background: `radial-gradient(circle, ${colors.impact}, transparent)` }}
              />
            )}

            {/* Four: boundary flash on edge */}
            {type === "four" && phase === "trajectory" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{
                  background: endPos.x < 50
                    ? "linear-gradient(90deg, hsl(43 96% 56%), transparent 60%)"
                    : "linear-gradient(270deg, hsl(43 96% 56%), transparent 60%)",
                  boxShadow: `0 0 10px ${colors.ball}`,
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
