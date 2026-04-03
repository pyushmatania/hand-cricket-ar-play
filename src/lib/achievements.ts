/* ─── Shared Achievements Definition ─── */

export type AchievementTier = "bronze" | "silver" | "gold" | "legendary";

export interface Achievement {
  icon: string;
  title: string;
  desc: string;
  key: string;
  tier: AchievementTier;
  category: string;
  check: (p: any, stats?: any) => boolean;
  progress?: (p: any, stats?: any) => { current: number; target: number };
}

export const TIER_STYLES: Record<AchievementTier, { bg: string; border: string; glow: string; label: string }> = {
  bronze:    { bg: "from-[hsl(25,60%,40%)]/20 to-transparent",   border: "border-[hsl(25,60%,40%)]/30",  glow: "",                                             label: "BRONZE"    },
  silver:    { bg: "from-[hsl(210,10%,65%)]/20 to-transparent",  border: "border-[hsl(210,10%,65%)]/30", glow: "",                                             label: "SILVER"    },
  gold:      { bg: "from-score-gold/20 to-transparent",          border: "border-score-gold/30",          glow: "shadow-[0_0_12px_hsl(45_93%_58%/0.15)]",       label: "GOLD"      },
  legendary: { bg: "from-primary/20 to-accent/10",               border: "border-primary/40",             glow: "shadow-[0_0_20px_hsl(217_91%_60%/0.2)]",       label: "LEGENDARY" },
};

export const ACHIEVEMENTS: Achievement[] = [
  // ─── Milestones ───
  { icon: "🏏", title: "First Steps",   desc: "Play your first match",   key: "first_match",  tier: "bronze",    category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 1,   progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 1), target: 1 }) },
  { icon: "🏆", title: "First Blood",   desc: "Win your first match",    key: "first_win",    tier: "bronze",    category: "Milestones", check: (p) => (p?.wins ?? 0) >= 1,            progress: (p) => ({ current: Math.min(p?.wins ?? 0, 1), target: 1 }) },
  { icon: "🎮", title: "Regular",       desc: "Play 10 matches",         key: "ten_matches",  tier: "bronze",    category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 10,  progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 10), target: 10 }) },
  { icon: "⚡", title: "Veteran",       desc: "Play 50 matches",         key: "veteran",      tier: "silver",    category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 50,  progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 50), target: 50 }) },
  { icon: "👑", title: "Legend",        desc: "Play 100 matches",        key: "legend",       tier: "gold",      category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 100, progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 100), target: 100 }) },
  { icon: "🌟", title: "Immortal",      desc: "Play 500 matches",        key: "immortal",     tier: "legendary", category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 500, progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 500), target: 500 }) },

  // ─── Winning ───
  { icon: "🎯", title: "Sharpshooter",  desc: "Win 10 matches",          key: "ten_wins",     tier: "bronze",    category: "Winning", check: (p) => (p?.wins ?? 0) >= 10,  progress: (p) => ({ current: Math.min(p?.wins ?? 0, 10), target: 10 }) },
  { icon: "💪", title: "Dominator",     desc: "Win 25 matches",          key: "25_wins",      tier: "silver",    category: "Winning", check: (p) => (p?.wins ?? 0) >= 25,  progress: (p) => ({ current: Math.min(p?.wins ?? 0, 25), target: 25 }) },
  { icon: "🦁", title: "Champion",      desc: "Win 50 matches",          key: "50_wins",      tier: "gold",      category: "Winning", check: (p) => (p?.wins ?? 0) >= 50,  progress: (p) => ({ current: Math.min(p?.wins ?? 0, 50), target: 50 }) },
  { icon: "🐉", title: "Unstoppable",   desc: "Win 100 matches",         key: "100_wins",     tier: "legendary", category: "Winning", check: (p) => (p?.wins ?? 0) >= 100, progress: (p) => ({ current: Math.min(p?.wins ?? 0, 100), target: 100 }) },

  // ─── Streaks ───
  { icon: "🔥", title: "On Fire",       desc: "Win 3 in a row",          key: "streak_3",     tier: "bronze",    category: "Streaks", check: (p) => (p?.best_streak ?? 0) >= 3,  progress: (p) => ({ current: Math.min(p?.best_streak ?? 0, 3), target: 3 }) },
  { icon: "💥", title: "Rampage",       desc: "Win 5 in a row",          key: "streak_5",     tier: "silver",    category: "Streaks", check: (p) => (p?.best_streak ?? 0) >= 5,  progress: (p) => ({ current: Math.min(p?.best_streak ?? 0, 5), target: 5 }) },
  { icon: "☄️", title: "Supernova",     desc: "Win 10 in a row",         key: "streak_10",    tier: "gold",      category: "Streaks", check: (p) => (p?.best_streak ?? 0) >= 10, progress: (p) => ({ current: Math.min(p?.best_streak ?? 0, 10), target: 10 }) },
  { icon: "🌪️", title: "Godlike",       desc: "Win 20 in a row",         key: "streak_20",    tier: "legendary", category: "Streaks", check: (p) => (p?.best_streak ?? 0) >= 20, progress: (p) => ({ current: Math.min(p?.best_streak ?? 0, 20), target: 20 }) },

  // ─── Scoring ───
  { icon: "5️⃣", title: "Half Century",  desc: "Score 50+ in a match",    key: "fifty",          tier: "bronze",    category: "Scoring", check: (p) => (p?.high_score ?? 0) >= 50,  progress: (p) => ({ current: Math.min(p?.high_score ?? 0, 50), target: 50 }) },
  { icon: "💯", title: "Centurion",     desc: "Score 100+ in a match",   key: "century",        tier: "silver",    category: "Scoring", check: (p) => (p?.high_score ?? 0) >= 100, progress: (p) => ({ current: Math.min(p?.high_score ?? 0, 100), target: 100 }) },
  { icon: "🔱", title: "Double Century", desc: "Score 200+ in a match",  key: "double_century", tier: "gold",      category: "Scoring", check: (p) => (p?.high_score ?? 0) >= 200, progress: (p) => ({ current: Math.min(p?.high_score ?? 0, 200), target: 200 }) },
  { icon: "🏰", title: "Triple Threat", desc: "Score 300+ in a match",   key: "triple_century", tier: "legendary", category: "Scoring", check: (p) => (p?.high_score ?? 0) >= 300, progress: (p) => ({ current: Math.min(p?.high_score ?? 0, 300), target: 300 }) },

  // ─── Batting ───
  { icon: "6️⃣", title: "Six Machine",   desc: "Hit 50 total sixes",      key: "50_sixes",       tier: "silver", category: "Batting", check: (_p, s) => (s?.totalSixes ?? 0) >= 50,    progress: (_p: any, s: any) => ({ current: Math.min(s?.totalSixes ?? 0, 50), target: 50 }) },
  { icon: "4️⃣", title: "Boundary King", desc: "Hit 100 total fours",     key: "100_fours",      tier: "silver", category: "Batting", check: (_p, s) => (s?.totalFours ?? 0) >= 100,   progress: (_p: any, s: any) => ({ current: Math.min(s?.totalFours ?? 0, 100), target: 100 }) },
  { icon: "💎", title: "Boundary Master", desc: "60%+ boundary rate",     key: "boundary_master", tier: "gold",  category: "Batting", check: (_p, s) => (s?.boundaryPct ?? 0) >= 60,   progress: (_p: any, s: any) => ({ current: Math.min(s?.boundaryPct ?? 0, 60), target: 60 }) },

  // ─── Resilience ───
  { icon: "🪨", title: "Iron Will",      desc: "Win after 5+ losses",               key: "iron_will", tier: "silver",    category: "Resilience", check: (p) => (p?.losses ?? 0) >= 5 && (p?.wins ?? 0) >= 1 },
  { icon: "🐢", title: "The Wall",       desc: "0 abandons in 20+ matches",         key: "the_wall",  tier: "gold",      category: "Resilience", check: (p) => (p?.total_matches ?? 0) >= 20 && (p?.abandons ?? 1) === 0, progress: (p) => ({ current: (p?.abandons ?? 1) === 0 ? Math.min(p?.total_matches ?? 0, 20) : 0, target: 20 }) },
  { icon: "🦅", title: "Comeback King",  desc: "50%+ win rate with 50+ matches",    key: "comeback",  tier: "legendary", category: "Resilience", check: (p) => (p?.total_matches ?? 0) >= 50 && ((p?.wins ?? 0) / (p?.total_matches || 1)) >= 0.5, progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 50), target: 50 }) },
];

/**
 * Given old profile stats and new profile stats, return newly unlocked achievements.
 * For batting-stat achievements, pass battingStats with totalSixes, totalFours, boundaryPct.
 */
export function detectNewAchievements(
  oldProfile: any,
  newProfile: any,
  oldBattingStats?: any,
  newBattingStats?: any
): Achievement[] {
  return ACHIEVEMENTS.filter(a => {
    const wasUnlocked = a.check(oldProfile, oldBattingStats);
    const isNowUnlocked = a.check(newProfile, newBattingStats);
    return !wasUnlocked && isNowUnlocked;
  });
}
