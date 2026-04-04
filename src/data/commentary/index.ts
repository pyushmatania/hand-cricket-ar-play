// ═══════════════════════════════════════════════════
// Commentary Content Index
// Maps EventType + Language → CommentaryLine[]
// ═══════════════════════════════════════════════════

import type { CommentaryLine, CommentaryLanguage } from '@/engines/types';

import {
  EN_DEFENSE_SCORED, EN_WICKET_DEFENSE,
  EN_SINGLE, EN_DOUBLE, EN_TRIPLE,
  EN_BOUNDARY_FOUR, EN_BOUNDARY_SIX,
  EN_WICKET_BOWLED, EN_WICKET_CAUGHT, EN_WICKET_LBW,
  EN_WICKET_RUN_OUT, EN_WICKET_STUMPED,
  EN_OVER_END, EN_MILESTONE_50, EN_MILESTONE_100,
  EN_MATCH_WIN, EN_MATCH_LOSS,
} from './english';

import {
  HI_DEFENSE_SCORED, HI_WICKET_DEFENSE,
  HI_RUNS, HI_TRIPLE,
  HI_BOUNDARY_FOUR, HI_BOUNDARY_SIX,
  HI_WICKET_BOWLED, HI_WICKET_CAUGHT, HI_WICKET_LBW,
  HI_OVER_END, HI_MILESTONE_50, HI_MILESTONE_100,
  HI_MATCH_WIN, HI_MATCH_LOSS,
} from './hindi';

import {
  HL_DEFENSE_SCORED, HL_WICKET_DEFENSE,
  HL_RUNS, HL_TRIPLE,
  HL_BOUNDARY_FOUR, HL_BOUNDARY_SIX,
  HL_WICKET_BOWLED, HL_WICKET_CAUGHT, HL_WICKET_LBW,
  HL_OVER_END, HL_MILESTONE_50, HL_MILESTONE_100,
  HL_MATCH_WIN, HL_MATCH_LOSS,
} from './hinglish';

type CommentaryPool = Record<string, CommentaryLine[]>;

const englishPool: CommentaryPool = {
  DEFENSE_SCORED: EN_DEFENSE_SCORED,
  WICKET_DEFENSE: EN_WICKET_DEFENSE,
  RUNS_SCORED: [...EN_SINGLE, ...EN_DOUBLE, ...EN_TRIPLE],
  BOUNDARY_FOUR: EN_BOUNDARY_FOUR,
  BOUNDARY_SIX: EN_BOUNDARY_SIX,
  WICKET_BOWLED: EN_WICKET_BOWLED,
  WICKET_CAUGHT: EN_WICKET_CAUGHT,
  WICKET_CAUGHT_BEHIND: EN_WICKET_CAUGHT,
  WICKET_LBW: EN_WICKET_LBW,
  WICKET_RUN_OUT: EN_WICKET_RUN_OUT,
  WICKET_STUMPED: EN_WICKET_STUMPED,
  WICKET_HIT_WICKET: EN_WICKET_BOWLED,
  OVER_END: EN_OVER_END,
  MILESTONE_50: EN_MILESTONE_50,
  MILESTONE_100: EN_MILESTONE_100,
  MATCH_END: [...EN_MATCH_WIN, ...EN_MATCH_LOSS],
};

const hindiPool: CommentaryPool = {
  DEFENSE_SCORED: HI_DEFENSE_SCORED,
  WICKET_DEFENSE: HI_WICKET_DEFENSE,
  RUNS_SCORED: [...HI_RUNS, ...HI_TRIPLE],
  BOUNDARY_FOUR: HI_BOUNDARY_FOUR,
  BOUNDARY_SIX: HI_BOUNDARY_SIX,
  WICKET_BOWLED: HI_WICKET_BOWLED,
  WICKET_CAUGHT: HI_WICKET_CAUGHT,
  WICKET_CAUGHT_BEHIND: HI_WICKET_CAUGHT,
  WICKET_LBW: HI_WICKET_LBW,
  WICKET_RUN_OUT: HI_WICKET_BOWLED,
  WICKET_STUMPED: HI_WICKET_BOWLED,
  WICKET_HIT_WICKET: HI_WICKET_BOWLED,
  OVER_END: HI_OVER_END,
  MILESTONE_50: HI_MILESTONE_50,
  MILESTONE_100: HI_MILESTONE_100,
  MATCH_END: [...HI_MATCH_WIN, ...HI_MATCH_LOSS],
};

const hinglishPool: CommentaryPool = {
  DEFENSE_SCORED: HL_DEFENSE_SCORED,
  WICKET_DEFENSE: HL_WICKET_DEFENSE,
  RUNS_SCORED: [...HL_RUNS, ...HL_TRIPLE],
  BOUNDARY_FOUR: HL_BOUNDARY_FOUR,
  BOUNDARY_SIX: HL_BOUNDARY_SIX,
  WICKET_BOWLED: HL_WICKET_BOWLED,
  WICKET_CAUGHT: HL_WICKET_CAUGHT,
  WICKET_CAUGHT_BEHIND: HL_WICKET_CAUGHT,
  WICKET_LBW: HL_WICKET_LBW,
  WICKET_RUN_OUT: HL_WICKET_BOWLED,
  WICKET_STUMPED: HL_WICKET_BOWLED,
  WICKET_HIT_WICKET: HL_WICKET_BOWLED,
  OVER_END: HL_OVER_END,
  MILESTONE_50: HL_MILESTONE_50,
  MILESTONE_100: HL_MILESTONE_100,
  MATCH_END: [...HL_MATCH_WIN, ...HL_MATCH_LOSS],
};

const pools: Record<CommentaryLanguage, CommentaryPool> = {
  english: englishPool,
  hindi: hindiPool,
  hinglish: hinglishPool,
};

/**
 * Get the commentary pool for a given event type and language.
 * For 'hinglish' mode, randomly picks between english and hindi pools
 * for variety (50/50 chance per call).
 */
export function getCommentaryPool(
  eventType: string,
  language: CommentaryLanguage
): CommentaryLine[] {
  if (language === 'hinglish') {
    const roll = Math.random();
    if (roll < 0.5) {
      return hinglishPool[eventType] || [];
    } else if (roll < 0.75) {
      return englishPool[eventType] || [];
    } else {
      return hindiPool[eventType] || [];
    }
  }

  return pools[language]?.[eventType] || [];
}
