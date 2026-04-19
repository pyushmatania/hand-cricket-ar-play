/**
 * GameScreen3D — Phase 1 stub
 * Renders a 3D stadium background. Match logic & HUD will be wired in later phases.
 * For now, falls back to standard GameScreen overlay so gameplay is uninterrupted.
 */
import { lazy, Suspense } from "react";

const MatchStage = lazy(() => import("@/match3d/MatchStage"));
const GameScreen = lazy(() => import("@/components/GameScreen"));

interface GameScreen3DProps {
  onHome: () => void;
}

export default function GameScreen3D({ onHome }: GameScreen3DProps) {
  return (
    <div className="relative min-h-screen">
      {/* Phase 1: 3D stadium background */}
      <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
        <MatchStage themeKey="golden_hour" />
      </Suspense>

      {/* Phase 1 dev banner */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[200] px-3 py-1 rounded-full bg-black/70 text-yellow-300 text-[9px] font-display tracking-[0.2em] border border-yellow-500/40 pointer-events-none">
        🏟️ 3D STADIUM · PHASE 1 (BETA)
      </div>

      {/* Existing match HUD layered on top — keeps logic untouched */}
      <div className="relative z-10">
        <Suspense fallback={null}>
          <GameScreen onHome={onHome} />
        </Suspense>
      </div>
    </div>
  );
}
