import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DailyQuest {
  id: string;
  quest_type: string;
  title: string;
  description: string;
  target_value: number;
  reward_coins: number;
  reward_xp: number;
  icon: string;
}

export interface UserDailyQuest {
  id: string;
  user_id: string;
  quest_id: string;
  quest_date: string;
  current_value: number;
  completed: boolean;
  completed_at: string | null;
}

/** Pick 6 quests for today using a date-based seed */
function pickDailyQuests(allQuests: DailyQuest[], date: string): DailyQuest[] {
  // Simple deterministic shuffle based on date
  const seed = date.split("-").reduce((s, n) => s + parseInt(n, 10), 0);
  const shuffled = [...allQuests].sort((a, b) => {
    const hashA = (a.id.charCodeAt(0) + seed) % 100;
    const hashB = (b.id.charCodeAt(0) + seed) % 100;
    return hashA - hashB;
  });
  return shuffled.slice(0, 6);
}

export function useDailyQuests() {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["daily_quests", user?.id, today],
    queryFn: async () => {
      // Fetch all quest templates
      const { data: allQuests, error: qErr } = await supabase
        .from("daily_quests")
        .select("*");
      if (qErr) throw qErr;

      const todaysQuests = pickDailyQuests(allQuests as DailyQuest[], today);

      // Fetch user progress for today
      const { data: progress } = await supabase
        .from("user_daily_quests")
        .select("*")
        .eq("user_id", user!.id)
        .eq("quest_date", today);

      const progressMap = new Map(
        (progress as UserDailyQuest[] || []).map(p => [p.quest_id, p])
      );

      return todaysQuests.map(q => ({
        quest: q,
        progress: progressMap.get(q.id) || null,
      }));
    },
    enabled: !!user,
  });
}

export function useClaimDailyQuest() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (quest: DailyQuest & { progressId?: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Award coins + xp
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins, xp")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        await supabase.from("profiles").update({
          coins: (profile.coins || 0) + quest.reward_coins,
          xp: (profile.xp || 0) + quest.reward_xp,
        }).eq("user_id", user.id);
      }

      // XP history
      await supabase.from("xp_history").insert({
        user_id: user.id,
        amount: quest.reward_xp,
        source: "daily_quest",
      } as any);

      return { coins: quest.reward_coins, xp: quest.reward_xp };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily_quests"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
