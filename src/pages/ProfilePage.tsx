import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import ScrollHint from "@/components/shared/ScrollHint";
import ShareButton from "@/components/share/ShareButton";
import ProfileShareCard from "@/components/share/ProfileShareCard";
import AchievementShareCard from "@/components/share/AchievementShareCard";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TopStatusBar from "@/components/TopStatusBar";
import V10PlayerAvatar from "@/components/shared/V10PlayerAvatar";
import TrophyCase from "@/components/TrophyCase";
import RankBadge from "@/components/RankBadge";
import FriendStatsModal from "@/components/FriendStatsModal";
import XpHistoryFeed from "@/components/XpHistoryFeed";
import { usePvpStats } from "@/hooks/usePvpStats";
import { getRankTier, getNextTier, calculateRankPoints } from "@/lib/rankTiers";
import CosmeticsCarousel from "@/components/CosmeticsCarousel";
import { useTournamentPersistence } from "@/hooks/useTournamentPersistence";
import { getRewardForPlacement } from "@/lib/tournamentRewards";
import { ACHIEVEMENTS, TIER_STYLES, type Achievement, type AchievementTier } from "@/lib/achievements";

/* ─── Types ─── */
interface BallRecord {
  userMove: string | number;
  aiMove: string | number;
  runs: number | "OUT";
  description: string;
}

interface MatchRecord {
  id: string;
  mode: string;
  user_score: number;
  ai_score: number;
  result: string;
  balls_played: number;
  created_at: string;
  innings_data: BallRecord[] | null;
}

function parseMatchBalls(balls: BallRecord[] | null, _isBattingFirst: boolean) {
  if (!balls || !balls.length) return null;
  let sixes = 0, fours = 0, threes = 0, twos = 0, singles = 0, dots = 0, wickets = 0;
  let aiSixes = 0, aiFours = 0, aiDots = 0;
  balls.forEach((b) => {
    if (b.runs === "OUT") { wickets++; return; }
    const r = typeof b.runs === "number" ? b.runs : 0;
    const absR = Math.abs(r);
    if (r > 0) {
      if (absR === 6) sixes++;
      else if (absR === 4) fours++;
      else if (absR === 3) threes++;
      else if (absR === 2) twos++;
      else if (absR === 1) singles++;
      else dots++;
    } else if (r < 0) {
      if (absR === 6) aiSixes++;
      else if (absR === 4) aiFours++;
      else aiDots++;
    } else { dots++; }
  });
  return { sixes, fours, threes, twos, singles, dots, wickets, aiSixes, aiFours, aiDots, totalBalls: balls.length };
}

interface ProfileData {
  display_name: string;
  total_matches: number;
  wins: number;
  losses: number;
  draws: number;
  high_score: number;
  current_streak: number;
  best_streak: number;
  abandons: number;
  avatar_url: string | null;
  avatar_index: number;
  equipped_avatar_frame: string | null;
  equipped_bat_skin: string | null;
  equipped_vs_effect: string | null;
  equipped_button_style: string | null;
  xp: number;
  coins: number;
  rank_tier: string;
  total_sixes: number;
  total_fours: number;
  total_runs: number;
}

type TabType = "stats" | "matches" | "friends" | "trophy";

const getTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/* ── V11 Stat Row — Dark Wood Plank ── */
function StatRow({ icon, label, value, color }: { icon: string; label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#2E1A0E]/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-[9px] font-display tracking-wider" style={{ color: "#8B7355" }}>{label}</span>
      </div>
      <span className={`font-display text-sm font-black tabular-nums ${color || "text-foreground"}`}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROFILE PAGE — Doc 1 Material System
   ═══════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("stats");
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [myCode, setMyCode] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const { pvpRecord } = usePvpStats(user?.id);
  const [achieveFilter, setAchieveFilter] = useState<string>("All");
  const { getHistory } = useTournamentPersistence();
  const [tournamentStats, setTournamentStats] = useState<{ total: number; wins: number; bestPlacement: string | null; formats: Record<string, number> }>({ total: 0, wins: 0, bestPlacement: null, formats: {} });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles")
      .select("display_name, total_matches, wins, losses, draws, high_score, current_streak, best_streak, abandons, avatar_url, avatar_index, equipped_avatar_frame, equipped_bat_skin, equipped_vs_effect, equipped_button_style, xp, coins, rank_tier, total_sixes, total_fours, total_runs")
      .eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data as unknown as ProfileData); });

    supabase.from("profiles").select("invite_code").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setMyCode((data as any).invite_code || ""); });

    supabase.from("matches")
      .select("id, mode, user_score, ai_score, result, balls_played, created_at, innings_data")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setMatches(data as unknown as MatchRecord[]); });

    loadFriends();

    // Load tournament stats
    getHistory().then(entries => {
      const completed = entries.filter((e: any) => e.placement);
      const wins = completed.filter((e: any) => {
        const p = (e.placement || "").toLowerCase();
        return p.includes("champion") || p.includes("won");
      }).length;
      const formats: Record<string, number> = {};
      completed.forEach((e: any) => {
        const f = e.tournaments?.format || "unknown";
        formats[f] = (formats[f] || 0) + 1;
      });
      // Best placement priority
      const placementRank = (p: string) => {
        const l = p.toLowerCase();
        if (l.includes("champion") || l.includes("won")) return 5;
        if (l.includes("runner")) return 4;
        if (l.includes("semi")) return 3;
        if (l.includes("quarter") || l.includes("super")) return 2;
        return 1;
      };
      const best = completed.length > 0
        ? completed.reduce((b: any, e: any) => placementRank(e.placement) > placementRank(b.placement) ? e : b).placement
        : null;
      setTournamentStats({ total: completed.length, wins, bestPlacement: best, formats });
    });
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    const { data } = await supabase.from("friends").select("friend_id").eq("user_id", user.id);
    if (!data || !data.length) { setFriends([]); return; }
    const friendIds = data.map((f: any) => f.friend_id);
    const { data: profiles } = await supabase.from("profiles")
      .select("user_id, display_name, wins, losses, total_matches, high_score, best_streak, invite_code, avatar_url, avatar_index")
      .in("user_id", friendIds);
    if (profiles) setFriends(profiles);
  };

  const advancedStats = useMemo(() => {
    if (!matches.length) return null;
    const totalRuns = matches.reduce((s, m) => s + m.user_score, 0);
    const totalBalls = matches.reduce((s, m) => s + m.balls_played, 0);
    const totalAiRuns = matches.reduce((s, m) => s + m.ai_score, 0);
    const avgScore = Math.round(totalRuns / matches.length);
    const strikeRate = totalBalls ? Math.round((totalRuns / totalBalls) * 100) : 0;
    const highestWinMargin = matches.filter(m => m.result === "win").reduce((max, m) => Math.max(max, m.user_score - m.ai_score), 0);
    const biggestLoss = matches.filter(m => m.result === "loss").reduce((max, m) => Math.max(max, m.ai_score - m.user_score), 0);
    const modeCount: Record<string, number> = {};
    matches.forEach(m => { modeCount[m.mode] = (modeCount[m.mode] || 0) + 1; });
    const favMode = Object.entries(modeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "tap";
    const duckCount = matches.filter(m => m.user_score === 0).length;
    const fifties = matches.filter(m => m.user_score >= 50 && m.user_score < 100).length;
    const centuries = matches.filter(m => m.user_score >= 100).length;
    const lowestScore = Math.min(...matches.map(m => m.user_score));
    let totalSixes = 0, totalFours = 0, totalThrees = 0, totalTwos = 0, totalSingles = 0, totalDots = 0, totalWickets = 0;
    let totalAiSixes = 0, totalAiFours = 0;
    matches.forEach(m => {
      const parsed = parseMatchBalls(m.innings_data, true);
      if (parsed) {
        totalSixes += parsed.sixes; totalFours += parsed.fours; totalThrees += parsed.threes;
        totalTwos += parsed.twos; totalSingles += parsed.singles; totalDots += parsed.dots;
        totalWickets += parsed.wickets; totalAiSixes += parsed.aiSixes; totalAiFours += parsed.aiFours;
      }
    });
    const boundaryRuns = (totalSixes * 6) + (totalFours * 4);
    const boundaryPct = totalRuns > 0 ? Math.round((boundaryRuns / totalRuns) * 100) : 0;
    return {
      totalRuns, totalBalls, totalAiRuns, avgScore, strikeRate,
      highestWinMargin, biggestLoss, favMode, duckCount,
      fifties, centuries, lowestScore,
      totalSixes, totalFours, totalThrees, totalTwos, totalSingles, totalDots, totalWickets,
      totalAiSixes, totalAiFours, boundaryPct,
    };
  }, [matches]);

  const totalWins = (profile?.wins || 0) + (pvpRecord?.wins || 0);
  const totalMatches = (profile?.total_matches || 0) + (pvpRecord?.totalGames || 0);
  const totalLosses = (profile?.losses || 0) + (pvpRecord?.losses || 0);
  const totalDraws = (profile?.draws || 0) + (pvpRecord?.draws || 0);
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;
  const level = profile ? Math.floor((profile.xp || 0) / 100) + 1 : 1;
  const xpInLevel = profile ? (profile.xp || 0) % 100 : 0;
  const unlockedCount = profile ? ACHIEVEMENTS.filter((a) => a.check(profile, advancedStats)).length : 0;

  const rankStats = {
    wins: totalWins,
    total_matches: totalMatches,
    high_score: Math.max(profile?.high_score || 0, pvpRecord?.highScore || 0),
    best_streak: Math.max(profile?.best_streak || 0, pvpRecord?.bestStreak || 0),
  };
  const tier = getRankTier(rankStats);
  const { next: nextTier, progress: rankProgress, pointsNeeded } = getNextTier(rankStats);
  const rankPoints = calculateRankPoints(rankStats);

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "stats", label: "STATS", icon: "📊" },
    { key: "trophy", label: "TROPHY", icon: "🏆" },
    { key: "matches", label: "HISTORY", icon: "🏏" },
    { key: "friends", label: "FRIENDS", icon: "👥" },
  ];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = urlData.publicUrl + "?t=" + Date.now();
    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
    setUploading(false);
  };

  /* ── Rank tier color for chrome frame ── */
  const tierChrome = {
    Bronze: { border: "hsl(25 60% 35%)", glow: "hsl(25 60% 40% / 0.3)", accent: "hsl(19 100% 60%)" },
    Silver: { border: "hsl(210 10% 55%)", glow: "hsl(210 10% 60% / 0.3)", accent: "hsl(210 15% 70%)" },
    Gold: { border: "hsl(43 80% 45%)", glow: "hsl(43 90% 50% / 0.4)", accent: "hsl(43 100% 60%)" },
    Diamond: { border: "hsl(192 80% 50%)", glow: "hsl(192 90% 55% / 0.4)", accent: "hsl(192 90% 65%)" },
    Master: { border: "hsl(280 60% 55%)", glow: "hsl(280 70% 60% / 0.4)", accent: "hsl(280 80% 70%)" },
    Legend: { border: "hsl(4 70% 50%)", glow: "hsl(4 80% 55% / 0.4)", accent: "hsl(4 90% 65%)" },
  }[tier.name] || { border: "hsl(25 60% 35%)", glow: "hsl(25 60% 40% / 0.3)", accent: "hsl(19 100% 60%)" };

  return (
    <div className="min-h-screen relative overflow-hidden pb-24" style={{
      background: "linear-gradient(180deg, #1A0E05 0%, #0D0704 100%)",
    }}>
      <TopStatusBar />

      <div className="relative z-10 max-w-lg mx-auto px-3 pt-3">

        {/* ═══════════════════════════════════════════════
            V11 PLAYER CARD — Dark Wood Frame + Trophy Cabinet
            ═══════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-4"
          style={{
            background: "linear-gradient(180deg, #5C3A1E 0%, #3E2410 100%)",
            border: `3px solid #2E1A0E`,
            boxShadow: `0 6px 12px rgba(0,0,0,0.5), 0 0 20px ${tierChrome.glow}, inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -2px 0 rgba(0,0,0,0.3)`,
          }}
        >

          {/* Top rank banner — Hammered Metal */}
          <div className="relative px-4 py-3" style={{
            background: "linear-gradient(180deg, #3A3A4A, #1E293B)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)",
          }}>
            {/* Chrome rivet corners */}
            {["top-1.5 left-2", "top-1.5 right-2"].map(pos => (
              <div key={pos} className={`absolute ${pos} w-2 h-2 rounded-full`} style={{
                background: "radial-gradient(circle at 35% 35%, hsl(220 15% 55%), hsl(220 10% 25%))",
                boxShadow: "inset 0 1px 0 hsl(220 15% 65%)",
              }} />
            ))}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="text-2xl"
                >{tier.emoji}</motion.span>
                <div>
                  <span className="font-display text-[10px] font-black tracking-[0.2em] block" style={{ color: tierChrome.accent }}>
                    {tier.name.toUpperCase()} RANK
                  </span>
                  <span className="text-[8px] font-display" style={{ color: "hsl(220 10% 55%)" }}>{rankPoints} RP</span>
                </div>
              </div>
              {user ? (
                <button onClick={async () => { await signOut(); navigate("/"); }}
                  className="px-3 py-1.5 rounded-lg font-display text-[7px] font-bold tracking-wider"
                  style={{
                    background: "linear-gradient(180deg, hsl(4 50% 25%), hsl(4 40% 18%))",
                    border: "2px solid hsl(4 40% 15%)",
                    borderBottom: "3px solid hsl(4 30% 12%)",
                    color: "hsl(4 60% 65%)",
                  }}>
                  SIGN OUT
                </button>
              ) : (
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/auth")}
                  className="px-3 py-1.5 rounded-lg font-display text-[8px] font-bold tracking-wider"
                  style={{
                    background: "linear-gradient(180deg, hsl(207 90% 50%), hsl(207 90% 38%))",
                    border: "2px solid hsl(207 80% 30%)",
                    borderBottom: "3px solid hsl(207 70% 25%)",
                    color: "white",
                  }}>
                  🔐 SIGN IN
                </motion.button>
              )}
            </div>

            {/* Rank progress bar */}
            {nextTier && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[7px] text-muted-foreground font-display tracking-wider">
                    Next: {nextTier.emoji} {nextTier.name}
                  </span>
                  <span className="text-[7px] font-display" style={{ color: "hsl(220 10% 55%)" }}>{pointsNeeded} RP</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{
                  background: "linear-gradient(180deg, hsl(220 15% 10%), hsl(220 12% 14%))",
                  border: "1px solid hsl(220 10% 8%)",
                  boxShadow: "inset 0 1px 3px hsl(0 0% 0% / 0.5)",
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rankProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${tierChrome.border}, ${tierChrome.accent})`,
                      boxShadow: `0 0 8px ${tierChrome.glow}`,
                    }}
                  />
                </div>
              </div>
            )}
            {!nextTier && (
              <div className="flex items-center gap-1 mt-2">
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full" style={{ background: tierChrome.accent }} />
                <span className="text-[7px] font-display font-bold tracking-widest" style={{ color: tierChrome.accent }}>MAX RANK ACHIEVED</span>
              </div>
            )}
          </div>

          {/* Main player info on leather */}
          <div className="relative px-4 py-4">
            <div className="flex items-center gap-3">
              {/* Avatar with chrome ring */}
              <div className="relative">
                <button onClick={() => user && fileInputRef.current?.click()} className="relative group" disabled={uploading}>
                  <div className="rounded-2xl p-0.5">
                    <V10PlayerAvatar avatarUrl={profile?.avatar_url} avatarIndex={profile?.avatar_index ?? 0} size="lg"
                      level={level} xpProgress={xpInLevel} frame={profile?.equipped_avatar_frame} />
                  </div>
                  {user && (
                    <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[8px] font-display font-bold text-white tracking-wider">{uploading ? "..." : "EDIT"}</span>
                    </div>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                {/* Level badge — 3D scoreboard paint */}
                <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-lg" style={{
                  background: "linear-gradient(180deg, hsl(43 90% 50%), hsl(43 80% 38%))",
                  border: "2px solid hsl(43 70% 30%)",
                  borderBottom: "3px solid hsl(43 60% 25%)",
                  boxShadow: "0 3px 8px hsl(43 90% 50% / 0.3)",
                }}>
                  <span className="font-display text-[10px] font-black" style={{ color: "hsl(220 12% 9%)" }}>{level}</span>
                </div>
              </div>

              {/* Name + XP bar */}
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-lg text-foreground tracking-wider truncate">
                  {profile?.display_name || "PLAYER"}
                </h1>
                {/* XP bar — scoreboard paint style */}
                <div className="mt-1.5 mb-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[7px] text-muted-foreground font-display tracking-wider">LVL {level}</span>
                    <span className="text-[7px] font-display" style={{ color: "hsl(220 10% 55%)" }}>{xpInLevel}/100 XP</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{
                    background: "linear-gradient(180deg, hsl(220 15% 8%), hsl(220 12% 10%))",
                    border: "1px solid hsl(220 15% 6%)",
                    boxShadow: "inset 0 1px 3px hsl(0 0% 0% / 0.5)",
                  }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${xpInLevel}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, hsl(207 90% 50%), hsl(168 80% 50%))",
                        boxShadow: "0 0 6px hsl(207 90% 50% / 0.4)",
                      }} />
                  </div>
                </div>
                {/* Coins */}
                <div className="flex items-center gap-1.5">
                  <motion.span animate={{ rotateY: [0, 360] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="text-sm inline-block">🪙</motion.span>
                  <span className="font-display text-sm font-black" style={{ color: "hsl(43 100% 60%)" }}>{profile?.coins || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-stat ribbon — scoreboard paint on concrete */}
          <div className="grid grid-cols-4 scoreboard-metal">
            {[
              { value: totalWins, label: "WINS", color: "hsl(142 71% 55%)" },
              { value: totalLosses, label: "LOSSES", color: "hsl(4 90% 58%)" },
              { value: `${winRate}%`, label: "WIN RATE", color: "hsl(207 90% 60%)" },
              { value: Math.max(profile?.high_score || 0, pvpRecord?.highScore || 0), label: "HIGH", color: "hsl(43 100% 60%)" },
            ].map((s, i) => (
              <div key={s.label} className="text-center py-3" style={{
                borderLeft: i > 0 ? "1px solid hsl(222 15% 15%)" : undefined,
              }}>
                <span className="font-display text-xl font-black block leading-none" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[6px] text-muted-foreground font-display font-bold tracking-[0.15em]">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Equipped cosmetics */}
          <CosmeticsCarousel
            batSkin={profile?.equipped_bat_skin}
            vsEffect={profile?.equipped_vs_effect}
            avatarFrame={profile?.equipped_avatar_frame}
            buttonStyle={profile?.equipped_button_style}
          />

          {/* Form strip — chalk dots */}
          {matches.length > 0 && (
            <div className="px-3 py-2.5" style={{
              borderTop: "1px solid hsl(222 15% 15%)",
              background: "hsl(222 20% 10% / 0.5)",
            }}>
              <div className="flex items-center gap-2">
                <span className="text-[7px] text-muted-foreground font-display tracking-widest shrink-0">FORM</span>
                <div className="flex gap-1">
                  {matches.slice(0, 10).map((m) => (
                    <div key={m.id} className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-display font-black" style={{
                      background: m.result === "win" ? "hsl(142 71% 45% / 0.15)" : m.result === "loss" ? "hsl(4 90% 58% / 0.15)" : "hsl(43 100% 50% / 0.15)",
                      color: m.result === "win" ? "hsl(142 71% 55%)" : m.result === "loss" ? "hsl(4 90% 60%)" : "hsl(43 100% 60%)",
                      border: `1px solid ${m.result === "win" ? "hsl(142 71% 45% / 0.3)" : m.result === "loss" ? "hsl(4 90% 58% / 0.3)" : "hsl(43 100% 50% / 0.3)"}`,
                    }}>
                      {m.result === "win" ? "W" : m.result === "loss" ? "L" : "D"}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Share Profile */}
        {profile && (
          <div className="flex justify-center mb-4">
            <ShareButton
              title={`${profile.display_name}'s Hand Cricket Profile`}
              text={`🏏 ${profile.display_name} — ${totalWins} wins, ${winRate}% win rate, High Score: ${Math.max(profile.high_score || 0, pvpRecord?.highScore || 0)} | Hand Cricket`}
              variant="primary"
              size="md"
              renderCard={() => (
                <ProfileShareCard
                  displayName={profile.display_name}
                  rankTier={profile.rank_tier}
                  xp={profile.xp}
                  totalMatches={totalMatches}
                  wins={totalWins}
                  losses={totalLosses}
                  highScore={Math.max(profile.high_score || 0, pvpRecord?.highScore || 0)}
                  bestStreak={profile.best_streak}
                  totalSixes={profile.total_sixes}
                  totalFours={profile.total_fours}
                  winRate={winRate}
                />
              )}
            />
          </div>
        )}

        {/* ═══ Tab Switcher — 3D Jersey Mesh ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-1 mb-4 rounded-xl p-1 scoreboard-metal">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2.5 rounded-lg font-display text-[8px] font-bold tracking-widest transition-all duration-200 flex items-center justify-center gap-1"
              style={{
                background: activeTab === tab.key
                  ? "linear-gradient(180deg, hsl(207 90% 50%), hsl(207 90% 38%))"
                  : "transparent",
                border: activeTab === tab.key ? "1px solid hsl(207 80% 35%)" : "1px solid transparent",
                borderBottom: activeTab === tab.key ? "3px solid hsl(207 70% 28%)" : "3px solid transparent",
                color: activeTab === tab.key ? "white" : "hsl(220 10% 50%)",
                boxShadow: activeTab === tab.key ? "0 2px 8px hsl(207 90% 50% / 0.3)" : "none",
              }}>
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ═══ Tab Content ═══ */}
        <AnimatePresence mode="wait">
          {/* ═══════ STATS TAB ═══════ */}
          {activeTab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              {/* Season stats grid — 3D stadium concrete cards */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { icon: "🏏", value: totalMatches, label: "MATCHES", color: "text-foreground" },
                  { icon: "🔥", value: Math.max(profile?.best_streak || 0, pvpRecord?.bestStreak || 0), label: "STREAK", color: "" },
                  { icon: "🤝", value: totalDraws, label: "DRAWS", color: "" },
                  { icon: "🏳️", value: (profile?.abandons || 0) + (pvpRecord?.abandons || 0), label: "ABANDONS", color: "" },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="rounded-xl p-2.5 text-center"
                    style={{
                      background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                      border: "2px solid hsl(222 15% 12%)",
                      borderBottom: "4px solid hsl(222 12% 8%)",
                      boxShadow: "0 3px 8px hsl(0 0% 0% / 0.3)",
                    }}>
                    <span className="text-base block mb-0.5">{s.icon}</span>
                    <span className="font-display text-lg font-black text-foreground block leading-none">{s.value}</span>
                    <span className="text-[5px] text-muted-foreground font-display font-bold tracking-[0.2em] mt-0.5 block">{s.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* PvP Record */}
              {pvpRecord && pvpRecord.totalGames > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="rounded-xl p-3 mb-4"
                  style={{
                    background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                    border: "2px solid hsl(207 70% 40% / 0.3)",
                    borderBottom: "4px solid hsl(207 60% 25% / 0.5)",
                    boxShadow: "0 3px 12px hsl(207 90% 50% / 0.1)",
                  }}>
                  {/* Chalk divider label */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-1 h-4 rounded-full" style={{ background: "hsl(207 90% 50%)" }} />
                    <span className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">⚔️ PvP RECORD</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[
                      { icon: "⚔️", value: pvpRecord.totalGames, label: "GAMES", color: "hsl(220 10% 85%)" },
                      { icon: "🏆", value: pvpRecord.wins, label: "WINS", color: "hsl(142 71% 55%)" },
                      { icon: "💔", value: pvpRecord.losses, label: "LOSSES", color: "hsl(4 90% 58%)" },
                      { icon: "📊", value: `${pvpRecord.totalGames > 0 ? Math.round((pvpRecord.wins / pvpRecord.totalGames) * 100) : 0}%`, label: "WIN%", color: "hsl(207 90% 60%)" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <span className="text-sm block">{s.icon}</span>
                        <span className="font-display text-base font-black block leading-none mt-0.5" style={{ color: s.color }}>{s.value}</span>
                        <span className="text-[5px] font-display text-muted-foreground tracking-widest">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "HIGH", value: pvpRecord.highScore, color: "hsl(43 100% 60%)" },
                      { label: "AVG", value: pvpRecord.avgScore, color: "hsl(220 10% 85%)" },
                      { label: "BEST WIN", value: `+${pvpRecord.biggestWin}`, color: "hsl(142 71% 55%)" },
                    ].map(s => (
                      <div key={s.label} className="rounded-lg p-1.5 text-center" style={{
                        background: "hsl(222 15% 10%)",
                        border: "1px solid hsl(222 12% 15%)",
                      }}>
                        <span className="text-[5px] font-display text-muted-foreground tracking-widest block">{s.label}</span>
                        <span className="font-display text-sm font-black" style={{ color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tournament Stats */}
              {tournamentStats.total > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                  className="rounded-xl p-3 mb-4"
                  style={{
                    background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                    border: "2px solid hsl(43 50% 25% / 0.3)",
                    borderBottom: "4px solid hsl(43 40% 18% / 0.5)",
                    boxShadow: "0 3px 12px hsl(43 90% 50% / 0.08)",
                  }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full" style={{ background: "hsl(43 90% 55%)" }} />
                      <span className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">🏆 TOURNAMENTS</span>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/tournament-history")}
                      className="px-2 py-1 rounded-lg font-display text-[7px] tracking-wider"
                      style={{
                        background: "linear-gradient(180deg, hsl(43 70% 45%), hsl(43 60% 35%))",
                        border: "1px solid hsl(43 50% 30%)",
                        borderBottom: "2px solid hsl(43 40% 22%)",
                        color: "hsl(43 90% 95%)",
                      }}>
                      VIEW ALL →
                    </motion.button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[
                      { icon: "🏟️", value: tournamentStats.total, label: "PLAYED", color: "hsl(220 10% 85%)" },
                      { icon: "🏆", value: tournamentStats.wins, label: "WON", color: "hsl(43 90% 55%)" },
                      { icon: "📊", value: tournamentStats.total > 0 ? `${Math.round((tournamentStats.wins / tournamentStats.total) * 100)}%` : "0%", label: "WIN%", color: "hsl(142 71% 55%)" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <span className="text-sm block">{s.icon}</span>
                        <span className="font-display text-base font-black block leading-none mt-0.5" style={{ color: s.color }}>{s.value}</span>
                        <span className="text-[5px] font-display text-muted-foreground tracking-widest">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  {tournamentStats.bestPlacement && (
                    <div className="rounded-lg p-2 text-center" style={{
                      background: "hsl(222 15% 10%)",
                      border: "1px solid hsl(222 12% 15%)",
                    }}>
                      <span className="text-[6px] font-display text-muted-foreground tracking-widest block">BEST PLACEMENT</span>
                      <span className="font-display text-[11px] font-bold" style={{
                        color: tournamentStats.bestPlacement.toLowerCase().includes("champion") || tournamentStats.bestPlacement.toLowerCase().includes("won")
                          ? "hsl(43 90% 55%)" : "hsl(207 80% 65%)",
                      }}>{tournamentStats.bestPlacement}</span>
                    </div>
                  )}
                  {Object.keys(tournamentStats.formats).length > 0 && (
                    <div className="flex items-center justify-center gap-3 mt-2">
                      {Object.entries(tournamentStats.formats).map(([format, count]) => {
                        const icons: Record<string, string> = { worldcup: "🌍", ashes: "🏺", knockout: "🏆", auction: "💰", royale: "👑", ipl: "🏏" };
                        return (
                          <span key={format} className="font-body text-[8px] text-muted-foreground">
                            {icons[format] || "🏟️"} {count}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Batting & Performance stats */}
              {advancedStats && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  {/* Batting Stats */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: "hsl(168 80% 50%)" }} />
                    <span className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">BATTING STATS</span>
                  </div>
                  <div className="rounded-xl p-3 mb-4" style={{
                    background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                    border: "2px solid hsl(222 15% 12%)",
                    borderBottom: "4px solid hsl(222 12% 8%)",
                  }}>
                    <StatRow icon="🏃" label="Total Runs" value={advancedStats.totalRuns} />
                    <StatRow icon="⚾" label="Total Balls" value={advancedStats.totalBalls} />
                    <StatRow icon="📈" label="Average" value={advancedStats.avgScore} />
                    <StatRow icon="⚡" label="Strike Rate" value={advancedStats.strikeRate} />
                    <StatRow icon="5️⃣" label="Fifties" value={advancedStats.fifties} />
                    <StatRow icon="💯" label="Centuries" value={advancedStats.centuries} />
                    <StatRow icon="🦆" label="Ducks" value={advancedStats.duckCount} />
                  </div>

                  {/* Shot Distribution */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: "hsl(207 90% 50%)" }} />
                    <span className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">SHOT DISTRIBUTION</span>
                  </div>
                  <div className="rounded-xl p-3 mb-4" style={{
                    background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                    border: "2px solid hsl(222 15% 12%)",
                    borderBottom: "4px solid hsl(222 12% 8%)",
                  }}>
                    <StatRow icon="6️⃣" label="Sixes" value={advancedStats.totalSixes} color="text-[hsl(280_60%_65%)]" />
                    <StatRow icon="4️⃣" label="Fours" value={advancedStats.totalFours} color="text-[hsl(142_71%_55%)]" />
                    <StatRow icon="3️⃣" label="Threes" value={advancedStats.totalThrees} />
                    <StatRow icon="2️⃣" label="Twos" value={advancedStats.totalTwos} />
                    <StatRow icon="1️⃣" label="Singles" value={advancedStats.totalSingles} />
                    <StatRow icon="⏺️" label="Dots" value={advancedStats.totalDots} />
                    <StatRow icon="💥" label="Boundary %" value={`${advancedStats.boundaryPct}%`} color="text-[hsl(43_100%_60%)]" />
                    <StatRow icon="❌" label="Outs" value={advancedStats.totalWickets} color="text-[hsl(4_90%_58%)]" />
                  </div>

                  {/* Performance */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: "hsl(43 100% 50%)" }} />
                    <span className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">PERFORMANCE</span>
                  </div>
                  <div className="rounded-xl p-3 mb-4" style={{
                    background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                    border: "2px solid hsl(222 15% 12%)",
                    borderBottom: "4px solid hsl(222 12% 8%)",
                  }}>
                    <StatRow icon="📊" label="Current Streak" value={`${profile?.current_streak || 0} 🔥`} />
                    <StatRow icon="🏆" label="Biggest Win" value={`${advancedStats.highestWinMargin} runs`} color="text-[hsl(142_71%_55%)]" />
                    <StatRow icon="💔" label="Biggest Loss" value={`${advancedStats.biggestLoss} runs`} color="text-[hsl(4_90%_58%)]" />
                    <StatRow icon="🎯" label="Runs Conceded" value={advancedStats.totalAiRuns} />
                    <StatRow icon="🎮" label="Fav Mode" value={advancedStats.favMode.toUpperCase()} />
                  </div>
                </motion.div>
              )}

              {/* XP History */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full" style={{ background: "hsl(280 60% 55%)" }} />
                  <span className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">⚡ XP HISTORY</span>
                </div>
                <div className="rounded-xl p-3 mb-4" style={{
                  background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                  border: "2px solid hsl(222 15% 12%)",
                  borderBottom: "4px solid hsl(222 12% 8%)",
                }}>
                  <XpHistoryFeed />
                </div>
              </motion.div>

              {/* Achievements */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full" style={{ background: "hsl(207 90% 50%)" }} />
                  <span className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">ACHIEVEMENTS</span>
                  <span className="text-[8px] text-muted-foreground/50 font-display">{unlockedCount}/{ACHIEVEMENTS.length}</span>
                </div>
              </div>

              <div className="rounded-xl p-3 mb-3" style={{
                background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                border: "2px solid hsl(222 15% 12%)",
                borderBottom: "4px solid hsl(222 12% 8%)",
              }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[8px] text-muted-foreground font-display tracking-wider">COMPLETION</span>
                  <span className="font-display text-sm font-black" style={{ color: "hsl(207 90% 60%)" }}>{Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{
                  background: "hsl(222 15% 10%)",
                  border: "1px solid hsl(222 12% 8%)",
                  boxShadow: "inset 0 1px 3px hsl(0 0% 0% / 0.5)",
                }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, hsl(207 90% 50%), hsl(168 80% 50%))",
                      boxShadow: "0 0 6px hsl(207 90% 50% / 0.4)",
                    }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  {(["bronze", "silver", "gold", "legendary"] as AchievementTier[]).map(t => {
                    const count = ACHIEVEMENTS.filter(a => a.tier === t && a.check(profile!, advancedStats)).length;
                    const total = ACHIEVEMENTS.filter(a => a.tier === t).length;
                    return (
                      <div key={t} className="text-center">
                        <span className="font-display text-[10px] font-black text-foreground">{count}/{total}</span>
                        <span className="text-[6px] text-muted-foreground font-display tracking-widest block">{TIER_STYLES[t].label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category filter */}
              <ScrollHint>
                <div className="flex gap-1 mb-3">
                  {["All", ...Array.from(new Set(ACHIEVEMENTS.map(a => a.category)))].map(cat => (
                    <button key={cat} onClick={() => setAchieveFilter(cat)}
                      className="px-2.5 py-1.5 rounded-lg font-display text-[7px] font-bold tracking-widest whitespace-nowrap transition-all"
                      style={{
                        background: achieveFilter === cat ? "linear-gradient(180deg, hsl(207 90% 50%), hsl(207 90% 38%))" : "hsl(222 15% 12%)",
                        border: achieveFilter === cat ? "1px solid hsl(207 80% 35%)" : "1px solid hsl(222 12% 15%)",
                        borderBottom: achieveFilter === cat ? "3px solid hsl(207 70% 28%)" : "3px solid hsl(222 10% 10%)",
                        color: achieveFilter === cat ? "white" : "hsl(220 10% 45%)",
                      }}>
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </ScrollHint>

              <div className="grid grid-cols-2 gap-2">
                {ACHIEVEMENTS.filter(a => achieveFilter === "All" || a.category === achieveFilter).map((a, i) => {
                  const unlocked = profile ? a.check(profile, advancedStats) : false;
                  const tierStyle = TIER_STYLES[a.tier];
                  const prog = a.progress && profile ? a.progress(profile, advancedStats) : null;
                  const progPct = prog ? Math.min(100, Math.round((prog.current / prog.target) * 100)) : 0;
                  return (
                    <motion.div key={a.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.03 }}
                      className="rounded-xl p-3 relative overflow-hidden"
                      style={{
                        background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                        border: unlocked ? `2px solid ${a.tier === "legendary" ? "hsl(43 80% 45%)" : a.tier === "gold" ? "hsl(43 90% 55%)" : a.tier === "silver" ? "hsl(210 10% 50%)" : "hsl(25 50% 40%)"}` : "2px solid hsl(222 15% 12%)",
                        borderBottom: unlocked ? `4px solid ${a.tier === "legendary" ? "hsl(43 60% 30%)" : a.tier === "gold" ? "hsl(43 70% 35%)" : a.tier === "silver" ? "hsl(210 10% 35%)" : "hsl(220 15% 18%)"}` : "4px solid hsl(222 12% 8%)",
                        opacity: unlocked ? 1 : 0.5,
                        filter: unlocked ? "none" : "grayscale(0.5)",
                        boxShadow: unlocked ? `0 0 12px ${a.tier === "legendary" ? "hsl(43 80% 50% / 0.2)" : "transparent"}` : "none",
                      }}>
                      <div className="flex items-start gap-2 relative z-10">
                        <span className="text-xl">{a.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-display text-[10px] font-bold text-foreground block truncate">{a.title}</span>
                          <span className="text-[7px] text-muted-foreground block">{a.desc}</span>
                          <span className="text-[6px] font-display font-bold tracking-widest mt-0.5 block" style={{
                            color: a.tier === "legendary" ? "hsl(43 80% 55%)" : a.tier === "gold" ? "hsl(43 90% 60%)" : a.tier === "silver" ? "hsl(210 10% 60%)" : "hsl(19 100% 60%)",
                          }}>{tierStyle.label}</span>
                        </div>
                      </div>
                      {prog && !unlocked && (
                        <div className="mt-2 relative z-10">
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{
                            background: "hsl(222 15% 10%)",
                            border: "1px solid hsl(222 12% 8%)",
                          }}>
                            <div className="h-full rounded-full transition-all" style={{
                              width: `${progPct}%`,
                              background: "linear-gradient(90deg, hsl(207 90% 50% / 0.6), hsl(207 90% 50% / 0.3))",
                            }} />
                          </div>
                          <span className="text-[6px] text-muted-foreground font-display mt-0.5 block">{prog.current}/{prog.target}</span>
                        </div>
                      )}
                      {unlocked ? (
                        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                          <span className="text-[8px]">✅</span>
                          <ShareButton
                            renderCard={() => (
                              <AchievementShareCard
                                playerName={profile?.display_name || "Player"}
                                achievementTitle={a.title}
                                achievementIcon={a.icon}
                                achievementTier={a.tier}
                                description={a.desc}
                              />
                            )}
                            title={`🏏 Achievement: ${a.title}`}
                            text={`I just unlocked "${a.title}" in Hand Cricket! ${a.icon}`}
                            variant="ghost"
                            size="sm"
                            className="!px-1.5 !py-0.5 !text-[6px] !rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-10" style={{
                          background: "hsl(222 15% 15%)",
                          border: "1px solid hsl(222 12% 12%)",
                        }}><span className="text-[7px]">🔒</span></div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ═══════ TROPHY CASE TAB ═══════ */}
          {activeTab === "trophy" && (
            <motion.div key="trophy" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              <TrophyCase />
            </motion.div>
          )}

          {/* ═══════ MATCHES TAB ═══════ */}
          {activeTab === "matches" && (
            <motion.div key="matches" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/history")}
                className="w-full rounded-xl p-3 mb-4 flex items-center justify-between group"
                style={{
                  background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                  border: "2px solid hsl(222 15% 12%)",
                  borderBottom: "4px solid hsl(222 12% 8%)",
                }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📜</span>
                  <div>
                    <span className="font-display text-[10px] font-bold text-foreground tracking-wider block">FULL MATCH HISTORY</span>
                    <span className="text-[7px] text-muted-foreground">Filters, replay & detailed stats</span>
                  </div>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">→</span>
              </motion.button>

              {matches.length > 0 && (
                <div className="rounded-xl p-3 mb-4 flex items-center justify-between" style={{
                  background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                  border: "2px solid hsl(222 15% 12%)",
                  borderBottom: "4px solid hsl(222 12% 8%)",
                }}>
                  {[
                    { val: matches.filter(m => m.result === "win").length, label: "WON", color: "hsl(142 71% 55%)" },
                    { val: matches.filter(m => m.result === "loss").length, label: "LOST", color: "hsl(4 90% 58%)" },
                    { val: matches.filter(m => m.result === "draw").length, label: "DRAW", color: "hsl(43 100% 60%)" },
                    { val: matches.length, label: "TOTAL", color: "hsl(220 10% 85%)" },
                  ].map((s) => (
                    <div key={s.label} className="text-center flex-1">
                      <span className="font-display text-base font-black block leading-none" style={{ color: s.color }}>{s.val}</span>
                      <span className="text-[6px] text-muted-foreground font-display tracking-widest">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {matches.length === 0 ? (
                <div className="rounded-xl p-8 text-center" style={{
                  background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                  border: "2px solid hsl(222 15% 12%)",
                  borderBottom: "4px solid hsl(222 12% 8%)",
                }}>
                  <span className="text-3xl block mb-2">🏏</span>
                  <span className="font-display text-xs font-bold text-muted-foreground tracking-wider">NO MATCHES YET</span>
                  <p className="text-[9px] text-muted-foreground/60 mt-1">Play your first match to see history</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {matches.map((m, i) => {
                    const modeIcon = m.mode === "ar" ? "📸" : m.mode === "tournament" ? "🏆" : m.mode === "multiplayer" ? "⚔️" : "👆";
                    const resultColor = m.result === "win" ? "hsl(142 71% 55%)" : m.result === "loss" ? "hsl(4 90% 58%)" : "hsl(43 100% 60%)";
                    const isExpanded = expandedMatch === m.id;
                    const margin = Math.abs(m.user_score - m.ai_score);
                    const runRate = m.balls_played > 0 ? (m.user_score / m.balls_played * 6).toFixed(1) : "0.0";
                    const aiRunRate = m.balls_played > 0 ? (m.ai_score / m.balls_played * 6).toFixed(1) : "0.0";
                    const ballStats = parseMatchBalls(m.innings_data, true);

                    return (
                      <motion.div key={m.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="rounded-xl relative overflow-hidden cursor-pointer"
                        style={{
                          background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                          border: "2px solid hsl(222 15% 12%)",
                          borderBottom: "4px solid hsl(222 12% 8%)",
                          borderLeft: `3px solid ${resultColor}`,
                        }}
                        onClick={() => setExpandedMatch(isExpanded ? null : m.id)}>
                        <div className="p-3 flex items-center gap-3 relative z-10">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{
                            background: "hsl(222 15% 12%)",
                            border: "1px solid hsl(222 12% 15%)",
                          }}>{modeIcon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-[10px] font-bold tracking-wider" style={{ color: resultColor }}>{m.result.toUpperCase()}</span>
                              <span className="text-[7px] text-muted-foreground font-display px-1.5 py-0.5 rounded" style={{
                                background: "hsl(222 15% 12%)",
                              }}>{m.mode.toUpperCase()}</span>
                              {m.result !== "draw" && <span className="text-[7px] opacity-70 font-display" style={{ color: resultColor }}>by {margin}</span>}
                            </div>
                            <span className="text-[8px] text-muted-foreground">{m.balls_played} balls • RR {runRate} • {getTimeAgo(m.created_at)}</span>
                          </div>
                          <div className="text-right">
                            <div className="flex items-baseline gap-1">
                              <span className="font-display text-base font-black" style={{ color: "hsl(43 100% 60%)" }}>{m.user_score}</span>
                              <span className="text-[8px] text-muted-foreground">vs</span>
                              <span className="font-display text-base font-black" style={{ color: "hsl(168 80% 55%)" }}>{m.ai_score}</span>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }} className="overflow-hidden">
                              <div className="px-3 pb-3 pt-1 relative z-10" style={{ borderTop: "1px solid hsl(222 15% 15%)" }}>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div className="rounded-lg p-2 text-center" style={{
                                    background: "hsl(222 15% 10%)",
                                    border: "1px solid hsl(222 12% 15%)",
                                  }}>
                                    <span className="text-[7px] text-muted-foreground font-display tracking-widest block">YOU</span>
                                    <span className="font-display text-lg font-black" style={{ color: "hsl(43 100% 60%)" }}>{m.user_score}</span>
                                    <span className="text-[7px] text-muted-foreground block">RR {runRate}</span>
                                  </div>
                                  <div className="rounded-lg p-2 text-center" style={{
                                    background: "hsl(222 15% 10%)",
                                    border: "1px solid hsl(222 12% 15%)",
                                  }}>
                                    <span className="text-[7px] text-muted-foreground font-display tracking-widest block">AI</span>
                                    <span className="font-display text-lg font-black" style={{ color: "hsl(168 80% 55%)" }}>{m.ai_score}</span>
                                    <span className="text-[7px] text-muted-foreground block">RR {aiRunRate}</span>
                                  </div>
                                </div>
                                {ballStats && (
                                  <div className="rounded-lg p-2 mb-3" style={{
                                    background: "hsl(222 15% 10%)",
                                    border: "1px solid hsl(222 12% 15%)",
                                  }}>
                                    <span className="text-[7px] text-muted-foreground font-display tracking-widest block mb-2">BATTING BREAKDOWN</span>
                                    <div className="grid grid-cols-4 gap-1.5">
                                      {[
                                        { label: "6s", val: ballStats.sixes, color: "hsl(280 60% 65%)" },
                                        { label: "4s", val: ballStats.fours, color: "hsl(142 71% 55%)" },
                                        { label: "3s", val: ballStats.threes, color: "hsl(43 100% 60%)" },
                                        { label: "2s", val: ballStats.twos, color: "hsl(168 80% 55%)" },
                                        { label: "1s", val: ballStats.singles, color: "hsl(220 10% 85%)" },
                                        { label: "Dots", val: ballStats.dots, color: "hsl(220 10% 50%)" },
                                        { label: "Outs", val: ballStats.wickets, color: "hsl(4 90% 58%)" },
                                        { label: "Balls", val: ballStats.totalBalls, color: "hsl(220 10% 85%)" },
                                      ].map(s => (
                                        <div key={s.label} className="text-center py-1">
                                          <span className="font-display text-sm font-black block leading-none" style={{ color: s.color }}>{s.val}</span>
                                          <span className="text-[6px] text-muted-foreground font-display tracking-widest">{s.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {m.innings_data && Array.isArray(m.innings_data) && m.innings_data.length > 0 && (
                                  <div className="rounded-lg p-2 mb-3" style={{
                                    background: "hsl(222 15% 10%)",
                                    border: "1px solid hsl(222 12% 15%)",
                                  }}>
                                    <span className="text-[7px] text-muted-foreground font-display tracking-widest block mb-2">BALL-BY-BALL</span>
                                    <div className="flex flex-wrap gap-1">
                                      {(m.innings_data as BallRecord[]).map((b, bi) => {
                                        const isOut = b.runs === "OUT";
                                        const r = typeof b.runs === "number" ? b.runs : 0;
                                        const absR = Math.abs(r);
                                        const dotStyle = isOut ? { bg: "hsl(4 90% 58% / 0.2)", color: "hsl(4 90% 60%)" }
                                          : absR === 6 ? { bg: "hsl(280 60% 55% / 0.2)", color: "hsl(280 60% 65%)" }
                                          : absR === 4 ? { bg: "hsl(142 71% 45% / 0.2)", color: "hsl(142 71% 55%)" }
                                          : absR >= 2 ? { bg: "hsl(43 100% 50% / 0.2)", color: "hsl(43 100% 60%)" }
                                          : absR === 1 ? { bg: "hsl(207 90% 50% / 0.2)", color: "hsl(207 90% 60%)" }
                                          : { bg: "hsl(220 10% 20%)", color: "hsl(220 10% 50%)" };
                                        return (
                                          <div key={bi} className="w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-display font-black"
                                            style={{ background: dotStyle.bg, color: dotStyle.color }}>
                                            {isOut ? "W" : absR}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                                <div className="space-y-1.5 text-[8px]">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Result</span>
                                    <span className="font-bold" style={{ color: resultColor }}>
                                      {m.result === "draw" ? "Match Tied" : `${m.result === "win" ? "Won" : "Lost"} by ${margin} runs`}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Played On</span>
                                    <span className="font-bold text-foreground">{formatDate(m.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════ FRIENDS TAB ═══════ */}
          {activeTab === "friends" && (
            <motion.div key="friends" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              <div className="rounded-xl p-3 mb-4 flex items-center justify-between" style={{
                background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                border: "2px solid hsl(222 15% 12%)",
                borderBottom: "4px solid hsl(222 12% 8%)",
              }}>
                <div>
                  <span className="text-[8px] text-muted-foreground font-display tracking-widest block">YOUR INVITE CODE</span>
                  <span className="font-display text-lg font-black tracking-[0.2em]" style={{ color: "hsl(207 90% 60%)" }}>{myCode}</span>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigator.clipboard.writeText(myCode)}
                  className="px-3 py-2 rounded-xl font-display text-[9px] font-bold tracking-wider"
                  style={{
                    background: "linear-gradient(180deg, hsl(207 90% 50%), hsl(207 90% 38%))",
                    border: "2px solid hsl(207 80% 30%)",
                    borderBottom: "3px solid hsl(207 70% 25%)",
                    color: "white",
                  }}>
                  📋 COPY
                </motion.button>
              </div>

              {user && (
                <div className="rounded-xl p-3 mb-4" style={{
                  background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                  border: "2px solid hsl(222 15% 12%)",
                  borderBottom: "4px solid hsl(222 12% 8%)",
                }}>
                  <span className="text-[8px] text-muted-foreground font-display tracking-widest block mb-1">PLAYER ID</span>
                  <span className="font-display text-[11px] font-bold text-foreground">{user.email}</span>
                </div>
              )}

              {friends.length === 0 ? (
                <div className="rounded-xl p-8 text-center" style={{
                  background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                  border: "2px solid hsl(222 15% 12%)",
                  borderBottom: "4px solid hsl(222 12% 8%)",
                }}>
                  <span className="text-3xl block mb-2">👥</span>
                  <span className="font-display text-xs font-bold text-muted-foreground tracking-wider">NO FRIENDS YET</span>
                  <p className="text-[9px] text-muted-foreground/60 mt-1">Go to the Friends tab to add players</p>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/friends")}
                    className="mt-3 px-4 py-2 rounded-xl font-display text-[9px] font-bold tracking-wider"
                    style={{
                      background: "linear-gradient(180deg, hsl(142 71% 45%), hsl(142 71% 35%))",
                      border: "2px solid hsl(142 60% 28%)",
                      borderBottom: "3px solid hsl(142 50% 22%)",
                      color: "white",
                    }}>
                    ➕ ADD FRIENDS
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full" style={{ background: "hsl(207 90% 50%)" }} />
                      <span className="font-display text-[9px] font-bold text-muted-foreground tracking-[0.25em]">FRIENDS ({friends.length})</span>
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/friends")}
                      className="px-3 py-1.5 rounded-lg font-display text-[8px] font-bold tracking-wider"
                      style={{
                        background: "linear-gradient(180deg, hsl(207 90% 50%), hsl(207 90% 38%))",
                        border: "1px solid hsl(207 80% 35%)",
                        borderBottom: "3px solid hsl(207 70% 25%)",
                        color: "white",
                      }}>
                      ➕ ADD
                    </motion.button>
                  </div>
                  {friends.map((f: any, i: number) => {
                    const wr = f.total_matches > 0 ? Math.round((f.wins / f.total_matches) * 100) : 0;
                    return (
                      <motion.div key={f.user_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                        style={{
                          background: "linear-gradient(180deg, hsl(222 20% 14%), hsl(222 18% 10%))",
                          border: "2px solid hsl(222 15% 12%)",
                          borderBottom: "4px solid hsl(222 12% 8%)",
                        }}
                        onClick={() => setSelectedFriend(f)}>
                        <V10PlayerAvatar avatarUrl={f.avatar_url} avatarIndex={f.avatar_index ?? 0} size="sm" />
                        <div className="flex-1 min-w-0">
                          <span className="font-display text-[10px] font-bold text-foreground tracking-wider block truncate">{f.display_name}</span>
                          <span className="text-[7px] text-muted-foreground">{f.wins}W • {f.total_matches}G • {wr}%</span>
                        </div>
                        <div className="text-right">
                          <span className="font-display text-[10px] font-black" style={{ color: "hsl(43 100% 60%)" }}>🏆 {f.high_score}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedFriend && (
        <FriendStatsModal friend={selectedFriend} onClose={() => setSelectedFriend(null)} />
      )}
    </div>
  );
}
