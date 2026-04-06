import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SFX, Haptics } from "@/lib/sounds";
import type { ReactNode, ButtonHTMLAttributes } from "react";

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  icon?: ReactNode;
  bounce?: boolean;
}

const variantCSSVars: Record<string, React.CSSProperties> = {
  primary: {
    "--btn-start": "hsl(122 50% 55%)",
    "--btn-mid": "hsl(122 45% 42%)",
    "--btn-end": "hsl(122 39% 32%)",
    "--btn-dark": "hsl(122 39% 22%)",
  } as React.CSSProperties,
  secondary: {
    "--btn-start": "hsl(210 15% 50%)",
    "--btn-mid": "hsl(210 12% 38%)",
    "--btn-end": "hsl(210 10% 28%)",
    "--btn-dark": "hsl(210 10% 20%)",
  } as React.CSSProperties,
  danger: {
    "--btn-start": "hsl(4 90% 58%)",
    "--btn-mid": "hsl(4 85% 48%)",
    "--btn-end": "hsl(4 80% 38%)",
    "--btn-dark": "hsl(4 75% 28%)",
  } as React.CSSProperties,
  gold: {
    "--btn-start": "hsl(51 100% 55%)",
    "--btn-mid": "hsl(45 95% 45%)",
    "--btn-end": "hsl(43 90% 38%)",
    "--btn-dark": "hsl(43 85% 28%)",
    color: "hsl(240 30% 14%)",
  } as React.CSSProperties,
};

const sizeStyles: Record<string, string> = {
  sm: "px-4 py-2 text-sm rounded-xl min-h-[40px]",
  md: "px-6 py-3 text-base rounded-2xl min-h-[48px]",
  lg: "px-8 py-4 text-lg rounded-2xl min-h-[56px]",
};

export default function GameButton({
  variant = "primary",
  size = "md",
  children,
  icon,
  bounce = false,
  className,
  style,
  ...props
}: GameButtonProps) {
  const Wrapper = bounce ? motion.button : "button";
  const motionProps = bounce
    ? { whileTap: { scale: 0.95 }, whileHover: { scale: 1.02 } }
    : {};

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    SFX.tap();
    Haptics.light();
    props.onClick?.(e);
  };

  return (
    <Wrapper
      className={cn(
        "btn-wood font-display tracking-wide uppercase flex items-center justify-center gap-2",
        sizeStyles[size],
        className
      )}
      style={{ ...variantCSSVars[variant], ...style }}
      {...(motionProps as any)}
      {...props}
      onClick={handleClick}
    >
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </Wrapper>
  );
}
