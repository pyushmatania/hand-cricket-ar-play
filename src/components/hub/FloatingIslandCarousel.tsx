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
    <div className="relative w-full" style={{ height: 340 }}>
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
      <div className="absolute inset-0 overflow-hidden">
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
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                {/* Glow under island */}
                {unlocked && (
                  <div
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-64 h-8 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse, ${activeIsland.accent}25 0%, transparent 70%)`,
                      filter: "blur(8px)",
                    }}
                  />
                )}

                {/* Island image - BIG, no box, no bg */}
                <img
                  src={activeIsland.image}
                  alt={activeIsland.name}
                  className="w-80 h-auto max-h-[280px] object-contain drop-shadow-2xl"
                  style={{
                    filter: unlocked
                      ? `drop-shadow(0 16px 40px rgba(0,0,0,0.5)) drop-shadow(0 0 30px ${activeIsland.accent}20)`
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
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-52 h-5 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)",
                    filter: "blur(6px)",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arena name badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-5 py-2 rounded-full"
          style={{
            background: "linear-gradient(180deg, rgba(30,25,20,0.85) 0%, rgba(15,12,8,0.9) 100%)",
            border: `1.5px solid ${unlocked ? activeIsland.accent + "50" : "rgba(255,255,255,0.1)"}`,
            boxShadow: unlocked ? `0 0 20px ${activeIsland.accent}25` : "none",
          }}
        >
          <span className="text-base">{activeIsland.emoji}</span>
          <span className="font-display text-xs tracking-widest" style={{ color: unlocked ? activeIsland.accent : "#666" }}>
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
                width: i === activeIdx ? 18 : 6,
                height: 6,
                background: i === activeIdx
                  ? (isUnlocked(island) ? island.accent : "#555")
                  : (isUnlocked(island) ? island.accent + "40" : "rgba(255,255,255,0.1)"),
                boxShadow: i === activeIdx && isUnlocked(island) ? `0 0 10px ${island.accent}60` : "none",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
