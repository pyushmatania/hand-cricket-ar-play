import { motion } from "framer-motion";
import PlayerAvatar from "./PlayerAvatar";

interface PlayerOfWeekData {
  display_name: string;
  user_id: string;
  avatar_url?: string | null;
  avatar_index?: number;
  weekWins: number;
  weekMatches: number;
  weekHighScore: number;
  weekWinRate: number;
  improvement: number; // win rate improvement vs previous week
}

interface Props {
  player: PlayerOfWeekData | null;
  loading?: boolean;
}

export default function PlayerOfTheWeek({ player, loading }: Props) {
  if (loading) {
    return (
      <div className="glass-premium rounded-2xl p-4 mb-4 border border-score-gold/20 animate-pulse">
        <div className="h-16 bg-muted/20 rounded-xl" />
      </div>
    );
  }

  if (!player || player.weekMatches < 3) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="glass-premium rounded-2xl p-4 mb-4 border border-score-gold/25 relative overflow-hidden shadow-[0_0_30px_hsl(45_93%_58%/0.1)]"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-score-gold/40 to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-score-gold/8 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-full" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-xl"
        >⭐</motion.span>
        <div>
          <span className="font-display text-[9px] font-bold text-score-gold tracking-[0.3em] block">PLAYER OF THE WEEK</span>
          <span className="text-[7px] text-muted-foreground font-display">Most improved this week</span>
        </div>
      </div>

      {/* Player info */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-score-gold/20 to-primary/10 blur-sm" />
          <div className="relative">
            <PlayerAvatar avatarUrl={player.avatar_url} avatarIndex={player.avatar_index ?? 0} size="md" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <span className="font-display text-sm font-black text-foreground tracking-wider block truncate">
            {player.display_name}
          </span>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex flex-col">
              <span className="text-[6px] text-muted-foreground font-display tracking-widest">WINS</span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="font-display text-lg font-black text-neon-green leading-none"
              >{player.weekWins}</motion.span>
            </div>
            <div className="flex flex-col">
              <span className="text-[6px] text-muted-foreground font-display tracking-widest">MATCHES</span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="font-display text-lg font-black text-foreground leading-none"
              >{player.weekMatches}</motion.span>
            </div>
            <div className="flex flex-col">
              <span className="text-[6px] text-muted-foreground font-display tracking-widest">WIN RATE</span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="font-display text-lg font-black text-primary leading-none"
              >{player.weekWinRate}%</motion.span>
            </div>
            <div className="flex flex-col">
              <span className="text-[6px] text-muted-foreground font-display tracking-widest">HIGH</span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="font-display text-lg font-black text-score-gold leading-none"
              >{player.weekHighScore}</motion.span>
            </div>
          </div>
        </div>

        {/* Improvement badge */}
        {player.improvement > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col items-center glass-card rounded-xl px-2.5 py-2 border border-neon-green/20"
          >
            <span className="text-[6px] text-muted-foreground font-display tracking-widest">IMPROVED</span>
            <span className="font-display text-sm font-black text-neon-green">↑{player.improvement}%</span>
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 relative z-10">
        <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${player.weekWinRate}%` }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-score-gold to-neon-green rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
