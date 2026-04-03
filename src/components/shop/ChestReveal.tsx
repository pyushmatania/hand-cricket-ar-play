import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getChestTier } from "@/lib/chests";

interface ChestRevealProps {
  itemName: string;
  itemEmoji: string;
  rarity: string;
  onComplete: () => void;
}

export default function ChestReveal({ itemName, itemEmoji, rarity, onComplete }: ChestRevealProps) {
  const [phase, setPhase] = useState<"shake" | "open" | "reveal">("shake");
  const chest = getChestTier(rarity);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("open"), 1200);
    const t2 = setTimeout(() => setPhase("reveal"), 2000);
    const t3 = setTimeout(onComplete, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: "hsl(222 47% 4% / 0.95)" }}
    >
      {/* Radial burst */}
      {phase !== "shake" && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 3, opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.5 }}
          className="absolute w-40 h-40 rounded-full"
          style={{ background: `radial-gradient(circle, ${chest.color}, transparent 70%)` }}
        />
      )}

      {/* Sparkle particles */}
      {phase === "reveal" && [...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos((i / 12) * Math.PI * 2) * 120,
            y: Math.sin((i / 12) * Math.PI * 2) * 120,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1, delay: i * 0.05 }}
          className="absolute w-2 h-2 rounded-full"
          style={{ background: chest.color }}
        />
      ))}

      <AnimatePresence mode="wait">
        {phase === "shake" && (
          <motion.div
            key="chest"
            animate={{
              rotate: [0, -5, 5, -5, 5, -8, 8, 0],
              scale: [1, 1.02, 1, 1.02, 1, 1.05, 1, 1],
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="relative"
          >
            <img
              src={chest.image}
              alt={chest.name}
              width={512}
              height={512}
              className="w-44 h-44 object-contain"
              style={{ filter: `drop-shadow(0 0 30px ${chest.glowColor})` }}
            />
            <motion.div
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full blur-xl"
              style={{ background: `${chest.color}20` }}
            />
          </motion.div>
        )}

        {phase === "open" && (
          <motion.div
            key="opening"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.3, 0] }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <img
              src={chest.image}
              alt={chest.name}
              width={512}
              height={512}
              className="w-44 h-44 object-contain"
            />
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="item"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-center"
          >
            <motion.span
              className="text-9xl block mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {itemEmoji}
            </motion.span>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-game-title text-2xl text-foreground"
            >
              {itemName}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-game-display text-xs tracking-[0.3em] mt-2"
              style={{ color: chest.color }}
            >
              {rarity.toUpperCase()}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
