import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 7) return "dawn";
  if (h >= 7 && h < 11) return "morning";
  if (h >= 11 && h < 16) return "day";
  if (h >= 16 && h < 18) return "golden";
  if (h >= 18 && h < 20) return "dusk";
  return "night";
}

const SKY_THEMES: Record<string, { sky: string; stars: number; moon: boolean; aurora: string[]; cloudColor: string }> = {
  dawn: {
    sky: "linear-gradient(180deg, hsl(220 30% 18%) 0%, hsl(280 25% 22%) 30%, hsl(20 60% 35%) 65%, hsl(35 70% 50%) 100%)",
    stars: 0.3, moon: false,
    aurora: ["hsla(280,60%,50%,0.12)", "hsla(320,50%,45%,0.08)", "hsla(200,50%,50%,0.06)"],
    cloudColor: "rgba(255,200,160,0.12)",
  },
  morning: {
    sky: "linear-gradient(180deg, hsl(210 50% 55%) 0%, hsl(200 45% 65%) 40%, hsl(45 50% 75%) 100%)",
    stars: 0, moon: false,
    aurora: [],
    cloudColor: "rgba(255,255,255,0.25)",
  },
  day: {
    sky: "linear-gradient(180deg, hsl(210 60% 50%) 0%, hsl(205 55% 60%) 50%, hsl(200 40% 70%) 100%)",
    stars: 0, moon: false,
    aurora: [],
    cloudColor: "rgba(255,255,255,0.3)",
  },
  golden: {
    sky: "linear-gradient(180deg, hsl(210 40% 40%) 0%, hsl(30 60% 45%) 50%, hsl(20 70% 40%) 85%, hsl(10 50% 30%) 100%)",
    stars: 0.15, moon: false,
    aurora: ["hsla(30,70%,50%,0.1)", "hsla(350,50%,40%,0.06)"],
    cloudColor: "rgba(255,180,100,0.15)",
  },
  dusk: {
    sky: "linear-gradient(180deg, hsl(230 35% 20%) 0%, hsl(270 30% 25%) 35%, hsl(320 30% 25%) 60%, hsl(10 40% 20%) 100%)",
    stars: 0.4, moon: true,
    aurora: ["hsla(270,50%,40%,0.15)", "hsla(200,60%,45%,0.1)", "hsla(320,40%,35%,0.08)"],
    cloudColor: "rgba(180,160,200,0.1)",
  },
  night: {
    sky: "linear-gradient(180deg, hsl(230 35% 8%) 0%, hsl(240 30% 12%) 35%, hsl(260 25% 10%) 70%, hsl(220 20% 8%) 100%)",
    stars: 1, moon: true,
    aurora: ["hsla(160,70%,40%,0.1)", "hsla(200,60%,50%,0.08)", "hsla(280,50%,45%,0.06)"],
    cloudColor: "rgba(150,170,210,0.08)",
  },
};

export default function DynamicSky() {
  const [tod, setTod] = useState(getTimeOfDay);

  useEffect(() => {
    const interval = setInterval(() => setTod(getTimeOfDay()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const theme = SKY_THEMES[tod];

  return (
    <div className="absolute top-0 left-0 right-0 h-[440px] pointer-events-none overflow-hidden z-0">
      {/* Base sky gradient */}
      <div className="absolute inset-0" style={{ background: theme.sky }} />

      {/* Stars — visible at night/dusk/dawn */}
      {theme.stars > 0 && (
        <>
          <div className="absolute inset-0" style={{
            opacity: theme.stars,
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 12% 8%, #fff, transparent),
              radial-gradient(1px 1px at 28% 15%, #fff, transparent),
              radial-gradient(2px 2px at 48% 5%, #fff, transparent),
              radial-gradient(1px 1px at 65% 12%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 82% 18%, #fff, transparent),
              radial-gradient(1px 1px at 6% 25%, #fff, transparent),
              radial-gradient(1px 1px at 38% 22%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 55% 28%, #fff, transparent),
              radial-gradient(1px 1px at 75% 6%, #fff, transparent),
              radial-gradient(1px 1px at 90% 30%, #fff, transparent),
              radial-gradient(1px 1px at 18% 35%, #fff, transparent),
              radial-gradient(2px 2px at 42% 2%, #fff, transparent),
              radial-gradient(1px 1px at 95% 10%, #fff, transparent),
              radial-gradient(1px 1px at 60% 32%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 3% 15%, #fff, transparent)
            `,
          }} />
          {/* Twinkling stars */}
          {[
            { top: "8%", left: "22%", size: 2, delay: 0, dur: 2.2 },
            { top: "14%", left: "60%", size: 1.5, delay: 0.8, dur: 3 },
            { top: "5%", left: "85%", size: 2.5, delay: 1.5, dur: 2.5 },
            { top: "22%", left: "40%", size: 1.5, delay: 2, dur: 2.8 },
            { top: "18%", left: "10%", size: 2, delay: 0.5, dur: 3.2 },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                top: s.top, left: s.left, width: s.size, height: s.size,
                background: "white", boxShadow: "0 0 4px rgba(255,255,255,0.8)",
              }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
            />
          ))}
        </>
      )}

      {/* Moon */}
      {theme.moon && (
        <div className="absolute" style={{ top: "4%", right: "10%" }}>
          {/* Outer glow */}
          <div className="absolute -inset-6 rounded-full" style={{
            background: "radial-gradient(circle, rgba(220,230,255,0.15) 0%, rgba(200,215,245,0.06) 50%, transparent 70%)",
          }} />
          {/* Moon body */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "radial-gradient(circle at 40% 35%, hsl(210 20% 92%) 0%, hsl(220 15% 80%) 60%, hsl(225 15% 70%) 100%)",
            boxShadow: "0 0 20px rgba(200,215,245,0.3), 0 0 60px rgba(180,200,240,0.15), inset -4px -2px 6px rgba(0,0,0,0.1)",
          }}>
            {/* Craters */}
            <div className="absolute rounded-full" style={{
              top: 8, left: 10, width: 7, height: 7, background: "rgba(0,0,0,0.06)", borderRadius: "50%",
            }} />
            <div className="absolute rounded-full" style={{
              top: 16, left: 20, width: 5, height: 5, background: "rgba(0,0,0,0.05)", borderRadius: "50%",
            }} />
            <div className="absolute rounded-full" style={{
              top: 22, left: 8, width: 4, height: 4, background: "rgba(0,0,0,0.04)", borderRadius: "50%",
            }} />
          </div>
        </div>
      )}

      {/* Aurora bands */}
      {theme.aurora.length > 0 && (
        <div className="absolute inset-0">
          {theme.aurora.map((color, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${8 + i * 12}%`,
                left: "-20%",
                width: "140%",
                height: 60 + i * 20,
              }}
              animate={{
                x: [0, 30, -20, 0],
                scaleY: [1, 1.3, 0.8, 1],
                opacity: [0.6, 1, 0.7, 0.6],
              }}
              transition={{
                duration: 8 + i * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 2,
              }}
            >
              <div className="w-full h-full" style={{
                background: `linear-gradient(90deg, transparent 0%, ${color} 20%, ${color} 50%, transparent 80%)`,
                filter: `blur(${20 + i * 8}px)`,
                borderRadius: "50%",
                transform: `rotate(${-3 + i * 2}deg)`,
              }} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Clouds — visible and opaque */}
      {[
        { top: "30%", w: 180, h: 50, dur: 40, dir: 1, delay: 0 },
        { top: "18%", w: 140, h: 35, dur: 50, dir: -1, delay: 5 },
        { top: "45%", w: 220, h: 55, dur: 55, dir: 1, delay: 12 },
        { top: "12%", w: 100, h: 30, dur: 35, dir: -1, delay: 20 },
      ].map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: c.top, width: c.w, height: c.h }}
          animate={{ x: c.dir > 0 ? [-c.w, 420] : [420, -c.w] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: "linear", delay: c.delay }}
        >
          {/* Multi-blob cloud shape */}
          <div className="relative w-full h-full">
            <div className="absolute rounded-full" style={{
              left: "10%", top: "20%", width: "60%", height: "80%",
              background: `radial-gradient(ellipse, ${theme.cloudColor} 0%, transparent 70%)`,
              filter: "blur(8px)",
            }} />
            <div className="absolute rounded-full" style={{
              left: "30%", top: "0%", width: "50%", height: "90%",
              background: `radial-gradient(ellipse, ${theme.cloudColor} 0%, transparent 65%)`,
              filter: "blur(10px)",
            }} />
            <div className="absolute rounded-full" style={{
              left: "50%", top: "15%", width: "45%", height: "75%",
              background: `radial-gradient(ellipse, ${theme.cloudColor} 0%, transparent 70%)`,
              filter: "blur(8px)",
            }} />
          </div>
        </motion.div>
      ))}

      {/* Bottom fog fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-40" style={{
        background: "linear-gradient(180deg, transparent 0%, hsl(220 20% 8%) 100%)",
      }} />
    </div>
  );
}
