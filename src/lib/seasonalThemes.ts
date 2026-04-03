/**
 * Seasonal Island Theme System
 * Auto-detects the current real-world season/festival and returns
 * visual overlay configs for the home screen floating island.
 */

export interface SeasonalTheme {
  id: string;
  name: string;
  /** Decorations rendered on/around the island */
  decorations: string[];
  /** Ambient floating particles */
  particles: {
    emoji: string;
    count: number;
    speed: number; // seconds per cycle
  };
  /** Color tint overlay on the island */
  tintColor: string;
  tintOpacity: number;
  /** Banner text shown above the island */
  banner?: string;
  bannerColor: string;
  /** Extra CSS filter on the island image */
  imageFilter?: string;
}

/* ── Theme definitions ── */

const THEME_IPL: SeasonalTheme = {
  id: "ipl",
  name: "IPL Season",
  decorations: ["🏏", "🎪", "🏟️"],
  particles: { emoji: "🎉", count: 4, speed: 3 },
  tintColor: "hsl(280 60% 50% / 0.06)",
  tintOpacity: 0.06,
  banner: "🏏 IPL SEASON LIVE",
  bannerColor: "hsl(280 70% 60%)",
};

const THEME_INDEPENDENCE: SeasonalTheme = {
  id: "independence",
  name: "Independence Day",
  decorations: ["🇮🇳", "🪔", "🎆"],
  particles: { emoji: "🇮🇳", count: 3, speed: 4 },
  tintColor: "hsl(30 80% 50% / 0.05)",
  tintOpacity: 0.05,
  banner: "🇮🇳 HAPPY INDEPENDENCE DAY",
  bannerColor: "hsl(120 60% 40%)",
};

const THEME_DIWALI: SeasonalTheme = {
  id: "diwali",
  name: "Diwali",
  decorations: ["🪔", "🎆", "✨", "🎇"],
  particles: { emoji: "✨", count: 6, speed: 2.5 },
  tintColor: "hsl(45 100% 50% / 0.08)",
  tintOpacity: 0.08,
  banner: "🪔 HAPPY DIWALI",
  bannerColor: "hsl(45 100% 55%)",
  imageFilter: "brightness(1.05) saturate(1.1)",
};

const THEME_CHRISTMAS: SeasonalTheme = {
  id: "christmas",
  name: "Christmas & New Year",
  decorations: ["🎄", "🎅", "⛄", "🎁"],
  particles: { emoji: "❄️", count: 8, speed: 4 },
  tintColor: "hsl(200 60% 70% / 0.06)",
  tintOpacity: 0.06,
  banner: "🎄 HAPPY HOLIDAYS",
  bannerColor: "hsl(0 70% 50%)",
  imageFilter: "brightness(1.02) hue-rotate(-5deg)",
};

const THEME_HOLI: SeasonalTheme = {
  id: "holi",
  name: "Holi",
  decorations: ["🎨", "💜", "💚", "💛"],
  particles: { emoji: "🎨", count: 6, speed: 2 },
  tintColor: "hsl(300 60% 50% / 0.06)",
  tintOpacity: 0.06,
  banner: "🎨 HAPPY HOLI",
  bannerColor: "hsl(300 70% 60%)",
  imageFilter: "saturate(1.3)",
};

const THEME_WORLDCUP: SeasonalTheme = {
  id: "worldcup",
  name: "World Cup",
  decorations: ["🏆", "🌍", "🏏"],
  particles: { emoji: "⭐", count: 4, speed: 3 },
  tintColor: "hsl(45 80% 50% / 0.06)",
  tintOpacity: 0.06,
  banner: "🏆 WORLD CUP FEVER",
  bannerColor: "hsl(45 90% 55%)",
};

/* ── Season detection ── */

interface DateRange {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const SEASON_SCHEDULE: { range: DateRange; theme: SeasonalTheme }[] = [
  // IPL: March 15 – June 15
  { range: { startMonth: 3, startDay: 15, endMonth: 6, endDay: 15 }, theme: THEME_IPL },
  // Independence Day: Aug 13-17
  { range: { startMonth: 8, startDay: 13, endMonth: 8, endDay: 17 }, theme: THEME_INDEPENDENCE },
  // Diwali: ~Oct 25 – Nov 10 (approximate)
  { range: { startMonth: 10, startDay: 25, endMonth: 11, endDay: 10 }, theme: THEME_DIWALI },
  // Christmas/NY: Dec 20 – Jan 5
  { range: { startMonth: 12, startDay: 20, endMonth: 1, endDay: 5 }, theme: THEME_CHRISTMAS },
  // Holi: ~Mar 1-10 (approximate)
  { range: { startMonth: 3, startDay: 1, endMonth: 3, endDay: 10 }, theme: THEME_HOLI },
  // World Cup: Jun 1 – Jul 15 (when applicable)
  { range: { startMonth: 6, startDay: 1, endMonth: 7, endDay: 15 }, theme: THEME_WORLDCUP },
];

function isInRange(date: Date, range: DateRange): boolean {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  // Handle cross-year ranges (e.g., Dec 20 – Jan 5)
  if (range.startMonth > range.endMonth) {
    return (m > range.startMonth || (m === range.startMonth && d >= range.startDay)) ||
           (m < range.endMonth || (m === range.endMonth && d <= range.endDay));
  }
  const afterStart = m > range.startMonth || (m === range.startMonth && d >= range.startDay);
  const beforeEnd = m < range.endMonth || (m === range.endMonth && d <= range.endDay);
  return afterStart && beforeEnd;
}

/**
 * Returns the current seasonal theme, or null if no festival is active.
 * Prioritizes more specific festivals (shorter date ranges) over broad seasons.
 */
export function getCurrentSeasonalTheme(date: Date = new Date()): SeasonalTheme | null {
  // Find all matching themes, prefer the one with the shortest range
  const matches = SEASON_SCHEDULE.filter((s) => isInRange(date, s.range));
  if (!matches.length) return null;
  // Sort by range duration (shortest first = most specific)
  matches.sort((a, b) => {
    const durA = (a.range.endMonth - a.range.startMonth) * 30 + (a.range.endDay - a.range.startDay);
    const durB = (b.range.endMonth - b.range.startMonth) * 30 + (b.range.endDay - b.range.startDay);
    return durA - durB;
  });
  return matches[0].theme;
}

/** Get all available themes (for settings/preview) */
export function getAllSeasonalThemes(): SeasonalTheme[] {
  return [THEME_IPL, THEME_INDEPENDENCE, THEME_DIWALI, THEME_CHRISTMAS, THEME_HOLI, THEME_WORLDCUP];
}
