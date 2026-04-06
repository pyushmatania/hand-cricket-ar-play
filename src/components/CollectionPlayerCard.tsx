import { motion } from "framer-motion";
import { DBPlayer, statToDiamonds, overallRating, roleLabel } from "@/hooks/usePlayers";
import { Zap } from "lucide-react";
import { TEAM_STAR_ART, TEAM_BOWLER_ART } from "@/assets/players";

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
import abdImg from "@/assets/players/abd.jpg";
import warnerImg from "@/assets/players/warner.jpg";
import buttlerImg from "@/assets/players/buttler.jpg";
import chahalImg from "@/assets/players/chahal.jpg";
import pantImg from "@/assets/players/pant.jpg";

const PLAYER_IMAGES: Record<string, string> = {
  dhoni: dhoniImg, kohli: kohliImg, rohit: rohitImg, bumrah: bumrahImg, russell: russellImg,
  rashid: rashidImg, hardik: hardikImg, sky: skyImg, klrahul: klrahulImg, jadeja: jadejaImg,
  abd: abdImg, warner: warnerImg, buttler: buttlerImg, chahal: chahalImg, pant: pantImg,
};

/* ── V11 Wooden Kingdom Collection Row ── */
const RARITY_STYLE: Record<string, { border: string; glow: string; diamond: string; barColor: string }> = {
  common: { border: "#2E1A0E", glow: "none", diamond: "#6B7280", barColor: "#6B7280" },
  rare: { border: "#2563EB", glow: "0 0 10px rgba(37,99,235,0.2)", diamond: "#3B82F6", barColor: "#2563EB" },
  epic: { border: "#A855F7", glow: "0 0 14px rgba(168,85,247,0.25)", diamond: "#A855F7", barColor: "#A855F7" },
  legendary: { border: "#FFD700", glow: "0 0 18px rgba(255,215,0,0.3)", diamond: "#FFD700", barColor: "#FFD700" },
  mythic: { border: "#A855F7", glow: "0 0 24px rgba(168,85,247,0.4), 0 0 40px rgba(0,212,255,0.15)", diamond: "#A855F7", barColor: "#A855F7" },
};

interface CollectionPlayerCardProps {
  player: DBPlayer;
  size?: "sm" | "md";
  onTap?: (player: DBPlayer) => void;
  delay?: number;
  cardLevel?: number;
  cardCount?: number;
}

export default function CollectionPlayerCard({ player, size = "sm", onTap, delay = 0, cardLevel, cardCount }: CollectionPlayerCardProps) {
  const rarity = player.rarity || "common";
  const rs = RARITY_STYLE[rarity] || RARITY_STYLE.common;
  const rating = overallRating(player);
  const role = roleLabel(player.role);

  /* Horizontal row layout for collection */
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={onTap ? { scale: 0.97 } : undefined}
      onClick={() => onTap?.(player)}
      transition={{ delay, duration: 0.3, type: "spring", stiffness: 140 }}
      className={`relative rounded-xl overflow-hidden ${onTap ? "cursor-pointer" : ""}`}
      style={{
        background: "linear-gradient(90deg, #3E2410 0%, #2E1A0E 70%, transparent 100%)",
        border: `2px solid ${rs.border}`,
        boxShadow: `0 4px 8px rgba(0,0,0,0.5), ${rs.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Rarity glow bar - left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{
        background: rs.barColor,
        boxShadow: `0 0 6px ${rs.barColor}66`,
      }} />

      <div className="flex items-center gap-3 px-3 py-2.5 pl-4">
        {/* Rating badge */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${rs.border}, #2E1A0E)`,
            border: `2px solid ${rs.diamond}`,
            boxShadow: `0 2px 0 #1A0E06`,
          }}
        >
          <span className="font-display text-xs font-black" style={{ color: rs.diamond }}>{rating}</span>
        </div>

        {/* Player image (small circular thumbnail) */}
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2" style={{ borderColor: `${rs.border}88` }}>
          {player.thumbnail_url && PLAYER_IMAGES[player.thumbnail_url] ? (
            <img src={PLAYER_IMAGES[player.thumbnail_url]} alt={player.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "#1A0E06" }}>
              <span className="text-lg">{player.role === "bowler" ? "🏏" : "🧤"}</span>
            </div>
          )}
        </div>

        {/* Name + role */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-[11px] font-black text-white truncate leading-tight"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)", letterSpacing: "1px" }}
          >
            {(player.short_name || player.name).toUpperCase()}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[8px] font-display tracking-wider" style={{ color: rs.diamond }}>{role}</span>
            {player.ipl_team && (
              <span className="text-[7px] text-[#94A3B8]">{player.ipl_team}</span>
            )}
          </div>
          {/* Card level indicator */}
          {cardLevel !== undefined && cardLevel > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[7px] font-display" style={{ color: "#FFD700" }}>LVL {cardLevel}</span>
              {cardCount !== undefined && (
                <span className="text-[7px] text-[#94A3B8]">• {cardCount} cards</span>
              )}
            </div>
          )}
        </div>

        {/* Mini stat diamonds (top 2 stats) */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-[#94A3B8] w-4">PWR</span>
            <div className="flex gap-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-[6px]" style={{ color: i < statToDiamonds(player.power) ? rs.diamond : "rgba(100,100,100,0.25)" }}>◆</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-[#94A3B8] w-4">TEC</span>
            <div className="flex gap-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-[6px]" style={{ color: i < statToDiamonds(player.technique) ? rs.diamond : "rgba(100,100,100,0.25)" }}>◆</span>
              ))}
            </div>
          </div>
        </div>

        {/* Special ability indicator */}
        {player.special_ability_name && (
          <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: rs.diamond }} />
        )}
      </div>

      {/* Legendary/Mythic shimmer */}
      {(rarity === "legendary" || rarity === "mythic") && (
        <motion.div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 20 }}>
          <motion.div
            animate={{ x: ["-120%", "120%"] }}
            transition={{ duration: rarity === "mythic" ? 2 : 3, repeat: Infinity, repeatDelay: rarity === "mythic" ? 1 : 2, ease: "easeInOut" }}
            className="absolute inset-0 w-[50%]"
            style={{
              background: rarity === "mythic"
                ? "linear-gradient(105deg, transparent 30%, rgba(168,85,247,0.2) 45%, rgba(0,212,255,0.25) 50%, rgba(168,85,247,0.2) 55%, transparent 70%)"
                : "linear-gradient(105deg, transparent 30%, rgba(255,215,0,0.15) 45%, rgba(255,255,200,0.3) 50%, rgba(255,215,0,0.15) 55%, transparent 70%)",
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
