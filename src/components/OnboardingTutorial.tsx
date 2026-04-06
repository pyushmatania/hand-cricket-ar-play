/**
 * V11 Onboarding Tutorial — 6-step "Wooden Kingdom" flow
 * Step 0: Floodlight reveal welcome
 * Step 1-6: Gesture training with wooden card displays
 * Step 7: Rules on carved stone plaques
 * Step 8: Battle Hub spotlight — ready screen
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const GESTURES = [
  { move: "DEF", emoji: "✊", name: "DEFENCE", value: "0 runs", description: "Close your fist tightly. Used to defend or bowl out the opponent when they match.", tip: "If both players show DEF — it's OUT!", hue: 25 },
  { move: "1", emoji: "☝️", name: "SINGLE", value: "1 run", description: "Point your index finger up. A safe shot for steady scoring.", tip: "Low risk, but every run counts in a close match.", hue: 207 },
  { move: "2", emoji: "✌️", name: "DOUBLE", value: "2 runs", description: "Show the peace/victory sign. Quick running between wickets!", tip: "A balanced choice — not too risky, decent reward.", hue: 142 },
  { move: "3", emoji: "🤟", name: "TRIPLE", value: "3 runs", description: "Show the rock/love sign — thumb, index, and pinky extended.", tip: "Great for building momentum. Medium risk.", hue: 280 },
  { move: "4", emoji: "🖖", name: "BOUNDARY", value: "4 runs", description: "Show the Vulcan salute — split your fingers into a V shape.", tip: "A powerful shot to the boundary! High reward.", hue: 43 },
  { move: "6", emoji: "👍", name: "SIX!", value: "6 runs", description: "Thumbs up! The biggest shot in cricket — over the boundary!", tip: "Maximum runs. Go big or go home!", hue: 4 },
];

const RULES = [
  { icon: "🏏", title: "The Toss", text: "Choose to BAT or BOWL first. Batting means you're scoring runs, bowling means the AI is batting." },
  { icon: "⚡", title: "How OUT Works", text: "If you and the AI show the SAME move — the batter is OUT! The innings ends immediately." },
  { icon: "🎯", title: "Two Innings", text: "Each side gets one innings. The team batting second must chase the first team's total to win." },
  { icon: "🏆", title: "Winning", text: "Score more runs than the AI across both innings. If equal — it's a draw!" },
];

const WOOD_BG = "#1A0E05";
const WOOD_CARD = "linear-gradient(180deg, #3E2410 0%, #2E1A0E 100%)";
const WOOD_BORDER = "2px solid hsl(30 40% 22%)";
const GOLD = "hsl(43 90% 55%)";

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState(0);
  const totalSteps = 9;

  const next = () => {
    if (step >= totalSteps - 1) onComplete();
    else setStep(step + 1);
  };
  const skip = () => onComplete();
  const progress = ((step + 1) / totalSteps) * 100;

  // Floodlight reveal animation on mount
  const [floodlightReady, setFloodlightReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFloodlightReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: WOOD_BG }}>
      {/* Floodlight cone */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0.3 }}
        animate={{ opacity: floodlightReady ? 0.2 : 0, scaleY: floodlightReady ? 1 : 0.3 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 pointer-events-none"
        style={{ height: "100%", background: `linear-gradient(180deg, hsl(43 96% 80% / 0.25) 0%, transparent 60%)`, filter: "blur(30px)" }}
      />

      {/* Wood grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='6' height='6' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
      />

      {/* Dark vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(20 50% 3% / 0.8) 100%)" }} />

      {/* Progress bar — hammered metal */}
      <div className="relative z-10 px-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] font-display tracking-widest" style={{ color: "hsl(30 20% 45%)" }}>
            {step + 1} / {totalSteps}
          </span>
          <button onClick={skip} className="text-[10px] font-display tracking-wider transition-colors" style={{ color: "hsl(30 20% 45%)" }}>
            SKIP →
          </button>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#2E1A0E", border: "1px solid hsl(30 30% 18%)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${GOLD}, hsl(35 60% 35%))` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* STEP 0: Floodlight Welcome */}
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="text-center space-y-6 w-full">
              <motion.div
                animate={{ rotate: [0, -5, 5, -3, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="text-7xl"
                style={{ filter: `drop-shadow(0 0 20px hsl(43 90% 55% / 0.4))` }}
              >
                🏏
              </motion.div>
              <div>
                <h1 className="font-display text-2xl font-black tracking-wider" style={{ color: "hsl(30 15% 85%)", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
                  WELCOME TO
                </h1>
                <h2 className="font-display text-3xl font-black tracking-wider mt-1" style={{ color: GOLD, textShadow: `0 0 20px hsl(43 90% 55% / 0.4)` }}>
                  HAND CRICKET
                </h2>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(30 15% 55%)" }}>
                Play the classic hand cricket game with <span className="font-bold" style={{ color: GOLD }}>AR hand tracking</span> or simple taps. Let's learn the gestures!
              </p>
              <div className="flex gap-2 justify-center">
                {GESTURES.map((g, i) => (
                  <motion.span key={g.move} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="text-2xl">
                    {g.emoji}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 1-6: Gesture Training — Wooden Cards */}
          {step >= 1 && step <= 6 && (
            <motion.div key={`gesture-${step}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center space-y-6 w-full">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.5, rotateY: 90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: WOOD_CARD,
                    border: `3px solid hsl(${GESTURES[step - 1].hue} 50% 40% / 0.5)`,
                    borderBottom: `6px solid hsl(${GESTURES[step - 1].hue} 40% 20%)`,
                    boxShadow: `0 8px 32px hsl(${GESTURES[step - 1].hue} 60% 40% / 0.25)`,
                  }}
                >
                  {/* Corner metal brackets */}
                  {["top-1 left-1", "top-1 right-1", "bottom-1 left-1", "bottom-1 right-1"].map((pos) => (
                    <div key={pos} className={`absolute ${pos} w-3 h-3`}
                      style={{ borderTop: pos.includes("top") ? "2px solid hsl(43 50% 45% / 0.5)" : "none", borderBottom: pos.includes("bottom") ? "2px solid hsl(43 50% 45% / 0.5)" : "none", borderLeft: pos.includes("left") ? "2px solid hsl(43 50% 45% / 0.5)" : "none", borderRight: pos.includes("right") ? "2px solid hsl(43 50% 45% / 0.5)" : "none" }} />
                  ))}
                  <span className="text-6xl relative z-10">{GESTURES[step - 1].emoji}</span>
                </motion.div>
                {/* Value badge */}
                <motion.div initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full"
                  style={{ background: "#2E1A0E", border: `2px solid hsl(${GESTURES[step - 1].hue} 50% 40% / 0.4)` }}>
                  <span className="font-display text-xs font-black tracking-wider" style={{ color: `hsl(${GESTURES[step - 1].hue} 80% 55%)` }}>
                    {GESTURES[step - 1].value}
                  </span>
                </motion.div>
              </div>

              <div className="pt-4">
                <h2 className="font-display text-xl font-black tracking-wider" style={{ color: "hsl(30 15% 85%)" }}>
                  {GESTURES[step - 1].name}
                </h2>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "hsl(30 15% 55%)" }}>
                  {GESTURES[step - 1].description}
                </p>
              </div>

              {/* Tip box — carved stone plaque */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="px-4 py-3 text-left rounded-xl"
                style={{ background: "linear-gradient(180deg, hsl(220 10% 14%) 0%, hsl(220 10% 10%) 100%)", border: "2px solid hsl(220 10% 20%)", borderBottom: "4px solid hsl(220 10% 8%)" }}>
                <span className="text-[8px] font-display font-bold tracking-widest block mb-1" style={{ color: GOLD }}>💡 PRO TIP</span>
                <span className="text-xs" style={{ color: "hsl(30 15% 55%)" }}>{GESTURES[step - 1].tip}</span>
              </motion.div>

              {/* Gesture strip */}
              <div className="flex gap-3 justify-center">
                {GESTURES.map((g, i) => (
                  <div key={g.move}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all"
                    style={{
                      background: i === step - 1 ? `hsl(${g.hue} 30% 18%)` : i < step - 1 ? "#2E1A0E" : "hsl(20 20% 8%)",
                      border: i === step - 1 ? `2px solid hsl(${g.hue} 50% 40% / 0.5)` : "2px solid transparent",
                      opacity: i === step - 1 ? 1 : i < step - 1 ? 0.6 : 0.3,
                      transform: i === step - 1 ? "scale(1.1)" : "scale(1)",
                    }}>
                    {g.emoji}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 7: Rules — Carved Stone Plaques */}
          {step === 7 && (
            <motion.div key="rules" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="w-full space-y-4">
              <div className="text-center mb-4">
                <h2 className="font-display text-xl font-black tracking-wider" style={{ color: "hsl(30 15% 85%)" }}>HOW TO PLAY</h2>
                <p className="text-xs mt-1" style={{ color: "hsl(30 15% 45%)" }}>The rules are simple</p>
              </div>
              {RULES.map((rule, i) => (
                <motion.div key={rule.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                  className="p-4 flex items-start gap-3 rounded-xl"
                  style={{ background: "linear-gradient(180deg, hsl(220 10% 14%) 0%, hsl(220 10% 10%) 100%)", border: "2px solid hsl(220 10% 20%)", borderBottom: "4px solid hsl(220 10% 8%)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "hsl(43 30% 15%)", border: "1px solid hsl(43 40% 25% / 0.3)" }}>
                    <span className="text-lg">{rule.icon}</span>
                  </div>
                  <div>
                    <span className="font-display text-xs font-bold tracking-wider block" style={{ color: GOLD }}>{rule.title}</span>
                    <span className="text-[11px] leading-relaxed block mt-0.5" style={{ color: "hsl(30 15% 55%)" }}>{rule.text}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* STEP 8: Ready — Battle Hub Spotlight */}
          {step === 8 && (
            <motion.div key="ready" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 w-full">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="text-7xl" style={{ filter: `drop-shadow(0 0 30px hsl(43 90% 55% / 0.5))` }}>
                🏆
              </motion.div>
              <h2 className="font-display text-2xl font-black tracking-wider" style={{ color: "hsl(30 15% 85%)" }}>YOU'RE READY!</h2>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(30 15% 55%)" }}>
                You know the gestures and the rules. Time to step onto the field and show the AI who's boss!
              </p>
              <div className="flex gap-2 justify-center">
                {GESTURES.map((g, i) => (
                  <motion.div key={g.move} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08, type: "spring" }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `hsl(${g.hue} 20% 12%)`, border: `2px solid hsl(${g.hue} 40% 30% / 0.3)` }}>
                    <span className="text-lg">{g.emoji}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom button — hammered metal CTA */}
      <div className="relative z-10 px-6 pb-8 max-w-lg mx-auto w-full">
        <motion.button
          whileTap={{ scale: 0.95, y: 2 }}
          onClick={next}
          className="w-full py-4 font-display font-black text-sm rounded-2xl tracking-wider transition-all"
          style={{
            background: step === 8
              ? `linear-gradient(180deg, ${GOLD} 0%, hsl(35 60% 35%) 100%)`
              : `linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(35 60% 35%) 100%)`,
            borderBottom: "5px solid hsl(35 50% 20%)",
            color: "#1A0E05",
            boxShadow: step === 8 ? `0 0 30px hsl(43 90% 55% / 0.4)` : `0 4px 16px hsl(43 90% 55% / 0.2)`,
            textShadow: "0 1px 0 hsl(43 80% 70% / 0.3)",
          }}
        >
          {step === 0 ? "LET'S GO →" : step === 8 ? "⚡ START PLAYING" : "NEXT →"}
        </motion.button>
      </div>
    </div>
  );
}
