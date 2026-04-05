import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BallResult, GameResult } from "@/hooks/useHandCricket";

interface CelebrationEffectsProps {
  lastResult: BallResult | null;
  gameResult: GameResult;
  phase: string;
  batSkin?: string | null;
}

type EffectType = "none" | "four" | "six" | "wicket" | "win";

/* ── Per-skin particle configs ── */
interface SkinParticle {
  colors: string[];
  shapes: ("circle" | "star" | "shard" | "flame" | "snowflake")[];
  count: number;
  glow: string;
  radialColor: string;
}

const SKIN_EFFECTS: Record<string, SkinParticle> = {
  "Golden Blade": {
    colors: ["hsl(45 93% 58%)", "hsl(35 85% 50%)", "hsl(50 100% 70%)", "hsl(40 90% 55%)"],
    shapes: ["star", "circle"],
    count: 18,
    glow: "hsl(45 93% 58% / 0.5)",
    radialColor: "hsl(45 93% 58% / 0.25)",
  },
  "Ice Shard": {
    colors: ["hsl(192 91% 70%)", "hsl(210 80% 65%)", "hsl(200 95% 80%)", "hsl(180 80% 60%)"],
    shapes: ["snowflake", "shard"],
    count: 16,
    glow: "hsl(192 91% 60% / 0.4)",
    radialColor: "hsl(192 91% 60% / 0.2)",
  },
  "Inferno Blade": {
    colors: ["hsl(0 84% 55%)", "hsl(30 90% 50%)", "hsl(15 95% 60%)", "hsl(45 100% 55%)"],
    shapes: ["flame", "circle"],
    count: 20,
    glow: "hsl(0 84% 55% / 0.5)",
    radialColor: "hsl(0 84% 55% / 0.25)",
  },
  "Neon Strike": {
    colors: ["hsl(142 71% 55%)", "hsl(160 60% 50%)", "hsl(120 80% 60%)", "hsl(180 70% 55%)"],
    shapes: ["circle", "star"],
    count: 14,
    glow: "hsl(142 71% 45% / 0.4)",
    radialColor: "hsl(142 71% 45% / 0.2)",
  },
  "Thunder Bat": {
    colors: ["hsl(270 70% 65%)", "hsl(217 91% 60%)", "hsl(250 80% 70%)", "hsl(0 0% 100%)"],
    shapes: ["shard", "star"],
    count: 16,
    glow: "hsl(270 70% 55% / 0.45)",
    radialColor: "hsl(270 70% 55% / 0.2)",
  },
  "Diamond Crusher": {
    colors: ["hsl(192 91% 75%)", "hsl(280 70% 65%)", "hsl(0 0% 100%)", "hsl(210 60% 70%)"],
    shapes: ["shard", "star"],
    count: 18,
    glow: "hsl(192 91% 60% / 0.4)",
    radialColor: "hsl(192 91% 60% / 0.2)",
  },
  "Shadow Reaper": {
    colors: ["hsl(270 50% 50%)", "hsl(300 40% 40%)", "hsl(0 0% 30%)", "hsl(270 30% 60%)"],
    shapes: ["shard", "circle"],
    count: 14,
    glow: "hsl(270 50% 40% / 0.5)",
    radialColor: "hsl(270 50% 30% / 0.3)",
  },
};

const SHAPE_CHARS: Record<string, string> = {
  circle: "●",
  star: "✦",
  shard: "◆",
  flame: "🔥",
  snowflake: "❄",
};

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  shape: string;
  size: number;
  angle: number;
  distance: number;
  delay: number;
  rotation: number;
}

function generateParticles(config: SkinParticle): Particle[] {
  return Array.from({ length: config.count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20,
    y: 45 + (Math.random() - 0.5) * 15,
    color: config.colors[i % config.colors.length],
    shape: SHAPE_CHARS[config.shapes[i % config.shapes.length]],
    size: 10 + Math.random() * 14,
    angle: (360 / config.count) * i + (Math.random() - 0.5) * 30,
    distance: 80 + Math.random() * 160,
    delay: Math.random() * 0.3,
    rotation: Math.random() * 360,
  }));
}

export default function CelebrationEffects({ lastResult, gameResult, phase, batSkin }: CelebrationEffectsProps) {
  const [effectType, setEffectType] = useState<EffectType>("none");
  const [particles, setParticles] = useState<Particle[]>([]);
  const skinEffect = batSkin ? SKIN_EFFECTS[batSkin] : null;

  useEffect(() => {
    if (!lastResult) return;

    if (lastResult.runs === "OUT") {
      setEffectType("wicket");
      setTimeout(() => setEffectType("none"), 1800);
    } else if (typeof lastResult.runs === "number") {
      const absRuns = Math.abs(lastResult.runs);
      if (absRuns === 6) {
        setEffectType("six");
        if (skinEffect) setParticles(generateParticles(skinEffect));
        setTimeout(() => setEffectType("none"), 2000);
      } else if (absRuns === 4) {
        setEffectType("four");
        if (skinEffect) setParticles(generateParticles({ ...skinEffect, count: Math.floor(skinEffect.count * 0.6) }));
        setTimeout(() => setEffectType("none"), 1500);
      }
    }
  }, [lastResult, skinEffect]);

  useEffect(() => {
    if (phase === "finished" && gameResult === "win") {
      setEffectType("win");
      setTimeout(() => setEffectType("none"), 3500);
    }
  }, [phase, gameResult]);

  const isBoundary = effectType === "six" || effectType === "four";

  return (
    <>
      {/* Color flash overlay — skin-tinted on boundaries */}
      <AnimatePresence>
        {effectType !== "none" && (
          <motion.div
            key={effectType + (skinEffect ? "-skin" : "")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{
              background:
                effectType === "wicket"
                  ? "radial-gradient(circle at center, hsl(0 72% 51% / 0.25), transparent 70%)"
                  : isBoundary && skinEffect
                  ? `radial-gradient(circle at center, ${skinEffect.radialColor}, transparent 70%)`
                  : effectType === "six"
                  ? "radial-gradient(circle at center, hsl(217 91% 60% / 0.2), transparent 70%)"
                  : effectType === "four"
                  ? "radial-gradient(circle at center, hsl(45 93% 58% / 0.2), transparent 70%)"
                  : "radial-gradient(circle at center, hsl(45 93% 58% / 0.15), transparent 70%)"
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Bat skin particle burst on boundaries ── */}
      <AnimatePresence>
        {isBoundary && skinEffect && particles.length > 0 && (
          <motion.div
            key={"skin-burst-" + effectType}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[52] pointer-events-none overflow-hidden"
          >
            {/* Central glow pulse */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.3, 2.5], opacity: [0.6, 0] }}
              transition={{ duration: 1 }}
              className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
              style={{ boxShadow: `0 0 60px 30px ${skinEffect.glow}` }}
            />

            {/* Burst particles */}
            {particles.map((p) => {
              const radians = (p.angle * Math.PI) / 180;
              const tx = Math.cos(radians) * p.distance;
              const ty = Math.sin(radians) * p.distance;
              return (
                <motion.div
                  key={p.id}
                  initial={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    scale: 0,
                    opacity: 1,
                    rotate: 0,
                  }}
                  animate={{
                    x: tx,
                    y: ty,
                    scale: [0, 1.3, 0.8, 0],
                    opacity: [0, 1, 0.8, 0],
                    rotate: p.rotation,
                  }}
                  transition={{
                    duration: effectType === "six" ? 1.4 : 1,
                    delay: p.delay,
                    ease: "easeOut",
                  }}
                  className="absolute"
                  style={{
                    color: p.color,
                    fontSize: p.size,
                    textShadow: `0 0 8px ${p.color}`,
                    filter: `drop-shadow(0 0 4px ${p.color})`,
                  }}
                >
                  {p.shape}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big text overlays */}
      <AnimatePresence>
        {effectType === "six" && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1.6, times: [0, 0.3, 1] }}
            className="fixed inset-0 z-[53] pointer-events-none flex items-center justify-center"
          >
            <div className="text-center">
              <span
                className="font-display text-8xl font-black text-primary block"
                style={{
                  textShadow: skinEffect
                    ? `0 0 60px ${skinEffect.glow}`
                    : "0 0 60px hsl(217 91% 60% / 0.6)",
                  color: skinEffect ? skinEffect.colors[0] : undefined,
                }}
              >
                6
              </span>
              <span
                className="font-display text-lg font-bold tracking-[0.4em]"
                style={{ color: skinEffect ? skinEffect.colors[1] : undefined, opacity: 0.8 }}
              >
                MAXIMUM
              </span>
            </div>
          </motion.div>
        )}

        {effectType === "four" && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.1, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1.3, times: [0, 0.3, 1] }}
            className="fixed inset-0 z-[53] pointer-events-none flex items-center justify-center"
          >
            <div className="text-center">
              <span
                className="font-display text-7xl font-black text-secondary block"
                style={{
                  textShadow: skinEffect
                    ? `0 0 50px ${skinEffect.glow}`
                    : "0 0 50px hsl(45 93% 58% / 0.6)",
                  color: skinEffect ? skinEffect.colors[0] : undefined,
                }}
              >
                4
              </span>
              <span
                className="font-display text-sm font-bold tracking-[0.4em]"
                style={{ color: skinEffect ? skinEffect.colors[1] : undefined, opacity: 0.8 }}
              >
                BOUNDARY
              </span>
            </div>
          </motion.div>
        )}

        {effectType === "wicket" && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, times: [0, 0.25, 1] }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <div className="text-center">
              <span
                className="font-display text-7xl font-black text-out-red block"
                style={{ textShadow: "0 0 50px hsl(0 72% 51% / 0.6)" }}
              >
                OUT
              </span>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="h-0.5 bg-out-red/40 rounded-full mt-2 mx-auto"
                style={{ width: 120 }}
              />
            </div>
          </motion.div>
        )}

        {effectType === "win" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            {[0, 1, 2].map(ring => (
              <motion.div
                key={ring}
                initial={{ scale: 0.5, opacity: 0.5 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 2, delay: ring * 0.5, repeat: 1, ease: "easeOut" }}
                className="absolute w-24 h-24 rounded-full border border-secondary/30"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
