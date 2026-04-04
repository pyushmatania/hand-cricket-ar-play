import { useRef, useCallback, useState, useEffect } from "react";
import { useScreenShake } from "@/hooks/useScreenShake";
import { getThemeById } from "@/lib/matchThemes";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import CameraFeed, { type CameraFeedHandle, type CameraFilter } from "./CameraFeed";
import HandOverlay from "./HandOverlay";
import GestureDisplay from "./GestureDisplay";
import RulesSheet from "./RulesSheet";
import OverSelector from "./OverSelector";
import CelebrationEffects from "./CelebrationEffects";
import CanvasFireworks, { type FireworkType } from "./CanvasFireworks";
import EnhancedPreMatch from "./EnhancedPreMatch";
import EnhancedPostMatch from "./EnhancedPostMatch";
import CrowdWave from "./CrowdWave";
import DRSReview from "./DRSReview";
import { useHandCricket } from "@/hooks/useHandCricket";
import { useHandDetection } from "@/hooks/useHandDetection";
import { useMatchSaver } from "@/hooks/useMatchSaver";
import { startAmbientStadium, stopAmbientStadium, setAmbientVolume } from "@/lib/ambientStadium";
import { getInningsChangeCommentary } from "@/lib/commentary";
import { speakDuoCommentary, speakCommentary } from "@/lib/voiceCommentary";
import { useSettings } from "@/contexts/SettingsContext";
import { pickConfiguredMatchCommentators, getDuoCommentary, type Commentator, type CommentaryLine } from "@/lib/commentaryDuo";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { BallResult, Move } from "@/hooks/useHandCricket";
import { useEngines } from "@/hooks/useEngines";
import { WeatherParticles } from "./WeatherParticles";
import BallPitchAnimation from "./BallPitchAnimation";
import StadiumEstablishingShot from "./StadiumEstablishingShot";
import TeamLineupWalkout from "./TeamLineupWalkout";

const MOVE_EMOJI: Record<string, string> = {
  DEF: "✊", "1": "☝️", "2": "✌️", "3": "🤟", "4": "🖖", "6": "👍",
};

type TossStep = "choose_oe" | "show_number" | "reveal" | "pick_innings" | null;

interface GameScreenProps {
  onHome: () => void;
}

type GloveStyle = "cricket" | "neon" | "outline" | "off";

const FILTER_OPTIONS: { key: CameraFilter; label: string; icon: string }[] = [
  { key: "broadcast", label: "TV", icon: "📺" },
  { key: "stadium_night", label: "Night", icon: "🌙" },
  { key: "arcade", label: "Arcade", icon: "🕹️" },
  { key: "natural", label: "Raw", icon: "👁️" },
];

const GLOVE_OPTIONS: { key: GloveStyle; label: string }[] = [
  { key: "cricket", label: "🧤" },
  { key: "neon", label: "💚" },
  { key: "outline", label: "💎" },
  { key: "off", label: "✋" },
];

export default function GameScreen({ onHome }: GameScreenProps) {
  const location = useLocation();
  const arenaImage = (location.state as any)?.arenaImage as string | undefined;
  const arenaId = (location.state as any)?.arenaId as string | undefined;
  const themeId = (location.state as any)?.themeId as string | undefined;
  const matchTheme = getThemeById(themeId || localStorage.getItem("selectedTheme") || "gully");
  const cameraRef = useRef<CameraFeedHandle>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const { game, startGame, playBall, resetGame } = useHandCricket();
  const { saveMatch } = useMatchSaver();
  const { soundEnabled, hapticsEnabled, commentaryEnabled, voiceEnabled, crowdEnabled, voiceEngine, commentaryVoice, commentaryLanguage, musicEnabled, ambientVolume, arCeremoniesEnabled } = useSettings();
  const engines = useEngines();
  const shake = useScreenShake();
  const detection = useHandDetection(videoElementRef);
  const [matchConfig, setMatchConfig] = useState<import("@/hooks/useHandCricket").MatchConfig | null>(null);
  const [showOverSelector, setShowOverSelector] = useState(true);

  // ── Gesture toss state ──
  const [tossStep, setTossStep] = useState<TossStep>(null);
  const [tossAiCall, setTossAiCall] = useState<"odd" | "even" | null>(null);
  const [tossPlayerOE, setTossPlayerOE] = useState<"odd" | "even" | null>(null);
  const [tossPlayerNum, setTossPlayerNum] = useState<number | null>(null);
  const [tossAiNum, setTossAiNum] = useState<number | null>(null);
  const [tossWon, setTossWon] = useState<boolean | null>(null);
  const [tossReveal, setTossReveal] = useState(0); // 0-3 reveal steps

  // ── Game-start countdown ──
  const [gameCdVal, setGameCdVal] = useState<3 | 2 | 1 | null>(null);

  // ── Big result animation ──
  const [bigResult, setBigResult] = useState<BallResult | null>(null);
  const [playerXP, setPlayerXP] = useState(0);
  const [matchRewards, setMatchRewards] = useState<any>(null);
  const [stadiumMode, setStadiumMode] = useState(true);
  const [filter, setFilter] = useState<CameraFilter>("broadcast");
  const [gloveStyle, setGloveStyle] = useState<GloveStyle>("cricket");
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [commentary, setCommentary] = useState<CommentaryLine[] | null>(null);
  const savedRef = useRef(false);
  const [matchCommentators] = useState<[Commentator, Commentator]>(() => pickConfiguredMatchCommentators(commentaryVoice));
  const prevPhaseRef = useRef(game.phase);
  const [crowdWaveActive, setCrowdWaveActive] = useState(false);
  const [crowdWaveIntensity, setCrowdWaveIntensity] = useState<"normal" | "big" | "massive">("normal");
  const [drsActive, setDrsActive] = useState(false);
  const [drsDismissal, setDrsDismissal] = useState<'lbw' | 'caught_behind' | 'caught' | null>(null);
  const [drsOutcome, setDrsOutcome] = useState<'out' | 'not_out'>('out');

  // Wire Mexican Wave from CrowdEngine
  useEffect(() => {
    engines.crowd.setOnMexicanWave(() => {
      const mood = engines.crowd.getMood();
      setCrowdWaveIntensity(mood >= 95 ? 'massive' : mood >= 80 ? 'big' : 'normal');
      setCrowdWaveActive(true);
      setTimeout(() => setCrowdWaveActive(false), 3000);
    });
  }, [engines]);

  // Pick weather from theme's weather pool
  const [matchWeather] = useState(() => {
    const pool = matchTheme.weatherPool;
    if (!pool.length) return matchTheme.defaultWeather;
    return pool[Math.floor(Math.random() * pool.length)];
  });

  // Apply theme's commentary tone config
  useEffect(() => {
    engines.commentary.setToneConfig({
      tone: matchTheme.commentary.tone,
      speechRate: matchTheme.commentary.speechRate,
      frequency: matchTheme.commentary.frequency,
      preferredLanguage: matchTheme.commentary.preferredLanguage,
    });
    engines.commentary.setTheme(matchTheme.id);
  }, [matchTheme]);

  // Apply theme's crowd config
  useEffect(() => {
    engines.crowd.setThemeConfig({
      type: matchTheme.crowd.type,
      count: matchTheme.crowd.count,
      baseNoise: matchTheme.crowd.noise,
      chantStyle: matchTheme.crowd.chantStyle,
      reactionSpeed: matchTheme.crowd.reactionSpeed,
      peakEvents: matchTheme.crowd.peakEvents,
    });
  }, [matchTheme]);

  // Apply weather modifiers to gameplay engine
  useEffect(() => {
    engines.weather.setWeather(matchWeather, {
      lighting: engines.lighting,
      sound: engines.sound,
      gameplay: engines.gameplay,
      innings: game.currentInnings,
    });
  }, [matchWeather, game.currentInnings]);

  // Tension vignette — intensifies in tight/critical situations
  useEffect(() => {
    if (!game.isBatting && game.phase === 'finished') {
      engines.lighting.setVignette(0);
      return;
    }
    const totalBalls = game.currentInnings === 1 ? game.innings1Balls : game.innings2Balls;
    const totalOvers = matchConfig?.overs || 5;
    const ballsLeft = totalOvers * 6 - totalBalls;
    const isLastOver = ballsLeft <= 6;
    const isCloseTarget = game.target ? (game.target - game.userScore) <= 10 && (game.target - game.userScore) > 0 : false;

    if (isLastOver && isCloseTarget) {
      engines.lighting.setVignette(0.35);
    } else if (isLastOver || isCloseTarget) {
      engines.lighting.setVignette(0.2);
    } else if (game.userWickets >= 7 || game.aiWickets >= 7) {
      engines.lighting.setVignette(0.25);
    } else {
      engines.lighting.setVignette(0);
    }
  }, [game.innings1Balls, game.innings2Balls, game.userScore, game.aiScore, game.userWickets, game.aiWickets, game.target, game.phase]);
  useEffect(() => {
    if (soundEnabled && musicEnabled && !game.result) {
      startAmbientStadium(ambientVolume, arenaId);
    } else {
      stopAmbientStadium();
    }
    return () => { stopAmbientStadium(); };
  }, [soundEnabled, musicEnabled, game.result, arenaId]);

  useEffect(() => {
    if (soundEnabled && musicEnabled) setAmbientVolume(ambientVolume);
  }, [ambientVolume, soundEnabled, musicEnabled]);

  // Fireworks state
  const [fireworkType, setFireworkType] = useState<FireworkType | null>(null);

  // Ceremony states
  const [showEstablishingShot, setShowEstablishingShot] = useState(false);
  const [showPreMatch, setShowPreMatch] = useState(false);
  const [showPostMatch, setShowPostMatch] = useState(false);
  const [tossInfo, setTossInfo] = useState<{ winner: string; battingFirst: string } | null>(null);
  const [pendingBatFirst, setPendingBatFirst] = useState<boolean | null>(null);
  const postMatchShownRef = useRef(false);

  const { user } = useAuth();
  const [playerName, setPlayerName] = useState("You");
  const opponentName = "Rohit AI";

  // Fetch display name from profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, xp")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setPlayerName(data.display_name);
        if ((data as any)?.xp) setPlayerXP((data as any).xp);
      });
  }, [user]);

  // After OverSelector → start gesture toss
  const handleOverSelect = (config: import("@/hooks/useHandCricket").MatchConfig) => {
    setMatchConfig(config);
    setShowOverSelector(false);
    const aiCall: "odd" | "even" = Math.random() > 0.5 ? "odd" : "even";
    setTossAiCall(aiCall);
    setTossStep("choose_oe");
  };

  // Player picks ODD or EVEN
  const handleTossOEChoice = (choice: "odd" | "even") => {
    setTossPlayerOE(choice);
    setTossStep("show_number");
  };

  // Gesture captured during toss
  const handleTossGesture = useCallback((move: Move) => {
    if (move === "DEF") return; // fist not valid for toss
    const pNum = move as number;
    const aiNum = [1, 2, 3, 4, 6][Math.floor(Math.random() * 5)];
    const sum = pNum + aiNum;
    const sumEven = sum % 2 === 0;
    setTossPlayerNum(pNum);
    setTossAiNum(aiNum);
    setTossReveal(0);
    setTossStep("reveal");
    // staggered reveal
    setTimeout(() => setTossReveal(1), 600);
    setTimeout(() => setTossReveal(2), 1200);
    setTimeout(() => {
      setTossReveal(3);
      setTossWon((prev) => {
        // need tossPlayerOE at this point — read from closure
        return prev; // computed below via functional update
      });
    }, 1800);
    // compute winner outside the staggered chain so we have tossPlayerOE in scope
    setTossPlayerOE((oe) => {
      const won = oe === "even" ? sumEven : !sumEven;
      setTossWon(won);
      if (!won) {
        const aiBats = Math.random() > 0.5;
        setTimeout(() => startMatchWithCountdown(aiBats), 3500);
      }
      return oe;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchConfig]);

  // Launch game with 3-2-1 countdown
  const startMatchWithCountdown = useCallback((batFirst: boolean) => {
    if (!matchConfig) return;
    setTossStep(null);
    detection.setOnAutoCapture(null);
    setGameCdVal(3);
    setTimeout(() => setGameCdVal(2), 1000);
    setTimeout(() => setGameCdVal(1), 2000);
    setTimeout(() => {
      setGameCdVal(null);
      if (arCeremoniesEnabled && tossInfo) {
        setPendingBatFirst(batFirst);
        setShowEstablishingShot(true);
      } else {
        startGame(batFirst, matchConfig);
      }
    }, 3000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchConfig, arCeremoniesEnabled, tossInfo]);

  const handleEstablishingShotComplete = () => {
    setShowEstablishingShot(false);
    setShowPreMatch(true);
  };

  const handlePreMatchComplete = () => {
    setShowPreMatch(false);
    if (pendingBatFirst !== null && matchConfig) {
      startGame(pendingBatFirst, matchConfig);
    }
  };

  // Auto-save match when game finishes + trigger post-match ceremony
  useEffect(() => {
    if (game.phase === "finished" && !savedRef.current) {
      savedRef.current = true;
      saveMatch(game, "ar").then((rewards) => {
        if (rewards) setMatchRewards(rewards);
      });

      // Emit match end through engine (handles all SFX, haptics, crowd)
      engines.event.emit('MATCH_END', { result: game.result });

      if (game.result === "win") {
        setFireworkType("win");
      }

      if (!postMatchShownRef.current) {
        postMatchShownRef.current = true;
        if (arCeremoniesEnabled) {
          setTimeout(() => setShowPostMatch(true), game.result === "win" ? 2500 : 1000);
        }
      }
    }
  }, [game.phase, game, saveMatch]);

  // Clear fireworks after duration
  useEffect(() => {
    if (fireworkType) {
      const t = setTimeout(() => setFireworkType(null), fireworkType === "win" ? 5000 : 3000);
      return () => clearTimeout(t);
    }
  }, [fireworkType]);

  // Innings change — emit through engine + commentary
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = game.phase;
    if (prev !== game.phase && game.phase !== "not_started" && game.phase !== "finished") {
      // Update engine perspective based on batting/bowling
      engines.setPerspective(game.isBatting ? 'batting' : 'bowling');
      engines.event.emit('INNINGS_START', {});

      if (commentaryEnabled) {
        const text = getInningsChangeCommentary(game);
        const lines: CommentaryLine[] = [
          { commentatorId: matchCommentators[0].name, text, isKeyMoment: true },
        ];
        setCommentary(lines);
        if (voiceEnabled) {
          speakDuoCommentary(lines, matchCommentators, voiceEngine);
        }
        setTimeout(() => setCommentary(null), 3000);
      }
    }
  }, [game.phase]);

  // Ball result sounds, commentary & fireworks
  useEffect(() => {
    if (!game.lastResult) return;
    const r = game.lastResult;

    // ── Fire engine events for the ball result ──
    const context = {
      innings: game.currentInnings,
      over: Math.floor((game.currentInnings === 1 ? game.innings1Balls : game.innings2Balls) / 6),
      ball: (game.currentInnings === 1 ? game.innings1Balls : game.innings2Balls) % 6,
      phase: 'middle' as const,
      battingTeam: game.isBatting ? playerName : opponentName,
      bowlingTeam: game.isBatting ? opponentName : playerName,
      score: game.isBatting ? game.userScore : game.aiScore,
      wickets: game.isBatting ? game.userWickets : game.aiWickets,
      target: game.target,
      requiredRunRate: null,
      currentRunRate: 0,
      lastFewBalls: [],
      matchSituation: 'comfortable' as const,
      isLastOver: false,
      isMatchPoint: false,
    };

    if (r.runs === "OUT") {
      engines.event.emit('WICKET_BOWLED', { ...r, context });
    } else if (typeof r.runs === "number") {
      if (r.runs === 6) {
        engines.event.emit('BOUNDARY_SIX', { ...r, runs: 6, context });
      } else if (r.runs === 4) {
        engines.event.emit('BOUNDARY_FOUR', { ...r, runs: 4, context });
      } else if (r.runs === 0) {
        engines.event.emit('RUNS_SCORED', { ...r, runs: 0, context });
      } else {
        engines.event.emit('RUNS_SCORED', { ...r, runs: r.runs, context });
      }
    }

    // ── Visual effects (screen shake + fireworks + DRS) ──
    if (r.runs === "OUT") {
      shake("heavy");
      setFireworkType("wicket");

      // 25% chance to trigger DRS review on LBW/caught dismissals for dramatic effect
      if (Math.random() < 0.25) {
        const dismissalTypes: Array<'lbw' | 'caught_behind' | 'caught'> = ['lbw', 'caught_behind', 'caught'];
        const randomDismissal = dismissalTypes[Math.floor(Math.random() * dismissalTypes.length)];
        setDrsDismissal(randomDismissal);
        setDrsOutcome('out'); // Always confirms out (it's dramatic effect)
        setDrsActive(true);
      }
    } else if (typeof r.runs === "number") {
      if (r.runs === 6) {
        shake("medium");
        setFireworkType("six");
      } else if (r.runs === 4) {
        shake("light");
        setFireworkType("four");
      }
    }

    // ── Commentary (still uses duo system for now) ──
    if (commentaryEnabled) {
      const duoLines = getDuoCommentary(
        matchCommentators[0].name, matchCommentators[1].name,
        r.runs, game.isBatting, playerName, opponentName,
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
      setTimeout(() => setCommentary(null), 2500);
    }
  }, [game.lastResult]);

  const handleVideoReady = useCallback(
    (video: HTMLVideoElement) => {
      videoElementRef.current = video;
      detection.startDetection();
    },
    [detection]
  );

  // Route gesture captures: toss OR game
  useEffect(() => {
    if (tossStep === "show_number") {
      detection.setOnAutoCapture(handleTossGesture);
    } else if (game.phase !== "not_started" && game.phase !== "finished") {
      detection.setOnAutoCapture((move) => playBall(move));
    } else {
      detection.setOnAutoCapture(null);
    }
  }, [tossStep, game.phase, detection.setOnAutoCapture, playBall, handleTossGesture]);

  // Reset tracking on innings change
  useEffect(() => {
    if (game.phase !== "not_started" && game.phase !== "finished") {
      detection.resetToFist();
    }
  }, [game.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Big result animation
  useEffect(() => {
    if (!game.lastResult) return;
    setBigResult(game.lastResult);
    const t = setTimeout(() => setBigResult(null), 1800);
    return () => clearTimeout(t);
  }, [game.lastResult]);

  const handleStartNew = () => {
    resetGame();
    setPendingBatFirst(null);
    setTossInfo(null);
    setFireworkType(null);
    setShowEstablishingShot(false);
    setShowPreMatch(false);
    setShowPostMatch(false);
    savedRef.current = false;
    postMatchShownRef.current = false;
    setMatchConfig(null);
    setShowOverSelector(true);
    setTossStep(null);
    setTossAiCall(null);
    setTossPlayerOE(null);
    setTossPlayerNum(null);
    setTossAiNum(null);
    setTossWon(null);
    setTossReveal(0);
    setGameCdVal(null);
    setBigResult(null);
    detection.resetToFist();
  };

  const videoW = videoElementRef.current?.videoWidth || 640;
  const videoH = videoElementRef.current?.videoHeight || 480;
  const isFrontCamera = cameraRef.current?.videoRef?.current
    ? (cameraRef.current.videoRef.current.className || "").includes("scale-x-[-1]")
    : false;

  const isPreGame = game.phase === "not_started" && !showPreMatch && !showEstablishingShot && gameCdVal === null;
  const isInGame = game.phase !== "not_started" && game.phase !== "finished";

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <CelebrationEffects lastResult={game.lastResult} gameResult={game.result} phase={game.phase} />
      <CanvasFireworks type={fireworkType} duration={fireworkType === "win" ? 5000 : 3000} />
      <WeatherParticles weather={matchWeather} />
      <BallPitchAnimation lastResult={game.lastResult} triggerKey={game.innings1Balls + game.innings2Balls} />
      <CrowdWave active={crowdWaveActive} intensity={crowdWaveIntensity} />
      <DRSReview
        active={drsActive}
        dismissalType={drsDismissal}
        outcome={drsOutcome}
        onComplete={() => setDrsActive(false)}
      />

      {/* Camera fills the full screen */}
      <div className="absolute inset-0">
        <CameraFeed ref={cameraRef} onVideoReady={handleVideoReady} stadiumMode={stadiumMode} fullscreen filter={filter} />
        <HandOverlay
          landmarks={detection.landmarks}
          videoWidth={videoW}
          videoHeight={videoH}
          status={detection.status}
          gloveStyle={gloveStyle}
          mirrored={isFrontCamera}
        />
      </div>

      {/* Stadium establishing shot — plays before pre-match */}
      {showEstablishingShot && (
        <StadiumEstablishingShot
          playerName={playerName}
          opponentName={opponentName}
          arenaName={matchTheme?.name || "Stadium"}
          onComplete={handleEstablishingShotComplete}
        />
      )}

      {/* Pre-match ceremony */}
      {showPreMatch && tossInfo && (
        <EnhancedPreMatch
          playerName={playerName}
          opponentName={opponentName}
          tossWinner={tossInfo.winner}
          battingFirst={tossInfo.battingFirst}
          commentators={matchCommentators}
          onComplete={handlePreMatchComplete}
        />
      )}

      {/* Post-match ceremony */}
      {showPostMatch && game.result && (
        <EnhancedPostMatch
          playerName={playerName}
          opponentName={opponentName}
          result={game.result}
          playerScore={game.userScore}
          opponentScore={game.aiScore}
          ballHistory={game.ballHistory}
          commentators={matchCommentators}
          matchRewards={matchRewards}
          onComplete={() => setShowPostMatch(false)}
        />
      )}

      {/* ── TOP BAR ── always visible as overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-3 pb-2 pointer-events-auto"
        style={{ background: "linear-gradient(to bottom, hsl(25 15% 8% / 0.85) 0%, transparent 100%)" }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onHome}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm text-white"
          style={{
            background: "linear-gradient(180deg, hsl(25 18% 16%), hsl(25 15% 11%))",
            border: "2px solid hsl(25 20% 22%)",
            borderBottom: "3px solid hsl(25 20% 8%)",
            boxShadow: "0 2px 0 hsl(25 20% 6%), 0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          ←
        </motion.button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: "linear-gradient(180deg, hsl(25 18% 16%), hsl(25 15% 11%))",
            border: "2px solid hsl(25 20% 22%)",
            boxShadow: "0 2px 0 hsl(25 20% 6%), 0 2px 8px rgba(0,0,0,0.4)",
          }}>
          <div className="w-1.5 h-1.5 rounded-full bg-out-red animate-pulse" />
          <span className="font-game-display text-[9px] tracking-[0.2em] text-foreground font-bold">AR CRICKET</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStadiumMode(!stadiumMode)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] active:scale-90 transition-all ${
              stadiumMode ? "bg-primary/30 border border-primary/40" : "bg-black/50 border border-white/10"
            } backdrop-blur-md`}
          >
            🏟️
          </button>
          <button
            onClick={() => setShowFilterPicker(!showFilterPicker)}
            className="w-8 h-8 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-[10px] active:scale-90 transition-all"
          >
            🎨
          </button>
          <button
            onClick={() => {
              const opts: GloveStyle[] = ["cricket", "neon", "outline", "off"];
              setGloveStyle(opts[(opts.indexOf(gloveStyle) + 1) % opts.length]);
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] active:scale-90 transition-all ${
              gloveStyle !== "off" ? "bg-primary/30 border border-primary/40" : "bg-black/50 border border-white/10"
            } backdrop-blur-md`}
          >
            🧤
          </button>
          <RulesSheet />
        </div>
      </div>

      {/* Filter picker dropdown */}
      <AnimatePresence>
        {showFilterPicker && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-14 right-3 z-40 rounded-xl p-2.5 space-y-2"
            style={{
              background: "linear-gradient(180deg, hsl(25 18% 16%), hsl(25 15% 11%))",
              border: "2px solid hsl(25 20% 22%)",
              boxShadow: "0 4px 0 hsl(25 20% 6%), 0 6px 20px rgba(0,0,0,0.6)",
            }}
          >
            <p className="text-[7px] font-game-display font-bold text-muted-foreground tracking-widest px-1">FILTER</p>
            <div className="flex gap-1">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => { setFilter(f.key); setShowFilterPicker(false); }}
                  className={`px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                    filter === f.key ? "bg-primary/30 text-primary border border-primary/30" : "bg-white/10 text-white/60 border border-transparent"
                  }`}
                >
                  {f.icon}
                </button>
              ))}
            </div>
            <p className="text-[7px] font-display font-bold text-white/60 tracking-widest px-1 pt-0.5">GLOVE</p>
            <div className="flex gap-1">
              {GLOVE_OPTIONS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => { setGloveStyle(g.key); setShowFilterPicker(false); }}
                  className={`px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                    gloveStyle === g.key ? "bg-primary/30 text-primary border border-primary/30" : "bg-white/10 text-white/60 border border-transparent"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── IN-GAME OVERLAYS ── */}
      {isInGame && (
        <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
          {/* Score strip at top (below top bar) */}
          <div className="pt-16 px-3 pointer-events-auto">
            <ImmersiveScoreStrip game={game} playerName={playerName} aiName={opponentName} weather={matchWeather} />
          </div>

          {/* ── BIG RESULT ANIMATION ── */}
          <AnimatePresence>
            {bigResult && (
              <motion.div
                key={`br-${bigResult.runs}`}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ type: "spring", damping: 14, stiffness: 200 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[25]"
              >
                {bigResult.runs === "OUT" ? (
                  <p className="font-display font-black leading-none" style={{ fontSize: 96, color: "#ef4444", textShadow: "0 0 80px #ef4444, 0 0 30px #ef4444" }}>OUT!</p>
                ) : bigResult.runs === 0 ? (
                  <p className="font-display font-black leading-none" style={{ fontSize: 80, color: "rgba(255,255,255,0.7)", textShadow: "0 0 40px white" }}>DEF</p>
                ) : (
                  <p className="font-display font-black leading-none" style={{
                    fontSize: 120,
                    color: bigResult.runs === 6 ? "hsl(45 93% 58%)" : bigResult.runs === 4 ? "hsl(142 71% 55%)" : "white",
                    textShadow: bigResult.runs === 6 ? "0 0 80px gold, 0 0 30px gold" : bigResult.runs === 4 ? "0 0 60px lime" : "0 0 50px rgba(255,255,255,0.7)",
                  }}>{bigResult.runs}</p>
                )}
                <div className="flex items-center gap-3 mt-3 bg-black/50 backdrop-blur-md rounded-2xl px-5 py-2 border border-white/10">
                  <span className="text-3xl">{MOVE_EMOJI[String(bigResult.userMove)] ?? "?"}</span>
                  <span className="text-white/40 font-bold text-sm">vs</span>
                  <span className="text-3xl">{MOVE_EMOJI[String(bigResult.aiMove)] ?? "🤖"}</span>
                </div>
                <p className="text-[10px] text-white/50 mt-2 font-display tracking-widest">
                  {bigResult.runs === "OUT" ? "WICKET!" : bigResult.runs === 0 ? "DEFENDED" : bigResult.runs === 6 ? "SIX!" : bigResult.runs === 4 ? "FOUR!" : `${bigResult.runs} RUNS`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center: live gesture preview / cooldown — hidden during big result */}
          {!bigResult && (
            <div className="flex items-center justify-center pointer-events-none">
              <AnimatePresence mode="wait">
                {detection.phase === "tracking_active" && detection.detectedMove && (
                  <motion.div
                    key={`live-${detection.detectedMove}`}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="text-center"
                  >
                    <motion.p
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="font-display font-black text-white leading-none"
                      style={{ fontSize: 80, textShadow: "0 0 30px rgba(255,255,255,0.5)" }}
                    >
                      {MOVE_EMOJI[String(detection.detectedMove)] ?? String(detection.detectedMove)}
                    </motion.p>
                    <p className="font-display text-xl font-black text-white/80 mt-1">
                      {detection.detectedMove === "DEF" ? "DEF" : detection.detectedMove}
                    </p>
                    <div className="mt-2 h-1.5 w-28 mx-auto rounded-full bg-white/20 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        animate={{ width: `${Math.round(detection.confidence * 100)}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </motion.div>
                )}
                {detection.phase === "captured" && detection.capturedMove && (
                  <motion.div
                    key="captured"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [0.5, 1.3, 1], opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <p className="font-display font-black leading-none" style={{ fontSize: 90, color: "hsl(217 91% 60%)", textShadow: "0 0 60px hsl(217 91% 60%)" }}>
                      {MOVE_EMOJI[String(detection.capturedMove)] ?? String(detection.capturedMove)}
                    </p>
                    <p className="font-display text-sm font-black text-primary mt-1 tracking-widest">LOCKED IN!</p>
                  </motion.div>
                )}
                {detection.phase === "cooldown" && (
                  <motion.div
                    key="cooldown"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center bg-black/50 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10"
                  >
                    <motion.p
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      className="text-4xl mb-1"
                    >🏏</motion.p>
                    <p className="font-display text-sm font-black text-white tracking-wider">NEXT BALL</p>
                    <p className="text-[10px] text-white/50 mt-1">Show your shot…</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

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
            <button onClick={handleStartNew} className="text-[10px] text-white/30 underline self-center block w-full text-center active:scale-95 font-display tracking-wider">
              Reset Match
            </button>
          </div>
        </div>
      )}

      {/* ── 3-2-1 GAME START COUNTDOWN ── */}
      <AnimatePresence>
        {gameCdVal !== null && (
          <motion.div
            key={`gcd-${gameCdVal}`}
            initial={{ scale: 2.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none"
          >
            <p className="font-display font-black leading-none" style={{ fontSize: 140, color: "white", textShadow: "0 0 80px rgba(255,255,255,0.8)" }}>
              {gameCdVal}
            </p>
            <p className="font-display text-lg font-bold text-white/60 tracking-[0.3em] mt-2">GET READY</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PRE-GAME: OverSelector bottom sheet ── */}
      {isPreGame && showOverSelector && (
        <div className="absolute bottom-0 left-0 right-0 z-30 max-w-lg mx-auto w-full px-3 pb-4">
          <div className="rounded-t-3xl px-4 pt-4 pb-6"
            style={{
              background: "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 10%) 100%)",
              border: "2px solid hsl(25 20% 22%)",
              borderBottom: "none",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.5), inset 0 1px 0 hsl(35 40% 40% / 0.08)",
            }}>
            <OverSelector playerXP={playerXP} onSelect={handleOverSelect} />
          </div>
        </div>
      )}

      {/* ── GESTURE TOSS ── */}
      <AnimatePresence>
        {isPreGame && tossStep !== null && (
          <motion.div
            key="toss-overlay"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute bottom-0 left-0 right-0 z-30 max-w-lg mx-auto w-full px-3 pb-4"
          >
            <div className="rounded-t-3xl px-5 pt-5 pb-6 space-y-4"
              style={{
                background: "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 10%) 100%)",
                border: "2px solid hsl(25 20% 22%)",
                borderBottom: "none",
                boxShadow: "0 -4px 20px rgba(0,0,0,0.5), inset 0 1px 0 hsl(35 40% 40% / 0.08)",
              }}>
              {/* LIVE badge */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-out-red animate-pulse" />
                <span className="font-display text-[9px] text-out-red font-bold tracking-[0.25em]">LIVE · TOSS</span>
              </div>

              {/* Step: choose ODD or EVEN */}
              {tossStep === "choose_oe" && (
                <div className="space-y-3">
                  <p className="font-display text-sm font-black text-white text-center tracking-wider">
                    AI calls <span className={tossAiCall === "odd" ? "text-primary" : "text-accent"}>{tossAiCall?.toUpperCase()}</span>
                  </p>
                  <p className="text-[10px] text-white/60 text-center">You pick:</p>
                  <div className="flex gap-3">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleTossOEChoice("odd")}
                      className="flex-1 py-4 bg-primary/20 border border-primary/40 text-primary font-display font-black rounded-2xl text-sm tracking-wider">
                      ☝️ ODD
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleTossOEChoice("even")}
                      className="flex-1 py-4 bg-accent/20 border border-accent/40 text-accent font-display font-black rounded-2xl text-sm tracking-wider">
                      ✌️ EVEN
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Step: show your number with gesture */}
              {tossStep === "show_number" && (
                <div className="space-y-3 text-center">
                  <p className="font-display text-sm font-black text-white tracking-wider">
                    You: <span className={tossPlayerOE === "odd" ? "text-primary" : "text-accent"}>{tossPlayerOE?.toUpperCase()}</span>
                    {"  "}·{"  "}AI: <span className={tossAiCall === "odd" ? "text-primary" : "text-accent"}>{tossAiCall?.toUpperCase()}</span>
                  </p>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="text-5xl"
                  >✋</motion.div>
                  <p className="font-display text-base font-black text-white tracking-wider">Show 1–6 with your hand</p>
                  <p className="text-[10px] text-white/50">Hold the gesture steady until captured</p>
                  <div className="flex items-center justify-center gap-3 text-2xl opacity-50">
                    {["☝️","✌️","🤟","🖖","👍"].map(e => <span key={e}>{e}</span>)}
                  </div>
                  {detection.detectedMove && detection.detectedMove !== "DEF" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-primary/20 border border-primary/40 rounded-xl py-2 px-4 inline-block"
                    >
                      <span className="font-display text-sm font-black text-primary">
                        {MOVE_EMOJI[String(detection.detectedMove)]} {detection.detectedMove} detected…
                      </span>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step: reveal */}
              {tossStep === "reveal" && tossPlayerNum !== null && tossAiNum !== null && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center flex-1">
                      <p className="text-[8px] text-white/50 font-display font-bold tracking-widest mb-1">YOU</p>
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/20 border-2 border-primary/40 flex flex-col items-center justify-center">
                        <span className="text-3xl">{MOVE_EMOJI[String(tossPlayerNum)]}</span>
                        <span className="font-display text-lg font-black text-primary">{tossPlayerNum}</span>
                      </div>
                    </div>
                    <span className="font-display text-2xl font-black text-white/50">+</span>
                    <div className="text-center flex-1">
                      <p className="text-[8px] text-white/50 font-display font-bold tracking-widest mb-1">AI</p>
                      <AnimatePresence>
                        {tossReveal >= 1 ? (
                          <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}
                            className="w-20 h-20 mx-auto rounded-2xl bg-accent/20 border-2 border-accent/40 flex flex-col items-center justify-center">
                            <span className="text-3xl">{MOVE_EMOJI[String(tossAiNum)]}</span>
                            <span className="font-display text-lg font-black text-accent">{tossAiNum}</span>
                          </motion.div>
                        ) : (
                          <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center">
                            <motion.span animate={{ rotate: [0, -20, 20, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-3xl">✊</motion.span>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {tossReveal >= 2 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                      <span className="font-display text-2xl font-black text-white">{tossPlayerNum + tossAiNum}</span>
                      <span className="text-white/40 mx-2">=</span>
                      <span className={`font-display text-lg font-black ${(tossPlayerNum + tossAiNum) % 2 === 0 ? "text-accent" : "text-primary"}`}>
                        {(tossPlayerNum + tossAiNum) % 2 === 0 ? "EVEN" : "ODD"}
                      </span>
                    </motion.div>
                  )}
                  {tossReveal >= 3 && tossWon !== null && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className={`py-3 rounded-2xl text-center font-display font-black text-sm border-2 ${tossWon ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-red-500/20 border-red-500/40 text-red-400"}`}>
                      {tossWon ? "🏆 YOU WON THE TOSS!" : "😤 AI WON THE TOSS!"}
                    </motion.div>
                  )}
                  {tossReveal >= 3 && tossWon && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-3">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => startMatchWithCountdown(true)}
                        className="flex-1 py-4 bg-primary/20 border border-primary/40 text-primary font-display font-black rounded-2xl text-sm tracking-wider">
                        🏏 BAT FIRST
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => startMatchWithCountdown(false)}
                        className="flex-1 py-4 bg-accent/20 border border-accent/40 text-accent font-display font-black rounded-2xl text-sm tracking-wider">
                        🎯 BOWL FIRST
                      </motion.button>
                    </motion.div>
                  )}
                  {tossReveal >= 3 && tossWon === false && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                      <p className="text-[10px] text-white/40 font-display tracking-wider">AI is choosing…</p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FINISHED overlay ── */}
      {game.phase === "finished" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-10 px-6 bg-black/40">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xs space-y-3">
            <ImmersiveScoreStrip game={game} playerName={playerName} aiName={opponentName} weather={matchWeather} />
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleStartNew}
                className="flex-1 py-3 bg-primary text-primary-foreground font-display font-bold rounded-2xl tracking-wider shadow-[0_0_20px_hsl(217_91%_60%/0.4)] border border-primary/30"
              >
                ⚡ NEW MATCH
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onHome}
                className="flex-1 py-3 bg-black/60 backdrop-blur-md text-white font-display font-bold rounded-2xl tracking-wider border border-white/10"
              >
                HOME
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ImmersiveScoreStrip({ game, playerName = "You", aiName = "Rohit AI", weather }: { game: import("@/hooks/useHandCricket").GameState; playerName?: string; aiName?: string; weather?: string }) {
  const WEATHER_ICONS: Record<string, string> = {
    clear: '☀️', overcast: '☁️', drizzle: '🌧️', heavy_dew: '💧',
    dust_storm: '🌪️', night_lights: '🏟️', golden_hour: '🌅',
  };
  const WEATHER_LABELS: Record<string, string> = {
    clear: 'Clear', overcast: 'Overcast', drizzle: 'Drizzle', heavy_dew: 'Dew',
    dust_storm: 'Dust', night_lights: 'Night', golden_hour: 'Golden Hr',
  };
  const weatherIcon = weather ? WEATHER_ICONS[weather] || '☀️' : null;
  const weatherLabel = weather ? WEATHER_LABELS[weather] || weather : null;
  const needRuns = game.target && game.isBatting && game.phase !== "finished"
    ? Math.max(0, game.target - game.userScore)
    : null;

  return (
    <div className="rounded-2xl px-3 py-2"
      style={{
        background: "linear-gradient(180deg, hsl(25 18% 16%) 0%, hsl(25 15% 11%) 100%)",
        border: "2px solid hsl(25 20% 22%)",
        borderBottom: "4px solid hsl(25 20% 8%)",
        boxShadow: "0 4px 0 hsl(25 20% 6%), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 hsl(35 40% 40% / 0.08)",
      }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="text-[7px] text-muted-foreground font-bold block tracking-widest">{playerName.toUpperCase().slice(0, 8)}</span>
            <span className="font-display text-xl font-black text-score-gold text-glow-gold leading-none">{game.userScore}</span>
            {game.userWickets > 0 && <span className="text-[9px] text-out-red font-bold">/{game.userWickets}</span>}
          </div>
          <span className="text-[8px] font-display text-muted-foreground font-bold">VS</span>
          <div className="text-center">
            <span className="text-[7px] text-muted-foreground font-bold block tracking-widest">{aiName.toUpperCase().slice(0, 8)}</span>
            <span className="font-display text-xl font-black text-accent leading-none">{game.aiScore}</span>
            {game.aiWickets > 0 && <span className="text-[9px] text-out-red font-bold">/{game.aiWickets}</span>}
          </div>
        </div>
        <div className="text-right space-y-0.5">
          {weatherIcon && (
            <span className="text-[8px] font-display font-bold text-muted-foreground block">
              {weatherIcon} {weatherLabel}
            </span>
          )}
          {game.target && game.phase !== "finished" && (
            <span className="text-[8px] font-display font-bold text-secondary block tracking-wider">TGT: {game.target}</span>
          )}
          {needRuns !== null && (
            <span className="text-[8px] font-display font-bold text-primary">NEED {needRuns}</span>
          )}
        </div>
      </div>
      {game.ballHistory.length > 0 && (
        <div className="flex gap-1 mt-1.5 overflow-x-auto">
          {game.ballHistory.slice(-8).map((b, i) => (
            <span key={i} className={`ball-chip text-[8px] ${b.runs === "OUT" ? "ball-chip-wicket" : "ball-chip-run"}`}>
              {b.runs === "OUT" ? "W" : b.runs > 0 ? b.runs : "•"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
