import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import TopStatusBar from "@/components/TopStatusBar";

interface LeaderEntry {
  display_name: string;
  wins: number;
  high_score: number;
  total_matches: number;
  user_id: string;
}

const TABS = [
  { label: "MOST WINS", icon: "🏆" },
  { label: "HIGH SCORE", icon: "⭐" },
  { label: "MATCHES", icon: "🏏" },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    const orderCol = activeTab === 1 ? "high_score" : activeTab === 2 ? "total_matches" : "wins";
    const { data } = await supabase
      .from("profiles")
      .select("display_name, wins, high_score, total_matches, user_id")
      .gt("total_matches", 0)
      .order(orderCol, { ascending: false })
      .limit(20);

    if (data) {
      setLeaders(data);
      if (user) {
        const idx = data.findIndex((p) => p.user_id === user.id);
        setMyRank(idx >= 0 ? idx + 1 : null);
      }
    }
  };

  const getBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  const getScore = (entry: LeaderEntry) => {
    return activeTab === 1 ? entry.high_score : activeTab === 2 ? entry.total_matches : entry.wins;
  };

  const getScoreLabel = () => activeTab === 1 ? "RUNS" : activeTab === 2 ? "PLAYED" : "WINS";

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <div className="absolute inset-0 stadium-gradient pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, hsl(45 93% 58% / 0.05) 0%, transparent 70%)" }}
      />

      <TopStatusBar />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-secondary to-secondary/40" />
            <h1 className="font-display text-xl font-black text-foreground tracking-wider">LEADERBOARD</h1>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 ml-3 font-display tracking-wider">Top players worldwide</p>
        </motion.div>

        {/* Tab selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 mb-4 glass-card rounded-xl p-1"
        >
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-2 rounded-lg font-display text-[8px] font-bold tracking-widest transition-all flex items-center justify-center gap-1 ${
                activeTab === i
                  ? "bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary border border-secondary/20"
                  : "text-muted-foreground"
              }`}
            >
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {leaders.length === 0 ? (
              <div className="glass-premium rounded-2xl p-8 text-center">
                <span className="text-4xl block mb-3">🏟️</span>
                <p className="font-display text-sm font-bold text-foreground">No players yet</p>
                <p className="text-[10px] text-muted-foreground mt-1">Be the first to play!</p>
              </div>
            ) : (
              <>
                {/* Top 3 podium */}
                {top3.length >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-end justify-center gap-3 mb-5"
                  >
                    {[top3[1], top3[0], top3[2]].map((p, i) => {
                      const heights = ["h-24", "h-32", "h-20"];
                      const sizes = ["text-3xl", "text-4xl", "text-2xl"];
                      const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
                      const glows = [
                        "shadow-[0_0_15px_hsl(192_91%_70%/0.15)]",
                        "shadow-[0_0_25px_hsl(45_93%_58%/0.2)]",
                        "shadow-[0_0_10px_hsl(30_70%_55%/0.1)]",
                      ];
                      return (
                        <div key={p.user_id} className="flex flex-col items-center">
                          <span className={`${sizes[i]} mb-2`}>{getBadge(rank)}</span>
                          <div className={`w-18 ${heights[i]} rounded-t-2xl glass-premium border border-primary/10 flex flex-col items-center justify-end pb-3 px-2 ${glows[i]}`}>
                            <span className="font-display text-xl font-black text-secondary leading-none" style={{ textShadow: "0 0 15px hsl(45 93% 58% / 0.3)" }}>
                              {getScore(p)}
                            </span>
                            <span className="text-[6px] text-muted-foreground font-display tracking-widest mt-0.5">
                              {getScoreLabel()}
                            </span>
                          </div>
                          <div className="w-18 glass-card border-t-0 rounded-b-xl py-2 text-center">
                            <span className="text-[7px] font-display font-bold text-foreground block truncate px-1">
                              {p.display_name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {/* Full list */}
                <div className="space-y-2">
                  {rest.map((player, i) => {
                    const isMe = user && player.user_id === user.id;
                    return (
                      <motion.div
                        key={player.user_id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.04 }}
                        className={`glass-premium rounded-xl p-3 flex items-center gap-3 ${
                          isMe ? "border border-primary/25 shadow-[0_0_15px_hsl(217_91%_60%/0.1)]" : ""
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-xs ${
                          isMe ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"
                        }`}>
                          #{i + 4}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`font-display text-[11px] font-bold block ${isMe ? "text-primary" : "text-foreground"}`}>
                            {player.display_name}
                            {isMe && <span className="text-[7px] text-primary/60 ml-1">(YOU)</span>}
                          </span>
                          <span className="text-[8px] text-muted-foreground font-display">
                            {player.total_matches} matches
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-display text-lg font-black text-secondary block leading-none">
                            {getScore(player)}
                          </span>
                          <span className="text-[6px] text-muted-foreground font-display tracking-widest">
                            {getScoreLabel()}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Your position */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 glass-premium rounded-2xl p-4 flex items-center gap-3 border border-primary/10"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 flex items-center justify-center">
            <span className="text-lg">{user ? "🏏" : "👤"}</span>
          </div>
          <div className="flex-1">
            <p className="text-[9px] text-muted-foreground font-display tracking-[0.2em]">YOUR RANK</p>
            <p className="font-display text-2xl font-black text-foreground" style={{ textShadow: myRank ? "0 0 15px hsl(217 91% 60% / 0.2)" : "none" }}>
              {myRank ? `#${myRank}` : "—"}
            </p>
          </div>
          {!user && (
            <p className="text-[8px] text-muted-foreground font-display tracking-wider">Sign in to track</p>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
