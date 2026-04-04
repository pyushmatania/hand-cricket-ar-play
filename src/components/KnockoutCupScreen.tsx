import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { grantTournamentRewards, type TournamentReward } from "@/lib/tournamentRewards";

interface Props { onHome: () => void; }

const MATCH_BALLS = 12;
const BRACKET_SIZE = 8;

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
  const [phase, setPhase] = useState<Phase>("bracket");
  const [round, setRound] = useState(0); // 0=QF, 1=SF, 2=Final
  const [bracket, setBracket] = useState<BracketTeam[]>(() => {
    const shuffled = [...AI_TEAMS].sort(() => Math.random() - 0.5).slice(0, 7);
    const teams: BracketTeam[] = [
      { name: "Your Team", emoji: "⭐", strength: 80, isPlayer: true },
      ...shuffled,
    ].sort(() => Math.random() - 0.5);
    return teams;
  });
  const [currentOpponent, setCurrentOpponent] = useState<BracketTeam | null>(null);
  const [matchResults, setMatchResults] = useState<("win" | "loss")[]>([]);

  // Match
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
  const { user } = useAuth();

  useEffect(() => {
    if (phase === "results" && finalPlacement && user && !rewardedRef.current) {
      rewardedRef.current = true;
      grantTournamentRewards(user.id, finalPlacement, "knockout").then(r => r && setReward(r));
    }
  }, [phase, finalPlacement, user]);

  const ROUND_NAMES = ["⚔️ QUARTER-FINAL", "🔥 SEMI-FINAL", "🏆 FINAL"];

  const getOpponentForRound = (): BracketTeam | null => {
    const alive = bracket.filter(t => !t.eliminated && !t.isPlayer);
    if (alive.length === 0) return null;
    // Pick opponent by bracket position
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

  const playBall = useCallback((move: number) => {
    if (matchResult) return;
    if (soundEnabled) SFX.tap();
    if (hapticsEnabled) Haptics.light();

    const aiMove = Math.ceil(Math.random() * 6);
    const newBalls = ballsRef.current + 1;
    ballsRef.current = newBalls;
    setBalls(newBalls);

    if (innings === 1) {
      if (move === aiMove) {
        setLastBall("OUT!");
        setInnings(2); setTarget(score + 1);
        ballsRef.current = 0; setBalls(0);
        return;
      }
      setLastBall(`+${move}`);
      setScore(prev => prev + move);
      if (newBalls >= MATCH_BALLS) {
        setInnings(2); setTarget(score + move + 1);
        ballsRef.current = 0; setBalls(0);
      }
    } else {
      if (move === aiMove) {
        setLastBall("WICKET!");
        finish("win");
        return;
      }
      const newOpp = oppScore + aiMove;
      setOppScore(newOpp);
      setLastBall(`+${aiMove}`);
      if (newOpp >= target) { finish("loss"); return; }
      if (newBalls >= MATCH_BALLS) finish("win");
    }
  }, [innings, score, oppScore, target, matchResult, soundEnabled, hapticsEnabled]);

  const finish = (result: "win" | "loss") => {
    setMatchResult(result);
    if (result === "win") { if (soundEnabled) SFX.win(); if (hapticsEnabled) Haptics.success(); }
    else { if (soundEnabled) SFX.loss(); if (hapticsEnabled) Haptics.error(); }
  };

  const handleMatchDone = () => {
    if (!matchResult || !currentOpponent) return;
    const newResults = [...matchResults, matchResult];
    setMatchResults(newResults);

    if (matchResult === "loss") {
      setFinalPlacement(["Quarter-Finalist", "Semi-Finalist", "Runner-Up"][round] || "Eliminated");
      // Eliminate other AI teams randomly for bracket viz
      setBracket(prev => prev.map(t => t.name === currentOpponent.name ? t : { ...t }));
      setPhase("results");
      return;
    }

    // Eliminate opponent
    setBracket(prev => prev.map(t => t.name === currentOpponent.name ? { ...t, eliminated: true } : t));

    if (round >= 2) {
      setFinalPlacement("🏆 CUP CHAMPION");
      setPhase("results");
      return;
    }

    // Also eliminate another AI team (simulating other bracket)
    setBracket(prev => {
      const alive = prev.filter(t => !t.eliminated && !t.isPlayer && t.name !== currentOpponent.name);
      if (alive.length > 0) {
        const elim = alive[Math.floor(Math.random() * alive.length)];
        return prev.map(t => t.name === elim.name ? { ...t, eliminated: true } : t);
      }
      return prev;
    });

    setRound(prev => prev + 1);
    setPhase("bracket");
  };

  // BRACKET VIEW
  if (phase === "bracket") {
    const alive = bracket.filter(t => !t.eliminated);
    const opp = getOpponentForRound();

    return (
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 20%, hsl(43 30% 10%) 0%, hsl(25 15% 6%) 70%)" }} />
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onHome} className="w-9 h-9 rounded-xl glass-premium flex items-center justify-center text-sm">←</motion.button>
          <h2 className="font-game-display text-sm tracking-wider text-accent">🏆 KNOCKOUT CUP</h2>
          <div className="w-9" />
        </div>

        <div className="relative z-10 text-center py-3">
          <p className="font-game-display text-lg text-foreground">{ROUND_NAMES[round]}</p>
          <p className="font-game-body text-[10px] text-muted-foreground">{alive.length} teams remaining</p>
        </div>

        {/* Bracket */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {bracket.map((team, i) => (
              <motion.div key={team.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: team.eliminated ? 0.3 : 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: team.isPlayer ? "linear-gradient(180deg, hsl(217 25% 16%) 0%, hsl(217 20% 10%) 100%)" : "linear-gradient(180deg, hsl(25 18% 14%) 0%, hsl(25 15% 10%) 100%)",
                  border: team.isPlayer ? "2px solid hsl(217 60% 45%)" : "1.5px solid hsl(25 18% 22%)",
                  textDecoration: team.eliminated ? "line-through" : "none",
                }}>
                <span className="text-xl">{team.emoji}</span>
                <div className="flex-1">
                  <p className="font-game-display text-[10px] text-foreground">{team.name}</p>
                  <p className="font-game-body text-[8px] text-muted-foreground">STR: {team.strength}</p>
                </div>
                {team.eliminated && <span className="font-game-display text-[9px] text-red-400">OUT</span>}
                {team.isPlayer && !team.eliminated && <span className="font-game-display text-[8px] text-accent">YOU</span>}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next match */}
        {opp && (
          <div className="relative z-10 p-4" style={{ background: "linear-gradient(transparent, hsl(25 15% 6%))" }}>
            <div className="text-center mb-3">
              <span className="font-game-body text-[10px] text-muted-foreground">Next: </span>
              <span className="font-game-display text-xs text-foreground">⭐ You vs {opp.emoji} {opp.name}</span>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={startMatch}
              className="w-full py-3 rounded-xl font-game-display text-sm tracking-wider"
              style={{ background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)", border: "2px solid hsl(142 60% 55% / 0.4)", borderBottom: "5px solid hsl(142 55% 25%)", color: "hsl(142 80% 98%)" }}>
              ⚡ PLAY
            </motion.button>
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
          style={{ background: `radial-gradient(ellipse at 50% 20%, ${isBatting ? "hsl(217 30% 12%)" : "hsl(0 30% 12%)"} 0%, hsl(25 15% 6%) 70%)` }} />
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <span className="font-game-display text-[9px] tracking-widest text-accent">{ROUND_NAMES[round]}</span>
          <span className="font-game-display text-[9px] px-3 py-1 rounded-full"
            style={{ background: isBatting ? "hsl(217 70% 25%)" : "hsl(0 50% 25%)", color: isBatting ? "hsl(217 90% 80%)" : "hsl(0 80% 80%)" }}>
            {isBatting ? "🏏 BAT" : "🎳 BOWL"}
          </span>
        </div>
        <div className="relative z-10 text-center py-4">
          <div className="flex items-center justify-center gap-6">
            <div><p className="font-game-display text-[9px] text-muted-foreground">⭐ YOU</p><p className="font-game-display text-3xl text-foreground">{score}</p></div>
            <span className="font-game-display text-xs text-muted-foreground">vs</span>
            <div><p className="font-game-display text-[9px] text-muted-foreground">{currentOpponent.emoji} {currentOpponent.name}</p><p className="font-game-display text-3xl text-foreground">{oppScore}</p></div>
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
              <p className="font-game-display text-3xl mb-3" style={{ color: matchResult === "win" ? "hsl(142 71% 50%)" : "hsl(0 70% 55%)" }}>
                {matchResult === "win" ? "🏆 VICTORY!" : "💀 DEFEATED"}
              </p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleMatchDone}
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
    const isChampion = finalPlacement.includes("CHAMPION");
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: isChampion ? "radial-gradient(ellipse at 50% 40%, hsl(43 50% 15%) 0%, hsl(25 15% 6%) 70%)" : "radial-gradient(ellipse at 50% 40%, hsl(0 30% 10%) 0%, hsl(25 15% 6%) 70%)" }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center px-6">
          <p className="text-5xl mb-3">🏆</p>
          <p className="font-game-display text-[10px] tracking-[0.3em] text-muted-foreground mb-2">KNOCKOUT CUP</p>
          <h2 className="font-game-display text-3xl mb-4" style={{ color: isChampion ? "hsl(43 90% 55%)" : "hsl(0 70% 55%)" }}>{finalPlacement}</h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {matchResults.map((r, i) => <span key={i} className="text-xl">{r === "win" ? "✅" : "❌"}</span>)}
          </div>
          {reward && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-4 py-2 px-4 rounded-xl"
              style={{ background: "hsl(25 15% 12%)", border: "1.5px solid hsl(25 18% 22%)" }}>
              <span className="font-game-display text-[10px]" style={{ color: "hsl(217 80% 65%)" }}>+{reward.xp} XP</span>
              <span className="font-game-display text-[10px]" style={{ color: "hsl(43 90% 55%)" }}>+{reward.coins} 🪙</span>
              {reward.chestTier && <span className="font-game-display text-[10px]" style={{ color: "hsl(280 70% 65%)" }}>📦 {reward.chestTier}</span>}
            </motion.div>
          )}
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
