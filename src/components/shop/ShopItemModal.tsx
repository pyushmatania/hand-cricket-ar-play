import { motion, AnimatePresence } from "framer-motion";
import GameButton from "@/components/shared/GameButton";

interface ShopItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rarity: string;
  preview_emoji: string;
  description: string;
}

interface ShopItemModalProps {
  item: ShopItem | null;
  coins: number;
  owned: boolean;
  equipped: boolean;
  purchasing: boolean;
  onClose: () => void;
  onPurchase: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
}

const RARITY_STYLE: Record<string, { color: string; glow: string; border: string }> = {
  common: { color: "#6B7280", glow: "none", border: "#2E1A0E" },
  rare: { color: "#3B82F6", glow: "0 0 24px rgba(37,99,235,0.2)", border: "#2563EB" },
  epic: { color: "#A855F7", glow: "0 0 30px rgba(168,85,247,0.25)", border: "#A855F7" },
  legendary: { color: "#FFD700", glow: "0 0 40px rgba(255,215,0,0.3)", border: "#FFD700" },
};

const CATEGORY_LABEL: Record<string, string> = {
  bat_skin: "🏏 Bat Skin",
  vs_effect: "⚔️ VS Effect",
  avatar_frame: "🖼️ Avatar Frame",
  game_pass: "🎫 Game Pass",
};

export default function ShopItemModal({
  item, coins, owned, equipped, purchasing, onClose, onPurchase, onEquip,
}: ShopItemModalProps) {
  if (!item) return null;
  const canAfford = coins >= item.price;
  const rs = RARITY_STYLE[item.rarity] || RARITY_STYLE.common;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center p-4"
        style={{ background: "rgba(10,5,6,0.88)", backdropFilter: "blur(12px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 200, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 200, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #3E2410 0%, #2E1A0E 100%)",
            border: `3px solid ${rs.border}`,
            boxShadow: `${rs.glow}, 0 8px 0 #1A0E06, 0 12px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          {/* Rarity bar */}
          <div className="h-1.5" style={{
            background: `linear-gradient(90deg, transparent 5%, ${rs.color} 50%, transparent 95%)`,
            boxShadow: `0 0 8px ${rs.color}44`,
          }} />

          {/* Rarity header */}
          <div className="text-center pt-5 pb-2">
            <span className="text-[9px] font-display tracking-[0.3em]" style={{ color: rs.color }}>
              {item.rarity.toUpperCase()}
            </span>
          </div>

          {/* Big preview */}
          <div className="flex justify-center py-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-8xl block" style={{
                filter: `drop-shadow(0 8px 20px rgba(0,0,0,0.5)) drop-shadow(0 0 20px ${rs.color}40)`,
              }}>
                {item.preview_emoji}
              </span>
            </motion.div>
          </div>

          {/* Info */}
          <div className="text-center px-5 pb-4">
            <h3 className="font-display text-xl text-[#F5E6D3]" style={{ textShadow: "0 2px 0 #1A0E06" }}>
              {item.name}
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1 font-body">{item.description}</p>
            <span className="text-[9px] text-[#94A3B8]/60 font-display tracking-wider mt-1.5 block">
              {CATEGORY_LABEL[item.category] || item.category}
            </span>
          </div>

          {/* Rope divider */}
          <div className="rope-separator mx-6" />

          {/* Price */}
          {!owned && (
            <div className="flex items-center justify-center gap-2 py-4">
              <span className="text-xl">🪙</span>
              <span className="font-display text-3xl" style={{
                color: canAfford ? "#FFD700" : "#EF4444",
                textShadow: canAfford ? "0 2px 0 #8B6914" : "none",
              }}>
                {item.price}
              </span>
              {!canAfford && (
                <span className="text-[9px] font-body text-[#EF4444]">
                  ({item.price - coins} more)
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 p-5 pt-3">
            {!owned ? (
              <GameButton
                variant={canAfford ? "gold" : "secondary"}
                size="lg"
                bounce
                className="flex-1"
                disabled={!canAfford || purchasing}
                onClick={() => onPurchase(item)}
              >
                {purchasing ? "..." : canAfford ? "🪙 BUY" : "NOT ENOUGH"}
              </GameButton>
            ) : equipped ? (
              <div className="flex-1 py-3.5 rounded-xl text-center font-display text-sm tracking-wider"
                style={{
                  color: "#22C55E",
                  background: "#22C55E10",
                  border: "2px solid #22C55E40",
                }}
              >
                ✅ EQUIPPED
              </div>
            ) : (
              <GameButton variant="primary" size="lg" bounce className="flex-1" onClick={() => onEquip(item)}>
                ⚡ EQUIP
              </GameButton>
            )}
            <GameButton variant="secondary" size="lg" bounce onClick={onClose} className="px-5">
              ✕
            </GameButton>
          </div>

          {/* Bottom edge */}
          <div className="h-1" style={{ background: "#1A0E06" }} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
