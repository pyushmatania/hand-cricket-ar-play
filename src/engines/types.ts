// ═══════════════════════════════════════════════════
// Doc 2 — Shared Types for All 8 Engines
// ═══════════════════════════════════════════════════

// ── EVENT TYPES ──

export type EventType =
  // Match lifecycle
  | 'MATCH_INIT'
  | 'MATCH_START'
  | 'MATCH_END'
  | 'MATCH_ABANDONED'

  // Toss
  | 'TOSS_BEGIN'
  | 'TOSS_COIN_FLIP'
  | 'TOSS_RESULT'
  | 'TOSS_DECISION'

  // Innings
  | 'INNINGS_START'
  | 'INNINGS_END'
  | 'INNINGS_BREAK'

  // Overs
  | 'OVER_START'
  | 'OVER_END'
  | 'POWERPLAY_START'
  | 'POWERPLAY_END'
  | 'MIDDLE_OVERS_START'
  | 'DEATH_OVERS_START'

  // Ball-by-ball
  | 'BALL_BOWLER_RUNUP'
  | 'BALL_PICKS_READY'
  | 'BALL_RESULT'
  | 'BALL_ANIMATION_DONE'

  // Scoring events
  | 'DEFENSE_SCORED'
  | 'RUNS_SCORED'
  | 'BOUNDARY_FOUR'
  | 'BOUNDARY_SIX'
  | 'WIDE_BALL'
  | 'NO_BALL'

  // Wicket events
  | 'WICKET_BOWLED'
  | 'WICKET_CAUGHT'
  | 'WICKET_CAUGHT_BEHIND'
  | 'WICKET_LBW'
  | 'WICKET_RUN_OUT'
  | 'WICKET_STUMPED'
  | 'WICKET_HIT_WICKET'
  | 'WICKET_DEFENSE'

  // Player events
  | 'NEW_BATSMAN'
  | 'BOWLER_CHANGE'
  | 'STRIKER_CHANGE'

  // Milestone events
  | 'MILESTONE_50'
  | 'MILESTONE_100'
  | 'MILESTONE_5_WICKETS'
  | 'HATTRICK'

  // Review events
  | 'DRS_REVIEW_START'
  | 'DRS_REVIEW_RESULT'

  // UI-specific events
  | 'UI_SHOW_CARD'
  | 'UI_HIDE_CARD'
  | 'UI_UPDATE_SCORE'
  | 'UI_FLASH_BOUNDARY'
  | 'UI_SCREEN_SHAKE'

  // Crowd/Atmosphere events
  | 'CROWD_REACT'
  | 'CROWD_CHANT_START'
  | 'CROWD_MEXICAN_WAVE'

  // Weather events
  | 'WEATHER_CHANGE'
  | 'WEATHER_RAIN_START'
  | 'WEATHER_RAIN_STOP'

  // Commentary events
  | 'COMMENTARY_LINE'
  | 'COMMENTARY_DUO'

  // Sound events
  | 'SOUND_EFFECT'
  | 'SOUND_AMBIENT_CHANGE'
  | 'SOUND_MUSIC_CHANGE';

// ── GAME EVENT ──

export interface GameEvent {
  id: string;
  type: EventType;
  payload: Record<string, any>;
  timestamp: number;
  duration: number;       // How long this event's effects last (ms)
  blocking: boolean;      // If true, queue pauses until duration expires
  priority: number;       // Higher number = processed first
  source: 'local' | 'server' | 'sync';
}

// ── MATCH CONTEXT ──

export type MatchPhase = 'powerplay' | 'middle' | 'death';
export type MatchSituation = 'comfortable' | 'tight' | 'tense' | 'critical';
export type PitchType = 'flat' | 'green_top' | 'dustbowl' | 'minefield';

export interface MatchContext {
  innings: 1 | 2;
  over: number;
  ball: number;
  phase: MatchPhase;
  battingTeam: string;
  bowlingTeam: string;
  score: number;
  wickets: number;
  target: number | null;
  requiredRunRate: number | null;
  currentRunRate: number;
  lastFewBalls: string[];
  matchSituation: MatchSituation;
  isLastOver: boolean;
  isMatchPoint: boolean;
  pitch?: PitchType;
  totalBalls?: number;
  ballsBowled?: number;
}

// ── BALL RESULT ──

export type DismissalType =
  | 'bowled' | 'caught' | 'caught_behind' | 'lbw'
  | 'run_out' | 'stumped' | 'hit_wicket' | 'defense_standoff';

export interface BallResult {
  runs: number;
  isWicket: boolean;
  isDot: boolean;
  isBoundaryFour: boolean;
  isBoundarySix: boolean;
  isWide: boolean;
  isNoBall: boolean;
  isDefenseScored?: boolean;
  dismissalType: DismissalType | null;
  battingPick: number;
  bowlingPick: number;
  commentary: string;
  soundEffects: string[];
}

// ── PLAYER STATS ──

export interface PlayerStats {
  power: number;        // 0-100
  technique: number;    // 0-100
  accuracy: number;     // 0-100 (bowling)
  clutch: number;       // 0-100
  bowlingType?: 'fast' | 'medium_fast' | 'spin_off' | 'spin_leg';
  specialAbility?: string;
  specialAbilityId?: string;
}

// ── WEATHER ──

export type WeatherState =
  | 'clear' | 'overcast' | 'drizzle'
  | 'heavy_dew' | 'dust_storm' | 'night_lights' | 'golden_hour';

// ── COMMENTARY ──

export type CommentaryLanguage = 'english' | 'hindi' | 'hinglish';
export type CommentaryEmotion = 'neutral' | 'excited' | 'disappointed' | 'shocked' | 'dramatic' | 'calm';
export type CommentaryVoice = 'main' | 'color';

export interface CommentaryLine {
  id: string;
  text: string;
  voice: CommentaryVoice;
  emotion: CommentaryEmotion;
  rate: number;
  pitch: number;
  delay: number;
  followUp?: CommentaryLine;
  minSituation?: string;
  theme?: string;
}

// ── CROWD ──

export type CrowdIntensity = 'quiet' | 'moderate' | 'active' | 'excited' | 'pandemonium';

// ── ENGINE LISTENER ──

export type EventListener = (
  payload: Record<string, any>,
  event: GameEvent
) => void | Promise<void>;

// ── SOUND MANIFEST ──

export interface SoundVariant {
  id: string;
  src: string;
  volume?: number;
}

export interface SoundCategory {
  variants: SoundVariant[];
  lastPlayed: number;
  description?: string;
}
