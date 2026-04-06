import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useClan } from "@/hooks/useClan";
import V10Button from "@/components/shared/V10Button";

interface RecruitmentPost {
  id: string;
  clan_id: string;
  description: string;
  min_level: number;
  min_trophies: number;
  auto_join: boolean;
  clan_name: string;
  clan_emoji: string;
  clan_tag: string;
  clan_level: number;
  member_count: number;
  max_members: number;
}

export default function ClanRecruitment() {
  const { user } = useAuth();
  const { myClan, myRole, joinClan } = useClan();
  const [posts, setPosts] = useState<RecruitmentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [desc, setDesc] = useState("");
  const [minLevel, setMinLevel] = useState(1);
  const [autoJoin, setAutoJoin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  const isLeader = myRole === "leader" || myRole === "co_leader";

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data: recruitData } = await supabase
      .from("clan_recruitment")
      .select("*")
      .eq("active", true);

    if (!recruitData?.length) { setPosts([]); setLoading(false); return; }

    const clanIds = recruitData.map((r: any) => r.clan_id);
    const [clansRes, membersRes] = await Promise.all([
      supabase.from("clans").select("id, name, emoji, tag, level, max_members").in("id", clanIds),
      supabase.from("clan_members").select("clan_id").in("clan_id", clanIds),
    ]);

    const countMap = new Map<string, number>();
    (membersRes.data || []).forEach((m: any) => countMap.set(m.clan_id, (countMap.get(m.clan_id) || 0) + 1));
    const clanMap = new Map((clansRes.data || []).map((c: any) => [c.id, c]));

    const merged: RecruitmentPost[] = recruitData.map((r: any) => {
      const clan = clanMap.get(r.clan_id) as any;
      return {
        id: r.id,
        clan_id: r.clan_id,
        description: r.description,
        min_level: r.min_level,
        min_trophies: r.min_trophies,
        auto_join: r.auto_join,
        clan_name: clan?.name || "Unknown",
        clan_emoji: clan?.emoji || "🏏",
        clan_tag: clan?.tag || "",
        clan_level: clan?.level || 1,
        member_count: countMap.get(r.clan_id) || 0,
        max_members: clan?.max_members || 50,
      };
    });

    setPosts(merged);
    setLoading(false);
  };

  const handlePost = async () => {
    if (!myClan || !user) return;
    setSaving(true);
    await supabase.from("clan_recruitment").upsert({
      clan_id: myClan.id,
      posted_by: user.id,
      description: desc.trim(),
      min_level: minLevel,
      auto_join: autoJoin,
    }, { onConflict: "clan_id" });
    setSaving(false);
    setShowCreate(false);
    loadPosts();
  };

  const handleJoin = async (clanId: string) => {
    setJoining(clanId);
    try {
      await joinClan(clanId);

      // Notify clan leaders about the new recruit
      if (user) {
        const { data: leaders } = await supabase.from("clan_members")
          .select("user_id")
          .eq("clan_id", clanId)
          .in("role", ["leader", "co_leader"]);

        const { data: profile } = await supabase.from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        if (leaders?.length) {
          const notifications = leaders.map((l: any) => ({
            user_id: l.user_id,
            type: "recruitment_join",
            title: "📋 New Recruit!",
            message: `${profile?.display_name || "A player"} joined your clan via recruitment board!`,
            data: { clan_id: clanId, recruit_id: user.id },
          }));
          await supabase.from("notifications").insert(notifications);
        }
      }
    } catch {}
    setJoining(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="scoreboard-metal rounded-2xl p-4 text-center">
        <span className="text-4xl block mb-1">📋</span>
        <h3 className="font-display text-sm font-black text-neon-cyan tracking-wider neon-text-cyan">RECRUITMENT BOARD</h3>
        <p className="text-[9px] font-body text-muted-foreground mt-1">Find your perfect clan</p>
      </div>

      {isLeader && myClan && (
        <V10Button variant="gold" size="sm" glow onClick={() => setShowCreate(!showCreate)} className="w-full">
          📝 {showCreate ? "CANCEL" : "POST RECRUITMENT AD"}
        </V10Button>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="stadium-glass rounded-2xl p-4 space-y-3">
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe your clan and what you're looking for..."
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-foreground placeholder:text-muted-foreground outline-none resize-none font-body focus:border-neon-cyan/30 transition-colors" rows={3} maxLength={200} />
              <div className="flex items-center gap-3">
                <label className="text-[9px] font-display text-muted-foreground">MIN LEVEL</label>
                <input type="number" value={minLevel} onChange={e => setMinLevel(Math.max(1, +e.target.value))} min={1} max={50}
                  className="w-16 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-foreground font-display text-center outline-none" />
                <label className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[9px] font-display text-muted-foreground">AUTO-JOIN</span>
                  <button onClick={() => setAutoJoin(!autoJoin)}
                    className={`w-8 h-4 rounded-full transition-colors ${autoJoin ? "bg-neon-green/40" : "bg-white/10"}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoJoin ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </label>
              </div>
              <V10Button variant="primary" size="sm" onClick={handlePost} disabled={saving} className="w-full">
                {saving ? "POSTING..." : "POST AD"}
              </V10Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {posts.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl block mb-2">📭</span>
          <p className="text-muted-foreground text-xs font-body">No recruitment ads yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="stadium-glass rounded-2xl p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{p.clan_emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-display text-xs font-bold text-foreground truncate">{p.clan_name}</span>
                    <span className="text-[7px] text-muted-foreground font-display">[{p.clan_tag}]</span>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] text-muted-foreground font-display tabular-nums">
                    <span>Lv.{p.clan_level}</span>
                    <span>👥 {p.member_count}/{p.max_members}</span>
                    {p.auto_join && <span className="text-neon-green">⚡ AUTO</span>}
                  </div>
                </div>
                {!myClan && p.member_count < p.max_members && (
                  <V10Button variant="primary" size="sm" onClick={() => handleJoin(p.clan_id)} disabled={joining === p.clan_id}>
                    {joining === p.clan_id ? "..." : "JOIN"}
                  </V10Button>
                )}
              </div>
              {p.description && (
                <p className="text-[10px] text-muted-foreground/80 font-body mb-1.5">{p.description}</p>
              )}
              <div className="flex gap-2 text-[7px] font-display text-muted-foreground">
                {p.min_level > 1 && <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Min Lv.{p.min_level}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
