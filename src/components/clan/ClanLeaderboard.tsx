import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface ClanRanking {
  id: string;
  name: string;
  tag: string;
  emoji: string;
  level: number;
  member_count: number;
  war_wins: number;
  total_stars: number;
}

export default function ClanLeaderboard() {
  const [rankings, setRankings] = useState<ClanRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"wins" | "stars">("wins");

  useEffect(() => {
    (async () => {
      // Fetch all clans
      const { data: clans } = await supabase.from("clans").select("id, name, tag, emoji, level, max_members");
      if (!clans?.length) { setLoading(false); return; }

      // Fetch all ended wars
      const { data: wars } = await supabase.from("clan_wars").select("clan_a_id, clan_b_id, clan_a_stars, clan_b_stars, winner_clan_id")
        .eq("status", "ended");

      const warList = (wars as any[]) || [];

      // Count member_count per clan
      const { data: memberCounts } = await supabase.from("clan_members").select("clan_id");
      const countMap = new Map<string, number>();
      (memberCounts || []).forEach((m: any) => {
        countMap.set(m.clan_id, (countMap.get(m.clan_id) || 0) + 1);
      });

      // Aggregate war stats per clan
      const statsMap = new Map<string, { wins: number; stars: number }>();
      warList.forEach((w: any) => {
        // Clan A
        if (!statsMap.has(w.clan_a_id)) statsMap.set(w.clan_a_id, { wins: 0, stars: 0 });
        const a = statsMap.get(w.clan_a_id)!;
        a.stars += w.clan_a_stars || 0;
        if (w.winner_clan_id === w.clan_a_id) a.wins++;

        // Clan B
        if (!statsMap.has(w.clan_b_id)) statsMap.set(w.clan_b_id, { wins: 0, stars: 0 });
        const b = statsMap.get(w.clan_b_id)!;
        b.stars += w.clan_b_stars || 0;
        if (w.winner_clan_id === w.clan_b_id) b.wins++;
      });

      const ranked: ClanRanking[] = clans.map((c: any) => ({
        id: c.id,
        name: c.name,
        tag: c.tag,
        emoji: c.emoji,
        level: c.level,
        member_count: countMap.get(c.id) || 0,
        war_wins: statsMap.get(c.id)?.wins || 0,
        total_stars: statsMap.get(c.id)?.stars || 0,
      }));

      setRankings(ranked);
      setLoading(false);
    })();
  }, []);

  const sorted = [...rankings].sort((a, b) =>
    sortBy === "wins"
      ? b.war_wins - a.war_wins || b.total_stars - a.total_stars
      : b.total_stars - a.total_stars || b.war_wins - a.war_wins
  );

  const MEDAL = ["🥇", "🥈", "🥉"];

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="scoreboard-metal rounded-2xl p-4 text-center">
        <span className="text-4xl block mb-1">🏆</span>
        <h3 className="font-display text-sm font-black text-neon-cyan tracking-wider neon-text-cyan">CLAN LEADERBOARD</h3>
        <p className="text-[9px] font-body text-muted-foreground mt-1">Ranked by war performance</p>
      </div>

      {/* Sort toggle */}
      <div className="flex gap-1 p-1 stadium-glass rounded-xl">
        {(["wins", "stars"] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)}
            className={`flex-1 py-2 rounded-lg font-display text-[9px] tracking-widest font-bold transition-all ${sortBy === s ? "bg-neon-cyan/15 text-neon-cyan" : "text-muted-foreground"}`}>
            {s === "wins" ? "⚔️ WAR WINS" : "⭐ TOTAL STARS"}
          </button>
        ))}
      </div>

      {/* Rankings */}
      {sorted.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl block mb-2">🏰</span>
          <p className="text-muted-foreground text-xs font-body">No clans found</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sorted.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${
                i === 0 ? "stadium-glass border-game-gold/30 bg-game-gold/[0.04]"
                : i < 3 ? "stadium-glass border-white/10"
                : "bg-white/[0.02] border-white/5"
              }`}
            >
              {/* Rank */}
              <div className="w-7 text-center flex-shrink-0">
                {i < 3 ? (
                  <span className="text-lg">{MEDAL[i]}</span>
                ) : (
                  <span className="font-display text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                )}
              </div>

              {/* Emoji */}
              <span className="text-2xl flex-shrink-0">{c.emoji}</span>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-display text-xs font-bold text-foreground truncate">{c.name}</span>
                  <span className="text-[7px] text-muted-foreground font-display">[{c.tag}]</span>
                </div>
                <div className="flex items-center gap-2 text-[8px] text-muted-foreground font-display tabular-nums">
                  <span>Lv.{c.level}</span>
                  <span>👥 {c.member_count}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-center">
                  <p className={`font-display text-sm font-black tabular-nums ${sortBy === "wins" ? "text-neon-cyan" : "text-foreground"}`}>
                    {c.war_wins}
                  </p>
                  <p className="text-[6px] font-display tracking-widest text-muted-foreground">WINS</p>
                </div>
                <div className="text-center">
                  <p className={`font-display text-sm font-black tabular-nums ${sortBy === "stars" ? "text-game-gold" : "text-foreground"}`}>
                    {c.total_stars}
                  </p>
                  <p className="text-[6px] font-display tracking-widest text-muted-foreground">⭐</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
