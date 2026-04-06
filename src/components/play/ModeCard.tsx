import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { SFX, Haptics } from "@/lib/sounds";
import type { GameMode } from "./modes";

interface ModeCardProps {
  mode: GameMode;
  index: number;
  onSelect: () => void;
}

export default function ModeCard({ mode, index, onSelect }: ModeCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x: y, y: x });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, type: "spring", damping: 22 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onClick={() => {
        try { SFX.tap(); Haptics.medium(); } catch { /* Intentionally ignored - non-critical */ }
        onSelect();
      }}
      className="relative cursor-pointer"
      style={{ perspective: "800px" }}
    >
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isPressed ? 0.97 : 1,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative overflow-hidden flex items-start gap-4 p-4"
        style={{
          borderRadius: "16px",
          border: `2px solid hsl(${mode.borderHue} 30% 30% / 0.5)`,
          borderBottom: `5px solid hsl(${mode.borderHue} 25% 18%)`,
          background: "linear-gradient(135deg, hsl(220 12% 11% / 0.9) 0%, hsl(220 12% 8% / 0.95) 100%)",
          boxShadow: isPressed
            ? `0 1px 0 hsl(220 18% 7%), 0 0 25px ${mode.glowHsl}`
            : `0 4px 0 hsl(220 18% 7%), 0 6px 20px rgba(0,0,0,0.3)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Jersey mesh texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)",
            backgroundSize: "4px 4px",
          }}
        />

        {/* Animated shine */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: index * 0.6 }}
          className="absolute inset-y-0 w-1/4 pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.02), transparent)" }}
        />

        {/* Icon — 3D chrome pill */}
        <div className="w-14 h-14 shrink-0 flex items-center justify-center relative overflow-hidden"
          style={{
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${mode.gradientFrom}, ${mode.gradientTo})`,
            boxShadow: `0 4px 0 hsl(${mode.borderHue} 40% 20%), 0 6px 16px ${mode.glowHsl}`,
            border: `1.5px solid hsl(${mode.borderHue} 50% 65% / 0.3)`,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, hsl(0 0% 100% / 0.15), transparent 60%)" }}
          />
          <span className="text-2xl relative z-10">{mode.icon}</span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0" style={{ transform: "translateZ(8px)" }}>
          <span className="font-display text-sm text-foreground tracking-wider block"
            style={{ textShadow: "0 1px 0 hsl(220 18% 7%)" }}
          >
            {mode.title}
          </span>
          <span className="text-[10px] font-display font-bold block mt-0.5"
            style={{ color: mode.accentHsl }}
          >
            {mode.subtitle}
          </span>
          <span className="text-[10px] text-muted-foreground font-body block mt-1 leading-relaxed">
            {mode.description}
          </span>
        </div>

        {/* Arrow */}
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-3 text-sm font-bold font-score"
          style={{ color: mode.accentHsl }}
        >
          →
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
