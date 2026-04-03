import { cn } from "@/lib/utils";

interface CurrencyPillProps {
  icon: string;
  value: number | string;
  showPlus?: boolean;
  onPlusClick?: () => void;
  className?: string;
}

export default function CurrencyPill({
  icon,
  value,
  showPlus = true,
  onPlusClick,
  className,
}: CurrencyPillProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full pl-1.5 pr-1 py-0.5",
        className
      )}
      style={{
        background: "linear-gradient(180deg, hsl(28 40% 22%), hsl(25 45% 14%))",
        border: "2px solid hsl(25 35% 10%)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 hsl(35 30% 35% / 0.25)",
      }}
    >
      <span className="text-base">{icon}</span>
      <span className="text-xs font-game-display text-foreground min-w-[28px] text-right">
        {typeof value === "number"
          ? value >= 1000
            ? `${(value / 1000).toFixed(1)}K`
            : value
          : value}
      </span>
      {showPlus && (
        <button
          onClick={onPlusClick}
          className="w-5 h-5 rounded-full bg-game-green flex items-center justify-center text-white text-xs font-bold active:scale-90 transition-transform"
        >
          +
        </button>
      )}
    </div>
  );
}
