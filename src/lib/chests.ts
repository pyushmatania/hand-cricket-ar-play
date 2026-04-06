import { CHEST_IMAGES } from "@/assets/chests";

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
    image: CHEST_IMAGES.bronze,
    color: "hsl(28 60% 50%)",
    glowColor: "hsl(28 70% 45% / 0.4)",
    borderColor: "hsl(28 40% 30%)",
  },
  {
    id: "silver",
    name: "Silver Chest",
    image: CHEST_IMAGES.silver,
    color: "hsl(210 15% 65%)",
    glowColor: "hsl(210 20% 60% / 0.4)",
    borderColor: "hsl(210 10% 40%)",
  },
  {
    id: "gold",
    name: "Gold Chest",
    image: CHEST_IMAGES.gold,
    color: "hsl(45 100% 50%)",
    glowColor: "hsl(45 100% 50% / 0.5)",
    borderColor: "hsl(35 70% 35%)",
  },
  {
    id: "diamond",
    name: "Diamond Chest",
    image: CHEST_IMAGES.diamond,
    color: "hsl(195 90% 55%)",
    glowColor: "hsl(195 100% 60% / 0.5)",
    borderColor: "hsl(200 50% 35%)",
  },
  {
    id: "mythic",
    name: "Mythic Chest",
    image: CHEST_IMAGES.mythic,
    color: "hsl(280 80% 60%)",
    glowColor: "hsl(280 90% 65% / 0.5)",
    borderColor: "hsl(280 50% 40%)",
  },
];

/** Get chest tier by id or rarity keyword. Falls back to bronze. */
export function getChestTier(key?: string | null): ChestTier {
  if (!key) return CHEST_TIERS[0];
  const lower = key.toLowerCase();
  return CHEST_TIERS.find(c => lower.includes(c.id)) || CHEST_TIERS[0];
}
