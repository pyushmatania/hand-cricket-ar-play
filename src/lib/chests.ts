import chestBronze from "@/assets/chest-bronze.png";
import chestSilver from "@/assets/chest-silver.png";
import chestGold from "@/assets/chest-gold.png";
import chestPlatinum from "@/assets/chest-platinum.png";
import chestDiamond from "@/assets/chest-diamond.png";
import chestChampion from "@/assets/chest-champion.png";
import chestWar from "@/assets/chest-war.png";

export interface ChestTier {
  id: string;
  name: string;
  image: string;
  color: string;       // primary accent
  glowColor: string;   // drop-shadow / particle color
  borderColor: string;
}

export const CHEST_TIERS: ChestTier[] = [
  {
    id: "bronze",
    name: "Bronze Chest",
    image: chestBronze,
    color: "hsl(28 60% 50%)",
    glowColor: "hsl(28 70% 45% / 0.4)",
    borderColor: "hsl(28 40% 30%)",
  },
  {
    id: "silver",
    name: "Silver Chest",
    image: chestSilver,
    color: "hsl(210 15% 65%)",
    glowColor: "hsl(210 20% 60% / 0.4)",
    borderColor: "hsl(210 10% 40%)",
  },
  {
    id: "gold",
    name: "Gold Chest",
    image: chestGold,
    color: "hsl(45 100% 50%)",
    glowColor: "hsl(45 100% 50% / 0.5)",
    borderColor: "hsl(35 70% 35%)",
  },
  {
    id: "platinum",
    name: "Platinum Chest",
    image: chestPlatinum,
    color: "hsl(210 60% 65%)",
    glowColor: "hsl(210 80% 60% / 0.5)",
    borderColor: "hsl(210 40% 40%)",
  },
  {
    id: "diamond",
    name: "Diamond Chest",
    image: chestDiamond,
    color: "hsl(195 90% 55%)",
    glowColor: "hsl(195 100% 60% / 0.5)",
    borderColor: "hsl(200 50% 35%)",
  },
  {
    id: "champion",
    name: "Champion Chest",
    image: chestChampion,
    color: "hsl(0 70% 55%)",
    glowColor: "hsl(45 100% 50% / 0.5)",
    borderColor: "hsl(35 80% 40%)",
  },
  {
    id: "war",
    name: "War Chest",
    image: chestWar,
    color: "hsl(220 15% 40%)",
    glowColor: "hsl(25 60% 40% / 0.4)",
    borderColor: "hsl(220 15% 20%)",
  },
];

/** Get chest tier by id or rarity keyword. Falls back to bronze. */
export function getChestTier(key?: string | null): ChestTier {
  if (!key) return CHEST_TIERS[0];
  const lower = key.toLowerCase();
  return CHEST_TIERS.find(c => lower.includes(c.id)) || CHEST_TIERS[0];
}
