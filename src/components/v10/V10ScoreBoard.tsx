/**
 * V10 LED Scoreboard — scoreboard-metal material with animated run counters
 */
import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameState, BallResult } from "@/hooks/useHandCricket";

interface V10ScoreBoardProps {
  game: GameState;
  playerName?: string;
  aiName?: string;
  aiEmoji?: string;
  isPvP?: boolean;
}

function getOvers(balls: number): string {
  const f = Math.floor(balls / 6);
  const r = balls % 6;
  return r === 0 && balls > 0 ? `${f}.0` : `${f}.${r}`;
}

function getRunRate(score: number, balls: number): string {
  if (balls === 0) return "0.00";
  return ((score / balls) * 6).toFixed(2);
}

function getRequiredRate(needed: number, ballsLeft: number): string | null {
  if (needed <= 0 || ballsLeft <= 0) return null;
  return ((needed / ballsLeft) * 6).toFixed(2);
}

function getCurrentInningsBalls(ballHistory: BallResult[], currentInnings: 1 | 2, innings1Balls: number): BallResult[] {
  if (currentInnings === 1) return ballHistory;
  return ballHistory.slice(innings1Balls);
}

/* LED digit with glow */
function LEDDigit({ value, color = "hsl(142 80% 55%)" }: { value: string; color?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.3, scale: 1.2 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className="font-score font-black tabular-nums"
      style={{
        color,
        textShadow: `0 0 12px ${color}, 0 0 30px ${color}40, 0 2px 4px rgba(0,0,0,0.6)`,
      }}
    >
      {value}
    </motion.span>
  );
}

/* Over dot */
function V10OverDot({ ball }: { ball: BallResult | null }) {
  if (!ball) {
    return <div className="w-6 h-6 rounded-full" style={{ border: "1.5px dashed rgba(255,255,255,0.08)" }} />;
  }
  const isOut = ball.runs === "OUT";
  const absRuns = typeof ball.runs === "number" ? Math.abs(ball.runs) : 0;
  const isSix = !isOut && absRuns >= 6;
  const isFour = !isOut && absRuns >= 4;

  const cfg = isOut
    ? { bg: "rgba(239,68,68,0.3)", border: "rgba(239,68,68,0.6)", color: "#EF4444", glow: "0 0 8px rgba(239,68,68,0.4)" }
    : isSix
    ? { bg: "rgba(168,85,247,0.3)", border: "rgba(168,85,247,0.6)", color: "#A855F7", glow: "0 0 8px rgba(168,85,247,0.4)" }
    : isFour
    ? { bg: "rgba(234,179,8,0.3)", border: "rgba(234,179,8,0.6)", color: "#EAB308", glow: "0 0 8px rgba(234,179,8,0.4)" }
    : absRuns === 0
    ? { bg: "rgba(0,0,0,0.4)", border: "rgba(255,255,255,0.08)", color: "#64748B", glow: "none" }
    : { bg: "rgba(74,222,80,0.15)", border: "rgba(74,222,80,0.3)", color: "#4ADE50", glow: "none" };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className="w-6 h-6 rounded-full flex items-center justify-center font-score text-[9px] font-bold"
      style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, color: cfg.color, boxShadow: cfg.glow }}
    >
      {isOut ? "W" : absRuns > 0 ? absRuns : "•"}
    </motion.div>
  );
}

export default function V10ScoreBoard({ game, playerName = "You", aiName = "Rohit AI", aiEmoji = "🏏", isPvP = false }: V10ScoreBoardProps) {
  const currentInningsBalls = useMemo(
    () => getCurrentInningsBalls(game.ballHistory, game.currentInnings, game.innings1Balls || 0),
    [game.ballHistory, game.currentInnings, game.innings1Balls]
  );

  const inningsBallCount = currentInningsBalls.length;
  const oversStr = getOvers(inningsBallCount);
  const config = game.config || { overs: null, wickets: 1 };
  const totalOvers = config.overs;
  const totalBallsInInnings = totalOvers ? totalOvers * 6 : null;
  const ballsLeft = totalBallsInInnings ? Math.max(0, totalBallsInInnings - inningsBallCount) : null;
  const battingScore = game.isBatting ? game.userScore : game.aiScore;
  const runRate = getRunRate(battingScore, inningsBallCount);

  const needRuns = game.target && game.isBatting && game.phase !== "finished"
    ? Math.max(0, game.target - game.userScore) : null;
  const requiredRR = needRuns !== null && ballsLeft !== null ? getRequiredRate(needRuns, ballsLeft) : null;
  const chasePct = game.target ? Math.min((game.userScore / game.target) * 100, 100) : 0;

  const currentOverBalls = useMemo(() => {
    const overStart = Math.floor((inningsBallCount - 1) / 6) * 6;
    return currentInningsBalls.slice(Math.max(0, overStart));
  }, [currentInningsBalls, inningsBallCount]);

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
      {/* Innings switch overlay */}
      <AnimatePresence>
        {showInningsSwitch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 backdrop-blur-md" style={{ background: "linear-gradient(135deg, rgba(10,15,30,0.95), rgba(20,30,50,0.95))" }} />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", damping: 12 }} className="relative z-10 text-center">
              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6, repeat: 3 }} className="text-3xl block mb-1">🔄</motion.span>
              <p className="font-display text-xl font-black tracking-[0.3em] text-white">INNINGS SWITCH</p>
              <p className="text-[10px] font-display font-bold tracking-wider mt-2 text-muted-foreground">
                {game.isBatting ? "🏏 YOU BAT NOW" : "🎯 YOU BOWL NOW"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Scoreboard — Scoreboard Metal ── */}
      <div className="rounded-2xl overflow-hidden scoreboard-metal" style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.04)",
      }}>
        {/* Header strip */}
        <div className="flex items-center justify-between px-3 py-1.5" style={{
          background: "linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-3 rounded-full" style={{
              background: "linear-gradient(180deg, #4ADE50, #22C55E)",
              boxShadow: "0 0 6px #4ADE50",
            }} />
            <span className="text-[8px] font-display tracking-[0.2em] font-bold text-white/80">{phaseLabel()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {totalOvers && <span className="text-[7px] font-body font-bold text-white/40">{totalOvers} OV</span>}
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[7px] font-display font-bold tracking-widest text-red-400">LIVE</span>
            </div>
          </div>
        </div>

        {/* Scores area */}
        <div className="px-3 py-3">
          {/* Role badge */}
          <div className="flex justify-center mb-2">
            <motion.div
              key={game.isBatting ? "bat" : "bowl"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[8px] font-display font-black tracking-[0.2em] px-3 py-1 rounded-full"
              style={{
                background: game.isBatting
                  ? "linear-gradient(135deg, rgba(74,222,80,0.15), rgba(74,222,80,0.03))"
                  : "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.03))",
                border: `1px solid ${game.isBatting ? "rgba(74,222,80,0.25)" : "rgba(59,130,246,0.25)"}`,
                color: game.isBatting ? "#4ADE50" : "#60A5FA",
              }}
            >
              {game.isBatting ? "🏏 BATTING" : "🎯 BOWLING"}
            </motion.div>
          </div>

          {/* LED Score display */}
          <div className="flex items-center justify-between">
            {/* Player */}
            <div className="flex-1 text-center">
              <p className="text-[7px] font-display font-bold tracking-[0.15em] mb-1 text-white/40">
                {playerName.toUpperCase().slice(0, 10)}
              </p>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-[32px] leading-none">
                  <LEDDigit value={String(game.userScore)} color="hsl(142 80% 55%)" />
                </span>
                <span className="text-sm font-score font-bold text-white/30">/{game.userWickets}</span>
              </div>
            </div>

            {/* Center overs */}
            <div className="flex flex-col items-center px-3">
              <div className="w-px h-5 mb-1" style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)" }} />
              <div className="px-2 py-0.5 rounded-lg" style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <span className="text-[10px] font-score font-bold text-emerald-400" style={{ textShadow: "0 0 8px rgba(74,222,80,0.5)" }}>
                  {oversStr}
                </span>
              </div>
              {totalOvers && <span className="text-[7px] font-body text-white/25 mt-0.5">/{totalOvers} ov</span>}
            </div>

            {/* Opponent */}
            <div className="flex-1 text-center">
              <p className="text-[7px] font-display font-bold tracking-[0.15em] mb-1 text-white/40">
                {aiName.toUpperCase().slice(0, 10)}
              </p>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-[32px] leading-none">
                  <LEDDigit value={String(game.aiScore)} color="hsl(210 80% 65%)" />
                </span>
                <span className="text-sm font-score font-bold text-white/30">/{game.aiWickets}</span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{
              background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span className="text-[7px] font-display font-bold text-white/30">CRR</span>
              <span className="text-[9px] font-score font-bold text-emerald-400">{runRate}</span>
            </div>
            {requiredRR && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
              }}>
                <span className="text-[7px] font-display font-bold text-white/30">RRR</span>
                <span className="text-[9px] font-score font-bold" style={{
                  color: parseFloat(requiredRR) > 15 ? "#EF4444" : "#EAB308",
                }}>{requiredRR}</span>
              </div>
            )}
          </div>

          {/* Chase tracker */}
          {game.target && game.phase !== "finished" && game.isBatting && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[7px] font-display font-bold tracking-wider text-amber-400">🎯 TARGET: {game.target}</span>
                {needRuns !== null && (
                  <span className="text-[7px] font-display font-bold" style={{ color: needRuns <= 10 ? "#EF4444" : "#4ADE50" }}>
                    NEED {needRuns}{ballsLeft !== null ? ` off ${ballsLeft}` : ""}
                  </span>
                )}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.5)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #15803D, #4ADE50, #86EFAC)" }}
                  animate={{ width: `${chasePct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Over tracker */}
        <div className="px-3 py-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.03)", background: "rgba(0,0,0,0.25)" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[6px] font-display font-bold tracking-[0.2em] text-white/25">THIS OVER</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }} />
            <span className="text-[6px] font-body text-white/20">{inningsBallCount} balls</span>
          </div>
          <div className="flex gap-1">
            {currentOverBalls.map((b, i) => <V10OverDot key={`${game.currentInnings}-${i}`} ball={b} />)}
            {currentOverBalls.length < 6 && Array.from({ length: 6 - currentOverBalls.length }).map((_, i) => (
              <V10OverDot key={`e-${i}`} ball={null} />
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
            className="rounded-2xl text-center py-3 font-display font-black text-lg scoreboard-metal"
            style={{
              borderBottom: game.result === "win" ? "4px solid #22C55E" : game.result === "loss" ? "4px solid #EF4444" : "4px solid #EAB308",
              boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 30px ${game.result === "win" ? "rgba(74,222,80,0.15)" : game.result === "loss" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)"}`,
            }}
          >
            <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} className="text-2xl block mb-0.5">
              {game.result === "win" ? "🏆" : game.result === "loss" ? "💔" : "🤝"}
            </motion.span>
            <span className="tracking-widest text-base" style={{
              color: game.result === "win" ? "#4ADE50" : game.result === "loss" ? "#EF4444" : "#EAB308",
              textShadow: `0 0 20px currentColor`,
            }}>
              {game.result === "win" && `${playerName.toUpperCase()} WINS!`}
              {game.result === "loss" && `${aiName.toUpperCase()} WINS!`}
              {game.result === "draw" && "IT'S A DRAW!"}
            </span>
            <p className="text-[10px] font-normal mt-0.5 text-white/40">
              <span className="font-bold text-emerald-400">{playerName} {game.userScore}/{game.userWickets}</span>
              <span className="mx-2">vs</span>
              <span className="font-bold text-white/70">{aiName} {game.aiScore}/{game.aiWickets}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
