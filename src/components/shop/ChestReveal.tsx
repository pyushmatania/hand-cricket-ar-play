import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getChestTier } from "@/lib/chests";
import engines from "@/engines/EngineManager";

interface ChestRevealProps {
  itemName: string;
  itemEmoji: string;
  rarity: string;
  onComplete: () => void;
}

const RARITY_LIGHT: Record<string, string> = {
  common: "#6B7280",
  rare: "#2563EB",
  epic: "#A855F7",
  legendary: "#FFD700",
  mythic: "#A855F7",
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  diamond: "#00D4FF",
  champion: "#A855F7",
};

export default function ChestReveal({ itemName, itemEmoji, rarity, onComplete }: ChestRevealProps) {
  const [phase, setPhase] = useState<"idle" | "tap1" | "tap2" | "shatter" | "lid" | "cards" | "reveal" | "done">("idle");
  const [tapCount, setTapCount] = useState(0);
  const chest = getChestTier(rarity);
  const lightColor = RARITY_LIGHT[rarity] || RARITY_LIGHT.gold;
  const completeCalled = useRef(false);

  /* Phase timing after shatter */
  useEffect(() => {
    if (phase === "shatter") {
      engines.sound.vibrate('heavy');
      const t1 = setTimeout(() => setPhase("lid"), 100);
      const t2 = setTimeout(() => setPhase("cards"), 500);
      const t3 = setTimeout(() => setPhase("reveal"), 1600);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [phase]);

  const handleTap = useCallback(() => {
    if (phase === "done") return;
    const next = tapCount + 1;
    setTapCount(next);

    if (next === 1) {
      setPhase("tap1");
      engines.sound.playEffect('chest_unlock');
      engines.sound.vibrate('medium');
    } else if (next === 2) {
      setPhase("tap2");
      engines.sound.vibrate('medium');
    } else if (next >= 3) {
      setPhase("shatter");
      engines.sound.playEffect('ui_success');
    }
  }, [tapCount, phase]);

  const handleComplete = useCallback(() => {
    if (completeCalled.current) return;
    completeCalled.current = true;
    setPhase("done");
    engines.sound.playEffect('coin_collect');
    engines.sound.vibrate('light');
    setTimeout(onComplete, 300);
  }, [onComplete]);

  /* Generate cards for the grid */
  const cards = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    emoji: ["🏏", "⚡", "🔥", "🎯", "💪", "🧤", "🌟", "👑"][i],
    rarity: i === 7 ? "legendary" : i >= 5 ? "epic" : i >= 3 ? "rare" : "common",
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
      onClick={phase === "reveal" ? handleComplete : handleTap}
      style={{ cursor: "pointer" }}
    >
      {/* Quilted diamond background */}
      <div className="absolute inset-0" style={{
        background: `
          repeating-conic-gradient(from 45deg at 50% 50%, rgba(255,255,255,0.02) 0deg 90deg, rgba(0,0,0,0.02) 90deg 180deg) 0 0 / 48px 48px,
          radial-gradient(ellipse at 50% 30%, ${lightColor}08, transparent 60%),
          linear-gradient(180deg, #0A0506 0%, #120810 50%, #0A0506 100%)
        `,
      }} />

      {/* Light column after lid opens */}
      {(phase === "lid" || phase === "cards" || phase === "reveal") && (
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 0.6 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute left-1/2 -translate-x-1/2 bottom-[40%]"
          style={{
            width: "80px",
            height: "60vh",
            background: `linear-gradient(0deg, ${lightColor}60, ${lightColor}20, transparent)`,
            clipPath: "polygon(30% 100%, 70% 100%, 55% 0%, 45% 0%)",
            transformOrigin: "bottom center",
          }}
        />
      )}

      {/* Sparkle particles on shatter/reveal */}
      {(phase === "shatter" || phase === "lid" || phase === "cards" || phase === "reveal") && (
        [...Array(20)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos((i / 20) * Math.PI * 2) * (80 + Math.random() * 60),
              y: Math.sin((i / 20) * Math.PI * 2) * (80 + Math.random() * 60) - 40,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.8, delay: i * 0.03 }}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: lightColor,
              boxShadow: `0 0 6px ${lightColor}`,
              top: "35%",
            }}
          />
        ))
      )}

      {/* Chest + Pillow Scene */}
      <AnimatePresence mode="wait">
        {(phase === "idle" || phase === "tap1" || phase === "tap2") && (
          <motion.div
            key="chest-scene"
            className="relative flex flex-col items-center"
            animate={
              phase === "tap1" ? { rotate: [-3, 3, -3, 3, 0] }
              : phase === "tap2" ? { rotate: [-5, 5, -5, 5, -8, 8, 0] }
              : { y: [0, -2, 0, 2, 0] }
            }
            transition={
              phase === "idle" ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.4 }
            }
          >
            {/* Chest */}
            <img
              src={chest.image}
              alt={chest.name}
              width={512}
              height={512}
              className="w-36 h-36 object-contain relative z-10"
              style={{
                filter: `drop-shadow(0 0 30px ${chest.glowColor}) drop-shadow(0 8px 16px rgba(0,0,0,0.7))`,
              }}
            />

            {/* Lock glow */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full z-20"
              animate={{
                opacity: phase === "tap2" ? [0.3, 0.8, 0.3] : [0.1, 0.4, 0.1],
                scale: phase === "tap2" ? [1, 1.3, 1] : [1, 1.1, 1],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ background: `radial-gradient(circle, ${lightColor}60, transparent)` }}
            />

            {/* Crack line on tap2 */}
            {phase === "tap2" && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="absolute top-[48%] left-1/2 -translate-x-1/2 w-12 h-[2px] z-30"
                style={{ background: `linear-gradient(90deg, transparent, ${lightColor}, transparent)` }}
              />
            )}

            {/* Velvet Pillow */}
            <div className="relative -mt-4 z-0">
              <img
                src="/assets/ui/velvet-pillow.png"
                alt="Velvet pillow"
                className="w-48 h-auto object-contain"
                style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))" }}
              />
            </div>
          </motion.div>
        )}

        {phase === "shatter" && (
          <motion.div
            key="shatter"
            className="relative"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 0] }}
            transition={{ duration: 0.3 }}
          >
            <img src={chest.image} alt="chest" className="w-36 h-36 object-contain" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Grid (2×4) after lid phase */}
      {(phase === "cards" || phase === "reveal") && (
        <motion.div
          className="grid grid-cols-4 gap-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {cards.map((card, i) => {
            const isRevealed = phase === "reveal";
            const cardColor = card.rarity === "legendary" ? "#FFD700"
              : card.rarity === "epic" ? "#A855F7"
              : card.rarity === "rare" ? "#2563EB"
              : "#6B7280";

            return (
              <motion.div
                key={card.id}
                initial={{ scale: 0, y: -100, rotate: 360 }}
                animate={{
                  scale: 1,
                  y: 0,
                  rotate: 0,
                  rotateY: isRevealed ? 180 : 0,
                }}
                transition={{
                  delay: i * 0.15,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 200,
                }}
                className="w-14 h-20 rounded-lg relative"
                style={{
                  background: isRevealed
                    ? `linear-gradient(180deg, ${cardColor}30, #2E1A0E)`
                    : "linear-gradient(180deg, #3E2410, #2E1A0E)",
                  border: `2px solid ${isRevealed ? cardColor : "#5C3A1E"}`,
                  boxShadow: isRevealed ? `0 0 10px ${cardColor}40` : "0 2px 8px rgba(0,0,0,0.5)",
                  transformStyle: "preserve-3d",
                }}
              >
                {isRevealed ? (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.15 + 0.3 }}
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <span className="text-2xl">{card.emoji}</span>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg opacity-30">?</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Item name reveal */}
      {phase === "reveal" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <motion.span
            className="text-6xl block mb-3"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.6)) drop-shadow(0 0 20px ${lightColor}60)` }}
          >
            {itemEmoji}
          </motion.span>
          <div className="inline-block px-6 py-2 rounded-xl" style={{
            background: "linear-gradient(180deg, #3E2410, #2E1A0E)",
            border: `2px solid ${lightColor}`,
            boxShadow: `0 4px 0 #1A0E06, 0 0 20px ${lightColor}40`,
          }}>
            <p className="font-display text-xl text-[#F5E6D3]" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.4)" }}>
              {itemName}
            </p>
          </div>
          <p className="font-display text-xs tracking-[0.3em] mt-2" style={{ color: lightColor }}>
            {rarity.toUpperCase()}
          </p>
        </motion.div>
      )}

      {/* TAP TO OPEN / TAP TO CONTINUE */}
      <motion.p
        className="absolute bottom-20 font-display text-sm tracking-wider"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ color: "#F5E6D3" }}
      >
        {phase === "reveal" ? "TAP TO CONTINUE" : "← TAP TO OPEN →"}
      </motion.p>
    </motion.div>
  );
}
