import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
import { Settings, Bell } from "lucide-react";
import { toast } from "sonner";

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

const CRICKET_CHEST: Record<string, { icon: string; label: string; color: string }> = {
  bronze:  { icon: "🎾", label: "Tennis Ball", color: "hsl(35 80% 55%)" },
  silver:  { icon: "🏏", label: "Red Ball",    color: "hsl(0 65% 50%)" },
  gold:    { icon: "🏆", label: "Trophy",      color: "hsl(43 100% 55%)" },
  diamond: { icon: "💎", label: "Crystal Bat",  color: "hsl(200 80% 65%)" },
};

/* Mode button configs */
const MODES = {
  tap:        { icon: "⚡", label: "TAP",        bg: "#4ADE50", dark: "#1A5E1A", route: "tap" },
  pvp:        { icon: "⚔️", label: "PVP",        bg: "#EF4444", dark: "#991B1B", route: "pvp" },
  ar:         { icon: "📷", label: "AR",          bg: "#06B6D4", dark: "#0E7490", route: "ar" },
  tournament: { icon: "🏆", label: "Tournament", bg: "#A855F7", dark: "#6B21A8", route: "tournament" },
  practice:   { icon: "🎯", label: "Practice",   bg: "#22C55E", dark: "#166534", route: "practice" },
};

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
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);

  const { data: chests } = useUserChests();
  const startUnlock = useStartUnlock();
  const collectChest = useCollectChest();

  // Tick for chest timers
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Onboarding
  useEffect(() => {
    const seen = localStorage.getItem("hc_onboarding_done");
    if (!seen) setShowOnboarding(true);
  }, []);

  // Profile + notifications
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

  // Device tilt for parallax
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        setTiltX(Math.max(-15, Math.min(15, e.gamma * 0.3)));
        setTiltY(Math.max(-10, Math.min(10, (e.beta - 45) * 0.2)));
      }
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

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

  // Parallax multiplier based on Z-depth
  const tiltStyle = (zDepth: number) => ({
    transform: `translate(${tiltX * (zDepth / 100)}px, ${tiltY * (zDepth / 100)}px)`,
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#080818",
      }}
    >
      {/* ═══ THE 3D SCENE ═══ */}
      <div style={{ position: "absolute", inset: 0 }}>

        {/* ── LAYER 1: Background image with parallax tilt ── */}
        <div
          style={{
            position: "absolute",
            inset: "-5%",
            transform: `translate(${tiltX * 2}px, ${tiltY * 2}px) scale(1.1)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          <img
            src={gullyBg}
            alt="Gully Grounds"
            className="w-full h-full"
            style={{ objectFit: "cover", objectPosition: "center 30%" }}
          />
        </div>

        {/* ── Atmospheric fog + depth gradient ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(to top, rgba(8,8,24,0.97) 0%, rgba(8,8,24,0.6) 25%, transparent 50%),
              radial-gradient(ellipse at 30% 55%, rgba(255,170,80,0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 45%, rgba(200,100,255,0.06) 0%, transparent 40%)
            `,
            pointerEvents: "none",
          }}
        />

        {/* Animated warm light leak */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5], x: [-4, 4, -4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse at 25% 60%, rgba(255,180,100,0.08) 0%, transparent 45%),
              radial-gradient(ellipse at 75% 40%, rgba(255,150,200,0.05) 0%, transparent 35%)
            `,
            pointerEvents: "none",
          }}
        />

        {/* ── LAYER 3: Atmospheric particles (crossing Z depths) ── */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {Array.from({ length: 22 }).map((_, i) => {
            const z = -80 + Math.random() * 200;
            const size = 1.5 + Math.random() * 3;
            const x = Math.random() * 100;
            const y = Math.random() * 75 + 10;
            const dur = 5 + Math.random() * 7;
            const delay = Math.random() * 5;
            const isFirefly = i > 17;
            return (
              <motion.div
                key={`p-${i}`}
                animate={{
                  y: [0, -15 - Math.random() * 20, 0],
                  x: [0, (Math.random() - 0.5) * 20, 0],
                  opacity: isFirefly ? [0.1, 0.8, 0.1] : [0.15, 0.4, 0.15],
                }}
                transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: isFirefly
                    ? "radial-gradient(circle, rgba(255,220,100,0.9), rgba(255,200,50,0.3))"
                    : "rgba(255,210,150,0.5)",
                  boxShadow: isFirefly ? "0 0 8px rgba(255,200,50,0.6)" : "none",
                  // no translateZ in flat mode
                }}
              />
            );
          })}
        </div>

        {/* ── LAYER 4: Character + Platform (at Z:0) ── */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          {/* Character (bat + ball) with idle sway */}
          <motion.div
            animate={{ rotateY: [-3, 3, -3], y: [-2, 2, -2] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              fontSize: 72,
              filter: "drop-shadow(6px 10px 16px rgba(0,0,0,0.6))",
              marginBottom: -10,
            }}
          >
            🏏
          </motion.div>

          {/* Glowing platform — painted on the concrete */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 25px rgba(74,222,80,0.2), 0 0 50px rgba(74,222,80,0.1), inset 0 0 15px rgba(74,222,80,0.15)",
                "0 0 35px rgba(74,222,80,0.35), 0 0 70px rgba(74,222,80,0.15), inset 0 0 25px rgba(74,222,80,0.25)",
                "0 0 25px rgba(74,222,80,0.2), 0 0 50px rgba(74,222,80,0.1), inset 0 0 15px rgba(74,222,80,0.15)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              width: 190,
              height: 48,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(74,222,80,0.2) 0%, rgba(74,222,80,0.05) 60%, transparent 100%)",
              border: "2px solid rgba(74,222,80,0.4)",
              filter: "blur(0.5px)",
            }}
          />

          {/* Arena name */}
          <span
            style={{
              fontFamily: "'Lilita One', sans-serif",
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.5)",
              marginTop: 6,
              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            ⭐ {currentArena.name.toUpperCase()} ⭐
          </span>
        </div>

        {/* ── LAYER 5: Mode Buttons (pushed FORWARD in Z) ── */}

        {/* TAP — Right side, upper */}
        <ModeRibbon
          icon={MODES.tap.icon}
          label={MODES.tap.label}
          bg={MODES.tap.bg}
          dark={MODES.tap.dark}
          side="right"
          top="33%"
          width={150}
          fontSize={24}
          rotateY={-12}
          rotateX={2}
          delay={0}
          onClick={() => handleModeSelect(MODES.tap.route)}
        />

        {/* PVP — Right side, middle */}
        <ModeRibbon
          icon={MODES.pvp.icon}
          label={MODES.pvp.label}
          bg={MODES.pvp.bg}
          dark={MODES.pvp.dark}
          side="right"
          top="43%"
          width={140}
          fontSize={22}
          rotateY={-10}
          rotateX={3}
          delay={0.3}
          onClick={() => handleModeSelect(MODES.pvp.route)}
        />

        {/* AR — Right side, lower */}
        <ModeRibbon
          icon={MODES.ar.icon}
          label={MODES.ar.label}
          bg={MODES.ar.bg}
          dark={MODES.ar.dark}
          side="right"
          top="53%"
          width={130}
          fontSize={20}
          rotateY={-8}
          rotateX={4}
          delay={0.6}
          onClick={() => handleModeSelect(MODES.ar.route)}
        />

        {/* Tournament — Left side */}
        <ModeRibbon
          icon={MODES.tournament.icon}
          label={MODES.tournament.label}
          bg={MODES.tournament.bg}
          dark={MODES.tournament.dark}
          side="left"
          top="42%"
          width={135}
          fontSize={13}
          rotateY={12}
          rotateX={2}
          delay={0.4}
          onClick={() => handleModeSelect(MODES.tournament.route)}
        />

        {/* Practice — Left side, below */}
        <ModeRibbon
          icon={MODES.practice.icon}
          label={MODES.practice.label}
          bg={MODES.practice.bg}
          dark={MODES.practice.dark}
          side="left"
          top="52%"
          width={125}
          fontSize={13}
          rotateY={10}
          rotateX={3}
          delay={0.7}
          onClick={() => handleModeSelect(MODES.practice.route)}
        />

        {/* ── LAYER 6: Side icon buttons ── */}
        {/* Left side */}
        {[
          { icon: "🏆", label: "Rank", top: "24%", action: () => navigate("/leaderboard") },
          { icon: "🎯", label: "Quests", top: "32%", badge: "3", action: () => navigate("/daily-rewards") },
          { icon: "💬", label: "Chat", top: "40%", action: () => navigate("/friends") },
        ].map((item, i) => (
          <SideIconButton key={`l-${i}`} {...item} side="left" />
        ))}

        {/* Right side */}
        {[
          { icon: "✉️", label: "Mail", top: "24%", action: () => navigate("/notifications") },
          { icon: "🃏", label: "Cards", top: "32%", action: () => navigate("/collection") },
        ].map((item, i) => (
          <SideIconButton key={`r-${i}`} {...item} side="right" />
        ))}

        {/* Floating sky collectibles */}
        {[
          { emoji: "🏏", x: "20%", y: "12%", dur: 6 },
          { emoji: "🪙", x: "75%", y: "8%", dur: 5 },
          { emoji: "✨", x: "55%", y: "15%", dur: 7 },
        ].map((c, i) => (
          <motion.div
            key={`sky-${i}`}
            animate={{ y: [0, -10, 0], rotate: [0, 360] }}
            transition={{ duration: c.dur, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              fontSize: 22,
              opacity: 0.5,
              filter: "drop-shadow(0 0 6px rgba(255,200,50,0.5))",
              // decorative floating
              pointerEvents: "none",
            }}
          >
            {c.emoji}
          </motion.div>
        ))}

        {/* More Modes button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/play")}
          style={{
            position: "absolute",
            bottom: "22%",
            left: "50%",
            transform: "translateX(-50%) perspective(600px) rotateX(5deg)",
            background: "linear-gradient(180deg, #8B7355, #6B5335)",
            border: "2px solid #5A4225",
            borderBottom: "4px solid #4A3215",
            borderRadius: 8,
            padding: "7px 18px",
            color: "#F5DEB3",
            fontFamily: "'Lilita One', sans-serif",
            fontSize: 12,
            letterSpacing: "0.05em",
            boxShadow: "4px 6px 12px rgba(0,0,0,0.5)",
            cursor: "pointer",
            zIndex: 20,
          }}
        >
          More Modes ▼
        </motion.button>
      </div>

      {/* ═══ HUD OVERLAY (Flat HTML on top of 3D scene) ═══ */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50 }}>

        {/* Top HUD — Player info + currencies */}
        <div
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "env(safe-area-inset-top, 8px) 12px 6px",
            background: "rgba(8,8,24,0.5)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Avatar + name */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4ADE50, #22C55E)",
                border: "2px solid rgba(74,222,80,0.6)",
                boxShadow: "0 0 10px rgba(74,222,80,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
                color: "white",
                position: "relative",
              }}
            >
              {playerName[0]?.toUpperCase()}
              <span
                style={{
                  position: "absolute",
                  bottom: -3,
                  right: -3,
                  fontSize: 9,
                  background: "#0F172A",
                  border: "1.5px solid rgba(74,222,80,0.6)",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4ADE50",
                  fontWeight: 700,
                }}
              >
                {playerLevel}
              </span>
            </div>
            <div>
              <div style={{ fontFamily: "'Bungee', sans-serif", fontSize: 12, color: "white" }}>{playerName}</div>
              <div style={{ width: 60, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", marginTop: 2 }}>
                <div style={{ height: "100%", borderRadius: 2, background: "#4ADE50", width: `${((profile?.xp ?? 0) % 500) / 5}%` }} />
              </div>
            </div>
          </div>

          {/* Currencies */}
          <div className="flex items-center gap-2">
            <CurrencyPill icon="🏏" value={profile?.total_matches ?? 0} />
            <CurrencyPill icon="🪙" value={profile?.coins ?? 0} plus />
            <CurrencyPill icon="💎" value={45} plus />
          </div>

          {/* Utility icons */}
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/notifications")} className="relative" style={{ color: "rgba(255,255,255,0.7)" }}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4, width: 14, height: 14,
                  borderRadius: "50%", background: "#EF4444", fontSize: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700,
                }}>{unreadCount}</span>
              )}
            </button>
            <button onClick={() => navigate("/settings")} style={{ color: "rgba(255,255,255,0.7)" }}>
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Bottom area — Chest slots + Arena progress */}
        <div
          style={{
            pointerEvents: "auto",
            position: "absolute",
            bottom: "calc(68px + env(safe-area-inset-bottom, 0px))",
            left: 0,
            right: 0,
            background: "rgba(8,8,24,0.75)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "8px 12px 6px",
          }}
        >
          {/* Chest slots */}
          <div className="flex justify-center gap-3 mb-2">
            {chestSlots.map((chest, i) => {
              const chestInfo = chest ? CRICKET_CHEST[chest.chest_tier] || CRICKET_CHEST.bronze : null;
              const isReady = chest && (chest.status === "ready" || (chest.status === "unlocking" && chestTimeRemaining(chest) <= 0));
              const isUnlocking = chest?.status === "unlocking" && chestTimeRemaining(chest) > 0;

              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleChestTap(chest)}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 10,
                    background: chest
                      ? "linear-gradient(180deg, rgba(92,64,30,0.6), rgba(60,40,18,0.8))"
                      : "rgba(255,255,255,0.05)",
                    border: isReady
                      ? `2px solid ${chestInfo?.color}`
                      : "1.5px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isReady
                      ? `0 0 12px ${chestInfo?.color}60, inset 0 2px 6px rgba(0,0,0,0.4)`
                      : "inset 0 2px 6px rgba(0,0,0,0.4), 2px 4px 8px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <span style={{ fontSize: chest ? 22 : 18, opacity: chest ? 1 : 0.3 }}>
                    {chest ? chestInfo?.icon : "+"}
                  </span>
                  {isUnlocking && (
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>
                      {formatTime(chestTimeRemaining(chest))}
                    </span>
                  )}
                  {isReady && (
                    <span style={{ fontSize: 7, color: "#4ADE50", fontWeight: 700, marginTop: 1 }}>OPEN!</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Arena progress */}
          <div>
            <div className="flex justify-between items-center" style={{ fontSize: 9, marginBottom: 3 }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Lilita One', sans-serif" }}>
                🏏 {currentArena.name}
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>
                → {nextArena.name}
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(arenaProgress, 100)}%` }}
                style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #4ADE50, #22C55E)" }}
              />
            </div>
            <div style={{ textAlign: "center", fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              🏆 {currentTrophies}/{nextArena.trophies}
            </div>
          </div>
        </div>
      </div>

      {/* Stump shatter overlay */}
      <StumpHitAnimation show={showStumpAnim} onComplete={handleStumpComplete} />

      {/* Chest reveal overlay */}
      {revealData && (
        <ChestReveal
          itemName={revealData.name}
          itemEmoji={revealData.emoji}
          rarity={revealData.rarity}
          onComplete={() => setRevealData(null)}
        />
      )}

      <style>{``}</style>
    </div>
  );
}

/* ═══════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════ */

function ModeRibbon({
  icon, label, bg, dark, side, top, width, fontSize, rotateY, rotateX, delay, onClick,
}: {
  icon: string; label: string; bg: string; dark: string;
  side: "left" | "right"; top: string; width: number;
  fontSize: number; rotateY: number; rotateX: number; delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: side === "right" ? 60 : -60 }}
      animate={{
        opacity: 1,
        x: 0,
        rotate: [-1.5, 1.5, -1.5],
        y: [-2, 3, -2],
      }}
      transition={{
        opacity: { delay, duration: 0.4 },
        x: { delay, duration: 0.5, type: "spring" },
        rotate: { delay: delay + 0.5, duration: 3.5, repeat: Infinity, ease: "easeInOut" },
        y: { delay: delay + 0.3, duration: 3, repeat: Infinity, ease: "easeInOut" },
      }}
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      style={{
        position: "absolute",
        [side]: 10,
        top,
        transform: `perspective(800px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
        transformStyle: "preserve-3d",
        cursor: "pointer",
        zIndex: 20,
        // No default button styles
        background: "none",
        border: "none",
        padding: 0,
      }}
    >
      {/* Front face */}
      <div
        style={{
          width,
          padding: "10px 14px",
          background: `linear-gradient(145deg, ${bg}ee, ${bg}cc)`,
          borderRadius: 12,
          // 3D thickness
          borderBottom: `5px solid ${dark}`,
          borderRight: side === "right" ? `3px solid ${dark}` : "none",
          borderLeft: side === "left" ? `3px solid ${dark}` : "none",
          boxShadow: `
            6px 10px 20px rgba(0,0,0,0.5),
            0 0 20px ${bg}22,
            inset 0 2px 0 rgba(255,255,255,0.25),
            inset 0 -1px 0 rgba(0,0,0,0.2)
          `,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          // Warm scene light reflection
          backgroundImage: "linear-gradient(180deg, rgba(255,200,150,0.1) 0%, transparent 40%)",
          position: "relative",
        }}
      >
        <span style={{ fontSize: fontSize * 0.8 }}>{icon}</span>
        <span
          style={{
            fontFamily: "'Bungee', sans-serif",
            fontSize,
            color: "white",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            letterSpacing: "0.03em",
          }}
        >
          {label}
        </span>
      </div>
    </motion.button>
  );
}

function SideIconButton({
  icon, label, top, side, badge, action,
}: {
  icon: string; label: string; top: string; side: "left" | "right";
  badge?: string; action: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 1.1 }}
      onClick={action}
      style={{
        position: "absolute",
        [side]: 8,
        top,
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: "rgba(10,15,30,0.5)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1.5px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        color: "rgba(255,255,255,0.7)",
        boxShadow: "4px 6px 14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 8px rgba(255,180,100,0.05)",
        cursor: "pointer",
        // side icon button
        zIndex: 15,
        // Reset button defaults
        padding: 0,
      }}
    >
      {icon}
      {badge && (
        <span
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#EF4444",
            fontSize: 9,
            fontWeight: 700,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {badge}
        </span>
      )}
    </motion.button>
  );
}

function CurrencyPill({ icon, value, plus }: { icon: string; value: number; plus?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        padding: "3px 8px",
        borderRadius: 20,
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontSize: 11,
        color: "rgba(255,255,255,0.85)",
      }}
    >
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span style={{ fontWeight: 600, fontFamily: "'Rubik', sans-serif" }}>{value}</span>
      {plus && <span style={{ color: "#4ADE50", fontWeight: 700, fontSize: 10 }}>+</span>}
    </div>
  );
}
