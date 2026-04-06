import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { grantTournamentRewards, type TournamentReward } from "@/lib/tournamentRewards";
import { useTournamentPersistence } from "@/hooks/useTournamentPersistence";
import V10Button from "./shared/V10Button";

interface Props { onHome: () => void; }

const MATCH_BALLS = 18;

type Phase = "intro" | "match" | "between" | "results";

export default function AshesScreen({ onHome }: Props) {
  const { soundEnabled, hapticsEnabled } = useSettings();
  const { user } = useAuth();
  const { createTournament, saveFixture, finishTournament } = useTournamentPersistence();
  const [phase, setPhase] = useState<Phase>("intro");
  const [testNum, setTestNum] = useState(0);
  const [results, setResults] = useState<("win" | "loss" | "draw")[]>([]);
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  const [score, setScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [balls, setBalls] = useState(0);
  const [innings, setInnings] = useState(1);
  const [target, setTarget] = useState(0);
  const [matchResult, setMatchResult] = useState<"win" | "loss" | "draw" | null>(null);
  const [lastBall, setLastBall] = useState("");
  const ballsRef = useRef(0);

  const TEST_VENUES = ["🏟️ Brisbane", "🏟️ Adelaide", "🏟️ Melbourne", "🏟️ Sydney", "🏟️ Perth"];
  const [reward, setReward] = useState<TournamentReward | null>(null);
  const rewardedRef = useRef(false);

  const myWins = results.filter(r => r === "win").length;
  const oppWins = results.filter(r => r === "loss").length;

  useEffect(() => {
    if (phase === "results" && user && !rewardedRef.current) {
      rewardedRef.current = true;
      const placement = myWins > oppWins ? "🏆 SERIES WON!" : myWins === oppWins ? "SERIES DRAWN" : "SERIES LOST";
      grantTournamentRewards(user.id, placement, "ashes").then(r => r && setReward(r));
      if (tournamentId) finishTournament(tournamentId, placement);
    }
  }, [phase, user, tournamentId, finishTournament, myWins, oppWins]);

  const startSeries = async () => {
    const id = await createTournament({ format: "ashes", name: "The Ashes", placement: null, metadata: { tests: 5 } });
    setTournamentId(id);
    startTest();
  };

  const startTest = () => {
    setScore(0); setOppScore(0); setBalls(0); setInnings(1);
    setTarget(0); setMatchResult(null); setLastBall(""); ballsRef.current = 0;
    setPhase("match");
  };

  const finishTest = useCallback((result: "win" | "loss" | "draw") => {
    setMatchResult(result);
    if (result === "win") { if (soundEnabled) SFX.win(); if (hapticsEnabled) Haptics.success(); }
    else if (result === "loss") { if (soundEnabled) SFX.loss(); if (hapticsEnabled) Haptics.error(); }
    if (tournamentId && user) {
      saveFixture({ tournamentId, roundNumber: testNum + 1, matchIndex: testNum, playerAId: user.id, playerBId: null, playerAScore: score, playerBScore: oppScore, winnerId: result === "win" ? user.id : null, status: "completed" });
    }
  }, [soundEnabled, hapticsEnabled, tournamentId, user, testNum, score, oppScore, saveFixture]);

  const playBall = useCallback((move: number) => {
    if (matchResult) return;
    if (soundEnabled) SFX.tap();
    if (hapticsEnabled) Haptics.light();
    const difficulty = 0.2 + testNum * 0.1;
    const aiMove = Math.random() < difficulty ? move : Math.ceil(Math.random() * 6);
    const newBalls = ballsRef.current + 1;
    ballsRef.current = newBalls; setBalls(newBalls);
    if (innings === 1) {
      if (move === aiMove) { setLastBall("OUT!"); setInnings(2); setTarget(score + 1); ballsRef.current = 0; setBalls(0); return; }
      setLastBall(`+${move}`); setScore(prev => prev + move);
      if (newBalls >= MATCH_BALLS) { setInnings(2); setTarget(score + move + 1); ballsRef.current = 0; setBalls(0); }
    } else {
      if (move === aiMove) { setLastBall("WICKET!"); finishTest("win"); return; }
      const newOpp = oppScore + aiMove; setOppScore(newOpp); setLastBall(`+${aiMove}`);
      if (newOpp >= target) { finishTest("loss"); return; }
      if (newBalls >= MATCH_BALLS) { if (newOpp === score) finishTest("draw"); else finishTest("win"); }
    }
  }, [innings, score, oppScore, target, matchResult, soundEnabled, hapticsEnabled, testNum, finishTest]);

  const handleTestDone = () => {
    if (!matchResult) return;
    const newResults = [...results, matchResult];
    setResults(newResults);
    if (testNum >= 4) { setPhase("results"); return; }
    const w = newResults.filter(r => r === "win").length;
    const l = newResults.filter(r => r === "loss").length;
    if (w > 2 || l > 2) { setPhase("results"); return; }
    setTestNum(prev => prev + 1);
    setPhase("between");
  };

  // INTRO
  if (phase === "intro") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(35 30% 12%) 0%, hsl(220 20% 6%) 70%)" }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center px-6">
          <p className="text-5xl mb-4">🏺</p>
          <h2 className="font-display text-2xl text-foreground mb-2">THE ASHES</h2>
          <p className="font-body text-xs text-muted-foreground mb-1">Best of 5 Test Series</p>
          <p className="font-body text-[10px] text-muted-foreground mb-6">
            🇮🇳 India vs 🇦🇺 Australia<br />
            3 overs per Test • Increasing difficulty
          </p>
          <div className="flex items-center justify-center gap-1 mb-6">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center font-display text-[10px] stadium-glass">
                {i + 1}
              </div>
            ))}
          </div>
          <V10Button variant="primary" size="lg" glow onClick={startSeries}>🏏 START SERIES</V10Button>
        </motion.div>
      </div>
    );
  }

  // BETWEEN TESTS
  if (phase === "between") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 40%, hsl(220 15% 10%) 0%, hsl(220 20% 6%) 70%)" }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center">
          <p className="font-display text-[10px] tracking-[0.3em] text-muted-foreground mb-2">{TEST_VENUES[testNum]}</p>
          <h2 className="font-display text-xl text-foreground mb-4">TEST {testNum + 1} OF 5</h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center"><span className="text-2xl">🇮🇳</span><p className="font-display text-2xl text-foreground">{myWins}</p></div>
            <span className="font-display text-muted-foreground">-</span>
            <div className="text-center"><span className="text-2xl">🇦🇺</span><p className="font-display text-2xl text-foreground">{oppWins}</p></div>
          </div>
          <div className="flex items-center justify-center gap-1 mb-6">
            {results.map((r, i) => <span key={i} className="text-lg">{r === "win" ? "✅" : r === "loss" ? "❌" : "➖"}</span>)}
            {Array.from({ length: 5 - results.length }).map((_, i) => <span key={`e${i}`} className="w-6 h-6 rounded border border-muted-foreground/20" />)}
          </div>
          <V10Button variant="danger" size="lg" glow onClick={startTest}>⚡ PLAY TEST {testNum + 1}</V10Button>
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
          style={{ background: `radial-gradient(ellipse at 50% 20%, ${isBatting ? "hsl(217 30% 12%)" : "hsl(0 30% 12%)"} 0%, hsl(220 20% 6%) 70%)` }} />
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <span className="font-display text-[9px] tracking-widest text-accent">{TEST_VENUES[testNum]}</span>
          <span className="font-display text-[9px] px-3 py-1 rounded-full scoreboard-metal"
            style={{ color: isBatting ? "hsl(217 90% 80%)" : "hsl(0 80% 80%)" }}>
            {isBatting ? "🏏 BAT" : "🎳 BOWL"} • TEST {testNum + 1}
          </span>
        </div>
        <div className="relative z-10 text-center py-4">
          <div className="flex items-center justify-center gap-6">
            <div><p className="font-display text-[9px] text-muted-foreground">🇮🇳 IND</p><p className="font-display text-3xl text-foreground">{score}</p></div>
            <span className="font-display text-xs text-muted-foreground">vs</span>
            <div><p className="font-display text-[9px] text-muted-foreground">🇦🇺 AUS</p><p className="font-display text-3xl text-foreground">{oppScore}</p></div>
          </div>
          {innings === 2 && <p className="font-display text-[10px] mt-1 text-secondary">Target: {target}</p>}
          <p className="font-body text-[10px] text-muted-foreground mt-1">Ball {balls}/{MATCH_BALLS}</p>
          {lastBall && <motion.p initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-lg text-accent mt-1">{lastBall}</motion.p>}
          <div className="mx-auto w-48 h-1.5 rounded-full mt-2 bg-muted/30">
            <div className="h-full rounded-full transition-all" style={{ width: `${(balls / MATCH_BALLS) * 100}%`, background: isBatting ? "hsl(217 80% 55%)" : "hsl(0 70% 50%)" }} />
          </div>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-end px-4 pb-6">
          {matchResult ? (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-8">
              <p className="font-display text-3xl mb-3" style={{
                color: matchResult === "win" ? "hsl(142 71% 50%)" : matchResult === "loss" ? "hsl(0 70% 55%)" : "hsl(43 80% 55%)"
              }}>
                {matchResult === "win" ? "🏆 WON!" : matchResult === "loss" ? "💀 LOST" : "🤝 DRAW"}
              </p>
              <V10Button variant="primary" size="lg" onClick={handleTestDone}>CONTINUE →</V10Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <motion.button key={n} whileTap={{ scale: 0.9 }} onClick={() => playBall(n)}
                  className="py-5 rounded-xl font-display text-xl text-foreground stadium-glass border border-border/20">
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
          style={{ background: seriesWon ? "radial-gradient(ellipse at 50% 40%, hsl(43 50% 15%) 0%, hsl(220 20% 6%) 70%)" : "radial-gradient(ellipse at 50% 40%, hsl(0 30% 10%) 0%, hsl(220 20% 6%) 70%)" }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center px-6">
          <p className="text-5xl mb-3">🏺</p>
          <p className="font-display text-[10px] tracking-[0.3em] text-muted-foreground mb-2">THE ASHES</p>
          <h2 className="font-display text-3xl mb-2" style={{ color: seriesWon ? "hsl(43 90% 55%)" : drawn ? "hsl(43 80% 55%)" : "hsl(0 70% 55%)" }}>
            {seriesWon ? "🏆 SERIES WON!" : drawn ? "SERIES DRAWN" : "SERIES LOST"}
          </h2>
          <p className="font-display text-xl text-foreground mb-4">🇮🇳 {myWins} - {oppWins} 🇦🇺</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            {results.map((r, i) => <span key={i} className="text-xl">{r === "win" ? "✅" : r === "loss" ? "❌" : "➖"}</span>)}
          </div>
          {reward && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-4 py-2 px-4 rounded-xl stadium-glass">
              <span className="font-display text-[10px] text-primary">+{reward.xp} XP</span>
              <span className="font-display text-[10px] text-secondary">+{reward.coins} 🪙</span>
              {reward.chestTier && <span className="font-display text-[10px] text-accent">📦 {reward.chestTier}</span>}
            </motion.div>
          )}
          <div className="flex gap-3">
            <V10Button variant="secondary" size="md" onClick={onHome}>HOME</V10Button>
            <V10Button variant="primary" size="md" glow onClick={() => {
              setPhase("intro"); setTestNum(0); setResults([]); setScore(0); setOppScore(0);
              setBalls(0); setInnings(1); setTarget(0); setMatchResult(null); setLastBall("");
              ballsRef.current = 0; setReward(null); rewardedRef.current = false; setTournamentId(null);
            }}>PLAY AGAIN</V10Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
