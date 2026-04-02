import { motion, AnimatePresence } from "framer-motion";

interface CrowdWaveProps {
  active: boolean;
  intensity?: "normal" | "big" | "massive";
}

const WAVE_PEOPLE = 18;

export default function CrowdWave({ active, intensity = "normal" }: CrowdWaveProps) {
  const waves = intensity === "massive" ? 3 : intensity === "big" ? 2 : 1;
  const color = intensity === "massive"
    ? "hsl(45 93% 58%)"   // gold for wins
    : intensity === "big"
    ? "hsl(217 91% 60%)"  // primary blue for sixes
    : "hsl(142 71% 45%)"; // green for fours

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[47] pointer-events-none overflow-hidden"
          style={{ height: "30vh" }}
        >
          {/* Glow base */}
          <motion.div
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${color.replace(")", " / 0.15)")}, transparent 60%)`,
            }}
          />

          {/* Wave rows */}
          {Array.from({ length: waves }).map((_, wave) => (
            <div
              key={wave}
              className="absolute left-0 right-0 flex justify-around items-end"
              style={{
                bottom: `${wave * 28 + 4}px`,
                height: "80px",
              }}
            >
              {Array.from({ length: WAVE_PEOPLE }).map((_, i) => {
                const delay = (i * 0.08) + (wave * 0.4);
                return (
                  <motion.div
                    key={`${wave}-${i}`}
                    initial={{ scaleY: 0.6, y: 10 }}
                    animate={{
                      scaleY: [0.6, 1.3, 0.6],
                      y: [10, -18, 10],
                    }}
                    transition={{
                      duration: 0.7,
                      delay,
                      repeat: 1,
                      ease: "easeInOut",
                    }}
                    className="flex flex-col items-center origin-bottom"
                    style={{ width: `${100 / WAVE_PEOPLE}%` }}
                  >
                    {/* Head */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.7, delay, repeat: 1 }}
                      className="rounded-full mb-0.5"
                      style={{
                        width: intensity === "massive" ? 10 : 8,
                        height: intensity === "massive" ? 10 : 8,
                        background: color,
                        opacity: 0.7 + Math.random() * 0.3,
                        boxShadow: `0 0 ${intensity === "massive" ? 12 : 6}px ${color.replace(")", " / 0.5)")}`,
                      }}
                    />
                    {/* Arms up */}
                    <motion.div
                      animate={{ height: [8, 20, 8] }}
                      transition={{ duration: 0.7, delay, repeat: 1, ease: "easeInOut" }}
                      className="relative flex justify-center"
                      style={{ width: 14 }}
                    >
                      {/* Left arm */}
                      <motion.div
                        animate={{ rotate: [20, -30, 20] }}
                        transition={{ duration: 0.7, delay, repeat: 1 }}
                        className="absolute left-0 origin-bottom"
                        style={{
                          width: 2,
                          height: 10,
                          background: color,
                          opacity: 0.5,
                          borderRadius: 1,
                        }}
                      />
                      {/* Body */}
                      <div
                        style={{
                          width: 4,
                          height: "100%",
                          background: color,
                          opacity: 0.5,
                          borderRadius: 2,
                        }}
                      />
                      {/* Right arm */}
                      <motion.div
                        animate={{ rotate: [-20, 30, -20] }}
                        transition={{ duration: 0.7, delay, repeat: 1 }}
                        className="absolute right-0 origin-bottom"
                        style={{
                          width: 2,
                          height: 10,
                          background: color,
                          opacity: 0.5,
                          borderRadius: 1,
                        }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
