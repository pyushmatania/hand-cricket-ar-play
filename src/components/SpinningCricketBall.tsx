import { motion } from "framer-motion";
import cricketBallIcon from "@/assets/cricket-ball-icon.webp";

interface SpinningCricketBallProps {
  size?: number;
  className?: string;
}

export default function SpinningCricketBall({ size = 80, className = "" }: SpinningCricketBallProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size, perspective: 800 }}>
      {/* 3D shadow beneath */}
      <motion.div
        animate={{ scale: [0.8, 1, 0.8], opacity: [0.4, 0.15, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-12%] left-[10%] w-[80%] h-[22%] rounded-full bg-primary/40 blur-lg"
      />
      {/* Spinning ball with 3D transforms */}
      <motion.div
        animate={{ rotateY: [0, 360], rotateX: [0, 15, 0, -15, 0] }}
        transition={{ rotateY: { duration: 2.5, repeat: Infinity, ease: "linear" }, rotateX: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
        className="w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        <img
          src={cricketBallIcon}
          alt="Cricket Ball"
          className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(224,64,64,0.5)]"
          style={{ backfaceVisibility: "hidden" }}
        />
        {/* Back face for 3D illusion */}
        <img
          src={cricketBallIcon}
          alt=""
          className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(224,64,64,0.5)]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        />
      </motion.div>
      {/* Glow ring */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-[-10%] rounded-full border-2 border-primary/20"
      />
      {/* Secondary glow */}
      <motion.div
        animate={{ scale: [1.1, 1.4, 1.1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        className="absolute inset-[-15%] rounded-full border border-primary/10"
      />
    </div>
  );
}
