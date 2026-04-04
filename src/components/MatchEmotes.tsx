import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface MatchEmote {
  id: string;
  emoji: string;
  label: string;
  sound?: string;
}

export const MATCH_EMOTES: MatchEmote[] = [
  { id: "taunt", emoji: "😏", label: "Taunt" },
  { id: "clap", emoji: "👏", label: "Clap" },
  { id: "fire", emoji: "🔥", label: "On Fire" },
  { id: "cry", emoji: "😭", label: "Cry" },
  { id: "laugh", emoji: "😂", label: "Laugh" },
  { id: "shocked", emoji: "😱", label: "Shocked" },
  { id: "angry", emoji: "😤", label: "Angry" },
  { id: "gg", emoji: "🤝", label: "GG" },
];

const COOLDOWN_MS = 3000;

interface EmoteBubbleState {
  id: number;
  emote: MatchEmote;
  side: "player" | "opponent";
}

interface MatchEmotesProps {
  disabled?: boolean;
  onEmoteSent?: (emote: MatchEmote) => void;
}

export default function MatchEmotes({ disabled, onEmoteSent }: MatchEmotesProps) {
  const [open, setOpen] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [bubbles, setBubbles] = useState<EmoteBubbleState[]>([]);
  const bubbleId = useRef(0);

  const sendEmote = useCallback((emote: MatchEmote) => {
    if (cooldown || disabled) return;
    setOpen(false);
    setCooldown(true);

    const id = ++bubbleId.current;
    setBubbles(prev => [...prev, { id, emote, side: "player" }]);
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 2200);
    setTimeout(() => setCooldown(false), COOLDOWN_MS);

    onEmoteSent?.(emote);
  }, [cooldown, disabled, onEmoteSent]);

  /** Called externally to show opponent emote bubble */
  const showOpponentEmote = useCallback((emote: MatchEmote) => {
    const id = ++bubbleId.current;
    setBubbles(prev => [...prev, { id, emote, side: "opponent" }]);
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 2200);
  }, []);

  return (
    <>
      {/* Floating emote bubbles */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {bubbles.map(b => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.3, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: -20 }}
              exit={{ opacity: 0, scale: 0.5, y: -60 }}
              transition={{ duration: 0.5, exit: { duration: 0.4 } }}
              className="absolute"
              style={{
                bottom: "35%",
                [b.side === "player" ? "right" : "left"]: "12%",
              }}
            >
              <div
                className="relative px-3 py-2 rounded-2xl"
                style={{
                  background: "linear-gradient(180deg, hsl(222 25% 18%), hsl(222 20% 10%))",
                  border: "2px solid hsl(35 50% 40%)",
                  boxShadow: "0 4px 20px hsl(0 0% 0% / 0.5), 0 0 12px hsl(35 50% 40% / 0.2)",
                }}
              >
                <span className="text-3xl block">{b.emote.emoji}</span>
                <span className="text-[7px] font-game-display tracking-wider text-muted-foreground text-center block mt-0.5">
                  {b.emote.label.toUpperCase()}
                </span>
                {/* Speech bubble tail */}
                <div
                  className="absolute -bottom-1.5"
                  style={{
                    [b.side === "player" ? "right" : "left"]: "12px",
                    width: 0, height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "6px solid hsl(35 50% 40%)",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Emote trigger button */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => !disabled && setOpen(o => !o)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: cooldown
              ? "linear-gradient(180deg, hsl(220 15% 16%), hsl(220 15% 10%))"
              : "linear-gradient(180deg, hsl(35 40% 25%), hsl(35 30% 15%))",
            border: cooldown
              ? "2px solid hsl(220 15% 22%)"
              : "2px solid hsl(35 40% 35%)",
            opacity: cooldown ? 0.5 : 1,
          }}
        >
          <span className="text-sm">{cooldown ? "⏳" : "😊"}</span>
        </motion.button>

        {/* Emote picker popup */}
        <AnimatePresence>
          {open && !cooldown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-12 right-0 z-50"
            >
              <div
                className="grid grid-cols-4 gap-1 p-2 rounded-2xl"
                style={{
                  background: "linear-gradient(180deg, hsl(222 25% 14%), hsl(222 20% 8%))",
                  border: "2px solid hsl(35 40% 25%)",
                  boxShadow: "0 8px 32px hsl(0 0% 0% / 0.6)",
                }}
              >
                {MATCH_EMOTES.map(emote => (
                  <motion.button
                    key={emote.id}
                    whileTap={{ scale: 0.8 }}
                    whileHover={{ scale: 1.15 }}
                    onClick={() => sendEmote(emote)}
                    className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5"
                    style={{
                      background: "hsl(222 20% 12%)",
                      border: "1px solid hsl(222 15% 20%)",
                    }}
                  >
                    <span className="text-lg leading-none">{emote.emoji}</span>
                    <span className="text-[5px] font-game-display tracking-wider text-muted-foreground">
                      {emote.label.toUpperCase()}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
