import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHandCricket, type Move, type MatchConfig } from "@/hooks/useHandCricket";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import GameButton from "./shared/GameButton";

/**
 * Cricket Royale — Battle Royale Mode
 * 
 * 5 rounds with shrinking overs: 3→2→2→1→1
 * Storm events trigger between rounds adding pressure
 * Target score rises each round; fail = eliminated
 * Beat all 5 rounds to be crowned Royale Champion
 */

interface Round {
  number: number;
  overs: number;
  targetMultiplier: number;
  stormEvent: string;
  stormEmoji: string;
  aiDifficulty: number; // 0-1
}

const ROUNDS: Round[] = [
  { number: 1, overs: 3, targetMultiplier: 1.0, stormEvent: "Clear Skies", stormEmoji: "☀️", aiDifficulty: 0.2 },
  { number: 2, overs: 2, targetMultiplier: 1.2, stormEvent: "Dust Storm Rising", stormEmoji: "🌪️", aiDifficulty: 0.35 },
  { number: 3, overs: 2, targetMultiplier: 1.4, stormEvent: "Thunder Zone Shrinks", stormEmoji: "⛈️", aiDifficulty: 0.5 },
  { number: 4, overs: 1, targetMultiplier: 1.7, stormEvent: "Cyclone Warning", stormEmoji: "🌀", aiDifficulty: 0.7 },
  { number: 5, overs: 1, targetMultiplier: 2.0, stormEvent: "Final Storm", stormEmoji: "💀", aiDifficulty: 0.9 },
];

type Phase = "lobby" | "storm" | "batting" | "result" | "eliminated" | "champion";

interface CricketRoyaleScreenProps {
  onHome: () => void;
}

export default function CricketRoyaleScreen({ onHome }: CricketRoyaleScreenProps) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [currentRound, setCurrentRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [playersRemaining, setPlayersRemaining] = useState(100);
  const { soundEnabled, hapticsEnabled } = useSettings();
  const { game, startGame, playBall, resetGame } = useHandCricket();
  const roundRef = useRef(currentRound);
  roundRef.current = currentRound;

  const round = ROUNDS[currentRound] || ROUNDS[0];
  const targetScore = Math.round(round.overs * 6 * round.targetMultiplier);

  // Start the royale
  const handleStart = () => {
    setPhase("storm");
    setCurrentRound(0);
    setTotalScore(0);
    setRoundScores([]);
    setPlayersRemaining(100);
  };

  // After storm intro, start the round
  const handleStormComplete = useCallback(() => {
    const r = ROUNDS[roundRef.current];
    const config: MatchConfig = { overs: r.overs, wickets: 1 };
    resetGame();
    startGame(true, config); // always bat first
    setPhase("batting");
    if (soundEnabled) SFX.gameStart();
    if (hapticsEnabled) Haptics.medium();
  }, [resetGame, startGame, soundEnabled, hapticsEnabled]);

  // Storm intro auto-advance
  useEffect(() => {
    if (phase !== "storm") return;
    const t = setTimeout(handleStormComplete, 3500);
    return () => clearTimeout(t);
  }, [phase, handleStormComplete]);

  // Watch for round end
  useEffect(() => {
    if (phase !== "batting" || game.phase !== "finished") return;

    const score = game.userScore;
    const survived = score >= targetScore;
    const eliminated = playersRemaining - Math.floor(Math.random() * 15 + 10);

    setRoundScores(prev => [...prev, score]);
    setTotalScore(prev => prev + score);
    setPlayersRemaining(Math.max(survived ? Math.max(eliminated, 2) : eliminated, 1));

    if (!survived) {
      setPhase("eliminated");
      if (soundEnabled) SFX.loss();
      if (hapticsEnabled) Haptics.error();
    } else if (currentRound >= ROUNDS.length - 1) {
      setPhase("champion");
      if (soundEnabled) SFX.win();
      if (hapticsEnabled) Haptics.success();
    } else {
      setPhase("result");
      if (soundEnabled) SFX.wicket();
    }
  }, [game.phase]);

  // Advance to next round
  const handleNextRound = () => {
    setCurrentRound(prev => prev + 1);
    resetGame();
    setPhase("storm");
  };

  const stormIntensity = currentRound / (ROUNDS.length - 1);

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Storm gradient background */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-1000" style={{
        background: `radial-gradient(ellipse at center, 
          hsl(${280 - currentRound * 30} ${40 + currentRound * 10}% ${8 + currentRound * 2}%) 0%, 
          hsl(220 30% 4%) 100%)`,
      }} />

      {/* Storm particles */}
      {phase === "batting" && currentRound > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(currentRound * 8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 rounded-full"
              style={{
                height: 8 + Math.random() * 16,
                background: `hsl(${200 + currentRound * 20} 60% ${50 + Math.random() * 30}% / ${0.2 + stormIntensity * 0.3})`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ["-10%", "110vh"],
                x: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: 0.8 + Math.random() * 0.5,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onHome}
          className="w-9 h-9 rounded-xl glass-premium flex items-center justify-center text-sm">←</motion.button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card">
          <span className="text-sm">{round.stormEmoji}</span>
          <span className="font-display text-[9px] tracking-[0.2em] text-accent font-bold">CRICKET ROYALE</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full"
          style={{ background: "hsl(0 60% 15%)", border: "1px solid hsl(0 50% 25%)" }}>
          <span className="text-[8px]">👤</span>
          <span className="font-display text-[9px] text-red-400 font-bold">{playersRemaining}</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-4 pb-6 max-w-lg mx-auto w-full">
        {/* ── LOBBY ── */}
        <AnimatePresence mode="wait">
          {phase === "lobby" && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-6">
              <motion.span className="text-7xl" animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}>🏟️</motion.span>
              <div className="text-center">
                <h1 className="font-display text-3xl font-black tracking-wider text-foreground mb-2">CRICKET ROYALE</h1>
                <p className="font-body text-xs text-muted-foreground max-w-[260px] mx-auto">
                  Survive 5 rounds of shrinking overs. Beat the target each round or get eliminated. Last one standing wins!
                </p>
              </div>

              {/* Round preview */}
              <div className="w-full space-y-1.5">
                {ROUNDS.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, hsl(${280 - i * 30} 20% 12%), hsl(220 20% 8%))`,
                      border: "1px solid hsl(220 20% 16%)",
                    }}>
                    <span className="text-lg">{r.stormEmoji}</span>
                    <div className="flex-1">
                      <span className="font-display text-[9px] tracking-wider text-foreground/80">ROUND {r.number}</span>
                      <p className="text-[8px] font-body text-muted-foreground">{r.overs} over{r.overs > 1 ? "s" : ""} • {r.stormEvent}</p>
                    </div>
                    <span className="font-display text-[9px] text-accent">
                      Target: {Math.round(r.overs * 6 * r.targetMultiplier)}
                    </span>
                  </div>
                ))}
              </div>

              <GameButton variant="primary" size="lg" bounce onClick={handleStart} className="w-full">
                ⚡ DROP IN
              </GameButton>
            </motion.div>
          )}

          {/* ── STORM INTRO ── */}
          {phase === "storm" && (
            <motion.div key="storm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-8xl block">{round.stormEmoji}</span>
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-display text-2xl font-black tracking-wider text-foreground text-center"
              >
                ROUND {round.number}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="font-display text-sm text-accent tracking-wider"
              >
                {round.stormEvent.toUpperCase()}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-center space-y-1"
              >
                <p className="text-[10px] font-body text-muted-foreground">
                  {round.overs} over{round.overs > 1 ? "s" : ""} • Target: {targetScore} runs
                </p>
                <p className="text-[10px] font-body text-red-400">
                  👤 {playersRemaining} players remaining
                </p>
              </motion.div>
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3.5, ease: "linear" }}
                className="w-48 h-1 rounded-full origin-left"
                style={{ background: "hsl(43 80% 50%)" }}
              />
            </motion.div>
          )}

          {/* ── BATTING (uses hand cricket) ── */}
          {phase === "batting" && (
            <motion.div key="batting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col">
              {/* Round info bar */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{round.stormEmoji}</span>
                  <span className="font-display text-[9px] tracking-wider text-foreground/70">ROUND {round.number}/5</span>
                </div>
                <div className="px-2 py-1 rounded-lg" style={{
                  background: "hsl(43 40% 12%)", border: "1px solid hsl(43 30% 22%)",
                }}>
                  <span className="font-display text-[9px] text-game-gold">TARGET: {targetScore}</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-center mb-4">
                <span className="font-display text-5xl font-black text-foreground">{game.userScore}</span>
                <span className="font-display text-lg text-muted-foreground">/{targetScore}</span>
                {game.isBatting && (
                  <p className="text-[8px] font-body text-muted-foreground mt-1">
                    {game.ballHistory.length} ball{game.ballHistory.length !== 1 ? "s" : ""} played
                  </p>
                )}
              </div>

              {/* Progress bar to target */}
              <div className="w-full h-2 rounded-full mb-4 overflow-hidden"
                style={{ background: "hsl(220 20% 12%)", border: "1px solid hsl(220 15% 18%)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: game.userScore >= targetScore
                      ? "linear-gradient(90deg, hsl(142 70% 40%), hsl(142 80% 50%))"
                      : "linear-gradient(90deg, hsl(43 80% 45%), hsl(43 90% 55%))",
                  }}
                  animate={{ width: `${Math.min((game.userScore / targetScore) * 100, 100)}%` }}
                  transition={{ type: "spring", damping: 15 }}
                />
              </div>

              {/* Last ball */}
              {game.lastResult && (
                <div className="text-center mb-3">
                  <span className="font-display text-lg font-bold" style={{
                    color: game.lastResult.runs === "OUT" ? "hsl(0 70% 55%)"
                      : typeof game.lastResult.runs === "number" && game.lastResult.runs >= 4 ? "hsl(43 90% 55%)"
                      : "hsl(0 0% 70%)",
                  }}>
                    {game.lastResult.runs === "OUT" ? "💀 OUT!" : `+${game.lastResult.runs}`}
                  </span>
                </div>
              )}

              <div className="flex-1" />

              {/* Move buttons */}
              {game.phase !== "finished" && (
                <div className="grid grid-cols-3 gap-3 px-2 pb-2">
                  {(["DEF", 1, 2, 3, 4, 6] as Move[]).map(m => (
                    <motion.button
                      key={String(m)}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => playBall(m)}
                      className="h-16 rounded-2xl font-display text-lg font-bold text-white"
                      style={{
                        background: m === "DEF"
                          ? "linear-gradient(180deg, hsl(220 20% 25%), hsl(220 20% 15%))"
                          : `linear-gradient(180deg, hsl(${200 + (typeof m === "number" ? m * 20 : 0)} 60% 40%), hsl(${200 + (typeof m === "number" ? m * 20 : 0)} 50% 25%))`,
                        border: "2px solid hsl(220 15% 25%)",
                        borderBottom: "4px solid hsl(220 15% 12%)",
                      }}
                    >
                      {m === "DEF" ? "🛡️" : m}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ROUND RESULT ── */}
          {phase === "result" && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-4">
              <motion.span className="text-6xl" animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 2 }}>✅</motion.span>
              <h2 className="font-display text-2xl font-black text-foreground">SURVIVED!</h2>
              <p className="font-body text-sm text-muted-foreground">
                Round {currentRound + 1} — Scored {roundScores[roundScores.length - 1]} / {targetScore}
              </p>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "hsl(0 40% 12%)", border: "1px solid hsl(0 30% 22%)" }}>
                <span className="text-xs">👤</span>
                <span className="font-display text-sm text-red-400">{playersRemaining} remaining</span>
              </div>
              <p className="font-display text-xs text-game-gold">Total: {totalScore} runs</p>
              <GameButton variant="primary" size="lg" bounce onClick={handleNextRound} className="w-full mt-4">
                ⚡ NEXT ROUND
              </GameButton>
            </motion.div>
          )}

          {/* ── ELIMINATED ── */}
          {phase === "eliminated" && (
            <motion.div key="eliminated" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-4">
              <motion.span className="text-7xl" animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}>💀</motion.span>
              <h2 className="font-display text-3xl font-black text-red-400">ELIMINATED</h2>
              <p className="font-body text-sm text-muted-foreground">
                Fell in Round {currentRound + 1} — Scored {roundScores[roundScores.length - 1]} / {targetScore}
              </p>
              <div className="px-4 py-3 rounded-2xl text-center"
                style={{ background: "hsl(220 20% 10%)", border: "1px solid hsl(220 15% 18%)" }}>
                <p className="font-display text-[9px] tracking-wider text-muted-foreground mb-1">FINAL PLACEMENT</p>
                <p className="font-display text-3xl font-black text-foreground">#{playersRemaining}</p>
                <p className="font-display text-xs text-game-gold mt-1">Total: {totalScore} runs</p>
              </div>
              <div className="flex gap-2 w-full mt-4">
                <GameButton variant="primary" size="lg" bounce onClick={handleStart} className="flex-1">
                  🔄 RETRY
                </GameButton>
                <GameButton variant="secondary" size="lg" bounce onClick={onHome} className="flex-1">
                  HOME
                </GameButton>
              </div>
            </motion.div>
          )}

          {/* ── CHAMPION ── */}
          {phase === "champion" && (
            <motion.div key="champion" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-4">
              {/* Confetti */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(25)].map((_, i) => (
                  <motion.div key={i} className="absolute"
                    initial={{ y: -10, x: `${Math.random() * 100}%`, opacity: 1 }}
                    animate={{ y: "110vh", rotate: 360 * (Math.random() > 0.5 ? 2 : -2) }}
                    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      width: 5 + Math.random() * 5,
                      height: 5 + Math.random() * 8,
                      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                      background: ["hsl(43 96% 56%)", "hsl(142 70% 50%)", "hsl(280 70% 55%)", "hsl(0 80% 55%)"][i % 4],
                    }}
                  />
                ))}
              </div>

              <motion.span className="text-8xl relative z-10"
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}>👑</motion.span>
              <h2 className="font-display text-4xl font-black tracking-wider relative z-10"
                style={{ color: "hsl(43 96% 56%)", textShadow: "0 4px 0 hsl(43 70% 30%), 0 0 40px hsl(43 96% 56% / 0.4)" }}>
                ROYALE CHAMPION!
              </h2>
              <p className="font-body text-sm text-muted-foreground relative z-10">
                Survived all 5 rounds!
              </p>
              <div className="px-4 py-3 rounded-2xl text-center relative z-10"
                style={{ background: "hsl(43 30% 10%)", border: "1px solid hsl(43 40% 25%)" }}>
                <p className="font-display text-[9px] tracking-wider text-game-gold mb-1">TOTAL SCORE</p>
                <p className="font-display text-4xl font-black text-game-gold">{totalScore}</p>
                <div className="flex justify-center gap-3 mt-2">
                  {roundScores.map((s, i) => (
                    <div key={i} className="text-center">
                      <span className="text-[8px] font-display text-muted-foreground block">R{i + 1}</span>
                      <span className="font-display text-xs text-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 w-full mt-4 relative z-10">
                <GameButton variant="primary" size="lg" bounce onClick={handleStart} className="flex-1">
                  🔄 PLAY AGAIN
                </GameButton>
                <GameButton variant="secondary" size="lg" bounce onClick={onHome} className="flex-1">
                  HOME
                </GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
