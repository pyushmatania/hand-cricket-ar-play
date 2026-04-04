// ═══════════════════════════════════════════════════
// Doc 2 — Sound Manifest: 87 files across 38 categories
// ═══════════════════════════════════════════════════

import type { SoundCategory } from '@/engines/types';

export const SOUND_MANIFEST: Record<string, SoundCategory> = {
  // ── BAT HITS ──
  bat_hit_soft: {
    variants: [
      { id: 'bhs1', src: '/sounds/bat/hit_soft_1.mp3' },
      { id: 'bhs2', src: '/sounds/bat/hit_soft_2.mp3' },
      { id: 'bhs3', src: '/sounds/bat/hit_soft_3.mp3' },
    ],
    lastPlayed: -1,
    description: 'Gentle tap for dot balls and singles',
  },
  bat_hit_medium: {
    variants: [
      { id: 'bhm1', src: '/sounds/bat/hit_medium_1.mp3' },
      { id: 'bhm2', src: '/sounds/bat/hit_medium_2.mp3' },
      { id: 'bhm3', src: '/sounds/bat/hit_medium_3.mp3' },
      { id: 'bhm4', src: '/sounds/bat/hit_medium_4.mp3' },
    ],
    lastPlayed: -1,
    description: 'Firm hit for 2s and 3s',
  },
  bat_hit_hard: {
    variants: [
      { id: 'bhh1', src: '/sounds/bat/hit_hard_1.mp3' },
      { id: 'bhh2', src: '/sounds/bat/hit_hard_2.mp3' },
      { id: 'bhh3', src: '/sounds/bat/hit_hard_3.mp3' },
      { id: 'bhh4', src: '/sounds/bat/hit_hard_4.mp3' },
      { id: 'bhh5', src: '/sounds/bat/hit_hard_5.mp3' },
    ],
    lastPlayed: -1,
    description: 'Loud CRACK for boundaries (4s)',
  },
  bat_hit_massive: {
    variants: [
      { id: 'bhx1', src: '/sounds/bat/hit_massive_1.mp3' },
      { id: 'bhx2', src: '/sounds/bat/hit_massive_2.mp3' },
      { id: 'bhx3', src: '/sounds/bat/hit_massive_3.mp3' },
      { id: 'bhx4', src: '/sounds/bat/hit_massive_4.mp3' },
      { id: 'bhx5', src: '/sounds/bat/hit_massive_5.mp3' },
    ],
    lastPlayed: -1,
    description: 'ENORMOUS crack + shockwave for sixes',
  },

  // ── BALL SOUNDS ──
  ball_bounce: {
    variants: [
      { id: 'bb1', src: '/sounds/ball/bounce_1.mp3' },
      { id: 'bb2', src: '/sounds/ball/bounce_2.mp3' },
      { id: 'bb3', src: '/sounds/ball/bounce_3.mp3' },
    ],
    lastPlayed: -1,
    description: 'Ball pitching on the deck',
  },
  ball_into_gloves: {
    variants: [
      { id: 'big1', src: '/sounds/ball/gloves_1.mp3' },
      { id: 'big2', src: '/sounds/ball/gloves_2.mp3' },
      { id: 'big3', src: '/sounds/ball/gloves_3.mp3' },
    ],
    lastPlayed: -1,
    description: 'Ball into keeper gloves (dot ball)',
  },
  ball_edge: {
    variants: [
      { id: 'be1', src: '/sounds/ball/edge_1.mp3' },
      { id: 'be2', src: '/sounds/ball/edge_2.mp3' },
    ],
    lastPlayed: -1,
    description: 'Faint edge off the bat',
  },
  ball_pad_hit: {
    variants: [
      { id: 'bp1', src: '/sounds/ball/pad_1.mp3' },
      { id: 'bp2', src: '/sounds/ball/pad_2.mp3' },
    ],
    lastPlayed: -1,
    description: 'Ball hitting batting pad (LBW)',
  },
  ball_flight_whoosh: {
    variants: [
      { id: 'bfw1', src: '/sounds/ball/flight_1.mp3' },
    ],
    lastPlayed: -1,
    description: 'Ball sailing through the air (sixes)',
  },

  // ── STUMPS ──
  stumps_hit: {
    variants: [
      { id: 'sh1', src: '/sounds/stumps/hit_1.mp3' },
      { id: 'sh2', src: '/sounds/stumps/hit_2.mp3' },
      { id: 'sh3', src: '/sounds/stumps/hit_3.mp3' },
      { id: 'sh4', src: '/sounds/stumps/hit_4.mp3' },
    ],
    lastPlayed: -1,
    description: 'Stumps shattered — timber!',
  },
  bails_flying: {
    variants: [
      { id: 'bf1', src: '/sounds/stumps/bails_1.mp3' },
    ],
    lastPlayed: -1,
    description: 'Bails dislodged',
  },

  // ── CROWD ──
  crowd_cheer_mild: {
    variants: [
      { id: 'ccm1', src: '/sounds/crowd/cheer_mild_1.mp3' },
      { id: 'ccm2', src: '/sounds/crowd/cheer_mild_2.mp3' },
      { id: 'ccm3', src: '/sounds/crowd/cheer_mild_3.mp3' },
    ],
    lastPlayed: -1,
    description: 'Polite applause for singles/doubles',
  },
  crowd_cheer_excited: {
    variants: [
      { id: 'cce1', src: '/sounds/crowd/cheer_excited_1.mp3' },
      { id: 'cce2', src: '/sounds/crowd/cheer_excited_2.mp3' },
      { id: 'cce3', src: '/sounds/crowd/cheer_excited_3.mp3' },
      { id: 'cce4', src: '/sounds/crowd/cheer_excited_4.mp3' },
      { id: 'cce5', src: '/sounds/crowd/cheer_excited_5.mp3' },
    ],
    lastPlayed: -1,
    description: 'Loud cheer for boundaries (FOUR)',
  },
  crowd_eruption: {
    variants: [
      { id: 'cer1', src: '/sounds/crowd/eruption_1.mp3' },
      { id: 'cer2', src: '/sounds/crowd/eruption_2.mp3' },
      { id: 'cer3', src: '/sounds/crowd/eruption_3.mp3' },
      { id: 'cer4', src: '/sounds/crowd/eruption_4.mp3' },
      { id: 'cer5', src: '/sounds/crowd/eruption_5.mp3' },
    ],
    lastPlayed: -1,
    description: 'MAXIMUM crowd roar for sixes',
  },
  crowd_gasp: {
    variants: [
      { id: 'cg1', src: '/sounds/crowd/gasp_1.mp3' },
      { id: 'cg2', src: '/sounds/crowd/gasp_2.mp3' },
      { id: 'cg3', src: '/sounds/crowd/gasp_3.mp3' },
    ],
    lastPlayed: -1,
    description: 'Collective gasp',
  },
  crowd_groan: {
    variants: [
      { id: 'cgr1', src: '/sounds/crowd/groan_1.mp3' },
      { id: 'cgr2', src: '/sounds/crowd/groan_2.mp3' },
      { id: 'cgr3', src: '/sounds/crowd/groan_3.mp3' },
    ],
    lastPlayed: -1,
    description: 'Disappointment groan',
  },
  crowd_appeal: {
    variants: [
      { id: 'ca1', src: '/sounds/crowd/appeal_1.mp3' },
      { id: 'ca2', src: '/sounds/crowd/appeal_2.mp3' },
      { id: 'ca3', src: '/sounds/crowd/appeal_3.mp3' },
      { id: 'ca4', src: '/sounds/crowd/appeal_4.mp3' },
      { id: 'ca5', src: '/sounds/crowd/appeal_5.mp3' },
      { id: 'ca6', src: '/sounds/crowd/appeal_6.mp3' },
    ],
    lastPlayed: -1,
    description: 'HOWZAT! appeals',
  },
  crowd_celebration_sustained: {
    variants: [
      { id: 'ccs1', src: '/sounds/crowd/celebration_1.mp3' },
      { id: 'ccs2', src: '/sounds/crowd/celebration_2.mp3' },
    ],
    lastPlayed: -1,
    description: 'Sustained celebration (3-5 seconds)',
  },

  // ── AMBIENT LOOPS ──
  ambient_crowd_quiet: {
    variants: [{ id: 'acq', src: '/sounds/ambient/crowd_quiet_loop.mp3' }],
    lastPlayed: -1,
    description: 'Low murmur, between balls',
  },
  ambient_crowd_moderate: {
    variants: [{ id: 'acm', src: '/sounds/ambient/crowd_moderate_loop.mp3' }],
    lastPlayed: -1,
    description: 'Active crowd, moderate energy',
  },
  ambient_crowd_tense: {
    variants: [{ id: 'act', src: '/sounds/ambient/crowd_tense_loop.mp3' }],
    lastPlayed: -1,
    description: 'Quiet tension, close match',
  },
  ambient_crowd_loud: {
    variants: [{ id: 'acl', src: '/sounds/ambient/crowd_loud_loop.mp3' }],
    lastPlayed: -1,
    description: 'Loud sustained crowd energy',
  },
  ambient_rain: {
    variants: [{ id: 'ar', src: '/sounds/ambient/rain_loop.mp3' }],
    lastPlayed: -1,
    description: 'Rain on stadium roof',
  },
  ambient_wind: {
    variants: [{ id: 'aw', src: '/sounds/ambient/wind_loop.mp3' }],
    lastPlayed: -1,
    description: 'Wind for dust storm weather',
  },

  // ── FIELD SOUNDS ──
  running_footsteps: {
    variants: [
      { id: 'rf1', src: '/sounds/field/running_1.mp3' },
      { id: 'rf2', src: '/sounds/field/running_2.mp3' },
    ],
    lastPlayed: -1,
    description: 'Batsmen running between wickets',
  },
  fielder_dive: {
    variants: [{ id: 'fd1', src: '/sounds/field/dive_1.mp3' }],
    lastPlayed: -1,
    description: 'Fielder diving on grass',
  },
  fielder_throw: {
    variants: [{ id: 'ft1', src: '/sounds/field/throw_1.mp3' }],
    lastPlayed: -1,
    description: 'Ball being thrown at stumps',
  },

  // ── UI SOUNDS ──
  ui_button_tap: {
    variants: [
      { id: 'ubt1', src: '/sounds/ui/tap_1.mp3' },
      { id: 'ubt2', src: '/sounds/ui/tap_2.mp3' },
      { id: 'ubt3', src: '/sounds/ui/tap_3.mp3' },
    ],
    lastPlayed: -1,
    description: 'Generic button press',
  },
  ui_card_slide_in: {
    variants: [
      { id: 'ucsi1', src: '/sounds/ui/slide_in_1.mp3' },
      { id: 'ucsi2', src: '/sounds/ui/slide_in_2.mp3' },
    ],
    lastPlayed: -1,
    description: 'Card/panel sliding into view',
  },
  ui_card_slide_out: {
    variants: [{ id: 'ucso1', src: '/sounds/ui/slide_out_1.mp3' }],
    lastPlayed: -1,
    description: 'Card/panel sliding away',
  },
  ui_score_tick: {
    variants: [{ id: 'ust1', src: '/sounds/ui/score_tick.mp3' }],
    lastPlayed: -1,
    description: 'Scoreboard number changing',
  },
  ui_error: {
    variants: [{ id: 'ue1', src: '/sounds/ui/error.mp3' }],
    lastPlayed: -1,
    description: 'Error/invalid action buzz',
  },
  ui_success: {
    variants: [{ id: 'us1', src: '/sounds/ui/success.mp3' }],
    lastPlayed: -1,
    description: 'Success confirmation ding',
  },

  // ── SPECIAL ──
  coin_flip: {
    variants: [{ id: 'cf', src: '/sounds/special/coin_flip.mp3' }],
    lastPlayed: -1,
    description: 'Metallic coin spinning sound (toss)',
  },
  coin_land: {
    variants: [
      { id: 'cl1', src: '/sounds/special/coin_land_1.mp3' },
      { id: 'cl2', src: '/sounds/special/coin_land_2.mp3' },
    ],
    lastPlayed: -1,
    description: 'Coin hitting the surface and settling',
  },
  victory_fanfare: {
    variants: [{ id: 'vf', src: '/sounds/special/victory_fanfare.mp3' }],
    lastPlayed: -1,
    description: 'Triumphant 5-second orchestral sting',
  },
  defeat_sting: {
    variants: [{ id: 'ds', src: '/sounds/special/defeat_sting.mp3' }],
    lastPlayed: -1,
    description: '3-second somber sting',
  },
  match_start_horn: {
    variants: [{ id: 'msh', src: '/sounds/special/match_horn.mp3' }],
    lastPlayed: -1,
    description: 'Stadium horn blast to start the match',
  },
  firework_pop: {
    variants: [
      { id: 'fp1', src: '/sounds/special/firework_1.mp3' },
      { id: 'fp2', src: '/sounds/special/firework_2.mp3' },
      { id: 'fp3', src: '/sounds/special/firework_3.mp3' },
    ],
    lastPlayed: -1,
    description: 'Firework burst/pop',
  },
  heartbeat: {
    variants: [{ id: 'hb', src: '/sounds/special/heartbeat_loop.mp3' }],
    lastPlayed: -1,
    description: 'Heartbeat for tense moments (loops)',
  },
  timer_tick: {
    variants: [{ id: 'tt', src: '/sounds/special/timer_tick.mp3' }],
    lastPlayed: -1,
    description: 'Clock tick for PvP countdown',
  },
  timer_expire: {
    variants: [{ id: 'te', src: '/sounds/special/timer_expire.mp3' }],
    lastPlayed: -1,
    description: 'Buzzer when timer hits zero',
  },

  // ── REWARDS ──
  coin_collect: {
    variants: [
      { id: 'cc1', src: '/sounds/rewards/coin_1.mp3' },
      { id: 'cc2', src: '/sounds/rewards/coin_2.mp3' },
      { id: 'cc3', src: '/sounds/rewards/coin_3.mp3' },
    ],
    lastPlayed: -1,
    description: 'Coin earned/collected clink',
  },
  gem_collect: {
    variants: [
      { id: 'gc1', src: '/sounds/rewards/gem_1.mp3' },
      { id: 'gc2', src: '/sounds/rewards/gem_2.mp3' },
    ],
    lastPlayed: -1,
    description: 'Gem crystal chime',
  },
  card_flip: {
    variants: [
      { id: 'cfl1', src: '/sounds/rewards/card_flip_1.mp3' },
      { id: 'cfl2', src: '/sounds/rewards/card_flip_2.mp3' },
    ],
    lastPlayed: -1,
    description: 'Player card revealed',
  },
  card_legendary_reveal: {
    variants: [{ id: 'clr', src: '/sounds/rewards/legendary_reveal.mp3' }],
    lastPlayed: -1,
    description: 'Special dramatic reveal for Legendary/Mythic cards',
  },
  chest_unlock: {
    variants: [{ id: 'cu1', src: '/sounds/rewards/chest_unlock.mp3' }],
    lastPlayed: -1,
    description: 'Chest opening sound',
  },
};
