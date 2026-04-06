import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import ScrollHint from "@/components/shared/ScrollHint";
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
        <div className="w-1.5 h-5 rounded-sm"
          style={{ background: "linear-gradient(180deg, hsl(43 90% 55%) 0%, hsl(35 60% 35%) 100%)" }}
        />
        <span className="font-display text-[10px] tracking-[0.2em] text-foreground uppercase">
          Arena
        </span>
      </div>

      <ScrollHint>
        <div className="flex gap-2.5 pb-2">
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
                className="relative shrink-0 w-28 overflow-hidden"
                style={{
                  borderRadius: "14px",
                  border: selected
                    ? "2.5px solid hsl(43 90% 55%)"
                    : arena.unlocked
                      ? "2px solid hsl(220 15% 20%)"
                      : "2px solid hsl(220 15% 14%)",
                  boxShadow: selected
                    ? "0 0 18px hsl(43 90% 50% / 0.35), 0 4px 0 hsl(220 12% 8%)"
                    : "0 4px 0 hsl(220 18% 6%)",
                  opacity: arena.unlocked ? 1 : 0.55,
                  cursor: arena.unlocked ? "pointer" : "not-allowed",
                }}
              >
                {/* Background image */}
                <div className="relative h-16 overflow-hidden">
                  <img
                    src={arena.image}
                    alt={arena.name}
                    className={`w-full h-full object-cover ${!arena.unlocked ? "blur-sm grayscale" : ""}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, transparent 30%, hsl(220 15% 6% / 0.9) 100%)" }}
                  />

                  {!arena.unlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ background: "hsl(220 12% 8% / 0.6)" }}
                    >
                      <Lock className="w-4 h-4 text-muted-foreground mb-0.5" />
                      <span className="text-[8px] text-muted-foreground font-display">
                        {tier.emoji} {tier.name}
                      </span>
                    </div>
                  )}

                  {selected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(180deg, hsl(43 90% 55%) 0%, hsl(35 70% 40%) 100%)",
                        boxShadow: "0 2px 0 hsl(35 50% 25%)",
                      }}
                    >
                      <span className="text-[10px] font-bold" style={{ color: "hsl(220 18% 6%)" }}>✓</span>
                    </div>
                  )}
                </div>

                {/* Label - Stadium Concrete */}
                <div className="px-2 py-1.5"
                  style={{ background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 9%) 100%)" }}
                >
                  <span className="text-[10px] font-display font-bold text-foreground block leading-tight truncate">
                    {arena.emoji} {arena.name}
                  </span>
                  <span className="text-[8px] text-muted-foreground leading-none font-body">
                    {arena.subtitle}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </ScrollHint>
    </div>
  );
}
