import { motion } from "framer-motion";
import { IPL_TEAMS } from "./IPLData";

interface Props { onPick: (teamId: string) => void; }

export default function IPLTeamPicker({ onPick }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mt-2">
      <div className="text-center">
        <span className="text-4xl block mb-1">🏏</span>
        <h2 className="font-display text-lg font-black text-foreground tracking-wider">PICK YOUR TEAM</h2>
        <p className="text-[10px] text-muted-foreground font-display">Choose a franchise to lead through the IPL season</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {IPL_TEAMS.map((team, i) => (
          <motion.button
            key={team.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPick(team.id)}
            className="glass-premium rounded-xl p-3 flex items-center gap-2.5 border border-transparent hover:border-secondary/30 transition-all"
          >
            <span className="text-2xl">{team.emoji}</span>
            <div className="text-left flex-1 min-w-0">
              <span className="font-display text-[10px] font-bold text-foreground tracking-wider block truncate">{team.shortName}</span>
              <span className="text-[8px] text-muted-foreground block truncate">{team.name}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
