import { useCallback } from "react";

type ShakeIntensity = "light" | "medium" | heavy";

export function useScreenShake() {
  const shake = useCallback((intensity: ShakeIntensity = "medium") => {
    const el = document.documentElement;
    const cls = `screen-shake-${intensity}`;
    el.classList.remove("screen-shake-light", "screen-shake-medium", "screen-shake-heavy");
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add(cls);
    const dur = intensity === "heavy" ? 600 : intensity === "medium" ? 400 : 250;
    setTimeout(() => el.classList.remove(cls), dur);
  }, []);

  return shake;
}
