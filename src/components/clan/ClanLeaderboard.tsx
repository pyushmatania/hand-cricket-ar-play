import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import V10Button from "@/components/shared/V10Button";
import V10PlayerAvatar from "@/components/shared/V10PlayerAvatar";

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
  trophyCounts: { gold: number; silver: number; bronze: number };
}

interface ClanTrophy {
  id: string;
  season_label: string;
  rank: number;
  trophy_type: string;
  war_wins: number;
  total_stars: number;
  created_at: string;
}

interface ClanDetailData {
  clan: ClanRanking;
  members: { user_id: string; display_name: string; role: string; avatar_index: number; donated_cards: number }[];
  warHistory: { id: string; opp_name: string; opp_emoji: string; my_stars: number; opp_stars: number; won: boolean; draw: boolean; created_at: string }[];
  trophies: ClanTrophy[];
}

const ROLE_LABELS: Record<string, string> = { leader: "👑 Leader", co_leader: "⚔️ Co-Leader", elder: "🛡️ Elder", member: "🏏 Member" };
const ROLE_COLORS: Record<string, string> = { leader: "text-neon-cyan", co_leader: "text-neon-green", elder: "text-game-gold", member: "text-muted-foreground" };
const ROLE_ORDER: Record<string, number> = { leader: 0, co_leader: 1, elder: 2, member: 3 };

export default function ClanLeaderboard() {
  const [rankings, setRankings] = useState<ClanRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"wins" | "stars">("wins");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<ClanDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [clansRes, warsRes, memberCountsRes, trophiesRes] = await Promise.all([
        supabase.from("clans").select("id, name, tag, emoji, level, max_members"),
        supabase.from("clan_wars").select("clan_a_id, clan_b_id, clan_a_stars, clan_b_stars, winner_clan_id, created_at").eq("status", "ended"),
        supabase.from("clan_members").select("clan_id"),
        supabase.from("clan_trophies").select("clan_id, trophy_type"),
      ]);

      const clans = clansRes.data;
      if (!clans?.length) { setLoading(false); return; }

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const warList = (warsRes.data as any[]) || [];

      const countMap = new Map<string, number>();
      (memberCountsRes.data || []).forEach((m: any) => {
        countMap.set(m.clan_id, (countMap.get(m.clan_id) || 0) + 1);
      });

      // Trophy counts per clan
      const trophyMap = new Map<string, { gold: number; silver: number; bronze: number }>();
      (trophiesRes.data || []).forEach((t: any) => {
        if (!trophyMap.has(t.clan_id)) trophyMap.set(t.clan_id, { gold: 0, silver: 0, bronze: 0 });
        const tc = trophyMap.get(t.clan_id)!;
        if (t.trophy_type === "gold") tc.gold++;
        else if (t.trophy_type === "silver") tc.silver++;
        else tc.bronze++;
      });

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
        id: c.id, name: c.name, tag: c.tag, emoji: c.emoji, level: c.level,
        member_count: countMap.get(c.id) || 0,
        war_wins: allStats.get(c.id)?.wins || 0,
        total_stars: allStats.get(c.id)?.stars || 0,
        prev_wins: prevStats.get(c.id)?.wins || 0,
        prev_stars: prevStats.get(c.id)?.stars || 0,
        trophyCounts: trophyMap.get(c.id) || { gold: 0, silver: 0, bronze: 0 },
      }));

      setRankings(ranked);
      setLoading(false);
    })();
  }, []);

  const sortFn = (a: ClanRanking, b: ClanRanking) =>
    sortBy === "wins"
      ? b.war_wins - a.war_wins || b.total_stars - a.total_stars
      : b.total_stars - a.total_stars || b.war_wins - a.war_wins;

  const prevSortFn = (a: ClanRanking, b: ClanRanking) =>
    sortBy === "wins"
      ? b.prev_wins - a.prev_wins || b.prev_stars - a.prev_stars
      : b.prev_stars - a.prev_stars || b.prev_wins - a.prev_wins;

  const sorted = useMemo(() => [...rankings].sort(sortFn), [rankings, sortBy]);
  const prevRankMap = useMemo(() => {
    const prevSorted = [...rankings].sort(prevSortFn);
    const map = new Map<string, number>();
    prevSorted.forEach((c, i) => map.set(c.id, i));
    return map;
  }, [rankings, sortBy]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter(c => c.name.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q));
  }, [sorted, search]);

  const openDetail = useCallback(async (clan: ClanRanking) => {
    setDetailLoading(true);
    setDetail({ clan, members: [], warHistory: [], trophies: [] });

    // Fetch members, wars, and trophies in parallel
    const [membersRes, warsRes, trophiesRes] = await Promise.all([
      supabase.from("clan_members").select("user_id, role, donated_cards").eq("clan_id", clan.id),
      supabase.from("clan_wars").select("*")
        .or(`clan_a_id.eq.${clan.id},clan_b_id.eq.${clan.id}`)
        .eq("status", "ended")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("clan_trophies").select("*").eq("clan_id", clan.id).order("created_at", { ascending: false }),
    ]);

    const memberRows = (membersRes.data as any[]) || [];
    const warRows = (warsRes.data as any[]) || [];
    const trophies: ClanTrophy[] = (trophiesRes.data as any[]) || [];

    // Fetch profiles for members
    const userIds = memberRows.map(m => m.user_id);
    let profileMap = new Map<string, { display_name: string; avatar_index: number }>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_index").in("user_id", userIds);
      (profiles || []).forEach((p: any) => profileMap.set(p.user_id, { display_name: p.display_name, avatar_index: p.avatar_index }));
    }

    const members = memberRows.map(m => ({
      user_id: m.user_id,
      display_name: profileMap.get(m.user_id)?.display_name || "Player",
      avatar_index: profileMap.get(m.user_id)?.avatar_index ?? 0,
      role: m.role,
      donated_cards: m.donated_cards || 0,
    })).sort((a, b) => (ROLE_ORDER[a.role] ?? 3) - (ROLE_ORDER[b.role] ?? 3));

    // Fetch opponent clan names for wars
    const oppIds = [...new Set(warRows.map((w: any) => w.clan_a_id === clan.id ? w.clan_b_id : w.clan_a_id))];
    let oppMap = new Map<string, { name: string; emoji: string }>();
    if (oppIds.length > 0) {
      const { data: opps } = await supabase.from("clans").select("id, name, emoji").in("id", oppIds);
      (opps || []).forEach((o: any) => oppMap.set(o.id, { name: o.name, emoji: o.emoji }));
    }

    const warHistory = warRows.map((w: any) => {
      const isA = w.clan_a_id === clan.id;
      const oppId = isA ? w.clan_b_id : w.clan_a_id;
      const opp = oppMap.get(oppId);
      return {
        id: w.id,
        opp_name: opp?.name || "Unknown",
        opp_emoji: opp?.emoji || "🏏",
        my_stars: isA ? (w.clan_a_stars || 0) : (w.clan_b_stars || 0),
        opp_stars: isA ? (w.clan_b_stars || 0) : (w.clan_a_stars || 0),
        won: w.winner_clan_id === clan.id,
        draw: !w.winner_clan_id,
        created_at: w.created_at,
      };
    });

    setDetail({ clan, members, warHistory, trophies });
    setDetailLoading(false);
  }, []);

  const MEDAL = ["🥇", "🥈", "🥉"];

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Detail Modal */}
      <AnimatePresence>
        {detail && (
          <motion.div
            key="detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setDetail(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl"
              style={{
                background: "linear-gradient(180deg, hsl(220 15% 10%), hsl(220 12% 6%))",
                borderTop: "2px solid hsl(190 80% 50% / 0.2)",
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {detailLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="px-4 pb-6 space-y-4">
                  {/* Clan header */}
                  <div className="text-center pt-2">
                    <span className="text-5xl block mb-2">{detail.clan.emoji}</span>
                    <h3 className="font-display text-lg font-black text-foreground tracking-wider">{detail.clan.name}</h3>
                    <span className="text-[10px] text-muted-foreground font-display tracking-widest">[{detail.clan.tag}]</span>
                    <div className="flex items-center justify-center gap-6 mt-2">
                      <div className="text-center">
                        <span className="font-display text-lg font-black text-neon-cyan">Lv.{detail.clan.level}</span>
                        <span className="text-[8px] text-muted-foreground block font-display">LEVEL</span>
                      </div>
                      <div className="text-center">
                        <span className="font-display text-lg font-black text-neon-green">{detail.members.length}</span>
                        <span className="text-[8px] text-muted-foreground block font-display">MEMBERS</span>
                      </div>
                      <div className="text-center">
                        <span className="font-display text-lg font-black text-game-gold">{detail.clan.war_wins}</span>
                        <span className="text-[8px] text-muted-foreground block font-display">WAR WINS</span>
                      </div>
                    </div>
                  </div>

                  {/* War stats banner */}
                  <div className="flex gap-2">
                    <div className="flex-1 text-center py-2.5 rounded-xl bg-neon-green/10 border border-neon-green/20">
                      <p className="font-display text-xl font-black text-neon-green tabular-nums">{detail.clan.war_wins}</p>
                      <p className="font-display text-[7px] tracking-widest text-neon-green/70">WINS</p>
                    </div>
                    <div className="flex-1 text-center py-2.5 rounded-xl bg-game-gold/10 border border-game-gold/20">
                      <p className="font-display text-xl font-black text-game-gold tabular-nums">{detail.clan.total_stars}</p>
                      <p className="font-display text-[7px] tracking-widest text-game-gold/70">⭐ STARS</p>
                    </div>
                  </div>

                  {/* Trophy Cabinet */}
                  {detail.trophies.length > 0 && (
                    <div className="stadium-glass rounded-2xl p-3">
                      <div className="scoreboard-metal rounded-xl px-3 py-2 mb-3">
                        <h4 className="font-display text-[10px] tracking-widest text-neon-cyan/80 font-bold">🏆 TROPHY CABINET ({detail.trophies.length})</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {detail.trophies.slice(0, 9).map((t, ti) => {
                          const trophyEmoji = t.trophy_type === "gold" ? "🏆" : t.trophy_type === "silver" ? "🥈" : "🥉";
                          const borderColor = t.trophy_type === "gold" ? "border-game-gold/40" : t.trophy_type === "silver" ? "border-white/30" : "border-orange-600/30";
                          const bgColor = t.trophy_type === "gold" ? "bg-game-gold/[0.06]" : t.trophy_type === "silver" ? "bg-white/[0.04]" : "bg-orange-600/[0.04]";
                          return (
                            <motion.div
                              key={t.id}
                              initial={{ scale: 0, rotate: -15 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: ti * 0.08, type: "spring", stiffness: 300 }}
                              className={`text-center py-3 px-1 rounded-xl border ${borderColor} ${bgColor}`}
                            >
                              <span className="text-2xl block mb-1">{trophyEmoji}</span>
                              <p className="font-display text-[7px] font-bold text-foreground tracking-wider truncate">
                                {t.trophy_type.toUpperCase()}
                              </p>
                              <p className="text-[6px] text-muted-foreground font-body truncate mt-0.5">
                                {t.season_label}
                              </p>
                              <p className="text-[6px] text-game-gold/70 font-display tabular-nums mt-0.5">
                                {t.war_wins}W · {t.total_stars}⭐
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                      {detail.trophies.length > 9 && (
                        <p className="text-center text-[8px] text-muted-foreground mt-2 font-body">
                          +{detail.trophies.length - 9} more trophies
                        </p>
                      )}
                    </div>
                  )}

                  {/* Members */}
                  <div className="stadium-glass rounded-2xl p-3">
                    <div className="scoreboard-metal rounded-xl px-3 py-2 mb-3">
                      <h4 className="font-display text-[10px] tracking-widest text-neon-cyan/80 font-bold">MEMBERS ({detail.members.length})</h4>
                    </div>
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                      {detail.members.map(m => (
                        <div key={m.user_id} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                          <V10PlayerAvatar avatarIndex={m.avatar_index} size="sm" />
                          <div className="flex-1 min-w-0">
                            <span className="font-display text-xs font-bold text-foreground truncate block">{m.display_name}</span>
                            <span className={`text-[9px] font-display ${ROLE_COLORS[m.role] ?? "text-muted-foreground"}`}>
                              {ROLE_LABELS[m.role] ?? m.role}
                            </span>
                          </div>
                          <span className="text-[9px] text-muted-foreground font-display tabular-nums">🎴 {m.donated_cards}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* War History */}
                  <div className="stadium-glass rounded-2xl p-3">
                    <div className="scoreboard-metal rounded-xl px-3 py-2 mb-3">
                      <h4 className="font-display text-[10px] tracking-widest text-neon-cyan/80 font-bold">WAR HISTORY</h4>
                    </div>
                    {detail.warHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground text-[10px] font-body py-4">No wars played yet</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                        {detail.warHistory.map(w => (
                          <div key={w.id} className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                            w.won ? "bg-neon-green/[0.04] border-neon-green/15" : w.draw ? "bg-game-gold/[0.04] border-game-gold/15" : "bg-destructive/[0.04] border-destructive/15"
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{w.opp_emoji}</span>
                              <div>
                                <p className="font-display text-[10px] font-bold text-foreground truncate max-w-[120px]">vs {w.opp_name}</p>
                                <p className="text-[7px] font-body text-muted-foreground">
                                  {new Date(w.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-display text-xs font-black tabular-nums text-foreground">
                                {w.my_stars}⭐ vs {w.opp_stars}⭐
                              </p>
                              <p className={`font-display text-[8px] font-bold ${w.won ? "text-neon-green" : w.draw ? "text-game-gold" : "text-destructive"}`}>
                                {w.won ? "🏆 WON" : w.draw ? "🤝 DRAW" : "❌ LOST"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <V10Button variant="secondary" size="md" onClick={() => setDetail(null)} className="w-full">
                    CLOSE
                  </V10Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            const currentRank = sorted.findIndex(s => s.id === c.id);
            const prevRank = prevRankMap.get(c.id) ?? currentRank;
            const rankDelta = prevRank - currentRank;

            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openDetail(c)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors w-full text-left ${
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

                <span className="text-xl flex-shrink-0">{c.emoji}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-display text-xs font-bold text-foreground truncate">{c.name}</span>
                    <span className="text-[7px] text-muted-foreground font-display">[{c.tag}]</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground font-display tabular-nums">
                    <span>Lv.{c.level}</span>
                    <span>👥 {c.member_count}</span>
                    {(c.trophyCounts.gold > 0 || c.trophyCounts.silver > 0 || c.trophyCounts.bronze > 0) && (
                      <span className="flex items-center gap-0.5 ml-0.5">
                        {c.trophyCounts.gold > 0 && <span className="text-[7px]">🏆{c.trophyCounts.gold}</span>}
                        {c.trophyCounts.silver > 0 && <span className="text-[7px]">🥈{c.trophyCounts.silver}</span>}
                        {c.trophyCounts.bronze > 0 && <span className="text-[7px]">🥉{c.trophyCounts.bronze}</span>}
                      </span>
                    )}
                  </div>
                </div>

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
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
