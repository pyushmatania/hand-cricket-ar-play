// ═══════════════════════════════════════════════════
// Doc 2 — Zustand Stores
// ═══════════════════════════════════════════════════

import { create } from 'zustand';
import type { MatchContext, MatchSituation, WeatherState, CrowdIntensity, BallResult } from '../engines/types';

// ── MATCH STORE ──

interface MatchState {
  matchId: string | null;
  innings: 1 | 2;
  over: number;
  ball: number;
  score: number;
  wickets: number;
  target: number | null;
  phase: 'not_started' | 'toss' | 'playing' | 'innings_break' | 'finished';
  battingTeam: string;
  bowlingTeam: string;
  ballHistory: BallResult[];
  isHost: boolean;
  isPvP: boolean;
  overs: number; // Total overs in match

  // Actions
  setMatch: (data: Partial<MatchState>) => void;
  addBallResult: (result: BallResult) => void;
  nextInnings: (target: number) => void;
  reset: () => void;
}

const initialMatchState = {
  matchId: null,
  innings: 1 as const,
  over: 0,
  ball: 0,
  score: 0,
  wickets: 0,
  target: null,
  phase: 'not_started' as const,
  battingTeam: 'Player',
  bowlingTeam: 'AI',
  ballHistory: [],
  isHost: false,
  isPvP: false,
  overs: 5,
};

export const useMatchStore = create<MatchState>((set) => ({
  ...initialMatchState,
  setMatch: (data) => set((s) => ({ ...s, ...data })),
  addBallResult: (result) => set((s) => {
    const isExtra = result.isWide || result.isNoBall;
    // Wides and no-balls don't count as legal deliveries — don't advance ball/over
    const nextBall = isExtra ? s.ball : (s.ball + 1) % 6;
    const nextOver = isExtra ? s.over : ((s.ball + 1) >= 6 ? s.over + 1 : s.over);
    return {
      ballHistory: [...s.ballHistory, result],
      score: s.score + (result.isWicket ? 0 : result.runs),
      wickets: s.wickets + (result.isWicket ? 1 : 0),
      ball: nextBall,
      over: nextOver,
    };
  }),
  nextInnings: (target) => set((s) => ({
    innings: 2,
    over: 0,
    ball: 0,
    score: 0,
    wickets: 0,
    target,
    phase: 'innings_break',
    battingTeam: s.bowlingTeam,
    bowlingTeam: s.battingTeam,
  })),
  reset: () => set(initialMatchState),
}));

// ── ENGINE STORE ──

interface EngineState {
  // Event engine
  isProcessing: boolean;
  queueLength: number;
  lastEventType: string | null;

  // Crowd
  crowdMood: number;
  crowdIntensity: CrowdIntensity;

  // Weather
  weather: WeatherState;

  // Lighting
  ambientBrightness: number;

  // Commentary
  currentCommentary: string | null;
  commentaryLanguage: string;

  // Sound
  masterVolume: number;
  effectsVolume: number;
  ambientVolume: number;
  musicVolume: number;
  soundEnabled: boolean;
  musicEnabled: boolean;

  // Match situation
  matchSituation: MatchSituation;

  // Actions
  setEngineState: (data: Partial<EngineState>) => void;
}

export const useEngineStore = create<EngineState>((set) => ({
  isProcessing: false,
  queueLength: 0,
  lastEventType: null,
  crowdMood: 30,
  crowdIntensity: 'moderate',
  weather: 'clear',
  ambientBrightness: 1.0,
  currentCommentary: null,
  commentaryLanguage: 'english',
  masterVolume: 1.0,
  effectsVolume: 0.8,
  ambientVolume: 0.25,
  musicVolume: 0.15,
  soundEnabled: true,
  musicEnabled: true,
  matchSituation: 'comfortable',
  setEngineState: (data) => set((s) => ({ ...s, ...data })),
}));

// ── SETTINGS STORE ──

interface SettingsState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  commentaryEnabled: boolean;
  voiceEnabled: boolean;
  crowdEnabled: boolean;
  commentaryLanguage: string;
  ambientVolume: number;

  setSettings: (data: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  commentaryEnabled: true,
  voiceEnabled: true,
  crowdEnabled: true,
  commentaryLanguage: 'english',
  ambientVolume: 0.25,
  setSettings: (data) => set((s) => ({ ...s, ...data })),
}));
