import { useState, useEffect, useMemo, useCallback } from "react";
import StoneHeader from "@/components/shared/StoneHeader";
import ScrollHint from "@/components/shared/ScrollHint";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TopStatusBar from "@/components/TopStatusBar";

/* ── V10 Material Constants ── */
const V11_BG = "linear-gradient(180deg, #1A0E05 0%, #0D0704 100%)";
const WOOD_GRAIN = "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='6' height='6' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")";
const V11_CARD = "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)";
const ROPE_DIVIDER = "repeating-linear-gradient(90deg, #8B7355 0px, #8B7355 8px, transparent 8px, transparent 14px)";

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

type FilterType = "all" | "win" | "loss" | "draw";
type ModeFilter = "all" | "tap" | "ar" | "tournament" | "multiplayer";

function parseMatchBalls(balls: BallRecord[] | null) {
  if (!balls?.length) return null;
  let sixes = 0, fours = 0, threes = 0, twos = 0, singles = 0, dots = 0, wickets = 0;
  balls.forEach((b) => {
    if (b.runs === "OUT") { wickets++; return; }
    const r = typeof b.runs === "number" ? Math.abs(b.runs) : 0;
    if (r === 6) sixes++;
    else if (r === 4) fours++;
    else if (r === 3) threes++;
    else if (r === 2) twos++;
    else if (r === 1) singles++;
    else dots++;
  });
  return { sixes, fours, threes, twos, singles, dots, wickets, totalBalls: balls.length };
}

const MODE_META: Record<string, { icon: string; label: string; accent: string }> = {
  tap: { icon: "👆", label: "TAP", accent: "hsl(122,39%,49%)" },
  ar: { icon: "📸", label: "AR", accent: "hsl(291,47%,51%)" },
  tournament: { icon: "🏆", label: "TOURNEY", accent: "hsl(51,100%,50%)" },
  multiplayer: { icon: "⚔️", label: "PVP", accent: "hsl(207,90%,54%)" },
};

const RESULT_THEME = {
  win: { label: "VICTORY", badge: "W", bg: "hsl(122,39%,49%)", glow: "hsl(122,39%,49%,0.3)", border: "hsl(122,39%,49%,0.4)", text: "hsl(122,70%,55%)" },
  loss: { label: "DEFEAT", badge: "L", bg: "hsl(4,90%,58%)", glow: "hsl(4,90%,58%,0.3)", border: "hsl(4,90%,58%,0.4)", text: "hsl(4,90%,65%)" },
  draw: { label: "DRAW", badge: "D", bg: "hsl(51,100%,50%)", glow: "hsl(51,100%,50%,0.25)", border: "hsl(51,100%,50%,0.35)", text: "hsl(51,100%,60%)" },
};

export default function MatchHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultFilter, setResultFilter] = useState<FilterType>("all");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [replayingMatch, setReplayingMatch] = useState<string | null>(null);
  const [replayBall, setReplayBall] = useState(0);
  const [playerName, setPlayerName] = useState("You");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      supabase.from("matches")
        .select("id, mode, user_score, ai_score, result, balls_played, created_at, innings_data")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
    ]).then(([matchRes, profileRes]) => {
      if (matchRes.data) setMatches(matchRes.data as unknown as MatchRecord[]);
      if (profileRes.data) setPlayerName((profileRes.data as any).display_name || "You");
      setLoading(false);
    });
  }, [user]);

  const filtered = useMemo(() => {
    return matches.filter(m => {
      if (resultFilter !== "all" && m.result !== resultFilter) return false;
      if (modeFilter !== "all" && m.mode !== modeFilter) return false;
      return true;
    });
  }, [matches, resultFilter, modeFilter]);

  const summary = useMemo(() => {
    const wins = matches.filter(m => m.result === "win").length;
    const losses = matches.filter(m => m.result === "loss").length;
    const draws = matches.filter(m => m.result === "draw").length;
    const totalRuns = matches.reduce((s, m) => s + m.user_score, 0);
    const totalBalls = matches.reduce((s, m) => s + m.balls_played, 0);
    const highScore = matches.reduce((max, m) => Math.max(max, m.user_score), 0);
    const avgScore = matches.length ? Math.round(totalRuns / matches.length) : 0;
    const strikeRate = totalBalls ? Math.round((totalRuns / totalBalls) * 100) : 0;
    const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0;
    return { wins, losses, draws, total: matches.length, totalRuns, highScore, avgScore, strikeRate, winRate };
  }, [matches]);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const startReplay = useCallback((matchId: string) => {
    setReplayingMatch(matchId);
    setReplayBall(0);
  }, []);

  useEffect(() => {
    if (!replayingMatch) return;
    const match = matches.find(m => m.id === replayingMatch);
    if (!match?.innings_data || !Array.isArray(match.innings_data)) return;
    const total = (match.innings_data as BallRecord[]).length;
    if (replayBall >= total) return;
    const timer = setTimeout(() => setReplayBall(prev => prev + 1), 800);
    return () => clearTimeout(timer);
  }, [replayingMatch, replayBall, matches]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, hsl(220 20% 8%) 0%, hsl(220 18% 5%) 100%)" }}>
        <div className="text-center">
          <span className="text-5xl block mb-3">🔒</span>
          <p className="font-display text-sm text-muted-foreground tracking-wider">Sign in to view match history</p>
          <motion.button whileTap={{ scale: 0.95, y: 2 }} onClick={() => navigate("/auth")}
            className="mt-4 px-6 py-3 rounded-2xl font-display text-xs tracking-wider relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(142 71% 50%), hsl(142 65% 38%))",
              border: "2px solid hsl(142 60% 35% / 0.5)",
              borderBottom: "5px solid hsl(142 55% 25%)",
              color: "white",
              boxShadow: "0 4px 16px hsl(142 71% 45% / 0.3)",
            }}>
            SIGN IN
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-24" style={{ background: "linear-gradient(180deg, hsl(220 20% 8%) 0%, hsl(220 18% 5%) 100%)" }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: WOOD_GRAIN, backgroundRepeat: "repeat" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(220 18% 4% / 0.7) 100%)" }} />
      <TopStatusBar />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-3">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-body text-sm text-foreground"
            style={{
              background: "linear-gradient(180deg, hsl(220 15% 16%) 0%, hsl(220 12% 10%) 100%)",
              border: "2px solid hsl(43 50% 35%)",
              boxShadow: "0 3px 0 hsl(220 15% 8%), inset 0 1px 0 hsl(43 40% 45% / 0.3)",
            }}>
            ←
          </motion.button>
          <div className="flex-1">
            <StoneHeader src={stoneMatchHistoryImg} alt="Match History" height={30} />
            <span className="text-[9px] text-muted-foreground font-display tracking-[0.2em]">{matches.length} MATCHES PLAYED</span>
          </div>
          {/* Best score badge */}
          <div className="text-right rounded-xl px-3 py-1.5"
            style={{
              background: "linear-gradient(180deg, hsl(43 60% 22%), hsl(43 50% 15%))",
              border: "2px solid hsl(43 50% 35%)",
              borderBottom: "4px solid hsl(43 40% 18%)",
              boxShadow: "0 3px 8px hsl(43 90% 55% / 0.15)",
            }}>
            <span className="font-display text-lg font-black leading-none" style={{ color: "hsl(43 90% 55%)" }}>{summary.highScore}</span>
            <span className="text-[6px] font-display tracking-widest block" style={{ color: "hsl(43 70% 50% / 0.7)" }}>BEST SCORE</span>
          </div>
        </motion.div>

        {/* Summary Banner — Stadium Concrete */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="rounded-2xl p-4 mb-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
            border: "2px solid hsl(43 50% 35% / 0.3)",
            borderBottom: "5px solid hsl(220 15% 8%)",
            boxShadow: "0 3px 8px hsl(0 0% 0% / 0.3)",
          }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(220 15% 16%)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(122,39%,49%)" strokeWidth="3"
                  strokeDasharray={`${summary.winRate * 0.975} 97.5`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-sm font-black leading-none" style={{ color: "hsl(142 71% 55%)" }}>{summary.winRate}%</span>
                <span className="text-[5px] text-muted-foreground font-display tracking-widest">WIN</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              {[
                { val: summary.wins, label: "WON", color: "hsl(122,70%,55%)" },
                { val: summary.losses, label: "LOST", color: "hsl(4,90%,65%)" },
                { val: summary.draws, label: "DRAW", color: "hsl(51,100%,60%)" },
              ].map(s => (
                <div key={s.label} className="text-center rounded-lg p-1.5"
                  style={{
                    background: `${s.color}08`,
                    border: `1px solid ${s.color}15`,
                    borderBottom: `3px solid ${s.color}10`,
                  }}>
                  <span className="font-display text-lg font-black block leading-none" style={{ color: s.color }}>{s.val}</span>
                  <span className="text-[6px] text-muted-foreground font-display tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px mb-3 opacity-20" style={{ background: ROPE_DIVIDER }} />

          <div className="grid grid-cols-3 gap-2">
            {[
              { val: summary.avgScore, label: "AVG SCORE", icon: "📊" },
              { val: `${summary.strikeRate}`, label: "STRIKE RATE", icon: "⚡" },
              { val: summary.totalRuns, label: "TOTAL RUNS", icon: "🏏" },
            ].map(s => (
              <div key={s.label} className="text-center rounded-xl p-2"
                style={{
                  background: "linear-gradient(180deg, hsl(220 12% 10%), hsl(220 12% 8%))",
                  border: "1.5px solid hsl(220 15% 16%)",
                  borderBottom: "3px solid hsl(220 12% 6%)",
                }}>
                <span className="text-xs block mb-0.5">{s.icon}</span>
                <span className="font-display text-sm font-black text-foreground block leading-none">{s.val}</span>
                <span className="text-[5px] text-muted-foreground font-display tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="mb-4 space-y-2">
          <div className="flex gap-1 rounded-2xl p-1"
            style={{
              background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 10%) 100%)",
              border: "1px solid hsl(220 15% 18% / 0.6)",
            }}>
            {(["all", "win", "loss", "draw"] as FilterType[]).map(f => {
              const isActive = resultFilter === f;
              const theme = f === "all" ? null : RESULT_THEME[f];
              return (
                <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setResultFilter(f)}
                  className="flex-1 py-2 rounded-xl font-display text-[8px] tracking-widest relative overflow-hidden"
                  style={isActive ? {
                    background: theme ? `linear-gradient(180deg, ${theme.bg}, ${theme.bg}cc)` : "linear-gradient(180deg, hsl(207 90% 50%), hsl(207 85% 38%))",
                    color: "white",
                    borderBottom: "3px solid " + (theme ? `${theme.bg}80` : "hsl(207 70% 28%)"),
                    boxShadow: `0 2px 8px ${theme ? theme.glow : "hsl(207 90% 50% / 0.3)"}`,
                  } : {
                    color: "hsl(220 15% 45%)",
                    borderBottom: "3px solid transparent",
                  }}>
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                      style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
                  )}
                  <span className="relative z-10">{f === "all" ? "ALL" : f.toUpperCase()}</span>
                </motion.button>
              );
            })}
          </div>
          <ScrollHint>
            <div className="flex gap-1.5">
              {(["all", "tap", "ar", "tournament", "multiplayer"] as ModeFilter[]).map(f => {
                const meta = f === "all" ? { icon: "🎮", label: "ALL", accent: "hsl(207,90%,54%)" } : MODE_META[f];
                const isActive = modeFilter === f;
                return (
                  <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setModeFilter(f)}
                    className="px-3 py-1.5 rounded-xl font-display text-[7px] tracking-widest whitespace-nowrap flex items-center gap-1"
                    style={{
                      background: isActive
                        ? `linear-gradient(180deg, ${meta.accent}25, ${meta.accent}10)`
                        : "linear-gradient(180deg, hsl(220 12% 10%), hsl(220 12% 8%))",
                      border: isActive ? `2px solid ${meta.accent}50` : "2px solid hsl(220 15% 16%)",
                      borderBottom: isActive ? `3px solid ${meta.accent}30` : "3px solid hsl(220 12% 6%)",
                      color: isActive ? meta.accent : "hsl(220 15% 45%)",
                    }}>
                    <span className="text-xs">{meta.icon}</span> {meta.label}
                  </motion.button>
                );
              })}
            </div>
          </ScrollHint>
        </motion.div>

        {/* Match List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-10 text-center"
            style={{
              background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
              border: "2px solid hsl(220 15% 18%)",
              borderBottom: "5px solid hsl(220 15% 8%)",
            }}>
            <span className="text-4xl block mb-3">📭</span>
            <span className="font-display text-xs text-muted-foreground tracking-wider">NO MATCHES FOUND</span>
            <p className="text-[9px] text-muted-foreground/60 mt-1 font-body">
              {matches.length === 0 ? "Play your first match!" : "Try different filters"}
            </p>
            {matches.length === 0 && (
              <motion.button whileTap={{ scale: 0.95, y: 2 }} onClick={() => navigate("/play")}
                className="mt-4 px-5 py-2.5 rounded-xl font-display text-[9px] tracking-wider relative overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, hsl(142 71% 50%), hsl(142 65% 38%))",
                  borderBottom: "4px solid hsl(142 55% 25%)",
                  color: "white",
                  boxShadow: "0 4px 16px hsl(142 71% 45% / 0.3)",
                }}>
                🏏 PLAY NOW
              </motion.button>
            )}
          </div>
        ) : (
          <div style={{ height: "calc(100vh - 380px)", minHeight: 300 }}>
            <Virtuoso
              data={filtered}
              overscan={200}
              itemContent={(i, m) => {
                const modeMeta = MODE_META[m.mode] || MODE_META.tap;
                const theme = RESULT_THEME[m.result as keyof typeof RESULT_THEME] || RESULT_THEME.draw;
                const isExpanded = expandedMatch === m.id;
                const isReplaying = replayingMatch === m.id;
                const margin = Math.abs(m.user_score - m.ai_score);
                const runRate = m.balls_played > 0 ? (m.user_score / m.balls_played * 6).toFixed(1) : "0.0";
                const aiRunRate = m.balls_played > 0 ? (m.ai_score / m.balls_played * 6).toFixed(1) : "0.0";
                const ballStats = parseMatchBalls(m.innings_data);
                const balls = (m.innings_data && Array.isArray(m.innings_data)) ? m.innings_data as BallRecord[] : [];

                return (
                  <div className="pb-2.5">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="rounded-2xl relative overflow-hidden"
                      style={{
                        background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
                        border: `2px solid ${theme.bg}25`,
                        borderBottom: `5px solid ${theme.bg}15`,
                        boxShadow: `0 3px 8px hsl(0 0% 0% / 0.3)`,
                      }}
                    >
                      {/* Result accent strip */}
                      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(to right, ${theme.bg}, transparent)` }} />

                      {/* Main row */}
                      <button className="w-full p-3 flex items-center gap-3 relative z-10 text-left"
                        onClick={() => { setExpandedMatch(isExpanded ? null : m.id); if (isReplaying) setReplayingMatch(null); }}>

                        {/* Result badge — 3D concrete */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${theme.bg}20, ${theme.bg}08)`,
                              border: `1.5px solid ${theme.bg}40`,
                              borderBottom: `3px solid ${theme.bg}25`,
                              boxShadow: `0 2px 8px ${theme.glow}`,
                            }}>
                            <span className="font-display text-base font-black leading-none" style={{ color: theme.text }}>{theme.badge}</span>
                            <span className="text-[5px] font-display tracking-widest text-muted-foreground mt-0.5">{theme.label}</span>
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                            style={{ background: `${modeMeta.accent}30`, border: `1px solid ${modeMeta.accent}50` }}>
                            {modeMeta.icon}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-display text-[10px] tracking-wider" style={{ color: theme.text }}>
                              {m.result === "win" ? `${playerName} WON` : m.result === "loss" ? "ROHIT AI WON" : "MATCH DRAWN"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[7px] font-display px-1.5 py-0.5 rounded-md tracking-wider"
                              style={{ background: `${modeMeta.accent}15`, color: modeMeta.accent }}>
                              {modeMeta.label}
                            </span>
                            {m.result !== "draw" && (
                              <span className="text-[7px] text-muted-foreground font-body">by {margin} runs</span>
                            )}
                            <span className="text-[7px] text-muted-foreground">•</span>
                            <span className="text-[7px] text-muted-foreground font-body">{getTimeAgo(m.created_at)}</span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right flex items-baseline gap-2">
                          <div className="text-center">
                            <span className="font-display text-lg font-black leading-none" style={{ color: m.result === "win" ? theme.text : "hsl(var(--foreground))" }}>{m.user_score}</span>
                            <span className="text-[5px] text-muted-foreground font-display tracking-widest block">YOU</span>
                          </div>
                          <span className="text-[8px] font-display" style={{ color: "hsl(220 15% 35%)" }}>vs</span>
                          <div className="text-center">
                            <span className="font-display text-lg font-black leading-none" style={{ color: m.result === "loss" ? theme.text : "hsl(var(--foreground) / 0.6)" }}>{m.ai_score}</span>
                            <span className="text-[5px] text-muted-foreground font-display tracking-widest block">AI</span>
                          </div>
                        </div>
                      </button>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                            <div className="px-3 pb-3 pt-1 space-y-2.5" style={{ borderTop: "1px solid hsl(220 15% 14%)" }}>

                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { name: playerName.toUpperCase(), score: m.user_score, rr: runRate, color: "hsl(122,39%,49%)" },
                                  { name: "ROHIT AI 🏏", score: m.ai_score, rr: aiRunRate, color: "hsl(4,90%,58%)" },
                                ].map(p => (
                                  <div key={p.name} className="rounded-xl p-3 text-center"
                                    style={{
                                      background: `${p.color}08`,
                                      border: `1.5px solid ${p.color}25`,
                                      borderBottom: `3px solid ${p.color}12`,
                                    }}>
                                    <span className="text-[7px] text-muted-foreground font-display tracking-widest block mb-1">{p.name}</span>
                                    <span className="font-display text-2xl font-black block leading-none" style={{ color: p.color }}>{p.score}</span>
                                    <span className="text-[8px] text-muted-foreground mt-1 block font-body">RR {p.rr}</span>
                                  </div>
                                ))}
                              </div>

                              {ballStats && (
                                <div className="rounded-xl p-3"
                                  style={{
                                    background: "linear-gradient(180deg, hsl(220 12% 10%), hsl(220 12% 8%))",
                                    border: "1.5px solid hsl(220 15% 16%)",
                                    borderBottom: "3px solid hsl(220 12% 6%)",
                                  }}>
                                  <span className="text-[7px] text-muted-foreground font-display tracking-widest block mb-2">SHOT BREAKDOWN</span>
                                  <div className="grid grid-cols-4 gap-1.5">
                                    {[
                                      { label: "6s", val: ballStats.sixes, color: "hsl(207,90%,54%)" },
                                      { label: "4s", val: ballStats.fours, color: "hsl(122,70%,55%)" },
                                      { label: "3s", val: ballStats.threes, color: "hsl(51,100%,50%)" },
                                      { label: "2s", val: ballStats.twos, color: "hsl(291,47%,51%)" },
                                      { label: "1s", val: ballStats.singles, color: "hsl(var(--foreground))" },
                                      { label: "Dots", val: ballStats.dots, color: "hsl(var(--muted-foreground))" },
                                      { label: "Outs", val: ballStats.wickets, color: "hsl(4,90%,58%)" },
                                      { label: "Balls", val: ballStats.totalBalls, color: "hsl(var(--foreground))" },
                                    ].map(s => (
                                      <div key={s.label} className="text-center py-1.5 rounded-lg" style={{ background: `${s.color}10` }}>
                                        <span className="font-display text-sm font-black block leading-none" style={{ color: s.color }}>{s.val}</span>
                                        <span className="text-[6px] text-muted-foreground font-display tracking-widest">{s.label}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {balls.length > 0 && (
                                <div className="rounded-xl p-3"
                                  style={{
                                    background: "linear-gradient(180deg, hsl(220 12% 10%), hsl(220 12% 8%))",
                                    border: "1.5px solid hsl(220 15% 16%)",
                                    borderBottom: "3px solid hsl(220 12% 6%)",
                                  }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[7px] text-muted-foreground font-display tracking-widest">BALL-BY-BALL</span>
                                    <motion.button whileTap={{ scale: 0.9, y: 1 }}
                                      onClick={(e) => { e.stopPropagation(); if (isReplaying) { setReplayingMatch(null); } else { startReplay(m.id); } }}
                                      className="px-2.5 py-1 rounded-lg font-display text-[7px] tracking-wider flex items-center gap-1"
                                      style={{
                                        background: isReplaying ? "hsl(4 50% 20% / 0.3)" : "hsl(142 30% 18% / 0.3)",
                                        border: isReplaying ? "1.5px solid hsl(4 60% 40% / 0.3)" : "1.5px solid hsl(142 50% 35% / 0.3)",
                                        borderBottom: isReplaying ? "3px solid hsl(4 40% 22%)" : "3px solid hsl(142 40% 18%)",
                                        color: isReplaying ? "hsl(4,90%,65%)" : "hsl(142,70%,55%)",
                                      }}>
                                      {isReplaying ? "⏸ STOP" : "▶ REPLAY"}
                                    </motion.button>
                                  </div>

                                  <div className="flex flex-wrap gap-1">
                                    {balls.map((b, bi) => {
                                      const isOut = b.runs === "OUT";
                                      const r = typeof b.runs === "number" ? Math.abs(b.runs) : 0;
                                      const isVisible = !isReplaying || bi <= replayBall;
                                      const isCurrentReplay = isReplaying && bi === replayBall;
                                      let color = "hsl(var(--muted-foreground))";
                                      let bg = "hsl(220 12% 10%)";
                                      if (isOut) { color = "hsl(4,90%,65%)"; bg = "hsl(4,90%,58%,0.2)"; }
                                      else if (r === 6) { color = "hsl(207,90%,60%)"; bg = "hsl(207,90%,54%,0.2)"; }
                                      else if (r === 4) { color = "hsl(122,70%,55%)"; bg = "hsl(122,39%,49%,0.2)"; }
                                      else if (r >= 2) { color = "hsl(51,100%,60%)"; bg = "hsl(51,100%,50%,0.2)"; }
                                      else if (r === 1) { color = "hsl(var(--foreground) / 0.7)"; bg = "hsl(220 15% 14%)"; }

                                      return (
                                        <motion.div key={bi}
                                          initial={isReplaying ? { scale: 0 } : false}
                                          animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[8px] font-display font-black"
                                          style={{
                                            background: bg,
                                            color,
                                            border: `1px solid ${isCurrentReplay ? color : "hsl(220 15% 16%)"}`,
                                            boxShadow: isCurrentReplay ? `0 0 10px ${color}` : "none",
                                          }}>
                                          {isOut ? "W" : r}
                                        </motion.div>
                                      );
                                    })}
                                  </div>

                                  {isReplaying && balls[replayBall] && (
                                    <motion.div key={replayBall} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                      className="mt-2 rounded-lg p-2 text-center"
                                      style={{ background: "hsl(220 12% 10%)", border: "1px solid hsl(220 15% 16%)" }}>
                                      <span className="text-[9px] text-foreground font-display">
                                        Ball {replayBall + 1}: {balls[replayBall].description || (balls[replayBall].runs === "OUT" ? "OUT! 🔴" : `${Math.abs(typeof balls[replayBall].runs === "number" ? balls[replayBall].runs as number : 0)} runs`)}
                                      </span>
                                    </motion.div>
                                  )}
                                </div>
                              )}

                              <div className="rounded-xl p-3 space-y-2"
                                style={{
                                  background: "linear-gradient(180deg, hsl(220 12% 10%), hsl(220 12% 8%))",
                                  border: "1.5px solid hsl(220 15% 16%)",
                                  borderBottom: "3px solid hsl(220 12% 6%)",
                                }}>
                                {[
                                  { label: "Result", value: m.result === "draw" ? "Match Tied" : `${m.result === "win" ? "Won" : "Lost"} by ${margin} runs`, color: theme.text },
                                  { label: "Balls Played", value: m.balls_played, color: "hsl(var(--foreground))" },
                                  { label: "Game Mode", value: modeMeta.label, color: modeMeta.accent },
                                  { label: "Played On", value: new Date(m.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), color: "hsl(var(--foreground))" },
                                ].map(d => (
                                  <div key={d.label} className="flex justify-between items-center py-1" style={{ borderBottom: "1px solid hsl(220 15% 14%)" }}>
                                    <span className="text-[8px] font-display tracking-wider" style={{ color: "hsl(220 15% 40%)" }}>{d.label}</span>
                                    <span className="text-[9px] font-display font-bold" style={{ color: d.color }}>{d.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
