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
import gullyIsland from "@/assets/gully-island.png";

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
  { name: "Gully Grounds", trophies: 0, unlock: "Free", emoji: "🏏" },
  { name: "School Ground", trophies: 100, unlock: "Level 3", emoji: "🏫" },
  { name: "Rooftop", trophies: 200, unlock: "Level 5", emoji: "🏢" },
  { name: "Beach Cricket", trophies: 300, unlock: "Level 7", emoji: "🏖️" },
  { name: "Village Maidan", trophies: 500, unlock: "Level 10", emoji: "🌳" },
  { name: "District Stadium", trophies: 800, unlock: "Level 15", emoji: "🏟️" },
  { name: "IPL Stadium", trophies: 1500, unlock: "Level 22", emoji: "✨" },
  { name: "International", trophies: 3000, unlock: "Level 25", emoji: "🌍" },
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
  bronze:  { icon: "🎾", label: "Tennis Ball", color: "hsl(35 80% 55%)" },
  silver:  { icon: "🏏", label: "Red Ball",    color: "hsl(0 65% 50%)" },
  gold:    { icon: "🏆", label: "Trophy",      color: "hsl(43 100% 55%)" },
  diamond: { icon: "💎", label: "Crystal Bat",  color: "hsl(200 80% 65%)" },
};

const MAIN_MODES = [
  { id: "tap", icon: "⚡", label: "TAP", sub: "Quick Play", accent: "hsl(134 61% 58%)", border: "rgba(74,222,80,0.3)", dark: "#1A5E1A" },
  { id: "pvp", icon: "⚔️", label: "PVP", sub: "Online Battle", accent: "hsl(0 84% 60%)", border: "rgba(239,68,68,0.3)", dark: "#991B1B" },
  { id: "ar",  icon: "📷", label: "AR",  sub: "Camera Mode", accent: "hsl(192 91% 60%)", border: "rgba(6,182,212,0.3)", dark: "#0E7490" },
];

const SECONDARY_MODES = [
  { id: "tournament", icon: "🏆", label: "Tournament", sub: "5-Round Bracket", accent: "hsl(258 90% 66%)" },
  { id: "ipl", icon: "🏏", label: "IPL Season", sub: "Full Tournament", accent: "hsl(43 93% 50%)" },
  { id: "worldcup", icon: "🌍", label: "World Cup", sub: "10 Nations", accent: "hsl(217 80% 55%)" },
  { id: "ashes", icon: "🏺", label: "The Ashes", sub: "Best of 5", accent: "hsl(35 70% 50%)" },
  { id: "knockout", icon: "🥊", label: "Knockout Cup", sub: "8-Team Bracket", accent: "hsl(0 70% 55%)" },
  { id: "auction", icon: "💰", label: "Auction League", sub: "Bid & Battle", accent: "hsl(43 85% 50%)" },
  { id: "royale", icon: "💀", label: "Cricket Royale", sub: "Battle Royale", accent: "hsl(280 70% 55%)" },
  { id: "battlepass", icon: "⚔️", label: "Battle Pass", sub: "Season 3", accent: "hsl(258 80% 60%)" },
  { id: "daily", icon: "📅", label: "Daily Challenge", sub: "New Target Daily", accent: "hsl(25 80% 55%)" },
  { id: "practice", icon: "🎯", label: "Practice", sub: "Learn & Improve", accent: "hsl(134 71% 45%)" },
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
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar" style={{ background: "#080818" }}>

      {/* ═══ BACKGROUND TEXTURE ═══ */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse at 50% 30%, rgba(74,222,80,0.03) 0%, transparent 60%),
          repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.006) 20px, rgba(255,255,255,0.006) 21px),
          linear-gradient(180deg, #0a0f1a 0%, #0F172A 30%, #0F172A 70%, #080818 100%)
        `,
      }} />

      {/* ═══ A: PLAYER BAR — Scoreboard Style ═══ */}
      <div className="relative z-20" style={{
        background: "linear-gradient(180deg, #0F172A, #1E293B)",
        borderBottom: "2px solid transparent",
        borderImage: "linear-gradient(90deg, #475569, #94A3B8, #475569) 1",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        padding: "max(env(safe-area-inset-top, 8px), 8px) 12px 8px",
      }}>
        {/* Leather stitch overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 9px)`,
        }} />

        <div className="flex items-center gap-2 relative">
          {/* Avatar frame */}
          <button onClick={() => navigate(user ? "/profile" : "/auth")} className="relative flex-shrink-0 active:scale-95 transition-transform">
            <div className="relative">
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{
                background: "linear-gradient(135deg, #1E293B, #0F172A)",
                border: "2.5px solid #64748B",
                boxShadow: "0 0 12px rgba(74,222,80,0.15), 0 3px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}>
                <span className="text-lg font-bold" style={{ color: "hsl(var(--green-play))" }}>
                  {playerName[0]?.toUpperCase()}
                </span>
                {/* Engraved bat icons at 3 & 9 o'clock */}
                <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 text-[5px] opacity-30">🏏</span>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-0.5 text-[5px] opacity-30">🏏</span>
              </div>
              {/* Level shield */}
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full" style={{
                background: "linear-gradient(180deg, hsl(var(--blue-info)), hsl(var(--blue-info-dark)))",
                border: "2px solid #0F172A",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}>
                <span className="font-game-display text-[7px] text-white leading-none">{playerLevel}</span>
              </div>
              {/* XP arc */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                <circle cx="22" cy="22" r="19" fill="none" stroke="hsl(134,61%,58%)" strokeWidth="2"
                  strokeDasharray={`${((profile?.xp ?? 0) % 500) / 500 * 119.4} 119.4`}
                  strokeLinecap="round" />
              </svg>
            </div>
          </button>

          {/* Name */}
          <div className="flex flex-col gap-0.5">
            <span className="font-game-display text-[11px] tracking-wider text-foreground leading-none">{playerName}</span>
            <span className="text-[8px] text-muted-foreground font-game-body">Level {playerLevel}</span>
          </div>

          <div className="flex-1" />

          {/* Currency scoreboard digits */}
          <div className="flex items-center gap-1.5">
            <ScoreboardPill icon="🪙" value={profile?.coins ?? 0} plus onClick={() => navigate("/shop")} />
            <ScoreboardPill icon="💎" value={45} plus onClick={() => navigate("/shop")} />
          </div>

          {/* Bell + Settings */}
          <button onClick={() => navigate("/notifications")} className="relative w-9 h-9 rounded-lg flex items-center justify-center" style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}>
            <span className="text-sm" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{
                background: "hsl(var(--red-hot))",
                border: "1.5px solid #0F172A",
              }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>
          <button onClick={() => navigate("/settings")} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span className="text-sm opacity-60" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>⚙️</span>
          </button>
        </div>
      </div>

      {/* ═══ B: PROMO BANNERS ═══ */}
      <div className="relative z-10 flex gap-2 px-3 mt-3">
        {/* Free Chest */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/shop")}
          className="flex-1 relative overflow-hidden rounded-xl"
          style={{
            background: "linear-gradient(145deg, #1E293B, #0F172A)",
            border: "2px solid rgba(255,215,0,0.2)",
            borderBottom: "4px solid rgba(0,0,0,0.3)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
            padding: "10px 12px",
          }}
        >
          {/* Leather strap */}
          <div className="absolute top-0 left-3 right-3 h-[6px] rounded-b-sm" style={{
            background: "linear-gradient(90deg, #8B6914, #A07820, #8B6914)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }} />
          <div className="flex items-center gap-2 mt-1">
            <motion.span
              animate={{ y: [-2, 2, -2], rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl"
            >🎒</motion.span>
            <div className="text-left">
              <div className="font-game-title text-[11px] tracking-wide" style={{ color: "hsl(var(--gold-accent))" }}>FREE CHEST</div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-game-body text-[9px] text-muted-foreground"
              >OPEN NOW!</motion.div>
            </div>
          </div>
          {/* Glow ring */}
          <motion.div
            animate={{ boxShadow: ["0 0 0 0 rgba(255,215,0,0)", "0 0 0 4px rgba(255,215,0,0.15)", "0 0 0 0 rgba(255,215,0,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-xl pointer-events-none"
          />
        </motion.button>

        {/* Daily Challenge */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => handleModeSelect("daily")}
          className="flex-1 relative overflow-hidden rounded-xl"
          style={{
            background: "linear-gradient(145deg, #1E293B, #0F172A)",
            border: "2px solid rgba(59,130,246,0.15)",
            borderBottom: "4px solid rgba(0,0,0,0.3)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
            padding: "10px 12px",
          }}
        >
          <div className="absolute top-0 left-3 right-3 h-[6px] rounded-b-sm" style={{
            background: "linear-gradient(90deg, #1E3A5F, #2563EB, #1E3A5F)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }} />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl">📅</span>
            <div className="text-left">
              <div className="font-game-title text-[11px] tracking-wide" style={{ color: "hsl(var(--blue-info))" }}>DAILY CHALLENGE</div>
              <div className="font-game-body text-[9px] text-muted-foreground">New target today</div>
            </div>
          </div>
        </motion.button>
      </div>

      {/* ═══ C: 3D GULLY CRICKET ISLAND ═══ */}
      <div className="relative z-10 mt-4">
        {/* Arena title with shimmer */}
        <div className="text-center mb-2">
          <motion.span
            className="font-game-title text-sm tracking-widest inline-block relative"
            style={{ color: "hsl(var(--gold-accent))", textShadow: "0 2px 8px rgba(234,179,8,0.3)" }}
          >
            ⭐ {ARENA_LEVELS[currentArenaIdx].name.toUpperCase()} ⭐
            <motion.div
              animate={{ left: ["-100%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute top-0 h-full w-1/3 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
            />
          </motion.span>
          {/* Swipe dots */}
          <div className="flex justify-center gap-1 mt-1">
            {ARENA_LEVELS.slice(0, 5).map((_, i) => (
              <div key={i} className="rounded-full transition-all" style={{
                width: i === currentArenaIdx ? 12 : 4,
                height: 4,
                background: i === currentArenaIdx ? "hsl(var(--gold-accent))" : "rgba(255,255,255,0.15)",
              }} />
            ))}
          </div>
        </div>

        {/* Swipeable arena container */}
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
                <div className="relative" style={{ width: 280, height: 300 }}>
                  {/* Island floating bob */}
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    {/* Shadow below island */}
                    <motion.div
                      animate={{ scale: [1, 0.9, 1], opacity: [0.3, 0.15, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2"
                      style={{
                        width: 160,
                        height: 20,
                        borderRadius: "50%",
                        background: "radial-gradient(ellipse, rgba(0,0,0,0.4), transparent)",
                        filter: "blur(6px)",
                      }}
                    />

                    {/* Island image */}
                    <img
                      src={gullyIsland}
                      alt={arena.name}
                      className="w-[280px] h-[240px] object-contain relative z-10 mx-auto"
                      style={{
                        filter: unlocked ? "none" : "grayscale(80%) brightness(0.4)",
                        transition: "filter 0.3s",
                      }}
                    />

                    {/* Lock overlay for locked arenas */}
                    {!unlocked && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                        <span className="text-4xl">🔒</span>
                        <span className="font-game-body text-[10px] text-muted-foreground mt-1">{arena.unlock}</span>
                      </div>
                    )}

                    {/* Character on the island (only on unlocked/current) */}
                    {unlocked && idx === currentArenaIdx && (
                      <motion.div
                        animate={{ rotateY: [-3, 3, -3] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute z-20"
                        style={{ bottom: "38%", left: "50%", transform: "translateX(-50%)", fontSize: 48 }}
                      >
                        🏏
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Stats overlay - frosted strip */}
                  {unlocked && idx === currentArenaIdx && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-4 px-4 py-2 rounded-xl" style={{
                      background: "rgba(15,23,42,0.75)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                    }}>
                      <StatCell value={profile?.total_matches ?? 0} label="MATCHES" />
                      <div className="w-px bg-white/10" />
                      <StatCell value={profile?.wins ?? 0} label="WINS" />
                      <div className="w-px bg-white/10" />
                      <StatCell value={`${winRate}%`} label="WIN RATE" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ D: PLAY BUTTON ═══ */}
      <div className="relative z-10 flex justify-center -mt-2 mb-4">
        <motion.button
          animate={{ scale: [1, 1.012, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          whileTap={{ scale: 0.95, y: 4 }}
          onClick={() => {
            try { SFX.tap(); Haptics.heavy(); } catch {}
            setShowStumpAnim(true);
          }}
          className="relative overflow-hidden"
          style={{
            width: 240,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(180deg, #6AFF6A, #4ADE50, #2D8B2D)",
            border: "3px solid #1A5E1A",
            borderBottom: "8px solid #14532D",
            boxShadow: "0 8px 0 rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.25)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Shimmer sweep */}
          <motion.div
            animate={{ left: ["-60%", "160%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
            className="absolute top-0 h-full w-1/3 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
          />
          <span className="relative z-10 font-game-title text-xl tracking-[4px] text-white" style={{
            textShadow: "0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(74,222,80,0.3)",
          }}>
            ▶ PLAY
          </span>
        </motion.button>
      </div>

      {/* ═══ E: MAIN MODE SELECTOR — 3 Cricket Equipment Cards ═══ */}
      <div className="relative z-10 flex gap-2 px-3 mb-4">
        {MAIN_MODES.map((mode) => (
          <motion.button
            key={mode.id}
            whileTap={{ scale: 0.94, y: 3 }}
            onClick={() => handleModeSelect(mode.id)}
            className="flex-1 relative overflow-hidden"
            style={{
              height: 120,
              borderRadius: 14,
              background: "linear-gradient(180deg, #1E293B, #0F172A)",
              border: `2px solid ${mode.border}`,
              borderBottom: `5px solid rgba(0,0,0,0.4)`,
              boxShadow: `0 6px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {/* Chrome corner brackets */}
            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l" style={{ borderColor: "#64748B" }} />
            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r" style={{ borderColor: "#64748B" }} />

            {/* Icon with animation */}
            <motion.div
              animate={
                mode.id === "tap" ? { rotate: [-3, 3, -3] } :
                mode.id === "pvp" ? { scale: [1, 1.08, 1] } :
                { y: [-1, 1, -1] }
              }
              transition={{ duration: mode.id === "pvp" ? 2 : 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl"
              style={{ filter: `drop-shadow(0 0 8px ${mode.border})` }}
            >
              {mode.icon}
            </motion.div>

            <div className="text-center">
              <div className="font-game-display text-base" style={{ color: mode.accent }}>{mode.label}</div>
              <div className="font-game-body text-[9px] text-muted-foreground">{mode.sub}</div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full" style={{ background: mode.accent, opacity: 0.3 }} />
          </motion.button>
        ))}
      </div>

      {/* ═══ F: ARENA PROGRESS BAR ═══ */}
      <div className="relative z-10 mx-3 mb-3 p-3 rounded-xl" style={{
        background: "linear-gradient(180deg, #1E293B, #0F172A)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}>
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-game-title text-[10px] tracking-wide text-foreground">
            🏏 {currentArena.name}
          </span>
          <span className="font-game-body text-[9px] text-muted-foreground">
            → {nextArena.name}
          </span>
        </div>
        {/* Pitch-style progress bar */}
        <div className="relative h-2 rounded overflow-hidden" style={{
          background: "linear-gradient(90deg, #8B7D3C, #A89A4E, #8B7D3C)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
        }}>
          {/* Crease markings */}
          {[25, 50, 75].map(p => (
            <div key={p} className="absolute top-0 bottom-0 w-px" style={{ left: `${p}%`, background: "rgba(255,255,255,0.15)" }} />
          ))}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(arenaProgress, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded"
            style={{ background: "linear-gradient(90deg, #22C55E, #4ADE50)", boxShadow: "0 0 8px rgba(74,222,80,0.4)" }}
          />
        </div>
        <div className="text-center mt-1">
          <span className="font-game-body text-[9px] text-muted-foreground">🏆 {currentTrophies}/{nextArena.trophies}</span>
        </div>
      </div>

      {/* ═══ G: CHEST SLOT ROW ═══ */}
      <div className="relative z-10 mx-3 mb-4 p-3 rounded-xl" style={{
        background: "linear-gradient(180deg, #1E293B, #0F172A)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}>
        <div className="flex justify-center gap-3">
          {chestSlots.map((chest, i) => {
            const chestInfo = chest ? CRICKET_CHEST[chest.chest_tier] || CRICKET_CHEST.bronze : null;
            const isReady = chest && (chest.status === "ready" || (chest.status === "unlocking" && chestTimeRemaining(chest) <= 0));
            const isUnlocking = chest?.status === "unlocking" && chestTimeRemaining(chest) > 0;

            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleChestTap(chest)}
                className="relative flex flex-col items-center justify-center"
                style={{
                  width: 72,
                  height: 88,
                  borderRadius: 12,
                  background: "linear-gradient(180deg, #0F172A, #0a0f1a)",
                  border: isReady
                    ? `2px solid ${chestInfo?.color}`
                    : chest ? "2px solid rgba(148,163,184,0.15)" : "2px dashed rgba(255,255,255,0.08)",
                  boxShadow: isReady
                    ? `0 0 15px ${chestInfo?.color}40, inset 0 2px 8px rgba(0,0,0,0.4)`
                    : "inset 0 2px 8px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3)",
                  cursor: chest ? "pointer" : "default",
                }}
              >
                {/* Chrome frame edges */}
                {chest && (
                  <>
                    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l rounded-tl-sm" style={{ borderColor: "#64748B" }} />
                    <div className="absolute top-1 right-1 w-2 h-2 border-t border-r rounded-tr-sm" style={{ borderColor: "#64748B" }} />
                    <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l rounded-bl-sm" style={{ borderColor: "#475569" }} />
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r rounded-br-sm" style={{ borderColor: "#475569" }} />
                  </>
                )}

                {/* Leather stitch pattern */}
                <div className="absolute inset-0 rounded-xl pointer-events-none opacity-[0.03]" style={{
                  backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 5px)",
                }} />

                {chest ? (
                  <>
                    {/* Item */}
                    <motion.span
                      animate={isReady ? { y: [-3, 3, -3] } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-2xl relative z-10"
                      style={{ filter: isUnlocking ? "blur(1px) brightness(0.7)" : "none" }}
                    >
                      {chestInfo?.icon}
                    </motion.span>

                    {/* Sparkles for ready */}
                    {isReady && (
                      <>
                        {[0, 1, 2].map(s => (
                          <motion.div
                            key={s}
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: s * 0.5 }}
                            className="absolute w-1 h-1 rounded-full"
                            style={{
                              background: chestInfo?.color,
                              top: `${20 + s * 15}%`,
                              left: `${20 + s * 25}%`,
                              boxShadow: `0 0 4px ${chestInfo?.color}`,
                            }}
                          />
                        ))}
                        {/* Light rays */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                          {[0, 1, 2, 3].map(r => (
                            <motion.div
                              key={r}
                              animate={{ opacity: [0.05, 0.15, 0.05] }}
                              transition={{ duration: 2, repeat: Infinity, delay: r * 0.4 }}
                              className="absolute"
                              style={{
                                width: 2,
                                height: "80%",
                                background: `linear-gradient(to top, transparent, ${chestInfo?.color}40, transparent)`,
                                left: `${20 + r * 18}%`,
                                top: "10%",
                                transform: `rotate(${-15 + r * 10}deg)`,
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Lock icon for unlocking */}
                    {isUnlocking && (
                      <span className="absolute text-xs opacity-60">🔒</span>
                    )}

                    {/* Status text */}
                    <span className="mt-1 text-[8px] font-bold relative z-10" style={{
                      color: isReady ? "hsl(var(--green-play))" : "rgba(255,255,255,0.5)",
                    }}>
                      {isReady ? "OPEN!" : isUnlocking ? formatTime(chestTimeRemaining(chest)) : chestInfo?.label}
                    </span>
                  </>
                ) : (
                  <span className="text-lg opacity-20">+</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ═══ H: SECONDARY MODES ═══ */}
      <div className="relative z-10 px-3 pb-4">
        <div className="font-game-title text-[10px] tracking-widest text-muted-foreground mb-2 px-1">MORE MODES</div>
        <div className="flex flex-col gap-2">
          {SECONDARY_MODES.map((mode) => (
            <motion.button
              key={mode.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleModeSelect(mode.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl relative overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #1E293B, #0F172A)",
                borderLeft: `3px solid ${mode.accent}`,
                border: "1px solid rgba(255,255,255,0.04)",
                borderLeftWidth: 3,
                borderLeftColor: mode.accent,
                boxShadow: "0 3px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              {/* Chrome brackets */}
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r" style={{ borderColor: "#475569" }} />

              <span className="text-2xl w-10 text-center flex-shrink-0" style={{ filter: `drop-shadow(0 0 6px ${mode.accent}40)` }}>
                {mode.icon}
              </span>
              <div className="flex-1 text-left">
                <div className="font-game-title text-xs tracking-wide text-foreground">{mode.label}</div>
                <div className="font-game-body text-[10px]" style={{ color: mode.accent }}>{mode.sub}</div>
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

function StatCell({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-game-display text-sm text-foreground leading-none">{value}</div>
      <div className="font-game-body text-[7px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function ScoreboardPill({ icon, value, plus, onClick }: { icon: string; value: number; plus?: boolean; onClick?: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
      style={{
        background: "#0a0f1a",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 4px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
      }}
    >
      <motion.span
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="text-xs inline-block"
      >{icon}</motion.span>
      <span className="font-game-display text-[10px] text-foreground leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
      </span>
      {plus && (
        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{
          background: "linear-gradient(180deg, hsl(var(--green-play)), hsl(var(--green-play-dark)))",
          boxShadow: "0 1px 0 hsl(var(--green-play-shadow))",
        }}>+</span>
      )}
    </motion.button>
  );
}
