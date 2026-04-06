import { useState, useEffect } from "react";
import StoneHeader from "@/components/shared/StoneHeader";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArenaSelector from "@/components/ArenaSelector";
import ThemeSelector from "@/components/ThemeSelector";
import { ARENAS, getBestArena, type Arena } from "@/lib/arenas";
import { MATCH_THEMES, getThemeById, type MatchTheme } from "@/lib/matchThemes";
import { RANK_TIERS, getRankTier } from "@/lib/rankTiers";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SFX, Haptics } from "@/lib/sounds";
import ModeCard from "@/components/play/ModeCard";
import { MODES } from "@/components/play/modes";
import { IPL_TEAMS } from "@/components/ipl/IPLData";

export default function PlayPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tierIndex, setTierIndex] = useState(0);
  const [selectedArena, setSelectedArena] = useState<Arena>(ARENAS[0]);
  const [selectedTheme, setSelectedTheme] = useState<MatchTheme>(MATCH_THEMES[0]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("wins, total_matches, high_score, best_streak").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          const tier = getRankTier(data);
          const idx = RANK_TIERS.findIndex(t => t.name === tier.name);
          setTierIndex(idx);
          const saved = localStorage.getItem("selectedArena");
          const best = getBestArena(idx);
          if (saved) {
            const found = ARENAS.find(a => a.id === saved && idx >= a.unlockTierIndex);
            setSelectedArena(found || best);
          } else {
            setSelectedArena(best);
          }
          const savedTheme = localStorage.getItem("selectedTheme");
          if (savedTheme) {
            const found = getThemeById(savedTheme);
            setSelectedTheme(found);
          }
        }
      });
  }, [user]);

  const handleArenaSelect = (arena: Arena) => {
    setSelectedArena(arena);
    localStorage.setItem("selectedArena", arena.id);
    try { SFX.tap(); Haptics.light(); } catch { /* Intentionally ignored - non-critical */ }
  };

  const handleThemeSelect = (theme: MatchTheme) => {
    setSelectedTheme(theme);
    localStorage.setItem("selectedTheme", theme.id);
    try { SFX.tap(); Haptics.light(); } catch { /* Intentionally ignored - non-critical */ }
  };

  const handleModeSelect = (modeId: string) => {
    const playerTeamId = localStorage.getItem("favoriteTeamId") || IPL_TEAMS[Math.floor(Math.random() * IPL_TEAMS.length)].id;
    const availableOpponents = IPL_TEAMS.filter(t => t.id !== playerTeamId);
    const opponentTeamId = availableOpponents[Math.floor(Math.random() * availableOpponents.length)].id;
    navigate(`/game/${modeId}`, {
      state: { arenaImage: selectedArena.image, arenaId: selectedArena.id, themeId: selectedTheme.id, playerTeamId, opponentTeamId },
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-24"
      style={{
        background: "linear-gradient(180deg, hsl(220 20% 10%) 0%, hsl(220 18% 7%) 40%, hsl(222 40% 6%) 100%)",
      }}
    >
      {/* Leather grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='6' height='6' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
      />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-8">
        {/* Header — Floodlight Chrome */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 rounded-sm"
              style={{ background: "linear-gradient(180deg, hsl(43 90% 55%) 0%, hsl(35 60% 35%) 100%)" }}
            />
            <div>
              <StoneHeader src={stoneSelectModeImg} alt="Select Mode" height={28} />
              <p className="text-[9px] text-muted-foreground font-display tracking-[0.2em]">
                CHOOSE YOUR ARENA & GAME TYPE
              </p>
            </div>
          </div>
        </motion.div>

        {/* Arena selector */}
        <div className="mb-4">
          <ArenaSelector
            currentTierIndex={tierIndex}
            selectedArenaId={selectedArena.id}
            onSelect={handleArenaSelect}
          />
        </div>

        {/* Theme selector */}
        <div className="mb-5">
          <ThemeSelector
            currentTierIndex={tierIndex}
            selectedThemeId={selectedTheme.id}
            onSelect={handleThemeSelect}
          />
        </div>

        {/* Chalk divider */}
        <div className="h-px mb-5 mx-2 opacity-20"
          style={{ background: "repeating-linear-gradient(90deg, hsl(45 30% 80%) 0px, hsl(45 30% 80%) 8px, transparent 8px, transparent 14px)" }}
        />

        {/* Mode cards */}
        <div className="space-y-3">
          {MODES.map((mode, i) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              index={i}
              onSelect={() => handleModeSelect(mode.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
