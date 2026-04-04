// ═══════════════════════════════════════════════════
// Doc 3 — Chapter 3.2: Hindi Commentary Pool
// ═══════════════════════════════════════════════════

import type { CommentaryLine } from '@/engines/types';

export const HI_DOT_BALL: CommentaryLine[] = [
  { id: 'hd1', text: 'Koi run nahi. Dot ball.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'hd2', text: 'Acchi bowling. Batsman rok ke rakh diya.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'hd3', text: 'Defence! Solid defence. Zero.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'hd4', text: 'Kuch nahi mila. Dot.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'hd5', text: 'Tight bowling jaari hai. Ek aur dot.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'hd6', text: 'Chhod diya bahar. Samajhdari.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'hd7', text: 'Beat ho gaya batsman! Close one!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 150 },
  { id: 'hd8', text: 'Seedhe fielder ke haath mein. No run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'hd9', text: 'Pressure build ho raha hai. Dot.', voice: 'main', emotion: 'neutral', rate: 0.95, pitch: 1.0, delay: 200 },
  { id: 'hd10', text: 'Yorker! Dig out kiya. Dot ball.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'hd11', text: 'Bouncer! Neeche jhuk gaya. Safe.', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 150 },
  { id: 'hd12', text: 'Rok ke rakh diya. No run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'hd13', text: 'Solid block. Koi run nahi.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'hd14', text: 'Accha ball tha. Batsman ne respect kiya.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'hd15', text: 'Miss! Swing and a miss! Dot.', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
];

export const HI_RUNS: CommentaryLine[] = [
  { id: 'hr1', text: 'Ek run liya. Smart batting.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'hr2', text: 'Gap mein daala. Single le liya.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'hr3', text: 'Do run! Acchi running!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 100 },
  { id: 'hr4', text: 'Teen run! Bhaag rahe hain! Superb running!', voice: 'main', emotion: 'excited', rate: 1.1, pitch: 1.05, delay: 100 },
  { id: 'hr5', text: 'Turn liya second ke liye. Safe!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 100 },
  { id: 'hr6', text: 'Scoreboard chal raha hai. Ek aur run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'hr7', text: 'Nudge kiya leg side mein. Single.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'hr8', text: 'Deep mein maara. Do run le liye.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
];

export const HI_BOUNDARY_FOUR: CommentaryLine[] = [
  { id: 'hf1', text: 'CHAUKAA! Kya shot maara hai!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.0, delay: 800 },
  { id: 'hf2', text: 'FOUR! Boundary! Balle balle!', voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.05, delay: 800 },
  { id: 'hf3', text: 'Gajab ka shot! Seedha rope tak!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.0, delay: 800,
    followUp: { id: 'hf3f', text: 'Kya timing hai yaar!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'hf4', text: 'Zabardast drive! Fielder haath bhi nahi lagaa paya!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.0, delay: 800 },
  { id: 'hf5', text: 'CHAUKAA! Cover se nikal gayi seedhi!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.0, delay: 800 },
  { id: 'hf6', text: 'Dhamakedar shot! FOUR!', voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.05, delay: 800 },
  { id: 'hf7', text: 'Pull shot! Rope tak! Chaukaa!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.0, delay: 800,
    followUp: { id: 'hf7f', text: 'Batsman ne bowler ki le li!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'hf8', text: 'FOUR! Shandar shot! Kya placement hai!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.05, delay: 800 },
  { id: 'hf9', text: 'Rope tak pahunch gayi! Chaukaa!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.0, delay: 800 },
  { id: 'hf10', text: 'Boundary! Batsman aag mein hai aaj!', voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.05, delay: 800 },
];

export const HI_BOUNDARY_SIX: CommentaryLine[] = [
  { id: 'hs1', text: 'CHHAKKAA! Stadium ke bahar chali gayi!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.05, delay: 1000 },
  { id: 'hs2', text: 'MAXIMUM! Bahut bada hit yaar!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.1, delay: 1000 },
  { id: 'hs3', text: 'Dhaaannn! Gend stands mein!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.05, delay: 1000,
    followUp: { id: 'hs3f', text: 'Ye toh pagal hai! Kya shot hai!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'hs4', text: 'SIX! Ball toh gol ho gayi!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.05, delay: 1000 },
  { id: 'hs5', text: 'Arre wah! Kya maara hai! CHHAKKAA!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.1, delay: 1000 },
  { id: 'hs6', text: 'Ball toh dhundni padegi ab! MAXIMUM!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.05, delay: 1000 },
  { id: 'hs7', text: 'DHANNN! Bhai ne toh asman dikha diya ball ko!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.1, delay: 1000,
    followUp: { id: 'hs7f', text: 'Kya power hai! Wah!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'hs8', text: 'Uff! Jor se maara hai! SIX! Bahar!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.05, delay: 1000 },
  { id: 'hs9', text: 'CHHAKKAA! Crowd paagal ho gaya!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.1, delay: 1000 },
  { id: 'hs10', text: 'Ye ball wapas nahi aayegi! SIX!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.05, delay: 1000 },
];

export const HI_WICKET_BOWLED: CommentaryLine[] = [
  { id: 'hwb1', text: 'OUT! Udd gaya gilli danda!', voice: 'main', emotion: 'dramatic', rate: 0.9, pitch: 1.0, delay: 500 },
  { id: 'hwb2', text: 'WICKET! Stumps bikhar gaye! Clean bowled!', voice: 'main', emotion: 'dramatic', rate: 0.95, pitch: 1.0, delay: 500,
    followUp: { id: 'hwb2f', text: 'Kya bowling ki hai yaar! Lajawab!', voice: 'color', emotion: 'dramatic', rate: 1.0, pitch: 1.0, delay: 0 }
  },
  { id: 'hwb3', text: 'Gaya! BOWLED! Band baja diya!', voice: 'main', emotion: 'dramatic', rate: 1.0, pitch: 1.05, delay: 500 },
  { id: 'hwb4', text: 'TIMBER! Stumps ka danda udd gaya!', voice: 'main', emotion: 'dramatic', rate: 0.95, pitch: 1.0, delay: 500 },
  { id: 'hwb5', text: 'Saaf bowled! Kuch nahi kar paya batsman!', voice: 'main', emotion: 'dramatic', rate: 0.95, pitch: 1.0, delay: 500,
    followUp: { id: 'hwb5f', text: 'Ye ball toh jaadu thi!', voice: 'color', emotion: 'dramatic', rate: 1.0, pitch: 1.0, delay: 0 }
  },
];

export const HI_WICKET_CAUGHT: CommentaryLine[] = [
  { id: 'hwc1', text: 'CATCH! OUT! Kya catch pakda hai!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'hwc2', text: 'Hawa mein! Pakad liya! OUT!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'hwc3', text: 'CAUGHT! Shandar catching! Gaya batsman!', voice: 'main', emotion: 'dramatic', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'hwc4', text: 'Edge lagi aur... CAUGHT! OUT!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
];

export const HI_WICKET_LBW: CommentaryLine[] = [
  { id: 'hwl1', text: 'LBW! Ungli upar! OUT!', voice: 'main', emotion: 'dramatic', rate: 1.15, pitch: 1.05, delay: 1200 },
  { id: 'hwl2', text: 'Pad pe laga! HOWZAT! OUT! LBW!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 1200 },
  { id: 'hwl3', text: 'Plumb! Bilkul saamne tha! LBW!', voice: 'main', emotion: 'dramatic', rate: 1.1, pitch: 1.0, delay: 1200 },
  { id: 'hwl4', text: 'Appeal! Aur umpire ne de diya! OUT!', voice: 'main', emotion: 'dramatic', rate: 1.15, pitch: 1.05, delay: 1200 },
];

export const HI_OVER_END: CommentaryLine[] = [
  { id: 'hoe1', text: 'Over khatam.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'hoe2', text: 'Ye over khatam hua. Bowler change hoga.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'hoe3', text: 'Over poora hua. Accha over tha.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
];

export const HI_MILESTONE_50: CommentaryLine[] = [
  { id: 'hm50_1', text: 'FIFTY! Shandar half-century! Wah!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.1, delay: 0 },
  { id: 'hm50_2', text: 'Pachaas! Bat upar! Crowd khada ho gaya!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 0 },
  { id: 'hm50_3', text: 'Half century! Kamaal ki batting!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.1, delay: 0 },
];

export const HI_MILESTONE_100: CommentaryLine[] = [
  { id: 'hm100_1', text: 'CENTURY! SHANDAR SHATAAK! Standing ovation!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0 },
  { id: 'hm100_2', text: 'SOO! Helmet utaara! Haath upar! CENTURY!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0 },
  { id: 'hm100_3', text: 'Shataak! Kya innings khela hai! Yaadgaar!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0 },
];

export const HI_MATCH_WIN: CommentaryLine[] = [
  { id: 'hmw1', text: 'Jeet gaye! JEET GAYE! Kya performance!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.15, delay: 0 },
  { id: 'hmw2', text: 'Victory! Jashn mana lo! Kamaal kar diya!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.15, delay: 0 },
];

export const HI_MATCH_LOSS: CommentaryLine[] = [
  { id: 'hml1', text: 'Haar gaye. Dil toota. Agle baar sahi.', voice: 'main', emotion: 'disappointed', rate: 0.95, pitch: 0.95, delay: 0 },
  { id: 'hml2', text: 'Aaj nahi hua. Mehnat thi, par result nahi aaya.', voice: 'main', emotion: 'disappointed', rate: 0.95, pitch: 0.95, delay: 0 },
];
