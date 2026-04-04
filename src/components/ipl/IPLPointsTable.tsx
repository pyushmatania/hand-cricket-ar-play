import { IPL_TEAMS } from "./IPLData";

interface Props {
  standings: [string, { played: number; won: number; lost: number; nrr: number; pts: number }][];
  userTeam: string;
}

export default function IPLPointsTable({ standings, userTeam }: Props) {
  return (
    <div className="glass-premium rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-border/30">
        <span className="font-display text-[9px] tracking-[0.15em] text-muted-foreground font-bold">POINTS TABLE</span>
      </div>
      <table className="w-full text-[10px]">
        <thead>
          <tr className="text-muted-foreground font-display">
            <th className="text-left px-3 py-1.5">#</th>
            <th className="text-left py-1.5">TEAM</th>
            <th className="text-center py-1.5">P</th>
            <th className="text-center py-1.5">W</th>
            <th className="text-center py-1.5">L</th>
            <th className="text-center py-1.5">NRR</th>
            <th className="text-center py-1.5 pr-3">PTS</th>
          </tr>
        </thead>
        <tbody>
          {standings.map(([teamId, stats], i) => {
            const team = IPL_TEAMS.find(t => t.id === teamId)!;
            const isUser = teamId === userTeam;
            const qualifies = i < 4;
            return (
              <tr key={teamId} className={`border-t border-border/10 ${isUser ? "bg-secondary/10" : ""} ${qualifies ? "" : "opacity-50"}`}>
                <td className="px-3 py-1.5 font-display font-bold text-foreground">{i + 1}</td>
                <td className="py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{team.emoji}</span>
                    <span className={`font-display font-bold ${isUser ? "text-secondary" : "text-foreground"}`}>{team.shortName}</span>
                  </div>
                </td>
                <td className="text-center py-1.5 text-muted-foreground">{stats.played}</td>
                <td className="text-center py-1.5 text-neon-green font-bold">{stats.won}</td>
                <td className="text-center py-1.5 text-out-red font-bold">{stats.lost}</td>
                <td className="text-center py-1.5 text-muted-foreground">{stats.nrr >= 0 ? "+" : ""}{stats.nrr.toFixed(2)}</td>
                <td className="text-center py-1.5 pr-3 font-display font-black text-foreground">{stats.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
