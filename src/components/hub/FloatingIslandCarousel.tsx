import { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ARENA_ISLANDS, type ArenaIsland } from "@/assets/islands";

interface Props {
  currentTrophies: number;
}

export default function FloatingIslandCarousel({ currentTrophies }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

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
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0, scale: 0.85 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0, scale: 0.85 }),
  };

  return (
    <div className="relative w-full" style={{ height: 280 }}>
      {/* Sky gradient background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, hsl(210 40% 20%) 0%, hsl(220 30% 12%) 60%, hsl(220 20% 8%) 100%)",
      }} />

      {/* Clouds */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: 80 + i * 40,
            height: 20 + i * 5,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            top: `${15 + i * 20}%`,
            left: `${10 + i * 30}%`,
            filter: "blur(8px)",
          }}
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Swipe arrows */}
      <button
        onClick={() => swipe(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-full"
        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <span className="text-white/70 text-sm">‹</span>
      </button>
      <button
        onClick={() => swipe(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-full"
        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <span className="text-white/70 text-sm">›</span>
      </button>

      {/* Floating island */}
      <div ref={constraintsRef} className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeIdx}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative">
              {/* Float animation */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Island image */}
                <img
                  src={activeIsland.image}
                  alt={activeIsland.name}
                  className="w-72 h-44 object-cover rounded-2xl"
                  style={{
                    filter: unlocked
                      ? `drop-shadow(0 12px 30px rgba(0,0,0,0.6)) drop-shadow(0 0 20px ${activeIsland.accent}30)`
                      : "brightness(0.3) grayscale(0.8) drop-shadow(0 12px 30px rgba(0,0,0,0.6))",
                  }}
                />

                {/* Lock overlay for locked islands */}
                {!unlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-4xl">🔒</span>
                    </motion.div>
                    <span className="font-display text-[10px] text-white/60 mt-1 tracking-wider">
                      {activeIsland.unlockLabel}
                    </span>
                  </div>
                )}

                {/* Island shadow on ground */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-4 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)", filter: "blur(4px)" }}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arena name badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{
            background: "linear-gradient(180deg, rgba(30,25,20,0.9) 0%, rgba(15,12,8,0.95) 100%)",
            border: `1.5px solid ${unlocked ? activeIsland.accent + "50" : "rgba(255,255,255,0.1)"}`,
            boxShadow: unlocked ? `0 0 16px ${activeIsland.accent}20` : "none",
          }}
        >
          <span className="text-sm">{activeIsland.emoji}</span>
          <span className="font-display text-xs tracking-wider" style={{ color: unlocked ? activeIsland.accent : "#666" }}>
            {activeIsland.name.toUpperCase()}
          </span>
        </motion.div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {ARENA_ISLANDS.map((island, i) => (
          <button key={i} onClick={() => { setDirection(i > activeIdx ? 1 : -1); setActiveIdx(i); }}>
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeIdx ? 16 : 6,
                height: 6,
                background: i === activeIdx
                  ? (isUnlocked(island) ? island.accent : "#555")
                  : (isUnlocked(island) ? island.accent + "40" : "rgba(255,255,255,0.1)"),
                boxShadow: i === activeIdx && isUnlocked(island) ? `0 0 8px ${island.accent}60` : "none",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
