import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameState, BallResult } from "@/hooks/useHandCricket";

interface ScoreBoardProps {
  game: GameState;
  playerName?: string;
  aiName?: string;
  aiEmoji?: string;
  isPvP?: boolean;
}

function getCurrentInningsBalls(ballHistory: BallResult[], currentInnings: 1 | 2, innings1Balls: number): BallResult[] {
  if (currentInnings === 1) return ballHistory;
  return ballHistory.slice(innings1Balls);
}

function getOvers(balls: number): string {
  const fullOvers = Math.floor(balls / 6);
  const remaining = balls % 6;
  return remaining === 0 && balls > 0 ? `${fullOvers}.0` : `${fullOvers}.${remaining}`;
}

function getRunRate(score: number, balls: number): string {
  if (balls === 0) return "0.00";
  return ((score / balls) * 6).toFixed(2);
}

function getRequiredRate(needed: number, ballsLeft: number): string | null {
  if (needed <= 0 || ballsLeft <= 0) return null;
  return ((needed / ballsLeft) * 6).toFixed(2);
}

export default function ScoreBoard({ game, playerName = "You", aiName = "Rohit AI", aiEmoji = "🏏", isPvP = false }: ScoreBoardProps) {
  const currentInningsBalls = useMemo(
    () => getCurrentInningsBalls(game.ballHistory, game.currentInnings, game.innings1Balls || 0),
    [game.ballHistory, game.currentInnings, game.innings1Balls]
  );

  const inningsBallCount = currentInningsBalls.length;
  const oversStr = getOvers(inningsBallCount);

  const currentOverBalls = useMemo(() => {
    const overStart = Math.floor((inningsBallCount - 1) / 6) * 6;
    return currentInningsBalls.slice(Math.max(0, overStart));
  }, [currentInningsBalls, inningsBallCount]);

  const config = game.config || { overs: null, wickets: 1 };
  const totalOvers = config.overs;
  const totalBallsInInnings = totalOvers ? totalOvers * 6 : null;
  const ballsLeft = totalBallsInInnings ? Math.max(0, totalBallsInInnings - inningsBallCount) : null;

  const battingScore = game.isBatting ? game.userScore : game.aiScore;
  const runRate = getRunRate(battingScore, inningsBallCount);

  const needRuns = game.target && game.isBatting && game.phase !== "finished"
    ? Math.max(0, game.target - game.userScore)
    : null;

  const requiredRR = needRuns !== null && ballsLeft !== null
    ? getRequiredRate(needRuns, ballsLeft)
    : null;

  const chasePct = game.target ? Math.min((game.userScore / game.target) * 100, 100) : 0;

  const prevInningsRef = useRef(game.currentInnings);
  const [showInningsSwitch, setShowInningsSwitch] = useState(false);

  useEffect(() => {
    if (game.currentInnings !== prevInningsRef.current && game.currentInnings === 2) {
      prevInningsRef.current = game.currentInnings;
      setShowInningsSwitch(true);
      setTimeout(() => setShowInningsSwitch(false), 2800);
    }
    prevInningsRef.current = game.currentInnings;
  }, [game.currentInnings]);

  const phaseLabel = () => {
    switch (game.phase) {
      case "first_batting": case "first_bowling": return "1ST INNINGS";
      case "second_batting": case "second_bowling": return "2ND INNINGS";
      case "finished": return "MATCH OVER";
      default: return "READY";
    }
  };

  return (
    <div className="space-y-1.5 relative">
      {/* INNINGS SWITCH overlay */}
      <AnimatePresence>
        {showInningsSwitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl overflow-hidden pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 backdrop-blur-md"
              style={{
                background: "linear-gradient(135deg, hsl(var(--grass-dark)), hsl(var(--scoreboard-dark)), hsl(var(--grass-dark)))",
              }}
            />
            <motion.div
              initial={{ scale: 0, rotateZ: -5 }}
              animate={{ scale: 1, rotateZ: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="relative z-10 text-center"
            >
              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6, repeat: 3 }} className="text-3xl block mb-1">🔄</motion.span>
              <p className="font-display text-xl font-black tracking-[0.3em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                style={{ color: "hsl(var(--chalk-white))" }}>INNINGS SWITCH</p>
              <p className="font-display text-[10px] font-bold tracking-wider mt-2"
                style={{ color: "hsl(var(--scoreboard-text))" }}>
                {game.isBatting ? "🏏 YOU BAT NOW" : "🎯 YOU BOWL NOW"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Scoreboard Card — Scoreboard Paint Material ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(var(--scoreboard-dark)), hsl(var(--scoreboard-mid)))",
          border: "2px solid hsl(var(--chrome-dark) / 0.6)",
          boxShadow: "inset 0 1px 0 hsl(var(--chrome-light) / 0.08), 0 6px 20px hsl(0 0% 0% / 0.5), 0 2px 4px hsl(0 0% 0% / 0.3)",
        }}
      >
        {/* Header strip — chrome frame */}
        <div className="flex items-center justify-between px-3 py-1.5"
          style={{
            background: "linear-gradient(90deg, hsl(var(--chrome-dark) / 0.4), hsl(var(--chrome-mid) / 0.15), hsl(var(--chrome-dark) / 0.4))",
            borderBottom: "1px solid hsl(var(--chrome-dark) / 0.5)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-3 rounded-full" style={{
              background: "hsl(var(--grass-light))",
              boxShadow: "0 0 6px hsl(var(--grass-light) / 0.5)",
            }} />
            <span className="text-[8px] font-display tracking-[0.15em] font-bold"
              style={{ color: "hsl(var(--scoreboard-text))" }}>{phaseLabel()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {totalOvers && <span className="text-[7px] font-body font-bold" style={{ color: "hsl(var(--chrome-mid))" }}>{totalOvers} OV</span>}
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
              style={{
                background: "hsl(var(--leather-dark) / 0.4)",
                border: "1px solid hsl(var(--leather-highlight) / 0.3)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(var(--destructive))" }} />
              <span className="text-[7px] font-display font-bold tracking-widest" style={{ color: "hsl(var(--leather-highlight))" }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Scores area */}
        <div className="px-3 py-2.5">
          {/* Role banner — jersey mesh style */}
          <div className="flex justify-center mb-2">
            <motion.div
              key={game.isBatting ? "bat" : "bowl"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[8px] font-display font-black tracking-[0.2em] px-3 py-1 rounded-full"
              style={{
                background: game.isBatting
                  ? "linear-gradient(135deg, hsl(var(--secondary) / 0.2), hsl(var(--secondary) / 0.08))"
                  : "linear-gradient(135deg, hsl(var(--grass-mid) / 0.3), hsl(var(--grass-mid) / 0.1))",
                border: game.isBatting
                  ? "1px solid hsl(var(--secondary) / 0.3)"
                  : "1px solid hsl(var(--grass-light) / 0.3)",
                color: game.isBatting ? "hsl(var(--secondary))" : "hsl(var(--grass-light))",
                borderBottom: game.isBatting
                  ? "2px solid hsl(var(--secondary) / 0.4)"
                  : "2px solid hsl(var(--grass-light) / 0.4)",
              }}
            >
              {game.isBatting ? "🏏 YOU'RE BATTING" : "🎯 YOU'RE BOWLING"}
            </motion.div>
          </div>

          {/* Two-side score layout */}
          <div className="flex items-center justify-between">
            {/* Player */}
            <div className="flex-1 text-center">
              <p className="text-[7px] font-display font-bold tracking-[0.15em] mb-0.5"
                style={{ color: "hsl(var(--chrome-mid))" }}>
                {playerName.toUpperCase().slice(0, 10)}
              </p>
              <motion.div key={`p-${game.userScore}`} initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                className="flex items-baseline justify-center gap-0.5">
                <span className="font-display text-3xl font-black leading-none"
                  style={{
                    color: "hsl(var(--scoreboard-text))",
                    textShadow: "0 0 15px hsl(var(--secondary) / 0.3), 0 2px 4px rgba(0,0,0,0.5)",
                  }}>
                  {game.userScore}
                </span>
                <span className="text-sm font-display font-bold" style={{ color: "hsl(var(--leather-highlight) / 0.8)" }}>/{game.userWickets}</span>
              </motion.div>
            </div>

            {/* Center — chalk divider */}
            <div className="flex flex-col items-center px-3">
              <div className="w-px h-6 mb-1" style={{
                background: "linear-gradient(180deg, transparent, hsl(var(--chalk-white) / 0.3), transparent)",
              }} />
              <span className="text-[9px] font-display font-bold tracking-wider"
                style={{ color: "hsl(var(--grass-light))" }}>{oversStr}</span>
              {totalOvers && <span className="text-[7px] font-body" style={{ color: "hsl(var(--chrome-mid) / 0.6)" }}>/{totalOvers} ov</span>}
            </div>

            {/* Opponent */}
            <div className="flex-1 text-center">
              <p className="text-[7px] font-display font-bold tracking-[0.15em] mb-0.5"
                style={{ color: "hsl(var(--chrome-mid))" }}>
                {aiName.toUpperCase().slice(0, 10)}
              </p>
              <motion.div key={`a-${game.aiScore}`} initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                className="flex items-baseline justify-center gap-0.5">
                <span className="font-display text-3xl font-black leading-none"
                  style={{
                    color: "hsl(var(--chalk-white))",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}>
                  {game.aiScore}
                </span>
                <span className="text-sm font-display font-bold" style={{ color: "hsl(var(--leather-highlight) / 0.8)" }}>/{game.aiWickets}</span>
              </motion.div>
            </div>
          </div>

          {/* Stats pills — chrome framed */}
          <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                background: "hsl(var(--grass-dark) / 0.4)",
                border: "1px solid hsl(var(--grass-mid) / 0.3)",
              }}
            >
              <span className="text-[7px] font-display font-bold" style={{ color: "hsl(var(--chrome-mid))" }}>CRR</span>
              <span className="text-[8px] font-display font-bold" style={{ color: "hsl(var(--grass-light))" }}>{runRate}</span>
            </div>
            {requiredRR && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  background: "hsl(var(--leather-dark) / 0.4)",
                  border: "1px solid hsl(var(--leather-highlight) / 0.3)",
                }}
              >
                <span className="text-[7px] font-display font-bold" style={{ color: "hsl(var(--chrome-mid))" }}>RRR</span>
                <span className="text-[8px] font-display font-bold" style={{ color: "hsl(var(--leather-highlight))" }}>{requiredRR}</span>
              </div>
            )}
          </div>

          {/* Chase tracker */}
          {game.target && game.phase !== "finished" && game.isBatting && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[7px] font-display font-bold tracking-wider"
                  style={{ color: "hsl(var(--secondary))" }}>🎯 TARGET: {game.target}</span>
                {needRuns !== null && (
                  <span className="text-[7px] font-display font-bold"
                    style={{ color: "hsl(var(--grass-light))" }}>NEED {needRuns}</span>
                )}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--scoreboard-dark))" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(var(--grass-mid)), hsl(var(--secondary)), hsl(var(--grass-light)))" }}
                  animate={{ width: `${chasePct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── This Over Strip — chalk-on-scoreboard ── */}
        <div className="px-3 py-1.5"
          style={{
            borderTop: "1px solid hsl(var(--chalk-white) / 0.06)",
            background: "hsl(var(--scoreboard-dark) / 0.5)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[6px] font-display font-bold tracking-[0.2em]"
              style={{ color: "hsl(var(--chrome-mid) / 0.6)" }}>THIS OVER</span>
            <div className="flex-1 h-px" style={{ background: "hsl(var(--chalk-white) / 0.06)" }} />
            <span className="text-[6px] font-body" style={{ color: "hsl(var(--chrome-mid) / 0.4)" }}>{inningsBallCount} balls</span>
          </div>
          <div className="flex gap-1">
            {currentOverBalls.map((b, i) => {
              const isOut = b.runs === "OUT";
              const absRuns = typeof b.runs === "number" ? Math.abs(b.runs) : 0;
              const isSix = !isOut && absRuns >= 6;
              const isFour = !isOut && absRuns >= 4;

              let bg: string, border: string, color: string, shadow: string;
              if (isOut) {
                bg = "hsl(var(--leather-mid) / 0.4)";
                border = "hsl(var(--leather-highlight) / 0.5)";
                color = "hsl(var(--leather-highlight))";
                shadow = "0 0 8px hsl(var(--leather-mid) / 0.3)";
              } else if (isSix) {
                bg = "hsl(var(--secondary) / 0.25)";
                border = "hsl(var(--secondary) / 0.5)";
                color = "hsl(var(--secondary))";
                shadow = "0 0 8px hsl(var(--secondary) / 0.3)";
              } else if (isFour) {
                bg = "hsl(var(--grass-mid) / 0.3)";
                border = "hsl(var(--grass-light) / 0.5)";
                color = "hsl(var(--grass-light))";
                shadow = "0 0 8px hsl(var(--grass-mid) / 0.3)";
              } else if (absRuns === 0) {
                bg = "hsl(var(--concrete-dark) / 0.4)";
                border = "hsl(var(--chrome-dark) / 0.3)";
                color = "hsl(var(--chrome-mid) / 0.4)";
                shadow = "none";
              } else {
                bg = "hsl(var(--grass-dark) / 0.3)";
                border = "hsl(var(--grass-mid) / 0.3)";
                color = "hsl(var(--grass-light))";
                shadow = "none";
              }

              return (
                <motion.div
                  key={`${game.currentInnings}-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-display font-black"
                  style={{
                    background: bg,
                    border: `2px solid ${border}`,
                    color,
                    boxShadow: shadow,
                  }}
                >
                  {isOut ? "W" : absRuns > 0 ? absRuns : "•"}
                </motion.div>
              );
            })}
            {currentOverBalls.length < 6 && Array.from({ length: 6 - currentOverBalls.length }).map((_, i) => (
              <div key={`e-${i}`} className="w-7 h-7 rounded-full"
                style={{ border: "1px dashed hsl(var(--chrome-dark) / 0.2)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {game.phase === "finished" && game.result && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 10 }}
            className="rounded-2xl text-center py-3 font-display font-black text-lg"
            style={{
              background: game.result === "win"
                ? "linear-gradient(180deg, hsl(var(--grass-dark) / 0.5), hsl(var(--grass-mid) / 0.2))"
                : game.result === "loss"
                ? "linear-gradient(180deg, hsl(var(--leather-dark) / 0.5), hsl(var(--leather-mid) / 0.2))"
                : "linear-gradient(180deg, hsl(var(--secondary) / 0.2), hsl(var(--secondary) / 0.08))",
              border: game.result === "win"
                ? "2px solid hsl(var(--grass-light) / 0.4)"
                : game.result === "loss"
                ? "2px solid hsl(var(--leather-highlight) / 0.3)"
                : "2px solid hsl(var(--secondary) / 0.3)",
              borderBottom: game.result === "win"
                ? "4px solid hsl(var(--grass-light) / 0.5)"
                : game.result === "loss"
                ? "4px solid hsl(var(--leather-highlight) / 0.4)"
                : "4px solid hsl(var(--secondary) / 0.4)",
              color: game.result === "win"
                ? "hsl(var(--grass-light))"
                : game.result === "loss"
                ? "hsl(var(--leather-highlight))"
                : "hsl(var(--secondary))",
            }}
          >
            <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} className="text-2xl block mb-0.5">
              {game.result === "win" ? "🏆" : game.result === "loss" ? "💔" : "🤝"}
            </motion.span>
            <span className="tracking-widest text-base" style={{ textShadow: "0 0 20px currentColor" }}>
              {game.result === "win" && `${playerName.toUpperCase()} WINS!`}
              {game.result === "loss" && `${aiName.toUpperCase()} WINS!`}
              {game.result === "draw" && "IT'S A DRAW!"}
            </span>
            <p className="text-[10px] font-normal mt-0.5" style={{ color: "hsl(var(--chrome-light) / 0.6)" }}>
              <span className="font-bold" style={{ color: "hsl(var(--secondary))" }}>{playerName} {game.userScore}/{game.userWickets}</span>
              <span className="mx-2">vs</span>
              <span className="font-bold" style={{ color: "hsl(var(--chalk-white))" }}>{aiName} {game.aiScore}/{game.aiWickets}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
