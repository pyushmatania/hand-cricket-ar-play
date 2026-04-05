import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SFX, Haptics } from "@/lib/sounds";

interface ModeIconGridProps {
  onSelect: (modeId: string) => void;
}

const MODES = [
  { id: "ar", label: "AR Mode" },
  { id: "tap", label: "Tap Mode", hot: true },
  { id: "quick", label: "Quick Match" },
  { id: "chest", label: "Chest" },
  { id: "daily", label: "Daily" },
  { id: "multiplayer", label: "PvP", hot: true },
  { id: "tournament", label: "Tourney" },
  { id: "ipl", label: "IPL" },
  { id: "royale", label: "Royale" },
  { id: "auction", label: "Auction" },
  { id: "worldcup", label: "World Cup" },
  { id: "ashes", label: "Ashes" },
  { id: "knockout", label: "Knockout" },
  { id: "practice", label: "Practice" },
];

/* ── Per-mode animated icon scene ── */
function ModeIcon({ id }: { id: string }) {
  switch (id) {
    case "ar":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          {/* Camera body */}
          <motion.span className="text-3xl" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>📸</motion.span>
          {/* Lens glow */}
          <motion.div
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute w-4 h-4 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.6), transparent)", top: "35%", left: "55%" }}
          />
          {/* Scan brackets blinking */}
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
              className="absolute w-2 h-2"
              style={{
                border: "1.5px solid hsl(142 71% 55%)",
                borderRadius: "1px",
                ...(i === 0 ? { top: 2, left: 2, borderRight: "none", borderBottom: "none" } :
                  i === 1 ? { top: 2, right: 2, borderLeft: "none", borderBottom: "none" } :
                  i === 2 ? { bottom: 2, left: 2, borderRight: "none", borderTop: "none" } :
                  { bottom: 2, right: 2, borderLeft: "none", borderTop: "none" }),
              }}
            />
          ))}
          {/* Waving hand */}
          <motion.span
            animate={{ rotate: [0, 15, -10, 15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            className="absolute text-sm"
            style={{ bottom: 0, right: 0 }}
          >✋</motion.span>
        </div>
      );

    case "tap":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          {/* Purple orb */}
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute w-10 h-10 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(280 85% 65%), hsl(280 70% 35%))", boxShadow: "0 0 20px hsl(280 85% 60% / 0.5)" }}
          />
          {/* Ripple rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
              className="absolute w-8 h-8 rounded-full"
              style={{ border: "1.5px solid hsl(280 80% 65% / 0.4)" }}
            />
          ))}
          <motion.span
            animate={{ scale: [1, 1.3, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="relative z-10 text-2xl"
          >⚡</motion.span>
        </div>
      );

    case "quick":
      return null; // Handled by QuickMatchIcon sub-component

    case "chest":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          <span className="text-3xl">🧰</span>
          {/* Lid bobbing */}
          <motion.div
            animate={{ rotate: [-5, 5, -5], y: [-1, -3, -1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute"
            style={{ top: 6, left: "50%", transform: "translateX(-50%)" }}
          >
            <span className="text-sm">✨</span>
          </motion.div>
          {/* Coins floating */}
          {[0, 1].map(i => (
            <motion.span
              key={i}
              animate={{ y: [0, -8, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.5 }}
              className="absolute text-xs"
              style={{ bottom: 2, left: i === 0 ? 8 : "auto", right: i === 1 ? 8 : "auto" }}
            >🪙</motion.span>
          ))}
        </div>
      );

    case "daily":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-3xl"
          >📅</motion.span>
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute text-sm"
            style={{ top: 2, right: 4 }}
          >⭐</motion.span>
        </div>
      );

    case "multiplayer":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          <motion.span
            animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="text-3xl"
          >⚔️</motion.span>
          {/* Sparks */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{
                x: [(i - 1) * 4, (i - 1) * 12],
                y: [0, -10 - i * 3],
                opacity: [1, 0],
                scale: [1, 0.3],
              }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15, repeatDelay: 0.5 }}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{ background: "hsl(43 100% 60%)", boxShadow: "0 0 4px hsl(43 100% 60%)", top: "40%" }}
            />
          ))}
        </div>
      );

    case "tournament":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          <motion.span
            animate={{ rotate: [-3, 3, -3], y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl"
          >🏆</motion.span>
          <motion.div
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute w-12 h-12 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(43 100% 55% / 0.3), transparent)" }}
          />
        </div>
      );

    case "ipl":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          <motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-3xl"
          >🏟️</motion.span>
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute w-10 h-10 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(25 90% 55% / 0.3), transparent)" }}
          />
          <motion.span
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute text-[7px] font-game-display font-bold tracking-wider"
            style={{ bottom: 4, color: "hsl(25 90% 55%)", textShadow: "0 0 6px hsl(25 90% 55% / 0.5)" }}
          >IPL</motion.span>
        </div>
      );

    case "royale":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          {/* Purple orb */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute w-10 h-10 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(280 70% 45%), hsl(280 50% 20%))", boxShadow: "0 0 15px hsl(280 70% 55% / 0.4)" }}
          />
          <motion.span
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 0.4, repeat: Infinity }}
            className="relative z-10 text-2xl"
          >💀</motion.span>
        </div>
      );

    case "auction":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          {/* Hammer striking */}
          <motion.span
            animate={{ rotate: [0, -30, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
            className="text-2xl"
            style={{ transformOrigin: "bottom right" }}
          >🔨</motion.span>
          <motion.span
            animate={{ y: [0, -4, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute text-lg"
            style={{ bottom: 4, right: 6 }}
          >💰</motion.span>
        </div>
      );

    case "worldcup":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="text-3xl"
          >🌍</motion.span>
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-12 h-12 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(217 80% 55% / 0.3), hsl(142 60% 40% / 0.1), transparent)" }}
          />
        </div>
      );

    case "ashes":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          <span className="text-3xl">🏺</span>
          {/* Fire on top */}
          <motion.span
            animate={{ scale: [0.8, 1.2, 0.8], y: [0, -2, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute text-sm"
            style={{ top: 2 }}
          >🔥</motion.span>
        </div>
      );

    case "knockout":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          <motion.span
            animate={{ x: [-4, 4, -4], scale: [1, 1.15, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="text-3xl"
          >🥊</motion.span>
          {/* Stars */}
          {[0, 1].map(i => (
            <motion.span
              key={i}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.6 + i * 0.2, repeatDelay: 1 }}
              className="absolute text-xs"
              style={{ top: i === 0 ? 2 : 6, right: i === 0 ? 4 : 10 }}
            >✨</motion.span>
          ))}
        </div>
      );

    case "practice":
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          <span className="text-3xl">🎯</span>
          {/* Ball flying in */}
          <motion.div
            animate={{ x: [20, 0], y: [-10, 0], scale: [0.5, 1], opacity: [0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
            className="absolute w-3 h-3 rounded-full"
            style={{ background: "radial-gradient(circle at 30% 30%, hsl(0 65% 55%), hsl(0 50% 30%))", boxShadow: "0 0 6px hsl(0 50% 50% / 0.4)" }}
          />
        </div>
      );

    default:
      return <span className="text-3xl">🏏</span>;
  }
}

/* ── Quick Match with stump shatter ── */
const STUMP_OFFSETS = [-6, 0, 6];
const SHATTER_STUMPS = [
  { x: -18, y: 12, rotate: -35 },
  { x: 0, y: -22, rotate: -10 },
  { x: 18, y: 12, rotate: 35 },
];
const SHATTER_BAILS = [
  { x: -10, y: -18, rotate: -200 },
  { x: 10, y: -22, rotate: 220 },
];
const SPARK_DIRS = [
  { x: -12, y: -14 }, { x: 14, y: -10 },
  { x: -8, y: -20 }, { x: 10, y: -18 },
];

function QuickMatchIcon({ onShatter }: { onShatter: () => void }) {
  const [shattered, setShattered] = useState(false);

  useEffect(() => {
    if (!shattered) return;
    const t = setTimeout(() => {
      onShatter();
      setShattered(false);
    }, 700);
    return () => clearTimeout(t);
  }, [shattered, onShatter]);

  const trigger = () => {
    if (shattered) return;
    try { SFX.tap(); Haptics.medium(); } catch {}
    setShattered(true);
  };

  return (
    <motion.button
      onClick={trigger}
      whileTap={shattered ? undefined : { scale: 0.8, y: 4 }}
      className="flex flex-col items-center gap-1 relative"
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <div className="relative w-14 h-14 flex items-center justify-center">
          {/* Stumps */}
          {STUMP_OFFSETS.map((x, i) => (
            <motion.div
              key={`s${i}`}
              animate={shattered ? { x: SHATTER_STUMPS[i].x, y: SHATTER_STUMPS[i].y, rotate: SHATTER_STUMPS[i].rotate, opacity: 0 } : {}}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute"
              style={{ bottom: 6, left: `calc(50% + ${x}px - 1.5px)`, width: 3, height: 20, borderRadius: 2, background: "linear-gradient(180deg, hsl(43 70% 65%), hsl(35 50% 35%))", boxShadow: "0 0 4px hsl(43 70% 50% / 0.3)" }}
            />
          ))}
          {/* Bails */}
          {[-3, 3].map((x, i) => (
            <motion.div
              key={`b${i}`}
              animate={shattered ? { x: SHATTER_BAILS[i].x, y: SHATTER_BAILS[i].y, rotate: SHATTER_BAILS[i].rotate, opacity: 0 } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute"
              style={{ bottom: 26, left: `calc(50% + ${x}px - 4px)`, width: 8, height: 2, borderRadius: 1, background: "hsl(43 80% 60%)" }}
            />
          ))}
          {/* Ball */}
          <motion.div
            animate={shattered
              ? { y: 6, scale: 1, opacity: 1 }
              : { y: [-18, 6], scale: [0.7, 1], opacity: [0.5, 1] }
            }
            transition={shattered
              ? { duration: 0.15 }
              : { duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }
            }
            className="absolute w-4 h-4 rounded-full"
            style={{ background: "radial-gradient(circle at 30% 30%, hsl(0 65% 55%), hsl(0 50% 30%))", boxShadow: "0 0 8px hsl(0 60% 50% / 0.5)", top: 4 }}
          />
          {/* Sparks */}
          {shattered && SPARK_DIRS.map((d, i) => (
            <motion.div
              key={`sp${i}`}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: d.x, y: d.y, opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.04 }}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{ background: "hsl(43 100% 60%)", boxShadow: "0 0 6px hsl(43 100% 60%)", top: "50%", left: "50%" }}
            />
          ))}
          {/* Flash */}
          {shattered && (
            <motion.div
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute w-10 h-10 rounded-full"
              style={{ background: "radial-gradient(circle, white, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
            />
          )}
        </div>
      </motion.div>
      <span className="font-game-display text-[8px] tracking-wider text-foreground/80 text-center leading-tight">Quick Match</span>
    </motion.button>
  );
}

export default function ModeIconGrid({ onSelect }: ModeIconGridProps) {
  return (
    <div className="grid grid-cols-4 gap-x-2 gap-y-4">
      {MODES.map((mode, i) => {
        if (mode.id === "quick") {
          return (
            <motion.div
              key="quick"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.04, type: "spring", damping: 20 }}
            >
              <QuickMatchIcon onShatter={() => onSelect("quick")} />
            </motion.div>
          );
        }
        return (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04, type: "spring", damping: 20 }}
            whileTap={{ scale: 0.8, y: 4 }}
            onClick={() => {
              try { SFX.tap(); Haptics.medium(); } catch {}
              onSelect(mode.id);
            }}
            className="flex flex-col items-center gap-1 relative"
          >
            {mode.hot && (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute -top-1.5 -right-0.5 z-20 px-1.5 py-0.5 rounded-full font-game-display text-[6px] tracking-wider"
                style={{
                  background: "linear-gradient(135deg, hsl(0 84% 55%), hsl(25 90% 50%))",
                  color: "white",
                  boxShadow: "0 2px 6px hsl(0 84% 55% / 0.4)",
                  border: "1px solid hsl(0 70% 65% / 0.5)",
                }}
              >HOT</motion.div>
            )}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.5 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <ModeIcon id={mode.id} />
            </motion.div>
            <span className="font-game-display text-[8px] tracking-wider text-foreground/80 text-center leading-tight">
              {mode.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
