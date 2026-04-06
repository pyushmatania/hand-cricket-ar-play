/**
 * Maps IPL team IDs to their corresponding character illustration keys
 * from the CHARACTERS asset map in src/assets/characters/index.ts
 */

/** Default character key for each IPL team */
const TEAM_CHARACTER_MAP: Record<string, string> = {
  csk: "keeperCsk",
  mi: "finisherMi",
  rcb: "openerRcb",
  kkr: "spinnerKkr",
  dc: "openerDc",
  srh: "pacerSrh",
  rr: "legspinnerRr",
  pbks: "powerhitterPbks",
  gt: "anchorGt",
  lsg: "allrounderLsg",
};

/** Alternate character keys per team (for opponent variety) */
const TEAM_ALT_CHARACTERS: Record<string, string> = {
  csk: "allrounder",    // charAllrounderCsk
  mi: "keeper",         // charKeeperMi
  rcb: "captain",       // charCaptainRcb
  kkr: "spinnerKkr",
  dc: "openerDc",
  srh: "pacerSrh",
  rr: "legspinnerRr",
  pbks: "powerhitterPbks",
  gt: "anchorGt",
  lsg: "allrounderLsg",
};

/**
 * Get the character illustration key for a given IPL team ID.
 * Falls back to 'batsman' for unknown teams.
 */
export function getTeamCharacter(teamId: string | null | undefined): string {
  if (!teamId) return "batsman";
  return TEAM_CHARACTER_MAP[teamId.toLowerCase()] ?? "batsman";
}

/**
 * Get an alternate character for variety (e.g. when same team faces itself).
 */
export function getTeamAltCharacter(teamId: string | null | undefined): string {
  if (!teamId) return "bowler";
  return TEAM_ALT_CHARACTERS[teamId.toLowerCase()] ?? "bowler";
}

/**
 * Get player & opponent character keys for a matchup.
 * If both are the same team, uses primary + alt to differentiate.
 */
export function getMatchupCharacters(
  playerTeamId: string | null | undefined,
  opponentTeamId: string | null | undefined
): { playerCharacter: string; opponentCharacter: string } {
  const playerChar = getTeamCharacter(playerTeamId);
  let opponentChar = getTeamCharacter(opponentTeamId);

  // Avoid identical characters when same team plays itself
  if (playerChar === opponentChar) {
    opponentChar = getTeamAltCharacter(opponentTeamId);
  }

  return { playerCharacter: playerChar, opponentCharacter: opponentChar };
}
