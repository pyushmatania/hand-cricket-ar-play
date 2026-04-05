// ═══════════════════════════════════════════════════
// Doc 2 — Chapter 10: Engine Manager
// Initializes all engines and wires them together
// ═══════════════════════════════════════════════════

import { EventEngine } from './EventEngine';
import { SyncEngine } from './SyncEngine';
import { GameplayEngine } from './GameplayEngine';
import { SoundEngine } from './SoundEngine';
import { CommentaryEngine } from './CommentaryEngine';
import { LightingEngine } from './LightingEngine';
import { WeatherEngine } from './WeatherEngine';
import { CrowdEngine } from './CrowdEngine';
import {
  SOUND_TRIGGER_MAP,
  AMBIENT_INTENSITY_MAP,
  WEATHER_AMBIENT_MAP,
  MATCH_RESULT_SOUNDS,
} from './SoundTriggerMap';
import type { EventType, CrowdIntensity, WeatherState } from './types';

/**
 * Perspective: determines which "side" the player is on for audio/effects.
 * 'batting' = player is batting (boundary = euphoria)
 * 'bowling' = player is bowling (wicket = euphoria)
 */
type Perspective = 'batting' | 'bowling';

class EngineManager {
  private _perspective: Perspective = 'batting';
  event: EventEngine;
  sync: SyncEngine;
  gameplay: GameplayEngine;
  sound: SoundEngine;
  commentary: CommentaryEngine;
  lighting: LightingEngine;
  weather: WeatherEngine;
  crowd: CrowdEngine;

  private _initialized = false;

  constructor() {
    this.event = new EventEngine();
    this.sync = new SyncEngine();
    this.gameplay = new GameplayEngine();
    this.sound = new SoundEngine();
    this.commentary = new CommentaryEngine();
    this.lighting = new LightingEngine();
    this.weather = new WeatherEngine();
    this.crowd = new CrowdEngine();
  }

  /** Set which side the player is on — affects audio perspective */
  setPerspective(p: Perspective): void { this._perspective = p; }
  getPerspective(): Perspective { return this._perspective; }

  initialize(): void {
    if (this._initialized) return;
    this._initialized = true;
    // Clear any stale listeners before wiring to prevent duplicates
    this.event.destroy();
    this.wireEngines();
    // Don't start crowd here — useEngines syncs crowdEnabled separately

    if (import.meta.env.DEV) {
      this.event.onAny((payload, event) => {
        console.debug(`[Engine] ${event.type}`, payload);
      });
    }
  }

  private wireEngines(): void {
    const E = this.event;

    // Wire CrowdEngine dependencies
    this.crowd.setSoundEngine(this.sound);
    this.crowd.setEventEngine(this.event);

    // Helper: is the player batting right now?
    const isBatting = () => this._perspective === 'batting';

    // ── Doc 5 §3: Declarative Sound Trigger Map ──
    // Wire all events from the trigger map automatically
    const registeredSoundEvents = new Set<string>();
    for (const [eventType, triggers] of Object.entries(SOUND_TRIGGER_MAP)) {
      if (triggers.length === 0) continue; // e.g. MATCH_END handled separately
      registeredSoundEvents.add(eventType);

      E.on(eventType as EventType, () => {
        const perspective = this._perspective;
        for (const trigger of triggers) {
          // Skip if perspective doesn't match
          if (trigger.perspective !== 'any' && trigger.perspective !== perspective) continue;

          const play = () => {
            this.sound.playEffect(trigger.category, trigger.volume);
            if (trigger.haptic) this.sound.vibrate(trigger.haptic);
          };

          if (trigger.delayMs && trigger.delayMs > 0) {
            setTimeout(play, trigger.delayMs);
          } else {
            play();
          }
        }
      });
    }

    // ── Match End (dynamic based on result) ──
    E.on('MATCH_END', (p) => {
      const result = p.result as 'win' | 'loss' | 'draw';
      const triggers = MATCH_RESULT_SOUNDS[result] || MATCH_RESULT_SOUNDS.draw;
      for (const t of triggers) {
        if (t.delayMs > 0) {
          setTimeout(() => this.sound.playEffect(t.category), t.delayMs);
        } else {
          this.sound.playEffect(t.category);
        }
      }
      if (result === 'win') this.sound.vibrate('heavy');
      else if (result === 'loss') this.sound.vibrate('error');
    });

    // ── Ambient crossfade based on crowd intensity ──
    E.on('CROWD_REACT', (p) => {
      const intensity = p.intensity as CrowdIntensity;
      const ambientCategory = AMBIENT_INTENSITY_MAP[intensity];
      if (ambientCategory) {
        const cat = this.sound.getCategory(ambientCategory);
        if (cat?.variants?.[0]) {
          this.sound.setAmbient(cat.variants[0].src);
        }
      }
    });

    // ── Weather ambient overlays ──
    E.on('WEATHER_CHANGE', (p) => {
      const weather = p.weather as string;
      const ambientKey = WEATHER_AMBIENT_MAP[weather];
      if (ambientKey) {
        const cat = this.sound.getCategory(ambientKey);
        if (cat?.variants?.[0]) {
          this.sound.setAmbient(cat.variants[0].src, 0.15);
        }
      }
    });

    // ── Commentary Engine listeners ──
    E.on('DEFENSE_SCORED', (p) => {
      if (Math.random() < 0.5) {
        this.commentary.speakForEvent('DEFENSE_SCORED', p.context, 'neutral');
      }
    });
    E.on('RUNS_SCORED', (p) => {
      if (p.runs >= 2 || Math.random() < 0.3) {
        this.commentary.speakForEvent('RUNS_SCORED', p.context, 'neutral');
      }
    });
    E.on('BOUNDARY_FOUR', (p) => {
      setTimeout(() => this.commentary.speakForEvent('BOUNDARY_FOUR', p.context, 'excited'), 800);
    });
    E.on('BOUNDARY_SIX', (p) => {
      setTimeout(() => this.commentary.speakForEvent('BOUNDARY_SIX', p.context, 'excited'), 1000);
    });
    E.on('WICKET_BOWLED', (p) => {
      setTimeout(() => this.commentary.speakForEvent('WICKET_BOWLED', p.context, 'dramatic'), 500);
    });
    E.on('WICKET_DEFENSE', (p) => {
      setTimeout(() => this.commentary.speakForEvent('WICKET_DEFENSE', p.context, 'dramatic'), 500);
    });
    E.on('WICKET_CAUGHT', (p) => {
      setTimeout(() => this.commentary.speakForEvent('WICKET_CAUGHT', p.context, 'dramatic'), 800);
    });
    E.on('WICKET_LBW', (p) => {
      setTimeout(() => this.commentary.speakForEvent('WICKET_LBW', p.context, 'dramatic'), 1200);
    });
    E.on('MILESTONE_50', (p) => this.commentary.speakForEvent('MILESTONE_50', p.context, 'excited'));
    E.on('MILESTONE_100', (p) => this.commentary.speakForEvent('MILESTONE_100', p.context, 'excited'));
    E.on('OVER_END', (p) => {
      if (Math.random() < 0.8) {
        this.commentary.speakForEvent('OVER_END', p.context, 'neutral');
      }
    });

    // ── Lighting Engine listeners ──
    E.on('BOUNDARY_FOUR', () => this.lighting.glowBoundary('var(--team-accent)', 1200));
    E.on('BOUNDARY_SIX', () => {
      this.lighting.flashScreen('#FFFFFF', 100, 0.25);
      setTimeout(() => this.lighting.floodlightWave(), 200);
    });
    E.on('WICKET_BOWLED', () => this.lighting.flashScreen('#FF0000', 200, 0.2));
    E.on('WICKET_DEFENSE', () => this.lighting.flashScreen('#FF0000', 200, 0.2));
    E.on('WICKET_CAUGHT', () => this.lighting.flashScreen('#FF0000', 200, 0.2));
    E.on('WICKET_LBW', () => this.lighting.flashScreen('#FF0000', 200, 0.2));
    E.on('WICKET_RUN_OUT', () => this.lighting.flashScreen('#FF0000', 200, 0.2));
    E.on('WICKET_CAUGHT_BEHIND', () => this.lighting.flashScreen('#FF0000', 200, 0.2));
    E.on('WICKET_STUMPED', () => this.lighting.flashScreen('#FF0000', 200, 0.2));
    E.on('WICKET_HIT_WICKET', () => this.lighting.flashScreen('#FF0000', 200, 0.2));
    E.on('DEATH_OVERS_START', () => this.lighting.setAmbientBrightness(1.05));

    // ── Crowd Engine listeners ──
    const crowdEvents: EventType[] = [
      'MATCH_START',
      'DEFENSE_SCORED', 'RUNS_SCORED', 'BOUNDARY_FOUR', 'BOUNDARY_SIX',
      'WICKET_BOWLED', 'WICKET_DEFENSE', 'WICKET_CAUGHT', 'WICKET_LBW',
      'WICKET_RUN_OUT', 'WICKET_STUMPED', 'WICKET_CAUGHT_BEHIND',
      'WICKET_HIT_WICKET',
      'MILESTONE_50', 'MILESTONE_100', 'MILESTONE_5_WICKETS', 'HATTRICK',
      'OVER_END', 'DEATH_OVERS_START',
    ];
    crowdEvents.forEach(evt => {
      E.on(evt, (payload) => this.crowd.reactToEvent(evt, payload));
    });
  }

  destroy(): void {
    this.event.destroy();
    this.sync.destroy();
    this.gameplay.destroy();
    this.sound.destroy();
    this.commentary.destroy();
    this.lighting.destroy();
    this.weather.destroy();
    this.crowd.destroy();
    this._initialized = false;
  }
}

// Singleton
export const engines = new EngineManager();
export default engines;
