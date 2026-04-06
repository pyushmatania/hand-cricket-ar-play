import { useState, useMemo } from "react";
import stoneDailyRewardsImg from "@/assets/ui/stone-dailyrewards.png";
import StoneHeader from "@/components/shared/StoneHeader";
import { SFX, Haptics } from "@/lib/sounds";
import engines from "@/engines/EngineManager";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDailyLogin } from "@/hooks/useDailyLogin";
import TopStatusBar from "@/components/TopStatusBar";

/* ── V10 Material Constants ── */
const V11_BG = "linear-gradient(180deg, #1A0E05 0%, #0D0704 100%)";
const V11_CARD = "linear-gradient(180deg, #5C3A1E 0%, #3E2410 100%)";
const ROPE_DIVIDER = "repeating-linear-gradient(90deg, #8B7355 0px, #8B7355 8px, transparent 8px, transparent 14px)";

/* ──── Reward Calendar Data (28-day cycle) ──── */
interface DayReward {
  day: number;
  coins: number;
  xp: number;
  type: "coins" | "chest" | "gems" | "mega_chest";
  icon: string;
  premium?: { coins: number; xp: number; icon: string };
}

function buildCalendar(): DayReward[] {
  const days: DayReward[] = [];
  for (let d = 1; d <= 28; d++) {
    const isWeekEnd = d % 7 === 0;
    const isMilestone = d === 14 || d === 28;
    const isMidWeek = d % 7 === 4;

    let type: DayReward["type"] = "coins";
    let icon = "🪙";
    let coins = 20 + Math.floor(d / 7) * 10;
    let xp = 10 + Math.floor(d / 7) * 5;

    if (isMilestone) {
      type = "mega_chest"; icon = "👑"; coins = 500; xp = 200;
    } else if (isWeekEnd) {
      type = "chest"; icon = "🎁"; coins = 200; xp = 100;
    } else if (isMidWeek) {
      type = "gems"; icon = "💎"; coins = 100; xp = 50;
    }

    days.push({
      day: d, coins, xp, type, icon,
      premium: { coins: coins * 2, xp: xp * 2, icon: type === "mega_chest" ? "🏆" : type === "chest" ? "✨" : "💰" },
    });
  }
  return days;
}

const CALENDAR = buildCalendar();

const TYPE_COLORS: Record<string, string> = {
  coins: "hsl(51,100%,50%)",
  chest: "hsl(122,39%,49%)",
  gems: "hsl(291,47%,51%)",
  mega_chest: "hsl(43,96%,56%)",
};

/* ──── Chest Opening Animation ──── */
function ChestOpenOverlay({ reward, onClose }: { reward: DayReward; onClose: () => void }) {
  const color = TYPE_COLORS[reward.type];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="rounded-3xl p-8 text-center max-w-[280px] w-full relative overflow-hidden"
        style={{
          background: V11_CARD,
          border: `2px solid ${color}50`,
          borderBottom: `5px solid ${color}30`,
          boxShadow: `0 8px 40px ${color}40, 0 4px 12px rgba(0,0,0,0.4)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 60px ${color}15, 0 0 40px ${color}20` }}
        />

        <motion.span
          initial={{ y: -20, scale: 0 }} animate={{ y: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 10 }}
          className="text-6xl block mb-4"
        >
          {reward.icon}
        </motion.span>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <span className="font-display text-lg tracking-wider block mb-1" style={{ color }}>
            DAY {reward.day} REWARD!
          </span>
          <span className="text-[10px] text-muted-foreground font-body block mb-4">
            {reward.type === "mega_chest" ? "MEGA CHEST UNLOCKED!" : reward.type === "chest" ? "CHEST UNLOCKED!" : "DAILY BONUS"}
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.3, delay: 0.8 }}
              className="font-score text-2xl font-black block leading-none" style={{ color: "hsl(51,100%,60%)" }}>
              +{reward.coins}
            </motion.span>
            <span className="text-[8px] text-muted-foreground font-display tracking-widest">COINS</span>
          </div>
          <div className="w-px h-8" style={{ background: `${color}30` }} />
          <div className="text-center">
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.3, delay: 0.9 }}
              className="font-score text-2xl font-black block leading-none" style={{ color: "hsl(207,90%,60%)" }}>
              +{reward.xp}
            </motion.span>
            <span className="text-[8px] text-muted-foreground font-display tracking-widest">XP</span>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          whileTap={{ scale: 0.95, y: 2 }}
          onClick={onClose}
          className="px-8 py-3 rounded-2xl font-display text-sm tracking-wider relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${color}, ${color}cc)`,
            border: `2px solid ${color}60`,
            borderBottom: `5px solid ${color}50`,
            color: "white",
            boxShadow: `0 4px 16px ${color}40`,
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
          <span className="relative z-10">COLLECT</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   DAILY REWARDS PAGE — Doc 1 Material System
   ══════════════════════════════════════════════ */
export default function DailyRewardsPage() {
  const navigate = useNavigate();
  const { streak, todayClaimed, STREAK_REWARDS } = useDailyLogin();
  const [showPremium, setShowPremium] = useState(false);
  const [openingReward, setOpeningReward] = useState<DayReward | null>(null);

  const cycleDay = ((streak - 1) % 28) + 1;
  const currentWeek = Math.ceil(cycleDay / 7);

  const weeks = useMemo(() => {
    const w: DayReward[][] = [];
    for (let i = 0; i < 4; i++) {
      w.push(CALENDAR.slice(i * 7, (i + 1) * 7));
    }
    return w;
  }, []);

  const handleDayClaim = (day: DayReward) => {
    if (day.day === cycleDay && todayClaimed) {
      SFX.chestOpen();
      Haptics.chestOpen();
      engines.sound.playEffect('chest_unlock');
      if (day.type === 'mega_chest') {
        setTimeout(() => engines.sound.playEffect('card_legendary_reveal'), 400);
      } else {
        setTimeout(() => engines.sound.playEffect('coin_collect'), 300);
      }
      setOpeningReward(day);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-24" style={{ background: V11_BG }}>
      {/* Leather grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ display: "none" }} />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(220 18% 4% / 0.7) 100%)" }} />

      <TopStatusBar />

      <AnimatePresence>
        {openingReward && <ChestOpenOverlay reward={openingReward} onClose={() => setOpeningReward(null)} />}
      </AnimatePresence>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-3">

        {/* ═══ Header — Floodlight Chrome ═══ */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-body text-sm text-foreground"
            style={{
              background: "linear-gradient(180deg, hsl(220 15% 16%) 0%, hsl(220 12% 10%) 100%)",
              border: "2px solid hsl(43 50% 35%)",
              boxShadow: "0 3px 0 hsl(220 15% 8%), inset 0 1px 0 hsl(43 40% 45% / 0.3)",
            }}>
            ←
          </motion.button>
          <div className="flex-1">
            <StoneHeader src={stoneDailyRewardsImg} alt="Daily Rewards" height={30} />
            <span className="text-[9px] text-muted-foreground font-display tracking-[0.2em]">
              DAY {cycleDay} OF 28 • WEEK {currentWeek}
            </span>
          </div>
          {/* Streak badge — Floodlight Chrome */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{
              background: "linear-gradient(180deg, hsl(4 50% 22%), hsl(4 40% 15%))",
              border: "2px solid hsl(4 60% 35%)",
              borderBottom: "4px solid hsl(4 40% 18%)",
              boxShadow: "0 3px 8px hsl(4 90% 58% / 0.2)",
            }}>
            <span className="text-sm">🔥</span>
            <span className="font-score text-sm font-black" style={{ color: "hsl(4,90%,65%)" }}>{streak}</span>
          </div>
        </motion.div>

        {/* ═══ Monthly Progress — Stadium Concrete ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-4 mb-4"
          style={{
            background: V11_CARD,
            border: "2px solid hsl(43 50% 35% / 0.3)",
            borderBottom: "5px solid hsl(220 15% 8%)",
            boxShadow: "0 3px 8px hsl(0 0% 0% / 0.3)",
          }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-[10px] tracking-wider text-foreground">MONTHLY PROGRESS</span>
            <span className="font-score text-sm font-black" style={{ color: "hsl(43 90% 55%)" }}>
              {Math.round((cycleDay / 28) * 100)}%
            </span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{
            background: "linear-gradient(180deg, hsl(220 15% 8%), hsl(220 12% 10%))",
            border: "1px solid hsl(220 15% 6%)",
            boxShadow: "inset 0 1px 3px hsl(0 0% 0% / 0.5)",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(cycleDay / 28) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(142 71% 50%), hsl(43 90% 55%), hsl(43 96% 56%))",
                boxShadow: "0 0 8px hsl(43 90% 55% / 0.4)",
              }}
            />
            {[7, 14, 21, 28].map(m => (
              <div key={m} className="absolute top-0 bottom-0 w-[2px]" style={{
                left: `${(m / 28) * 100}%`,
                background: cycleDay >= m ? "hsl(43 90% 65%)" : "hsl(220 15% 16%)",
              }} />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {[7, 14, 21, 28].map(m => (
              <span key={m} className="text-[7px] font-display tracking-wider"
                style={{ color: cycleDay >= m ? "hsl(43 90% 55%)" : "hsl(220 15% 35%)" }}>
                {m === 7 ? "🎁" : m === 14 ? "👑" : m === 21 ? "🎁" : "🏆"} D{m}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ═══ Pass Toggle — Jersey Mesh Tabs ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex gap-1 mb-4 rounded-2xl p-1"
          style={{
            background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 10%) 100%)",
            border: "1px solid hsl(220 15% 18% / 0.6)",
          }}>
          {[
            { id: false, label: "FREE PASS", icon: "🎟️", hue: 207 },
            { id: true, label: "PREMIUM", icon: "👑", hue: 43 },
          ].map(p => (
            <motion.button key={String(p.id)} whileTap={{ scale: 0.95 }}
              onClick={() => setShowPremium(p.id as boolean)}
              className="flex-1 py-2.5 rounded-xl font-display text-[9px] tracking-widest flex items-center justify-center gap-1.5 relative overflow-hidden"
              style={showPremium === p.id ? {
                background: `linear-gradient(180deg, hsl(${p.hue} 70% 50%) 0%, hsl(${p.hue} 60% 38%) 100%)`,
                color: "white",
                borderBottom: `3px solid hsl(${p.hue} 50% 25%)`,
                boxShadow: `0 2px 8px hsl(${p.hue} 80% 45% / 0.3), inset 0 1px 0 hsl(${p.hue} 80% 65% / 0.4)`,
              } : {
                color: "hsl(220 15% 45%)",
                borderBottom: "3px solid transparent",
              }}
            >
              {showPremium === p.id && (
                <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                  style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
              )}
              <span className="text-sm relative z-10">{p.icon}</span>
              <span className="relative z-10">{p.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Chalk divider */}
        <div className="h-px mb-3 mx-2 opacity-20" style={{ background: ROPE_DIVIDER }} />

        {/* ═══ Calendar Grid — Stadium Concrete Day Cards ═══ */}
        {weeks.map((week, wi) => (
          <motion.div key={wi} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + wi * 0.06 }} className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-display text-[8px] tracking-[0.2em]"
                style={{ color: currentWeek === wi + 1 ? "hsl(43 90% 55%)" : "hsl(220 15% 35%)" }}>
                WEEK {wi + 1}
              </span>
              <div className="flex-1 h-px opacity-20" style={{ background: ROPE_DIVIDER }} />
              {wi + 1 < currentWeek && <span className="text-[8px]">✅</span>}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {week.map((day) => {
                const isPast = day.day < cycleDay;
                const isCurrent = day.day === cycleDay;
                const isFuture = day.day > cycleDay;
                const isLocked = isFuture;
                const color = TYPE_COLORS[day.type];
                const reward = showPremium && day.premium ? day.premium : day;

                return (
                  <motion.button
                    key={day.day}
                    whileTap={!isLocked ? { scale: 0.9 } : {}}
                    onClick={() => handleDayClaim(day)}
                    className={`relative rounded-xl p-1.5 text-center day-card-v10 ${
                      isCurrent ? "neon-glow-cyan" : ""
                    }`}
                    style={{
                      background: isCurrent
                        ? "linear-gradient(135deg, rgba(13,18,41,0.88), rgba(19,24,54,0.82))"
                        : isPast
                          ? "hsl(130 40% 18% / 0.12)"
                          : "linear-gradient(180deg, hsl(220 12% 10%), hsl(220 12% 8%))",
                      backdropFilter: isCurrent ? "blur(16px) saturate(1.3)" : undefined,
                      border: isCurrent
                        ? `2px solid ${color}60`
                        : isPast
                          ? "2px solid hsl(130 74% 58% / 0.15)"
                          : "1px solid rgba(148,163,184,0.08)",
                      borderBottom: isCurrent
                        ? `4px solid ${color}30`
                        : isPast
                          ? "4px solid hsl(130 30% 15%)"
                          : "4px solid hsl(220 12% 6%)",
                      opacity: isLocked ? 0.35 : 1,
                    }}
                  >
                    {isCurrent && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{ boxShadow: `inset 0 0 15px ${color}20` }}
                      />
                    )}

                    <span className="text-[7px] font-display tracking-wider block mb-0.5"
                      style={{ color: isCurrent ? color : isPast ? "hsl(142,70%,55%)" : "hsl(220 15% 35%)" }}>
                      D{day.day}
                    </span>

                    <motion.span
                      animate={isCurrent ? { y: [0, -3, 0] } : {}}
                      transition={{ repeat: isCurrent ? Infinity : 0, duration: 1.5 }}
                      className="text-lg block leading-none"
                    >
                      {isPast ? "✅" : isLocked ? "🔒" : (showPremium ? reward.icon : day.icon)}
                    </motion.span>

                    <span className="text-[6px] font-score font-black block mt-0.5"
                      style={{ color: isCurrent ? "hsl(43 90% 55%)" : "hsl(220 15% 35%)" }}>
                      +{reward.coins}
                    </span>

                    {showPremium && !isLocked && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[6px]"
                        style={{ background: "hsl(43,96%,56%)", boxShadow: "0 0 4px hsl(43 96% 56% / 0.5)" }}>
                        ✦
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* ═══ Premium Upsell — Jersey Mesh ═══ */}
        {!showPremium && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl p-4 text-center mb-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(43 40% 15% / 0.3), hsl(43 30% 12% / 0.2))",
              border: "2px solid hsl(43 70% 45% / 0.3)",
              borderBottom: "5px solid hsl(43 50% 20%)",
              boxShadow: "0 3px 12px hsl(0 0% 0% / 0.3)",
            }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(43 90% 55% / 0.5), transparent)" }} />
            <span className="text-3xl block mb-2">👑</span>
            <span className="font-display text-sm tracking-wider block mb-1" style={{ color: "hsl(43 90% 55%)" }}>PREMIUM PASS</span>
            <span className="text-[9px] text-muted-foreground font-body block mb-3">2× rewards on every day • Exclusive cosmetics • Mega chests</span>
            <motion.button whileTap={{ scale: 0.95, y: 2 }}
              className="px-6 py-2.5 rounded-xl font-display text-[10px] tracking-wider relative overflow-hidden"
              style={{
                background: "linear-gradient(180deg, hsl(43 90% 55%), hsl(35 80% 42%))",
                border: "2px solid hsl(43 70% 45% / 0.5)",
                borderBottom: "5px solid hsl(35 60% 28%)",
                color: "hsl(220 18% 6%)",
                boxShadow: "0 4px 16px hsl(43 90% 55% / 0.3)",
              }}>
              <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
              <span className="relative z-10">UNLOCK — 500 🪙</span>
            </motion.button>
          </motion.div>
        )}

        {/* ═══ Streak Bonuses — Stadium Concrete ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl p-4 mb-4"
          style={{
            background: V11_CARD,
            border: "2px solid hsl(4 50% 30% / 0.3)",
            borderBottom: "5px solid hsl(220 15% 8%)",
            boxShadow: "0 3px 8px hsl(0 0% 0% / 0.3)",
          }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full" style={{ background: "hsl(4 90% 58%)" }} />
            <span className="font-display text-[10px] tracking-wider text-foreground">🔥 STREAK BONUSES</span>
          </div>
          <div className="flex gap-1.5">
            {STREAK_REWARDS.map((r, i) => {
              const day = i + 1;
              const cycleDayInWeek = ((streak - 1) % 7) + 1;
              const isPast = day < cycleDayInWeek;
              const isCurrent = day === cycleDayInWeek;

              return (
                <div key={day} className="flex-1 rounded-lg p-1.5 text-center"
                  style={{
                    background: isCurrent
                      ? "hsl(4 50% 20% / 0.3)"
                      : isPast
                        ? "hsl(142 30% 18% / 0.2)"
                        : "linear-gradient(180deg, hsl(220 12% 10%), hsl(220 12% 8%))",
                    border: isCurrent
                      ? "2px solid hsl(4 60% 40% / 0.4)"
                      : "2px solid hsl(220 15% 14%)",
                    borderBottom: isCurrent
                      ? "3px solid hsl(4 40% 22%)"
                      : "3px solid hsl(220 12% 6%)",
                  }}>
                  <span className="text-[10px] block">{isPast ? "✅" : isCurrent ? "🔥" : "🔒"}</span>
                  <span className="text-[6px] font-display tracking-wider block mt-0.5"
                    style={{ color: isCurrent ? "hsl(4,90%,65%)" : isPast ? "hsl(142,70%,55%)" : "hsl(220 15% 35%)" }}>
                    D{day}
                  </span>
                  <span className="text-[5px] font-score font-black block" style={{ color: "hsl(220 15% 40%)" }}>
                    +{r.coins}🪙
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
