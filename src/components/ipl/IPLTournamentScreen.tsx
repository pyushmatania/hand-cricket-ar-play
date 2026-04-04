import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useHandCricket, type MatchConfig } from "@/hooks/useHandCricket";
import { useMatchSaver } from "@/hooks/useMatchSaver";
import { SFX, Haptics } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import { pickConfiguredMatchCommentators, type Commentator } from "@/lib/commentaryDuo";
import { useEquippedCosmetics } from "@/hooks/useEquippedCosmetics";
import { rollWeather, type Weather } from "@/lib/weather";
import OddEvenToss from "../OddEvenToss";
import TapPlayingUI from "../TapPlayingUI";
import RulesSheet from "../RulesSheet";
import {
  IPL_TEAMS, type IPLTeam, type GroupFixture, type PlayoffMatch,
  generateGroupFixtures, calcStandings, sortedStandings, initPlayoffs,
} from "./IPLData";
import IPLTeamPicker from "./IPLTeamPicker";
import IPLPointsTable from "./IPLPointsTable";
import IPLPlayoffBracket from "./IPLPlayoffBracket";

interface Props { onHome: () => void; }

export default function IPLTournamentScreen({ onHome }: Props) {
  const location = useLocation();
  const arenaImage = (location.state as any)?.arenaImage as string | undefined;
  const arenaId = (location.state as any)?.arenaId as string | undefined;
  const { soundEnabled, hapticsEnabled, commentaryVoice, tournamentCeremoniesEnabled } = useSettings();
  const cosmetics = useEquippedCosmetics();
  const { user } = useAuth();
  const { game, startGame, playBall, resetGame } = useHandCricket();
  const { saveMatch } = useMatchSaver();

  const [phase, setPhase] = useState<"pick" | "group" | "toss" | "playing" | "result" | "playoffs" | "playoffToss" | "playoffPlaying" | "playoffResult" | "champion" | "eliminated">("pick");
  const [userTeam, setUserTeam] = useState<string>("");
  const [groupTeams, setGroupTeams] = useState<string[]>([]);
  const [fixtures, setFixtures] = useState<GroupFixture[]>([]);
  const [fixtureIdx, setFixtureIdx] = useState(0);
  const [playoffs, setPlayoffs] = useState<PlayoffMatch[]>(initPlayoffs());
  const [playoffIdx, setPlayoffIdx] = useState(0);
  const [playerName, setPlayerName] = useState("You");
  const [matchConfig] = useState<MatchConfig>({ overs: 5, wickets: 3 });
  const [pendingBatFirst, setPendingBatFirst] = useState<boolean | null>(null);
  const [commentators, setCommentators] = useState<[Commentator, Commentator]>(() => pickConfiguredMatchCommentators(commentaryVoice));
  const [weather, setWeather] = useState<Weather>(() => rollWeather());
  const savedRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data?.display_name) setPlayerName(data.display_name); });
  }, [user]);

  const pickTeam = (teamId: string) => {
    setUserTeam(teamId);
    // Create a group of 5: user's team + 4 random others
    const others = IPL_TEAMS.filter(t => t.id !== teamId).sort(() => Math.random() - 0.5).slice(0, 4).map(t => t.id);
    const group = [teamId, ...others];
    setGroupTeams(group);
    const fx = generateGroupFixtures(group);
    setFixtures(fx);
    setFixtureIdx(0);
    setPhase("group");
  };

  const currentFixture = fixtures[fixtureIdx];
  const isUserMatch = currentFixture && (currentFixture.home === userTeam || currentFixture.away === userTeam);
  const opponentId = currentFixture ? (currentFixture.home === userTeam ? currentFixture.away : currentFixture.home) : "";
  const opponent = IPL_TEAMS.find(t => t.id === opponentId);
  const userTeamData = IPL_TEAMS.find(t => t.id === userTeam);

  const standings = calcStandings(groupTeams, fixtures);
  const sorted = sortedStandings(standings);

  // Simulate non-user matches
  const simulateMatch = useCallback(() => {
    if (!currentFixture || currentFixture.result) return;
    const homeTeam = IPL_TEAMS.find(t => t.id === currentFixture.home)!;
    const awayTeam = IPL_TEAMS.find(t => t.id === currentFixture.away)!;
    const homeScore = Math.floor(30 + Math.random() * 80);
    const awayScore = Math.floor(30 + Math.random() * 80);
    const winner = homeScore >= awayScore ? currentFixture.home : currentFixture.away;
    const updated = [...fixtures];
    updated[fixtureIdx] = { ...updated[fixtureIdx], result: { homeScore, awayScore, winner, played: true } };
    setFixtures(updated);
    setTimeout(() => advanceFixture(updated), 800);
  }, [currentFixture, fixtureIdx, fixtures]);

  const advanceFixture = (updatedFixtures: GroupFixture[]) => {
    const nextIdx = fixtureIdx + 1;
    if (nextIdx >= updatedFixtures.length) {
      // Group stage done - check qualification
      const st = calcStandings(groupTeams, updatedFixtures);
      const s = sortedStandings(st);
      const top4 = s.slice(0, 4).map(([id]) => id);
      if (!top4.includes(userTeam)) {
        setPhase("eliminated");
        return;
      }
      // Setup playoffs
      const po = initPlayoffs();
      po[0] = { ...po[0], teamA: top4[0], teamB: top4[1] };
      po[1] = { ...po[1], teamA: top4[2], teamB: top4[3] };
      setPlayoffs(po);
      setPlayoffIdx(0);
      setPhase("playoffs");
      return;
    }
    setFixtureIdx(nextIdx);
  };

  const startUserMatch = () => {
    setCommentators(pickConfiguredMatchCommentators(commentaryVoice));
    setWeather(rollWeather());
    setPhase("toss");
  };

  const handleTossResult = (batFirst: boolean) => {
    setPendingBatFirst(batFirst);
    resetGame();
    savedRef.current = false;
    if (soundEnabled) SFX.gameStart();
    if (hapticsEnabled) Haptics.medium();
    startGame(batFirst, matchConfig);
    setPhase("playing");
  };

  // Handle match finish
  useEffect(() => {
    if (game.phase !== "finished" || savedRef.current) return;
    savedRef.current = true;
    saveMatch(game, "ipl_tournament");
    if (game.result === "win") { if (soundEnabled) SFX.win(); if (hapticsEnabled) Haptics.success(); }
    else { if (soundEnabled) SFX.loss(); if (hapticsEnabled) Haptics.error(); }

    if (phase === "playing") {
      const updated = [...fixtures];
      const f = updated[fixtureIdx];
      const isHome = f.home === userTeam;
      const userScore = game.userScore;
      const oppScore = game.aiScore;
      updated[fixtureIdx] = {
        ...f,
        result: {
          homeScore: isHome ? userScore : oppScore,
          awayScore: isHome ? oppScore : userScore,
          winner: game.result === "win" ? userTeam : opponentId,
          played: true,
        },
      };
      setFixtures(updated);
      setPhase("result");
    } else if (phase === "playoffPlaying") {
      const po = [...playoffs];
      const match = po[playoffIdx];
      const isTeamA = match.teamA === userTeam;
      po[playoffIdx] = {
        ...match,
        result: {
          homeScore: game.userScore,
          awayScore: game.aiScore,
          winner: game.result === "win" ? userTeam : (isTeamA ? match.teamB! : match.teamA!),
          played: true,
        },
      };
      setPlayoffs(po);
      setPhase("playoffResult");
    }
  }, [game.phase]);

  const handleGroupNext = () => advanceFixture(fixtures);

  const startPlayoffMatch = () => {
    setCommentators(pickConfiguredMatchCommentators(commentaryVoice));
    setWeather(rollWeather());
    setPhase("playoffToss");
  };

  const handlePlayoffToss = (batFirst: boolean) => {
    setPendingBatFirst(batFirst);
    resetGame();
    savedRef.current = false;
    if (soundEnabled) SFX.gameStart();
    startGame(batFirst, matchConfig);
    setPhase("playoffPlaying");
  };

  const advancePlayoff = () => {
    const match = playoffs[playoffIdx];
    const winner = match.result!.winner;
    const loser = match.teamA === winner ? match.teamB! : match.teamA!;
    const po = [...playoffs];

    if (match.id === "q1") {
      // Winner → Final, Loser → Q2
      po[3] = { ...po[3], teamA: winner };
      po[2] = { ...po[2], teamA: loser };
      setPlayoffs(po);
      setPlayoffIdx(1); // Eliminator next
    } else if (match.id === "elim") {
      // Winner → Q2
      po[2] = { ...po[2], teamB: winner };
      setPlayoffs(po);
      setPlayoffIdx(2);
      if (winner !== userTeam && loser === userTeam) { setPhase("eliminated"); return; }
    } else if (match.id === "q2") {
      // Winner → Final
      po[3] = { ...po[3], teamB: winner };
      setPlayoffs(po);
      setPlayoffIdx(3);
      if (winner !== userTeam) { setPhase("eliminated"); return; }
    } else if (match.id === "final") {
      if (winner === userTeam) setPhase("champion");
      else setPhase("eliminated");
      return;
    }
    setPhase("playoffs");
  };

  const currentPlayoff = playoffs[playoffIdx];
  const isUserPlayoff = currentPlayoff && (currentPlayoff.teamA === userTeam || currentPlayoff.teamB === userTeam);
  const playoffOppId = currentPlayoff ? (currentPlayoff.teamA === userTeam ? currentPlayoff.teamB : currentPlayoff.teamA) : null;
  const playoffOpp = playoffOppId ? IPL_TEAMS.find(t => t.id === playoffOppId) : null;

  const simulatePlayoff = () => {
    if (!currentPlayoff || !currentPlayoff.teamA || !currentPlayoff.teamB) return;
    const s1 = Math.floor(30 + Math.random() * 80);
    const s2 = Math.floor(30 + Math.random() * 80);
    const winner = s1 >= s2 ? currentPlayoff.teamA : currentPlayoff.teamB;
    const po = [...playoffs];
    po[playoffIdx] = { ...po[playoffIdx], result: { homeScore: s1, awayScore: s2, winner, played: true } };
    setPlayoffs(po);
    setTimeout(() => {
      // Auto advance for non-user playoff
      const loser = currentPlayoff.teamA === winner ? currentPlayoff.teamB! : currentPlayoff.teamA!;
      if (currentPlayoff.id === "q1") {
        po[3] = { ...po[3], teamA: winner };
        po[2] = { ...po[2], teamA: loser };
      } else if (currentPlayoff.id === "elim") {
        po[2] = { ...po[2], teamB: winner };
      } else if (currentPlayoff.id === "q2") {
        po[3] = { ...po[3], teamB: winner };
      }
      setPlayoffs([...po]);
      setPlayoffIdx(playoffIdx + 1);
      setPhase("playoffs");
    }, 1200);
  };

  const restart = () => {
    setPhase("pick");
    setFixtures([]);
    setGroupTeams([]);
    setPlayoffs(initPlayoffs());
    setPlayoffIdx(0);
    setFixtureIdx(0);
    resetGame();
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onHome} className="w-9 h-9 rounded-xl glass-premium flex items-center justify-center text-sm">←</motion.button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card">
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-display text-[9px] tracking-[0.2em] text-secondary font-bold">IPL SEASON</span>
        </div>
        <RulesSheet />
      </div>

      <div className="relative z-10 flex-1 flex flex-col gap-2 px-4 pb-[env(safe-area-inset-bottom,16px)] max-w-lg mx-auto w-full overflow-y-auto overflow-x-hidden">
        {/* TEAM PICK */}
        {phase === "pick" && <IPLTeamPicker onPick={pickTeam} />}

        {/* GROUP STAGE */}
        {phase === "group" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mt-2">
            <div className="text-center">
              <span className="text-3xl">{userTeamData?.emoji}</span>
              <h2 className="font-display text-sm font-black text-foreground tracking-wider mt-1">GROUP STAGE</h2>
              <p className="text-[9px] text-muted-foreground">Match {fixtureIdx + 1} / {fixtures.length}</p>
            </div>

            <IPLPointsTable standings={sorted} userTeam={userTeam} />

            {currentFixture && !currentFixture.result && (
              <div className="glass-premium rounded-2xl p-3 text-center space-y-2">
                <p className="text-[9px] text-muted-foreground font-display tracking-wider">NEXT MATCH</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">{IPL_TEAMS.find(t => t.id === currentFixture.home)?.emoji}</span>
                  <span className="font-display text-xs font-bold text-foreground">{IPL_TEAMS.find(t => t.id === currentFixture.home)?.shortName}</span>
                  <span className="text-muted-foreground text-xs font-display">vs</span>
                  <span className="font-display text-xs font-bold text-foreground">{IPL_TEAMS.find(t => t.id === currentFixture.away)?.shortName}</span>
                  <span className="text-2xl">{IPL_TEAMS.find(t => t.id === currentFixture.away)?.emoji}</span>
                </div>
                {isUserMatch ? (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={startUserMatch}
                    className="w-full py-3 bg-gradient-to-r from-secondary to-secondary/70 text-secondary-foreground font-display font-black text-sm rounded-2xl tracking-wider">
                    🏏 PLAY MATCH
                  </motion.button>
                ) : (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={simulateMatch}
                    className="w-full py-2.5 glass-premium text-foreground font-display font-bold text-xs rounded-2xl border border-primary/20">
                    ⏩ SIMULATE
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* TOSS */}
        {(phase === "toss" || phase === "playoffToss") && opponent && (
          <div className="mt-4">
            <OddEvenToss
              onResult={phase === "toss" ? handleTossResult : handlePlayoffToss}
              playerName={playerName}
              opponentName={(phase === "playoffToss" ? playoffOpp?.name : opponent?.name) || "Opponent"}
            />
          </div>
        )}

        {/* PLAYING */}
        {(phase === "playing" || phase === "playoffPlaying") && (
          <>
            <div className="glass-premium rounded-xl p-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/25 flex items-center justify-center text-lg">
                {phase === "playoffPlaying" ? playoffOpp?.emoji : opponent?.emoji}
              </div>
              <div className="flex-1">
                <span className="font-display text-[10px] font-bold text-foreground tracking-wider">
                  vs {phase === "playoffPlaying" ? playoffOpp?.name : opponent?.name}
                </span>
                <span className="text-[8px] text-muted-foreground block">
                  {phase === "playoffPlaying" ? currentPlayoff?.label : `Group Match ${fixtureIdx + 1}`}
                </span>
              </div>
            </div>
            <TapPlayingUI
              phase={game.phase}
              userScore={game.userScore}
              aiScore={game.aiScore}
              userWickets={game.userWickets}
              aiWickets={game.aiWickets}
              target={game.target}
              currentInnings={game.currentInnings}
              isBatting={game.isBatting}
              lastResult={game.lastResult}
              result={game.result}
              ballHistory={game.ballHistory}
              playerName={playerName}
              opponentName={(phase === "playoffPlaying" ? playoffOpp?.name : opponent?.name) || "AI"}
              opponentEmoji={(phase === "playoffPlaying" ? playoffOpp?.emoji : opponent?.emoji) || "🏏"}
              onMove={playBall}
              onReset={restart}
              onHome={onHome}
              modeLabel="IPL"
              matchConfig={matchConfig}
              innings1Balls={game.innings1Balls}
              commentators={commentators}
              arenaImage={arenaImage}
              arenaId={arenaId}
              equippedBatSkin={cosmetics.batSkin}
              equippedButtonStyle={cosmetics.buttonStyle}
              weather={weather}
            />
          </>
        )}

        {/* GROUP RESULT */}
        {phase === "result" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center gap-4">
            <span className="text-5xl">{game.result === "win" ? "✅" : "❌"}</span>
            <h2 className="font-display text-xl font-black text-foreground tracking-wider">
              {game.result === "win" ? "MATCH WON!" : "MATCH LOST"}
            </h2>
            <div className="glass-premium rounded-2xl p-4 w-full max-w-xs text-center">
              <span className="font-display text-lg text-secondary font-black">{game.userScore}/{game.userWickets}</span>
              <span className="text-muted-foreground mx-2">vs</span>
              <span className="font-display text-lg text-accent font-black">{game.aiScore}/{game.aiWickets}</span>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleGroupNext}
              className="w-full max-w-xs py-3 bg-gradient-to-r from-secondary to-secondary/70 text-secondary-foreground font-display font-black rounded-2xl">
              CONTINUE →
            </motion.button>
          </motion.div>
        )}

        {/* PLAYOFFS VIEW */}
        {phase === "playoffs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mt-2">
            <div className="text-center">
              <span className="text-3xl">🏆</span>
              <h2 className="font-display text-sm font-black text-foreground tracking-wider mt-1">PLAYOFFS</h2>
            </div>
            <IPLPlayoffBracket playoffs={playoffs} userTeam={userTeam} currentIdx={playoffIdx} />
            {currentPlayoff && !currentPlayoff.result && currentPlayoff.teamA && currentPlayoff.teamB && (
              <div className="glass-premium rounded-2xl p-3 text-center space-y-2">
                <p className="font-display text-xs font-bold text-secondary">{currentPlayoff.label}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">{IPL_TEAMS.find(t => t.id === currentPlayoff.teamA)?.emoji}</span>
                  <span className="font-display text-xs font-bold">{IPL_TEAMS.find(t => t.id === currentPlayoff.teamA)?.shortName}</span>
                  <span className="text-muted-foreground text-xs">vs</span>
                  <span className="font-display text-xs font-bold">{IPL_TEAMS.find(t => t.id === currentPlayoff.teamB)?.shortName}</span>
                  <span className="text-2xl">{IPL_TEAMS.find(t => t.id === currentPlayoff.teamB)?.emoji}</span>
                </div>
                {isUserPlayoff ? (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={startPlayoffMatch}
                    className="w-full py-3 bg-gradient-to-r from-secondary to-secondary/70 text-secondary-foreground font-display font-black text-sm rounded-2xl">
                    🏏 PLAY
                  </motion.button>
                ) : (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={simulatePlayoff}
                    className="w-full py-2.5 glass-premium text-foreground font-display font-bold text-xs rounded-2xl border border-primary/20">
                    ⏩ SIMULATE
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* PLAYOFF RESULT */}
        {phase === "playoffResult" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center gap-4">
            <span className="text-5xl">{game.result === "win" ? "✅" : "❌"}</span>
            <h2 className="font-display text-xl font-black text-foreground tracking-wider">
              {game.result === "win" ? `${currentPlayoff?.label} WON!` : `${currentPlayoff?.label} LOST`}
            </h2>
            <div className="glass-premium rounded-2xl p-4 w-full max-w-xs text-center">
              <span className="font-display text-lg text-secondary font-black">{game.userScore}/{game.userWickets}</span>
              <span className="text-muted-foreground mx-2">vs</span>
              <span className="font-display text-lg text-accent font-black">{game.aiScore}/{game.aiWickets}</span>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={advancePlayoff}
              className="w-full max-w-xs py-3 bg-gradient-to-r from-secondary to-secondary/70 text-secondary-foreground font-display font-black rounded-2xl">
              CONTINUE →
            </motion.button>
          </motion.div>
        )}

        {/* CHAMPION */}
        {phase === "champion" && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center gap-4">
            <motion.span animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl">🏆</motion.span>
            <h2 className="font-display text-2xl font-black text-secondary tracking-wider" style={{ textShadow: "0 0 20px hsl(45 93% 58% / 0.4)" }}>
              IPL CHAMPION!
            </h2>
            <p className="font-display text-sm text-foreground">{userTeamData?.name} wins the IPL! 🎉</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={restart}
              className="w-full max-w-xs py-3 bg-gradient-to-r from-secondary to-secondary/70 text-secondary-foreground font-display font-bold rounded-2xl">
              🔄 NEW SEASON
            </motion.button>
          </motion.div>
        )}

        {/* ELIMINATED */}
        {phase === "eliminated" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-4">
            <span className="text-5xl">😔</span>
            <h2 className="font-display text-xl font-black text-out-red tracking-wider">ELIMINATED</h2>
            <p className="text-sm text-muted-foreground">{userTeamData?.name} didn't make it this time</p>
            <div className="flex gap-3 w-full max-w-xs">
              <motion.button whileTap={{ scale: 0.95 }} onClick={restart}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-primary/70 text-primary-foreground font-display font-bold rounded-2xl">
                🔄 RETRY
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onHome}
                className="flex-1 py-3 glass-premium text-foreground font-display font-bold rounded-2xl border border-primary/10">HOME</motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
