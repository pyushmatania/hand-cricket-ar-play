import { motion } from "framer-motion";
import playerKohli from "@/assets/player-kohli.jpg";
import playerDhoni from "@/assets/player-dhoni.jpg";
import playerRohit from "@/assets/player-rohit.jpg";
import playerBumrah from "@/assets/player-bumrah.jpg";

export const PLAYER_IMAGES: Record<string, string> = {
  kohli: playerKohli,
  dhoni: playerDhoni,
  rohit: playerRohit,
  bumrah: playerBumrah,
};

export interface PlayerStat {
  label: string;
  value: string;
  /** 0-5 filled diamonds */
  diamonds?: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  number: string;
  role: string;
  rating: number;
  stats: PlayerStat[];
  accentColor: string;
  glowColor: string;
  rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
}

export const INDIAN_LEGENDS: PlayerInfo[] = [
  {
    id: "kohli",
    name: "Virat Kohli",
    number: "18",
    role: "RHB • Captain",
    rating: 97,
    rarity: "legendary",
    stats: [
      { label: "Power", value: "95", diamonds: 5 },
      { label: "Technique", value: "97", diamonds: 5 },
      { label: "Pace", value: "72", diamonds: 4 },
      { label: "Clutch", value: "96", diamonds: 5 },
    ],
    accentColor: "from-primary to-blue-400",
    glowColor: "shadow-[0_0_40px_hsl(217_91%_60%/0.3)]",
  },
  {
    id: "dhoni",
    name: "MS Dhoni",
    number: "7",
    role: "WK • Finisher",
    rating: 95,
    rarity: "legendary",
    stats: [
      { label: "Power", value: "90", diamonds: 5 },
      { label: "Technique", value: "88", diamonds: 4 },
      { label: "Pace", value: "60", diamonds: 3 },
      { label: "Clutch", value: "99", diamonds: 5 },
    ],
    accentColor: "from-secondary to-yellow-400",
    glowColor: "shadow-[0_0_40px_hsl(45_93%_58%/0.3)]",
  },
  {
    id: "rohit",
    name: "Rohit Sharma",
    number: "45",
    role: "RHB • Opener",
    rating: 94,
    rarity: "epic",
    stats: [
      { label: "Power", value: "93", diamonds: 5 },
      { label: "Technique", value: "90", diamonds: 5 },
      { label: "Pace", value: "55", diamonds: 3 },
      { label: "Clutch", value: "85", diamonds: 4 },
    ],
    accentColor: "from-accent to-teal-300",
    glowColor: "shadow-[0_0_40px_hsl(168_80%_50%/0.3)]",
  },
  {
    id: "bumrah",
    name: "J. Bumrah",
    number: "93",
    role: "RF • Pacer",
    rating: 96,
    rarity: "legendary",
    stats: [
      { label: "Power", value: "88", diamonds: 4 },
      { label: "Technique", value: "95", diamonds: 5 },
      { label: "Pace", value: "99", diamonds: 5 },
      { label: "Accuracy", value: "97", diamonds: 5 },
    ],
    accentColor: "from-neon-green to-emerald-300",
    glowColor: "shadow-[0_0_40px_hsl(142_71%_45%/0.3)]",
  },
];

/* ── Rarity frame styles ── */
const RARITY_FRAME: Record<string, { border: string; glow: string; bg: string }> = {
  common: {
    border: "hsl(220 15% 18%)",
    glow: "none",
    bg: "linear-gradient(180deg, hsl(220 15% 20%), hsl(220 15% 14%))",
  },
  rare: {
    border: "hsl(210 60% 40%)",
    glow: "0 0 12px hsl(210 70% 50% / 0.3)",
    bg: "linear-gradient(180deg, hsl(220 15% 20%), hsl(220 15% 14%))",
  },
  epic: {
    border: "hsl(270 50% 45%)",
    glow: "0 0 16px hsl(270 60% 55% / 0.35)",
    bg: "linear-gradient(180deg, hsl(270 20% 18%), hsl(270 25% 12%))",
  },
  legendary: {
    border: "hsl(35 80% 45%)",
    glow: "0 0 20px hsl(35 90% 50% / 0.4)",
    bg: "linear-gradient(180deg, hsl(220 15% 16%), hsl(220 12% 10%))",
  },
  mythic: {
    border: "hsl(280 80% 60%)",
    glow: "0 0 24px hsl(280 90% 65% / 0.5), 0 0 40px hsl(180 80% 50% / 0.2)",
    bg: "linear-gradient(180deg, hsl(280 30% 15%), hsl(220 30% 10%))",
  },
};

/* ── Diamond dots ── */
function DiamondDots({ filled, total = 5, color }: { filled: number; total?: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="text-[8px] leading-none"
          style={{ color: i < filled ? color : "hsl(220 10% 30%)" }}
        >
          ◆
        </span>
      ))}
    </div>
  );
}

interface PlayerCardProps {
  player: PlayerInfo;
  size?: "sm" | "md" | "lg";
  showStats?: boolean;
  delay?: number;
  onTap?: (player: PlayerInfo) => void;
}

export default function PlayerCard({ player, size = "md", showStats = true, delay = 0, onTap }: PlayerCardProps) {
  const img = PLAYER_IMAGES[player.id];
  const rarity = player.rarity || "common";
  const frame = RARITY_FRAME[rarity];

  const sizeMap = {
    sm: { w: "w-28", imgH: "h-28", clip: "24px" },
    md: { w: "w-40", imgH: "h-40", clip: "32px" },
    lg: { w: "w-52", imgH: "h-52", clip: "40px" },
  };
  const s = sizeMap[size];

  /* Shield / pointed-arch clip path */
  const shieldClip = `polygon(50% 0%, 100% ${s.clip}, 100% 100%, 0% 100%, 0% ${s.clip})`;

  /* Accent color for diamonds — extract first color from gradient class */
  const diamondColor =
    rarity === "legendary" ? "hsl(35 80% 55%)" :
    rarity === "epic" ? "hsl(270 60% 60%)" :
    rarity === "rare" ? "hsl(210 70% 55%)" :
    rarity === "mythic" ? "hsl(280 80% 65%)" :
    "hsl(19 80% 55%)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileTap={onTap ? { scale: 0.95 } : undefined}
      onClick={() => onTap?.(player)}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 100 }}
      className={`relative ${s.w} ${onTap ? "cursor-pointer" : ""}`}
    >
      {/* ── Shield-shaped card ── */}
      <div
        className="relative overflow-hidden"
        style={{
          clipPath: shieldClip,
          background: frame.bg,
          border: `3px solid ${frame.border}`,
          borderRadius: "12px",
          boxShadow: `0 6px 12px rgba(0,0,0,0.5), ${frame.glow}, inset 0 2px 0 hsl(35 40% 40% / 0.15), inset 0 -2px 0 rgba(0,0,0,0.3)`,
        }}
      >
        {/* Rating badge */}
        <div className="absolute top-1 left-1 z-20">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(180deg, ${frame.border}, hsl(25 40% 15%))`,
              border: "2px solid hsl(35 60% 45%)",
              boxShadow: "0 2px 0 hsl(220 12% 8%)",
            }}
          >
            <span className="font-display text-[10px] font-black text-game-gold">{player.rating}</span>
          </div>
        </div>

        {/* Jersey number watermark */}
        <div className="absolute top-0 right-0 z-0 opacity-[0.06]">
          <span className="font-display text-[60px] font-black leading-none">{player.number}</span>
        </div>

        {/* Character art — fills arch area */}
        <div className={`relative ${s.imgH} mx-auto flex items-end justify-center overflow-visible`}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-10" />
          <motion.img
            src={img}
            alt={player.name}
            className="h-full w-auto object-contain relative z-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
            loading="lazy"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.4 }}
            style={{ marginTop: "-8px" }}
          />
        </div>

        {/* ── Name Ribbon Banner ── */}
        <div className="relative -mt-3 z-20 flex justify-center">
          <div
            className="relative px-4 py-1 mx-[-6px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${frame.border} 10%, ${frame.border} 90%, transparent 100%)`,
              clipPath: "polygon(4% 0%, 96% 0%, 100% 50%, 96% 100%, 4% 100%, 0% 50%)",
            }}
          >
            <span className="font-display text-[9px] font-black text-white tracking-wider whitespace-nowrap"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              {player.name.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Role */}
        <div className="text-center mt-0.5 mb-1">
          <span className="text-[7px] text-muted-foreground font-body tracking-widest">{player.role}</span>
        </div>

        {/* ── Diamond Stats ── */}
        {showStats && (
          <div className="px-2 pb-2 space-y-0.5">
            {player.stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <span className="text-[7px] text-muted-foreground font-body w-14 truncate">{stat.label}</span>
                <DiamondDots filled={stat.diamonds ?? 3} color={diamondColor} />
                <span className="text-[7px] font-display text-foreground w-5 text-right">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Metal corners */}
        <div className="metal-corners pointer-events-none" />
      </div>

      {/* Mythic pulsing border effect */}
      {rarity === "mythic" && (
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            border: "2px solid hsl(280 80% 60% / 0.5)",
            clipPath: shieldClip,
          }}
        />
      )}
    </motion.div>
  );
}
