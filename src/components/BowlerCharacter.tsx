import { memo } from "react";
import { motion } from "framer-motion";

function BowlerCharacter() {
  return (
    <motion.div
      className="absolute z-[4] pointer-events-none"
      style={{ top: "25%", left: "50%", transform: "translateX(-50%)" }}
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <img
        src="/assets/characters/bowler-delivery.png"
        alt="Bowler"
        style={{
          width: "60px",
          height: "auto",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
          opacity: 0.85,
        }}
        width={512}
        height={512}
        loading="lazy"
      />
    </motion.div>
  );
}

export default memo(BowlerCharacter);
