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

/* ── Chrome Coin Component ── */
function ChromeCoin({ flipping, result }: { flipping: boolean; result: "heads" | "tails" | null }) {
  return (
    <div className="perspective-[600px] w-24 h-24 mx-auto">
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={
          flipping
            ? { rotateX: [0, 1800], y: [0, -60, -80, -40, 0] }
            : result === "tails"
            ? { rotateX: 180 }
            : { rotateX: 0 }
        }
        transition={
          flipping
            ? { duration: 2.2, ease: [0.2, 0, 0.3, 1], times: [0, 0.3, 0.5, 0.8, 1] }
            : { duration: 0.4 }
        }
      >
        {/* Heads */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(145deg, hsl(var(--chrome-light)), hsl(var(--chrome-mid)), hsl(var(--chrome-dark)))",
            boxShadow: "inset 0 2px 4px hsl(0 0% 100% / 0.4), inset 0 -2px 4px hsl(0 0% 0% / 0.3), 0 8px 24px hsl(0 0% 0% / 0.5)",
            border: "3px solid hsl(var(--chrome-highlight))",
          }}
        >
          <span className="text-4xl">🏏</span>
        </div>
        {/* Tails */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateX(180deg)",
            background: "linear-gradient(145deg, hsl(var(--chrome-dark)), hsl(var(--chrome-mid)), hsl(var(--chrome-light)))",
            boxShadow: "inset 0 2px 4px hsl(0 0% 100% / 0.3), inset 0 -2px 4px hsl(0 0% 0% / 0.4), 0 8px 24px hsl(0 0% 0% / 0.5)",
            border: "3px solid hsl(var(--chrome-highlight))",
          }}
        >
          <span className="text-4xl">🎯</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Phase Indicator ── */
function PhaseIndicator({ phase, phases }: { phase: Phase; phases: Phase[] }) {
  const idx = phases.indexOf(phase);
  return (
    <div className="flex items-center justify-center gap-1.5 mb-3">
      {phases.map((p, i) => (
        <motion.div
          key={p}
          className="h-1 rounded-full"
          animate={{
            width: i === idx ? 20 : 8,
            backgroundColor: i <= idx ? "hsl(var(--secondary))" : "hsl(var(--muted))",
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
  onResult, playerName = "You", opponentName = "AI",
  isMultiplayer = false, multiplayerPlayerChoice = null, multiplayerOpponentChoice = null,
  onTossComplete, playerAvatarIndex = 0, opponentAvatarIndex = 1,
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

  // Phase 1: Intro — auto-advance after drama beat
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

  const handleChooseOddEven = useCallback((choice: OddEven) => {
    if (soundEnabled) SFX.tossSelect();
    setPlayerChoice(choice);
    setOpponentChoice(choice === "odd" ? "even" : "odd");
    setPhase("choose_number");
  }, [soundEnabled]);

  const handleChooseNumber = useCallback((num: number) => {
    if (soundEnabled) SFX.tossHandPick();
    setPlayerNumber(num);
    const aiOptions = [1, 2, 3, 4, 6];
    const ai = aiOptions[Math.floor(Math.random() * aiOptions.length)];
    setAiNumber(ai);

    const total = num + ai;
    const isEven = total % 2 === 0;
    const won = (playerChoice === "even" && isEven) || (playerChoice === "odd" && !isEven);
    setTossWon(won);

    // Move to coin flip phase
    setPhase("coin_flip");
    setCoinFlipping(true);
    if (soundEnabled) SFX.tossRevealBuild();

    // After coin flip animation, move to reveal
    setTimeout(() => {
      setCoinFlipping(false);
      setCoinResult(won ? "heads" : "tails");
      setPhase("reveal");
      setRevealStep(0);

      // Staggered reveal steps
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

      // If AI won, auto-pick after delay
      if (!won) {
        setTimeout(() => {
          const aiBatsFirst = Math.random() > 0.5;
          const battingFirstName = aiBatsFirst ? opponentName : playerName;
          onTossComplete?.(opponentName, battingFirstName);
          onResult(!aiBatsFirst);
        }, 3800);
      }
    }, 2400);
  }, [soundEnabled, playerChoice, opponentName, playerName, onTossComplete, onResult]);

  const handleInningsChoice = useCallback((batFirst: boolean) => {
    if (soundEnabled) SFX.tossSelect();
    const battingFirstName = batFirst ? playerName : opponentName;
    onTossComplete?.(playerName, battingFirstName);
    setTimeout(() => onResult(batFirst), 800);
  }, [soundEnabled, playerName, opponentName, onTossComplete, onResult]);

  const winnerName = tossWon ? playerName : opponentName;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden rounded-3xl">
      {/* Surface: concrete with pitch stripes */}
      <div className="absolute inset-0 surface-concrete" />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        background: "repeating-linear-gradient(90deg, transparent, transparent 18px, hsl(var(--grass-mid)) 18px, hsl(var(--grass-mid)) 19px)",
      }} />
      {/* Floodlight chrome glows */}
      <div className="absolute -top-8 left-[15%] w-28 h-28 rounded-full opacity-15" style={{
        background: "radial-gradient(circle, hsl(var(--chrome-highlight) / 0.6), transparent 70%)",
        filter: "blur(20px)",
      }} />
      <div className="absolute -top-8 right-[15%] w-28 h-28 rounded-full opacity-15" style={{
        background: "radial-gradient(circle, hsl(var(--chrome-highlight) / 0.6), transparent 70%)",
        filter: "blur(20px)",
      }} />

      <div className="relative z-10 p-5 space-y-4">
        {/* Phase indicator */}
        <PhaseIndicator phase={phase} phases={phases} />

        {/* Live badge */}
        <div className="text-center">
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full border mb-1"
            style={{
              background: "linear-gradient(135deg, hsl(var(--leather-dark) / 0.4), hsl(var(--leather-mid) / 0.2))",
              borderColor: "hsl(var(--leather-highlight) / 0.4)",
            }}
          >
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="font-display text-[8px] font-bold tracking-[0.3em]" style={{ color: "hsl(var(--chalk-white))" }}>
              LIVE • TOSS
            </span>
          </motion.div>
        </div>

        {/* Player cards — chrome framed */}
        <div className="flex items-center justify-center gap-3">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 rounded-2xl p-3 text-center"
            style={{
              background: "linear-gradient(180deg, hsl(var(--concrete-mid)), hsl(var(--concrete-dark)))",
              border: "2px solid hsl(var(--chrome-dark) / 0.5)",
              boxShadow: "inset 0 1px 0 hsl(var(--chrome-light) / 0.15), 0 4px 12px hsl(0 0% 0% / 0.4)",
            }}
          >
            <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${playerAvatar.gradient} flex items-center justify-center shadow-lg mb-2`}>
              <span className="text-2xl">{playerAvatar.emoji}</span>
            </div>
            <span className="font-display text-[10px] font-black text-foreground tracking-wider block truncate">{playerName.toUpperCase()}</span>
            {playerChoice && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1.5">
                <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-display font-bold tracking-wider"
                  style={{
                    background: playerChoice === "odd"
                      ? "linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(var(--primary) / 0.1))"
                      : "linear-gradient(135deg, hsl(var(--accent) / 0.25), hsl(var(--accent) / 0.1))",
                    color: playerChoice === "odd" ? "hsl(var(--primary))" : "hsl(var(--accent))",
                    border: `1px solid ${playerChoice === "odd" ? "hsl(var(--primary) / 0.3)" : "hsl(var(--accent) / 0.3)"}`,
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
            className="flex flex-col items-center"
          >
            <span className="font-display text-xl font-black" style={{
              background: "linear-gradient(180deg, hsl(var(--chrome-highlight)), hsl(var(--chrome-mid)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 2px 4px hsl(0 0% 0% / 0.5))",
            }}>VS</span>
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 rounded-2xl p-3 text-center"
            style={{
              background: "linear-gradient(180deg, hsl(var(--concrete-mid)), hsl(var(--concrete-dark)))",
              border: "2px solid hsl(var(--chrome-dark) / 0.5)",
              boxShadow: "inset 0 1px 0 hsl(var(--chrome-light) / 0.15), 0 4px 12px hsl(0 0% 0% / 0.4)",
            }}
          >
            <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${oppAvatar.gradient} flex items-center justify-center shadow-lg mb-2`}>
              <span className="text-2xl">{oppAvatar.emoji}</span>
            </div>
            <span className="font-display text-[10px] font-black text-foreground tracking-wider block truncate">{opponentName.toUpperCase()}</span>
            {opponentChoice && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1.5">
                <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-display font-bold tracking-wider"
                  style={{
                    background: opponentChoice === "odd"
                      ? "linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(var(--primary) / 0.1))"
                      : "linear-gradient(135deg, hsl(var(--accent) / 0.25), hsl(var(--accent) / 0.1))",
                    color: opponentChoice === "odd" ? "hsl(var(--primary))" : "hsl(var(--accent))",
                    border: `1px solid ${opponentChoice === "odd" ? "hsl(var(--primary) / 0.3)" : "hsl(var(--accent) / 0.3)"}`,
                  }}
                >
                  {opponentChoice.toUpperCase()}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Phase 1: INTRO — dramatic entrance ── */}
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 text-center space-y-4">
              <ChromeCoin flipping={false} result={null} />
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="font-display text-xs font-bold tracking-[0.3em]"
                style={{ color: "hsl(var(--chrome-light))" }}
              >
                THE TOSS
              </motion.p>
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "hsl(var(--secondary))" }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Phase 2: CHOOSE ODD/EVEN ── */}
          {phase === "choose_oe" && !isMultiplayer && (
            <motion.div key="oe" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="text-center">
                <p className="font-display text-sm font-black tracking-wider" style={{ color: "hsl(var(--chalk-white))" }}>
                  MAKE YOUR CALL
                </p>
                <p className="text-[10px] mt-1" style={{ color: "hsl(var(--chrome-mid))" }}>
                  Odd or Even — choose wisely
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 py-2">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.05))", border: "1px solid hsl(var(--primary) / 0.3)" }}
                >
                  <span className="text-2xl">☝️</span>
                </motion.div>
                <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }}
                  className="text-base font-black" style={{ color: "hsl(var(--chrome-mid))" }}>VS</motion.span>
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(var(--accent) / 0.2), hsl(var(--accent) / 0.05))", border: "1px solid hsl(var(--accent) / 0.3)" }}
                >
                  <span className="text-2xl">✌️</span>
                </motion.div>
              </div>

              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleChooseOddEven("odd")}
                  className="flex-1 py-3.5 font-display font-bold rounded-2xl text-sm text-primary-foreground"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))",
                    boxShadow: "0 4px 20px hsl(var(--primary) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.15)",
                    border: "1px solid hsl(var(--primary) / 0.4)",
                  }}
                >
                  <span className="text-lg mr-1">☝️</span> ODD
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleChooseOddEven("even")}
                  className="flex-1 py-3.5 font-display font-bold rounded-2xl text-sm text-accent-foreground"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent) / 0.7))",
                    boxShadow: "0 4px 20px hsl(var(--accent) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.15)",
                    border: "1px solid hsl(var(--accent) / 0.4)",
                  }}
                >
                  <span className="text-lg mr-1">✌️</span> EVEN
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Phase 3: CHOOSE NUMBER ── */}
          {phase === "choose_number" && (
            <motion.div key="num" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="text-center">
                <p className="font-display text-sm font-black tracking-wider" style={{ color: "hsl(var(--chalk-white))" }}>
                  PLAY YOUR HAND
                </p>
                <p className="text-[10px] mt-1">
                  <span style={{ color: "hsl(var(--chrome-mid))" }}>You called </span>
                  <span className="font-bold uppercase" style={{ color: playerChoice === "odd" ? "hsl(var(--primary))" : "hsl(var(--accent))" }}>
                    {playerChoice}
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 6].map((n) => (
                  <motion.button
                    key={n}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleChooseNumber(n)}
                    className="py-4 rounded-2xl font-display font-black text-lg flex flex-col items-center gap-1 transition-all"
                    style={{
                      background: "linear-gradient(180deg, hsl(var(--concrete-mid)), hsl(var(--concrete-dark)))",
                      border: "2px solid hsl(var(--chrome-dark) / 0.4)",
                      boxShadow: "inset 0 1px 0 hsl(var(--chrome-light) / 0.1), 0 3px 8px hsl(0 0% 0% / 0.3)",
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    <span className="text-2xl">{HAND_EMOJIS[n]}</span>
                    <span className="text-xs" style={{ color: "hsl(var(--chrome-light))" }}>{n}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Phase 4: COIN FLIP — dramatic chrome coin ── */}
          {phase === "coin_flip" && (
            <motion.div key="flip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 text-center space-y-5">
              <ChromeCoin flipping={coinFlipping} result={coinResult} />
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="font-display text-xs font-bold tracking-[0.25em]"
                style={{ color: "hsl(var(--secondary))" }}
              >
                COIN IN THE AIR...
              </motion.p>
            </motion.div>
          )}

          {/* ── Phase 5: REVEAL — staggered drama ── */}
          {phase === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="font-display text-xs font-black tracking-wider text-center" style={{ color: "hsl(var(--chalk-white))" }}>
                TOSS RESULT
              </p>

              {/* Number cards */}
              <div className="flex items-center justify-center gap-3">
                <div className="text-center flex-1">
                  <p className="text-[8px] font-display font-bold tracking-widest mb-1" style={{ color: "hsl(var(--chrome-mid))" }}>
                    {playerName.toUpperCase().slice(0, 10)}
                  </p>
                  <motion.div
                    initial={{ rotateY: 90, scale: 0.8 }}
                    animate={{ rotateY: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-20 h-20 mx-auto rounded-2xl flex flex-col items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.05))",
                      border: "2px solid hsl(var(--primary) / 0.4)",
                      boxShadow: "0 0 20px hsl(var(--primary) / 0.15)",
                    }}
                  >
                    <span className="text-3xl">{playerNumber ? HAND_EMOJIS[playerNumber] : ""}</span>
                    <span className="font-display text-lg font-black text-primary">{playerNumber}</span>
                  </motion.div>
                </div>

                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                  className="text-2xl font-black" style={{ color: "hsl(var(--secondary))" }}
                >+</motion.span>

                <div className="text-center flex-1">
                  <p className="text-[8px] font-display font-bold tracking-widest mb-1" style={{ color: "hsl(var(--chrome-mid))" }}>
                    {opponentName.toUpperCase().slice(0, 10)}
                  </p>
                  <AnimatePresence>
                    {revealStep >= 1 ? (
                      <motion.div
                        initial={{ rotateY: 90, scale: 0.8 }}
                        animate={{ rotateY: 0, scale: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                        className="w-20 h-20 mx-auto rounded-2xl flex flex-col items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, hsl(var(--accent) / 0.2), hsl(var(--accent) / 0.05))",
                          border: "2px solid hsl(var(--accent) / 0.4)",
                          boxShadow: "0 0 20px hsl(var(--accent) / 0.15)",
                        }}
                      >
                        <span className="text-3xl">{aiNumber ? HAND_EMOJIS[aiNumber] : ""}</span>
                        <span className="font-display text-lg font-black text-accent">{aiNumber}</span>
                      </motion.div>
                    ) : (
                      <motion.div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center"
                        style={{ background: "hsl(var(--muted) / 0.3)", border: "2px solid hsl(var(--border) / 0.3)" }}
                      >
                        <motion.span animate={{ rotate: [0, -20, 20, 0], y: [0, -5, 0] }} transition={{ duration: 0.4, repeat: Infinity }}
                          className="text-3xl">✊</motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Total sum */}
              <AnimatePresence>
                {revealStep >= 2 && playerNumber !== null && aiNumber !== null && (
                  <motion.div initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 10 }}
                    className="text-center">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--secondary) / 0.15), hsl(var(--secondary) / 0.05))",
                        border: "2px solid hsl(var(--secondary) / 0.4)",
                        boxShadow: "0 0 25px hsl(var(--secondary) / 0.15)",
                      }}
                    >
                      <span className="font-display text-lg font-black text-secondary tracking-wider">
                        {playerNumber + aiNumber}
                      </span>
                      <span style={{ color: "hsl(var(--secondary) / 0.5)" }}>=</span>
                      <span className="font-display text-sm font-black tracking-wider"
                        style={{ color: (playerNumber + aiNumber) % 2 === 0 ? "hsl(var(--accent))" : "hsl(var(--primary))" }}
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
                    className="py-4 px-4 rounded-2xl font-display font-black text-center"
                    style={{
                      background: tossWon
                        ? "linear-gradient(135deg, hsl(var(--grass-dark) / 0.5), hsl(var(--grass-mid) / 0.2))"
                        : "linear-gradient(135deg, hsl(var(--leather-dark) / 0.5), hsl(var(--leather-mid) / 0.2))",
                      border: tossWon
                        ? "2px solid hsl(var(--grass-light) / 0.5)"
                        : "2px solid hsl(var(--leather-highlight) / 0.4)",
                      boxShadow: tossWon
                        ? "0 0 30px hsl(var(--grass-mid) / 0.2)"
                        : "0 0 30px hsl(var(--leather-mid) / 0.2)",
                    }}
                  >
                    <span className="text-3xl block mb-1">{tossWon ? "🏆" : "😤"}</span>
                    <span className="text-sm tracking-wider" style={{
                      color: tossWon ? "hsl(var(--grass-light))" : "hsl(var(--leather-highlight))"
                    }}>
                      {winnerName.toUpperCase()} WON THE TOSS!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Phase 6: PICK INNINGS (if won) ── */}
              <AnimatePresence>
                {revealStep >= 3 && tossWon && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
                    <p className="text-[11px] font-display font-bold text-center" style={{ color: "hsl(var(--chalk-white))" }}>
                      What do you want to do?
                    </p>
                    <div className="flex gap-3">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleInningsChoice(true)}
                        className="flex-1 py-4 font-display font-black rounded-2xl text-sm text-primary-foreground"
                        style={{
                          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))",
                          boxShadow: "0 4px 24px hsl(var(--primary) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.15)",
                          border: "1px solid hsl(var(--primary) / 0.4)",
                        }}
                      >
                        <span className="text-xl block mb-1">🏏</span>
                        BAT FIRST
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleInningsChoice(false)}
                        className="flex-1 py-4 font-display font-black rounded-2xl text-sm text-accent-foreground"
                        style={{
                          background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent) / 0.7))",
                          boxShadow: "0 4px 24px hsl(var(--accent) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.15)",
                          border: "1px solid hsl(var(--accent) / 0.4)",
                        }}
                      >
                        <span className="text-xl block mb-1">🎯</span>
                        BOWL FIRST
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI choosing indicator */}
              <AnimatePresence>
                {revealStep >= 3 && !tossWon && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-2 text-center">
                    <p className="text-[10px] font-display tracking-wider" style={{ color: "hsl(var(--chrome-mid))" }}>
                      {opponentName} is choosing...
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: "hsl(var(--secondary))" }}
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
