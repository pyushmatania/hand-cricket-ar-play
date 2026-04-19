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
      {/* Surreal night atmosphere — transparent so DynamicSky shows through */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {/* Moonbeam halo — soft cool light bathing the island */}
        {unlocked && (
          <>
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 520, height: 420,
                background: `radial-gradient(ellipse, hsla(210,80%,75%,0.18) 0%, hsla(220,70%,65%,0.08) 35%, transparent 70%)`,
                filter: "blur(40px)",
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Accent color halo — subtle arena tint */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 380, height: 280,
                background: `radial-gradient(ellipse, ${activeIsland.accent}18 0%, transparent 65%)`,
                filter: "blur(24px)",
              }}
            />
          </>
        )}

        {/* Twinkling stars right around the island */}
        {Array.from({ length: 14 }).map((_, i) => {
          const seed = i * 37;
          const left = (seed * 7) % 95 + 2;
          const top = (seed * 13) % 70 + 3;
          const size = 1.5 + ((seed * 3) % 20) / 10;
          return (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size, height: size,
                background: "white",
                boxShadow: `0 0 ${size * 3}px white, 0 0 ${size * 6}px hsla(210,100%,80%,0.6)`,
              }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
              transition={{
                duration: 2 + (i % 4) * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i * 0.3) % 3,
              }}
            />
          );
        })}

        {/* Fireflies — warm glowing motes drifting around the island */}
        {Array.from({ length: 12 }).map((_, i) => {
          const startLeft = ((i * 23) % 90) + 5;
          const startTop = ((i * 41) % 60) + 25;
          return (
            <motion.div
              key={`firefly-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${startLeft}%`,
                top: `${startTop}%`,
                width: 3, height: 3,
                background: "hsl(50,100%,75%)",
                boxShadow: "0 0 8px hsl(45,100%,70%), 0 0 16px hsla(40,100%,60%,0.6)",
              }}
              animate={{
                x: [0, 30, -20, 15, 0],
                y: [0, -25, -10, -35, 0],
                opacity: [0, 1, 0.4, 1, 0],
              }}
              transition={{
                duration: 8 + (i % 4),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.6,
              }}
            />
          );
        })}

        {/* Silhouette birds drifting across — V shapes */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`bird-${i}`}
            className="absolute"
            style={{
              top: `${10 + i * 8}%`,
              fontSize: 10 + i * 2,
              color: "hsla(220,30%,75%,0.5)",
              textShadow: "0 0 4px hsla(220,40%,80%,0.3)",
            }}
            animate={{ x: ["-10%", "110%"] }}
            transition={{
              duration: 35 + i * 8,
              repeat: Infinity,
              ease: "linear",
              delay: i * 12,
            }}
          >
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: "inline-block" }}
            >
              ︵
            </motion.span>
          </motion.div>
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

                {/* Island media — animated video for islands that have one, otherwise still image */}
                {unlocked && activeIsland.video ? (
                  <video
                    src={activeIsland.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-[26rem] h-auto max-h-[380px] object-contain rounded-2xl"
                    style={{
                      filter: `drop-shadow(0 20px 50px rgba(0,0,0,0.6)) drop-shadow(0 0 40px ${activeIsland.accent}30)`,
                    }}
                  />
                ) : (
                  <img
                    src={activeIsland.image}
                    alt={activeIsland.name}
                    className="w-[26rem] h-auto max-h-[380px] object-contain drop-shadow-2xl"
                    style={{
                      filter: unlocked
                        ? `drop-shadow(0 20px 50px rgba(0,0,0,0.6)) drop-shadow(0 0 40px ${activeIsland.accent}25)`
                        : "brightness(0.25) grayscale(0.9) drop-shadow(0 16px 40px rgba(0,0,0,0.5))",
                    }}
                  />
                )}

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
