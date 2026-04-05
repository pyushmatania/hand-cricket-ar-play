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
import gullyIsland from "@/assets/islands/gully-grounds.png";
import schoolIsland from "@/assets/islands/school-ground.png";
import districtIsland from "@/assets/islands/district-stadium.png";
import ranjiIsland from "@/assets/islands/ranji-trophy.png";
import iplIsland from "@/assets/islands/ipl-stadium.png";
import internationalIsland from "@/assets/islands/international.png";
import worldCupIsland from "@/assets/islands/world-cup.png";

const ISLAND_IMAGES: Record<string, string> = {
  "Gully Grounds": gullyIsland,
  "School Ground": schoolIsland,
  "Rooftop": schoolIsland,
  "Beach Cricket": gullyIsland,
  "Village Maidan": districtIsland,
  "District Stadium": districtIsland,
  "Ranji Trophy": ranjiIsland,
  "IPL Stadium": iplIsland,
  "International": internationalIsland,
  "World Cup": worldCupIsland,
};
const getIslandImage = (name: string) => ISLAND_IMAGES[name] || gullyIsland;

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
}

const ARENA_LEVELS = [
  { name: "Gully Grounds", trophies: 0, unlock: "Free", emoji: "🏏", accent: "#00FF88" },
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
  { id: "tap", icon: "⚡", label: "TAP", sub: "Quick Play", color: "#00FF88", border: "rgba(0,255,136,0.3)" },
  { id: "pvp", icon: "⚔️", label: "PVP", sub: "Online Battle", color: "#FF2D7B", border: "rgba(255,45,123,0.3)" },
  { id: "ar",  icon: "📷", label: "AR",  sub: "Camera Mode", color: "#00D4FF", border: "rgba(0,212,255,0.3)" },
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
  { id: "practice", icon: "🎯", label: "Practice", sub: "Learn & Improve", color: "#00FF88" },
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
  const [currentArenaIdx, setCurrentArenaIdx] = useState(0);
  const arenaScrollRef = useRef<HTMLDivElement>(null);

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
  const playerName = profile?.display_name || user?.email?.split("@")[0]?.slice(0, 10) || "Player";
  const arenaProgress = ((currentTrophies - currentArena.trophies) / Math.max(nextArena.trophies - currentArena.trophies, 1)) * 100;
  const chestSlots = Array.from({ length: 4 }, (_, i) => chests?.find(c => c.slot_index === i) || null);
  const winRate = profile && profile.total_matches > 0 ? Math.round((profile.wins / profile.total_matches) * 100) : 0;

  return (
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar v7-bg" style={{ background: "#070B1A" }}>

      {/* V7 Vignette */}
      <div className="v7-vignette" />

      {/* Ambient particles — CSS-only, GPU accelerated */}
      <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
        {Array.from({ length: 28 }).map((_, i) => {
          const size = 1.5 + (i % 5) * 0.8;
          const colors = ["rgba(0,255,136,", "rgba(0,212,255,", "rgba(255,215,0,", "rgba(168,85,247,"];
          const color = colors[i % colors.length];
          return (
            <div
              key={i}
              className="v7-particle"
              style={{
                width: size,
                height: size,
                left: `${(i * 3.7 + 5) % 100}%`,
                bottom: `${-5 - (i % 8) * 3}%`,
                background: `${color}${0.4 + (i % 3) * 0.15})`,
                boxShadow: `0 0 ${size * 2}px ${color}0.2)`,
                ['--rise-dur' as string]: `${8 + (i % 7) * 2}s`,
                ['--delay' as string]: `${(i * 0.6) % 10}s`,
                ['--drift-x' as string]: `${Math.sin(i * 0.8) * 30}px`,
                ['--sway-amount' as string]: `${8 + (i % 4) * 5}px`,
                ['--sway-dur' as string]: `${4 + (i % 5) * 1.5}s`,
              }}
            />
          );
        })}
      </div>

      {/* ═══ A: TOP BAR — Neon Glass Scoreboard ═══ */}
      <div className="relative z-20 neon-glass" style={{
        borderRadius: 0,
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "1px solid rgba(0,212,255,0.1)",
        padding: "max(env(safe-area-inset-top, 8px), 8px) 12px 10px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        background: "linear-gradient(180deg, rgba(10,14,39,0.95), rgba(17,22,51,0.9))",
      }}>
        <div className="flex items-center gap-2 relative">
          {/* Avatar — Hex-style frame with neon glow */}
          <button onClick={() => navigate(user ? "/profile" : "/auth")} className="relative flex-shrink-0 active:scale-95 transition-transform">
            <div className="relative">
              <div className="w-12 h-12 rounded-[28%] flex items-center justify-center" style={{
                background: "linear-gradient(135deg, #111633, #0A0E27)",
                border: "2.5px solid transparent",
                backgroundClip: "padding-box",
                boxShadow: "0 0 15px rgba(var(--team-primary-rgb),0.25), 0 4px 12px rgba(0,0,0,0.5)",
              }}>
                {/* Gradient border ring */}
                <div className="absolute inset-[-3px] rounded-[28%]" style={{
                  background: `linear-gradient(135deg, hsl(var(--neon-green)), hsl(var(--neon-cyan)))`,
                  zIndex: -1,
                  borderRadius: "28%",
                }} />
                <span className="text-lg font-bold text-white">{playerName[0]?.toUpperCase()}</span>
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{
                background: "linear-gradient(180deg, #0A0E27, #070B1A)",
                border: "2px solid hsl(var(--neon-green))",
                boxShadow: "0 0 8px rgba(0,255,136,0.3)",
              }}>
                <span className="font-game-title text-[7px] font-bold text-white leading-none">{playerLevel}</span>
              </div>
              {/* XP arc */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                <circle cx="24" cy="24" r="21" fill="none" stroke="hsl(153,100%,50%)" strokeWidth="2"
                  strokeDasharray={`${((profile?.xp ?? 0) % 500) / 500 * 132} 132`}
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 4px rgba(0,255,136,0.5))" }}
                />
              </svg>
            </div>
          </button>

          {/* Name + clan + trophies */}
          <div className="flex flex-col gap-0.5">
            <span className="font-game-title text-[13px] font-bold tracking-wide text-white leading-none">{playerName}</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px]">🏆</span>
              <span className="font-game-title text-[11px] font-semibold leading-none neon-text-gold" style={{ color: "#FFD700" }}>
                {currentTrophies}
              </span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Currency chips — scoreboard metal */}
          <div className="flex items-center gap-1.5">
            <CurrencyChip icon="🪙" value={profile?.coins ?? 0} onClick={() => navigate("/shop")} />
            <CurrencyChip icon="💎" value={45} onClick={() => navigate("/shop")} />
          </div>

          {/* Settings */}
          <button onClick={() => navigate("/settings")} className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform" style={{
            background: "rgba(17,22,51,0.8)",
            border: "1px solid rgba(148,163,184,0.12)",
          }}>
            <span className="text-sm opacity-60">⚙️</span>
          </button>
          {/* Bell */}
          <button onClick={() => navigate("/notifications")} className="relative w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform" style={{
            background: "rgba(17,22,51,0.8)",
            border: "1px solid rgba(148,163,184,0.12)",
          }}>
            <span className="text-sm opacity-70">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{
                background: "#FF2D7B",
                border: "2px solid #070B1A",
                boxShadow: "0 0 6px rgba(255,45,123,0.5)",
              }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* ═══ B: CHEST BANNER ROW ═══ */}
      <div className="relative z-10 flex gap-2 px-3 mt-3 v7-section-anim" style={{ animationDelay: "0.1s" }}>
        {/* Free Chest */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/shop")}
          className="flex-1 relative overflow-hidden neon-glass"
          style={{
            borderRadius: 14,
            padding: "10px 12px",
            borderColor: "rgba(255,215,0,0.15)",
          }}
        >
          {/* Orange glow overlay */}
          <div className="absolute inset-0 rounded-[14px] pointer-events-none" style={{
            background: "linear-gradient(135deg, rgba(255,165,0,0.08) 0%, transparent 60%)",
          }} />
          {/* Golden pulse border */}
          <motion.div
            animate={{ boxShadow: ["0 0 0 0 rgba(255,215,0,0)", "0 0 0 3px rgba(255,215,0,0.12)", "0 0 0 0 rgba(255,215,0,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-[14px] pointer-events-none"
          />
          <div className="flex items-center gap-2 relative z-10">
            <motion.span
              animate={{ y: [-2, 2, -2], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl"
            >🎁</motion.span>
            <div className="text-left">
              <div className="font-game-title text-[11px] font-semibold tracking-wide" style={{ color: "#FFD700" }}>FREE CHEST</div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-display text-[13px] neon-text-gold"
                style={{ color: "#FFD700" }}
              >OPEN</motion.div>
            </div>
          </div>
        </motion.button>

        {/* Wicket Chest */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => handleModeSelect("daily")}
          className="flex-1 relative overflow-hidden neon-glass"
          style={{ borderRadius: 14, padding: "10px 12px", borderColor: "rgba(0,212,255,0.12)" }}
        >
          <div className="absolute inset-0 rounded-[14px] pointer-events-none" style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.06) 0%, transparent 60%)",
          }} />
          <div className="flex items-center gap-2 relative z-10">
            <span className="text-2xl">🏏</span>
            <div className="text-left flex-1">
              <div className="font-game-title text-[11px] font-semibold tracking-wide" style={{ color: "#94A3B8" }}>WICKET CHEST</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-game-title text-[11px] font-bold text-white">18/25</span>
                <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <div className="h-full rounded-full" style={{
                    width: "72%",
                    background: "linear-gradient(90deg, #00D4FF, #00FF88)",
                    boxShadow: "0 0 6px rgba(0,212,255,0.5)",
                  }} />
                </div>
              </div>
            </div>
          </div>
        </motion.button>
      </div>

      {/* ═══ C: 3D FLOATING ISLAND ═══ */}
      <div className="relative z-10 mt-3 v7-section-anim" style={{ animationDelay: "0.2s" }}>
        {/* Arena title with shimmer */}
        <div className="text-center mb-1">
          <motion.span
            className="font-display text-sm tracking-wider inline-block relative uppercase"
            style={{ color: "#FFD700", textShadow: "0 0 10px rgba(255,215,0,0.4), 0 0 30px rgba(255,215,0,0.15)" }}
          >
            {ARENA_LEVELS[currentArenaIdx].name}
            <motion.div
              animate={{ left: ["-100%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute top-0 h-full w-1/3 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
            />
          </motion.span>
          {/* Swipe dots */}
          <div className="flex justify-center gap-1 mt-1">
            {ARENA_LEVELS.slice(0, 5).map((_, i) => (
              <div key={i} className="rounded-full transition-all" style={{
                width: i === currentArenaIdx ? 14 : 4,
                height: 4,
                background: i === currentArenaIdx ? "#00FF88" : "rgba(255,255,255,0.12)",
                boxShadow: i === currentArenaIdx ? "0 0 8px rgba(0,255,136,0.4)" : "none",
              }} />
            ))}
          </div>
        </div>

        {/* Swipeable arena */}
        <div
          ref={arenaScrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-8"
          onScroll={(e) => {
            const el = e.currentTarget;
            const idx = Math.round(el.scrollLeft / el.clientWidth);
            setCurrentArenaIdx(Math.min(idx, ARENA_LEVELS.length - 1));
          }}
        >
          {ARENA_LEVELS.map((arena, idx) => {
            const unlocked = currentTrophies >= arena.trophies;
            return (
              <div key={arena.name} className="snap-center flex-shrink-0 w-full flex justify-center">
                <div className="relative" style={{ width: 300, height: 280 }}>
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    {/* Shadow below island */}
                    <motion.div
                      animate={{ scale: [1, 0.85, 1], opacity: [0.3, 0.12, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                      style={{
                        width: 180,
                        height: 24,
                        borderRadius: "50%",
                        background: "radial-gradient(ellipse, rgba(0,255,136,0.15), transparent 70%)",
                        filter: "blur(8px)",
                      }}
                    />

                    {/* Island image */}
                    <img
                      src={getIslandImage(arena.name)}
                      alt={arena.name}
                      className="w-[300px] h-[240px] object-contain relative z-10 mx-auto"
                      width={640}
                      height={640}
                      style={{
                        filter: unlocked ? "none" : "grayscale(85%) brightness(0.35)",
                        transition: "filter 0.3s",
                      }}
                    />

                    {/* Lock overlay */}
                    {!unlocked && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                        <span className="text-4xl">🔒</span>
                        <span className="font-v7-body text-[10px] text-[#475569] mt-1">{arena.unlock}</span>
                      </div>
                    )}
                  </motion.div>

                  {/* Stats overlay */}
                  {unlocked && idx === currentArenaIdx && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 flex gap-4 px-5 py-2 rounded-xl neon-glass" style={{
                      borderRadius: 12,
                      background: "rgba(10,14,39,0.8)",
                      backdropFilter: "blur(12px)",
                    }}>
                      <StatCell value={profile?.total_matches ?? 0} label="MATCHES" />
                      <div className="w-px" style={{ background: "rgba(148,163,184,0.12)" }} />
                      <StatCell value={profile?.wins ?? 0} label="WINS" />
                      <div className="w-px" style={{ background: "rgba(148,163,184,0.12)" }} />
                      <StatCell value={`${winRate}%`} label="WIN RATE" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ D: V8 BATTLE BUTTON — Supercell-style ═══ */}
      <div className="relative z-10 flex flex-col items-center -mt-1 mb-4 v7-section-anim" style={{ animationDelay: "0.3s" }}>
        {/* Stats bar above button */}
        <div className="flex items-center gap-3 mb-2 px-4">
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: "#94A3B8" }}>W/L</span>
            <span className="font-game-title text-[11px] font-bold" style={{ color: "#00FF88" }}>{profile?.wins ?? 0}</span>
            <span className="text-[9px]" style={{ color: "#475569" }}>/</span>
            <span className="font-game-title text-[11px] font-bold" style={{ color: "#FF2D7B" }}>{profile?.losses ?? 0}</span>
          </div>
          <div className="w-px h-3" style={{ background: "rgba(148,163,184,0.15)" }} />
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: "#94A3B8" }}>STREAK</span>
            <span className="font-game-title text-[11px] font-bold" style={{ color: "#FFD700" }}>🔥{profile?.current_streak ?? 0}</span>
          </div>
          <div className="w-px h-3" style={{ background: "rgba(148,163,184,0.15)" }} />
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: "#94A3B8" }}>BEST</span>
            <span className="font-game-title text-[11px] font-bold text-white">{profile?.high_score ?? 0}</span>
          </div>
        </div>

        <motion.button
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          whileTap={{ scale: 0.94, y: 4 }}
          onClick={() => {
            try { SFX.tap(); Haptics.heavy(); } catch {}
            setShowStumpAnim(true);
          }}
          className="relative overflow-hidden group"
          style={{
            width: 280,
            height: 68,
            borderRadius: 20,
            background: "linear-gradient(180deg, #22FF99 0%, #00E676 30%, #00CC6A 70%, #00A854 100%)",
            border: "none",
            borderBottom: "6px solid #006633",
            boxShadow: `
              0 6px 0 #005528,
              0 10px 30px rgba(0,255,136,0.35),
              0 0 60px rgba(0,255,136,0.15),
              inset 0 2px 0 rgba(255,255,255,0.35),
              inset 0 -2px 4px rgba(0,0,0,0.15)
            `,
            cursor: "pointer",
          }}
        >
          {/* Inner highlight bar */}
          <div className="absolute top-[3px] left-[8%] right-[8%] h-[6px] rounded-full" style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          }} />

          {/* Sparkle particles */}
          {[0, 1, 2, 3, 4].map(s => (
            <motion.div
              key={s}
              animate={{
                y: [-10, -30],
                x: [0, (s - 2) * 8],
                opacity: [0, 1, 0],
                scale: [0.3, 1, 0.3],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: s * 0.3, ease: "easeOut" }}
              className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
              style={{
                background: "#FFD700",
                left: `${20 + s * 15}%`,
                top: "20%",
                boxShadow: "0 0 6px #FFD700, 0 0 12px rgba(255,215,0,0.3)",
              }}
            />
          ))}

          {/* Shimmer sweep */}
          <motion.div
            animate={{ left: ["-40%", "140%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
            className="absolute top-0 h-full w-1/4 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", transform: "skewX(-15deg)" }}
          />

          {/* Button text */}
          <div className="relative z-10 flex items-center justify-center h-full gap-2">
            <span className="text-2xl">⚔️</span>
            <span className="font-display text-[24px] tracking-[5px]" style={{
              color: "#0A0E27",
              textShadow: "0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.1)",
            }}>
              BATTLE
            </span>
          </div>

          {/* Bottom edge reflection */}
          <div className="absolute bottom-0 left-[10%] right-[10%] h-[2px] rounded-full" style={{
            background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.6), transparent)",
          }} />
        </motion.button>
      </div>

      {/* ═══ E: MAIN MODE CARDS ═══ */}
      <div className="relative z-10 flex gap-2 px-3 mb-4 v7-section-anim" style={{ animationDelay: "0.35s" }}>
        {MAIN_MODES.map((mode) => (
          <motion.button
            key={mode.id}
            whileTap={{ scale: 0.93, y: 2 }}
            onClick={() => handleModeSelect(mode.id)}
            className="flex-1 relative overflow-hidden neon-glass"
            style={{
              height: 110,
              borderRadius: 14,
              borderColor: mode.border,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {/* Team-color accent left stripe */}
            <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ background: mode.color, boxShadow: `0 0 8px ${mode.color}40` }} />

            {/* Icon */}
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
              <div className="font-display text-base" style={{ color: mode.color, textShadow: `0 0 10px ${mode.color}40` }}>
                {mode.label}
              </div>
              <div className="font-v7-body text-[9px]" style={{ color: "#94A3B8" }}>{mode.sub}</div>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full" style={{ background: mode.color, opacity: 0.2 }} />
          </motion.button>
        ))}
      </div>

      {/* ═══ F: ARENA PROGRESS BAR ═══ */}
      <div className="relative z-10 mx-3 mb-3 p-3 rounded-xl neon-glass v7-section-anim" style={{ borderRadius: 14, animationDelay: "0.4s" }}>
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-game-title text-[11px] font-semibold tracking-wide text-white">
            🏏 {currentArena.name}
          </span>
          <span className="font-v7-body text-[9px]" style={{ color: "#475569" }}>
            → {nextArena.name}
          </span>
        </div>
        {/* Pitch-turf progress bar */}
        <div className="relative h-2 rounded overflow-hidden" style={{
          background: "rgba(0,0,0,0.4)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
        }}>
          {[25, 50, 75].map(p => (
            <div key={p} className="absolute top-0 bottom-0 w-px" style={{ left: `${p}%`, background: "rgba(148,163,184,0.1)" }} />
          ))}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(arenaProgress, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded"
            style={{
              background: "linear-gradient(90deg, #00FF88, #00CC6A)",
              boxShadow: "0 0 10px rgba(0,255,136,0.4)",
            }}
          />
        </div>
        <div className="text-center mt-1">
          <span className="font-game-title text-[10px] font-semibold" style={{ color: "#FFD700" }}>
            🏆 {currentTrophies}/{nextArena.trophies}
          </span>
        </div>
      </div>

      {/* ═══ G: V8 CHEST SLOT ROW ═══ */}
      <div className="relative z-10 mx-3 mb-4 v7-section-anim" style={{ animationDelay: "0.45s" }}>
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs">🎁</span>
          <span className="font-game-title text-[10px] tracking-[2px]" style={{ color: "#94A3B8" }}>CHEST SLOTS</span>
        </div>
        <div className="flex justify-center gap-2.5">
          {chestSlots.map((chest, i) => {
            const chestInfo = chest ? CRICKET_CHEST[chest.chest_tier] || CRICKET_CHEST.bronze : null;
            const isReady = chest && (chest.status === "ready" || (chest.status === "unlocking" && chestTimeRemaining(chest) <= 0));
            const isUnlocking = chest?.status === "unlocking" && chestTimeRemaining(chest) > 0;
            const remaining = isUnlocking ? chestTimeRemaining(chest) : 0;
            const totalDur = chest?.unlock_duration_seconds || 1;
            const progressPct = isUnlocking ? Math.max(0, Math.min(100, ((totalDur - remaining) / totalDur) * 100)) : 0;

            // Empty slot
            if (!chest) {
              return (
                <div key={i} className="flex flex-col items-center justify-center" style={{
                  width: 78,
                  height: 96,
                  borderRadius: 16,
                  background: "linear-gradient(180deg, rgba(17,22,51,0.5), rgba(10,14,39,0.6))",
                  border: "2px dashed rgba(148,163,184,0.08)",
                }}>
                  <span className="text-lg" style={{ color: "rgba(148,163,184,0.12)" }}>+</span>
                  <span className="text-[7px] mt-0.5" style={{ color: "rgba(148,163,184,0.15)", fontFamily: "Rajdhani, sans-serif" }}>EMPTY</span>
                </div>
              );
            }

            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9, y: 2 }}
                onClick={() => handleChestTap(chest)}
                className="relative flex flex-col items-center justify-center overflow-hidden"
                style={{
                  width: 78,
                  height: 96,
                  borderRadius: 16,
                  background: "linear-gradient(180deg, #111633 0%, #0A0E27 100%)",
                  border: isReady
                    ? `2px solid ${chestInfo?.color}`
                    : "1.5px solid rgba(148,163,184,0.1)",
                  boxShadow: isReady
                    ? `0 0 24px ${chestInfo?.color}40, 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`
                    : "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
                  cursor: "pointer",
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
                  <span className="text-[8px] font-bold block" style={{
                    fontFamily: "Rajdhani, sans-serif",
                    fontWeight: 700,
                    color: isReady ? "#FFD700" : isUnlocking ? (chestInfo?.color || "#475569") : "#94A3B8",
                    textShadow: isReady ? "0 0 8px rgba(255,215,0,0.5)" : "none",
                  }}>
                    {isReady ? "OPEN!" : isUnlocking ? formatTime(remaining) : chestInfo?.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>



      {/* ═══ H: SECONDARY MODES ═══ */}
      <div className="relative z-10 px-3 pb-4 v7-section-anim" style={{ animationDelay: "0.5s" }}>
        <div className="font-game-title text-[11px] font-semibold tracking-[3px] mb-2 px-1" style={{ color: "#475569" }}>MORE MODES</div>
        <div className="flex flex-col gap-2">
          {SECONDARY_MODES.map((mode) => (
            <motion.button
              key={mode.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleModeSelect(mode.id)}
              className="w-full flex items-center gap-3 p-3 relative overflow-hidden neon-glass"
              style={{
                borderRadius: 14,
                borderLeft: `3px solid ${mode.color}`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              <span className="text-2xl w-10 text-center flex-shrink-0" style={{ filter: `drop-shadow(0 0 8px ${mode.color}40)` }}>
                {mode.icon}
              </span>
              <div className="flex-1 text-left">
                <div className="font-game-title text-[13px] font-bold tracking-wide text-white">{mode.label}</div>
                <div className="font-v7-body text-[10px]" style={{ color: mode.color }}>{mode.sub}</div>
              </div>
              <span style={{ color: "#475569" }} className="text-sm">→</span>
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

function StatCell({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-sm text-white leading-none">{value}</div>
      <div className="font-v7-body text-[7px] mt-0.5" style={{ color: "#475569" }}>{label}</div>
    </div>
  );
}

function CurrencyChip({ icon, value, onClick }: { icon: string; value: number; onClick?: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg scoreboard-metal"
      style={{ borderRadius: 10 }}
    >
      <motion.span
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="text-xs inline-block"
      >{icon}</motion.span>
      <span className="font-game-title text-[11px] font-bold text-white leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
      </span>
      <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold" style={{
        background: "linear-gradient(180deg, #00FF88, #00CC6A)",
        color: "#0A0E27",
        boxShadow: "0 2px 0 #006633, 0 0 6px rgba(0,255,136,0.3)",
      }}>+</span>
    </motion.button>
  );
}
