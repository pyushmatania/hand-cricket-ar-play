// ═══════════════════════════════════════════════════
// Doc 5 — Chapter 3: Sound Trigger Map
// Maps EventEngine events → SoundEngine categories
// with timing offsets and perspective awareness
// ═══════════════════════════════════════════════════

import type { EventType } from './types';

export interface SoundTrigger {
  /** Sound manifest category key */
  category: string;
  /** Delay in ms before playing (allows layering) */
  delayMs?: number;
  /** Volume override (0-1) */
  volume?: number;
  /** Only play when player perspective matches */
  perspective?: 'batting' | 'bowling' | 'any';
  /** Haptic pattern to fire alongside */
  haptic?: 'light' | 'medium' | 'heavy' | 'error';
}

/**
 * Complete mapping from game events to sound triggers.
 * Multiple triggers per event enable layered audio design.
 */
export const SOUND_TRIGGER_MAP: Record<string, SoundTrigger[]> = {
  // ── Scoring ──
  DEFENSE_SCORED: [
    { category: 'bat_hit_soft', perspective: 'any' },
    { category: 'ball_into_gloves', delayMs: 300, perspective: 'any' },
    { category: 'crowd_cheer_mild', delayMs: 500, perspective: 'batting' },
  ],
  RUNS_SCORED: [
    { category: 'bat_hit_medium', perspective: 'any' },
    { category: 'running_footsteps', delayMs: 200, perspective: 'any' },
    { category: 'crowd_cheer_mild', delayMs: 400, perspective: 'batting' },
  ],
  BOUNDARY_FOUR: [
    { category: 'bat_hit_hard', perspective: 'any', haptic: 'medium' },
    { category: 'crowd_cheer_excited', delayMs: 600, perspective: 'batting' },
    { category: 'crowd_gasp', delayMs: 400, perspective: 'bowling' },
  ],
  BOUNDARY_SIX: [
    { category: 'bat_hit_massive', perspective: 'any', haptic: 'heavy' },
    { category: 'ball_flight_whoosh', delayMs: 200, perspective: 'any' },
    { category: 'crowd_eruption', delayMs: 800, perspective: 'batting' },
    { category: 'firework_pop', delayMs: 1200, perspective: 'batting' },
    { category: 'firework_pop', delayMs: 1600, perspective: 'batting' },
    { category: 'crowd_gasp', delayMs: 300, perspective: 'bowling' },
  ],

  // ── Wickets ──
  WICKET_BOWLED: [
    { category: 'stumps_hit', perspective: 'any', haptic: 'heavy' },
    { category: 'bails_flying', delayMs: 150, perspective: 'any' },
    { category: 'crowd_gasp', delayMs: 200, perspective: 'batting' },
    { category: 'crowd_appeal', delayMs: 300, perspective: 'bowling' },
    { category: 'crowd_celebration_sustained', delayMs: 1000, perspective: 'bowling' },
  ],
  WICKET_DEFENSE: [
    { category: 'stumps_hit', perspective: 'any', haptic: 'heavy' },
    { category: 'bails_flying', delayMs: 150, perspective: 'any' },
    { category: 'crowd_gasp', delayMs: 200, perspective: 'batting' },
    { category: 'crowd_appeal', delayMs: 300, perspective: 'bowling' },
    { category: 'crowd_celebration_sustained', delayMs: 1000, perspective: 'bowling' },
  ],
  WICKET_CAUGHT: [
    { category: 'ball_edge', perspective: 'any', haptic: 'heavy' },
    { category: 'crowd_gasp', delayMs: 200, perspective: 'batting' },
    { category: 'crowd_celebration_sustained', delayMs: 800, perspective: 'bowling' },
  ],
  WICKET_CAUGHT_BEHIND: [
    { category: 'ball_edge', perspective: 'any', haptic: 'heavy' },
    { category: 'ball_into_gloves', delayMs: 100, perspective: 'any' },
    { category: 'crowd_appeal', delayMs: 300, perspective: 'bowling' },
    { category: 'crowd_gasp', delayMs: 200, perspective: 'batting' },
  ],
  WICKET_LBW: [
    { category: 'ball_pad_hit', perspective: 'any', haptic: 'heavy' },
    { category: 'crowd_appeal', delayMs: 200, perspective: 'bowling' },
    { category: 'crowd_celebration_sustained', delayMs: 1500, perspective: 'bowling' },
    { category: 'crowd_gasp', delayMs: 200, perspective: 'batting' },
  ],
  WICKET_RUN_OUT: [
    { category: 'fielder_throw', perspective: 'any', haptic: 'heavy' },
    { category: 'stumps_hit', delayMs: 300, perspective: 'any' },
    { category: 'crowd_appeal', delayMs: 500, perspective: 'bowling' },
    { category: 'crowd_gasp', delayMs: 300, perspective: 'batting' },
  ],
  WICKET_STUMPED: [
    { category: 'ball_into_gloves', perspective: 'any', haptic: 'heavy' },
    { category: 'stumps_hit', delayMs: 200, perspective: 'any' },
    { category: 'crowd_appeal', delayMs: 400, perspective: 'bowling' },
    { category: 'crowd_gasp', delayMs: 300, perspective: 'batting' },
  ],
  WICKET_HIT_WICKET: [
    { category: 'stumps_hit', perspective: 'any', haptic: 'heavy' },
    { category: 'bails_flying', delayMs: 100, perspective: 'any' },
    { category: 'crowd_gasp', delayMs: 200, perspective: 'any' },
  ],

  // ── Toss ──
  TOSS_COIN_FLIP: [
    { category: 'coin_flip', perspective: 'any' },
  ],
  TOSS_RESULT: [
    { category: 'coin_land', perspective: 'any' },
    { category: 'crowd_cheer_mild', delayMs: 500, perspective: 'any' },
  ],

  // ── Match lifecycle ──
  MATCH_START: [
    { category: 'match_start_horn', perspective: 'any', haptic: 'medium' },
    { category: 'crowd_cheer_excited', delayMs: 500, perspective: 'any' },
  ],
  MATCH_END: [],  // Handled dynamically based on win/loss
  INNINGS_START: [
    { category: 'match_start_horn', perspective: 'any' },
  ],
  INNINGS_END: [
    { category: 'crowd_cheer_excited', perspective: 'any' },
    { category: 'crowd_celebration_sustained', delayMs: 800, perspective: 'any' },
  ],
  OVER_END: [
    { category: 'crowd_cheer_mild', perspective: 'any' },
  ],

  // ── Ball mechanics ──
  BALL_BOWLER_RUNUP: [
    { category: 'running_footsteps', perspective: 'any', volume: 0.5 },
  ],
  BALL_RESULT: [
    { category: 'ball_bounce', perspective: 'any', volume: 0.6 },
  ],

  // ── Milestones ──
  MILESTONE_50: [
    { category: 'crowd_eruption', perspective: 'any', haptic: 'heavy' },
    { category: 'crowd_celebration_sustained', delayMs: 500, perspective: 'any' },
  ],
  MILESTONE_100: [
    { category: 'crowd_eruption', perspective: 'any', haptic: 'heavy' },
    { category: 'firework_pop', delayMs: 800, perspective: 'any' },
    { category: 'firework_pop', delayMs: 1200, perspective: 'any' },
    { category: 'crowd_celebration_sustained', delayMs: 500, perspective: 'any' },
  ],
  MILESTONE_5_WICKETS: [
    { category: 'crowd_eruption', perspective: 'any', haptic: 'heavy' },
    { category: 'crowd_celebration_sustained', delayMs: 600, perspective: 'any' },
  ],
  HATTRICK: [
    { category: 'crowd_eruption', perspective: 'any', haptic: 'heavy' },
    { category: 'firework_pop', delayMs: 400, perspective: 'any' },
    { category: 'firework_pop', delayMs: 800, perspective: 'any' },
    { category: 'firework_pop', delayMs: 1200, perspective: 'any' },
    { category: 'crowd_celebration_sustained', delayMs: 600, perspective: 'any' },
  ],

  // ── DRS Review ──
  DRS_REVIEW_START: [
    { category: 'heartbeat', perspective: 'any' },
    { category: 'crowd_gasp', delayMs: 200, perspective: 'any' },
  ],
  DRS_REVIEW_RESULT: [
    { category: 'ui_success', perspective: 'any' },
    { category: 'crowd_cheer_excited', delayMs: 300, perspective: 'any' },
  ],

  // ── Powerplay / Death Overs ──
  POWERPLAY_START: [
    { category: 'match_start_horn', volume: 0.6, perspective: 'any' },
    { category: 'crowd_cheer_excited', delayMs: 500, perspective: 'any' },
  ],
  DEATH_OVERS_START: [
    { category: 'heartbeat', perspective: 'any', volume: 0.4 },
    { category: 'crowd_cheer_excited', delayMs: 300, perspective: 'any' },
  ],

  // ── UI ──
  UI_SHOW_CARD: [{ category: 'ui_card_slide_in', perspective: 'any' }],
  UI_HIDE_CARD: [{ category: 'ui_card_slide_out', perspective: 'any' }],
  UI_UPDATE_SCORE: [{ category: 'ui_score_tick', perspective: 'any' }],
  UI_FLASH_BOUNDARY: [{ category: 'ui_success', perspective: 'any' }],
  UI_SCREEN_SHAKE: [{ category: 'ui_error', perspective: 'any', haptic: 'heavy' }],
};

/** Ambient crossfade mapping based on crowd intensity */
export const AMBIENT_INTENSITY_MAP: Record<string, string> = {
  quiet: 'ambient_crowd_quiet',
  moderate: 'ambient_crowd_moderate',
  tense: 'ambient_crowd_tense',
  active: 'ambient_crowd_loud',
  excited: 'ambient_crowd_loud',
  pandemonium: 'ambient_crowd_loud',
};

/** Weather-based ambient overlay */
export const WEATHER_AMBIENT_MAP: Record<string, string> = {
  drizzle: 'ambient_rain',
  dust_storm: 'ambient_wind',
};

/** Match result sound triggers */
export const MATCH_RESULT_SOUNDS = {
  win: [
    { category: 'victory_fanfare', delayMs: 0 },
    { category: 'firework_pop', delayMs: 300 },
    { category: 'crowd_eruption', delayMs: 500 },
    { category: 'firework_pop', delayMs: 800 },
    { category: 'firework_pop', delayMs: 1400 },
  ],
  loss: [
    { category: 'defeat_sting', delayMs: 0 },
    { category: 'crowd_groan', delayMs: 300 },
  ],
  draw: [
    { category: 'crowd_cheer_mild', delayMs: 0 },
  ],
} as const;

/** Reward sounds for shop / chest / card reveals */
export const REWARD_SOUNDS = {
  coinCollect: 'coin_collect',
  gemCollect: 'gem_collect',
  cardFlip: 'card_flip',
  legendaryReveal: 'card_legendary_reveal',
  chestUnlock: 'chest_unlock',
} as const;
