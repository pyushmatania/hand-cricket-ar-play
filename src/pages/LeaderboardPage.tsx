import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";

const MOCK_LEADERS = [
  { rank: 1, name: "ProCricketer", score: 342, wins: 28, badge: "🥇" },
  { rank: 2, name: "SixMachine", score: 298, wins: 24, badge: "🥈" },
  { rank: 3, name: "BowlKing", score: 267, wins: 21, badge: "🥉" },
  { rank: 4, name: "HandMaster", score: 234, wins: 18, badge: "" },
  { rank: 5, name: "CricketFan99", score: 201, wins: 15, badge: "" },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-xl font-black text-foreground tracking-wider">
            LEADERBOARD
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Top players worldwide</p>
        </motion.div>

        {/* Tab selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-4"
        >
          {["ALL TIME", "WEEKLY", "DAILY"].map((tab, i) => (
            <button
              key={tab}
              className={`px-3 py-1.5 rounded-lg font-display text-[9px] font-bold tracking-wider transition-all ${
                i === 0
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-muted text-muted-foreground border border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Leaderboard list */}
        <div className="space-y-2">
          {MOCK_LEADERS.map((player, i) => (
            <motion.div
              key={player.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`glass-score p-3 flex items-center gap-3 ${
                player.rank <= 3 ? "border-primary/20" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm ${
                  player.rank === 1
                    ? "bg-gradient-to-br from-secondary to-secondary/60 text-secondary-foreground"
                    : player.rank === 2
                    ? "bg-gradient-to-br from-muted-foreground to-muted-foreground/60 text-foreground"
                    : player.rank === 3
                    ? "bg-gradient-to-br from-primary/60 to-primary/30 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {player.badge || `#${player.rank}`}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-display text-sm font-bold text-foreground block">
                  {player.name}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {player.wins} wins
                </span>
              </div>
              <div className="text-right">
                <span className="font-display text-lg font-black text-score-gold block leading-none">
                  {player.score}
                </span>
                <span className="text-[8px] text-muted-foreground font-display">PTS</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Your position */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass-premium p-4 text-center"
        >
          <p className="text-[10px] text-muted-foreground font-display">YOUR RANK</p>
          <p className="font-display text-2xl font-black text-muted-foreground mt-1">—</p>
          <p className="text-[9px] text-muted-foreground mt-1">Sign in to track your rank</p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
