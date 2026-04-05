import { motion } from "framer-motion";
import { MODES, type GameMode } from "@/components/play/modes";
import { SFX, Haptics } from "@/lib/sounds";

interface GameModeCardsProps {
  onSelect: (modeId: string) => void;
}

/* ── Per-mode animated icon ─────────────────────────────────────── */

function AnimatedIcon({ mode }: { mode: GameMode }) {
  const wrap = "relative w-14 h-14 flex items-center justify-center text-2xl select-none";

  switch (mode.id) {
    /* PvP — two bats clash */
    case "multiplayer":
      return (
        <div className={wrap}>
          <motion.span
            animate={{ x: [-5, 0, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
            style={{ left: 6 }}
          >
            🏏
          </motion.span>
          <motion.span
            animate={{ x: [5, 0, 5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
            style={{ right: 6, transform: "scaleX(-1)" }}
          >
            🏏
          </motion.span>
          <motion.div
            animate={{ opacity: [0, 0, 1, 0], scale: [0.5, 0.5, 1.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute rounded-full"
            style={{ width: 6, height: 6, background: "white" }}
          />
        </div>
      );

    /* Tap — finger taps with ring */
    case "tap":
      return (
        <div className={wrap}>
          <motion.span
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          >
            👆
          </motion.span>
          <motion.div
            animate={{ scale: [0.3, 1.4], opacity: [0.7, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
            className="absolute rounded-full border-2"
            style={{ width: 20, height: 20, borderColor: mode.accentHsl, bottom: 8 }}
          />
        </div>
      );

    /* AR — camera with sweep line and red dot */
    case "ar":
      return (
        <div className={wrap} style={{ overflow: "hidden" }}>
          <span>📸</span>
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-1 right-1"
            style={{ height: 2, background: "cyan", opacity: 0.6 }}
          />
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute"
            style={{ width: 5, height: 5, borderRadius: "50%", background: "red", top: 8, right: 10 }}
          />
        </div>
      );

    /* Daily — calendar wobble */
    case "daily":
      return (
        <div className={wrap}>
          <motion.span
            animate={{ rotateY: [-10, 10, -10] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >
            📅
          </motion.span>
        </div>
      );

    /* Tournament — trophy spin with sparkles */
    case "tournament":
      return (
        <div className={wrap}>
          <motion.span
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ display: "inline-block" }}
          >
            🏆
          </motion.span>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                x: [0, (i - 1) * 12],
                y: [0, -10 - i * 4],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
              className="absolute"
              style={{ width: 3, height: 3, borderRadius: "50%", background: "hsl(43 100% 70%)" }}
            />
          ))}
        </div>
      );

    /* IPL — stadium pulse */
    case "ipl":
      return (
        <div className={wrap}>
          <motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >
            🏟️
          </motion.span>
        </div>
      );

    /* Royale — skull with red glow */
    case "royale":
      return (
        <div className={wrap}>
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >
            💀
          </motion.span>
          <motion.div
            animate={{ opacity: [0.15, 0.45, 0.15] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(0 80% 50% / 0.5) 0%, transparent 70%)" }}
          />
        </div>
      );

    /* Auction — money shake */
    case "auction":
      return (
        <div className={wrap}>
          <motion.span
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >
            💰
          </motion.span>
        </div>
      );

    /* World Cup — globe rotation */
    case "worldcup":
      return (
        <div className={wrap}>
          <motion.span
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ display: "inline-block" }}
          >
            🌍
          </motion.span>
        </div>
      );

    /* Ashes — urn with fire glow */
    case "ashes":
      return (
        <div className={wrap}>
          <motion.span style={{ display: "inline-block" }}>🏺</motion.span>
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.95, 1.1, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(25 100% 50% / 0.4) 0%, transparent 70%)" }}
          />
        </div>
      );

    /* Knockout — punch shake */
    case "knockout":
      return (
        <div className={wrap}>
          <motion.span
            animate={{ x: [0, -4, 4, -2, 0], rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >
            🥊
          </motion.span>
        </div>
      );

    /* Practice — target with orbiting ball */
    case "practice":
      return (
        <div className={wrap}>
          <span>🎯</span>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute"
            style={{ width: 36, height: 36 }}
          >
            <div
              className="absolute rounded-full"
              style={{ width: 5, height: 5, background: "hsl(142 71% 55%)", top: 0, left: "50%", transform: "translateX(-50%)" }}
            />
          </motion.div>
        </div>
      );

    default:
      return <div className={wrap}><span>{mode.icon}</span></div>;
  }
}

/* ── Chrome corner bracket ──────────────────────────────────────── */

function ChromeBracket({ side }: { side: "left" | "right" }) {
  const gold = "hsl(43 80% 55%)";
  const isLeft = side === "left";
  return (
    <div
      className="absolute top-0 pointer-events-none"
      style={{
        [isLeft ? "left" : "right"]: 0,
        width: 8,
        height: 8,
      }}
    >
      {/* horizontal */}
      <div
        className="absolute top-0"
        style={{
          [isLeft ? "left" : "right"]: 0,
          width: 8,
          height: 1.5,
          background: gold,
          opacity: 0.7,
          borderRadius: 1,
        }}
      />
      {/* vertical */}
      <div
        className="absolute top-0"
        style={{
          [isLeft ? "left" : "right"]: 0,
          width: 1.5,
          height: 8,
          background: gold,
          opacity: 0.7,
          borderRadius: 1,
        }}
      />
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */

export default function GameModeCards({ onSelect }: GameModeCardsProps) {
  return (
    <div className="w-full">
      {/* Section header */}
      <div className="flex items-center gap-2 px-1 mb-2">
        <div
          className="w-1 h-4 rounded-sm"
          style={{ background: "linear-gradient(180deg, hsl(43 90% 55%), hsl(35 60% 35%))" }}
        />
        <span className="font-game-display text-[10px] tracking-[0.2em] text-foreground">
          GAME MODES
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-2.5">
        {MODES.map((mode, index) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index, duration: 0.35, ease: "easeOut" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              SFX.tap();
              Haptics.light();
              onSelect(mode.id);
            }}
            className="relative w-full flex items-center gap-3 px-3 py-2.5 text-left"
            style={{
              borderRadius: 14,
              background: `linear-gradient(135deg, hsl(222 30% 10%) 0%, hsl(222 25% 7%) 100%)`,
              borderLeft: `3px solid ${mode.accentHsl}`,
            }}
          >
            {/* Chrome brackets */}
            <ChromeBracket side="left" />
            <ChromeBracket side="right" />

            {/* Subtle accent glow on left edge */}
            <div
              className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none"
              style={{
                borderRadius: "14px 0 0 14px",
                background: `linear-gradient(90deg, ${mode.glowHsl} 0%, transparent 100%)`,
              }}
            />

            {/* Icon area */}
            <div className="relative flex-shrink-0">
              <AnimatedIcon mode={mode} />
            </div>

            {/* Text content */}
            <div className="relative flex-1 min-w-0">
              <div
                className="font-game-display text-[12px] tracking-wider leading-tight"
                style={{ color: mode.accentHsl }}
              >
                {mode.title}
              </div>
              <div className="text-[8px] uppercase tracking-widest text-muted-foreground/50 mt-0.5">
                {mode.subtitle}
              </div>
              <div className="font-game-body text-[9px] text-muted-foreground leading-snug mt-0.5 truncate">
                {mode.description}
              </div>
            </div>

            {/* Arrow */}
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex-shrink-0 text-lg text-muted-foreground/40"
            >
              ›
            </motion.span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
