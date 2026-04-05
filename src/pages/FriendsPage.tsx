import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import TopStatusBar from "@/components/TopStatusBar";
import PlayerAvatar from "@/components/PlayerAvatar";
import GlobalChat from "@/components/chat/GlobalChat";
import FriendStatsModal from "@/components/FriendStatsModal";
import {
  createMultiplayerRoom,
  formatPostgrestError,
  logPostgrestError,
  mapCreateRoomError,
  mapInviteInsertError,
} from "@/lib/multiplayerRoom";

interface FriendProfile {
  user_id: string;
  display_name: string;
  wins: number;
  losses: number;
  draws?: number;
  total_matches: number;
  high_score: number;
  best_streak: number;
  current_streak?: number;
  abandons?: number;
  invite_code: string;
  avatar_url?: string | null;
  avatar_index?: number;
  xp?: number;
  coins?: number;
  rank_tier?: string;
}
type GameType = "ar" | "tap" | "tournament";

interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  created_at: string;
  from_name?: string;
  to_name?: string;
}

type Tab = "friends" | "requests" | "add" | "global";

/* ── Material constants ── */
const LEATHER_BG = "linear-gradient(180deg, hsl(28 35% 14%) 0%, hsl(25 30% 8%) 40%, hsl(222 40% 6%) 100%)";
const LEATHER_GRAIN = "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='6' height='6' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")";
const CONCRETE_CARD = "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 11%) 100%)";
const CHALK_BORDER = "2px dashed hsl(43 30% 30% / 0.25)";

export default function FriendsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [myCode, setMyCode] = useState("");
  const [myProfile, setMyProfile] = useState<FriendProfile | null>(null);
  const [feedback, setFeedback] = useState("");
  const [challengeTargetId, setChallengeTargetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    loadMyCode();
    loadFriends();
    loadRequests();
  }, [user]);

  const loadMyCode = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles")
      .select("user_id, display_name, wins, losses, draws, total_matches, high_score, best_streak, current_streak, abandons, invite_code, avatar_url, avatar_index, xp, coins, rank_tier")
      .eq("user_id", user.id).single();
    if (data) {
      setMyCode((data as any).invite_code || "");
      setMyProfile(data as unknown as FriendProfile);
    }
  };

  const loadFriends = async () => {
    if (!user) return;
    const { data } = await supabase.from("friends").select("friend_id").eq("user_id", user.id);
    if (!data || !data.length) { setFriends([]); return; }
    const friendIds = data.map((f: any) => f.friend_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, wins, losses, draws, total_matches, high_score, best_streak, current_streak, abandons, invite_code, avatar_url, avatar_index, xp, coins, rank_tier")
      .in("user_id", friendIds);
    if (profiles) setFriends(profiles as unknown as FriendProfile[]);
  };

  const loadRequests = async () => {
    if (!user) return;
    const { data: inc } = await supabase
      .from("friend_requests").select("*").eq("to_user_id", user.id).eq("status", "pending");
    if (inc) {
      const fromIds = inc.map((r: any) => r.from_user_id);
      const names: Record<string, string> = {};
      if (fromIds.length) {
        const { data: p } = await supabase.from("profiles").select("user_id, display_name").in("user_id", fromIds);
        if (p) p.forEach((pr: any) => { names[pr.user_id] = pr.display_name; });
      }
      setIncoming(inc.map((r: any) => ({ ...r, from_name: names[r.from_user_id] || "Unknown" })));
    }
    const { data: out } = await supabase
      .from("friend_requests").select("*").eq("from_user_id", user.id).eq("status", "pending");
    if (out) {
      const toIds = out.map((r: any) => r.to_user_id);
      const names: Record<string, string> = {};
      if (toIds.length) {
        const { data: p } = await supabase.from("profiles").select("user_id, display_name").in("user_id", toIds);
        if (p) p.forEach((pr: any) => { names[pr.user_id] = pr.display_name; });
      }
      setOutgoing(out.map((r: any) => ({ ...r, to_name: names[r.to_user_id] || "Unknown" })));
    }
  };

  const searchPlayers = async () => {
    if (!user || !searchQuery.trim()) return;
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, wins, losses, total_matches, high_score, best_streak, invite_code, avatar_url, avatar_index")
      .ilike("display_name", `%${searchQuery.trim()}%`)
      .neq("user_id", user.id)
      .limit(10);
    setSearchResults((data as unknown as FriendProfile[]) || []);
    setLoading(false);
  };

  const addByCode = async () => {
    if (!user || !inviteCode.trim()) return;
    setLoading(true);
    setFeedback("");
    const { data } = await supabase
      .from("profiles").select("user_id, display_name").eq("invite_code", inviteCode.trim().toUpperCase()).single();
    if (!data) { setFeedback("No player found with that code"); setLoading(false); return; }
    if ((data as any).user_id === user.id) { setFeedback("That's your own code!"); setLoading(false); return; }
    await sendRequest((data as any).user_id);
    setFeedback(`Request sent to ${(data as any).display_name}!`);
    setInviteCode("");
    setLoading(false);
    loadRequests();
  };

  const sendRequest = async (toId: string) => {
    if (!user) return;
    const { error } = await supabase.from("friend_requests").insert({ from_user_id: user.id, to_user_id: toId } as any);
    if (error) {
      if (error.code === "23505") setFeedback("Request already sent!");
      else setFeedback(error.message);
    } else {
      setFeedback("Friend request sent! ✅");
      loadRequests();
    }
  };

  const acceptRequest = async (requestId: string) => {
    await supabase.rpc("accept_friend_request", { request_id: requestId });
    loadRequests();
    loadFriends();
  };

  const rejectRequest = async (requestId: string) => {
    await supabase.from("friend_requests").update({ status: "rejected" } as any).eq("id", requestId);
    loadRequests();
  };

  const pendingCount = incoming.length;
  const tabs: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: "friends", label: "FRIENDS", icon: "👥" },
    { key: "global", label: "GLOBAL", icon: "🌍" },
    { key: "requests", label: "REQUESTS", icon: "📩", badge: pendingCount },
    { key: "add", label: "ADD", icon: "➕" },
  ];

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    setFeedback("Code copied! 📋");
    setTimeout(() => setFeedback(""), 2000);
  };

  const challengeFriend = async (friendId: string, gameType: GameType) => {
    if (!user) return;
    const { data: game, error: gameError } = await createMultiplayerRoom(user.id, gameType, friendId);
    if (gameError || !game) {
      if (gameError) logPostgrestError("challengeFriend create room failed", gameError, { host_id: user.id, to_user_id: friendId, game_type: gameType });
      setFeedback(gameError ? `${mapCreateRoomError(gameError)} — ${formatPostgrestError(gameError)}` : "Battle room creation returned no room data.");
      return;
    }
    const invitePayload = { game_id: (game as any).id, from_user_id: user.id, to_user_id: friendId, game_type: gameType, expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() } as any;
    const { error: inviteError } = await supabase.from("match_invites").insert(invitePayload);
    if (inviteError) {
      logPostgrestError("challengeFriend invite insert failed", inviteError, { payload: invitePayload });
      await supabase.from("multiplayer_games").update({ status: "cancelled" as any, phase: "abandoned" as any }).eq("id", (game as any).id);
      setFeedback(`${mapInviteInsertError(inviteError)} — ${formatPostgrestError(inviteError)}`);
      return;
    }
    setFeedback("Battle invite sent! Waiting for opponent...");
    navigate(`/game/multiplayer?game=${(game as any).id}`);
  };

  if (!user) return null;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: LEATHER_BG,
        paddingBottom: "calc(68px + env(safe-area-inset-bottom, 16px) + 16px)",
      }}
    >
      {/* Leather grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: LEATHER_GRAIN, backgroundRepeat: "repeat" }} />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(25 30% 4% / 0.7) 100%)" }} />

      <TopStatusBar />

      <div className="relative z-10 max-w-[430px] mx-auto px-4 pt-4">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
            style={{
              background: "linear-gradient(180deg, hsl(207 90% 54%) 0%, hsl(207 90% 40%) 100%)",
              border: "2px solid hsl(207 80% 60% / 0.5)",
              borderBottom: "4px solid hsl(207 90% 30%)",
              boxShadow: "0 4px 16px hsl(207 90% 54% / 0.3)",
            }}
          >
            👥
          </div>
          <div>
            <h1 className="font-game-title text-lg text-foreground" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Friends</h1>
            <span className="font-game-display text-[8px] text-muted-foreground tracking-[0.2em]">PLAY TOGETHER</span>
          </div>
        </motion.div>

        {/* ── Invite Code Card — Floodlight Chrome ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-3.5 mb-4 flex items-center justify-between"
          style={{
            background: CONCRETE_CARD,
            border: "2px solid hsl(43 60% 40%)",
            borderBottom: "5px solid hsl(43 40% 25%)",
            boxShadow: "0 0 20px hsl(43 90% 50% / 0.12)",
          }}
        >
          <div>
            <span className="font-game-display text-[8px] text-muted-foreground tracking-widest block">YOUR INVITE CODE</span>
            <span className="font-game-display text-lg tracking-[0.2em]" style={{ color: "hsl(43 90% 55%)", textShadow: "0 0 10px hsl(43 90% 55% / 0.3)" }}>{myCode}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyCode}
            className="px-4 py-2.5 rounded-xl font-game-display text-[8px] tracking-wider relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(35 60% 35%) 100%)",
              border: "2px solid hsl(43 60% 55% / 0.5)",
              borderBottom: "4px solid hsl(35 50% 25%)",
              color: "hsl(25 40% 8%)",
              boxShadow: "0 2px 8px hsl(43 90% 50% / 0.25)",
            }}
          >
            📋 COPY
          </motion.button>
        </motion.div>

        {/* ── Tabs — Jersey Mesh ── */}
        <div className="flex gap-1 mb-4 rounded-2xl p-1" style={{ background: "hsl(25 15% 10%)", border: "1px solid hsl(25 18% 18%)" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 rounded-xl font-game-display text-[8px] tracking-widest transition-all flex items-center justify-center gap-1 relative"
              style={tab === t.key ? {
                background: "linear-gradient(180deg, hsl(207 90% 54%) 0%, hsl(207 90% 40%) 100%)",
                borderBottom: "3px solid hsl(207 90% 30%)",
                color: "white",
                boxShadow: "0 2px 8px hsl(207 90% 54% / 0.3)",
              } : { color: "hsl(25 20% 50%)" }}
            >
              {/* Jersey mesh on active tab */}
              {tab === t.key && (
                <div className="absolute inset-0 pointer-events-none opacity-[0.06] rounded-xl"
                  style={{ backgroundImage: "radial-gradient(circle, #fff 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
              )}
              <span className="text-xs relative z-10">{t.icon}</span>
              <span className="relative z-10">{t.label}</span>
              {t.badge && t.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold z-20"
                  style={{ background: "hsl(4 90% 58%)", border: "2px solid hsl(25 15% 10%)", color: "white" }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Chalk divider */}
        <div className="mb-4" style={{ borderBottom: CHALK_BORDER }} />

        {/* Feedback toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-2.5 mb-3 text-center"
              style={{ background: "hsl(142 60% 35% / 0.15)", border: "2px solid hsl(142 60% 40% / 0.3)" }}
            >
              <span className="text-[10px] font-game-card text-foreground">{feedback}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ═══ FRIENDS LIST ═══ */}
          {tab === "friends" && (
            <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* ── My Profile Card ── */}
              {myProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-3.5 mb-4 flex items-center gap-3"
                  style={{
                    background: "linear-gradient(180deg, hsl(207 40% 18%) 0%, hsl(207 35% 12%) 100%)",
                    border: "2px solid hsl(207 90% 54% / 0.4)",
                    borderBottom: "5px solid hsl(207 90% 30%)",
                    boxShadow: "0 0 24px hsl(207 90% 54% / 0.12)",
                  }}
                >
                  <div className="relative">
                    <div className="rounded-full" style={{ border: "3px solid hsl(207 90% 54%)", boxShadow: "0 0 12px hsl(207 90% 54% / 0.3)" }}>
                      <PlayerAvatar avatarUrl={myProfile.avatar_url} avatarIndex={myProfile.avatar_index ?? 0} size="md" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[6px] font-game-display tracking-wider"
                      style={{ background: "hsl(207 90% 54%)", color: "white", border: "2px solid hsl(207 35% 12%)" }}>
                      YOU
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-game-card text-sm font-bold text-foreground block truncate">{myProfile.display_name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-muted-foreground font-game-body">{myProfile.wins}W {myProfile.losses}L</span>
                      <span className="text-[8px] font-game-display" style={{ color: "hsl(142 71% 45%)" }}>
                        {myProfile.total_matches > 0 ? Math.round((myProfile.wins / myProfile.total_matches) * 100) : 0}%
                      </span>
                      <span className="text-[8px] font-game-display" style={{ color: "hsl(43 90% 55%)" }}>
                        ⭐ {myProfile.high_score}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[7px] font-game-display" style={{ color: "hsl(207 90% 65%)" }}>✨ {myProfile.xp ?? 0} XP</span>
                      <span className="text-[7px] font-game-display" style={{ color: "hsl(43 90% 55%)" }}>🪙 {myProfile.coins ?? 0}</span>
                      <span className="text-[7px] font-game-display" style={{ color: "hsl(4 90% 60%)" }}>🔥 {myProfile.current_streak ?? 0}</span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate("/profile")}
                    className="px-3 py-2 rounded-xl font-game-display text-[7px] tracking-wider relative overflow-hidden"
                    style={{
                      background: "linear-gradient(180deg, hsl(207 90% 54%) 0%, hsl(207 90% 40%) 100%)",
                      border: "2px solid hsl(207 80% 60% / 0.5)",
                      borderBottom: "4px solid hsl(207 90% 30%)",
                      color: "white",
                      boxShadow: "0 2px 8px hsl(207 90% 54% / 0.3)",
                    }}
                  >
                    👤 PROFILE
                  </motion.button>
                </motion.div>
              )}
              {friends.length === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={{ background: CONCRETE_CARD, border: "2px solid hsl(25 20% 22%)", borderBottom: "5px solid hsl(25 25% 10%)" }}>
                  <span className="text-4xl block mb-3">👥</span>
                  <span className="font-game-title text-sm text-foreground">No Friends Yet</span>
                  <p className="text-[9px] text-muted-foreground font-game-body mt-1">Add friends to play together!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {friends.map((f, i) => {
                    const winRate = f.total_matches > 0 ? Math.round((f.wins / f.total_matches) * 100) : 0;
                    const isHotStreak = (f.current_streak ?? 0) >= 3;
                    return (
                      <motion.div
                        key={f.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
                        className="rounded-2xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
                        style={{
                          background: CONCRETE_CARD,
                          border: isHotStreak ? "2px solid hsl(4 90% 50% / 0.5)" : "2px solid hsl(25 20% 22%)",
                          borderBottom: "5px solid hsl(25 25% 10%)",
                          boxShadow: isHotStreak ? "0 0 16px hsl(4 90% 50% / 0.15)" : "0 4px 16px rgba(0,0,0,0.3)",
                        }}
                        onClick={() => setSelectedFriend(f)}
                      >
                        {/* Avatar with chrome frame */}
                        <div className="relative">
                          <div className="rounded-full"
                            style={{
                              border: isHotStreak ? "3px solid hsl(4 90% 55%)" : "3px solid hsl(43 60% 45%)",
                              boxShadow: isHotStreak ? "0 0 10px hsl(4 90% 55% / 0.3)" : "0 0 8px hsl(43 60% 45% / 0.15)",
                            }}
                          >
                            <PlayerAvatar avatarUrl={f.avatar_url} avatarIndex={f.avatar_index ?? 0} size="sm" />
                          </div>
                          {isHotStreak && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: "hsl(4 90% 55%)", border: "2px solid hsl(25 15% 10%)" }}>
                              <span className="text-[7px]">🔥</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-game-card text-xs font-bold text-foreground truncate">{f.display_name}</span>
                            {f.rank_tier && (
                              <span className="text-[7px] font-game-display" style={{ color: "hsl(43 90% 55%)" }}>
                                {f.rank_tier === "Diamond" ? "💎" : f.rank_tier === "Gold" ? "🥇" : f.rank_tier === "Silver" ? "🥈" : "🏅"}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] text-muted-foreground font-game-body">{f.wins}W {f.losses}L</span>
                            <span className="text-[8px] font-game-display" style={{ color: "hsl(142 71% 45%)" }}>{winRate}%</span>
                          </div>
                        </div>

                        {/* Battle button — Jersey Mesh */}
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => { e.stopPropagation(); setChallengeTargetId(f.user_id); }}
                          className="px-3 py-2 rounded-xl font-game-display text-[7px] tracking-wider relative overflow-hidden"
                          style={{
                            background: "linear-gradient(180deg, hsl(4 90% 55%) 0%, hsl(4 85% 42%) 100%)",
                            border: "2px solid hsl(4 80% 60% / 0.5)",
                            borderBottom: "4px solid hsl(4 80% 30%)",
                            color: "white",
                            boxShadow: "0 2px 8px hsl(4 90% 55% / 0.3)",
                          }}
                        >
                          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                            style={{ backgroundImage: "radial-gradient(circle, #fff 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
                          <span className="relative z-10">⚔️ BATTLE</span>
                        </motion.button>

                        {/* High score — Scoreboard paint */}
                        <div className="text-right min-w-[40px]">
                          <span className="font-game-display text-sm block leading-none" style={{ color: "hsl(43 90% 55%)" }}>{f.high_score}</span>
                          <span className="text-[6px] text-muted-foreground font-game-display tracking-widest">HIGH</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ REQUESTS ═══ */}
          {tab === "requests" && (
            <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {incoming.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: "hsl(142 60% 35% / 0.15)", border: "1px solid hsl(142 60% 40% / 0.25)" }}>📥</div>
                    <span className="font-game-display text-[8px] text-muted-foreground tracking-[0.25em]">INCOMING</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {incoming.map((r, i) => (
                      <motion.div key={r.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        className="rounded-2xl p-3 flex items-center gap-3"
                        style={{ background: CONCRETE_CARD, border: "2px solid hsl(142 50% 35% / 0.3)", borderBottom: "5px solid hsl(25 25% 10%)" }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "hsl(142 60% 35% / 0.1)", border: "1px solid hsl(142 60% 40% / 0.2)" }}>
                          <span className="text-lg">👤</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-game-card text-xs font-bold text-foreground block">{r.from_name}</span>
                          <span className="text-[8px] text-muted-foreground font-game-body">wants to be friends</span>
                        </div>
                        <div className="flex gap-1.5">
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => acceptRequest(r.id)}
                            className="px-3 py-2 rounded-xl font-game-display text-[7px] tracking-wider"
                            style={{
                              background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
                              borderBottom: "3px solid hsl(142 55% 25%)",
                              color: "white",
                            }}>
                            ✓ ACCEPT
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => rejectRequest(r.id)}
                            className="px-2.5 py-2 rounded-xl font-game-display text-[7px] tracking-wider"
                            style={{ background: "hsl(25 15% 10%)", border: "2px solid hsl(4 80% 50% / 0.3)", color: "hsl(4 90% 60%)" }}>
                            ✕
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {outgoing.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: "hsl(43 60% 40% / 0.15)", border: "1px solid hsl(43 60% 40% / 0.25)" }}>📤</div>
                    <span className="font-game-display text-[8px] text-muted-foreground tracking-[0.25em]">SENT</span>
                  </div>
                  <div className="space-y-2">
                    {outgoing.map((r) => (
                      <div key={r.id} className="rounded-2xl p-3 flex items-center gap-3 opacity-60"
                        style={{ background: CONCRETE_CARD, border: "2px solid hsl(25 20% 22% / 0.5)", borderBottom: "4px solid hsl(25 25% 10%)" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "hsl(43 60% 40% / 0.1)", border: "1px solid hsl(43 60% 40% / 0.15)" }}>
                          <span className="text-lg">📤</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-game-card text-xs font-bold text-foreground block">{r.to_name}</span>
                          <span className="text-[8px] text-muted-foreground font-game-body">pending...</span>
                        </div>
                        <span className="text-[9px] font-game-display" style={{ color: "hsl(43 90% 55%)" }}>⏳</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {incoming.length === 0 && outgoing.length === 0 && (
                <div className="rounded-2xl p-8 text-center" style={{ background: CONCRETE_CARD, border: "2px solid hsl(25 20% 22%)", borderBottom: "5px solid hsl(25 25% 10%)" }}>
                  <span className="text-4xl block mb-3">📩</span>
                  <span className="font-game-title text-sm text-foreground">No Requests</span>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ ADD FRIEND ═══ */}
          {tab === "add" && (
            <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* By invite code */}
              <div className="rounded-2xl p-4" style={{ background: CONCRETE_CARD, border: "2px solid hsl(25 20% 22%)", borderBottom: "5px solid hsl(25 25% 10%)" }}>
                <span className="text-[8px] font-game-display text-muted-foreground tracking-widest block mb-3">ADD BY INVITE CODE</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    maxLength={8}
                    className="flex-1 rounded-xl px-3 py-2.5 text-sm text-foreground font-game-display tracking-widest placeholder:text-muted-foreground/30 focus:outline-none transition-all text-center"
                    style={{
                      background: "hsl(25 15% 10%)",
                      border: "2px solid hsl(25 18% 20%)",
                    }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={addByCode}
                    disabled={loading || inviteCode.length < 4}
                    className="px-5 py-2.5 rounded-xl font-game-display text-[8px] tracking-wider disabled:opacity-40"
                    style={{
                      background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
                      borderBottom: "4px solid hsl(142 55% 25%)",
                      color: "white",
                    }}
                  >
                    ADD
                  </motion.button>
                </div>
              </div>

              {/* By search */}
              <div className="rounded-2xl p-4" style={{ background: CONCRETE_CARD, border: "2px solid hsl(25 20% 22%)", borderBottom: "5px solid hsl(25 25% 10%)" }}>
                <span className="text-[8px] font-game-display text-muted-foreground tracking-widest block mb-3">SEARCH BY NAME</span>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Player name..."
                    className="flex-1 rounded-xl px-3 py-2.5 text-sm text-foreground font-game-body placeholder:text-muted-foreground/30 focus:outline-none transition-all"
                    style={{ background: "hsl(25 15% 10%)", border: "2px solid hsl(25 18% 20%)" }}
                    onKeyDown={(e) => e.key === "Enter" && searchPlayers()}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={searchPlayers}
                    disabled={loading || !searchQuery.trim()}
                    className="px-4 py-2.5 rounded-xl font-game-display text-[9px] disabled:opacity-40"
                    style={{ background: "hsl(25 15% 10%)", border: "2px solid hsl(207 90% 54% / 0.3)", color: "hsl(207 90% 54%)" }}
                  >
                    🔍
                  </motion.button>
                </div>
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((p) => {
                      const alreadyFriend = friends.some(f => f.user_id === p.user_id);
                      const alreadySent = outgoing.some(o => o.to_user_id === p.user_id);
                      return (
                        <div key={p.user_id} className="flex items-center gap-3 p-2.5 rounded-xl"
                          style={{ background: "hsl(25 15% 10% / 0.6)", border: "1px solid hsl(25 18% 20% / 0.5)" }}>
                          <PlayerAvatar avatarUrl={p.avatar_url} avatarIndex={p.avatar_index ?? 0} size="sm" />
                          <div className="flex-1">
                            <span className="font-game-card text-[10px] font-bold text-foreground block">{p.display_name}</span>
                            <span className="text-[7px] text-muted-foreground font-game-body">{p.wins}W • {p.total_matches} matches</span>
                          </div>
                          {alreadyFriend ? (
                            <span className="text-[8px] font-game-display" style={{ color: "hsl(142 71% 45%)" }}>✓ FRIENDS</span>
                          ) : alreadySent ? (
                            <span className="text-[8px] font-game-display" style={{ color: "hsl(43 90% 55%)" }}>⏳ SENT</span>
                          ) : (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendRequest(p.user_id)}
                              className="px-3 py-1.5 rounded-xl font-game-display text-[7px] tracking-wider"
                              style={{
                                background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
                                borderBottom: "3px solid hsl(142 55% 25%)",
                                color: "white",
                              }}>
                              + ADD
                            </motion.button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ GLOBAL CHAT ═══ */}
          {tab === "global" && (
            <motion.div key="global" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-2xl p-3 h-[420px]"
              style={{ background: CONCRETE_CARD, border: "2px solid hsl(25 20% 22%)", borderBottom: "5px solid hsl(25 25% 10%)" }}
            >
              <GlobalChat />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Challenge Mode Picker ═══ */}
      {challengeTargetId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: "hsl(25 30% 4% / 0.85)", backdropFilter: "blur(12px)" }}>
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl p-5 space-y-3"
            style={{
              background: CONCRETE_CARD,
              border: "2px solid hsl(4 80% 50% / 0.3)",
              borderBottom: "6px solid hsl(25 25% 8%)",
              boxShadow: "0 0 40px hsl(4 90% 50% / 0.15)",
            }}
          >
            <p className="font-game-title text-base text-foreground" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Choose Battle Mode</p>
            <p className="text-[9px] text-muted-foreground font-game-body">Send a battle invite with your chosen format.</p>
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
                  background: CONCRETE_CARD,
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
                    <p className="text-sm font-game-display text-foreground tracking-wider">{mode.label}</p>
                    <p className="text-[9px] text-muted-foreground font-game-body">{mode.subtitle}</p>
                  </div>
                </div>
              </motion.button>
            ))}
            <button onClick={() => setChallengeTargetId(null)}
              className="w-full py-2.5 text-xs text-muted-foreground font-game-body hover:text-foreground transition-colors">Cancel</button>
          </motion.div>
        </div>
      )}

      {selectedFriend && (
        <FriendStatsModal
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onChallenge={(friendId) => { setSelectedFriend(null); setChallengeTargetId(friendId); }}
        />
      )}
    </div>
  );
}
