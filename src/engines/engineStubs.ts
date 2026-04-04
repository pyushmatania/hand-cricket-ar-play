// ═══════════════════════════════════════════════════
// Doc 2 — Placeholder Engine Stubs
// These will be fully implemented in subsequent steps
// ═══════════════════════════════════════════════════

import type { EventType, MatchContext, BallResult, PlayerStats, WeatherState } from './types';

// ── SYNC ENGINE (Chapter 3) ──
export class SyncEngine {
  private matchId = '';
  private userId = '';
  private isHost = false;

  async connect(matchId: string, userId: string, opponentId: string): Promise<void> {
    this.matchId = matchId;
    this.userId = userId;
  }

  disconnect(): void {}

  async waitForSync(pointId: string, timeoutMs = 15000): Promise<void> {
    // Stub — immediate resolve for AI mode
  }

  async sendBallPick(pick: number, role: 'batting' | 'bowling', ballId: string): Promise<void> {
    // Stub
  }

  setIsHost(isHost: boolean): void { this.isHost = isHost; }

  destroy(): void {}
}

// ── GAMEPLAY ENGINE (Chapter 4) ──
export class GameplayEngine {
  private modifiers: Map<string, number> = new Map();

  resolveBall(
    battingPick: number,
    bowlingPick: number,
    batsman: PlayerStats,
    bowler: PlayerStats,
    context: MatchContext
  ): BallResult {
    // Simplified resolution — will be expanded with full Doc 2 algorithm
    if (battingPick === bowlingPick) {
      const outChance = ((100 - batsman.technique) / 100) * (bowler.accuracy / 100);
      if (Math.random() < Math.max(0.05, Math.min(0.85, outChance))) {
        return {
          runs: 0, isWicket: true, isDot: false,
          isBoundaryFour: false, isBoundarySix: false,
          isWide: false, isNoBall: false,
          dismissalType: 'bowled',
          battingPick, bowlingPick,
          commentary: '', soundEffects: [],
        };
      }
      return {
        runs: 0, isWicket: false, isDot: true,
        isBoundaryFour: false, isBoundarySix: false,
        isWide: false, isNoBall: false,
        dismissalType: null,
        battingPick, bowlingPick,
        commentary: '', soundEffects: [],
      };
    }

    const runs = Math.max(0, Math.min(6, Math.round(battingPick * (batsman.power / 100))));
    return {
      runs,
      isWicket: false,
      isDot: runs === 0,
      isBoundaryFour: runs === 4,
      isBoundarySix: runs === 6,
      isWide: false, isNoBall: false,
      dismissalType: null,
      battingPick, bowlingPick,
      commentary: '', soundEffects: [],
    };
  }

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

// ── SOUND ENGINE (Chapter 5) ──
export class SoundEngine {
  private enabled = { sound: true, music: true, vibration: true };
  private volumes = { master: 1.0, effects: 0.8, ambient: 0.25, music: 0.15, commentary: 1.0 };

  playEffect(categoryId: string, volumeOverride?: number): void {
    // Stub — will use Howler.js
    if (!this.enabled.sound) return;
    console.debug(`[SoundEngine] playEffect: ${categoryId}`);
  }

  playSpecific(src: string, volume = 1.0): void {
    if (!this.enabled.sound) return;
    console.debug(`[SoundEngine] playSpecific: ${src}`);
  }

  setAmbient(src: string, volume = 0.25, fadeDuration = 500): void {
    console.debug(`[SoundEngine] setAmbient: ${src}`);
  }

  setAmbientVolume(volume: number, fadeDuration = 300): void {}

  stopAllEffects(): void {}

  vibrate(pattern: 'light' | 'medium' | 'heavy' | 'error'): void {
    if (!this.enabled.vibration || !navigator.vibrate) return;
    const patterns: Record<string, number[]> = {
      light: [10], medium: [20], heavy: [40], error: [30, 20, 30],
    };
    navigator.vibrate(patterns[pattern] || [10]);
  }

  setMasterVolume(v: number): void { this.volumes.master = v; }
  setEffectsVolume(v: number): void { this.volumes.effects = v; }
  setEnabled(key: 'sound' | 'music' | 'vibration', val: boolean): void { this.enabled[key] = val; }

  destroy(): void {
    this.stopAllEffects();
  }
}

// ── COMMENTARY ENGINE (Chapter 6) ──
export class CommentaryEngine {
  private isMuted = false;
  private isSpeaking = false;

  async speakForEvent(
    eventType: EventType,
    context: MatchContext,
    perspective: string
  ): Promise<void> {
    if (this.isMuted || this.isSpeaking) return;
    // Stub — will be expanded with Doc 3 content
    console.debug(`[CommentaryEngine] ${eventType} (${perspective})`);
  }

  setMuted(muted: boolean): void { this.isMuted = muted; }
  setLanguage(lang: string): void {}
  setTheme(theme: string): void {}

  destroy(): void {
    speechSynthesis?.cancel();
  }
}

// ── LIGHTING ENGINE (Chapter 7) ──
export class LightingEngine {
  private ambientBrightness = 1.0;

  flashScreen(color: string, durationMs: number, maxOpacity = 0.3): void {
    const overlay = document.getElementById('lighting-overlay');
    if (!overlay) return;
    overlay.style.background = color;
    overlay.style.opacity = String(maxOpacity);
    overlay.style.transition = `opacity ${durationMs}ms ease-out`;
    requestAnimationFrame(() => { overlay.style.opacity = '0'; });
    setTimeout(() => { overlay.style.transition = ''; }, durationMs + 50);
  }

  async floodlightWave(): Promise<void> {
    const positions = ['15%', '35%', '65%', '85%'];
    for (const pos of positions) {
      this.flashAt(pos, 'rgba(255,255,230,0.15)', 200);
      await new Promise(r => setTimeout(r, 120));
    }
  }

  glowBoundary(color: string, durationMs: number): void {
    this.flashScreen(color, durationMs, 0.1);
  }

  setAmbientBrightness(b: number): void {
    this.ambientBrightness = b;
  }

  setVignette(intensity: number): void {
    const vignette = document.getElementById('vignette-overlay');
    if (!vignette) return;
    vignette.style.opacity = String(intensity);
  }

  private flashAt(xPos: string, color: string, durationMs: number): void {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed; top: 0; left: ${xPos}; transform: translateX(-50%);
      width: 200px; height: 100vh;
      background: radial-gradient(ellipse at 50% 0%, ${color}, transparent 60%);
      pointer-events: none; z-index: 999; opacity: 1;
      transition: opacity ${durationMs}ms ease-out;
    `;
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '0'; });
    setTimeout(() => flash.remove(), durationMs + 100);
  }

  destroy(): void {}
}

// ── WEATHER ENGINE (Chapter 8) ──
export class WeatherEngine {
  private currentWeather: WeatherState = 'clear';

  async setWeather(weather: WeatherState): Promise<void> {
    this.currentWeather = weather;
    console.debug(`[WeatherEngine] Weather: ${weather}`);
  }

  getWeather(): WeatherState { return this.currentWeather; }

  static getRandomWeather(theme: string): WeatherState {
    const weights: Record<string, Record<WeatherState, number>> = {
      stadium: { clear: 25, overcast: 15, night_lights: 30, golden_hour: 10, heavy_dew: 10, drizzle: 8, dust_storm: 2 },
      default: { clear: 35, overcast: 15, night_lights: 20, golden_hour: 15, drizzle: 8, heavy_dew: 5, dust_storm: 2 },
    };
    const w = weights[theme] || weights.default;
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    for (const [weather, weight] of Object.entries(w)) {
      roll -= weight;
      if (roll <= 0) return weather as WeatherState;
    }
    return 'clear';
  }

  destroy(): void {}
}

// ── CROWD ENGINE (Chapter 9) ──
export class CrowdEngine {
  private mood = 30;
  private decayInterval: ReturnType<typeof setInterval> | null = null;
  private lastMexicanWave = 0;

  start(): void {
    this.decayInterval = setInterval(() => {
      this.mood = Math.max(0, this.mood - 0.5);
    }, 1000);
  }

  stop(): void {
    if (this.decayInterval) clearInterval(this.decayInterval);
  }

  reactToEvent(eventType: EventType, payload: Record<string, any>): void {
    switch (eventType) {
      case 'DOT_BALL': this.mood = Math.max(0, this.mood - 3); break;
      case 'RUNS_SCORED': this.mood += (payload.runs || 1) * 4; break;
      case 'BOUNDARY_FOUR': this.mood = Math.min(100, this.mood + 25); break;
      case 'BOUNDARY_SIX': this.mood = 100; break;
      case 'WICKET_BOWLED': case 'WICKET_CAUGHT': case 'WICKET_LBW':
      case 'WICKET_RUN_OUT': case 'WICKET_STUMPED': case 'WICKET_CAUGHT_BEHIND':
        this.mood = 85; break;
      case 'MILESTONE_50': this.mood = Math.min(100, this.mood + 30); break;
      case 'MILESTONE_100': case 'HATTRICK': this.mood = 100; break;
      case 'OVER_END': this.mood = Math.max(20, this.mood - 5); break;
      case 'DEATH_OVERS_START': this.mood = Math.max(60, this.mood); break;
    }
    this.mood = Math.max(0, Math.min(100, this.mood));
  }

  getMood(): number { return this.mood; }
  setMood(mood: number): void { this.mood = Math.max(0, Math.min(100, mood)); }

  destroy(): void {
    this.stop();
  }
}
