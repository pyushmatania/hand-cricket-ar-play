import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import ScrollHint from "@/components/shared/ScrollHint";
import { motion, AnimatePresence } from "framer-motion";
import ShareButton from "@/components/share/ShareButton";
import TournamentShareCard from "@/components/share/TournamentShareCard";
import LeaderboardShareCard from "@/components/share/LeaderboardShareCard";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { computePvpRecord, type PvpGame } from "@/hooks/usePvpStats";
import { useAuth } from "@/contexts/AuthContext";
import TopStatusBar from "@/components/TopStatusBar";
import RivalryCard from "@/components/RivalryCard";
import FriendStatsModal from "@/components/FriendStatsModal";
import PlayerPreviewCard from "@/components/PlayerPreviewCard";
import RankBadge from "@/components/RankBadge";
import WeeklyChallengesCard from "@/components/WeeklyChallengesCard";
import AchievementFeed from "@/components/AchievementFeed";
import PlayerAvatar from "@/components/PlayerAvatar";
import FormSparkline from "@/components/FormSparkline";
import PlayerOfTheWeek from "@/components/PlayerOfTheWeek";
import MostActiveTicker from "@/components/MostActiveTicker";

import FriendsNetworkGraph from "@/components/FriendsNetworkGraph";
import SeasonCountdown from "@/components/SeasonCountdown";
import { getRankTier } from "@/lib/rankTiers";
import { useWeeklyChallenges } from "@/hooks/useWeeklyChallenges";
import { toast } from "@/components/ui/use-toast";
import {
  createMultiplayerRoom,
  formatPostgrestError,
  logPostgrestError,
  mapCreateRoomError,
  mapInviteInsertError,
} from "@/lib/multiplayerRoom";

interface LeaderEntry {
  display_name: string;
  wins: number;
  losses: number;
  draws: number;
  high_score: number;
  total_matches: number;
  best_streak: number;
  abandons: number;
  user_id: string;
  avatar_index?: number;
  xp?: number;
  coins?: number;
  rank_tier?: string;
  current_streak?: number;
  avatar_url?: string | null;
}

interface FriendProfile {
  user_id: string;
  display_name: string;
  wins: number;
  losses: number;
  draws?: number;
  total_matches: number;
  high_score: number;
  best_streak: number;
  abandons: number;
  current_streak?: number;
  avatar_url?: string | null;
  avatar_index?: number;
  xp?: number;
  coins?: number;
  rank_tier?: string;
}

type MainTab = "friends" | "global" | "challenges" | "rivalry" | "records" | "seasons" | "rage" | "network" | "tourney";

interface TourneyLeaderEntry {
  user_id: string;
  display_name: string;
  avatar_index: number;
  avatar_url: string | null;
  tournament_wins: number;
  tournaments_played: number;
  runner_ups: number;
  best_format: string;
}

interface SeasonEntry {
  user_id: string;
  display_name: string;
  wins: number;
  losses: number;
  draws: number;
  total_matches: number;
  high_score: number;
}

interface ArchivedSeason {
  season_label: string;
  season_start: string;
  season_end: string;
}
type GameType = "ar" | "tap" | "tournament";

const getWeekRange = (weeksAgo = 0) => {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset - weeksAgo * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
};

const formatSeasonLabel = (start: Date) => {
  const weekNum = Math.ceil(((start.getTime() - new Date(start.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
  return `Week ${weekNum} • ${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(start.getTime() + 6 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
};

const SORT_OPTIONS = [
  { label: "WINS", icon: "🏆", key: "wins" as const },
  { label: "HIGH SCORE", icon: "⭐", key: "high_score" as const },
  { label: "XP", icon: "✨", key: "xp" as const },
  { label: "MATCHES", icon: "🏏", key: "total_matches" as const },
  { label: "STREAK", icon: "🔥", key: "best_streak" as const },
];

const RAGE_TITLES = [
  { title: "🏆 Comeback King", desc: "Highest best streak", stat: (e: LeaderEntry) => e.best_streak, label: "streak", color: "from-neon-green/10 to-transparent" },
  { title: "🦆 Duck Master", desc: "Most losses", stat: (e: LeaderEntry) => e.losses, label: "losses", color: "from-secondary/10 to-transparent" },
  { title: "🏳️ Rage Quitter", desc: "Most abandoned matches", stat: (e: LeaderEntry) => e.abandons, label: "abandons", color: "from-out-red/10 to-transparent" },
  { title: "🏏 The Grinder", desc: "Most matches played", stat: (e: LeaderEntry) => e.total_matches, label: "matches", color: "from-primary/10 to-transparent" },
  { title: "💯 Big Hitter", desc: "Highest score ever", stat: (e: LeaderEntry) => e.high_score, label: "runs", color: "from-score-gold/10 to-transparent" },
  { title: "🤝 Peacemaker", desc: "Most draws", stat: (e: LeaderEntry) => e.draws, label: "draws", color: "from-accent/10 to-transparent" },
  { title: "🎯 Hitman", desc: "Best win rate (10+ matches)", stat: (e: LeaderEntry) => e.total_matches >= 10 ? Math.round((e.wins / e.total_matches) * 100) : 0, label: "win%", color: "from-neon-green/10 to-transparent" },
  { title: "😵 Bottler", desc: "Worst win rate (10+ matches)", stat: (e: LeaderEntry) => e.total_matches >= 10 ? Math.round((e.losses / e.total_matches) * 100) : 0, label: "loss%", color: "from-out-red/10 to-transparent" },
  { title: "🔥 Run Machine", desc: "Most total wins", stat: (e: LeaderEntry) => e.wins, label: "wins", color: "from-secondary/10 to-transparent" },
  { title: "🪨 The Wall", desc: "Fewest abandons (10+ matches)", stat: (e: LeaderEntry) => e.total_matches >= 10 ? e.total_matches - e.abandons : 0, label: "completed", color: "from-primary/10 to-transparent" },
];

function PotwWithoutConfetti({ player, loading }: { player: any; loading?: boolean }) {
  return <PlayerOfTheWeek player={player} loading={loading} />;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<MainTab>("friends");
  const [sortBy, setSortBy] = useState(0);
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [friendLeaders, setFriendLeaders] = useState<LeaderEntry[]>([]);
  const [rivalFriends, setRivalFriends] = useState<FriendProfile[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myStats, setMyStats] = useState<{ wins: number; total_matches: number; high_score: number; best_streak: number } | null>(null);
  const [seasonEntries, setSeasonEntries] = useState<SeasonEntry[]>([]);
  const [seasonWeeksAgo, setSeasonWeeksAgo] = useState(0);
  const [archivedSeasons, setArchivedSeasons] = useState<ArchivedSeason[]>([]);
  const [viewingArchive, setViewingArchive] = useState<string | null>(null);
  const [archiveEntries, setArchiveEntries] = useState<any[]>([]);
  const [challengeTargetId, setChallengeTargetId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [previewFriendId, setPreviewFriendId] = useState<string | null>(null);
  const [sparklines, setSparklines] = useState<Record<string, ("W" | "L" | "D")[]>>({});
  const [playerOfWeek, setPlayerOfWeek] = useState<any>(null);
  const [potwLoading, setPotwLoading] = useState(false);
  const [tourneyLeaders, setTourneyLeaders] = useState<TourneyLeaderEntry[]>([]);

  const { challenges, friendRankings, loading: challengesLoading } = useWeeklyChallenges();

  useEffect(() => {
    if (user) loadMyStats();
  }, [user]);

  useEffect(() => {
    if (mainTab === "global" || mainTab === "rage") loadGlobal();
    if (mainTab === "friends") loadFriends();
    if (mainTab === "rivalry") loadRivalFriends();
    if (mainTab === "seasons") { loadSeasonData(); loadArchivedSeasons(); triggerAutoSnapshot(); }
    if (mainTab === "tourney") loadTourneyLeaderboard();
  }, [mainTab, sortBy, seasonWeeksAgo]);

  // Load sparklines when active list changes
  useEffect(() => {
    const list = mainTab === "friends" ? friendLeaders : mainTab === "global" ? leaders : [];
    if (list.length > 0) loadSparklines(list.map(l => l.user_id));
  }, [friendLeaders, leaders, mainTab]);

  // Load player of the week when on friends or global tab
  useEffect(() => {
    if (mainTab === "friends" || mainTab === "global") loadPlayerOfWeek();
  }, [mainTab]);

  // Auto-snapshot previous season when visiting Seasons tab (at most once per session)
  const snapshotTriggeredRef = useRef(false);
  const triggerAutoSnapshot = useCallback(async () => {
    if (snapshotTriggeredRef.current) return;
    snapshotTriggeredRef.current = true;
    try {
      await supabase.functions.invoke("season-snapshot");
    } catch { /* silent */ }
  }, []);

  const loadMyStats = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("wins, total_matches, high_score, best_streak").eq("user_id", user.id).single();
    if (data) setMyStats(data as any);
  };

  const loadGlobal = async () => {
    const col = SORT_OPTIONS[sortBy].key;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, wins, losses, draws, high_score, total_matches, best_streak, abandons, user_id, avatar_index, xp, coins, rank_tier, current_streak, avatar_url")
      .gt("total_matches", 0)
      .order(col, { ascending: false })
      .limit(50);
    if (data) {
      setLeaders(data as unknown as LeaderEntry[]);
      if (user) {
        const idx = data.findIndex((p: any) => p.user_id === user.id);
        setMyRank(idx >= 0 ? idx + 1 : null);
      }
    }
  };

  const loadFriends = async () => {
    if (!user) return;
    const { data: friendRows } = await supabase.from("friends").select("friend_id").eq("user_id", user.id);
    if (!friendRows) { setFriendLeaders([]); return; }
    const ids = [user.id, ...friendRows.map((f: any) => f.friend_id)];
    const col = SORT_OPTIONS[sortBy].key;
    const [profilesRes, pvpRes] = await Promise.all([
      supabase.from("profiles")
        .select("display_name, wins, losses, draws, high_score, total_matches, best_streak, abandons, user_id, avatar_index, xp, coins, rank_tier, current_streak, avatar_url")
        .in("user_id", ids),
      supabase.from("multiplayer_games")
        .select("id, host_id, guest_id, host_score, guest_score, winner_id, status, abandoned_by, created_at, game_type")
        .in("status", ["finished", "abandoned"])
        .or(ids.map(id => `host_id.eq.${id}`).join(","))
        .limit(1000),
    ]);
    
    const profiles = profilesRes.data || [];
    const pvpGames = (pvpRes.data as unknown as PvpGame[]) || [];
    
    // Build PvP record per user
    const pvpByUser: Record<string, PvpGame[]> = {};
    for (const g of pvpGames) {
      if (ids.includes(g.host_id)) {
        if (!pvpByUser[g.host_id]) pvpByUser[g.host_id] = [];
        pvpByUser[g.host_id].push(g);
      }
      if (g.guest_id && ids.includes(g.guest_id)) {
        if (!pvpByUser[g.guest_id]) pvpByUser[g.guest_id] = [];
        pvpByUser[g.guest_id].push(g);
      }
    }
    
    // Combine AI + PvP stats
    const combined: LeaderEntry[] = profiles.map((p: any) => {
      const pvp = pvpByUser[p.user_id] ? computePvpRecord(pvpByUser[p.user_id], p.user_id) : null;
      return {
        ...p,
        wins: p.wins + (pvp?.wins || 0),
        losses: p.losses + (pvp?.losses || 0),
        draws: p.draws + (pvp?.draws || 0),
        total_matches: p.total_matches + (pvp?.totalGames || 0),
        high_score: Math.max(p.high_score, pvp?.highScore || 0),
        best_streak: Math.max(p.best_streak, pvp?.bestStreak || 0),
        abandons: p.abandons + (pvp?.abandons || 0),
      };
    });
    
    // Sort by selected column
    combined.sort((a, b) => (b[col] ?? 0) - (a[col] ?? 0));
    setFriendLeaders(combined);
  };

  const loadRivalFriends = async () => {
    if (!user) return;
    const { data: friendRows } = await supabase.from("friends").select("friend_id").eq("user_id", user.id);
    if (!friendRows || !friendRows.length) { setRivalFriends([]); return; }
    const ids = friendRows.map((f: any) => f.friend_id);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, wins, losses, draws, total_matches, high_score, best_streak, abandons, current_streak, avatar_url, avatar_index, xp, coins, rank_tier")
      .in("user_id", ids);
    if (data) setRivalFriends(data as unknown as FriendProfile[]);
  };

  const loadSparklines = async (userIds: string[]) => {
    if (!userIds.length) return;
    const { data } = await supabase
      .from("matches")
      .select("user_id, result, created_at")
      .in("user_id", userIds)
      .order("created_at", { ascending: false })
      .limit(userIds.length * 10);
    if (!data) return;
    const map: Record<string, ("W" | "L" | "D")[]> = {};
    for (const m of data) {
      if (!map[m.user_id]) map[m.user_id] = [];
      if (map[m.user_id].length < 10) {
        map[m.user_id].push(m.result === "win" ? "W" : m.result === "loss" ? "L" : "D");
      }
    }
    for (const uid of Object.keys(map)) {
      map[uid] = map[uid].reverse();
    }
    setSparklines(map);
  };

  const loadPlayerOfWeek = async () => {
    setPotwLoading(true);
    try {
      const { start: thisStart, end: thisEnd } = getWeekRange(0);
      const { start: lastStart, end: lastEnd } = getWeekRange(1);
      const [thisWeekRes, lastWeekRes] = await Promise.all([
        supabase.from("matches").select("user_id, result, user_score").gte("created_at", thisStart.toISOString()).lte("created_at", thisEnd.toISOString()),
        supabase.from("matches").select("user_id, result, user_score").gte("created_at", lastStart.toISOString()).lte("created_at", lastEnd.toISOString()),
      ]);
      const thisWeek = thisWeekRes.data || [];
      const lastWeek = lastWeekRes.data || [];
      const twStats: Record<string, { wins: number; matches: number; highScore: number }> = {};
      for (const m of thisWeek) {
        if (!twStats[m.user_id]) twStats[m.user_id] = { wins: 0, matches: 0, highScore: 0 };
        twStats[m.user_id].matches++;
        if (m.result === "win") twStats[m.user_id].wins++;
        twStats[m.user_id].highScore = Math.max(twStats[m.user_id].highScore, m.user_score);
      }
      const lwStats: Record<string, { wins: number; matches: number }> = {};
      for (const m of lastWeek) {
        if (!lwStats[m.user_id]) lwStats[m.user_id] = { wins: 0, matches: 0 };
        lwStats[m.user_id].matches++;
        if (m.result === "win") lwStats[m.user_id].wins++;
      }
      let bestPlayer: string | null = null;
      let bestImprovement = -Infinity;
      let bestData: any = null;
      for (const [uid, tw] of Object.entries(twStats)) {
        if (tw.matches < 3) continue;
        const twWinRate = Math.round((tw.wins / tw.matches) * 100);
        const lw = lwStats[uid];
        const lwWinRate = lw && lw.matches >= 3 ? Math.round((lw.wins / lw.matches) * 100) : 0;
        const improvement = twWinRate - lwWinRate;
        if (improvement > bestImprovement || (improvement === bestImprovement && tw.wins > (bestData?.weekWins ?? 0))) {
          bestImprovement = improvement;
          bestPlayer = uid;
          bestData = { weekWins: tw.wins, weekMatches: tw.matches, weekHighScore: tw.highScore, weekWinRate: twWinRate, improvement: Math.max(0, improvement) };
        }
      }
      if (bestPlayer && bestData) {
        const { data: profile } = await supabase.from("profiles")
          .select("display_name, avatar_url, avatar_index")
          .eq("user_id", bestPlayer).single();
        if (profile) {
          setPlayerOfWeek({ ...bestData, user_id: bestPlayer, display_name: (profile as any).display_name, avatar_url: (profile as any).avatar_url, avatar_index: (profile as any).avatar_index });
        }
      } else {
        setPlayerOfWeek(null);
      }
    } catch {
      setPlayerOfWeek(null);
    } finally {
      setPotwLoading(false);
    }
  };

  const challengeFriend = async (friendId: string, gameType: GameType) => {
    if (!user) return;
    const { data: game, error: gameError } = await createMultiplayerRoom(user.id, gameType, friendId);
    if (gameError || !game) {
      if (gameError) logPostgrestError("leaderboard challenge create room failed", gameError, { host_id: user.id, to_user_id: friendId, game_type: gameType });
      toast({ title: "Battle room failed", description: gameError ? `${mapCreateRoomError(gameError)} — ${formatPostgrestError(gameError)}` : "Battle room creation returned no room data." });
      return;
    }
    const invitePayload = { game_id: (game as any).id, from_user_id: user.id, to_user_id: friendId, game_type: gameType, expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() } as any;
    const { error: inviteError } = await supabase.from("match_invites").insert(invitePayload);
    if (inviteError) {
      logPostgrestError("leaderboard challenge invite insert failed", inviteError, { payload: invitePayload });
      await supabase.from("multiplayer_games").update({ status: "cancelled" as any, phase: "abandoned" as any }).eq("id", (game as any).id);
      toast({ title: "Battle invite failed", description: `${mapInviteInsertError(inviteError)} — ${formatPostgrestError(inviteError)}` });
      return;
    }
    toast({ title: "Battle invite sent", description: "Waiting room opened. Waiting for opponent..." });
    navigate(`/game/multiplayer?game=${(game as any).id}`);
  };

  const loadSeasonData = async () => {
    const { start, end } = getWeekRange(seasonWeeksAgo);
    const { data: matches } = await supabase.from("matches").select("user_id, result, user_score").gte("created_at", start.toISOString()).lte("created_at", end.toISOString());
    if (!matches || !matches.length) { setSeasonEntries([]); return; }
    const statsMap: Record<string, SeasonEntry> = {};
    for (const m of matches) {
      if (!statsMap[m.user_id]) statsMap[m.user_id] = { user_id: m.user_id, display_name: "", wins: 0, losses: 0, draws: 0, total_matches: 0, high_score: 0 };
      const s = statsMap[m.user_id];
      s.total_matches++;
      if (m.result === "win") s.wins++;
      else if (m.result === "loss") s.losses++;
      else s.draws++;
      s.high_score = Math.max(s.high_score, m.user_score);
    }
    const userIds = Object.keys(statsMap);
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
    if (profiles) profiles.forEach((p: any) => { if (statsMap[p.user_id]) statsMap[p.user_id].display_name = p.display_name; });
    setSeasonEntries(Object.values(statsMap).sort((a, b) => b.wins - a.wins));
  };

  const loadArchivedSeasons = async () => {
    const { data } = await supabase.from("season_snapshots").select("season_label, season_start, season_end").order("season_start", { ascending: false }).limit(20);
    if (data) {
      const unique = data.filter((d: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.season_label === d.season_label) === i);
      setArchivedSeasons(unique as ArchivedSeason[]);
    }
  };

  const loadTourneyLeaderboard = async () => {
    try {
      const { data: participants } = await supabase
        .from("tournament_participants")
        .select("user_id, placement, tournament_id, tournaments(format)")
        .not("placement", "is", null);
      if (!participants || !participants.length) { setTourneyLeaders([]); return; }

      const statsMap: Record<string, { wins: number; played: number; runnerUps: number; formats: Record<string, number> }> = {};
      for (const p of participants) {
        const uid = p.user_id;
        if (!statsMap[uid]) statsMap[uid] = { wins: 0, played: 0, runnerUps: 0, formats: {} };
        statsMap[uid].played++;
        const pl = (p.placement || "").toLowerCase();
        const fmt = (p.tournaments as any)?.format || "knockout";
        if (pl.includes("champion") || pl.includes("won")) {
          statsMap[uid].wins++;
          statsMap[uid].formats[fmt] = (statsMap[uid].formats[fmt] || 0) + 1;
        }
        if (pl.includes("runner")) statsMap[uid].runnerUps++;
      }

      const userIds = Object.keys(statsMap);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_index, avatar_url")
        .in("user_id", userIds);

      const entries: TourneyLeaderEntry[] = userIds.map(uid => {
        const s = statsMap[uid];
        const profile = profiles?.find((pr: any) => pr.user_id === uid);
        const bestFormat = Object.entries(s.formats).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
        return {
          user_id: uid,
          display_name: (profile as any)?.display_name || "Player",
          avatar_index: (profile as any)?.avatar_index ?? 0,
          avatar_url: (profile as any)?.avatar_url ?? null,
          tournament_wins: s.wins,
          tournaments_played: s.played,
          runner_ups: s.runnerUps,
          best_format: bestFormat,
        };
      }).sort((a, b) => b.tournament_wins - a.tournament_wins || b.tournaments_played - a.tournaments_played);

      setTourneyLeaders(entries);
    } catch (e) { console.error("loadTourneyLeaderboard:", e); setTourneyLeaders([]); }
  };

  const loadArchive = async (seasonLabel: string) => {
    setViewingArchive(seasonLabel);
    const { data } = await supabase.from("season_snapshots").select("*").eq("season_label", seasonLabel).order("rank", { ascending: true });
    setArchiveEntries(data || []);
  };

  const getBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  const getScore = (entry: LeaderEntry) => {
    const k = SORT_OPTIONS[sortBy].key;
    return entry[k];
  };

  const activeList = mainTab === "friends" ? friendLeaders : leaders;
  const top3 = activeList.slice(0, 3);
  const rest = activeList.slice(3);
  const currentSeasonLabel = formatSeasonLabel(getWeekRange(seasonWeeksAgo).start);

  const mainTabs: { key: MainTab; label: string; icon: string }[] = [
    { key: "friends", label: "FRIENDS", icon: "👥" },
    { key: "challenges", label: "QUESTS", icon: "🎯" },
    { key: "records", label: "RECORDS", icon: "🏆" },
    { key: "tourney", label: "TOURNEY", icon: "🏅" },
    { key: "global", label: "GLOBAL", icon: "🌍" },
    { key: "seasons", label: "SEASON", icon: "📅" },
    { key: "rivalry", label: "RIVALRY", icon: "⚔️" },
    { key: "rage", label: "RAGE", icon: "😤" },
    { key: "network", label: "NETWORK", icon: "🕸️" },
  ];

  const V10_BG = "linear-gradient(180deg, hsl(220 20% 8%) 0%, hsl(220 18% 5%) 100%)";
  const LEATHER_GRAIN = "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='6' height='6' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")";
  const CONCRETE_CARD = "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)";
  const CHALK_BORDER = "2px dashed hsl(43 30% 30% / 0.25)";

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, hsl(220 20% 8%) 0%, hsl(220 18% 5%) 100%)", paddingBottom: "calc(68px + env(safe-area-inset-bottom, 16px) + 16px)" }}
    >
      {/* Leather grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: LEATHER_GRAIN, backgroundRepeat: "repeat" }} />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(220 18% 4% / 0.7) 100%)" }} />
      {/* Floodlight glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, hsl(43 90% 55% / 0.04) 0%, transparent 70%)" }} />
      <TopStatusBar />

      <div className="relative z-10 max-w-[430px] mx-auto px-4 pt-4">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                style={{
                  background: "linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(35 60% 35%) 100%)",
                  border: "2px solid hsl(43 60% 55% / 0.5)",
                  borderBottom: "4px solid hsl(35 50% 25%)",
                  boxShadow: "0 4px 16px hsl(43 90% 50% / 0.3)",
                }}
              >
                🏆
              </div>
              <div>
                <h1 className="font-display text-lg text-foreground" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Leaderboard</h1>
                <span className="font-display text-[8px] text-muted-foreground tracking-[0.2em]">COMPETE & CLIMB</span>
              </div>
            </div>
            {myStats && <RankBadge stats={myStats} compact />}
          </div>
        </motion.div>

        {/* ── Tabs — Jersey Mesh ── */}
        <ScrollHint>
          <div className="flex gap-1 mb-4 rounded-2xl p-1" style={{ background: "hsl(220 12% 8%)", border: "1px solid hsl(220 15% 14%)" }}>
            {mainTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setMainTab(t.key)}
                className="shrink-0 px-3 py-2.5 rounded-xl font-display text-[7px] tracking-widest transition-all flex items-center gap-1 relative"
                style={mainTab === t.key ? {
                  background: "linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(35 60% 35%) 100%)",
                  borderBottom: "3px solid hsl(35 50% 25%)",
                  color: "hsl(220 18% 6%)",
                  fontWeight: 700,
                  boxShadow: "0 2px 8px hsl(43 90% 50% / 0.3)",
                } : { color: "hsl(220 15% 50%)" }}
              >
                {mainTab === t.key && (
                  <div className="absolute inset-0 pointer-events-none opacity-[0.06] rounded-xl"
                    style={{ backgroundImage: "radial-gradient(circle, #fff 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
                )}
                <span className="text-sm relative z-10">{t.icon}</span>
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>
        </ScrollHint>

        {/* Sort options — Stadium Concrete chips */}
        {(mainTab === "global" || mainTab === "friends") && (
          <ScrollHint>
            <div className="flex gap-1.5 mb-4">
              {SORT_OPTIONS.map((opt, i) => (
                <button key={opt.key} onClick={() => setSortBy(i)}
                  className="shrink-0 px-3 py-2 rounded-xl font-display text-[7px] tracking-widest transition-all"
                  style={sortBy === i ? {
                    background: "hsl(207 90% 54% / 0.15)",
                    border: "2px solid hsl(207 90% 54% / 0.3)",
                    color: "hsl(207 90% 60%)",
                    boxShadow: "0 0 8px hsl(207 90% 54% / 0.15)",
                  } : {
                    background: "transparent",
                    border: "2px solid transparent",
                    color: "hsl(220 15% 35%)",
                  }}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </ScrollHint>
        )}

        {/* Most Active Today ticker */}
        {(mainTab === "global" || mainTab === "friends") && <MostActiveTicker />}

        <AnimatePresence mode="wait">
          {mainTab === "challenges" && (
            <motion.div key="challenges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {myStats && (
                <div className="mb-3">
                  <RankBadge stats={myStats} />
                </div>
              )}
              <WeeklyChallengesCard
                challenges={challenges}
                friendRankings={friendRankings}
                loading={challengesLoading}
              />
            </motion.div>
          )}

          {/* RECORDS / ACHIEVEMENT FEED TAB */}
          {mainTab === "records" && (
            <motion.div key="records" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-3 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: "hsl(43 90% 55%)" }} />
                <span className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">RECORD BREAKS & REACTIONS</span>
              </div>
              <AchievementFeed />
            </motion.div>
          )}

          {/* TOURNAMENT LEADERBOARD */}
          {mainTab === "tourney" && (
            <motion.div key="tourney" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full" style={{ background: "hsl(43 90% 55%)" }} />
                  <span className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">TOURNAMENT CHAMPIONS</span>
                </div>
                {(() => {
                  const myEntry = tourneyLeaders.find(e => user && e.user_id === user.id);
                  const myRankIdx = myEntry ? tourneyLeaders.indexOf(myEntry) : -1;
                  if (!myEntry || myRankIdx < 0) return null;
                  return (
                    <ShareButton
                      title="My Tournament Ranking 🏅"
                      text={`#${myRankIdx + 1} on the Tournament Leaderboard with ${myEntry.tournament_wins} titles!`}
                      variant="gold"
                      size="sm"
                      renderCard={() => (
                        <TournamentShareCard
                          playerName={myEntry.display_name}
                          rank={myRankIdx + 1}
                          totalPlayers={tourneyLeaders.length}
                          tournamentWins={myEntry.tournament_wins}
                          tournamentsPlayed={myEntry.tournaments_played}
                          runnerUps={myEntry.runner_ups}
                          winRate={myEntry.tournaments_played > 0 ? Math.round((myEntry.tournament_wins / myEntry.tournaments_played) * 100) : 0}
                          bestFormat={myEntry.best_format}
                        />
                      )}
                    />
                  );
                })()}
              </div>
              {tourneyLeaders.length === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={{ background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)", border: "2px solid hsl(220 15% 18%)", borderBottom: "5px solid hsl(220 15% 8%)" }}>
                  <span className="text-4xl block mb-3">🏅</span>
                  <p className="font-display text-sm font-bold text-foreground">No tournament results yet</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Play World Cup, Ashes, or Knockout to appear here!</p>
                </div>
              ) : (
                tourneyLeaders.map((entry, i) => {
                  const isMe = user && entry.user_id === user.id;
                  const formatIcons: Record<string, string> = { world_cup: "🌍", ashes: "🏺", knockout: "⚔️", ipl: "🏏" };
                  const winRate = entry.tournaments_played > 0 ? Math.round((entry.tournament_wins / entry.tournaments_played) * 100) : 0;
                  return (
                    <motion.div key={entry.user_id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="rounded-xl p-3 flex items-center gap-3"
                      style={{
                        background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
                        border: isMe ? "2px solid hsl(207 90% 54% / 0.4)" : i < 3 ? `2px solid hsl(43 80% 50% / ${0.4 - i * 0.1})` : "2px solid hsl(220 15% 18%)",
                        borderBottom: "5px solid hsl(220 15% 8%)",
                        boxShadow: i === 0 ? "0 0 20px hsl(43 90% 50% / 0.15)" : isMe ? "0 0 16px hsl(207 90% 54% / 0.1)" : undefined,
                      }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm"
                        style={{
                          background: i === 0 ? "hsl(43 80% 50% / 0.15)" : i === 1 ? "hsl(210 10% 70% / 0.15)" : i === 2 ? "hsl(25 60% 50% / 0.15)" : "hsl(220 12% 10%)",
                          color: i === 0 ? "hsl(43 90% 55%)" : i === 1 ? "hsl(210 10% 75%)" : i === 2 ? "hsl(19 100% 60%)" : "hsl(220 15% 50%)",
                        }}>
                        {i < 3 ? getBadge(i + 1) : `#${i + 1}`}
                      </div>
                      <PlayerAvatar avatarIndex={entry.avatar_index} avatarUrl={entry.avatar_url} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="font-display text-[11px] font-bold block" style={{ color: isMe ? "hsl(207 90% 60%)" : "hsl(0 0% 90%)" }}>
                          {entry.display_name}{isMe && <span className="text-[7px] ml-1" style={{ color: "hsl(207 90% 54% / 0.6)" }}>(YOU)</span>}
                        </span>
                        <span className="text-[8px] text-muted-foreground font-display">
                          {entry.tournaments_played} played • {winRate}% WR • {entry.runner_ups > 0 ? `${entry.runner_ups} 🥈` : ""}
                          {entry.best_format !== "-" && ` ${formatIcons[entry.best_format] || "🏏"} ${entry.best_format.replace("_", " ")}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-lg font-black block leading-none" style={{ color: "hsl(43 90% 55%)" }}>{entry.tournament_wins}</span>
                        <span className="text-[6px] text-muted-foreground font-display tracking-widest">TITLES</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* SEASONS TAB */}
          {mainTab === "seasons" && (
            <motion.div key="seasons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              {!viewingArchive ? (
                <>
                  <div className="rounded-xl p-3" style={{ background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)", border: "2px solid hsl(220 15% 18%)", borderBottom: "5px solid hsl(220 15% 8%)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => setSeasonWeeksAgo(w => w + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" style={{ background: "hsl(220 12% 8%)", border: "1px solid hsl(220 15% 16%)" }}>◀</button>
                      <div className="text-center">
                        <span className="font-display text-[9px] font-bold tracking-widest block" style={{ color: seasonWeeksAgo === 0 ? "hsl(4 90% 58%)" : "hsl(43 90% 55%)" }}>{seasonWeeksAgo === 0 ? "🔴 LIVE SEASON" : "PAST SEASON"}</span>
                        <span className="font-display text-[8px] text-muted-foreground">{currentSeasonLabel}</span>
                      </div>
                      <button onClick={() => setSeasonWeeksAgo(w => Math.max(0, w - 1))} disabled={seasonWeeksAgo === 0} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30" style={{ background: "hsl(220 12% 8%)", border: "1px solid hsl(220 15% 16%)" }}>▶</button>
                    </div>
                    {seasonWeeksAgo === 0 && (
                      <>
                        <div className="flex items-center gap-1.5 justify-center mb-2">
                          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(142 71% 45%)" }} />
                          <span className="text-[7px] font-display tracking-widest" style={{ color: "hsl(142 71% 45%)" }}>COMPETING NOW</span>
                        </div>
                        <SeasonCountdown endDate={getWeekRange(0).end} />
                      </>
                    )}
                  </div>
                  {seasonEntries.length === 0 ? (
                    <div className="rounded-2xl p-8 text-center" style={{ background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)", border: "2px solid hsl(220 15% 18%)", borderBottom: "5px solid hsl(220 15% 8%)" }}>
                      <span className="text-4xl block mb-3">📅</span>
                      <p className="font-display text-sm font-bold text-foreground">No matches this week</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Play matches to climb the weekly leaderboard!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {seasonEntries.map((entry, i) => {
                        const isMe = user && entry.user_id === user.id;
                        const winRate = entry.total_matches > 0 ? Math.round((entry.wins / entry.total_matches) * 100) : 0;
                        return (
                          <motion.div key={entry.user_id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className="rounded-xl p-3 flex items-center gap-3"
                            style={{
                              background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
                              border: isMe ? "2px solid hsl(207 90% 54% / 0.4)" : "2px solid hsl(220 15% 18%)",
                              borderBottom: "5px solid hsl(220 15% 8%)",
                              boxShadow: isMe ? "0 0 16px hsl(207 90% 54% / 0.1)" : undefined,
                            }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm"
                              style={{
                                background: i === 0 ? "hsl(43 80% 50% / 0.15)" : i === 1 ? "hsl(210 10% 70% / 0.15)" : i === 2 ? "hsl(25 60% 50% / 0.15)" : "hsl(220 12% 10%)",
                                color: i === 0 ? "hsl(43 90% 55%)" : i === 1 ? "hsl(210 10% 75%)" : i === 2 ? "hsl(19 100% 60%)" : "hsl(220 15% 50%)",
                              }}>
                              {i < 3 ? getBadge(i + 1) : `#${i + 1}`}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-display text-[11px] font-bold block" style={{ color: isMe ? "hsl(207 90% 60%)" : "hsl(0 0% 90%)" }}>
                                {entry.display_name || "Player"}{isMe && <span className="text-[7px] ml-1" style={{ color: "hsl(207 90% 54% / 0.6)" }}>(YOU)</span>}
                              </span>
                              <span className="text-[8px] text-muted-foreground font-display">{entry.total_matches} matches • {winRate}% WR • HS: {entry.high_score}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-display text-lg font-black block leading-none" style={{ color: "hsl(43 90% 55%)" }}>{entry.wins}</span>
                              <span className="text-[6px] text-muted-foreground font-display tracking-widest">WINS</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                  {archivedSeasons.length > 0 && (
                    <div className="mt-4">
                      <div style={{ borderBottom: CHALK_BORDER }} className="mb-3" />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 rounded-full" style={{ background: "hsl(220 15% 35%)" }} />
                        <span className="font-display text-[9px] font-bold text-muted-foreground tracking-widest">SEASON ARCHIVES</span>
                      </div>
                      <div className="space-y-1.5">
                        {archivedSeasons.map((s) => (
                          <button key={s.season_label} onClick={() => loadArchive(s.season_label)}
                            className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-colors active:scale-[0.98]"
                            style={{ background: "hsl(220 12% 8%)", border: "1px solid hsl(220 15% 16%)" }}>
                            <span className="text-lg">🏛️</span>
                            <div className="flex-1"><span className="font-display text-[10px] font-bold text-foreground block">{s.season_label}</span></div>
                            <span className="text-muted-foreground text-xs">→</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button onClick={() => { setViewingArchive(null); setArchiveEntries([]); }}
                    className="rounded-xl px-4 py-2 font-display text-[9px] font-bold text-muted-foreground tracking-widest hover:text-foreground transition-colors"
                    style={{ background: "hsl(220 12% 8%)", border: "1px solid hsl(220 15% 16%)" }}>
                    ← BACK TO SEASONS
                  </button>
                  <div className="rounded-xl p-3 text-center" style={{ background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)", border: "2px solid hsl(220 15% 18%)", borderBottom: "5px solid hsl(220 15% 8%)" }}>
                    <span className="text-2xl block mb-1">🏛️</span>
                    <span className="font-display text-[10px] font-bold tracking-widest" style={{ color: "hsl(43 90% 55%)" }}>{viewingArchive}</span>
                  </div>
                  <div className="space-y-2">
                    {archiveEntries.map((entry: any, i: number) => {
                      const isMe = user && entry.user_id === user.id;
                      return (
                        <motion.div key={entry.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                          className="rounded-xl p-3 flex items-center gap-3"
                          style={{
                            background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
                            border: isMe ? "2px solid hsl(207 90% 54% / 0.4)" : "2px solid hsl(220 15% 18%)",
                            borderBottom: "5px solid hsl(220 15% 8%)",
                          }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm"
                            style={{ background: "hsl(220 12% 10%)", color: "hsl(220 15% 50%)" }}>
                            {entry.rank <= 3 ? getBadge(entry.rank) : `#${entry.rank}`}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-display text-[11px] font-bold text-foreground block">{isMe ? "YOU" : "Player"}</span>
                            <span className="text-[8px] text-muted-foreground font-display">{entry.total_matches} matches • W{entry.wins} L{entry.losses} D{entry.draws}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-display text-lg font-black block leading-none" style={{ color: "hsl(43 90% 55%)" }}>{entry.wins}</span>
                            <span className="text-[6px] text-muted-foreground font-display tracking-widest">WINS</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* RIVALRY TAB */}
          {mainTab === "rivalry" && (
            <motion.div key="rivalry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
              {rivalFriends.length === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={{ background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)", border: "2px solid hsl(220 15% 18%)", borderBottom: "5px solid hsl(220 15% 8%)" }}>
                  <span className="text-4xl block mb-3">⚔️</span>
                  <p className="font-display text-sm font-bold text-foreground">Add friends to see rivalries!</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Play multiplayer against friends to build H2H stats</p>
                </div>
              ) : (
                rivalFriends.map((f, i) => (
                  <motion.div key={f.user_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <RivalryCard friend={f} onChallenge={(friendId) => setChallengeTargetId(friendId)} />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* RAGE STATS */}
          {mainTab === "rage" && (
            <motion.div key="rage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              {RAGE_TITLES.map((rt, i) => {
                const sorted = [...leaders].sort((a, b) => rt.stat(b) - rt.stat(a));
                const winner = sorted[0];
                if (!winner || rt.stat(winner) === 0) return null;
                const runnerUp = sorted[1];
                const third = sorted[2];
                return (
                  <motion.div key={rt.title} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="rounded-xl p-4 relative overflow-hidden"
                    style={{ background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)", border: "2px solid hsl(220 15% 18%)", borderBottom: "5px solid hsl(220 15% 8%)" }}>
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none"
                      style={{ background: "radial-gradient(circle at top right, hsl(43 90% 55% / 0.06), transparent 70%)" }} />
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{rt.title.split(" ")[0]}</span>
                      <div>
                        <span className="font-display text-[11px] font-black text-foreground block">{rt.title.split(" ").slice(1).join(" ")}</span>
                        <span className="text-[8px] text-muted-foreground">{rt.desc}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl p-2.5 mb-1.5"
                      style={{ background: "hsl(220 12% 8%)", border: "1px solid hsl(220 15% 16%)" }}>
                      <span className="text-lg">🥇</span>
                      <div className="flex-1">
                        <span className="font-display text-[10px] font-bold text-foreground">
                          {winner.display_name}{user && winner.user_id === user.id && <span style={{ color: "hsl(207 90% 54% / 0.6)" }} className="ml-1">(YOU)</span>}
                        </span>
                      </div>
                      <span className="font-display text-lg font-black" style={{ color: "hsl(43 90% 55%)" }}>{rt.stat(winner)}</span>
                      <span className="text-[7px] text-muted-foreground font-display">{rt.label}</span>
                    </div>
                    {runnerUp && rt.stat(runnerUp) > 0 && (
                      <div className="flex items-center gap-3 px-2.5 py-1.5 opacity-60">
                        <span className="text-sm">🥈</span>
                        <span className="font-display text-[9px] text-muted-foreground flex-1">{runnerUp.display_name}{user && runnerUp.user_id === user.id && <span style={{ color: "hsl(207 90% 54% / 0.6)" }} className="ml-1">(YOU)</span>}</span>
                        <span className="font-display text-sm font-bold text-muted-foreground">{rt.stat(runnerUp)}</span>
                      </div>
                    )}
                    {third && rt.stat(third) > 0 && (
                      <div className="flex items-center gap-3 px-2.5 py-1 opacity-40">
                        <span className="text-xs">🥉</span>
                        <span className="font-display text-[8px] text-muted-foreground flex-1">{third.display_name}{user && third.user_id === user.id && <span style={{ color: "hsl(207 90% 54% / 0.6)" }} className="ml-1">(YOU)</span>}</span>
                        <span className="font-display text-xs font-bold text-muted-foreground">{rt.stat(third)}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* FRIENDS NETWORK */}
          {mainTab === "network" && (
            <motion.div key="network" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <FriendsNetworkGraph onSelectFriend={(fid) => {
                const fp = friendLeaders.find(f => f.user_id === fid);
                if (fp) setSelectedFriendId(fid);
              }} />
            </motion.div>
          )}

          {/* GLOBAL & FRIENDS RANKINGS */}
          {(mainTab === "global" || mainTab === "friends") && (
            <motion.div key={`${mainTab}-${sortBy}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeList.length === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={{ background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)", border: "2px solid hsl(220 15% 18%)", borderBottom: "5px solid hsl(220 15% 8%)" }}>
                  <span className="text-4xl block mb-3">{mainTab === "friends" ? "👥" : "🏟️"}</span>
                  <p className="font-display text-sm font-bold text-foreground">{mainTab === "friends" ? "Add friends to see rankings!" : "No players yet"}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{mainTab === "friends" ? "Go to the Friends tab to add players" : "Be the first to play!"}</p>
                </div>
              ) : (
                <>
                  <PotwWithoutConfetti player={playerOfWeek} loading={potwLoading} />

                  {/* Top 3 podium — Stadium Concrete 3D */}
                  {top3.length >= 3 && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex items-end justify-center gap-2 mb-6 pt-4">
                      {[top3[1], top3[0], top3[2]].map((p, i) => {
                        const heights = [96, 128, 80];
                        const isMe = user && p.user_id === user.id;
                        const tier = getRankTier(p);
                        const podiumColors = [
                          { border: "hsl(210 10% 70%)", glow: "0 0 16px hsl(210 10% 70% / 0.2)", bg: "linear-gradient(180deg, hsl(210 10% 20%) 0%, hsl(210 10% 14%) 100%)" },
                          { border: "hsl(43 80% 50%)", glow: "0 0 30px hsl(43 90% 50% / 0.3)", bg: "linear-gradient(180deg, hsl(43 30% 18%) 0%, hsl(43 25% 12%) 100%)" },
                          { border: "hsl(25 60% 50%)", glow: "0 0 12px hsl(25 60% 50% / 0.15)", bg: "linear-gradient(180deg, hsl(25 30% 18%) 0%, hsl(220 12% 9%) 100%)" },
                        ];
                        const crownSize = ["text-xl", "text-3xl", "text-lg"];
                        const crowns = ["🥈", "👑", "🥉"];
                        return (
                          <motion.div key={p.user_id}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.12, type: "spring", stiffness: 200, damping: 20 }}
                            className={`flex flex-col items-center ${mainTab === "friends" && !isMe ? "cursor-pointer active:scale-[0.97] transition-transform" : ""}`}
                            onClick={() => { if (mainTab === "friends" && !isMe) setPreviewFriendId(p.user_id); }}>
                            <motion.span
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                              className={`${crownSize[i]} mb-1 drop-shadow-lg`}>{crowns[i]}</motion.span>
                            <div className="mb-1.5 relative">
                              <div className="rounded-full" style={{ border: `3px solid ${podiumColors[i].border}`, boxShadow: podiumColors[i].glow }}>
                                <PlayerAvatar avatarUrl={p.avatar_url} avatarIndex={p.avatar_index ?? 0} size="sm" />
                              </div>
                              {(p.current_streak ?? 0) >= 3 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ background: "hsl(4 90% 55%)", border: "2px solid hsl(220 12% 8%)" }}>
                                  <span className="text-[7px]">🔥</span>
                                </div>
                              )}
                            </div>
                            {/* Podium pillar — Stadium Concrete */}
                            <div className="w-[5.5rem] rounded-t-2xl flex flex-col items-center justify-center px-2 relative overflow-hidden"
                              style={{
                                height: heights[i],
                                background: podiumColors[i].bg,
                                border: `2px solid ${podiumColors[i].border}`,
                                borderBottom: `5px solid hsl(220 15% 6%)`,
                                boxShadow: podiumColors[i].glow,
                              }}>
                              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                              <span className="font-display text-2xl" style={{ color: i === 1 ? "hsl(43 90% 55%)" : "hsl(0 0% 90%)", textShadow: i === 1 ? "0 0 15px hsl(43 90% 55% / 0.4)" : "none" }}>
                                {getScore(p)}
                              </span>
                              <span className="text-[6px] text-muted-foreground font-display tracking-widest">{SORT_OPTIONS[sortBy].label}</span>
                              {(p.xp ?? 0) > 0 && (
                                <span className="text-[6px] font-display mt-0.5" style={{ color: "hsl(207 90% 60%)" }}>✨{p.xp}</span>
                              )}
                            </div>
                            {/* Name plate */}
                            <div className="w-[5.5rem] rounded-b-xl py-1.5 text-center"
                              style={{
                                borderLeft: `2px solid ${podiumColors[i].border}40`,
                                borderRight: `2px solid ${podiumColors[i].border}40`,
                                borderBottom: `2px solid ${podiumColors[i].border}40`,
                                background: `${podiumColors[i].border}08`,
                              }}>
                              <span className="text-[8px] font-display font-bold block truncate px-1" style={{ color: isMe ? "hsl(207 90% 60%)" : "hsl(0 0% 90%)" }}>{p.display_name}{isMe && " ★"}</span>
                              <span className={`text-[6px] ${tier.color} font-display`}>{tier.emoji} {tier.name}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Chalk divider */}
                  <div className="mb-3" style={{ borderBottom: CHALK_BORDER }} />

                  {/* Ranked list — Stadium Concrete cards */}
                  <div className="space-y-2">
                    {rest.map((player, i) => {
                      const isMe = user && player.user_id === user.id;
                      const winRate = player.total_matches > 0 ? Math.round((player.wins / player.total_matches) * 100) : 0;
                      const tier = getRankTier(player);
                      return (
                        <motion.div key={player.user_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 300, damping: 25 }}
                          onClick={() => { if (mainTab === "friends" && !isMe) setPreviewFriendId(player.user_id); }}
                          className={`rounded-2xl p-3 flex items-center gap-3 ${mainTab === "friends" && !isMe ? "cursor-pointer active:scale-[0.98] transition-transform" : ""}`}
                          style={{
                            background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
                            border: isMe ? "2px solid hsl(207 90% 54% / 0.4)" : "2px solid hsl(220 15% 18%)",
                            borderBottom: "5px solid hsl(220 15% 8%)",
                            boxShadow: isMe ? "0 0 16px hsl(207 90% 54% / 0.15)" : "0 4px 16px rgba(0,0,0,0.3)",
                          }}>
                          {/* Rank number */}
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-xs"
                            style={isMe ? {
                              background: "linear-gradient(180deg, hsl(207 90% 54%) 0%, hsl(207 90% 40%) 100%)",
                              borderBottom: "3px solid hsl(207 90% 30%)",
                              color: "white",
                            } : {
                              background: "hsl(220 12% 8%)",
                              borderBottom: "3px solid hsl(220 15% 6%)",
                              color: "hsl(220 15% 50%)",
                            }}>
                            #{i + 4}
                          </div>
                          <div className="rounded-full" style={{ border: "2px solid hsl(43 60% 45% / 0.3)" }}>
                            <PlayerAvatar avatarUrl={player.avatar_url} avatarIndex={player.avatar_index ?? 0} size="sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-display text-xs font-bold" style={{ color: isMe ? "hsl(207 90% 60%)" : "hsl(0 0% 90%)" }}>
                                {player.display_name}{isMe && <span className="text-[7px] ml-1" style={{ color: "hsl(207 90% 54% / 0.6)" }}>(YOU)</span>}
                              </span>
                              <span className={`text-[7px] ${tier.color} font-display`}>{tier.emoji}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] text-muted-foreground font-body">{player.total_matches} matches • {winRate}% WR</span>
                              {(player.xp ?? 0) > 0 && <span className="text-[6px] font-display" style={{ color: "hsl(207 90% 54% / 0.6)" }}>✨{player.xp}</span>}
                            </div>
                          </div>
                          {sparklines[player.user_id]?.length > 0 && (
                            <FormSparkline results={sparklines[player.user_id]} />
                          )}
                          <div className="text-right">
                            <span className="font-display text-lg block leading-none" style={{ color: "hsl(43 90% 55%)" }}>{getScore(player)}</span>
                            <span className="text-[6px] text-muted-foreground font-display tracking-widest">{SORT_OPTIONS[sortBy].label}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Your position — Stadium Concrete card */}
        {mainTab === "global" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-5 rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
              border: "2px solid hsl(207 90% 54% / 0.3)",
              borderBottom: "5px solid hsl(220 15% 8%)",
              boxShadow: "0 0 16px hsl(207 90% 54% / 0.12)",
            }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg"
              style={{
                background: "linear-gradient(180deg, hsl(207 90% 54%) 0%, hsl(207 90% 40%) 100%)",
                borderBottom: "4px solid hsl(207 90% 30%)",
                boxShadow: "0 4px 12px hsl(207 90% 54% / 0.3)",
              }}>
              {user ? "🏏" : "👤"}
            </div>
            <div className="flex-1">
              <p className="text-[8px] text-muted-foreground font-display tracking-[0.2em]">YOUR RANK</p>
              <p className="font-display text-2xl text-foreground" style={{ textShadow: myRank ? "0 0 15px hsl(207 90% 54% / 0.3)" : "none" }}>
                {myRank ? `#${myRank}` : "—"}
              </p>
            </div>
            {myRank && user && (() => {
              const me = leaders.find(l => l.user_id === user.id);
              return me ? (
                <ShareButton
                  renderCard={() => (
                    <LeaderboardShareCard
                      playerName={me.display_name}
                      rank={myRank}
                      totalPlayers={leaders.length}
                      sortLabel={SORT_OPTIONS[sortBy].label}
                      sortValue={getScore(me)}
                      wins={me.wins}
                      losses={me.losses}
                      highScore={me.high_score}
                      rankTier={me.rank_tier || "Bronze"}
                      isGlobal
                    />
                  )}
                  title="🏏 My Leaderboard Rank"
                  text={`I'm ranked #${myRank} on the Hand Cricket leaderboard! 🏏🔥`}
                  variant="primary"
                  size="sm"
                />
              ) : null;
            })()}
            {!user && <p className="text-[8px] text-muted-foreground font-body">Sign in to track</p>}
          </motion.div>
        )}
      </div>

      {/* Challenge mode picker */}
      {challengeTargetId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: "hsl(220 18% 4% / 0.85)", backdropFilter: "blur(12px)" }}>
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl p-5 space-y-3"
            style={{
              background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
              border: "2px solid hsl(4 80% 50% / 0.3)",
              borderBottom: "6px solid hsl(220 15% 7%)",
              boxShadow: "0 0 40px hsl(4 90% 50% / 0.15)",
            }}
          >
            <p className="font-display text-base text-foreground" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Choose Battle Mode</p>
            <p className="text-[9px] text-muted-foreground font-body">Challenge your rival with the mode you want.</p>
            <div style={{ borderBottom: CHALK_BORDER }} className="my-2" />
            {([
              { key: "ar" as GameType, icon: "📸", label: "AR Mode", subtitle: "Futuristic AR showdown", hue: "291" },
              { key: "tap" as GameType, icon: "⚡", label: "Tap Mode", subtitle: "Arcade speed challenge", hue: "207" },
              { key: "tournament" as GameType, icon: "🏆", label: "Tournament", subtitle: "Championship clash", hue: "43" },
            ]).map((mode) => (
              <motion.button
                key={mode.key}
                whileTap={{ scale: 0.97, y: 2 }}
                onClick={() => { void challengeFriend(challengeTargetId, mode.key); setChallengeTargetId(null); }}
                className="w-full p-3.5 rounded-2xl text-left relative overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
                  border: `2px solid hsl(${mode.hue} 60% 45% / 0.4)`,
                  borderBottom: `5px solid hsl(${mode.hue} 40% 20%)`,
                  boxShadow: `0 0 16px hsl(${mode.hue} 60% 50% / 0.1)`,
                }}
              >
                <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                  style={{ backgroundImage: "radial-gradient(circle, #fff 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `hsl(${mode.hue} 40% 15%)`, border: `1px solid hsl(${mode.hue} 50% 35% / 0.3)` }}>
                    {mode.icon}
                  </div>
                  <div>
                    <p className="text-sm font-display text-foreground tracking-wider">{mode.label}</p>
                    <p className="text-[9px] text-muted-foreground font-body">{mode.subtitle}</p>
                  </div>
                </div>
              </motion.button>
            ))}
            <button onClick={() => setChallengeTargetId(null)}
              className="w-full py-2.5 text-xs text-muted-foreground font-body hover:text-foreground transition-colors">Cancel</button>
          </motion.div>
        </div>
      )}
      {previewFriendId && (() => {
        const fl = friendLeaders.find(f => f.user_id === previewFriendId);
        if (!fl) return null;
        return (
          <PlayerPreviewCard
            player={{ ...fl, avatar_index: fl.avatar_index ?? 0 }}
            onClose={() => setPreviewFriendId(null)}
            onViewFull={() => { setPreviewFriendId(null); setSelectedFriendId(fl.user_id); }}
            onChallenge={() => { setPreviewFriendId(null); setChallengeTargetId(fl.user_id); }}
          />
        );
      })()}
      {selectedFriendId && (() => {
        const fl = friendLeaders.find(f => f.user_id === selectedFriendId);
        if (!fl) return null;
        return (
          <FriendStatsModal
            friend={{ ...fl, avatar_index: fl.avatar_index ?? 0 }}
            onClose={() => setSelectedFriendId(null)}
            onChallenge={(friendId) => { setSelectedFriendId(null); setChallengeTargetId(friendId); }}
          />
        );
      })()}
    </div>
  );
}
