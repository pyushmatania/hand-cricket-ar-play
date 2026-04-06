import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RANK_TIERS, calculateRankPoints, getRankTier, getNextTier } from "@/lib/rankTiers";
import RankBadge from "./RankBadge";

/* ── Types ── */
interface ChallengeCompletion {
  id: string;
  challenge_id: string;
  completed_at: string;
  title?: string;
  description?: string;
  reward_label?: string;
}

interface RankHistoryEntry {
  id: string;
  old_tier: string;
  new_tier: string;
  points: number;
  created_at: string;
}

interface ProfileStats {
  wins: number;
  total_matches: number;
  high_score: number;
  best_streak: number;
  xp: number;
  coins: number;
  rank_tier: string;
}

/* ── Trophy slot definitions ── */
const TROPHY_SLOTS = [
  { id: "season_1", label: "Season 1", icon: "🏆", shelfRow: 0, pos: 0 },
  { id: "season_2", label: "Season 2", icon: "🏆", shelfRow: 0, pos: 1 },
  { id: "tourney_win", label: "Tournament", icon: "🥇", shelfRow: 0, pos: 2 },
  { id: "war_gold", label: "War Gold", icon: "⚔️", shelfRow: 0, pos: 3 },
  { id: "challenge_master", label: "Challenges", icon: "🎯", shelfRow: 1, pos: 0 },
  { id: "streak_king", label: "Streak King", icon: "🔥", shelfRow: 1, pos: 1 },
  { id: "century_club", label: "Century Club", icon: "💯", shelfRow: 1, pos: 2 },
  { id: "six_machine", label: "Six Machine", icon: "6️⃣", shelfRow: 1, pos: 3 },
];

/* ── Single Trophy Pedestal ── */
function TrophyPedestal({
  slot,
  earned,
  earnedData,
  onTap,
}: {
  slot: (typeof TROPHY_SLOTS)[0];
  earned: boolean;
  earnedData?: ChallengeCompletion;
  onTap: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onTap}
      className="flex flex-col items-center gap-1 relative"
    >
      {/* Trophy container */}
      <div
        className="relative w-16 h-20 flex items-end justify-center pb-1"
      >
        {earned ? (
          <>
            {/* Glow behind trophy */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-6 rounded-full blur-md"
              style={{ background: "hsl(45 100% 50% / 0.2)" }}
            />
            {/* Trophy */}
            <motion.div
              initial={{ scale: 0, rotateZ: -10 }}
              animate={{ scale: 1, rotateZ: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="relative z-10 text-3xl"
              style={{
                filter: "drop-shadow(0 4px 6px hsl(0 0% 0% / 0.5)) drop-shadow(0 0 8px hsl(45 100% 50% / 0.2))",
              }}
            >
              {slot.icon}
            </motion.div>
            {/* Shadow on shelf */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full"
              style={{
                background: "radial-gradient(ellipse, hsl(0 0% 0% / 0.4), transparent)",
              }}
            />
          </>
        ) : (
          <>
            {/* Empty silhouette */}
            <div
              className="relative z-10 text-3xl opacity-[0.12] grayscale"
              style={{
                filter: "brightness(0.3) contrast(0.5)",
              }}
            >
              {slot.icon}
            </div>
            {/* Dashed outline */}
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg"
              style={{ border: "1.5px dashed hsl(220 10% 30% / 0.3)" }}
            />
          </>
        )}
      </div>
      {/* Label */}
      <span
        className={`font-display text-[7px] font-bold tracking-widest ${
          earned ? "text-foreground/70" : "text-muted-foreground/30"
        }`}
      >
        {slot.label.toUpperCase()}
      </span>
    </motion.button>
  );
}

/* ── Wooden Shelf ── */
function WoodenShelf({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Trophy row */}
      <div className="relative z-10 flex items-end justify-around px-2 pb-0">
        {children}
      </div>
      {/* Shelf plank */}
      <div
        className="relative h-4 rounded-md mx-1"
        style={{
          background: "linear-gradient(180deg, hsl(30 45% 28%), hsl(25 40% 18%))",
          border: "2px solid hsl(25 35% 14%)",
          boxShadow:
            "inset 0 1px 0 hsl(35 45% 38%), inset 0 -1px 0 hsl(220 15% 8%), 0 4px 8px hsl(0 0% 0% / 0.4)",
        }}
      >
        {/* Wood grain */}
        <div className="absolute inset-0 overflow-hidden rounded-sm opacity-10">
          {[25, 50, 75].map((t) => (
            <div key={t} className="absolute w-full h-px" style={{ top: `${t}%`, background: "hsl(30 20% 12%)" }} />
          ))}
        </div>
      </div>
      {/* Shelf brackets */}
      <div className="flex justify-between px-3 -mt-0.5 relative z-0">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="w-3 h-4"
            style={{
              background: "linear-gradient(180deg, hsl(220 10% 40%), hsl(220 8% 28%))",
              borderRadius: "0 0 2px 2px",
              boxShadow: "inset 0 1px 0 hsl(220 10% 55%), 0 2px 4px hsl(0 0% 0% / 0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Trophy Detail Modal ── */
function TrophyDetail({
  slot,
  data,
  onClose,
}: {
  slot: (typeof TROPHY_SLOTS)[0];
  data?: ChallengeCompletion;
  onClose: () => void;
}) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-72 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(30 45% 25%), hsl(25 40% 14%))",
          border: "3px solid hsl(25 35% 12%)",
          boxShadow: "inset 0 2px 0 hsl(35 45% 35%), 0 12px 40px hsl(0 0% 0% / 0.6)",
        }}
      >
        {/* Corner rivets */}
        {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
          <div
            key={pos}
            className={`absolute ${pos} w-2 h-2 rounded-full`}
            style={{
              background: "radial-gradient(circle at 35% 35%, hsl(40 30% 60%), hsl(35 25% 30%))",
              boxShadow: "inset 0 1px 0 hsl(40 30% 70%)",
            }}
          />
        ))}

        <div className="p-5 text-center">
          {/* Trophy icon */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-3"
            style={{ filter: "drop-shadow(0 6px 10px hsl(0 0% 0% / 0.5)) drop-shadow(0 0 15px hsl(45 100% 50% / 0.15))" }}
          >
            {data ? slot.icon : "🔒"}
          </motion.div>

          <h3 className="font-display text-sm font-black text-foreground tracking-wider mb-1">
            {slot.label.toUpperCase()}
          </h3>

          {data ? (
            <>
              <p className="text-[10px] text-muted-foreground mb-2">{data.description || data.title || "Challenge completed!"}</p>
              {data.reward_label && (
                <div
                  className="inline-block px-3 py-1 rounded-lg mb-2"
                  style={{
                    background: "linear-gradient(135deg, hsl(45 80% 30% / 0.3), hsl(45 60% 20% / 0.2))",
                    border: "1px solid hsl(45 60% 40% / 0.3)",
                  }}
                >
                  <span className="font-display text-[9px] font-bold tracking-wider" style={{ color: "hsl(45 90% 60%)" }}>
                    🎖️ {data.reward_label}
                  </span>
                </div>
              )}
              {data.completed_at && (
                <p className="text-[8px] text-muted-foreground/50 font-display tracking-wider">
                  Earned: {formatDate(data.completed_at)}
                </p>
              )}
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground/50">
              Keep playing to unlock this trophy!
            </p>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-3 px-6 py-2 rounded-xl font-display text-[10px] font-bold tracking-widest"
            style={{
              background: "linear-gradient(180deg, hsl(220 15% 30%), hsl(220 12% 20%))",
              border: "2px solid hsl(220 10% 15%)",
              borderBottom: "4px solid hsl(220 10% 12%)",
              color: "hsl(220 10% 70%)",
              boxShadow: "0 3px 0 hsl(220 10% 10%)",
            }}
          >
            CLOSE
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═════════════════════════════════════════════
   MAIN TROPHY CASE
   ═════════════════════════════════════════════ */
export default function TrophyCase() {
  const { user } = useAuth();
  const [completedChallenges, setCompletedChallenges] = useState<ChallengeCompletion[]>([]);
  const [rankHistory, setRankHistory] = useState<RankHistoryEntry[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [activeSection, setActiveSection] = useState<"cabinet" | "rank" | "rewards">("cabinet");
  const [selectedSlot, setSelectedSlot] = useState<(typeof TROPHY_SLOTS)[0] | null>(null);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("challenge_progress")
      .select("id, challenge_id, completed_at")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("completed_at", { ascending: false })
      .then(async ({ data }) => {
        if (!data || !data.length) return;
        const challengeIds = data.map((d: any) => d.challenge_id);
        const { data: challenges } = await supabase
          .from("weekly_challenges")
          .select("id, title, description, reward_label")
          .in("id", challengeIds);
        const mapped = data.map((d: any) => {
          const ch = challenges?.find((c: any) => c.id === d.challenge_id);
          return { ...d, title: ch?.title, description: ch?.description, reward_label: ch?.reward_label };
        });
        setCompletedChallenges(mapped);
      });

    supabase
      .from("rank_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setRankHistory(data as unknown as RankHistoryEntry[]);
      });

    supabase
      .from("profiles")
      .select("wins, total_matches, high_score, best_streak, xp, coins, rank_tier")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setStats(data as unknown as ProfileStats);
      });
  }, [user]);

  if (!stats) return null;

  const currentTier = getRankTier(stats);
  const nextTierInfo = getNextTier(stats);
  const points = calculateRankPoints(stats);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  // Determine which slots are earned based on stats + challenges
  const earnedSlots = new Set<string>();
  if (completedChallenges.length >= 1) earnedSlots.add("challenge_master");
  if (stats.best_streak >= 5) earnedSlots.add("streak_king");
  if (stats.high_score >= 100) earnedSlots.add("century_club");
  if (stats.wins >= 10) earnedSlots.add("tourney_win");
  if (stats.wins >= 50) earnedSlots.add("war_gold");
  if (stats.total_matches >= 20) earnedSlots.add("season_1");
  if (stats.total_matches >= 50) earnedSlots.add("season_2");
  if (stats.high_score >= 60) earnedSlots.add("six_machine");

  const shelf0 = TROPHY_SLOTS.filter((s) => s.shelfRow === 0);
  const shelf1 = TROPHY_SLOTS.filter((s) => s.shelfRow === 1);

  const sections = [
    { key: "cabinet" as const, label: "🏆 CABINET" },
    { key: "rank" as const, label: "💎 RANK" },
    { key: "rewards" as const, label: "🪙 REWARDS" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Current Rank Card */}
      <div className={`relative rounded-2xl p-4 overflow-hidden border ${currentTier.borderColor}`}
        style={{
          background: "linear-gradient(180deg, hsl(222 40% 14%), hsl(222 40% 8%))",
          boxShadow: "0 6px 20px hsl(0 0% 0% / 0.4)",
        }}
      >
        <div className={`absolute inset-0 ${currentTier.bgColor} opacity-40`} />
        <div className="relative z-10 flex items-center gap-4">
          <RankBadge stats={stats} />
          <div className="flex-1">
            <span className="text-[7px] text-muted-foreground font-display tracking-widest block">CURRENT RANK</span>
            <span className={`font-display text-lg font-black ${currentTier.color} tracking-wider`}>{currentTier.name}</span>
            <span className="font-display text-[10px] text-muted-foreground block">{points} RP</span>
          </div>
          <div className="text-right">
            <span className="text-[8px] text-muted-foreground font-display block">✨ {stats.xp} XP</span>
            <span className="text-[8px] text-secondary font-display font-bold block">🪙 {stats.coins}</span>
          </div>
        </div>
        {nextTierInfo.next && (
          <div className="relative z-10 mt-3">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[7px] text-muted-foreground font-display tracking-wider">
                → {nextTierInfo.next.emoji} {nextTierInfo.next.name}
              </span>
              <span className="text-[8px] text-primary font-display font-bold">{nextTierInfo.pointsNeeded} pts away</span>
            </div>
            <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${nextTierInfo.progress}%` }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{
          background: "linear-gradient(180deg, hsl(30 40% 22%), hsl(220 15% 10%))",
          border: "2px solid hsl(220 15% 9%)",
          boxShadow: "inset 0 1px 0 hsl(35 40% 32%), 0 3px 8px hsl(0 0% 0% / 0.3)",
        }}
      >
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className="flex-1 py-2 rounded-lg font-display text-[8px] font-bold tracking-widest transition-all"
            style={{
              background:
                activeSection === s.key
                  ? "linear-gradient(180deg, hsl(30 50% 30%), hsl(25 45% 20%))"
                  : "transparent",
              border: activeSection === s.key ? "1px solid hsl(35 40% 35% / 0.4)" : "1px solid transparent",
              color: activeSection === s.key ? "hsl(35 80% 65%)" : "hsl(220 10% 50%)",
              boxShadow: activeSection === s.key ? "inset 0 1px 0 hsl(35 45% 40%), 0 2px 4px hsl(0 0% 0% / 0.2)" : "none",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Trophy Cabinet ─── */}
        {activeSection === "cabinet" && (
          <motion.div key="cabinet" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            {/* Cabinet frame */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, hsl(220 15% 14%), hsl(220 12% 9%))",
                border: "3px solid hsl(220 10% 18%)",
                boxShadow:
                  "inset 0 2px 0 hsl(220 12% 22%), inset 0 -2px 0 hsl(220 10% 6%), 0 8px 24px hsl(0 0% 0% / 0.5)",
              }}
            >
              {/* Header strip */}
              <div
                className="px-4 py-2 text-center"
                style={{
                  background: "linear-gradient(90deg, hsl(30 45% 22%), hsl(35 50% 28%), hsl(30 45% 22%))",
                  borderBottom: "2px solid hsl(25 35% 14%)",
                  boxShadow: "inset 0 1px 0 hsl(35 45% 38%)",
                }}
              >
                <span className="font-display text-[10px] font-black tracking-[0.25em]" style={{ color: "hsl(35 70% 60%)" }}>
                  🏆 TROPHY CABINET
                </span>
                <span className="text-[7px] text-muted-foreground/50 font-display block tracking-wider">
                  {earnedSlots.size}/{TROPHY_SLOTS.length} COLLECTED
                </span>
              </div>

              {/* Shelf 1 (top row) */}
              <div className="pt-4 px-2">
                <WoodenShelf>
                  {shelf0.map((slot) => (
                    <TrophyPedestal
                      key={slot.id}
                      slot={slot}
                      earned={earnedSlots.has(slot.id)}
                      earnedData={completedChallenges[0]}
                      onTap={() => setSelectedSlot(slot)}
                    />
                  ))}
                </WoodenShelf>
              </div>

              {/* Shelf 2 (bottom row) */}
              <div className="pt-3 pb-4 px-2">
                <WoodenShelf>
                  {shelf1.map((slot) => (
                    <TrophyPedestal
                      key={slot.id}
                      slot={slot}
                      earned={earnedSlots.has(slot.id)}
                      earnedData={completedChallenges[0]}
                      onTap={() => setSelectedSlot(slot)}
                    />
                  ))}
                </WoodenShelf>
              </div>

              {/* Back wall texture */}
              <div className="absolute inset-0 scallop-bg opacity-[0.02] pointer-events-none" />
            </div>
          </motion.div>
        )}

        {/* ─── Rank History ─── */}
        {activeSection === "rank" && (
          <motion.div key="rank" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div
              className="rounded-xl p-3 mb-3"
              style={{
                background: "linear-gradient(180deg, hsl(222 40% 14%), hsl(222 40% 10%))",
                border: "2px solid hsl(220 15% 20%)",
                boxShadow: "0 4px 12px hsl(0 0% 0% / 0.3)",
              }}
            >
              <span className="font-display text-[8px] font-bold text-muted-foreground tracking-widest block mb-2">TIER PROGRESSION</span>
              <div className="flex items-center justify-between">
                {RANK_TIERS.map((tier) => {
                  const isActive = currentTier.name === tier.name;
                  const isPast = points >= tier.minPoints;
                  return (
                    <div key={tier.name} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                          isActive
                            ? `${tier.bgColor} border-2 ${tier.borderColor} ${tier.glowColor}`
                            : isPast
                            ? `${tier.bgColor} border ${tier.borderColor}`
                            : "bg-muted/20 border border-muted/10 opacity-40"
                        }`}
                      >
                        {tier.emoji}
                      </div>
                      <span className={`text-[6px] font-display font-bold tracking-wider ${isActive ? tier.color : "text-muted-foreground/50"}`}>
                        {tier.name.slice(0, 4).toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {rankHistory.length === 0 ? (
              <div
                className="rounded-xl p-6 text-center"
                style={{
                  background: "linear-gradient(180deg, hsl(222 40% 14%), hsl(222 40% 10%))",
                  border: "2px solid hsl(220 15% 20%)",
                }}
              >
                <span className="text-2xl block mb-2">📈</span>
                <span className="font-display text-[10px] font-bold text-muted-foreground tracking-wider">NO RANK CHANGES YET</span>
                <p className="text-[8px] text-muted-foreground/60 mt-1">Keep playing to rank up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rankHistory.map((r, i) => {
                  const isPromotion = RANK_TIERS.findIndex((t) => t.name === r.new_tier) > RANK_TIERS.findIndex((t) => t.name === r.old_tier);
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl p-3 flex items-center gap-3"
                      style={{
                        background: "linear-gradient(180deg, hsl(222 40% 14%), hsl(222 40% 10%))",
                        border: `2px solid ${isPromotion ? "hsl(142 60% 30% / 0.3)" : "hsl(0 50% 35% / 0.3)"}`,
                        boxShadow: "0 3px 8px hsl(0 0% 0% / 0.25)",
                      }}
                    >
                      <span className="text-xl">{isPromotion ? "⬆️" : "⬇️"}</span>
                      <div className="flex-1">
                        <span className="font-display text-[10px] font-bold text-foreground tracking-wider">
                          {r.old_tier} → {r.new_tier}
                        </span>
                        <span className="text-[7px] text-muted-foreground block">{r.points} RP • {formatDate(r.created_at)}</span>
                      </div>
                      <span className={`font-display text-[9px] font-bold ${isPromotion ? "text-neon-green" : "text-out-red"}`}>
                        {isPromotion ? "PROMOTED" : "DEMOTED"}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Rewards ─── */}
        {activeSection === "rewards" && (
          <motion.div key="rewards" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { icon: "✨", value: stats.xp, label: "TOTAL XP", accent: "hsl(217 91% 60%)" },
                { icon: "🪙", value: stats.coins, label: "COINS", accent: "hsl(45 93% 58%)" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl p-4 text-center"
                  style={{
                    background: "linear-gradient(180deg, hsl(222 40% 14%), hsl(222 40% 10%))",
                    border: `2px solid ${item.accent}33`,
                    boxShadow: `0 4px 12px hsl(0 0% 0% / 0.3), 0 0 12px ${item.accent}11`,
                  }}
                >
                  <span className="text-2xl block mb-1">{item.icon}</span>
                  <span className="font-display text-2xl font-black" style={{ color: item.accent }}>{item.value}</span>
                  <span className="text-[7px] text-muted-foreground font-display tracking-widest block mt-1">{item.label}</span>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl p-3"
              style={{
                background: "linear-gradient(180deg, hsl(222 40% 14%), hsl(222 40% 10%))",
                border: "2px solid hsl(220 15% 20%)",
                boxShadow: "0 4px 12px hsl(0 0% 0% / 0.3)",
              }}
            >
              <span className="font-display text-[8px] font-bold text-muted-foreground tracking-widest block mb-2">EARNINGS PER MATCH</span>
              <div className="space-y-2">
                {[
                  { label: "Win", xp: "+30 XP", coins: "+50 🪙", color: "hsl(142 71% 55%)" },
                  { label: "Loss", xp: "+10 XP", coins: "+10 🪙", color: "hsl(4 90% 58%)" },
                  { label: "Draw", xp: "+15 XP", coins: "+20 🪙", color: "hsl(45 93% 58%)" },
                  { label: "Challenge", xp: "+50 XP", coins: "+100 🪙", color: "hsl(217 91% 60%)" },
                  { label: "Rank Up", xp: "+100 XP", coins: "+200 🪙", color: "hsl(45 100% 55%)" },
                ].map((e) => (
                  <div key={e.label} className="flex items-center justify-between py-1 border-b border-muted/10 last:border-0">
                    <span className="text-[9px] font-display font-bold" style={{ color: e.color }}>{e.label}</span>
                    <div className="flex gap-3">
                      <span className="text-[8px] text-primary font-display">{e.xp}</span>
                      <span className="text-[8px] text-secondary font-display">{e.coins}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trophy Detail Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <TrophyDetail
            slot={selectedSlot}
            data={earnedSlots.has(selectedSlot.id) ? completedChallenges[0] : undefined}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
