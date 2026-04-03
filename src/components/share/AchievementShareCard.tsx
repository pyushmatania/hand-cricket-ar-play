import { forwardRef } from "react";

interface AchievementShareCardProps {
  playerName: string;
  achievementTitle: string;
  achievementIcon: string;
  achievementTier: string;
  description: string;
  unlockedAt?: string;
}

const tierColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  legendary: {
    bg: "linear-gradient(135deg, hsl(43 96% 56% / 0.15), hsl(25 90% 55% / 0.08))",
    border: "hsl(43 96% 56% / 0.5)",
    text: "hsl(43 96% 56%)",
    glow: "0 0 40px hsl(43 96% 56% / 0.3)",
  },
  gold: {
    bg: "linear-gradient(135deg, hsl(43 80% 50% / 0.12), hsl(43 60% 40% / 0.06))",
    border: "hsl(43 80% 50% / 0.4)",
    text: "hsl(43 80% 50%)",
    glow: "0 0 30px hsl(43 80% 50% / 0.2)",
  },
  silver: {
    bg: "linear-gradient(135deg, hsl(210 10% 70% / 0.1), hsl(210 10% 50% / 0.05))",
    border: "hsl(210 10% 70% / 0.4)",
    text: "hsl(210 10% 80%)",
    glow: "0 0 20px hsl(210 10% 70% / 0.15)",
  },
  bronze: {
    bg: "linear-gradient(135deg, hsl(25 60% 50% / 0.1), hsl(25 40% 40% / 0.05))",
    border: "hsl(25 60% 50% / 0.4)",
    text: "hsl(25 60% 60%)",
    glow: "0 0 20px hsl(25 60% 50% / 0.15)",
  },
};

const AchievementShareCard = forwardRef<HTMLDivElement, AchievementShareCardProps>(({
  playerName, achievementTitle, achievementIcon, achievementTier, description, unlockedAt,
}, ref) => {
  const tier = tierColors[achievementTier.toLowerCase()] || tierColors.bronze;

  return (
    <div
      ref={ref}
      className="w-[360px] rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(222 47% 8%), hsl(220 25% 14%), hsl(222 47% 8%))",
        fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
      }}
    >
      {/* Top gradient bar */}
      <div className="h-2" style={{ background: `linear-gradient(90deg, ${tier.text}, hsl(217 91% 60%))` }} />

      <div className="px-6 py-5">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 8, letterSpacing: "0.3em", color: "hsl(217 20% 50%)" }}>
            HAND CRICKET • ACHIEVEMENT UNLOCKED
          </p>
        </div>

        {/* Achievement badge */}
        <div style={{
          background: tier.bg,
          border: `2px solid ${tier.border}`,
          borderRadius: 20,
          padding: "24px 20px",
          textAlign: "center",
          boxShadow: tier.glow,
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{achievementIcon}</div>
          <p style={{
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: tier.text,
            textShadow: `0 0 20px ${tier.text}40`,
            marginBottom: 4,
          }}>
            {achievementTitle}
          </p>
          <p style={{ fontSize: 10, color: "hsl(210 20% 60%)", marginBottom: 8 }}>
            {description}
          </p>
          <div style={{
            display: "inline-block",
            padding: "3px 12px",
            borderRadius: 8,
            background: `${tier.text}15`,
            border: `1px solid ${tier.text}30`,
          }}>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: tier.text }}>
              {achievementTier.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Player info */}
        <div style={{
          background: "hsl(220 20% 12%)",
          border: "1px solid hsl(0 0% 100% / 0.08)",
          borderRadius: 12,
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}>
          <div>
            <p style={{ fontSize: 7, color: "hsl(217 20% 50%)", letterSpacing: "0.2em" }}>EARNED BY</p>
            <p style={{ fontSize: 14, fontWeight: 900, color: "hsl(210 40% 96%)" }}>{playerName}</p>
          </div>
          {unlockedAt && (
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 7, color: "hsl(217 20% 50%)", letterSpacing: "0.2em" }}>DATE</p>
              <p style={{ fontSize: 10, color: "hsl(210 40% 80%)" }}>{unlockedAt}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", paddingTop: 8, borderTop: "1px solid hsl(0 0% 100% / 0.05)" }}>
          <p style={{ fontSize: 7, color: "hsl(217 20% 40%)", letterSpacing: "0.2em" }}>
            🏏 handcricketgame.lovable.app
          </p>
        </div>
      </div>
    </div>
  );
});

AchievementShareCard.displayName = "AchievementShareCard";
export default AchievementShareCard;
