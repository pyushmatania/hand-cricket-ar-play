// ═══════════════════════════════════════════════════
// Doc 5 Ch5 — Performance Monitor
// FPS tracking, auto-quality scaling, render budget enforcement
// ═══════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from 'react';
import { create } from 'zustand';

interface PerformanceState {
  fps: number;
  qualityTier: 'high' | 'medium' | 'low';
  frameDrops: number;
  setFps: (fps: number) => void;
  setQualityTier: (tier: 'high' | 'medium' | 'low') => void;
  incrementFrameDrops: () => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  fps: 60,
  qualityTier: 'high',
  frameDrops: 0,
  setFps: (fps) => set({ fps }),
  setQualityTier: (qualityTier) => set({ qualityTier }),
  incrementFrameDrops: () => set((s) => ({ frameDrops: s.frameDrops + 1 })),
}));

/** FPS sampling + auto quality downgrade during gameplay */
export function usePerformanceMonitor(active = true) {
  const rafRef = useRef<number>(0);
  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lowFpsCountRef = useRef(0);
  const { setFps, setQualityTier, incrementFrameDrops, qualityTier } = usePerformanceStore();

  const tick = useCallback((now: number) => {
    framesRef.current++;
    const elapsed = now - lastTimeRef.current;

    if (elapsed >= 1000) {
      const currentFps = Math.round((framesRef.current * 1000) / elapsed);
      setFps(currentFps);
      framesRef.current = 0;
      lastTimeRef.current = now;

      // Auto-quality scaling
      if (currentFps < 24) {
        lowFpsCountRef.current++;
        incrementFrameDrops();
        if (lowFpsCountRef.current >= 3) {
          // Downgrade quality after 3 seconds of low FPS
          if (qualityTier === 'high') setQualityTier('medium');
          else if (qualityTier === 'medium') setQualityTier('low');
          lowFpsCountRef.current = 0;
        }
      } else if (currentFps >= 50) {
        lowFpsCountRef.current = Math.max(0, lowFpsCountRef.current - 1);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [setFps, setQualityTier, incrementFrameDrops, qualityTier]);

  useEffect(() => {
    if (!active) return;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, tick]);
}

/** Returns scaled values based on current quality tier */
export function useQualityScaledValues() {
  const tier = usePerformanceStore((s) => s.qualityTier);
  return {
    particleScale: tier === 'high' ? 1 : tier === 'medium' ? 0.5 : 0.25,
    animationEnabled: tier !== 'low',
    blurEnabled: tier === 'high',
    shadowsEnabled: tier !== 'low',
    maxConcurrentAnimations: tier === 'high' ? 8 : tier === 'medium' ? 4 : 2,
  };
}
