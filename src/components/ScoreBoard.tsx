import { motion } from "framer-motion";
import type { GameState } from "@/hooks/useHandCricket";

interface ScoreBoardProps {
  game: GameState;
}

export default function ScoreBoard({ game }: ScoreBoardProps) {
  const phaseLabel = () => {
    switch (game.phase) {
      case "first_batting": return "1st Innings — You Bat";
      case "first_bowling": return "1st Innings — You Bowl";
      case "second_batting": return "2nd Innings — You Bat";
      case "second_bowling": return "2nd Innings — You Bowl";
      case "finished": return "Match Over";
      default: return "Ready";
    }
  };

  return (
    <div className="glass-strong p-3 space-y-2">
      {/* Phase */}
      <div className="text-center">
        <span className="text-[10px] font-display tracking-widest text-primary uppercase">
          {phaseLabel()}
        </span>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center scoreboard-gradient rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">You</p>
          <motion.p
            key={game.userScore}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="font-display text-2xl font-bold text-score-gold text-glow-gold"
          >
            {game.userScore}
          </motion.p>
          <p className="text-[10px] text-muted-foreground">
            {game.userWickets > 0 && `W: ${game.userWickets}`}
          </p>
        </div>
        <div className="text-center scoreboard-gradient rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">AI</p>
          <motion.p
            key={game.aiScore}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="font-display text-2xl font-bold text-accent"
          >
            {game.aiScore}
          </motion.p>
          <p className="text-[10px] text-muted-foreground">
            {game.aiWickets > 0 && `W: ${game.aiWickets}`}
          </p>
        </div>
      </div>

      {/* Target */}
      {game.target && (
        <div className="text-center text-xs text-secondary font-bold font-display">
          Target: {game.target}
          {game.phase !== "finished" && game.isBatting && ` • Need ${Math.max(0, game.target - game.userScore)}`}
        </div>
      )}

      {/* Result */}
      {game.phase === "finished" && game.result && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-center py-2 rounded-lg font-display font-bold text-lg ${
            game.result === "win"
              ? "text-primary text-glow"
              : game.result === "loss"
              ? "text-out-red"
              : "text-secondary"
          }`}
        >
          {game.result === "win" ? "🏆 YOU WIN!" : game.result === "loss" ? "💔 YOU LOSE" : "🤝 DRAW"}
        </motion.div>
      )}
    </div>
  );
}
