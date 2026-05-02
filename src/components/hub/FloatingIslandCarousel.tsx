import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ARENA_ISLANDS, type ArenaIsland } from "@/assets/islands";


interface Props {
  currentTrophies: number;
}

export default function FloatingIslandCarousel({ currentTrophies }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(0);

  const isUnlocked = (island: ArenaIsland) => currentTrophies >= island.trophiesRequired;
  const activeIsland = ARENA_ISLANDS[activeIdx];
  const unlocked = isUnlocked(activeIsland);

  const swipe = (dir: number) => {
    setDirection(dir);
    setActiveIdx((prev) => {
      const next = prev + dir;
      if (next < 0) return ARENA_ISLANDS.length - 1;
      if (next >= ARENA_ISLANDS.length) return 0;
      return next;
    });
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -50) swipe(1);
    else if (info.offset.x > 50) swipe(-1);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.7 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.7 }),
  };

  return (
    <div className="relative w-full" style={{ height: 420 }}>
      {/* Atmospheric background layers — fill the black space */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Distant mountain silhouette */}
        <div
          className="absolute left-0 right-0 bottom-16 h-32 opacity-30"
          style={{
            background: `radial-gradient(ellipse at 30% 100%, ${activeIsland.accent}25 0%, transparent 60%), radial-gradient(ellipse at 75% 100%, ${activeIsland.accent}20 0%, transparent 55%)`,
            filter: "blur(20px)",
          }}
        />
        {/* Drifting cloud 1 */}
        <motion.div
          className="absolute"
          style={{
            top: "18%", width: 180, height: 60,
            background: "radial-gradient(ellipse, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 40%, transparent 75%)",
            filter: "blur(12px)",
          }}
          animate={{ x: ["-20%", "120%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
        {/* Drifting cloud 2 */}
        <motion.div
          className="absolute"
          style={{
            top: "55%", width: 220, height: 70,
            background: "radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 45%, transparent 75%)",
            filter: "blur(14px)",
          }}
          animate={{ x: ["110%", "-25%"] }}
          transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
        />
        {/* Drifting cloud 3 - small, top right */}
        <motion.div
          className="absolute"
          style={{
            top: "8%", width: 120, height: 40,
            background: "radial-gradient(ellipse, rgba(255,255,255,0.07) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
          animate={{ x: ["10%", "90%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 4 }}
        />
        {/* Soft accent halo behind island */}
        {unlocked && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 480, height: 360,
              background: `radial-gradient(ellipse, ${activeIsland.accent}22 0%, ${activeIsland.accent}08 40%, transparent 70%)`,
              filter: "blur(30px)",
            }}
          />
        )}
        {/* Faint floating particles / dust motes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`mote-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${(i * 13 + 7) % 90 + 5}%`,
              top: `${(i * 19 + 12) % 80 + 10}%`,
              width: 2.5, height: 2.5,
              background: `${activeIsland.accent}80`,
              boxShadow: `0 0 6px ${activeIsland.accent}`,
            }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Swipe arrows */}
      <button
        onClick={() => swipe(-1)}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 flex items-center justify-center rounded-full"
        style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <span className="text-white/80 text-lg font-bold">‹</span>
      </button>
      <button
        onClick={() => swipe(1)}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 flex items-center justify-center rounded-full"
        style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <span className="text-white/80 text-lg font-bold">›</span>
      </button>

      {/* Floating island */}
      <div className="absolute inset-0 overflow-visible">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeIdx}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative">
              {/* Float animation */}
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                {/* Glow under island */}
                {unlocked && (
                  <div
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-80 h-10 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse, ${activeIsland.accent}30 0%, transparent 70%)`,
                      filter: "blur(10px)",
                    }}
                  />
                )}

                {/* Island — transparent 3D PNG asset */}
                <img
                  src={activeIsland.image}
                  alt={activeIsland.name}
                  width={1024}
                  height={1024}
                  className="w-[26rem] h-auto max-h-[380px] object-contain drop-shadow-2xl"
                  style={{
                    filter: unlocked
                      ? `drop-shadow(0 20px 50px rgba(0,0,0,0.6)) drop-shadow(0 0 40px ${activeIsland.accent}25)`
                      : "brightness(0.25) grayscale(0.9) drop-shadow(0 16px 40px rgba(0,0,0,0.5))",
                  }}
                />

                {/* Lock overlay for locked islands */}
                {!unlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-5xl drop-shadow-lg">🔒</span>
                    </motion.div>
                    <span className="font-display text-xs text-white/70 mt-2 tracking-wider drop-shadow-md">
                      {activeIsland.unlockLabel}
                    </span>
                  </div>
                )}

                {/* Floating shadow on "ground" */}
                <div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-6 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)",
                    filter: "blur(8px)",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arena name banner — wooden plank style */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, scale: 0.8, rotateX: 30 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative flex items-center gap-2.5 px-6 py-2.5"
          style={{
            background: "linear-gradient(180deg, hsl(30 50% 32%) 0%, hsl(28 45% 22%) 40%, hsl(25 40% 16%) 100%)",
            border: "2px solid hsl(30 35% 28%)",
            borderRadius: "6px",
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.08),
              inset 0 -2px 4px rgba(0,0,0,0.4),
              0 4px 12px rgba(0,0,0,0.6),
              ${unlocked ? `0 0 20px ${activeIsland.accent}30` : "none"}
            `,
          }}
        >
          {/* Wood grain texture */}
          <div className="absolute inset-0 rounded-[4px] opacity-10 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.06) 8px, rgba(255,255,255,0.06) 9px)",
            }}
          />
          {/* Corner rivets */}
          {[{ top: 3, left: 3 }, { top: 3, right: 3 }, { bottom: 3, left: 3 }, { bottom: 3, right: 3 }].map((pos, i) => (
            <div key={i} className="absolute w-[5px] h-[5px] rounded-full" style={{
              ...pos,
              background: "radial-gradient(circle at 35% 35%, hsl(45 60% 65%), hsl(35 40% 30%))",
              boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.4), 0 0 2px rgba(0,0,0,0.3)",
            }} />
          ))}
          <span className="text-lg relative z-10 drop-shadow-md">{activeIsland.emoji}</span>
          <span className="font-display text-xs tracking-[0.2em] font-bold relative z-10" style={{
            color: unlocked ? activeIsland.accent : "#666",
            textShadow: unlocked ? `0 0 8px ${activeIsland.accent}40, 0 1px 2px rgba(0,0,0,0.8)` : "0 1px 2px rgba(0,0,0,0.6)",
          }}>
            {activeIsland.name.toUpperCase()}
          </span>
          {/* Arena level chip */}
          {unlocked && (
            <div className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider relative z-10"
              style={{
                background: `linear-gradient(180deg, ${activeIsland.accent}30, ${activeIsland.accent}15)`,
                border: `1px solid ${activeIsland.accent}40`,
                color: activeIsland.accent,
              }}
            >
              ✓
            </div>
          )}
        </motion.div>
      </div>

      {/* Dot indicators — shield pips */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {ARENA_ISLANDS.map((island, i) => (
          <button key={i} onClick={() => { setDirection(i > activeIdx ? 1 : -1); setActiveIdx(i); }}>
            <motion.div
              animate={i === activeIdx ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="transition-all duration-300"
              style={{
                width: i === activeIdx ? 20 : 8,
                height: 8,
                borderRadius: i === activeIdx ? 4 : "50%",
                background: i === activeIdx
                  ? `linear-gradient(90deg, ${isUnlocked(island) ? island.accent : "#555"}, ${isUnlocked(island) ? island.accent + "AA" : "#444"})`
                  : (isUnlocked(island) ? island.accent + "40" : "rgba(255,255,255,0.1)"),
                border: i === activeIdx ? `1px solid ${isUnlocked(island) ? island.accent : "#666"}` : "1px solid transparent",
                boxShadow: i === activeIdx && isUnlocked(island) ? `0 0 10px ${island.accent}60, 0 2px 4px rgba(0,0,0,0.4)` : "none",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
