// ═══════════════════════════════════════════════════
// Doc 2 — Chapter 8: Weather Engine
// Dynamic weather affecting visuals AND gameplay
// ═══════════════════════════════════════════════════

import type { WeatherState } from './types';

export class WeatherEngine {
  private currentWeather: WeatherState = 'clear';

  /**
   * Set weather state — updates visuals and applies gameplay modifiers.
   * Requires references to LightingEngine, SoundEngine, GameplayEngine
   * which are passed via EngineManager during wiring.
   */
  async setWeather(
    weather: WeatherState,
    deps?: {
      lighting?: { setAmbientBrightness: (b: number) => void };
      sound?: { setAmbient: (src: string, vol?: number) => void };
      gameplay?: { applyModifier: (key: string, val: number) => void };
      innings?: number;
    }
  ): Promise<void> {
    // Clear previous weather modifiers
    deps?.gameplay?.applyModifier('boundary_chance', 0);
    deps?.gameplay?.applyModifier('bowling_accuracy', 0);
    deps?.gameplay?.applyModifier('all_stats', 0);
    deps?.gameplay?.applyModifier('spin_accuracy', 0);

    this.currentWeather = weather;

    switch (weather) {
      case 'clear':
        deps?.lighting?.setAmbientBrightness(1.0);
        break;
      case 'overcast':
        deps?.lighting?.setAmbientBrightness(0.85);
        break;
      case 'drizzle':
        deps?.lighting?.setAmbientBrightness(0.75);
        deps?.sound?.setAmbient('/sounds/ambient/rain_loop.mp3', 0.3);
        deps?.gameplay?.applyModifier('boundary_chance', -0.10);
        break;
      case 'heavy_dew':
        if (deps?.innings === 2) {
          deps?.gameplay?.applyModifier('bowling_accuracy', -0.15);
        }
        break;
      case 'dust_storm':
        deps?.lighting?.setAmbientBrightness(0.8);
        deps?.sound?.setAmbient('/sounds/ambient/wind_loop.mp3', 0.25);
        deps?.gameplay?.applyModifier('all_stats', -0.05);
        break;
      case 'night_lights':
        deps?.lighting?.setAmbientBrightness(0.7);
        deps?.gameplay?.applyModifier('spin_accuracy', 0.10);
        break;
      case 'golden_hour':
        deps?.lighting?.setAmbientBrightness(1.05);
        break;
    }
  }

  getWeather(): WeatherState {
    return this.currentWeather;
  }

  /**
   * Get random weather based on theme, with weighted probabilities.
   */
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
