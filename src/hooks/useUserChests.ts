import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserChest {
  id: string;
  user_id: string;
  slot_index: number;
  chest_tier: string;
  status: string; // locked | unlocking | ready | empty
  unlock_started_at: string | null;
  unlock_duration_seconds: number;
  created_at: string;
  updated_at: string;
}

// Chest unlock durations (seconds) by tier
export const CHEST_DURATIONS: Record<string, number> = {
  bronze: 30,       // 30s for testing (would be 3h in production)
  silver: 60,
  gold: 180,
  platinum: 480,
  diamond: 720,
  champion: 1440,
  war: 2880,
};

// Cards awarded per chest tier
export const CHEST_REWARDS: Record<string, { minCards: number; maxCards: number; minCoins: number; maxCoins: number; guaranteedRarity?: string }> = {
  bronze: { minCards: 2, maxCards: 4, minCoins: 50, maxCoins: 100 },
  silver: { minCards: 3, maxCards: 6, minCoins: 100, maxCoins: 200 },
  gold: { minCards: 4, maxCards: 8, minCoins: 200, maxCoins: 400, guaranteedRarity: "rare" },
  platinum: { minCards: 5, maxCards: 10, minCoins: 300, maxCoins: 600, guaranteedRarity: "rare" },
  diamond: { minCards: 6, maxCards: 12, minCoins: 500, maxCoins: 1000, guaranteedRarity: "epic" },
  champion: { minCards: 8, maxCards: 15, minCoins: 800, maxCoins: 1500, guaranteedRarity: "legendary" },
  war: { minCards: 10, maxCards: 20, minCoins: 1000, maxCoins: 2000, guaranteedRarity: "legendary" },
};

export function useUserChests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_chests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_chests")
        .select("*")
        .eq("user_id", user!.id)
        .order("slot_index");
      if (error) throw error;
      return data as UserChest[];
    },
    enabled: !!user,
  });
}

export function useStartUnlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (chestId: string) => {
      const { error } = await supabase
        .from("user_chests")
        .update({
          status: "unlocking",
          unlock_started_at: new Date().toISOString(),
        })
        .eq("id", chestId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_chests"] }),
  });
}

export function useCollectChest() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (chest: UserChest) => {
      const rewards = CHEST_REWARDS[chest.chest_tier] || CHEST_REWARDS.bronze;
      const cardCount = Math.floor(Math.random() * (rewards.maxCards - rewards.minCards + 1)) + rewards.minCards;
      const coinReward = Math.floor(Math.random() * (rewards.maxCoins - rewards.minCoins + 1)) + rewards.minCoins;

      // Get random players to award
      const { data: allPlayers } = await supabase.from("players").select("id, rarity").limit(200);
      if (!allPlayers?.length) throw new Error("No players available");

      // Weight by rarity
      const rarityWeight: Record<string, number> = { common: 40, rare: 30, epic: 20, legendary: 8, mythic: 2 };
      const weighted = allPlayers.flatMap(p => {
        const w = rarityWeight[p.rarity || "common"] || 1;
        return Array(w).fill(p);
      });

      const awardedPlayerIds: string[] = [];
      for (let i = 0; i < cardCount; i++) {
        const pick = weighted[Math.floor(Math.random() * weighted.length)];
        awardedPlayerIds.push(pick.id);
      }

      // Upsert user_cards
      for (const playerId of awardedPlayerIds) {
        const { data: existing } = await supabase
          .from("user_cards")
          .select("id, card_count")
          .eq("user_id", user!.id)
          .eq("player_id", playerId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("user_cards")
            .update({ card_count: existing.card_count + 1 })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("user_cards")
            .insert({ user_id: user!.id, player_id: playerId, card_count: 1 });
        }
      }

      // Award coins
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins")
        .eq("user_id", user!.id)
        .single();
      if (profile) {
        await supabase
          .from("profiles")
          .update({ coins: profile.coins + coinReward })
          .eq("user_id", user!.id);
      }

      // Remove chest from slot
      await supabase.from("user_chests").delete().eq("id", chest.id);

      return { cardCount, coinReward, playerIds: awardedPlayerIds };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_chests"] });
      qc.invalidateQueries({ queryKey: ["user_cards"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/** Compute remaining seconds for an unlocking chest */
export function chestTimeRemaining(chest: UserChest): number {
  if (chest.status !== "unlocking" || !chest.unlock_started_at) return 0;
  const started = new Date(chest.unlock_started_at).getTime();
  const elapsed = (Date.now() - started) / 1000;
  return Math.max(0, chest.unlock_duration_seconds - elapsed);
}
