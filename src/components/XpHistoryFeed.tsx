import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface XpEntry {
  id: string;
  amount: number;
  source: string;
  created_at: string;
}

const SOURCE_META: Record<string, { icon: string; label: string; color: string }> = {
  match_win: { icon: "🏆", label: "Match Win", color: "text-game-green" },
  match_loss: { icon: "💔", label: "Match Loss", color: "text-game-red" },
  match_draw: { icon: "🤝", label: "Draw", color: "text-game-gold" },
  streak_bonus: { icon: "🔥", label: "Streak Bonus", color: "text-secondary" },
  challenge_complete: { icon: "🎯", label: "Challenge Complete", color: "text-primary" },
  rank_up: { icon: "⬆️", label: "Rank Up", color: "text-accent" },
};

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function XpHistoryFeed() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<XpEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("xp_history" as any)
      .select("id, amount, source, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data) setEntries(data as unknown as XpEntry[]);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="text-center py-8">
        <span className="text-3xl block mb-2">📊</span>
        <p className="text-[10px] text-muted-foreground font-display">No XP history yet. Play a match!</p>
      </div>
    );
  }

  // Group by day
  const grouped: Record<string, XpEntry[]> = {};
  entries.forEach((e) => {
    const day = new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(e);
  });

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([day, items]) => {
        const dayTotal = items.reduce((s, e) => s + e.amount, 0);
        return (
          <div key={day}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] text-muted-foreground font-display tracking-widest font-bold">{day.toUpperCase()}</span>
              <span className="text-[8px] font-display font-bold text-primary">+{dayTotal} XP</span>
            </div>
            <div className="space-y-1">
              <AnimatePresence>
                {items.map((entry, i) => {
                  const meta = SOURCE_META[entry.source] || { icon: "⚡", label: entry.source, color: "text-foreground" };
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg bg-[hsl(222_40%_10%/0.6)] border border-muted/10"
                    >
                      <span className="text-sm">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-display font-bold text-foreground block">{meta.label}</span>
                        <span className="text-[7px] text-muted-foreground">{getTimeAgo(entry.created_at)}</span>
                      </div>
                      <span className={`font-display text-xs font-black ${meta.color}`}>+{entry.amount}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
