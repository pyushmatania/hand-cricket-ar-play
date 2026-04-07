import { motion } from "framer-motion";

interface Props {
  currentTrophies: number;
  nextTrophies: number;
  arenaName: string;
  nextArenaName: string;
}

export default function CricketProgressBar({ currentTrophies, nextTrophies, arenaName, nextArenaName }: Props) {
  const progress = Math.min(((currentTrophies) / Math.max(nextTrophies, 1)) * 100, 100);

  return (
    <div className="relative mx-4 -mt-1 z-20">
      {/* Arena labels */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-1">
          <span className="text-[10px]">🏟️</span>
          <span className="font-display text-[9px] tracking-wider font-bold" style={{ color: "hsl(142 60% 50%)" }}>
            {arenaName.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-display text-[9px] tracking-wider" style={{ color: "hsl(0 0% 45%)" }}>
            {nextArenaName.toUpperCase()}
          </span>
          <span className="text-[10px]">🔒</span>
        </div>
      </div>

      {/* Main bar — wooden frame with metal fill */}
      <div className="relative h-8 rounded-lg overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(30 45% 18%) 0%, hsl(28 40% 12%) 100%)",
          border: "2px solid hsl(30 30% 25%)",
          boxShadow: "inset 0 3px 8px rgba(0,0,0,0.5), 0 3px 6px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Wood grain bg texture */}
        <div className="absolute inset-0 opacity-8 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 14px, rgba(255,255,255,0.04) 14px, rgba(255,255,255,0.04) 15px)",
          }}
        />

        {/* Glowing green fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="absolute inset-y-0 left-0 rounded-md"
          style={{
            background: "linear-gradient(180deg, hsl(142 70% 50%) 0%, hsl(142 65% 40%) 40%, hsl(142 60% 30%) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 0 14px rgba(74,222,80,0.35), inset 0 -2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {/* Animated shine sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
              width: "40%",
            }}
          />
        </motion.div>

        {/* Wicket icon at fill edge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute top-1/2 -translate-y-1/2 z-10"
          style={{ left: `calc(${Math.min(progress, 96)}% - 8px)` }}
        >
          <div className="flex gap-[1px]">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-[2px] h-5 rounded-sm" style={{
                background: "linear-gradient(180deg, hsl(45 80% 75%) 0%, hsl(35 60% 50%) 100%)",
                boxShadow: "0 0 3px rgba(245,222,179,0.4)",
              }} />
            ))}
          </div>
          {/* Bails */}
          <div className="absolute -top-[1.5px] left-[-1px] w-[8px] h-[2px] rounded-sm" style={{ background: "hsl(45 70% 70%)" }} />
        </motion.div>

        {/* Trophy count center */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">🏆</span>
            <span className="font-display text-[12px] font-black tracking-wider"
              style={{
                color: "rgba(255,255,255,0.95)",
                textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(74,222,80,0.3)",
              }}
            >
              {currentTrophies}
            </span>
            <span className="font-display text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>/</span>
            <span className="font-display text-[10px] tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>
              {nextTrophies}
            </span>
          </div>
        </div>

        {/* Corner metal rivets */}
        {[{ top: 2, left: 3 }, { top: 2, right: 3 }, { bottom: 2, left: 3 }, { bottom: 2, right: 3 }].map((pos, i) => (
          <div key={i} className="absolute w-[4px] h-[4px] rounded-full z-20" style={{
            ...pos,
            background: "radial-gradient(circle at 35% 35%, hsl(45 50% 65%), hsl(35 35% 30%))",
            boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.4)",
          }} />
        ))}
      </div>

      {/* Rotating cricket ball at leading edge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, rotate: [0, 360] }}
        transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, opacity: { delay: 0.8 } }}
        className="absolute -bottom-3 z-20"
        style={{ left: `calc(${Math.min(progress, 94)}% - 2px)` }}
      >
        <div className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at 40% 35%, hsl(0 75% 55%), hsl(0 70% 35%))",
            boxShadow: "0 2px 6px rgba(0,0,0,0.5), 0 0 8px rgba(220,38,38,0.3)",
            border: "1px solid hsl(0 60% 30%)",
          }}
        >
          <div className="w-2 h-[1px] rounded-full" style={{ background: "hsl(45 80% 75%)" }} />
        </div>
      </motion.div>
    </div>
  );
}
