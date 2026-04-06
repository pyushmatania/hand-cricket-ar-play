import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getChestTier } from "@/lib/chests";
import engines from "@/engines/EngineManager";

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
    // Shake phase: chest unlock sound
    engines.sound.playEffect('chest_unlock');
    engines.sound.vibrate('medium');

    const t1 = setTimeout(() => {
      setPhase("open");
      engines.sound.playEffect('ui_success');
    }, 1200);
    const t2 = setTimeout(() => {
      setPhase("reveal");
      // Play card/item reveal sound based on rarity
      if (rarity === 'legendary' || rarity === 'mythic') {
        engines.sound.playEffect('card_legendary_reveal');
        engines.sound.vibrate('heavy');
      } else {
        engines.sound.playEffect('card_flip');
        engines.sound.vibrate('medium');
      }
      engines.sound.playEffect('coin_collect');
    }, 2000);
    const t3 = setTimeout(onComplete, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete, rarity]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, hsl(220 18% 4% / 0.97) 0%, hsl(222 40% 3% / 0.98) 100%)" }}
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

      {/* Stadium floodlight beams */}
      {phase === "reveal" && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            className="absolute w-[200%] h-64 -top-20"
            style={{
              background: `conic-gradient(from 180deg at 50% 0%, transparent 40%, ${chest.color} 50%, transparent 60%)`,
            }}
          />
        </>
      )}

      {/* Sparkle particles */}
      {phase === "reveal" && [...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos((i / 16) * Math.PI * 2) * (100 + Math.random() * 50),
            y: Math.sin((i / 16) * Math.PI * 2) * (100 + Math.random() * 50),
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.2, delay: i * 0.04 }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: chest.color,
            boxShadow: `0 0 6px ${chest.color}`,
          }}
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
              style={{ filter: `drop-shadow(0 0 30px ${chest.glowColor}) drop-shadow(0 8px 16px rgba(0,0,0,0.7))` }}
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
              style={{ filter: `drop-shadow(0 6px 12px rgba(0,0,0,0.6)) drop-shadow(0 0 20px ${chest.glowColor})` }}
            >
              {itemEmoji}
            </motion.span>

            {/* Chrome frame around name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-6 py-2 rounded-xl"
              style={{
                background: "linear-gradient(180deg, hsl(220 15% 14%) 0%, hsl(220 12% 9%) 100%)",
                border: `2px solid ${chest.borderColor}`,
                boxShadow: `0 4px 0 hsl(220 15% 5%), 0 0 20px ${chest.glowColor}`,
              }}
            >
              <p className="font-display text-2xl text-foreground" style={{ textShadow: "0 2px 0 hsl(220 18% 7%)" }}>
                {itemName}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-display text-xs tracking-[0.3em] mt-3"
              style={{ color: chest.color, textShadow: `0 0 10px ${chest.glowColor}` }}
            >
              {rarity.toUpperCase()}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
