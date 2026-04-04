import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useClan, type Clan } from "@/hooks/useClan";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/layout/TopBar";
import ClanDonations from "@/components/clan/ClanDonations";
import ClanWars from "@/components/clan/ClanWars";

const ROLE_ORDER = { leader: 0, co_leader: 1, elder: 2, member: 3 };
const ROLE_LABELS: Record<string, string> = { leader: "👑 Leader", co_leader: "⚔️ Co-Leader", elder: "🛡️ Elder", member: "🏏 Member" };
const ROLE_COLORS: Record<string, string> = { leader: "text-secondary", co_leader: "text-accent", elder: "text-primary", member: "text-muted-foreground" };
const CLAN_EMOJIS = ["🏏", "⚡", "🔥", "💎", "🦁", "🐯", "🦅", "🐉", "⭐", "🌟", "👑", "🛡️"];
const LEVEL_XP = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];

type Tab = "info" | "chat" | "donate" | "war" | "browse";

export default function ClanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myClan, myRole, members, allClans, loading, createClan, joinClan, leaveClan, promoteMember, kickMember, fetchAllClans } = useClan();
  const [tab, setTab] = useState<Tab>(myClan ? "info" : "browse");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { if (!myClan && !loading) { setTab("browse"); fetchAllClans(); } else if (myClan) { setTab("info"); } }, [myClan, loading]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <TopBar />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-2">
        {/* Tabs */}
        <div className="flex gap-1 p-1 glass-card rounded-xl mb-4">
          {(myClan ? (["info", "chat", "donate"] as Tab[]) : (["browse"] as Tab[])).map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === "browse") fetchAllClans(); }}
              className={`flex-1 py-2 rounded-lg font-display text-[10px] tracking-widest font-bold transition-all ${tab === t ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
              {t.toUpperCase()}
            </button>
          ))}
          {myClan && (
            <button onClick={() => { setTab("browse"); fetchAllClans(); }}
              className={`flex-1 py-2 rounded-lg font-display text-[10px] tracking-widest font-bold transition-all ${tab === "browse" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
              BROWSE
            </button>
          )}
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
          {tab === "browse" && (
            <motion.div key="browse" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {!showCreate ? (
                <BrowseClans clans={allClans} onJoin={joinClan} onCreate={() => setShowCreate(true)} hasClam={!!myClan} />
              ) : (
                <CreateClanForm onCreate={createClan} onCancel={() => setShowCreate(false)} />
              )}
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
      <div className="glass-premium rounded-2xl p-4 text-center">
        <span className="text-5xl block mb-2">{clan.emoji}</span>
        <h2 className="font-display text-xl font-black text-foreground tracking-wider">{clan.name}</h2>
        <span className="text-[10px] text-muted-foreground font-display tracking-widest">[{clan.tag}]</span>
        {clan.description && <p className="text-xs text-muted-foreground mt-1">{clan.description}</p>}

        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="text-center">
            <span className="font-display text-lg font-black text-secondary">Lv.{clan.level}</span>
            <span className="text-[8px] text-muted-foreground block">LEVEL</span>
          </div>
          <div className="text-center">
            <span className="font-display text-lg font-black text-primary">{clan.member_count}</span>
            <span className="text-[8px] text-muted-foreground block">/{clan.max_members}</span>
          </div>
        </div>

        <div className="mt-2 h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-secondary to-secondary/60" initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} />
        </div>
        <span className="text-[8px] text-muted-foreground">{clan.xp}/{xpForNext} XP</span>
      </div>

      {/* Members */}
      <div className="glass-card rounded-2xl p-3">
        <h3 className="font-display text-[10px] tracking-widest text-muted-foreground font-bold mb-2">MEMBERS ({members.length})</h3>
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
          {sortedMembers.map(m => (
            <div key={m.id} className="flex items-center gap-2 p-2 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm">
                {["😎","🤠","🥷","🧑‍🚀","👨‍🎤","🦸","🧙","🤖","👻","🎃","🐱","🦊","🐯","🦁","🐸","🐼","🐨","🐰","🦄","🐲"][m.avatar_index ?? 0]}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-display text-xs font-bold text-foreground truncate block">{m.display_name}</span>
                <span className={`text-[9px] font-display ${ROLE_COLORS[m.role] ?? "text-muted-foreground"}`}>{ROLE_LABELS[m.role] ?? m.role}</span>
              </div>
              <span className="text-[9px] text-muted-foreground font-display">🎴 {m.donated_cards}</span>
              {isLeader && m.role !== "leader" && (
                <div className="flex gap-1">
                  <button onClick={() => {
                    const next = m.role === "member" ? "elder" : m.role === "elder" ? "co_leader" : "member";
                    onPromote(m.id, next);
                  }} className="text-[8px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">↑</button>
                  <button onClick={() => onKick(m.id)} className="text-[8px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive">✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={onLeave} className="w-full py-2.5 rounded-xl glass-card text-destructive font-display text-xs font-bold tracking-wider">
        🚪 LEAVE CLAN
      </button>
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 p-2 glass-card rounded-2xl mb-2">
        {messages.length === 0 && <p className="text-center text-muted-foreground text-xs py-8">No messages yet. Say hi! 👋</p>}
        {messages.map(m => {
          const isMine = m.user_id === user?.id;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-1.5 rounded-2xl ${isMine ? "bg-primary/20 text-primary" : "bg-muted/20 text-foreground"}`}>
                {!isMine && <span className="text-[9px] font-display text-secondary font-bold block">{profiles.get(m.user_id) ?? "Player"}</span>}
                <p className="text-xs">{m.message}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message..." className="flex-1 px-3 py-2.5 rounded-xl glass-card text-xs text-foreground placeholder:text-muted-foreground outline-none" />
        <motion.button whileTap={{ scale: 0.9 }} onClick={send}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/70 text-primary-foreground font-display text-xs font-bold">
          SEND
        </motion.button>
      </div>
    </div>
  );
}

/* ─── Browse Clans ─── */
function BrowseClans({ clans, onJoin, onCreate, hasClam }: { clans: Clan[]; onJoin: (id: string) => void; onCreate: () => void; hasClam: boolean }) {
  return (
    <div className="space-y-3">
      {!hasClam && (
        <motion.button whileTap={{ scale: 0.95 }} onClick={onCreate}
          className="w-full py-3.5 bg-gradient-to-r from-secondary to-secondary/70 text-secondary-foreground font-display font-black text-sm rounded-2xl tracking-wider shadow-[0_0_25px_hsl(45_93%_58%/0.2)] border border-secondary/30">
          ➕ CREATE CLAN
        </motion.button>
      )}
      {clans.length === 0 && (
        <div className="text-center py-8">
          <span className="text-4xl block mb-2">🏰</span>
          <p className="text-muted-foreground text-xs">No clans yet. Be the first!</p>
        </div>
      )}
      {clans.map(c => (
        <div key={c.id} className="glass-premium rounded-2xl p-3 flex items-center gap-3">
          <span className="text-3xl">{c.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-black text-foreground truncate">{c.name}</span>
              <span className="text-[8px] text-muted-foreground font-display">[{c.tag}]</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <span>Lv.{c.level}</span>
              <span>👥 {c.member_count}/{c.max_members}</span>
            </div>
          </div>
          {!hasClam && (c.member_count ?? 0) < c.max_members && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onJoin(c.id)}
              className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary font-display text-[10px] font-bold">
              JOIN
            </motion.button>
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
      <div className="glass-premium rounded-2xl p-4 space-y-3">
        <h3 className="font-display text-sm font-black text-foreground tracking-wider text-center">CREATE CLAN</h3>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {CLAN_EMOJIS.map(e => (
            <button key={e} onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${emoji === e ? "bg-secondary/30 border-2 border-secondary scale-110" : "bg-muted/20"}`}>
              {e}
            </button>
          ))}
        </div>

        <input value={name} onChange={e => setName(e.target.value)} placeholder="Clan Name"
          className="w-full px-3 py-2.5 rounded-xl glass-card text-sm text-foreground placeholder:text-muted-foreground outline-none" maxLength={20} />
        <input value={tag} onChange={e => setTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="TAG (2-6 chars)"
          className="w-full px-3 py-2.5 rounded-xl glass-card text-sm text-foreground placeholder:text-muted-foreground outline-none font-display tracking-widest" maxLength={6} />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)"
          className="w-full px-3 py-2.5 rounded-xl glass-card text-xs text-foreground placeholder:text-muted-foreground outline-none resize-none" rows={2} maxLength={100} />

        {error && <p className="text-destructive text-[10px] text-center">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl glass-card text-muted-foreground font-display text-xs font-bold">CANCEL</button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleCreate} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-secondary/70 text-secondary-foreground font-display text-xs font-black tracking-wider disabled:opacity-50">
            {saving ? "..." : "CREATE"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
