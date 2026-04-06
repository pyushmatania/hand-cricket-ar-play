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
  border: string; glow: string; label: string; color: string; stripe: string; accent: string;
}> = {
  common: {
    border: "hsl(210 15% 45%)",
    glow: "none",
    label: "COMMON",
    color: "hsl(210 10% 55%)",
    stripe: "hsl(210 15% 50%)",
    accent: "hsl(210 15% 50% / 0.08)",
  },
  rare: {
    border: "hsl(207 90% 50%)",
    glow: "0 0 14px hsl(207 90% 54% / 0.25)",
    label: "RARE",
    color: "hsl(207 90% 60%)",
    stripe: "hsl(207 90% 54%)",
    accent: "hsl(207 90% 54% / 0.1)",
  },
  epic: {
    border: "hsl(275 70% 55%)",
    glow: "0 0 18px hsl(275 70% 55% / 0.3)",
    label: "EPIC",
    color: "hsl(275 70% 65%)",
    stripe: "hsl(275 70% 55%)",
    accent: "hsl(275 70% 55% / 0.12)",
  },
  legendary: {
    border: "hsl(43 90% 50%)",
    glow: "0 0 22px hsl(43 100% 50% / 0.35)",
    label: "LEGENDARY",
    color: "hsl(43 100% 60%)",
    stripe: "hsl(43 90% 50%)",
    accent: "hsl(43 100% 50% / 0.15)",
  },
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
      className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.96] transition-transform"
      style={{
        border: `2px solid ${r.border}`,
        boxShadow: equipped ? r.glow : "0 4px 0 hsl(220 18% 7%), 0 6px 12px rgba(0,0,0,0.4)",
        background: "linear-gradient(180deg, hsl(220 12% 12%) 0%, hsl(220 15% 8%) 100%)",
      }}
    >
      {/* Rarity stripe - chrome */}
      <div className="h-1.5" style={{
        background: `linear-gradient(90deg, transparent, ${r.stripe}, transparent)`,
      }} />

      {/* Card body - leather texture */}
      <div className="p-3 relative">
        {/* Rarity accent overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at 50% 20%, ${r.accent}, transparent 70%)`,
        }} />

        <div className="relative z-10">
          {/* Top badges */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[7px] font-display tracking-wider" style={{ color: r.color }}>
              {r.label}
            </span>
            {equipped && (
              <span className="text-[7px] font-display tracking-wider px-1.5 py-0.5 rounded-full"
                style={{
                  color: "hsl(142 70% 55%)",
                  background: "hsl(142 70% 55% / 0.1)",
                  border: "1px solid hsl(142 70% 55% / 0.25)",
                }}
              >
                ✓ ON
              </span>
            )}
            {owned && !equipped && (
              <span className="text-[7px] font-display tracking-wider px-1.5 py-0.5 rounded-full"
                style={{
                  color: "hsl(207 80% 60%)",
                  background: "hsl(207 80% 60% / 0.1)",
                  border: "1px solid hsl(207 80% 60% / 0.2)",
                }}
              >
                OWNED
              </span>
            )}
          </div>

          {/* Preview */}
          <div className="text-center py-4">
            <motion.span
              className="text-5xl block"
              style={{ filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.5))` }}
              whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
            >
              {previewEmoji}
            </motion.span>
          </div>

          {/* Name - scoreboard paint */}
          <p className="font-display text-xs font-bold text-foreground truncate"
            style={{ textShadow: "0 1px 0 hsl(220 18% 7%)" }}
          >
            {name}
          </p>

          {/* Price / status */}
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[9px] text-muted-foreground line-clamp-1 flex-1">{description.slice(0, 22)}</span>
            {!owned && (
              <span className="font-display text-[10px] flex items-center gap-0.5 shrink-0"
                style={{ color: "hsl(43 100% 60%)" }}
              >
                🪙 {price}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3D bottom edge */}
      <div className="h-1" style={{
        background: "linear-gradient(180deg, hsl(220 15% 6%), hsl(220 12% 4%))",
      }} />
    </motion.div>
  );
}
