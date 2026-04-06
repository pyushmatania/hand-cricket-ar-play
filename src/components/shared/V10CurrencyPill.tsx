import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface V10CurrencyPillProps {
  icon: string;
  value: number | string;
  showPlus?: boolean;
  onPlusClick?: () => void;
  variant?: "coins" | "gems" | "xp" | "tickets";
  className?: string;
}

const variantGlow: Record<string, string> = {
  coins: "shadow-[0_0_8px_rgba(255,215,0,0.2)]",
  gems: "shadow-[0_0_8px_rgba(168,85,247,0.2)]",
  xp: "shadow-[0_0_8px_rgba(0,212,255,0.2)]",
  tickets: "shadow-[0_0_8px_rgba(74,222,80,0.2)]",
};

const plusColors: Record<string, string> = {
  coins: "from-[#FFD700] to-[#CC9900]",
  gems: "from-[#A855F7] to-[#7C3AED]",
  xp: "from-[#00D4FF] to-[#0099CC]",
  tickets: "from-[#4ADE50] to-[#22C55E]",
};

function formatValue(v: number | string): string {
  if (typeof v !== "number") return String(v);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return String(v);
}

export default function V10CurrencyPill({
  icon,
  value,
  showPlus = true,
  onPlusClick,
  variant = "coins",
  className,
}: V10CurrencyPillProps) {
  return (
    <div
      className={cn(
        "scoreboard-metal flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full",
        variantGlow[variant],
        className
      )}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="font-display text-xs text-foreground tabular-nums min-w-[28px] text-right tracking-wider">
        {formatValue(value)}
      </span>
      {showPlus && (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onPlusClick}
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center",
            "bg-gradient-to-b text-white text-[11px] font-bold leading-none",
            plusColors[variant],
            "border border-black/20",
            "shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]",
            "active:shadow-[0_1px_0_rgba(0,0,0,0.2)] active:translate-y-[1px]"
          )}
        >
          +
        </motion.button>
      )}
    </div>
  );
}
