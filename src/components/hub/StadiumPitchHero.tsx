import { motion } from "framer-motion";
import defaultPitchHero from "@/assets/stadiums/default-pitch-hero.jpg";

interface StadiumPitchHeroProps {
  arenaName: string;
  arenaEmoji: string;
  trophies: number;
  nextArenaName: string;
  nextTrophies: number;
  progress: number; // 0-100
}

export default function StadiumPitchHero({
  arenaName,
  arenaEmoji,
  trophies,
  nextArenaName,
  nextTrophies,
  progress,
}: StadiumPitchHeroProps) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 260 }}>
      {/* Stadium image with perspective tilt */}
      <div className="absolute inset-0" style={{ perspective: "800px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
          style={{ transformOrigin: "center bottom", transform: "rotateX(5deg)" }}
        >
          <img
            src={defaultPitchHero}
            alt={arenaName}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.85) contrast(1.1) saturate(1.2)" }}
          />
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to top, #050810 0%, #050810cc 40%, transparent 100%)" }}
      />

      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #050810 0%, transparent 100%)" }}
      />

      {/* Floodlight glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-24 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,248,225,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Arena name badge — scoreboard metal */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="scoreboard-metal px-5 py-2 flex items-center gap-2"
          style={{ borderRadius: 12 }}
        >
          <span className="text-lg">{arenaEmoji}</span>
          <div>
            <span className="font-display text-sm tracking-wider text-neon-gold neon-text-gold uppercase block leading-none">
              {arenaName}
            </span>
            <span className="font-game-title text-[9px] text-muted-foreground tracking-wider block mt-0.5">
              🏆 {trophies}/{nextTrophies} → {nextArenaName}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Progress bar at very bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          className="h-full"
          style={{
            background: "linear-gradient(90deg, hsl(var(--neon-green)), hsl(var(--neon-cyan)))",
            boxShadow: "0 0 12px rgba(74,222,80,0.4)",
          }}
        />
      </div>

      {/* Ambient sparkles */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <motion.div
          key={i}
          animate={{
            y: [0, -40, -80],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut",
          }}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            background: i % 2 === 0 ? "#FFD700" : "#4ADE50",
            left: `${15 + i * 14}%`,
            bottom: "20%",
            boxShadow: `0 0 4px ${i % 2 === 0 ? "#FFD700" : "#4ADE50"}`,
          }}
        />
      ))}
    </div>
  );
}
