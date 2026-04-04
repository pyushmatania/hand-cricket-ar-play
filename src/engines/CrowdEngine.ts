// ═══════════════════════════════════════════════════
// Doc 2 — Chapter 9: Crowd Engine
// Mood-driven crowd reactions, Mexican waves, audio
// ═══════════════════════════════════════════════════

import type { EventType, CrowdIntensity } from './types';

export class CrowdEngine {
  private mood: number = 30;
  private decayInterval: ReturnType<typeof setInterval> | null = null;
  private lastMexicanWave: number = 0;
  private mexicanWaveThreshold: number = 90;

  // Callbacks wired by EngineManager
  private onMoodChange?: (mood: number, intensity: CrowdIntensity) => void;
  private onMexicanWave?: () => void;
  private soundEngine?: {
    setAmbientVolume: (vol: number, fade?: number) => void;
    setAmbient: (src: string) => void;
  };
  private eventEngine?: {
    emit: (type: EventType, payload: Record<string, any>, opts?: Record<string, any>) => void;
  };

  start(): void {
    // Mood decays naturally — crowd loses interest over time
    this.decayInterval = setInterval(() => {
      this.mood = Math.max(0, this.mood - 0.5);
      this.updateAudio();
    }, 1000);
  }

  stop(): void {
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }
  }

  /**
   * React to a game event — adjusts crowd mood accordingly.
   */
  reactToEvent(eventType: EventType, payload: Record<string, any>): void {
    switch (eventType) {
      case 'DEFENSE_SCORED':
        this.mood += 5;
        break;
      case 'RUNS_SCORED':
        this.mood += (payload.runs || 1) * 4;
        break;
      case 'BOUNDARY_FOUR':
        this.mood = Math.min(100, this.mood + 25);
        break;
      case 'BOUNDARY_SIX':
        this.mood = 100;
        break;
      case 'WICKET_BOWLED':
      case 'WICKET_CAUGHT':
      case 'WICKET_LBW':
      case 'WICKET_RUN_OUT':
      case 'WICKET_STUMPED':
      case 'WICKET_CAUGHT_BEHIND':
        this.mood = 85;
        break;
      case 'MILESTONE_50':
        this.mood = Math.min(100, this.mood + 30);
        break;
      case 'MILESTONE_100':
      case 'HATTRICK':
        this.mood = 100;
        break;
      case 'OVER_END':
        this.mood = Math.max(20, this.mood - 5);
        break;
      case 'DEATH_OVERS_START':
        this.mood = Math.max(60, this.mood);
        break;
    }

    this.mood = Math.max(0, Math.min(100, this.mood));

    // Check for Mexican Wave trigger
    if (this.mood >= this.mexicanWaveThreshold && Date.now() - this.lastMexicanWave > 30000) {
      this.triggerMexicanWave();
    }

    this.updateAudio();
    this.updateVisuals();
  }

  private updateAudio(): void {
    if (!this.soundEngine) return;
    const volume = (this.mood / 100) * 0.5;
    this.soundEngine.setAmbientVolume(volume, 300);

    if (this.mood < 20) {
      this.soundEngine.setAmbient('/sounds/ambient/crowd_quiet_loop.mp3');
    } else if (this.mood < 50) {
      this.soundEngine.setAmbient('/sounds/ambient/crowd_moderate_loop.mp3');
    } else if (this.mood < 80) {
      this.soundEngine.setAmbient('/sounds/ambient/crowd_loud_loop.mp3');
    }
  }

  private updateVisuals(): void {
    const intensity = this.getIntensity();
    this.onMoodChange?.(this.mood, intensity);
    this.eventEngine?.emit('CROWD_REACT', {
      mood: this.mood,
      intensity,
    }, { blocking: false, duration: 0 });
  }

  private triggerMexicanWave(): void {
    this.lastMexicanWave = Date.now();
    this.onMexicanWave?.();
    this.eventEngine?.emit('CROWD_MEXICAN_WAVE', {}, { blocking: false, duration: 3000 });
  }

  getIntensity(): CrowdIntensity {
    if (this.mood > 80) return 'pandemonium';
    if (this.mood > 60) return 'excited';
    if (this.mood > 40) return 'active';
    if (this.mood > 20) return 'moderate';
    return 'quiet';
  }

  getMood(): number { return this.mood; }
  setMood(mood: number): void { this.mood = Math.max(0, Math.min(100, mood)); }

  // Wiring setters — called by EngineManager
  setSoundEngine(se: typeof this.soundEngine): void { this.soundEngine = se; }
  setEventEngine(ee: typeof this.eventEngine): void { this.eventEngine = ee; }
  setOnMoodChange(cb: typeof this.onMoodChange): void { this.onMoodChange = cb; }
  setOnMexicanWave(cb: typeof this.onMexicanWave): void { this.onMexicanWave = cb; }

  destroy(): void {
    this.stop();
  }
}
