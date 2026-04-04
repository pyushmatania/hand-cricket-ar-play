import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SFX } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import { AVATAR_PRESETS } from "@/lib/avatars";

const HAND_EMOJIS: Record<number, string> = {
  1: "☝️", 2: "✌️", 3: "🤟", 4: "🖖", 6: "👍",
};

type OddEven = "odd" | "even";
type Phase = "intro" | "choose_oe" | "choose_number" | "coin_flip" | "reveal" | "pick_innings";

interface OddEvenTossProps {
  onResult: (batFirst: boolean) => void;
  playerName?: string;
  opponentName?: string;
  isMultiplayer?: boolean;
  multiplayerPlayerChoice?: OddEven | null;
  multiplayerOpponentChoice?: OddEven | null;
  onTossComplete?: (tossWinner: string, battingFirst: string) => void;
  playerAvatarIndex?: number;
  opponentAvatarIndex?: number;
}

/* ── 80px Chrome Coin — Doc 1 spec ── */
function ChromeCoin({ flipping, result }: { flipping: boolean; result: "heads" | "tails" | null }) {
  return (
    <div className="mx-auto" style={{ perspective: "800px", width: 80, height: 80 }}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={
          flipping
            ? {
                rotateY: [0, 2880], // 8 rotations
                rotateZ: [0, 15, -10, 8, -5, 3, 0], // wobble
                y: [0, -80, -100, -60, 0, -4, 0], // bounce landing
              }
            : result === "tails"
            ? { rotateY: 180, rotateZ: 0 }
            : { rotateY: 0, rotateZ: 0 }
        }
        transition={
          flipping
            ? {
                duration: 2,
                ease: [0.15, 0, 0.25, 1],
                y: { duration: 2, times: [0, 0.35, 0.5, 0.75, 0.9, 0.95, 1] },
                rotateZ: { duration: 2, times: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1] },
              }
            : { duration: 0.4, type: "spring", damping: 15 }
        }
      >
        {/* HEADS — Lion emblem */}
        <div
          className="absolute inset-0 rounded-full flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            background: "conic-gradient(from 45deg, #E8E8E8, #B8B8B8, #F5F5F5, #C0C0C0, #E8E8E8)",
            boxShadow:
              "inset 0 3px 6px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.3), 0 6px 20px rgba(0,0,0,0.5), 0 0 0 3px #999",
          }}
        >
          <span className="text-2xl leading-none">🦁</span>
          <span
            className="font-heading text-[7px] font-bold tracking-[0.15em] mt-0.5"
            style={{ color: "#444", textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}
          >
            HEADS
          </span>
        </div>
        {/* TAILS — Crossed bats */}
        <div
          className="absolute inset-0 rounded-full flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "conic-gradient(from 135deg, #C0C0C0, #E8E8E8, #B0B0B0, #D8D8D8, #C0C0C0)",
            boxShadow:
              "inset 0 3px 6px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.35), 0 6px 20px rgba(0,0,0,0.5), 0 0 0 3px #999",
          }}
        >
          <span className="text-2xl leading-none">⚔️</span>
          <span
            className="font-heading text-[7px] font-bold tracking-[0.15em] mt-0.5"
            style={{ color: "#444", textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}
          >
            TAILS
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Phase dots ── */
function PhaseIndicator({ phase, phases }: { phase: Phase; phases: Phase[] }) {
  const idx = phases.indexOf(phase);
  return (
    <div className="flex items-center justify-center gap-1.5 mb-2">
      {phases.map((p, i) => (
        <motion.div
          key={p}
          className="h-1 rounded-full"
          animate={{
            width: i === idx ? 20 : 8,
            backgroundColor: i <= idx ? "var(--green-play)" : "#334155",
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

const SOLO_PHASES: Phase[] = ["intro", "choose_oe", "choose_number", "coin_flip", "reveal", "pick_innings"];
const MP_PHASES: Phase[] = ["intro", "choose_number", "coin_flip", "reveal", "pick_innings"];

export default function OddEvenToss({
  onResult,
  playerName = "You",
  opponentName = "AI",
  isMultiplayer = false,
  multiplayerPlayerChoice = null,
  multiplayerOpponentChoice = null,
  onTossComplete,
  playerAvatarIndex = 0,
  opponentAvatarIndex = 1,
}: OddEvenTossProps) {
  const phases = isMultiplayer ? MP_PHASES : SOLO_PHASES;
  const [phase, setPhase] = useState<Phase>("intro");
  const [playerChoice, setPlayerChoice] = useState<OddEven | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<OddEven | null>(null);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [aiNumber, setAiNumber] = useState<number | null>(null);
  const [tossWon, setTossWon] = useState<boolean | null>(null);
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<"heads" | "tails" | null>(null);
  const [revealStep, setRevealStep] = useState(0);
  const { soundEnabled } = useSettings();

  const playerAvatar = AVATAR_PRESETS[playerAvatarIndex % AVATAR_PRESETS.length];
  const oppAvatar = AVATAR_PRESETS[opponentAvatarIndex % AVATAR_PRESETS.length];

  // Intro → auto-advance
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => {
      if (isMultiplayer) {
        const pC = multiplayerPlayerChoice ?? (Math.random() > 0.5 ? "odd" : "even");
        const oC = multiplayerOpponentChoice ?? (pC === "odd" ? "even" : "odd");
        setPlayerChoice(pC);
        setOpponentChoice(oC);
        if (soundEnabled) SFX.tossSelect();
        setPhase("choose_number");
      } else {
        setPhase("choose_oe");
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [phase, isMultiplayer, multiplayerPlayerChoice, multiplayerOpponentChoice, soundEnabled]);

  const handleChooseOddEven = useCallback(
    (choice: OddEven) => {
      if (soundEnabled) SFX.tossSelect();
      setPlayerChoice(choice);
      setOpponentChoice(choice === "odd" ? "even" : "odd");
      setPhase("choose_number");
    },
    [soundEnabled]
  );

  const handleChooseNumber = useCallback(
    (num: number) => {
      if (soundEnabled) SFX.tossHandPick();
      setPlayerNumber(num);
      const aiOptions = [1, 2, 3, 4, 6];
      const ai = aiOptions[Math.floor(Math.random() * aiOptions.length)];
      setAiNumber(ai);

      const total = num + ai;
      const isEven = total % 2 === 0;
      const won = (playerChoice === "even" && isEven) || (playerChoice === "odd" && !isEven);
      setTossWon(won);

      setPhase("coin_flip");
      setCoinFlipping(true);
      if (soundEnabled) SFX.tossRevealBuild();

      setTimeout(() => {
        setCoinFlipping(false);
        setCoinResult(won ? "heads" : "tails");
        setPhase("reveal");
        setRevealStep(0);

        setTimeout(() => setRevealStep(1), 600);
        setTimeout(() => {
          setRevealStep(2);
          if (soundEnabled) SFX.tossReveal();
        }, 1200);
        setTimeout(() => {
          setRevealStep(3);
          if (soundEnabled) {
            if (won) SFX.tossWon();
            else SFX.tossLost();
          }
        }, 1900);

        if (!won) {
          setTimeout(() => {
            const aiBatsFirst = Math.random() > 0.5;
            const battingFirstName = aiBatsFirst ? opponentName : playerName;
            onTossComplete?.(opponentName, battingFirstName);
            onResult(!aiBatsFirst);
          }, 3800);
        }
      }, 2200);
    },
    [soundEnabled, playerChoice, opponentName, playerName, onTossComplete, onResult]
  );

  const handleInningsChoice = useCallback(
    (batFirst: boolean) => {
      if (soundEnabled) SFX.tossSelect();
      const battingFirstName = batFirst ? playerName : opponentName;
      onTossComplete?.(playerName, battingFirstName);
      setTimeout(() => onResult(batFirst), 800);
    },
    [soundEnabled, playerName, opponentName, onTossComplete, onResult]
  );

  const winnerName = tossWon ? playerName : opponentName;

  // Hand button colors per Doc 1
  const HAND_COLORS: Record<number, { bg: string; border: string }> = {
    1: { bg: "linear-gradient(180deg, #4ADE80, #22C55E, #15803D)", border: "#0F5132" },
    2: { bg: "linear-gradient(180deg, #67E8F9, #06B6D4, #0E7490)", border: "#064E63" },
    3: { bg: "linear-gradient(180deg, #60A5FA, #3B82F6, #1D4ED8)", border: "#1E3A6E" },
    4: { bg: "linear-gradient(180deg, #FDE047, #EAB308, #A16207)", border: "#724B05" },
    6: { bg: "linear-gradient(180deg, #FCA5A5, #EF4444, #991B1B)", border: "#7F1D1D" },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(180deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))",
        border: "3px solid hsl(var(--team-primary))",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Chrome bracket corners */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white/20 rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white/20 rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white/20 rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white/20 rounded-br-sm" />

      <div className="relative z-10 p-5 space-y-4">
        <PhaseIndicator phase={phase} phases={phases} />

        {/* LIVE badge */}
        <div className="text-center">
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            <span className="font-display text-[8px] font-bold tracking-[0.3em] text-white">LIVE • TOSS</span>
          </motion.div>
        </div>

        {/* Player cards */}
        <div className="flex items-center justify-center gap-3">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 rounded-xl p-3 text-center"
            style={{ background: "rgba(0,0,0,0.3)", border: "2px solid rgba(255,255,255,0.06)" }}
          >
            <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${playerAvatar.gradient} flex items-center justify-center shadow-lg mb-2`}>
              <span className="text-2xl">{playerAvatar.emoji}</span>
            </div>
            <span className="font-display text-[10px] font-black text-white tracking-wider block truncate">
              {playerName.toUpperCase()}
            </span>
            {playerChoice && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1.5">
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-[8px] font-display font-bold tracking-wider text-white"
                  style={{
                    background: playerChoice === "odd" ? "rgba(59,130,246,0.25)" : "rgba(234,179,8,0.25)",
                    border: `1px solid ${playerChoice === "odd" ? "rgba(59,130,246,0.4)" : "rgba(234,179,8,0.4)"}`,
                  }}
                >
                  {playerChoice.toUpperCase()}
                </span>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <span
              className="font-heading text-xl font-black"
              style={{ color: "#C0C0C0", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
            >
              VS
            </span>
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 rounded-xl p-3 text-center"
            style={{ background: "rgba(0,0,0,0.3)", border: "2px solid rgba(255,255,255,0.06)" }}
          >
            <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${oppAvatar.gradient} flex items-center justify-center shadow-lg mb-2`}>
              <span className="text-2xl">{oppAvatar.emoji}</span>
            </div>
            <span className="font-display text-[10px] font-black text-white tracking-wider block truncate">
              {opponentName.toUpperCase()}
            </span>
            {opponentChoice && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1.5">
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-[8px] font-display font-bold tracking-wider text-white"
                  style={{
                    background: opponentChoice === "odd" ? "rgba(59,130,246,0.25)" : "rgba(234,179,8,0.25)",
                    border: `1px solid ${opponentChoice === "odd" ? "rgba(59,130,246,0.4)" : "rgba(234,179,8,0.4)"}`,
                  }}
                >
                  {opponentChoice.toUpperCase()}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── INTRO ── */}
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 text-center space-y-4">
              <ChromeCoin flipping={false} result={null} />
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="font-display text-xs font-bold tracking-[0.3em] text-white"
              >
                THE TOSS
              </motion.p>
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--green-play)]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── CHOOSE ODD/EVEN ── */}
          {phase === "choose_oe" && !isMultiplayer && (
            <motion.div key="oe" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="text-center">
                <p className="font-display text-sm font-black tracking-wider text-white">MAKE YOUR CALL</p>
                <p className="text-[10px] mt-1 text-[#94A3B8]">Odd or Even — choose wisely</p>
              </div>

              <div className="flex items-center justify-center gap-4 py-2">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}
                >
                  <span className="text-2xl">☝️</span>
                </motion.div>
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-base font-black text-[#94A3B8]"
                >
                  VS
                </motion.span>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)" }}
                >
                  <span className="text-2xl">✌️</span>
                </motion.div>
              </div>

              {/* HEADS/TAILS style buttons — Doc 1: calc(50% - 8px), 56px height */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.92, y: 3 }}
                  onClick={() => handleChooseOddEven("odd")}
                  className="flex-1 font-display font-bold rounded-xl text-sm text-white"
                  style={{
                    height: 56,
                    background: "linear-gradient(180deg, var(--blue-info-light), var(--blue-info), var(--blue-info-dark))",
                    borderBottom: "6px solid #1E3A8A",
                    boxShadow: "0 6px 0 rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)",
                    textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                  }}
                >
                  <span className="text-lg mr-1">☝️</span> ODD
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.92, y: 3 }}
                  onClick={() => handleChooseOddEven("even")}
                  className="flex-1 font-display font-bold rounded-xl text-sm text-white"
                  style={{
                    height: 56,
                    background: "linear-gradient(180deg, #FDE047, #EAB308, #A16207)",
                    borderBottom: "6px solid #724B05",
                    boxShadow: "0 6px 0 rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)",
                    textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                  }}
                >
                  <span className="text-lg mr-1">✌️</span> EVEN
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── CHOOSE NUMBER ── */}
          {phase === "choose_number" && (
            <motion.div key="num" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="text-center">
                <p className="font-display text-sm font-black tracking-wider text-white">PLAY YOUR HAND</p>
                <p className="text-[10px] mt-1">
                  <span className="text-[#94A3B8]">You called </span>
                  <span className="font-bold uppercase" style={{ color: playerChoice === "odd" ? "var(--blue-info)" : "#EAB308" }}>
                    {playerChoice}
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {([1, 2, 3, 4, 6] as number[]).map((n) => {
                  const c = HAND_COLORS[n];
                  return (
                    <motion.button
                      key={n}
                      whileTap={{ scale: 0.88, y: 4 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleChooseNumber(n)}
                      className="rounded-full font-heading font-bold text-lg flex flex-col items-center justify-center text-white"
                      style={{
                        width: 72,
                        height: 72,
                        margin: "0 auto",
                        background: c.bg,
                        border: `4px solid ${c.border}`,
                        borderBottom: `6px solid ${c.border}`,
                        boxShadow: "0 6px 0 rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)",
                        textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                      }}
                    >
                      <span className="text-2xl leading-none">{HAND_EMOJIS[n]}</span>
                      <span className="text-xs font-bold">{n}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── COIN FLIP ── */}
          {phase === "coin_flip" && (
            <motion.div key="flip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 text-center space-y-5">
              <ChromeCoin flipping={coinFlipping} result={coinResult} />
              {/* Pitch surface line for landing */}
              <div className="w-24 h-1 mx-auto rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="font-display text-xs font-bold tracking-[0.25em] text-[var(--green-play)]"
              >
                COIN IN THE AIR...
              </motion.p>
            </motion.div>
          )}

          {/* ── REVEAL ── */}
          {phase === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="font-display text-xs font-black tracking-wider text-center text-white">TOSS RESULT</p>

              {/* Number cards */}
              <div className="flex items-center justify-center gap-3">
                <div className="text-center flex-1">
                  <p className="text-[8px] font-display font-bold tracking-widest mb-1 text-[#94A3B8]">
                    {playerName.toUpperCase().slice(0, 10)}
                  </p>
                  <motion.div
                    initial={{ rotateY: 90, scale: 0.8 }}
                    animate={{ rotateY: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-20 h-20 mx-auto rounded-xl flex flex-col items-center justify-center"
                    style={{
                      background: "rgba(59,130,246,0.15)",
                      border: "2px solid rgba(59,130,246,0.4)",
                      boxShadow: "0 0 20px rgba(59,130,246,0.15)",
                    }}
                  >
                    <span className="text-3xl">{playerNumber ? HAND_EMOJIS[playerNumber] : ""}</span>
                    <span className="font-heading text-lg font-black text-[var(--blue-info)]">{playerNumber}</span>
                  </motion.div>
                </div>

                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-black text-[var(--green-play)]"
                >
                  +
                </motion.span>

                <div className="text-center flex-1">
                  <p className="text-[8px] font-display font-bold tracking-widest mb-1 text-[#94A3B8]">
                    {opponentName.toUpperCase().slice(0, 10)}
                  </p>
                  <AnimatePresence>
                    {revealStep >= 1 ? (
                      <motion.div
                        initial={{ rotateY: 90, scale: 0.8 }}
                        animate={{ rotateY: 0, scale: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                        className="w-20 h-20 mx-auto rounded-xl flex flex-col items-center justify-center"
                        style={{
                          background: "rgba(234,179,8,0.15)",
                          border: "2px solid rgba(234,179,8,0.4)",
                          boxShadow: "0 0 20px rgba(234,179,8,0.15)",
                        }}
                      >
                        <span className="text-3xl">{aiNumber ? HAND_EMOJIS[aiNumber] : ""}</span>
                        <span className="font-heading text-lg font-black text-[#EAB308]">{aiNumber}</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="w-20 h-20 mx-auto rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.3)", border: "2px solid rgba(255,255,255,0.06)" }}
                      >
                        <motion.span
                          animate={{ rotate: [0, -20, 20, 0], y: [0, -5, 0] }}
                          transition={{ duration: 0.4, repeat: Infinity }}
                          className="text-3xl"
                        >
                          ✊
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Total sum */}
              <AnimatePresence>
                {revealStep >= 2 && playerNumber !== null && aiNumber !== null && (
                  <motion.div
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="text-center"
                  >
                    <div
                      className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl"
                      style={{
                        background: "rgba(74,222,80,0.1)",
                        border: "2px solid rgba(74,222,80,0.3)",
                        boxShadow: "0 0 25px rgba(74,222,80,0.1)",
                      }}
                    >
                      <span className="font-heading text-lg font-black text-[var(--green-play)] tracking-wider">
                        {playerNumber + aiNumber}
                      </span>
                      <span className="text-white/30">=</span>
                      <span
                        className="font-display text-sm font-black tracking-wider"
                        style={{ color: (playerNumber + aiNumber) % 2 === 0 ? "#EAB308" : "var(--blue-info)" }}
                      >
                        {(playerNumber + aiNumber) % 2 === 0 ? "EVEN" : "ODD"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Winner banner */}
              <AnimatePresence>
                {revealStep >= 3 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="py-4 px-4 rounded-xl font-display font-black text-center"
                    style={{
                      background: tossWon
                        ? "linear-gradient(135deg, rgba(74,222,80,0.2), rgba(74,222,80,0.05))"
                        : "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))",
                      border: tossWon
                        ? "2px solid rgba(74,222,80,0.4)"
                        : "2px solid rgba(239,68,68,0.3)",
                      boxShadow: tossWon
                        ? "0 0 30px rgba(74,222,80,0.15)"
                        : "0 0 30px rgba(239,68,68,0.1)",
                    }}
                  >
                    <span className="text-3xl block mb-1">{tossWon ? "🏆" : "😤"}</span>
                    <span className="text-sm tracking-wider" style={{ color: tossWon ? "var(--green-play)" : "#EF4444" }}>
                      {winnerName.toUpperCase()} WON THE TOSS!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pick innings (if won) */}
              <AnimatePresence>
                {revealStep >= 3 && tossWon && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
                    <p className="text-[11px] font-display font-bold text-center text-white">What do you want to do?</p>
                    <div className="flex gap-3">
                      <motion.button
                        whileTap={{ scale: 0.92, y: 3 }}
                        onClick={() => handleInningsChoice(true)}
                        className="flex-1 font-display font-black rounded-xl text-sm text-white"
                        style={{
                          height: 56,
                          background: "linear-gradient(180deg, var(--green-play-light), var(--green-play), var(--green-play-dark))",
                          borderBottom: "6px solid var(--green-play-shadow)",
                          boxShadow: "0 6px 0 rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)",
                          textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                        }}
                      >
                        <span className="text-xl block mb-0.5">🏏</span>
                        BAT FIRST
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.92, y: 3 }}
                        onClick={() => handleInningsChoice(false)}
                        className="flex-1 font-display font-black rounded-xl text-sm text-white"
                        style={{
                          height: 56,
                          background: "linear-gradient(180deg, #FCA5A5, #EF4444, #991B1B)",
                          borderBottom: "6px solid #7F1D1D",
                          boxShadow: "0 6px 0 rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)",
                          textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                        }}
                      >
                        <span className="text-xl block mb-0.5">🎯</span>
                        BOWL FIRST
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI choosing */}
              <AnimatePresence>
                {revealStep >= 3 && !tossWon && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-2 text-center">
                    <p className="text-[10px] font-display tracking-wider text-[#94A3B8]">
                      {opponentName} is choosing...
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full bg-[var(--green-play)]"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
