import { useEffect, useRef, memo } from "react";

const PARTICLE_COUNT = 18;

function FloatingDustParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 40,
      size: 1 + Math.random(),
      opacity: 0.04 + Math.random() * 0.08,
      speed: 0.1 + Math.random() * 0.1,
      offset: Math.random() * Math.PI * 2,
    }));

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    let t = 0;
    const loop = () => {
      t++;
      ctx.clearRect(0, 0, w(), h());
      for (const p of particles) {
        p.y -= p.speed;
        const wobble = Math.sin(t * 0.002 + p.offset) * 0.3;
        p.x += wobble;
        if (p.y < -10) {
          p.y = h() + 10;
          p.x = Math.random() * w();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${p.opacity})`;
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}

export default memo(FloatingDustParticles);
