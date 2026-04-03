import { useCallback } from "react";

type ShakeIntensity = "light" | "medium" | "heavy";

export function useScreenShake() {
  const shake = useCallback((_intensity: ShakeIntensity = "medium") => {
    // Screen shake disabled
  }, []);

  return shake;
}
