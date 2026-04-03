import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Rarity = "common" | "rare" | "epic" | "legendary";

interface CardFrameProps {
  rarity?: Rarity;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const rarityBorder: Record<Rarity, string> = {
  common: "border-[hsl(25_40%_14%)]",
  rare: "border-[hsl(207_60%_35%)]",
  epic: "border-[hsl(291_40%_35%)]",
  legendary: "border-[hsl(43_80%_40%)] animate-border-glow",
};

const rarityGlow: Record<Rarity, string> = {
  common: "",
  rare: "shadow-[0_0_12px_hsl(207_90%_54%/0.15)]",
  epic: "shadow-[0_0_16px_hsl(291_47%_51%/0.2)]",
  legendary: "shadow-[0_0_20px_hsl(51_100%_50%/0.25)]",
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
        "wood-panel-dark metal-corners rounded-2xl border-[3px] overflow-hidden",
        rarityBorder[rarity],
        rarityGlow[rarity],
        onClick && "cursor-pointer active:scale-[0.97] transition-transform",
        className
      )}
    >
      {children}
    </div>
  );
}
