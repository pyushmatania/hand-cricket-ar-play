import { useState, useCallback, useRef, useEffect } from "react";
import type { Move } from "./useHandCricket";

type GestureStatus = "loading" | "ready" | "no_hand" | "unclear" | "detected";

interface HandDetectionState {
  status: GestureStatus;
  detectedMove: Move | null;
  confidence: number;
  lockedMove: Move | null;
}

// Simple finger counting from landmarks
function countFingers(landmarks: Array<{ x: number; y: number; z: number }>): number {
  if (!landmarks || landmarks.length < 21) return -1;

  let count = 0;

  // Thumb: tip (4) vs IP joint (3) — check x distance from wrist
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const wrist = landmarks[0];
  const isRightHand = landmarks[17].x < wrist.x;
  if (isRightHand) {
    if (thumbTip.x < thumbIP.x) count++;
  } else {
    if (thumbTip.x > thumbIP.x) count++;
  }

  // Index: tip (8) above PIP (6)
  if (landmarks[8].y < landmarks[6].y) count++;
  // Middle: tip (12) above PIP (10)
  if (landmarks[12].y < landmarks[10].y) count++;
  // Ring: tip (16) above PIP (14)
  if (landmarks[16].y < landmarks[14].y) count++;
  // Pinky: tip (20) above PIP (18)
  if (landmarks[20].y < landmarks[18].y) count++;

  return count;
}

function fingerCountToMove(count: number): Move | null {
  if (count === 0) return "DEF"; // Fist
  if (count >= 1 && count <= 5) return count as Move;
  return null;
}

export function useHandDetection(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<HandDetectionState>({
    status: "loading",
    detectedMove: null,
    confidence: 0,
    lockedMove: null,
  });

  const handsRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const recentMoves = useRef<(Move | null)[]>([]);
  const isRunning = useRef(false);

  const onResults = useCallback((results: any) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const count = countFingers(landmarks);
      const move = fingerCountToMove(count);

      // Smoothing: keep last 5 detections
      recentMoves.current.push(move);
      if (recentMoves.current.length > 5) recentMoves.current.shift();

      // Most common move in buffer
      const freq = new Map<string, number>();
      recentMoves.current.forEach((m) => {
        const key = String(m);
        freq.set(key, (freq.get(key) || 0) + 1);
      });
      let bestMove: Move | null = null;
      let bestCount = 0;
      freq.forEach((c, k) => {
        if (c > bestCount && k !== "null") {
          bestCount = c;
          bestMove = k === "DEF" ? "DEF" : (Number(k) as Move);
        }
      });

      const confidence = bestCount / recentMoves.current.length;

      if (bestMove !== null && confidence >= 0.5) {
        setState((s) => ({
          ...s,
          status: "detected",
          detectedMove: bestMove,
          confidence,
        }));
      } else {
        setState((s) => ({ ...s, status: "unclear", detectedMove: null, confidence: 0 }));
      }
    } else {
      recentMoves.current = [];
      setState((s) => ({ ...s, status: "no_hand", detectedMove: null, confidence: 0 }));
    }
  }, []);

  const startDetection = useCallback(async () => {
    if (isRunning.current || !videoRef.current) return;

    try {
      // Dynamic import for MediaPipe
      const { Hands } = await import("@mediapipe/hands");

      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(onResults);
      handsRef.current = hands;
      isRunning.current = true;

      setState((s) => ({ ...s, status: "ready" }));

      // Process frames
      const processFrame = async () => {
        if (!isRunning.current || !videoRef.current) return;
        if (videoRef.current.readyState >= 2) {
          try {
            await handsRef.current.send({ image: videoRef.current });
          } catch {
            // frame skip
          }
        }
        animFrameRef.current = requestAnimationFrame(processFrame);
      };

      // Wait a moment for video to be ready
      setTimeout(() => processFrame(), 500);
    } catch (err) {
      console.error("Hand detection init failed:", err);
      setState((s) => ({ ...s, status: "ready" }));
    }
  }, [videoRef, onResults]);

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

  const stopDetection = useCallback(() => {
    isRunning.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return { ...state, startDetection, stopDetection, lockMove, unlockMove };
}
