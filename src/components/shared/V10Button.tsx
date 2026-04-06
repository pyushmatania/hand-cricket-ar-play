import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SFX, Haptics } from "@/lib/sounds";
import type { ReactNode } from "react";

interface V10ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "battle" | "gold";
  size?: "sm" | "md" | "lg" | "battle";
  children: ReactNode;
  icon?: ReactNode;
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

const variantClasses: Record<string, string> = {
  primary: "btn-v10-primary",
  secondary: "btn-v10-secondary",
  danger: "btn-v10-danger",
  battle: "btn-v10-primary btn-v10-battle",
  gold: "btn-v10-gold",
};

const sizeOverrides: Record<string, string> = {
  sm: "!min-h-[40px] !text-sm !px-4 !tracking-[1.5px] !rounded-xl !border-b-[4px]",
  md: "",
  lg: "!min-h-[56px] !text-xl !px-8",
  battle: "!min-h-[68px] !text-[26px] !tracking-[4px] !border-b-[7px]",
};

export default function V10Button({
  variant = "primary",
  size = "md",
  children,
  icon,
  glow = false,
  className,
  disabled,
  onClick,
  type = "button",
}: V10ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    SFX.tap();
    Haptics.light();
    onClick?.(e);
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      type={type}
      disabled={disabled}
      className={cn(
        variantClasses[variant],
        sizeOverrides[size],
        glow && variant === "primary" && "shadow-game-glow-green",
        glow && variant === "danger" && "shadow-game-glow-pink",
        glow && variant === "gold" && "shadow-game-glow-gold",
        "relative overflow-hidden",
        className
      )}
      onClick={handleClick}
    >
      {/* Shine sweep */}
      <span className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg] animate-[btn-shine_4s_ease-in-out_infinite_2s]" />
      </span>
      {icon && <span className="text-xl relative z-10">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
