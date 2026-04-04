/**
 * ═══════════════════════════════════════════════════
 * Doc 3 — Chapter 5: 10 Immersive Match Themes
 * Each theme defines ground surface, crowd, ambient,
 * weather options, and commentary tone.
 * ═══════════════════════════════════════════════════
 */

import type { CommentaryLanguage, CommentaryEmotion, WeatherState } from '@/engines/types';

// ── Types ──

export type GroundSurface =
  | 'concrete'    // Gully / Street
  | 'dirt'        // Maidan / Village
  | 'carpet'      // Classroom / Hostel
  | 'grass'       // Park / Club
  | 'turf'        // Domestic / International
  | 'sand'        // Beach
  | 'rooftop'     // Rooftop terrace
  | 'mat'         // Rubber mat pitch
  | 'astroturf';  // Indoor / Academy

export type CrowdType =
  | 'kids'        // Neighborhood children
  | 'students'    // Classroom / Hostel
  | 'locals'      // Gully / Maidan
  | 'families'    // Park / Club
  | 'fans'        // Domestic stadium
  | 'fanatics'    // IPL / International
  | 'tourists';   // Beach / Exhibition

export type AmbienceId =
  | 'street_traffic'
  | 'birds_morning'
  | 'school_bell'
  | 'hostel_chatter'
  | 'park_breeze'
  | 'beach_waves'
  | 'rooftop_wind'
  | 'village_temple'
  | 'stadium_hum'
  | 'stadium_roar'
  | 'ipl_dj';

export type CommentaryTone = 'casual' | 'friendly' | 'professional' | 'hype' | 'reverent';

export interface MatchTheme {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;

  /** Links to the Arena id in arenas.ts for visuals */
  arenaId?: string;

  // ── Ground ──
  ground: {
    surface: GroundSurface;
    color: string;           // HSL token for pitch strip
    crease: string;          // HSL token for crease marks
    outfield: string;        // HSL token for outfield tint
    hasGrass: boolean;
    hasCracks: boolean;
    description: string;
  };

  // ── Crowd ──
  crowd: {
    type: CrowdType;
    count: number;           // Approximate crowd size
    noise: number;           // 0-100 base noise level
    chantStyle: string;      // e.g. "clapping", "drumming", "dhol"
    reactionSpeed: number;   // 0-1, how fast crowd reacts (1 = instant)
    peakEvents: string[];    // Events that trigger max noise
  };

  // ── Ambient Soundscape ──
  ambient: {
    primary: AmbienceId;
    secondary?: AmbienceId;
    volume: number;          // 0-1
    description: string;
  };

  // ── Weather options available for this theme ──
  weatherPool: WeatherState[];
  defaultWeather: WeatherState;

  // ── Commentary ──
  commentary: {
    tone: CommentaryTone;
    preferredLanguage: CommentaryLanguage;
    defaultEmotion: CommentaryEmotion;
    /** Rate modifier applied to speech (1.0 = normal) */
    speechRate: number;
    /** How frequently commentary triggers (0-1, higher = more) */
    frequency: number;
  };

  // ── Visual Atmosphere ──
  atmosphere: {
    lightLevel: number;      // 0-1 (0 = dark, 1 = bright)
    warmth: number;          // -1 cold to +1 warm color shift
    dustParticles: boolean;
    fireflies: boolean;
    floodlights: boolean;
    fogLevel: number;        // 0-1
  };

  // ── Gameplay modifiers ──
  modifiers: {
    boundaryChance: number;  // multiplier
    wicketChance: number;    // multiplier
    runRate: number;         // typical runs per over expected
  };
}

// ═══════════════════════════════════════════════════
// The 10 Themes
// ═══════════════════════════════════════════════════

const THEME_GULLY: MatchTheme = {
  id: 'gully',
  name: 'Gully Cricket',
  subtitle: 'Where legends are born',
  emoji: '🏘️',
  arenaId: 'street',
  ground: {
    surface: 'concrete',
    color: 'hsl(25 15% 50%)',
    crease: 'hsl(0 0% 90%)',
    outfield: 'hsl(25 20% 40%)',
    hasGrass: false,
    hasCracks: true,
    description: 'Cracked concrete with chalk markings',
  },
  crowd: {
    type: 'locals',
    count: 15,
    noise: 40,
    chantStyle: 'clapping',
    reactionSpeed: 0.9,
    peakEvents: ['BOUNDARY_SIX', 'WICKET_BOWLED'],
  },
  ambient: {
    primary: 'street_traffic',
    secondary: 'birds_morning',
    volume: 0.4,
    description: 'Auto-rickshaws, dogs barking, distant traffic',
  },
  weatherPool: ['clear', 'overcast', 'dust_storm', 'golden_hour'],
  defaultWeather: 'clear',
  commentary: {
    tone: 'casual',
    preferredLanguage: 'hinglish',
    defaultEmotion: 'excited',
    speechRate: 1.1,
    frequency: 0.7,
  },
  atmosphere: {
    lightLevel: 0.85,
    warmth: 0.3,
    dustParticles: true,
    fireflies: false,
    floodlights: false,
    fogLevel: 0,
  },
  modifiers: {
    boundaryChance: 0.95,
    wicketChance: 1.05,
    runRate: 6,
  },
};

const THEME_CLASSROOM: MatchTheme = {
  id: 'classroom',
  name: 'Classroom',
  subtitle: 'Last bench champions',
  emoji: '🏫',
  arenaId: 'school',
  ground: {
    surface: 'carpet',
    color: 'hsl(25 30% 35%)',
    crease: 'hsl(45 20% 75%)',
    outfield: 'hsl(25 15% 25%)',
    hasGrass: false,
    hasCracks: false,
    description: 'Classroom floor tiles with desk boundaries',
  },
  crowd: {
    type: 'students',
    count: 30,
    noise: 55,
    chantStyle: 'clapping',
    reactionSpeed: 1.0,
    peakEvents: ['BOUNDARY_SIX', 'WICKET_CAUGHT', 'HATTRICK'],
  },
  ambient: {
    primary: 'school_bell',
    secondary: 'hostel_chatter',
    volume: 0.3,
    description: 'Echoing corridors, distant bell, chatter',
  },
  weatherPool: ['clear'],
  defaultWeather: 'clear',
  commentary: {
    tone: 'friendly',
    preferredLanguage: 'hinglish',
    defaultEmotion: 'excited',
    speechRate: 1.15,
    frequency: 0.8,
  },
  atmosphere: {
    lightLevel: 0.7,
    warmth: 0.1,
    dustParticles: false,
    fireflies: false,
    floodlights: false,
    fogLevel: 0,
  },
  modifiers: {
    boundaryChance: 1.0,
    wicketChance: 1.0,
    runRate: 7,
  },
};

const THEME_HOSTEL: MatchTheme = {
  id: 'hostel',
  name: 'Hostel Room',
  subtitle: 'After lights out',
  emoji: '🛏️',
  ground: {
    surface: 'carpet',
    color: 'hsl(25 20% 30%)',
    crease: 'hsl(0 0% 70%)',
    outfield: 'hsl(25 10% 20%)',
    hasGrass: false,
    hasCracks: false,
    description: 'Worn carpet floor, mattress fielders',
  },
  crowd: {
    type: 'students',
    count: 8,
    noise: 25,
    chantStyle: 'clapping',
    reactionSpeed: 1.0,
    peakEvents: ['BOUNDARY_SIX', 'WICKET_BOWLED'],
  },
  ambient: {
    primary: 'hostel_chatter',
    volume: 0.25,
    description: 'Whispered excitement, ceiling fan hum',
  },
  weatherPool: ['clear'],
  defaultWeather: 'clear',
  commentary: {
    tone: 'casual',
    preferredLanguage: 'hinglish',
    defaultEmotion: 'neutral',
    speechRate: 1.0,
    frequency: 0.5,
  },
  atmosphere: {
    lightLevel: 0.4,
    warmth: 0.2,
    dustParticles: false,
    fireflies: false,
    floodlights: false,
    fogLevel: 0.1,
  },
  modifiers: {
    boundaryChance: 0.9,
    wicketChance: 1.0,
    runRate: 5,
  },
};

const THEME_MAIDAN: MatchTheme = {
  id: 'maidan',
  name: 'Maidan',
  subtitle: 'Open ground warriors',
  emoji: '🌳',
  ground: {
    surface: 'dirt',
    color: 'hsl(30 35% 45%)',
    crease: 'hsl(0 0% 85%)',
    outfield: 'hsl(100 25% 35%)',
    hasGrass: true,
    hasCracks: true,
    description: 'Dusty mud pitch, patchy grass outfield',
  },
  crowd: {
    type: 'locals',
    count: 50,
    noise: 50,
    chantStyle: 'clapping',
    reactionSpeed: 0.8,
    peakEvents: ['BOUNDARY_SIX', 'MILESTONE_50', 'WICKET_BOWLED'],
  },
  ambient: {
    primary: 'birds_morning',
    secondary: 'village_temple',
    volume: 0.35,
    description: 'Morning birds, distant temple bells, breeze',
  },
  weatherPool: ['clear', 'overcast', 'dust_storm', 'golden_hour', 'heavy_dew'],
  defaultWeather: 'clear',
  commentary: {
    tone: 'friendly',
    preferredLanguage: 'hindi',
    defaultEmotion: 'neutral',
    speechRate: 1.0,
    frequency: 0.6,
  },
  atmosphere: {
    lightLevel: 0.9,
    warmth: 0.4,
    dustParticles: true,
    fireflies: false,
    floodlights: false,
    fogLevel: 0.05,
  },
  modifiers: {
    boundaryChance: 0.95,
    wicketChance: 1.05,
    runRate: 5.5,
  },
};

const THEME_ROOFTOP: MatchTheme = {
  id: 'rooftop',
  name: 'Rooftop',
  subtitle: 'Sunset sixes',
  emoji: '🏢',
  arenaId: 'rooftop',
  ground: {
    surface: 'concrete',
    color: 'hsl(25 10% 55%)',
    crease: 'hsl(0 0% 85%)',
    outfield: 'hsl(25 10% 45%)',
    hasGrass: false,
    hasCracks: false,
    description: 'Flat terrace with parapet boundaries',
  },
  crowd: {
    type: 'locals',
    count: 10,
    noise: 30,
    chantStyle: 'clapping',
    reactionSpeed: 0.85,
    peakEvents: ['BOUNDARY_SIX'],
  },
  ambient: {
    primary: 'rooftop_wind',
    secondary: 'street_traffic',
    volume: 0.35,
    description: 'Wind gusts, kite strings, distant azan',
  },
  weatherPool: ['clear', 'overcast', 'golden_hour', 'night_lights'],
  defaultWeather: 'golden_hour',
  commentary: {
    tone: 'casual',
    preferredLanguage: 'hinglish',
    defaultEmotion: 'excited',
    speechRate: 1.1,
    frequency: 0.65,
  },
  atmosphere: {
    lightLevel: 0.75,
    warmth: 0.5,
    dustParticles: false,
    fireflies: true,
    floodlights: false,
    fogLevel: 0,
  },
  modifiers: {
    boundaryChance: 1.1,
    wicketChance: 0.95,
    runRate: 7,
  },
};

const THEME_BEACH: MatchTheme = {
  id: 'beach',
  name: 'Beach Cricket',
  subtitle: 'Tropical smash',
  emoji: '🏖️',
  arenaId: 'beach',
  ground: {
    surface: 'sand',
    color: 'hsl(45 50% 70%)',
    crease: 'hsl(0 0% 95%)',
    outfield: 'hsl(45 40% 65%)',
    hasGrass: false,
    hasCracks: false,
    description: 'Golden sand, coconut tree boundaries',
  },
  crowd: {
    type: 'tourists',
    count: 25,
    noise: 35,
    chantStyle: 'clapping',
    reactionSpeed: 0.7,
    peakEvents: ['BOUNDARY_SIX', 'BOUNDARY_FOUR'],
  },
  ambient: {
    primary: 'beach_waves',
    secondary: 'birds_morning',
    volume: 0.5,
    description: 'Ocean waves, seagulls, distant music',
  },
  weatherPool: ['clear', 'golden_hour', 'overcast'],
  defaultWeather: 'clear',
  commentary: {
    tone: 'casual',
    preferredLanguage: 'english',
    defaultEmotion: 'neutral',
    speechRate: 0.95,
    frequency: 0.5,
  },
  atmosphere: {
    lightLevel: 0.95,
    warmth: 0.6,
    dustParticles: false,
    fireflies: false,
    floodlights: false,
    fogLevel: 0,
  },
  modifiers: {
    boundaryChance: 1.1,
    wicketChance: 0.9,
    runRate: 8,
  },
};

const THEME_PARK: MatchTheme = {
  id: 'park',
  name: 'Park / Club',
  subtitle: 'Weekend warriors',
  emoji: '🌿',
  ground: {
    surface: 'grass',
    color: 'hsl(120 40% 35%)',
    crease: 'hsl(0 0% 90%)',
    outfield: 'hsl(120 35% 40%)',
    hasGrass: true,
    hasCracks: false,
    description: 'Lush green outfield, well-kept pitch strip',
  },
  crowd: {
    type: 'families',
    count: 80,
    noise: 45,
    chantStyle: 'clapping',
    reactionSpeed: 0.75,
    peakEvents: ['BOUNDARY_SIX', 'MILESTONE_100', 'WICKET_CAUGHT'],
  },
  ambient: {
    primary: 'park_breeze',
    secondary: 'birds_morning',
    volume: 0.35,
    description: 'Rustling leaves, distant playground, birdsong',
  },
  weatherPool: ['clear', 'overcast', 'drizzle', 'golden_hour', 'heavy_dew'],
  defaultWeather: 'clear',
  commentary: {
    tone: 'friendly',
    preferredLanguage: 'english',
    defaultEmotion: 'neutral',
    speechRate: 1.0,
    frequency: 0.65,
  },
  atmosphere: {
    lightLevel: 0.9,
    warmth: 0.2,
    dustParticles: false,
    fireflies: false,
    floodlights: false,
    fogLevel: 0.05,
  },
  modifiers: {
    boundaryChance: 1.0,
    wicketChance: 1.0,
    runRate: 6.5,
  },
};

const THEME_DOMESTIC: MatchTheme = {
  id: 'domestic',
  name: 'Domestic Stadium',
  subtitle: 'Ranji Trophy vibes',
  emoji: '🏟️',
  ground: {
    surface: 'turf',
    color: 'hsl(80 30% 40%)',
    crease: 'hsl(0 0% 95%)',
    outfield: 'hsl(120 35% 38%)',
    hasGrass: true,
    hasCracks: false,
    description: 'Well-maintained pitch, proper sight screen',
  },
  crowd: {
    type: 'fans',
    count: 5000,
    noise: 65,
    chantStyle: 'drumming',
    reactionSpeed: 0.8,
    peakEvents: ['BOUNDARY_SIX', 'MILESTONE_50', 'MILESTONE_100', 'HATTRICK'],
  },
  ambient: {
    primary: 'stadium_hum',
    volume: 0.5,
    description: 'Stadium PA system, scattered clapping, vendor calls',
  },
  weatherPool: ['clear', 'overcast', 'drizzle', 'heavy_dew', 'night_lights', 'golden_hour'],
  defaultWeather: 'clear',
  commentary: {
    tone: 'professional',
    preferredLanguage: 'english',
    defaultEmotion: 'calm',
    speechRate: 1.0,
    frequency: 0.8,
  },
  atmosphere: {
    lightLevel: 0.85,
    warmth: 0.1,
    dustParticles: false,
    fireflies: false,
    floodlights: false,
    fogLevel: 0.02,
  },
  modifiers: {
    boundaryChance: 1.0,
    wicketChance: 1.0,
    runRate: 6,
  },
};

const THEME_IPL: MatchTheme = {
  id: 'ipl',
  name: 'IPL Arena',
  subtitle: 'The grand stage',
  emoji: '🎪',
  arenaId: 'ipl',
  ground: {
    surface: 'turf',
    color: 'hsl(90 35% 40%)',
    crease: 'hsl(0 0% 100%)',
    outfield: 'hsl(120 40% 35%)',
    hasGrass: true,
    hasCracks: false,
    description: 'Perfect turf, LED rope boundary, sponsor logos',
  },
  crowd: {
    type: 'fanatics',
    count: 40000,
    noise: 90,
    chantStyle: 'dhol',
    reactionSpeed: 0.95,
    peakEvents: ['BOUNDARY_SIX', 'WICKET_BOWLED', 'HATTRICK', 'MILESTONE_100'],
  },
  ambient: {
    primary: 'ipl_dj',
    secondary: 'stadium_roar',
    volume: 0.65,
    description: 'DJ drops, dhol beats, trumpet, pyrotechnics',
  },
  weatherPool: ['clear', 'heavy_dew', 'night_lights'],
  defaultWeather: 'night_lights',
  commentary: {
    tone: 'hype',
    preferredLanguage: 'hinglish',
    defaultEmotion: 'excited',
    speechRate: 1.15,
    frequency: 0.9,
  },
  atmosphere: {
    lightLevel: 0.7,
    warmth: 0.0,
    dustParticles: false,
    fireflies: false,
    floodlights: true,
    fogLevel: 0.05,
  },
  modifiers: {
    boundaryChance: 1.1,
    wicketChance: 0.95,
    runRate: 9,
  },
};

const THEME_INTERNATIONAL: MatchTheme = {
  id: 'international',
  name: 'International',
  subtitle: 'Glory awaits',
  emoji: '🏆',
  arenaId: 'worldcup',
  ground: {
    surface: 'turf',
    color: 'hsl(85 40% 38%)',
    crease: 'hsl(0 0% 100%)',
    outfield: 'hsl(120 45% 32%)',
    hasGrass: true,
    hasCracks: false,
    description: 'Pristine international pitch, super soppers ready',
  },
  crowd: {
    type: 'fanatics',
    count: 80000,
    noise: 85,
    chantStyle: 'drumming',
    reactionSpeed: 0.9,
    peakEvents: ['BOUNDARY_SIX', 'WICKET_BOWLED', 'MILESTONE_100', 'HATTRICK', 'MATCH_END'],
  },
  ambient: {
    primary: 'stadium_roar',
    secondary: 'stadium_hum',
    volume: 0.6,
    description: 'Packed stands roar, national anthems, horns',
  },
  weatherPool: ['clear', 'overcast', 'drizzle', 'heavy_dew', 'night_lights', 'golden_hour'],
  defaultWeather: 'clear',
  commentary: {
    tone: 'reverent',
    preferredLanguage: 'english',
    defaultEmotion: 'calm',
    speechRate: 0.95,
    frequency: 0.9,
  },
  atmosphere: {
    lightLevel: 0.9,
    warmth: 0.0,
    dustParticles: false,
    fireflies: false,
    floodlights: true,
    fogLevel: 0.02,
  },
  modifiers: {
    boundaryChance: 1.0,
    wicketChance: 1.05,
    runRate: 6,
  },
};

// ═══════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════

export const MATCH_THEMES: MatchTheme[] = [
  THEME_GULLY,
  THEME_CLASSROOM,
  THEME_HOSTEL,
  THEME_MAIDAN,
  THEME_ROOFTOP,
  THEME_BEACH,
  THEME_PARK,
  THEME_DOMESTIC,
  THEME_IPL,
  THEME_INTERNATIONAL,
];

/** Get theme by id */
export function getThemeById(id: string): MatchTheme {
  return MATCH_THEMES.find(t => t.id === id) || THEME_GULLY;
}

/** Get theme matching an arena id */
export function getThemeForArena(arenaId: string): MatchTheme {
  return MATCH_THEMES.find(t => t.arenaId === arenaId) || THEME_GULLY;
}

/** Get all themes unlockable at a given rank tier index */
export function getThemesForTier(tierIndex: number): MatchTheme[] {
  // Map theme → difficulty progression
  const tierMap: Record<string, number> = {
    gully: 0,
    classroom: 0,
    hostel: 0,
    maidan: 1,
    rooftop: 1,
    beach: 2,
    park: 2,
    domestic: 3,
    ipl: 3,
    international: 4,
  };
  return MATCH_THEMES.filter(t => (tierMap[t.id] ?? 0) <= tierIndex);
}

/** Pick a random weather from a theme's weather pool */
export function rollThemeWeather(theme: MatchTheme): WeatherState {
  const pool = theme.weatherPool;
  if (!pool.length) return theme.defaultWeather;
  return pool[Math.floor(Math.random() * pool.length)];
}
