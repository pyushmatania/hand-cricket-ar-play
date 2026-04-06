import { motion } from "framer-motion";
import { SFX, Haptics } from "@/lib/sounds";

interface ShopItemCardProps {
  name: string;
  rarity: string;
  previewEmoji: string;
  description: string;
  price: number;
  owned: boolean;
  equipped: boolean;
  index: number;
  onClick: () => void;
}

const RARITY_CONFIG: Record<string, {
  border: string; glow: string; stripe: string; accent: string; label: string;
}> = {
  common: { border: "#2E1A0E", glow: "none", stripe: "#5C3A1E", accent: "#6B7280", label: "COMMON" },
  rare: { border: "#2563EB", glow: "0 0 12px rgba(37,99,235,0.2)", stripe: "#2563EB", accent: "#3B82F6", label: "RARE" },
  epic: { border: "#A855F7", glow: "0 0 16px rgba(168,85,247,0.25)", stripe: "#A855F7", accent: "#A855F7", label: "EPIC" },
  legendary: { border: "#FFD700", glow: "0 0 20px rgba(255,215,0,0.3)", stripe: "#FFD700", accent: "#FFD700", label: "LEGENDARY" },
};

export default function ShopItemCard({
  name, rarity, previewEmoji, description, price, owned, equipped, index, onClick,
}: ShopItemCardProps) {
  const r = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
      onClick={() => { SFX.tap(); Haptics.light(); onClick(); }}
      className="relative rounded-xl overflow-hidden cursor-pointer active:scale-[0.96] transition-transform"
      style={{
        background: "linear-gradient(180deg, #3E2410 0%, #2E1A0E 100%)",
        border: `2px solid ${r.border}`,
        boxShadow: `${r.glow}, 0 6px 0 #1A0E06, 0 8px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Rarity stripe */}
      <div className="h-[2px]" style={{
        background: `linear-gradient(90deg, transparent, ${r.stripe}, transparent)`,
        boxShadow: `0 0 4px ${r.stripe}44`,
      }} />

      <div className="p-3 relative">
        {/* Top badges */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[7px] font-display tracking-wider" style={{ color: r.accent }}>
            {r.label}
          </span>
          {equipped && (
            <span className="text-[7px] font-display tracking-wider px-1.5 py-0.5 rounded-full"
              style={{ color: "#22C55E", background: "#22C55E15", border: "1px solid #22C55E40" }}
            >
              ✓ ON
            </span>
          )}
          {owned && !equipped && (
            <span className="text-[7px] font-display tracking-wider px-1.5 py-0.5 rounded-full"
              style={{ color: "#3B82F6", background: "#3B82F615", border: "1px solid #3B82F640" }}
            >
              OWNED
            </span>
          )}
        </div>

        {/* Preview */}
        <div className="text-center py-4">
          <motion.span
            className="text-5xl block"
            style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}
            whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
          >
            {previewEmoji}
          </motion.span>
        </div>

        {/* Name */}
        <p className="font-display text-xs font-bold text-[#F5E6D3] truncate"
          style={{ textShadow: "0 1px 0 #1A0E06" }}
        >
          {name}
        </p>

        {/* Price / status */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-[#94A3B8] line-clamp-1 flex-1">{description.slice(0, 22)}</span>
          {!owned && (
            <span className="font-display text-[10px] flex items-center gap-0.5 shrink-0 px-2 py-0.5 rounded-full"
              style={{ color: "#FFD700", background: "#FFD70010", border: "1px solid #FFD70030" }}
            >
              🪙 {price}
            </span>
          )}
        </div>
      </div>

      {/* 3D bottom edge */}
      <div className="h-1" style={{ background: "#1A0E06" }} />
    </motion.div>
  );
}
