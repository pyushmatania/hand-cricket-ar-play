import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STICKER_PACKS, type StickerPack } from "@/lib/stickerPacks";

interface StickerPickerProps {
  onSelect: (emoji: string) => void;
}

export default function StickerPicker({ onSelect }: StickerPickerProps) {
  const [activePack, setActivePack] = useState<string>(STICKER_PACKS[0].id);
  const pack = STICKER_PACKS.find((p) => p.id === activePack) ?? STICKER_PACKS[0];

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      {/* Pack tabs */}
      <div className="flex gap-1 px-1 pt-2 pb-1">
        {STICKER_PACKS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePack(p.id)}
            className={`px-2.5 py-1 rounded-lg text-[8px] font-game-display tracking-wider transition-all flex items-center gap-1 ${
              activePack === p.id
                ? "bg-primary/20 border border-primary/40 text-foreground"
                : "bg-muted/20 border border-border/20 text-muted-foreground"
            }`}
          >
            <span>{p.icon}</span>
            {p.name}
          </button>
        ))}
      </div>

      {/* Stickers grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePack}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="grid grid-cols-4 gap-1.5 p-2"
        >
          {pack.stickers.map((sticker) => (
            <motion.button
              key={sticker.id}
              whileTap={{ scale: 0.8 }}
              onClick={() => onSelect(sticker.emoji)}
              className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-muted/20 border border-border/20 hover:bg-muted/40 transition-colors"
            >
              <span className="text-xl leading-none">{sticker.emoji}</span>
              <span className="text-[6px] text-muted-foreground/70 truncate w-full text-center">{sticker.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
