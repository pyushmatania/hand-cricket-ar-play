import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { SFX, Haptics } from "@/lib/sounds";
import { useUserChests, useStartUnlock, useCollectChest, chestTimeRemaining, type UserChest } from "@/hooks/useUserChests";
import { getChestTier } from "@/lib/chests";
import ChestReveal from "@/components/shop/ChestReveal";
import StumpHitAnimation from "@/components/StumpHitAnimation";
import { toast } from "sonner";
import IdentityBar from "@/components/hub/IdentityBar";
import FloatingIslandCarousel from "@/components/hub/FloatingIslandCarousel";
import CricketProgressBar from "@/components/hub/CricketProgressBar";
import DynamicSky from "@/components/hub/DynamicSky";

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
  avatar_index?: number;
  avatar_url?: string | null;
}

const ARENA_LEVELS = [
  { name: "Gully Grounds", trophies: 0 },
  { name: "School Ground", trophies: 100 },
  { name: "District Stadium", trophies: 300 },
  { name: "Ranji Trophy", trophies: 600 },
  { name: "IPL Stadium", trophies: 1200 },
  { name: "International", trophies: 2000 },
  { name: "World Cup", trophies: 3000 },
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

const QUICK_MODES = [
  { id: "tap", icon: "⚡", label: "TAP PLAY", sub: "Quick Match", color: "#4ADE50" },
  { id: "pvp", icon: "⚔️", label: "PVP", sub: "Real Player", color: "#FF2D7B" },
  { id: "ar", icon: "📷", label: "AR MODE", sub: "Camera", color: "#00D4FF" },
];

const MORE_MODES = [
  { id: "tournament", icon: "🏆", label: "Tournament", color: "#A855F7" },
  { id: "ipl", icon: "🏏", label: "IPL Season", color: "#FFD700" },
  { id: "worldcup", icon: "🌍", label: "World Cup", color: "#00D4FF" },
  { id: "ashes", icon: "🏺", label: "The Ashes", color: "#FF6B35" },
  { id: "knockout", icon: "🥊", label: "Knockout", color: "#FF2D7B" },
  { id: "auction", icon: "💰", label: "Auction", color: "#FFD700" },
  { id: "royale", icon: "💀", label: "Royale", color: "#A855F7" },
  { id: "daily", icon: "📅", label: "Daily", color: "#FF6B35" },
  { id: "practice", icon: "🎯", label: "Practice", color: "#4ADE50" },
  { id: "battlepass", icon: "⭐", label: "Battle Pass", color: "#A855F7" },
];

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
      .select("total_matches, wins, losses, high_score, current_streak, best_streak, coins, xp, display_name, avatar_index, avatar_url")
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
    try { SFX.tap(); Haptics.heavy(); } catch {}
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
  const xpProgress = ((profile?.xp ?? 0) % 500) / 500 * 100;
  const playerName = profile?.display_name || user?.email?.split("@")[0]?.slice(0, 10) || "Player";
  const winRate = profile && profile.total_matches > 0 ? Math.round((profile.wins / profile.total_matches) * 100) : 0;
  const chestSlots = Array.from({ length: 4 }, (_, i) => chests?.find(c => c.slot_index === i) || null);

  return (
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar game-screen"
      style={{ background: "linear-gradient(180deg, hsl(220 20% 8%) 0%, hsl(220 18% 5%) 100%)" }}
    >
      {/* ═══ DYNAMIC SKY ═══ */}
      <DynamicSky />

      {/* ═══ IDENTITY BAR ═══ */}
      <div className="relative z-10">
      <IdentityBar
        playerName={playerName}
        playerLevel={playerLevel}
        xpProgress={xpProgress}
        avatarIndex={profile?.avatar_index}
        avatarUrl={profile?.avatar_url}
        coins={profile?.coins ?? 0}
        gems={45}
        streak={profile?.current_streak ?? 0}
        unreadCount={unreadCount}
      />
      </div>

      {/* ═══ FLOATING ISLAND CAROUSEL ═══ */}
      <div className="relative z-10">
      <FloatingIslandCarousel currentTrophies={currentTrophies} />

      </div>

      {/* ═══ CRICKET PROGRESS BAR ═══ */}
      <div className="relative z-10">
      <CricketProgressBar
        currentTrophies={currentTrophies}
        nextTrophies={nextArena.trophies}
        arenaName={currentArena.name}
        nextArenaName={nextArena.name}
      />
      </div>

      {/* ═══ STATS CHIPS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 px-4 mt-4 mb-3"
      >
        {[
          { label: "W/L", value: `${profile?.wins ?? 0}/${profile?.losses ?? 0}`, c: "#4ADE50" },
          { label: "RATE", value: `${winRate}%`, c: "#00D4FF" },
          { label: "BEST", value: String(profile?.high_score ?? 0), c: "#FFD700" },
          { label: "🔥", value: String(profile?.current_streak ?? 0), c: "#FF6B35" },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center px-3 py-1.5 rounded-lg"
            style={{
              background: "linear-gradient(180deg, rgba(30,28,24,0.9) 0%, rgba(18,16,12,0.95) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span className="text-[7px] text-muted-foreground font-display tracking-wider">{s.label}</span>
            <span className="font-display text-[13px] font-bold tabular-nums" style={{ color: s.c }}>{s.value}</span>
          </div>
        ))}
      </motion.div>

      {/* ═══ BIG BATTLE BUTTON ═══ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
        className="px-6 mb-4"
      >
        <motion.button
          whileTap={{ scale: 0.96, y: 3 }}
          onClick={() => { try { SFX.tap(); Haptics.heavy(); } catch {} setShowStumpAnim(true); }}
          className="w-full relative overflow-hidden font-display text-lg tracking-[4px]"
          style={{
            padding: "18px 32px",
            borderRadius: 16,
            background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
            border: "2px solid hsl(142 60% 55% / 0.5)",
            borderBottom: "6px solid hsl(142 55% 25%)",
            color: "hsl(142 80% 98%)",
            textShadow: "0 2px 0 hsl(142 50% 20%)",
            boxShadow: "0 8px 30px hsl(142 71% 45% / 0.35), inset 0 1px 0 hsl(142 80% 65% / 0.4)",
          }}
        >
          {/* Jersey mesh texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }}
          />
          <span className="relative z-10">⚔️ BATTLE</span>
        </motion.button>
      </motion.div>

      {/* ═══ QUICK MODES — Wooden Planks ═══ */}
      <div className="flex gap-2.5 px-4 mb-5">
        {QUICK_MODES.map((mode, idx) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + idx * 0.08, type: "spring", stiffness: 300 }}
            whileTap={{ scale: 0.93, y: 3 }}
            onClick={() => handleModeSelect(mode.id)}
            className="flex-1 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden"
            style={{
              height: 100,
              borderRadius: 16,
              background: `linear-gradient(180deg, hsl(30 25% 18%) 0%, hsl(25 20% 12%) 60%, hsl(20 18% 8%) 100%)`,
              border: "2px solid hsl(35 30% 25%)",
              borderBottom: "5px solid hsl(25 20% 8%)",
              boxShadow: `0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 hsl(35 30% 30% / 0.4), 0 0 20px ${mode.color}15`,
            }}
          >
            {/* Wood grain texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.08]"
              style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 8px, hsl(35 40% 40% / 0.3) 8px, transparent 9px)", backgroundSize: "12px 100%" }}
            />
            {/* Iron corner brackets */}
            <div className="absolute top-1 left-1 w-3 h-3 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[2px] rounded-sm" style={{ background: "linear-gradient(90deg, hsl(35 20% 45%), hsl(35 15% 30%))" }} />
              <div className="absolute top-0 left-0 h-full w-[2px] rounded-sm" style={{ background: "linear-gradient(180deg, hsl(35 20% 45%), hsl(35 15% 30%))" }} />
            </div>
            <div className="absolute top-1 right-1 w-3 h-3 pointer-events-none">
              <div className="absolute top-0 right-0 w-full h-[2px] rounded-sm" style={{ background: "linear-gradient(270deg, hsl(35 20% 45%), hsl(35 15% 30%))" }} />
              <div className="absolute top-0 right-0 h-full w-[2px] rounded-sm" style={{ background: "linear-gradient(180deg, hsl(35 20% 45%), hsl(35 15% 30%))" }} />
            </div>
            {/* Accent glow strip at top */}
            <div className="absolute top-0 inset-x-0 h-[2px] pointer-events-none" style={{ background: `linear-gradient(90deg, transparent 10%, ${mode.color}60 50%, transparent 90%)` }} />
            {/* Icon */}
            <motion.span
              animate={{ scale: [1, 1.12, 1], y: [0, -2, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-[28px] relative z-10"
              style={{ filter: `drop-shadow(0 2px 8px ${mode.color}60)` }}
            >
              {mode.icon}
            </motion.span>
            <div className="text-center relative z-10">
              <div className="font-display text-[11px] font-bold tracking-wider" style={{ color: mode.color, textShadow: `0 0 10px ${mode.color}40` }}>{mode.label}</div>
              <div className="text-[7px] text-muted-foreground/60 font-display tracking-widest">{mode.sub}</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ═══ CHEST SLOTS — Iron Cage Shelf ═══ */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-2 mb-2.5 px-1">
          <div className="w-1 h-4 rounded-sm" style={{ background: "linear-gradient(180deg, hsl(43 90% 55%), hsl(35 60% 35%))" }} />
          <span className="font-display text-[10px] tracking-[3px] text-foreground/70">TREASURE VAULT</span>
        </div>
        <div className="flex justify-center gap-2.5 p-3 relative"
          style={{
            borderRadius: 16,
            background: "linear-gradient(180deg, hsl(25 18% 14%) 0%, hsl(22 15% 9%) 100%)",
            border: "2px solid hsl(35 25% 22%)",
            borderBottom: "5px solid hsl(22 15% 6%)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          {/* Wood grain bg */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06] rounded-[14px]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 12px, hsl(35 40% 40% / 0.3) 12px, transparent 13px)" }}
          />
          {/* Iron bracket corners */}
          {["top-1.5 left-1.5", "top-1.5 right-1.5", "bottom-2.5 left-1.5", "bottom-2.5 right-1.5"].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-4 h-4 pointer-events-none`}>
              <div className="absolute rounded-full" style={{ width: 4, height: 4, background: "radial-gradient(circle, hsl(35 30% 50%), hsl(35 20% 30%))", top: 0, left: i % 2 === 0 ? 0 : "auto", right: i % 2 === 1 ? 0 : "auto" }} />
            </div>
          ))}
          {chestSlots.map((chest, i) => (
            <ChestSlot key={i} chest={chest} onTap={handleChestTap} tick={tick} />
          ))}
        </div>
      </div>

      {/* ═══ MORE MODES — Carved Stone Grid ═══ */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-2.5 px-1">
          <div className="w-1 h-4 rounded-sm" style={{ background: "linear-gradient(180deg, hsl(280 50% 55%), hsl(280 40% 35%))" }} />
          <span className="font-display text-[10px] tracking-[3px] text-foreground/70">ARENA MODES</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {MORE_MODES.map((mode, idx) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + idx * 0.03 }}
              whileTap={{ scale: 0.88, y: 2 }}
              onClick={() => handleModeSelect(mode.id)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 relative overflow-hidden"
              style={{
                borderRadius: 14,
                background: "linear-gradient(180deg, hsl(28 20% 16%) 0%, hsl(25 18% 10%) 100%)",
                border: "1.5px solid hsl(35 25% 20%)",
                borderBottom: "4px solid hsl(25 15% 7%)",
                boxShadow: `inset 0 1px 0 hsl(35 25% 25% / 0.3), 0 2px 8px rgba(0,0,0,0.3)`,
              }}
            >
              {/* Subtle glow at bottom */}
              <div className="absolute bottom-0 inset-x-0 h-6 pointer-events-none" style={{ background: `radial-gradient(ellipse at center bottom, ${mode.color}12, transparent 80%)` }} />
              <motion.span
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: idx * 0.1 }}
                className="text-xl relative z-10"
                style={{ filter: `drop-shadow(0 2px 6px ${mode.color}50)` }}
              >
                {mode.icon}
              </motion.span>
              <span className="font-display text-[7px] tracking-wider relative z-10" style={{ color: mode.color, textShadow: `0 0 6px ${mode.color}30` }}>{mode.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom spacer for tab bar */}
      <div style={{ height: "calc(var(--tab-bar-height, 68px) + env(safe-area-inset-bottom, 0px) + 16px)" }} />

      {/* ═══ OVERLAYS ═══ */}
      <StumpHitAnimation show={showStumpAnim} onComplete={handleStumpComplete} />
      {revealData && (
        <ChestReveal
          itemName={revealData.name}
          itemEmoji={revealData.emoji}
          rarity={revealData.rarity}
          onComplete={() => setRevealData(null)}
        />
      )}
    </div>
  );
}

/* ═══ SUB-COMPONENTS ═══ */

function ChestSlot({ chest, onTap, tick }: { chest: UserChest | null; onTap: (c: UserChest | null) => void; tick: number }) {
  const tier = chest ? getChestTier(chest.chest_tier) : null;
  const isReady = chest && (chest.status === "ready" || (chest.status === "unlocking" && chestTimeRemaining(chest) <= 0));
  const isUnlocking = chest?.status === "unlocking" && chestTimeRemaining(chest) > 0;
  const remaining = isUnlocking ? chestTimeRemaining(chest) : 0;
  const totalDur = chest?.unlock_duration_seconds || 1;
  const progressPct = isUnlocking ? Math.max(0, Math.min(100, ((totalDur - remaining) / totalDur) * 100)) : 0;

  if (!chest) {
    return (
      <div className="flex flex-col items-center justify-center relative"
        style={{
          width: 74, height: 92, borderRadius: 14,
          background: "linear-gradient(180deg, hsl(28 15% 14%) 0%, hsl(25 12% 8%) 100%)",
          border: "1.5px dashed hsl(35 20% 20%)",
          borderBottom: "3px solid hsl(25 12% 6%)",
        }}
      >
        <span className="text-lg text-white/8">+</span>
        <span className="text-[7px] mt-0.5 text-white/12 font-display tracking-wider">EMPTY</span>
      </div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9, y: 2 }}
      onClick={() => onTap(chest)}
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        width: 74, height: 92, borderRadius: 14,
        background: "linear-gradient(180deg, hsl(28 18% 16%) 0%, hsl(25 15% 10%) 100%)",
        border: `2px solid ${isReady ? tier?.color : "hsl(35 22% 22%)"}`,
        borderBottom: `4px solid ${isReady ? tier?.color + "80" : "hsl(25 15% 7%)"}`,
        boxShadow: isReady ? `0 0 20px ${tier?.color}40, inset 0 0 12px ${tier?.color}15` : "inset 0 1px 0 hsl(35 25% 25% / 0.2)",
      }}
    >
      {/* Wood grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] rounded-[12px]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 6px, hsl(35 40% 40% / 0.4) 6px, transparent 7px)" }}
      />

      {isUnlocking && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none -rotate-90" viewBox="0 0 74 92">
          <rect x="2" y="2" width="70" height="88" rx="12" ry="12" fill="none"
            stroke={tier?.color || "#475569"} strokeWidth="2.5"
            strokeDasharray={`${progressPct * 3.16} 316`} strokeLinecap="round" opacity="0.6"
          />
        </svg>
      )}

      <motion.img
        src={tier?.image}
        alt={tier?.name}
        animate={isReady ? { y: [-3, 3, -3], scale: [1, 1.08, 1] } : isUnlocking ? { rotateZ: [-2, 2, -2] } : {}}
        transition={{ duration: isReady ? 1.5 : 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-10 h-10 object-contain relative z-10"
        style={{
          filter: isUnlocking ? `brightness(0.5) saturate(0.3)` : isReady ? `drop-shadow(0 0 12px ${tier?.color}80)` : `drop-shadow(0 2px 6px rgba(0,0,0,0.5))`,
        }}
      />

      <div className="absolute bottom-0 inset-x-0 py-1 text-center z-10"
        style={{ background: "linear-gradient(0deg, hsl(25 15% 6% / 0.8), transparent)", borderRadius: "0 0 12px 12px" }}
      >
        <span className="text-[8px] font-bold block font-display tracking-wider" style={{
          color: isReady ? "#FFD700" : isUnlocking ? (tier?.color || "#475569") : "hsl(35 20% 50%)",
          textShadow: isReady ? "0 0 8px #FFD700" : undefined,
        }}>
          {isReady ? "OPEN!" : isUnlocking ? formatTime(remaining) : tier?.name.split(" ")[0]}
        </span>
      </div>
    </motion.button>
  );
}
