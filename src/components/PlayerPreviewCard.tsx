import { motion, AnimatePresence } from "framer-motion";
import PlayerAvatar from "./PlayerAvatar";
import { getRankTier, calculateRankPoints } from "@/lib/rankTiers";

interface PlayerPreviewProps {
  player: {
    user_id: string;
    display_name: string;
    wins: number;
    losses: number;
    draws?: number;
    total_matches: number;
    high_score: number;
    best_streak: number;
    current_streak?: number;
    avatar_url?: string | null;
    avatar_index?: number;
    xp?: number;
    coins?: number;
    rank_tier?: string;
  } | null;
  onClose: () => void;
  onViewFull: () => void;
  onChallenge?: () => void;
}

export default function PlayerPreviewCard({ player, onClose, onViewFull, onChallenge }: PlayerPreviewProps) {
  if (!player) return null;

  const winRate = player.total_matches > 0 ? Math.round((player.wins / player.total_matches) * 100) : 0;
  const tier = getRankTier(player);
  const rp = calculateRankPoints(player);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-sm glass-premium rounded-3xl border border-primary/20 shadow-[0_0_40px_hsl(217_91%_60%/0.15)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Player header */}
          <div className="p-4 pb-3 flex items-center gap-3">
            <PlayerAvatar avatarUrl={player.avatar_url} avatarIndex={player.avatar_index ?? 0} size="md" />
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base font-black text-foreground tracking-wider truncate">{player.display_name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[8px] font-display font-bold ${tier.color}`}>{tier.emoji} {tier.name}</span>
                <span className="text-[7px] text-muted-foreground font-display">• {rp} RP</span>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
              className="w-8 h-8 rounded-xl glass-card flex items-center justify-center text-muted-foreground text-sm">✕</motion.button>
          </div>

          {/* Quick stats */}
          <div className="px-4 pb-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "WINS", value: player.wins, color: "text-neon-green", emoji: "🏆" },
                { label: "LOSSES", value: player.losses, color: "text-out-red", emoji: "💔" },
                { label: "WIN%", value: `${winRate}%`, color: "text-primary", emoji: "📊" },
                { label: "HIGH", value: player.high_score, color: "text-score-gold", emoji: "⭐" },
              ].map((s) => (
                <div key={s.label} className="glass-card rounded-xl p-2 text-center">
                  <span className="text-xs block">{s.emoji}</span>
                  <span className={`font-display text-sm font-black ${s.color} block leading-none mt-0.5`}>{s.value}</span>
                  <span className="text-[5px] font-display text-muted-foreground tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Streak & XP strip */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 glass-card rounded-lg py-1.5 px-2 text-center">
                <span className="text-[6px] text-muted-foreground font-display tracking-widest block">STREAK</span>
                <span className="font-display text-xs font-black text-secondary">🔥 {player.current_streak ?? 0}</span>
              </div>
              <div className="flex-1 glass-card rounded-lg py-1.5 px-2 text-center">
                <span className="text-[6px] text-muted-foreground font-display tracking-widest block">BEST</span>
                <span className="font-display text-xs font-black text-score-gold">{player.best_streak}</span>
              </div>
              <div className="flex-1 glass-card rounded-lg py-1.5 px-2 text-center">
                <span className="text-[6px] text-muted-foreground font-display tracking-widest block">XP</span>
                <span className="font-display text-xs font-black text-primary">✨ {player.xp ?? 0}</span>
              </div>
              <div className="flex-1 glass-card rounded-lg py-1.5 px-2 text-center">
                <span className="text-[6px] text-muted-foreground font-display tracking-widest block">COINS</span>
                <span className="font-display text-xs font-black text-secondary">🪙 {player.coins ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onViewFull}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20 text-primary font-display text-[10px] font-bold tracking-widest"
            >
              📊 VIEW FULL STATS
            </motion.button>
            {onChallenge && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onChallenge}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/20 text-secondary font-display text-[10px] font-bold tracking-widest"
              >
                ⚔️ CHALLENGE
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
