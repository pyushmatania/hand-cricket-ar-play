import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Crown, Lock, Clock, Gift } from "lucide-react";
import { SFX, Haptics } from "@/lib/sounds";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TopStatusBar from "@/components/TopStatusBar";
import CurrencyPill from "@/components/shared/CurrencyPill";

/* ── V10 Material Constants ── */
const V10_BG = "linear-gradient(180deg, hsl(220 20% 8%) 0%, hsl(220 18% 5%) 100%)";
const V10_CARD = "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)";
const CHALK_DIVIDER = "repeating-linear-gradient(90deg, hsl(220 15% 25%) 0px, hsl(220 15% 25%) 8px, transparent 8px, transparent 14px)";

/* ── Season config ── */
const SEASON_END = new Date("2026-05-01T00:00:00Z");
const SEASON_LABEL = "Season 3 — Thunder Strike";

/* ── Reward types ── */
interface PassReward {
  tier: number;
  xpNeeded: number;
  free: { icon: string; label: string; amount?: number };
  premium: { icon: string; label: string; amount?: number };
  milestone?: boolean;
}

/* ── Reward generator — 60 tiers ── */
function generateRewards(): PassReward[] {
  const FREE_POOL = [
    { icon: "🪙", label: "Coins", amount: 50 },
    { icon: "🪙", label: "Coins", amount: 75 },
    { icon: "🪙", label: "Coins", amount: 100 },
    { icon: "⭐", label: "XP Boost" },
    { icon: "📦", label: "Silver Chest" },
    { icon: "⚡", label: "Power Shot" },
    { icon: "🪙", label: "Coins", amount: 150 },
    { icon: "🪙", label: "Coins", amount: 200 },
  ];
  const PREM_POOL = [
    { icon: "🪙", label: "Coins", amount: 150 },
    { icon: "🪙", label: "Coins", amount: 300 },
    { icon: "💎", label: "Gems", amount: 10 },
    { icon: "💎", label: "Gems", amount: 25 },
    { icon: "📦", label: "Gold Chest" },
    { icon: "📦", label: "Mega Chest" },
    { icon: "🎨", label: "Bat Skin" },
    { icon: "✨", label: "VS Effect" },
    { icon: "🖼️", label: "Epic Frame" },
    { icon: "🎭", label: "Rare Avatar" },
  ];
  const MILESTONE_FREE: Record<number, PassReward["free"]> = {
    5: { icon: "📦", label: "Gold Chest" },
    10: { icon: "🏆", label: "Season Badge" },
    15: { icon: "🪙", label: "Coins", amount: 300 },
    20: { icon: "⭐", label: "XP Boost x2" },
    25: { icon: "📦", label: "Mega Chest" },
    30: { icon: "🏅", label: "Elite Badge" },
    35: { icon: "🪙", label: "Coins", amount: 400 },
    40: { icon: "📦", label: "Legendary Chest" },
    45: { icon: "🪙", label: "Coins", amount: 500 },
    50: { icon: "👑", label: "Champion Title" },
    55: { icon: "💎", label: "Gems", amount: 50 },
    60: { icon: "🏆", label: "Thunder Trophy" },
  };
  const MILESTONE_PREM: Record<number, PassReward["premium"]> = {
    5: { icon: "🖼️", label: "Storm Frame" },
    10: { icon: "👑", label: "Legendary Bat" },
    15: { icon: "✨", label: "Lightning VS" },
    20: { icon: "📦", label: "Legendary Chest" },
    25: { icon: "🎭", label: "Thunder Avatar" },
    30: { icon: "💎", label: "Gems", amount: 100 },
    35: { icon: "🎨", label: "Inferno Bat" },
    40: { icon: "👑", label: "Gold Crown Frame" },
    45: { icon: "📦", label: "Ultra Chest" },
    50: { icon: "✨", label: "Champion VS Effect" },
    55: { icon: "🎭", label: "Legend Avatar" },
    60: { icon: "👑", label: "⚡ THUNDER STRIKER" },
  };
  const rewards: PassReward[] = [];
  for (let t = 1; t <= 60; t++) {
    const milestone = t % 5 === 0;
    const xp = Math.round(t * 80 + (t * t * 1.2));
    rewards.push({
      tier: t,
      xpNeeded: xp,
      free: MILESTONE_FREE[t] || FREE_POOL[(t - 1) % FREE_POOL.length],
      premium: MILESTONE_PREM[t] || PREM_POOL[(t - 1) % PREM_POOL.length],
      milestone,
    });
  }
  return rewards;
}

const REWARDS: PassReward[] = generateRewards();

/* ── Countdown hook ── */
function useCountdown(target: Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

/* ── Claim overlay ── */
function ClaimOverlay({ reward, onClose }: { reward: PassReward["free"]; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ scale: 0.5, y: 40 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 14 }}
      >
        <motion.div
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, hsl(43 90% 55% / 0.3), transparent 70%)",
            boxShadow: "0 0 60px hsl(43 90% 55% / 0.4), 0 0 120px hsl(43 90% 55% / 0.2)",
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-6xl">{reward.icon}</span>
        </motion.div>
        <h2 className="font-display text-xl" style={{ color: "hsl(43 90% 55%)" }}>REWARD CLAIMED!</h2>
        <p className="font-body text-foreground text-sm">
          {reward.label} {reward.amount ? `× ${reward.amount}` : ""}
        </p>
        <motion.button
          className="mt-4 px-8 py-3 rounded-xl font-display text-sm tracking-wider"
          style={{
            background: "linear-gradient(180deg, hsl(43 90% 55%), hsl(35 80% 42%))",
            color: "hsl(25 40% 8%)",
            border: "2px solid hsl(35 70% 35%)",
            borderBottom: "5px solid hsl(35 60% 28%)",
            boxShadow: "0 4px 16px hsl(43 90% 55% / 0.3)",
          }}
          whileTap={{ scale: 0.95, y: 2 }}
          onClick={onClose}
        >
          COLLECT
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ── Tier Card — Stadium Concrete ── */
function TierCard({
  reward, currentXp, isPremium, claimed, onClaim,
}: {
  reward: PassReward; currentXp: number; isPremium: boolean;
  claimed: Set<string>; onClaim: (key: string, r: PassReward["free"]) => void;
}) {
  const unlocked = currentXp >= reward.xpNeeded;
  const freeKey = `free-${reward.tier}`;
  const premKey = `prem-${reward.tier}`;
  const freeClaimed = claimed.has(freeKey);
  const premClaimed = claimed.has(premKey);

  const milestoneGlow = reward.milestone ? "0 0 20px hsl(43 90% 55% / 0.15)" : "none";

  return (
    <motion.div
      className="relative flex items-stretch gap-0 rounded-2xl overflow-hidden"
      style={{
        background: CONCRETE_CARD,
        border: reward.milestone
          ? "2px solid hsl(43 70% 45% / 0.5)"
          : unlocked
            ? "2px solid hsl(142 50% 35% / 0.3)"
            : "2px solid hsl(25 18% 22%)",
        borderBottom: reward.milestone
          ? "5px solid hsl(43 60% 28%)"
          : unlocked
            ? "5px solid hsl(142 40% 20%)"
            : "5px solid hsl(25 20% 10%)",
        boxShadow: `0 3px 8px hsl(0 0% 0% / 0.3), ${milestoneGlow}`,
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(reward.tier * 0.015, 0.5) }}
    >
      {/* Tier badge — Scoreboard Paint */}
      <div className="flex flex-col items-center justify-center w-14 shrink-0"
        style={{
          background: reward.milestone
            ? "linear-gradient(180deg, hsl(43 60% 22%), hsl(43 50% 14%))"
            : "linear-gradient(180deg, hsl(25 20% 14%), hsl(25 15% 10%))",
          borderRight: "1px solid hsl(25 18% 18%)",
        }}
      >
        <span className="font-score text-lg font-black" style={{
          color: reward.milestone ? "hsl(43 90% 55%)" : unlocked ? "hsl(142 71% 55%)" : "hsl(25 15% 40%)",
        }}>
          {reward.tier}
        </span>
        {reward.milestone && <Crown className="w-3.5 h-3.5 mt-0.5" style={{ color: "hsl(43 90% 55%)" }} />}
      </div>

      {/* Free reward */}
      <div className="flex-1 flex items-center gap-2 px-3 py-3" style={{ borderRight: "1px solid hsl(25 18% 18%)" }}>
        <span className="text-2xl">{reward.free.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-body text-[11px] text-foreground truncate">{reward.free.label}</p>
          {reward.free.amount && (
            <p className="font-score text-xs" style={{ color: "hsl(25 15% 45%)" }}>×{reward.free.amount}</p>
          )}
        </div>
        {unlocked && !freeClaimed ? (
          <motion.button
            className="px-2 py-1 rounded-lg text-[10px] font-display tracking-wider"
            style={{
              background: "linear-gradient(180deg, hsl(142 71% 50%), hsl(142 65% 38%))",
              color: "white",
              borderBottom: "3px solid hsl(142 55% 25%)",
              boxShadow: "0 2px 8px hsl(142 71% 45% / 0.3)",
            }}
            whileTap={{ scale: 0.9, y: 1 }}
            onClick={() => onClaim(freeKey, reward.free)}
          >
            CLAIM
          </motion.button>
        ) : freeClaimed ? (
          <span className="text-[10px] font-display font-bold" style={{ color: "hsl(142 71% 55%)" }}>✓</span>
        ) : (
          <Lock className="w-3.5 h-3.5" style={{ color: "hsl(25 15% 30%)" }} />
        )}
      </div>

      {/* Premium reward */}
      <div className={`flex-1 flex items-center gap-2 px-3 py-3 relative ${!isPremium ? "opacity-50" : ""}`}>
        {!isPremium && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{
            background: "hsl(25 20% 10% / 0.6)",
            backdropFilter: "blur(1px)",
          }}>
            <Lock className="w-4 h-4" style={{ color: "hsl(43 70% 50% / 0.6)" }} />
          </div>
        )}
        <span className="text-2xl">{reward.premium.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-body text-[11px] truncate" style={{ color: "hsl(43 90% 60%)" }}>{reward.premium.label}</p>
          {reward.premium.amount && (
            <p className="font-score text-xs" style={{ color: "hsl(25 15% 45%)" }}>×{reward.premium.amount}</p>
          )}
        </div>
        {isPremium && unlocked && !premClaimed ? (
          <motion.button
            className="px-2 py-1 rounded-lg text-[10px] font-display tracking-wider"
            style={{
              background: "linear-gradient(180deg, hsl(43 90% 55%), hsl(35 80% 42%))",
              color: "hsl(25 40% 8%)",
              borderBottom: "3px solid hsl(35 60% 28%)",
              boxShadow: "0 2px 8px hsl(43 90% 55% / 0.3)",
            }}
            whileTap={{ scale: 0.9, y: 1 }}
            onClick={() => onClaim(premKey, reward.premium)}
          >
            CLAIM
          </motion.button>
        ) : isPremium && premClaimed ? (
          <span className="text-[10px] font-display font-bold" style={{ color: "hsl(43 90% 55%)" }}>✓</span>
        ) : null}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   BATTLE PASS PAGE — Doc 1 Material System
   ══════════════════════════════════════════════ */
export default function BattlePassPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const countdown = useCountdown(SEASON_END);
  const [isPremium, setIsPremium] = useState(false);
  const [coins, setCoins] = useState(0);
  const [currentXp, setCurrentXp] = useState(0);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [claimingReward, setClaimingReward] = useState<PassReward["free"] | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("xp, coins, has_premium_pass")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setCurrentXp(data.xp ?? 0);
        setCoins(data.coins ?? 0);
        setIsPremium(!!(data as any).has_premium_pass);
      }
    };
    load();
  }, [user]);

  const handlePurchasePremium = useCallback(async () => {
    if (!user || purchasing) return;
    if (coins < 500) {
      toast({ title: "Not enough coins", description: "You need 500 coins to unlock the Premium Pass.", variant: "destructive" });
      return;
    }
    setPurchasing(true);
    const { error } = await supabase
      .from("profiles")
      .update({ coins: coins - 500, has_premium_pass: true } as any)
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Purchase failed", description: error.message, variant: "destructive" });
      setPurchasing(false);
      return;
    }
    SFX.coinSpend();
    Haptics.coinSpend();
    setCoins((c) => c - 500);
    setIsPremium(true);
    setPurchasing(false);
    SFX.levelUp();
    Haptics.success();
    toast({ title: "🎉 Premium Pass Unlocked!", description: "You now have access to all premium rewards." });
  }, [user, coins, purchasing, toast]);

  const currentTier = useMemo(() => {
    let t = 0;
    for (const r of REWARDS) {
      if (currentXp >= r.xpNeeded) t = r.tier;
    }
    return t;
  }, [currentXp]);

  const nextReward = REWARDS.find((r) => r.tier === currentTier + 1);
  const progressPct = nextReward
    ? Math.min(
        ((currentXp - (REWARDS[currentTier - 1]?.xpNeeded ?? 0)) /
          (nextReward.xpNeeded - (REWARDS[currentTier - 1]?.xpNeeded ?? 0))) *
          100,
        100
      )
    : 100;

  const handleClaim = useCallback(async (key: string, reward: PassReward["free"]) => {
    if (!user || claimed.has(key)) return;
    SFX.rewardClaim();
    Haptics.rewardClaim();
    setClaimingReward(reward);
    setClaimed((prev) => new Set(prev).add(key));

    const updates: Record<string, number> = {};
    if (reward.label === "Coins" && reward.amount) {
      updates.coins = coins + reward.amount;
      setCoins((c) => c + reward.amount!);
    }
    if (reward.label === "Gems" && reward.amount) {
      const coinValue = reward.amount * 10;
      updates.coins = coins + coinValue;
      setCoins((c) => c + coinValue);
    }
    if (reward.label === "XP Boost") {
      updates.xp = currentXp + 50;
      setCurrentXp((x) => x + 50);
    }
    if (reward.label === "XP Boost x2") {
      updates.xp = currentXp + 100;
      setCurrentXp((x) => x + 100);
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
      if (error) toast({ title: "Failed to save reward", description: error.message, variant: "destructive" });
    }
  }, [user, claimed, coins, currentXp, toast]);

  return (
    <div className="min-h-screen relative overflow-hidden pb-28" style={{ background: LEATHER_BG }}>
      {/* Leather grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: LEATHER_GRAIN, backgroundRepeat: "repeat" }} />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(25 30% 4% / 0.7) 100%)" }} />

      <TopStatusBar />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-3">

        {/* ═══ Header — Floodlight Chrome ═══ */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-body text-sm text-foreground"
            style={{
              background: "linear-gradient(180deg, hsl(28 20% 22%) 0%, hsl(25 18% 15%) 100%)",
              border: "2px solid hsl(43 50% 35%)",
              boxShadow: "0 3px 0 hsl(25 30% 10%), inset 0 1px 0 hsl(43 40% 45% / 0.3)",
            }}>
            ←
          </motion.button>
          <div className="flex-1">
            <h1 className="font-display text-lg text-foreground" style={{ textShadow: "0 2px 0 hsl(25 40% 8%)" }}>
              Battle Pass
            </h1>
            <span className="text-[9px] font-display tracking-[0.2em]" style={{ color: "hsl(43 90% 55%)" }}>
              {SEASON_LABEL}
            </span>
          </div>
          <CurrencyPill icon="🪙" value={coins} showPlus={false} />
        </motion.div>

        {/* ═══ Season Countdown — Stadium Concrete ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-3 flex items-center justify-between mb-4"
          style={{
            background: CONCRETE_CARD,
            border: "2px solid hsl(25 18% 22%)",
            borderBottom: "5px solid hsl(25 20% 10%)",
            boxShadow: "0 3px 8px hsl(0 0% 0% / 0.3)",
          }}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "hsl(207 90% 55%)" }} />
            <span className="font-display text-[9px] tracking-wider text-muted-foreground">SEASON ENDS</span>
          </div>
          <div className="flex gap-1.5">
            {[
              { val: countdown.d, label: "D" },
              { val: countdown.h, label: "H" },
              { val: countdown.m, label: "M" },
              { val: countdown.s, label: "S" },
            ].map((u) => (
              <div key={u.label} className="flex flex-col items-center rounded-lg px-2 py-1"
                style={{
                  background: "linear-gradient(180deg, hsl(25 20% 12%), hsl(25 15% 9%))",
                  border: "1px solid hsl(25 15% 18%)",
                }}>
                <span className="font-score text-sm font-black text-foreground leading-none">
                  {String(u.val).padStart(2, "0")}
                </span>
                <span className="font-display text-[7px] text-muted-foreground">{u.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ═══ XP Progress — Scoreboard Paint ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-3.5 mb-4"
          style={{
            background: CONCRETE_CARD,
            border: "2px solid hsl(25 18% 22%)",
            borderBottom: "5px solid hsl(25 20% 10%)",
          }}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-display text-[9px] tracking-wider text-muted-foreground">
              TIER {currentTier}/60 → {Math.min(currentTier + 1, 60)}
            </span>
            <span className="font-score text-sm font-black" style={{ color: "hsl(207 90% 55%)" }}>
              {currentXp} XP
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{
            background: "linear-gradient(180deg, hsl(25 30% 10%), hsl(25 25% 14%))",
            border: "1px solid hsl(25 20% 8%)",
            boxShadow: "inset 0 1px 3px hsl(0 0% 0% / 0.5)",
          }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(207 90% 50%), hsl(168 80% 50%))",
                boxShadow: "0 0 8px hsl(207 90% 50% / 0.4)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* ═══ Premium Unlock — Jersey Mesh ═══ */}
        {!isPremium && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="w-full mb-4 py-3.5 rounded-2xl font-display text-sm tracking-wider flex items-center justify-center gap-2 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(43 90% 55%) 0%, hsl(35 80% 42%) 100%)",
              border: "2px solid hsl(43 70% 45% / 0.5)",
              borderBottom: "6px solid hsl(35 60% 28%)",
              color: "hsl(25 40% 8%)",
              textShadow: "0 1px 0 hsl(43 80% 70% / 0.3)",
              boxShadow: "0 6px 24px hsl(43 90% 55% / 0.3), inset 0 1px 0 hsl(43 80% 70% / 0.4)",
            }}
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={handlePurchasePremium}
            disabled={purchasing}
          >
            {/* Jersey mesh texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
            <Crown className="w-4 h-4 relative z-10" />
            <span className="relative z-10">
              {purchasing ? "PURCHASING..." : `UNLOCK PREMIUM — 500 🪙`}
            </span>
          </motion.button>
        )}
        {isPremium && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="mb-4 flex items-center gap-2 justify-center py-2 rounded-xl"
            style={{
              background: "hsl(43 60% 20% / 0.2)",
              border: "1px solid hsl(43 70% 45% / 0.3)",
            }}>
            <Crown className="w-4 h-4" style={{ color: "hsl(43 90% 55%)" }} />
            <span className="font-display text-xs tracking-wider" style={{ color: "hsl(43 90% 55%)" }}>PREMIUM ACTIVE</span>
          </motion.div>
        )}

        {/* ═══ Track Header — Chalk divider ═══ */}
        <div className="h-px mb-3 mx-2 opacity-20" style={{ background: CHALK_DIVIDER }} />

        <div className="flex items-center gap-4 px-2 mb-3">
          <div className="flex-1 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" style={{ color: "hsl(142 71% 55%)" }} />
            <span className="font-display text-[8px] tracking-widest text-muted-foreground">FREE</span>
          </div>
          <div className="flex-1 flex items-center gap-1.5 justify-end">
            <Crown className="w-3.5 h-3.5" style={{ color: "hsl(43 90% 55%)" }} />
            <span className="font-display text-[8px] tracking-widest" style={{ color: "hsl(43 70% 50% / 0.7)" }}>PREMIUM</span>
          </div>
        </div>

        {/* ═══ Reward Tiers — Stadium Concrete Cards ═══ */}
        <div className="space-y-2 pb-4">
          {REWARDS.map((r, i) => (
            <div key={r.tier}>
              {/* Section header every 10 tiers */}
              {r.tier % 10 === 1 && (
                <div className="flex items-center gap-2 py-2 mb-1">
                  <div className="flex-1 h-px opacity-20" style={{ background: CHALK_DIVIDER }} />
                  <span className="font-display text-[8px] tracking-[0.3em] px-2" style={{
                    color: r.tier <= currentTier + 1 ? "hsl(43 90% 55%)" : "hsl(25 15% 40%)",
                  }}>
                    {r.tier === 1 ? "TIER 1–10" : r.tier === 11 ? "TIER 11–20" : r.tier === 21 ? "TIER 21–30" : r.tier === 31 ? "TIER 31–40" : r.tier === 41 ? "TIER 41–50" : "TIER 51–60"}
                  </span>
                  <div className="flex-1 h-px opacity-20" style={{ background: CHALK_DIVIDER }} />
                </div>
              )}
              <TierCard
                reward={r}
                currentXp={currentXp}
                isPremium={isPremium}
                claimed={claimed}
                onClaim={handleClaim}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Claim overlay */}
      <AnimatePresence>
        {claimingReward && (
          <ClaimOverlay reward={claimingReward} onClose={() => setClaimingReward(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
