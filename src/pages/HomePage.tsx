import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { SFX, Haptics } from "@/lib/sounds";
import arenaGullyGrounds from "@/assets/arena-gully-grounds.jpg";
import { useUserChests, useStartUnlock, useCollectChest, chestTimeRemaining, type UserChest } from "@/hooks/useUserChests";
import { getChestTier } from "@/lib/chests";
import ChestReveal from "@/components/shop/ChestReveal";
import GameModeCards from "@/components/GameModeCards";
import StumpHitAnimation from "@/components/StumpHitAnimation";
import { Lock, Timer, Settings } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  total_matches: number;
  wins: number;
  losses: number;
  high_score: number;
  current_streak: number;
  best_streak: number;
  coins: number;
  xp: number;
  display_name?: string;
}

const ARENA_LEVELS = [
  { name: "Gully Grounds", trophies: 0 },
  { name: "School Ground", trophies: 100 },
  { name: "District Stadium", trophies: 300 },
  { name: "Ranji Arena", trophies: 600 },
  { name: "IPL Stadium", trophies: 1000 },
  { name: "International", trophies: 2000 },
  { name: "World Cup", trophies: 5000 },
];

function formatTime(seconds: number): string {
  if (seconds <= 0) return "READY";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/* ══════════════════════════════════════════════
   CHEST TIER VISUAL CONFIG (Cricket-Themed)
   ══════════════════════════════════════════════ */

const CRICKET_CHEST: Record<string, { icon: string; label: string; color: string; glow: string; border: string }> = {
  bronze:  { icon: "🎾", label: "Tennis Ball", color: "hsl(35 80% 55%)",  glow: "hsl(35 80% 55% / 0.4)",  border: "hsl(35 50% 30%)" },
  silver:  { icon: "🏏", label: "Red Ball",    color: "hsl(0 65% 50%)",   glow: "hsl(0 65% 50% / 0.4)",   border: "hsl(0 40% 30%)" },
  gold:    { icon: "🏆", label: "Trophy",      color: "hsl(43 100% 55%)", glow: "hsl(43 100% 55% / 0.5)", border: "hsl(35 70% 35%)" },
  diamond: { icon: "💎", label: "Crystal Bat",  color: "hsl(200 80% 65%)", glow: "hsl(200 80% 65% / 0.5)", border: "hsl(210 50% 40%)" },
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showStumpAnim, setShowStumpAnim] = useState(false);
  const [tick, setTick] = useState(0);
  const [revealData, setRevealData] = useState<{ name: string; emoji: string; rarity: string } | null>(null);

  const { data: chests } = useUserChests();
  const startUnlock = useStartUnlock();
  const collectChest = useCollectChest();

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const seen = localStorage.getItem("hc_onboarding_done");
    if (!seen) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("total_matches, wins, losses, high_score, current_streak, best_streak, coins, xp, display_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data as ProfileData); });
  }, [user]);

  const completeOnboarding = () => {
    localStorage.setItem("hc_onboarding_done", "1");
    setShowOnboarding(false);
  };

  const handlePlay = useCallback(() => {
    try { SFX.tap(); Haptics.heavy(); } catch { /* */ }
    setShowStumpAnim(true);
  }, []);

  const [pendingMode, setPendingMode] = useState<string | null>(null);

  const handleBattle = useCallback((modeId: string) => {
    try { SFX.tap(); Haptics.heavy(); } catch { /* */ }
    if (modeId === "battlepass") { navigate("/battle-pass"); return; }
    setPendingMode(modeId);
    setShowStumpAnim(true);
  }, [navigate]);

  const handleStumpComplete = useCallback(() => {
    setShowStumpAnim(false);
    if (pendingMode) {
      navigate(`/game/${pendingMode}`);
      setPendingMode(null);
    } else {
      navigate("/play");
    }
  }, [navigate, pendingMode]);

  const hasUnlocking = chests?.some(c => c.status === "unlocking") ?? false;

  const handleChestTap = useCallback(async (chest: UserChest | null) => {
    if (!chest) return;
    if (chest.status === "locked") {
      if (hasUnlocking) { toast.error("Another chest is already unlocking!"); return; }
      startUnlock.mutate(chest.id);
      toast.success("Chest unlocking started!");
      return;
    }
    if (chest.status === "unlocking") {
      const remaining = chestTimeRemaining(chest);
      if (remaining > 0) { toast.info(`${formatTime(remaining)} remaining`); return; }
    }
    if (chest.status === "ready" || (chest.status === "unlocking" && chestTimeRemaining(chest) <= 0)) {
      const tier = getChestTier(chest.chest_tier);
      setRevealData({ name: `${tier.name} Rewards`, emoji: "🎁", rarity: chest.chest_tier });
      try {
        const result = await collectChest.mutateAsync(chest);
        toast.success(`Got ${result.cardCount} cards + ${result.coinReward} coins!`);
      } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed to collect"); }
    }
  }, [hasUnlocking, startUnlock, collectChest]);

  if (showOnboarding) return <OnboardingTutorial onComplete={completeOnboarding} />;

  const currentTrophies = profile?.wins ?? 0;
  const currentArena = ARENA_LEVELS.reduce((prev, curr) => currentTrophies >= curr.trophies ? curr : prev, ARENA_LEVELS[0]);
  const nextArena = ARENA_LEVELS[ARENA_LEVELS.indexOf(currentArena) + 1] || currentArena;
  const playerLevel = Math.floor((profile?.xp ?? 0) / 500) + 1;
  const xpInLevel = (profile?.xp ?? 0) % 500;
  const playerName = profile?.display_name || user?.email?.split("@")[0]?.slice(0, 10) || "Player";
  const arenaProgress = ((currentTrophies - currentArena.trophies) / Math.max(nextArena.trophies - currentArena.trophies, 1)) * 100;
  const chestSlots = Array.from({ length: 4 }, (_, i) => chests?.find(c => c.slot_index === i) || null);
  const winRate = (profile?.total_matches ?? 0) > 0 ? Math.round(((profile?.wins ?? 0) / (profile?.total_matches ?? 1)) * 100) : 0;

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(222 40% 8%) 0%, hsl(222 35% 5%) 100%)",
        paddingBottom: "calc(68px + env(safe-area-inset-bottom, 16px) + 16px)",
      }}
    >
      {/* Subtle noise texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='6' height='6' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
      />

      <div className="relative z-10 max-w-[430px] mx-auto px-4 pt-4">

        {/* ═══ SECTION 1: PLAYER BAR (Kept as-is) ═══ */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-center gap-3"
          style={{
            height: 72, padding: "8px 14px", borderRadius: 16,
            background: "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 11%) 100%)",
            border: "2px solid hsl(25 20% 22%)", borderBottom: "5px solid hsl(25 25% 10%)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          <button onClick={() => navigate("/profile")} className="relative flex-shrink-0 active:scale-95 transition-transform" style={{ width: 52, height: 52 }}>
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{ border: "3px solid hsl(43 80% 50%)", background: "linear-gradient(135deg, hsl(25 20% 18%), hsl(25 15% 12%))", boxShadow: "0 0 10px hsl(43 80% 50% / 0.2)" }}
            >
              <span className="text-2xl">🏏</span>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full font-score text-[9px] font-bold"
              style={{ background: "linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(35 60% 35%) 100%)", border: "2px solid hsl(35 50% 25%)", boxShadow: "0 2px 4px rgba(0,0,0,0.5)", color: "hsl(25 40% 8%)" }}
            >
              Lv.{playerLevel}
            </div>
            <div className="absolute -bottom-3 left-[8%] right-[8%] h-[4px] rounded-full z-20 overflow-hidden"
              style={{ background: "hsl(25 15% 10%)", border: "1px solid hsl(25 20% 18%)" }}
            >
              <div className="h-full rounded-full" style={{ width: `${(xpInLevel / 500) * 100}%`, background: "linear-gradient(90deg, hsl(43 90% 55%), hsl(35 80% 45%))", boxShadow: "0 0 6px hsl(43 90% 55% / 0.5)" }} />
            </div>
          </button>

          <div className="flex-1 min-w-0 pl-2">
            <div className="font-heading text-sm font-bold text-foreground truncate">{playerName}</div>
            <div className="font-body text-[10px] text-muted-foreground mt-0.5">{currentArena.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-score text-[11px] font-bold" style={{ color: "hsl(43 90% 55%)" }}>🏆 {currentTrophies}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 rounded-full px-2 py-1"
              style={{ background: "linear-gradient(180deg, hsl(25 18% 18%), hsl(25 15% 13%))", border: "1.5px solid hsl(43 40% 35%)", boxShadow: "0 2px 0 hsl(25 20% 8%)" }}
            >
              <span className="text-sm">🪙</span>
              <span className="font-score text-[11px] font-bold text-foreground">{profile?.coins ?? 0}</span>
              <span className="text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ background: "hsl(142 71% 45%)", color: "hsl(25 40% 8%)" }}>+</span>
            </div>
            <div className="flex items-center gap-1 rounded-full px-2 py-1"
              style={{ background: "linear-gradient(180deg, hsl(25 18% 18%), hsl(25 15% 13%))", border: "1.5px solid hsl(280 40% 40%)", boxShadow: "0 2px 0 hsl(25 20% 8%)" }}
            >
              <span className="text-sm">💎</span>
              <span className="font-score text-[11px] font-bold text-foreground">0</span>
              <span className="text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ background: "hsl(142 71% 45%)", color: "hsl(25 40% 8%)" }}>+</span>
            </div>
          </div>

          <button onClick={() => navigate("/settings")} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg active:scale-90 transition-transform"
            style={{ background: "hsl(25 15% 14%)", border: "1.5px solid hsl(25 18% 22%)" }}
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>

        {/* ═══ SECTION 2: CHEST BANNER ROW ═══ */}
        <div className="grid grid-cols-2 gap-2 px-1 mb-3">
          {/* FREE CHEST — Cricket kit bag */}
          <motion.button
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const freeChest = chestSlots.find(c => c?.status === "ready") || chestSlots.find(c => c !== null);
              if (freeChest) handleChestTap(freeChest);
              else navigate("/shop");
            }}
            className="rounded-xl px-3 py-3 flex items-center gap-2 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(43 40% 16%), hsl(35 30% 10%))",
              border: "2px solid hsl(43 50% 30%)", borderBottom: "4px solid hsl(43 30% 15%)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3), 0 0 12px hsl(43 90% 55% / 0.1)",
            }}
          >
            {/* Glow border pulse */}
            <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 pointer-events-none rounded-xl" style={{ border: "1px solid hsl(43 90% 55% / 0.4)" }} />
            {/* Cricket bag icon animated */}
            <div className="relative flex-shrink-0">
              <motion.div animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <span className="text-2xl">🏏</span>
              </motion.div>
              {/* Bouncing ball on top */}
              <motion.span animate={{ y: [-4, -8, -4] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-2 -right-1 text-xs">🏐</motion.span>
            </div>
            <div className="text-left relative z-10">
              <span className="font-game-display text-[9px] tracking-wider block" style={{ color: "hsl(43 90% 55%)" }}>FREE CHEST</span>
              <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-[8px] font-body font-bold" style={{ color: "hsl(43 100% 65%)" }}>OPEN NOW!</motion.span>
            </div>
          </motion.button>

          {/* DAILY CHALLENGE */}
          <motion.button
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/game/daily")}
            className="rounded-xl px-3 py-3 flex items-center gap-2 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(210 30% 14%), hsl(210 25% 8%))",
              border: "2px solid hsl(210 35% 25%)", borderBottom: "4px solid hsl(210 25% 12%)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            }}
          >
            <div className="relative flex-shrink-0">
              <motion.span animate={{ rotateY: [-8, 8, -8] }} transition={{ duration: 3, repeat: Infinity }} className="text-xl inline-block">📅</motion.span>
              <motion.span animate={{ y: [-2, -6, -2] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -top-1 -right-1 text-[10px]">🏐</motion.span>
            </div>
            <div className="text-left">
              <span className="font-game-display text-[9px] text-foreground tracking-wider block">DAILY CHALLENGE</span>
              <span className="text-[8px] font-body text-muted-foreground">Win rewards!</span>
            </div>
          </motion.button>
        </div>

        {/* ═══ SECTION 3: ARENA STADIUM CARD (Hero) ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring", damping: 18 }}
          className="relative mb-3 rounded-2xl overflow-hidden"
          style={{
            border: "2px solid hsl(43 30% 25% / 0.5)",
            borderBottom: "5px solid hsl(222 30% 5%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {/* Pulsing border glow */}
          <motion.div
            animate={{ boxShadow: ["0 0 0px hsl(43 90% 55% / 0)", "0 0 20px hsl(43 90% 55% / 0.2)", "0 0 0px hsl(43 90% 55% / 0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl pointer-events-none z-10"
          />

          {/* Stadium image */}
          <div className="relative h-48">
            <img
              src={arenaGullyGrounds}
              alt="Gully Grounds Arena"
              className="w-full h-full object-cover"
              width={768} height={512}
            />
            {/* Top gradient for title */}
            <div className="absolute inset-x-0 top-0 h-16 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }} />
            
            {/* Arena title with shimmer */}
            <div className="absolute top-3 left-0 right-0 text-center">
              <div className="inline-block relative overflow-hidden px-4 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div style={{ width: 16, height: "100%", background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 70%, transparent 100%)" }} />
                </motion.div>
                <span className="font-game-display text-[11px] tracking-[0.15em] relative" style={{ color: "hsl(43 90% 60%)" }}>
                  ⭐ {currentArena.name.toUpperCase()} ⭐
                </span>
              </div>
            </div>

            {/* Bottom frosted stats overlay */}
            <div className="absolute inset-x-0 bottom-0 px-4 py-2.5 flex items-center justify-center gap-4"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4))", backdropFilter: "blur(6px)" }}
            >
              <span className="font-score text-[10px] font-bold text-foreground">{profile?.total_matches ?? 0} MATCHES</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="font-score text-[10px] font-bold text-foreground">{profile?.wins ?? 0} WINS</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="font-score text-[10px] font-bold text-foreground">{winRate}% WIN RATE</span>
            </div>
          </div>
        </motion.div>

        {/* ═══ SECTION 4: PLAY BUTTON (Enhanced) ═══ */}
        <div className="flex justify-center mb-2">
          <motion.button
            whileTap={{ scale: 0.95, y: 4 }}
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            onClick={handlePlay}
            className="relative w-[75%] py-4 rounded-2xl font-display text-lg tracking-[0.15em] text-white overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #6AFF6A, #4ADE50, #2D8B2D)",
              border: "3px solid hsl(130 50% 20%)",
              borderBottom: "7px solid hsl(130 57% 15%)",
              boxShadow: "0 6px 0 hsl(130 57% 12%), 0 6px 24px rgba(74,222,80,0.4), 0 0 40px rgba(74,222,80,0.15), inset 0 2px 4px rgba(255,255,255,0.3)",
              textShadow: "0 2px 4px rgba(0,0,0,0.4)",
            }}
          >
            {/* Shimmer sweep every 5s */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
              className="absolute inset-0 pointer-events-none z-[1]"
            >
              <div className="h-full" style={{ width: 20, background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 60%, transparent 100%)" }} />
            </motion.div>
            <span className="relative z-[2]" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}>▶ PLAY</span>
          </motion.button>
        </div>

        {/* ═══ SECTION 5: ARENA PROGRESS BAR ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-3 px-2">
          <div className="flex justify-between items-center mb-1">
            <span className="font-body text-[10px] font-semibold text-muted-foreground">🏏 {currentArena.name}</span>
            <span className="font-body text-[10px] font-semibold text-muted-foreground">→ {nextArena.name}</span>
          </div>
          <div className="relative h-[7px] rounded-full overflow-hidden" style={{ background: "hsl(222 20% 10%)", border: "1px solid hsl(222 15% 18%)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${arenaProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(43 90% 55%), hsl(35 80% 45%))", boxShadow: "0 0 8px hsl(43 90% 55% / 0.4)" }}
            />
          </div>
          <div className="text-right mt-0.5">
            <span className="font-score text-[9px] text-muted-foreground">🏆 {currentTrophies}/{nextArena.trophies}</span>
          </div>
        </motion.div>

        {/* ═══ SECTION 6: CHEST SLOT ROW (Cricket-Themed) ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-4 px-1">
          <div className="flex items-center gap-2 px-1 mb-2">
            <div className="w-1 h-4 rounded-sm" style={{ background: "linear-gradient(180deg, hsl(43 90% 55%), hsl(35 60% 35%))" }} />
            <span className="font-game-display text-[10px] tracking-[0.2em] text-foreground">CHEST SLOTS</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {chestSlots.map((chest, i) => (
              <CricketChestSlot key={i} chest={chest} tick={tick} onTap={handleChestTap} />
            ))}
          </div>
        </motion.div>

        {/* ═══ SECTION 7: GAME MODE CARDS ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-4 px-1">
          <GameModeCards onSelect={handleBattle} />
        </motion.div>

        {/* ═══ SECTION 8: GESTURE DISPLAY ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-3 mb-4">
          {["👊", "☝️", "✌️", "🤟", "🖖", "🤚"].map((g, i) => (
            <motion.button
              key={g}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileTap={{ scale: 1.3 }}
              className="text-lg"
              style={{ filter: "drop-shadow(0 0 4px hsl(43 90% 55% / 0.2))" }}
            >
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="inline-block"
              >
                {g}
              </motion.span>
            </motion.button>
          ))}
        </motion.div>

      </div>

      {/* Stump animation overlay */}
      <StumpHitAnimation show={showStumpAnim} onComplete={handleStumpComplete} />

      {/* Chest reveal overlay */}
      <AnimatePresence>
        {revealData && (
          <ChestReveal
            itemName={revealData.name}
            itemEmoji={revealData.emoji}
            rarity={revealData.rarity}
            onComplete={() => setRevealData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CRICKET-THEMED CHEST SLOT
   ══════════════════════════════════════════════ */

function CricketChestSlot({ chest, tick, onTap }: { chest: UserChest | null; tick: number; onTap: (c: UserChest | null) => void }) {
  void tick;

  if (!chest) {
    return (
      <div className="relative overflow-hidden rounded-xl flex flex-col items-center justify-center"
        style={{
          aspectRatio: "3/4",
          background: "linear-gradient(180deg, hsl(222 20% 10%) 0%, hsl(222 25% 6%) 100%)",
          border: "2px dashed hsl(222 15% 22% / 0.4)",
          borderBottom: "4px solid hsl(222 15% 6%)",
        }}
      >
        <span className="text-muted-foreground/20 text-lg">+</span>
        <span className="text-muted-foreground/30 font-game-display text-[8px] tracking-wider">EMPTY</span>
      </div>
    );
  }

  const tier = getChestTier(chest.chest_tier);
  const isUnlocking = chest.status === "unlocking";
  const remaining = isUnlocking ? chestTimeRemaining(chest) : 0;
  const isReady = chest.status === "ready" || (isUnlocking && remaining <= 0);
  const isLocked = chest.status === "locked";
  const tierKey = (chest.chest_tier || "bronze").toLowerCase();
  const cc = CRICKET_CHEST[tierKey] || CRICKET_CHEST.bronze;

  return (
    <motion.button
      whileTap={{ scale: 0.9, y: 3 }}
      onClick={() => onTap(chest)}
      className="relative overflow-hidden rounded-xl flex flex-col items-center justify-center"
      style={{
        aspectRatio: "3/4",
        background: "linear-gradient(180deg, hsl(222 20% 12%) 0%, hsl(222 25% 7%) 100%)",
        border: `2px solid ${isReady ? cc.color : "hsl(222 15% 20%)"}`,
        borderBottom: `5px solid ${isReady ? cc.border : "hsl(222 15% 8%)"}`,
        boxShadow: isReady ? `0 4px 20px ${cc.glow}, 0 0 30px ${cc.glow}` : "0 4px 8px rgba(0,0,0,0.3)",
      }}
    >
      {/* Ready glow underneath */}
      {isReady && (
        <motion.div animate={{ opacity: [0.15, 0.4, 0.15] }} transition={{ duration: 1.2, repeat: Infinity }} className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center bottom, ${cc.glow} 0%, transparent 65%)` }} />
      )}

      {/* Locked: chains overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span className="text-[10px] opacity-40">🔗</span>
        </div>
      )}

      {/* Cricket item icon */}
      <motion.div
        animate={isReady ? { y: [-3, 3, -3], scale: [1, 1.05, 1] } : {}}
        transition={isReady ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
        className="relative"
        style={{ filter: isLocked ? "grayscale(0.5) brightness(0.6)" : "none" }}
      >
        <span className="text-3xl">{cc.icon}</span>
      </motion.div>

      {/* Sparkle particles (ready) */}
      {isReady && [0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], y: [-5, -18 - i * 4], x: [0, (i - 1) * 10] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
          className="absolute left-1/2 rounded-full"
          style={{ top: "25%", width: 2, height: 2, background: cc.color, boxShadow: `0 0 4px ${cc.color}` }}
        />
      ))}

      {/* Unlocking: crack particles */}
      {isUnlocking && !isReady && (
        <motion.div animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.1, 0.8] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute" style={{ top: "38%", left: "28%", width: 4, height: 4, borderRadius: "50%", background: cc.color, boxShadow: `0 0 6px ${cc.color}` }} />
      )}

      {/* Bottom label */}
      <div className="absolute bottom-0 inset-x-0 py-1 text-center rounded-b-lg" style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.8))" }}>
        {isLocked && (
          <div className="flex items-center justify-center gap-0.5">
            <Lock className="w-2.5 h-2.5 text-muted-foreground/60" />
            <span className="text-[7px] font-game-display text-muted-foreground/60 tracking-wider">TAP</span>
          </div>
        )}
        {isUnlocking && !isReady && (
          <div className="flex items-center justify-center gap-0.5">
            <Timer className="w-2.5 h-2.5" style={{ color: cc.color }} />
            <span className="text-[7px] font-game-display" style={{ color: cc.color }}>{formatTime(remaining)}</span>
          </div>
        )}
        {isReady && (
          <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6, repeat: Infinity }} className="text-[8px] font-game-display tracking-wider" style={{ color: cc.color, textShadow: `0 0 8px ${cc.glow}` }}>
            OPEN!
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
