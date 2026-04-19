/**
 * CapsuleCharacter — Phase 2 placeholder
 * Renders a colored capsule with a billboard text label so we can verify
 * field positions before real sprite art is dropped in (Phase 2.5+).
 */
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

export interface CapsuleCharacterProps {
  position: [number, number, number];
  color: string;
  label: string;
  /** Visual scale multiplier (default 1). Star players or umpires can size up/down. */
  scale?: number;
  /** If provided, draws a small ring marker on the ground (useful for fielders). */
  groundRingColor?: string;
}

export default function CapsuleCharacter({
  position,
  color,
  label,
  scale = 1,
  groundRingColor,
}: CapsuleCharacterProps) {
  const bodyHeight = 1.4 * scale;
  const bodyRadius = 0.35 * scale;
  const headRadius = 0.32 * scale;
  const totalHeight = bodyHeight + headRadius * 2;

  return (
    <group position={position}>
      {/* Ground shadow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow={false}>
        <circleGeometry args={[bodyRadius * 1.4, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Optional fielder position ring */}
      {groundRingColor && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[bodyRadius * 1.6, bodyRadius * 1.9, 32]} />
          <meshBasicMaterial color={groundRingColor} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Body capsule */}
      <mesh position={[0, bodyHeight / 2 + 0.05, 0]} castShadow>
        <capsuleGeometry args={[bodyRadius, bodyHeight - bodyRadius * 2, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>

      {/* Head sphere */}
      <mesh position={[0, bodyHeight + headRadius - 0.05, 0]} castShadow>
        <sphereGeometry args={[headRadius, 20, 16]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.05} />
      </mesh>

      {/* Floating label */}
      <Billboard position={[0, totalHeight + 0.45, 0]}>
        <Text
          fontSize={0.32 * scale}
          color="#ffffff"
          outlineWidth={0.04}
          outlineColor="#000000"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}
