import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHandCricket, type Move, type BallResult } from "@/hooks/useHandCricket";
import ScoreBoard from "./ScoreBoard";
import RulesSheet from "./RulesSheet";

interface TapGameScreenProps {
  onHome: () => void;
}

const MOVES: { move: Move; emoji: string; label: string }[] = [
  { move: "DEF", emoji: "✊", label: "DEF" },
  { move: 1, emoji: "☝️", label: "1" },
  { move: 2, emoji: "✌️", label: "2" },
  { move: 3, emoji: "🤟", label: "3" },
  { move: 4, emoji: "🖖", label: "4" },
  { move: 6, emoji: "👍", label: "6" },
];

export default function TapGameScreen({ onHome }: TapGameScreenProps) {
  const { game, startGame, playBall, resetGame } = useHandCricket();
  const [lastPlayed, setLastPlayed] = useState<Move | null>(null);
  const [cooldown, setCooldown] = useState(false);

  const handleMove = (move: Move) => {
    if (cooldown || game.phase === "not_started" || game.phase === "finished") return;
    setLastPlayed(move);
    playBall(move);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 800);
  };

  const handleStartNew = () => {
    resetGame();
    setLastPlayed(null);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={onHome}
          className="text-muted-foreground hover:text-foreground text-sm font-bold active:scale-95 transition-transform"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <span className="font-display text-[9px] tracking-[0.15em] text-accent font-bold">
            TAP MODE
          </span>
          <span className="text-lg">👆</span>
        </div>
        <RulesSheet />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col gap-3 px-4 pb-4 max-w-lg mx-auto w-full">
        {/* Toss */}
        {game.phase === "not_started" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-score p-6 text-center space-y-4 mt-8"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/30 flex items-center justify-center mb-2">
              <span className="text-3xl">👆</span>
            </div>
            <p className="font-display text-sm font-black text-foreground tracking-wider">
              CHOOSE YOUR INNINGS
            </p>
            <p className="text-[11px] text-muted-foreground">Tap to play — no camera needed</p>
            <div className="flex gap-3">
              <button
                onClick={() => startGame(true)}
                className="flex-1 py-3.5 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-display font-bold rounded-xl text-sm glow-primary active:scale-95 transition-transform"
              >
                🏏 BAT
              </button>
              <button
                onClick={() => startGame(false)}
                className="flex-1 py-3.5 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground font-display font-bold rounded-xl text-sm glow-accent active:scale-95 transition-transform"
              >
                🎯 BOWL
              </button>
            </div>
          </motion.div>
        )}

        {/* Scoreboard */}
        {game.phase !== "not_started" && <ScoreBoard game={game} />}

        {/* Last result display */}
        <AnimatePresence mode="wait">
          {game.lastResult && game.phase !== "not_started" && game.phase !== "finished" && (
            <motion.div
              key={game.lastResult.description}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-score p-4 text-center"
            >
              <div className="flex items-center justify-center gap-6 mb-2">
                <div className="text-center">
                  <p className="text-[8px] text-muted-foreground font-bold">YOU</p>
                  <p className="text-3xl">{MOVES.find((m) => m.move === game.lastResult?.userMove)?.emoji || "❓"}</p>
                  <p className="text-xs font-display font-bold text-primary">
                    {game.lastResult.userMove === "DEF" ? "DEF" : game.lastResult.userMove}
                  </p>
                </div>
                <div className="text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    game.lastResult.runs === "OUT"
                      ? "bg-out-red/20 border border-out-red/30"
                      : "bg-primary/20 border border-primary/30"
                  }`}>
                    <span className="text-xs font-display font-black">
                      {game.lastResult.runs === "OUT" ? "OUT" : `+${game.lastResult.runs}`}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[8px] text-muted-foreground font-bold">AI</p>
                  <p className="text-3xl">{MOVES.find((m) => m.move === game.lastResult?.aiMove)?.emoji || "🤖"}</p>
                  <p className="text-xs font-display font-bold text-accent">
                    {game.lastResult.aiMove === "DEF" ? "DEF" : game.lastResult.aiMove}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap buttons grid */}
        {game.phase !== "not_started" && game.phase !== "finished" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-auto"
          >
            <p className="text-center text-[9px] text-muted-foreground font-display mb-2 tracking-wider">
              {game.isBatting ? "TAP YOUR SHOT" : "TAP YOUR BOWL"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {MOVES.map((m) => (
                <motion.button
                  key={m.label}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleMove(m.move)}
                  disabled={cooldown}
                  className={`relative py-5 rounded-2xl font-display font-bold text-sm flex flex-col items-center gap-1 transition-all ${
                    cooldown
                      ? "opacity-40 cursor-not-allowed"
                      : lastPlayed === m.move
                      ? "bg-primary/20 border-2 border-primary/40 text-primary glow-primary"
                      : "glass-score border-2 border-transparent text-foreground active:border-primary/30"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs tracking-wider">{m.label}</span>
                  {cooldown && lastPlayed === m.move && (
                    <motion.div
                      initial={{ scaleX: 1 }}
                      animate={{ scaleX: 0 }}
                      transition={{ duration: 0.8, ease: "linear" }}
                      className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary rounded-full origin-left"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Game over */}
        {game.phase === "finished" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mt-4"
          >
            <button
              onClick={handleStartNew}
              className="flex-1 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-display font-bold rounded-xl glow-primary active:scale-95 transition-transform"
            >
              NEW MATCH
            </button>
            <button
              onClick={onHome}
              className="flex-1 py-3 bg-muted text-foreground font-display font-bold rounded-xl active:scale-95 transition-transform"
            >
              HOME
            </button>
          </motion.div>
        )}

        {/* Reset during game */}
        {game.phase !== "not_started" && game.phase !== "finished" && (
          <button
            onClick={handleStartNew}
            className="text-xs text-muted-foreground underline self-center mt-1 active:scale-95"
          >
            Reset Match
          </button>
        )}
      </div>
    </div>
  );
}
