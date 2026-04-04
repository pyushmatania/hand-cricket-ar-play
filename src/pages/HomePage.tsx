import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import RivalrySection from "@/components/RivalrySection";
import DailyStreakWidget from "@/components/DailyStreakWidget";
import CardFrame from "@/components/shared/CardFrame";
import GameButton from "@/components/shared/GameButton";
import GameProgressBar from "@/components/shared/GameProgressBar";
import CurrencyPill from "@/components/shared/CurrencyPill";
import { useRivals } from "@/hooks/useRivals";
import { Settings } from "lucide-react";
import floatingIsland from "@/assets/floating-island.png";
import avatarFrame from "@/assets/avatar-frame.png";
import { getChestTier } from "@/lib/chests";
import { getCurrentSeasonalTheme } from "@/lib/seasonalThemes";
import SeasonalIslandOverlay from "@/components/SeasonalIslandOverlay";
import ModeSelectDrawer from "@/components/ModeSelectDrawer";

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

interface RecentMatch {
  id: string;
  mode: string;
  user_score: number;
  ai_score: number;
  result: string;
  created_at: string;
}

const ARENA_LEVELS = [
  { name: "Gully Grounds", trophies: 0 },
  { name: "School Ground", trophies: 100 },
  { name: "Club Pitch", trophies: 300 },
  { name: "IPL Arena", trophies: 600 },
  { name: "World Cup", trophies: 1000 },
];

const CHEST_SLOTS = [
  { state: "ready" as const, type: "gold", label: "OPEN!", timer: "" },
  { state: "unlocking" as const, type: "silver", label: "", timer: "2h 30m" },
  { state: "locked" as const, type: "bronze", label: "", timer: "1h 15m" },
  { state: "empty" as const, type: null, label: "", timer: "" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recentMatch, setRecentMatch] = useState<RecentMatch | null>(null);
  const { rivals, loading: rivalsLoading } = useRivals();
  const seasonalTheme = getCurrentSeasonalTheme();

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
      .from("matches")
      .select("id, mode, user_score, ai_score, result, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setRecentMatch(data[0]); });
  }, [user]);

  const completeOnboarding = () => {
    localStorage.setItem("hc_onboarding_done", "1");
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingTutorial onComplete={completeOnboarding} />;
  }

  const winRate = profile && profile.total_matches > 0
    ? Math.round((profile.wins / profile.total_matches) * 100)
    : 0;

  const currentTrophies = profile?.wins ?? 0;
  const currentArena = ARENA_LEVELS.reduce((prev, curr) =>
    currentTrophies >= curr.trophies ? curr : prev, ARENA_LEVELS[0]);
  const nextArena = ARENA_LEVELS[ARENA_LEVELS.indexOf(currentArena) + 1] || currentArena;
  const playerLevel = Math.floor((profile?.xp ?? 0) / 500) + 1;
  const xpInLevel = (profile?.xp ?? 0) % 500;
  const playerName = profile?.display_name || user?.email?.split("@")[0]?.slice(0, 10) || "Player";

  return (
    <div className="min-h-screen relative overflow-hidden pb-28 pitch-stripe-bg">
      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(222 47% 3% / 0.7) 100%)" }} />
      {/* Floodlight glow from top */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-floodlit" />

      <div className="relative z-10 max-w-lg mx-auto px-3 pt-2">

        {/* ═══════════════════════════════════════════
            A) PLAYER BAR — Stadium Concrete
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="surface-concrete cricket-frame rounded-2xl p-2.5 mb-3 flex items-center gap-3"
        >
          {/* Chrome-framed avatar */}
          <button
            onClick={() => navigate("/profile")}
            className="relative flex-shrink-0 active:scale-95 transition-transform"
            style={{ width: 60, height: 60 }}
          >
            <img
              src={avatarFrame}
              alt=""
              className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
              style={{ filter: "saturate(0) brightness(1.8) contrast(0.9)" }}
              width={512}
              height={512}
            />
            <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-game-blue to-game-purple flex items-center justify-center overflow-hidden">
              <span className="text-2xl">🏏</span>
            </div>
            {/* Level badge — leather patch */}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full font-display text-[8px] text-white"
              style={{
                background: "linear-gradient(180deg, hsl(12 70% 35%), hsl(12 75% 22%))",
                border: "2px solid hsl(12 85% 12%)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              LVL {playerLevel}
            </div>
            {/* XP bar */}
            <div className="absolute -bottom-3 left-[10%] right-[10%] h-[4px] rounded-full z-20 overflow-hidden"
              style={{ background: "hsl(230 15% 12%)", border: "1px solid hsl(230 10% 8%)" }}>
              <div
                className="h-full rounded-full grass-fill"
                style={{ width: `${(xpInLevel / 500) * 100}%`, boxShadow: "0 0 6px hsl(130 45% 40% / 0.5)" }}
              />
            </div>
          </button>

          {/* Player info */}
          <div className="flex-1 min-w-0 pl-1">
            <div className="font-display text-sm text-foreground truncate" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              {playerName}
            </div>
            <div className="font-body text-[9px] text-muted-foreground mt-0.5">
              ⭐ {currentArena.name}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-score text-[10px] text-game-gold font-bold">🏆 {currentTrophies}</span>
            </div>
          </div>

          {/* Chrome currency pills */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <CurrencyPill icon="🪙" value={profile?.coins ?? 0} />
            <CurrencyPill icon="💎" value={45} />
          </div>

          {/* Settings — chrome metallic */}
          <button
            onClick={() => navigate("/settings")}
            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 surface-chrome"
          >
            <Settings className="w-4 h-4 text-foreground/70" />
          </button>
        </motion.div>

        {/* ═══════════════════════════════════════════
            B) CHEST BANNER ROW
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-2 mb-3"
        >
          {/* Free Chest — leather with team accent glow */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/shop")}
            className="relative surface-leather-light cricket-frame rounded-2xl p-3 flex flex-col items-center gap-1 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ boxShadow: "inset 0 0 20px hsl(45 100% 55% / 0.15)" }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-3xl relative z-10">🎁</span>
            <span className="font-display text-[9px] text-game-gold tracking-wider relative z-10" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              FREE CHEST
            </span>
            <span className="text-chalk text-[11px] tracking-wider relative z-10">
              OPEN
            </span>
          </motion.button>

          {/* Wicket Chest — scoreboard surface */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/game/daily")}
            className="surface-scoreboard cricket-frame rounded-2xl p-3 flex flex-col items-center gap-1"
          >
            <span className="text-3xl">📅</span>
            <span className="font-display text-[9px] text-scoreboard-text tracking-wider" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              WICKET CHEST
            </span>
            <div className="w-full mt-0.5">
              <GameProgressBar value={18} max={25} color="blue" showText={false} />
            </div>
            <span className="font-score text-[8px] text-scoreboard-text/60">18/25</span>
          </motion.button>
        </motion.div>

        {/* ═══════════════════════════════════════════
            C) 3D FLOATING ISLAND — CENTERPIECE
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", damping: 18 }}
          className="relative mb-1"
        >
          {/* Arena name — chrome pill */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
            <div
              className="px-5 py-1 font-display text-[10px] text-game-gold tracking-[0.2em] relative chrome-pill"
              style={{
                background: "linear-gradient(180deg, hsl(230 5% 80%), hsl(230 8% 55%), hsl(230 5% 80%))",
                textShadow: "0 1px 2px rgba(0,0,0,0.4)",
              }}
            >
              ⭐ {currentArena.name.toUpperCase()} ⭐
            </div>
          </div>

          {/* Seasonal banner */}
          {seasonalTheme?.banner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
            >
              <div
                className="px-4 py-1 rounded-full font-display text-[8px] font-bold tracking-[0.15em] whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, hsl(0 0% 0% / 0.6), hsl(0 0% 0% / 0.4))",
                  border: `1.5px solid ${seasonalTheme.bannerColor}44`,
                  color: seasonalTheme.bannerColor,
                  boxShadow: `0 0 12px ${seasonalTheme.bannerColor}22, 0 2px 6px hsl(0 0% 0% / 0.4)`,
                  textShadow: `0 0 8px ${seasonalTheme.bannerColor}66`,
                }}
              >
                <motion.span
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {seasonalTheme.banner}
                </motion.span>
              </div>
            </motion.div>
          )}

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto"
            style={{ maxWidth: 320 }}
          >
            {seasonalTheme && <SeasonalIslandOverlay theme={seasonalTheme} />}

            <img
              src={floatingIsland}
              alt={`${currentArena.name} Stadium Island`}
              className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
              style={{ filter: seasonalTheme?.imageFilter }}
              width={768}
              height={768}
            />

            {/* Floating debris */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 3 + Math.random() * 4,
                  height: 3 + Math.random() * 4,
                  background: `hsl(${120 + Math.random() * 30} 40% ${40 + Math.random() * 20}%)`,
                  left: `${15 + Math.random() * 70}%`,
                  top: `${60 + Math.random() * 30}%`,
                  opacity: 0.4,
                }}
                animate={{
                  y: [0, -15 - Math.random() * 10, 0],
                  x: [0, (Math.random() - 0.5) * 10, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2.5 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}

            {/* Stats overlay */}
            <div className="absolute bottom-[22%] left-0 right-0 flex justify-center gap-4 px-6">
              {[
                { val: profile?.total_matches ?? 0, label: "Matches", color: "white" },
                { val: profile?.wins ?? 0, label: "Wins", color: "hsl(51 100% 50%)" },
                { val: `${winRate}%`, label: "Rate", color: "hsl(130 45% 45%)" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <span className="font-score text-base font-bold block" style={{ color: s.color, textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>
                    {s.val}
                  </span>
                  <span className="font-body text-[6px] text-white/60 uppercase tracking-wider">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Shadow beneath island */}
          <motion.div
            animate={{ scale: [0.85, 1, 0.85], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto w-[60%] h-4 rounded-[50%] -mt-2"
            style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)" }}
          />
        </motion.div>

        {/* ═══════════════════════════════════════════
            D) ARENA PROGRESS — Chalk-style track
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-2 px-5"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-body text-[9px] text-muted-foreground font-bold">🏟️ {currentArena.name}</span>
            <span className="font-body text-[9px] text-game-gold font-bold">→ {nextArena.name}</span>
          </div>
          <div className="relative h-2 rounded-sm overflow-hidden" style={{ background: "hsl(140 25% 10%)", border: "1px solid hsl(140 20% 14%)" }}>
            <div
              className="h-full rounded-sm grass-fill transition-all"
              style={{ width: `${((currentTrophies - currentArena.trophies) / Math.max(nextArena.trophies - currentArena.trophies, 1)) * 100}%` }}
            />
            {/* Chrome trophy marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full surface-chrome flex items-center justify-center text-[6px]"
              style={{ left: `${Math.min(((currentTrophies - currentArena.trophies) / Math.max(nextArena.trophies - currentArena.trophies, 1)) * 100, 95)}%` }}
            >
              🏆
            </div>
          </div>
          <div className="flex justify-center mt-1">
            <span className="font-score text-[9px] text-game-gold font-bold">🏆 {currentTrophies} / {nextArena.trophies}</span>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            E) BATTLE BUTTON — Jersey Mesh Material
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 15 }}
          className="mb-3 px-5 relative z-20"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            animate={{ scale: [1, 1.01, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => navigate("/play")}
            className="w-full surface-jersey jersey-green rounded-[20px] min-h-[60px] flex items-center justify-center gap-3 text-xl"
          >
            <span className="text-2xl">⚔️</span>
            BATTLE
            <span className="text-sm opacity-60">▶</span>
          </motion.button>
        </motion.div>

        {/* ═══════════════════════════════════════════
            F) CHEST SLOT ROW — Leather cards, chrome frames
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-4 gap-2 mb-4"
        >
          {CHEST_SLOTS.map((slot, i) => {
            const chestTier = slot.type ? getChestTier(slot.type) : null;
            const isReady = slot.state === "ready";
            const isEmpty = slot.state === "empty";

            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => isReady ? navigate("/shop") : undefined}
                className="relative rounded-xl flex flex-col items-center justify-center min-h-[88px] overflow-hidden"
                style={{
                  background: isReady
                    ? "linear-gradient(180deg, hsl(12 70% 30%), hsl(12 75% 18%))"
                    : isEmpty
                    ? "linear-gradient(180deg, hsl(230 15% 16%), hsl(230 15% 12%))"
                    : "linear-gradient(180deg, hsl(230 12% 18%), hsl(230 15% 13%))",
                  border: isReady
                    ? `3px solid ${chestTier?.borderColor ?? "hsl(43 80% 40%)"}`
                    : isEmpty
                    ? "3px dashed hsl(230 10% 22% / 0.4)"
                    : "3px solid hsl(230 10% 18%)",
                  boxShadow: isReady
                    ? `0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 hsl(12 60% 45% / 0.2), 0 0 12px ${chestTier?.glowColor ?? "hsl(45 100% 55% / 0.15)"}`
                    : "0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 hsl(0 0% 100% / 0.03)",
                }}
              >
                {isReady && chestTier && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ boxShadow: `inset 0 0 20px ${chestTier.glowColor}` }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {chestTier ? (
                  <>
                    <img
                      src={chestTier.image}
                      alt={chestTier.name}
                      width={512}
                      height={512}
                      loading="lazy"
                      className="w-12 h-12 object-contain mb-0.5 relative z-10"
                      style={{ filter: `drop-shadow(0 2px 6px ${chestTier.glowColor})` }}
                    />
                    {isReady && (
                      <div
                        className="absolute bottom-0 left-0 right-0 py-1 text-center z-10"
                        style={{ background: "linear-gradient(180deg, hsl(0 0% 0% / 0.6), hsl(0 0% 0% / 0.8))" }}
                      >
                        <span className="text-chalk text-[8px] animate-pulse tracking-wider">OPEN!</span>
                      </div>
                    )}
                    {slot.state === "unlocking" && (
                      <div
                        className="absolute bottom-0 left-0 right-0 py-1 text-center z-10"
                        style={{ background: "linear-gradient(180deg, hsl(0 0% 0% / 0.5), hsl(0 0% 0% / 0.7))", borderRadius: "0 0 8px 8px" }}
                      >
                        <span className="font-score text-[8px] text-white tracking-wider">{slot.timer}</span>
                      </div>
                    )}
                    {slot.state === "locked" && (
                      <div className="flex flex-col items-center gap-0.5 relative z-10">
                        <span className="text-sm">🔒</span>
                        <span className="font-score text-[7px] text-muted-foreground">{slot.timer}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-40">
                    <span className="text-muted-foreground text-lg">+</span>
                    <span className="font-body text-[6px] text-muted-foreground uppercase">Slot</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ═══════════════════════════════════════════
            QUICK MODE BUTTONS — Concrete cards, chrome frames
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-2 mb-4"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/game/multiplayer")}
            className="surface-concrete cricket-frame rounded-2xl p-3 flex items-center gap-3"
          >
            <span className="text-2xl">⚔️</span>
            <div className="text-left">
              <span className="font-display text-[10px] text-game-orange block" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>PvP</span>
              <span className="font-body text-[8px] text-muted-foreground">Win Trophies</span>
            </div>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/game/tournament")}
            className="surface-concrete cricket-frame rounded-2xl p-3 flex items-center gap-3"
          >
            <span className="text-2xl">🏆</span>
            <div className="text-left">
              <span className="font-display text-[10px] text-game-purple block" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Tournament</span>
              <span className="font-body text-[8px] text-muted-foreground">Win Coins</span>
            </div>
          </motion.button>
        </motion.div>

        {/* ── Shop + Rewards Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="grid grid-cols-2 gap-2 mb-4"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/shop")}
            className="surface-leather-light cricket-frame rounded-2xl p-3 flex items-center gap-3"
          >
            <span className="text-2xl">🛒</span>
            <div className="text-left">
              <span className="font-display text-[10px] text-game-teal block" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>SHOP</span>
              <span className="font-body text-[8px] text-muted-foreground">Skins & Items</span>
            </div>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/daily-rewards")}
            className="surface-leather-light cricket-frame rounded-2xl p-3 flex items-center gap-3"
          >
            <span className="text-2xl">🎁</span>
            <div className="text-left">
              <span className="font-display text-[10px] text-game-green block" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>REWARDS</span>
              <span className="font-body text-[8px] text-muted-foreground">Daily Login</span>
            </div>
          </motion.button>
        </motion.div>

        {/* ── Battle Pass Banner — Leather strip ── */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/battle-pass")}
          className="w-full mb-4 surface-leather cricket-frame rounded-2xl p-3 flex items-center gap-3"
        >
          <span className="text-2xl">⚔️</span>
          <div className="flex-1 text-left">
            <span className="font-display text-[10px] text-secondary block" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>BATTLE PASS</span>
            <span className="font-body text-[8px] text-muted-foreground">Season 3 — Unlock Premium Rewards</span>
          </div>
          <span className="font-display text-[9px] text-secondary/70">→</span>
        </motion.button>

        {/* ── Daily Streak ── */}
        <DailyStreakWidget />

        {/* ── Rivalry Section ── */}
        <RivalrySection rivals={rivals} loading={rivalsLoading} />

        {/* ── Past Match — Scoreboard paint style ── */}
        {recentMatch && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4"
          >
            <div className="surface-scoreboard cricket-frame rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-[8px] text-scoreboard-text/60 tracking-[0.2em]">PAST MATCH</span>
                <span className={`font-display text-[9px] tracking-wider px-2 py-0.5 rounded-full ${
                  recentMatch.result === "win"
                    ? "bg-game-green/15 text-game-green border border-game-green/20"
                    : recentMatch.result === "loss"
                    ? "bg-game-red/15 text-game-red border border-game-red/20"
                    : "bg-game-gold/15 text-game-gold border border-game-gold/20"
                }`}>
                  {recentMatch.result.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-game-blue/15 border border-game-blue/20 flex items-center justify-center">
                    <span className="text-base">🏏</span>
                  </div>
                  <div>
                    <span className="font-body text-xs font-bold text-foreground">You</span>
                    <span className="block font-display text-[7px] text-scoreboard-text/50 tracking-wider">
                      {recentMatch.mode.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="font-score text-xl text-game-gold font-bold">{recentMatch.user_score}</span>
                  <span className="text-muted-foreground mx-1 text-xs">:</span>
                  <span className="font-score text-xl text-muted-foreground font-bold">{recentMatch.ai_score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-body text-xs font-bold text-foreground">AI</span>
                    <span className="block font-display text-[7px] text-scoreboard-text/50 tracking-wider">BOT</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-game-red/15 border border-game-red/20 flex items-center justify-center">
                    <span className="text-base">🤖</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── More Modes — Concrete cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-4 space-y-2"
        >
          {[
            { icon: "📸", label: "AR Camera", desc: "Hand gesture tracking", mode: "ar", color: "game-blue" },
            { icon: "👆", label: "Tap Mode", desc: "Quick tap gameplay", mode: "tap", color: "game-green" },
            { icon: "🎯", label: "Practice", desc: "Learn hand gestures", mode: "practice", color: "game-teal" },
          ].map((m, i) => (
            <motion.button
              key={m.mode}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/game/${m.mode}`)}
              className="w-full surface-concrete rounded-xl p-3 flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-xl bg-${m.color}/15 border border-${m.color}/20 flex items-center justify-center`}>
                <span className="text-lg">{m.icon}</span>
              </div>
              <div className="flex-1 text-left">
                <span className={`font-display text-[10px] text-${m.color} block`} style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{m.label}</span>
                <span className="font-body text-[8px] text-muted-foreground">{m.desc}</span>
              </div>
              <span className="text-muted-foreground/30 text-sm font-bold">›</span>
            </motion.button>
          ))}
        </motion.div>

        {/* ── Gesture Strip — Chalk style ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-5 pb-4"
        >
          {["✊", "☝️", "✌️", "🤟", "🖖", "👍"].map((e, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, delay: i * 0.2, repeat: Infinity }}
              className="text-base opacity-15"
            >
              {e}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
