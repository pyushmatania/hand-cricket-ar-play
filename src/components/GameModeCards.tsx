import { motion } from "framer-motion";
import { MODES, type GameMode } from "@/components/play/modes";
import { SFX, Haptics } from "@/lib/sounds";

interface GameModeCardsProps {
  onSelect: (modeId: string) => void;
}

/* ── Animated icons per mode ─────────────────────────────── */

function AnimatedIcon({ mode }: { mode: GameMode }) {
  const w = "relative w-14 h-14 flex items-center justify-center text-2xl select-none overflow-hidden";

  switch (mode.id) {
    /* PvP — two bats clash with spark */
    case "multiplayer":
      return (
        <div className={w}>
          <motion.span animate={{ x: [-5, 0, -5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute" style={{ left: 4 }}>🏏</motion.span>
          <motion.span animate={{ x: [5, 0, 5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute" style={{ right: 4, transform: "scaleX(-1)" }}>🏏</motion.span>
          <motion.div animate={{ opacity: [0, 0, 1, 0], scale: [0.5, 0.5, 1.4, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute rounded-full" style={{ width: 6, height: 6, background: "white", boxShadow: "0 0 8px white" }} />
        </div>
      );

    /* Tap — finger tapping with ripple */
    case "tap":
      return (
        <div className={w}>
          <motion.span animate={{ y: [-4, 4, -4] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}>👆</motion.span>
          <motion.div animate={{ scale: [0.3, 1.4], opacity: [0.7, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }} className="absolute rounded-full border-2" style={{ width: 20, height: 20, borderColor: mode.accentHsl, bottom: 8 }} />
          <motion.span animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }} className="absolute text-xs" style={{ top: 6, right: 8 }}>⚡</motion.span>
        </div>
      );

    /* AR — camera with scan line + REC dot */
    case "ar":
      return (
        <div className={w}>
          <span>📸</span>
          <motion.div animate={{ y: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute left-1 right-1" style={{ height: 2, background: "cyan", opacity: 0.6 }} />
          <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="absolute" style={{ width: 5, height: 5, borderRadius: "50%", background: "red", top: 8, right: 10 }} />
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute" style={{ width: 28, height: 28 }}>
            <div className="absolute rounded-full" style={{ width: 4, height: 4, background: "hsl(0 80% 50%)", top: 0, left: "50%", transform: "translateX(-50%)" }} />
          </motion.div>
        </div>
      );

    /* Daily — calendar flip */
    case "daily":
      return (
        <div className={w}>
          <motion.span animate={{ rotateY: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ display: "inline-block" }}>📅</motion.span>
          <motion.span animate={{ y: [-2, -8, -2], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute text-xs" style={{ top: 4, right: 6 }}>⭐</motion.span>
        </div>
      );

    /* Tournament — trophy spin with sparkles */
    case "tournament":
      return (
        <div className={w}>
          <motion.span animate={{ rotateY: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}>🏆</motion.span>
          {[0, 1, 2].map(i => (
            <motion.div key={i} animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], x: [0, (i - 1) * 12], y: [0, -10 - i * 4] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }} className="absolute" style={{ width: 3, height: 3, borderRadius: "50%", background: "hsl(43 100% 70%)" }} />
          ))}
        </div>
      );

    /* IPL — stadium pulse */
    case "ipl":
      return (
        <div className={w}>
          <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>🏟️</motion.span>
        </div>
      );

    /* Royale — skull with red glow */
    case "royale":
      return (
        <div className={w}>
          <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>💀</motion.span>
          <motion.div animate={{ opacity: [0.15, 0.45, 0.15] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(0 80% 50% / 0.5) 0%, transparent 70%)" }} />
          {[0, 1].map(i => (
            <motion.div key={i} animate={{ opacity: [0, 0.8, 0], y: [0, -8] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.5 }} className="absolute" style={{ width: 3, height: 3, borderRadius: "50%", background: "hsl(25 100% 60%)", bottom: 12, left: 20 + i * 16 }} />
          ))}
        </div>
      );

    /* Auction — gavel strike */
    case "auction":
      return (
        <div className={w}>
          <motion.span animate={{ rotate: [-15, 0, -15] }} transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }} style={{ display: "inline-block" }}>🔨</motion.span>
          <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }} className="absolute text-base" style={{ bottom: 4, right: 6 }}>💰</motion.span>
          <motion.div animate={{ opacity: [0, 1, 0], scale: [0.3, 1.2, 0] }} transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }} className="absolute rounded-full" style={{ width: 4, height: 4, background: "hsl(43 100% 60%)", bottom: 14, left: 18 }} />
        </div>
      );

    /* World Cup — globe rotation */
    case "worldcup":
      return (
        <div className={w}>
          <motion.span animate={{ rotateY: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}>🌍</motion.span>
        </div>
      );

    /* Ashes — urn with fire */
    case "ashes":
      return (
        <div className={w}>
          <span>🏺</span>
          <motion.span animate={{ opacity: [0.4, 1, 0.4], y: [0, -3, 0], scale: [0.8, 1.1, 0.8] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute text-xs" style={{ top: 2 }}>🔥</motion.span>
        </div>
      );

    /* Knockout — glove punch */
    case "knockout":
      return (
        <div className={w}>
          <motion.span animate={{ x: [0, -4, 4, -2, 0], rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }} style={{ display: "inline-block" }}>🥊</motion.span>
          {[0, 1].map(i => (
            <motion.div key={i} animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1, delay: i * 0.15 }} className="absolute" style={{ top: 8 + i * 8, right: 8, fontSize: 8 }}>✨</motion.div>
          ))}
        </div>
      );

    /* Practice — target with ball orbit */
    case "practice":
      return (
        <div className={w}>
          <span>🎯</span>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute" style={{ width: 36, height: 36 }}>
            <div className="absolute rounded-full" style={{ width: 5, height: 5, background: "hsl(142 71% 55%)", top: 0, left: "50%", transform: "translateX(-50%)" }} />
          </motion.div>
        </div>
      );

    default:
      return <div className={w}><span>{mode.icon}</span></div>;
  }
}

/* ── Chrome corner bracket ──────────────────────────────── */

function ChromeBracket({ side }: { side: "left" | "right" }) {
  const gold = "hsl(43 80% 55%)";
  const isLeft = side === "left";
  return (
    <div className="absolute top-0 pointer-events-none" style={{ [isLeft ? "left" : "right"]: 0, width: 8, height: 8 }}>
      <div className="absolute top-0" style={{ [isLeft ? "left" : "right"]: 0, width: 8, height: 1.5, background: gold, opacity: 0.7, borderRadius: 1 }} />
      <div className="absolute top-0" style={{ [isLeft ? "left" : "right"]: 0, width: 1.5, height: 8, background: gold, opacity: 0.7, borderRadius: 1 }} />
    </div>
  );
}

/* ── Battle Pass card ───────────────────────────────────── */

function BattlePassCard({ onSelect }: { onSelect: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => { SFX.tap(); Haptics.light(); onSelect(); }}
      className="relative w-full flex items-center gap-3 px-3 py-3 text-left"
      style={{
        borderRadius: 14,
        background: "linear-gradient(135deg, hsl(280 30% 12%) 0%, hsl(43 30% 10%) 100%)",
        border: "2px solid hsl(280 40% 30%)",
        borderBottom: "5px solid hsl(280 30% 15%)",
      }}
    >
      <ChromeBracket side="left" />
      <ChromeBracket side="right" />
      <div className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none" style={{ borderRadius: "14px 0 0 14px", background: "linear-gradient(90deg, hsl(280 50% 40% / 0.2) 0%, transparent 100%)" }} />
      <div className="relative w-14 h-14 flex items-center justify-center text-2xl">
        <motion.span animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}>⚔️</motion.span>
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="font-display text-[12px] tracking-wider leading-tight" style={{ color: "hsl(280 70% 70%)" }}>BATTLE PASS</div>
        <div className="text-[8px] uppercase tracking-widest text-muted-foreground/50 mt-0.5">SEASON 3</div>
        <div className="font-body text-[9px] text-muted-foreground leading-snug mt-0.5">Unlock Premium Rewards</div>
      </div>
      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="relative flex-shrink-0 text-lg text-muted-foreground/40">›</motion.span>
    </motion.button>
  );
}

/* ── Main component ─────────────────────────────────────── */

// Mode title color overrides for Lilita One
const MODE_COLORS: Record<string, string> = {
  ar: "hsl(190 90% 55%)",
  tap: "hsl(142 71% 55%)",
  daily: "hsl(35 90% 55%)",
  multiplayer: "hsl(0 84% 60%)",
  tournament: "hsl(280 70% 60%)",
  ipl: "hsl(19 100% 60%)",
  royale: "hsl(0 70% 55%)",
  auction: "hsl(43 90% 55%)",
  worldcup: "hsl(217 80% 60%)",
  ashes: "hsl(35 70% 55%)",
  knockout: "hsl(0 70% 55%)",
  practice: "hsl(142 71% 50%)",
};

export default function GameModeCards({ onSelect }: GameModeCardsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 px-1 mb-2">
        <div className="w-1 h-4 rounded-sm" style={{ background: "linear-gradient(180deg, hsl(43 90% 55%), hsl(35 60% 35%))" }} />
        <span className="font-display text-[10px] tracking-[0.2em] text-foreground">GAME MODES</span>
      </div>

      <div className="space-y-2.5">
        {MODES.map((mode, index) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index, duration: 0.35, ease: "easeOut" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { SFX.tap(); Haptics.light(); onSelect(mode.id); }}
            className="relative w-full flex items-center gap-3 px-3 py-2.5 text-left"
            style={{
              borderRadius: 14,
              background: "linear-gradient(135deg, hsl(222 30% 10%) 0%, hsl(222 25% 7%) 100%)",
              borderLeft: `3px solid ${mode.accentHsl}`,
              borderBottom: "4px solid hsl(222 20% 5%)",
            }}
          >
            <ChromeBracket side="left" />
            <ChromeBracket side="right" />
            <div className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none" style={{ borderRadius: "14px 0 0 14px", background: `linear-gradient(90deg, ${mode.glowHsl} 0%, transparent 100%)` }} />
            <div className="relative flex-shrink-0"><AnimatedIcon mode={mode} /></div>
            <div className="relative flex-1 min-w-0">
              <div className="font-display text-[12px] tracking-wider leading-tight" style={{ color: MODE_COLORS[mode.id] || mode.accentHsl }}>{mode.title}</div>
              <div className="text-[8px] uppercase tracking-widest mt-0.5" style={{ color: `${MODE_COLORS[mode.id] || mode.accentHsl}88` }}>{mode.subtitle}</div>
              <div className="font-body text-[9px] text-muted-foreground leading-snug mt-0.5 truncate">{mode.description}</div>
            </div>
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="relative flex-shrink-0 text-lg text-muted-foreground/40">›</motion.span>
          </motion.button>
        ))}

        {/* Battle Pass card */}
        <BattlePassCard onSelect={() => onSelect("battlepass")} />
      </div>
    </div>
  );
}
