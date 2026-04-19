// ═══════════════════════════════════════════════════
// PRO MODE — GameplayEngine-driven hand cricket
// Fork of GameScreen with:
//   1. Pre-match player picker (batsman + bowler from DB)
//   2. engines.gameplay.resolveBall() as authoritative resolver
//   3. Inline engine ticker above scoreboard
// Does NOT modify GameScreen, useHandCricket, or any other mode.
// ═══════════════════════════════════════════════════

import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScreenShake } from "@/hooks/useScreenShake";
import CameraFeed, { type CameraFeedHandle } from "./CameraFeed";
import HandOverlay from "./HandOverlay";
import GestureDisplay from "./GestureDisplay";
import OverSelector from "./OverSelector";
import CelebrationEffects from "./CelebrationEffects";
import CanvasFireworks, { type FireworkType } from "./CanvasFireworks";
import { useHandCricket, type Move, type AiMove, type BallResult as HookBallResult, type MatchConfig } from "@/hooks/useHandCricket";
import { useHandDetection } from "@/hooks/useHandDetection";
import { useEngines } from "@/hooks/useEngines";
import { usePlayers, type DBPlayer, overallRating, roleLabel } from "@/hooks/usePlayers";
import { calculateMatchSituation } from "@/engines/GameplayEngine";
import type { PlayerStats, MatchContext, MatchPhase, PitchType, BallResult as EngineBallResult } from "@/engines/types";

const MOVE_EMOJI: Record<string, string> = {
  DEF: "✊", "1": "☝️", "2": "✌️", "3": "🤟", "4": "🖖", "6": "👍",
};

const PITCH_LABEL: Record<PitchType, string> = {
  flat: "Flat 🛋️",
  green_top: "Green Top 🌿",
  dustbowl: "Dustbowl 🏜️",
  minefield: "Minefield 💣",
};

const PHASE_LABEL: Record<MatchPhase, string> = {
  powerplay: "PP",
  middle: "MID",
  death: "DEATH",
};

interface ProModeScreenProps {
  onHome: () => void;
}

type Stage = "picker" | "overs" | "playing";

function dbPlayerToStats(p: DBPlayer, role: "bat" | "bowl"): PlayerStats {
  const bowlMap: Record<string, PlayerStats["bowlingType"]> = {
    fast: "fast",
    medium_fast: "medium_fast",
    spin_off: "spin_off",
    spin_leg: "spin_leg",
  };
  return {
    power: p.power,
    technique: p.technique,
    accuracy: p.accuracy,
    clutch: p.clutch,
    bowlingType: role === "bowl" ? bowlMap[p.bowling_style ?? "fast"] ?? "fast" : undefined,
    specialAbility: p.special_ability_name ?? undefined,
    specialAbilityId: p.special_ability_id ?? undefined,
  };
}

export default function ProModeScreen({ onHome }: ProModeScreenProps) {
  const cameraRef = useRef<CameraFeedHandle>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const { game, startGame, applyBallResult, resetGame } = useHandCricket();
  const engines = useEngines();
  const shake = useScreenShake();
  const detection = useHandDetection(videoElementRef);

  const [stage, setStage] = useState<Stage>("picker");
  const [matchConfig, setMatchConfig] = useState<MatchConfig | null>(null);

  // Player picks
  const { data: players, isLoading: playersLoading } = usePlayers();
  const [batsmanId, setBatsmanId] = useState<string | null>(null);
  const [bowlerId, setBowlerId] = useState<string | null>(null);
  const [opponentBatId, setOpponentBatId] = useState<string | null>(null);
  const [opponentBowlId, setOpponentBowlId] = useState<string | null>(null);

  // Random pitch per match
  const [pitchType, setPitchType] = useState<PitchType>("flat");

  // Engine HUD
  const [lastEngineResult, setLastEngineResult] = useState<EngineBallResult | null>(null);
  const [bigResult, setBigResult] = useState<HookBallResult | null>(null);
  const [fireworkType, setFireworkType] = useState<FireworkType | null>(null);

  // Pick defaults once players load: top-rated batsman + bowler
  useEffect(() => {
    if (!players || players.length === 0) return;
    const batsmen = players.filter(p => p.role === "batsman" || p.role === "wk_batsman" || p.role === "all_rounder");
    const bowlers = players.filter(p => p.role === "bowler" || p.role === "all_rounder");
    if (!batsmanId && batsmen[0]) setBatsmanId(batsmen[0].id);
    if (!bowlerId && bowlers[0]) setBowlerId(bowlers[0].id);
    if (!opponentBatId && batsmen[1]) setOpponentBatId(batsmen[1].id);
    if (!opponentBowlId && bowlers[1]) setOpponentBowlId(bowlers[1].id);
  }, [players, batsmanId, bowlerId, opponentBatId, opponentBowlId]);

  const batsman = useMemo(() => players?.find(p => p.id === batsmanId) ?? null, [players, batsmanId]);
  const bowler = useMemo(() => players?.find(p => p.id === bowlerId) ?? null, [players, bowlerId]);
  const oppBat = useMemo(() => players?.find(p => p.id === opponentBatId) ?? null, [players, opponentBatId]);
  const oppBowl = useMemo(() => players?.find(p => p.id === opponentBowlId) ?? null, [players, opponentBowlId]);

  // Compute current phase from game state
  const currentPhase: MatchPhase = useMemo(() => {
    const balls = game.currentInnings === 1 ? game.innings1Balls : game.innings2Balls;
    const over = Math.floor(balls / 6);
    const totalOvers = matchConfig?.overs ?? 5;
    if (over < 2) return "powerplay";
    if (over >= totalOvers - 2) return "death";
    return "middle";
  }, [game.currentInnings, game.innings1Balls, game.innings2Balls, matchConfig]);

  const currentSituation = useMemo(() => {
    if (!matchConfig?.overs) return "comfortable" as const;
    const balls = game.currentInnings === 1 ? game.innings1Balls : game.innings2Balls;
    const ctx: MatchContext = {
      innings: game.currentInnings,
      over: Math.floor(balls / 6),
      ball: balls % 6,
      phase: currentPhase,
      battingTeam: "You",
      bowlingTeam: "AI",
      score: game.isBatting ? game.userScore : game.aiScore,
      wickets: game.isBatting ? game.userWickets : game.aiWickets,
      target: game.target,
      requiredRunRate: null,
      currentRunRate: balls > 0 ? ((game.isBatting ? game.userScore : game.aiScore) / balls) * 6 : 0,
      lastFewBalls: [],
      matchSituation: "comfortable",
      isLastOver: false,
      isMatchPoint: false,
      pitch: pitchType,
      totalBalls: matchConfig.overs * 6,
      ballsBowled: balls,
    };
    return calculateMatchSituation(ctx);
  }, [game, matchConfig, currentPhase, pitchType]);

  // Step 1 — overs picked → set pitch + start match
  const handleOverSelect = useCallback((cfg: MatchConfig) => {
    setMatchConfig(cfg);
    const pitches: PitchType[] = ["flat", "green_top", "dustbowl", "minefield"];
    setPitchType(pitches[Math.floor(Math.random() * pitches.length)]);
    setStage("playing");
    // Player bats first by default in PRO MODE for visibility
    startGame(true, cfg);
  }, [startGame]);

  // Engine-driven ball
  const handleProBall = useCallback((userMove: Move) => {
    if (game.phase === "not_started" || game.phase === "finished") return;
    if (!matchConfig || !batsman || !bowler || !oppBat || !oppBowl) return;

    const battingPick = userMove === "DEF" ? 0 : (userMove as number);
    const bowlingPick = Math.floor(Math.random() * 7); // 0=DEF, 1-6
    const balls = game.currentInnings === 1 ? game.innings1Balls : game.innings2Balls;
    const totalOvers = matchConfig.overs ?? 5;
    const over = Math.floor(balls / 6);
    const phase: MatchPhase = over < 2 ? "powerplay" : over >= totalOvers - 2 ? "death" : "middle";

    const baseCtx: MatchContext = {
      innings: game.currentInnings,
      over,
      ball: balls % 6,
      phase,
      battingTeam: game.isBatting ? "You" : "AI",
      bowlingTeam: game.isBatting ? "AI" : "You",
      score: game.isBatting ? game.userScore : game.aiScore,
      wickets: game.isBatting ? game.userWickets : game.aiWickets,
      target: game.target,
      requiredRunRate: null,
      currentRunRate: balls > 0 ? ((game.isBatting ? game.userScore : game.aiScore) / balls) * 6 : 0,
      lastFewBalls: [],
      matchSituation: "comfortable",
      isLastOver: over === totalOvers - 1,
      isMatchPoint: false,
      pitch: pitchType,
      totalBalls: totalOvers * 6,
      ballsBowled: balls,
    };
    baseCtx.matchSituation = calculateMatchSituation(baseCtx);

    // Pick correct stats based on who's batting
    const batStats: PlayerStats = game.isBatting
      ? dbPlayerToStats(batsman, "bat")
      : dbPlayerToStats(oppBat, "bat");
    const bowlStats: PlayerStats = game.isBatting
      ? dbPlayerToStats(oppBowl, "bowl")
      : dbPlayerToStats(bowler, "bowl");

    const result = engines.gameplay.resolveBall(battingPick, bowlingPick, batStats, bowlStats, baseCtx);
    setLastEngineResult(result);

    // Translate to hook signature
    const aiMove: AiMove = bowlingPick === 0 ? "DEF" : (bowlingPick as AiMove);
    const runs: number | "OUT" = result.isWicket ? "OUT" : result.runs;
    const desc = result.isWicket
      ? `OUT — ${result.dismissalType?.replace(/_/g, " ") ?? "wicket"}`
      : result.isWide
      ? "Wide ball!"
      : result.isNoBall
      ? `No ball! +${result.runs}`
      : result.isDefenseScored
      ? `Defended → ${result.runs}`
      : `${result.runs} run(s)`;

    applyBallResult(userMove, aiMove, runs, desc);

    // Visual flair
    if (result.isWicket) {
      shake("heavy");
      setFireworkType("wicket");
    } else if (result.runs === 6) {
      shake("medium");
      setFireworkType("six");
    } else if (result.runs === 4) {
      shake("light");
      setFireworkType("four");
    }
  }, [game, matchConfig, batsman, bowler, oppBat, oppBowl, pitchType, engines, applyBallResult, shake]);

  // Wire detection → engine ball
  useEffect(() => {
    if (stage === "playing" && game.phase !== "not_started" && game.phase !== "finished") {
      detection.setOnAutoCapture((move) => handleProBall(move));
    } else {
      detection.setOnAutoCapture(null);
    }
  }, [stage, game.phase, detection, handleProBall]);

  // Big result animation
  useEffect(() => {
    if (!game.lastResult) return;
    setBigResult(game.lastResult);
    const t = setTimeout(() => setBigResult(null), 1600);
    return () => clearTimeout(t);
  }, [game.lastResult]);

  // Clear fireworks
  useEffect(() => {
    if (fireworkType) {
      const t = setTimeout(() => setFireworkType(null), 2500);
      return () => clearTimeout(t);
    }
  }, [fireworkType]);

  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    videoElementRef.current = video;
    detection.startDetection();
  }, [detection]);

  const handleNewMatch = () => {
    resetGame();
    setLastEngineResult(null);
    setBigResult(null);
    setFireworkType(null);
    setMatchConfig(null);
    setStage("picker");
    detection.resetToFist();
  };

  const videoW = videoElementRef.current?.videoWidth || 640;
  const videoH = videoElementRef.current?.videoHeight || 480;
  const isFrontCamera = cameraRef.current?.videoRef?.current
    ? (cameraRef.current.videoRef.current.className || "").includes("scale-x-[-1]")
    : false;

  const isInGame = game.phase !== "not_started" && game.phase !== "finished";

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <CelebrationEffects lastResult={game.lastResult} gameResult={game.result} phase={game.phase} batSkin={null} />
      <CanvasFireworks type={fireworkType} duration={2500} />

      <div className="absolute inset-0">
        <CameraFeed ref={cameraRef} onVideoReady={handleVideoReady} stadiumMode fullscreen filter="broadcast" />
        <HandOverlay
          landmarks={detection.landmarks}
          videoWidth={videoW}
          videoHeight={videoH}
          status={detection.status}
          gloveStyle="cricket"
          mirrored={isFrontCamera}
        />
      </div>

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-3 pb-2"
        style={{ background: "linear-gradient(to bottom, hsl(220 12% 6% / 0.85) 0%, transparent 100%)" }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onHome}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm text-white"
          style={{
            background: "linear-gradient(180deg, hsl(220 15% 12%), hsl(220 12% 8%))",
            border: "2px solid hsl(220 15% 18%)",
            borderBottom: "3px solid hsl(220 15% 6%)",
          }}
        >
          ←
        </motion.button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: "linear-gradient(180deg, hsl(200 90% 25%), hsl(200 90% 15%))",
            border: "2px solid hsl(200 90% 45%)",
            boxShadow: "0 0 16px hsl(200 90% 55% / 0.4)",
          }}>
          <span className="text-[10px]">🧪</span>
          <span className="font-display text-[9px] tracking-[0.2em] text-white font-bold">PRO MODE</span>
        </div>
        <div className="w-9" />
      </div>

      {/* IN-GAME OVERLAYS */}
      {isInGame && (
        <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
          <div className="pt-16 px-3 pointer-events-auto space-y-1.5">
            {/* Engine ticker (above scoreboard) */}
            <EngineTicker
              pitch={pitchType}
              phase={currentPhase}
              situation={currentSituation}
              last={lastEngineResult}
            />
            <ScoreStrip game={game} batsmanName={batsman?.short_name || batsman?.name || "You"} bowlerName={oppBat?.short_name || oppBat?.name || "AI"} />
          </div>

          {/* Big result */}
          <AnimatePresence>
            {bigResult && (
              <motion.div
                key={`br-${bigResult.runs}`}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ type: "spring", damping: 14, stiffness: 200 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                {bigResult.runs === "OUT" ? (
                  <p className="font-display font-black leading-none" style={{ fontSize: 96, color: "#ef4444", textShadow: "0 0 80px #ef4444" }}>OUT!</p>
                ) : bigResult.runs === 0 ? (
                  <p className="font-display font-black leading-none" style={{ fontSize: 80, color: "rgba(255,255,255,0.7)" }}>•</p>
                ) : (
                  <p className="font-display font-black leading-none" style={{
                    fontSize: 120,
                    color: bigResult.runs === 6 ? "hsl(45 93% 58%)" : bigResult.runs === 4 ? "hsl(142 71% 55%)" : "white",
                    textShadow: bigResult.runs === 6 ? "0 0 80px gold" : bigResult.runs === 4 ? "0 0 60px lime" : "0 0 50px rgba(255,255,255,0.7)",
                  }}>{bigResult.runs}</p>
                )}
                <div className="flex items-center gap-3 mt-3 bg-black/50 backdrop-blur-md rounded-2xl px-5 py-2 border border-white/10">
                  <span className="text-3xl">{MOVE_EMOJI[String(bigResult.userMove)] ?? "?"}</span>
                  <span className="text-white/40 font-bold text-sm">vs</span>
                  <span className="text-3xl">{MOVE_EMOJI[String(bigResult.aiMove)] ?? "🤖"}</span>
                </div>
                <p className="text-[10px] text-white/60 mt-2 font-display tracking-widest text-center max-w-[80%]">
                  {bigResult.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom: gesture display */}
          <div className="pb-4 px-3 pointer-events-auto space-y-2">
            <GestureDisplay
              status={detection.status}
              detectedMove={detection.detectedMove}
              capturedMove={detection.capturedMove}
              confidence={detection.confidence}
              lastResult={game.lastResult}
              isBatting={game.isBatting}
              hint={detection.hint}
              handDetected={detection.handDetected}
              compact
            />
          </div>
        </div>
      )}

      {/* PICKER STAGE */}
      {stage === "picker" && (
        <div className="absolute inset-0 z-30 overflow-y-auto bg-black/85 backdrop-blur-sm pt-16 pb-6 px-4">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-center space-y-1">
              <p className="font-display text-[10px] text-primary tracking-[0.3em] font-bold">PRO MODE</p>
              <h2 className="font-display text-2xl font-black text-white">Pick Your Players</h2>
              <p className="text-[11px] text-white/60">Stats drive every ball. Pitch + phase modify outcomes.</p>
            </div>

            {playersLoading && <p className="text-center text-white/50 text-sm py-8">Loading players…</p>}

            {!playersLoading && players && (
              <>
                <PlayerPicker
                  label="YOUR BATSMAN"
                  accent="hsl(217 91% 60%)"
                  players={players.filter(p => p.role !== "bowler")}
                  selectedId={batsmanId}
                  onSelect={setBatsmanId}
                />
                <PlayerPicker
                  label="YOUR BOWLER"
                  accent="hsl(280 85% 65%)"
                  players={players.filter(p => p.role === "bowler" || p.role === "all_rounder")}
                  selectedId={bowlerId}
                  onSelect={setBowlerId}
                />
                <PlayerPicker
                  label="AI BATSMAN"
                  accent="hsl(0 84% 60%)"
                  players={players.filter(p => p.role !== "bowler")}
                  selectedId={opponentBatId}
                  onSelect={setOpponentBatId}
                />
                <PlayerPicker
                  label="AI BOWLER"
                  accent="hsl(43 93% 58%)"
                  players={players.filter(p => p.role === "bowler" || p.role === "all_rounder")}
                  selectedId={opponentBowlId}
                  onSelect={setOpponentBowlId}
                />

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={!batsmanId || !bowlerId || !opponentBatId || !opponentBowlId}
                  onClick={() => setStage("overs")}
                  className="w-full py-4 font-display font-black text-sm tracking-[0.2em] rounded-2xl text-white disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, hsl(200 90% 50%), hsl(260 80% 50%))",
                    boxShadow: "0 0 24px hsl(200 90% 55% / 0.5)",
                  }}
                >
                  CONTINUE →
                </motion.button>
              </>
            )}
          </div>
        </div>
      )}

      {/* OVERS STAGE */}
      {stage === "overs" && (
        <div className="absolute bottom-0 left-0 right-0 z-30 max-w-lg mx-auto w-full px-3 pb-4">
          <div className="rounded-t-3xl px-4 pt-4 pb-6"
            style={{
              background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
              border: "2px solid hsl(220 15% 18%)",
            }}>
            <OverSelector playerXP={9999} onSelect={handleOverSelect} />
          </div>
        </div>
      )}

      {/* FINISHED */}
      {game.phase === "finished" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pb-10 px-6 bg-black/70">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4 max-w-xs w-full">
            <p className="font-display text-6xl font-black"
              style={{
                color: game.result === "win" ? "hsl(142 71% 55%)" : game.result === "loss" ? "hsl(0 84% 60%)" : "white",
                textShadow: "0 0 40px currentColor",
              }}>
              {game.result === "win" ? "WIN!" : game.result === "loss" ? "LOSS" : "DRAW"}
            </p>
            <p className="text-white/80 font-display text-lg">
              {game.userScore}/{game.userWickets} vs {game.aiScore}/{game.aiWickets}
            </p>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleNewMatch}
                className="flex-1 py-3 font-display font-bold text-sm tracking-wider rounded-2xl text-white"
                style={{ background: "linear-gradient(135deg, hsl(200 90% 50%), hsl(260 80% 50%))" }}>
                ⚡ NEW MATCH
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onHome}
                className="flex-1 py-3 bg-black/60 text-white font-display font-bold rounded-2xl tracking-wider border border-white/10">
                HOME
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── Inline engine ticker ──
function EngineTicker({ pitch, phase, situation, last }: {
  pitch: PitchType;
  phase: MatchPhase;
  situation: string;
  last: EngineBallResult | null;
}) {
  const lastTxt = last
    ? last.isWicket
      ? `OUT · ${last.dismissalType?.replace(/_/g, " ")}`
      : last.isWide
      ? "WIDE"
      : last.isNoBall
      ? `NO-BALL +${last.runs}`
      : last.isDefenseScored
      ? `DEF→${last.runs}`
      : `${last.runs}r`
    : "—";

  return (
    <div className="rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 text-[9px] font-display font-bold tracking-wider"
      style={{
        background: "linear-gradient(90deg, hsl(200 90% 15% / 0.85), hsl(260 80% 15% / 0.85))",
        border: "1px solid hsl(200 90% 45% / 0.4)",
        boxShadow: "0 0 12px hsl(200 90% 55% / 0.2)",
      }}>
      <span className="text-cyan-300">🧪 ENGINE</span>
      <span className="text-white/80">{PITCH_LABEL[pitch]}</span>
      <span className="text-yellow-300">{PHASE_LABEL[phase]}</span>
      <span className={
        situation === "critical" ? "text-red-400" :
        situation === "tense" ? "text-orange-400" :
        situation === "tight" ? "text-yellow-300" : "text-green-400"
      }>{situation.toUpperCase()}</span>
      <span className="text-white">{lastTxt}</span>
    </div>
  );
}

// ── Compact score strip ──
function ScoreStrip({ game, batsmanName, bowlerName }: {
  game: import("@/hooks/useHandCricket").GameState;
  batsmanName: string;
  bowlerName: string;
}) {
  const needRuns = game.target && game.isBatting && game.phase !== "finished"
    ? Math.max(0, game.target - game.userScore)
    : null;
  return (
    <div className="rounded-2xl px-3 py-2"
      style={{
        background: "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(220 12% 8%) 100%)",
        border: "2px solid hsl(220 15% 18%)",
      }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="text-[7px] text-muted-foreground font-bold block tracking-widest">{batsmanName.toUpperCase().slice(0, 8)}</span>
            <span className="font-display text-xl font-black text-score-gold leading-none">{game.userScore}</span>
            {game.userWickets > 0 && <span className="text-[9px] text-out-red font-bold">/{game.userWickets}</span>}
          </div>
          <span className="text-[8px] font-display text-muted-foreground font-bold">VS</span>
          <div className="text-center">
            <span className="text-[7px] text-muted-foreground font-bold block tracking-widest">{bowlerName.toUpperCase().slice(0, 8)}</span>
            <span className="font-display text-xl font-black text-accent leading-none">{game.aiScore}</span>
            {game.aiWickets > 0 && <span className="text-[9px] text-out-red font-bold">/{game.aiWickets}</span>}
          </div>
        </div>
        <div className="text-right space-y-0.5">
          {game.target && game.phase !== "finished" && (
            <span className="text-[8px] font-display font-bold text-secondary block tracking-wider">TGT: {game.target}</span>
          )}
          {needRuns !== null && (
            <span className="text-[8px] font-display font-bold text-primary">NEED {needRuns}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Player picker carousel ──
function PlayerPicker({ label, accent, players, selectedId, onSelect }: {
  label: string;
  accent: string;
  players: DBPlayer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const selected = players.find(p => p.id === selectedId);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-display text-[10px] font-bold tracking-[0.2em]" style={{ color: accent }}>{label}</p>
        {selected?.special_ability_name && (
          <p className="text-[9px] text-white/50 font-display">⚡ {selected.special_ability_name}</p>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
        {players.slice(0, 20).map(p => {
          const isSel = p.id === selectedId;
          return (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(p.id)}
              className="flex-shrink-0 snap-start rounded-xl px-3 py-2 text-left min-w-[120px]"
              style={{
                background: isSel
                  ? `linear-gradient(135deg, ${accent}33, ${accent}11)`
                  : "hsl(220 15% 14%)",
                border: `2px solid ${isSel ? accent : "hsl(220 15% 22%)"}`,
                boxShadow: isSel ? `0 0 16px ${accent}66` : "none",
              }}
            >
              <p className="font-display text-[10px] font-black text-white truncate">{p.short_name || p.name}</p>
              <p className="text-[8px] text-white/50 font-bold">{roleLabel(p.role)} · {overallRating(p)} OVR</p>
              <div className="flex gap-1 mt-1 text-[7px] font-bold">
                <span className="text-orange-300">PWR {p.power}</span>
                <span className="text-blue-300">TEC {p.technique}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
