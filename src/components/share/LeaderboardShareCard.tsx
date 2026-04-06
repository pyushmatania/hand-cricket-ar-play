import { forwardRef } from "react";

interface LeaderboardShareCardProps {
  playerName: string;
  rank: number;
  totalPlayers: number;
  sortLabel: string;
  sortValue: number;
  wins: number;
  losses: number;
  highScore: number;
  rankTier: string;
  isGlobal?: boolean;
}

const LeaderboardShareCard = forwardRef<HTMLDivElement, LeaderboardShareCardProps>(({
  playerName, rank, totalPlayers, sortLabel, sortValue,
  wins, losses, highScore, rankTier, isGlobal = false,
}, ref) => {
  const isTop3 = rank <= 3;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🏅";
  const headerGradient = isTop3
    ? "linear-gradient(90deg, hsl(43 96% 56%), hsl(19 100% 60%))"
    : "linear-gradient(90deg, hsl(217 91% 60%), hsl(168 80% 50%))";

  return (
    <div
      ref={ref}
      className="w-[360px] rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(222 47% 8%), hsl(220 25% 14%), hsl(222 47% 8%))",
        fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
      }}
    >
      <div className="h-2" style={{ background: headerGradient }} />

      <div className="px-5 py-4">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 8, letterSpacing: "0.3em", color: "hsl(217 20% 50%)" }}>
            HAND CRICKET • {isGlobal ? "GLOBAL" : "FRIENDS"} LEADERBOARD
          </p>
        </div>

        {/* Rank display */}
        <div style={{
          background: isTop3 ? "linear-gradient(135deg, hsl(43 96% 56% / 0.12), hsl(43 80% 40% / 0.05))" : "hsl(220 20% 12%)",
          border: isTop3 ? "2px solid hsl(43 96% 56% / 0.4)" : "1px solid hsl(0 0% 100% / 0.08)",
          borderRadius: 20,
          padding: "20px",
          textAlign: "center",
          marginBottom: 12,
          boxShadow: isTop3 ? "0 0 30px hsl(43 96% 56% / 0.15)" : "none",
        }}>
          <div style={{ fontSize: 40, marginBottom: 4 }}>{medal}</div>
          <p style={{
            fontSize: 36,
            fontWeight: 900,
            color: isTop3 ? "hsl(43 96% 56%)" : "hsl(217 91% 60%)",
            textShadow: isTop3 ? "0 0 30px hsl(43 96% 56% / 0.4)" : "0 0 20px hsl(217 91% 60% / 0.3)",
            lineHeight: 1,
          }}>
            #{rank}
          </p>
          <p style={{ fontSize: 10, color: "hsl(210 20% 60%)", marginTop: 4 }}>
            out of {totalPlayers} players
          </p>
        </div>

        {/* Player name */}
        <div style={{
          background: "hsl(220 20% 12%)",
          border: "1px solid hsl(0 0% 100% / 0.08)",
          borderRadius: 12,
          padding: "10px 16px",
          textAlign: "center",
          marginBottom: 12,
        }}>
          <p style={{ fontSize: 7, color: "hsl(217 20% 50%)", letterSpacing: "0.2em" }}>PLAYER</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: "hsl(210 40% 96%)" }}>{playerName}</p>
          <p style={{ fontSize: 9, color: "hsl(43 96% 56%)", letterSpacing: "0.15em", marginTop: 2 }}>{rankTier}</p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 12 }}>
          {[
            { label: sortLabel.toUpperCase(), value: sortValue, icon: "⭐" },
            { label: "WINS", value: wins, icon: "🏆" },
            { label: "LOSSES", value: losses, icon: "💀" },
            { label: "HIGH SCORE", value: highScore, icon: "🔥" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <p style={{ fontSize: 16, fontWeight: 900, color: "hsl(43 96% 56%)", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 6, color: "hsl(217 20% 50%)", letterSpacing: "0.2em" }}>{s.label}</p>
            </div>
          ))}
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

LeaderboardShareCard.displayName = "LeaderboardShareCard";
export default LeaderboardShareCard;
