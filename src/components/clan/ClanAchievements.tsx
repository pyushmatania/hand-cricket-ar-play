import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useClan } from "@/hooks/useClan";
import V10Button from "@/components/shared/V10Button";
import canvasConfetti from "canvas-confetti";

/* ── Achievement Definitions ── */
interface AchievementDef {
  id: string;
  emoji: string;
  title: string;
  description: string;
  category: "war" | "stars" | "level" | "members";
  check: (stats: ClanStats) => boolean;
}

interface ClanStats {
  war_wins: number;
  total_stars: number;
  level: number;
  member_count: number;
}

const ACHIEVEMENTS: AchievementDef[] = [
  // War wins
  { id: "war_wins_1", emoji: "⚔️", title: "First Blood", description: "Win 1 clan war", category: "war", check: s => s.war_wins >= 1 },
  { id: "war_wins_5", emoji: "🗡️", title: "War Veteran", description: "Win 5 clan wars", category: "war", check: s => s.war_wins >= 5 },
  { id: "war_wins_10", emoji: "🏹", title: "War Machine", description: "Win 10 clan wars", category: "war", check: s => s.war_wins >= 10 },
  { id: "war_wins_25", emoji: "🔱", title: "War Lord", description: "Win 25 clan wars", category: "war", check: s => s.war_wins >= 25 },
  { id: "war_wins_50", emoji: "👑", title: "War Emperor", description: "Win 50 clan wars", category: "war", check: s => s.war_wins >= 50 },
  // Stars
  { id: "stars_10", emoji: "⭐", title: "Star Collector", description: "Earn 10 total stars", category: "stars", check: s => s.total_stars >= 10 },
  { id: "stars_50", emoji: "🌟", title: "Star Hunter", description: "Earn 50 total stars", category: "stars", check: s => s.total_stars >= 50 },
  { id: "stars_100", emoji: "✨", title: "Star Legend", description: "Earn 100 total stars", category: "stars", check: s => s.total_stars >= 100 },
  { id: "stars_250", emoji: "💫", title: "Constellation", description: "Earn 250 total stars", category: "stars", check: s => s.total_stars >= 250 },
  // Level
  { id: "level_3", emoji: "🏗️", title: "Growing Strong", description: "Reach clan level 3", category: "level", check: s => s.level >= 3 },
  { id: "level_5", emoji: "🏰", title: "Established", description: "Reach clan level 5", category: "level", check: s => s.level >= 5 },
  { id: "level_10", emoji: "🏯", title: "Fortress", description: "Reach clan level 10", category: "level", check: s => s.level >= 10 },
  // Members
  { id: "members_10", emoji: "👥", title: "Squad Up", description: "Recruit 10 members", category: "members", check: s => s.member_count >= 10 },
  { id: "members_25", emoji: "🎪", title: "Full House", description: "Recruit 25 members", category: "members", check: s => s.member_count >= 25 },
  { id: "members_50", emoji: "🏟️", title: "Army", description: "Recruit 50 members", category: "members", check: s => s.member_count >= 50 },
];

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  war: { label: "WAR WINS", emoji: "⚔️" },
  stars: { label: "STARS", emoji: "⭐" },
  level: { label: "LEVEL", emoji: "🏰" },
  members: { label: "MEMBERS", emoji: "👥" },
};

export default function ClanAchievements({ clanId }: { clanId: string }) {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<ClanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [newlyUnlockedIds, setNewlyUnlockedIds] = useState<string[]>([]);
  const [celebrationAchievement, setCelebrationAchievement] = useState<AchievementDef | null>(null);

  useEffect(() => {
    loadData();
  }, [clanId]);

  const loadData = async () => {
    // Fetch unlocked achievements, clan info, wars, and members in parallel
    const [achieveRes, clanRes, warsRes, membersRes] = await Promise.all([
      supabase.from("clan_achievements").select("achievement_id").eq("clan_id", clanId),
      supabase.from("clans").select("level").eq("id", clanId).single(),
      supabase.from("clan_wars").select("clan_a_id, clan_b_id, clan_a_stars, clan_b_stars, winner_clan_id").eq("status", "ended").or(`clan_a_id.eq.${clanId},clan_b_id.eq.${clanId}`),
      supabase.from("clan_members").select("id").eq("clan_id", clanId),
    ]);

    const unlockedSet = new Set((achieveRes.data || []).map((a: any) => a.achievement_id));
    setUnlocked(unlockedSet);

    // Calculate stats
    let warWins = 0;
    let totalStars = 0;
    (warsRes.data || []).forEach((w: any) => {
      const isA = w.clan_a_id === clanId;
      totalStars += isA ? (w.clan_a_stars || 0) : (w.clan_b_stars || 0);
      if (w.winner_clan_id === clanId) warWins++;
    });

    const clanStats: ClanStats = {
      war_wins: warWins,
      total_stars: totalStars,
      level: clanRes.data?.level || 1,
      member_count: (membersRes.data || []).length,
    };
    setStats(clanStats);

    // Auto-unlock any newly earned achievements
    const newlyUnlocked: string[] = [];
    for (const a of ACHIEVEMENTS) {
      if (!unlockedSet.has(a.id) && a.check(clanStats)) {
        newlyUnlocked.push(a.id);
      }
    }

    if (newlyUnlocked.length > 0 && user) {
      const inserts = newlyUnlocked.map(aid => ({ clan_id: clanId, achievement_id: aid }));
      await supabase.from("clan_achievements").upsert(inserts, { onConflict: "clan_id,achievement_id" });

      // Notify all clan members about new achievements
      const { data: members } = await supabase.from("clan_members").select("user_id").eq("clan_id", clanId);
      if (members?.length) {
        const notifications = newlyUnlocked.flatMap(aid => {
          const def = ACHIEVEMENTS.find(a => a.id === aid)!;
          return (members || []).map((m: any) => ({
            user_id: m.user_id,
            type: "clan_achievement",
            title: `${def.emoji} Clan Achievement Unlocked!`,
            message: `Your clan earned "${def.title}" — ${def.description}`,
            data: { clan_id: clanId, achievement_id: aid },
          }));
        });
        // Batch insert
        for (let i = 0; i < notifications.length; i += 100) {
          await supabase.from("notifications").insert(notifications.slice(i, i + 100));
        }
      }

      setUnlocked(prev => {
        const next = new Set(prev);
        newlyUnlocked.forEach(id => next.add(id));
        return next;
      });
    }

    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (filter === "all") return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter(a => a.category === filter);
  }, [filter]);

  const unlockedCount = ACHIEVEMENTS.filter(a => unlocked.has(a.id)).length;

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="scoreboard-metal rounded-2xl p-4 text-center">
        <span className="text-4xl block mb-1">🎖️</span>
        <h3 className="font-display text-sm font-black text-neon-cyan tracking-wider neon-text-cyan">CLAN ACHIEVEMENTS</h3>
        <p className="text-[9px] font-body text-muted-foreground mt-1">
          {unlockedCount}/{ACHIEVEMENTS.length} unlocked
        </p>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden max-w-[200px] mx-auto">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-game-gold to-neon-green"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1 p-1 stadium-glass rounded-xl overflow-x-auto no-scrollbar">
        <button onClick={() => setFilter("all")}
          className={`flex-shrink-0 px-2.5 py-2 rounded-lg font-display text-[8px] tracking-widest font-bold transition-all ${filter === "all" ? "bg-neon-cyan/15 text-neon-cyan" : "text-muted-foreground"}`}>
          ALL
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, { label, emoji }]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex-shrink-0 px-2.5 py-2 rounded-lg font-display text-[8px] tracking-widest font-bold transition-all ${filter === key ? "bg-neon-cyan/15 text-neon-cyan" : "text-muted-foreground"}`}>
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map((a, i) => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`text-center py-3 px-2 rounded-xl border transition-all ${
                isUnlocked
                  ? "stadium-glass border-game-gold/30 bg-game-gold/[0.04]"
                  : "bg-white/[0.02] border-white/5 opacity-50"
              }`}
            >
              <span className={`text-2xl block mb-1 ${isUnlocked ? "" : "grayscale"}`}>{a.emoji}</span>
              <p className={`font-display text-[8px] font-bold tracking-wider truncate ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                {a.title}
              </p>
              <p className="text-[6px] text-muted-foreground font-body mt-0.5 line-clamp-2">{a.description}</p>
              {isUnlocked && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block mt-1 text-[7px] font-display text-neon-green font-bold"
                >
                  ✅ UNLOCKED
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {stats && (
        <div className="stadium-glass rounded-2xl p-3">
          <div className="scoreboard-metal rounded-xl px-3 py-2 mb-2">
            <h4 className="font-display text-[10px] tracking-widest text-neon-cyan/80 font-bold">CURRENT STATS</h4>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="font-display text-sm font-black text-neon-green tabular-nums">{stats.war_wins}</p>
              <p className="text-[6px] font-display tracking-widest text-muted-foreground">WAR WINS</p>
            </div>
            <div>
              <p className="font-display text-sm font-black text-game-gold tabular-nums">{stats.total_stars}</p>
              <p className="text-[6px] font-display tracking-widest text-muted-foreground">STARS</p>
            </div>
            <div>
              <p className="font-display text-sm font-black text-neon-cyan tabular-nums">{stats.level}</p>
              <p className="text-[6px] font-display tracking-widest text-muted-foreground">LEVEL</p>
            </div>
            <div>
              <p className="font-display text-sm font-black text-foreground tabular-nums">{stats.member_count}</p>
              <p className="text-[6px] font-display tracking-widest text-muted-foreground">MEMBERS</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ACHIEVEMENTS };
export type { ClanStats };
