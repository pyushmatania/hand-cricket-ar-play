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

/* ── Over Dot Component per Doc 1 §2.7 ── */
function OverDot({ ball, index }: { ball: BallResult | null; index: number }) {
  if (!ball) {
    return (
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
      />
    );
  }

  const isOut = ball.runs === "OUT";
  const absRuns = typeof ball.runs === "number" ? Math.abs(ball.runs) : 0;
  const isSix = !isOut && absRuns >= 6;
  const isFour = !isOut && absRuns >= 4;

  let bg: string, border: string, color: string, shadow: string;
  if (isOut) {
    bg = "rgba(239,68,68,0.25)";
    border = "rgba(239,68,68,0.5)";
    color = "#EF4444";
    shadow = "0 0 8px rgba(239,68,68,0.3)";
  } else if (isSix) {
    bg = "rgba(234,179,8,0.25)";
    border = "rgba(234,179,8,0.5)";
    color = "#EAB308";
    shadow = "0 0 8px rgba(234,179,8,0.3)";
  } else if (isFour) {
    bg = "rgba(74,222,80,0.25)";
    border = "rgba(74,222,80,0.5)";
    color = "#4ADE50";
    shadow = "0 0 8px rgba(74,222,80,0.3)";
  } else if (absRuns === 0) {
    bg = "rgba(0,0,0,0.3)";
    border = "rgba(255,255,255,0.1)";
    color = "#64748B";
    shadow = "none";
  } else {
    bg = "rgba(59,130,246,0.15)";
    border = "rgba(59,130,246,0.3)";
    color = "#60A5FA";
    shadow = "none";
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="w-7 h-7 rounded-full flex items-center justify-center font-score text-[10px] font-bold"
      style={{ background: bg, border: `2px solid ${border}`, color, boxShadow: shadow }}
    >
      {isOut ? "W" : absRuns > 0 ? absRuns : "•"}
    </motion.div>
  );
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

  const battingTeamName = game.isBatting ? playerName : aiName;
  const battingTeamScore = game.isBatting ? game.userScore : game.aiScore;
  const battingTeamWickets = game.isBatting ? game.userWickets : game.aiWickets;

  return (
    <div className="space-y-1.5 relative">
      {/* INNINGS SWITCH overlay */}
      <AnimatePresence>
        {showInningsSwitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center rounded-xl overflow-hidden pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 backdrop-blur-md"
              style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}
            />
            <motion.div
              initial={{ scale: 0, rotateZ: -5 }}
              animate={{ scale: 1, rotateZ: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="relative z-10 text-center"
            >
              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6, repeat: 3 }} className="text-3xl block mb-1">🔄</motion.span>
              <p className="font-display text-xl font-black tracking-[0.3em] text-white drop-shadow-lg">INNINGS SWITCH</p>
              <p className="font-display text-[10px] font-bold tracking-wider mt-2 text-[#94A3B8]">
                {game.isBatting ? "🏏 YOU BAT NOW" : "🎯 YOU BOWL NOW"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Scoreboard — Doc 1 §3.6 ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))",
          border: "3px solid hsl(var(--team-primary))",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Chrome bracket corners */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/20 z-10" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/20 z-10" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/20 z-10" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20 z-10" />

          {/* Line 1: Main Score Header */}
          <div
            className="flex items-center justify-between px-3 py-1.5"
            style={{
              background: "rgba(0,0,0,0.3)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-3 rounded-full bg-[var(--green-play)]" style={{ boxShadow: "0 0 6px var(--green-play)" }} />
              <span className="text-[8px] font-display tracking-[0.15em] font-bold text-white">{phaseLabel()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {totalOvers && <span className="text-[7px] font-body font-bold text-[#94A3B8]">{totalOvers} OV</span>}
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                <span className="text-[7px] font-display font-bold tracking-widest text-[#EF4444]">LIVE</span>
              </div>
            </div>
          </div>

          {/* Scores — Doc 1: Rubik 900, 28px */}
          <div className="px-3 py-2.5">
            {/* Role banner */}
            <div className="flex justify-center mb-2">
              <motion.div
                key={game.isBatting ? "bat" : "bowl"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[8px] font-display font-black tracking-[0.2em] px-3 py-1 rounded-full text-white"
                style={{
                  background: game.isBatting
                    ? "linear-gradient(135deg, rgba(74,222,80,0.2), rgba(74,222,80,0.05))"
                    : "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))",
                  border: game.isBatting
                    ? "1px solid rgba(74,222,80,0.3)"
                    : "1px solid rgba(59,130,246,0.3)",
                  borderBottom: game.isBatting
                    ? "2px solid rgba(74,222,80,0.4)"
                    : "2px solid rgba(59,130,246,0.4)",
                }}
              >
                {game.isBatting ? "🏏 YOU'RE BATTING" : "🎯 YOU'RE BOWLING"}
              </motion.div>
            </div>

            {/* Two-side score — Doc 1: team abbreviation in Bungee 14px, score in Rubik 900 28px */}
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-[7px] font-heading font-bold tracking-[0.15em] mb-0.5 text-[#94A3B8]">
                  {playerName.toUpperCase().slice(0, 10)}
                </p>
                <motion.div key={`p-${game.userScore}`} initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                  className="flex items-baseline justify-center gap-0.5">
                  <span
                    className="font-score text-[28px] font-black leading-none text-white"
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5), 0 0 15px rgba(74,222,80,0.2)" }}
                  >
                    {game.userScore}
                  </span>
                  <span className="text-sm font-score font-bold text-[#94A3B8]">/{game.userWickets}</span>
                </motion.div>
              </div>

              {/* Center divider */}
              <div className="flex flex-col items-center px-3">
                <div className="w-px h-6 mb-1" style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)" }} />
                <span className="text-[9px] font-score font-bold tracking-wider text-[var(--green-play)]">{oversStr}</span>
                {totalOvers && <span className="text-[7px] font-body text-[#64748B]">/{totalOvers} ov</span>}
              </div>

              {/* Opponent */}
              <div className="flex-1 text-center">
                <p className="text-[7px] font-heading font-bold tracking-[0.15em] mb-0.5 text-[#94A3B8]">
                  {aiName.toUpperCase().slice(0, 10)}
                </p>
                <motion.div key={`a-${game.aiScore}`} initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                  className="flex items-baseline justify-center gap-0.5">
                  <span
                    className="font-score text-[28px] font-black leading-none text-white"
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
                  >
                    {game.aiScore}
                  </span>
                  <span className="text-sm font-score font-bold text-[#94A3B8]">/{game.aiWickets}</span>
                </motion.div>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,80,0.1)", border: "1px solid rgba(74,222,80,0.2)" }}>
                <span className="text-[7px] font-display font-bold text-[#94A3B8]">CRR</span>
                <span className="text-[8px] font-score font-bold text-[var(--green-play)]">{runRate}</span>
              </div>
              {requiredRR && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <span className="text-[7px] font-display font-bold text-[#94A3B8]">RRR</span>
                  <span className="text-[8px] font-score font-bold" style={{ color: parseFloat(requiredRR) > 15 ? "#EF4444" : "#EAB308" }}>{requiredRR}</span>
                </div>
              )}
            </div>

            {/* Chase tracker — Doc 1: target info with team accent */}
            {game.target && game.phase !== "finished" && game.isBatting && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[7px] font-display font-bold tracking-wider text-[#EAB308]">🎯 TARGET: {game.target}</span>
                  {needRuns !== null && (
                    <span className="text-[7px] font-display font-bold" style={{ color: needRuns <= 10 ? "#EF4444" : "var(--green-play)" }}>
                      NEED {needRuns}{ballsLeft !== null ? ` off ${ballsLeft}` : ""}
                    </span>
                  )}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, var(--green-play-dark), var(--green-play), var(--green-play-light))" }}
                    animate={{ width: `${chasePct}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Line 3: Over Tracker — Doc 1 §2.7 ── */}
          <div
            className="px-3 py-1.5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.2)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[6px] font-display font-bold tracking-[0.2em] text-[#64748B]">THIS OVER</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
              <span className="text-[6px] font-body text-[#475569]">{inningsBallCount} balls</span>
            </div>
            <div className="flex gap-1">
              {currentOverBalls.map((b, i) => (
                <OverDot key={`${game.currentInnings}-${i}`} ball={b} index={i} />
              ))}
              {currentOverBalls.length < 6 &&
                Array.from({ length: 6 - currentOverBalls.length }).map((_, i) => (
                  <OverDot key={`e-${i}`} ball={null} index={currentOverBalls.length + i} />
                ))}
            </div>
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
            className="rounded-xl text-center py-3 font-display font-black text-lg"
            style={{
              background: game.result === "win"
                ? "linear-gradient(180deg, rgba(74,222,80,0.2), rgba(74,222,80,0.05))"
                : game.result === "loss"
                ? "linear-gradient(180deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))"
                : "linear-gradient(180deg, rgba(234,179,8,0.2), rgba(234,179,8,0.05))",
              border: game.result === "win"
                ? "2px solid rgba(74,222,80,0.4)"
                : game.result === "loss"
                ? "2px solid rgba(239,68,68,0.3)"
                : "2px solid rgba(234,179,8,0.3)",
              borderBottom: game.result === "win"
                ? "4px solid rgba(74,222,80,0.5)"
                : game.result === "loss"
                ? "4px solid rgba(239,68,68,0.4)"
                : "4px solid rgba(234,179,8,0.4)",
              color: game.result === "win" ? "var(--green-play)" : game.result === "loss" ? "#EF4444" : "#EAB308",
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
            <p className="text-[10px] font-normal mt-0.5 text-[#94A3B8]">
              <span className="font-bold text-[var(--green-play)]">{playerName} {game.userScore}/{game.userWickets}</span>
              <span className="mx-2">vs</span>
              <span className="font-bold text-white">{aiName} {game.aiScore}/{game.aiWickets}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
