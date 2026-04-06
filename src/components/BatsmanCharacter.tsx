import { memo } from "react";
import { motion } from "framer-motion";

interface BatsmanCharacterProps {
  lastRuns?: number | "OUT" | null;
}

const idleAnim = {
  y: [0, -3, 0],
  rotate: [0, -0.5, 0],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
};

const shotAnimations: Record<string, object> = {
  DEF: { rotate: [-2, 5, 0], transition: { duration: 0.4, ease: "easeOut" } },
  "1": { x: [0, 8, 0], rotate: [0, 10, 0], transition: { duration: 0.6 } },
  "2": { x: [0, 12, 0], rotate: [0, 15, 0], transition: { duration: 0.7 } },
  "3": { x: [0, 15, 0], rotate: [0, 20, 0], transition: { duration: 0.7 } },
  "4": { x: [0, 20, -5, 0], rotate: [0, 25, 30, 0], y: [0, -5, 0], transition: { duration: 0.9, ease: "easeOut" } },
  "6": { x: [0, 25, -10, 0], rotate: [0, -15, 45, 0], y: [0, -20, -25, 0], scale: [1, 1.1, 1.05, 1], transition: { duration: 1.2, ease: "easeOut" } },
  OUT: { rotate: [0, -5, 10, 5], y: [0, 2, 5, 8], opacity: [1, 1, 0.8, 0.5], transition: { duration: 1.0, ease: "easeIn" } },
};

function BatsmanCharacter({ lastRuns }: BatsmanCharacterProps) {
  const key = lastRuns === null || lastRuns === undefined
    ? "idle"
    : lastRuns === "OUT" ? "OUT" : String(Math.abs(lastRuns as number));

  const shotAnim = key !== "idle" ? shotAnimations[key] || shotAnimations["1"] : undefined;

  return (
    <motion.div
      className="absolute z-[5] pointer-events-none"
      style={{ bottom: "22%", left: "50%", transform: "translateX(-50%)" }}
      variants={idleVariants}
      animate={shotAnim ? shotAnim : "idle"}
      key={key === "idle" ? "idle" : `shot-${Date.now()}`}
    >
      <img
        src="/assets/characters/batsman-idle.png"
        alt="Batsman"
        className="drop-shadow-2xl"
        style={{
          width: "140px",
          height: "auto",
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.6))",
        }}
        width={640}
        height={960}
        loading="lazy"
      />
    </motion.div>
  );
}

export default memo(BatsmanCharacter);
