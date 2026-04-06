import { useState, useMemo } from "react";
import StoneHeader from "@/components/shared/StoneHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Save, Users, Zap, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayers, DBPlayer, overallRating, roleLabel, IPL_TEAMS } from "@/hooks/usePlayers";
import { useUserCards } from "@/hooks/useUserCards";
import { useUserTeams, useSaveTeam } from "@/hooks/useUserTeams";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

/* ── Field positions for 11 slots (x%, y%) on a cricket field ── */
const FIELD_POSITIONS: { x: number; y: number; label: string; preferredRole: string }[] = [
  { x: 50, y: 85, label: "WK", preferredRole: "wk_batsman" },
  { x: 50, y: 72, label: "BOW", preferredRole: "bowler" },
  { x: 30, y: 60, label: "BOW", preferredRole: "bowler" },
  { x: 70, y: 60, label: "BOW", preferredRole: "bowler" },
  { x: 15, y: 45, label: "AR", preferredRole: "all_rounder" },
  { x: 85, y: 45, label: "AR", preferredRole: "all_rounder" },
  { x: 50, y: 38, label: "BAT", preferredRole: "batsman" },
  { x: 25, y: 28, label: "BAT", preferredRole: "batsman" },
  { x: 75, y: 28, label: "BAT", preferredRole: "batsman" },
  { x: 40, y: 15, label: "BAT", preferredRole: "batsman" },
  { x: 60, y: 15, label: "BAT", preferredRole: "batsman" },
];

const PRESET_NAMES = ["Squad 1", "Squad 2", "Squad 3", "Squad 4", "Squad 5"];

const RARITY_COLORS: Record<string, string> = {
  mythic: "hsl(280 80% 60%)",
  legendary: "hsl(35 80% 50%)",
  epic: "hsl(270 50% 50%)",
  rare: "hsl(210 60% 45%)",
  common: "hsl(220 10% 50%)",
};

function calculateChemistry(players: (DBPlayer | null)[]): number {
  const filled = players.filter(Boolean) as DBPlayer[];
  if (filled.length < 2) return 0;

  let score = 0;
  const maxScore = 100;

  // Team synergy: same IPL team bonus
  const teamCounts: Record<string, number> = {};
  filled.forEach(p => { if (p.ipl_team) teamCounts[p.ipl_team] = (teamCounts[p.ipl_team] || 0) + 1; });
  const maxTeam = Math.max(...Object.values(teamCounts));
  score += Math.min(30, maxTeam * 5); // Up to 30 pts for team synergy

  // Role balance: ideal is 4 bat, 3 bowl, 2 AR, 1 WK, 1 flex
  const roles = { batsman: 0, bowler: 0, all_rounder: 0, wk_batsman: 0 };
  filled.forEach(p => { if (p.role && p.role in roles) roles[p.role as keyof typeof roles]++; });
  const hasWK = roles.wk_batsman >= 1;
  const hasBowlers = roles.bowler >= 3;
  const hasBatsmen = roles.batsman >= 3;
  const hasAR = roles.all_rounder >= 1;
  score += (hasWK ? 10 : 0) + (hasBowlers ? 15 : 0) + (hasBatsmen ? 15 : 0) + (hasAR ? 10 : 0);

  // Squad size bonus
  score += Math.min(20, filled.length * 2);

  return Math.min(maxScore, score);
}

export default function TeamBuilderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allPlayers, isLoading: playersLoading } = usePlayers();
  const { data: userCards } = useUserCards();
  const { data: savedTeams } = useUserTeams();
  const saveTeam = useSaveTeam();

  const [presetIndex, setPresetIndex] = useState(0);
  const [teamName, setTeamName] = useState("My Squad");
  const [slots, setSlots] = useState<(string | null)[]>(Array(11).fill(null));
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  // Load preset when switching
  const currentPreset = savedTeams?.find(t => t.preset_index === presetIndex);
  useState(() => {
    if (currentPreset) {
      setTeamName(currentPreset.team_name);
      setSlots(currentPreset.player_ids.concat(Array(11).fill(null)).slice(0, 11));
    }
  });

  // Owned player IDs
  const ownedIds = useMemo(() => new Set(userCards?.map(c => c.player_id) || []), [userCards]);

  // Map player IDs to data
  const playerMap = useMemo(() => {
    const map = new Map<string, DBPlayer>();
    allPlayers?.forEach(p => map.set(p.id, p));
    return map;
  }, [allPlayers]);

  const slotPlayers = slots.map(id => id ? playerMap.get(id) || null : null);
  const chemistry = calculateChemistry(slotPlayers);
  const filledCount = slots.filter(Boolean).length;

  // Available players (owned, not already in squad)
  const usedIds = new Set(slots.filter(Boolean) as string[]);
  const availablePlayers = useMemo(() => {
    if (!allPlayers) return [];
    return allPlayers
      .filter(p => ownedIds.has(p.id) && !usedIds.has(p.id))
      .sort((a, b) => overallRating(b) - overallRating(a));
  }, [allPlayers, ownedIds, usedIds]);

  const handleSlotTap = (index: number) => {
    if (slots[index]) {
      // Remove player
      setSlots(prev => prev.map((s, i) => i === index ? null : s));
    } else {
      setPickerSlot(index);
    }
  };

  const handlePickPlayer = (playerId: string) => {
    if (pickerSlot === null) return;
    setSlots(prev => prev.map((s, i) => i === pickerSlot ? playerId : s));
    setPickerSlot(null);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await saveTeam.mutateAsync({
        presetIndex,
        teamName,
        playerIds: slots.map(s => s || ""),
      });
      toast.success("Team saved!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleClear = () => {
    setSlots(Array(11).fill(null));
    toast.info("Squad cleared");
  };

  const handleAutoFill = () => {
    if (!allPlayers) return;
    const available = allPlayers
      .filter(p => ownedIds.has(p.id))
      .sort((a, b) => overallRating(b) - overallRating(a));

    const newSlots: (string | null)[] = Array(11).fill(null);
    const used = new Set<string>();

    // Try to fill by preferred role
    FIELD_POSITIONS.forEach((pos, i) => {
      const match = available.find(p => p.role === pos.preferredRole && !used.has(p.id));
      if (match) {
        newSlots[i] = match.id;
        used.add(match.id);
      }
    });

    // Fill remaining with best available
    newSlots.forEach((s, i) => {
      if (!s) {
        const next = available.find(p => !used.has(p.id));
        if (next) {
          newSlots[i] = next.id;
          used.add(next.id);
        }
      }
    });

    setSlots(newSlots);
    toast.success("Auto-filled best squad!");
  };

  if (playersLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-game-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3 border-b border-border/30">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <StoneHeader src={stoneTeamBuilderImg} alt="TEAM BUILDER" height={30} />
          <span className="text-[9px] font-body text-muted-foreground">{filledCount}/11 players</span>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleSave}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
          style={{ background: "hsl(142 40% 25%)", border: "1px solid hsl(142 40% 35%)" }}
        >
          <Save className="w-3.5 h-3.5 text-green-400" />
          <span className="font-display text-[10px] text-green-400">SAVE</span>
        </motion.button>
      </div>

      {/* Preset tabs */}
      <div className="flex gap-1 px-4 py-2">
        {PRESET_NAMES.map((name, i) => (
          <button
            key={i}
            onClick={() => {
              setPresetIndex(i);
              const preset = savedTeams?.find(t => t.preset_index === i);
              if (preset) {
                setTeamName(preset.team_name);
                setSlots(preset.player_ids.concat(Array(11).fill(null)).slice(0, 11));
              } else {
                setTeamName(name);
                setSlots(Array(11).fill(null));
              }
            }}
            className="flex-1 py-1.5 rounded-lg text-[9px] font-display transition-all"
            style={{
              background: presetIndex === i ? "hsl(35 40% 20%)" : "hsl(222 25% 10%)",
              border: presetIndex === i ? "1px solid hsl(35 50% 35%)" : "1px solid hsl(222 20% 18%)",
              color: presetIndex === i ? "hsl(35 80% 60%)" : "hsl(220 10% 45%)",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Team name + Chemistry */}
      <div className="px-4 flex items-center gap-3 mb-2">
        <input
          type="text"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          className="flex-1 bg-transparent border-b border-border/30 text-sm font-display text-foreground py-1 focus:outline-none focus:border-game-gold/50"
          maxLength={20}
        />
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{
            background: chemistry > 70 ? "hsl(142 30% 12%)" : chemistry > 40 ? "hsl(35 30% 12%)" : "hsl(0 20% 12%)",
            border: `1px solid ${chemistry > 70 ? "hsl(142 40% 30%)" : chemistry > 40 ? "hsl(35 40% 30%)" : "hsl(0 30% 25%)"}`,
          }}
        >
          <Zap className="w-3 h-3" style={{ color: chemistry > 70 ? "hsl(142 60% 55%)" : chemistry > 40 ? "hsl(35 80% 55%)" : "hsl(0 60% 55%)" }} />
          <span className="font-display text-[10px]"
            style={{ color: chemistry > 70 ? "hsl(142 60% 55%)" : chemistry > 40 ? "hsl(35 80% 55%)" : "hsl(0 60% 55%)" }}
          >{chemistry}%</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 flex gap-2 mb-3">
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleAutoFill}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg"
          style={{ background: "hsl(210 30% 15%)", border: "1px solid hsl(210 30% 25%)" }}
        >
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-display text-[9px] text-blue-400">AUTO-FILL</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleClear}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg"
          style={{ background: "hsl(0 20% 14%)", border: "1px solid hsl(0 20% 22%)" }}
        >
          <RotateCcw className="w-3.5 h-3.5 text-red-400" />
          <span className="font-display text-[9px] text-red-400">CLEAR</span>
        </motion.button>
      </div>

      {/* Cricket Field */}
      <div className="relative mx-4 rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: "1/1.1" }}>
        {/* Field background */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(142 40% 22%) 0%, hsl(142 35% 15%) 50%, hsl(142 30% 10%) 100%)",
        }} />
        {/* Pitch strip */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[40%] w-3 h-[25%] rounded-sm" style={{
          background: "hsl(35 40% 45%)",
          opacity: 0.4,
        }} />
        {/* Boundary circle */}
        <div className="absolute inset-3 rounded-full border border-white/10" />

        {/* Player slots */}
        {FIELD_POSITIONS.map((pos, i) => {
          const player = slotPlayers[i];
          const rarity = player?.rarity || "common";
          const rarityColor = RARITY_COLORS[rarity];

          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleSlotTap(i)}
              className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {player ? (
                <>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${rarityColor}, ${rarityColor}88)`,
                      border: `2px solid ${rarityColor}`,
                      boxShadow: `0 0 8px ${rarityColor}44`,
                    }}
                  >
                    <span className="font-display text-[8px] font-black text-white">
                      {overallRating(player)}
                    </span>
                  </div>
                  <span className="font-display text-[7px] text-white mt-0.5 max-w-[50px] truncate text-center"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                  >
                    {(player.short_name || player.name.split(" ").pop() || "").toUpperCase()}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.3)" }}
                  >
                    <span className="text-white/40 text-xs">+</span>
                  </div>
                  <span className="font-display text-[7px] text-white/40 mt-0.5">{pos.label}</span>
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Overall Rating */}
      <div className="px-4 mb-3 flex items-center justify-center gap-4">
        <div className="text-center">
          <span className="font-display text-2xl text-[#FFD700]">
            {filledCount > 0 ? Math.round(slotPlayers.filter(Boolean).reduce((s, p) => s + overallRating(p!), 0) / filledCount) : 0}
          </span>
          <span className="block text-[8px] font-body text-muted-foreground tracking-wider">TEAM OVR</span>
        </div>
        <div className="w-px h-8 bg-border/30" />
        <div className="text-center">
          <span className="font-display text-2xl text-foreground">{filledCount}</span>
          <span className="block text-[8px] font-body text-muted-foreground tracking-wider">PLAYERS</span>
        </div>
      </div>

      {/* Player Picker Modal */}
      <AnimatePresence>
        {pickerSlot !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => setPickerSlot(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="absolute bottom-0 inset-x-0 max-h-[70vh] rounded-t-2xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, hsl(222 30% 12%), hsl(222 35% 6%))",
                border: "1px solid hsl(222 20% 20%)",
              }}
            >
              <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
                <div>
                  <span className="font-display text-sm text-foreground">SELECT PLAYER</span>
                  <span className="block text-[9px] text-muted-foreground font-body">
                    Slot: {FIELD_POSITIONS[pickerSlot].label} • {availablePlayers.length} available
                  </span>
                </div>
                <button onClick={() => setPickerSlot(null)} className="text-muted-foreground text-lg">✕</button>
              </div>

              <ScrollArea className="max-h-[55vh] pb-8">
                <div className="p-3 space-y-1">
                  {availablePlayers.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-2xl block mb-2">📭</span>
                      <p className="text-sm text-muted-foreground font-body">No owned players available</p>
                      <p className="text-[10px] text-muted-foreground font-body mt-1">Win matches to earn chests with player cards!</p>
                    </div>
                  ) : (
                    availablePlayers.map(player => {
                      const rarityColor = RARITY_COLORS[player.rarity || "common"];
                      const rating = overallRating(player);

                      return (
                        <motion.button
                          key={player.id}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handlePickPlayer(player.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                          style={{
                            background: "hsl(222 25% 10%)",
                            border: `1px solid ${rarityColor}33`,
                          }}
                        >
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${rarityColor}44, ${rarityColor}22)`,
                              border: `1.5px solid ${rarityColor}66`,
                            }}
                          >
                            <span className="font-display text-sm font-black" style={{ color: rarityColor }}>
                              {rating}
                            </span>
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <span className="font-display text-[11px] text-foreground block truncate">
                              {player.name}
                            </span>
                            <span className="text-[8px] font-body text-muted-foreground">
                              {roleLabel(player.role)} • {player.ipl_team} • {(player.rarity || "common").toUpperCase()}
                            </span>
                          </div>
                          {player.special_ability_name && (
                            <Zap className="w-3 h-3 shrink-0" style={{ color: rarityColor }} />
                          )}
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
