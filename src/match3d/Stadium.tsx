import { useMemo } from "react";
import * as THREE from "three";

const TURF = "#4a9a3e";
const PITCH_STRIP = "#c19a6b";
const STUMP = "#d4a574";
const ROPE = "#ffffff";
const STAND_DEFAULT = "#2563eb";

interface StadiumProps {
  themeKey?: "golden_hour" | "night_lights" | "overcast" | "default";
  standColor?: string;
}

export default function Stadium({ themeKey = "default", standColor = STAND_DEFAULT }: StadiumProps) {
  // Lathe geometry for stadium bowl
  const bowlPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(15, 0));
    pts.push(new THREE.Vector2(16, 1));
    pts.push(new THREE.Vector2(20, 8));
    pts.push(new THREE.Vector2(25, 14));
    pts.push(new THREE.Vector2(28, 18));
    return pts;
  }, []);

  return (
    <group>
      {/* Turf */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[14.5, 64]} />
        <meshStandardMaterial color={TURF} roughness={0.9} />
      </mesh>

      {/* Pitch strip */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 20]} />
        <meshStandardMaterial color={PITCH_STRIP} roughness={0.85} />
      </mesh>

      {/* Crease lines */}
      {[-9, 9].map((z, i) => (
        <mesh key={i} position={[0, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 0.08]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Stumps both ends */}
      {[-10, 10].map((z, side) => (
        <group key={side} position={[0, 0, z]}>
          {[-0.18, 0, 0.18].map((x, i) => (
            <mesh key={i} position={[x, 0.4, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
              <meshStandardMaterial color={STUMP} roughness={0.6} />
            </mesh>
          ))}
          {/* Bails */}
          {[-0.09, 0.09].map((x, i) => (
            <mesh key={`b${i}`} position={[x, 0.82, 0]} castShadow>
              <boxGeometry args={[0.18, 0.04, 0.04]} />
              <meshStandardMaterial color="#e8d4a0" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Boundary rope */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <torusGeometry args={[14, 0.1, 8, 64]} />
        <meshStandardMaterial color={ROPE} emissive={ROPE} emissiveIntensity={0.2} />
      </mesh>

      {/* Stadium bowl (crowd stands) */}
      <mesh position={[0, 0, 0]}>
        <latheGeometry args={[bowlPoints, 48]} />
        <meshStandardMaterial color={standColor} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Floodlight towers (4 corners) */}
      {[
        [16, 0, 16],
        [-16, 0, 16],
        [16, 0, -16],
        [-16, 0, -16],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh position={[0, 12, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 24, 8]} />
            <meshStandardMaterial color="#444" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0, 24, 0]}>
            <boxGeometry args={[2, 1.2, 1.2]} />
            <meshStandardMaterial
              color="#fffbe6"
              emissive="#fff5cc"
              emissiveIntensity={2}
            />
          </mesh>
          <spotLight
            position={[0, 24, 0]}
            angle={0.6}
            penumbra={0.5}
            intensity={1.2}
            distance={60}
            color="#fff5cc"
            target-position={[0, 0, 0]}
          />
        </group>
      ))}
    </group>
  );
}
