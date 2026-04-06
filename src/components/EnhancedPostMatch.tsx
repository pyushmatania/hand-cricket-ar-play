import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SFX } from "@/lib/sounds";
import { CrowdSFX } from "@/lib/voiceCommentary";
import { playElevenLabsMusic, playElevenLabsSFX, stopMusic, isElevenLabsAvailable, ElevenLabsSFXPrompts, speakDuoLines } from "@/lib/elevenLabsAudio";
import { useSettings } from "@/contexts/SettingsContext";
import {
  pickMatchCommentators, type Commentator, type CommentaryLine,
  getPostMatchResultLines, getPostMatchStatsLines, getPostMatchVerdictLines, getPostMatchRivalryLines,
} from "@/lib/commentaryDuo";
import WagonWheel from "./WagonWheel";
import TrophyCeremony from "./TrophyCeremony";
import type { BallResult } from "@/hooks/useHandCricket";
import victoryTrophy from "@/assets/victory-trophy.png";
import V10Button from "./shared/V10Button";
import ShareButton from "./share/ShareButton";
import MatchShareCard from "./share/MatchShareCard";
import LevelUpModal, { type MatchRewards } from "./LevelUpModal";

interface RivalryStats {
  myWins: number; theirWins: number; totalGames: number;
  myHighScore: number; theirHighScore: number;
}

interface EnhancedPostMatchProps {
  playerName: string;
  opponentName: string;
  result: "win" | "loss" | "draw";
  playerScore: number;
  opponentScore: number;
  playerWickets?: number;
  opponentWickets?: number;
  ballHistory: BallResult[];
  isPvP?: boolean;
  rivalryStats?: RivalryStats | null;
  commentators?: [Commentator, Commentator];
  matchRewards?: MatchRewards | null;
  onComplete: () => void;
}

function computeStats(ballHistory: BallResult[]) {
  let sixes = 0, fours = 0, threes = 0, twos = 0, singles = 0, dots = 0;
  let biggestShot = 0, battingBalls = 0, currentPartnership = 0, bestPartnership = 0;
  ballHistory.forEach(b => {
    if (b.runs === "OUT") { if (currentPartnership > bestPartnership) bestPartnership = currentPartnership; currentPartnership = 0; return; }
    const r = typeof b.runs === "number" ? b.runs : 0;
    const abs = Math.abs(r);
    if (r > 0) { battingBalls++; currentPartnership += abs; if (abs === 6) sixes++; else if (abs === 4) fours++; else if (abs === 3) threes++; else if (abs === 2) twos++; else if (abs === 1) singles++; else dots++; if (abs > biggestShot) biggestShot = abs; }
    else { dots++; battingBalls++; }
  });
  if (currentPartnership > bestPartnership) bestPartnership = currentPartnership;
  const totalBalls = ballHistory.length;
  const totalRuns = sixes * 6 + fours * 4 + threes * 3 + twos * 2 + singles;
  const strikeRate = battingBalls > 0 ? Math.round((totalRuns / battingBalls) * 100) : 0;
  const boundaryPct = totalRuns > 0 ? Math.round(((sixes * 6 + fours * 4) / totalRuns) * 100) : 0;
  return { sixes, fours, threes, twos, singles, dots, biggestShot, totalBalls, strikeRate, boundaryPct, battingBalls, bestPartnership, totalRuns };
}

function getStarRating(result: string, playerScore: number, opponentScore: number, strikeRate: number): number {
  if (result === "loss") return strikeRate > 100 ? 1 : 0;
  if (result === "draw") return 2;
  const margin = playerScore - opponentScore;
  if (margin >= 30 && strikeRate >= 150) return 3;
  if (margin >= 15 || strikeRate >= 120) return 2;
  return 1;
}

const CONFETTI_COLORS = [
  "#FFD700", "#4CAF50", "#FF6B35", "#A855F7", "#00D4FF", "#FFF",
];

function ConfettiParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(50)].map((_, i) => {
        const size = 4 + Math.random() * 6;
        const isCircle = Math.random() > 0.6;
        const isStar = !isCircle && Math.random() > 0.5;
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${Math.random() * 100}%`, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              y: "110vh",
              rotate: 360 * (Math.random() > 0.5 ? 2 : -2),
              x: `${Math.random() * 100}%`,
            }}
            transition={{ duration: 2.5 + Math.random() * 3, delay: Math.random() * 2, repeat: Infinity, ease: "linear" }}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              width: size,
              height: isCircle ? size : size * 1.5,
              borderRadius: isCircle ? "50%" : isStar ? "2px" : "1px",
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              boxShadow: `0 0 4px ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]}40`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function EnhancedPostMatch({
  playerName, opponentName, result, playerScore, opponentScore,
  playerWickets = 0, opponentWickets = 0,
  ballHistory, isPvP = false, rivalryStats, commentators, matchRewards, onComplete,
}: EnhancedPostMatchProps) {
  const [visible, setVisible] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const { voiceEnabled, soundEnabled, crowdEnabled, commentaryEnabled } = useSettings();
  const stableOnComplete = useCallback(onComplete, []);

  const duo = commentators || pickMatchCommentators();
  const stats = useMemo(() => computeStats(ballHistory), [ballHistory]);

  const isWin = result === "win";
  const isLoss = result === "loss";
  const stars = useMemo(() => getStarRating(result, playerScore, opponentScore, stats.strikeRate), [result, playerScore, opponentScore, stats.strikeRate]);

  useEffect(() => {
    if (isWin) {
      if (isElevenLabsAvailable()) playElevenLabsSFX(ElevenLabsSFXPrompts.victoryFanfare, 5);
      if (soundEnabled) SFX.victoryAnthem();
      if (crowdEnabled) CrowdSFX.victory();
      playElevenLabsMusic("Triumphant cricket victory celebration music, stadium horns, crowd cheering, drums", 25, false);
    } else if (isLoss) {
      if (soundEnabled) SFX.loss();
    } else {
      if (soundEnabled) SFX.gameStart();
    }
    const t = setTimeout(() => setShowRewards(true), 1200);
    return () => { stopMusic(); clearTimeout(t); };
  }, [isWin, isLoss, soundEnabled, crowdEnabled]);

  useEffect(() => {
    if (!voiceEnabled || !commentaryEnabled) return;
    const lines = getPostMatchResultLines(duo[0].name, duo[1].name, playerName, opponentName, result, playerScore, opponentScore);
    const keyLines = lines.filter(l => l.isKeyMoment);
    if (keyLines.length === 0) return;
    const ttsLines = keyLines.map(l => ({
      text: l.text,
      voiceId: (duo.find(c => c.name === l.commentatorId) || duo[0]).voiceId,
    }));
    speakDuoLines(ttsLines);
  }, [voiceEnabled, commentaryEnabled, duo, playerName, opponentName, result, playerScore, opponentScore]);

  const handleClose = () => {
    stopMusic();
    if (matchRewards && (matchRewards.newLevel > matchRewards.oldLevel || (matchRewards.newRankName !== matchRewards.oldRankName))) {
      setVisible(false);
      setShowLevelUp(true);
    } else {
      setVisible(false);
      setTimeout(stableOnComplete, 300);
    }
  };

  const overs = stats.totalBalls > 0 ? `${Math.floor(stats.totalBalls / 6)}.${stats.totalBalls % 6}` : "0.0";
  const runRate = stats.totalBalls > 0 ? ((stats.totalRuns / stats.totalBalls) * 6).toFixed(1) : "0.0";

  const resultBg = isWin
    ? "linear-gradient(180deg, #2A1F0E 0%, #1A1208 100%)"
    : isLoss
    ? "linear-gradient(180deg, #2D1515 0%, #1A0A0A 100%)"
    : "linear-gradient(180deg, #1E1E1E 0%, #121212 100%)";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto"
          style={{ background: resultBg }}
        >
          {isWin && <ConfettiParticles />}

          {/* Radial glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] pointer-events-none"
            style={{
              background: isWin
                ? "radial-gradient(ellipse, hsl(43 96% 56% / 0.12) 0%, transparent 70%)"
                : isLoss
                ? "radial-gradient(ellipse, hsl(4 90% 58% / 0.08) 0%, transparent 70%)"
                : "radial-gradient(ellipse, hsl(200 60% 50% / 0.08) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 flex-1 flex flex-col px-4 py-6">
            {/* ── RESULT HEADER ── */}
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="text-center pt-10 mb-2"
            >
              {isWin ? (
                <div className="mb-3">
                  <TrophyCeremony playerName={playerName} stars={stars} />
                </div>
              ) : (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 8, delay: 0.3 }}
                  className="text-7xl block mb-4"
                >
                  {isLoss ? "💔" : "🤝"}
                </motion.span>
              )}

              <motion.h1
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", damping: 10 }}
                className="font-display text-[48px] font-black tracking-wider leading-none"
                style={{
                  color: isWin ? "hsl(43 96% 56%)" : isLoss ? "hsl(4 90% 58%)" : "hsl(0 0% 100%)",
                  textShadow: isWin
                    ? "0 4px 0 hsl(43 70% 30%), 0 0 60px hsl(43 96% 56% / 0.4), 0 8px 20px rgba(0,0,0,0.5)"
                    : "0 4px 0 hsl(4 50% 25%), 0 8px 20px rgba(0,0,0,0.5)",
                  WebkitTextStroke: "1px rgba(0,0,0,0.2)",
                }}
              >
                {isWin ? "VICTORY!" : isLoss ? "DEFEAT" : "TIED!"}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="font-body text-xs text-foreground/40 mt-2 tracking-wider"
              >
                {isWin
                  ? `Won by ${playerScore - opponentScore} runs`
                  : isLoss
                  ? `Lost by ${opponentScore - playerScore} runs`
                  : "Match Tied!"}
              </motion.p>
            </motion.div>

            {/* ── STAR RATING ── */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring", damping: 12 }}
              className="flex items-center justify-center gap-1.5 mb-5"
            >
              {[1, 2, 3].map((s) => (
                <motion.span
                  key={s}
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ delay: 0.9 + s * 0.15, type: "spring" }}
                  className="text-3xl"
                  style={{ filter: s <= stars ? "drop-shadow(0 0 8px hsl(43 96% 56% / 0.6))" : "grayscale(1) opacity(0.25)" }}
                >
                  ⭐
                </motion.span>
              ))}
            </motion.div>

            {/* ── SCORECARD — scoreboard-metal ── */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-4 mb-4 scoreboard-metal"
            >
              <div className="flex items-center justify-center gap-1 mb-3">
                <span className="text-xs">🏏</span>
                <span className="font-display text-[9px] font-bold text-foreground/40 tracking-[0.3em]">SCORECARD</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  {isWin && <span className="text-sm">🏆</span>}
                  <span className="font-display text-sm font-black text-foreground">{playerName}</span>
                </div>
                <div className="text-right flex items-baseline gap-1">
                  <span className="font-score text-3xl font-black" style={{ color: "hsl(43 96% 56%)" }}>{playerScore}</span>
                  <span className="font-score text-sm" style={{ color: "hsl(4 90% 58% / 0.6)" }}>/{playerWickets}</span>
                  <span className="text-[10px] text-foreground/25 font-body ml-1">({overs})</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  {isLoss && <span className="text-sm">🏆</span>}
                  <span className="font-display text-sm font-black text-foreground/70">{opponentName}</span>
                </div>
                <div className="text-right flex items-baseline gap-1">
                  <span className="font-score text-3xl font-black text-foreground/60">{opponentScore}</span>
                  <span className="font-score text-sm" style={{ color: "hsl(4 90% 58% / 0.4)" }}>/{opponentWickets}</span>
                </div>
              </div>
            </motion.div>

            {/* ── STATS GRID — stadium-glass cards ── */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-4 gap-2 mb-4"
            >
              {[
                { icon: "⚾", label: "BALLS", value: stats.totalBalls, color: "hsl(0 0% 100%)" },
                { icon: "⚡", label: "SR", value: stats.strikeRate, color: "hsl(43 96% 56%)" },
                { icon: "📊", label: "RR", value: runRate, color: "hsl(142 71% 45%)" },
                { icon: "🤝", label: "BEST P", value: stats.bestPartnership, color: "hsl(280 70% 65%)" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.55 + i * 0.06 }}
                  className="rounded-xl p-2.5 text-center stadium-glass"
                >
                  <span className="text-sm block">{s.icon}</span>
                  <span className="font-score text-lg font-black block leading-none" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-[6px] text-foreground/25 font-display tracking-widest mt-0.5 block">{s.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* ── SHOT DISTRIBUTION — stadium-glass ── */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl p-3 mb-4 stadium-glass"
            >
              <span className="font-display text-[8px] font-bold text-foreground/25 tracking-[0.2em] block mb-2 text-center">SHOT DISTRIBUTION</span>
              <div className="flex items-end justify-center gap-3">
                {[
                  { label: "6s", val: stats.sixes, color: "hsl(280 70% 55%)" },
                  { label: "4s", val: stats.fours, color: "hsl(43 96% 56%)" },
                  { label: "3s", val: stats.threes, color: "hsl(142 71% 45%)" },
                  { label: "2s", val: stats.twos, color: "hsl(200 80% 55%)" },
                  { label: "1s", val: stats.singles, color: "hsl(0 0% 60%)" },
                  { label: "•", val: stats.dots, color: "hsl(0 0% 30%)" },
                ].map((s, i) => {
                  const maxVal = Math.max(stats.sixes, stats.fours, stats.threes, stats.twos, stats.singles, stats.dots, 1);
                  const height = Math.max(8, (s.val / maxVal) * 48);
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.65 + i * 0.06, type: "spring" }}
                      className="flex flex-col items-center origin-bottom"
                    >
                      <span className="font-score text-xs font-black mb-1" style={{ color: s.color }}>{s.val}</span>
                      <div className="w-6 rounded-t-md" style={{ height, background: s.color, opacity: 0.7 }} />
                      <span className="text-[7px] text-foreground/25 font-display mt-1">{s.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* ── WAGON WHEEL — stadium-glass ── */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl p-3 mb-4 stadium-glass"
            >
              <WagonWheel ballHistory={ballHistory} isBatting={true} compact />
            </motion.div>

            {/* ── PLAYER OF THE MATCH — scoreboard-metal frame ── */}
            <motion.div
              initial={{ y: 20, opacity: 0, rotateY: 90 }}
              animate={{ y: 0, opacity: 1, rotateY: 0 }}
              transition={{ delay: 0.75, type: "spring", damping: 12 }}
              className="rounded-2xl p-[3px] mb-4"
              style={{
                background: "conic-gradient(from 0deg, hsl(43 100% 65%), hsl(35 90% 45%), hsl(43 100% 60%), hsl(45 100% 75%), hsl(35 80% 50%), hsl(43 100% 65%))",
                boxShadow: "0 0 40px hsl(43 96% 56% / 0.15), 0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              <div className="rounded-[13px] p-5 text-center scoreboard-metal">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative inline-block"
                >
                  <span className="text-5xl block" style={{ filter: "drop-shadow(0 0 16px hsl(43 96% 56% / 0.5))" }}>🏅</span>
                  <div className="absolute inset-0 -m-4 rounded-full" style={{
                    background: "radial-gradient(circle, hsl(43 96% 56% / 0.12) 0%, transparent 70%)",
                  }} />
                </motion.div>

                <div className="flex items-center justify-center gap-2 my-2">
                  <div className="h-px flex-1 max-w-[40px]" style={{ background: "linear-gradient(90deg, transparent, hsl(43 80% 50%))" }} />
                  <span className="font-display text-[8px] font-bold tracking-[0.35em]" style={{
                    background: "linear-gradient(180deg, hsl(43 96% 70%), hsl(35 80% 45%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>PLAYER OF THE MATCH</span>
                  <div className="h-px flex-1 max-w-[40px]" style={{ background: "linear-gradient(270deg, transparent, hsl(43 80% 50%))" }} />
                </div>

                <motion.p
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="font-display text-2xl font-black"
                  style={{
                    background: "linear-gradient(180deg, hsl(43 100% 75%), hsl(43 96% 56%), hsl(35 80% 40%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 2px 4px hsl(43 60% 20% / 0.6))",
                  }}
                >
                  {isWin ? playerName : isLoss ? opponentName : "Shared!"}
                </motion.p>

                <span className="font-body text-[9px] text-foreground/30 tracking-wider mt-1 block">
                  {stats.strikeRate > 150 ? "🔥 Explosive innings" : stats.sixes > 2 ? "💥 Power hitting" : "🎯 Solid performance"}
                </span>
              </div>
            </motion.div>

            {/* ── REWARDS CASCADE — stadium-glass ── */}
            <AnimatePresence>
              {showRewards && matchRewards && (
                <motion.div
                  initial={{ y: 30, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="rounded-2xl p-4 mb-6 stadium-glass"
                  style={{ border: "2px solid hsl(43 50% 30% / 0.2)" }}
                >
                  <span className="font-display text-[8px] font-bold tracking-[0.3em] text-foreground/30 block text-center mb-3">MATCH REWARDS</span>
                  <div className="flex items-center justify-center gap-6">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: "linear-gradient(180deg, hsl(217 91% 50%), hsl(217 91% 35%))", boxShadow: "0 3px 0 hsl(217 91% 25%)" }}>
                        ⚡
                      </div>
                      <div>
                        <span className="font-score text-xl font-black" style={{ color: "hsl(217 91% 60%)" }}>+{matchRewards.xpEarned}</span>
                        <span className="text-[7px] text-foreground/30 font-display block">XP</span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: "linear-gradient(180deg, hsl(43 96% 56%), hsl(43 80% 40%))", boxShadow: "0 3px 0 hsl(43 70% 28%)" }}>
                        🪙
                      </div>
                      <div>
                        <span className="font-score text-xl font-black" style={{ color: "hsl(43 96% 56%)" }}>+{matchRewards.coinsEarned}</span>
                        <span className="text-[7px] text-foreground/30 font-display block">COINS</span>
                      </div>
                    </motion.div>
                  </div>

                  {matchRewards.streakBonus && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="mt-3 flex items-center justify-center"
                    >
                      <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full"
                        style={{
                          background: "linear-gradient(90deg, hsl(25 95% 53% / 0.15), hsl(43 96% 56% / 0.15))",
                          border: "1.5px solid hsl(25 95% 53% / 0.3)",
                        }}>
                        <span className="text-sm">🔥</span>
                        <span className="font-display text-[9px] font-bold tracking-wider" style={{ color: "hsl(25 95% 53%)" }}>WIN STREAK BONUS</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── BOTTOM ACTION BUTTONS — V10Button ── */}
          <div className="sticky bottom-0 p-4 pb-8 flex flex-col gap-2"
            style={{ background: "linear-gradient(to top, hsl(220 35% 5%), hsl(220 35% 5% / 0.95), transparent)" }}>
            <div className="flex gap-2">
              <ShareButton
                title={`${isWin ? "🏆 Victory" : isLoss ? "Defeat" : "🤝 Tie"} — ${playerScore} vs ${opponentScore}`}
                text={`${isWin ? "I won!" : isLoss ? "Tough loss." : "It's a tie!"} ${playerScore}-${opponentScore} on Hand Cricket 🏏`}
                variant="primary"
                size="md"
                className="flex-1"
                renderCard={() => (
                  <MatchShareCard
                    playerName={playerName}
                    opponentName={opponentName}
                    result={result}
                    playerScore={playerScore}
                    opponentScore={opponentScore}
                    playerWickets={playerWickets}
                    opponentWickets={opponentWickets}
                    stats={stats}
                    isPvP={isPvP}
                  />
                )}
              />
              <V10Button variant="gold" size="lg" onClick={handleClose} className="flex-[2]">
                ▶ PLAY AGAIN
              </V10Button>
            </div>
          </div>
        </motion.div>
      )}

      {showLevelUp && matchRewards && (
        <LevelUpModal
          rewards={matchRewards}
          onClose={() => {
            setShowLevelUp(false);
            stableOnComplete();
          }}
        />
      )}
    </AnimatePresence>
  );
}
