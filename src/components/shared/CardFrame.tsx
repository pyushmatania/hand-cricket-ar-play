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
  gemColor: string; ribbonBg: string; borderColor: string;
}> = {
  common: {
    frameBg: "linear-gradient(180deg, #3E2410 0%, #2E1A0E 100%)",
    border: "4px solid #2E1A0E",
    borderColor: "#2E1A0E",
    glow: "none",
    glowBar: "#6B7280",
    glowBarShadow: "none",
    gemColor: "#6B7280",
    ribbonBg: "linear-gradient(90deg, #3E2410, #5C3A1E, #3E2410)",
  },
  rare: {
    frameBg: "linear-gradient(180deg, #4A3220 0%, #2E1A0E 100%)",
    border: "4px solid #2563EB",
    borderColor: "#2563EB",
    glow: "0 0 12px rgba(37,99,235,0.15)",
    glowBar: "#2563EB",
    glowBarShadow: "0 0 6px rgba(37,99,235,0.4)",
    gemColor: "#3B82F6",
    ribbonBg: "linear-gradient(90deg, #1E40AF, #2563EB, #1E40AF)",
  },
  epic: {
    frameBg: "linear-gradient(180deg, #3A2040 0%, #2E1A0E 100%)",
    border: "4px solid #A855F7",
    borderColor: "#A855F7",
    glow: "0 0 18px rgba(168,85,247,0.2)",
    glowBar: "#A855F7",
    glowBarShadow: "0 0 8px rgba(168,85,247,0.4)",
    gemColor: "#A855F7",
    ribbonBg: "linear-gradient(90deg, #7E22CE, #A855F7, #7E22CE)",
  },
  legendary: {
    frameBg: "linear-gradient(180deg, #4A3520 0%, #2E1A0E 100%)",
    border: "4px solid #FFD700",
    borderColor: "#FFD700",
    glow: "0 0 24px rgba(255,215,0,0.25)",
    glowBar: "#FFD700",
    glowBarShadow: "0 0 10px rgba(255,215,0,0.5)",
    gemColor: "#FFD700",
    ribbonBg: "linear-gradient(90deg, #B8860B, #FFD700, #B8860B)",
  },
  mythic: {
    frameBg: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(0,212,255,0.1), rgba(255,0,128,0.1))",
    border: "4px solid transparent",
    borderColor: "#A855F7",
    glow: "0 0 30px rgba(168,85,247,0.3), 0 0 60px rgba(0,212,255,0.15)",
    glowBar: "linear-gradient(90deg, #FF0080, #A855F7, #00D4FF, #FFD700, #FF0080)",
    glowBarShadow: "0 0 12px rgba(168,85,247,0.5)",
    gemColor: "#A855F7",
    ribbonBg: "linear-gradient(90deg, #7E22CE, #A855F7, #00D4FF, #7E22CE)",
  },
};

/* Iron bracket corner component */
function IronCorner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const clips: Record<string, string> = {
    tl: "polygon(0% 0%, 100% 0%, 100% 35%, 35% 35%, 35% 100%, 0% 100%)",
    tr: "polygon(0% 0%, 100% 0%, 100% 100%, 65% 100%, 65% 35%, 0% 35%)",
    bl: "polygon(0% 0%, 35% 0%, 35% 65%, 100% 65%, 100% 100%, 0% 100%)",
    br: "polygon(65% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 65%, 65% 65%)",
  };
  const pos: Record<string, React.CSSProperties> = {
    tl: { top: -2, left: -2 },
    tr: { top: -2, right: -2 },
    bl: { bottom: -2, left: -2 },
    br: { bottom: -2, right: -2 },
  };
  return (
    <div
      style={{
        position: "absolute",
        width: 14,
        height: 14,
        pointerEvents: "none",
        zIndex: 20,
        background: "linear-gradient(135deg, rgba(180,180,190,0.9) 0%, rgba(120,120,130,0.8) 30%, rgba(60,60,70,0.9) 70%, rgba(30,30,40,1) 100%)",
        clipPath: clips[position],
        filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.7))",
        boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15), inset -1px -1px 0 rgba(0,0,0,0.5)",
        ...pos[position],
      }}
    />
  );
}

export default function CardFrame({
  rarity = "common",
  children,
  className,
  onClick,
}: CardFrameProps) {
  const r = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;

  /* Pointed arch / shield clip-path */
  const shieldClip = "polygon(50% 0%, 92% 18%, 92% 100%, 8% 100%, 8% 18%)";

  /* Rough wood texture layers */
  const woodTexture = `
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M10,20 L25,30 L40,25 L55,40 L70,35' stroke='rgba(0,0,0,0.2)' stroke-width='0.5' fill='none'/%3E%3Cpath d='M60,10 L65,25 L80,30 L85,50' stroke='rgba(0,0,0,0.15)' stroke-width='0.4' fill='none'/%3E%3C/svg%3E"),
    repeating-linear-gradient(88deg, transparent 0px, transparent 18px, rgba(0,0,0,0.12) 19px, rgba(0,0,0,0.20) 20px, transparent 21px, transparent 42px),
    repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 3px, rgba(0,0,0,0.05) 4px, transparent 5px),
    radial-gradient(ellipse 10px 7px at 30% 40%, rgba(0,0,0,0.25), transparent 70%),
    radial-gradient(ellipse 8px 5px at 70% 70%, rgba(0,0,0,0.20), transparent 70%),
    ${r.frameBg}
  `;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-visible",
        onClick && "cursor-pointer active:scale-[0.97] transition-transform",
        className
      )}
    >
      {/* Iron corner brackets — all 4 corners */}
      <IronCorner position="tl" />
      <IronCorner position="tr" />
      <IronCorner position="bl" />
      <IronCorner position="br" />

      {/* Main card with shield clip */}
      <div
        className="relative overflow-hidden"
        style={{
          clipPath: shieldClip,
          background: woodTexture,
          border: r.border,
          borderRadius: "4px",
          boxShadow: `0 6px 12px rgba(0,0,0,0.5), ${r.glow}, inset 0 3px 0 rgba(255,200,130,0.12), inset 0 -3px 0 rgba(0,0,0,0.35), inset 3px 0 6px rgba(0,0,0,0.15), inset -3px 0 6px rgba(0,0,0,0.15)`,
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

        {/* Metal rivet dots at corners */}
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
