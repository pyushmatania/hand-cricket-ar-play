import type { Move } from "@/hooks/useHandCricket";

export type V3 = { x: number; y: number; z: number };
export type RawGesture = "no_hand" | "invalid" | "def" | "1" | "2" | "3" | "4" | "6";
export type Handedness = "Left" | "Right" | "Unknown";
export type HandOrientation = "palm" | "back" | "edge";

export interface FingerStates {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

export interface GestureClassification {
  rawGesture: RawGesture;
  move: Move | null;
  fingerStates: FingerStates;
  handedness: Handedness;
  orientation: HandOrientation;
  thumbScore: number;
  thumbLikelyOpen: boolean;
}

const EPSILON = 1e-6;
const PALM_INDICES = [0, 5, 9, 13, 17] as const;
const WRIST_INDEX = 0;

const V = (a: V3, b: V3): V3 => ({ x: b.x - a.x, y: b.y - a.y, z: (b.z ?? 0) - (a.z ?? 0) });
const D = (a: V3, b: V3) => Math.hypot(b.x - a.x, b.y - a.y, (b.z ?? 0) - (a.z ?? 0));
const dot3 = (a: V3, b: V3) => a.x * b.x + a.y * b.y + a.z * b.z;
const mag3 = (a: V3) => Math.hypot(a.x, a.y, a.z);
const norm3 = (a: V3): V3 => {
  const magnitude = mag3(a) || 1;
  return { x: a.x / magnitude, y: a.y / magnitude, z: a.z / magnitude };
};
const cross = (a: V3, b: V3): V3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

function angle(a: V3, b: V3, c: V3): number {
  const ab = norm3(V(b, a));
  const cb = norm3(V(b, c));
  return Math.acos(Math.max(-1, Math.min(1, dot3(ab, cb))));
}

function toDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

function averagePoint(points: V3[], indices: readonly number[]): V3 {
  const total = indices.reduce(
    (acc, index) => ({
      x: acc.x + points[index].x,
      y: acc.y + points[index].y,
      z: acc.z + (points[index].z ?? 0),
    }),
    { x: 0, y: 0, z: 0 }
  );

  return {
    x: total.x / indices.length,
    y: total.y / indices.length,
    z: total.z / indices.length,
  };
}

function getPalmMetrics(lm: V3[]) {
  const palmCenter = averagePoint(lm, PALM_INDICES);
  const palmNormal = norm3(cross(V(lm[WRIST_INDEX], lm[5]), V(lm[WRIST_INDEX], lm[17])));
  const sideAxis = norm3(V(lm[17], lm[5]));
  const palmWidth = D(lm[5], lm[17]);
  const palmHeight = D(lm[WRIST_INDEX], lm[9]);
  const palmScale = Math.max(palmWidth, palmHeight, EPSILON);
  const zFacing = palmNormal.z;

  const orientation: HandOrientation =
    Math.abs(zFacing) < 0.35 ? "edge" : zFacing > 0 ? "palm" : "back";

  return { palmCenter, palmNormal, sideAxis, palmScale, orientation };
}

function getFingerMetrics(
  lm: V3[],
  mcp: number,
  pip: number,
  dip: number,
  tip: number,
  palmCenter: V3
) {
  const pipAngle = toDegrees(angle(lm[mcp], lm[pip], lm[dip]));
  const dipAngle = toDegrees(angle(lm[pip], lm[dip], lm[tip]));
  const baseDirection = norm3(V(lm[mcp], lm[pip]));
  const tipDirection = norm3(V(lm[dip], lm[tip]));
  const alignment = dot3(baseDirection, tipDirection);
  const reachPalm = D(lm[tip], palmCenter) / Math.max(D(lm[pip], palmCenter), EPSILON);
  const reachWrist = D(lm[tip], lm[WRIST_INDEX]) / Math.max(D(lm[pip], lm[WRIST_INDEX]), EPSILON);
  const spanRatio = D(lm[mcp], lm[tip]) / Math.max(D(lm[mcp], lm[pip]), EPSILON);

  const score =
    (pipAngle >= 156 ? 1 : pipAngle >= 145 ? 0.72 : pipAngle >= 135 ? 0.45 : 0) +
    (dipAngle >= 160 ? 1 : dipAngle >= 148 ? 0.72 : dipAngle >= 138 ? 0.45 : 0) +
    (alignment >= 0.76 ? 1 : alignment >= 0.6 ? 0.65 : alignment >= 0.45 ? 0.35 : 0) +
    (reachPalm >= 1.16 ? 1 : reachPalm >= 1.09 ? 0.65 : reachPalm >= 1.03 ? 0.35 : 0) +
    (reachWrist >= 1.16 ? 1 : reachWrist >= 1.09 ? 0.6 : reachWrist >= 1.03 ? 0.35 : 0) +
    (spanRatio >= 1.8 ? 0.7 : spanRatio >= 1.62 ? 0.45 : 0);

  const extended = pipAngle > 132 && dipAngle > 136 && score >= 2.9;

  return { extended, score, pipAngle, dipAngle };
}

function getThumbMetrics(lm: V3[], handedness: Handedness, palmCenter: V3, palmNormal: V3, sideAxis: V3, palmScale: number) {
  const mcpAngle = toDegrees(angle(lm[1], lm[2], lm[3]));
  const ipAngle = toDegrees(angle(lm[2], lm[3], lm[4]));
  const thumbDir = norm3(V(lm[2], lm[4]));
  const tipToPalm = D(lm[4], palmCenter) / palmScale;
  const jointToPalm = D(lm[3], palmCenter) / palmScale;
  const tipToIndex = D(lm[4], lm[5]) / palmScale;
  const lateralMagnitude = Math.abs(dot3(V(palmCenter, lm[4]), sideAxis)) / palmScale;
  const palmPlaneAlignment = 1 - Math.abs(dot3(thumbDir, palmNormal));
  const travel = D(lm[2], lm[4]) / palmScale;

  let handednessBonus = 0;
  if (handedness !== "Unknown") {
    const sideTravel = Math.abs(dot3(V(lm[2], lm[4]), sideAxis)) / Math.max(travel, EPSILON);
    if (sideTravel > 0.4) handednessBonus = 0.2;
  }

  const score =
    (mcpAngle >= 142 ? 0.9 : mcpAngle >= 130 ? 0.55 : 0) +
    (ipAngle >= 155 ? 0.9 : ipAngle >= 145 ? 0.6 : 0) +
    (tipToPalm >= 0.7 ? 0.9 : tipToPalm >= 0.58 ? 0.6 : tipToPalm >= 0.5 ? 0.3 : 0) +
    (tipToIndex >= 0.52 ? 0.8 : tipToIndex >= 0.42 ? 0.5 : tipToIndex >= 0.34 ? 0.2 : 0) +
    (lateralMagnitude >= 0.32 ? 0.6 : lateralMagnitude >= 0.24 ? 0.35 : 0) +
    (palmPlaneAlignment >= 0.42 ? 0.6 : palmPlaneAlignment >= 0.26 ? 0.35 : 0) +
    (travel >= 0.44 ? 0.5 : travel >= 0.36 ? 0.25 : 0) +
    handednessBonus;

  const likelyOpen = score >= 2.15 && tipToPalm > jointToPalm * 1.02;
  const extended = score >= 2.95 && tipToPalm > jointToPalm * 1.05 && ipAngle > 142;

  return { extended, likelyOpen, score };
}

export function rawGestureToMove(rawGesture: RawGesture): Move | null {
  switch (rawGesture) {
    case "def":
      return "DEF";
    case "1":
      return 1;
    case "2":
      return 2;
    case "3":
      return 3;
    case "4":
      return 4;
    case "6":
      return 6;
    default:
      return null;
  }
}

export function classifyHandCricketGesture(landmarks: V3[] | undefined, handednessLabel?: string | null): GestureClassification {
  const handedness: Handedness =
    handednessLabel === "Left" || handednessLabel === "Right" ? handednessLabel : "Unknown";

  if (!landmarks || landmarks.length < 21) {
    return {
      rawGesture: "no_hand",
      move: null,
      fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false },
      handedness,
      orientation: "edge",
      thumbScore: 0,
      thumbLikelyOpen: false,
    };
  }

  const lm = landmarks;

  // ── Simple, robust finger-extension detection ──────────────────────────────
  // MediaPipe normalized coords: y = 0 at TOP, y = 1 at BOTTOM of image.
  // A finger is "extended" when its tip is HIGHER in the image than its PIP
  // joint, i.e. tip.y < pip.y.  This works reliably for upright hand poses
  // and is completely independent of handedness or camera mirroring.
  //
  // Landmark layout (per finger):  MCP → PIP → DIP → TIP
  //   Index:  5(MCP)  6(PIP)  7(DIP)  8(TIP)
  //   Middle: 9(MCP) 10(PIP) 11(DIP) 12(TIP)
  //   Ring:  13(MCP) 14(PIP) 15(DIP) 16(TIP)
  //   Pinky: 17(MCP) 18(PIP) 19(DIP) 20(TIP)
  //   Thumb:  1(CMC)  2(MCP)  3(IP)   4(TIP)

  const indexExt  = lm[8].y  < lm[6].y;
  const middleExt = lm[12].y < lm[10].y;
  const ringExt   = lm[16].y < lm[14].y;
  const pinkyExt  = lm[20].y < lm[18].y;

  // Thumbs-up (shot "6"): thumb tip well above its MCP joint AND all four
  // other fingers curled down.  The 0.08 margin (8 % of frame height)
  // prevents a casually raised thumb from triggering "6".
  const thumbHighAboveMcp = lm[4].y < (lm[2].y - 0.08);
  const thumbUp = thumbHighAboveMcp && !indexExt && !middleExt && !ringExt && !pinkyExt;

  const fingerStates: FingerStates = {
    thumb: thumbUp,
    index: indexExt,
    middle: middleExt,
    ring: ringExt,
    pinky: pinkyExt,
  };

  const extCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

  let rawGesture: RawGesture = "invalid";

  if (thumbUp) {
    rawGesture = "6";                                         // 👍 thumbs-up
  } else if (extCount === 0) {
    rawGesture = "def";                                       // ✊ fist = DEF
  } else if (extCount === 1 && indexExt) {
    rawGesture = "1";                                         // ☝️ one finger
  } else if (extCount === 2 && indexExt && middleExt) {
    rawGesture = "2";                                         // ✌️ two fingers
  } else if (extCount === 3 && indexExt && middleExt && ringExt) {
    rawGesture = "3";                                         // 🤟 three fingers
  } else if (extCount === 4) {
    rawGesture = "4";                                         // 🖖 four fingers
  }

  return {
    rawGesture,
    move: rawGestureToMove(rawGesture),
    fingerStates,
    handedness,
    orientation: "palm",
    thumbScore: thumbUp ? 3 : 0,
    thumbLikelyOpen: thumbUp,
  };
}

export function computeHandMotion(prev: V3[] | null, curr: V3[] | null): number {
  if (!prev || !curr || prev.length < 21 || curr.length < 21) return 0;

  const keys = [0, 5, 9, 13, 17];
  let keyMotion = 0;

  for (const key of keys) {
    keyMotion += Math.hypot(curr[key].x - prev[key].x, curr[key].y - prev[key].y);
  }

  const prevCenter = averagePoint(prev, PALM_INDICES);
  const currCenter = averagePoint(curr, PALM_INDICES);
  const centerMotion = Math.hypot(currCenter.x - prevCenter.x, currCenter.y - prevCenter.y);

  const getBox = (points: V3[]) => {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      diagonal: Math.hypot(maxX - minX, maxY - minY),
    };
  };

  const prevBox = getBox(prev);
  const currBox = getBox(curr);
  const scaleMotion = Math.abs(currBox.diagonal - prevBox.diagonal);

  return keyMotion + centerMotion * 1.5 + scaleMotion;
}