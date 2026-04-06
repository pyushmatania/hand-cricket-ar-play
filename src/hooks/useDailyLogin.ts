import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/* ── 7-day weekly streak bonuses (displayed in streak strip) ── */
const STREAK_REWARDS = [
  { day: 1, xp: 10, coins: 20, label: "Day 1" },
  { day: 2, xp: 15, coins: 30, label: "Day 2" },
  { day: 3, xp: 25, coins: 50, label: "Day 3" },
  { day: 4, xp: 30, coins: 60, label: "Day 4" },
  { day: 5, xp: 40, coins: 80, label: "Day 5" },
  { day: 6, xp: 50, coins: 100, label: "Day 6" },
  { day: 7, xp: 100, coins: 200, label: "Day 7 🔥" },
];

/* ── 28-day escalating calendar rewards ── */
function getCalendarReward(cycleDay: number): { coins: number; xp: number; bonus: string } {
  const isMilestone = cycleDay === 14 || cycleDay === 28;
  const isWeekEnd = cycleDay % 7 === 0;
  const isMidWeek = cycleDay % 7 === 4;
  const week = Math.ceil(cycleDay / 7);

  if (isMilestone) return { coins: 500, xp: 200, bonus: cycleDay === 28 ? "🏆 MONTHLY JACKPOT!" : "👑 MEGA CHEST!" };
  if (isWeekEnd) return { coins: 200, xp: 100, bonus: "🎁 Weekly Chest!" };
  if (isMidWeek) return { coins: 100, xp: 50, bonus: "💎 Gem Bonus!" };
  return { coins: 20 + (week - 1) * 10, xp: 10 + (week - 1) * 5, bonus: "" };
}

export function useDailyLogin() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [todayClaimed, setTodayClaimed] = useState(false);
  const [reward, setReward] = useState<{ xp: number; coins: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    checkAndClaimLogin();
  }, [user]);

  const checkAndClaimLogin = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("login_streak, last_login_date, best_login_streak, xp, coins")
      .eq("user_id", user.id)
      .single();

    if (!profile) return;

    const p = profile as any;
    const today = new Date().toISOString().split("T")[0];
    const lastLogin = p.last_login_date;

    if (lastLogin === today) {
      setStreak(p.login_streak || 0);
      setBestStreak(p.best_login_streak || 0);
      setTodayClaimed(true);
      return;
    }

    // Calculate new streak
    let newStreak = 1;
    if (lastLogin) {
      const lastDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak = (p.login_streak || 0) + 1;
      }
    }

    // Escalating calendar reward based on 28-day cycle
    const cycleDay = ((newStreak - 1) % 28) + 1;
    const calReward = getCalendarReward(cycleDay);

    // Weekly streak bonus stacks on top
    const weekDay = ((newStreak - 1) % 7) + 1;
    const streakBonus = STREAK_REWARDS.find(r => r.day === weekDay) || STREAK_REWARDS[0];

    const totalCoins = calReward.coins + streakBonus.coins;
    const totalXp = calReward.xp + streakBonus.xp;

    const newBest = Math.max(p.best_login_streak || 0, newStreak);
    const newXp = (p.xp || 0) + totalXp;
    const newCoins = (p.coins || 0) + totalCoins;

    await supabase.from("profiles").update({
      login_streak: newStreak,
      last_login_date: today,
      best_login_streak: newBest,
      xp: newXp,
      coins: newCoins,
    } as any).eq("user_id", user.id);

    setStreak(newStreak);
    setBestStreak(newBest);
    setTodayClaimed(true);
    setReward({ xp: totalXp, coins: totalCoins });

    const bonusText = calReward.bonus ? ` ${calReward.bonus}` : "";
    toast.success(`🔥 Day ${newStreak} streak! +${totalXp} XP +${totalCoins} coins${bonusText}`);
  };

  return { streak, bestStreak, todayClaimed, reward, STREAK_REWARDS };
}
