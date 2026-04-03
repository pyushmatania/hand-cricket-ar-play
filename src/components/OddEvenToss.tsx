import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SFX } from "@/lib/sounds";
import { useSettings } from "@/contexts/SettingsContext";
import { AVATAR_PRESETS } from "@/lib/avatars";

const HAND_EMOJIS: Record<number, string> = {
  1: "☝️", 2: "✌️", 3: "🤟", 4: "🖖", 6: "👍",
};

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

type OddEven = "odd" | "even";

export default function OddEvenToss({ 
  onResult, playerName = "You", opponentName = "AI", 
  isMultiplayer = false, multiplayerPlayerChoice = null, multiplayerOpponentChoice = null, onTossComplete,
  playerAvatarIndex = 0, opponentAvatarIndex = 1,
}: OddEvenTossProps) {
  const [step, setStep] = useState<"assigning" | "choose_number" | "reveal" | "pick_innings">(isMultiplayer ? "assigning" : "choose_oe" as any);
  const [playerChoice, setPlayerChoice] = useState<OddEven | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<OddEven | null>(null);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [aiNumber, setAiNumber] = useState<number | null>(null);
  const [tossWon, setTossWon] = useState<boolean | null>(null);
  const [revealStep, setRevealStep] = useState(0);
  const { soundEnabled } = useSettings();

  const playerAvatar = AVATAR_PRESETS[playerAvatarIndex % AVATAR_PRESETS.length];
  const oppAvatar = AVATAR_PRESETS[opponentAvatarIndex % AVATAR_PRESETS.length];

  // For PvP: randomly assign odd/even
  useEffect(() => {
    if (isMultiplayer && step === "assigning") {
      const pChoice: OddEven = multiplayerPlayerChoice ?? (Math.random() > 0.5 ? "odd" : "even");
      const oChoice: OddEven = multiplayerOpponentChoice ?? (pChoice === "odd" ? "even" : "odd");
      setPlayerChoice(pChoice);
      setOpponentChoice(oChoice);
      const timer = window.setTimeout(() => {
        if (soundEnabled) SFX.tossSelect();
        setStep("choose_number");
      }, 2500);
      return () => window.clearTimeout(timer);
    }
  }, [isMultiplayer, step, multiplayerPlayerChoice, multiplayerOpponentChoice, soundEnabled]);

  // For solo: start at choose_oe
  useEffect(() => {
    if (!isMultiplayer) {
      setStep("choose_oe" as any);
    }
  }, [isMultiplayer]);

  const handleChooseOddEven = (choice: OddEven) => {
    if (soundEnabled) SFX.tossSelect();
    setPlayerChoice(choice);
    setOpponentChoice(choice === "odd" ? "even" : "odd");
    setStep("choose_number");
  };

  const handleChooseNumber = (num: number) => {
    if (soundEnabled) SFX.tossHandPick();
    setPlayerNumber(num);
    const aiOptions = [1, 2, 3, 4, 6];
    const ai = aiOptions[Math.floor(Math.random() * aiOptions.length)];
    setAiNumber(ai);

    const total = num + ai;
    const resultIsEven = total % 2 === 0;
    const won = (playerChoice === "even" && resultIsEven) || (playerChoice === "odd" && !resultIsEven);
    setTossWon(won);
    setStep("reveal");
    setRevealStep(0);

    setTimeout(() => {
      if (soundEnabled) SFX.tossRevealBuild();
    }, 200);
    setTimeout(() => setRevealStep(1), 800);
    setTimeout(() => {
      setRevealStep(2);
      if (soundEnabled) SFX.tossReveal();
    }, 1500);
    setTimeout(() => {
      setRevealStep(3);
      if (soundEnabled) {
        if (won) SFX.tossWon();
        else SFX.tossLost();
      }
    }, 2200);
    if (!won) {
      setTimeout(() => {
        const aiBatsFirst = Math.random() > 0.5;
        const battingFirstName = aiBatsFirst ? opponentName : playerName;
        onTossComplete?.(opponentName, battingFirstName);
        onResult(aiBatsFirst ? false : true);
      }, 4000);
    }
  };

  const handleInningsChoice = (batFirst: boolean) => {
    if (soundEnabled) SFX.tossSelect();
    const battingFirstName = batFirst ? playerName : opponentName;
    onTossComplete?.(playerName, battingFirstName);
    setTimeout(() => onResult(batFirst), 800);
  };

  const winnerName = tossWon ? playerName : opponentName;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-3xl"
    >
      {/* Stadium jumbotron background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 20px, hsl(var(--primary) / 0.05) 20px, hsl(var(--primary) / 0.05) 21px)`,
        }} />
      </div>
      {/* Floodlight glows */}
      <div className="absolute top-0 left-[20%] w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(45 93% 58% / 0.5), transparent 70%)", filter: "blur(25px)" }} />
      <div className="absolute top-0 right-[20%] w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(45 93% 58% / 0.5), transparent 70%)", filter: "blur(25px)" }} />

      <div className="relative z-10 p-5 space-y-4">
        {/* Jumbotron header */}
        <div className="text-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-out-red/20 border border-out-red/30 mb-2"
          >
            <div className="w-2 h-2 rounded-full bg-out-red animate-pulse" />
            <span className="font-display text-[8px] font-bold text-out-red tracking-[0.3em]">LIVE • TOSS</span>
          </motion.div>
        </div>

        {/* Big screen player cards */}
        <div className="flex items-center justify-center gap-3">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 glass-premium rounded-2xl p-3 text-center border border-primary/20"
          >
            <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${playerAvatar.gradient} flex items-center justify-center shadow-lg mb-2`}>
              <span className="text-2xl">{playerAvatar.emoji}</span>
            </div>
            <span className="font-display text-[10px] font-black text-foreground tracking-wider block truncate">{playerName.toUpperCase()}</span>
            {playerChoice && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-display font-bold tracking-wider ${
                  playerChoice === "odd" ? "bg-primary/20 text-primary border border-primary/30" : "bg-accent/20 text-accent border border-accent/30"
                }`}>
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
            <span className="font-display text-xl font-black text-secondary" style={{ textShadow: "0 0 20px hsl(45 93% 58% / 0.5)" }}>VS</span>
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 glass-premium rounded-2xl p-3 text-center border border-accent/20"
          >
            <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${oppAvatar.gradient} flex items-center justify-center shadow-lg mb-2`}>
              <span className="text-2xl">{oppAvatar.emoji}</span>
            </div>
            <span className="font-display text-[10px] font-black text-foreground tracking-wider block truncate">{opponentName.toUpperCase()}</span>
            {opponentChoice && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-display font-bold tracking-wider ${
                  opponentChoice === "odd" ? "bg-primary/20 text-primary border border-primary/30" : "bg-accent/20 text-accent border border-accent/30"
                }`}>
                  {opponentChoice.toUpperCase()}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {/* PvP: Random assignment screen */}
          {step === "assigning" && isMultiplayer && (
            <motion.div key="assigning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="text-4xl inline-block"
              >🎰</motion.div>
              <p className="text-[11px] text-muted-foreground font-display tracking-wider">Assigning roles...</p>
            </motion.div>
          )}

          {/* Step: Choose Odd/Even (solo only) */}
          {(step as string) === "choose_oe" && !isMultiplayer && (
            <motion.div key="oe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="text-center">
                <p className="font-display text-xs font-black text-foreground tracking-wider">ODD OR EVEN?</p>
                <p className="text-[10px] text-muted-foreground mt-1">Pick your call for the toss</p>
              </div>

              <div className="flex items-center justify-center gap-4 py-2">
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center"
                >
                  <span className="text-3xl">✌️</span>
                </motion.div>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-lg font-black text-muted-foreground">VS</motion.span>
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [5, -5, 5] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center"
                >
                  <span className="text-3xl">🖖</span>
                </motion.div>
              </div>

              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleChooseOddEven("odd")}
                  className="flex-1 py-3.5 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-display font-bold rounded-2xl text-sm shadow-[0_0_25px_hsl(217_91%_60%/0.25)] border border-primary/30">
                  <span className="text-lg mr-1">☝️</span> ODD
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleChooseOddEven("even")}
                  className="flex-1 py-3.5 bg-gradient-to-br from-accent to-accent/70 text-accent-foreground font-display font-bold rounded-2xl text-sm shadow-[0_0_25px_hsl(168_80%_50%/0.2)] border border-accent/30">
                  <span className="text-lg mr-1">✌️</span> EVEN
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step: Choose Number — Stadium style */}
          {step === "choose_number" && (
            <motion.div key="num" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="text-center">
                <p className="font-display text-sm font-black text-foreground tracking-wider">PLAY YOUR HAND</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  You are <span className="text-primary font-bold uppercase">{playerChoice}</span>
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 6].map((n) => (
                  <motion.button
                    key={n}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleChooseNumber(n)}
                    className="py-4 rounded-2xl font-display font-black text-lg bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 text-foreground hover:border-primary/40 hover:from-primary/15 hover:to-primary/5 transition-all flex flex-col items-center gap-1 shadow-lg"
                  >
                    <span className="text-2xl">{HAND_EMOJIS[n]}</span>
                    <span className="text-xs">{n}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step: Reveal — Dramatic jumbotron style */}
          {step === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="font-display text-xs font-black text-foreground tracking-wider text-center">TOSS RESULT</p>

              {/* Big reveal cards */}
              <div className="flex items-center justify-center gap-3">
                <div className="text-center flex-1">
                  <p className="text-[8px] text-muted-foreground font-display font-bold tracking-widest mb-1">
                    {playerName.toUpperCase().slice(0, 10)}
                  </p>
                  <motion.div
                    initial={{ rotateY: 90, scale: 0.8 }}
                    animate={{ rotateY: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border-2 border-primary/40 flex flex-col items-center justify-center shadow-[0_0_25px_hsl(217_91%_60%/0.2)]"
                  >
                    <span className="text-3xl">{playerNumber ? HAND_EMOJIS[playerNumber] : ""}</span>
                    <span className="font-display text-lg font-black text-primary">{playerNumber}</span>
                  </motion.div>
                </div>

                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                  className="text-2xl font-black text-secondary" style={{ textShadow: "0 0 15px hsl(45 93% 58% / 0.5)" }}>+</motion.span>

                <div className="text-center flex-1">
                  <p className="text-[8px] text-muted-foreground font-display font-bold tracking-widest mb-1">
                    {opponentName.toUpperCase().slice(0, 10)}
                  </p>
                  <AnimatePresence>
                    {revealStep >= 1 ? (
                      <motion.div
                        initial={{ rotateY: 90, scale: 0.8 }}
                        animate={{ rotateY: 0, scale: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                        className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-accent/25 to-accent/5 border-2 border-accent/40 flex flex-col items-center justify-center shadow-[0_0_25px_hsl(168_80%_50%/0.2)]"
                      >
                        <span className="text-3xl">{aiNumber ? HAND_EMOJIS[aiNumber] : ""}</span>
                        <span className="font-display text-lg font-black text-accent">{aiNumber}</span>
                      </motion.div>
                    ) : (
                      <motion.div className="w-20 h-20 mx-auto rounded-2xl bg-muted/30 border-2 border-border/30 flex items-center justify-center">
                        <motion.span
                          animate={{ rotate: [0, -20, 20, 0], y: [0, -5, 0] }}
                          transition={{ duration: 0.4, repeat: Infinity }}
                          className="text-3xl"
                        >✊</motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Total — big dramatic reveal */}
              <AnimatePresence>
                {revealStep >= 2 && playerNumber !== null && aiNumber !== null && (
                  <motion.div initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 10 }}
                    className="text-center">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border-2 border-secondary/40 shadow-[0_0_30px_hsl(45_93%_58%/0.2)]">
                      <span className="font-display text-lg font-black text-secondary tracking-wider">
                        {playerNumber + aiNumber}
                      </span>
                      <span className="text-secondary/60">=</span>
                      <span className={`font-display text-sm font-black tracking-wider ${
                        (playerNumber + aiNumber) % 2 === 0 ? "text-accent" : "text-primary"
                      }`}>
                        {(playerNumber + aiNumber) % 2 === 0 ? "EVEN" : "ODD"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Win/Loss — full-width banner */}
              <AnimatePresence>
                {revealStep >= 3 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className={`py-4 px-4 rounded-2xl font-display font-black text-center ${
                      tossWon
                        ? "bg-gradient-to-r from-neon-green/20 to-neon-green/5 border-2 border-neon-green/40 shadow-[0_0_40px_hsl(142_71%_45%/0.2)]"
                        : "bg-gradient-to-r from-out-red/20 to-out-red/5 border-2 border-out-red/40 shadow-[0_0_40px_hsl(var(--out-red)/0.2)]"
                    }`}
                  >
                    <span className="text-3xl block mb-1">{tossWon ? "🏆" : "😤"}</span>
                    <span className={`text-sm tracking-wider ${tossWon ? "text-neon-green" : "text-out-red"}`}>
                      {winnerName.toUpperCase()} WON THE TOSS!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pick innings if won */}
              <AnimatePresence>
                {revealStep >= 3 && tossWon && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
                    <p className="text-[11px] text-foreground font-display font-bold text-center">
                      What do you want to do?
                    </p>
                    <div className="flex gap-3">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleInningsChoice(true)}
                        className="flex-1 py-4 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-display font-black rounded-2xl text-sm shadow-[0_0_30px_hsl(217_91%_60%/0.3)] border border-primary/30">
                        <span className="text-xl block mb-1">🏏</span>
                        BAT FIRST
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleInningsChoice(false)}
                        className="flex-1 py-4 bg-gradient-to-br from-accent to-accent/70 text-accent-foreground font-display font-black rounded-2xl text-sm shadow-[0_0_30px_hsl(168_80%_50%/0.3)] border border-accent/30">
                        <span className="text-xl block mb-1">🎯</span>
                        BOWL FIRST
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI chose — dramatic display */}
              <AnimatePresence>
                {revealStep >= 3 && !tossWon && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-2 text-center">
                    <p className="text-[10px] text-muted-foreground font-display tracking-wider">
                      {opponentName} is choosing...
                    </p>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center justify-center gap-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </motion.div>
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
