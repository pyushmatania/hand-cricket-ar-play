import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { SFX, Haptics } from "@/lib/sounds";
import floatingIsland from "@/assets/floating-island.png";
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
  { name: "Gully Cricket", trophies: 0 },
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

  // Tick timer for chest countdowns
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
    try { SFX.tap(); Haptics.heavy(); } catch { /* Intentionally ignored - non-critical */ }
    setShowStumpAnim(true);
  }, []);

  const [pendingMode, setPendingMode] = useState<string | null>(null);

  const handleBattle = useCallback((modeId: string) => {
    try { SFX.tap(); Haptics.heavy(); } catch { /* Intentionally ignored - non-critical */ }
    setPendingMode(modeId);
    setShowStumpAnim(true);
  }, []);

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
  const currentArena = ARENA_LEVELS.reduce((prev, curr) =>
    currentTrophies >= curr.trophies ? curr : prev, ARENA_LEVELS[0]);
  const nextArena = ARENA_LEVELS[ARENA_LEVELS.indexOf(currentArena) + 1] || currentArena;
  const playerLevel = Math.floor((profile?.xp ?? 0) / 500) + 1;
  const xpInLevel = (profile?.xp ?? 0) % 500;
  const playerName = profile?.display_name || user?.email?.split("@")[0]?.slice(0, 10) || "Player";
  const arenaProgress = ((currentTrophies - currentArena.trophies) / Math.max(nextArena.trophies - currentArena.trophies, 1)) * 100;
  const chestSlots = Array.from({ length: 4 }, (_, i) => chests?.find(c => c.slot_index === i) || null);

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(28 35% 14%) 0%, hsl(25 30% 8%) 40%, hsl(222 40% 6%) 100%)",
        paddingBottom: "calc(68px + env(safe-area-inset-bottom, 16px) + 16px)",
      }}
    >
      {/* Leather grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='6' height='6' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
      />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(25 30% 4% / 0.7) 100%)" }}
      />

      <div className="relative z-10 max-w-[430px] mx-auto px-4 pt-4">

        {/* ═══ A) TOP CURRENCY & PLAYER BAR ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-center gap-3"
          style={{
            height: 72,
            padding: "8px 14px",
            borderRadius: "16px",
            background: "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 11%) 100%)",
            border: "2px solid hsl(25 20% 22%)",
            borderBottom: "5px solid hsl(25 25% 10%)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          <button onClick={() => navigate("/profile")} className="relative flex-shrink-0 active:scale-95 transition-transform" style={{ width: 52, height: 52 }}>
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{ border: "3px solid hsl(43 80% 50%)", background: "linear-gradient(135deg, hsl(25 20% 18%), hsl(25 15% 12%))", boxShadow: "0 0 10px hsl(43 80% 50% / 0.2)" }}
            >
              <span className="text-2xl">🏏</span>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full font-game-score text-[9px] font-bold"
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
            <div className="font-game-card text-sm font-bold text-foreground truncate">{playerName}</div>
            <div className="font-game-body text-[10px] text-muted-foreground mt-0.5">{currentArena.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-game-score text-[11px] font-bold" style={{ color: "hsl(43 90% 55%)" }}>🏆 {currentTrophies}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 rounded-full px-2 py-1"
              style={{ background: "linear-gradient(180deg, hsl(25 18% 18%) 0%, hsl(25 15% 13%) 100%)", border: "1.5px solid hsl(43 40% 35%)", boxShadow: "0 2px 0 hsl(25 20% 8%)" }}
            >
              <span className="text-sm">🪙</span>
              <span className="font-game-score text-[11px] font-bold text-foreground">{profile?.coins ?? 0}</span>
              <span className="text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ background: "hsl(142 71% 45%)", color: "hsl(25 40% 8%)" }}>+</span>
            </div>
            <div className="flex items-center gap-1 rounded-full px-2 py-1"
              style={{ background: "linear-gradient(180deg, hsl(25 18% 18%) 0%, hsl(25 15% 13%) 100%)", border: "1.5px solid hsl(280 40% 40%)", boxShadow: "0 2px 0 hsl(25 20% 8%)" }}
            >
              <span className="text-sm">💎</span>
              <span className="font-game-score text-[11px] font-bold text-foreground">0</span>
              <span className="text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ background: "hsl(142 71% 45%)", color: "hsl(25 40% 8%)" }}>+</span>
            </div>
          </div>

          {/* Settings gear */}
          <button onClick={() => navigate("/settings")} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg active:scale-90 transition-transform"
            style={{ background: "hsl(25 15% 14%)", border: "1.5px solid hsl(25 18% 22%)" }}
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>

        {/* ═══ B) PROMOTIONAL BANNER ROW ═══ */}
        <div className="grid grid-cols-2 gap-2 px-1 mb-3">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const freeChest = chestSlots.find(c => c?.status === "ready") || chestSlots.find(c => c !== null);
              if (freeChest) handleChestTap(freeChest);
              else navigate("/shop");
            }}
            className="rounded-xl px-3 py-3 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, hsl(43 40% 16%), hsl(35 30% 10%))",
              border: "2px solid hsl(43 50% 30%)",
              borderBottom: "4px solid hsl(43 30% 15%)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            }}
          >
            <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xl">🎁</motion.span>
            <div className="text-left">
              <span className="font-game-display text-[9px] text-foreground tracking-wider block">FREE CHEST</span>
              <span className="text-[8px] font-game-body" style={{ color: "hsl(43 90% 55%)" }}>OPEN NOW!</span>
            </div>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/game/daily")}
            className="rounded-xl px-3 py-3 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, hsl(210 30% 14%), hsl(210 25% 8%))",
              border: "2px solid hsl(210 35% 25%)",
              borderBottom: "4px solid hsl(210 25% 12%)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            }}
          >
            <span className="text-xl">🏏</span>
            <div className="text-left">
              <span className="font-game-display text-[9px] text-foreground tracking-wider block">DAILY CHALLENGE</span>
              <span className="text-[8px] font-game-body text-muted-foreground">Win rewards!</span>
            </div>
          </motion.button>
        </div>

        {/* ═══ C) CENTRAL STADIUM STAGE + PLAY BUTTON ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", damping: 18 }}
          className="relative mb-2 flex flex-col items-center"
        >
          {/* Stadium name with shimmer */}
          <div className="mb-1 px-4 py-1 rounded-full z-10 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(25 20% 16% / 0.9), hsl(25 15% 10% / 0.95))",
              border: "1.5px solid hsl(43 50% 40%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {/* Text shimmer sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              className="absolute inset-0 pointer-events-none"
            >
              <div style={{ width: 16, height: "100%", background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 70%, transparent 100%)" }} />
            </motion.div>
            <span className="font-game-display text-[10px] tracking-[0.2em] relative" style={{ color: "hsl(43 90% 55%)" }}>
              {currentArena.name.toUpperCase()}
            </span>
          </div>

          {/* Floating island with pulsing border glow */}
          <motion.div
            animate={{ boxShadow: ["0 0 10px rgba(200,170,100,0.1)", "0 0 20px rgba(200,170,100,0.25)", "0 0 10px rgba(200,170,100,0.1)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-2xl"
            style={{ height: 200, border: "1.5px solid hsl(43 30% 25% / 0.3)", borderRadius: 16 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
              style={{ width: 220, height: 200 }}
            >
              <img
                src={floatingIsland}
                alt={`${currentArena.name} Island`}
                className="w-full h-full object-contain"
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }}
                width={768}
                height={768}
              />
            </motion.div>
            {/* Shadow blob */}
            <motion.div
              animate={{ scale: [0.85, 1, 0.85], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{ width: 160, height: 30, background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)", borderRadius: "50%" }}
            />
          </motion.div>

          {/* ═══ BIG PLAY BUTTON ═══ */}
          <motion.button
            whileTap={{ scale: 0.95, y: 4 }}
            whileHover={{ scale: 1.02 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            onClick={handlePlay}
            className="relative w-[70%] py-4 rounded-2xl font-game-display text-lg tracking-[0.15em] text-white overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #6AFF6A, #4ADE50, #2D8B2D)",
              border: "3px solid hsl(130 50% 20%)",
              borderBottom: "7px solid hsl(130 57% 15%)",
              boxShadow: "0 6px 0 hsl(130 57% 12%), 0 6px 24px rgba(74,222,80,0.4), 0 0 40px rgba(74,222,80,0.15), inset 0 2px 4px rgba(255,255,255,0.3)",
              textShadow: "0 2px 4px rgba(0,0,0,0.4)",
            }}
          >
            {/* White shimmer sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <div
                className="h-full"
                style={{
                  width: "20px",
                  background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 60%, transparent 100%)",
                  height: "100%",
                }}
              />
            </motion.div>
            <span className="relative" style={{ zIndex: 2, textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}>PLAY ▶</span>
          </motion.button>
        </motion.div>

        {/* ═══ D) ARENA / LEAGUE PROGRESS BAR ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-3 px-2">
          <div className="flex justify-between items-center mb-1">
            <span className="font-game-body text-[10px] font-semibold text-muted-foreground">{currentArena.name}</span>
            <span className="font-game-body text-[10px] font-semibold text-muted-foreground">{nextArena.name}</span>
          </div>
          <div className="relative h-[7px] rounded-full overflow-hidden" style={{ background: "hsl(25 15% 10%)", border: "1px solid hsl(25 18% 18%)" }}>
            <div className="h-full rounded-full" style={{ width: `${arenaProgress}%`, background: "linear-gradient(90deg, hsl(43 90% 55%), hsl(35 80% 45%))", boxShadow: "0 0 8px hsl(43 90% 55% / 0.4)" }} />
          </div>
        </motion.div>

        {/* ═══ E) CHEST SLOT ROW ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-3 px-1">
          <div className="flex items-center gap-2 px-1 mb-2">
            <div className="w-1 h-4 rounded-sm" style={{ background: "linear-gradient(180deg, hsl(43 90% 55%), hsl(35 60% 35%))" }} />
            <span className="font-game-display text-[10px] tracking-[0.2em] text-foreground">CHEST SLOTS</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {chestSlots.map((chest, i) => (
              <ChestSlot3D key={i} chest={chest} tick={tick} onTap={handleChestTap} />
            ))}
          </div>
        </motion.div>

        {/* ═══ F) GAME MODE CARDS ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-4 px-1">
          <GameModeCards onSelect={handleBattle} />
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

/* ═══ 3D ANIMATED CHEST SLOT ═══ */

const TIER_VISUALS: Record<string, {
  body: string; bodyDark: string; fitting: string; fittingBorder: string;
  plank: string; innerGlow: string; particle: string; isDiamond?: boolean;
  cricketIcon: string; cricketLabel: string;
}> = {
  bronze: {
    body: "linear-gradient(180deg, hsl(40 55% 50%) 0%, hsl(30 45% 35%) 100%)",
    bodyDark: "linear-gradient(180deg, hsl(40 40% 30%) 0%, hsl(30 35% 20%) 100%)",
    fitting: "hsl(30 65% 50%)", fittingBorder: "hsl(30 50% 35%)",
    plank: "hsl(25 35% 26%)", innerGlow: "hsl(35 80% 55%)",
    particle: "hsl(35 70% 60%)",
    cricketIcon: "🎾", cricketLabel: "Tennis Ball",
  },
  silver: {
    body: "linear-gradient(180deg, hsl(0 65% 40%) 0%, hsl(0 55% 28%) 100%)",
    bodyDark: "linear-gradient(180deg, hsl(0 45% 25%) 0%, hsl(0 35% 18%) 100%)",
    fitting: "hsl(0 10% 95%)", fittingBorder: "hsl(0 5% 70%)",
    plank: "hsl(0 30% 30%)", innerGlow: "hsl(0 50% 55%)",
    particle: "hsl(0 40% 70%)",
    cricketIcon: "🏏", cricketLabel: "Red Ball",
  },
  gold: {
    body: "linear-gradient(180deg, hsl(43 90% 55%) 0%, hsl(35 80% 35%) 100%)",
    bodyDark: "linear-gradient(180deg, hsl(43 60% 30%) 0%, hsl(35 50% 20%) 100%)",
    fitting: "hsl(43 90% 55%)", fittingBorder: "hsl(40 70% 35%)",
    plank: "hsl(43 50% 40%)", innerGlow: "hsl(43 100% 60%)",
    particle: "hsl(43 95% 65%)",
    cricketIcon: "🏆", cricketLabel: "Trophy",
  },
  diamond: {
    body: "linear-gradient(180deg, hsl(200 60% 65% / 0.8) 0%, hsl(210 70% 45% / 0.9) 100%)",
    bodyDark: "linear-gradient(180deg, hsl(200 40% 40% / 0.7) 0%, hsl(210 50% 28% / 0.8) 100%)",
    fitting: "hsl(200 80% 75%)", fittingBorder: "hsl(210 60% 50%)",
    plank: "hsl(200 25% 48% / 0.5)", innerGlow: "hsl(200 90% 70%)",
    particle: "hsl(200 80% 85%)", isDiamond: true,
    cricketIcon: "💎", cricketLabel: "Crystal Bat",
  },
};

function ChestSlot3D({ chest, tick, onTap }: { chest: UserChest | null; tick: number; onTap: (c: UserChest | null) => void }) {
  void tick; // consumed by parent for re-render

  if (!chest) {
    return (
      <div className="relative overflow-hidden rounded-xl flex flex-col items-center justify-center"
        style={{
          aspectRatio: "3/4",
          background: "linear-gradient(180deg, hsl(25 15% 12%) 0%, hsl(222 25% 8%) 100%)",
          border: "2px dashed hsl(25 15% 22% / 0.4)",
          borderBottom: "4px solid hsl(25 12% 8%)",
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
  const tv = TIER_VISUALS[tierKey] || TIER_VISUALS.bronze;

  // Unlock progress (0 to 1)
  const unlockProgress = isUnlocking && !isReady && chest.unlock_duration_seconds
    ? Math.max(0, Math.min(1, 1 - remaining / chest.unlock_duration_seconds))
    : 0;

  // CSS-only 3D chest body
  const chestBody = (
    <div style={{ width: "70%", position: "relative", margin: "0 auto" }}>
      {/* Chest base / body */}
      <div style={{
        width: "100%",
        aspectRatio: "1.2 / 1",
        borderRadius: "3px 3px 4px 4px",
        background: isLocked || (isUnlocking && !isReady) ? tv.bodyDark : tv.body,
        border: `1.5px solid ${tv.fittingBorder}`,
        position: "relative",
        overflow: "hidden",
        boxShadow: tv.isDiamond
          ? `inset 0 0 12px hsl(200 60% 60% / 0.3), 0 2px 6px rgba(0,0,0,0.4)`
          : `inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 6px rgba(0,0,0,0.4)`,
        opacity: isLocked ? 0.85 : 1,
      }}>
        {/* Wood plank lines */}
        {[0.33, 0.66].map((pos, i) => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0,
            top: `${pos * 100}%`, height: "1px",
            background: tv.plank, opacity: 0.6,
          }} />
        ))}
        {/* Metal band across middle */}
        <div style={{
          position: "absolute", left: 0, right: 0,
          top: "42%", height: "16%",
          background: `linear-gradient(180deg, ${tv.fitting}33 0%, ${tv.fitting}66 50%, ${tv.fitting}33 100%)`,
          borderTop: `0.5px solid ${tv.fitting}88`,
          borderBottom: `0.5px solid ${tv.fitting}88`,
        }} />
        {/* Corner brackets */}
        {([
          { top: 0, left: 0 }, { top: 0, right: 0 },
          { bottom: 0, left: 0 }, { bottom: 0, right: 0 },
        ] as const).map((pos, i) => (
          <div key={i} style={{
            position: "absolute",
            ...pos,
            width: "6px", height: "6px",
            borderTop: "top" in pos ? `1.5px solid ${tv.fitting}` : "none",
            borderBottom: "bottom" in pos ? `1.5px solid ${tv.fitting}` : "none",
            borderLeft: "left" in pos ? `1.5px solid ${tv.fitting}` : "none",
            borderRight: "right" in pos ? `1.5px solid ${tv.fitting}` : "none",
          }} />
        ))}
        {/* Keyhole / lock plate */}
        <div style={{
          position: "absolute", left: "50%", top: "42%",
          transform: "translateX(-50%)", width: "8px", height: "10px",
          borderRadius: "2px",
          background: `radial-gradient(circle at center, ${tv.fitting}, ${tv.fittingBorder})`,
          border: `0.5px solid ${tv.fittingBorder}`,
        }}>
          <div style={{
            position: "absolute", left: "50%", top: "55%",
            transform: "translateX(-50%)", width: "2px", height: "3px",
            background: "rgba(0,0,0,0.6)", borderRadius: "0 0 1px 1px",
          }} />
        </div>
        {/* Cricket item icon centered on chest */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "18px", zIndex: 1,
          filter: isLocked ? "grayscale(0.5) brightness(0.7)" : "none",
          opacity: isLocked ? 0.5 : 0.85,
        }}>
          {tv.cricketIcon}
        </div>
        {/* Diamond frost overlay */}
        {tv.isDiamond && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(255,255,255,0.05) 60%, transparent 100%)",
            pointerEvents: "none",
          }} />
        )}
      </div>

      {/* Chest lid */}
      <motion.div
        animate={isReady
          ? { rotateX: [-5, -8, -5] }
          : { rotateX: 0 }
        }
        transition={isReady
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : {}}
        style={{
          width: "106%",
          marginLeft: "-3%",
          height: "35%",
          position: "absolute",
          top: "-2px",
          transformOrigin: "top center",
          borderRadius: "4px 4px 2px 2px",
          background: isLocked || (isUnlocking && !isReady) ? tv.bodyDark : tv.body,
          border: `1.5px solid ${tv.fittingBorder}`,
          borderBottom: `1px solid ${tv.fitting}66`,
          zIndex: 2,
          opacity: isLocked ? 0.85 : 1,
          boxShadow: tv.isDiamond
            ? "inset 0 0 8px hsl(200 60% 60% / 0.2)"
            : "inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Lid band */}
        <div style={{
          position: "absolute", left: 0, right: 0,
          bottom: "15%", height: "25%",
          background: `linear-gradient(180deg, ${tv.fitting}22 0%, ${tv.fitting}55 50%, ${tv.fitting}22 100%)`,
        }} />
        {/* Lid top curve highlight */}
        <div style={{
          position: "absolute", left: "10%", right: "10%", top: "8%",
          height: "2px", borderRadius: "1px",
          background: `linear-gradient(90deg, transparent, ${tv.fitting}44, transparent)`,
        }} />
      </motion.div>

      {/* Golden light rays from inside (ready state) */}
      {isReady && (
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-4px", left: "10%", right: "10%",
            height: "8px", zIndex: 1,
            background: `radial-gradient(ellipse at center, ${tv.innerGlow}CC 0%, ${tv.innerGlow}44 40%, transparent 70%)`,
            filter: "blur(2px)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );

  return (
    <motion.button
      whileTap={{ scale: 0.9, y: 3 }}
      onClick={() => onTap(chest)}
      className="relative overflow-hidden rounded-xl flex flex-col items-center justify-center"
      style={{
        aspectRatio: "3/4",
        background: "linear-gradient(180deg, hsl(25 18% 14%) 0%, hsl(222 25% 8%) 100%)",
        border: `2px solid ${isReady ? tier.color : "hsl(25 18% 22%)"}`,
        borderBottom: `5px solid ${isReady ? tier.color : "hsl(25 15% 10%)"}`,
        boxShadow: isReady
          ? `0 4px 20px ${tier.glowColor}, 0 0 30px ${tier.glowColor}`
          : "0 4px 8px rgba(0,0,0,0.3)",
        perspective: "200px",
      }}
    >
      {/* Ready: warm golden glow underneath */}
      {isReady && (
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at center bottom, ${tv.innerGlow}55 0%, transparent 65%)` }}
        />
      )}

      {/* Unlocking: progress ring glow */}
      {isUnlocking && !isReady && (
        <div className="absolute pointer-events-none" style={{
          top: "18%", left: "50%", transform: "translateX(-50%)",
          width: "32px", height: "32px",
        }}>
          <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(25 15% 20%)" strokeWidth="2.5" />
            <motion.circle
              cx="18" cy="18" r="15" fill="none"
              stroke={tv.fitting}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${unlockProgress * 94.25} 94.25`}
              style={{ filter: `drop-shadow(0 0 3px ${tv.fitting})` }}
            />
          </svg>
        </div>
      )}

      {/* The 3D chest with breathing animation */}
      <motion.div
        animate={isReady
          ? { scale: [1, 1.03, 1] }
          : {}}
        transition={isReady
          ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
          : {}}
        className="relative flex items-center justify-center"
        style={{ width: "100%", paddingTop: "8px", paddingBottom: "2px" }}
      >
        {chestBody}
      </motion.div>

      {/* Sparkle particles (ready state) */}
      {isReady && (
        <>
          {[0, 1, 2, ...(tierKey === "gold" || tierKey === "diamond" ? [3] : [])].map(i => (
            <motion.div
              key={i}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [-5, -18 - i * 4],
                x: [0, (i - 1.5) * 10],
              }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.28 }}
              className="absolute left-1/2 rounded-full"
              style={{
                top: "25%",
                width: tv.isDiamond ? "2.5px" : "2px",
                height: tv.isDiamond ? "2.5px" : "2px",
                background: tv.particle,
                boxShadow: `0 0 4px ${tv.particle}`,
              }}
            />
          ))}
        </>
      )}

      {/* Diamond frost particles */}
      {tv.isDiamond && isReady && (
        <>
          {[0, 1, 2].map(i => (
            <motion.div
              key={`frost-${i}`}
              animate={{
                opacity: [0, 0.7, 0],
                y: [-2, -12],
                x: [(i - 1) * 14, (i - 1) * 18],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 + i * 0.4 }}
              className="absolute left-1/2 rounded-full"
              style={{
                top: "30%", width: "1.5px", height: "1.5px",
                background: "hsl(200 80% 90%)",
                boxShadow: "0 0 3px hsl(200 80% 85%)",
              }}
            />
          ))}
        </>
      )}

      {/* Unlocking: chain crack particle */}
      {isUnlocking && !isReady && (
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute"
          style={{
            top: "38%", left: "28%",
            width: "4px", height: "4px", borderRadius: "50%",
            background: tv.fitting,
            boxShadow: `0 0 6px ${tv.fitting}`,
          }}
        />
      )}

      {/* Bottom label area */}
      <div className="absolute bottom-0 inset-x-0 py-1 text-center rounded-b-lg"
        style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.8))" }}
      >
        {isLocked && (
          <div className="flex items-center justify-center gap-0.5">
            <motion.div
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Lock className="w-2.5 h-2.5 text-muted-foreground/60" />
            </motion.div>
            <span className="text-[7px] font-game-display text-muted-foreground/60 tracking-wider">TAP</span>
          </div>
        )}
        {isUnlocking && !isReady && (
          <div className="flex items-center justify-center gap-0.5">
            <Timer className="w-2.5 h-2.5" style={{ color: tier.color }} />
            <span className="text-[7px] font-game-display" style={{ color: tier.color }}>{formatTime(remaining)}</span>
          </div>
        )}
        {isReady && (
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="text-[8px] font-game-display tracking-wider"
            style={{ color: tier.color, textShadow: `0 0 8px ${tier.glowColor}` }}
          >
            OPEN!
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
