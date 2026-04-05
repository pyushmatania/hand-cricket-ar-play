import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { SFX, Haptics } from "@/lib/sounds";
import gullyBg from "@/assets/gully-bg-immersive.jpg";
import { useUserChests, useStartUnlock, useCollectChest, chestTimeRemaining, type UserChest } from "@/hooks/useUserChests";
import { getChestTier } from "@/lib/chests";
import ChestReveal from "@/components/shop/ChestReveal";
import StumpHitAnimation from "@/components/StumpHitAnimation";
import { Settings, Bell, Trophy, Target, MessageCircle, Mail, Backpack, Lock } from "lucide-react";
import { toast } from "sonner";

/* ══════════════════════════════════════════════
   TYPES & CONSTANTS
   ══════════════════════════════════════════════ */

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

const CRICKET_CHEST: Record<string, { icon: string; label: string; color: string; glow: string; border: string }> = {
  bronze:  { icon: "🎾", label: "Tennis Ball", color: "hsl(35 80% 55%)",  glow: "hsl(35 80% 55% / 0.4)",  border: "hsl(35 50% 30%)" },
  silver:  { icon: "🏏", label: "Red Ball",    color: "hsl(0 65% 50%)",   glow: "hsl(0 65% 50% / 0.4)",   border: "hsl(0 40% 30%)" },
  gold:    { icon: "🏆", label: "Trophy",      color: "hsl(43 100% 55%)", glow: "hsl(43 100% 55% / 0.5)", border: "hsl(35 70% 35%)" },
  diamond: { icon: "💎", label: "Crystal Bat",  color: "hsl(200 80% 65%)", glow: "hsl(200 80% 65% / 0.5)", border: "hsl(210 50% 40%)" },
};

const GLASS = "rgba(15,23,42,0.6)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showStumpAnim, setShowStumpAnim] = useState(false);
  const [tick, setTick] = useState(0);
  const [revealData, setRevealData] = useState<{ name: string; emoji: string; rarity: string } | null>(null);
  const [pendingMode, setPendingMode] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

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

    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count }) => setUnreadCount(count || 0));
  }, [user]);

  const completeOnboarding = () => {
    localStorage.setItem("hc_onboarding_done", "1");
    setShowOnboarding(false);
  };

  const handleModeSelect = useCallback((modeId: string) => {
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

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ paddingBottom: "calc(68px + env(safe-area-inset-bottom, 16px))" }}>

      {/* ═══ LAYER 0: FULL-SCREEN IMMERSIVE BACKGROUND ═══ */}
      <div className="absolute inset-0">
        <img
          src={gullyBg}
          alt="Gully Grounds"
          className="w-full h-full object-cover"
          width={1080} height={1920}
        />
        {/* Dark overlay for bottom readability */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.85) 100%)",
        }} />
      </div>

      {/* ═══ FLOATING GOLDEN PARTICLES (dust in the air) ═══ */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={`p${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 60}%`,
            background: "hsl(43 90% 70%)",
            boxShadow: "0 0 6px hsl(43 90% 60% / 0.6)",
            opacity: 0.3 + Math.random() * 0.4,
          }}
          animate={{
            y: [0, -(20 + Math.random() * 30), 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      {/* ═══ LAYER 6: FLOATING COLLECTIBLES IN SKY ═══ */}
      <motion.div
        className="absolute pointer-events-none z-[5]"
        style={{ top: "8%", left: "12%" }}
        animate={{ y: [-5, 5, -5], rotate: [0, 360] }}
        transition={{ y: { duration: 3, repeat: Infinity }, rotate: { duration: 6, repeat: Infinity, ease: "linear" } }}
      >
        <span className="text-2xl" style={{ filter: "drop-shadow(0 0 8px rgba(255,215,0,0.6))" }}>🏏</span>
      </motion.div>
      <motion.div
        className="absolute pointer-events-none z-[5]"
        style={{ top: "12%", right: "15%" }}
        animate={{ y: [-4, 6, -4], rotate: [0, -360] }}
        transition={{ y: { duration: 3.5, repeat: Infinity }, rotate: { duration: 8, repeat: Infinity, ease: "linear" } }}
      >
        <span className="text-xl" style={{ filter: "drop-shadow(0 0 8px rgba(255,215,0,0.5))" }}>🪙</span>
      </motion.div>
      <motion.div
        className="absolute pointer-events-none z-[5]"
        style={{ top: "5%", left: "55%" }}
        animate={{ y: [-3, 7, -3] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <span className="text-lg" style={{ filter: "drop-shadow(0 0 6px rgba(100,200,255,0.5))" }}>💎</span>
      </motion.div>

      {/* ═══ LAYER 3: TOP HUD ═══ */}
      <div className="absolute top-0 left-0 right-0 z-30 px-3 pt-[env(safe-area-inset-top,8px)]">
        <div className="max-w-[430px] mx-auto flex items-center gap-2 py-2 px-3 rounded-b-2xl"
          style={{ background: "rgba(10,15,30,0.65)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${GLASS_BORDER}` }}
        >
          {/* Avatar + Level */}
          <button onClick={() => navigate(user ? "/profile" : "/auth")} className="relative flex-shrink-0 active:scale-95 transition-transform">
            <div className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ border: "2.5px solid hsl(43 80% 50%)", background: "rgba(30,40,60,0.8)", boxShadow: "0 0 12px hsl(43 80% 50% / 0.3)" }}
            >
              <span className="text-lg">{user ? "🏏" : "👤"}</span>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full"
              style={{ background: "linear-gradient(180deg, hsl(207 90% 54%), hsl(207 90% 38%))", border: "2px solid hsl(207 80% 28%)", boxShadow: "0 2px 6px hsl(207 90% 54% / 0.4)" }}
            >
              <span className="font-score text-[7px] text-white font-bold leading-none">{playerLevel}</span>
            </div>
          </button>

          {/* Name + XP */}
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-heading text-[11px] font-bold text-white truncate leading-none">{playerName}</span>
            <div className="w-16 h-[5px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(xpInLevel / 500) * 100}%` }}
                className="h-full rounded-full" style={{ background: "linear-gradient(90deg, hsl(134 61% 58%), hsl(51 100% 50%))" }}
              />
            </div>
          </div>

          <div className="flex-1" />

          {/* Currencies */}
          <div className="flex items-center gap-1.5">
            {[
              { icon: "🏏", val: currentTrophies, border: "hsl(43 40% 35%)" },
              { icon: "🪙", val: profile?.coins ?? 0, border: "hsl(43 40% 35%)", plus: true },
              { icon: "💎", val: 0, border: "hsl(280 40% 40%)", plus: true },
            ].map((c, i) => (
              <button key={i} onClick={c.plus ? () => navigate("/shop") : undefined}
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: "rgba(20,30,50,0.7)", border: `1px solid ${c.border}` }}
              >
                <span className="text-[10px]">{c.icon}</span>
                <span className="font-score text-[9px] text-white font-bold">{c.val >= 1000 ? `${(c.val / 1000).toFixed(1)}K` : c.val}</span>
                {c.plus && <span className="text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full" style={{ background: "hsl(142 71% 45%)", color: "#000" }}>+</span>}
              </button>
            ))}
          </div>

          {/* Bell */}
          <button onClick={() => navigate("/notifications")} className="relative w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(20,30,50,0.7)", border: `1px solid ${GLASS_BORDER}` }}
          >
            <Bell className="w-4 h-4 text-white/70" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center"
                style={{ background: "hsl(0 84% 55%)", border: "2px solid rgba(10,15,30,0.8)" }}
              >
                <span className="text-[7px] text-white font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>
              </div>
            )}
          </button>

          {/* Settings */}
          <button onClick={() => navigate("/settings")} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(20,30,50,0.7)", border: `1px solid ${GLASS_BORDER}` }}
          >
            <Settings className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* ═══ LAYER 1: CHARACTER PEDESTAL ═══ */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center" style={{ top: "38%" }}>
        {/* Character */}
        <motion.div
          animate={{ rotateY: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="relative"
          style={{ width: 140, height: 200 }}
        >
          {/* Glow aura behind character */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ opacity: [0.15, 0.35, 0.15], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ background: "radial-gradient(circle, hsl(43 90% 55% / 0.3), transparent 70%)" }}
          />
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl" style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.6))" }}>🏏</span>
          </div>
        </motion.div>

        {/* Glowing platform */}
        <motion.div
          animate={{ boxShadow: ["0 0 20px hsl(43 90% 55% / 0.2)", "0 0 40px hsl(43 90% 55% / 0.45)", "0 0 20px hsl(43 90% 55% / 0.2)"] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="-mt-4"
          style={{
            width: 160,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(180deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))",
            border: "2px solid hsl(43 80% 50% / 0.5)",
          }}
        />

        {/* Arena name below pedestal */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mt-2 px-4 py-1 rounded-full"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <span className="font-heading text-[10px] tracking-[0.2em] font-bold" style={{ color: "hsl(43 90% 60%)" }}>
            ⭐ {currentArena.name.toUpperCase()} ⭐
          </span>
        </motion.div>
      </div>

      {/* ═══ LAYER 2: FLOATING GAME MODE RIBBONS — RIGHT ═══ */}
      <div className="absolute right-3 z-20 flex flex-col gap-3" style={{ top: "34%" }}>
        <FloatingRibbon
          label="⚡ TAP"
          gradient="linear-gradient(135deg, hsl(142 70% 50%), hsl(142 60% 38%))"
          delay={0}
          onClick={() => handleModeSelect("tap")}
          size="lg"
        />
        <FloatingRibbon
          label="⚔️ PVP"
          gradient="linear-gradient(135deg, hsl(0 75% 55%), hsl(15 70% 45%))"
          delay={0.3}
          onClick={() => handleModeSelect("multiplayer")}
          size="md"
        />
        <FloatingRibbon
          label="📷 AR"
          gradient="linear-gradient(135deg, hsl(190 80% 50%), hsl(200 70% 40%))"
          delay={0.6}
          onClick={() => handleModeSelect("classic")}
          size="sm"
        />
      </div>

      {/* ═══ LAYER 2: FLOATING BUTTONS — LEFT ═══ */}
      <div className="absolute left-3 z-20 flex flex-col gap-3" style={{ top: "40%" }}>
        <FloatingPill
          icon="🏆"
          label="Tournament"
          gradient="linear-gradient(135deg, hsl(270 60% 50%), hsl(43 80% 50%))"
          onClick={() => handleModeSelect("tournament")}
          delay={0.2}
        />
        <FloatingPill
          icon="🎯"
          label="Practice"
          gradient="linear-gradient(135deg, hsl(142 55% 45%), hsl(142 45% 35%))"
          onClick={() => handleModeSelect("practice")}
          delay={0.4}
        />
      </div>

      {/* ═══ LAYER 4: SIDE ICON BUTTONS — LEFT ═══ */}
      <div className="absolute left-2 z-20 flex flex-col gap-2" style={{ top: "18%" }}>
        <SideButton icon={<Trophy className="w-[18px] h-[18px]" />} label="Rank" onClick={() => navigate("/leaderboard")} />
        <SideButton icon={<Target className="w-[18px] h-[18px]" />} label="Quests" badge={3} onClick={() => navigate("/game/daily")} />
        <SideButton icon={<MessageCircle className="w-[18px] h-[18px]" />} label="Chat" onClick={() => navigate("/friends")} />
      </div>

      {/* ═══ LAYER 4: SIDE ICON BUTTONS — RIGHT ═══ */}
      <div className="absolute right-2 z-20 flex flex-col gap-2" style={{ top: "18%" }}>
        <SideButton icon={<Mail className="w-[18px] h-[18px]" />} label="Mail" badge={unreadCount} onClick={() => navigate("/notifications")} />
        <SideButton icon={<Backpack className="w-[18px] h-[18px]" />} label="Cards" onClick={() => navigate("/collection")} />
        <SideButton icon={<Lock className="w-[18px] h-[18px] opacity-40" />} label="Soon" />
      </div>

      {/* ═══ LAYER 5: BOTTOM AREA (Chest Slots + Arena Progress) ═══ */}
      <div className="absolute bottom-0 left-0 right-0 z-20" style={{ paddingBottom: "calc(68px + env(safe-area-inset-bottom, 16px))" }}>
        <div className="max-w-[430px] mx-auto px-3">

          {/* Chest slot row */}
          <div className="flex gap-2 mb-2 px-1 py-2 rounded-xl"
            style={{ background: "rgba(10,15,30,0.7)", backdropFilter: "blur(10px)", border: `1px solid ${GLASS_BORDER}` }}
          >
            {chestSlots.map((chest, i) => (
              <MiniChestSlot key={i} chest={chest} tick={tick} onTap={handleChestTap} />
            ))}
          </div>

          {/* Arena progress */}
          <div className="px-2 py-1.5 rounded-xl mb-1"
            style={{ background: "rgba(10,15,30,0.6)", backdropFilter: "blur(8px)", border: `1px solid ${GLASS_BORDER}` }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-body text-[9px] font-semibold text-white/60">🏏 {currentArena.name}</span>
              <span className="font-body text-[9px] font-semibold text-white/60">→ {nextArena.name}</span>
            </div>
            <div className="h-[5px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${arenaProgress}%` }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(43 90% 55%), hsl(35 80% 45%))", boxShadow: "0 0 8px hsl(43 90% 55% / 0.4)" }}
              />
            </div>
            <div className="text-center mt-0.5">
              <span className="font-score text-[8px] text-white/50">🏆 {currentTrophies}/{nextArena.trophies}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MORE MODES LINK ═══ */}
      <motion.button
        className="absolute z-20 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full"
        style={{ bottom: "calc(68px + env(safe-area-inset-bottom, 16px) + 140px)", background: "rgba(10,15,30,0.6)", backdropFilter: "blur(8px)", border: `1px solid ${GLASS_BORDER}` }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/play")}
      >
        <span className="font-body text-[10px] text-white/60">More Modes ▾</span>
      </motion.button>

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
   FLOATING RIBBON BUTTON (TAP / PVP / AR)
   ══════════════════════════════════════════════ */

function FloatingRibbon({ label, gradient, delay, onClick, size }: {
  label: string; gradient: string; delay: number; onClick: () => void;
  size: "lg" | "md" | "sm";
}) {
  const fontSize = size === "lg" ? 18 : size === "md" ? 15 : 13;
  const px = size === "lg" ? "20px 28px" : size === "md" ? "14px 22px" : "10px 18px";

  return (
    <motion.button
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0, rotate: [-1.5, 1.5, -1.5], y: [-2, 2, -2] }}
      transition={{
        opacity: { delay, duration: 0.4 },
        x: { delay, duration: 0.4 },
        rotate: { delay: delay + 0.5, duration: 3.5, repeat: Infinity, ease: "easeInOut" },
        y: { delay: delay + 0.5, duration: 3, repeat: Infinity, ease: "easeInOut" },
      }}
      whileTap={{ scale: 1.08 }}
      onClick={onClick}
      className="relative"
      style={{
        background: gradient,
        padding: px,
        borderRadius: "12px 6px 6px 12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
        cursor: "pointer",
      }}
    >
      {/* 3D bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] rounded-b-md" style={{ background: "rgba(0,0,0,0.3)" }} />
      <span style={{
        fontFamily: "'Bungee', cursive",
        fontSize,
        color: "white",
        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        letterSpacing: "0.05em",
      }}>
        {label}
      </span>
    </motion.button>
  );
}

/* ══════════════════════════════════════════════
   FLOATING PILL BUTTON (Tournament / Practice)
   ══════════════════════════════════════════════ */

function FloatingPill({ icon, label, gradient, onClick, delay }: {
  icon: string; label: string; gradient: string; onClick: () => void; delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0, y: [-2, 3, -2] }}
      transition={{
        opacity: { delay, duration: 0.4 },
        x: { delay, duration: 0.4 },
        y: { delay: delay + 0.5, duration: 3.5, repeat: Infinity, ease: "easeInOut" },
      }}
      whileTap={{ scale: 1.08 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
      style={{
        background: gradient,
        boxShadow: "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      <span className="text-sm">{icon}</span>
      <span className="font-body text-[11px] font-bold text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{label}</span>
    </motion.button>
  );
}

/* ══════════════════════════════════════════════
   SIDE ICON BUTTON
   ══════════════════════════════════════════════ */

function SideButton({ icon, label, badge, onClick }: {
  icon: React.ReactNode; label: string; badge?: number; onClick?: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 1.1 }}
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 relative"
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white/80"
        style={{ background: GLASS, backdropFilter: "blur(8px)", border: `1px solid ${GLASS_BORDER}` }}
      >
        {icon}
      </div>
      {badge && badge > 0 && (
        <div className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center"
          style={{ background: "hsl(0 84% 55%)", border: "2px solid rgba(10,15,30,0.8)" }}
        >
          <span className="text-[7px] text-white font-bold">{badge > 9 ? "9+" : badge}</span>
        </div>
      )}
      <span className="text-[7px] text-white/50 font-body">{label}</span>
    </motion.button>
  );
}

/* ══════════════════════════════════════════════
   MINI CHEST SLOT (Bottom Bar)
   ══════════════════════════════════════════════ */

function MiniChestSlot({ chest, tick, onTap }: { chest: UserChest | null; tick: number; onTap: (c: UserChest | null) => void }) {
  void tick;

  if (!chest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-2 rounded-lg"
        style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
      >
        <span className="text-white/15 text-sm">+</span>
      </div>
    );
  }

  const tierKey = (chest.chest_tier || "bronze").toLowerCase();
  const cc = CRICKET_CHEST[tierKey] || CRICKET_CHEST.bronze;
  const isUnlocking = chest.status === "unlocking";
  const remaining = isUnlocking ? chestTimeRemaining(chest) : 0;
  const isReady = chest.status === "ready" || (isUnlocking && remaining <= 0);
  const isLocked = chest.status === "locked";

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => onTap(chest)}
      className="flex-1 flex flex-col items-center justify-center py-2 rounded-lg relative"
      style={{
        background: isReady ? `radial-gradient(ellipse at bottom, ${cc.glow}, transparent 70%)` : "transparent",
        border: `1px solid ${isReady ? cc.color + "80" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <motion.span
        className="text-2xl"
        animate={isReady ? { y: [-2, 2, -2], scale: [1, 1.05, 1] } : {}}
        transition={isReady ? { duration: 2, repeat: Infinity } : {}}
        style={{ filter: isLocked ? "grayscale(0.5) brightness(0.5)" : "none" }}
      >
        {cc.icon}
      </motion.span>
      {isLocked && <span className="text-[7px] text-white/30 font-score mt-0.5">🔒</span>}
      {isUnlocking && !isReady && <span className="text-[7px] text-white/50 font-score mt-0.5">{formatTime(remaining)}</span>}
      {isReady && (
        <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity }}
          className="text-[7px] font-score font-bold mt-0.5" style={{ color: cc.color }}
        >OPEN!</motion.span>
      )}
    </motion.button>
  );
}
