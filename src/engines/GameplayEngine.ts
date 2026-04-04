// ═══════════════════════════════════════════════════
// Doc 2 — Chapter 4: Gameplay Engine
// Full ball resolution algorithm with modifiers
// ═══════════════════════════════════════════════════

import type { BallResult, DismissalType, PlayerStats, MatchContext, MatchSituation } from './types';

export class GameplayEngine {
  private modifiers: Map<string, number> = new Map();

  /**
   * Main ball resolution: picks + stats + context → BallResult
   */
  resolveBall(
    battingPick: number,
    bowlingPick: number,
    batsman: PlayerStats,
    bowler: PlayerStats,
    context: MatchContext
  ): BallResult {
    // ── STEP 1: Wide/No Ball check (5% combined) ──
    const extraRoll = Math.random();
    if (extraRoll < 0.03) {
      return this.createWideResult(bowler);
    }
    if (extraRoll < 0.05) {
      return this.createNoBallResult(battingPick, batsman);
    }

    // ── STEP 2: Numbers Match → Potential Wicket ──
    if (battingPick === bowlingPick) {
      return this.resolveMatchedNumbers(batsman, bowler, context, battingPick, bowlingPick);
    }

    // ── STEP 3: Numbers Don't Match → Runs ──
    return this.resolveRuns(battingPick, bowlingPick, batsman, bowler, context);
  }

  // ── MATCHED NUMBERS (potential wicket) ──
  private resolveMatchedNumbers(
    batsman: PlayerStats,
    bowler: PlayerStats,
    context: MatchContext,
    battingPick: number,
    bowlingPick: number
  ): BallResult {
    const techDefense = (100 - batsman.technique) / 100;
    const bowlerThreat = bowler.accuracy / 100;
    const pitchFactor = this.getPitchWicketMod(context);
    const clutchFactor = this.getClutchMod(batsman, context);
    const phaseFactor = this.getPhaseWicketMod(context);

    const outChance = techDefense * bowlerThreat * pitchFactor * clutchFactor * phaseFactor;
    const clampedChance = Math.max(0.05, Math.min(0.85, outChance));

    if (Math.random() < clampedChance) {
      // WICKET!
      const dismissalType = this.determineDismissalType(bowler, context);
      return {
        runs: 0,
        isWicket: true,
        isDot: false,
        isBoundaryFour: false,
        isBoundarySix: false,
        isWide: false,
        isNoBall: false,
        dismissalType,
        battingPick,
        bowlingPick,
        commentary: '',
        soundEffects: [],
      };
    }

    // SURVIVED — dot ball
    return {
      runs: 0,
      isWicket: false,
      isDot: true,
      isBoundaryFour: false,
      isBoundarySix: false,
      isWide: false,
      isNoBall: false,
      dismissalType: null,
      battingPick,
      bowlingPick,
      commentary: '',
      soundEffects: [],
    };
  }

  // ── RUNS RESOLUTION ──
  private resolveRuns(
    battingPick: number,
    bowlingPick: number,
    batsman: PlayerStats,
    bowler: PlayerStats,
    context: MatchContext
  ): BallResult {
    let runs = battingPick;

    // Modifiers
    const powerMod = batsman.power / 100;
    const bowlerSaveMod = (100 - bowler.accuracy) / 100;
    const phaseMod = this.getPhaseBattingMod(context, batsman);
    const pitchMod = this.getPitchBattingMod(context);

    let modifiedRuns = runs * powerMod * bowlerSaveMod * phaseMod * pitchMod;

    // Apply any external modifiers (weather, etc.)
    for (const [, value] of this.modifiers) {
      modifiedRuns *= (1 + value);
    }

    // Special abilities
    modifiedRuns = this.applySpecialAbilities(modifiedRuns, batsman, bowler, context);

    // Round and clamp
    runs = Math.round(modifiedRuns);
    runs = Math.max(0, Math.min(6, runs));

    return {
      runs,
      isWicket: false,
      isDot: runs === 0,
      isBoundaryFour: runs === 4,
      isBoundarySix: runs === 6,
      isWide: false,
      isNoBall: false,
      dismissalType: null,
      battingPick,
      bowlingPick,
      commentary: '',
      soundEffects: [],
    };
  }

  // ── DISMISSAL TYPE ──
  private determineDismissalType(bowler: PlayerStats, _context: MatchContext): DismissalType {
    const roll = Math.random();
    const isSpin = bowler.bowlingType?.includes('spin');
    const isPace = bowler.bowlingType?.includes('fast') || bowler.bowlingType?.includes('med');

    if (isPace) {
      if (roll < 0.30) return 'bowled';
      if (roll < 0.55) return 'caught';
      if (roll < 0.70) return 'caught_behind';
      if (roll < 0.85) return 'lbw';
      if (roll < 0.95) return 'run_out';
      return 'hit_wicket';
    } else if (isSpin) {
      if (roll < 0.20) return 'bowled';
      if (roll < 0.45) return 'caught';
      if (roll < 0.55) return 'caught_behind';
      if (roll < 0.75) return 'lbw';
      if (roll < 0.85) return 'stumped';
      if (roll < 0.95) return 'run_out';
      return 'hit_wicket';
    }
    return 'caught'; // Default
  }

  // ── EXTRAS ──
  private createWideResult(bowler: PlayerStats): BallResult {
    return {
      runs: 1,
      isWicket: false,
      isDot: false,
      isBoundaryFour: false,
      isBoundarySix: false,
      isWide: true,
      isNoBall: false,
      dismissalType: null,
      battingPick: 0,
      bowlingPick: 0,
      commentary: 'Wide ball!',
      soundEffects: ['ui_error'],
    };
  }

  private createNoBallResult(battingPick: number, batsman: PlayerStats): BallResult {
    const freeHitRuns = Math.min(6, Math.round(battingPick * (batsman.power / 100)));
    return {
      runs: 1 + freeHitRuns,
      isWicket: false,
      isDot: false,
      isBoundaryFour: freeHitRuns === 4,
      isBoundarySix: freeHitRuns === 6,
      isWide: false,
      isNoBall: true,
      dismissalType: null,
      battingPick,
      bowlingPick: 0,
      commentary: 'No ball!',
      soundEffects: ['ui_error'],
    };
  }

  // ── PHASE MODIFIERS ──
  private getPhaseBattingMod(context: MatchContext, batsman: PlayerStats): number {
    switch (context.phase) {
      case 'powerplay':
        return batsman.specialAbility === 'Explosive Opener' ? 1.35 : 1.12;
      case 'middle':
        return 1.0;
      case 'death':
        return batsman.power > 80 ? 1.28 : 1.10;
      default: return 1.0;
    }
  }

  private getPhaseWicketMod(context: MatchContext): number {
    switch (context.phase) {
      case 'powerplay': return 1.1;
      case 'middle': return 0.9;
      case 'death': return 1.15;
      default: return 1.0;
    }
  }

  // ── PITCH MODIFIERS ──
  private getPitchBattingMod(context: MatchContext): number {
    const pitch = context.pitch || 'flat';
    switch (pitch) {
      case 'green_top': return 0.85;
      case 'dustbowl': return 0.90;
      case 'flat': return 1.15;
      case 'minefield': return 0.80;
      default: return 1.0;
    }
  }

  private getPitchWicketMod(context: MatchContext): number {
    const pitch = context.pitch || 'flat';
    switch (pitch) {
      case 'green_top': return 1.20;
      case 'dustbowl': return 1.15;
      case 'flat': return 0.85;
      case 'minefield': return 1.30;
      default: return 1.0;
    }
  }

  // ── CLUTCH MODIFIER ──
  private getClutchMod(batsman: PlayerStats, context: MatchContext): number {
    if (context.matchSituation === 'critical' || context.matchSituation === 'tense') {
      return (100 - batsman.clutch * 0.5) / 100;
    }
    return 1.0;
  }

  // ── SPECIAL ABILITIES ──
  private applySpecialAbilities(
    runs: number,
    batsman: PlayerStats,
    _bowler: PlayerStats,
    _context: MatchContext
  ): number {
    switch (batsman.specialAbilityId) {
      case 'helicopter_shot':
        if (Math.round(runs) === 4 && Math.random() < 0.20) return 6;
        break;
      case 'hitman_pull':
        if (runs >= 5 && Math.random() < 0.30) return 6;
        break;
      case '360_player':
        runs *= 1.20;
        break;
    }
    return runs;
  }

  // ── EXTERNAL MODIFIERS (weather, etc.) ──
  applyModifier(key: string, value: number): void {
    this.modifiers.set(key, value);
  }

  clearModifiers(): void {
    this.modifiers.clear();
  }

  destroy(): void {
    this.modifiers.clear();
  }
}

// ── MATCH SITUATION CALCULATOR ──
export function calculateMatchSituation(context: MatchContext): MatchSituation {
  if (context.innings === 1) {
    if (context.wickets >= 7) return 'critical';
    if (context.wickets >= 5 && context.currentRunRate < 6) return 'tense';
    if (context.currentRunRate > 10) return 'comfortable';
    return 'tight';
  }

  // 2nd innings
  const runsNeeded = (context.target ?? 0) - context.score;
  const ballsRemaining = (context.totalBalls ?? 30) - (context.ballsBowled ?? 0);

  if (runsNeeded <= 0) return 'comfortable';
  if (context.wickets >= 8) return 'critical';

  const reqRate = ballsRemaining > 0 ? (runsNeeded / ballsRemaining) * 6 : 99;

  if (reqRate > 15) return 'critical';
  if (reqRate > 10) return 'tense';
  if (reqRate > 7) return 'tight';
  return 'comfortable';
}
