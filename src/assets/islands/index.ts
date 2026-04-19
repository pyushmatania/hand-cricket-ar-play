import gullyIsland from "./gully-island.png";
import schoolIsland from "./school-island.png";
import districtIsland from "./district-island.png";
import ranjiIsland from "./ranji-island.png";
import iplIsland from "./ipl-island.png";
import internationalIsland from "./international-island.png";
import worldcupIsland from "./worldcup-island.png";
import gullyAnimated from "./gully-island-animated.mp4.asset.json";

export interface ArenaIsland {
  id: string;
  name: string;
  image: string;
  /** Optional looping video that replaces the still image when playing */
  video?: string;
  trophiesRequired: number;
  emoji: string;
  accent: string;
  unlockLabel: string;
}

export const ARENA_ISLANDS: ArenaIsland[] = [
  { id: "gully", name: "Gully Grounds", image: gullyIsland, video: gullyAnimated.url, trophiesRequired: 0, emoji: "🏏", accent: "#4ADE50", unlockLabel: "Free" },
  { id: "school", name: "School Ground", image: schoolIsland, trophiesRequired: 100, emoji: "🏫", accent: "#4ADE80", unlockLabel: "Level 3" },
  { id: "district", name: "District Stadium", image: districtIsland, trophiesRequired: 300, emoji: "🏟️", accent: "#00D4FF", unlockLabel: "Level 7" },
  { id: "ranji", name: "Ranji Trophy", image: ranjiIsland, trophiesRequired: 600, emoji: "🏆", accent: "#FFD700", unlockLabel: "Level 12" },
  { id: "ipl", name: "IPL Stadium", image: iplIsland, trophiesRequired: 1200, emoji: "✨", accent: "#A855F7", unlockLabel: "Level 18" },
  { id: "international", name: "International", image: internationalIsland, trophiesRequired: 2000, emoji: "🌍", accent: "#00D4FF", unlockLabel: "Level 22" },
  { id: "worldcup", name: "World Cup", image: worldcupIsland, trophiesRequired: 3000, emoji: "🏆", accent: "#FFD700", unlockLabel: "Level 25" },
];

export { gullyIsland, schoolIsland, districtIsland, ranjiIsland, iplIsland, internationalIsland, worldcupIsland };
