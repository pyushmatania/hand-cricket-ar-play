import { useEffect, useState } from "react";
import StoneHeader from "@/components/shared/StoneHeader";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTournamentPersistence } from "@/hooks/useTournamentPersistence";
import { useAuth } from "@/contexts/AuthContext";
import { getRewardForPlacement } from "@/lib/tournamentRewards";

const FORMAT_ICONS: Record<string, string> = {
  worldcup: "🌍", ashes: "🏺", knockout: "🏆", auction: "💰", royale: "👑", ipl: "🏏",
};

const FORMAT_LABELS: Record<string, string> = {
  worldcup: "World Cup", ashes: "The Ashes", knockout: "Knockout Cup", auction: "Auction League", royale: "Cricket Royale", ipl: "IPL",
};

export default function TournamentHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getHistory } = useTournamentPersistence();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getHistory().then(data => { setEntries(data); setLoading(false); });
  }, [user]);

  const getPlacementColor = (placement: string | null) => {
    if (!placement) return "hsl(25 30% 50%)";
    const lower = placement.toLowerCase();
    if (lower.includes("champion") || lower.includes("won")) return "hsl(43 90% 55%)";
    if (lower.includes("runner")) return "hsl(217 80% 65%)";
    if (lower.includes("semi") || lower.includes("drawn")) return "hsl(142 60% 50%)";
    return "hsl(0 60% 55%)";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 10%, hsl(217 30% 10%) 0%, hsl(220 20% 6%) 60%)" }} />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-5 pb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm stadium-glass text-foreground">
          ←
        </motion.button>
        <StoneHeader src={stoneTournamentHistoryImg} alt="TOURNAMENT HISTORY" height={28} />
      </div>

      <div className="relative z-10 px-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🏟️</p>
            <p className="font-display text-sm text-muted-foreground">No tournaments yet</p>
            <p className="font-body text-[10px] text-muted-foreground mt-1">Play a World Cup, Ashes, or Knockout Cup to see your history</p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const tournament = entry.tournaments as any;
            if (!tournament) return null;
            const format = tournament.format || "knockout";
            const placement = entry.placement;
            const reward = placement ? getRewardForPlacement(placement) : null;
            const isWin = placement?.toLowerCase().includes("champion") || placement?.toLowerCase().includes("won");

            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl p-3 relative overflow-hidden ${isWin ? "stadium-glass border border-secondary/20" : "stadium-glass"}`}>
                {/* Top row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{FORMAT_ICONS[format] || "🏆"}</span>
                    <div>
                      <p className="font-display text-[11px] text-foreground">{FORMAT_LABELS[format] || tournament.name}</p>
                      <p className="font-body text-[8px] text-muted-foreground">
                        {tournament.ended_at
                          ? new Date(tournament.ended_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "In Progress"}
                      </p>
                    </div>
                  </div>
                  {placement && (
                    <span className="font-display text-[10px] px-2 py-1 rounded-lg scoreboard-metal"
                      style={{ color: getPlacementColor(placement) }}>
                      {placement}
                    </span>
                  )}
                </div>

                {/* Rewards row */}
                {reward && placement && (
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-body text-[9px] text-primary">+{reward.xp} XP</span>
                    <span className="font-body text-[9px] text-secondary">+{reward.coins} 🪙</span>
                    {reward.chestTier && <span className="font-body text-[9px] text-accent">📦 {reward.chestTier}</span>}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
