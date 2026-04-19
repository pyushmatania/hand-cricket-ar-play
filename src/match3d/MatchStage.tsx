import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Sky, Stars } from "@react-three/drei";
import Stadium from "./Stadium";
import CameraRig from "./CameraRig";
import Lighting from "./Lighting";
import FieldLayout from "./FieldLayout";

interface MatchStageProps {
  themeKey?: "golden_hour" | "night_lights" | "overcast" | "default";
  standColor?: string;
}

export default function MatchStage({ themeKey = "golden_hour", standColor }: MatchStageProps) {
  const isNight = themeKey === "night_lights";

  return (
    <div className="fixed inset-0 z-0">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={[isNight ? "#0a0e2a" : "#7ab8e0"]} />

        <Suspense fallback={null}>
          {isNight ? (
            <>
              <Stars radius={120} depth={50} count={3000} factor={4} fade speed={0.5} />
              <fog attach="fog" args={["#0a0e2a", 30, 80]} />
            </>
          ) : themeKey === "overcast" ? (
            <>
              <Sky distance={450000} sunPosition={[1, 0.05, 0]} inclination={0.49} azimuth={0.25} />
              <fog attach="fog" args={["#9aa5b4", 35, 90]} />
            </>
          ) : (
            <>
              <Sky distance={450000} sunPosition={[2, 0.4, 8]} inclination={0.52} azimuth={0.25} />
              <fog attach="fog" args={["#f4c787", 40, 100]} />
            </>
          )}

          <Lighting />
          <CameraRig />
          <Stadium themeKey={themeKey} standColor={standColor} />
          <FieldLayout preset="balanced" />
        </Suspense>
      </Canvas>
    </div>
  );
}
