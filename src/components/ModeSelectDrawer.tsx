import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SFX, Haptics } from "@/lib/sounds";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";

const FORMATS = [
  {
    id: "t3",
    overs: 3,
    label: "T3",
    subtitle: "QUICK FIRE",
    description: "3 overs · Fast & furious",
    emoji: "⚡",
    gradient: "from-accent to-primary",
    glowColor: "hsl(280 85% 65% / 0.25)",
    borderHsl: "hsl(280 60% 40%)",
    bgHsl: "hsl(280 40% 14%)",
  },
  {
    id: "t5",
    overs: 5,
    label: "T5",
    subtitle: "CLASSIC",
    description: "5 overs · The standard",
    emoji: "🏏",
    gradient: "from-primary to-secondary",
    glowColor: "hsl(217 91% 60% / 0.25)",
    borderHsl: "hsl(217 60% 40%)",
    bgHsl: "hsl(217 35% 14%)",
  },
  {
    id: "t10",
    overs: 10,
    label: "T10",
    subtitle: "EXTENDED",
    description: "10 overs · Strategic play",
    emoji: "🎯",
    gradient: "from-neon-green to-primary",
    glowColor: "hsl(142 71% 45% / 0.25)",
    borderHsl: "hsl(142 50% 30%)",
    bgHsl: "hsl(142 30% 12%)",
  },
  {
    id: "t20",
    overs: 20,
    label: "T20",
    subtitle: "MARATHON",
    description: "20 overs · Full match",
    emoji: "🏆",
    gradient: "from-score-gold to-accent",
    glowColor: "hsl(45 93% 47% / 0.25)",
    borderHsl: "hsl(45 70% 35%)",
    bgHsl: "hsl(45 30% 12%)",
  },
];

const MODES = [
  { id: "ar", icon: "📸", label: "AR Camera" },
  { id: "tap", icon: "⚡", label: "Tap Mode" },
];

interface ModeSelectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModeSelectDrawer({ open, onOpenChange }: ModeSelectDrawerProps) {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>("tap");

  const handleFormatSelect = (formatId: string) => {
    try { SFX.tap(); Haptics.medium(); } catch {}
    setSelectedFormat(formatId);
  };

  const handlePlay = () => {
    if (!selectedFormat) return;
    try { SFX.tap(); Haptics.heavy(); } catch {}
    onOpenChange(false);
    navigate(`/game/${selectedMode}`, {
      state: { format: selectedFormat, overs: FORMATS.find(f => f.id === selectedFormat)?.overs },
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="surface-concrete border-t-0 rounded-t-3xl max-h-[85vh] pb-6">
        <DrawerTitle className="sr-only">Select Match Format</DrawerTitle>

        {/* Chalk handle */}
        <div className="flex justify-center pt-2 pb-3">
          <div className="w-12 h-1 rounded-full" style={{ background: "hsl(0 0% 100% / 0.15)" }} />
        </div>

        {/* Header */}
        <div className="px-5 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-accent" />
            <h2 className="font-display text-base font-black text-foreground tracking-wider">
              SELECT FORMAT
            </h2>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 ml-3 font-body">Choose overs & play style</p>
        </div>

        {/* Format Cards Grid */}
        <div className="grid grid-cols-2 gap-3 px-5 mb-5">
          {FORMATS.map((fmt, i) => {
            const isSelected = selectedFormat === fmt.id;
            return (
              <motion.button
                key={fmt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: "spring", damping: 20 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFormatSelect(fmt.id)}
                className="relative rounded-2xl overflow-hidden text-left"
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${fmt.bgHsl}, hsl(230 15% 10%))`
                    : "linear-gradient(135deg, hsl(230 15% 14%), hsl(230 15% 10%))",
                  border: isSelected
                    ? `2px solid ${fmt.borderHsl}`
                    : "2px solid hsl(230 10% 18%)",
                  boxShadow: isSelected
                    ? `0 4px 20px ${fmt.glowColor}, inset 0 1px 0 hsl(0 0% 100% / 0.05)`
                    : "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {/* Selection glow pulse */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.1, 0.2, 0.1] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: `radial-gradient(circle at 50% 30%, ${fmt.glowColor}, transparent 70%)` }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative p-3">
                  {/* Emoji + Label row */}
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${fmt.gradient} flex items-center justify-center shadow-md`}
                      style={{ boxShadow: `0 3px 10px ${fmt.glowColor}` }}
                    >
                      <span className="text-lg">{fmt.emoji}</span>
                    </div>
                    <div>
                      <span className="font-display text-lg font-black text-foreground block leading-none">
                        {fmt.label}
                      </span>
                      <span className="font-display text-[8px] font-bold text-muted-foreground tracking-wider">
                        {fmt.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <span className="font-body text-[9px] text-muted-foreground block mt-1">
                    {fmt.description}
                  </span>

                  {/* Chrome check */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full surface-chrome flex items-center justify-center"
                    >
                      <span className="text-[10px]">✓</span>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Mode Toggle — AR vs Tap */}
        <div className="px-5 mb-5">
          <span className="font-display text-[9px] font-bold text-muted-foreground tracking-wider block mb-2 ml-1">
            PLAY STYLE
          </span>
          <div className="flex gap-2">
            {MODES.map((mode) => {
              const isActive = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSelectedMode(mode.id);
                    try { SFX.tap(); } catch {}
                  }}
                  className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all font-display text-xs font-bold tracking-wider"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, hsl(230 15% 18%), hsl(230 15% 14%))"
                      : "hsl(230 15% 11%)",
                    border: isActive
                      ? "2px solid hsl(217 60% 45%)"
                      : "2px solid hsl(230 10% 16%)",
                    color: isActive ? "hsl(0 0% 95%)" : "hsl(0 0% 50%)",
                    boxShadow: isActive ? "0 0 12px hsl(217 91% 60% / 0.15)" : "none",
                  }}
                >
                  <span>{mode.icon}</span>
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* GO Button — Jersey Mesh */}
        <div className="px-5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
            disabled={!selectedFormat}
            className="w-full surface-jersey jersey-green rounded-[18px] min-h-[52px] flex items-center justify-center gap-2 text-lg font-display font-black tracking-wider disabled:opacity-40 disabled:saturate-0"
          >
            <span className="text-xl">🏏</span>
            {selectedFormat ? `PLAY ${selectedFormat.toUpperCase()}` : "SELECT FORMAT"}
            <span className="text-sm opacity-60">▶</span>
          </motion.button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
