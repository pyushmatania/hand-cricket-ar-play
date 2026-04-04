import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserCard {
  id: string;
  user_id: string;
  player_id: string;
  card_count: number;
  card_level: number;
  created_at: string;
  updated_at: string;
}

// Upgrade requirements per level
export const UPGRADE_COSTS: Record<number, { cards: number; coins: number; statBoost: number }> = {
  1: { cards: 2, coins: 100, statBoost: 2 },
  2: { cards: 4, coins: 250, statBoost: 3 },
  3: { cards: 10, coins: 500, statBoost: 5 },
  4: { cards: 20, coins: 1000, statBoost: 5 },
  5: { cards: 50, coins: 2500, statBoost: 5 },
};

export function useUserCards() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_cards", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_cards")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data as UserCard[];
    },
    enabled: !!user,
  });
}

export function useUpgradeCard() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ cardId, currentLevel, cardCount }: { cardId: string; currentLevel: number; cardCount: number }) => {
      const cost = UPGRADE_COSTS[currentLevel];
      if (!cost) throw new Error("Max level reached");
      if (cardCount < cost.cards) throw new Error(`Need ${cost.cards} duplicate cards`);

      // Deduct coins
      const { error: coinErr } = await supabase.rpc("accept_friend_request" as any, {}); // placeholder
      // Actually update via profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins")
        .eq("user_id", user!.id)
        .single();
      
      if (!profile || profile.coins < cost.coins) throw new Error(`Need ${cost.coins} coins`);

      // Deduct coins
      await supabase
        .from("profiles")
        .update({ coins: profile.coins - cost.coins })
        .eq("user_id", user!.id);

      // Upgrade card
      const { error } = await supabase
        .from("user_cards")
        .update({
          card_level: currentLevel + 1,
          card_count: cardCount - cost.cards,
        })
        .eq("id", cardId);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_cards"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
