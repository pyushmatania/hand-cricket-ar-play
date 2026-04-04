import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const MATCH_EMOTES = [
  { id: "sixer", emoji: "💥", label: "SIXER!", anim: "bounce" },
  { id: "howzat", emoji: "☝️", label: "HOWZAT!", anim: "spin" },
  { id: "clap", emoji: "👏", label: "GG!", anim: "pulse" },
  { id: "fire", emoji: "🔥", label: "ON FIRE!", anim: "shake" },
  { id: "laugh", emoji: "😂", label: "LOL", anim: "bounce" },
  { id: "cry", emoji: "😭", label: "NOOO", anim: "shake" },
  { id: "taunt", emoji: "😏", label: "EASY", anim: "pulse" },
  { id: "trophy", emoji: "🏆", label: "CHAMP!", anim: "spin" },
] as const;

export type EmoteId = (typeof MATCH_EMOTES)[number]["id"];

interface EmotePickerProps {
  onSend: (emoteId: EmoteId) => void;
  disabled?: boolean;
  cooldownMs?: number;
}

export default function EmotePicker({ onSend, disabled = false, cooldownMs = 3000 }: EmotePickerProps) {
  const [open, setOpen] = useState(false);
  const [lastSent, setLastSent] = useState(0);

  const onCooldown = Date.now() - lastSent < cooldownMs;

  const handleSend = (id: EmoteId) => {
    if (onCooldown || disabled) return;
    onSend(id);
    setLastSent(Date.now());
    setOpen(false);
  };

  return (
    <div className="relative flex justify-center">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        disabled={disabled || onCooldown}
        className={`px-4 py-2 rounded-xl glass-card border text-[9px] font-display font-bold tracking-wider transition-all ${
          onCooldown
            ? "border-muted/20 text-muted-foreground/40"
            : "border-secondary/20 text-secondary"
        }`}
      >
        {onCooldown ? "⏳ COOLDOWN" : "😎 EMOTE"}
      </motion.button>

      <AnimatePresence>
        {open && !onCooldown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full mb-2 glass-premium rounded-2xl p-2 border border-secondary/20 shadow-[0_0_30px_hsl(var(--secondary)/0.15)] z-50"
          >
            <div className="grid grid-cols-4 gap-1.5">
              {MATCH_EMOTES.map((emote) => (
                <motion.button
                  key={emote.id}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleSend(emote.id)}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-xl hover:bg-secondary/10 transition-colors"
                >
                  <span className="text-2xl">{emote.emoji}</span>
                  <span className="text-[6px] font-display font-bold text-muted-foreground tracking-wider">
                    {emote.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
