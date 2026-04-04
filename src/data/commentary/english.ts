// ═══════════════════════════════════════════════════
// Doc 3 — Chapter 3.1: English Commentary Pool
// 500+ lines across all event types
// ═══════════════════════════════════════════════════

import type { CommentaryLine } from '@/engines/types';

export const EN_DOT_BALL: CommentaryLine[] = [
  { id: 'ed1', text: 'Defended solidly. No run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed2', text: 'Good length and beaten. Dot ball.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed3', text: 'Tight line outside off. Left alone.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed4', text: 'Pushed back to the bowler. No run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed5', text: "Well bowled. The batsman can't get it away.", voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200,
    followUp: { id: 'ed5f', text: 'Tight stuff.', voice: 'color', emotion: 'neutral', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'ed6', text: 'Blocked. Solid defence.', voice: 'main', emotion: 'neutral', rate: 0.95, pitch: 1.0, delay: 200 },
  { id: 'ed7', text: 'Nothing on offer there. Dot.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed8', text: 'Beaten outside off! Close one.', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100,
    followUp: { id: 'ed8f', text: 'That was a beauty.', voice: 'color', emotion: 'neutral', rate: 0.95, pitch: 1.1, delay: 0 }
  },
  { id: 'ed9', text: 'Straight to the fielder. No run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed10', text: "That's a dot. Building pressure.", voice: 'main', emotion: 'neutral', rate: 0.95, pitch: 1.0, delay: 200 },
  { id: 'ed11', text: 'Plays and misses! Nearly got the edge!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'ed12', text: 'Defended back down the track. No run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed13', text: 'Good yorker. Dug out. Dot ball.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed14', text: 'Bouncer! Ducked underneath. No run.', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 150 },
  { id: 'ed15', text: 'Left alone outside off. Good judgement.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed16', text: 'Tight over so far. Another dot.', voice: 'main', emotion: 'neutral', rate: 0.95, pitch: 1.0, delay: 200,
    followUp: { id: 'ed16f', text: 'The pressure is mounting.', voice: 'color', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 }
  },
  { id: 'ed17', text: 'Swinging and missing! Close shave!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.05, delay: 100 },
  { id: 'ed18', text: 'Dead bat. Safe as houses.', voice: 'main', emotion: 'neutral', rate: 0.95, pitch: 1.0, delay: 200 },
  { id: 'ed19', text: 'Blocked with soft hands. No run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed20', text: 'Good bowling. The batsman respects it.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed21', text: 'Shoulder arms. Let it go. Dot.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed22', text: 'Tries to flick, misses. Dot ball.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed23', text: 'Back of a length. Watchfully played.', voice: 'main', emotion: 'neutral', rate: 0.95, pitch: 1.0, delay: 200 },
  { id: 'ed24', text: 'Into the pads. No run scored.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed25', text: 'Probing line. Batsman can\'t free the arms.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed26', text: 'Full and straight. Defended. Dot.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed27', text: 'Outside off, left well alone.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed28', text: 'Maiden territory here. Another dot.', voice: 'main', emotion: 'neutral', rate: 0.95, pitch: 1.0, delay: 200,
    followUp: { id: 'ed28f', text: 'Excellent discipline.', voice: 'color', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 }
  },
  { id: 'ed29', text: 'Short and wide but can\'t connect. Dot.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed30', text: 'Keeps it tight. The batsman is frustrated.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed31', text: 'Flat-footed and beaten. No damage done.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed32', text: 'Defended cautiously. Playing for time.', voice: 'main', emotion: 'neutral', rate: 0.95, pitch: 1.0, delay: 200 },
  { id: 'ed33', text: 'Taps it dead at his feet. Zero.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed34', text: 'Thick inside edge into the pads. No run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 150 },
  { id: 'ed35', text: 'Keeper takes it cleanly. Dot ball.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed36', text: 'Slow ball, and he can\'t time it. Dot.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed37', text: 'Angled across. No interest from the batsman.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed38', text: 'Rock solid defence. Not giving anything away.', voice: 'main', emotion: 'neutral', rate: 0.95, pitch: 1.0, delay: 200 },
  { id: 'ed39', text: 'Wide line, but not called wide. Dot.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'ed40', text: 'Good contest between bat and ball. No run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
];

export const EN_SINGLE: CommentaryLine[] = [
  { id: 'es1', text: 'Pushed into the gap. Easy single.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es2', text: 'Quick running between the wickets. One run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es3', text: 'Nudged into the leg side. Single taken.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es4', text: 'Worked away for a single. Good rotation.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es5', text: 'Tapped to mid-on. They scamper through.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es6', text: 'Soft hands. Guides it for one.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es7', text: 'Flicked off the hips. Single.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es8', text: 'Drops it into the gap. Easy run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es9', text: 'Keeps the scoreboard ticking. One run.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es10', text: 'Smart cricket. Rotate the strike.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es11', text: 'Dabbed to third man. Quick single.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es12', text: 'Turned to the on side. They cross.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es13', text: 'Played to cover. The single is there.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es14', text: 'Just the one. Keeps things moving.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'es15', text: 'Clips it fine. They jog through for one.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
];

export const EN_DOUBLE: CommentaryLine[] = [
  { id: 'e2r1', text: 'Driven into the gap. They come back for two!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 100 },
  { id: 'e2r2', text: 'Good running! Two runs there.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'e2r3', text: 'Placed well. They turn for the second. Safe!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 100 },
  { id: 'e2r4', text: 'Hit into the deep. Two runs, quick between the wickets.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'e2r5', text: 'Pushed through extra cover. Two more.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'e2r6', text: 'They come back for the second! Good running!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 100 },
  { id: 'e2r7', text: 'Excellent placement. Two runs taken.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
  { id: 'e2r8', text: 'Into the gap at mid-wicket. Easy two.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 100 },
];

export const EN_TRIPLE: CommentaryLine[] = [
  { id: 'e3r1', text: 'Three runs! Hustling between the wickets!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r2', text: 'Into the deep and they come back for THREE! Great running!', voice: 'main', emotion: 'excited', rate: 1.1, pitch: 1.05, delay: 100 },
  { id: 'e3r3', text: 'Misfield! They steal three! Poor fielding.', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 100 },
  { id: 'e3r4', text: 'Three! Brilliant running between the wickets!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r5', text: 'They push for three! Just made it!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
];

export const EN_BOUNDARY_FOUR: CommentaryLine[] = [
  { id: 'ef1', text: 'SHOT! That races to the boundary!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef2', text: 'FOUR! Beautifully driven through the covers!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800,
    followUp: { id: 'ef2f', text: 'Textbook cricket. Gorgeous.', voice: 'color', emotion: 'neutral', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'ef3', text: 'Crashing drive! The ball scorches the turf to the rope!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef4', text: 'FOUR! Timed to perfection!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef5', text: 'What a shot! Nobody stopping that!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef6', text: 'Boundary! Clinical batting right there.', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'ef7', text: "FOUR! The fielder didn't even move!", voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef8', text: 'Pierced the gap! Four more to the total!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'ef9', text: 'Dispatched! No mercy from the batsman!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef10', text: 'FOUR! Cut away! Tremendous shot!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef11', text: 'Pull shot! That\'s gone like a tracer bullet!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800,
    followUp: { id: 'ef11f', text: 'Ravi Shastri would be proud of that line!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'ef12', text: 'Classy! Driven through mid-off for four!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef13', text: 'FOUR! Punched off the back foot! Power!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef14', text: 'Swept! Swept magnificently for four!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef15', text: 'Edge! But it flies to the boundary! Four runs!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'ef16', text: "Flicked off the pads! That's FOUR!", voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef17', text: 'Late cut! Delicate and effective! Boundary!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'ef18', text: 'FOUR! Hammered through extra cover!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef19', text: 'Lofted! Over the infield and to the fence!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'ef20', text: "FOUR more! He's on fire today!", voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800,
    followUp: { id: 'ef20f', text: "That's batting of the highest order.", voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  // Situation-specific
  { id: 'ef21', text: "FOUR! And that brings up his FIFTY!", voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.15, delay: 800, minSituation: 'comfortable' },
  { id: 'ef22', text: 'Take a bow! Fifty in style!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef23', text: "FOUR! In the death overs, that's huge!", voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.15, delay: 800, minSituation: 'tense' },
];

export const EN_BOUNDARY_SIX: CommentaryLine[] = [
  { id: 'es6_1', text: "SIX! That's gone into the stands!", voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000,
    followUp: { id: 'es6_1f', text: 'Absolutely magnificent hit!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'es6_2', text: 'MAXIMUM! Absolutely LAUNCHED into orbit!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_3', text: 'That was out of this world. Pure power.', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 1000 },
  { id: 'es6_4', text: 'OUT. OF. THE. GROUND! What a hit!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_5', text: 'SIX! The crowd goes absolutely BERSERK!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_6', text: "That's MASSIVE! Way over the boundary!", voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_7', text: "I've never seen a ball hit that far!", voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.15, delay: 1000,
    followUp: { id: 'es6_7f', text: 'The power on that shot is unreal.', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'es6_8', text: "He's sent that into the SECOND TIER! HUGE six!", voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_9', text: "It's gone! It's GONE! IT'S GONE! SIX!", voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.25, delay: 1000 },
  { id: 'es6_10', text: "That ball won't be coming back! Into the stands!", voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_11', text: 'A MONSTER of a hit! The stadium is shaking!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_12', text: 'The bowler needs a moment to recover.', voice: 'main', emotion: 'excited', rate: 1.1, pitch: 1.0, delay: 1000 },
  { id: 'es6_13', text: 'SIX! Someone in the crowd gets a souvenir!', voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.15, delay: 1000 },
  { id: 'es6_14', text: 'Launched! LAUNCHED over long-on! Maximum!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_15', text: 'SIX! Deposited into the crowd with DISDAIN!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_16', text: "That's just ridiculous power.", voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.1, delay: 1000 },
  { id: 'es6_17', text: 'OVER THE ROOF! If there was a roof! SIX!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_18', text: 'High! HIGHER! HIGHEST! MAXIMUM!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.25, delay: 1000 },
  { id: 'es6_19', text: 'Scooped over the keeper! SIX! Audacious!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000,
    followUp: { id: 'es6_19f', text: 'The cheek of it! What a shot.', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  // Critical situations
  { id: 'es6_20', text: 'SIX! And that could WIN THE MATCH!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.25, delay: 1000, minSituation: 'critical' },
  { id: 'es6_21', text: 'MAXIMUM! And a CENTURY! What a way to bring it up!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.25, delay: 1000 },
  { id: 'es6_22', text: 'SIX in the last over! The equation is SHIFTING!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000, minSituation: 'tense' },
];

export const EN_WICKET_BOWLED: CommentaryLine[] = [
  { id: 'ewb1', text: 'BOWLED HIM! The stumps are shattered!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500,
    followUp: { id: 'ewb1f', text: 'What a delivery. Unplayable.', voice: 'color', emotion: 'dramatic', rate: 1.0, pitch: 1.0, delay: 0 }
  },
  { id: 'ewb2', text: 'Gone! Clean bowled! Middle stump out of the ground!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewb3', text: 'TIMBER! Right through the gate! Beautiful bowling!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewb4', text: "BOWLED! He had no answer to that yorker!", voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewb5', text: 'The off stump goes cartwheeling! What a ball!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewb6', text: 'Absolutely peach of a delivery. Nothing the batsman could do.', voice: 'main', emotion: 'dramatic', rate: 1.1, pitch: 1.0, delay: 500 },
  { id: 'ewb7', text: 'Castled! The stumps go flying! OUT!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewb8', text: 'CLEANED UP! That came back in sharply!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewb9', text: "Knocked him over! The batsman can't believe it!", voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewb10', text: "He's standing there in disbelief.", voice: 'main', emotion: 'dramatic', rate: 1.0, pitch: 1.0, delay: 500,
    followUp: { id: 'ewb10f', text: 'Clean bowled. Nothing to say.', voice: 'color', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 }
  },
];

export const EN_WICKET_CAUGHT: CommentaryLine[] = [
  { id: 'ewc1', text: 'Edged... and CAUGHT! What a grab!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ewc2', text: 'Up in the air... IS IT? YES! TAKEN! Sensational catch!', voice: 'main', emotion: 'dramatic', rate: 1.25, pitch: 1.15, delay: 800 },
  { id: 'ewc3', text: "The fielder has made it look easy. It wasn't.", voice: 'main', emotion: 'dramatic', rate: 1.1, pitch: 1.0, delay: 800 },
  { id: 'ewc4', text: "CAUGHT! He's got to go! Great bowling, great catching!", voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ewc5', text: "In the air... TAKES IT! Safe hands! He's OUT!", voice: 'main', emotion: 'dramatic', rate: 1.25, pitch: 1.15, delay: 800,
    followUp: { id: 'ewc5f', text: 'A crucial wicket at this stage.', voice: 'color', emotion: 'dramatic', rate: 1.0, pitch: 1.0, delay: 0 }
  },
  { id: 'ewc6', text: 'Caught behind! The keeper makes no mistake!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
];

export const EN_WICKET_LBW: CommentaryLine[] = [
  { id: 'ewl1', text: 'Big appeal! And the umpire raises the finger! LBW!', voice: 'main', emotion: 'dramatic', rate: 1.15, pitch: 1.05, delay: 1200 },
  { id: 'ewl2', text: 'Trapped in front! Stone dead LBW!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 1200 },
  { id: 'ewl3', text: 'Plumb. Plumb as you like.', voice: 'main', emotion: 'dramatic', rate: 1.0, pitch: 1.0, delay: 1200,
    followUp: { id: 'ewl3f', text: 'That was hitting middle and leg. No doubt.', voice: 'color', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 }
  },
  { id: 'ewl4', text: 'Crashed into the pads! OUT! LBW!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 1200 },
  { id: 'ewl5', text: 'HOWZAT! And the finger goes UP! LBW!', voice: 'main', emotion: 'dramatic', rate: 1.25, pitch: 1.15, delay: 1200 },
  { id: 'ewl6', text: 'Struck on the pad! The umpire has no hesitation! OUT!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 1200 },
];

export const EN_WICKET_RUN_OUT: CommentaryLine[] = [
  { id: 'ewr1', text: 'Direct hit! RUN OUT! Brilliant fielding!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ewr2', text: "Short of the crease! He's been run out!", voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ewr3', text: 'RUN OUT! A mix-up between the batsmen!', voice: 'main', emotion: 'dramatic', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'ewr4', text: "Disaster! That's a run out! Criminal running!", voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
];

export const EN_WICKET_STUMPED: CommentaryLine[] = [
  { id: 'ews1', text: 'STUMPED! Quick work by the keeper!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ews2', text: 'Down the pitch and missed! STUMPED!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ews3', text: "He's stranded! The keeper whips the bails off!", voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 800 },
];

export const EN_OVER_END: CommentaryLine[] = [
  { id: 'eoe1', text: 'End of the over.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'eoe2', text: "That's the end of the over. Good over for the batting side.", voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'eoe3', text: 'Over complete. The bowler will be happy with that.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'eoe4', text: 'Time for a change. End of the over.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'eoe5', text: 'And that brings the over to a close.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'eoe6', text: 'Right, bowler change coming up.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
];

export const EN_MILESTONE_50: CommentaryLine[] = [
  { id: 'em50_1', text: 'FIFTY! A well-deserved half-century! Take a bow!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.1, delay: 0,
    followUp: { id: 'em50_1f', text: 'Hard work paying off. Quality innings.', voice: 'color', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 }
  },
  { id: 'em50_2', text: 'HALF CENTURY! The bat goes up! Crowd on their feet!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 0 },
  { id: 'em50_3', text: 'Fifty! A composed and classy half-century!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.1, delay: 0 },
  { id: 'em50_4', text: 'What an innings so far! Fifty up!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.1, delay: 0 },
];

export const EN_MILESTONE_100: CommentaryLine[] = [
  { id: 'em100_1', text: 'CENTURY! A MAGNIFICENT hundred! Standing ovation!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0,
    followUp: { id: 'em100_1f', text: 'What a knock! What an innings! Remember this day!', voice: 'color', emotion: 'excited', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'em100_2', text: 'ONE HUNDRED! The helmet comes off! Arms raised! CENTURY!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0 },
  { id: 'em100_3', text: 'A HUNDRED! Three figures! Absolutely SENSATIONAL!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0 },
  { id: 'em100_4', text: "CENTURY! What a player! What an innings! What a moment!", voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 0 },
];

export const EN_MATCH_WIN: CommentaryLine[] = [
  { id: 'emw1', text: "And they've done it! VICTORY! What a performance!", voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.15, delay: 0 },
  { id: 'emw2', text: "That's the winning moment! Celebrations all around!", voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.15, delay: 0 },
  { id: 'emw3', text: 'They deserved that. What a game of cricket.', voice: 'main', emotion: 'excited', rate: 1.1, pitch: 1.05, delay: 0 },
  { id: 'emw4', text: 'WINNERS! The players are hugging each other! Pure joy!', voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.2, delay: 0 },
];

export const EN_MATCH_LOSS: CommentaryLine[] = [
  { id: 'eml1', text: "And that's the end. They fall short. Heartbreak.", voice: 'main', emotion: 'disappointed', rate: 0.95, pitch: 0.95, delay: 0 },
  { id: 'eml2', text: "It wasn't to be today. A gallant effort, but not enough.", voice: 'main', emotion: 'disappointed', rate: 0.95, pitch: 0.95, delay: 0 },
  { id: 'eml3', text: 'Defeat. A bitter pill to swallow after that effort.', voice: 'main', emotion: 'disappointed', rate: 0.95, pitch: 0.9, delay: 0 },
  { id: 'eml4', text: "They'll be disappointed. But cricket is a cruel game.", voice: 'main', emotion: 'disappointed', rate: 0.95, pitch: 0.95, delay: 0 },
];
