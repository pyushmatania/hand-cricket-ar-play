import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

interface CardFrameProps {
  rarity?: Rarity;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const RARITY_CONFIG: Record<Rarity, {
  frameBg: string; border: string; glow: string; glowBar: string; glowBarShadow: string;
  gemColor: string; ribbonBg: string;
}> = {
  common: {
    frameBg: "linear-gradient(180deg, #3E2410 0%, #2E1A0E 100%)",
    border: "3px solid #2E1A0E",
    glow: "none",
    glowBar: "#6B7280",
    glowBarShadow: "none",
    gemColor: "#6B7280",
    ribbonBg: "linear-gradient(90deg, #3E2410, #5C3A1E, #3E2410)",
  },
  rare: {
    frameBg: "linear-gradient(180deg, #4A3220 0%, #2E1A0E 100%)",
    border: "3px solid #2563EB",
    glow: "0 0 12px rgba(37,99,235,0.15)",
    glowBar: "#2563EB",
    glowBarShadow: "0 0 6px rgba(37,99,235,0.4)",
    gemColor: "#3B82F6",
    ribbonBg: "linear-gradient(90deg, #1E40AF, #2563EB, #1E40AF)",
  },
  epic: {
    frameBg: "linear-gradient(180deg, #3A2040 0%, #2E1A0E 100%)",
    border: "4px solid #A855F7",
    glow: "0 0 18px rgba(168,85,247,0.2)",
    glowBar: "#A855F7",
    glowBarShadow: "0 0 8px rgba(168,85,247,0.4)",
    gemColor: "#A855F7",
    ribbonBg: "linear-gradient(90deg, #7E22CE, #A855F7, #7E22CE)",
  },
  legendary: {
    frameBg: "linear-gradient(180deg, #4A3520 0%, #2E1A0E 100%)",
    border: "4px solid #FFD700",
    glow: "0 0 24px rgba(255,215,0,0.25)",
    glowBar: "#FFD700",
    glowBarShadow: "0 0 10px rgba(255,215,0,0.5)",
    gemColor: "#FFD700",
    ribbonBg: "linear-gradient(90deg, #B8860B, #FFD700, #B8860B)",
  },
  mythic: {
    frameBg: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(0,212,255,0.1), rgba(255,0,128,0.1))",
    border: "4px solid transparent",
    glow: "0 0 30px rgba(168,85,247,0.3), 0 0 60px rgba(0,212,255,0.15)",
    glowBar: "linear-gradient(90deg, #FF0080, #A855F7, #00D4FF, #FFD700, #FF0080)",
    glowBarShadow: "0 0 12px rgba(168,85,247,0.5)",
    gemColor: "#A855F7",
    ribbonBg: "linear-gradient(90deg, #7E22CE, #A855F7, #00D4FF, #7E22CE)",
  },
};

export default function CardFrame({
  rarity = "common",
  children,
  className,
  onClick,
}: CardFrameProps) {
  const r = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;

  /* Pointed arch / shield clip-path */
  const shieldClip = "polygon(50% 0%, 92% 18%, 92% 100%, 8% 100%, 8% 18%)";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-visible",
        onClick && "cursor-pointer active:scale-[0.97] transition-transform",
        className
      )}
    >
      {/* Main card with shield clip */}
      <div
        className="relative overflow-hidden"
        style={{
          clipPath: shieldClip,
          background: r.frameBg,
          border: r.border,
          borderRadius: "4px",
          boxShadow: `0 6px 12px rgba(0,0,0,0.5), ${r.glow}, inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -2px 0 rgba(0,0,0,0.3)`,
        }}
      >
        {/* Rarity gem at arch peak */}
        <div className="absolute top-[2px] left-1/2 -translate-x-1/2 z-30">
          <div
            className="w-3 h-3 rotate-45"
            style={{
              background: `radial-gradient(circle at 40% 40%, ${r.gemColor}, ${r.gemColor}88)`,
              boxShadow: `0 0 6px ${r.gemColor}66`,
            }}
          />
        </div>

        {/* Metal corner brackets */}
        {["top-[18%] left-[6%]", "top-[18%] right-[6%]", "bottom-[2px] left-[6%]", "bottom-[2px] right-[6%]"].map((pos, i) => (
          <div key={i} className={`absolute ${pos} z-20`}>
            <div
              className="w-[6px] h-[6px] rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 35%, #8B8B8B, #5A5A5A 50%, #3A3A3A)",
                boxShadow: "inset -1px -1px 0 rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)",
              }}
            />
          </div>
        ))}

        {children}
      </div>

      {/* Mythic rotating rainbow border */}
      {rarity === "mythic" && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            clipPath: shieldClip,
            border: "3px solid transparent",
            background: "linear-gradient(90deg, #FF0080, #A855F7, #00D4FF, #FFD700, #FF0080) border-box",
            WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
          animate={{ filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Legendary shimmer sweep */}
      {rarity === "legendary" && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ clipPath: shieldClip }}
        >
          <motion.div
            animate={{ x: ["-120%", "120%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
            className="absolute inset-0 w-[60%]"
            style={{
              background: "linear-gradient(105deg, transparent 30%, rgba(255,215,0,0.2) 45%, rgba(255,255,200,0.35) 50%, rgba(255,215,0,0.2) 55%, transparent 70%)",
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

export { RARITY_CONFIG };
export type { Rarity };
