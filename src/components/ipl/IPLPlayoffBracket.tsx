import { motion } from "framer-motion";
import { IPL_TEAMS, type PlayoffMatch } from "./IPLData";

interface Props {
  playoffs: PlayoffMatch[];
  userTeam: string;
  currentIdx: number;
}

export default function IPLPlayoffBracket({ playoffs, userTeam, currentIdx }: Props) {
  const renderMatch = (match: PlayoffMatch, idx: number) => {
    const teamA = match.teamA ? IPL_TEAMS.find(t => t.id === match.teamA) : null;
    const teamB = match.teamB ? IPL_TEAMS.find(t => t.id === match.teamB) : null;
    const isCurrent = idx === currentIdx && !match.result;
    const isDone = !!match.result;

    return (
      <motion.div
        key={match.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.1 }}
        className={`glass-premium rounded-xl p-2.5 border ${isCurrent ? "border-secondary/40 shadow-[0_0_12px_hsl(45_93%_58%/0.15)]" : "border-border/20"}`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-display text-[8px] tracking-wider text-muted-foreground font-bold">{match.label}</span>
          {isDone && <span className="text-[8px] text-neon-green font-display font-bold">✓ DONE</span>}
          {isCurrent && <span className="text-[8px] text-secondary font-display font-bold animate-pulse">LIVE</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{teamA?.emoji || "❓"}</span>
            <span className={`font-display text-[10px] font-bold ${match.result?.winner === match.teamA ? "text-secondary" : "text-foreground"}`}>
              {teamA?.shortName || "TBD"}
            </span>
          </div>
          {isDone ? (
            <span className="text-[9px] text-muted-foreground font-display">{match.result!.homeScore}-{match.result!.awayScore}</span>
          ) : (
            <span className="text-[9px] text-muted-foreground font-display">vs</span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`font-display text-[10px] font-bold ${match.result?.winner === match.teamB ? "text-secondary" : "text-foreground"}`}>
              {teamB?.shortName || "TBD"}
            </span>
            <span className="text-lg">{teamB?.emoji || "❓"}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-2">
      {playoffs.map((m, i) => renderMatch(m, i))}
    </div>
  );
}
