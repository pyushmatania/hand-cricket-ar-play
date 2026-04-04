export interface IPLTeam {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  color: string;
  difficulty: number;
}

export const IPL_TEAMS: IPLTeam[] = [
  { id: "csk", name: "Chennai Super Kings", shortName: "CSK", emoji: "🦁", color: "hsl(45 100% 50%)", difficulty: 0.85 },
  { id: "mi", name: "Mumbai Indians", shortName: "MI", emoji: "🔵", color: "hsl(217 91% 50%)", difficulty: 0.9 },
  { id: "rcb", name: "Royal Challengers", shortName: "RCB", emoji: "🔴", color: "hsl(0 84% 50%)", difficulty: 0.8 },
  { id: "kkr", name: "Kolkata Knight Riders", shortName: "KKR", emoji: "💜", color: "hsl(270 60% 50%)", difficulty: 0.75 },
  { id: "dc", name: "Delhi Capitals", shortName: "DC", emoji: "🔷", color: "hsl(210 80% 55%)", difficulty: 0.7 },
  { id: "srh", name: "Sunrisers Hyderabad", shortName: "SRH", emoji: "🧡", color: "hsl(25 90% 55%)", difficulty: 0.72 },
  { id: "rr", name: "Rajasthan Royals", shortName: "RR", emoji: "🩷", color: "hsl(330 70% 55%)", difficulty: 0.68 },
  { id: "pbks", name: "Punjab Kings", shortName: "PBKS", emoji: "❤️", color: "hsl(0 70% 50%)", difficulty: 0.65 },
  { id: "gt", name: "Gujarat Titans", shortName: "GT", emoji: "🌊", color: "hsl(195 70% 45%)", difficulty: 0.78 },
  { id: "lsg", name: "Lucknow Super Giants", shortName: "LSG", emoji: "💙", color: "hsl(200 60% 50%)", difficulty: 0.7 },
];

export type MatchResult = { homeScore: number; awayScore: number; winner: string; played: boolean };

export interface GroupFixture {
  home: string;
  away: string;
  result: MatchResult | null;
}

export interface PlayoffMatch {
  id: "q1" | "elim" | "q2" | "final";
  label: string;
  teamA: string | null;
  teamB: string | null;
  result: MatchResult | null;
}

export interface IPLState {
  userTeam: string;
  group: string[]; // 5 team IDs in user's group
  fixtures: GroupFixture[];
  standings: Map<string, { played: number; won: number; lost: number; nrr: number; pts: number }>;
  phase: "pick" | "group" | "playoffs" | "champion" | "eliminated";
  currentFixtureIdx: number;
  playoffs: PlayoffMatch[];
  currentPlayoffIdx: number;
}

export function generateGroupFixtures(teams: string[]): GroupFixture[] {
  const fixtures: GroupFixture[] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      fixtures.push({ home: teams[i], away: teams[j], result: null });
    }
  }
  // Shuffle
  for (let i = fixtures.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fixtures[i], fixtures[j]] = [fixtures[j], fixtures[i]];
  }
  return fixtures;
}

export function calcStandings(teams: string[], fixtures: GroupFixture[]) {
  const s = new Map<string, { played: number; won: number; lost: number; nrr: number; pts: number }>();
  teams.forEach(t => s.set(t, { played: 0, won: 0, lost: 0, nrr: 0, pts: 0 }));
  fixtures.forEach(f => {
    if (!f.result) return;
    const h = s.get(f.home)!;
    const a = s.get(f.away)!;
    h.played++; a.played++;
    if (f.result.winner === f.home) { h.won++; h.pts += 2; a.lost++; }
    else { a.won++; a.pts += 2; h.lost++; }
    h.nrr += (f.result.homeScore - f.result.awayScore) * 0.01;
    a.nrr += (f.result.awayScore - f.result.homeScore) * 0.01;
  });
  return s;
}

export function sortedStandings(standings: Map<string, { played: number; won: number; lost: number; nrr: number; pts: number }>) {
  return [...standings.entries()].sort((a, b) => {
    if (b[1].pts !== a[1].pts) return b[1].pts - a[1].pts;
    return b[1].nrr - a[1].nrr;
  });
}

export function initPlayoffs(): PlayoffMatch[] {
  return [
    { id: "q1", label: "Qualifier 1", teamA: null, teamB: null, result: null },
    { id: "elim", label: "Eliminator", teamA: null, teamB: null, result: null },
    { id: "q2", label: "Qualifier 2", teamA: null, teamB: null, result: null },
    { id: "final", label: "🏆 FINAL", teamA: null, teamB: null, result: null },
  ];
}
