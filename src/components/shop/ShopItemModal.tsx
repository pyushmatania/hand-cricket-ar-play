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

const RARITY_COLOR: Record<string, string> = {
  common: "text-muted-foreground",
  rare: "text-game-blue",
  epic: "text-game-purple",
  legendary: "text-game-gold",
};

const RARITY_GLOW: Record<string, string> = {
  common: "",
  rare: "shadow-[0_0_30px_hsl(207_90%_54%/0.15)]",
  epic: "shadow-[0_0_30px_hsl(291_47%_51%/0.2)]",
  legendary: "shadow-[0_0_40px_hsl(51_100%_50%/0.25)]",
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
  const rarityLabel = item.rarity.toUpperCase();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[hsl(222_47%_4%/0.85)] backdrop-blur-md flex items-end justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 200, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 200, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className={`w-full max-w-sm rounded-3xl border-2 border-[hsl(222_25%_22%)] bg-gradient-to-b from-[hsl(222_40%_13%)] to-[hsl(222_40%_8%)] overflow-hidden ${RARITY_GLOW[item.rarity] || ""}`}
        >
          {/* Rarity header */}
          <div className="text-center pt-5 pb-2">
            <span className={`text-[9px] font-game-display tracking-[0.3em] ${RARITY_COLOR[item.rarity] || "text-muted-foreground"}`}>
              {rarityLabel}
            </span>
          </div>

          {/* Big preview */}
          <div className="flex justify-center py-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-8xl block drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]">{item.preview_emoji}</span>
            </motion.div>
          </div>

          {/* Info */}
          <div className="text-center px-5 pb-4">
            <h3 className="font-game-title text-xl text-foreground">{item.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 font-game-body">{item.description}</p>
            <span className="text-[9px] text-muted-foreground/60 font-game-display tracking-wider mt-1.5 block">
              {CATEGORY_LABEL[item.category] || item.category}
            </span>
          </div>

          {/* Price */}
          {!owned && (
            <div className="flex items-center justify-center gap-2 pb-3">
              <span className="text-xl">🪙</span>
              <span className={`font-game-display text-3xl ${canAfford ? "text-game-gold" : "text-game-red"}`}>
                {item.price}
              </span>
              {!canAfford && (
                <span className="text-[9px] text-game-red font-game-body">({item.price - coins} more)</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 p-5 pt-2">
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
              <div className="flex-1 py-3.5 rounded-2xl border-2 border-game-green/30 bg-game-green/10 text-center font-game-display text-sm text-game-green tracking-wider">
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
