import { motion } from "framer-motion";
import type { Weather } from "@/lib/weather";

interface Props {
  weather: Weather;
}

/**
 * Renders weather visual effects on top of the game arena.
 * Place as a sibling overlay inside the playing UI container.
 */
export default function WeatherOverlay({ weather }: Props) {
  const { visual } = weather;

  if (weather.id === "clear") return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden rounded-xl">
      {/* Ambient color overlay */}
      {visual.ambientOpacity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: visual.overlay,
            opacity: visual.ambientOpacity > 0 ? 1 : 0,
          }}
        />
      )}

      {/* Particles */}
      {visual.particleCount > 0 &&
        Array.from({ length: visual.particleCount }).map((_, i) => {
          const startX = Math.random() * 100;
          const startY = -5 - Math.random() * 10;
          const isDiagonal = visual.particleDirection === "diagonal";
          const isFloat = visual.particleDirection === "float";

          return (
            <motion.div
              key={`weather-p-${i}`}
              className="absolute text-[8px]"
              style={{
                left: `${startX}%`,
                top: isFloat ? `${20 + Math.random() * 60}%` : `${startY}%`,
                opacity: 0,
              }}
              animate={
                isFloat
                  ? {
                      y: [0, -8, 0, 6, 0],
                      x: [0, (Math.random() - 0.5) * 20, 0],
                      opacity: [0, 0.6, 0.4, 0.6, 0],
                    }
                  : {
                      y: [0, 400],
                      x: isDiagonal ? [0, 40 + Math.random() * 30] : [0, (Math.random() - 0.5) * 10],
                      opacity: [0, 0.5, 0.4, 0],
                    }
              }
              transition={{
                duration: visual.particleSpeed + Math.random() * 1.5,
                repeat: Infinity,
                delay: i * (visual.particleSpeed / visual.particleCount),
                ease: isFloat ? "easeInOut" : "linear",
              }}
            >
              {visual.particleEmoji}
            </motion.div>
          );
        })}

      {/* Weather indicator badge */}
      <div
        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg z-10"
        style={{
          background: "hsl(0 0% 0% / 0.45)",
          border: "1px solid hsl(220 10% 30% / 0.3)",
          backdropFilter: "blur(4px)",
        }}
      >
        <span className="text-xs">{weather.icon}</span>
        <span className="font-display text-[7px] font-bold text-foreground/70 tracking-wider">
          {weather.name.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
