import { useState, useEffect, useCallback, useRef } from "react";
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
import StadiumPitchHero from "@/components/hub/StadiumPitchHero";
import V10Button from "@/components/shared/V10Button";

/* ═══════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════ */

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
  { name: "Gully Grounds", trophies: 0, unlock: "Free", emoji: "🏏", accent: "#4ADE50" },
  { name: "School Ground", trophies: 100, unlock: "Level 3", emoji: "🏫", accent: "#4ADE80" },
  { name: "District Stadium", trophies: 300, unlock: "Level 7", emoji: "🏟️", accent: "#00D4FF" },
  { name: "Ranji Trophy", trophies: 600, unlock: "Level 12", emoji: "🏆", accent: "#FFD700" },
  { name: "IPL Stadium", trophies: 1200, unlock: "Level 18", emoji: "✨", accent: "#A855F7" },
  { name: "International", trophies: 2000, unlock: "Level 22", emoji: "🌍", accent: "#00D4FF" },
  { name: "World Cup", trophies: 3000, unlock: "Level 25", emoji: "🏆", accent: "#FFD700" },
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

const CRICKET_CHEST: Record<string, { icon: string; label: string; color: string }> = {
  bronze:  { icon: "🎾", label: "Tennis Ball", color: "#CD7F32" },
  silver:  { icon: "🏏", label: "Red Ball",    color: "#00D4FF" },
  gold:    { icon: "🏆", label: "Trophy",      color: "#FFD700" },
  diamond: { icon: "💎", label: "Crystal Bat",  color: "#A855F7" },
};

const MAIN_MODES = [
  { id: "tap", icon: "⚡", label: "TAP", sub: "Quick Play", color: "#4ADE50" },
  { id: "pvp", icon: "⚔️", label: "PVP", sub: "Online", color: "#FF2D7B" },
  { id: "ar",  icon: "📷", label: "AR",  sub: "Camera", color: "#00D4FF" },
];

const SECONDARY_MODES = [
  { id: "tournament", icon: "🏆", label: "Tournament", sub: "5-Round Bracket", color: "#A855F7" },
  { id: "ipl", icon: "🏏", label: "IPL Season", sub: "Full Tournament", color: "#FFD700" },
  { id: "worldcup", icon: "🌍", label: "World Cup", sub: "10 Nations", color: "#00D4FF" },
  { id: "ashes", icon: "🏺", label: "The Ashes", sub: "Best of 5", color: "#FF6B35" },
  { id: "knockout", icon: "🥊", label: "Knockout Cup", sub: "8-Team Bracket", color: "#FF2D7B" },
  { id: "auction", icon: "💰", label: "Auction League", sub: "Bid & Battle", color: "#FFD700" },
  { id: "royale", icon: "💀", label: "Cricket Royale", sub: "Battle Royale", color: "#A855F7" },
  { id: "battlepass", icon: "⚔️", label: "Battle Pass", sub: "Season 3", color: "#A855F7" },
  { id: "daily", icon: "📅", label: "Daily Challenge", sub: "New Target Daily", color: "#FF6B35" },
  { id: "practice", icon: "🎯", label: "Practice", sub: "Learn & Improve", color: "#4ADE50" },
];

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */

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
  const xpProgress = ((profile?.xp ?? 0) % 500) / 500 * 100;
  const playerName = profile?.display_name || user?.email?.split("@")[0]?.slice(0, 10) || "Player";
  const arenaProgress = ((currentTrophies - currentArena.trophies) / Math.max(nextArena.trophies - currentArena.trophies, 1)) * 100;
  const chestSlots = Array.from({ length: 4 }, (_, i) => chests?.find(c => c.slot_index === i) || null);
  const winRate = profile && profile.total_matches > 0 ? Math.round((profile.wins / profile.total_matches) * 100) : 0;

  return (
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar game-screen">

      {/* V10 Ambient particles */}
      <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => {
          const size = 1.5 + (i % 4) * 0.8;
          const colors = ["rgba(74,222,80,", "rgba(0,212,255,", "rgba(255,215,0,", "rgba(168,85,247,"];
          const color = colors[i % colors.length];
          return (
            <div
              key={i}
              className="v10-particle"
              style={{
                width: size,
                height: size,
                left: `${(i * 5.3 + 3) % 100}%`,
                bottom: `${-5 - (i % 6) * 3}%`,
                background: `${color}0.4)`,
                boxShadow: `0 0 ${size * 2}px ${color}0.2)`,
                ['--rise-dur' as string]: `${10 + (i % 6) * 2}s`,
                ['--delay' as string]: `${(i * 0.7) % 12}s`,
                ['--drift-x' as string]: `${Math.sin(i * 0.9) * 25}px`,
                ['--sway-amount' as string]: `${6 + (i % 4) * 4}px`,
                ['--sway-dur' as string]: `${4 + (i % 4) * 1.5}s`,
              }}
            />
          );
        })}
      </div>

      {/* ═══ A: V10 IDENTITY BAR ═══ */}
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

      {/* ═══ B: STADIUM PITCH HERO ═══ */}
      <StadiumPitchHero
        arenaName={currentArena.name}
        arenaEmoji={currentArena.emoji}
        trophies={currentTrophies}
        nextArenaName={nextArena.name}
        nextTrophies={nextArena.trophies}
        progress={arenaProgress}
      />

      {/* ═══ C: STATS BAR + BATTLE BUTTON ═══ */}
      <div className="relative z-10 flex flex-col items-center -mt-6 mb-3 px-5">
        {/* Quick stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="scoreboard-metal flex items-center gap-4 px-5 py-2 mb-3"
          style={{ borderRadius: 10 }}
        >
          <StatPill label="W/L" value={`${profile?.wins ?? 0}/${profile?.losses ?? 0}`} color="#4ADE50" />
          <div className="w-px h-4 bg-white/10" />
          <StatPill label="RATE" value={`${winRate}%`} color="#00D4FF" />
          <div className="w-px h-4 bg-white/10" />
          <StatPill label="BEST" value={String(profile?.high_score ?? 0)} color="#FFD700" />
          <div className="w-px h-4 bg-white/10" />
          <StatPill label="STREAK" value={`🔥${profile?.current_streak ?? 0}`} color="#FF6B35" />
        </motion.div>

        {/* V10 BATTLE Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          className="w-full max-w-[320px]"
        >
          <V10Button
            variant="battle"
            size="battle"
            glow
            icon={<span className="text-2xl">⚔️</span>}
            onClick={() => {
              try { SFX.tap(); Haptics.heavy(); } catch {}
              setShowStumpAnim(true);
            }}
            className="w-full"
          >
            BATTLE
          </V10Button>
        </motion.div>
      </div>

      {/* ═══ D: CHEST BANNER ROW ═══ */}
      <div className="relative z-10 flex gap-2 px-4 mb-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/shop")}
          className="flex-1 stadium-glass overflow-hidden !border-l-[3px] !border-l-neon-gold/30"
          style={{ borderRadius: 14, padding: "10px 12px" }}
        >
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ y: [-2, 2, -2], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl"
            >🎁</motion.span>
            <div className="text-left">
              <div className="font-display text-[11px] font-semibold tracking-wide text-neon-gold">FREE CHEST</div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-display text-[13px] text-neon-gold neon-text-gold"
              >OPEN</motion.div>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => handleModeSelect("daily")}
          className="flex-1 stadium-glass overflow-hidden !border-l-[3px] !border-l-neon-cyan/30"
          style={{ borderRadius: 14, padding: "10px 12px" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏏</span>
            <div className="text-left flex-1">
              <div className="font-display text-[11px] font-semibold tracking-wide text-muted-foreground">WICKET CHEST</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-display text-[11px] font-bold text-white">18/25</span>
                <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <div className="h-full rounded-full" style={{
                    width: "72%",
                    background: "linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-green)))",
                    boxShadow: "0 0 6px rgba(0,212,255,0.5)",
                  }} />
                </div>
              </div>
            </div>
          </div>
        </motion.button>
      </div>

      {/* ═══ E: MAIN MODE CARDS ═══ */}
      <div className="relative z-10 flex gap-2 px-4 mb-4">
        {MAIN_MODES.map((mode, idx) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + idx * 0.08 }}
            whileTap={{ scale: 0.93, y: 2 }}
            onClick={() => handleModeSelect(mode.id)}
            className="flex-1 stadium-glass overflow-hidden !border-l-[3px] flex flex-col items-center justify-center gap-1.5"
            style={{
              height: 100,
              borderRadius: 14,
              borderLeftColor: `${mode.color}40`,
            }}
          >
            <motion.div
              animate={
                mode.id === "tap" ? { rotate: [-3, 3, -3] } :
                mode.id === "pvp" ? { scale: [1, 1.1, 1] } :
                { y: [-1, 1, -1] }
              }
              transition={{ duration: mode.id === "pvp" ? 2 : 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl"
              style={{ filter: `drop-shadow(0 0 10px ${mode.color}60)` }}
            >
              {mode.icon}
            </motion.div>
            <div className="text-center">
              <div className="font-display text-sm" style={{ color: mode.color, textShadow: `0 0 10px ${mode.color}40` }}>
                {mode.label}
              </div>
              <div className="font-body text-[9px] text-muted-foreground">{mode.sub}</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ═══ F: V10 CHEST SLOT ROW ═══ */}
      <div className="relative z-10 mx-4 mb-4">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs">🎁</span>
          <span className="font-display text-[10px] tracking-[2px] text-muted-foreground">CHEST SLOTS</span>
        </div>
        <div className="flex justify-center gap-2.5">
          {chestSlots.map((chest, i) => (
            <ChestSlot
              key={i}
              chest={chest}
              onTap={handleChestTap}
              tick={tick}
            />
          ))}
        </div>
      </div>

      {/* ═══ G: SECONDARY MODES ═══ */}
      <div className="relative z-10 px-4 pb-4">
        <div className="font-display text-[11px] font-semibold tracking-[3px] mb-2 px-1 text-muted-foreground">MORE MODES</div>
        <div className="flex flex-col gap-2">
          {SECONDARY_MODES.map((mode, idx) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + idx * 0.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleModeSelect(mode.id)}
              className="w-full flex items-center gap-3 p-3 stadium-glass !border-l-[3px]"
              style={{
                borderRadius: 14,
                borderLeftColor: `${mode.color}60`,
              }}
            >
              <span className="text-2xl w-10 text-center flex-shrink-0" style={{ filter: `drop-shadow(0 0 8px ${mode.color}40)` }}>
                {mode.icon}
              </span>
              <div className="flex-1 text-left">
                <div className="font-display text-[13px] font-bold tracking-wide text-white">{mode.label}</div>
                <div className="font-body text-[10px]" style={{ color: mode.color }}>{mode.sub}</div>
              </div>
              <span className="text-muted-foreground text-sm">→</span>
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

/* ═══════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════ */

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <span className="font-body text-[8px] text-muted-foreground block leading-none">{label}</span>
      <span className="font-display text-[12px] font-bold leading-none tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}

function ChestSlot({ chest, onTap, tick }: { chest: UserChest | null; onTap: (c: UserChest | null) => void; tick: number }) {
  const chestInfo = chest ? CRICKET_CHEST[chest.chest_tier] || CRICKET_CHEST.bronze : null;
  const isReady = chest && (chest.status === "ready" || (chest.status === "unlocking" && chestTimeRemaining(chest) <= 0));
  const isUnlocking = chest?.status === "unlocking" && chestTimeRemaining(chest) > 0;
  const remaining = isUnlocking ? chestTimeRemaining(chest) : 0;
  const totalDur = chest?.unlock_duration_seconds || 1;
  const progressPct = isUnlocking ? Math.max(0, Math.min(100, ((totalDur - remaining) / totalDur) * 100)) : 0;

  if (!chest) {
    return (
      <div className="flex flex-col items-center justify-center stadium-glass !border-l-0 !border-dashed !border-white/5"
        style={{ width: 78, height: 96, borderRadius: 16 }}
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
      className="relative flex flex-col items-center justify-center overflow-hidden stadium-glass !border-l-0"
      style={{
        width: 78,
        height: 96,
        borderRadius: 16,
        borderColor: isReady ? chestInfo?.color : undefined,
        boxShadow: isReady ? `0 0 24px ${chestInfo?.color}40, 0 4px 12px rgba(0,0,0,0.4)` : undefined,
      }}
    >
      {/* Ready state: conic light rays */}
      {isReady && (
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-[14px]"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${chestInfo?.color}15 10%, transparent 20%, ${chestInfo?.color}15 30%, transparent 40%, ${chestInfo?.color}15 50%, transparent 60%, ${chestInfo?.color}15 70%, transparent 80%, ${chestInfo?.color}15 90%, transparent 100%)`,
          }}
        />
      )}

      {/* Unlocking: SVG arc timer */}
      {isUnlocking && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none -rotate-90" viewBox="0 0 78 96">
          <rect x="2" y="2" width="74" height="92" rx="14" ry="14" fill="none"
            stroke={chestInfo?.color || "#475569"}
            strokeWidth="2"
            strokeDasharray={`${progressPct * 3.32} 332`}
            strokeLinecap="round"
            opacity="0.5"
            style={{ filter: `drop-shadow(0 0 4px ${chestInfo?.color}40)` }}
          />
        </svg>
      )}

      {/* Chest icon */}
      <motion.span
        animate={isReady ? { y: [-3, 3, -3], scale: [1, 1.08, 1] } : isUnlocking ? { rotateZ: [-2, 2, -2] } : {}}
        transition={{ duration: isReady ? 1.5 : 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-[28px] relative z-10"
        style={{
          filter: isUnlocking
            ? `brightness(0.5) saturate(0.3) drop-shadow(0 2px 4px rgba(0,0,0,0.5))`
            : isReady
              ? `drop-shadow(0 0 12px ${chestInfo?.color}80)`
              : `drop-shadow(0 2px 6px rgba(0,0,0,0.5))`,
        }}
      >
        {chestInfo?.icon}
      </motion.span>

      {/* Sparkles for ready */}
      {isReady && [0, 1, 2, 3].map(s => (
        <motion.div
          key={s}
          animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.3], y: [-5, -15] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: s * 0.3 }}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            background: s % 2 === 0 ? "#FFD700" : (chestInfo?.color || "#fff"),
            left: `${18 + s * 18}%`,
            top: "25%",
            boxShadow: `0 0 6px ${chestInfo?.color}`,
          }}
        />
      ))}

      {/* Lock icon for unlocking */}
      {isUnlocking && (
        <motion.div
          animate={{ rotateZ: [-5, 5, -5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute top-1.5 right-1.5 z-20"
        >
          <span className="text-[10px]">🔒</span>
        </motion.div>
      )}

      {/* Bottom label */}
      <div className="absolute bottom-0 inset-x-0 py-1 text-center z-10" style={{
        background: "linear-gradient(0deg, rgba(0,0,0,0.7), transparent)",
        borderRadius: "0 0 14px 14px",
      }}>
        <span className="text-[8px] font-bold block font-display" style={{
          color: isReady ? "#FFD700" : isUnlocking ? (chestInfo?.color || "#475569") : "#94A3B8",
          textShadow: isReady ? "0 0 8px rgba(255,215,0,0.5)" : "none",
        }}>
          {isReady ? "OPEN!" : isUnlocking ? formatTime(remaining) : chestInfo?.label}
        </span>
      </div>
    </motion.button>
  );
}
