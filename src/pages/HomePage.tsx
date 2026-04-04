import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import ModeSelectDrawer from "@/components/ModeSelectDrawer";
import floatingIsland from "@/assets/floating-island.png";
import { getChestTier } from "@/lib/chests";
import ChestSlotsWidget from "@/components/ChestSlotsWidget";

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
    <div className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(28 35% 14%) 0%, hsl(25 30% 8%) 40%, hsl(222 40% 6%) 100%)",
        paddingBottom: "calc(68px + env(safe-area-inset-bottom, 16px) + 16px)",
      }}
    >
      {/* Leather grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='6' height='6' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(25 30% 4% / 0.7) 100%)" }}
      />

      <div className="relative z-10 max-w-[430px] mx-auto px-4 pt-4">

        {/* ═══ A) PLAYER BAR — Stadium Concrete + Chrome ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-3"
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
          {/* Avatar */}
          <button
            onClick={() => navigate("/profile")}
            className="relative flex-shrink-0 active:scale-95 transition-transform"
            style={{ width: 52, height: 52 }}
          >
            <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{
                border: "3px solid hsl(43 80% 50%)",
                background: "linear-gradient(135deg, hsl(25 20% 18%), hsl(25 15% 12%))",
                boxShadow: "0 0 10px hsl(43 80% 50% / 0.2)",
              }}
            >
              <span className="text-2xl">🏏</span>
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full font-game-score text-[9px] font-bold"
              style={{
                background: "linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(35 60% 35%) 100%)",
                border: "2px solid hsl(35 50% 25%)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                color: "hsl(25 40% 8%)",
              }}
            >
              Lv.{playerLevel}
            </div>
            {/* XP bar */}
            <div className="absolute -bottom-3 left-[8%] right-[8%] h-[4px] rounded-full z-20 overflow-hidden"
              style={{ background: "hsl(25 15% 10%)", border: "1px solid hsl(25 20% 18%)" }}
            >
              <div className="h-full rounded-full"
                style={{
                  width: `${(xpInLevel / 500) * 100}%`,
                  background: "linear-gradient(90deg, hsl(43 90% 55%), hsl(35 80% 45%))",
                  boxShadow: "0 0 6px hsl(43 90% 55% / 0.5)",
                }}
              />
            </div>
          </button>

          {/* Name & Arena */}
          <div className="flex-1 min-w-0 pl-2">
            <div className="font-game-card text-sm font-bold text-foreground truncate">{playerName}</div>
            <div className="font-game-body text-[10px] text-muted-foreground mt-0.5">{currentArena.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-game-score text-[11px] font-bold" style={{ color: "hsl(43 90% 55%)" }}>
                🏆 {currentTrophies}
              </span>
            </div>
          </div>

          {/* Currency pills */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 rounded-full px-2 py-1"
              style={{
                background: "linear-gradient(180deg, hsl(25 18% 18%) 0%, hsl(25 15% 13%) 100%)",
                border: "1.5px solid hsl(43 40% 35%)",
                boxShadow: "0 2px 0 hsl(25 20% 8%)",
              }}
            >
              <span className="text-sm">🪙</span>
              <span className="font-game-score text-[11px] font-bold text-foreground">{profile?.coins ?? 0}</span>
              <span className="text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                style={{ background: "hsl(142 71% 45%)", color: "hsl(25 40% 8%)" }}
              >+</span>
            </div>
            <div className="flex items-center gap-1 rounded-full px-2 py-1"
              style={{
                background: "linear-gradient(180deg, hsl(25 18% 18%) 0%, hsl(25 15% 13%) 100%)",
                border: "1.5px solid hsl(280 40% 40%)",
                boxShadow: "0 2px 0 hsl(25 20% 8%)",
              }}
            >
              <span className="text-sm">💎</span>
              <span className="font-game-score text-[11px] font-bold text-foreground">45</span>
              <span className="text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                style={{ background: "hsl(142 71% 45%)", color: "hsl(25 40% 8%)" }}
              >+</span>
            </div>
          </div>
        </motion.div>

        {/* ═══ B) QUICK ACCESS BANNERS ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 mb-4"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/shop")}
            className="rounded-2xl p-3 flex flex-col items-center gap-1 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(28 22% 16%) 0%, hsl(25 18% 11%) 100%)",
              border: "2px solid hsl(43 60% 40%)",
              borderBottom: "5px solid hsl(43 40% 25%)",
              boxShadow: "0 0 20px hsl(43 90% 50% / 0.15)",
            }}
          >
            <motion.div className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ background: "radial-gradient(circle at center, hsl(43 90% 55% / 0.2), transparent 70%)" }}
            />
            <span className="text-2xl relative z-10">🎁</span>
            <span className="font-game-display text-[9px] text-foreground tracking-wider relative z-10"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
            >
              Free Chest
            </span>
            <span className="font-game-display text-[11px] tracking-wider relative z-10"
              style={{ color: "hsl(43 90% 55%)" }}
            >
              OPEN!
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/collection")}
            className="rounded-2xl p-3 flex flex-col items-center gap-1 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(28 22% 16%) 0%, hsl(25 18% 11%) 100%)",
              border: "2px solid hsl(280 50% 40%)",
              borderBottom: "5px solid hsl(280 40% 25%)",
              boxShadow: "0 0 16px hsl(280 60% 50% / 0.15)",
            }}
          >
            <span className="text-2xl relative z-10">🃏</span>
            <span className="font-game-display text-[9px] text-foreground tracking-wider relative z-10"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
            >
              Collection
            </span>
            <span className="font-game-score text-[10px] relative z-10 text-muted-foreground">235 Cards</span>
          </motion.button>

          <button
            onClick={() => navigate("/shop")}
            className="rounded-2xl p-3 flex flex-col items-center gap-1"
            style={{
              background: "linear-gradient(180deg, hsl(28 22% 16%) 0%, hsl(25 18% 11%) 100%)",
              border: "2px solid hsl(25 20% 25%)",
              borderBottom: "5px solid hsl(25 20% 12%)",
            }}
          >
            <span className="text-2xl">📦</span>
            <span className="font-game-display text-[9px] text-foreground tracking-wider"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
            >
              Wicket Chest
            </span>
            <div className="w-14 mt-1 h-[5px] rounded-full overflow-hidden"
              style={{ background: "hsl(25 15% 10%)", border: "1px solid hsl(25 18% 20%)" }}
            >
              <div className="h-full rounded-full"
                style={{ width: "72%", background: "linear-gradient(90deg, hsl(142 71% 45%), hsl(142 60% 35%))" }}
              />
            </div>
            <span className="font-game-score text-[9px] text-muted-foreground">18/25</span>
          </button>
        </motion.div>

        {/* ═══ C) FLOATING ISLAND ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", damping: 18 }}
          className="relative mb-2 flex items-center justify-center"
          style={{ height: 340 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
            style={{ width: 300, height: 340 }}
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
          <motion.div
            animate={{ scale: [0.85, 1, 0.85], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{ width: 200, height: 40, background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)", borderRadius: "50%" }}
          />
        </motion.div>

        {/* ═══ D) ARENA PROGRESS ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-3 px-6"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-game-body text-[10px] font-semibold text-muted-foreground">{currentArena.name}</span>
            <span className="font-game-body text-[10px] font-semibold text-muted-foreground">{nextArena.name}</span>
          </div>
          <div className="relative h-[8px] rounded-full overflow-hidden"
            style={{ background: "hsl(25 15% 10%)", border: "1px solid hsl(25 18% 18%)" }}
          >
            <div className="h-full rounded-full"
              style={{
                width: `${arenaProgress}%`,
                background: "linear-gradient(90deg, hsl(43 90% 55%), hsl(35 80% 45%))",
                boxShadow: "0 0 8px hsl(43 90% 55% / 0.4)",
              }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 text-[14px]"
              style={{
                left: `${Math.min(arenaProgress, 95)}%`,
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                transform: `translateY(-50%) translateX(-50%)`,
              }}
            >
              🏆
            </div>
            {[25, 50, 75].map(pct => (
              <div key={pct} className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                style={{ left: `${pct}%`, background: "hsl(43 60% 40%)" }}
              />
            ))}
          </div>
        </motion.div>

        {/* ═══ E) BATTLE BUTTON — 3D Jersey Mesh ═══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 15 }}
          className="mb-4 px-6"
        >
          <motion.button
            whileTap={{ scale: 0.96, y: 3 }}
            onClick={() => setModeDrawerOpen(true)}
            className="w-full relative overflow-hidden font-game-title text-lg tracking-wider"
            style={{
              padding: "16px 0",
              borderRadius: "16px",
              background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
              border: "2px solid hsl(142 60% 55% / 0.5)",
              borderBottom: "6px solid hsl(142 55% 25%)",
              boxShadow: "0 6px 24px hsl(142 71% 45% / 0.3), inset 0 1px 0 hsl(142 80% 65% / 0.4)",
              color: "hsl(142 80% 98%)",
              textShadow: "0 2px 0 hsl(142 50% 20%)",
            }}
          >
            {/* Jersey mesh texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)",
                backgroundSize: "4px 4px",
              }}
            />
            <span className="relative z-10">▶ BATTLE</span>
          </motion.button>
        </motion.div>

        {/* ═══ F) CHEST SLOT ROW ═══ */}
        <ChestSlotsWidget />
      </div>

      <ModeSelectDrawer open={modeDrawerOpen} onOpenChange={setModeDrawerOpen} />
    </div>
  );
}
