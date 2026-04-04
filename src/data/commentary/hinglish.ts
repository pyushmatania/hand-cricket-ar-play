// ═══════════════════════════════════════════════════
// Doc 3 — Chapter 3.3: Hinglish Commentary Pool
// Mix of English structure with Hindi flavor
// ═══════════════════════════════════════════════════

import type { CommentaryLine } from '@/engines/types';

// ── DEFENSE SCORED ──
export const HL_DEFENSE_SCORED: CommentaryLine[] = [
  { id: 'xdf1', text: 'Defense pick kiya but runs toh aa gaye bro!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf2', text: 'Safe khela yaar, but scoreboard chal raha hai!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf3', text: 'Defend kiya and runs scored. Smart move!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf4', text: 'Bhai ne defense lagaya par runs le liye easily!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf5', text: 'Block maara but runs mil gaye. Best of both worlds yaar!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf6', text: 'Carefully khela, runs aa gaye. That\'s experience bro!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf7', text: 'Defense plus runs. Ye hai real cricket brain!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf8', text: 'Safe approach but runs still flowing. Nice!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf9', text: 'Bowler ke against defense lagaya but runs le liye clean!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf10', text: 'Bachao aur bhago strategy work kar rahi hai!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf11', text: 'Conservative pick but runs on the board. Smart yaar!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf12', text: 'Defense se bhi runs nikal lete hai ye batsman!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf13', text: 'No risk pick but reward toh mila! Runs scored!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf14', text: 'Defend kiya neatly aur runs bhi le liye. GG!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xdf15', text: 'Playing it safe par scoreboard mein number badh rahe hai!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
];

// ── DEFENSE vs DEFENSE = OUT ──
export const HL_WICKET_DEFENSE: CommentaryLine[] = [
  { id: 'xwd1', text: 'Dono ne defense daala! OUT bhai! Kya scene hai!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'xwd2', text: 'Defense vs Defense! WICKET! Batsman ko jaana padega bro!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'xwd3', text: 'Both defended yaar! That means OUT! Dramatic!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'xwd4', text: 'Bhai dono bach rahe the! But batsman is gone! OUT!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'xwd5', text: 'Double defense = double trouble for batsman! WICKET!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'xwd6', text: 'Koi attack nahi kiya! Result? Batsman walks back! OUT!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'xwd7', text: 'Mind game mein dono safe khele but batsman loses! GONE!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'xwd8', text: 'Defense pe defense! Ye toh unexpected OUT hai yaar!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'xwd9', text: 'Stalemate! But rule says batsman is OUT! Tough luck bro!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'xwd10', text: 'Dono ne same thing socha — defend! And batsman pays!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
];

export const HL_RUNS: CommentaryLine[] = [
  { id: 'xr1', text: 'Single le liya. Smart cricket.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'xr2', text: 'Gap mein push kiya. Easy single.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'xr3', text: 'Two runs! Acchi running yaar!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 100 },
  { id: 'xr4', text: 'Three! Bhaag rahe hain like their life depends on it!', voice: 'main', emotion: 'excited', rate: 1.1, pitch: 1.05, delay: 100 },
  { id: 'xr5', text: 'Strike rotate kar rahe hain. Smart.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'xr6', text: 'Nudge for one. Keeps the board ticking.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
];

// ── Additional THREE ──
export const HL_TRIPLE: CommentaryLine[] = [
  { id: 'xt1', text: 'THREE bro! Running between wickets is fire!', voice: 'main', emotion: 'excited', rate: 1.1, pitch: 1.05, delay: 100 },
  { id: 'xt2', text: 'Teen runs yaar! Misfield ka full advantage liya!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 100 },
  { id: 'xt3', text: 'THREE! Athletic running! Fitness level max!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'xt4', text: 'Teen le liye! Overthrow se bonus run! Gift tha!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'xt5', text: 'THREE runs bhai! Calling was excellent! Smart cricket!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'xt6', text: 'Three stolen! Fielder slow tha! Punished him yaar!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'xt7', text: 'TEEN! Sprint for the third! Just made it! Safe!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'xt8', text: 'THREE runs! Good pushing and running between wickets bro!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
];

export const HL_BOUNDARY_FOUR: CommentaryLine[] = [
  { id: 'xf1', text: 'FOUR! Kya shot hai! Boundary!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf2', text: 'CHAUKAA! Beautiful drive through covers!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf3', text: 'Dispatched! Bilkul mercy nahi! FOUR!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf4', text: 'FOUR! Fielder ne haath bhi nahi hilaya!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800,
    followUp: { id: 'xf4f', text: 'That was pure timing yaar!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'xf5', text: 'BOUNDARY! Scorching drive! Nobody stopping that!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf6', text: 'Pull shot! Tracer bullet jaisi! FOUR!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf7', text: 'CHAUKAA! Aaj form mein hai batsman!', voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.1, delay: 800 },
  { id: 'xf8', text: 'Edge but FOUR! Lucky hai yaar!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'xf9', text: 'Lofted over infield! FOUR! Brave shot!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf10', text: 'FOUR more! Batsman on fire hai aaj!', voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.1, delay: 800 },
  // Additional FOUR
  { id: 'xf11', text: 'FOUR! Point se nikal gayi bro! No chance for fielder!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf12', text: 'Boundary yaar! Pads pe flick! Smooth like butter!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf13', text: 'CHAUKAA! Off side mein carved! Bowler ka kya hoga!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf14', text: 'FOUR! Pull shot bhai! Short ball ka treatment de diya!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf15', text: 'Fence tak! FOUR! That was pure timing yaar!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf16', text: 'Boundary! Reverse sweep! Gutsy move bro! Paid off!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf17', text: 'CHAUKAA! Straight drive! Back past the bowler! Clean!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf18', text: 'FOUR! Lucky edge but who cares! Runs on board!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'xf19', text: 'Cut shot for FOUR! Square pe thunder! What a hit!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xf20', text: 'FOUR! Stepped out and drove! Class player yaar!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
];

export const HL_BOUNDARY_SIX: CommentaryLine[] = [
  { id: 'xs1', text: 'SIX! Bhai ne toh asman dikha diya ball ko! Out of the park!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.15, delay: 1000 },
  { id: 'xs2', text: 'MAXIMUM! Ball stands mein! Crowd paagal!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.2, delay: 1000 },
  { id: 'xs3', text: 'CHHAKKAA! That ball is not coming back yaar!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.15, delay: 1000,
    followUp: { id: 'xs3f', text: 'Power level over 9000!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'xs4', text: 'OUT. OF. THE. GROUND! Kya hit hai bhai!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'xs5', text: 'SIX! Stadium shaking hai! Monster hit!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.2, delay: 1000 },
  { id: 'xs6', text: 'It\'s GONE! Gaya! IT\'S GONE! SIX!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.25, delay: 1000 },
  { id: 'xs7', text: 'MAXIMUM! Second tier mein! HUGE SIX!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'xs8', text: 'Scooped! AUDACIOUS! SIX! Kya cheek hai!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.15, delay: 1000 },
  { id: 'xs9', text: 'SIX in the death! Equation change ho raha hai!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000, minSituation: 'tense' },
  { id: 'xs10', text: 'CHHAKKAA! Match jeet ke le jaayega kya?!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.25, delay: 1000, minSituation: 'critical' },
  // Additional SIX
  { id: 'xs11', text: 'CHHAKKAA bro! Long-on ke upar! Into the stands! Gone!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.15, delay: 1000 },
  { id: 'xs12', text: 'SIX yaar! Rocket launch! Where did that land?!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'xs13', text: 'MAXIMUM! Scoop shot over fine leg! Outrageous bhai!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.15, delay: 1000 },
  { id: 'xs14', text: 'CHHAKKAA! Flat bat se maara! Brutal yaar! Bowler dead!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'xs15', text: 'SIX! Switch hit! Left to right and BOOM! Pagal hai ye!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.2, delay: 1000 },
  { id: 'xs16', text: 'Helicopter shot for SIX bro! Only legends play this!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.2, delay: 1000 },
  { id: 'xs17', text: 'MAXIMUM! Ball abhi bhi dhundh rahe hai! What a hit yaar!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.15, delay: 1000 },
  { id: 'xs18', text: 'SIX! Spinner ko dance floor pe le jaake maara!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'xs19', text: 'CHHAKKAA! Pull against pace! Timing is unreal bhai!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.2, delay: 1000 },
  { id: 'xs20', text: 'SIX! DJ playing! Crowd going mental! This is ENTERTAINMENT!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.2, delay: 1000 },
];

export const HL_WICKET_BOWLED: CommentaryLine[] = [
  { id: 'xwb1', text: 'BOWLED! Stumps shattered! Gaya bhai!', voice: 'main', emotion: 'dramatic', rate: 1.15, pitch: 1.05, delay: 500 },
  { id: 'xwb2', text: 'TIMBER! Clean bowled! Band baja diya!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500,
    followUp: { id: 'xwb2f', text: 'Jaadu tha ball mein yaar!', voice: 'color', emotion: 'dramatic', rate: 1.0, pitch: 1.0, delay: 0 }
  },
  { id: 'xwb3', text: 'Castled! Stumps go flying! Batsman shocked!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'xwb4', text: 'RIGHT THROUGH THE GATE! BOWLED! Unplayable tha!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'xwb5', text: 'GAYA! OFF STUMP cartwheeling! What a ball!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
];

export const HL_WICKET_CAUGHT: CommentaryLine[] = [
  { id: 'xwc1', text: 'CAUGHT! Kya catch hai! What a grab!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xwc2', text: 'Up in the air... TAKEN! OUT! Superb catch yaar!', voice: 'main', emotion: 'dramatic', rate: 1.25, pitch: 1.15, delay: 800 },
  { id: 'xwc3', text: 'Edged aur caught behind! Keeper ne mistake nahi ki!', voice: 'main', emotion: 'dramatic', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'xwc4', text: 'CAUGHT! Big wicket at this stage!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
];

export const HL_WICKET_LBW: CommentaryLine[] = [
  { id: 'xwl1', text: 'LBW! Finger upar! OUT! Plumb tha!', voice: 'main', emotion: 'dramatic', rate: 1.15, pitch: 1.05, delay: 1200 },
  { id: 'xwl2', text: 'HOWZAT! Aur umpire ne de diya! LBW!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 1200 },
  { id: 'xwl3', text: 'Pad pe laga! Stone dead LBW! No doubt!', voice: 'main', emotion: 'dramatic', rate: 1.15, pitch: 1.05, delay: 1200 },
];

export const HL_OVER_END: CommentaryLine[] = [
  { id: 'xoe1', text: 'Over done. Change of ends.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'xoe2', text: 'Over khatam bhai. Bowler change.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'xoe3', text: 'End of the over. Accha over tha.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
];

export const HL_MILESTONE_50: CommentaryLine[] = [
  { id: 'xm50_1', text: 'FIFTY! Well deserved bhai! Half-century!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.1, delay: 0 },
  { id: 'xm50_2', text: 'Pachaas! Bat up! Crowd on their feet!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 0 },
];

export const HL_MILESTONE_100: CommentaryLine[] = [
  { id: 'xm100_1', text: 'CENTURY! SHANDAR! Standing ovation bhai!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0 },
  { id: 'xm100_2', text: 'HUNDRED! Helmet off! Arms up! What a knock yaar!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0 },
];

export const HL_MATCH_WIN: CommentaryLine[] = [
  { id: 'xmw1', text: 'VICTORY! Jeet gaye bhai! What a game!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.15, delay: 0 },
  { id: 'xmw2', text: 'Winners! Celebrations all around! Kamaal!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.15, delay: 0 },
];

export const HL_MATCH_LOSS: CommentaryLine[] = [
  { id: 'xml1', text: 'Haar gaye yaar. Better luck next time.', voice: 'main', emotion: 'disappointed', rate: 0.95, pitch: 0.95, delay: 0 },
  { id: 'xml2', text: "Wasn't meant to be today. Agle baar pakka.", voice: 'main', emotion: 'disappointed', rate: 0.95, pitch: 0.95, delay: 0 },
  { id: 'xml3', text: 'Tough loss bro. But we go again next match!', voice: 'main', emotion: 'disappointed', rate: 0.95, pitch: 0.95, delay: 0 },
];

// ── RUN OUT ──
export const HL_WICKET_RUN_OUT: CommentaryLine[] = [
  { id: 'xwr1', text: 'RUN OUT! Direct hit bhai! What fielding!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xwr2', text: 'Mix-up yaar! RUN OUT! Communication fail!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xwr3', text: 'Diving throw! Stumps pe! RUN OUT! Incredible!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xwr4', text: 'Short of crease bro! RUN OUT! That hurts!', voice: 'main', emotion: 'dramatic', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'xwr5', text: 'Criminal running! RUN OUT! Batsman sacrificed!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
];

// ── STUMPED ──
export const HL_WICKET_STUMPED: CommentaryLine[] = [
  { id: 'xws1', text: 'STUMPED! Keeper ne bails uda diye! Lightning fast bro!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xws2', text: 'Aage aaya and missed! STUMPED yaar! Gone!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'xws3', text: 'STUMPED! Crease chhoda and paid the price! Out!', voice: 'main', emotion: 'dramatic', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'xws4', text: 'Quick hands from the keeper! STUMPED! Superb glovework!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
];

// ── INNINGS START ──
export const HL_INNINGS_START: CommentaryLine[] = [
  { id: 'xis1', text: 'Innings start ho raha hai! Let\'s go bhai!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'xis2', text: 'New innings! Fresh start yaar! Here we go!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 0 },
  { id: 'xis3', text: 'Game on! Innings shuru! Batsman ready hai!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
];

// ── TOSS ──
export const HL_TOSS_RESULT: CommentaryLine[] = [
  { id: 'xtr1', text: 'Toss done bhai! Coin flip ho gaya! Decision time!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'xtr2', text: 'Coin toss complete! Ab dekhte hain kya choose karte hain!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
];

// ═══════════════════════════════════════════════════
// CLUTCH / SITUATION-AWARE — Hinglish
// ═══════════════════════════════════════════════════

export const HL_CLUTCH_RUNS: CommentaryLine[] = [
  { id: 'xcr1', text: 'Every run is worth GOLD right now bhai! Single taken!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.1, delay: 100, minSituation: 'tense' },
  { id: 'xcr2', text: 'Pressure mein run lena is next level! Smart cricket yaar!', voice: 'main', emotion: 'dramatic', rate: 1.1, pitch: 1.05, delay: 100, minSituation: 'tense' },
  { id: 'xcr3', text: 'Match decide ho raha hai bhai! Ye run matter karega!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.1, delay: 100, minSituation: 'critical' },
  { id: 'xcr4', text: 'Tight game mein tight running! Every run counts bro!', voice: 'main', emotion: 'dramatic', rate: 1.1, pitch: 1.05, delay: 100, minSituation: 'tense' },
];

export const HL_CLUTCH_FOUR: CommentaryLine[] = [
  { id: 'xcf1', text: 'FOUR! Under pressure bhai! Kya CLUTCH shot hai!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 800, minSituation: 'tense',
    followUp: { id: 'xcf1f', text: 'Big players show up in big moments yaar!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'xcf2', text: 'BOUNDARY jab chahiye tab! Equation shift ho raha hai bro!', voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.15, delay: 800, minSituation: 'critical' },
  { id: 'xcf3', text: 'CHAUKAA! Pressure mein! Ye batsman alag level hai yaar!', voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.15, delay: 800, minSituation: 'tense' },
  { id: 'xcf4', text: 'FOUR! Ice in the veins bhai! No fear! Just shots!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 800, minSituation: 'critical' },
];

export const HL_CLUTCH_SIX: CommentaryLine[] = [
  { id: 'xcs1', text: 'SIX bro! IN THE CLUTCH! This player is BUILT for this!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.25, delay: 1000, minSituation: 'critical',
    followUp: { id: 'xcs1f', text: 'Unreal courage under fire yaar!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'xcs2', text: 'MAXIMUM! When it matters! Stadium shake ho raha hai bhai!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.25, delay: 1000, minSituation: 'critical' },
  { id: 'xcs3', text: 'CHHAKKAA! Equation DESTROYED! What a pressure hit yaar!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000, minSituation: 'tense' },
  { id: 'xcs4', text: 'SIX! Finisher mode ON bhai! Match jeetne wala shot!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.25, delay: 1000, minSituation: 'critical' },
];

export const HL_CLUTCH_WICKET: CommentaryLine[] = [
  { id: 'xcw1', text: 'WICKET bro! Pressure cooker mein! GAME CHANGER!', voice: 'main', emotion: 'dramatic', rate: 1.25, pitch: 1.15, delay: 500, minSituation: 'tense',
    followUp: { id: 'xcw1f', text: 'Fielding side paagal ho gaya celebrating! What a moment!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'xcw2', text: 'OUT! Sahi time pe sahi wicket! Match badal gaya yaar!', voice: 'main', emotion: 'dramatic', rate: 1.25, pitch: 1.15, delay: 500, minSituation: 'critical' },
  { id: 'xcw3', text: 'Big wicket falls bhai! Batting side under serious pressure!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500, minSituation: 'critical' },
  { id: 'xcw4', text: 'WICKET in the death! Momentum shift! Drama bro!', voice: 'main', emotion: 'dramatic', rate: 1.25, pitch: 1.15, delay: 500, minSituation: 'tense' },
];

export const HL_LAST_OVER: CommentaryLine[] = [
  { id: 'xlo1', text: 'LAST OVER bhai! Six balls! Match decide hone wala hai!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.15, delay: 0, minSituation: 'tense',
    followUp: { id: 'xlo1f', text: 'Hearts pounding yaar. This is peak cricket.', voice: 'color', emotion: 'dramatic', rate: 1.0, pitch: 1.0, delay: 0 }
  },
  { id: 'xlo2', text: 'Final over! Everything on the line bro! Can they do it?!', voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.2, delay: 0, minSituation: 'critical' },
];
