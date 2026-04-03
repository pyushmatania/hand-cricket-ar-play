import arenaSchool from "@/assets/arena-school.jpg";
import arenaRooftop from "@/assets/arena-rooftop.jpg";
import arenaStreet from "@/assets/arena-street.jpg";
import arenaBeach from "@/assets/arena-beach.jpg";
import arenaIpl from "@/assets/arena-ipl.jpg";
import arenaWorldcup from "@/assets/arena-worldcup.jpg";

export interface Arena {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  emoji: string;
  unlockTier: string;          // rank tier name required
  unlockTierIndex: number;     // 0-based index into RANK_TIERS
  accentGradient: string;
  glowColor: string;
}

export const ARENAS: Arena[] = [
  {
    id: "school",
    name: "Classroom",
    subtitle: "Where legends begin",
    image: arenaSchool,
    emoji: "🏫",
    unlockTier: "Bronze",
    unlockTierIndex: 0,
    accentGradient: "from-[hsl(142,76%,45%)] to-[hsl(85,60%,40%)]",
    glowColor: "hsl(142 76% 45% / 0.25)",
  },
  {
    id: "rooftop",
    name: "Rooftop",
    subtitle: "Sunset sixes",
    image: arenaRooftop,
    emoji: "🏢",
    unlockTier: "Silver",
    unlockTierIndex: 1,
    accentGradient: "from-[hsl(30,85%,55%)] to-[hsl(45,90%,50%)]",
    glowColor: "hsl(30 85% 55% / 0.25)",
  },
  {
    id: "street",
    name: "Street Cricket",
    subtitle: "Gully ka champion",
    image: arenaStreet,
    emoji: "🏘️",
    unlockTier: "Gold",
    unlockTierIndex: 2,
    accentGradient: "from-[hsl(25,90%,55%)] to-[hsl(45,93%,47%)]",
    glowColor: "hsl(25 90% 55% / 0.25)",
  },
  {
    id: "beach",
    name: "Beach Cricket",
    subtitle: "Tropical smash",
    image: arenaBeach,
    emoji: "🏖️",
    unlockTier: "Gold",
    unlockTierIndex: 2,
    accentGradient: "from-[hsl(190,80%,50%)] to-[hsl(45,90%,55%)]",
    glowColor: "hsl(190 80% 50% / 0.25)",
  },
  {
    id: "ipl",
    name: "IPL Arena",
    subtitle: "The grand stage",
    image: arenaIpl,
    emoji: "🏟️",
    unlockTier: "Diamond",
    unlockTierIndex: 3,
    accentGradient: "from-[hsl(270,76%,55%)] to-[hsl(217,91%,60%)]",
    glowColor: "hsl(270 76% 55% / 0.3)",
  },
  {
    id: "worldcup",
    name: "World Cup",
    subtitle: "Glory awaits",
    image: arenaWorldcup,
    emoji: "🏆",
    unlockTier: "Champion",
    unlockTierIndex: 4,
    accentGradient: "from-[hsl(45,93%,47%)] to-[hsl(0,84%,60%)]",
    glowColor: "hsl(45 93% 47% / 0.3)",
  },
];

/**
 * Returns the list of arenas with an `unlocked` flag based on current rank tier index.
 */
export function getUnlockedArenas(currentTierIndex: number): (Arena & { unlocked: boolean })[] {
  return ARENAS.map((a) => ({ ...a, unlocked: currentTierIndex >= a.unlockTierIndex }));
}

/**
 * Get the best unlocked arena for the player's current tier.
 */
export function getBestArena(currentTierIndex: number): Arena {
  const unlocked = ARENAS.filter((a) => currentTierIndex >= a.unlockTierIndex);
  return unlocked[unlocked.length - 1] || ARENAS[0];
}
