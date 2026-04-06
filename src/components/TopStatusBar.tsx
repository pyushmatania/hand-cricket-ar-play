import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileStats {
  total_matches: number;
  wins: number;
  current_streak: number;
  display_name: string;
  xp?: number;
  coins?: number;
  rank_tier?: string;
}

const RANK_ICONS: Record<string, string> = {
  Bronze: "🥉", Silver: "🥈", Gold: "🥇", Platinum: "💎", Diamond: "💠", Master: "👑", Legend: "🏅",
};

const CONCRETE_CARD = "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 11%) 100%)";
const CHROME_BORDER = "2px solid hsl(25 20% 22%)";

export default function TopStatusBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("total_matches, wins, current_streak, display_name, xp, coins, rank_tier")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setStats(data as unknown as ProfileStats);
      });

    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count }) => {
        setUnreadCount(count || 0);
      });
  }, [user]);

  const level = stats ? Math.floor(stats.total_matches / 5) + 1 : 1;
  const xpProgress = stats ? ((stats.total_matches % 5) / 5) * 100 : 0;
  const coins = stats?.coins ?? (stats ? stats.wins * 50 : 0);
  const rankIcon = RANK_ICONS[stats?.rank_tier || "Bronze"] || "🥉";

  return (
    <div className="relative z-20 px-3 pt-3 pb-1">
      {/* Main bar */}
      <div className="flex items-center gap-2">

        {/* Player avatar + level + XP */}
        <button
          onClick={() => navigate(user ? "/profile" : "/auth")}
          className="relative flex items-center gap-2 flex-shrink-0 active:scale-95 transition-transform"
        >
          <div className="relative">
            {/* Avatar ring — concrete with chrome border */}
            <div className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: CONCRETE_CARD,
                border: "2.5px solid hsl(35 40% 45%)",
                boxShadow: "0 3px 0 hsl(25 20% 6%), 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 hsl(35 40% 40% / 0.15)",
              }}>
              <span className="text-lg">{user ? "🏏" : "👤"}</span>
            </div>
            {/* Level badge - 3D pill */}
            <div className="absolute -bottom-1 -right-1.5 px-1.5 py-0.5 rounded-full"
              style={{
                background: "linear-gradient(to bottom, hsl(207,90%,54%), hsl(207,90%,40%))",
                border: "2px solid hsl(207,90%,30%)",
                borderBottom: "3px solid hsl(207,90%,25%)",
                boxShadow: "0 2px 6px hsl(207 90% 54% / 0.4)",
              }}>
              <span className="font-display text-[7px] text-white leading-none">{level}</span>
            </div>
          </div>

          {/* Name + XP bar */}
          <div className="flex flex-col gap-1">
            <span className="font-display text-[10px] tracking-wider text-foreground leading-none">
              {stats?.display_name || "PLAYER"}
            </span>
            <div className="relative w-16 h-[6px] rounded-full overflow-hidden"
              style={{
                background: "linear-gradient(to bottom, hsl(25 15% 10%), hsl(25 15% 14%))",
                border: "1px solid hsl(25 20% 18%)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
              }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(to right, hsl(134 61% 58%), hsl(51 100% 50%))",
                  boxShadow: "0 0 6px hsl(134 61% 58% / 0.5)",
                }}
              />
            </div>
          </div>
        </button>

        <div className="flex-1" />

        {/* Streak fire badge */}
        {stats && stats.current_streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 px-2 py-1 rounded-xl"
            style={{
              background: CONCRETE_CARD,
              border: CHROME_BORDER,
              borderBottom: "3px solid hsl(25 20% 8%)",
              boxShadow: "0 2px 8px hsl(0 84% 60% / 0.15), inset 0 1px 0 hsl(35 40% 40% / 0.08)",
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-xs"
            >🔥</motion.span>
            <span className="font-display text-[10px] leading-none" style={{ color: "hsl(0,84%,65%)" }}>{stats.current_streak}</span>
          </motion.div>
        )}

        {/* Coins - 3D concrete pill */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/shop")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{
            background: CONCRETE_CARD,
            border: CHROME_BORDER,
            borderBottom: "3px solid hsl(25 20% 8%)",
            boxShadow: "0 3px 0 hsl(25 20% 6%), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 hsl(35 40% 40% / 0.08)",
          }}
        >
          <motion.span
            animate={{ rotateY: [0, 360] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="text-sm inline-block"
          >🪙</motion.span>
          <span className="font-display text-[10px] leading-none" style={{ color: "hsl(51,100%,60%)" }}>
            {coins >= 1000 ? `${(coins / 1000).toFixed(1)}K` : coins}
          </span>
          <span className="text-[10px] opacity-40">+</span>
        </motion.button>

        {/* Notification bell */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => navigate("/notifications")}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: unreadCount > 0
              ? "linear-gradient(180deg, hsl(0 84% 60% / 0.12), hsl(25 18% 14%))"
              : CONCRETE_CARD,
            border: CHROME_BORDER,
            borderBottom: "3px solid hsl(25 20% 8%)",
            boxShadow: unreadCount > 0
              ? "0 3px 0 hsl(25 20% 6%), 0 2px 10px hsl(0 84% 60% / 0.15), inset 0 1px 0 hsl(35 40% 40% / 0.08)"
              : "0 3px 0 hsl(25 20% 6%), 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 hsl(35 40% 40% / 0.08)",
          }}
        >
          <motion.span
            animate={unreadCount > 0 ? { rotate: [0, 15, -15, 10, -10, 0] } : {}}
            transition={{ repeat: unreadCount > 0 ? Infinity : 0, duration: 2, repeatDelay: 3 }}
            className="text-base"
          >🔔</motion.span>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(to bottom, hsl(0,84%,58%), hsl(0,84%,45%))",
                border: "2px solid hsl(25 15% 11%)",
                borderBottom: "2.5px solid hsl(0,84%,35%)",
                boxShadow: "0 2px 6px hsl(0 84% 58% / 0.5)",
              }}
            >
              <span className="font-display text-[7px] text-white leading-none">{unreadCount > 9 ? "9+" : unreadCount}</span>
            </motion.div>
          )}
        </motion.button>

        {/* Settings gear */}
        <motion.button
          whileTap={{ scale: 0.85, rotate: 90 }}
          onClick={() => navigate("/settings")}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: CONCRETE_CARD,
            border: CHROME_BORDER,
            borderBottom: "3px solid hsl(25 20% 8%)",
            boxShadow: "0 3px 0 hsl(25 20% 6%), 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 hsl(35 40% 40% / 0.08)",
          }}
        >
          <span className="text-base opacity-60">⚙️</span>
        </motion.button>
      </div>
    </div>
  );
}