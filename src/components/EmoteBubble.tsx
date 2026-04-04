import { motion, AnimatePresence } from "framer-motion";
import { MATCH_EMOTES, type EmoteId } from "./EmotePicker";

const ANIM_VARIANTS: Record<string, any> = {
  bounce: { y: [0, -20, 0, -10, 0], transition: { duration: 0.8, repeat: 1 } },
  spin: { rotate: [0, 360], transition: { duration: 0.6, repeat: 1 } },
  pulse: { scale: [1, 1.4, 1, 1.3, 1], transition: { duration: 0.7, repeat: 1 } },
  shake: { x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.5, repeat: 1 } },
};

interface EmoteBubbleProps {
  emoteId: EmoteId | null;
  from: "self" | "opponent";
  senderName?: string;
}

export default function EmoteBubble({ emoteId, from, senderName }: EmoteBubbleProps) {
  const emote = MATCH_EMOTES.find((e) => e.id === emoteId);
  if (!emote) return null;

  const isOpponent = from === "opponent";

  return (
    <AnimatePresence>
      {emoteId && (
        <motion.div
          key={emoteId + Date.now()}
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -30 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={`flex items-center gap-2 p-2.5 rounded-2xl border ${
            isOpponent
              ? "glass-card border-accent/20 self-start"
              : "glass-premium border-secondary/20 self-end"
          }`}
        >
          <motion.span
            className="text-3xl"
            animate={ANIM_VARIANTS[emote.anim] || {}}
          >
            {emote.emoji}
          </motion.span>
          <div className="flex flex-col">
            <span className="text-[7px] font-display text-muted-foreground tracking-widest">
              {isOpponent ? (senderName || "OPPONENT") : "YOU"}
            </span>
            <span className={`text-[10px] font-display font-black tracking-wider ${
              isOpponent ? "text-accent" : "text-secondary"
            }`}>
              {emote.label}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
