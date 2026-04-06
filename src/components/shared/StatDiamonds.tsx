import { cn } from "@/lib/utils";

interface StatDiamondsProps {
  label: string;
  filled: number;
  value?: number;
  total?: number;
  color?: string;
  className?: string;
}

export default function StatDiamonds({
  label,
  filled,
  value,
  total = 5,
  color = "#FFD700",
  className,
}: StatDiamondsProps) {
  return (
    <div className={cn("flex items-center gap-[6px] h-4", className)}>
      <span
        className="text-[9px] font-semibold uppercase tracking-[1px] w-[30px]"
        style={{ fontFamily: "'Rajdhani', sans-serif", color: "#94A3B8" }}
      >
        {label}
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="text-[8px] leading-none"
            style={{
              color: i < filled ? color : "rgba(100,100,100,0.25)",
              textShadow: i < filled ? `0 0 4px ${color}50` : "none",
            }}
          >
            ◆
          </span>
        ))}
      </div>
      {value !== undefined && (
        <span
          className="text-[10px] font-bold text-white w-5 text-right"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
