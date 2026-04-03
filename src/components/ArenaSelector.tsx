import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { ARENAS, getUnlockedArenas, type Arena } from "@/lib/arenas";
import { RANK_TIERS } from "@/lib/rankTiers";

interface ArenaSelectorProps {
  currentTierIndex: number;
  selectedArenaId: string;
  onSelect: (arena: Arena) => void;
}

export default function ArenaSelector({ currentTierIndex, selectedArenaId, onSelect }: ArenaSelectorProps) {
  const arenas = getUnlockedArenas(currentTierIndex);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-score-gold to-secondary" />
        <span className="font-display text-xs font-black text-foreground tracking-widest uppercase">
          Arena
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {arenas.map((arena, i) => {
          const selected = arena.id === selectedArenaId;
          const tier = RANK_TIERS[arena.unlockTierIndex];

          return (
            <motion.button
              key={arena.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => arena.unlocked && onSelect(arena)}
              disabled={!arena.unlocked}
              className={`
                relative shrink-0 w-28 rounded-xl overflow-hidden border-2 transition-all duration-200
                ${selected ? "border-primary shadow-[0_0_16px_hsl(217_91%_60%/0.3)]" : arena.unlocked ? "border-border/40" : "border-border/20 opacity-60"}
                ${arena.unlocked ? "cursor-pointer active:scale-95" : "cursor-not-allowed"}
              `}
            >
              {/* Background image */}
              <div className="relative h-16 overflow-hidden">
                <img
                  src={arena.image}
                  alt={arena.name}
                  className={`w-full h-full object-cover ${!arena.unlocked ? "blur-sm grayscale" : ""}`}
                  loading="lazy"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />

                {/* Lock overlay */}
                {!arena.unlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50">
                    <Lock className="w-4 h-4 text-muted-foreground mb-0.5" />
                    <span className="text-[8px] text-muted-foreground font-display">
                      {tier.emoji} {tier.name}
                    </span>
                  </div>
                )}

                {/* Selected check */}
                {selected && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[10px] text-primary-foreground font-bold">✓</span>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="px-2 py-1.5 bg-card/80">
                <span className="text-[10px] font-display font-bold text-foreground block leading-tight truncate">
                  {arena.emoji} {arena.name}
                </span>
                <span className="text-[8px] text-muted-foreground leading-none">
                  {arena.subtitle}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
