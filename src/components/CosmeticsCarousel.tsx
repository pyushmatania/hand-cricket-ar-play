import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBatSkin, getVSEffect, getButtonStyle, BUTTON_STYLES } from "@/lib/cosmetics";

interface CosmeticItem {
  id: string;
  category: string;
  name: string;
  emoji: string;
  gradient: string;
  glow: string;
  detail?: string;
}

interface CosmeticsCarouselProps {
  batSkin?: string | null;
  vsEffect?: string | null;
  avatarFrame?: string | null;
  buttonStyle?: string | null;
}

function buildItems(props: CosmeticsCarouselProps): CosmeticItem[] {
  const items: CosmeticItem[] = [];

  // Bat skin
  const bs = getBatSkin(props.batSkin);
  items.push({
    id: "bat",
    category: "BAT SKIN",
    name: props.batSkin || "Classic Willow",
    emoji: bs.emoji,
    gradient: bs.gradient || "from-[hsl(30_40%_45%)] to-[hsl(30_35%_35%)]",
    glow: bs.glow,
  });

  // VS effect
  const vs = getVSEffect(props.vsEffect);
  items.push({
    id: "vs",
    category: "VS EFFECT",
    name: props.vsEffect || "Classic Clash",
    emoji: "⚡",
    gradient: vs.bgGradient || "from-[hsl(222_47%_6%)] to-[hsl(222_47%_11%)]",
    glow: `shadow-[0_0_20px_${vs.glowColor}]`,
    detail: vs.entranceStyle?.toUpperCase(),
  });

  // Avatar frame
  if (props.avatarFrame) {
    items.push({
      id: "frame",
      category: "AVATAR FRAME",
      name: props.avatarFrame,
      emoji: "🖼️",
      gradient: "from-[hsl(270_60%_50%)] to-[hsl(220_60%_40%)]",
      glow: "shadow-[0_0_16px_hsl(270_60%_50%/0.3)]",
    });
  }

  // Button style
  const btn = getButtonStyle(props.buttonStyle);
  if (btn.id !== "classic" || props.buttonStyle) {
    items.push({
      id: "buttons",
      category: "HAND BUTTONS",
      name: btn.name,
      emoji: btn.preview,
      gradient: "from-[hsl(280_70%_45%)] to-[hsl(320_60%_35%)]",
      glow: "shadow-[0_0_14px_hsl(280_70%_55%/0.3)]",
      detail: btn.description,
    });
  }

  return items;
}

export default function CosmeticsCarousel(props: CosmeticsCarouselProps) {
  const items = buildItems(props);
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const t = setInterval(() => setActive(p => (p + 1) % items.length), 3000);
    return () => clearInterval(t);
  }, [autoPlay, items.length]);

  if (items.length === 0) return null;

  const item = items[active];
  const btnTheme = active === items.findIndex(i => i.id === "buttons")
    ? getButtonStyle(props.buttonStyle) : null;

  return (
    <div
      className="border-t border-muted/10 px-3 py-3"
      onPointerDown={() => setAutoPlay(false)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[7px] text-muted-foreground font-game-display tracking-[0.2em]">
          EQUIPPED LOADOUT
        </span>
        {/* Dot indicators */}
        <div className="flex gap-1">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => { setActive(i); setAutoPlay(false); }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative h-[100px] overflow-hidden rounded-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, rotateY: 45, scale: 0.85 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -45, scale: 0.85 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ perspective: 600, transformStyle: "preserve-3d" }}
            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.gradient} ${item.glow} border border-white/10 p-3 flex items-center gap-3`}
          >
            {/* 3D spinning icon */}
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ transformStyle: "preserve-3d", perspective: 200 }}
              className="w-16 h-16 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm"
            >
              <span className="text-3xl">{item.emoji}</span>
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="text-[7px] text-white/50 font-game-display tracking-[0.2em] block">
                {item.category}
              </span>
              <span className="text-sm font-game-display font-black text-white tracking-wider block truncate">
                {item.name.toUpperCase()}
              </span>
              {item.detail && (
                <span className="text-[8px] text-white/40 font-game-body block mt-0.5">
                  {item.detail}
                </span>
              )}

              {/* Mini button preview for hand buttons */}
              {btnTheme && (
                <div className="flex gap-1 mt-1.5">
                  {Object.entries(btnTheme.moves).slice(0, 4).map(([key, mv]) => (
                    <div
                      key={key}
                      className={`w-6 h-6 rounded-md bg-gradient-to-b ${mv.color} flex items-center justify-center`}
                    >
                      <span className="text-[10px]">{mv.emoji}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Floating shimmer */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 40%, hsl(0 0% 100% / 0.08) 50%, transparent 60%)",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe hint */}
      {items.length > 1 && (
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={() => { setActive((active - 1 + items.length) % items.length); setAutoPlay(false); }}
            className="text-[8px] text-muted-foreground/40 font-game-display tracking-wider active:scale-90 transition-transform"
          >
            ◀ PREV
          </button>
          <button
            onClick={() => { setActive((active + 1) % items.length); setAutoPlay(false); }}
            className="text-[8px] text-muted-foreground/40 font-game-display tracking-wider active:scale-90 transition-transform"
          >
            NEXT ▶
          </button>
        </div>
      )}
    </div>
  );
}
