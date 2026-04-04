import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { isLowEndDevice } from "@/lib/performanceUtils";

const COLORS: Record<string, string[]> = {
  win: ["#FFD700", "#FF6B35", "#FF1493", "#00BFFF", "#7FFF00", "#FF4500", "#DA70D6"],
  wicket: ["#FF0000", "#FF4500", "#FF6347", "#DC143C", "#FF2400"],
  four: ["#00BFFF", "#1E90FF", "#4169E1", "#87CEEB", "#FFD700"],
  six: ["#FFD700", "#FFA500", "#FF6B35", "#FF1493", "#7FFF00", "#00FF7F"],
};

export type FireworkType = "win" | "wicket" | "four" | "six";

interface CanvasFireworksProps {
  type: FireworkType | null;
  duration?: number;
}

export default function CanvasFireworks({ type, duration = 3000 }: CanvasFireworksProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    if (!type) return;

    const colors = COLORS[type] || COLORS.win;
    const waves = type === "win" ? 4 : type === "six" ? 3 : 2;
    const particleCount = type === "win" ? 80 : type === "six" ? 60 : 35;

    for (let w = 0; w < waves; w++) {
      const t = setTimeout(() => {
        // Left burst
        confetti({
          particleCount: Math.floor(particleCount / 2),
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.6 },
          colors,
          gravity: 0.8,
          scalar: 1.1,
          drift: 0.1,
          ticks: 200,
          disableForReducedMotion: true,
        });
        // Right burst
        confetti({
          particleCount: Math.floor(particleCount / 2),
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.6 },
          colors,
          gravity: 0.8,
          scalar: 1.1,
          drift: -0.1,
          ticks: 200,
          disableForReducedMotion: true,
        });

        // Center burst for win/six
        if (type === "win" || type === "six") {
          confetti({
            particleCount: 30,
            angle: 90,
            spread: 100,
            origin: { x: 0.5, y: 0.7 },
            colors,
            gravity: 1,
            scalar: 1.3,
            startVelocity: 45,
            ticks: 250,
            disableForReducedMotion: true,
          });
        }
      }, w * 500);
      timerRef.current.push(t);
    }

    return () => {
      timerRef.current.forEach(clearTimeout);
      timerRef.current = [];
    };
  }, [type, duration]);

  return null;
}
