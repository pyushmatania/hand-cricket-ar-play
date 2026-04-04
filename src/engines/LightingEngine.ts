// ═══════════════════════════════════════════════════
// Doc 2 — Chapter 7: Lighting Engine
// Screen flashes, floodlights, vignettes, ambient
// ═══════════════════════════════════════════════════

export class LightingEngine {
  private ambientBrightness: number = 1.0;

  /**
   * Flash the entire screen a color for a brief moment.
   */
  flashScreen(color: string, durationMs: number, maxOpacity: number = 0.3): void {
    const overlay = document.getElementById('lighting-overlay');
    if (!overlay) return;
    overlay.style.background = color;
    overlay.style.opacity = String(maxOpacity);
    overlay.style.transition = `opacity ${durationMs}ms ease-out`;
    requestAnimationFrame(() => {
      overlay.style.opacity = '0';
    });
    setTimeout(() => {
      overlay.style.transition = '';
    }, durationMs + 50);
  }

  /**
   * Floodlight wave — simulates 4 floodlights flashing in sequence.
   * Used for SIX celebrations.
   */
  async floodlightWave(): Promise<void> {
    const positions = ['15%', '35%', '65%', '85%'];
    for (const pos of positions) {
      this.flashAt(pos, 'rgba(255,255,230,0.15)', 200);
      await this.sleep(120);
    }
  }

  /**
   * Boundary rope glow effect.
   */
  glowBoundary(color: string, durationMs: number): void {
    this.flashScreen(color, durationMs, 0.1);
  }

  /**
   * Set ambient brightness (affects overall game mood).
   */
  setAmbientBrightness(b: number): void {
    this.ambientBrightness = b;
    // Apply via CSS custom property for the game container
    document.documentElement.style.setProperty('--ambient-brightness', String(b));
  }

  /**
   * Set vignette intensity for tension.
   */
  setVignette(intensity: number): void {
    const vignette = document.getElementById('vignette-overlay');
    if (!vignette) return;
    vignette.style.opacity = String(intensity);
  }

  getAmbientBrightness(): number {
    return this.ambientBrightness;
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

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy(): void {
    // Reset any CSS modifications
    document.documentElement.style.removeProperty('--ambient-brightness');
  }
}
