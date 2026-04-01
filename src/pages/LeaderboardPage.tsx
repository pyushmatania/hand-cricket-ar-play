import { useState } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";

const MOCK_LEADERS = [
  { rank: 1, name: "ProCricketer", score: 342, wins: 28, badge: "🥇" },
  { rank: 2, name: "SixMachine", score: 298, wins: 24, badge: "🥈" },
  { rank: 3, name: "BowlKing", score: 267, wins: 21, badge: "🥉" },
  { rank: 4, name: "HandMaster", score: 234, wins: 18, badge: "" },
  { rank: 5, name: "CricketFan99", score: 201, wins: 15, badge: "" },
  { rank: 6, name: "SpinWizard", score: 189, wins: 13, badge: "" },
  { rank: 7, name: "SixerKing", score: 176, wins: 12, badge: "" },
  { rank: 8, name: "StrikeRate", score: 165, wins: 11, badge: "" },
];

const TABS = ["ALL TIME", "WEEKLY", "DAILY"];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-secondary" />
            <h1 className="font-display text-xl font-black text-foreground tracking-wider">
              LEADERBOARD
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-3">Top players worldwide</p>
        </motion.div>

        {/* Tab selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-5 bg-muted/30 p-1 rounded-xl"
        >
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`flex-1 px-3 py-2 rounded-lg font-display text-[9px] font-bold tracking-wider transition-all ${
                activeTab === i
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Top 3 podium */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-end justify-center gap-3 mb-5"
        >
          {[MOCK_LEADERS[1], MOCK_LEADERS[0], MOCK_LEADERS[2]].map((p, i) => {
            const heights = ["h-20", "h-28", "h-16"];
            const sizes = ["text-3xl", "text-4xl", "text-2xl"];
            return (
              <div key={p.rank} className="flex flex-col items-center">
                <span className={`${sizes[i]} mb-2`}>{p.badge}</span>
                <div className={`w-16 ${heights[i]} rounded-t-xl bg-gradient-to-t from-primary/10 to-primary/5 border border-primary/15 border-b-0 flex flex-col items-center justify-end pb-2`}>
                  <span className="font-display text-lg font-black text-score-gold leading-none">
                    {p.score}
                  </span>
                  <span className="text-[7px] text-muted-foreground font-display mt-0.5">PTS</span>
                </div>
                <div className="w-16 bg-muted/50 border border-glass border-t-0 rounded-b-lg py-1.5 text-center">
                  <span className="text-[8px] font-display font-bold text-foreground block truncate px-1">
                    {p.name}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Full list */}
        <div className="space-y-2">
          {MOCK_LEADERS.slice(3).map((player, i) => (
            <motion.div
              key={player.rank}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="glass-score p-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-display font-black text-xs text-muted-foreground">
                #{player.rank}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-display text-sm font-bold text-foreground block">
                  {player.name}
                </span>
                <span className="text-[9px] text-muted-foreground">{player.wins} wins</span>
              </div>
              <div className="text-right">
                <span className="font-display text-lg font-black text-score-gold block leading-none">
                  {player.score}
                </span>
                <span className="text-[7px] text-muted-foreground font-display">PTS</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Your position */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 glass-premium p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground font-display tracking-wider">YOUR RANK</p>
            <p className="font-display text-xl font-black text-muted-foreground">—</p>
          </div>
          <p className="text-[9px] text-muted-foreground">Sign in to track</p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
