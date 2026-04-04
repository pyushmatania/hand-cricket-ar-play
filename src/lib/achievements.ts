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
  // ─── Milestones (8) ───
  { icon: "🏏", title: "First Steps",     desc: "Play your first match",    key: "first_match",    tier: "bronze",    category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 1,    progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 1), target: 1 }) },
  { icon: "🏆", title: "First Blood",     desc: "Win your first match",     key: "first_win",      tier: "bronze",    category: "Milestones", check: (p) => (p?.wins ?? 0) >= 1,             progress: (p) => ({ current: Math.min(p?.wins ?? 0, 1), target: 1 }) },
  { icon: "🎮", title: "Regular",         desc: "Play 10 matches",          key: "ten_matches",    tier: "bronze",    category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 10,   progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 10), target: 10 }) },
  { icon: "🎲", title: "Dedicated",       desc: "Play 25 matches",          key: "25_matches",     tier: "silver",    category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 25,   progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 25), target: 25 }) },
  { icon: "⚡", title: "Veteran",         desc: "Play 50 matches",          key: "veteran",        tier: "silver",    category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 50,   progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 50), target: 50 }) },
  { icon: "👑", title: "Legend",           desc: "Play 100 matches",         key: "legend",         tier: "gold",      category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 100,  progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 100), target: 100 }) },
  { icon: "💎", title: "Diamond Player",   desc: "Play 250 matches",         key: "250_matches",    tier: "gold",      category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 250,  progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 250), target: 250 }) },
  { icon: "🌟", title: "Immortal",         desc: "Play 500 matches",         key: "immortal",       tier: "legendary", category: "Milestones", check: (p) => (p?.total_matches ?? 0) >= 500,  progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 500), target: 500 }) },

  // ─── Winning (8) ───
  { icon: "🎯", title: "Sharpshooter",    desc: "Win 5 matches",            key: "five_wins",      tier: "bronze",    category: "Winning", check: (p) => (p?.wins ?? 0) >= 5,    progress: (p) => ({ current: Math.min(p?.wins ?? 0, 5), target: 5 }) },
  { icon: "🥊", title: "Fighter",         desc: "Win 10 matches",           key: "ten_wins",       tier: "bronze",    category: "Winning", check: (p) => (p?.wins ?? 0) >= 10,   progress: (p) => ({ current: Math.min(p?.wins ?? 0, 10), target: 10 }) },
  { icon: "💪", title: "Dominator",        desc: "Win 25 matches",           key: "25_wins",        tier: "silver",    category: "Winning", check: (p) => (p?.wins ?? 0) >= 25,   progress: (p) => ({ current: Math.min(p?.wins ?? 0, 25), target: 25 }) },
  { icon: "🦁", title: "Champion",         desc: "Win 50 matches",           key: "50_wins",        tier: "gold",      category: "Winning", check: (p) => (p?.wins ?? 0) >= 50,   progress: (p) => ({ current: Math.min(p?.wins ?? 0, 50), target: 50 }) },
  { icon: "🐉", title: "Unstoppable",      desc: "Win 100 matches",          key: "100_wins",       tier: "legendary", category: "Winning", check: (p) => (p?.wins ?? 0) >= 100,  progress: (p) => ({ current: Math.min(p?.wins ?? 0, 100), target: 100 }) },
  { icon: "🏅", title: "Win Machine",      desc: "Win 200 matches",          key: "200_wins",       tier: "legendary", category: "Winning", check: (p) => (p?.wins ?? 0) >= 200,  progress: (p) => ({ current: Math.min(p?.wins ?? 0, 200), target: 200 }) },
  { icon: "📊", title: "Win Rate King",    desc: "70%+ win rate (20+ games)",key: "win_rate_70",    tier: "gold",      category: "Winning", check: (p) => (p?.total_matches ?? 0) >= 20 && ((p?.wins ?? 0) / (p?.total_matches || 1)) >= 0.7, progress: (p) => ({ current: Math.round(((p?.wins ?? 0) / Math.max(p?.total_matches || 1, 1)) * 100), target: 70 }) },
  { icon: "🧊", title: "Ice Cold",         desc: "80%+ win rate (50+ games)",key: "win_rate_80",    tier: "legendary", category: "Winning", check: (p) => (p?.total_matches ?? 0) >= 50 && ((p?.wins ?? 0) / (p?.total_matches || 1)) >= 0.8, progress: (p) => ({ current: Math.round(((p?.wins ?? 0) / Math.max(p?.total_matches || 1, 1)) * 100), target: 80 }) },

  // ─── Streaks (6) ───
  { icon: "🔥", title: "On Fire",          desc: "Win 3 in a row",           key: "streak_3",       tier: "bronze",    category: "Streaks", check: (p) => (p?.best_streak ?? 0) >= 3,  progress: (p) => ({ current: Math.min(p?.best_streak ?? 0, 3), target: 3 }) },
  { icon: "💥", title: "Rampage",          desc: "Win 5 in a row",           key: "streak_5",       tier: "silver",    category: "Streaks", check: (p) => (p?.best_streak ?? 0) >= 5,  progress: (p) => ({ current: Math.min(p?.best_streak ?? 0, 5), target: 5 }) },
  { icon: "⚡", title: "Lightning",        desc: "Win 7 in a row",           key: "streak_7",       tier: "silver",    category: "Streaks", check: (p) => (p?.best_streak ?? 0) >= 7,  progress: (p) => ({ current: Math.min(p?.best_streak ?? 0, 7), target: 7 }) },
  { icon: "☄️", title: "Supernova",        desc: "Win 10 in a row",          key: "streak_10",      tier: "gold",      category: "Streaks", check: (p) => (p?.best_streak ?? 0) >= 10, progress: (p) => ({ current: Math.min(p?.best_streak ?? 0, 10), target: 10 }) },
  { icon: "🌋", title: "Volcanic",         desc: "Win 15 in a row",          key: "streak_15",      tier: "gold",      category: "Streaks", check: (p) => (p?.best_streak ?? 0) >= 15, progress: (p) => ({ current: Math.min(p?.best_streak ?? 0, 15), target: 15 }) },
  { icon: "🌪️", title: "Godlike",          desc: "Win 20 in a row",          key: "streak_20",      tier: "legendary", category: "Streaks", check: (p) => (p?.best_streak ?? 0) >= 20, progress: (p) => ({ current: Math.min(p?.best_streak ?? 0, 20), target: 20 }) },

  // ─── Scoring (8) ───
  { icon: "🔟", title: "Getting Started",  desc: "Score 10+ in a match",     key: "ten_runs",       tier: "bronze",    category: "Scoring", check: (p) => (p?.high_score ?? 0) >= 10,  progress: (p) => ({ current: Math.min(p?.high_score ?? 0, 10), target: 10 }) },
  { icon: "2️⃣5️⃣", title: "Quarter Century",desc: "Score 25+ in a match",     key: "quarter_century",tier: "bronze",    category: "Scoring", check: (p) => (p?.high_score ?? 0) >= 25,  progress: (p) => ({ current: Math.min(p?.high_score ?? 0, 25), target: 25 }) },
  { icon: "5️⃣", title: "Half Century",     desc: "Score 50+ in a match",     key: "fifty",          tier: "silver",    category: "Scoring", check: (p) => (p?.high_score ?? 0) >= 50,  progress: (p) => ({ current: Math.min(p?.high_score ?? 0, 50), target: 50 }) },
  { icon: "💯", title: "Centurion",        desc: "Score 100+ in a match",    key: "century",        tier: "silver",    category: "Scoring", check: (p) => (p?.high_score ?? 0) >= 100, progress: (p) => ({ current: Math.min(p?.high_score ?? 0, 100), target: 100 }) },
  { icon: "🔱", title: "Double Century",   desc: "Score 200+ in a match",    key: "double_century", tier: "gold",      category: "Scoring", check: (p) => (p?.high_score ?? 0) >= 200, progress: (p) => ({ current: Math.min(p?.high_score ?? 0, 200), target: 200 }) },
  { icon: "🏰", title: "Triple Threat",    desc: "Score 300+ in a match",    key: "triple_century", tier: "legendary", category: "Scoring", check: (p) => (p?.high_score ?? 0) >= 300, progress: (p) => ({ current: Math.min(p?.high_score ?? 0, 300), target: 300 }) },
  { icon: "🏔️", title: "Run Mountain",     desc: "500 total runs",           key: "500_total_runs", tier: "silver",    category: "Scoring", check: (p) => (p?.total_runs ?? 0) >= 500, progress: (p) => ({ current: Math.min(p?.total_runs ?? 0, 500), target: 500 }) },
  { icon: "🌍", title: "Run Emperor",      desc: "2000 total runs",          key: "2000_total_runs",tier: "legendary", category: "Scoring", check: (p) => (p?.total_runs ?? 0) >= 2000,progress: (p) => ({ current: Math.min(p?.total_runs ?? 0, 2000), target: 2000 }) },

  // ─── Batting (10) ───
  { icon: "6️⃣", title: "First Six",        desc: "Hit your first six",       key: "first_six",      tier: "bronze",    category: "Batting", check: (_p, s) => (s?.totalSixes ?? 0) >= 1,   progress: (_p: any, s: any) => ({ current: Math.min(s?.totalSixes ?? 0, 1), target: 1 }) },
  { icon: "4️⃣", title: "First Four",       desc: "Hit your first four",      key: "first_four",     tier: "bronze",    category: "Batting", check: (_p, s) => (s?.totalFours ?? 0) >= 1,   progress: (_p: any, s: any) => ({ current: Math.min(s?.totalFours ?? 0, 1), target: 1 }) },
  { icon: "🎆", title: "Six Hitter",       desc: "Hit 10 total sixes",       key: "10_sixes",       tier: "bronze",    category: "Batting", check: (_p, s) => (s?.totalSixes ?? 0) >= 10,  progress: (_p: any, s: any) => ({ current: Math.min(s?.totalSixes ?? 0, 10), target: 10 }) },
  { icon: "6️⃣", title: "Six Machine",      desc: "Hit 50 total sixes",       key: "50_sixes",       tier: "silver",    category: "Batting", check: (_p, s) => (s?.totalSixes ?? 0) >= 50,  progress: (_p: any, s: any) => ({ current: Math.min(s?.totalSixes ?? 0, 50), target: 50 }) },
  { icon: "🚀", title: "Six Legend",       desc: "Hit 200 total sixes",      key: "200_sixes",      tier: "gold",      category: "Batting", check: (_p, s) => (s?.totalSixes ?? 0) >= 200, progress: (_p: any, s: any) => ({ current: Math.min(s?.totalSixes ?? 0, 200), target: 200 }) },
  { icon: "🪐", title: "Six God",          desc: "Hit 500 total sixes",      key: "500_sixes",      tier: "legendary", category: "Batting", check: (_p, s) => (s?.totalSixes ?? 0) >= 500, progress: (_p: any, s: any) => ({ current: Math.min(s?.totalSixes ?? 0, 500), target: 500 }) },
  { icon: "4️⃣", title: "Boundary King",    desc: "Hit 100 total fours",      key: "100_fours",      tier: "silver",    category: "Batting", check: (_p, s) => (s?.totalFours ?? 0) >= 100, progress: (_p: any, s: any) => ({ current: Math.min(s?.totalFours ?? 0, 100), target: 100 }) },
  { icon: "🏹", title: "Boundary Sniper",  desc: "Hit 300 total fours",      key: "300_fours",      tier: "gold",      category: "Batting", check: (_p, s) => (s?.totalFours ?? 0) >= 300, progress: (_p: any, s: any) => ({ current: Math.min(s?.totalFours ?? 0, 300), target: 300 }) },
  { icon: "💎", title: "Boundary Master",  desc: "60%+ boundary rate",       key: "boundary_master",tier: "gold",      category: "Batting", check: (_p, s) => (s?.boundaryPct ?? 0) >= 60, progress: (_p: any, s: any) => ({ current: Math.min(s?.boundaryPct ?? 0, 60), target: 60 }) },
  { icon: "⭐", title: "Clean Hitter",     desc: "Score only in 4s and 6s in a match", key: "clean_hitter", tier: "legendary", category: "Batting", check: (_p, s) => (s?.cleanHit ?? false) },

  // ─── Resilience (6) ───
  { icon: "🪨", title: "Iron Will",        desc: "Win after 5+ consecutive losses",    key: "iron_will",  tier: "silver",    category: "Resilience", check: (p) => (p?.losses ?? 0) >= 5 && (p?.wins ?? 0) >= 1 },
  { icon: "🐢", title: "The Wall",         desc: "0 abandons in 20+ matches",          key: "the_wall",   tier: "gold",      category: "Resilience", check: (p) => (p?.total_matches ?? 0) >= 20 && (p?.abandons ?? 1) === 0, progress: (p) => ({ current: (p?.abandons ?? 1) === 0 ? Math.min(p?.total_matches ?? 0, 20) : 0, target: 20 }) },
  { icon: "🦅", title: "Comeback King",    desc: "50%+ win rate with 50+ matches",     key: "comeback",   tier: "legendary", category: "Resilience", check: (p) => (p?.total_matches ?? 0) >= 50 && ((p?.wins ?? 0) / (p?.total_matches || 1)) >= 0.5, progress: (p) => ({ current: Math.min(p?.total_matches ?? 0, 50), target: 50 }) },
  { icon: "🛡️", title: "Never Quit",       desc: "0 abandons in 50+ matches",          key: "never_quit", tier: "legendary", category: "Resilience", check: (p) => (p?.total_matches ?? 0) >= 50 && (p?.abandons ?? 1) === 0, progress: (p) => ({ current: (p?.abandons ?? 1) === 0 ? Math.min(p?.total_matches ?? 0, 50) : 0, target: 50 }) },
  { icon: "🔄", title: "Bounce Back",      desc: "Win immediately after a loss",       key: "bounce_back",tier: "bronze",    category: "Resilience", check: (p) => (p?.current_streak ?? 0) >= 1 && (p?.losses ?? 0) >= 1 },
  { icon: "💀", title: "Survivor",          desc: "Lose 10 matches and keep playing",   key: "survivor",   tier: "bronze",    category: "Resilience", check: (p) => (p?.losses ?? 0) >= 10 && (p?.total_matches ?? 0) > (p?.losses ?? 0), progress: (p) => ({ current: Math.min(p?.losses ?? 0, 10), target: 10 }) },

  // ─── Social (6) ───
  { icon: "👫", title: "Social Butterfly",  desc: "Add 3 friends",            key: "3_friends",      tier: "bronze",    category: "Social",  check: (_p, s) => (s?.friendCount ?? 0) >= 3,  progress: (_p: any, s: any) => ({ current: Math.min(s?.friendCount ?? 0, 3), target: 3 }) },
  { icon: "🤝", title: "Networking",        desc: "Add 10 friends",           key: "10_friends",     tier: "silver",    category: "Social",  check: (_p, s) => (s?.friendCount ?? 0) >= 10, progress: (_p: any, s: any) => ({ current: Math.min(s?.friendCount ?? 0, 10), target: 10 }) },
  { icon: "🏛️", title: "Clan Joiner",       desc: "Join a clan",              key: "join_clan",      tier: "bronze",    category: "Social",  check: (_p, s) => (s?.hasClan ?? false) },
  { icon: "🗡️", title: "War Veteran",       desc: "Participate in 5 clan wars",key: "5_wars",        tier: "silver",    category: "Social",  check: (_p, s) => (s?.warCount ?? 0) >= 5,     progress: (_p: any, s: any) => ({ current: Math.min(s?.warCount ?? 0, 5), target: 5 }) },
  { icon: "🎁", title: "Generous",          desc: "Donate 10 cards",          key: "10_donations",   tier: "bronze",    category: "Social",  check: (_p, s) => (s?.donatedCards ?? 0) >= 10,progress: (_p: any, s: any) => ({ current: Math.min(s?.donatedCards ?? 0, 10), target: 10 }) },
  { icon: "💝", title: "Philanthropist",    desc: "Donate 50 cards",          key: "50_donations",   tier: "gold",      category: "Social",  check: (_p, s) => (s?.donatedCards ?? 0) >= 50,progress: (_p: any, s: any) => ({ current: Math.min(s?.donatedCards ?? 0, 50), target: 50 }) },

  // ─── Collection (6) ───
  { icon: "🃏", title: "Card Starter",      desc: "Collect 10 player cards",  key: "10_cards",       tier: "bronze",    category: "Collection", check: (_p, s) => (s?.cardCount ?? 0) >= 10,  progress: (_p: any, s: any) => ({ current: Math.min(s?.cardCount ?? 0, 10), target: 10 }) },
  { icon: "📚", title: "Card Collector",    desc: "Collect 50 player cards",  key: "50_cards",       tier: "silver",    category: "Collection", check: (_p, s) => (s?.cardCount ?? 0) >= 50,  progress: (_p: any, s: any) => ({ current: Math.min(s?.cardCount ?? 0, 50), target: 50 }) },
  { icon: "🗃️", title: "Card Master",       desc: "Collect 100 player cards", key: "100_cards",      tier: "gold",      category: "Collection", check: (_p, s) => (s?.cardCount ?? 0) >= 100, progress: (_p: any, s: any) => ({ current: Math.min(s?.cardCount ?? 0, 100), target: 100 }) },
  { icon: "🌈", title: "Full Set",          desc: "Collect all 235 players",  key: "full_set",       tier: "legendary", category: "Collection", check: (_p, s) => (s?.cardCount ?? 0) >= 235, progress: (_p: any, s: any) => ({ current: Math.min(s?.cardCount ?? 0, 235), target: 235 }) },
  { icon: "⬆️", title: "Upgrader",          desc: "Upgrade any card to L3",   key: "card_l3",        tier: "silver",    category: "Collection", check: (_p, s) => (s?.maxCardLevel ?? 0) >= 3, progress: (_p: any, s: any) => ({ current: Math.min(s?.maxCardLevel ?? 0, 3), target: 3 }) },
  { icon: "🔮", title: "Max Power",         desc: "Upgrade any card to L6",   key: "card_l6",        tier: "legendary", category: "Collection", check: (_p, s) => (s?.maxCardLevel ?? 0) >= 6, progress: (_p: any, s: any) => ({ current: Math.min(s?.maxCardLevel ?? 0, 6), target: 6 }) },

  // ─── Economy (5) ───
  { icon: "🪙", title: "First Earnings",   desc: "Earn 100 coins",           key: "100_coins",      tier: "bronze",    category: "Economy", check: (p) => (p?.coins ?? 0) >= 100,   progress: (p) => ({ current: Math.min(p?.coins ?? 0, 100), target: 100 }) },
  { icon: "💰", title: "Wealthy",          desc: "Earn 1000 coins",          key: "1000_coins",     tier: "silver",    category: "Economy", check: (p) => (p?.coins ?? 0) >= 1000,  progress: (p) => ({ current: Math.min(p?.coins ?? 0, 1000), target: 1000 }) },
  { icon: "🏦", title: "Tycoon",           desc: "Earn 5000 coins",          key: "5000_coins",     tier: "gold",      category: "Economy", check: (p) => (p?.coins ?? 0) >= 5000,  progress: (p) => ({ current: Math.min(p?.coins ?? 0, 5000), target: 5000 }) },
  { icon: "🛒", title: "Shopper",          desc: "Buy your first shop item", key: "first_purchase", tier: "bronze",    category: "Economy", check: (_p, s) => (s?.purchaseCount ?? 0) >= 1, progress: (_p: any, s: any) => ({ current: Math.min(s?.purchaseCount ?? 0, 1), target: 1 }) },
  { icon: "📦", title: "Chest Opener",     desc: "Open 10 chests",           key: "10_chests",      tier: "silver",    category: "Economy", check: (_p, s) => (s?.chestsOpened ?? 0) >= 10, progress: (_p: any, s: any) => ({ current: Math.min(s?.chestsOpened ?? 0, 10), target: 10 }) },

  // ─── Login (4) ───
  { icon: "📅", title: "Daily Player",     desc: "Log in 7 days in a row",   key: "login_7",        tier: "bronze",    category: "Login", check: (p) => (p?.best_login_streak ?? 0) >= 7,  progress: (p) => ({ current: Math.min(p?.best_login_streak ?? 0, 7), target: 7 }) },
  { icon: "🗓️", title: "Two Week Warrior", desc: "Log in 14 days in a row",  key: "login_14",       tier: "silver",    category: "Login", check: (p) => (p?.best_login_streak ?? 0) >= 14, progress: (p) => ({ current: Math.min(p?.best_login_streak ?? 0, 14), target: 14 }) },
  { icon: "📆", title: "Monthly Hero",     desc: "Log in 28 days in a row",  key: "login_28",       tier: "gold",      category: "Login", check: (p) => (p?.best_login_streak ?? 0) >= 28, progress: (p) => ({ current: Math.min(p?.best_login_streak ?? 0, 28), target: 28 }) },
  { icon: "♾️", title: "Eternal Player",   desc: "Log in 60 days in a row",  key: "login_60",       tier: "legendary", category: "Login", check: (p) => (p?.best_login_streak ?? 0) >= 60, progress: (p) => ({ current: Math.min(p?.best_login_streak ?? 0, 60), target: 60 }) },

  // ─── Rank (5) ───
  { icon: "🥉", title: "Bronze Rank",      desc: "Reach Bronze tier",        key: "rank_bronze",    tier: "bronze",    category: "Rank", check: (p) => ["Bronze","Silver","Gold","Platinum","Diamond","Legend"].includes(p?.rank_tier) },
  { icon: "🥈", title: "Silver Rank",      desc: "Reach Silver tier",        key: "rank_silver",    tier: "bronze",    category: "Rank", check: (p) => ["Silver","Gold","Platinum","Diamond","Legend"].includes(p?.rank_tier) },
  { icon: "🥇", title: "Gold Rank",        desc: "Reach Gold tier",          key: "rank_gold",      tier: "silver",    category: "Rank", check: (p) => ["Gold","Platinum","Diamond","Legend"].includes(p?.rank_tier) },
  { icon: "💠", title: "Diamond Rank",     desc: "Reach Diamond tier",       key: "rank_diamond",   tier: "gold",      category: "Rank", check: (p) => ["Diamond","Legend"].includes(p?.rank_tier) },
  { icon: "🏆", title: "Legend Rank",      desc: "Reach Legend tier",        key: "rank_legend",    tier: "legendary", category: "Rank", check: (p) => p?.rank_tier === "Legend" },
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
