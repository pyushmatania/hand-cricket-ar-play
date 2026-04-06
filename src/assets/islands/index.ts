import gullyIsland from "./gully-island.jpg";
import schoolIsland from "./school-island.jpg";
import districtIsland from "./district-island.jpg";
import ranjiIsland from "./ranji-island.jpg";
import iplIsland from "./ipl-island.jpg";
import internationalIsland from "./international-island.jpg";
import worldcupIsland from "./worldcup-island.jpg";

export interface ArenaIsland {
  id: string;
  name: string;
  image: string;
  trophiesRequired: number;
  emoji: string;
  accent: string;
  unlockLabel: string;
}

export const ARENA_ISLANDS: ArenaIsland[] = [
  { id: "gully", name: "Gully Grounds", image: gullyIsland, trophiesRequired: 0, emoji: "🏏", accent: "#4ADE50", unlockLabel: "Free" },
  { id: "school", name: "School Ground", image: schoolIsland, trophiesRequired: 100, emoji: "🏫", accent: "#4ADE80", unlockLabel: "Level 3" },
  { id: "district", name: "District Stadium", image: districtIsland, trophiesRequired: 300, emoji: "🏟️", accent: "#00D4FF", unlockLabel: "Level 7" },
  { id: "ranji", name: "Ranji Trophy", image: ranjiIsland, trophiesRequired: 600, emoji: "🏆", accent: "#FFD700", unlockLabel: "Level 12" },
  { id: "ipl", name: "IPL Stadium", image: iplIsland, trophiesRequired: 1200, emoji: "✨", accent: "#A855F7", unlockLabel: "Level 18" },
  { id: "international", name: "International", image: internationalIsland, trophiesRequired: 2000, emoji: "🌍", accent: "#00D4FF", unlockLabel: "Level 22" },
  { id: "worldcup", name: "World Cup", image: worldcupIsland, trophiesRequired: 3000, emoji: "🏆", accent: "#FFD700", unlockLabel: "Level 25" },
];

export { gullyIsland, schoolIsland, districtIsland, ranjiIsland, iplIsland, internationalIsland, worldcupIsland };
