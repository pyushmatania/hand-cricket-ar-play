import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayers, IPL_TEAMS, DBPlayer, overallRating, statToDiamonds, roleLabel } from "@/hooks/usePlayers";
import CollectionPlayerCard from "@/components/CollectionPlayerCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Search, X, Zap, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RARITY_FILTERS = ["all", "mythic", "legendary", "epic", "rare", "common"] as const;
const ROLE_FILTERS = ["all", "batsman", "bowler", "all_rounder", "wk_batsman"] as const;
const ROLE_LABELS: Record<string, string> = {
  all: "ALL",
  batsman: "BAT",
  bowler: "BOWL",
  all_rounder: "AR",
  wk_batsman: "WK",
};

const RARITY_COLORS: Record<string, string> = {
  mythic: "hsl(280 80% 60%)",
  legendary: "hsl(35 80% 50%)",
  epic: "hsl(270 50% 50%)",
  rare: "hsl(210 60% 45%)",
  common: "hsl(220 10% 50%)",
};

export default function CollectionPage() {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>();
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<DBPlayer | null>(null);

  const { data: players, isLoading } = usePlayers(selectedTeam);

  const filtered = useMemo(() => {
    if (!players) return [];
    return players.filter((p) => {
      if (rarityFilter !== "all" && p.rarity !== rarityFilter) return false;
      if (roleFilter !== "all" && p.role !== roleFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.short_name?.toLowerCase().includes(q) ?? false);
      }
      return true;
    });
  }, [players, rarityFilter, roleFilter, searchQuery]);

  const stats = useMemo(() => {
    if (!players) return { total: 0, mythic: 0, legendary: 0, epic: 0, rare: 0, common: 0 };
    const counts = { total: players.length, mythic: 0, legendary: 0, epic: 0, rare: 0, common: 0 };
    players.forEach((p) => { counts[p.rarity as keyof typeof counts]++; });
    return counts;
  }, [players]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-game-display text-lg text-foreground tracking-wide">PLAYER DATABASE</h1>
          <span className="text-[10px] font-game-body text-muted-foreground ml-auto">
            {filtered.length} / {stats.total}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card/80 border border-border/50 rounded-lg pl-8 pr-8 py-2 text-xs font-game-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Team filter chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedTeam(undefined)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-game-display transition-all ${
              !selectedTeam ? "bg-primary text-primary-foreground" : "bg-card/80 text-muted-foreground border border-border/30"
            }`}
          >
            ALL
          </button>
          {Object.entries(IPL_TEAMS).map(([key, team]) => (
            <button
              key={key}
              onClick={() => setSelectedTeam(key === selectedTeam ? undefined : key)}
              className="shrink-0 px-2.5 py-1 rounded-full text-[9px] font-game-display transition-all border"
              style={{
                background: key === selectedTeam ? team.color : "transparent",
                color: key === selectedTeam ? team.textColor : "hsl(var(--muted-foreground))",
                borderColor: key === selectedTeam ? team.color : "hsl(var(--border) / 0.3)",
              }}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Role + Rarity filters */}
        <div className="flex gap-3 mt-1.5">
          <div className="flex gap-1">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r === roleFilter ? "all" : r)}
                className={`px-2 py-0.5 rounded text-[8px] font-game-display transition-all ${
                  r === roleFilter ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
          <div className="flex gap-1 ml-auto">
            {RARITY_FILTERS.slice(1).map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(r === rarityFilter ? "all" : r)}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  background: RARITY_COLORS[r],
                  opacity: rarityFilter === "all" || rarityFilter === r ? 1 : 0.3,
                  boxShadow: rarityFilter === r ? `0 0 6px ${RARITY_COLORS[r]}` : "none",
                }}
                title={r}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1 px-3 pt-3 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-game-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-game-body text-sm">No players found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((player, i) => (
              <CollectionPlayerCard
                key={player.id}
                player={player}
                size="sm"
                delay={Math.min(i * 0.03, 0.5)}
                onTap={setSelectedPlayer}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Player Detail Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <PlayerDetailOverlay player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function PlayerDetailOverlay({ player, onClose }: { player: DBPlayer; onClose: () => void }) {
  const rating = overallRating(player);
  const rarity = player.rarity || "common";
  const rarityColor = RARITY_COLORS[rarity] || "hsl(220 10% 50%)";

  const stats = [
    { label: "POWER", key: "power", value: player.power },
    { label: "TECHNIQUE", key: "technique", value: player.technique },
    { label: "PACE/SPIN", key: "pace_spin", value: player.pace_spin },
    { label: "ACCURACY", key: "accuracy", value: player.accuracy },
    { label: "AGILITY", key: "agility", value: player.agility },
    { label: "CLUTCH", key: "clutch", value: player.clutch },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(222 30% 12%), hsl(222 35% 6%))",
          border: `2px solid ${rarityColor}`,
          boxShadow: `0 0 30px ${rarityColor}44`,
        }}
      >
        {/* Header */}
        <div className="relative h-32 flex items-center justify-center" style={{ background: `${rarityColor}15` }}>
          <div className="text-6xl opacity-20 absolute">{player.role === "bowler" ? "🏏" : "🧤"}</div>
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-1"
              style={{ background: `linear-gradient(135deg, ${rarityColor}, ${rarityColor}88)` }}
            >
              <span className="font-game-display text-xl font-black text-white">{rating}</span>
            </div>
            <span className="text-[8px] font-game-display uppercase tracking-widest"
              style={{ color: rarityColor }}
            >{rarity}</span>
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 p-1">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Name + Info */}
        <div className="px-4 py-3 text-center border-b border-border/30">
          <h2 className="font-game-display text-lg text-foreground">{player.name.toUpperCase()}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[10px] font-game-body text-muted-foreground">{player.country}</span>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-[10px] font-game-body text-muted-foreground">{player.ipl_team}</span>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-[10px] font-game-display" style={{ color: rarityColor }}>
              {roleLabel(player.role)}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 space-y-2">
          {stats.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <span className="text-[9px] font-game-body text-muted-foreground w-16">{s.label}</span>
              <div className="flex-1 h-1.5 bg-border/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: rarityColor }}
                />
              </div>
              <span className="text-[10px] font-game-display text-foreground w-6 text-right">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Special Ability */}
        {player.special_ability_name && (
          <div className="px-4 pb-4">
            <div className="rounded-lg p-2.5" style={{ background: `${rarityColor}10`, border: `1px solid ${rarityColor}30` }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3 h-3" style={{ color: rarityColor }} />
                <span className="font-game-display text-[10px]" style={{ color: rarityColor }}>
                  {player.special_ability_name}
                </span>
              </div>
              <p className="text-[9px] font-game-body text-muted-foreground leading-relaxed">
                {player.special_ability_desc}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
