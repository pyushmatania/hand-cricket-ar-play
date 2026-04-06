import { useEffect, useRef } from "react";

/**
 * Subtle stone dust particles that drift downward from a carved stone header.
 * Renders a lightweight canvas overlay sized to the parent container.
 * Uses requestAnimationFrame for smooth, non-blocking animation.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function StoneDustEffect({ width = 140, height = 40 }: { width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const spawn = () => {
      if (particles.current.length < 12) {
        const maxLife = 80 + Math.random() * 60;
        particles.current.push({
          x: Math.random() * width,
          y: 4 + Math.random() * 10,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0.15 + Math.random() * 0.25,
          size: 1 + Math.random() * 1.5,
          opacity: 0.25 + Math.random() * 0.2,
          life: 0,
          maxLife,
        });
      }
    };

    let frame = 0;
    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;
      if (frame % 6 === 0) spawn();

      particles.current = particles.current.filter((p) => {
        p.life++;
        p.x += p.vx + Math.sin(p.life * 0.05) * 0.15;
        p.vy += 0.003; // gentle gravity
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        const alpha = progress < 0.15
          ? p.opacity * (progress / 0.15)
          : p.opacity * (1 - (progress - 0.15) / 0.85);

        if (alpha <= 0 || p.y > height) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,170,155,${alpha})`;
        ctx.fill();
        return true;
      });

      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width,
        height,
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0.8,
      }}
    />
  );
}
