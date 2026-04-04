import { useState, useEffect, useRef, useCallback } from "react";
import { useScreenShake } from "@/hooks/useScreenShake";
import { motion, AnimatePresence } from "framer-motion";
import type { Move, BallResult, GameResult, InningsPhase, MatchConfig } from "@/hooks/useHandCricket";
import { SFX, Haptics } from "@/lib/sounds";
import { startAmbientStadium, stopAmbientStadium, setAmbientVolume, crowdRoar, crowdGaspMute } from "@/lib/ambientStadium";
import { getCommentary, getInningsChangeCommentary } from "@/lib/commentary";
import { speakCommentary, playCrowdForResult, CrowdSFX, speakDuoCommentary } from "@/lib/voiceCommentary";
import { isElevenLabsAvailable } from "@/lib/elevenLabsAudio";
import { useSettings } from "@/contexts/SettingsContext";
import { pickMatchCommentators, getDuoCommentary, getOverBreakCommentary, type Commentator, type CommentaryLine } from "@/lib/commentaryDuo";
import { pickConfiguredMatchCommentators } from "@/lib/commentaryDuo";
import ScoreBoard from "./ScoreBoard";
import CelebrationEffects from "./CelebrationEffects";
import ShotResultOverlay from "./ShotResultOverlay";
import BallPitchAnimation from "./BallPitchAnimation";
import ArenaParticles from "./ArenaParticles";
import OverBreakScreen from "./OverBreakScreen";
import WicketBreakdownCard, { type WicketBreakdownData } from "./WicketBreakdownCard";
import pitch3d from "@/assets/pitch-3d.jpg";
import { getBestArena } from "@/lib/arenas";
import GameButton from "./shared/GameButton";
import { getBatSkin, getButtonStyle } from "@/lib/cosmetics";
import WeatherOverlay from "./WeatherOverlay";
import type { Weather } from "@/lib/weather";
const ALL_MOVE_KEYS: Move[] = ["DEF", 1, 2, 3, 4, 6];

export interface TapPlayingUIProps {
  phase: InningsPhase;
  userScore: number;
  aiScore: number;
  userWickets: number;
  aiWickets: number;
  target: number | null;
  currentInnings: 1 | 2;
  isBatting: boolean;
  lastResult: BallResult | null;
  result: GameResult;
  ballHistory: BallResult[];
  playerName: string;
  opponentName: string;
  opponentEmoji?: string;
  onMove: (move: Move) => void;
  onReset: () => void;
  onHome: () => void;
  isPvP?: boolean;
  waitingForOpponent?: boolean;
  cooldownOverride?: boolean;
  extraContent?: React.ReactNode;
  modeLabel?: string;
  matchConfig?: MatchConfig;
  innings1Balls?: number;
  commentators?: [Commentator, Commentator];
  arenaImage?: string;
  arenaId?: string;
  equippedBatSkin?: string | null;
  equippedButtonStyle?: string | null;
  weather?: Weather | null;
}

export default function TapPlayingUI({
  phase, userScore, aiScore, userWickets, aiWickets, target,
  currentInnings, isBatting, lastResult, result, ballHistory,
  playerName, opponentName, opponentEmoji = "🏏",
  onMove, onReset, onHome,
  isPvP = false, waitingForOpponent = false, cooldownOverride,
  extraContent, modeLabel = "TAP MODE", matchConfig, innings1Balls, commentators,
  arenaImage,
  arenaId,
  equippedBatSkin,
  equippedButtonStyle,
  weather,
}: TapPlayingUIProps) {
  const shake = useScreenShake();
  const batSkin = getBatSkin(equippedBatSkin);
  const btnTheme = getButtonStyle(equippedButtonStyle);
  const { soundEnabled, hapticsEnabled, commentaryEnabled, voiceEnabled, crowdEnabled, commentaryVoice, voiceEngine, commentaryLanguage, musicEnabled, ambientVolume } = useSettings();

  // Ambient stadium music — arena-specific
  useEffect(() => {
    if (soundEnabled && musicEnabled && !result) {
      startAmbientStadium(ambientVolume, arenaId);
    } else {
      stopAmbientStadium();
    }
    return () => { stopAmbientStadium(); };
  }, [soundEnabled, musicEnabled, result]);

  useEffect(() => {
    if (soundEnabled && musicEnabled) setAmbientVolume(ambientVolume);
  }, [ambientVolume, soundEnabled, musicEnabled]);

  const [lastPlayed, setLastPlayed] = useState<Move | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [commentary, setCommentary] = useState<CommentaryLine[] | null>(null);
  const [showOverBreak, setShowOverBreak] = useState(false);
  const [overBreakData, setOverBreakData] = useState<any>(null);
  const [showWicketBreakdown, setShowWicketBreakdown] = useState(false);
  const [wicketBreakdownData, setWicketBreakdownData] = useState<WicketBreakdownData | null>(null);
  const [floodlightFlicker, setFloodlightFlicker] = useState(false);
  const [shotOverlayKey, setShotOverlayKey] = useState(0);
  const prevPhaseRef = useRef(phase);
  const prevBallCountRef = useRef(0);
  const prevWicketsRef = useRef({ user: 0, ai: 0 });
  const partnershipStartRef = useRef({ score: 0, balls: 0 });

  const [matchCommentators] = useState<[Commentator, Commentator]>(() =>
    commentators || pickConfiguredMatchCommentators(commentaryVoice)
  );

  const effectiveCooldown = cooldownOverride !== undefined ? cooldownOverride : cooldown;

  const config = matchConfig || { overs: null, wickets: 1 };
  const currentBalls = currentInnings === 1 ? (innings1Balls ?? ballHistory.length) :
    ballHistory.length - (innings1Balls ?? 0);

  const gameStateForScoreboard = {
    phase, userScore, aiScore, userWickets, aiWickets,
    target, currentInnings, isBatting, lastResult, result, ballHistory,
    config,
    innings1Balls: innings1Balls || ballHistory.length,
    innings2Balls: 0,
  };

  // Over completion check
  useEffect(() => {
    if (!config.overs || phase === "not_started" || phase === "finished") return;
    const totalBalls = currentBalls;
    const prevBalls = prevBallCountRef.current;
    prevBallCountRef.current = totalBalls;

    if (totalBalls > 0 && totalBalls % 6 === 0 && totalBalls !== prevBalls && totalBalls > prevBalls) {
      const oversCompleted = Math.floor(totalBalls / 6);
      if (config.overs && oversCompleted >= config.overs) return;

      const recentBalls = ballHistory.slice(-6);
      let overRuns = 0;
      const thisOverBalls: { runs: number | "OUT" }[] = [];
      for (const b of recentBalls) {
        thisOverBalls.push({ runs: b.runs });
        if (typeof b.runs === "number" && b.runs > 0) overRuns += b.runs;
      }

      const score = isBatting ? userScore : aiScore;
      const wickets = isBatting ? userWickets : aiWickets;
      const opponentScore = isBatting ? aiScore : userScore;
      const opponentWickets = isBatting ? aiWickets : userWickets;
      const crr = totalBalls > 0 ? (score / (totalBalls / 6)).toFixed(1) : "0.0";
      const remainingBalls = config.overs ? (config.overs * 6 - totalBalls) : 999;
      const remaining = target ? Math.max(0, target - score) : 0;
      const rrr = remainingBalls > 0 && target ? (remaining / (remainingBalls / 6)).toFixed(1) : "0.0";

      const overBreakMerge = { overRuns, thisOverBalls, crr, rrr, oversCompleted, totalOvers: config.overs };

      if (lastResult && lastResult.runs === "OUT") {
        setWicketBreakdownData(prev => prev ? { ...prev, overBreakStats: overBreakMerge } : prev);
        return;
      }

      const stats = {
        overRuns, score, wickets, opponentScore, opponentWickets,
        crr, rrr, target, remaining, remainingBalls,
        oversCompleted, totalOvers: config.overs,
        isBatting, playerName, opponentName,
        thisOverBalls,
      };

      const lines = getOverBreakCommentary(
        matchCommentators[0].name, matchCommentators[1].name,
        isBatting, playerName, opponentName, stats
      );

      setOverBreakData({ stats, lines });
      setShowOverBreak(true);

      if (voiceEnabled && commentaryEnabled) {
        speakDuoCommentary(lines, matchCommentators, voiceEngine);
      }
    }
  }, [ballHistory.length]);

  // Innings change commentary
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (prev !== phase && phase !== "not_started" && phase !== "finished") {
      if (commentaryEnabled) {
        const text = getInningsChangeCommentary(gameStateForScoreboard as any);
        const lines: CommentaryLine[] = [
          { commentatorId: matchCommentators[0].name, text, isKeyMoment: true },
        ];
        setCommentary(lines);
        if (voiceEnabled) speakCommentary(text, true, voiceEngine);
        setTimeout(() => setCommentary(null), 3000);
      }
      if (crowdEnabled) CrowdSFX.ambientMurmur(2);
      if (soundEnabled) SFX.gameStart();
    }
  }, [phase]);

  // Wicket breakdown card
  useEffect(() => {
    if (!lastResult || lastResult.runs !== "OUT") return;
    if (phase === "not_started") return;

    const currentBallsTotal = ballHistory.length;
    const inningsBalls = currentInnings === 1 ? (innings1Balls ?? currentBallsTotal) : currentBallsTotal - (innings1Balls ?? 0);
    const partStart = partnershipStartRef.current;
    const currentScore = isBatting ? userScore : aiScore;
    const pRuns = currentScore - partStart.score;
    const pBalls = inningsBalls - partStart.balls;

    const recentBalls = ballHistory.slice(partStart.balls);
    let fours = 0, sixes = 0, batsmanRuns = 0;
    for (const b of recentBalls) {
      if (typeof b.runs === "number") {
        const absR = Math.abs(b.runs);
        if (isBatting && b.runs > 0) { batsmanRuns += b.runs; if (absR === 4) fours++; if (absR === 6) sixes++; }
        if (!isBatting && b.runs < 0) { batsmanRuns += absR; if (absR === 4) fours++; if (absR === 6) sixes++; }
      }
    }

    const totalWickets = isBatting ? userWickets : aiWickets;
    const oversStr = `${Math.floor(inningsBalls / 6)}.${inningsBalls % 6}`;
    const isInningsChange = phase === "second_batting" || phase === "second_bowling";

    const breakdownData: WicketBreakdownData = {
      type: isInningsChange ? "innings_change" : "wicket",
      batsmanName: isBatting ? playerName : opponentName,
      batsmanRuns,
      batsmanBalls: pBalls,
      batsmanFours: fours,
      batsmanSixes: sixes,
      partnershipRuns: pRuns,
      partnershipBalls: pBalls,
      bowlerName: isBatting ? opponentName : playerName,
      bowlerWickets: totalWickets,
      bowlerRunsConceded: isBatting ? userScore : (typeof lastResult.runs === "number" ? Math.abs(lastResult.runs) : 0),
      bowlerOvers: oversStr,
      totalScore: isBatting ? userScore : aiScore,
      totalWickets,
      currentOver: oversStr,
      target,
      isInningsChange,
      newTarget: isInningsChange ? target : undefined,
      dismissalType: lastResult.description,
    };

    partnershipStartRef.current = { score: currentScore, balls: inningsBalls };
    setFloodlightFlicker(true);
    setTimeout(() => setFloodlightFlicker(false), 2000);

    if (phase !== "finished") {
      setWicketBreakdownData(breakdownData);
      setShowWicketBreakdown(true);
    }
  }, [lastResult?.runs === "OUT" ? ballHistory.length : null]);

  // Ball result SFX + commentary + shot overlay
  useEffect(() => {
    if (!lastResult) return;
    const r = lastResult;
    setShotOverlayKey(Date.now());
    if (soundEnabled) SFX.batHit();
    if (r.runs === "OUT") {
      shake("heavy");
      setTimeout(() => {
        if (soundEnabled) SFX.out();
        if (hapticsEnabled) Haptics.out();
        crowdGaspMute();
      }, 150);
    } else if (typeof r.runs === "number") {
      const absRuns = Math.abs(r.runs);
      if (absRuns === 6) { shake("medium"); setTimeout(() => { if (soundEnabled) SFX.six(); if (hapticsEnabled) Haptics.heavy(); crowdRoar("six"); }, 100); }
      else if (absRuns === 4) { shake("light"); setTimeout(() => { if (soundEnabled) SFX.four(); if (hapticsEnabled) Haptics.medium(); crowdRoar("four"); }, 100); }
      else if (absRuns === 0) { if (soundEnabled) SFX.defence(); if (hapticsEnabled) Haptics.light(); }
      else { if (soundEnabled) SFX.runs(absRuns); if (hapticsEnabled) Haptics.light(); }
    }
    if (crowdEnabled) playCrowdForResult(r.runs, isBatting, false);

    if (commentaryEnabled) {
      const duoLines = getDuoCommentary(
        matchCommentators[0].name, matchCommentators[1].name,
        r.runs, isBatting, playerName, opponentName,
        undefined, commentaryLanguage
      );
      setCommentary(duoLines);
      if (voiceEnabled) {
        if (duoLines.some(l => l.isKeyMoment)) {
          speakDuoCommentary(duoLines, matchCommentators, voiceEngine);
        } else if (duoLines[0]) {
          speakCommentary(duoLines[0].text, true, voiceEngine);
        }
      }
      setTimeout(() => setCommentary(null), 3500);
    }
  }, [lastResult]);

  const handleMove = (move: Move) => {
    if (effectiveCooldown || phase === "not_started" || phase === "finished") return;
    if (waitingForOpponent) return;
    if (soundEnabled) SFX.tap();
    if (hapticsEnabled) Haptics.light();
    setLastPlayed(move);
    onMove(move);
    if (cooldownOverride === undefined) {
      setCooldown(true);
      setTimeout(() => setCooldown(false), 800);
    }
  };

  const handleOverBreakContinue = useCallback(() => {
    setShowOverBreak(false);
    setOverBreakData(null);
  }, []);

  const handleWicketBreakdownContinue = useCallback(() => {
    setShowWicketBreakdown(false);
    setWicketBreakdownData(null);
  }, []);

  // Build move buttons from theme
  const allMoves = ALL_MOVE_KEYS.map(move => {
    const key = move === "DEF" ? "DEF" : String(move);
    const style = btnTheme.moves[key];
    return { move, ...style };
  });
  const activeMoves = config.noDefence ? allMoves.filter(m => m.move !== "DEF") : allMoves;

  return (
    <>
      <CelebrationEffects lastResult={lastResult} gameResult={result} phase={phase} batSkin={equippedBatSkin} />
      <ShotResultOverlay lastResult={lastResult} triggerKey={shotOverlayKey} />
      <BallPitchAnimation lastResult={lastResult} triggerKey={shotOverlayKey} />

      {/* Arena / pitch background */}
      {phase !== "not_started" && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={arenaImage || pitch3d} alt="" className="w-full h-full object-cover opacity-20" style={{ objectPosition: "center 40%", filter: weather?.visual.imageFilter }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220_25%_8%/0.7)] via-[hsl(220_25%_8%/0.4)] to-[hsl(220_25%_8%/0.85)]" />
        </div>
      )}

      {/* Weather overlay */}
      {weather && phase !== "not_started" && phase !== "finished" && (
        <WeatherOverlay weather={weather} />
      )}

      {/* Arena-specific floating particles */}
      {phase !== "not_started" && phase !== "finished" && <ArenaParticles arenaId={arenaId} />}

      {/* Floodlight flicker */}
      <AnimatePresence>
        {floodlightFlicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.05, 0.25, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            className="fixed inset-0 z-[5] pointer-events-none"
          >
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, hsl(43 96% 56% / 0.4) 0%, transparent 70%)", filter: "blur(20px)" }} />
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, hsl(43 96% 56% / 0.35) 0%, transparent 70%)", filter: "blur(20px)" }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Over break screen */}
      <AnimatePresence>
        {showOverBreak && overBreakData && (
          <OverBreakScreen
            stats={overBreakData.stats}
            commentaryLines={overBreakData.lines}
            commentators={matchCommentators}
            onContinue={handleOverBreakContinue}
          />
        )}
      </AnimatePresence>

      {/* Wicket breakdown */}
      <AnimatePresence>
        {showWicketBreakdown && wicketBreakdownData && (
          <WicketBreakdownCard
            data={wicketBreakdownData}
            onContinue={handleWicketBreakdownContinue}
          />
        )}
      </AnimatePresence>

      {/* Commentator badges — chrome framed */}
      {phase !== "not_started" && phase !== "finished" && (
        <div className="flex items-center justify-center gap-2 mb-1">
          {matchCommentators.map((c, i) => (
            <div key={c.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-display font-bold tracking-wider"
              style={{
                background: i === 0 ? "hsl(var(--grass-dark) / 0.3)" : "hsl(var(--secondary) / 0.12)",
                border: `1px solid ${i === 0 ? "hsl(var(--grass-mid) / 0.25)" : "hsl(var(--secondary) / 0.2)"}`,
                color: i === 0 ? "hsl(var(--grass-light))" : "hsl(var(--secondary))",
              }}>
              <span className="text-[9px]">{c.avatar}</span>
              {c.name}
            </div>
          ))}
        </div>
      )}

      {/* Scoreboard */}
      {phase !== "not_started" && (
        <ScoreBoard
          game={gameStateForScoreboard as any}
          playerName={playerName}
          aiName={opponentName}
          aiEmoji={opponentEmoji}
          isPvP={isPvP}
        />
      )}

      {/* ── Commentary Strip — Doc 1 §3.6: 44px, team-colored left border ── */}
      <AnimatePresence>
        {commentary && commentary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg overflow-hidden"
            style={{
              height: 44,
              background: "rgba(0,0,0,0.3)",
              borderLeft: "3px solid hsl(var(--team-primary))",
              padding: "8px 12px",
            }}
          >
            {commentary.slice(0, 1).map((line, i) => {
              const comm = matchCommentators.find(c => c.name === line.commentatorId || c.id === line.commentatorId) || matchCommentators[0];
              return (
                <div key={i} className="flex items-center gap-2 h-full">
                  <span className="text-[9px] flex-shrink-0">{comm.avatar}</span>
                  <p className="font-body text-[13px] italic text-white/85 line-clamp-1 flex-1">
                    {line.text}
                  </p>
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 flex-shrink-0"
                  >
                    🔊
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last result — concrete card with cricket material accents */}
      <AnimatePresence mode="wait">
        {lastResult && phase !== "not_started" && phase !== "finished" && (
          <motion.div
            key={lastResult.description}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl p-2.5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--concrete-mid) / 0.8), hsl(var(--concrete-dark) / 0.8))",
              border: "1px solid hsl(var(--chrome-dark) / 0.3)",
            }}
          >
            <div className="flex items-center justify-center gap-4 relative z-10">
              <div className="text-center">
                <p className="text-[6px] font-display font-bold tracking-[0.2em] mb-0.5" style={{ color: "hsl(var(--chrome-mid) / 0.6)" }}>{playerName.toUpperCase().slice(0, 8)}</p>
                <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--grass-dark) / 0.3), hsl(var(--grass-mid) / 0.1))",
                    border: "1px solid hsl(var(--grass-mid) / 0.3)",
                  }}>
                  <span className="text-xl">{btnTheme.moves[lastResult?.userMove === "DEF" ? "DEF" : String(lastResult?.userMove)]?.emoji || "❓"}</span>
                </motion.div>
                <p className="text-[8px] font-display font-bold mt-0.5" style={{ color: "hsl(var(--grass-light))" }}>{lastResult.userMove === "DEF" ? "DEF" : lastResult.userMove}</p>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.15 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm"
                style={{
                  background: lastResult.runs === "OUT"
                    ? "linear-gradient(180deg, hsl(var(--leather-mid) / 0.4), hsl(var(--leather-dark) / 0.3))"
                    : "linear-gradient(180deg, hsl(var(--grass-mid) / 0.3), hsl(var(--grass-dark) / 0.2))",
                  border: lastResult.runs === "OUT"
                    ? "2px solid hsl(var(--leather-highlight) / 0.5)"
                    : "2px solid hsl(var(--grass-light) / 0.4)",
                  borderBottom: lastResult.runs === "OUT"
                    ? "3px solid hsl(var(--leather-highlight) / 0.6)"
                    : "3px solid hsl(var(--grass-light) / 0.5)",
                  color: lastResult.runs === "OUT" ? "hsl(var(--leather-highlight))" : "hsl(var(--grass-light))",
                  textShadow: "0 0 15px currentColor",
                }}
              >
                {lastResult.runs === "OUT" ? "OUT" : `+${lastResult.runs}`}
              </motion.div>

              <div className="text-center">
                <p className="text-[6px] font-display font-bold tracking-[0.2em] mb-0.5" style={{ color: "hsl(var(--chrome-mid) / 0.6)" }}>{opponentName.toUpperCase().slice(0, 8)}</p>
                <motion.div initial={{ rotateY: -90 }} animate={{ rotateY: 0 }} transition={{ delay: 0.1 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--secondary) / 0.12), hsl(var(--secondary) / 0.04))",
                    border: "1px solid hsl(var(--secondary) / 0.2)",
                  }}>
                  <span className="text-xl">{btnTheme.moves[lastResult?.aiMove === "DEF" ? "DEF" : String(lastResult?.aiMove)]?.emoji || opponentEmoji}</span>
                </motion.div>
                <p className="text-[8px] font-display font-bold mt-0.5" style={{ color: "hsl(var(--secondary))" }}>{lastResult.aiMove === "DEF" ? "DEF" : lastResult.aiMove}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {extraContent}
      <div className="flex-1 min-h-0" />

      {/* ── Hand Selector — Doc 1 §3.6: 72px round buttons, 3×2 grid ── */}
      {phase !== "not_started" && phase !== "finished" && !waitingForOpponent && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative pb-1">
          <p className="text-center text-[7px] font-display mb-2 tracking-[0.2em] text-[#64748B]">
            {isBatting ? "⚡ TAP YOUR SHOT" : "🎯 TAP YOUR BOWL"}
          </p>
          <div
            className="grid grid-cols-3 gap-3 px-4 py-3"
            style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.5), transparent)" }}
          >
            {activeMoves.map((m, i) => {
              const HAND_BTN_COLORS: Record<string, { bg: string; dark: string }> = {
                "1": { bg: "linear-gradient(180deg, #4ADE80, #22C55E, #15803D)", dark: "#0F5132" },
                "2": { bg: "linear-gradient(180deg, #67E8F9, #06B6D4, #0E7490)", dark: "#064E63" },
                "3": { bg: "linear-gradient(180deg, #60A5FA, #3B82F6, #1D4ED8)", dark: "#1E3A6E" },
                "4": { bg: "linear-gradient(180deg, #FDE047, #EAB308, #A16207)", dark: "#724B05" },
                "6": { bg: "linear-gradient(180deg, #FCA5A5, #EF4444, #991B1B)", dark: "#7F1D1D" },
                "DEF": { bg: "linear-gradient(180deg, #94A3B8, #64748B, #475569)", dark: "#334155" },
              };
              const key = m.move === "DEF" ? "DEF" : String(m.move);
              const colors = HAND_BTN_COLORS[key] || HAND_BTN_COLORS["DEF"];

              return (
                <motion.button
                  key={m.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 20 }}
                  whileTap={{ scale: 0.92, y: 4 }}
                  onClick={() => handleMove(m.move)}
                  disabled={effectiveCooldown}
                  className="flex flex-col items-center justify-center text-white mx-auto"
                  style={effectiveCooldown ? {
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(51,65,85,0.5)",
                    border: "4px solid rgba(51,65,85,0.3)",
                    opacity: 0.4,
                    filter: "grayscale(60%)",
                  } : {
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: colors.bg,
                    border: `4px solid ${colors.dark}`,
                    borderBottom: `6px solid ${colors.dark}`,
                    boxShadow: "0 6px 0 rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)",
                    textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                  }}
                >
                  <span className="text-xl leading-none">{m.emoji}</span>
                  <span className="font-heading text-xs font-bold">{m.label}</span>
                  {effectiveCooldown && lastPlayed === m.move && (
                    <motion.div
                      initial={{ scaleX: 1 }}
                      animate={{ scaleX: 0 }}
                      transition={{ duration: 0.8, ease: "linear" }}
                      className="absolute bottom-2 left-3 right-3 h-0.5 rounded-full origin-left bg-white/50"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
          {!isPvP && (
            <button onClick={onReset}
              className="text-[8px] underline mt-1.5 active:scale-95 font-body tracking-wider w-full text-center text-[#475569]">
              Reset Match
            </button>
          )}
        </motion.div>
      )}

      {/* Waiting for opponent (PvP) */}
      {isPvP && waitingForOpponent && phase !== "finished" && phase !== "not_started" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-3 text-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg, hsl(var(--concrete-mid) / 0.8), hsl(var(--concrete-dark) / 0.8))",
            border: "1px solid hsl(var(--chrome-dark) / 0.3)",
          }}>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <span className="text-2xl block mb-1">⏳</span>
          </motion.div>
          <p className="font-display text-[10px] font-bold tracking-wider" style={{ color: "hsl(var(--chrome-mid) / 0.6)" }}>
            WAITING FOR {opponentName.toUpperCase()}...
          </p>
        </motion.div>
      )}

      {/* Game over — scoreboard paint surface */}
      {phase === "finished" && (
        <div className="mt-auto pb-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="rounded-2xl px-3 py-3 text-center"
              style={{
                background: "linear-gradient(180deg, hsl(var(--scoreboard-dark) / 0.95), hsl(var(--scoreboard-mid) / 0.9))",
                border: "1px solid hsl(var(--chrome-dark) / 0.3)",
              }}>
              <p className="font-display text-lg font-bold tracking-wider" style={{ color: "hsl(var(--chalk-white))" }}>
                {result === "win" ? `🏆 ${playerName.toUpperCase()} WINS!` : result === "loss" ? `😞 ${opponentName} wins!` : "🤝 A TIE!"}
              </p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="text-center">
                  <span className="font-display text-2xl font-black block" style={{ color: "hsl(var(--grass-light))" }}>{userScore}</span>
                  <span className="text-[7px] font-display tracking-wider" style={{ color: "hsl(var(--chrome-mid) / 0.5)" }}>{playerName.toUpperCase().slice(0, 10)}</span>
                </div>
                <span className="font-display text-sm" style={{ color: "hsl(var(--chrome-mid) / 0.3)" }}>vs</span>
                <div className="text-center">
                  <span className="font-display text-2xl font-black block" style={{ color: "hsl(var(--secondary))" }}>{aiScore}</span>
                  <span className="text-[7px] font-display tracking-wider" style={{ color: "hsl(var(--chrome-mid) / 0.5)" }}>{opponentName.toUpperCase().slice(0, 10)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <GameButton variant="primary" size="lg" bounce onClick={onReset} className="flex-1">
                {isPvP ? "🔄 REMATCH" : "⚡ NEW MATCH"}
              </GameButton>
              <GameButton variant="secondary" size="lg" bounce onClick={onHome} className="flex-1">
                HOME
              </GameButton>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
