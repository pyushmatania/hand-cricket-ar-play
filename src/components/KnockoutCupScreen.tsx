import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { grantTournamentRewards, type TournamentReward } from "@/lib/tournamentRewards";
import { useTournamentPersistence } from "@/hooks/useTournamentPersistence";
import V10Button from "./shared/V10Button";

interface Props { onHome: () => void; }

const MATCH_BALLS = 12;

const AI_TEAMS = [
  { name: "Thunder Hawks", emoji: "⚡", strength: 70 },
  { name: "Fire Dragons", emoji: "🐉", strength: 75 },
  { name: "Ice Wolves", emoji: "🐺", strength: 72 },
  { name: "Storm Kings", emoji: "👑", strength: 78 },
  { name: "Shadow Lions", emoji: "🦁", strength: 80 },
  { name: "Iron Eagles", emoji: "🦅", strength: 82 },
  { name: "Night Vipers", emoji: "🐍", strength: 85 },
];

type Phase = "bracket" | "match" | "results";

interface BracketTeam { name: string; emoji: string; strength: number; isPlayer?: boolean; eliminated?: boolean; }

export default function KnockoutCupScreen({ onHome }: Props) {
  const { soundEnabled, hapticsEnabled } = useSettings();
  const { user } = useAuth();
  const { createTournament, saveFixture, finishTournament } = useTournamentPersistence();
  const [phase, setPhase] = useState<Phase>("bracket");
  const [round, setRound] = useState(0);
  const [bracket, setBracket] = useState<BracketTeam[]>(() => {
    const shuffled = [...AI_TEAMS].sort(() => Math.random() - 0.5).slice(0, 7);
    return [{ name: "Your Team", emoji: "⭐", strength: 80, isPlayer: true }, ...shuffled].sort(() => Math.random() - 0.5);
  });
  const [currentOpponent, setCurrentOpponent] = useState<BracketTeam | null>(null);
  const [matchResults, setMatchResults] = useState<("win" | "loss")[]>([]);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const tournamentCreated = useRef(false);

  const [score, setScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [balls, setBalls] = useState(0);
  const [innings, setInnings] = useState(1);
  const [target, setTarget] = useState(0);
  const [matchResult, setMatchResult] = useState<"win" | "loss" | null>(null);
  const [lastBall, setLastBall] = useState("");
  const ballsRef = useRef(0);
  const [finalPlacement, setFinalPlacement] = useState("");
  const [reward, setReward] = useState<TournamentReward | null>(null);
  const rewardedRef = useRef(false);

  const handlePlayAgain = useCallback(() => {
    const shuffled = [...AI_TEAMS].sort(() => Math.random() - 0.5).slice(0, 7);
    setBracket([{ name: "Your Team", emoji: "⭐", strength: 80, isPlayer: true }, ...shuffled].sort(() => Math.random() - 0.5));
    setPhase("bracket"); setRound(0); setMatchResults([]); setCurrentOpponent(null);
    setScore(0); setOppScore(0); setBalls(0); setInnings(1); setTarget(0);
    setMatchResult(null); setLastBall(""); ballsRef.current = 0;
    setFinalPlacement(""); setReward(null); rewardedRef.current = false;
    tournamentCreated.current = false; setTournamentId(null);
  }, []);

  useEffect(() => {
    if (!tournamentCreated.current && user) {
      tournamentCreated.current = true;
      createTournament({ format: "knockout", name: "Knockout Cup", placement: null, metadata: { bracketSize: 8 } }).then(id => setTournamentId(id));
    }
  }, [user, createTournament]);

  useEffect(() => {
    if (phase === "results" && finalPlacement && user && !rewardedRef.current) {
      rewardedRef.current = true;
      grantTournamentRewards(user.id, finalPlacement, "knockout").then(r => r && setReward(r));
      if (tournamentId) finishTournament(tournamentId, finalPlacement);
    }
  }, [phase, finalPlacement, user, tournamentId, finishTournament]);

  const ROUND_NAMES = ["⚔️ QUARTER-FINAL", "🔥 SEMI-FINAL", "🏆 FINAL"];

  const getOpponentForRound = (): BracketTeam | null => {
    const alive = bracket.filter(t => !t.eliminated && !t.isPlayer);
    if (alive.length === 0) return null;
    return alive[Math.min(round, alive.length - 1)];
  };

  const startMatch = () => {
    const opp = getOpponentForRound();
    if (!opp) return;
    setCurrentOpponent(opp);
    setScore(0); setOppScore(0); setBalls(0); setInnings(1);
    setTarget(0); setMatchResult(null); setLastBall(""); ballsRef.current = 0;
    setPhase("match");
  };

  const finish = useCallback((result: "win" | "loss") => {
    setMatchResult(result);
    if (result === "win") { if (soundEnabled) SFX.win(); if (hapticsEnabled) Haptics.success(); }
    else { if (soundEnabled) SFX.loss(); if (hapticsEnabled) Haptics.error(); }
    if (tournamentId && user) {
      saveFixture({ tournamentId, roundNumber: round + 1, matchIndex: round, playerAId: user.id, playerBId: null, playerAScore: score, playerBScore: oppScore, winnerId: result === "win" ? user.id : null, status: "completed" });
    }
  }, [soundEnabled, hapticsEnabled, tournamentId, user, round, score, oppScore, saveFixture]);

  const playBall = useCallback((move: number) => {
    if (matchResult) return;
    if (soundEnabled) SFX.tap();
    if (hapticsEnabled) Haptics.light();
    const aiMove = Math.ceil(Math.random() * 6);
    const newBalls = ballsRef.current + 1;
    ballsRef.current = newBalls; setBalls(newBalls);
    if (innings === 1) {
      if (move === aiMove) { setLastBall("OUT!"); setInnings(2); setTarget(score + 1); ballsRef.current = 0; setBalls(0); return; }
      setLastBall(`+${move}`); setScore(prev => prev + move);
      if (newBalls >= MATCH_BALLS) { setInnings(2); setTarget(score + move + 1); ballsRef.current = 0; setBalls(0); }
    } else {
      if (move === aiMove) { setLastBall("WICKET!"); finish("win"); return; }
      const newOpp = oppScore + aiMove; setOppScore(newOpp); setLastBall(`+${aiMove}`);
      if (newOpp >= target) { finish("loss"); return; }
      if (newBalls >= MATCH_BALLS) finish("win");
    }
  }, [innings, score, oppScore, target, matchResult, soundEnabled, hapticsEnabled, finish]);

  const handleMatchDone = () => {
    if (!matchResult || !currentOpponent) return;
    const newResults = [...matchResults, matchResult];
    setMatchResults(newResults);
    if (matchResult === "loss") {
      setFinalPlacement(["Quarter-Finalist", "Semi-Finalist", "Runner-Up"][round] || "Eliminated");
      setPhase("results"); return;
    }
    setBracket(prev => prev.map(t => t.name === currentOpponent.name ? { ...t, eliminated: true } : t));
    if (round >= 2) { setFinalPlacement("🏆 CUP CHAMPION"); setPhase("results"); return; }
    setBracket(prev => {
      const alive = prev.filter(t => !t.eliminated && !t.isPlayer && t.name !== currentOpponent.name);
      if (alive.length > 0) { const elim = alive[Math.floor(Math.random() * alive.length)]; return prev.map(t => t.name === elim.name ? { ...t, eliminated: true } : t); }
      return prev;
    });
    setRound(prev => prev + 1); setPhase("bracket");
  };

  // BRACKET
  if (phase === "bracket") {
    const alive = bracket.filter(t => !t.eliminated);
    const opp = getOpponentForRound();
    return (
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 20%, hsl(43 30% 10%) 0%, hsl(220 20% 6%) 70%)" }} />
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onHome} className="w-9 h-9 rounded-xl stadium-glass flex items-center justify-center text-sm text-foreground">←</motion.button>
          <h2 className="font-display text-sm tracking-wider text-accent">🏆 KNOCKOUT CUP</h2>
          <div className="w-9" />
        </div>
        <div className="relative z-10 text-center py-3">
          <p className="font-display text-lg text-foreground">{ROUND_NAMES[round]}</p>
          <p className="font-body text-[10px] text-muted-foreground">{alive.length} teams remaining</p>
        </div>
        <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {bracket.map((team, i) => (
              <motion.div key={team.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: team.eliminated ? 0.3 : 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl stadium-glass ${team.isPlayer ? "border border-primary/30" : ""}`}
                style={{ textDecoration: team.eliminated ? "line-through" : "none" }}>
                <span className="text-xl">{team.emoji}</span>
                <div className="flex-1">
                  <p className="font-display text-[10px] text-foreground">{team.name}</p>
                  <p className="font-body text-[8px] text-muted-foreground">STR: {team.strength}</p>
                </div>
                {team.eliminated && <span className="font-display text-[9px] text-out-red">OUT</span>}
                {team.isPlayer && !team.eliminated && <span className="font-display text-[8px] text-accent">YOU</span>}
              </motion.div>
            ))}
          </div>
        </div>
        {opp && (
          <div className="relative z-10 p-4" style={{ background: "linear-gradient(transparent, hsl(220 20% 6%))" }}>
            <div className="text-center mb-3">
              <span className="font-body text-[10px] text-muted-foreground">Next: </span>
              <span className="font-display text-xs text-foreground">⭐ You vs {opp.emoji} {opp.name}</span>
            </div>
            <V10Button variant="primary" size="lg" glow onClick={startMatch} className="w-full">⚡ PLAY</V10Button>
          </div>
        )}
      </div>
    );
  }

  // MATCH
  if (phase === "match" && currentOpponent) {
    const isBatting = innings === 1;
    return (
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 20%, ${isBatting ? "hsl(217 30% 12%)" : "hsl(0 30% 12%)"} 0%, hsl(220 20% 6%) 70%)` }} />
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <span className="font-display text-[9px] tracking-widest text-accent">{ROUND_NAMES[round]}</span>
          <span className="font-display text-[9px] px-3 py-1 rounded-full scoreboard-metal"
            style={{ color: isBatting ? "hsl(217 90% 80%)" : "hsl(0 80% 80%)" }}>
            {isBatting ? "🏏 BAT" : "🎳 BOWL"}
          </span>
        </div>
        <div className="relative z-10 text-center py-4">
          <div className="flex items-center justify-center gap-6">
            <div><p className="font-display text-[9px] text-muted-foreground">⭐ YOU</p><p className="font-display text-3xl text-foreground">{score}</p></div>
            <span className="font-display text-xs text-muted-foreground">vs</span>
            <div><p className="font-display text-[9px] text-muted-foreground">{currentOpponent.emoji} {currentOpponent.name}</p><p className="font-display text-3xl text-foreground">{oppScore}</p></div>
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
              <p className="font-display text-3xl mb-3" style={{ color: matchResult === "win" ? "hsl(142 71% 50%)" : "hsl(0 70% 55%)" }}>
                {matchResult === "win" ? "🏆 VICTORY!" : "💀 DEFEATED"}
              </p>
              <V10Button variant="primary" size="lg" onClick={handleMatchDone}>CONTINUE →</V10Button>
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
    const isChampion = finalPlacement.includes("CHAMPION");
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: isChampion ? "radial-gradient(ellipse at 50% 40%, hsl(43 50% 15%) 0%, hsl(220 20% 6%) 70%)" : "radial-gradient(ellipse at 50% 40%, hsl(0 30% 10%) 0%, hsl(220 20% 6%) 70%)" }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center px-6">
          <p className="text-5xl mb-3">🏆</p>
          <p className="font-display text-[10px] tracking-[0.3em] text-muted-foreground mb-2">KNOCKOUT CUP</p>
          <h2 className="font-display text-3xl mb-4" style={{ color: isChampion ? "hsl(43 90% 55%)" : "hsl(0 70% 55%)" }}>{finalPlacement}</h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {matchResults.map((r, i) => <span key={i} className="text-xl">{r === "win" ? "✅" : "❌"}</span>)}
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
            <V10Button variant="primary" size="md" glow onClick={handlePlayAgain}>PLAY AGAIN</V10Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
