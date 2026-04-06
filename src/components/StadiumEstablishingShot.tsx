/**
 * Stadium Establishing Shot — V10 Cinematic opening
 * Night stadium with sweeping floodlight beams,
 * camera pan effect, and match info reveal.
 * Uses stadium-glass + scoreboard-metal materials.
 * Total duration: ~4s
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SFX } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";

interface StadiumEstablishingShotProps {
  playerName: string;
  opponentName: string;
  arenaName?: string;
  onComplete: () => void;
}

export default function StadiumEstablishingShot({
  playerName,
  opponentName,
  arenaName = "Stadium",
  onComplete,
}: StadiumEstablishingShotProps) {
  const [phase, setPhase] = useState<"pan" | "zoom" | "title" | "done">("pan");
  const { soundEnabled } = useSettings();

  useEffect(() => {
    if (soundEnabled) SFX.ceremonyHorn();
    const t1 = setTimeout(() => setPhase("zoom"), 1400);
    const t2 = setTimeout(() => setPhase("title"), 2600);
    const t3 = setTimeout(() => { setPhase("done"); onComplete(); }, 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete, soundEnabled]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[72] overflow-hidden"
        >
          {/* Night sky base — V10 deep navy */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.3, y: "-10%" }}
            animate={
              phase === "pan"
                ? { scale: 1.2, y: "0%" }
                : phase === "zoom"
                ? { scale: 1, y: "0%" }
                : { scale: 1.05, y: "0%" }
            }
            transition={{ duration: 1.4, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(180deg, hsl(220 40% 4%) 0%, hsl(220 30% 8%) 40%, hsl(100 20% 10%) 75%, hsl(100 25% 6%) 100%)",
            }}
          >
            {/* Stars */}
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                className="absolute rounded-full"
                style={{
                  width: 1 + Math.random() * 1.5,
                  height: 1 + Math.random() * 1.5,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 35}%`,
                  background: "hsl(0 0% 90%)",
                }}
              />
            ))}

            {/* Stadium silhouette — tiered arcs */}
            <div className="absolute bottom-0 left-0 right-0 h-[45%]">
              <div
                className="absolute bottom-[55%] left-[5%] right-[5%] h-[25%] rounded-t-[50%]"
                style={{
                  background: "linear-gradient(180deg, hsl(220 20% 10%) 0%, hsl(220 15% 7%) 100%)",
                  border: "1px solid hsl(220 15% 15%)",
                  borderBottom: "none",
                }}
              />
              <div
                className="absolute bottom-[30%] left-[2%] right-[2%] h-[30%] rounded-t-[40%]"
                style={{
                  background: "linear-gradient(180deg, hsl(220 18% 8%) 0%, hsl(220 15% 5%) 100%)",
                  border: "1px solid hsl(220 15% 12%)",
                  borderBottom: "none",
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-[35%]"
                style={{ background: "linear-gradient(180deg, hsl(100 30% 12%) 0%, hsl(100 25% 6%) 100%)" }}
              />
              <div
                className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[8%] h-[25%] rounded-sm"
                style={{ background: "linear-gradient(180deg, hsl(40 25% 22%) 0%, hsl(40 20% 15%) 100%)", opacity: 0.6 }}
              />
            </div>

            {/* Floodlight towers */}
            {[
              { left: "8%", height: "55%", beamAngle: 25 },
              { left: "28%", height: "50%", beamAngle: 12 },
              { left: "72%", height: "50%", beamAngle: -12 },
              { left: "92%", height: "55%", beamAngle: -25 },
            ].map((tower, i) => (
              <div key={`tower-${i}`} className="absolute" style={{ left: tower.left, bottom: "35%", height: tower.height }}>
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[3px]"
                  style={{ height: "100%", background: "linear-gradient(180deg, hsl(0 0% 35%), hsl(0 0% 15%))" }}
                />
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-3 rounded-sm"
                  style={{
                    background: "linear-gradient(180deg, hsl(43 50% 80%), hsl(43 40% 50%))",
                    boxShadow: "0 0 12px hsl(43 96% 56% / 0.6)",
                  }}
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.06, 0.15, 0.06] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                  className="absolute top-0 left-1/2 origin-top"
                  style={{
                    width: 0,
                    height: "200%",
                    borderLeft: "60px solid transparent",
                    borderRight: "60px solid transparent",
                    borderTop: "0 solid transparent",
                    borderBottom: `300px solid hsl(43 80% 80% / 0.08)`,
                    transform: `translateX(-50%) rotate(${tower.beamAngle}deg)`,
                    filter: "blur(8px)",
                  }}
                />
              </div>
            ))}

            {/* Sweeping spotlight */}
            <motion.div
              animate={{ x: ["-30%", "130%"], opacity: [0, 0.12, 0.12, 0] }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="absolute top-[15%] w-24 h-[80%]"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(43 96% 80% / 0.15), transparent)",
                filter: "blur(20px)",
              }}
            />

            {/* Crowd dots */}
            {[...Array(60)].map((_, i) => (
              <motion.div
                key={`crowd-${i}`}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 0.3 + Math.random() * 0.5, repeat: Infinity, delay: Math.random() * 4 }}
                className="absolute rounded-full"
                style={{
                  width: 2,
                  height: 2,
                  left: `${5 + Math.random() * 90}%`,
                  bottom: `${38 + Math.random() * 20}%`,
                  background: ["hsl(43 96% 70%)", "hsl(0 0% 90%)", "hsl(200 80% 70%)"][i % 3],
                }}
              />
            ))}
          </motion.div>

          {/* Title overlay — scoreboard-metal framed */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            {/* Arena name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={phase !== "pan" ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span
                className="font-display text-[10px] font-bold tracking-[0.4em] block text-center"
                style={{ color: "hsl(43 60% 50% / 0.6)" }}
              >
                {arenaName.toUpperCase()}
              </span>
            </motion.div>

            {/* VS matchup — scoreboard-metal card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={phase === "title" ? { opacity: 1, scale: 1 } : {}}
              transition={{ type: "spring", damping: 12 }}
              className="text-center mt-3 px-6 py-4 rounded-xl scoreboard-metal"
            >
              <span className="font-display text-lg font-black text-white tracking-wider block" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
                {playerName.toUpperCase()}
              </span>
              <span className="font-display text-sm font-bold block my-1" style={{ color: "hsl(43 96% 56%)" }}>
                VS
              </span>
              <span className="font-display text-lg font-black text-white tracking-wider block" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
                {opponentName.toUpperCase()}
              </span>
            </motion.div>

            {/* Gold divider line */}
            <motion.div
              initial={{ width: 0 }}
              animate={phase === "title" ? { width: "50%" } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="h-[2px] rounded-full mt-4"
              style={{ background: "linear-gradient(90deg, transparent, hsl(43 96% 56%), transparent)" }}
            />
          </div>

          {/* Bottom vignette */}
          <div className="absolute bottom-0 left-0 right-0 h-[30%]" style={{
            background: "linear-gradient(to top, hsl(220 30% 4%), transparent)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
