import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import ModeSelectDrawer from "@/components/ModeSelectDrawer";
import floatingIsland from "@/assets/floating-island.png";
import { getChestTier } from "@/lib/chests";

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

const CHEST_SLOTS = [
  { state: "ready" as const, type: "gold", label: "OPEN!", timer: "" },
  { state: "unlocking" as const, type: "silver", label: "", timer: "59m" },
  { state: "locked" as const, type: "bronze", label: "", timer: "3h" },
  { state: "empty" as const, type: null, label: "", timer: "" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [modeDrawerOpen, setModeDrawerOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

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

  if (showOnboarding) return <OnboardingTutorial onComplete={completeOnboarding} />;

  const currentTrophies = profile?.wins ?? 0;
  const currentArena = ARENA_LEVELS.reduce((prev, curr) =>
    currentTrophies >= curr.trophies ? curr : prev, ARENA_LEVELS[0]);
  const nextArena = ARENA_LEVELS[ARENA_LEVELS.indexOf(currentArena) + 1] || currentArena;
  const playerLevel = Math.floor((profile?.xp ?? 0) / 500) + 1;
  const xpInLevel = (profile?.xp ?? 0) % 500;
  const playerName = profile?.display_name || user?.email?.split("@")[0]?.slice(0, 10) || "Player";
  const arenaProgress = ((currentTrophies - currentArena.trophies) / Math.max(nextArena.trophies - currentArena.trophies, 1)) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden app-bg" style={{ paddingBottom: "calc(68px + env(safe-area-inset-bottom, 16px) + 16px)" }}>
      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(2,6,23,0.7) 100%)" }} />

      <div className="relative z-10 max-w-[430px] mx-auto" style={{ padding: "var(--screen-padding-top) var(--screen-padding-x) 0" }}>

        {/* ═══════════════════════════════════════════
            A) PLAYER BAR — 72px, blurred bg
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-3"
          style={{
            height: 72,
            background: "rgba(15,23,42,0.9)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(var(--team-primary-rgb), 0.3)",
            padding: "8px 16px",
            borderRadius: "var(--radius-lg)",
          }}
        >
          {/* Avatar 56×56 */}
          <button
            onClick={() => navigate("/profile")}
            className="relative flex-shrink-0 active:scale-95 transition-transform"
            style={{ width: 56, height: 56 }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{
                border: "3px solid hsl(var(--team-primary))",
                background: "linear-gradient(135deg, #1E293B, #0F172A)",
              }}
            >
              <span className="text-2xl">🏏</span>
            </div>
            {/* Level badge */}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full font-score text-[9px] text-white font-bold"
              style={{
                background: "linear-gradient(180deg, hsl(var(--team-primary)), hsl(var(--team-dark)))",
                border: "2px solid hsl(var(--team-dark))",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                color: "hsl(var(--team-text))",
              }}
            >
              Lv.{playerLevel}
            </div>
            {/* XP bar 48px */}
            <div className="absolute -bottom-3 left-[8%] right-[8%] h-[4px] rounded-full z-20 overflow-hidden"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(xpInLevel / 500) * 100}%`,
                  background: "hsl(var(--team-accent))",
                  boxShadow: "0 0 4px hsl(var(--team-accent) / 0.5)",
                }}
              />
            </div>
          </button>

          {/* Name & clan */}
          <div className="flex-1 min-w-0 pl-1">
            <div className="font-body text-sm font-bold text-white truncate">{playerName}</div>
            <div className="font-body text-[10px] text-muted-foreground mt-0.5">
              {currentArena.name}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-score text-[11px] font-bold" style={{ color: "hsl(var(--team-accent))" }}>
                🏆 {currentTrophies}
              </span>
            </div>
          </div>

          {/* Currency pills */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {/* Coins */}
            <div className="currency-pill">
              <span className="icon flex items-center justify-center text-sm">🪙</span>
              <span className="amount">{profile?.coins ?? 0}</span>
              <button className="btn-circle-sm ml-1 text-white text-[10px] font-bold">+</button>
            </div>
            {/* Gems */}
            <div className="currency-pill">
              <span className="icon flex items-center justify-center text-sm">💎</span>
              <span className="amount">45</span>
              <button className="btn-circle-sm ml-1 text-white text-[10px] font-bold">+</button>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            B) CHEST BANNERS — Free Chest + Wicket Chest
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-2 mb-4"
        >
          {/* Free Chest */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/shop")}
            className="game-card chrome-brackets rounded-2xl p-3 flex flex-col items-center gap-1 animate-chest-glow"
          >
            <span className="text-3xl">🎁</span>
            <span className="font-display text-[10px] text-white tracking-wider" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              Free Chest
            </span>
            <span className="font-game-display text-[12px] tracking-wider" style={{ color: "hsl(var(--team-accent))" }}>
              OPEN!
            </span>
          </motion.button>

          {/* Wicket Chest */}
          <button className="game-card chrome-brackets rounded-2xl p-3 flex flex-col items-center gap-1">
            <span className="text-3xl">📦</span>
            <span className="font-display text-[10px] text-white tracking-wider" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              Wicket Chest
            </span>
            <div className="w-20 mt-1">
              <div className="progress-bar" style={{ height: 6 }}>
                <div className="progress-bar-fill" style={{ width: "72%" }} />
              </div>
            </div>
            <span className="font-score text-[10px] text-white/60">18/25</span>
          </button>
        </motion.div>

        {/* ═══════════════════════════════════════════
            C) 3D FLOATING ISLAND
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", damping: 18 }}
          className="relative mb-2 flex items-center justify-center"
          style={{ height: 380 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
            style={{ width: 320, height: 380 }}
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

          {/* Ground shadow ellipse */}
          <motion.div
            animate={{ scale: [0.85, 1, 0.85], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: 200,
              height: 40,
              background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
        </motion.div>

        {/* ═══════════════════════════════════════════
            D) ARENA PROGRESS BAR
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-2"
          style={{ padding: "0 32px" }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-body text-[11px] font-semibold text-muted-foreground">{currentArena.name}</span>
            <span className="font-body text-[11px] font-semibold text-muted-foreground">{nextArena.name}</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${arenaProgress}%` }} />
            {/* Trophy marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 text-[14px]"
              style={{
                left: `${Math.min(arenaProgress, 95)}%`,
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                transform: `translateY(-50%) translateX(-50%)`,
              }}
            >
              🏆
            </div>
            {/* Milestone dots */}
            {[25, 50, 75].map(pct => (
              <div
                key={pct}
                className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                style={{
                  left: `${pct}%`,
                  background: "hsl(var(--team-primary))",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            E) BATTLE BUTTON — Always green, breathe anim
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 15 }}
          className="mb-4"
        >
          <button
            onClick={() => setModeDrawerOpen(true)}
            className="btn-battle chrome-brackets"
          >
            ▶ BATTLE
          </button>
        </motion.div>

        {/* ═══════════════════════════════════════════
            F) CHEST SLOT ROW — 4 slots
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex gap-2 mb-4 px-0"
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
                className="flex-1 relative rounded-xl flex flex-col items-center justify-center chrome-brackets overflow-hidden"
                style={{
                  height: 100,
                  background: "hsl(var(--card))",
                  border: isReady
                    ? "2px solid hsl(var(--team-accent))"
                    : isEmpty
                    ? "2px solid #334155"
                    : slot.state === "unlocking"
                    ? "2px solid #22C55E"
                    : "2px solid #3B82F6",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {isReady && (
                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ boxShadow: `inset 0 0 16px hsl(var(--team-accent) / 0.3)` }}
                  />
                )}

                {chestTier ? (
                  <>
                    <img
                      src={chestTier.image}
                      alt={chestTier.name}
                      className="w-12 h-12 object-contain relative z-10"
                      style={{
                        filter: slot.state === "locked" ? "brightness(0.5)" : undefined,
                      }}
                      width={512}
                      height={512}
                      loading="lazy"
                    />
                    {isReady && (
                      <span className="font-game-display text-[12px] relative z-10 mt-0.5" style={{ color: "hsl(var(--team-accent))" }}>
                        OPEN
                      </span>
                    )}
                    {slot.state === "unlocking" && (
                      <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-center z-10"
                        style={{ background: "rgba(0,0,0,0.6)" }}>
                        <span className="text-[10px] mr-1">🕐</span>
                        <span className="font-score text-[11px] text-white">{slot.timer}</span>
                      </div>
                    )}
                    {slot.state === "locked" && (
                      <div className="flex flex-col items-center gap-0.5 relative z-10">
                        <span className="text-sm">🔒</span>
                        <span className="font-score text-[9px] text-muted-foreground">{slot.timer}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-30">
                    <span className="text-muted-foreground text-lg">+</span>
                    <span className="font-body text-[8px] text-muted-foreground uppercase">Chest Slot</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <ModeSelectDrawer open={modeDrawerOpen} onOpenChange={setModeDrawerOpen} />
    </div>
  );
}
