import { useState, useEffect, useMemo } from "react";
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
  prev_wins: number;
  prev_stars: number;
}

export default function ClanLeaderboard() {
  const [rankings, setRankings] = useState<ClanRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"wins" | "stars">("wins");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data: clans } = await supabase.from("clans").select("id, name, tag, emoji, level, max_members");
      if (!clans?.length) { setLoading(false); return; }

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all ended wars + wars ended before last week (for prev ranking)
      const { data: wars } = await supabase.from("clan_wars")
        .select("clan_a_id, clan_b_id, clan_a_stars, clan_b_stars, winner_clan_id, created_at")
        .eq("status", "ended");

      const warList = (wars as any[]) || [];

      // Count members
      const { data: memberCounts } = await supabase.from("clan_members").select("clan_id");
      const countMap = new Map<string, number>();
      (memberCounts || []).forEach((m: any) => {
        countMap.set(m.clan_id, (countMap.get(m.clan_id) || 0) + 1);
      });

      // Aggregate: all-time + prev-week (wars before cutoff)
      const allStats = new Map<string, { wins: number; stars: number }>();
      const prevStats = new Map<string, { wins: number; stars: number }>();

      warList.forEach((w: any) => {
        const isPrev = w.created_at < oneWeekAgo;

        for (const side of ["a", "b"] as const) {
          const clanId = side === "a" ? w.clan_a_id : w.clan_b_id;
          const stars = side === "a" ? (w.clan_a_stars || 0) : (w.clan_b_stars || 0);
          const isWinner = w.winner_clan_id === clanId;

          if (!allStats.has(clanId)) allStats.set(clanId, { wins: 0, stars: 0 });
          const all = allStats.get(clanId)!;
          all.stars += stars;
          if (isWinner) all.wins++;

          if (isPrev) {
            if (!prevStats.has(clanId)) prevStats.set(clanId, { wins: 0, stars: 0 });
            const prev = prevStats.get(clanId)!;
            prev.stars += stars;
            if (isWinner) prev.wins++;
          }
        }
      });

      const ranked: ClanRanking[] = clans.map((c: any) => ({
        id: c.id,
        name: c.name,
        tag: c.tag,
        emoji: c.emoji,
        level: c.level,
        member_count: countMap.get(c.id) || 0,
        war_wins: allStats.get(c.id)?.wins || 0,
        total_stars: allStats.get(c.id)?.stars || 0,
        prev_wins: prevStats.get(c.id)?.wins || 0,
        prev_stars: prevStats.get(c.id)?.stars || 0,
      }));

      setRankings(ranked);
      setLoading(false);
    })();
  }, []);

  // Sort current rankings
  const sortFn = (a: ClanRanking, b: ClanRanking) =>
    sortBy === "wins"
      ? b.war_wins - a.war_wins || b.total_stars - a.total_stars
      : b.total_stars - a.total_stars || b.war_wins - a.war_wins;

  // Sort prev rankings (same key but using prev data)
  const prevSortFn = (a: ClanRanking, b: ClanRanking) =>
    sortBy === "wins"
      ? b.prev_wins - a.prev_wins || b.prev_stars - a.prev_stars
      : b.prev_stars - a.prev_stars || b.prev_wins - a.prev_wins;

  const sorted = useMemo(() => [...rankings].sort(sortFn), [rankings, sortBy]);

  // Build prev rank map (id -> previous position)
  const prevRankMap = useMemo(() => {
    const prevSorted = [...rankings].sort(prevSortFn);
    const map = new Map<string, number>();
    prevSorted.forEach((c, i) => map.set(c.id, i));
    return map;
  }, [rankings, sortBy]);

  // Search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter(c =>
      c.name.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q)
    );
  }, [sorted, search]);

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

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clan name or tag..."
          className="w-full pl-8 pr-3 py-2.5 rounded-xl stadium-glass text-xs text-foreground placeholder:text-muted-foreground outline-none font-body border border-white/10 focus:border-neon-cyan/30 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs hover:text-foreground">✕</button>
        )}
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
      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl block mb-2">{search ? "🔍" : "🏰"}</span>
          <p className="text-muted-foreground text-xs font-body">
            {search ? `No clans matching "${search}"` : "No clans found"}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((c, i) => {
            // Calculate rank in full sorted list for display
            const currentRank = sorted.findIndex(s => s.id === c.id);
            const prevRank = prevRankMap.get(c.id) ?? currentRank;
            const rankDelta = prevRank - currentRank; // positive = moved up

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                  currentRank === 0 ? "stadium-glass border-game-gold/30 bg-game-gold/[0.04]"
                  : currentRank < 3 ? "stadium-glass border-white/10"
                  : "bg-white/[0.02] border-white/5"
                }`}
              >
                {/* Rank + delta */}
                <div className="w-8 text-center flex-shrink-0">
                  {currentRank < 3 ? (
                    <span className="text-lg">{MEDAL[currentRank]}</span>
                  ) : (
                    <span className="font-display text-xs text-muted-foreground tabular-nums">{currentRank + 1}</span>
                  )}
                  {rankDelta !== 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: rankDelta > 0 ? 4 : -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center"
                    >
                      {rankDelta > 0 ? (
                        <span className="text-[8px] font-display font-bold text-neon-green tabular-nums">▲{rankDelta}</span>
                      ) : (
                        <span className="text-[8px] font-display font-bold text-destructive tabular-nums">▼{Math.abs(rankDelta)}</span>
                      )}
                    </motion.div>
                  )}
                  {rankDelta === 0 && (
                    <span className="text-[7px] text-muted-foreground/40 block">—</span>
                  )}
                </div>

                {/* Emoji */}
                <span className="text-xl flex-shrink-0">{c.emoji}</span>

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
                <div className="flex items-center gap-2.5 flex-shrink-0">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
