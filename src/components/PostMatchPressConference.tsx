// ═══════════════════════════════════════════════════
// Doc 5 §4.3 — Post-Match Press Conference
// Theme-adaptive celebration/interview scene
// ═══════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayerAvatar from "./PlayerAvatar";

interface PostMatchPressConferenceProps {
  winnerName: string;
  loserName: string;
  winnerAvatarIndex: number;
  loserAvatarIndex?: number;
  winnerScore: number;
  loserScore: number;
  theme?: "stadium" | "gully" | "school" | "beach";
  onDismiss: () => void;
}

const THEME_CONFIG = {
  stadium: {
    bg: "linear-gradient(180deg, hsl(220 30% 12%) 0%, hsl(220 25% 8%) 100%)",
    label: "POST-MATCH PRESS CONFERENCE",
    winnerQuotes: [
      "It was a great team effort. We executed our plans well.",
      "Full credit to the bowlers. They set it up beautifully.",
      "We just took it one ball at a time. The result followed.",
    ],
    winnerEmoji: "🎤",
    loserEmoji: "😐",
    ambient: "📸 Camera flashes",
  },
  gully: {
    bg: "linear-gradient(180deg, hsl(25 30% 14%) 0%, hsl(220 15% 7%) 100%)",
    label: "GULLY CELEBRATION",
    winnerQuotes: [
      "Bhai ne kya batting ki! Legend hai legend!",
      "Aaj toh maza aa gaya! Khelna padega phir se!",
      "Next time bhi same result hoga, dekh lena!",
    ],
    winnerEmoji: "💃",
    loserEmoji: "😤",
    ambient: "🏚️ Gully lane",
  },
  school: {
    bg: "linear-gradient(180deg, hsl(35 25% 15%) 0%, hsl(35 20% 10%) 100%)",
    label: "TEACHER'S AWARD",
    winnerQuotes: [
      "Aaj ka star student — sabse accha khela! Gold star!",
      "Class mein sabse best cricketer! Full marks!",
      "Principal office mein trophy de rahe hai!",
    ],
    winnerEmoji: "⭐",
    loserEmoji: "📚",
    ambient: "🏫 School corridor",
  },
  beach: {
    bg: "linear-gradient(180deg, hsl(30 40% 18%) 0%, hsl(200 30% 10%) 100%)",
    label: "SUNSET CELEBRATION",
    winnerQuotes: [
      "Mast game tha yaar. Chalo ab chill karte hai.",
      "Beach cricket best cricket. No pressure, only vibes!",
      "Coconut water peeke celebration karte hai!",
    ],
    winnerEmoji: "🥥",
    loserEmoji: "😎",
    ambient: "🌅 Sunset beach",
  },
};

export default function PostMatchPressConference({
  winnerName, loserName, winnerAvatarIndex, loserAvatarIndex = 1,
  winnerScore, loserScore, theme = "stadium", onDismiss,
}: PostMatchPressConferenceProps) {
  const [quote, setQuote] = useState("");
  const [showFlash, setShowFlash] = useState(false);
  const config = THEME_CONFIG[theme];

  useEffect(() => {
    const quotes = config.winnerQuotes;
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Camera flashes (stadium theme)
    if (theme === "stadium") {
      const flashInterval = setInterval(() => {
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 100);
      }, 800 + Math.random() * 1200);
      return () => clearInterval(flashInterval);
    }
  }, []);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "hsl(0 0% 0% / 0.7)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      {/* Camera flash */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{ background: "white" }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="w-full max-w-[360px] rounded-2xl overflow-hidden"
        style={{ background: config.bg, border: "2px solid hsl(220 15% 18%)", borderBottom: "5px solid hsl(220 15% 8%)" }}
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 text-center" style={{ borderBottom: "1px solid hsl(220 15% 16%)" }}>
          <span className="font-display text-[7px] tracking-[0.3em] text-muted-foreground">{config.label}</span>
        </div>

        {/* Scene */}
        <div className="px-5 py-4">
          {/* Winner at podium/mic */}
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <PlayerAvatar avatarIndex={winnerAvatarIndex} size="lg" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{config.winnerEmoji}</span>
                <span className="font-display text-[11px] font-bold" style={{ color: "hsl(43 90% 55%)" }}>{winnerName}</span>
                <span className="text-[8px] text-muted-foreground">🏆 WINNER</span>
              </div>
              <motion.div
                className="rounded-xl p-3"
                style={{ background: "hsl(220 12% 8%)", border: "1px solid hsl(220 15% 16%)" }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-[10px] text-foreground/80 font-body italic">"{quote}"</p>
              </motion.div>
            </div>
          </div>

          {/* Score summary */}
          <div className="flex items-center justify-center gap-6 py-3 rounded-xl mb-3"
            style={{ background: "hsl(220 12% 8%)", border: "1px solid hsl(220 15% 16%)" }}>
            <div className="text-center">
              <span className="font-display text-lg font-black" style={{ color: "hsl(43 90% 55%)" }}>{winnerScore}</span>
              <span className="block text-[7px] text-muted-foreground font-display tracking-widest">WINNER</span>
            </div>
            <span className="text-muted-foreground/30">—</span>
            <div className="text-center">
              <span className="font-display text-lg font-black text-muted-foreground">{loserScore}</span>
              <span className="block text-[7px] text-muted-foreground font-display tracking-widest">LOSER</span>
            </div>
          </div>

          {/* Ambient */}
          <div className="text-center">
            <span className="text-[7px] text-muted-foreground/40 font-display tracking-[0.2em]">{config.ambient}</span>
          </div>
        </div>

        {/* Tap to skip */}
        <motion.div
          className="px-4 py-2 text-center"
          style={{ borderTop: "1px solid hsl(220 15% 16%)" }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[8px] text-muted-foreground/50 font-display tracking-widest">TAP TO SKIP</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
