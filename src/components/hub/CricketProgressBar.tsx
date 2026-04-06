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
    <div className="relative mx-4 -mt-2 z-20">
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="font-display text-[9px] tracking-wider text-muted-foreground">{arenaName}</span>
        <span className="font-display text-[9px] tracking-wider text-muted-foreground">{nextArenaName}</span>
      </div>

      {/* Cricket pitch progress bar */}
      <div className="relative h-7 rounded-lg overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(35 40% 22%) 0%, hsl(30 35% 16%) 100%)",
          border: "1.5px solid hsl(35 30% 25%)",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        {/* Pitch lines pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.15) 18px, rgba(255,255,255,0.15) 19px)",
          }}
        />

        {/* Green pitch fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="absolute inset-y-0 left-0 rounded-lg"
          style={{
            background: "linear-gradient(180deg, hsl(142 60% 45%) 0%, hsl(142 55% 35%) 50%, hsl(142 50% 28%) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 10px rgba(74,222,80,0.3)",
          }}
        >
          {/* Grass texture */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.08) 3px, rgba(255,255,255,0.08) 4px)",
            }}
          />
        </motion.div>

        {/* Stumps at the end of fill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute top-1/2 -translate-y-1/2 z-10 flex gap-[1.5px]"
          style={{ left: `calc(${Math.min(progress, 97)}% - 6px)` }}
        >
          {[0, 1, 2].map(i => (
            <div key={i} className="w-[2px] h-4 rounded-sm" style={{
              background: "linear-gradient(180deg, #f5deb3 0%, #deb887 100%)",
              boxShadow: "0 0 2px rgba(0,0,0,0.5)",
            }} />
          ))}
          {/* Bails */}
          <div className="absolute -top-[2px] left-0 w-[5px] h-[2px] rounded-sm" style={{ background: "#f5deb3" }} />
          <div className="absolute -top-[2px] right-0 w-[5px] h-[2px] rounded-sm" style={{ background: "#f5deb3" }} />
        </motion.div>

        {/* Trophy count */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="font-display text-[11px] font-bold tracking-wider"
            style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
          >
            🏆 {currentTrophies} / {nextTrophies}
          </span>
        </div>
      </div>

      {/* Cricket ball at leading edge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, rotate: [0, 360] }}
        transition={{ rotate: { duration: 3, repeat: Infinity, ease: "linear" }, opacity: { delay: 0.8 } }}
        className="absolute -bottom-2 z-20"
        style={{ left: `calc(${Math.min(progress, 95)}% - 4px)` }}
      >
        <span className="text-[10px]">🏏</span>
      </motion.div>
    </div>
  );
}
