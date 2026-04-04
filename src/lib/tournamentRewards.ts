import { supabase } from "@/integrations/supabase/client";

export interface TournamentReward {
  xp: number;
  coins: number;
  chestTier: string | null;
}

const PLACEMENT_REWARDS: Record<string, TournamentReward> = {
  // World Cup
  "🏆 WORLD CHAMPION": { xp: 200, coins: 500, chestTier: "legendary" },
  "Runner-Up": { xp: 120, coins: 250, chestTier: "epic" },
  "Semi-Finalist": { xp: 80, coins: 150, chestTier: "gold" },
  "Super 8 Exit": { xp: 50, coins: 80, chestTier: "silver" },
  "Quarter-Finalist": { xp: 50, coins: 80, chestTier: "silver" },

  // Ashes
  "🏆 SERIES WON!": { xp: 180, coins: 400, chestTier: "legendary" },
  "SERIES DRAWN": { xp: 80, coins: 150, chestTier: "gold" },
  "SERIES LOST": { xp: 40, coins: 60, chestTier: "silver" },

  // Knockout Cup & Auction League
  "🏆 CUP CHAMPION": { xp: 150, coins: 350, chestTier: "epic" },
  "🏆 CHAMPION": { xp: 200, coins: 500, chestTier: "legendary" },

  // Cricket Royale
  "Eliminated": { xp: 30, coins: 40, chestTier: "bronze" },
};

// Default reward for unrecognized placements
const DEFAULT_REWARD: TournamentReward = { xp: 25, coins: 30, chestTier: "bronze" };

export function getRewardForPlacement(placement: string): TournamentReward {
  // Check exact match first
  if (PLACEMENT_REWARDS[placement]) return PLACEMENT_REWARDS[placement];

  // Check partial matches
  const lower = placement.toLowerCase();
  if (lower.includes("champion") || lower.includes("won")) return { xp: 200, coins: 500, chestTier: "legendary" };
  if (lower.includes("runner")) return { xp: 120, coins: 250, chestTier: "epic" };
  if (lower.includes("semi")) return { xp: 80, coins: 150, chestTier: "gold" };
  if (lower.includes("quarter")) return { xp: 50, coins: 80, chestTier: "silver" };

  return DEFAULT_REWARD;
}

export async function grantTournamentRewards(userId: string, placement: string, mode: string): Promise<TournamentReward | null> {
  const reward = getRewardForPlacement(placement);

  try {
    // Update profile with XP and coins
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, coins")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile) {
      await supabase
        .from("profiles")
        .update({
          xp: profile.xp + reward.xp,
          coins: profile.coins + reward.coins,
        })
        .eq("user_id", userId);
    }

    // Log XP gain
    await supabase.from("xp_history").insert({
      user_id: userId,
      amount: reward.xp,
      source: `${mode}_tournament`,
    });

    // Award chest if applicable
    if (reward.chestTier) {
      // Find an empty chest slot (0-3)
      const { data: existingChests } = await supabase
        .from("user_chests")
        .select("slot_index")
        .eq("user_id", userId);

      const usedSlots = new Set((existingChests || []).map(c => c.slot_index));
      let freeSlot = -1;
      for (let i = 0; i < 4; i++) {
        if (!usedSlots.has(i)) { freeSlot = i; break; }
      }

      if (freeSlot >= 0) {
        const durations: Record<string, number> = {
          bronze: 300, silver: 1800, gold: 7200, epic: 28800, legendary: 86400,
        };
        await supabase.from("user_chests").insert({
          user_id: userId,
          slot_index: freeSlot,
          chest_tier: reward.chestTier,
          status: "locked",
          unlock_duration_seconds: durations[reward.chestTier] || 300,
        });
      }
    }

    return reward;
  } catch (err) {
    console.error("Failed to grant tournament rewards:", err);
    return null;
  }
}
