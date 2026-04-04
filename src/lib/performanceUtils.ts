// ═══════════════════════════════════════════════════
// Doc 5 — Chapter 5: Performance Optimization
// Low-end device detection, particle limits, asset priorities
// ═══════════════════════════════════════════════════

// §5.1 Asset loading priority tiers
export const LOAD_PRIORITY = {
  CRITICAL: 1,  // Must load before anything shows (fonts, core CSS, home screen bg)
  HIGH: 2,      // Load during splash screen (UI icons, button textures, home island)
  MEDIUM: 3,    // Load on navigation (match assets loaded during VS screen)
  LOW: 4,       // Lazy load (character full arts, shop items, leaderboard)
  DEFERRED: 5,  // Load on demand (AR assets, replay data, achievement badges)
} as const;

// §5.3 Particle system limits
export const PARTICLE_LIMITS = {
  rain: { maxCount: 150, fps: 30 },
  dust: { maxCount: 100, fps: 30 },
  confetti: { maxCount: 200, fps: 60 },
  fireworks: { maxCount: 80, fps: 60 },
} as const;

// §5.3 Low-end device detection
export function isLowEndDevice(): boolean {
  const memory = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  return (memory != null && memory <= 4) || (cores != null && cores <= 4);
}

// Scaled particle limits based on device capability
export function getParticleLimits() {
  const scale = isLowEndDevice() ? 0.5 : 1;
  return {
    rain: { maxCount: Math.round(PARTICLE_LIMITS.rain.maxCount * scale), fps: PARTICLE_LIMITS.rain.fps },
    dust: { maxCount: Math.round(PARTICLE_LIMITS.dust.maxCount * scale), fps: PARTICLE_LIMITS.dust.fps },
    confetti: { maxCount: Math.round(PARTICLE_LIMITS.confetti.maxCount * scale), fps: PARTICLE_LIMITS.confetti.fps },
    fireworks: { maxCount: Math.round(PARTICLE_LIMITS.fireworks.maxCount * scale), fps: PARTICLE_LIMITS.fireworks.fps },
  };
}

// §5.2 Image optimization targets
export const IMAGE_SPECS = {
  uiIcons: { format: 'webp', maxKB: 10, quality: 'lossless' },
  characterThumbnails: { format: 'webp', maxKB: 30, quality: 85 },
  characterFullArt: { format: 'webp', maxKB: 100, quality: 80 },
  pitchBackgrounds: { format: 'webp', maxKB: 200, quality: 75 },
  islandRenders: { format: 'webp', maxKB: 150, quality: 80 },
  establishingShots: { format: 'jpeg', maxKB: 300, quality: 70 },
} as const;

// §5.3 Animation performance rules
export const ANIMATION_RULES = {
  // Only animate transform and opacity
  safeProperties: ['transform', 'opacity'] as const,
  // Debounce scroll events
  scrollDebounceMs: 50,
  // Max concurrent animations
  maxConcurrent: 8,
} as const;

// §5.4 Memory cleanup helper
export function cleanupMatchResources(refs: React.MutableRefObject<any>[]): void {
  refs.forEach(ref => { ref.current = null; });
}

// §5.5 Bundle size targets
export const BUNDLE_TARGETS = {
  initialLoad: 300,   // KB JS
  matchScreen: 400,    // KB JS
  tournament: 200,     // KB JS
  arMode: 800,         // KB JS (lazy loaded)
} as const;

// Preload images with priority
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Batch preload with concurrency limit
export async function preloadBatch(srcs: string[], concurrency = 3): Promise<void> {
  const chunks: string[][] = [];
  for (let i = 0; i < srcs.length; i += concurrency) {
    chunks.push(srcs.slice(i, i + concurrency));
  }
  for (const chunk of chunks) {
    await Promise.allSettled(chunk.map(preloadImage));
  }
}
