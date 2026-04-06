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
  common: { color: "hsl(210 10% 55%)", glow: "none", border: "hsl(210 15% 35%)" },
  rare: { color: "hsl(207 90% 60%)", glow: "0 0 30px hsl(207 90% 54% / 0.2)", border: "hsl(207 80% 45%)" },
  epic: { color: "hsl(275 70% 65%)", glow: "0 0 30px hsl(275 70% 55% / 0.25)", border: "hsl(275 60% 45%)" },
  legendary: { color: "hsl(43 100% 60%)", glow: "0 0 40px hsl(43 100% 50% / 0.3)", border: "hsl(43 80% 45%)" },
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
        style={{ background: "hsl(220 18% 4% / 0.88)", backdropFilter: "blur(12px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 200, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 200, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(180deg, hsl(220 12% 12%) 0%, hsl(220 15% 8%) 100%)",
            border: `2px solid ${rs.border}`,
            boxShadow: `${rs.glow}, 0 8px 0 hsl(220 12% 5%), 0 12px 30px rgba(0,0,0,0.6)`,
          }}
        >
          {/* Chrome rarity bar */}
          <div className="h-1.5" style={{
            background: `linear-gradient(90deg, transparent 5%, ${rs.color} 50%, transparent 95%)`,
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
            <h3 className="font-display text-xl text-foreground" style={{ textShadow: "0 2px 0 hsl(220 18% 7%)" }}>
              {item.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-body">{item.description}</p>
            <span className="text-[9px] text-muted-foreground/60 font-display tracking-wider mt-1.5 block">
              {CATEGORY_LABEL[item.category] || item.category}
            </span>
          </div>

          {/* Chalk divider */}
          <div className="h-px mx-6 opacity-15"
            style={{ background: "repeating-linear-gradient(90deg, hsl(45 30% 70%) 0px, hsl(45 30% 70%) 6px, transparent 6px, transparent 12px)" }}
          />

          {/* Price */}
          {!owned && (
            <div className="flex items-center justify-center gap-2 py-4">
              <span className="text-xl">🪙</span>
              <span className="font-display text-3xl" style={{
                color: canAfford ? "hsl(43 100% 60%)" : "hsl(4 80% 58%)",
                textShadow: canAfford ? "0 2px 0 hsl(35 60% 25%)" : "none",
              }}>
                {item.price}
              </span>
              {!canAfford && (
                <span className="text-[9px] font-body" style={{ color: "hsl(4 80% 58%)" }}>
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
              <div className="flex-1 py-3.5 rounded-2xl text-center font-display text-sm tracking-wider"
                style={{
                  color: "hsl(142 70% 55%)",
                  background: "hsl(142 70% 55% / 0.08)",
                  border: "2px solid hsl(142 70% 55% / 0.25)",
                  boxShadow: "inset 0 2px 4px hsl(142 70% 20% / 0.3)",
                }}
              >
                ✅ EQUIPPED
              </div>
            ) : (
              <GameButton
                variant="primary"
                size="lg"
                bounce
                className="flex-1"
                onClick={() => onEquip(item)}
              >
                ⚡ EQUIP
              </GameButton>
            )}
            <GameButton variant="secondary" size="lg" bounce onClick={onClose} className="px-5">
              ✕
            </GameButton>
          </div>

          {/* 3D bottom edge */}
          <div className="h-1" style={{ background: "hsl(220 12% 4%)" }} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
