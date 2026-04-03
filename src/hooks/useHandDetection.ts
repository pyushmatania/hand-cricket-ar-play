import { useState, useCallback, useRef, useEffect } from "react";
import {
  classifyHandCricketGesture,
  rawGestureToMove,
  type RawGesture,
  type V3,
} from "@/lib/handCricketGestures";
import type { Move } from "./useHandCricket";

export type GamePhase =
  | "idle"
  | "loading_model"
  | "camera_started"
  | "tracking_active"
  | "tracking_unavailable"
  | "wait_for_fist"
  | "countdown"
  | "captured"
  | "result"
  | "cooldown";

// Keep old GestureStatus as alias for compatibility
export type GestureStatus = GamePhase;

export interface HandDetectionState {
  status: GamePhase;
  detectedMove: Move | null;
  confidence: number;
  capturedMove: Move | null;
  hint: string;
  handDetected: boolean;
  rawGesture: string;
  debugInfo: string;
  landmarks: Array<{ x: number; y: number; z: number }> | null;
  phase: GamePhase;
  countdownValue: number | null;
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
    const isHandsScript = src.includes("@mediapipe/hands/hands.js");
    if (existing?.dataset.loaded === "1") { resolve(); return; }
    if (isHandsScript && window.Hands) { script.dataset.loaded = "1"; resolve(); return; }
    const cleanup = () => { script.removeEventListener("load", onLoad); script.removeEventListener("error", onError); };
    const onLoad = () => { script.dataset.loaded = "1"; cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error(`Failed to load: ${src}`)); };
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    if (!existing) { script.src = src; script.async = true; script.crossOrigin = "anonymous"; document.head.appendChild(script); }
  });
  scriptLoadCache.set(src, promise);
  return promise;
}

async function ensureMediaPipeReady() {
  await Promise.all(MEDIAPIPE_SCRIPTS.map(loadScriptOnce));
  if (!window.Hands) throw new Error("MediaPipe Hands global failed to initialize");
}

async function ensureVideoPlayable(video: HTMLVideoElement) {
  if (!video.srcObject) throw new Error("Camera stream not attached");
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    await new Promise<void>((resolve) => {
      const onReady = () => { video.removeEventListener("loadeddata", onReady); video.removeEventListener("canplay", onReady); resolve(); };
      video.addEventListener("loadeddata", onReady, { once: true });
      video.addEventListener("canplay", onReady, { once: true });
      setTimeout(() => resolve(), 1500);
    });
  }
  if (video.paused) await video.play();
}

// === Timing constants ===
const VALID_GESTURES: RawGesture[] = ["def", "1", "2", "3", "4", "6"];
const VOTE_WINDOW_SIZE = 8;
const VOTES_REQUIRED = 5;
const CAPTURE_DISPLAY_MS = 250;   // flash duration after capture
const RESULT_MAX_MS    = 2500;    // max time in result phase (fallback)
const COOLDOWN_MS      = 700;     // "Next ball" display

export function useHandDetection(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<HandDetectionState>({
    status: "idle",
    detectedMove: null,
    confidence: 0,
    capturedMove: null,
    hint: "Waiting for camera",
    handDetected: false,
    rawGesture: "no_hand",
    debugInfo: "stage:idle",
    landmarks: null,
    phase: "idle",
    countdownValue: null,
  });

  const handsRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const isRunning = useRef(false);
  const isStarting = useRef(false);
  const sendingRef = useRef(false);
  const consecutiveSendErrors = useRef(0);

  // State machine refs
  const phaseRef = useRef<GamePhase>("idle");
  const prevLandmarksRef = useRef<V3[] | null>(null);
  const fistFrameCount = useRef(0);
  const predictionBufferRef = useRef<RawGesture[]>([]);
  const unlockAtRef = useRef(0);
  const onAutoCaptureRef = useRef<((move: Move) => void) | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCapturedGesture = useRef<RawGesture | null>(null);
  const resultStartRef = useRef(0);
  const resultHandSeenRef = useRef(false);

  const setPhase = useCallback((phase: GamePhase, hint: string, extra?: Partial<HandDetectionState>) => {
    phaseRef.current = phase;
    setState((s) => ({ ...s, status: phase, phase, hint, ...extra }));
  }, []);

  const setOnAutoCapture = useCallback((cb: ((move: Move) => void) | null) => {
    onAutoCaptureRef.current = cb;
  }, []);

  const stopDetection = useCallback(() => {
    isRunning.current = false;
    isStarting.current = false;
    sendingRef.current = false;
    consecutiveSendErrors.current = 0;
    if (countdownTimerRef.current) { clearTimeout(countdownTimerRef.current); countdownTimerRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = 0; }
    if (handsRef.current) { handsRef.current.close?.(); handsRef.current = null; }
  }, []);

  const clearCaptured = useCallback(() => {
    setState((s) => ({ ...s, capturedMove: null }));
  }, []);

  // Reset to active tracking (starts detecting shots immediately)
  const resetToFist = useCallback(() => {
    fistFrameCount.current = 0;
    predictionBufferRef.current = [];
    prevLandmarksRef.current = null;
    unlockAtRef.current = 0;
    lastCapturedGesture.current = null;
    resultStartRef.current = 0;
    resultHandSeenRef.current = false;
    setPhase("tracking_active", "Show your shot!", {
      detectedMove: null, capturedMove: null, confidence: 0, countdownValue: null
    });
  }, [setPhase]);

  // After result → short cooldown → back to reading
  const startCooldown = useCallback(() => {
    setPhase("cooldown", "Next ball…", { countdownValue: null });
    countdownTimerRef.current = setTimeout(() => {
      predictionBufferRef.current = [];
      setPhase("tracking_active", "Play!", { detectedMove: null, capturedMove: null, confidence: 0 });
    }, COOLDOWN_MS);
  }, [setPhase]);

  const onResults = useCallback((results: any) => {
    const now = performance.now();
    const phase = phaseRef.current;
    const lm = results.multiHandLandmarks?.[0] as V3[] | undefined;
    const handedness = results.multiHandedness?.[0]?.label as string | undefined;
    const hasHand = Boolean(lm);
    const classification = classifyHandCricketGesture(lm, handedness);
    const raw = classification.rawGesture;
    if (lm) prevLandmarksRef.current = [...lm];

    const fingerCount = Object.values(classification.fingerStates).filter(Boolean).length;
    const bufferPreview = predictionBufferRef.current.slice(-5).join(",") || "-";

    // Always update hand presence and landmarks for overlay
    setState((s) => ({
      ...s,
      handDetected: hasHand,
      rawGesture: raw,
      landmarks: lm ? [...lm] : null,
      debugInfo: `phase:${phase} | raw:${raw} | hand:${hasHand} | fingers:${fingerCount} | votes:${bufferPreview}`,
    }));

    // If locked (post-capture timers running), ignore
    if (now < unlockAtRef.current) return;

    // === RESULT: wait for hand to leave frame, then advance to cooldown ===
    if (phase === "result") {
      if (hasHand) resultHandSeenRef.current = true;
      const elapsed = now - resultStartRef.current;
      // Advance as soon as hand leaves (after at least 400 ms) OR on timeout
      if (!hasHand && resultHandSeenRef.current && elapsed >= 400) {
        if (countdownTimerRef.current) { clearTimeout(countdownTimerRef.current); countdownTimerRef.current = null; }
        startCooldown();
      }
      return;
    }

    // === WAIT_FOR_FIST / COUNTDOWN: legacy phases, skip if we land here ===
    if (phase === "wait_for_fist" || phase === "countdown") return;

    // === TRACKING_ACTIVE: continuously read hand, capture when stable gesture ===
    if (phase === "tracking_active") {
      if (!hasHand || raw === "no_hand") {
        predictionBufferRef.current = [];
        setState((s) => ({ ...s, detectedMove: null, confidence: 0 }));
        return;
      }

      // Accumulate votes for all valid gestures including def (fist = DEF shot)
      predictionBufferRef.current.push(raw);
      if (predictionBufferRef.current.length > VOTE_WINDOW_SIZE) {
        predictionBufferRef.current.shift();
      }

      const counts = new Map<RawGesture, number>();
      for (const vote of predictionBufferRef.current) {
        if (VALID_GESTURES.includes(vote)) {
          counts.set(vote, (counts.get(vote) ?? 0) + 1);
        }
      }

      let bestGesture: RawGesture | null = null;
      let bestVotes = 0;
      counts.forEach((count, gesture) => {
        if (count > bestVotes) { bestGesture = gesture; bestVotes = count; }
      });

      const confidence = predictionBufferRef.current.length
        ? bestVotes / predictionBufferRef.current.length
        : 0;
      const liveMove = bestGesture ? rawGestureToMove(bestGesture) : null;
      setState((s) => ({ ...s, detectedMove: liveMove, confidence }));

      // Capture when we have enough consistent votes
      if (bestGesture && bestVotes >= VOTES_REQUIRED) {
        const move = rawGestureToMove(bestGesture);
        if (move !== null) {
          predictionBufferRef.current = [];
          lastCapturedGesture.current = bestGesture;
          // Lock out new captures for the full result + cooldown window
          unlockAtRef.current = now + CAPTURE_DISPLAY_MS + RESULT_MAX_MS + COOLDOWN_MS + 100;

          setPhase("captured", `You played: ${move === "DEF" ? "DEF" : move}`, {
            capturedMove: move,
            detectedMove: move,
            confidence: 1,
          });

          countdownTimerRef.current = setTimeout(() => {
            if (onAutoCaptureRef.current) {
              onAutoCaptureRef.current(move);
            }
            // Enter result phase — hand-away detection runs in onResults
            resultStartRef.current = performance.now();
            resultHandSeenRef.current = false;
            setPhase("result", "");

            // Fallback: advance to cooldown if hand never leaves
            countdownTimerRef.current = setTimeout(() => {
              startCooldown();
            }, RESULT_MAX_MS);
          }, CAPTURE_DISPLAY_MS);
        }
      }
      return;
    }

    // In captured/result/cooldown phases, do nothing (timers handle transitions)
  }, [setPhase, startCooldown]);

  const startDetection = useCallback(async () => {
    const video = videoRef.current;
    if (isRunning.current || isStarting.current || !video) return;

    isStarting.current = true;
    consecutiveSendErrors.current = 0;
    fistFrameCount.current = 0;

    setPhase("loading_model", "Loading model…");

    try {
      await ensureMediaPipeReady();
      const HandsCtor = window.Hands;
      if (!HandsCtor) throw new Error("Hands constructor unavailable");

      const hands = new HandsCtor({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.4 });
      hands.onResults(onResults);
      handsRef.current = hands;

      setPhase("camera_started", "Camera started");
      await ensureVideoPlayable(video);
      isRunning.current = true;

      // Start tracking immediately — no fist-wait required
      resetToFist();

      const processFrame = async () => {
        if (!isRunning.current) return;
        animFrameRef.current = requestAnimationFrame(processFrame);
        const activeVideo = videoRef.current;
        if (!activeVideo || !handsRef.current || sendingRef.current) return;
        if (activeVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || activeVideo.videoWidth === 0) return;
        try {
          sendingRef.current = true;
          await handsRef.current.send({ image: activeVideo });
          consecutiveSendErrors.current = 0;
        } catch {
          consecutiveSendErrors.current++;
          if (consecutiveSendErrors.current >= 20) {
            isRunning.current = false;
            setPhase("tracking_unavailable", "Tracking unavailable");
          }
        } finally {
          sendingRef.current = false;
        }
      };
      processFrame();
    } catch (err) {
      console.error("Hand detection init failed:", err);
      stopDetection();
      setPhase("tracking_unavailable", "Tracking unavailable");
    } finally {
      isStarting.current = false;
    }
  }, [onResults, stopDetection, videoRef, setPhase, resetToFist]);

  useEffect(() => () => stopDetection(), [stopDetection]);

  return { ...state, startDetection, stopDetection, clearCaptured, setOnAutoCapture, resetToFist };
}
