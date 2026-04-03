import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SFX, Haptics } from "@/lib/sounds";
import type { Achievement } from "@/lib/achievements";
import AchievementUnlockToast from "./AchievementUnlockToast";

/**
 * Global listener that watches for achievement_unlock notifications
 * and shows a branded toast popup.
 */
export default function AchievementNotificationListener() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);

  // Process queue
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(q => q.slice(1));
      try { SFX.levelUp(); } catch {}
      try { Haptics.heavy(); } catch {}
    }
  }, [current, queue]);

  const handleDone = useCallback(() => {
    setCurrent(null);
  }, []);

  // Listen for realtime notification inserts of type achievement_unlock
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`achievement-notify-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new as { type: string; title: string; message: string; data: any };
          if (n.type !== "achievement_unlock") return;
          
          const achievementData: Achievement = {
            icon: n.data?.icon || "🏅",
            title: n.data?.achievement_title || n.title,
            desc: n.data?.achievement_desc || n.message,
            key: n.data?.achievement_key || "",
            tier: n.data?.achievement_tier || "bronze",
            category: n.data?.achievement_category || "",
            check: () => true,
          };
          
          setQueue(q => [...q, achievementData]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return <AchievementUnlockToast achievement={current} onDone={handleDone} />;
}

/**
 * Imperatively push an achievement toast (used by match saver directly,
 * bypassing realtime for instant feedback).
 */
let _pushAchievement: ((a: Achievement) => void) | null = null;

export function registerAchievementPush(fn: (a: Achievement) => void) {
  _pushAchievement = fn;
}

export function pushAchievementToast(a: Achievement) {
  if (_pushAchievement) _pushAchievement(a);
}
