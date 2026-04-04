// ═══════════════════════════════════════════════════
// Doc 2 — Chapter 5: Sound Engine (Howler.js)
// ═══════════════════════════════════════════════════

import { Howl, Howler } from 'howler';
import { SOUND_MANIFEST } from '@/data/sounds/manifest';
import type { SoundCategory } from './types';

export class SoundEngine {
  private categories: Map<string, SoundCategory> = new Map();
  private activeEffects: Howl[] = [];
  private ambientLoop: Howl | null = null;
  private enabled = { sound: true, music: true, vibration: true };
  private volumes = { master: 1.0, effects: 0.8, ambient: 0.25, music: 0.15, commentary: 1.0 };

  constructor() {
    // Load manifest into categories map
    for (const [key, category] of Object.entries(SOUND_MANIFEST)) {
      this.categories.set(key, { ...category });
    }
  }

  /**
   * Play a random variant from a sound category.
   * Anti-repetition: never plays the same variant twice in a row.
   */
  playEffect(categoryId: string, volumeOverride?: number): void {
    if (!this.enabled.sound) return;

    const category = this.categories.get(categoryId);
    if (!category || category.variants.length === 0) {
      console.warn(`[SoundEngine] Category not found: ${categoryId}`);
      return;
    }

    // Pick a random variant that isn't the last one played
    let index: number;
    if (category.variants.length === 1) {
      index = 0;
    } else {
      do {
        index = Math.floor(Math.random() * category.variants.length);
      } while (index === category.lastPlayed);
    }

    category.lastPlayed = index;
    const variant = category.variants[index];
    const volume = (volumeOverride ?? variant.volume ?? 1.0) * this.volumes.effects * this.volumes.master;

    const howl = new Howl({
      src: [variant.src],
      volume,
      onend: () => {
        this.activeEffects = this.activeEffects.filter(h => h !== howl);
      },
      onloaderror: () => {
        // Sound file not found — silently skip (stubs)
        this.activeEffects = this.activeEffects.filter(h => h !== howl);
      },
    });

    this.activeEffects.push(howl);
    howl.play();
  }

  /**
   * Play a specific sound file (not random variant).
   */
  playSpecific(src: string, volume: number = 1.0): Howl {
    const howl = new Howl({
      src: [src],
      volume: volume * this.volumes.effects * this.volumes.master,
      onloaderror: () => {
        // Sound file not found — silently skip
      },
    });
    howl.play();
    return howl;
  }

  /**
   * Start an ambient loop (crossfades from current ambient).
   */
  setAmbient(src: string, volume: number = 0.25, fadeDuration: number = 500): void {
    if (!this.enabled.sound) return;

    const newAmbient = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      onloaderror: () => {
        // Ambient file not found — silently skip
      },
    });

    newAmbient.play();
    newAmbient.fade(0, volume * this.volumes.ambient * this.volumes.master, fadeDuration);

    if (this.ambientLoop) {
      const old = this.ambientLoop;
      old.fade(old.volume() as number, 0, fadeDuration);
      setTimeout(() => old.unload(), fadeDuration + 100);
    }

    this.ambientLoop = newAmbient;
  }

  /**
   * Adjust ambient volume (e.g., CrowdEngine changes based on mood).
   */
  setAmbientVolume(volume: number, fadeDuration: number = 300): void {
    if (this.ambientLoop) {
      this.ambientLoop.fade(
        this.ambientLoop.volume() as number,
        volume * this.volumes.ambient * this.volumes.master,
        fadeDuration
      );
    }
  }

  /**
   * Stop all currently playing effects.
   */
  stopAllEffects(): void {
    this.activeEffects.forEach(h => h.stop());
    this.activeEffects = [];
  }

  /**
   * Haptic feedback patterns.
   */
  vibrate(pattern: 'light' | 'medium' | 'heavy' | 'error'): void {
    if (!this.enabled.vibration || !navigator.vibrate) return;
    const patterns: Record<string, number[]> = {
      light: [10],
      medium: [20],
      heavy: [40],
      error: [30, 20, 30],
    };
    navigator.vibrate(patterns[pattern] || [10]);
  }

  // ── Volume Controls ──
  setMasterVolume(v: number): void {
    this.volumes.master = v;
    Howler.volume(v);
  }
  setEffectsVolume(v: number): void { this.volumes.effects = v; }
  setAmbientVolumeMaster(v: number): void { this.volumes.ambient = v; }
  setMusicVolume(v: number): void { this.volumes.music = v; }
  setCommentaryVolume(v: number): void { this.volumes.commentary = v; }

  setEnabled(key: 'sound' | 'music' | 'vibration', val: boolean): void {
    this.enabled[key] = val;
    if (!val && key === 'sound') {
      this.stopAllEffects();
      if (this.ambientLoop) {
        this.ambientLoop.stop();
        this.ambientLoop.unload();
        this.ambientLoop = null;
      }
    }
  }

  getVolumes() { return { ...this.volumes }; }
  getEnabled() { return { ...this.enabled }; }

  destroy(): void {
    this.stopAllEffects();
    if (this.ambientLoop) {
      this.ambientLoop.stop();
      this.ambientLoop.unload();
      this.ambientLoop = null;
    }
  }
}
