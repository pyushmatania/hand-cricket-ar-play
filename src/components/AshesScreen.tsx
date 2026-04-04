import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";

interface Props { onHome: () => void; }

const MATCH_BALLS = 18; // 3 overs per Test

type Phase = "intro" | "match" | "between" | "results";

export default function AshesScreen({ onHome }: Props) {
  const { soundEnabled, hapticsEnabled } = useSettings();
  const [phase, setPhase] = useState<Phase>("intro");
  const [testNum, setTestNum] = useState(0); // 0-4
  const [results, setResults] = useState<("win" | "loss" | "draw")[]>([]);

  // Match state
  const [score, setScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [balls, setBalls] = useState(0);
  const [innings, setInnings] = useState(1);
  const [target, setTarget] = useState(0);
  const [matchResult, setMatchResult] = useState<"win" | "loss" | "draw" | null>(null);
  const [lastBall, setLastBall] = useState("");
  const ballsRef = useRef(0);

  const TEST_VENUES = ["🏟️ Brisbane", "🏟️ Adelaide", "🏟️ Melbourne", "🏟️ Sydney", "🏟️ Perth"];

  const myWins = results.filter(r => r === "win").length;
  const oppWins = results.filter(r => r === "loss").length;

  const startTest = () => {
    setScore(0); setOppScore(0); setBalls(0); setInnings(1);
    setTarget(0); setMatchResult(null); setLastBall(""); ballsRef.current = 0;
    setPhase("match");
  };

  const playBall = useCallback((move: number) => {
    if (matchResult) return;
    if (soundEnabled) SFX.tap();
    if (hapticsEnabled) Haptics.light();

    const difficulty = 0.2 + testNum * 0.1;
    const aiMove = Math.random() < difficulty ? move : Math.ceil(Math.random() * 6);
    const newBalls = ballsRef.current + 1;
    ballsRef.current = newBalls;
    setBalls(newBalls);

    if (innings === 1) {
      if (move === aiMove) {
        setLastBall("OUT!");
        setInnings(2);
        setTarget(score + 1);
        ballsRef.current = 0; setBalls(0);
        return;
      }
      setLastBall(`+${move}`);
      setScore(prev => prev + move);
      if (newBalls >= MATCH_BALLS) {
        setInnings(2);
        setTarget(score + move + 1);
        ballsRef.current = 0; setBalls(0);
      }
    } else {
      if (move === aiMove) {
        setLastBall("WICKET!");
        finishTest("win");
        return;
      }
      const newOpp = oppScore + aiMove;
      setOppScore(newOpp);
      setLastBall(`+${aiMove}`);
      if (newOpp >= target) { finishTest("loss"); return; }
      if (newBalls >= MATCH_BALLS) {
        if (newOpp === score) finishTest("draw");
        else finishTest("win");
      }
    }
  }, [innings, score, oppScore, target, matchResult, soundEnabled, hapticsEnabled, testNum]);

  const finishTest = (result: "win" | "loss" | "draw") => {
    setMatchResult(result);
    if (result === "win") { if (soundEnabled) SFX.win(); if (hapticsEnabled) Haptics.success(); }
    else if (result === "loss") { if (soundEnabled) SFX.loss(); if (hapticsEnabled) Haptics.error(); }
  };

  const handleTestDone = () => {
    if (!matchResult) return;
    const newResults = [...results, matchResult];
    setResults(newResults);

    if (testNum >= 4) {
      setPhase("results");
      return;
    }

    // Check if series already decided
    const w = newResults.filter(r => r === "win").length;
    const l = newResults.filter(r => r === "loss").length;
    const remaining = 4 - testNum;
    if (w > 2 || l > 2) {
      setPhase("results");
      return;
    }

    setTestNum(prev => prev + 1);
    setPhase("between");
  };

  // INTRO
  if (phase === "intro") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(35 30% 12%) 0%, hsl(25 15% 6%) 70%)" }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center px-6">
          <p className="text-5xl mb-4">🏺</p>
          <h2 className="font-game-display text-2xl text-foreground mb-2">THE ASHES</h2>
          <p className="font-game-body text-xs text-muted-foreground mb-1">Best of 5 Test Series</p>
          <p className="font-game-body text-[10px] text-muted-foreground mb-6">
            🇮🇳 India vs 🇦🇺 Australia<br />
            3 overs per Test • Increasing difficulty
          </p>
          <div className="flex items-center justify-center gap-1 mb-6">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center font-game-display text-[10px]"
                style={{ background: "hsl(25 15% 14%)", border: "1.5px solid hsl(25 18% 22%)" }}>
                {i + 1}
              </div>
            ))}
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={startTest}
            className="px-8 py-3 rounded-xl font-game-display text-sm tracking-wider"
            style={{ background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)", border: "2px solid hsl(142 60% 55% / 0.4)", borderBottom: "5px solid hsl(142 55% 25%)", color: "hsl(142 80% 98%)" }}>
            🏏 START SERIES
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // BETWEEN TESTS
  if (phase === "between") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 40%, hsl(25 20% 10%) 0%, hsl(25 15% 6%) 70%)" }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center">
          <p className="font-game-display text-[10px] tracking-[0.3em] text-muted-foreground mb-2">{TEST_VENUES[testNum]}</p>
          <h2 className="font-game-display text-xl text-foreground mb-4">TEST {testNum + 1} OF 5</h2>

          {/* Series scoreline */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <span className="text-2xl">🇮🇳</span>
              <p className="font-game-display text-2xl text-foreground">{myWins}</p>
            </div>
            <span className="font-game-display text-muted-foreground">-</span>
            <div className="text-center">
              <span className="text-2xl">🇦🇺</span>
              <p className="font-game-display text-2xl text-foreground">{oppWins}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 mb-6">
            {results.map((r, i) => (
              <span key={i} className="text-lg">{r === "win" ? "✅" : r === "loss" ? "❌" : "➖"}</span>
            ))}
            {Array.from({ length: 5 - results.length }).map((_, i) => (
              <span key={`e${i}`} className="w-6 h-6 rounded border border-muted-foreground/20" />
            ))}
          </div>

          <motion.button whileTap={{ scale: 0.95 }} onClick={startTest}
            className="px-8 py-3 rounded-xl font-game-display text-sm tracking-wider"
            style={{ background: "linear-gradient(180deg, hsl(0 70% 50%) 0%, hsl(0 60% 35%) 100%)", border: "2px solid hsl(0 60% 55% / 0.4)", borderBottom: "5px solid hsl(0 50% 22%)", color: "hsl(0 90% 95%)" }}>
            ⚡ PLAY TEST {testNum + 1}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // MATCH
  if (phase === "match") {
    const isBatting = innings === 1;
    return (
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 20%, ${isBatting ? "hsl(217 30% 12%)" : "hsl(0 30% 12%)"} 0%, hsl(25 15% 6%) 70%)` }} />
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <span className="font-game-display text-[9px] tracking-widest text-accent">{TEST_VENUES[testNum]}</span>
          <span className="font-game-display text-[9px] px-3 py-1 rounded-full"
            style={{ background: isBatting ? "hsl(217 70% 25%)" : "hsl(0 50% 25%)", color: isBatting ? "hsl(217 90% 80%)" : "hsl(0 80% 80%)" }}>
            {isBatting ? "🏏 BAT" : "🎳 BOWL"} • TEST {testNum + 1}
          </span>
        </div>
        <div className="relative z-10 text-center py-4">
          <div className="flex items-center justify-center gap-6">
            <div><p className="font-game-display text-[9px] text-muted-foreground">🇮🇳 IND</p><p className="font-game-display text-3xl text-foreground">{score}</p></div>
            <span className="font-game-display text-xs text-muted-foreground">vs</span>
            <div><p className="font-game-display text-[9px] text-muted-foreground">🇦🇺 AUS</p><p className="font-game-display text-3xl text-foreground">{oppScore}</p></div>
          </div>
          {innings === 2 && <p className="font-game-display text-[10px] mt-1" style={{ color: "hsl(43 90% 55%)" }}>Target: {target}</p>}
          <p className="font-game-body text-[10px] text-muted-foreground mt-1">Ball {balls}/{MATCH_BALLS}</p>
          {lastBall && <motion.p initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-game-display text-lg text-accent mt-1">{lastBall}</motion.p>}
          <div className="mx-auto w-48 h-1.5 rounded-full mt-2" style={{ background: "hsl(25 15% 18%)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(balls / MATCH_BALLS) * 100}%`, background: isBatting ? "hsl(217 80% 55%)" : "hsl(0 70% 50%)" }} />
          </div>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-end px-4 pb-6">
          {matchResult ? (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-8">
              <p className="font-game-display text-3xl mb-3" style={{
                color: matchResult === "win" ? "hsl(142 71% 50%)" : matchResult === "loss" ? "hsl(0 70% 55%)" : "hsl(43 80% 55%)"
              }}>
                {matchResult === "win" ? "🏆 WON!" : matchResult === "loss" ? "💀 LOST" : "🤝 DRAW"}
              </p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleTestDone}
                className="px-8 py-3 rounded-xl font-game-display text-sm tracking-wider"
                style={{ background: "linear-gradient(180deg, hsl(217 80% 55%) 0%, hsl(217 70% 42%) 100%)", border: "1.5px solid hsl(217 60% 60% / 0.4)", borderBottom: "4px solid hsl(217 55% 28%)", color: "hsl(217 90% 95%)" }}>
                CONTINUE →
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <motion.button key={n} whileTap={{ scale: 0.9 }} onClick={() => playBall(n)}
                  className="py-5 rounded-xl font-game-display text-xl text-foreground"
                  style={{ background: `linear-gradient(180deg, hsl(${220 + n * 15} 50% 35%) 0%, hsl(${220 + n * 15} 45% 22%) 100%)`, border: `1.5px solid hsl(${220 + n * 15} 40% 45% / 0.3)`, borderBottom: `4px solid hsl(${220 + n * 15} 40% 15%)` }}>
                  {n}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // RESULTS
  if (phase === "results") {
    const seriesWon = myWins > oppWins;
    const drawn = myWins === oppWins;
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: seriesWon ? "radial-gradient(ellipse at 50% 40%, hsl(43 50% 15%) 0%, hsl(25 15% 6%) 70%)" : "radial-gradient(ellipse at 50% 40%, hsl(0 30% 10%) 0%, hsl(25 15% 6%) 70%)" }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center px-6">
          <p className="text-5xl mb-3">🏺</p>
          <p className="font-game-display text-[10px] tracking-[0.3em] text-muted-foreground mb-2">THE ASHES</p>
          <h2 className="font-game-display text-3xl mb-2" style={{ color: seriesWon ? "hsl(43 90% 55%)" : drawn ? "hsl(43 80% 55%)" : "hsl(0 70% 55%)" }}>
            {seriesWon ? "🏆 SERIES WON!" : drawn ? "SERIES DRAWN" : "SERIES LOST"}
          </h2>
          <p className="font-game-display text-xl text-foreground mb-4">
            🇮🇳 {myWins} - {oppWins} 🇦🇺
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            {results.map((r, i) => <span key={i} className="text-xl">{r === "win" ? "✅" : r === "loss" ? "❌" : "➖"}</span>)}
          </div>
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={onHome}
              className="px-6 py-3 rounded-xl font-game-display text-[11px] tracking-wider"
              style={{ background: "hsl(25 15% 12%)", border: "1.5px solid hsl(25 15% 20%)", borderBottom: "4px solid hsl(25 12% 8%)", color: "hsl(25 30% 70%)" }}>HOME</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl font-game-display text-[11px] tracking-wider"
              style={{ background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)", border: "1.5px solid hsl(142 60% 55% / 0.4)", borderBottom: "4px solid hsl(142 55% 25%)", color: "hsl(142 80% 98%)" }}>PLAY AGAIN</motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
