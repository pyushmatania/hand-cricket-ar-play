import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayers, IPL_TEAMS, DBPlayer, overallRating, statToDiamonds, roleLabel } from "@/hooks/usePlayers";
import { useUserCards, UPGRADE_COSTS, useUpgradeCard } from "@/hooks/useUserCards";
import CollectionPlayerCard from "@/components/CollectionPlayerCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Search, X, Zap, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RARITY_FILTERS = ["all", "mythic", "legendary", "epic", "rare", "common"] as const;
const ROLE_FILTERS = ["all", "batsman", "bowler", "all_rounder", "wk_batsman"] as const;
const ROLE_LABELS: Record<string, string> = { all: "ALL", batsman: "BAT", bowler: "BOWL", all_rounder: "AR", wk_batsman: "WK" };

const RARITY_COLORS: Record<string, string> = {
  mythic: "#A855F7", legendary: "#FFD700", epic: "#A855F7", rare: "#2563EB", common: "#6B7280",
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
    <div className="min-h-screen flex flex-col fish-scale-bg">
      {/* Stone Header */}
      <div className="sticky top-0 z-30 px-4 pt-3 pb-2" style={{
        background: "linear-gradient(180deg, #2E1A0E 0%, #1A0E06 100%)",
        borderBottom: "3px solid #3E2410",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="w-5 h-5 text-[#F5E6D3]" />
          </button>
          <h1 className="stone-header text-lg tracking-wider">COLLECTION</h1>
          <span className="text-[10px] font-body text-[#94A3B8] ml-auto">
            {filtered.length} / {stats.total}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg pl-8 pr-8 py-2 text-xs font-body text-[#F5E6D3] placeholder:text-[#94A3B8]/50 focus:outline-none"
            style={{
              background: "#1A0E06",
              border: "2px solid #3E2410",
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>
          )}
        </div>

        {/* Rarity filter tabs - wooden buttons */}
        <div className="flex gap-1.5 mb-1.5">
          {RARITY_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRarityFilter(r === rarityFilter ? "all" : r)}
              className="flex-1 py-1.5 rounded-lg text-[8px] font-display tracking-wider transition-all"
              style={{
                background: r === rarityFilter
                  ? `linear-gradient(180deg, ${RARITY_COLORS[r] || "#5C3A1E"}, ${RARITY_COLORS[r] || "#3E2410"}88)`
                  : "#2E1A0E",
                border: r === rarityFilter ? `2px solid ${RARITY_COLORS[r] || "#5C3A1E"}` : "2px solid #3E2410",
                color: r === rarityFilter ? "#F5E6D3" : "#94A3B8",
                boxShadow: r === rarityFilter ? `0 0 8px ${RARITY_COLORS[r] || "#5C3A1E"}44` : "none",
              }}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Role filter tabs */}
        <div className="flex gap-1">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r === roleFilter ? "all" : r)}
              className="flex-1 py-1 rounded text-[8px] font-display tracking-wider transition-all"
              style={{
                background: r === roleFilter ? "#5C3A1E" : "transparent",
                color: r === roleFilter ? "#F5E6D3" : "#94A3B8",
                border: r === roleFilter ? "1px solid #8B6914" : "1px solid transparent",
              }}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Rope separator */}
      <div className="rope-separator mx-4 my-1" />

      {/* Horizontal rows */}
      <ScrollArea className="flex-1 px-3 pt-2 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#94A3B8] font-body text-sm">No players found</p>
          </div>
        ) : (
          <div className="space-y-2">
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
  const { user } = useAuth();
  const { data: userCards } = useUserCards();
  const upgradeCard = useUpgradeCard();
  const rating = overallRating(player);
  const rarity = player.rarity || "common";
  const rarityColor = RARITY_COLORS[rarity] || "#6B7280";

  const userCard = userCards?.find(c => c.player_id === player.id);
  const cardLevel = userCard?.card_level ?? 0;
  const cardCount = userCard?.card_count ?? 0;
  const nextCost = cardLevel > 0 && cardLevel < 6 ? UPGRADE_COSTS[cardLevel] : null;
  const canUpgrade = nextCost ? cardCount >= nextCost.cards : false;

  const statBoostTotal = Array.from({ length: cardLevel - 1 }, (_, i) => UPGRADE_COSTS[i + 1]?.statBoost ?? 0)
    .reduce((a, b) => a + b, 0);

  const handleUpgrade = async () => {
    if (!userCard || !nextCost) return;
    try {
      await upgradeCard.mutateAsync({ cardId: userCard.id, currentLevel: cardLevel, cardCount });
      toast.success(`Upgraded to Level ${cardLevel + 1}!`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const stats = [
    { label: "PWR", value: Math.min(100, player.power + statBoostTotal) },
    { label: "TEC", value: Math.min(100, player.technique + statBoostTotal) },
    { label: "PAC", value: Math.min(100, player.pace_spin + statBoostTotal) },
    { label: "ACC", value: Math.min(100, player.accuracy + statBoostTotal) },
    { label: "AGI", value: Math.min(100, player.agility + statBoostTotal) },
    { label: "CLU", value: Math.min(100, player.clutch + statBoostTotal) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #3E2410 0%, #2E1A0E 100%)",
          border: `3px solid ${rarityColor}`,
          boxShadow: `0 0 30px ${rarityColor}44, 0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* Rarity glow bar */}
        <div className="h-1" style={{ background: rarityColor, boxShadow: `0 0 8px ${rarityColor}66` }} />

        {/* Header */}
        <div className="relative h-28 flex items-center justify-center" style={{ background: `${rarityColor}10` }}>
          <div className="text-5xl opacity-15 absolute">{player.role === "bowler" ? "🏏" : "🧤"}</div>
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-1"
              style={{ background: `linear-gradient(135deg, ${rarityColor}, ${rarityColor}88)`, boxShadow: `0 4px 0 ${rarityColor}44` }}
            >
              <span className="font-display text-xl font-black text-white">{rating}</span>
            </div>
            <span className="text-[8px] font-display uppercase tracking-widest" style={{ color: rarityColor }}>{rarity}</span>
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 p-1"><X className="w-4 h-4 text-[#94A3B8]" /></button>
        </div>

        {/* Name + Info */}
        <div className="px-4 py-3 text-center" style={{ borderBottom: "2px solid #3E2410" }}>
          {/* Ribbon banner */}
          <div className="relative inline-block px-6 py-1.5 -mx-2" style={{
            background: `linear-gradient(90deg, transparent, ${rarityColor}88, transparent)`,
            clipPath: "polygon(4% 0%, 96% 0%, 100% 50%, 96% 100%, 4% 100%, 0% 50%)",
          }}>
            <h2 className="font-display text-base text-white tracking-wider" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.4)" }}>
              {player.name.toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <span className="text-[10px] font-body text-[#94A3B8]">{player.country}</span>
            <span className="text-[#3E2410]">•</span>
            <span className="text-[10px] font-body text-[#94A3B8]">{player.ipl_team}</span>
            <span className="text-[#3E2410]">•</span>
            <span className="text-[10px] font-display" style={{ color: rarityColor }}>{roleLabel(player.role)}</span>
          </div>
          {userCard && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[8px] font-display" style={{
                background: "#FFD70020", color: "#FFD700", border: "1px solid #FFD70030",
              }}>
                LVL {cardLevel} • {cardCount} cards
              </span>
            </div>
          )}
        </div>

        {/* 6-Stat diamond grid */}
        <div className="px-4 py-3 space-y-1.5">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-[9px] font-semibold text-[#94A3B8] w-8 uppercase tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{s.label}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-[8px]" style={{
                    color: i < statToDiamonds(s.value) ? rarityColor : "rgba(100,100,100,0.25)",
                    textShadow: i < statToDiamonds(s.value) ? `0 0 4px ${rarityColor}50` : "none",
                  }}>◆</span>
                ))}
              </div>
              <span className="text-[10px] font-bold text-white w-6 text-right" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Upgrade Section */}
        {userCard && nextCost && (
          <div className="px-4 pb-3">
            <div className="rounded-xl p-3" style={{ background: "#1A0E06", border: "2px solid #3E2410" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-[10px] text-[#F5E6D3] tracking-wider">UPGRADE TO LVL {cardLevel + 1}</span>
                <span className="text-[8px] font-body text-green-400">+{nextCost.statBoost} all stats</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex justify-between text-[8px] font-body text-[#94A3B8] mb-0.5">
                    <span>Cards: {cardCount}/{nextCost.cards}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#2E1A0E" }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${Math.min(100, (cardCount / nextCost.cards) * 100)}%`,
                      background: cardCount >= nextCost.cards ? "#22C55E" : "#FFD700",
                    }} />
                  </div>
                </div>
                <div className="text-[9px] font-display text-[#FFD700]">{nextCost.coins} 🪙</div>
              </div>
              <motion.button
                whileTap={canUpgrade ? { scale: 0.95 } : undefined}
                onClick={canUpgrade ? handleUpgrade : undefined}
                disabled={!canUpgrade || upgradeCard.isPending}
                className="w-full py-2 rounded-lg font-display text-[10px] tracking-wider flex items-center justify-center gap-1.5"
                style={{
                  background: canUpgrade ? "linear-gradient(180deg, #22C55E, #16A34A)" : "#2E1A0E",
                  color: canUpgrade ? "white" : "#6B7280",
                  border: canUpgrade ? "2px solid #22C55E" : "2px solid #3E2410",
                  borderBottom: canUpgrade ? "4px solid #15803D" : "4px solid #1A0E06",
                }}
              >
                <ArrowUp className="w-3 h-3" />
                {upgradeCard.isPending ? "UPGRADING..." : "UPGRADE"}
              </motion.button>
            </div>
          </div>
        )}

        {/* Special Ability */}
        {player.special_ability_name && (
          <div className="px-4 pb-4">
            <div className="rounded-lg p-2.5" style={{ background: `${rarityColor}10`, border: `1px solid ${rarityColor}30` }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3 h-3" style={{ color: rarityColor }} />
                <span className="font-display text-[10px]" style={{ color: rarityColor }}>{player.special_ability_name}</span>
              </div>
              <p className="text-[9px] font-body text-[#94A3B8] leading-relaxed">{player.special_ability_desc}</p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
