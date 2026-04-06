import { forwardRef } from "react";

interface ProfileShareCardProps {
  displayName: string;
  rankTier: string;
  xp: number;
  totalMatches: number;
  wins: number;
  losses: number;
  highScore: number;
  bestStreak: number;
  totalSixes: number;
  totalFours: number;
  winRate: number;
  avatarEmoji?: string;
}

const ProfileShareCard = forwardRef<HTMLDivElement, ProfileShareCardProps>(({
  displayName, rankTier, xp, totalMatches, wins, losses, highScore,
  bestStreak, totalSixes, totalFours, winRate, avatarEmoji = "🏏",
}, ref) => {
  return (
    <div
      ref={ref}
      className="w-[360px] rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(222 47% 8%), hsl(220 25% 14%), hsl(222 47% 8%))",
        fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
      }}
    >
      {/* Accent bar */}
      <div className="h-2" style={{ background: "linear-gradient(90deg, hsl(217 91% 60%), hsl(168 80% 50%), hsl(280 70% 55%))" }} />

      <div className="px-5 py-4">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 8, letterSpacing: "0.3em", color: "hsl(217 20% 50%)" }}>HAND CRICKET</p>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "8px auto",
            background: "linear-gradient(135deg, hsl(217 91% 60% / 0.2), hsl(168 80% 50% / 0.2))",
            border: "2px solid hsl(217 91% 60% / 0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
          }}>
            {avatarEmoji}
          </div>
          <p style={{ fontSize: 20, fontWeight: 900, color: "hsl(210 40% 96%)", letterSpacing: "0.1em" }}>
            {displayName}
          </p>
          <div style={{
            display: "inline-block", padding: "2px 12px", borderRadius: 12, marginTop: 4,
            background: "hsl(217 91% 60% / 0.15)", border: "1px solid hsl(217 91% 60% / 0.3)",
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "hsl(217 91% 60%)", letterSpacing: "0.2em" }}>
              {rankTier.toUpperCase()} • {xp} XP
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12,
        }}>
          {[
            { label: "MATCHES", value: totalMatches, color: "hsl(210 40% 96%)" },
            { label: "WINS", value: wins, color: "hsl(122 39% 49%)" },
            { label: "WIN RATE", value: `${winRate}%`, color: "hsl(43 96% 56%)" },
            { label: "HIGH SCORE", value: highScore, color: "hsl(280 70% 55%)" },
            { label: "BEST STREAK", value: `${bestStreak}🔥`, color: "hsl(19 100% 60%)" },
            { label: "LOSSES", value: losses, color: "hsl(4 90% 58%)" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                textAlign: "center", padding: "8px 4px", borderRadius: 12,
                background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(0 0% 100% / 0.06)",
              }}
            >
              <p style={{ fontSize: 18, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 6, color: "hsl(217 20% 50%)", letterSpacing: "0.15em", marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Batting highlights */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 24, marginBottom: 12,
          padding: "8px 0", borderTop: "1px solid hsl(0 0% 100% / 0.05)",
          borderBottom: "1px solid hsl(0 0% 100% / 0.05)",
        }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 16 }}>6️⃣</span>
            <p style={{ fontSize: 16, fontWeight: 900, color: "hsl(280 70% 55%)" }}>{totalSixes}</p>
            <p style={{ fontSize: 6, color: "hsl(217 20% 50%)", letterSpacing: "0.2em" }}>TOTAL SIXES</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 16 }}>4️⃣</span>
            <p style={{ fontSize: 16, fontWeight: 900, color: "hsl(43 96% 56%)" }}>{totalFours}</p>
            <p style={{ fontSize: 6, color: "hsl(217 20% 50%)", letterSpacing: "0.2em" }}>TOTAL FOURS</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 7, color: "hsl(217 20% 40%)", letterSpacing: "0.2em" }}>
            🏏 handcricketgame.lovable.app
          </p>
        </div>
      </div>
    </div>
  );
});

ProfileShareCard.displayName = "ProfileShareCard";
export default ProfileShareCard;
