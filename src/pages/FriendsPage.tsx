import { useState, useEffect } from "react";
import stoneFriendsImg from "@/assets/ui/stone-friends.png";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import TopBar from "@/components/layout/TopBar";
import V10PlayerAvatar from "@/components/shared/V10PlayerAvatar";
import V10Button from "@/components/shared/V10Button";
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

  useEffect(() => { if (!user) return; loadMyCode(); loadFriends(); loadRequests(); }, [user]);

  const loadMyCode = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("user_id, display_name, wins, losses, draws, total_matches, high_score, best_streak, current_streak, abandons, invite_code, avatar_url, avatar_index, xp, coins, rank_tier").eq("user_id", user.id).single();
    if (data) { setMyCode((data as any).invite_code || ""); setMyProfile(data as unknown as FriendProfile); }
  };

  const loadFriends = async () => {
    if (!user) return;
    const { data } = await supabase.from("friends").select("friend_id").eq("user_id", user.id);
    if (!data || !data.length) { setFriends([]); return; }
    const friendIds = data.map((f: any) => f.friend_id);
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, wins, losses, draws, total_matches, high_score, best_streak, current_streak, abandons, invite_code, avatar_url, avatar_index, xp, coins, rank_tier").in("user_id", friendIds);
    if (profiles) setFriends(profiles as unknown as FriendProfile[]);
  };

  const loadRequests = async () => {
    if (!user) return;
    const { data: inc } = await supabase.from("friend_requests").select("*").eq("to_user_id", user.id).eq("status", "pending");
    if (inc) {
      const fromIds = inc.map((r: any) => r.from_user_id);
      const names: Record<string, string> = {};
      if (fromIds.length) { const { data: p } = await supabase.from("profiles").select("user_id, display_name").in("user_id", fromIds); if (p) p.forEach((pr: any) => { names[pr.user_id] = pr.display_name; }); }
      setIncoming(inc.map((r: any) => ({ ...r, from_name: names[r.from_user_id] || "Unknown" })));
    }
    const { data: out } = await supabase.from("friend_requests").select("*").eq("from_user_id", user.id).eq("status", "pending");
    if (out) {
      const toIds = out.map((r: any) => r.to_user_id);
      const names: Record<string, string> = {};
      if (toIds.length) { const { data: p } = await supabase.from("profiles").select("user_id, display_name").in("user_id", toIds); if (p) p.forEach((pr: any) => { names[pr.user_id] = pr.display_name; }); }
      setOutgoing(out.map((r: any) => ({ ...r, to_name: names[r.to_user_id] || "Unknown" })));
    }
  };

  const searchPlayers = async () => {
    if (!user || !searchQuery.trim()) return;
    setLoading(true);
    const { data } = await supabase.from("profiles").select("user_id, display_name, wins, losses, total_matches, high_score, best_streak, invite_code, avatar_url, avatar_index").ilike("display_name", `%${searchQuery.trim()}%`).neq("user_id", user.id).limit(10);
    setSearchResults((data as unknown as FriendProfile[]) || []);
    setLoading(false);
  };

  const addByCode = async () => {
    if (!user || !inviteCode.trim()) return;
    setLoading(true); setFeedback("");
    const { data } = await supabase.from("profiles").select("user_id, display_name").eq("invite_code", inviteCode.trim().toUpperCase()).single();
    if (!data) { setFeedback("No player found with that code"); setLoading(false); return; }
    if ((data as any).user_id === user.id) { setFeedback("That's your own code!"); setLoading(false); return; }
    await sendRequest((data as any).user_id);
    setFeedback(`Request sent to ${(data as any).display_name}!`);
    setInviteCode(""); setLoading(false); loadRequests();
  };

  const sendRequest = async (toId: string) => {
    if (!user) return;
    const { error } = await supabase.from("friend_requests").insert({ from_user_id: user.id, to_user_id: toId } as any);
    if (error) { if (error.code === "23505") setFeedback("Request already sent!"); else setFeedback(error.message); }
    else { setFeedback("Friend request sent! ✅"); loadRequests(); }
  };

  const acceptRequest = async (requestId: string) => { await supabase.rpc("accept_friend_request", { request_id: requestId }); loadRequests(); loadFriends(); };
  const rejectRequest = async (requestId: string) => { await supabase.from("friend_requests").update({ status: "rejected" } as any).eq("id", requestId); loadRequests(); };

  const pendingCount = incoming.length;
  const tabs: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: "friends", label: "FRIENDS", icon: "👥" },
    { key: "global", label: "GLOBAL", icon: "🌍" },
    { key: "requests", label: "REQUESTS", icon: "📩", badge: pendingCount },
    { key: "add", label: "ADD", icon: "➕" },
  ];

  const copyCode = () => { navigator.clipboard.writeText(myCode); setFeedback("Code copied! 📋"); setTimeout(() => setFeedback(""), 2000); };

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
    <div className="min-h-screen bg-[#1A0E05] relative overflow-hidden" style={{ paddingBottom: "calc(68px + env(safe-area-inset-bottom, 16px) + 16px)" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A0E05] via-[#1A0E05] to-[#0D0704] pointer-events-none" />
      <TopBar />

      <div className="relative z-10 max-w-[430px] mx-auto px-4 pt-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl wood-panel-dark border border-[#FFD700]/20">👥</div>
          <div>
            <img src={stoneFriendsImg} alt="Friends" style={{ height: 28, width: "auto", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }} />
            <span className="font-display text-[8px] text-muted-foreground tracking-[0.2em]">PLAY TOGETHER</span>
          </div>
        </motion.div>

        {/* Invite Code Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="wood-panel rounded-2xl p-3.5 mb-4 flex items-center justify-between">
          <div>
            <span className="font-display text-[8px] text-muted-foreground tracking-widest block">YOUR INVITE CODE</span>
            <span className="font-display text-lg tracking-[0.2em] text-[#FFD700] neon-text-gold">{myCode}</span>
          </div>
          <V10Button variant="gold" size="sm" onClick={copyCode}>📋 COPY</V10Button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 rounded-2xl p-1 wood-panel">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl font-display text-[8px] tracking-widest transition-all flex items-center justify-center gap-1 relative ${tab === t.key ? "bg-[#FFD700]/15 text-[#FFD700]" : "text-muted-foreground hover:text-foreground"}`}>
              <span className="text-xs">{t.icon}</span>
              <span>{t.label}</span>
              {t.badge && t.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold bg-destructive text-white border-2 border-[#1A0E05]">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="wood-panel-dark rounded-2xl p-2.5 mb-3 text-center border border-neon-green/20">
              <span className="text-[10px] font-body text-foreground">{feedback}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* FRIENDS LIST */}
          {tab === "friends" && (
            <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {myProfile && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="wood-panel-dark rounded-2xl p-3.5 mb-4 flex items-center gap-3 border border-[#FFD700]/20">
                  <div className="relative">
                    <V10PlayerAvatar avatarUrl={myProfile.avatar_url} avatarIndex={myProfile.avatar_index ?? 0} size="md" xpProgress={((myProfile.xp ?? 0) % 500) / 5} />
                    <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[6px] font-display tracking-wider bg-[#FFD700] text-v10-base border-2 border-[#1A0E05]">YOU</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-display text-sm font-bold text-foreground block truncate">{myProfile.display_name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-muted-foreground font-body">{myProfile.wins}W {myProfile.losses}L</span>
                      <span className="text-[8px] font-display text-[#7CFC00]">{myProfile.total_matches > 0 ? Math.round((myProfile.wins / myProfile.total_matches) * 100) : 0}%</span>
                      <span className="text-[8px] font-display text-[#FFD700]">⭐ {myProfile.high_score}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[7px] font-display text-[#FFD700]">✨ {myProfile.xp ?? 0} XP</span>
                      <span className="text-[7px] font-display text-[#FFD700]">🪙 {myProfile.coins ?? 0}</span>
                      <span className="text-[7px] font-display text-destructive">🔥 {myProfile.current_streak ?? 0}</span>
                    </div>
                  </div>
                  <V10Button variant="secondary" size="sm" onClick={() => navigate("/profile")}>👤 PROFILE</V10Button>
                </motion.div>
              )}
              {friends.length === 0 ? (
                <div className="wood-panel-dark rounded-2xl p-8 text-center">
                  <span className="text-4xl block mb-3">👥</span>
                  <span className="font-display text-sm text-foreground">No Friends Yet</span>
                  <p className="text-[9px] text-muted-foreground font-body mt-1">Add friends to play together!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {friends.map((f, i) => {
                    const winRate = f.total_matches > 0 ? Math.round((f.wins / f.total_matches) * 100) : 0;
                    const isHotStreak = (f.current_streak ?? 0) >= 3;
                    return (
                      <motion.div key={f.user_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        className={`wood-panel-dark rounded-2xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform ${isHotStreak ? "border border-destructive/30 shadow-[0_0_16px_hsl(0_70%_50%/0.1)]" : ""}`}
                        onClick={() => setSelectedFriend(f)}>
                        <div className="relative">
                          <V10PlayerAvatar avatarUrl={f.avatar_url} avatarIndex={f.avatar_index ?? 0} size="sm" />
                          {isHotStreak && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-destructive border-2 border-[#1A0E05]"><span className="text-[7px]">🔥</span></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-xs font-bold text-foreground truncate">{f.display_name}</span>
                            {f.rank_tier && <span className="text-[7px] font-display text-[#FFD700]">{f.rank_tier === "Diamond" ? "💎" : f.rank_tier === "Gold" ? "🥇" : f.rank_tier === "Silver" ? "🥈" : "🏅"}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] text-muted-foreground font-body">{f.wins}W {f.losses}L</span>
                            <span className="text-[8px] font-display text-[#7CFC00]">{winRate}%</span>
                          </div>
                        </div>
                        <V10Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setChallengeTargetId(f.user_id); }}>⚔️ BATTLE</V10Button>
                        <div className="text-right min-w-[40px]">
                          <span className="font-display text-sm block leading-none text-[#FFD700] tabular-nums">{f.high_score}</span>
                          <span className="text-[6px] text-muted-foreground font-display tracking-widest">HIGH</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* REQUESTS */}
          {tab === "requests" && (
            <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {incoming.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm wood-panel-dark">📥</div>
                    <span className="font-display text-[8px] text-muted-foreground tracking-[0.25em]">INCOMING</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {incoming.map((r, i) => (
                      <motion.div key={r.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        className="wood-panel-dark rounded-2xl p-3 flex items-center gap-3 border border-neon-green/20">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-neon-green/10 border border-neon-green/20"><span className="text-lg">👤</span></div>
                        <div className="flex-1">
                          <span className="font-display text-xs font-bold text-foreground block">{r.from_name}</span>
                          <span className="text-[8px] text-muted-foreground font-body">wants to be friends</span>
                        </div>
                        <div className="flex gap-1.5">
                          <V10Button variant="primary" size="sm" onClick={() => acceptRequest(r.id)}>✓</V10Button>
                          <V10Button variant="danger" size="sm" onClick={() => rejectRequest(r.id)}>✕</V10Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
              {outgoing.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm wood-panel-dark">📤</div>
                    <span className="font-display text-[8px] text-muted-foreground tracking-[0.25em]">SENT</span>
                  </div>
                  <div className="space-y-2">
                    {outgoing.map((r) => (
                      <div key={r.id} className="wood-panel-dark rounded-2xl p-3 flex items-center gap-3 opacity-60">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-game-gold/10 border border-game-gold/15"><span className="text-lg">📤</span></div>
                        <div className="flex-1">
                          <span className="font-display text-xs font-bold text-foreground block">{r.to_name}</span>
                          <span className="text-[8px] text-muted-foreground font-body">pending...</span>
                        </div>
                        <span className="text-[9px] font-display text-[#FFD700]">⏳</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {incoming.length === 0 && outgoing.length === 0 && (
                <div className="wood-panel-dark rounded-2xl p-8 text-center">
                  <span className="text-4xl block mb-3">📩</span>
                  <span className="font-display text-sm text-foreground">No Requests</span>
                </div>
              )}
            </motion.div>
          )}

          {/* ADD FRIEND */}
          {tab === "add" && (
            <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="wood-panel-dark rounded-2xl p-4">
                <span className="text-[8px] font-display text-muted-foreground tracking-widest block mb-3">ADD BY INVITE CODE</span>
                <div className="flex gap-2">
                  <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="ENTER CODE" maxLength={8}
                    className="flex-1 rounded-xl px-3 py-2.5 text-sm text-foreground font-display tracking-widest placeholder:text-muted-foreground/30 focus:outline-none bg-white/[0.04] border border-white/10 focus:border-[#FFD700]/30 transition-colors text-center" />
                  <V10Button variant="primary" size="sm" onClick={addByCode} disabled={loading || inviteCode.length < 4}>ADD</V10Button>
                </div>
              </div>

              <div className="wood-panel-dark rounded-2xl p-4">
                <span className="text-[8px] font-display text-muted-foreground tracking-widest block mb-3">SEARCH BY NAME</span>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Player name..."
                    className="flex-1 rounded-xl px-3 py-2.5 text-sm text-foreground font-body placeholder:text-muted-foreground/30 focus:outline-none bg-white/[0.04] border border-white/10 focus:border-[#FFD700]/30 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && searchPlayers()} />
                  <V10Button variant="secondary" size="sm" onClick={searchPlayers} disabled={loading || !searchQuery.trim()}>🔍</V10Button>
                </div>
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((p) => {
                      const alreadyFriend = friends.some(f => f.user_id === p.user_id);
                      const alreadySent = outgoing.some(o => o.to_user_id === p.user_id);
                      return (
                        <div key={p.user_id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <V10PlayerAvatar avatarUrl={p.avatar_url} avatarIndex={p.avatar_index ?? 0} size="sm" />
                          <div className="flex-1">
                            <span className="font-display text-[10px] font-bold text-foreground block">{p.display_name}</span>
                            <span className="text-[7px] text-muted-foreground font-body">{p.wins}W • {p.total_matches} matches</span>
                          </div>
                          {alreadyFriend ? (
                            <span className="text-[8px] font-display text-[#7CFC00]">✓ FRIENDS</span>
                          ) : alreadySent ? (
                            <span className="text-[8px] font-display text-[#FFD700]">⏳ SENT</span>
                          ) : (
                            <V10Button variant="primary" size="sm" onClick={() => sendRequest(p.user_id)}>+ ADD</V10Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* GLOBAL CHAT */}
          {tab === "global" && (
            <motion.div key="global" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="wood-panel-dark rounded-2xl p-3 h-[420px]">
              <GlobalChat />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Challenge Mode Picker */}
      {challengeTargetId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-sm wood-panel-dark rounded-3xl p-5 space-y-3 border border-destructive/20">
            <p className="font-display text-base text-foreground tracking-wider">Choose Battle Mode</p>
            <p className="text-[9px] text-muted-foreground font-body">Send a battle invite with your chosen format.</p>
            <div className="border-b border-white/10 my-2" />
            {([
              { key: "ar" as GameType, icon: "📸", label: "AR Mode", subtitle: "Futuristic AR showdown" },
              { key: "tap" as GameType, icon: "⚡", label: "Tap Mode", subtitle: "Arcade speed challenge" },
              { key: "tournament" as GameType, icon: "🏆", label: "Tournament", subtitle: "Championship clash" },
            ]).map((mode) => (
              <motion.button key={mode.key} whileTap={{ scale: 0.97, y: 2 }}
                onClick={() => { void challengeFriend(challengeTargetId, mode.key); setChallengeTargetId(null); }}
                className="w-full p-3.5 rounded-2xl text-left wood-panel-dark border border-white/10 hover:border-[#FFD700]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-white/[0.05] border border-white/10">{mode.icon}</div>
                  <div>
                    <p className="text-sm font-display text-foreground tracking-wider">{mode.label}</p>
                    <p className="text-[9px] text-muted-foreground font-body">{mode.subtitle}</p>
                  </div>
                </div>
              </motion.button>
            ))}
            <button onClick={() => setChallengeTargetId(null)} className="w-full py-2.5 text-xs text-muted-foreground font-body hover:text-foreground transition-colors">Cancel</button>
          </motion.div>
        </div>
      )}

      {selectedFriend && (
        <FriendStatsModal friend={selectedFriend} onClose={() => setSelectedFriend(null)} onChallenge={(friendId) => { setSelectedFriend(null); setChallengeTargetId(friendId); }} />
      )}
    </div>
  );
}
