import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const GESTURES = [
  {
    move: "DEF",
    emoji: "✊",
    name: "DEFENCE",
    value: "0 runs",
    description: "Close your fist tightly. Used to defend or bowl out the opponent when they match.",
    tip: "If both players show DEF — it's OUT!",
    color: "from-accent to-accent/60",
  },
  {
    move: "1",
    emoji: "☝️",
    name: "SINGLE",
    value: "1 run",
    description: "Point your index finger up. A safe shot for steady scoring.",
    tip: "Low risk, but every run counts in a close match.",
    color: "from-primary to-primary/60",
  },
  {
    move: "2",
    emoji: "✌️",
    name: "DOUBLE",
    value: "2 runs",
    description: "Show the peace/victory sign. Quick running between wickets!",
    tip: "A balanced choice — not too risky, decent reward.",
    color: "from-neon-green to-neon-green/60",
  },
  {
    move: "3",
    emoji: "🤟",
    name: "TRIPLE",
    value: "3 runs",
    description: "Show the rock/love sign — thumb, index, and pinky extended.",
    tip: "Great for building momentum. Medium risk.",
    color: "from-secondary to-secondary/60",
  },
  {
    move: "4",
    emoji: "🖖",
    name: "BOUNDARY",
    value: "4 runs",
    description: "Show the Vulcan salute — split your fingers into a V shape.",
    tip: "A powerful shot to the boundary! High reward.",
    color: "from-score-gold to-score-gold/60",
  },
  {
    move: "6",
    emoji: "👍",
    name: "SIX!",
    value: "6 runs",
    description: "Thumbs up! The biggest shot in cricket — over the boundary!",
    tip: "Maximum runs. Go big or go home!",
    color: "from-primary to-out-red/60",
  },
];

const RULES = [
  {
    icon: "🏏",
    title: "The Toss",
    text: "Choose to BAT or BOWL first. Batting means you're scoring runs, bowling means the AI is batting.",
  },
  {
    icon: "⚡",
    title: "How OUT Works",
    text: "If you and the AI show the SAME move — the batter is OUT! The innings ends immediately.",
  },
  {
    icon: "🎯",
    title: "Two Innings",
    text: "Each side gets one innings. The team batting second must chase the first team's total to win.",
  },
  {
    icon: "🏆",
    title: "Winning",
    text: "Score more runs than the AI across both innings. If equal — it's a draw!",
  },
];

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState(0);
  // 0 = welcome, 1-6 = gestures, 7 = rules, 8 = ready
  const totalSteps = 9;

  const next = () => {
    if (step >= totalSteps - 1) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const skip = () => onComplete();

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Progress bar */}
      <div className="relative z-10 px-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] font-display text-muted-foreground tracking-widest">
            {step + 1} / {totalSteps}
          </span>
          <button onClick={skip} className="text-[10px] font-display text-muted-foreground hover:text-foreground transition-colors tracking-wider">
            SKIP →
          </button>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center space-y-6 w-full"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, -3, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="text-7xl"
              >
                🏏
              </motion.div>
              <div>
                <h1 className="font-display text-2xl font-black text-foreground tracking-wider">
                  WELCOME TO
                </h1>
                <h2 className="font-display text-3xl font-black text-primary text-glow tracking-wider mt-1">
                  HAND CRICKET
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Play the classic hand cricket game with <span className="text-primary font-bold">AR hand tracking</span> or simple taps.
                Let's learn the gestures!
              </p>
              <div className="flex gap-2 justify-center">
                {GESTURES.map((g) => (
                  <motion.span
                    key={g.move}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + GESTURES.indexOf(g) * 0.1 }}
                    className="text-2xl"
                  >
                    {g.emoji}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {step >= 1 && step <= 6 && (
            <motion.div
              key={`gesture-${step}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center space-y-6 w-full"
            >
              {/* Gesture display */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.5, rotateY: 90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                  className={`w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br ${GESTURES[step - 1].color} flex items-center justify-center`}
                >
                  <span className="text-6xl">{GESTURES[step - 1].emoji}</span>
                </motion.div>
                {/* Value badge */}
                <motion.div
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-card border border-glass"
                >
                  <span className="font-display text-xs font-black text-primary tracking-wider">
                    {GESTURES[step - 1].value}
                  </span>
                </motion.div>
              </div>

              <div className="pt-4">
                <h2 className="font-display text-xl font-black text-foreground tracking-wider">
                  {GESTURES[step - 1].name}
                </h2>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {GESTURES[step - 1].description}
                </p>
              </div>

              {/* Tip box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-premium px-4 py-3 text-left"
              >
                <span className="text-[8px] font-display font-bold text-secondary tracking-widest block mb-1">
                  💡 PRO TIP
                </span>
                <span className="text-xs text-muted-foreground">{GESTURES[step - 1].tip}</span>
              </motion.div>

              {/* Gesture strip showing all 6, highlighting current */}
              <div className="flex gap-3 justify-center">
                {GESTURES.map((g, i) => (
                  <div
                    key={g.move}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                      i === step - 1
                        ? "bg-primary/20 border border-primary/40 scale-110"
                        : i < step - 1
                        ? "bg-muted/50 border border-glass opacity-60"
                        : "bg-muted/30 border border-transparent opacity-30"
                    }`}
                  >
                    {g.emoji}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full space-y-4"
            >
              <div className="text-center mb-4">
                <h2 className="font-display text-xl font-black text-foreground tracking-wider">
                  HOW TO PLAY
                </h2>
                <p className="text-xs text-muted-foreground mt-1">The rules are simple</p>
              </div>
              {RULES.map((rule, i) => (
                <motion.div
                  key={rule.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="glass-score p-4 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-lg">{rule.icon}</span>
                  </div>
                  <div>
                    <span className="font-display text-xs font-bold text-foreground tracking-wider block">
                      {rule.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-relaxed block mt-0.5">
                      {rule.text}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {step === 8 && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 w-full"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-7xl"
              >
                🏆
              </motion.div>
              <h2 className="font-display text-2xl font-black text-foreground tracking-wider">
                YOU'RE READY!
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You know the gestures and the rules. Time to step onto the field and show the AI who's boss!
              </p>
              <div className="flex gap-2 justify-center">
                {GESTURES.map((g) => (
                  <motion.div
                    key={g.move}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: GESTURES.indexOf(g) * 0.08, type: "spring" }}
                    className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                  >
                    <span className="text-lg">{g.emoji}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom button */}
      <div className="relative z-10 px-6 pb-8 max-w-lg mx-auto w-full">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={next}
          className={`w-full py-4 font-display font-black text-sm rounded-2xl tracking-wider transition-all ${
            step === 8
              ? "bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary"
              : "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
          }`}
        >
          {step === 0 ? "LET'S GO →" : step === 8 ? "⚡ START PLAYING" : "NEXT →"}
        </motion.button>
      </div>
    </div>
  );
}
