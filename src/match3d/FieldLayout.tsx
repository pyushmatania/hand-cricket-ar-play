/**
 * FieldLayout — Phase 2
 * Positions all 13 cricket characters on the pitch using colored capsule
 * placeholders. Real sprite art will replace CapsuleCharacter in a later phase.
 *
 * Coordinate system:
 *   - Striker end at z = -8, non-striker end at z = +8
 *   - Camera sits at [18, 6, 0] looking at [0, 1, 0] (mid-wicket view)
 *   - +x is "off side" (cover/point), -x is "leg side" (mid-wicket/square-leg)
 */
import CapsuleCharacter from "./CapsuleCharacter";

export type FieldPreset = "balanced" | "aggressive" | "defensive" | "death";

const FIELDER_COLOR = "#ef4444";   // red — fielding side
const KEEPER_COLOR = "#dc2626";    // deeper red
const BOWLER_COLOR = "#b91c1c";    // bowler same team, slightly different shade
const BATSMAN_COLOR = "#2563eb";   // blue — batting side
const UMPIRE_COLOR = "#f5f5f5";    // white coat
const RING_COLOR = "#fbbf24";      // yellow rings under fielders

interface FieldPosition {
  key: string;
  label: string;
  position: [number, number, number];
}

const BALANCED_FIELD: FieldPosition[] = [
  { key: "slip",        label: "SLIP",       position: [2, 0, -10] },
  { key: "gully",       label: "GULLY",      position: [4, 0, -10.5] },
  { key: "point",       label: "POINT",      position: [7, 0, -7] },
  { key: "cover",       label: "COVER",      position: [7, 0, -4] },
  { key: "mid-off",     label: "MID-OFF",    position: [3, 0, 2] },
  { key: "mid-on",      label: "MID-ON",     position: [-3, 0, 2] },
  { key: "mid-wicket",  label: "MID-WKT",    position: [-7, 0, -4] },
  { key: "square-leg",  label: "SQ-LEG",     position: [-7, 0, -7] },
  { key: "fine-leg",    label: "FINE-LEG",   position: [-2, 0, -13] },
];

export function positionsByPreset(preset: FieldPreset = "balanced"): FieldPosition[] {
  // Phase 2: only "balanced" is wired. Other presets fall back to balanced.
  switch (preset) {
    case "balanced":
    case "aggressive":
    case "defensive":
    case "death":
    default:
      return BALANCED_FIELD;
  }
}

interface FieldLayoutProps {
  preset?: FieldPreset;
  showLabels?: boolean;
}

export default function FieldLayout({ preset = "balanced" }: FieldLayoutProps) {
  const fielders = positionsByPreset(preset);

  return (
    <group>
      {/* Striker (batsman) */}
      <CapsuleCharacter
        position={[0, 0, -8]}
        color={BATSMAN_COLOR}
        label="BATSMAN"
        scale={1.05}
      />

      {/* Non-striker */}
      <CapsuleCharacter
        position={[0, 0, 8]}
        color={BATSMAN_COLOR}
        label="NON-STRIKER"
      />

      {/* Bowler — at non-striker end, runup direction */}
      <CapsuleCharacter
        position={[0, 0, 9]}
        color={BOWLER_COLOR}
        label="BOWLER"
        scale={1.05}
      />

      {/* Keeper — behind striker */}
      <CapsuleCharacter
        position={[0, 0, -9.5]}
        color={KEEPER_COLOR}
        label="KEEPER"
      />

      {/* Umpires */}
      <CapsuleCharacter
        position={[1.5, 0, 9.5]}
        color={UMPIRE_COLOR}
        label="UMPIRE"
        scale={0.95}
      />
      <CapsuleCharacter
        position={[-6, 0, -8]}
        color={UMPIRE_COLOR}
        label="LEG UMP"
        scale={0.9}
      />

      {/* 9 fielders */}
      {fielders.map((f) => (
        <CapsuleCharacter
          key={f.key}
          position={f.position}
          color={FIELDER_COLOR}
          label={f.label}
          scale={0.95}
          groundRingColor={RING_COLOR}
        />
      ))}
    </group>
  );
}
