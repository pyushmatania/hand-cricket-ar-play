import { motion } from "framer-motion";
import { DBPlayer, statToDiamonds, overallRating, roleLabel } from "@/hooks/usePlayers";
import { Zap } from "lucide-react";

/* ── Player image map for Mythic/Legendary cards ── */
const PLAYER_IMAGES: Record<string, string> = {};

import dhoniImg from "@/assets/players/dhoni.jpg";
import kohliImg from "@/assets/players/kohli.jpg";
import rohitImg from "@/assets/players/rohit.jpg";
import bumrahImg from "@/assets/players/bumrah.jpg";
import russellImg from "@/assets/players/russell.jpg";
import rashidImg from "@/assets/players/rashid.jpg";
import hardikImg from "@/assets/players/hardik.jpg";
import skyImg from "@/assets/players/sky.jpg";
import klrahulImg from "@/assets/players/klrahul.jpg";
import jadejaImg from "@/assets/players/jadeja.jpg";

Object.assign(PLAYER_IMAGES, {
  dhoni: dhoniImg, kohli: kohliImg, rohit: rohitImg, bumrah: bumrahImg, russell: russellImg,
  rashid: rashidImg, hardik: hardikImg, sky: skyImg, klrahul: klrahulImg, jadeja: jadejaImg,
});

/* ── Rarity frame styles ── */
const RARITY_FRAME: Record<string, { border: string; glow: string; bg: string; diamond: string }> = {
  common: {
    border: "hsl(220 10% 35%)",
    glow: "none",
    bg: "linear-gradient(180deg, hsl(222 30% 14%), hsl(222 35% 8%))",
    diamond: "hsl(220 10% 50%)",
  },
  rare: {
    border: "hsl(210 60% 45%)",
    glow: "0 0 12px hsl(210 70% 50% / 0.3)",
    bg: "linear-gradient(180deg, hsl(215 30% 14%), hsl(215 35% 8%))",
    diamond: "hsl(210 70% 55%)",
  },
  epic: {
    border: "hsl(270 50% 50%)",
    glow: "0 0 16px hsl(270 60% 55% / 0.35)",
    bg: "linear-gradient(180deg, hsl(270 20% 14%), hsl(270 25% 8%))",
    diamond: "hsl(270 60% 60%)",
  },
  legendary: {
    border: "hsl(35 80% 50%)",
    glow: "0 0 20px hsl(35 90% 50% / 0.4)",
    bg: "linear-gradient(180deg, hsl(35 30% 14%), hsl(35 35% 8%))",
    diamond: "hsl(35 80% 55%)",
  },
  mythic: {
    border: "hsl(280 80% 60%)",
    glow: "0 0 24px hsl(280 90% 65% / 0.5), 0 0 40px hsl(180 80% 50% / 0.2)",
    bg: "linear-gradient(180deg, hsl(280 25% 12%), hsl(220 30% 8%))",
    diamond: "hsl(280 80% 65%)",
  },
};

function DiamondDots({ filled, total = 5, color }: { filled: number; total?: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="text-[8px] leading-none" style={{ color: i < filled ? color : "hsl(220 10% 25%)" }}>◆</span>
      ))}
    </div>
  );
}

interface CollectionPlayerCardProps {
  player: DBPlayer;
  size?: "sm" | "md";
  onTap?: (player: DBPlayer) => void;
  delay?: number;
}

export default function CollectionPlayerCard({ player, size = "sm", onTap, delay = 0 }: CollectionPlayerCardProps) {
  const rarity = player.rarity || "common";
  const frame = RARITY_FRAME[rarity];
  const rating = overallRating(player);
  const role = roleLabel(player.role);

  const stats = [
    { label: "PWR", value: player.power },
    { label: "TEC", value: player.technique },
    { label: "PAC", value: player.pace_spin },
    { label: "ACC", value: player.accuracy },
    { label: "AGI", value: player.agility },
    { label: "CLU", value: player.clutch },
  ];

  const isSm = size === "sm";
  const cardW = isSm ? "w-[104px]" : "w-40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileTap={onTap ? { scale: 0.95 } : undefined}
      onClick={() => onTap?.(player)}
      transition={{ delay, duration: 0.35, type: "spring", stiffness: 120 }}
      className={`relative ${cardW} ${onTap ? "cursor-pointer" : ""}`}
    >
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          background: frame.bg,
          border: `2px solid ${frame.border}`,
          boxShadow: `0 4px 8px rgba(0,0,0,0.5), ${frame.glow}`,
        }}
      >
        {/* Rating badge */}
        <div className="absolute top-1 left-1 z-20">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{
              background: `linear-gradient(180deg, ${frame.border}, hsl(222 30% 10%))`,
              border: `1.5px solid ${frame.diamond}`,
            }}
          >
            <span className="font-game-display text-[10px] font-black" style={{ color: frame.diamond }}>{rating}</span>
          </div>
        </div>

        {/* Role badge */}
        <div className="absolute top-1 right-1 z-20">
          <div className="px-1.5 py-0.5 rounded text-[7px] font-game-display font-bold"
            style={{ background: `${frame.border}88`, color: "white" }}
          >
            {role}
          </div>
        </div>

        {/* Player image or fallback */}
        <div className={`${isSm ? "h-20" : "h-32"} flex items-center justify-center relative overflow-hidden`}>
          {player.thumbnail_url && PLAYER_IMAGES[player.thumbnail_url] ? (
            <img
              src={PLAYER_IMAGES[player.thumbnail_url]}
              alt={player.name}
              className="w-full h-full object-cover object-top"
              loading="lazy"
              width={512}
              height={704}
            />
          ) : (
            <>
              <div className="absolute inset-0 opacity-5 flex items-center justify-center">
                <span className="font-game-display text-[48px] font-black">{player.short_name?.[0] || player.name[0]}</span>
              </div>
              <div className="text-4xl">
                {player.role === "bowler" ? "🏏" : player.role === "wk_batsman" ? "🧤" : "🏏"}
              </div>
            </>
          )}
        </div>

        {/* Name ribbon */}
        <div className="px-2 py-1 text-center" style={{ background: `${frame.border}44` }}>
          <p className="font-game-display text-[9px] font-black text-white truncate leading-tight"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
          >
            {(player.short_name || player.name).toUpperCase()}
          </p>
          <p className="text-[7px] text-muted-foreground font-game-body">{player.ipl_team} • {player.country}</p>
        </div>

        {/* Stats */}
        {!isSm && (
          <div className="px-2 pb-2 pt-1 space-y-0.5">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[7px] text-muted-foreground font-game-body w-8">{s.label}</span>
                <DiamondDots filled={statToDiamonds(s.value)} color={frame.diamond} />
                <span className="text-[7px] font-game-display text-foreground w-5 text-right">{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Special ability indicator */}
        {player.special_ability_name && isSm && (
          <div className="flex items-center justify-center pb-1.5 gap-0.5">
            <Zap className="w-2.5 h-2.5" style={{ color: frame.diamond }} />
            <span className="text-[6px] font-game-body truncate max-w-[70px]" style={{ color: frame.diamond }}>
              {player.special_ability_name}
            </span>
          </div>
        )}
      </div>

      {/* Mythic pulse */}
      {rarity === "mythic" && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ border: "2px solid hsl(280 80% 60% / 0.4)" }}
        />
      )}
    </motion.div>
  );
}
