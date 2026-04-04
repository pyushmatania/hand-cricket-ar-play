// ═══════════════════════════════════════════════════
// Doc 3 — Chapter 3.3: Hinglish Commentary Pool
// Mix of English structure with Hindi flavor
// ═══════════════════════════════════════════════════

import type { CommentaryLine } from '@/engines/types';

export const HL_DOT_BALL: CommentaryLine[] = [
  { id: 'xd1', text: 'Solid defence yaar. No run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xd2', text: 'Dot ball. Bowler ne tight rakha.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xd3', text: 'Beaten! Close shave bhai!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'xd4', text: 'Nothing doing. Another dot.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xd5', text: 'Pressure build ho raha hai. Dot ball.', voice: 'main', emotion: 'neutral', rate: 0.95, pitch: 1.0, delay: 200 },
  { id: 'xd6', text: 'Play and miss! Kuch nahi mila.', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 150 },
  { id: 'xd7', text: 'Dead bat. Safe as houses.', voice: 'main', emotion: 'neutral', rate: 0.95, pitch: 1.0, delay: 200 },
  { id: 'xd8', text: 'Blocked with respect. Good ball tha.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'xd9', text: 'Yorker! Somehow dig out kiya. Dot.', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 200 },
  { id: 'xd10', text: 'Left alone wisely. Samajhdari dikhaayi.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
];

export const HL_RUNS: CommentaryLine[] = [
  { id: 'xr1', text: 'Single le liya. Smart cricket.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'xr2', text: 'Gap mein push kiya. Easy single.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'xr3', text: 'Two runs! Acchi running yaar!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 100 },
  { id: 'xr4', text: 'Three! Bhaag rahe hain like their life depends on it!', voice: 'main', emotion: 'excited', rate: 1.1, pitch: 1.05, delay: 100 },
  { id: 'xr5', text: 'Strike rotate kar rahe hain. Smart.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'xr6', text: 'Nudge for one. Keeps the board ticking.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
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
];
