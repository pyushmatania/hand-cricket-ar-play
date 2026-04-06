import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useClan, type Clan } from "@/hooks/useClan";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/layout/TopBar";
import ClanDonations from "@/components/clan/ClanDonations";
import ClanLeaderboard from "@/components/clan/ClanLeaderboard";
import ClanWars from "@/components/clan/ClanWars";
import ClanRecruitment from "@/components/clan/ClanRecruitment";
import ClanMatchmaking from "@/components/clan/ClanMatchmaking";
import ClanAchievements from "@/components/clan/ClanAchievements";
import V10PlayerAvatar from "@/components/shared/V10PlayerAvatar";
import V10Button from "@/components/shared/V10Button";

const ROLE_ORDER = { leader: 0, co_leader: 1, elder: 2, member: 3 };
const ROLE_LABELS: Record<string, string> = { leader: "👑 Leader", co_leader: "⚔️ Co-Leader", elder: "🛡️ Elder", member: "🏏 Member" };
const ROLE_COLORS: Record<string, string> = { leader: "text-neon-cyan", co_leader: "text-neon-green", elder: "text-game-gold", member: "text-muted-foreground" };
const CLAN_EMOJIS = ["🏏", "⚡", "🔥", "💎", "🦁", "🐯", "🦅", "🐉", "⭐", "🌟", "👑", "🛡️"];
const LEVEL_XP = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];

type Tab = "info" | "chat" | "donate" | "war" | "match" | "badges" | "ranks" | "recruit" | "browse";

export default function ClanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myClan, myRole, members, allClans, loading, createClan, joinClan, leaveClan, promoteMember, kickMember, fetchAllClans } = useClan();
  const [tab, setTab] = useState<Tab>(myClan ? "info" : "browse");

  useEffect(() => { if (!myClan && !loading) { setTab("browse"); fetchAllClans(); } else if (myClan) { setTab("info"); } }, [myClan, loading]);

  if (loading) return (
    <div className="min-h-screen bg-v10-base flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const allTabs = myClan ? (["info", "chat", "donate", "war", "match", "badges", "ranks", "recruit", "browse"] as Tab[]) : (["ranks", "recruit", "browse"] as Tab[]);

  return (
    <div className="min-h-screen bg-v10-base pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-v10-base via-v10-base to-v10-deep pointer-events-none" />
      <TopBar />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-2">
        {/* Tabs — scoreboard-metal */}
        <div className="flex gap-0.5 p-1 scoreboard-metal rounded-2xl mb-4 overflow-x-auto no-scrollbar">
          {allTabs.map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === "browse") fetchAllClans(); }}
              className={`flex-shrink-0 px-2.5 py-2.5 rounded-xl font-display text-[8px] tracking-widest font-bold transition-all ${tab === t ? "bg-neon-cyan/15 text-neon-cyan" : "text-muted-foreground hover:text-foreground"}`}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "info" && myClan && (
            <motion.div key="info" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <ClanInfo clan={myClan} myRole={myRole} members={members} onLeave={leaveClan} onPromote={promoteMember} onKick={kickMember} />
            </motion.div>
          )}
          {tab === "chat" && myClan && (
            <motion.div key="chat" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <ClanChat clanId={myClan.id} />
            </motion.div>
          )}
          {tab === "donate" && myClan && (
            <motion.div key="donate" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <ClanDonations clanId={myClan.id} />
            </motion.div>
          )}
          {tab === "war" && myClan && myRole && (
            <motion.div key="war" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <ClanWars clan={myClan} myRole={myRole} />
            </motion.div>
          )}
          {tab === "ranks" && (
            <motion.div key="ranks" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <ClanLeaderboard />
            </motion.div>
          )}
          {tab === "match" && myClan && (
            <motion.div key="match" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <ClanMatchmaking />
            </motion.div>
          )}
          {tab === "badges" && myClan && (
            <motion.div key="badges" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <ClanAchievements clanId={myClan.id} />
            </motion.div>
          )}
          {tab === "recruit" && (
            <motion.div key="recruit" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <ClanRecruitment />
            </motion.div>
          )}
          {tab === "browse" && (
            <motion.div key="browse" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <BrowseClans clans={allClans} onJoin={joinClan} onCreate={() => setTab("browse")} hasClam={!!myClan} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Clan Info Panel ─── */
function ClanInfo({ clan, myRole, members, onLeave, onPromote, onKick }: {
  clan: Clan; myRole: string | null; members: any[]; onLeave: () => void; onPromote: (id: string, role: string) => void; onKick: (id: string) => void;
}) {
  const xpForNext = LEVEL_XP[Math.min(clan.level, 9)];
  const xpProgress = clan.level >= 10 ? 100 : (clan.xp / xpForNext) * 100;
  const sortedMembers = [...members].sort((a, b) => (ROLE_ORDER[a.role as keyof typeof ROLE_ORDER] ?? 3) - (ROLE_ORDER[b.role as keyof typeof ROLE_ORDER] ?? 3));
  const isLeader = myRole === "leader" || myRole === "co_leader";

  return (
    <div className="space-y-3">
      {/* Clan header */}
      <div className="stadium-glass rounded-2xl p-4 text-center">
        <span className="text-5xl block mb-2">{clan.emoji}</span>
        <h2 className="font-display text-xl font-black text-foreground tracking-wider">{clan.name}</h2>
        <span className="text-[10px] text-muted-foreground font-display tracking-widest">[{clan.tag}]</span>
        {clan.description && <p className="text-xs text-muted-foreground/70 mt-1 font-body">{clan.description}</p>}

        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="text-center">
            <span className="font-display text-lg font-black text-neon-cyan neon-text-cyan">Lv.{clan.level}</span>
            <span className="text-[8px] text-muted-foreground block font-display tracking-widest">LEVEL</span>
          </div>
          <div className="text-center">
            <span className="font-display text-lg font-black text-neon-green">{clan.member_count}</span>
            <span className="text-[8px] text-muted-foreground block font-display">/{clan.max_members}</span>
          </div>
        </div>

        <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-green" initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} />
        </div>
        <span className="text-[8px] text-muted-foreground font-display tabular-nums">{clan.xp}/{xpForNext} XP</span>
      </div>

      {/* Members */}
      <div className="stadium-glass rounded-2xl p-3">
        <div className="scoreboard-metal rounded-xl px-3 py-2 mb-3">
          <h3 className="font-display text-[10px] tracking-widest text-neon-cyan/80 font-bold">MEMBERS ({members.length})</h3>
        </div>
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
          {sortedMembers.map(m => (
            <div key={m.id} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/5">
              <V10PlayerAvatar avatarIndex={m.avatar_index ?? 0} size="sm" />
              <div className="flex-1 min-w-0">
                <span className="font-display text-xs font-bold text-foreground truncate block">{m.display_name}</span>
                <span className={`text-[9px] font-display ${ROLE_COLORS[m.role] ?? "text-muted-foreground"}`}>{ROLE_LABELS[m.role] ?? m.role}</span>
              </div>
              <span className="text-[9px] text-muted-foreground font-display tabular-nums">🎴 {m.donated_cards}</span>
              {isLeader && m.role !== "leader" && (
                <div className="flex gap-1">
                  <button onClick={() => {
                    const next = m.role === "member" ? "elder" : m.role === "elder" ? "co_leader" : "member";
                    onPromote(m.id, next);
                  }} className="text-[8px] px-1.5 py-0.5 rounded bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/20">↑</button>
                  <button onClick={() => onKick(m.id)} className="text-[8px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/20">✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <V10Button variant="danger" size="sm" onClick={onLeave} className="w-full">
        🚪 LEAVE CLAN
      </V10Button>
    </div>
  );
}

/* ─── Clan Chat ─── */
function ClanChat({ clanId }: { clanId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    supabase.from("clan_chat").select("*").eq("clan_id", clanId).order("created_at", { ascending: true }).limit(100)
      .then(({ data }) => {
        if (data) {
          setMessages(data);
          const ids = [...new Set(data.map(m => m.user_id))];
          supabase.from("profiles").select("user_id, display_name").in("user_id", ids).then(({ data: p }) => {
            if (p) setProfiles(new Map(p.map(x => [x.user_id, x.display_name])));
          });
        }
      });

    const channel = supabase.channel(`clan-chat-${clanId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "clan_chat", filter: `clan_id=eq.${clanId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clanId]);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  const send = async () => {
    if (!input.trim() || !user) return;
    await supabase.from("clan_chat").insert({ clan_id: clanId, user_id: user.id, message: input.trim() });
    setInput("");
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 p-3 stadium-glass rounded-2xl mb-2">
        {messages.length === 0 && <p className="text-center text-muted-foreground text-xs py-8 font-body">No messages yet. Say hi! 👋</p>}
        {messages.map(m => {
          const isMine = m.user_id === user?.id;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-1.5 rounded-2xl ${isMine ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded-br-sm" : "bg-white/[0.05] text-foreground border border-white/10 rounded-bl-sm"}`}>
                {!isMine && <span className="text-[9px] font-display text-neon-green font-bold block">{profiles.get(m.user_id) ?? "Player"}</span>}
                <p className="text-xs font-body">{m.message}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message..." className="flex-1 px-3 py-2.5 rounded-xl stadium-glass text-xs text-foreground placeholder:text-muted-foreground outline-none font-body border border-white/10 focus:border-neon-cyan/30 transition-colors" />
        <V10Button variant="primary" size="sm" onClick={send}>SEND</V10Button>
      </div>
    </div>
  );
}

/* ─── Browse Clans ─── */
function BrowseClans({ clans, onJoin, onCreate, hasClam }: { clans: Clan[]; onJoin: (id: string) => void; onCreate: () => void; hasClam: boolean }) {
  const [showCreate, setShowCreate] = useState(false);
  const { myClan, createClan } = useClan();

  if (showCreate && !hasClam) {
    return <CreateClanForm onCreate={createClan} onCancel={() => setShowCreate(false)} />;
  }

  return (
    <div className="space-y-3">
      {!hasClam && (
        <V10Button variant="gold" size="lg" glow onClick={() => setShowCreate(true)} className="w-full">
          ➕ CREATE CLAN
        </V10Button>
      )}
      {clans.length === 0 && (
        <div className="text-center py-8">
          <span className="text-4xl block mb-2">🏰</span>
          <p className="text-muted-foreground text-xs font-body">No clans yet. Be the first!</p>
        </div>
      )}
      {clans.map(c => (
        <div key={c.id} className="stadium-glass rounded-2xl p-3 flex items-center gap-3">
          <span className="text-3xl">{c.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-black text-foreground truncate">{c.name}</span>
              <span className="text-[8px] text-muted-foreground font-display">[{c.tag}]</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-display tabular-nums">
              <span>Lv.{c.level}</span>
              <span>👥 {c.member_count}/{c.max_members}</span>
            </div>
          </div>
          {!hasClam && (c.member_count ?? 0) < c.max_members && (
            <V10Button variant="primary" size="sm" onClick={() => onJoin(c.id)}>JOIN</V10Button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Create Clan Form ─── */
function CreateClanForm({ onCreate, onCancel }: { onCreate: (n: string, t: string, e: string, d: string) => Promise<any>; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [emoji, setEmoji] = useState("🏏");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !tag.trim() || tag.length < 2 || tag.length > 6) {
      setError("Name required, tag must be 2-6 characters");
      return;
    }
    setSaving(true);
    try {
      await onCreate(name.trim(), tag.trim(), emoji, desc.trim());
    } catch (e: any) {
      setError(e.message?.includes("duplicate") ? "Tag already taken!" : e.message);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="stadium-glass rounded-2xl p-4 space-y-3">
        <div className="scoreboard-metal rounded-xl px-3 py-2 text-center">
          <h3 className="font-display text-sm font-black text-neon-cyan tracking-wider neon-text-cyan">CREATE CLAN</h3>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {CLAN_EMOJIS.map(e => (
            <button key={e} onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all border ${emoji === e ? "bg-neon-cyan/15 border-neon-cyan/40 scale-110" : "bg-white/[0.03] border-white/10"}`}>
              {e}
            </button>
          ))}
        </div>

        <input value={name} onChange={e => setName(e.target.value)} placeholder="Clan Name"
          className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-foreground placeholder:text-muted-foreground outline-none font-body focus:border-neon-cyan/30 transition-colors" maxLength={20} />
        <input value={tag} onChange={e => setTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="TAG (2-6 chars)"
          className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-foreground placeholder:text-muted-foreground outline-none font-display tracking-widest focus:border-neon-cyan/30 transition-colors" maxLength={6} />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)"
          className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-foreground placeholder:text-muted-foreground outline-none resize-none font-body focus:border-neon-cyan/30 transition-colors" rows={2} maxLength={100} />

        {error && <p className="text-destructive text-[10px] text-center font-display">{error}</p>}

        <div className="flex gap-2">
          <V10Button variant="secondary" size="sm" onClick={onCancel} className="flex-1">CANCEL</V10Button>
          <V10Button variant="gold" size="sm" onClick={handleCreate} disabled={saving} className="flex-1">
            {saving ? "..." : "CREATE"}
          </V10Button>
        </div>
      </div>
    </div>
  );
}
