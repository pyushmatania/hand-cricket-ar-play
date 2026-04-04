import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { isLowEndDevice } from "@/lib/performanceUtils";

interface ArenaParticlesProps {
  arenaId?: string;
}

interface ParticleConfig {
  count: number;
  colors: string[];
  sizes: [number, number]; // min, max
  speedRange: [number, number]; // duration min, max
  drift: number; // horizontal sway
  opacity: [number, number];
  shapes: ("circle" | "square" | "line")[];
  blur?: number;
  direction: "up" | "down" | "mixed";
}

const ARENA_PARTICLES: Record<string, ParticleConfig> = {
  school: {
    count: 14,
    colors: ["hsl(0 0% 95%)", "hsl(50 60% 90%)", "hsl(200 20% 85%)"],
    sizes: [2, 6],
    speedRange: [6, 14],
    drift: 30,
    opacity: [0.15, 0.4],
    shapes: ["circle", "square"],
    blur: 1,
    direction: "down",
  },
  rooftop: {
    count: 10,
    colors: ["hsl(30 40% 70%)", "hsl(0 0% 80%)", "hsl(45 30% 60%)"],
    sizes: [1, 3],
    speedRange: [4, 8],
    drift: 60,
    opacity: [0.1, 0.25],
    shapes: ["circle"],
    blur: 0.5,
    direction: "mixed",
  },
  street: {
    count: 8,
    colors: ["hsl(30 50% 60%)", "hsl(25 40% 50%)", "hsl(0 0% 70%)"],
    sizes: [1, 4],
    speedRange: [5, 12],
    drift: 40,
    opacity: [0.08, 0.2],
    shapes: ["circle", "square"],
    blur: 1,
    direction: "mixed",
  },
  beach: {
    count: 18,
    colors: ["hsl(45 80% 75%)", "hsl(40 70% 65%)", "hsl(30 60% 80%)"],
    sizes: [1, 5],
    speedRange: [3, 9],
    drift: 50,
    opacity: [0.15, 0.35],
    shapes: ["circle"],
    blur: 0.5,
    direction: "up",
  },
  ipl: {
    count: 12,
    colors: ["hsl(45 93% 58%)", "hsl(0 0% 100%)", "hsl(217 91% 60%)"],
    sizes: [2, 5],
    speedRange: [5, 10],
    drift: 25,
    opacity: [0.1, 0.3],
    shapes: ["circle", "square"],
    blur: 0,
    direction: "down",
  },
  worldcup: {
    count: 24,
    colors: [
      "hsl(0 84% 60%)", "hsl(45 93% 58%)", "hsl(217 91% 60%)",
      "hsl(142 71% 45%)", "hsl(280 70% 55%)", "hsl(0 0% 100%)",
    ],
    sizes: [3, 8],
    speedRange: [4, 12],
    drift: 70,
    opacity: [0.2, 0.5],
    shapes: ["square", "line"],
    blur: 0,
    direction: "down",
  },
};

function ArenaParticles({ arenaId }: ArenaParticlesProps) {
  const config = arenaId ? ARENA_PARTICLES[arenaId] : null;

  const particles = useMemo(() => {
    if (!config) return [];
    return Array.from({ length: config.count }, (_, i) => {
      const size = config.sizes[0] + Math.random() * (config.sizes[1] - config.sizes[0]);
      const color = config.colors[Math.floor(Math.random() * config.colors.length)];
      const shape = config.shapes[Math.floor(Math.random() * config.shapes.length)];
      const duration = config.speedRange[0] + Math.random() * (config.speedRange[1] - config.speedRange[0]);
      const delay = Math.random() * duration;
      const startX = Math.random() * 100;
      const opacity = config.opacity[0] + Math.random() * (config.opacity[1] - config.opacity[0]);
      const driftX = (Math.random() - 0.5) * config.drift;

      const goesUp = config.direction === "up" || (config.direction === "mixed" && Math.random() > 0.5);

      return { i, size, color, shape, duration, delay, startX, opacity, driftX, goesUp, blur: config.blur ?? 0 };
    });
  }, [config]);

  if (!config || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.i}
          initial={{
            x: `${p.startX}vw`,
            y: p.goesUp ? "110vh" : "-5vh",
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            x: [`${p.startX}vw`, `${p.startX + p.driftX / 2}vw`, `${p.startX + p.driftX}vw`],
            y: p.goesUp ? ["110vh", "50vh", "-5vh"] : ["-5vh", "50vh", "110vh"],
            opacity: [0, p.opacity, 0],
            rotate: p.shape === "line" ? [0, 360] : [0, p.shape === "square" ? 180 : 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute"
          style={{
            width: p.shape === "line" ? p.size * 3 : p.size,
            height: p.shape === "line" ? 2 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "line" ? 1 : 1,
            filter: p.blur ? `blur(${p.blur}px)` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export default memo(ArenaParticles);
