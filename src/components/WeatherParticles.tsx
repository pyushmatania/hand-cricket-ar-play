// ═══════════════════════════════════════════════════
// Weather Particles Overlay
// Renders rain, dust, dew, golden-hour effects into
// the #weather-particles DOM element
// ═══════════════════════════════════════════════════

import { useEffect, useRef, memo } from 'react';
import type { WeatherState } from '@/engines/types';
import { isLowEndDevice } from '@/lib/performanceUtils';

interface WeatherParticlesProps {
  weather: WeatherState;
}

function WeatherParticlesComponent({ weather }: WeatherParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }

  useEffect(() => {
    const container = document.getElementById('weather-particles');
    if (!container) return;

    // Create canvas if not present
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
      container.appendChild(canvas);
      canvasRef.current = canvas;
    }

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Particle generation config per weather
    const config = getWeatherConfig(weather);
    particlesRef.current = [];

    if (!config) {
      // No particles for clear/night_lights
      cancelAnimationFrame(animRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return () => window.removeEventListener('resize', resize);
    }

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new particles
      if (particlesRef.current.length < config.maxParticles) {
        for (let i = 0; i < config.spawnRate; i++) {
          particlesRef.current.push(config.spawn(canvas.width, canvas.height));
        }
      }

      // Update & draw
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        if (p.y > canvas!.height || p.x < -20 || p.x > canvas!.width + 20 || p.life <= 0) {
          return false;
        }

        ctx!.globalAlpha = p.opacity * Math.min(1, p.life / 30);
        config.draw(ctx!, p);
        return true;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [weather]);

  // Cleanup canvas on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }, []);

  return null; // Renders into #weather-particles DOM element
}

interface WeatherConfig {
  maxParticles: number;
  spawnRate: number;
  spawn: (w: number, h: number) => { x: number; y: number; vx: number; vy: number; size: number; opacity: number; life: number };
  draw: (ctx: CanvasRenderingContext2D, p: { x: number; y: number; size: number; opacity: number }) => void;
}

function getWeatherConfig(weather: WeatherState): WeatherConfig | null {
  switch (weather) {
    case 'drizzle':
      return {
        maxParticles: 200,
        spawnRate: 3,
        spawn: (w) => ({
          x: Math.random() * w,
          y: -10,
          vx: -0.5 + Math.random() * 0.3,
          vy: 6 + Math.random() * 4,
          size: 1 + Math.random() * 1.5,
          opacity: 0.3 + Math.random() * 0.3,
          life: 200,
        }),
        draw: (ctx, p) => {
          ctx.strokeStyle = `rgba(180, 210, 255, ${p.opacity})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 1, p.y + p.size * 4);
          ctx.stroke();
        },
      };

    case 'dust_storm':
      return {
        maxParticles: 120,
        spawnRate: 2,
        spawn: (w, h) => ({
          x: w + 10,
          y: Math.random() * h,
          vx: -(3 + Math.random() * 3),
          vy: -0.5 + Math.random() * 1,
          size: 2 + Math.random() * 4,
          opacity: 0.15 + Math.random() * 0.2,
          life: 300,
        }),
        draw: (ctx, p) => {
          ctx.fillStyle = `rgba(210, 180, 120, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        },
      };

    case 'heavy_dew':
      return {
        maxParticles: 60,
        spawnRate: 1,
        spawn: (w, h) => ({
          x: Math.random() * w,
          y: h * 0.6 + Math.random() * h * 0.4,
          vx: 0,
          vy: -0.2 - Math.random() * 0.3,
          size: 1 + Math.random() * 2,
          opacity: 0.15 + Math.random() * 0.15,
          life: 150,
        }),
        draw: (ctx, p) => {
          ctx.fillStyle = `rgba(200, 230, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        },
      };

    case 'golden_hour':
      return {
        maxParticles: 40,
        spawnRate: 1,
        spawn: (w, h) => ({
          x: Math.random() * w,
          y: Math.random() * h * 0.5,
          vx: 0.2 + Math.random() * 0.3,
          vy: 0.1 + Math.random() * 0.2,
          size: 3 + Math.random() * 5,
          opacity: 0.08 + Math.random() * 0.1,
          life: 250,
        }),
        draw: (ctx, p) => {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(255, 200, 80, ${p.opacity})`);
          grad.addColorStop(1, `rgba(255, 160, 40, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        },
      };

    case 'overcast':
      return {
        maxParticles: 30,
        spawnRate: 1,
        spawn: (w) => ({
          x: -50 + Math.random() * (w + 100),
          y: -20,
          vx: 0.3 + Math.random() * 0.5,
          vy: 0.05 + Math.random() * 0.1,
          size: 30 + Math.random() * 50,
          opacity: 0.04 + Math.random() * 0.04,
          life: 600,
        }),
        draw: (ctx, p) => {
          ctx.fillStyle = `rgba(150, 160, 170, ${p.opacity})`;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        },
      };

    default:
      return null; // clear, night_lights — no particles
  }
}

export const WeatherParticles = memo(WeatherParticlesComponent);
