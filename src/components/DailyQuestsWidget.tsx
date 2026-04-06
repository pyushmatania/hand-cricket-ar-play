import { motion } from "framer-motion";
import { useDailyQuests, useClaimDailyQuest } from "@/hooks/useDailyQuests";
import { Check, Gift } from "lucide-react";
import { toast } from "sonner";

export default function DailyQuestsWidget() {
  const { data: quests, isLoading } = useDailyQuests();
  const claimQuest = useClaimDailyQuest();

  if (isLoading || !quests) return null;

  const completedCount = quests.filter(q => q.progress?.completed).length;

  const handleClaim = async (q: typeof quests[0]) => {
    if (!q.progress?.completed) return;
    try {
      const result = await claimQuest.mutateAsync({ ...q.quest, progressId: q.progress.id });
      toast.success(`+${result.coins} 🪙 +${result.xp} XP`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">📋</span>
          <span className="font-display text-xs tracking-wider text-foreground">DAILY QUESTS</span>
        </div>
        <span className="text-[10px] font-display text-game-gold">{completedCount}/6</span>
      </div>

      <div className="space-y-1.5">
        {quests.map((q, i) => {
          const progress = q.progress;
          const isComplete = progress?.completed ?? false;
          const currentVal = progress?.current_value ?? 0;
          const pct = Math.min(100, (currentVal / q.quest.target_value) * 100);

          return (
            <motion.div
              key={q.quest.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2"
              style={{
                background: isComplete
                  ? "linear-gradient(135deg, hsl(142 30% 12%), hsl(142 25% 8%))"
                  : "linear-gradient(135deg, hsl(25 18% 14%), hsl(25 15% 10%))",
                border: isComplete
                  ? "1px solid hsl(142 40% 25%)"
                  : "1px solid hsl(25 15% 20%)",
              }}
            >
              {/* Icon */}
              <span className="text-lg shrink-0">{q.quest.icon}</span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] text-foreground truncate">{q.quest.title}</span>
                  <span className="text-[8px] font-body text-muted-foreground shrink-0 ml-1">
                    {currentVal}/{q.quest.target_value}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-border/20 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 + 0.2 }}
                    className="h-full rounded-full"
                    style={{ background: isComplete ? "hsl(142 60% 50%)" : "hsl(35 80% 50%)" }}
                  />
                </div>
              </div>

              {/* Reward / Claim */}
              <div className="shrink-0">
                {isComplete ? (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "hsl(142 50% 40%)" }}
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                ) : (
                  <div className="text-center">
                    <span className="text-[8px] font-display text-game-gold block">{q.quest.reward_coins}🪙</span>
                    <span className="text-[7px] font-body text-muted-foreground">{q.quest.reward_xp}xp</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
