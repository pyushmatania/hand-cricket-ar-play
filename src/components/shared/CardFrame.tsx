import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Rarity = "common" | "rare" | "epic" | "legendary";

interface CardFrameProps {
  rarity?: Rarity;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const rarityGlow: Record<Rarity, string> = {
  common: "",
  rare: "shadow-[0_0_12px_rgba(0,212,255,0.15)]",
  epic: "shadow-[0_0_16px_rgba(168,85,247,0.2)]",
  legendary: "shadow-[0_0_20px_rgba(255,215,0,0.25)]",
};

const rarityBorderColor: Record<Rarity, string> = {
  common: "#2E1A0E",
  rare: "#0E7490",
  epic: "#6D28D9",
  legendary: "#D4A017",
};

export default function CardFrame({
  rarity = "common",
  children,
  className,
  onClick,
}: CardFrameProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "wood-panel metal-corners rounded-2xl overflow-hidden relative",
        rarityGlow[rarity],
        onClick && "cursor-pointer active:scale-[0.97] transition-transform",
        className
      )}
      style={{
        borderColor: rarityBorderColor[rarity],
      }}
    >
      {/* Metal rivets top & bottom center */}
      <div
        className="absolute top-[-2px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full z-[3]"
        style={{
          background: "radial-gradient(circle at 35% 35%, #8B8B8B, #5A5A5A 40%, #3A3A3A)",
          boxShadow: "inset -1px -1px 0 rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)",
        }}
      />
      <div
        className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full z-[3]"
        style={{
          background: "radial-gradient(circle at 35% 35%, #8B8B8B, #5A5A5A 40%, #3A3A3A)",
          boxShadow: "inset -1px -1px 0 rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)",
        }}
      />
      {children}
    </div>
  );
}
