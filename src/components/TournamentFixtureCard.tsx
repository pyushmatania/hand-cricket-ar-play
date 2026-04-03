import { motion } from "framer-motion";

const TEAM_COLORS: Record<number, { left: string; right: string }> = {
  0: { left: "hsl(217 80% 45%)", right: "hsl(28 60% 45%)" },
  1: { left: "hsl(217 80% 45%)", right: "hsl(210 15% 55%)" },
  2: { left: "hsl(217 80% 45%)", right: "hsl(45 90% 45%)" },
  3: { left: "hsl(217 80% 45%)", right: "hsl(0 65% 50%)" },
  4: { left: "hsl(217 80% 45%)", right: "hsl(280 60% 45%)" },
};

interface Props {
  index: number;
  opponentName: string;
  opponentEmoji: string;
  result?: "win" | "loss" | "pending";
  userScore?: number;
  oppScore?: number;
  isCurrent: boolean;
  isLocked: boolean;
}

export default function TournamentFixtureCard({
  index,
  opponentName,
  opponentEmoji,
  result,
  userScore,
  oppScore,
  isCurrent,
  isLocked,
}: Props) {
  const isPast = result && result !== "pending";
  const colors = TEAM_COLORS[index] || TEAM_COLORS[0];

  const resultOverlay = isPast
    ? result === "win"
      ? "hsl(142 71% 45% / 0.08)"
      : "hsl(0 70% 50% / 0.08)"
    : "transparent";

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: isLocked ? 0.35 : 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        border: isCurrent
          ? "2px solid hsl(45 93% 58% / 0.6)"
          : isPast
          ? `2px solid ${result === "win" ? "hsl(142 71% 45% / 0.3)" : "hsl(0 70% 50% / 0.2)"}`
          : "2px solid hsl(220 15% 25% / 0.4)",
        boxShadow: isCurrent
          ? "0 0 20px hsl(45 93% 58% / 0.15), inset 0 1px 0 hsl(45 93% 58% / 0.1)"
          : "0 4px 12px hsl(0 0% 0% / 0.3)",
      }}
    >
      {/* Diagonal split background */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, hsl(220 20% 12%) 0%, hsl(220 15% 8%) 100%)` }} />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.left} 0%, ${colors.left} 100%)`,
          clipPath: "polygon(0 0, 55% 0, 35% 100%, 0 100%)",
          opacity: isLocked ? 0.15 : 0.3,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.right} 0%, ${colors.right} 100%)`,
          clipPath: "polygon(55% 0, 100% 0, 100% 100%, 35% 100%)",
          opacity: isLocked ? 0.15 : 0.3,
        }}
      />
      {/* Result tint overlay */}
      <div className="absolute inset-0" style={{ background: resultOverlay }} />
      {/* Scallop texture */}
      <div className="absolute inset-0 scallop-bg opacity-[0.03]" />

      {/* Card content */}
      <div className="relative flex items-center px-3 py-2.5 gap-2">
        {/* Player side */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              background: `linear-gradient(135deg, ${colors.left}, hsl(220 30% 20%))`,
              border: "1.5px solid hsl(220 40% 40% / 0.4)",
              boxShadow: "inset 0 -2px 0 hsl(0 0% 0% / 0.2)",
            }}
          >
            🏏
          </div>
          <span className="font-display text-[9px] font-bold text-foreground/80 tracking-wider truncate">YOU</span>
        </div>

        {/* Center VS badge + round */}
        <div className="flex flex-col items-center shrink-0 px-1">
          {isPast ? (
            <div className="flex items-center gap-1">
              <span className="font-display text-xs font-black text-foreground">{userScore}</span>
              <span className="text-[8px] text-muted-foreground">-</span>
              <span className="font-display text-xs font-black text-foreground">{oppScore}</span>
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(35 90% 40%))",
                boxShadow: isCurrent
                  ? "0 0 10px hsl(45 93% 58% / 0.4), inset 0 -2px 0 hsl(35 80% 30%)"
                  : "inset 0 -2px 0 hsl(35 80% 30%)",
              }}
            >
              <span className="font-display text-[9px] font-black text-background">VS</span>
            </div>
          )}
          <span className="font-display text-[7px] text-muted-foreground tracking-widest mt-0.5">R{index + 1}</span>
        </div>

        {/* Opponent side */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          <span className="font-display text-[9px] font-bold text-foreground/80 tracking-wider truncate text-right">{opponentName.toUpperCase()}</span>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
            style={{
              background: `linear-gradient(135deg, ${colors.right}, hsl(220 15% 15%))`,
              border: "1.5px solid hsl(220 20% 35% / 0.4)",
              boxShadow: "inset 0 -2px 0 hsl(0 0% 0% / 0.2)",
            }}
          >
            {isLocked ? "🔒" : opponentEmoji}
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div
        className="relative flex items-center justify-center py-1"
        style={{
          background: isPast
            ? result === "win"
              ? "linear-gradient(90deg, hsl(142 60% 25% / 0.5), hsl(142 50% 20% / 0.3))"
              : "linear-gradient(90deg, hsl(0 50% 25% / 0.5), hsl(0 40% 20% / 0.3))"
            : isCurrent
            ? "linear-gradient(90deg, hsl(45 80% 30% / 0.3), hsl(45 60% 20% / 0.2))"
            : "hsl(220 15% 10% / 0.4)",
          borderTop: "1px solid hsl(220 15% 25% / 0.3)",
        }}
      >
        {isPast ? (
          <span
            className="font-display text-[8px] font-bold tracking-widest"
            style={{ color: result === "win" ? "hsl(142 71% 55%)" : "hsl(0 70% 60%)" }}
          >
            {result === "win" ? "✅ VICTORY" : "❌ DEFEATED"}
          </span>
        ) : isCurrent ? (
          <span className="font-display text-[8px] font-bold tracking-widest animate-pulse" style={{ color: "hsl(45 93% 60%)" }}>
            ⚔️ NEXT MATCH
          </span>
        ) : (
          <span className="font-display text-[8px] font-bold tracking-widest text-muted-foreground/50">
            🔒 LOCKED
          </span>
        )}
      </div>
    </motion.div>
  );
}
