import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { grantTournamentRewards, type TournamentReward } from "@/lib/tournamentRewards";
import { useTournamentPersistence } from "@/hooks/useTournamentPersistence";

interface Props { onHome: () => void; }

const TEAMS = [
  { name: "India", flag: "🇮🇳", strength: 92 },
  { name: "Australia", flag: "🇦🇺", strength: 90 },
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", strength: 88 },
  { name: "South Africa", flag: "🇿🇦", strength: 86 },
  { name: "New Zealand", flag: "🇳🇿", strength: 85 },
  { name: "Pakistan", flag: "🇵🇰", strength: 84 },
  { name: "Sri Lanka", flag: "🇱🇰", strength: 80 },
  { name: "Bangladesh", flag: "🇧🇩", strength: 76 },
  { name: "West Indies", flag: "🏝️", strength: 78 },
  { name: "Afghanistan", flag: "🇦🇫", strength: 74 },
];

type Phase = "pick" | "group" | "match" | "super8" | "semi" | "final" | "results";

interface MatchResult { opponent: string; opponentFlag: string; myScore: number; oppScore: number; won: boolean; }
interface GroupTeam { name: string; flag: string; strength: number; points: number; wins: number; losses: number; }

const MATCH_BALLS = 12;

export default function WorldCupScreen({ onHome }: Props) {
  const { soundEnabled, hapticsEnabled } = useSettings();
  const { user } = useAuth();
  const { createTournament, saveFixture, finishTournament } = useTournamentPersistence();
  const [phase, setPhase] = useState<Phase>("pick");
  const [myTeam, setMyTeam] = useState<typeof TEAMS[0] | null>(null);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [fixtureIndex, setFixtureIndex] = useState(0);

  // Group stage
  const [groupTeams, setGroupTeams] = useState<GroupTeam[]>([]);
  const [groupMatchIdx, setGroupMatchIdx] = useState(0);
  const [groupResults, setGroupResults] = useState<MatchResult[]>([]);

  // Match state
  const [matchOpponent, setMatchOpponent] = useState<GroupTeam | null>(null);
  const [score, setScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [balls, setBalls] = useState(0);
  const [innings, setInnings] = useState(1);
  const [target, setTarget] = useState(0);
  const [matchResult, setMatchResult] = useState<"win" | "loss" | null>(null);
  const [lastBall, setLastBall] = useState<string>("");
  const ballsRef = useRef(0);

  // Knockout
  const [knockoutStage, setKnockoutStage] = useState<"super8" | "semi" | "final">("super8");
  const [knockoutOpponents, setKnockoutOpponents] = useState<GroupTeam[]>([]);
  const [knockoutIdx, setKnockoutIdx] = useState(0);
  const [allResults, setAllResults] = useState<MatchResult[]>([]);
  const [finalPlacement, setFinalPlacement] = useState("");
  const [reward, setReward] = useState<TournamentReward | null>(null);
  const rewardedRef = useRef(false);

  useEffect(() => {
    if (phase === "results" && finalPlacement && user && !rewardedRef.current) {
      rewardedRef.current = true;
      grantTournamentRewards(user.id, finalPlacement, "worldcup").then(r => r && setReward(r));
      if (tournamentId) finishTournament(tournamentId, finalPlacement);
    }
  }, [phase, finalPlacement, user, tournamentId, finishTournament]);

  const pickTeam = async (team: typeof TEAMS[0]) => {
    if (soundEnabled) SFX.tap();
    if (hapticsEnabled) Haptics.heavy();
    setMyTeam(team);

    const others = TEAMS.filter(t => t.name !== team.name).sort(() => Math.random() - 0.5).slice(0, 4);
    const group: GroupTeam[] = [
      { ...team, points: 0, wins: 0, losses: 0 },
      ...others.map(t => ({ ...t, points: 0, wins: 0, losses: 0 })),
    ];
    setGroupTeams(group);

    // Persist tournament
    const id = await createTournament({
      format: "worldcup",
      name: `World Cup - ${team.name}`,
      placement: null,
      metadata: { team: team.name, groupTeams: group.map(t => t.name) },
    });
    setTournamentId(id);
    setPhase("group");
  };

  const startGroupMatch = (opIdx: number) => {
    const opponents = groupTeams.filter(t => t.name !== myTeam!.name);
    const opp = opponents[opIdx];
    if (!opp) return;
    setMatchOpponent(opp);
    resetMatch();
    setPhase("match");
  };

  const resetMatch = () => {
    setScore(0); setOppScore(0); setBalls(0); setInnings(1); setTarget(0);
    setMatchResult(null); setLastBall(""); ballsRef.current = 0;
  };

  const finishMatch = useCallback((result: "win" | "loss") => {
    setMatchResult(result);
    if (result === "win") { if (soundEnabled) SFX.win(); if (hapticsEnabled) Haptics.success(); }
    else { if (soundEnabled) SFX.loss(); if (hapticsEnabled) Haptics.error(); }
  }, [soundEnabled, hapticsEnabled]);

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
        setInnings(2);
        setTarget(score + 1);
        ballsRef.current = 0;
        setBalls(0);
        return;
      }
      setLastBall(`+${move}`);
      setScore(prev => prev + move);
      if (newBalls >= MATCH_BALLS) {
        setInnings(2);
        setTarget(score + move + 1);
        ballsRef.current = 0;
        setBalls(0);
      }
    } else {
      if (move === aiMove) {
        setLastBall("WICKET!");
        finishMatch("win");
        return;
      }
      const newOpp = oppScore + aiMove;
      setOppScore(newOpp);
      setLastBall(`+${aiMove}`);
      if (newOpp >= target) { finishMatch("loss"); return; }
      if (newBalls >= MATCH_BALLS) { finishMatch("win"); }
    }
  }, [innings, score, oppScore, target, matchResult, soundEnabled, hapticsEnabled, finishMatch]);

  const persistFixture = (roundNum: number, oppName: string, myS: number, oppS: number, won: boolean) => {
    if (!tournamentId || !user) return;
    const idx = fixtureIndex;
    setFixtureIndex(prev => prev + 1);
    saveFixture({
      tournamentId,
      roundNumber: roundNum,
      matchIndex: idx,
      playerAId: user.id,
      playerBId: null, // AI opponent
      playerAScore: myS,
      playerBScore: oppS,
      winnerId: won ? user.id : null,
      status: "completed",
    });
  };

  const handleMatchDone = () => {
    if (!matchResult || !matchOpponent || !myTeam) return;
    const mr: MatchResult = { opponent: matchOpponent.name, opponentFlag: matchOpponent.flag, myScore: score, oppScore, won: matchResult === "win" };

    // Determine round number for persistence
    const roundNum = knockoutOpponents.length > 0
      ? (knockoutStage === "super8" ? 2 : knockoutStage === "semi" ? 3 : 4)
      : 1;
    persistFixture(roundNum, matchOpponent.name, score, oppScore, matchResult === "win");

    if (phase === "match" && knockoutStage === "super8" && knockoutOpponents.length === 0) {
      const newResults = [...groupResults, mr];
      setGroupResults(newResults);

      const nextIdx = groupMatchIdx + 1;
      setGroupMatchIdx(nextIdx);

      const updatedTeams = groupTeams.map(t => {
        if (t.name === myTeam.name) {
          const newWins = t.wins + (matchResult === "win" ? 1 : 0);
          const newLosses = t.losses + (matchResult === "loss" ? 1 : 0);
          return { ...t, points: newWins * 2, wins: newWins, losses: newLosses };
        }
        if (t.name === matchOpponent.name) {
          const newWins = t.wins + (matchResult === "loss" ? 1 : 0);
          const newLosses = t.losses + (matchResult === "win" ? 1 : 0);
          return { ...t, points: newWins * 2, wins: newWins, losses: newLosses };
        }
        const won = Math.random() > 0.5;
        const newWins = t.wins + (won ? 1 : 0);
        const newLosses = t.losses + (won ? 0 : 1);
        return { ...t, points: newWins * 2, wins: newWins, losses: newLosses };
      });
      setGroupTeams(updatedTeams);

      // Determine qualifiers from the freshly computed standings
      const opponents = updatedTeams.filter(t => t.name !== myTeam.name);
      if (nextIdx >= opponents.length) {
        const qualifiers = [...updatedTeams]
          .sort((a, b) => b.points - a.points)
          .slice(0, 4)
          .filter(t => t.name !== myTeam.name);
        setKnockoutOpponents(qualifiers.slice(0, 2));
        setKnockoutIdx(0);
        setKnockoutStage("super8");
        setPhase("super8");
      } else {
        setPhase("group");
      }
    } else {
      const newAll = [...allResults, mr];
      setAllResults(newAll);

      if (matchResult === "loss") {
        const placements: Record<string, string> = { super8: "Super 8 Exit", semi: "Semi-Finalist", final: "Runner-Up" };
        setFinalPlacement(placements[knockoutStage] || "Eliminated");
        setPhase("results");
        return;
      }

      if (knockoutStage === "super8") {
        const nextKO = knockoutIdx + 1;
        if (nextKO >= knockoutOpponents.length) {
          setKnockoutStage("semi");
          const semiOpp = TEAMS.filter(t => t.name !== myTeam.name).sort(() => Math.random() - 0.5)[0];
          setKnockoutOpponents([{ ...semiOpp, points: 0, wins: 0, losses: 0 }]);
          setKnockoutIdx(0);
          setPhase("semi");
        } else {
          setKnockoutIdx(nextKO);
          setPhase("super8");
        }
      } else if (knockoutStage === "semi") {
        setKnockoutStage("final");
        const finalOpp = TEAMS.filter(t => t.name !== myTeam.name).sort((a, b) => b.strength - a.strength)[0];
        setKnockoutOpponents([{ ...finalOpp, points: 0, wins: 0, losses: 0 }]);
        setKnockoutIdx(0);
        setPhase("final");
      } else {
        setFinalPlacement("🏆 WORLD CHAMPION");
        setPhase("results");
      }
    }
  };

  const startKnockoutMatch = () => {
    const opp = knockoutOpponents[knockoutIdx];
    setMatchOpponent(opp);
    resetMatch();
    setPhase("match");
  };

  // PICK TEAM
  if (phase === "pick") {
    return (
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 20%, hsl(217 40% 12%) 0%, hsl(25 15% 6%) 70%)" }} />
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onHome} className="w-9 h-9 rounded-xl glass-premium flex items-center justify-center text-sm">←</motion.button>
          <h2 className="font-game-display text-sm tracking-wider text-accent">🌍 WORLD CUP</h2>
          <div className="w-9" />
        </div>
        <div className="relative z-10 text-center py-4">
          <h3 className="font-game-display text-lg text-foreground">PICK YOUR NATION</h3>
          <p className="font-game-body text-[10px] text-muted-foreground">Group Stage → Super 8 → Semi → Final</p>
        </div>
        <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-6">
          <div className="grid grid-cols-2 gap-2">
            {TEAMS.map(team => (
              <motion.button key={team.name} whileTap={{ scale: 0.95 }} onClick={() => pickTeam(team)}
                className="text-left p-3 rounded-xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, hsl(25 18% 14%) 0%, hsl(25 15% 10%) 100%)",
                  border: "2px solid hsl(25 18% 22%)",
                  borderBottom: "4px solid hsl(25 20% 10%)",
                }}>
                <span className="text-2xl">{team.flag}</span>
                <p className="font-game-display text-[10px] text-foreground mt-1">{team.name}</p>
                <p className="font-game-body text-[8px] text-muted-foreground">STR: {team.strength}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // GROUP STAGE
  if (phase === "group" && myTeam) {
    const opponents = groupTeams.filter(t => t.name !== myTeam.name);
    const currentOpp = opponents[groupMatchIdx];
    return (
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 20%, hsl(217 30% 10%) 0%, hsl(25 15% 6%) 70%)" }} />
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onHome} className="w-9 h-9 rounded-xl glass-premium flex items-center justify-center text-sm">←</motion.button>
          <h2 className="font-game-display text-[10px] tracking-widest text-accent">GROUP STAGE</h2>
          <div className="w-9" />
        </div>
        <div className="relative z-10 px-4 mt-2 mb-4">
          <div className="rounded-xl overflow-hidden" style={{ background: "hsl(25 15% 10%)", border: "1.5px solid hsl(25 18% 20%)" }}>
            <div className="grid grid-cols-4 px-3 py-2 text-center" style={{ background: "hsl(25 18% 14%)" }}>
              <span className="font-game-display text-[8px] text-muted-foreground text-left">TEAM</span>
              <span className="font-game-display text-[8px] text-muted-foreground">W</span>
              <span className="font-game-display text-[8px] text-muted-foreground">L</span>
              <span className="font-game-display text-[8px] text-muted-foreground">PTS</span>
            </div>
            {[...groupTeams].sort((a, b) => b.points - a.points).map(t => (
              <div key={t.name} className={`grid grid-cols-4 px-3 py-1.5 text-center ${t.name === myTeam.name ? "bg-accent/10" : ""}`}>
                <span className="font-game-body text-[10px] text-foreground text-left">{t.flag} {t.name}</span>
                <span className="font-game-display text-[10px] text-foreground">{t.wins}</span>
                <span className="font-game-display text-[10px] text-foreground">{t.losses}</span>
                <span className="font-game-display text-[10px]" style={{ color: "hsl(43 90% 55%)" }}>{t.points}</span>
              </div>
            ))}
          </div>
        </div>
        {currentOpp && (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
            <p className="font-game-display text-[9px] text-muted-foreground tracking-wider mb-4">MATCH {groupMatchIdx + 1} OF {opponents.length}</p>
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <span className="text-3xl">{myTeam.flag}</span>
                <p className="font-game-display text-[10px] text-foreground mt-1">{myTeam.name}</p>
              </div>
              <span className="font-game-display text-lg text-muted-foreground">VS</span>
              <div className="text-center">
                <span className="text-3xl">{currentOpp.flag}</span>
                <p className="font-game-display text-[10px] text-foreground mt-1">{currentOpp.name}</p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => startGroupMatch(groupMatchIdx)}
              className="px-8 py-3 rounded-xl font-game-display text-sm tracking-wider"
              style={{
                background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
                border: "2px solid hsl(142 60% 55% / 0.4)",
                borderBottom: "5px solid hsl(142 55% 25%)",
                color: "hsl(142 80% 98%)",
              }}>
              ⚡ PLAY
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  // KNOCKOUT STAGES
  if ((phase === "super8" || phase === "semi" || phase === "final") && myTeam) {
    const stageNames: Record<string, string> = { super8: "SUPER 8", semi: "SEMI-FINAL", final: "🏆 GRAND FINAL" };
    const opp = knockoutOpponents[knockoutIdx];
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 40%, ${phase === "final" ? "hsl(43 40% 12%)" : "hsl(0 30% 10%)"} 0%, hsl(25 15% 6%) 70%)` }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center">
          <p className="font-game-display text-[10px] tracking-[0.3em] text-muted-foreground mb-3">{stageNames[phase]}</p>
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <span className="text-4xl">{myTeam.flag}</span>
              <p className="font-game-display text-xs text-foreground mt-1">{myTeam.name}</p>
            </div>
            <span className="font-game-display text-xl text-accent">VS</span>
            <div className="text-center">
              <span className="text-4xl">{opp?.flag}</span>
              <p className="font-game-display text-xs text-foreground mt-1">{opp?.name}</p>
            </div>
          </div>
          {allResults.length > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {allResults.map((r, i) => <span key={i} className="text-lg">{r.won ? "✅" : "❌"}</span>)}
            </div>
          )}
          <motion.button whileTap={{ scale: 0.95 }} onClick={startKnockoutMatch}
            className="px-8 py-3 rounded-xl font-game-display text-sm tracking-wider"
            style={{
              background: phase === "final"
                ? "linear-gradient(180deg, hsl(43 90% 55%) 0%, hsl(35 80% 40%) 100%)"
                : "linear-gradient(180deg, hsl(0 70% 50%) 0%, hsl(0 60% 35%) 100%)",
              border: "2px solid hsl(43 60% 55% / 0.4)",
              borderBottom: "5px solid hsl(43 50% 22%)",
              color: phase === "final" ? "hsl(35 90% 10%)" : "hsl(0 90% 95%)",
            }}>
            ⚡ PLAY MATCH
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // MATCH
  if (phase === "match" && matchOpponent && myTeam) {
    const isBatting = innings === 1;
    return (
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 20%, ${isBatting ? "hsl(217 30% 12%)" : "hsl(0 30% 12%)"} 0%, hsl(25 15% 6%) 70%)` }} />
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <span className="font-game-display text-[9px] tracking-widest text-accent">
            {myTeam.flag} vs {matchOpponent.flag}
          </span>
          <span className="font-game-display text-[9px] px-3 py-1 rounded-full"
            style={{ background: isBatting ? "hsl(217 70% 25%)" : "hsl(0 50% 25%)", color: isBatting ? "hsl(217 90% 80%)" : "hsl(0 80% 80%)" }}>
            {isBatting ? "🏏 BAT" : "🎳 BOWL"}
          </span>
        </div>
        <div className="relative z-10 text-center py-4">
          <div className="flex items-center justify-center gap-6">
            <div><p className="font-game-display text-[9px] text-muted-foreground">{myTeam.name}</p><p className="font-game-display text-3xl text-foreground">{score}</p></div>
            <span className="font-game-display text-xs text-muted-foreground">vs</span>
            <div><p className="font-game-display text-[9px] text-muted-foreground">{matchOpponent.name}</p><p className="font-game-display text-3xl text-foreground">{oppScore}</p></div>
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
  if (phase === "results" && myTeam) {
    const isChampion = finalPlacement.includes("CHAMPION");
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: isChampion ? "radial-gradient(ellipse at 50% 40%, hsl(43 50% 15%) 0%, hsl(25 15% 6%) 70%)" : "radial-gradient(ellipse at 50% 40%, hsl(0 30% 10%) 0%, hsl(25 15% 6%) 70%)" }} />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center px-6">
          <span className="text-5xl">{myTeam.flag}</span>
          <p className="font-game-display text-[10px] tracking-[0.3em] text-muted-foreground mt-4 mb-2">WORLD CUP</p>
          <h2 className="font-game-display text-3xl mb-4" style={{ color: isChampion ? "hsl(43 90% 55%)" : "hsl(0 70% 55%)" }}>{finalPlacement}</h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...groupResults.map(r => r.won), ...allResults.map(r => r.won)].map((w, i) => <span key={i} className="text-lg">{w ? "✅" : "❌"}</span>)}
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
            <motion.button whileTap={{ scale: 0.95 }} onClick={onHome}
              className="px-6 py-3 rounded-xl font-game-display text-[11px] tracking-wider"
              style={{ background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)", border: "1.5px solid hsl(142 60% 55% / 0.4)", borderBottom: "4px solid hsl(142 55% 25%)", color: "hsl(142 80% 98%)" }}>PLAY AGAIN</motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
