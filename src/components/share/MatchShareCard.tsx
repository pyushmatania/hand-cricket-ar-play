import { forwardRef } from "react";
import type { BallResult } from "@/hooks/useHandCricket";

interface MatchShareCardProps {
  playerName: string;
  opponentName: string;
  result: "win" | "loss" | "draw";
  playerScore: number;
  opponentScore: number;
  playerWickets?: number;
  opponentWickets?: number;
  stats: {
    sixes: number;
    fours: number;
    strikeRate: number;
    totalBalls: number;
  };
  isPvP?: boolean;
}

const MatchShareCard = forwardRef<HTMLDivElement, MatchShareCardProps>(({
  playerName, opponentName, result, playerScore, opponentScore,
  playerWickets = 0, opponentWickets = 0, stats, isPvP = false,
}, ref) => {
  const isWin = result === "win";
  const isLoss = result === "loss";

  return (
    <div
      ref={ref}
      className="w-[360px] rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(222 47% 8%), hsl(220 25% 14%), hsl(222 47% 8%))",
        fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
      }}
    >
      {/* Header gradient bar */}
      <div
        className="h-2"
        style={{
          background: isWin
            ? "linear-gradient(90deg, hsl(43 96% 56%), hsl(19 100% 60%))"
            : isLoss
            ? "linear-gradient(90deg, hsl(4 90% 58%), hsl(340 80% 50%))"
            : "linear-gradient(90deg, hsl(217 91% 60%), hsl(168 80% 50%))",
        }}
      />

      <div className="px-5 py-4">
        {/* Game logo + result */}
        <div className="text-center mb-3">
          <p style={{ fontSize: 8, letterSpacing: "0.3em", color: "hsl(217 20% 50%)" }}>
            HAND CRICKET {isPvP ? "PVP" : "VS AI"}
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "0.15em",
              color: isWin ? "hsl(43 96% 56%)" : isLoss ? "hsl(4 90% 58%)" : "hsl(210 40% 96%)",
              textShadow: isWin
                ? "0 0 30px hsl(43 96% 56% / 0.4)"
                : isLoss
                ? "0 0 30px hsl(4 90% 58% / 0.4)"
                : "none",
            }}
          >
            {isWin ? "🏆 VICTORY" : isLoss ? "DEFEAT" : "🤝 TIED"}
          </p>
        </div>

        {/* Scorecard */}
        <div
          style={{
            background: "hsl(220 20% 12%)",
            border: "1px solid hsl(43 96% 56% / 0.15)",
            borderRadius: 16,
            padding: "12px 16px",
            marginBottom: 12,
          }}
        >
          {/* Player row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: "1px solid hsl(0 0% 100% / 0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isWin && <span style={{ fontSize: 12 }}>🏆</span>}
              <span style={{ fontSize: 13, fontWeight: 900, color: "hsl(210 40% 96%)" }}>{playerName}</span>
            </div>
            <div>
              <span style={{ fontSize: 24, fontWeight: 900, color: "hsl(43 96% 56%)" }}>{playerScore}</span>
              <span style={{ fontSize: 12, color: "hsl(4 90% 58% / 0.6)" }}>/{playerWickets}</span>
            </div>
          </div>
          {/* Opponent row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isLoss && <span style={{ fontSize: 12 }}>🏆</span>}
              <span style={{ fontSize: 13, fontWeight: 900, color: "hsl(210 40% 80%)" }}>{opponentName}</span>
            </div>
            <div>
              <span style={{ fontSize: 24, fontWeight: 900, color: "hsl(210 40% 80%)" }}>{opponentScore}</span>
              <span style={{ fontSize: 12, color: "hsl(4 90% 58% / 0.6)" }}>/{opponentWickets}</span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 12 }}>
          {[
            { icon: "⚾", label: "BALLS", value: stats.totalBalls },
            { icon: "⚡", label: "SR", value: stats.strikeRate },
            { icon: "6️⃣", label: "SIXES", value: stats.sixes },
            { icon: "4️⃣", label: "FOURS", value: stats.fours },
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

MatchShareCard.displayName = "MatchShareCard";
export default MatchShareCard;
