import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SFX } from "@/lib/sounds";
import { CrowdSFX, speakDuoCommentary } from "@/lib/voiceCommentary";
import { playElevenLabsMusic, stopMusic, isElevenLabsAvailable } from "@/lib/elevenLabsAudio";
import { useSettings } from "@/contexts/SettingsContext";
import {
  pickMatchCommentators, type Commentator, type CommentaryLine,
  getPreMatchDuoIntro, getPreMatchStadiumLines, getPreMatchTossLines,
  getPreMatchStrategyLines, getPreMatchGameOnLines,
} from "@/lib/commentaryDuo";
import charBatsman from "@/assets/char-batsman.png";
import charBowler from "@/assets/char-bowler.png";
import V10Button from "./shared/V10Button";

interface RivalryStats {
  myWins: number; theirWins: number; totalGames: number;
  myHighScore: number; theirHighScore: number;
  myAvgScore?: number; theirAvgScore?: number;
  lastResult?: "win" | "loss" | "draw";
  winStreak?: number; loseStreak?: number;
}

interface EnhancedPreMatchProps {
  playerName: string;
  opponentName: string;
  tossWinner: string;
  battingFirst: string;
  rivalryStats?: RivalryStats | null;
  isPvP?: boolean;
  commentators?: [Commentator, Commentator];
  onComplete: () => void;
}

type PageId = "vs" | "toss" | "gameon";

interface CeremonyPage {
  id: PageId;
  lines: CommentaryLine[];
  voiceEnabled: boolean;
}

export default function EnhancedPreMatch({
  playerName, opponentName, tossWinner, battingFirst,
  rivalryStats, isPvP = false, commentators, onComplete,
}: EnhancedPreMatchProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [visible, setVisible] = useState(true);
  const { voiceEnabled, soundEnabled, crowdEnabled, commentaryEnabled, voiceEngine } = useSettings();
  const stableOnComplete = useCallback(onComplete, []);

  const duo = commentators || pickMatchCommentators();
  const c1 = duo[0].name;
  const c2 = duo[1].name;

  const pages: CeremonyPage[] = [
    { id: "vs", lines: getPreMatchDuoIntro(c1, c2, playerName, opponentName), voiceEnabled: true },
    { id: "toss", lines: getPreMatchTossLines(c1, c2, tossWinner, battingFirst, tossWinner), voiceEnabled: true },
    { id: "gameon", lines: getPreMatchGameOnLines(c1, c2, battingFirst), voiceEnabled: true },
  ];

  const page = pages[currentPage];

  useEffect(() => {
    if (isElevenLabsAvailable()) {
      playElevenLabsMusic("Epic dramatic cricket tournament intro music, cinematic brass and drums, building excitement", 20, false);
    }
    if (soundEnabled) SFX.ceremonyHorn();
    if (crowdEnabled) CrowdSFX.ambientMurmur(8);
    return () => { stopMusic(); };
  }, [soundEnabled, crowdEnabled]);

  useEffect(() => {
    if (!page || !voiceEnabled || !commentaryEnabled || !page.voiceEnabled) return;
    speakDuoCommentary(page.lines, duo, voiceEngine);
  }, [currentPage, voiceEnabled, commentaryEnabled, duo, page, voiceEngine]);

  useEffect(() => {
    if (page?.id === "toss" && soundEnabled) SFX.tossReveal();
    if (page?.id === "gameon") {
      if (soundEnabled) SFX.gameStart();
      if (crowdEnabled) CrowdSFX.roar();
    }
  }, [currentPage, soundEnabled, crowdEnabled, page?.id]);

  const handleTap = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      stopMusic();
      setVisible(false);
      setTimeout(stableOnComplete, 400);
    }
  };

  const handleSkip = () => {
    stopMusic();
    setVisible(false);
    setTimeout(stableOnComplete, 300);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex flex-col overflow-hidden cursor-pointer"
          onClick={handleTap}
        >
          {/* V10 Dark cinematic background */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(180deg, hsl(220 35% 5%) 0%, hsl(220 30% 8%) 50%, hsl(220 25% 4%) 100%)",
          }} />

          {/* Animated stadium lights */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%]"
              style={{
                background: "conic-gradient(from 0deg, transparent, hsl(43 96% 56% / 0.03), transparent, hsl(142 71% 45% / 0.02), transparent, transparent, transparent, transparent)",
              }}
            />
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0, 1, 0], y: [0, -30, -60] }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${30 + Math.random() * 50}%`,
                  background: "hsl(43 96% 56%)",
                  filter: "blur(0.5px)",
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {/* ── VS PAGE — Diagonal Split with stadium-glass frame ── */}
              {page.id === "vs" && (
                <motion.div
                  key="vs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center px-4"
                >
                  <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden stadium-glass" style={{
                    border: "3px solid hsl(43 60% 35% / 0.3)",
                    boxShadow: "0 0 40px hsl(43 96% 56% / 0.08), 0 8px 32px rgba(0,0,0,0.5)",
                  }}>
                    {/* Left half — team blue */}
                    <div className="absolute inset-0" style={{
                      background: "linear-gradient(135deg, hsl(217 70% 38%) 0%, hsl(217 60% 15%) 100%)",
                      clipPath: "polygon(0 0, 55% 0, 40% 100%, 0 100%)",
                    }} />
                    {/* Right half — team red */}
                    <div className="absolute inset-0" style={{
                      background: "linear-gradient(225deg, hsl(4 70% 38%) 0%, hsl(4 60% 15%) 100%)",
                      clipPath: "polygon(55% 0, 100% 0, 100% 100%, 40% 100%)",
                    }} />
                    {/* Gold diagonal slash */}
                    <div className="absolute inset-0" style={{
                      background: "linear-gradient(155deg, transparent 46%, hsl(43 100% 60% / 0.7) 48%, hsl(43 100% 80% / 0.9) 49.5%, hsl(43 100% 60% / 0.7) 51%, transparent 53%)",
                    }} />

                    {/* Player character */}
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", damping: 12, delay: 0.3 }}
                      className="absolute left-0 bottom-0 w-[55%]"
                    >
                      <img src={charBatsman} alt="Player" className="w-full h-auto" style={{ filter: "drop-shadow(0 0 20px hsl(217 70% 50% / 0.5))" }} />
                    </motion.div>

                    {/* Opponent character */}
                    <motion.div
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", damping: 12, delay: 0.5 }}
                      className="absolute right-0 bottom-0 w-[55%]"
                    >
                      <img src={charBowler} alt="Opponent" className="w-full h-auto" style={{ filter: "drop-shadow(0 0 20px hsl(4 70% 50% / 0.5))" }} />
                    </motion.div>

                    {/* VS badge center — scoreboard-metal coin */}
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 8, delay: 0.7 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                    >
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                        background: "conic-gradient(from 0deg, hsl(43 100% 65%), hsl(35 90% 45%), hsl(43 100% 60%), hsl(45 100% 70%), hsl(43 100% 65%))",
                        border: "4px solid hsl(220 30% 14%)",
                        boxShadow: "0 5px 0 hsl(220 30% 8%), 0 0 40px hsl(43 96% 56% / 0.5), inset 0 2px 4px hsl(45 100% 80% / 0.3)",
                      }}>
                        <span className="font-display text-2xl font-black" style={{
                          color: "hsl(220 25% 10%)",
                          textShadow: "0 1px 0 hsl(43 100% 70% / 0.5)",
                          WebkitTextStroke: "1.5px hsl(220 30% 15%)",
                        }}>VS</span>
                      </div>
                    </motion.div>

                    {/* Player name bottom-left */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="absolute bottom-4 left-3 z-10"
                    >
                      <p className="font-display text-lg font-black text-white tracking-wider" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                        {playerName.toUpperCase()}
                      </p>
                      <p className="font-body text-[7px] text-white/50 tracking-widest">PLAYER</p>
                    </motion.div>

                    {/* Opponent name bottom-right */}
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.0 }}
                      className="absolute bottom-4 right-3 z-10 text-right"
                    >
                      <p className="font-display text-lg font-black text-white tracking-wider" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                        {opponentName.toUpperCase()}
                      </p>
                      <p className="font-body text-[7px] text-white/50 tracking-widest">OPPONENT</p>
                    </motion.div>
                  </div>

                  {/* MATCH DAY title */}
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="font-display text-xl font-black tracking-[0.25em] mt-4"
                    style={{ color: "hsl(43 96% 56%)", textShadow: "0 0 30px hsl(43 96% 56% / 0.4), 0 3px 0 hsl(43 70% 30%)" }}
                  >
                    MATCH DAY
                  </motion.h2>
                </motion.div>
              )}

              {/* ── TOSS PAGE — stadium-glass card ── */}
              {page.id === "toss" && (
                <motion.div
                  key="toss"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center px-6"
                >
                  <motion.div
                    animate={{ rotateY: [0, 720] }}
                    transition={{ duration: 1.2 }}
                    className="text-7xl mb-4"
                    style={{ filter: "drop-shadow(0 0 20px hsl(43 96% 56% / 0.4))" }}
                  >
                    🪙
                  </motion.div>
                  <h2 className="font-display text-2xl font-black tracking-wider mb-2"
                    style={{ color: "hsl(43 96% 56%)", textShadow: "0 0 30px hsl(43 96% 56% / 0.4), 0 3px 0 hsl(43 70% 30%)" }}>
                    {tossWinner.toUpperCase()}
                  </h2>
                  <p className="font-display text-sm text-foreground/50 tracking-wider mb-1">WINS THE TOSS!</p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 px-5 py-2.5 rounded-xl stadium-glass"
                    style={{
                      border: `2px solid ${battingFirst === tossWinner ? "hsl(142 50% 30%)" : "hsl(217 50% 30%)"}`,
                    }}
                  >
                    <span className="font-display text-sm font-bold tracking-wider" style={{
                      color: battingFirst === tossWinner ? "hsl(142 71% 45%)" : "hsl(217 91% 60%)",
                    }}>
                      Elects to {battingFirst === tossWinner ? "🏏 BAT" : "🎯 BOWL"} first
                    </span>
                  </motion.div>
                </motion.div>
              )}

              {/* ── GAME ON PAGE ── */}
              {page.id === "gameon" && (
                <motion.div
                  key="gameon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center px-6"
                >
                  <motion.span
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-7xl block mb-4"
                  >
                    🏏
                  </motion.span>
                  <motion.h2
                    initial={{ letterSpacing: "0.1em", scale: 0.5 }}
                    animate={{ letterSpacing: "0.5em", scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="font-display text-[44px] font-black text-white leading-none"
                    style={{ textShadow: "0 4px 0 hsl(43 70% 30%), 0 0 50px hsl(43 96% 56% / 0.4), 0 8px 20px rgba(0,0,0,0.5)" }}
                  >
                    GAME ON!
                  </motion.h2>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-1 rounded-full mt-3"
                    style={{ background: "linear-gradient(90deg, transparent, hsl(43 96% 56%), transparent)" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Commentary bubbles — stadium-glass */}
            <div className="px-4 pb-2 space-y-1.5">
              {page.lines.map((line, i) => {
                const comm = duo.find(c => c.name === line.commentatorId) || duo[0];
                const isFirst = comm === duo[0];
                return (
                  <motion.div
                    key={`${currentPage}-${i}`}
                    initial={{ opacity: 0, x: isFirst ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.4 }}
                    className="flex items-start gap-2 rounded-xl px-3 py-2 stadium-glass"
                    style={{
                      border: `1.5px solid ${isFirst ? "hsl(142 40% 25% / 0.3)" : "hsl(43 40% 25% / 0.3)"}`,
                    }}
                  >
                    <span className="text-sm flex-shrink-0">{comm.avatar}</span>
                    <div className="text-left">
                      <span className="text-[7px] font-display font-bold tracking-wider" style={{
                        color: isFirst ? "hsl(142 71% 45%)" : "hsl(43 96% 56%)",
                      }}>{comm.name}</span>
                      <p className="font-body text-[10px] font-bold text-foreground/70 leading-snug italic">{line.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom controls */}
            <div className="px-4 pb-6 pt-2">
              <div className="flex justify-center gap-2 mb-3">
                {pages.map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: currentPage >= i ? "hsl(43 96% 56%)" : "hsl(0 0% 100% / 0.12)",
                      boxShadow: currentPage >= i ? "0 0 6px hsl(43 96% 56% / 0.5)" : "none",
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  onClick={(e) => { e.stopPropagation(); handleSkip(); }}
                  className="text-[11px] text-foreground/25 font-display tracking-wider underline"
                >
                  SKIP
                </motion.button>
                <motion.span
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[10px] font-display tracking-wider"
                  style={{ color: "hsl(0 0% 100% / 0.35)" }}
                >
                  TAP TO CONTINUE →
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
