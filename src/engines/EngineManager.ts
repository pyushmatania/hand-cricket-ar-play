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
import type { EventType } from './types';

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
    this.wireEngines();
    this.crowd.start();

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

    // ── Sound Engine listeners (perspective-aware) ──
    E.on('DEFENSE_SCORED', (p) => {
      this.sound.playEffect('bat_hit_soft');
      if (p.runs >= 1) this.sound.playEffect('running_footsteps');
      this.sound.vibrate('light');
    });

    E.on('RUNS_SCORED', (p) => {
      this.sound.playEffect(p.runs <= 1 ? 'bat_hit_soft' : 'bat_hit_medium');
      if (p.runs >= 1) this.sound.playEffect('running_footsteps');
      this.sound.vibrate('light');
    });

    E.on('BOUNDARY_FOUR', () => {
      this.sound.playEffect('bat_hit_hard');
      if (isBatting()) {
        setTimeout(() => this.sound.playEffect('crowd_cheer_excited'), 600);
        this.sound.vibrate('medium');
      } else {
        setTimeout(() => this.sound.playEffect('crowd_gasp'), 400);
      }
    });

    E.on('BOUNDARY_SIX', () => {
      this.sound.playEffect('bat_hit_massive');
      if (isBatting()) {
        setTimeout(() => this.sound.playEffect('ball_flight_whoosh'), 200);
        setTimeout(() => this.sound.playEffect('crowd_eruption'), 800);
        setTimeout(() => this.sound.playEffect('firework_pop'), 1200);
        setTimeout(() => this.sound.playEffect('firework_pop'), 1600);
        this.sound.vibrate('heavy');
      } else {
        setTimeout(() => this.sound.playEffect('crowd_gasp'), 300);
        this.sound.vibrate('medium');
      }
    });

    E.on('WICKET_BOWLED', () => {
      this.sound.playEffect('stumps_hit');
      if (isBatting()) {
        setTimeout(() => this.sound.playEffect('crowd_gasp'), 200);
        this.sound.vibrate('heavy');
      } else {
        setTimeout(() => this.sound.playEffect('crowd_appeal'), 300);
        setTimeout(() => this.sound.playEffect('crowd_celebration_sustained'), 1000);
        this.sound.vibrate('heavy');
      }
    });

    E.on('WICKET_DEFENSE', () => {
      this.sound.playEffect('stumps_hit');
      if (isBatting()) {
        setTimeout(() => this.sound.playEffect('crowd_gasp'), 200);
        this.sound.vibrate('heavy');
      } else {
        setTimeout(() => this.sound.playEffect('crowd_appeal'), 300);
        setTimeout(() => this.sound.playEffect('crowd_celebration_sustained'), 1000);
        this.sound.vibrate('heavy');
      }
    });

    E.on('WICKET_CAUGHT', () => {
      this.sound.playEffect('ball_edge');
      if (!isBatting()) {
        setTimeout(() => this.sound.playEffect('crowd_celebration_sustained'), 800);
      } else {
        setTimeout(() => this.sound.playEffect('crowd_gasp'), 200);
      }
      this.sound.vibrate('heavy');
    });

    E.on('WICKET_LBW', () => {
      this.sound.playEffect('ball_pad_hit');
      if (!isBatting()) {
        setTimeout(() => this.sound.playEffect('crowd_appeal'), 200);
        setTimeout(() => this.sound.playEffect('crowd_celebration_sustained'), 1500);
      } else {
        setTimeout(() => this.sound.playEffect('crowd_gasp'), 200);
      }
      this.sound.vibrate('heavy');
    });

    // ── Match lifecycle ──
    E.on('TOSS_COIN_FLIP', () => this.sound.playEffect('coin_flip'));
    E.on('TOSS_RESULT', () => this.sound.playEffect('coin_land'));
    E.on('MATCH_START', () => {
      this.sound.playEffect('match_start_horn');
      this.crowd.reactToEvent('MATCH_START', {});
    });
    E.on('MATCH_END', (p) => {
      if (p.result === 'win') {
        this.sound.playEffect('firework_pop');
        setTimeout(() => this.sound.playEffect('crowd_eruption'), 300);
        setTimeout(() => this.sound.playEffect('firework_pop'), 800);
        setTimeout(() => this.sound.playEffect('firework_pop'), 1400);
        this.sound.vibrate('heavy');
      } else if (p.result === 'loss') {
        this.sound.playEffect('crowd_gasp');
        this.sound.vibrate('error');
      }
    });
    E.on('INNINGS_START', () => {
      this.sound.playEffect('match_start_horn');
    });
    E.on('INNINGS_END', () => {
      this.sound.playEffect('crowd_cheer_excited');
    });
    E.on('OVER_END', () => {
      this.sound.playEffect('crowd_cheer_excited');
    });

    E.on('UI_SHOW_CARD', () => this.sound.playEffect('ui_card_slide_in'));
    E.on('UI_HIDE_CARD', () => this.sound.playEffect('ui_card_slide_out'));
    E.on('UI_UPDATE_SCORE', () => this.sound.playEffect('ui_score_tick'));

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
    E.on('DEATH_OVERS_START', () => this.lighting.setAmbientBrightness(1.05));

    // ── Crowd Engine listeners ──
    const crowdEvents: EventType[] = [
      'DEFENSE_SCORED', 'RUNS_SCORED', 'BOUNDARY_FOUR', 'BOUNDARY_SIX',
      'WICKET_BOWLED', 'WICKET_DEFENSE', 'WICKET_CAUGHT', 'WICKET_LBW',
      'WICKET_RUN_OUT', 'WICKET_STUMPED', 'WICKET_CAUGHT_BEHIND',
      'MILESTONE_50', 'MILESTONE_100', 'HATTRICK',
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
