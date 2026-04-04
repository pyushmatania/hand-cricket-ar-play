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
import StumpHitAnimation from "@/components/StumpHitAnimation";
import DailyQuestsWidget from "@/components/DailyQuestsWidget";
import { Lock, Timer } from "lucide-react";
import { toast } from "sonner";
import ModeIconGrid from "@/components/ModeIconGrid";

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

// (modes moved to ModeIconGrid component)

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showStumpAnim, setShowStumpAnim] = useState(false);
  const [pendingMode, setPendingMode] = useState<string | null>(null);
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

  const handleBattle = useCallback((modeId: string) => {
    try { SFX.tap(); Haptics.heavy(); } catch {}
    setPendingMode(modeId);
    setShowStumpAnim(true);
  }, []);

  const handleStumpComplete = useCallback(() => {
    setShowStumpAnim(false);
    if (pendingMode) {
      navigate(`/game/${pendingMode}`);
      setPendingMode(null);
    }
  }, [pendingMode, navigate]);

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
      } catch (e: any) { toast.error(e.message); }
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

        {/* ═══ PLAYER BAR ═══ */}
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
              <span className="font-game-score text-[11px] font-bold text-foreground">45</span>
              <span className="text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ background: "hsl(142 71% 45%)", color: "hsl(25 40% 8%)" }}>+</span>
            </div>
          </div>
        </motion.div>

        {/* ═══ ARENA PROGRESS ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-3 px-2">
          <div className="flex justify-between items-center mb-1">
            <span className="font-game-body text-[10px] font-semibold text-muted-foreground">{currentArena.name}</span>
            <span className="font-game-body text-[10px] font-semibold text-muted-foreground">{nextArena.name}</span>
          </div>
          <div className="relative h-[7px] rounded-full overflow-hidden" style={{ background: "hsl(25 15% 10%)", border: "1px solid hsl(25 18% 18%)" }}>
            <div className="h-full rounded-full" style={{ width: `${arenaProgress}%`, background: "linear-gradient(90deg, hsl(43 90% 55%), hsl(35 80% 45%))", boxShadow: "0 0 8px hsl(43 90% 55% / 0.4)" }} />
          </div>
        </motion.div>

        {/* ═══ FLOATING ISLAND CENTERPIECE ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, type: "spring", damping: 18 }}
          className="relative mb-2 flex items-center justify-center"
          style={{ height: 220 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
            style={{ width: 240, height: 220 }}
          >
            <img
              src={floatingIsland}
              alt={`${currentArena.name} Island`}
              className="w-full h-full object-contain"
              style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }}
              width={768}
              height={768}
            />
            {/* Arena name badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full"
              style={{
                background: "linear-gradient(180deg, hsl(25 20% 16% / 0.9), hsl(25 15% 10% / 0.95))",
                border: "1.5px solid hsl(43 50% 40%)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              <span className="font-game-display text-[8px] tracking-[0.2em]" style={{ color: "hsl(43 90% 55%)" }}>
                {currentArena.name.toUpperCase()}
              </span>
            </div>
          </motion.div>
          {/* Shadow blob */}
          <motion.div
            animate={{ scale: [0.85, 1, 0.85], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{ width: 160, height: 30, background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)", borderRadius: "50%" }}
          />
        </motion.div>

        {/* ═══ FEATURED MODES: TAP + PvP ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          {FEATURED_MODES.map((mode) => (
            <motion.button
              key={mode.id}
              whileTap={{ scale: 0.93, y: 3 }}
              onClick={() => handleBattle(mode.id)}
              className="relative overflow-hidden rounded-2xl p-4 flex flex-col items-center gap-1.5"
              style={{
                background: mode.gradient,
                border: `2px solid ${mode.border}`,
                borderBottom: `6px solid ${mode.bottomBorder}`,
                boxShadow: `0 6px 20px ${mode.glow}, inset 0 1px 0 hsl(0 0% 100% / 0.15)`,
              }}
            >
              {/* Mesh overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.08]"
                style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }}
              />
              {/* Shine sweep */}
              <motion.div
                animate={{ x: ["-150%", "250%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="absolute inset-y-0 w-1/3 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.12), transparent)" }}
              />
              <span className="text-3xl relative z-10 drop-shadow-lg">{mode.icon}</span>
              <span className="font-game-display text-xs text-white tracking-wider relative z-10"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
              >{mode.title}</span>
              <span className="font-game-body text-[8px] text-white/70 tracking-wider relative z-10">{mode.subtitle}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* ═══ BIG BATTLE BUTTON ═══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
          className="mb-4 px-2"
        >
          <motion.button
            whileTap={{ scale: 0.95, y: 4 }}
            onClick={() => handleBattle("tap")}
            className="w-full relative overflow-hidden font-game-title text-2xl tracking-wider"
            style={{
              padding: "20px 0",
              borderRadius: "18px",
              background: "linear-gradient(180deg, hsl(142 71% 52%) 0%, hsl(142 65% 38%) 100%)",
              border: "3px solid hsl(142 60% 58% / 0.5)",
              borderBottom: "8px solid hsl(142 55% 22%)",
              boxShadow: "0 8px 30px hsl(142 71% 45% / 0.35), inset 0 2px 0 hsl(142 80% 68% / 0.4), 0 0 60px hsl(142 71% 50% / 0.15)",
              color: "hsl(142 80% 98%)",
              textShadow: "0 3px 0 hsl(142 50% 18%)",
            }}
          >
            {/* Jersey mesh */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }}
            />
            {/* Animated glow pulse */}
            <motion.div
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at center, hsl(142 80% 65% / 0.2), transparent 70%)" }}
            />
            <span className="relative z-10">🏏 BATTLE</span>
          </motion.button>
        </motion.div>

        {/* ═══ 3D CHEST SLOTS ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 px-1"
        >
          <div className="grid grid-cols-4 gap-2">
            {chestSlots.map((chest, i) => (
              <ChestSlot3D key={i} chest={chest} tick={tick} onTap={handleChestTap} />
            ))}
          </div>
        </motion.div>

        {/* ═══ MORE MODES HORIZONTAL SCROLL ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 px-1 mb-2">
            <div className="w-1 h-4 rounded-sm" style={{ background: "linear-gradient(180deg, hsl(43 90% 55%), hsl(35 60% 35%))" }} />
            <span className="font-game-display text-[10px] tracking-[0.2em] text-foreground">MORE MODES</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
            {OTHER_MODES.map((mode) => (
              <motion.button
                key={mode.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleBattle(mode.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1 rounded-xl p-3 relative overflow-hidden"
                style={{
                  width: 80,
                  background: "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 11%) 100%)",
                  border: "2px solid hsl(25 20% 22%)",
                  borderBottom: "4px solid hsl(25 20% 10%)",
                }}
              >
                <span className="text-2xl">{mode.icon}</span>
                <span className="font-game-display text-[8px] text-foreground tracking-wider whitespace-nowrap">{mode.title}</span>
                <span className="font-game-body text-[7px] text-muted-foreground/60 whitespace-nowrap">{mode.sub}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ═══ QUICK BANNERS ═══ */}
        <div className="grid grid-cols-2 gap-2 px-1 mb-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/spin")}
            className="rounded-xl px-3 py-3 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, hsl(35 40% 16%), hsl(25 30% 10%))",
              border: "2px solid hsl(35 50% 30%)",
              borderBottom: "4px solid hsl(35 30% 15%)",
            }}
          >
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-xl">🎰</motion.span>
            <div className="text-left">
              <span className="font-game-display text-[9px] text-foreground tracking-wider block">LUCKY SPIN</span>
              <span className="text-[8px] font-game-body text-muted-foreground">50 🪙</span>
            </div>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/team-builder")}
            className="rounded-xl px-3 py-3 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, hsl(142 30% 14%), hsl(142 25% 8%))",
              border: "2px solid hsl(142 35% 25%)",
              borderBottom: "4px solid hsl(142 25% 12%)",
            }}
          >
            <span className="text-xl">⚔️</span>
            <div className="text-left">
              <span className="font-game-display text-[9px] text-foreground tracking-wider block">TEAM BUILD</span>
              <span className="text-[8px] font-game-body text-muted-foreground">Dream XI</span>
            </div>
          </motion.button>
        </div>

        <DailyQuestsWidget />
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
function ChestSlot3D({ chest, tick, onTap }: { chest: UserChest | null; tick: number; onTap: (c: UserChest | null) => void }) {
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
        <span className="text-muted-foreground/30 font-game-display text-[8px] tracking-wider">EMPTY</span>
      </div>
    );
  }

  const tier = getChestTier(chest.chest_tier);
  const isUnlocking = chest.status === "unlocking";
  const remaining = isUnlocking ? chestTimeRemaining(chest) : 0;
  const isReady = chest.status === "ready" || (isUnlocking && remaining <= 0);
  const isLocked = chest.status === "locked";

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
      }}
    >
      {/* Ready glow pulse */}
      {isReady && (
        <motion.div
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${tier.glowColor}, transparent 70%)` }}
        />
      )}

      {/* Chest image with lid animation */}
      <motion.div
        animate={isReady ? { y: [0, -4, 0], rotate: [0, -2, 2, 0] } : isLocked ? {} : { y: [0, -2, 0] }}
        transition={{ duration: isReady ? 0.8 : 2, repeat: Infinity }}
        className="relative"
        style={{ width: "75%", aspectRatio: "1" }}
      >
        <img
          src={tier.image}
          alt={tier.name}
          className="w-full h-full object-contain"
          style={{
            filter: isLocked
              ? "grayscale(0.3) brightness(0.7)"
              : `drop-shadow(0 4px 8px ${tier.glowColor}) brightness(1.1)`,
          }}
        />
        {/* Sparkle on ready chests */}
        {isReady && (
          <>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  y: [-5, -15 - i * 5],
                  x: [0, (i - 1) * 12],
                }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                className="absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full"
                style={{ background: tier.color, boxShadow: `0 0 4px ${tier.color}` }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Status label */}
      <div className="absolute bottom-0 inset-x-0 py-1 text-center rounded-b-lg"
        style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.8))" }}
      >
        {isLocked && (
          <div className="flex items-center justify-center gap-0.5">
            <Lock className="w-2.5 h-2.5 text-muted-foreground/60" />
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
