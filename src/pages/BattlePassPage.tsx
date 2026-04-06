import { useState, useEffect, useMemo, useCallback } from "react";
import stoneBattlePassImg from "@/assets/ui/stone-battlepass.png";
import StoneHeader from "@/components/shared/StoneHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Crown, Lock, Clock, Gift } from "lucide-react";
import { SFX, Haptics } from "@/lib/sounds";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TopStatusBar from "@/components/TopStatusBar";
import CurrencyPill from "@/components/shared/CurrencyPill";

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
    5: { icon: "📦", label: "Gold Chest" }, 10: { icon: "🏆", label: "Season Badge" },
    15: { icon: "🪙", label: "Coins", amount: 300 }, 20: { icon: "⭐", label: "XP Boost x2" },
    25: { icon: "📦", label: "Mega Chest" }, 30: { icon: "🏅", label: "Elite Badge" },
    35: { icon: "🪙", label: "Coins", amount: 400 }, 40: { icon: "📦", label: "Legendary Chest" },
    45: { icon: "🪙", label: "Coins", amount: 500 }, 50: { icon: "👑", label: "Champion Title" },
    55: { icon: "💎", label: "Gems", amount: 50 }, 60: { icon: "🏆", label: "Thunder Trophy" },
  };
  const MILESTONE_PREM: Record<number, PassReward["premium"]> = {
    5: { icon: "🖼️", label: "Storm Frame" }, 10: { icon: "👑", label: "Legendary Bat" },
    15: { icon: "✨", label: "Lightning VS" }, 20: { icon: "📦", label: "Legendary Chest" },
    25: { icon: "🎭", label: "Thunder Avatar" }, 30: { icon: "💎", label: "Gems", amount: 100 },
    35: { icon: "🎨", label: "Inferno Bat" }, 40: { icon: "👑", label: "Gold Crown Frame" },
    45: { icon: "📦", label: "Ultra Chest" }, 50: { icon: "✨", label: "Champion VS Effect" },
    55: { icon: "🎭", label: "Legend Avatar" }, 60: { icon: "👑", label: "⚡ THUNDER STRIKER" },
  };
  const rewards: PassReward[] = [];
  for (let t = 1; t <= 60; t++) {
    const milestone = t % 5 === 0;
    const xp = Math.round(t * 80 + (t * t * 1.2));
    rewards.push({
      tier: t, xpNeeded: xp,
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
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
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
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(10,5,6,0.85)", backdropFilter: "blur(8px)" }}
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
            background: "radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%)",
            boxShadow: "0 0 60px rgba(255,215,0,0.4)",
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-6xl">{reward.icon}</span>
        </motion.div>
        <h2 className="font-display text-xl" style={{ color: "#FFD700" }}>REWARD CLAIMED!</h2>
        <p className="font-body text-[#F5E6D3] text-sm">
          {reward.label} {reward.amount ? `× ${reward.amount}` : ""}
        </p>
        <motion.button
          className="mt-4 px-8 py-3 rounded-xl font-display text-sm tracking-wider"
          style={{
            background: "linear-gradient(180deg, #FFD700, #B8860B)",
            color: "#1A0E06",
            border: "2px solid #8B6914",
            borderBottom: "5px solid #6B5210",
            boxShadow: "0 4px 16px rgba(255,215,0,0.3)",
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

/* ── V11 Tier Node (horizontal scrollable) ── */
function TierNode({
  reward, currentXp, isPremium, claimed, onClaim, isCurrent,
}: {
  reward: PassReward; currentXp: number; isPremium: boolean;
  claimed: Set<string>; onClaim: (key: string, r: PassReward["free"]) => void; isCurrent: boolean;
}) {
  const unlocked = currentXp >= reward.xpNeeded;
  const freeKey = `free-${reward.tier}`;
  const premKey = `prem-${reward.tier}`;
  const freeClaimed = claimed.has(freeKey);
  const premClaimed = claimed.has(premKey);

  return (
    <div className="flex flex-col items-center gap-1 shrink-0" style={{ width: "56px" }}>
      {/* Free track node */}
      <motion.button
        className="w-9 h-9 rounded-full flex items-center justify-center relative"
        style={{
          background: freeClaimed
            ? "linear-gradient(180deg, #22C55E44, #16A34A44)"
            : unlocked
              ? "linear-gradient(180deg, #3E2410, #2E1A0E)"
              : "#1A0E06",
          border: isCurrent
            ? "3px solid #22C55E"
            : freeClaimed
              ? "2px solid #22C55E66"
              : unlocked
                ? "2px solid #5C3A1E"
                : "2px solid #2E1A0E",
          boxShadow: isCurrent
            ? "0 0 12px rgba(34,197,94,0.4)"
            : unlocked && !freeClaimed
              ? "0 0 8px rgba(255,215,0,0.2)"
              : "none",
        }}
        animate={unlocked && !freeClaimed ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        onClick={() => unlocked && !freeClaimed && onClaim(freeKey, reward.free)}
        disabled={!unlocked || freeClaimed}
      >
        {freeClaimed ? (
          <span className="text-[10px] text-[#22C55E]">✓</span>
        ) : unlocked ? (
          <span className="text-lg">{reward.free.icon}</span>
        ) : (
          <Lock className="w-3 h-3 text-[#6B7280]" />
        )}
      </motion.button>

      {/* Tier number */}
      <span className="text-[8px] font-display font-bold" style={{
        color: reward.milestone ? "#FFD700" : isCurrent ? "#22C55E" : unlocked ? "#F5E6D3" : "#6B7280",
      }}>
        {reward.tier}
      </span>

      {/* Connection dot */}
      <div className="w-1.5 h-1.5 rounded-full" style={{
        background: freeClaimed ? "#22C55E" : unlocked ? "#FFD700" : "#2E1A0E",
      }} />

      {/* Premium track node */}
      <motion.button
        className="w-9 h-9 rounded-full flex items-center justify-center relative"
        style={{
          background: !isPremium
            ? "#1A0E0688"
            : premClaimed
              ? "linear-gradient(180deg, #FFD70044, #B8860B44)"
              : unlocked
                ? "linear-gradient(180deg, #4A3520, #3E2410)"
                : "#1A0E06",
          border: isPremium && isCurrent
            ? "3px solid #FFD700"
            : premClaimed
              ? "2px solid #FFD70066"
              : isPremium && unlocked
                ? "2px solid #8B6914"
                : "2px solid #2E1A0E",
          boxShadow: isPremium && unlocked && !premClaimed ? "0 0 8px rgba(255,215,0,0.2)" : "none",
          opacity: isPremium ? 1 : 0.4,
        }}
        animate={isPremium && unlocked && !premClaimed ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        onClick={() => isPremium && unlocked && !premClaimed && onClaim(premKey, reward.premium)}
        disabled={!isPremium || !unlocked || premClaimed}
      >
        {!isPremium ? (
          <Lock className="w-3 h-3" style={{ color: "#FFD70066" }} />
        ) : premClaimed ? (
          <span className="text-[10px]" style={{ color: "#FFD700" }}>✓</span>
        ) : unlocked ? (
          <span className="text-lg">{reward.premium.icon}</span>
        ) : (
          <Lock className="w-3 h-3 text-[#6B7280]" />
        )}
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   V11 BATTLE PASS — THE WOODEN TRACK
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
      const [profileRes, claimsRes] = await Promise.all([
        supabase.from("profiles").select("xp, coins, has_premium_pass").eq("user_id", user.id).single(),
        supabase.from("battle_pass_claims" as any).select("tier, track").eq("user_id", user.id).eq("season_label", SEASON_LABEL),
      ]);
      if (profileRes.data) {
        setCurrentXp(profileRes.data.xp ?? 0);
        setCoins(profileRes.data.coins ?? 0);
        setIsPremium(!!(profileRes.data as any).has_premium_pass);
      }
      if (claimsRes.data) {
        const set = new Set<string>();
        (claimsRes.data as any[]).forEach((c: any) => { set.add(`${c.track}-${c.tier}`); });
        setClaimed(set);
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
    const { error } = await supabase.from("profiles").update({ coins: coins - 500, has_premium_pass: true } as any).eq("user_id", user.id);
    if (error) { toast({ title: "Purchase failed", description: error.message, variant: "destructive" }); setPurchasing(false); return; }
    SFX.coinSpend(); Haptics.coinSpend();
    setCoins((c) => c - 500);
    setIsPremium(true);
    setPurchasing(false);
    SFX.levelUp(); Haptics.success();
    toast({ title: "🎉 Premium Pass Unlocked!", description: "You now have access to all premium rewards." });
  }, [user, coins, purchasing, toast]);

  const currentTier = useMemo(() => {
    let t = 0;
    for (const r of REWARDS) { if (currentXp >= r.xpNeeded) t = r.tier; }
    return t;
  }, [currentXp]);

  const nextReward = REWARDS.find((r) => r.tier === currentTier + 1);
  const progressPct = nextReward
    ? Math.min(((currentXp - (REWARDS[currentTier - 1]?.xpNeeded ?? 0)) / (nextReward.xpNeeded - (REWARDS[currentTier - 1]?.xpNeeded ?? 0))) * 100, 100)
    : 100;

  const handleClaim = useCallback(async (key: string, reward: PassReward["free"]) => {
    if (!user || claimed.has(key)) return;
    SFX.rewardClaim(); Haptics.rewardClaim();
    setClaimingReward(reward);
    setClaimed((prev) => new Set(prev).add(key));

    const [track, tierStr] = key.split("-");
    const tier = parseInt(tierStr, 10);

    supabase.from("battle_pass_claims" as any).insert({
      user_id: user.id, tier, track: track === "prem" ? "premium" : "free", season_label: SEASON_LABEL,
    } as any).then(({ error }) => { if (error) console.error("Failed to persist claim:", error.message); });

    const updates: Record<string, number> = {};
    if (reward.label === "Coins" && reward.amount) { updates.coins = coins + reward.amount; setCoins((c) => c + reward.amount!); }
    if (reward.label === "Gems" && reward.amount) { const coinValue = reward.amount * 10; updates.coins = coins + coinValue; setCoins((c) => c + coinValue); }
    if (reward.label === "XP Boost") { updates.xp = currentXp + 50; setCurrentXp((x) => x + 50); }
    if (reward.label === "XP Boost x2") { updates.xp = currentXp + 100; setCurrentXp((x) => x + 100); }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
      if (error) toast({ title: "Failed to save reward", description: error.message, variant: "destructive" });
    }
  }, [user, claimed, coins, currentXp, toast]);

  return (
    <div className="min-h-screen relative overflow-hidden pb-28 fish-scale-bg">
      <TopStatusBar />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-3">
        {/* ═══ Stone Header ═══ */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-body text-sm text-[#F5E6D3]"
            style={{
              background: "linear-gradient(180deg, #3E2410, #2E1A0E)",
              border: "2px solid #5C3A1E",
              boxShadow: "0 4px 0 #1A0E06",
            }}
          >
            ←
          </motion.button>
          <div className="flex-1">
            <img src={stoneBattlePassImg} alt="BATTLE PASS" style={{ height: 30, width: "auto", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }} />
            <span className="text-[9px] font-display tracking-[0.2em]" style={{ color: "#FFD700" }}>{SEASON_LABEL}</span>
          </div>
          <CurrencyPill icon="🪙" value={coins} showPlus={false} />
        </motion.div>

        {/* ═══ Season Countdown ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-xl p-3 flex items-center justify-between mb-4"
          style={{
            background: "linear-gradient(180deg, #3E2410, #2E1A0E)",
            border: "2px solid #5C3A1E",
            boxShadow: "0 4px 0 #1A0E06",
          }}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#3B82F6]" />
            <span className="font-display text-[9px] tracking-wider text-[#94A3B8]">SEASON ENDS</span>
          </div>
          <div className="flex gap-1.5">
            {[
              { val: countdown.d, label: "D" },
              { val: countdown.h, label: "H" },
              { val: countdown.m, label: "M" },
              { val: countdown.s, label: "S" },
            ].map((u) => (
              <div key={u.label} className="flex flex-col items-center rounded-lg px-2 py-1"
                style={{ background: "#1A0E06", border: "1px solid #3E2410" }}
              >
                <span className="font-score text-sm font-black text-[#F5E6D3] leading-none">
                  {String(u.val).padStart(2, "0")}
                </span>
                <span className="font-display text-[7px] text-[#94A3B8]">{u.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ═══ XP Progress — Hammered Metal Bar ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl p-3.5 mb-4"
          style={{
            background: "linear-gradient(180deg, #3E2410, #2E1A0E)",
            border: "2px solid #5C3A1E",
            boxShadow: "0 4px 0 #1A0E06, inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-display text-[9px] tracking-wider text-[#94A3B8]">
              LEVEL {currentTier}/60 → {Math.min(currentTier + 1, 60)}
            </span>
            <span className="font-score text-sm font-black text-[#3B82F6]">{currentXp} XP</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{
            background: "#1A0E06",
            border: "2px solid #3E2410",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
          }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #22C55E, #3B82F6)",
                boxShadow: "0 0 8px rgba(34,197,94,0.4)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[7px] text-[#94A3B8]">NEXT: {nextReward ? nextReward.xpNeeded - currentXp : 0} XP</span>
          </div>
        </motion.div>

        {/* ═══ Premium Unlock ═══ */}
        {!isPremium && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="w-full mb-4 py-3.5 rounded-xl font-display text-sm tracking-wider flex items-center justify-center gap-2 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #FFD700, #B8860B)",
              border: "2px solid #8B6914",
              borderBottom: "6px solid #6B5210",
              color: "#1A0E06",
              boxShadow: "0 6px 24px rgba(255,215,0,0.3), inset 0 1px 0 rgba(255,255,200,0.3)",
            }}
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={handlePurchasePremium}
            disabled={purchasing}
          >
            <Crown className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{purchasing ? "PURCHASING..." : "UNLOCK PREMIUM — 500 🪙"}</span>
          </motion.button>
        )}
        {isPremium && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="mb-4 flex items-center gap-2 justify-center py-2 rounded-xl"
            style={{ background: "#FFD70015", border: "1px solid #FFD70030" }}
          >
            <Crown className="w-4 h-4" style={{ color: "#FFD700" }} />
            <span className="font-display text-xs tracking-wider" style={{ color: "#FFD700" }}>PREMIUM ACTIVE</span>
          </motion.div>
        )}

        {/* ═══ Track Labels ═══ */}
        <div className="rope-separator mb-3" />
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="font-display text-[8px] tracking-widest text-[#94A3B8]">FREE TRACK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" style={{ color: "#FFD700" }} />
            <span className="font-display text-[8px] tracking-widest" style={{ color: "#FFD70088" }}>PREMIUM TRACK</span>
          </div>
        </div>

        {/* ═══ Horizontal Scrollable Track ═══ */}
        <div className="overflow-x-auto no-scrollbar pb-4">
          <div className="flex gap-1 min-w-max px-1">
            {REWARDS.map((r) => (
              <TierNode
                key={r.tier}
                reward={r}
                currentXp={currentXp}
                isPremium={isPremium}
                claimed={claimed}
                onClaim={handleClaim}
                isCurrent={r.tier === currentTier + 1}
              />
            ))}
          </div>
        </div>

        {/* Current tier info card */}
        {nextReward && (
          <div className="mt-4 rounded-xl p-4" style={{
            background: "linear-gradient(180deg, #3E2410, #2E1A0E)",
            border: "2px solid #5C3A1E",
            boxShadow: "0 4px 0 #1A0E06",
          }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-display text-[10px] text-[#94A3B8] tracking-wider">NEXT REWARD</span>
              <span className="font-display text-[10px]" style={{ color: "#FFD700" }}>TIER {nextReward.tier}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-2xl">{nextReward.free.icon}</span>
                <div>
                  <p className="font-body text-[11px] text-[#F5E6D3]">{nextReward.free.label}</p>
                  <p className="text-[8px] text-[#94A3B8]">FREE</p>
                </div>
              </div>
              {isPremium && (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-2xl">{nextReward.premium.icon}</span>
                  <div>
                    <p className="font-body text-[11px]" style={{ color: "#FFD700" }}>{nextReward.premium.label}</p>
                    <p className="text-[8px]" style={{ color: "#FFD70088" }}>PREMIUM</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
