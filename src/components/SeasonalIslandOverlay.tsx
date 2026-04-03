import { motion } from "framer-motion";
import type { SeasonalTheme } from "@/lib/seasonalThemes";

interface Props {
  theme: SeasonalTheme;
}

/**
 * Renders floating seasonal particles and decorations
 * around the island area. Placed as a sibling overlay.
 */
export default function SeasonalIslandOverlay({ theme }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Tint overlay */}
      <div className="absolute inset-0 rounded-lg" style={{ background: theme.tintColor }} />

      {/* Decorations pinned around island edges */}
      {theme.decorations.map((deco, i) => {
        const positions = [
          { left: "8%", top: "25%" },
          { right: "8%", top: "20%" },
          { left: "15%", bottom: "35%" },
          { right: "12%", bottom: "30%" },
        ];
        const pos = positions[i % positions.length];
        return (
          <motion.div
            key={`${theme.id}-deco-${i}`}
            className="absolute text-lg z-20"
            style={{
              ...pos,
              filter: "drop-shadow(0 2px 4px hsl(0 0% 0% / 0.5))",
            }}
            animate={{
              y: [0, -4, 0],
              rotate: [0, i % 2 === 0 ? 8 : -8, 0],
            }}
            transition={{
              duration: 2.5 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {deco}
          </motion.div>
        );
      })}

      {/* Floating particles */}
      {Array.from({ length: theme.particles.count }).map((_, i) => {
        const startX = 10 + Math.random() * 80;
        const startY = 5 + Math.random() * 70;
        const drift = (Math.random() - 0.5) * 30;
        return (
          <motion.div
            key={`${theme.id}-particle-${i}`}
            className="absolute text-xs z-10"
            style={{
              left: `${startX}%`,
              top: `${startY}%`,
              opacity: 0,
            }}
            animate={{
              y: [0, -30 - Math.random() * 20],
              x: [0, drift],
              opacity: [0, 0.7, 0.5, 0],
              scale: [0.6, 1, 0.8],
            }}
            transition={{
              duration: theme.particles.speed + Math.random() * 2,
              repeat: Infinity,
              delay: i * (theme.particles.speed / theme.particles.count),
              ease: "easeOut",
            }}
          >
            {theme.particles.emoji}
          </motion.div>
        );
      })}
    </div>
  );
}
