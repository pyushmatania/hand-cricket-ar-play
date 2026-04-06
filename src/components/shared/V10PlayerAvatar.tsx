import { cn } from "@/lib/utils";
import { getAvatarPreset } from "@/lib/avatars";

interface V10PlayerAvatarProps {
  avatarUrl?: string | null;
  avatarIndex?: number;
  size?: "sm" | "md" | "lg" | "xl";
  level?: number;
  xpProgress?: number; // 0-100
  frame?: string | null;
  online?: boolean;
  className?: string;
}

const sizePx: Record<string, number> = { sm: 36, md: 48, lg: 64, xl: 80 };
const sizeClasses: Record<string, string> = {
  sm: "w-9 h-9 text-lg",
  md: "w-12 h-12 text-2xl",
  lg: "w-16 h-16 text-3xl",
  xl: "w-20 h-20 text-4xl",
};

const FRAME_STYLES: Record<string, { ring: string; glow: string }> = {
  "Bronze Ring": { ring: "ring-2 ring-amber-600/60", glow: "" },
  "Silver Glow": { ring: "ring-2 ring-gray-300/60", glow: "shadow-[0_0_8px_hsl(0_0%_70%/0.3)]" },
  "Gold Crown": { ring: "ring-2 ring-yellow-400/70", glow: "shadow-[0_0_12px_hsl(45_93%_58%/0.3)]" },
  "Diamond Edge": { ring: "ring-2 ring-cyan-400/70", glow: "shadow-[0_0_16px_hsl(192_91%_60%/0.4)]" },
  "Fire Ring": { ring: "ring-2 ring-orange-500/70", glow: "shadow-[0_0_12px_hsl(25_95%_53%/0.4)]" },
  "Neon Pulse": { ring: "ring-2 ring-purple-400/70", glow: "shadow-[0_0_12px_hsl(280_70%_60%/0.4)]" },
  "Champion Aura": { ring: "ring-[3px] ring-yellow-400/80", glow: "shadow-[0_0_20px_hsl(45_93%_58%/0.5)]" },
};

export default function V10PlayerAvatar({
  avatarUrl,
  avatarIndex = 0,
  size = "md",
  level,
  xpProgress = 0,
  frame,
  online,
  className,
}: V10PlayerAvatarProps) {
  const preset = getAvatarPreset(avatarIndex);
  const px = sizePx[size];
  const frameStyle = frame ? FRAME_STYLES[frame] : null;
  const strokeWidth = size === "sm" ? 2 : 3;
  const radius = (px / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - xpProgress / 100);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: px + 8, height: px + 8 }}>
      {/* XP Ring (SVG) */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox={`0 0 ${px + 8} ${px + 8}`}>
        {/* Background track */}
        <circle
          cx={(px + 8) / 2}
          cy={(px + 8) / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.15)"
          strokeWidth={strokeWidth}
        />
        {/* XP progress */}
        <circle
          cx={(px + 8) / 2}
          cy={(px + 8) / 2}
          r={radius}
          fill="none"
          stroke="url(#xp-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ADE50" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Avatar circle */}
      <div
        className={cn(
          "rounded-[28%] overflow-hidden flex items-center justify-center border-2 border-white/10",
          frameStyle?.ring,
          frameStyle?.glow,
        )}
        style={{ width: px, height: px }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center", preset.gradient)}>
            <span>{preset.emoji}</span>
          </div>
        )}
      </div>

      {/* Level badge */}
      {level !== undefined && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 scoreboard-metal px-1.5 py-0.5 rounded-md border border-white/10 min-w-[20px] text-center">
          <span className="font-display text-[9px] text-neon-cyan tabular-nums neon-text-cyan leading-none">
            {level}
          </span>
        </div>
      )}

      {/* Online indicator */}
      {online && (
        <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-neon-green border-2 border-background animate-pulse-glow" />
      )}
    </div>
  );
}
