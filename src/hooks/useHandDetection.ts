import { useState, useCallback, useRef, useEffect } from "react";
import type { Move } from "./useHandCricket";

export type GestureStatus =
  | "idle"
  | "loading_model"
  | "camera_started"
  | "tracking_active"
  | "tracking_unavailable"
  | "no_hand"
  | "detecting"
  | "stable";

export interface HandDetectionState {
  status: GestureStatus;
  detectedMove: Move | null;
  confidence: number;
  lockedMove: Move | null;
  hint: string;
  handDetected: boolean;
  rawGesture: string;
  debugInfo: string;
}

declare global {
  interface Window {
    Hands?: any;
  }
}

const MEDIAPIPE_SCRIPTS = [
  "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
];

const scriptLoadCache = new Map<string, Promise<void>>();

function loadScriptOnce(src: string): Promise<void> {
  const cached = scriptLoadCache.get(src);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    const cleanup = () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };

    const onLoad = () => {
      script.dataset.loaded = "1";
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error(`Failed to load MediaPipe script: ${src}`));
    };

    if (existing?.dataset.loaded === "1") {
      resolve();
      return;
    }

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    if (!existing) {
      script.src = src;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
      return;
    }

    if (src.includes("/hands/") ? Boolean(window.Hands) : true) {
      script.dataset.loaded = "1";
      cleanup();
      resolve();
    }
  });

  scriptLoadCache.set(src, promise);
  return promise;
}

async function ensureMediaPipeReady() {
  await Promise.all(MEDIAPIPE_SCRIPTS.map(loadScriptOnce));

  if (!window.Hands) {
    throw new Error("MediaPipe Hands global failed to initialize");
  }
}

async function ensureVideoPlayable(video: HTMLVideoElement) {
  if (!video.srcObject) {
    throw new Error("Camera stream is not attached to video element");
  }

  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    await new Promise<void>((resolve) => {
      const onReady = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("canplay", onReady);
      };

      video.addEventListener("loadeddata", onReady, { once: true });
      video.addEventListener("canplay", onReady, { once: true });

      window.setTimeout(() => {
        cleanup();
        resolve();
      }, 1500);
    });
  }

  if (video.paused) {
    await video.play();
  }
}

// ── Vector math helpers ──
const sub = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
  x: a.x - b.x,
  y: a.y - b.y,
});
const dot = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  a.x * b.x + a.y * b.y;
const mag = (v: { x: number; y: number }) => Math.hypot(v.x, v.y);
const norm = (v: { x: number; y: number }) => {
  const m = mag(v) || 1;
  return { x: v.x / m, y: v.y / m };
};

type RawGesture = "no_hand" | "unclear" | "def" | "1" | "2" | "3" | "4" | "5";
const VALID_GESTURES: RawGesture[] = ["def", "1", "2", "3", "4", "5"];

// ── Orientation-aware finger classifier ──
// Uses MCP→PIP axis projection so it works even when hand is rotated/tilted.
function classifyGesture(
  landmarks: Array<{ x: number; y: number; z: number }> | undefined
): RawGesture {
  if (!landmarks || landmarks.length < 21) return "no_hand";

  // Finger definitions: [MCP, PIP, TIP]
  const fingers: [number, number, number][] = [
    [5, 6, 8],   // index
    [9, 10, 12], // middle
    [13, 14, 16],// ring
    [17, 18, 20],// pinky
  ];

  let extendedCount = 0;

  for (const [mcp, pip, tip] of fingers) {
    const axis = norm(sub(landmarks[pip], landmarks[mcp]));
    const tipProjection = dot(sub(landmarks[tip], landmarks[pip]), axis);
    const baseLen = dot(sub(landmarks[pip], landmarks[mcp]), axis);

    // Finger is extended if tip projects beyond PIP along the MCP→PIP axis
    // and the extension is significant relative to the base segment
    if (tipProjection > 0.035 && tipProjection > baseLen * 0.5) {
      extendedCount++;
    }
  }

  // Thumb: check distance from tip(4) to IP(3) vs distance from tip(4) to index MCP(5)
  const thumbTipToIP = mag(sub(landmarks[4], landmarks[3]));
  const thumbTipToIndexMCP = mag(sub(landmarks[4], landmarks[5]));
  const thumbOpen = thumbTipToIP > 0.05 && thumbTipToIndexMCP > 0.08;

  // Classification
  if (extendedCount === 0 && !thumbOpen) return "def";
  if (extendedCount === 4 && thumbOpen) return "5";
  if (extendedCount >= 1 && extendedCount <= 4) return String(extendedCount) as RawGesture;

  return "unclear";
}

function rawGestureToMove(g: RawGesture): Move | null {
  if (g === "def") return "DEF";
  if (g === "1") return 1;
  if (g === "2") return 2;
  if (g === "3") return 3;
  if (g === "4") return 4;
  if (g === "5") return 5;
  return null;
}

function rawGestureToFingerCount(g: RawGesture): number {
  if (g === "def") return 0;
  if (g === "1" || g === "2" || g === "3" || g === "4" || g === "5") return Number(g);
  return -1;
}

const BUFFER_SIZE = 8;
const STABILITY_THRESHOLD = 5;

const HINTS: Record<string, string> = {
  loading_model: "Loading model…",
  camera_started: "Camera started",
  tracking_active: "Hand tracking active",
  tracking_unavailable: "Hand tracking unavailable",
  no_hand: "No hand detected",
  stable: "Stable: ready to lock",
};

const GUIDANCE_HINTS = [
  "Center your hand",
  "Keep full hand visible",
  "Use brighter light",
  "Hold still for a moment",
  "Show palm/fingers clearly",
];

export function useHandDetection(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<HandDetectionState>({
    status: "idle",
    detectedMove: null,
    confidence: 0,
    lockedMove: null,
    hint: "Waiting for camera",
    handDetected: false,
    rawGesture: "no_hand",
    debugInfo: "stage:idle",
  });

  const handsRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const buffer = useRef<RawGesture[]>([]);
  const isRunning = useRef(false);
  const isStarting = useRef(false);
  const sendingRef = useRef(false);
  const handSeenRef = useRef(false);
  const unstableHintFrame = useRef(0);
  const consecutiveSendErrors = useRef(0);

  const stopDetection = useCallback(() => {
    isRunning.current = false;
    isStarting.current = false;
    sendingRef.current = false;
    consecutiveSendErrors.current = 0;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }

    if (handsRef.current) {
      handsRef.current.close?.();
      handsRef.current = null;
    }
  }, []);

  const onResults = useCallback((results: any) => {
    const lm = results.multiHandLandmarks?.[0] as
      | Array<{ x: number; y: number; z: number }>
      | undefined;

    const raw = classifyGesture(lm);

    // Update rolling buffer
    buffer.current = [...buffer.current.slice(-(BUFFER_SIZE - 1)), raw];

    // Count votes
    const counts: Record<string, number> = {};
    for (const g of buffer.current) {
      counts[g] = (counts[g] || 0) + 1;
    }

    // Find majority (excluding no_hand and unclear)
    let majority: RawGesture = "no_hand";
    let majorityVotes = 0;
    for (const [gesture, votes] of Object.entries(counts)) {
      if (gesture !== "no_hand" && gesture !== "unclear" && votes > majorityVotes) {
        majority = gesture as RawGesture;
        majorityVotes = votes;
      }
    }

    const hasHand = Boolean(lm);
    if (hasHand && !handSeenRef.current) {
      console.log("Hand detected");
    }
    handSeenRef.current = hasHand;

    const bufferLen = Math.max(buffer.current.length, 1);
    const confidence = hasHand ? Math.round((majorityVotes / bufferLen) * 100) / 100 : 0;
    const isStable = VALID_GESTURES.includes(majority) && majorityVotes >= STABILITY_THRESHOLD;

    const leadingGesture = majority !== "no_hand" && majority !== "unclear" ? majority : raw;
    const liveMove = rawGestureToMove(leadingGesture);
    const stableMove = isStable ? rawGestureToMove(majority) : null;

    let status: GestureStatus;
    let hint: string;

    if (!hasHand) {
      status = "no_hand";
      hint = HINTS.no_hand;
      unstableHintFrame.current = 0;
    } else if (isStable) {
      status = "stable";
      hint = HINTS.stable;
      unstableHintFrame.current = 0;
    } else {
      status = "detecting";
      const guidance = GUIDANCE_HINTS[Math.floor(unstableHintFrame.current / 24) % GUIDANCE_HINTS.length];
      hint = leadingGesture !== "unclear" && leadingGesture !== "no_hand"
        ? `Detecting ${leadingGesture.toUpperCase()}… hold steady`
        : guidance;
      unstableHintFrame.current += 1;
    }

    const stableGestureLabel = isStable ? majority : "unclear";
    const debugInfo = [
      `hand:${hasHand}`,
      `landmarks:${lm?.length ?? 0}`,
      `raw_count:${rawGestureToFingerCount(raw)}`,
      `raw:${raw}`,
      `majority:${majority}(${majorityVotes}/${bufferLen})`,
      `stable:${stableGestureLabel}`,
      `status:${status}`,
    ].join(" | ");

    setState((s) => ({
      ...s,
      status,
      detectedMove: stableMove ?? liveMove,
      confidence,
      handDetected: hasHand,
      rawGesture: raw,
      hint,
      debugInfo,
    }));
  }, []);

  const startDetection = useCallback(async () => {
    const video = videoRef.current;
    if (isRunning.current || isStarting.current || !video) return;

    isStarting.current = true;
    buffer.current = [];
    handSeenRef.current = false;
    unstableHintFrame.current = 0;
    consecutiveSendErrors.current = 0;

    setState((s) => ({
      ...s,
      status: "loading_model",
      detectedMove: null,
      confidence: 0,
      handDetected: false,
      rawGesture: "no_hand",
      hint: HINTS.loading_model,
      debugInfo: "stage:loading_model",
    }));

    try {
      await ensureMediaPipeReady();

      const HandsCtor = window.Hands;
      if (!HandsCtor) {
        throw new Error("Hands constructor unavailable");
      }

      const hands = new HandsCtor({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.4,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      setState((s) => ({
        ...s,
        status: "camera_started",
        hint: HINTS.camera_started,
        debugInfo: "stage:camera_started",
      }));

      await ensureVideoPlayable(video);

      isRunning.current = true;
      setState((s) => ({
        ...s,
        status: "tracking_active",
        hint: HINTS.tracking_active,
        debugInfo: "stage:tracking_active",
      }));

      const processFrame = async () => {
        if (!isRunning.current) return;

        animFrameRef.current = requestAnimationFrame(processFrame);

        const activeVideo = videoRef.current;
        if (!activeVideo || !handsRef.current || sendingRef.current) return;

        if (
          activeVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
          activeVideo.videoWidth === 0 ||
          activeVideo.videoHeight === 0
        ) {
          return;
        }

        try {
          sendingRef.current = true;
          await handsRef.current.send({ image: activeVideo });
          consecutiveSendErrors.current = 0;
        } catch (error) {
          consecutiveSendErrors.current += 1;

          if (consecutiveSendErrors.current === 1 || consecutiveSendErrors.current % 10 === 0) {
            console.error("hands.send failed", error);
          }

          if (consecutiveSendErrors.current >= 20) {
            isRunning.current = false;
            setState((s) => ({
              ...s,
              status: "tracking_unavailable",
              detectedMove: null,
              confidence: 0,
              handDetected: false,
              rawGesture: "no_hand",
              hint: HINTS.tracking_unavailable,
              debugInfo: `stage:tracking_unavailable | send_errors:${consecutiveSendErrors.current}`,
            }));
          }
        } finally {
          sendingRef.current = false;
        }
      };

      processFrame();
    } catch (err) {
      console.error("Hand detection init failed:", err);
      stopDetection();
      setState((s) => ({
        ...s,
        status: "tracking_unavailable",
        detectedMove: null,
        confidence: 0,
        handDetected: false,
        rawGesture: "no_hand",
        hint: HINTS.tracking_unavailable,
        debugInfo: `stage:tracking_unavailable | reason:${err instanceof Error ? err.message : "unknown_error"}`,
      }));
    } finally {
      isStarting.current = false;
    }
  }, [onResults, stopDetection, videoRef]);

  const lockMove = useCallback(() => {
    setState((s) => ({
      ...s,
      lockedMove: s.detectedMove,
    }));
    return state.detectedMove;
  }, [state.detectedMove]);

  const unlockMove = useCallback(() => {
    setState((s) => ({ ...s, lockedMove: null }));
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return { ...state, startDetection, stopDetection, lockMove, unlockMove };
}
