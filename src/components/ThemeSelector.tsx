import { motion } from "framer-motion";
import { Lock, Users, Cloud, Mic } from "lucide-react";
import ScrollHint from "@/components/shared/ScrollHint";
import { MATCH_THEMES, getThemesForTier, type MatchTheme } from "@/lib/matchThemes";

/** Surface → emoji map */
const SURFACE_EMOJI: Record<string, string> = {
  concrete: "🧱", dirt: "🟤", carpet: "🟫", grass: "🌿",
  turf: "🏟️", sand: "🏖️", rooftop: "🏢", mat: "🟩", astroturf: "⚽",
};

/** Crowd size → label */
function crowdLabel(count: number): string {
  if (count <= 15) return `${count} people`;
  if (count <= 100) return `~${count}`;
  if (count < 10000) return `${(count / 1000).toFixed(1)}K`;
  return `${Math.round(count / 1000)}K`;
}

/** Commentary tone → color */
const TONE_COLOR: Record<string, string> = {
  casual: "hsl(190 60% 50%)",
  friendly: "hsl(142 60% 45%)",
  professional: "hsl(217 60% 55%)",
  hype: "hsl(4 70% 55%)",
  reverent: "hsl(43 90% 55%)",
};

interface ThemeSelectorProps {
  currentTierIndex: number;
  selectedThemeId: string;
  onSelect: (theme: MatchTheme) => void;
}

export default function ThemeSelector({ currentTierIndex, selectedThemeId, onSelect }: ThemeSelectorProps) {
  const unlocked = getThemesForTier(currentTierIndex);
  const unlockedIds = new Set(unlocked.map(t => t.id));

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-5 rounded-sm"
          style={{ background: "linear-gradient(180deg, hsl(43 90% 55%) 0%, hsl(35 60% 35%) 100%)" }}
        />
        <span className="font-display text-[10px] tracking-[0.2em] text-foreground uppercase">
          Match Theme
        </span>
        <span className="text-[8px] text-muted-foreground ml-auto font-body">
          {unlocked.length}/{MATCH_THEMES.length} unlocked
        </span>
      </div>

      <ScrollHint>
        <div className="flex gap-2.5 pb-2">
          {MATCH_THEMES.map((theme, i) => {
            const isUnlocked = unlockedIds.has(theme.id);
            const selected = theme.id === selectedThemeId;

            return (
              <motion.button
                key={theme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => isUnlocked && onSelect(theme)}
                disabled={!isUnlocked}
                className="relative shrink-0 w-[140px] overflow-hidden text-left"
                style={{
                  borderRadius: "14px",
                  border: selected
                    ? "2.5px solid hsl(43 90% 55%)"
                    : isUnlocked
                      ? "2px solid hsl(220 15% 20%)"
                      : "2px solid hsl(220 15% 14%)",
                  boxShadow: selected
                    ? "0 0 18px hsl(43 90% 50% / 0.35), 0 5px 0 hsl(220 12% 8%)"
                    : "0 5px 0 hsl(220 18% 6%)",
                  opacity: isUnlocked ? 1 : 0.5,
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                }}
              >
                {/* Top color bar showing ground surface */}
                <div className="relative h-10 overflow-hidden" style={{
                  background: `linear-gradient(135deg, ${theme.ground.color} 0%, ${theme.ground.outfield} 100%)`,
                }}>
                  {/* Grass texture lines */}
                  {theme.ground.hasGrass && (
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 3px, hsl(120 40% 25% / 0.4) 3px, hsl(120 40% 25% / 0.4) 4px)",
                    }} />
                  )}
                  {/* Cracks texture */}
                  {theme.ground.hasCracks && (
                    <div className="absolute inset-0 opacity-15" style={{
                      backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 8px, hsl(220 15% 25% / 0.5) 8px, hsl(220 15% 25% / 0.5) 9px)",
                    }} />
                  )}

                  {/* Surface emoji + name */}
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    <span className="text-lg">{theme.emoji}</span>
                    <span className="text-[9px] font-display tracking-wider text-white/90 font-bold"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
                      {SURFACE_EMOJI[theme.ground.surface] || "⬜"} {theme.ground.surface.toUpperCase()}
                    </span>
                  </div>

                  {/* Lock overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "hsl(220 12% 8% / 0.7)", backdropFilter: "blur(2px)" }}
                    >
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}

                  {/* Selected check */}
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

                {/* Info section */}
                <div className="px-2.5 py-2"
                  style={{ background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 9%) 100%)" }}
                >
                  {/* Theme name */}
                  <span className="text-[11px] font-display font-bold text-foreground block leading-tight truncate">
                    {theme.name}
                  </span>
                  <span className="text-[8px] text-muted-foreground leading-none font-body block mb-1.5">
                    {theme.subtitle}
                  </span>

                  {/* Stats row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Crowd */}
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
                      style={{ background: "hsl(220 15% 16%)" }}
                    >
                      <Users className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-[7px] font-body text-foreground/60">
                        {crowdLabel(theme.crowd.count)}
                      </span>
                    </div>
                    {/* Weather */}
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
                      style={{ background: "hsl(220 15% 16%)" }}
                    >
                      <Cloud className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-[7px] font-body text-foreground/60">
                        {theme.weatherPool.length}
                      </span>
                    </div>
                    {/* Commentary tone */}
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
                      style={{ background: "hsl(220 15% 16%)" }}
                    >
                      <Mic className="w-2.5 h-2.5" style={{ color: TONE_COLOR[theme.commentary.tone] || "hsl(0 0% 50%)" }} />
                      <span className="text-[7px] font-body capitalize" style={{ color: TONE_COLOR[theme.commentary.tone] || "hsl(0 0% 60%)" }}>
                        {theme.commentary.tone}
                      </span>
                    </div>
                  </div>

                  {/* Atmosphere indicators */}
                  <div className="flex items-center gap-1 mt-1.5">
                    {theme.atmosphere.floodlights && <span className="text-[8px]" title="Floodlights">💡</span>}
                    {theme.atmosphere.dustParticles && <span className="text-[8px]" title="Dusty">🌫️</span>}
                    {theme.atmosphere.fireflies && <span className="text-[8px]" title="Fireflies">✨</span>}
                    {theme.crowd.chantStyle === "dhol" && <span className="text-[8px]" title="Dhol beats">🥁</span>}
                    {theme.atmosphere.fogLevel > 0.05 && <span className="text-[8px]" title="Foggy">🌁</span>}
                    {/* Noise meter — tiny bar */}
                    <div className="ml-auto flex items-center gap-0.5">
                      <span className="text-[6px] text-muted-foreground font-body">🔊</span>
                      <div className="w-8 h-1 rounded-full overflow-hidden" style={{ background: "hsl(220 15% 16%)" }}>
                        <div className="h-full rounded-full" style={{
                          width: `${theme.crowd.noise}%`,
                          background: theme.crowd.noise > 70
                            ? "linear-gradient(90deg, hsl(43 90% 50%), hsl(4 70% 55%))"
                            : "linear-gradient(90deg, hsl(142 50% 40%), hsl(43 80% 50%))",
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </ScrollHint>
    </div>
  );
}
