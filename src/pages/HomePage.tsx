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
      {/* ═══ ATMOSPHERIC SKY BEHIND ISLAND ═══ */}
      <div className="absolute top-0 left-0 right-0 h-[420px] pointer-events-none overflow-hidden z-0">
        {/* Sky gradient */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, hsl(220 40% 14%) 0%, hsl(230 30% 10%) 40%, hsl(260 20% 8%) 70%, transparent 100%)",
        }} />
        {/* Stars layer */}
        <div className="absolute inset-0 opacity-60" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 15% 12%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 35% 8%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1.5px 1.5px at 55% 18%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 72% 6%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 88% 22%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 8% 28%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1.5px 1.5px at 45% 4%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 65% 30%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 80% 15%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 92% 32%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1.5px 1.5px at 50% 26%, rgba(255,255,255,0.6), transparent)
          `,
        }} />
        {/* Twinkling star */}
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ top: "10%", left: "30%", background: "rgba(255,255,255,0.8)", filter: "blur(0.5px)" }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-1 h-1 rounded-full"
          style={{ top: "18%", left: "70%", background: "rgba(200,220,255,0.7)", filter: "blur(0.5px)" }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Drifting cloud 1 */}
        <motion.div
          className="absolute"
          style={{ top: "25%", width: 160, height: 40 }}
          animate={{ x: [-80, 420] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full" style={{
            background: "radial-gradient(ellipse, rgba(180,200,230,0.06) 0%, transparent 70%)",
            filter: "blur(12px)",
          }} />
        </motion.div>
        {/* Drifting cloud 2 */}
        <motion.div
          className="absolute"
          style={{ top: "40%", width: 200, height: 50 }}
          animate={{ x: [420, -100] }}
          transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full" style={{
            background: "radial-gradient(ellipse, rgba(160,180,220,0.05) 0%, transparent 70%)",
            filter: "blur(16px)",
          }} />
        </motion.div>
        {/* Drifting cloud 3 */}
        <motion.div
          className="absolute"
          style={{ top: "15%", width: 120, height: 30 }}
          animate={{ x: [-60, 450] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear", delay: 8 }}
        >
          <div className="w-full h-full rounded-full" style={{
            background: "radial-gradient(ellipse, rgba(200,210,240,0.04) 0%, transparent 70%)",
            filter: "blur(10px)",
          }} />
        </motion.div>
        {/* Subtle moon glow */}
        <div className="absolute" style={{
          top: "5%", right: "12%", width: 50, height: 50,
          background: "radial-gradient(circle, rgba(220,230,255,0.12) 0%, rgba(200,210,240,0.05) 40%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(4px)",
        }} />
        {/* Bottom fog fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{
          background: "linear-gradient(180deg, transparent 0%, hsl(220 20% 8%) 100%)",
        }} />
      </div>

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

      {/* ═══ QUICK MODES ROW ═══ */}
      <div className="flex gap-2 px-4 mb-4">
        {QUICK_MODES.map((mode, idx) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + idx * 0.08 }}
            whileTap={{ scale: 0.93, y: 2 }}
            onClick={() => handleModeSelect(mode.id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 overflow-hidden"
            style={{
              height: 90,
              borderRadius: 14,
              background: "linear-gradient(180deg, rgba(30,28,24,0.9) 0%, rgba(18,16,12,0.95) 100%)",
              border: `1.5px solid ${mode.color}20`,
              borderBottom: `4px solid ${mode.color}30`,
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-2xl"
              style={{ filter: `drop-shadow(0 0 8px ${mode.color}50)` }}
            >
              {mode.icon}
            </motion.span>
            <div className="text-center">
              <div className="font-display text-[11px] font-bold" style={{ color: mode.color }}>{mode.label}</div>
              <div className="text-[8px] text-muted-foreground font-body">{mode.sub}</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ═══ CHEST SLOTS ═══ */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs">🎁</span>
          <span className="font-display text-[10px] tracking-[2px] text-muted-foreground">CHEST SLOTS</span>
        </div>
        <div className="flex justify-center gap-2.5">
          {chestSlots.map((chest, i) => (
            <ChestSlot key={i} chest={chest} onTap={handleChestTap} tick={tick} />
          ))}
        </div>
      </div>

      {/* ═══ MORE MODES GRID ═══ */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs">🏟️</span>
          <span className="font-display text-[10px] tracking-[2px] text-muted-foreground">MORE MODES</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {MORE_MODES.map((mode, idx) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + idx * 0.03 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleModeSelect(mode.id)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl"
              style={{
                background: "linear-gradient(180deg, rgba(30,28,24,0.8) 0%, rgba(18,16,12,0.9) 100%)",
                border: `1px solid ${mode.color}15`,
              }}
            >
              <span className="text-xl" style={{ filter: `drop-shadow(0 0 6px ${mode.color}40)` }}>{mode.icon}</span>
              <span className="font-display text-[8px] tracking-wider" style={{ color: mode.color }}>{mode.label}</span>
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
      <div className="flex flex-col items-center justify-center"
        style={{
          width: 78, height: 96, borderRadius: 16,
          background: "linear-gradient(180deg, rgba(30,28,24,0.5) 0%, rgba(18,16,12,0.6) 100%)",
          border: "1.5px dashed rgba(255,255,255,0.06)",
        }}
      >
        <span className="text-lg text-white/10">+</span>
        <span className="text-[7px] mt-0.5 text-white/15 font-display">EMPTY</span>
      </div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9, y: 2 }}
      onClick={() => onTap(chest)}
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        width: 78, height: 96, borderRadius: 16,
        background: "linear-gradient(180deg, rgba(30,28,24,0.9) 0%, rgba(18,16,12,0.95) 100%)",
        border: `1.5px solid ${isReady ? tier?.color : "rgba(255,255,255,0.08)"}`,
        boxShadow: isReady ? `0 0 24px ${tier?.color}40` : undefined,
      }}
    >
      {isUnlocking && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none -rotate-90" viewBox="0 0 78 96">
          <rect x="2" y="2" width="74" height="92" rx="14" ry="14" fill="none"
            stroke={tier?.color || "#475569"} strokeWidth="2"
            strokeDasharray={`${progressPct * 3.32} 332`} strokeLinecap="round" opacity="0.5"
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
        style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.7), transparent)", borderRadius: "0 0 14px 14px" }}
      >
        <span className="text-[8px] font-bold block font-display" style={{
          color: isReady ? "#FFD700" : isUnlocking ? (tier?.color || "#475569") : "#94A3B8",
        }}>
          {isReady ? "OPEN!" : isUnlocking ? formatTime(remaining) : tier?.name.split(" ")[0]}
        </span>
      </div>
    </motion.button>
  );
}
