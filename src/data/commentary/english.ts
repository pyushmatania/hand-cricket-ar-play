// ═══════════════════════════════════════════════════
// Doc 3 — Chapter 3.1: English Commentary Pool
// 500+ lines across all event types
// ═══════════════════════════════════════════════════

import type { CommentaryLine } from '@/engines/types';

// ── DEFENSE SCORED (runs via defense mechanic) ──
export const EN_DEFENSE_SCORED: CommentaryLine[] = [
  { id: 'edf1', text: 'Defended well, but the runs are on the board!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf2', text: 'Smart defense! Takes the runs comfortably.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf3', text: 'Played it safe and still scored. Clever cricket.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf4', text: 'Solid defense, easy runs. Best of both worlds.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf5', text: 'The defensive approach pays off! Runs taken.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf6', text: 'Blocked and scored. That\'s experienced batting.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf7', text: 'Defense first, runs second. Textbook approach.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf8', text: 'Played with soft hands and rotated the strike.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf9', text: 'Safe play. The runs come anyway. Smart cricket.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf10', text: 'Defended the danger and collected the runs. Well played.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf11', text: 'No risk there. Just pure cricketing intelligence.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf12', text: 'Shielded the stumps and still got the runs!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf13', text: 'Conservative but effective. Runs on the board.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf14', text: 'The batsman chose safety and it worked perfectly.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf15', text: 'Watchful approach. The runs come easily.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf16', text: 'Steady does it! Defense into runs.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf17', text: 'Patient cricket. The runs will come, and they did.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf18', text: 'Good technique, soft hands, and the scoreboard ticks over.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf19', text: 'Defended beautifully. But the runs still flow.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf20', text: 'Playing percentage cricket here. Smart decision.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf21', text: 'No flashy shots needed. Defense and runs. Simple.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf22', text: 'The bowler couldn\'t prevent the runs despite the defense.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf23', text: 'Blocked with intent. Runs collected. Professional batting.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf24', text: 'Defense is the best attack sometimes! Runs scored.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf25', text: 'Tactical defense. The scoreboard keeps moving.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf26', text: 'Held shape and took the runs. Classic approach.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf27', text: 'Conservative pick but the result is runs!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf28', text: 'Safety first for the batsman. Runs still come.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf29', text: 'Bowler tried to contain, but runs leak through anyway.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
  { id: 'edf30', text: 'A measured approach. The batsman is in no rush.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 200 },
];

// ── DEFENSE vs DEFENSE = OUT ──
export const EN_WICKET_DEFENSE: CommentaryLine[] = [
  { id: 'ewd1', text: 'BOTH DEFENDED! That\'s OUT! Neither committed!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd2', text: 'Defense meets defense! WICKET! The batsman has to go!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd3', text: 'Double defense! That\'s a wicket! You can\'t both defend!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd4', text: 'OUT! Both played it safe and it cost the batsman!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd5', text: 'GONE! The ultimate standoff — both defended and the batsman pays the price!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500,
    followUp: { id: 'ewd5f', text: 'What a mind game that was!', voice: 'color', emotion: 'dramatic', rate: 1.0, pitch: 1.1, delay: 0 }
  },
  { id: 'ewd6', text: 'Defense on defense! That\'s the rule — OUT!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd7', text: 'Neither attacked! The batsman is dismissed! Bold move gone wrong!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd8', text: 'OUT! Mutual defense! The batsman walks back!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd9', text: 'Both chose caution and it\'s a WICKET! Incredible!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd10', text: 'The defensive stalemate costs the batsman! OUT!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd11', text: 'Two defenses cancel each other out! WICKET!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd12', text: 'Nobody committed! And the batsman is OUT because of it!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd13', text: 'A chess match that the batsman lost! Defense vs defense = OUT!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd14', text: 'The ultimate mind game! Both defended! Batsman is gone!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
  { id: 'ewd15', text: 'Stalemate! But only one person walks off, and it\'s the batsman!', voice: 'main', emotion: 'dramatic', rate: 1.2, pitch: 1.1, delay: 500 },
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
  // Additional THREE lines
  { id: 'e3r6', text: 'THREE! Hustled hard between the wickets!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r7', text: 'They come back for a third! Outstanding running!', voice: 'main', emotion: 'excited', rate: 1.1, pitch: 1.05, delay: 100 },
  { id: 'e3r8', text: 'THREE runs! The fielder fumbled and they pounced!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 100 },
  { id: 'e3r9', text: 'Quick between the wickets! Three taken! Athletic cricket!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r10', text: 'THREE! Misfield in the deep and they punish it!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r11', text: 'They\'re running hard! THREE! Great awareness!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r12', text: 'Into the gap and THREE taken! Smart cricket!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r13', text: 'Overthrow! THREE runs! Gift from the fielding side!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r14', text: 'THREE! Driven into the deep and they sprint back for the third!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r15', text: 'Excellent calling! THREE runs! Communication between the batsmen!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r16', text: 'THREE! The fielder\'s throw missed and they stole the extra run!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r17', text: 'Hard running! THREE! That\'s fitness paying off!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r18', text: 'Pushed into the covers, hesitation, but they GO! THREE taken!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r19', text: 'THREE runs! The boundary rider was slow to react!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
  { id: 'e3r20', text: 'They turn for three! The throw comes in but they\'re HOME! Safe!', voice: 'main', emotion: 'neutral', rate: 1.1, pitch: 1.0, delay: 100 },
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
  { id: 'ef21', text: "FOUR! And that brings up his FIFTY!", voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.15, delay: 800, minSituation: 'comfortable' },
  { id: 'ef22', text: 'Take a bow! Fifty in style!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef23', text: "FOUR! In the death overs, that's huge!", voice: 'main', emotion: 'excited', rate: 1.25, pitch: 1.15, delay: 800, minSituation: 'tense' },
  // Additional FOUR lines
  { id: 'ef24', text: 'FOUR! Crashed through point! No stopping that!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef25', text: 'Boundary! Whipped off the pads beautifully!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef26', text: 'FOUR! That\'s been timed to absolute perfection!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef27', text: 'Races away to the fence! The fielder had no chance!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef28', text: 'Driven on the up! FOUR! Gorgeous shot!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef29', text: 'FOUR! Carved through the off side with precision!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef30', text: 'Slashed! And it\'s FOUR! Behind point!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef31', text: 'Boundary! Nonchalant flick for four. Made it look easy.', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'ef32', text: 'FOUR! Smashed through mid-wicket! Power and timing!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef33', text: 'Deft touch! Guides it to the boundary! Class!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'ef34', text: 'FOUR! That\'s been absolutely CREAMED to the fence!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef35', text: 'Upper cut! Up and over! FOUR to third man!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef36', text: 'Reverse sweep for FOUR! The audacity!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef37', text: 'Punched down the ground! Straight FOUR! Textbook!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef38', text: 'FOUR! Inside edge past the stumps and to the boundary! Lucky but he\'ll take it!', voice: 'main', emotion: 'excited', rate: 1.15, pitch: 1.05, delay: 800 },
  { id: 'ef39', text: 'Stepped out and drove! FOUR! Majestic!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef40', text: 'FOUR! Short and he\'s pulled it ferociously!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef41', text: 'Glanced fine! FOUR! Wristy stuff!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef42', text: 'Square cut! Thundered to the boundary! FOUR!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
  { id: 'ef43', text: 'FOUR! Straight back past the bowler! He didn\'t even see it!', voice: 'main', emotion: 'excited', rate: 1.2, pitch: 1.1, delay: 800 },
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
  { id: 'es6_20', text: 'SIX! And that could WIN THE MATCH!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.25, delay: 1000, minSituation: 'critical' },
  { id: 'es6_21', text: 'MAXIMUM! And a CENTURY! What a way to bring it up!', voice: 'main', emotion: 'excited', rate: 1.35, pitch: 1.25, delay: 1000 },
  { id: 'es6_22', text: 'SIX in the last over! The equation is SHIFTING!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000, minSituation: 'tense' },
  // Additional SIX lines
  { id: 'es6_23', text: 'SIX! Launched over long-on with contempt!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_24', text: 'MAXIMUM! That\'s left the stadium! Where did that land?!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_25', text: 'SIX! Scooped over fine leg! Outrageous improvisation!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_26', text: 'Into the stands! SIX! That was hit with every ounce of power!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_27', text: 'SIX! Reverse swept for MAXIMUM! How did he do that?!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_28', text: 'Flat batted over mid-off! SIX! Brutal hitting!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_29', text: 'SIX! Down on one knee and hoisted over cow corner!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_30', text: 'DEPOSITED into Row Z! SIX! That poor spectator!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_31', text: 'Helicopter shot! SIX! Only one man plays that shot!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_32', text: 'SIX! Switch hit! Left hand to right hand and BANG! Over the rope!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_33', text: 'MAXIMUM! The ball is STILL going! It might land tomorrow!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_34', text: 'SIX! Walked down the track and smashed it downtown! FEARLESS!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_35', text: 'Pulled off the front foot for SIX! Against the pace! Incredible timing!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_36', text: 'SIX! Picked up from outside off and deposited over midwicket! Genius!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_37', text: 'Lofted inside out over extra cover! SIX! That is SPECIAL!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_38', text: 'MAXIMUM! The bowler is shaking his head! Nothing he could do!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_39', text: 'SIX! Dancing down the pitch to the spinner and BOOM! Over the sightscreen!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_40', text: 'Monstrous pull shot! SIX! That was 100 meters at least!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_41', text: 'Paddle swept for SIX! Over short fine leg! The CHEEK of it!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
  { id: 'es6_42', text: 'SIX! And the DJ plays the music! The crowd is going CRAZY!', voice: 'main', emotion: 'excited', rate: 1.3, pitch: 1.2, delay: 1000 },
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

// ── INNINGS START ──
export const EN_INNINGS_START: CommentaryLine[] = [
  { id: 'eis1', text: 'And we are underway! The innings begins!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'eis2', text: 'New innings! The batsman takes guard. Here we go!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 0 },
  { id: 'eis3', text: 'The fielding side is set. Innings begins now.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'eis4', text: 'Fresh start. New innings. Everything to play for.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0,
    followUp: { id: 'eis4f', text: 'This is where champions are made.', voice: 'color', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 }
  },
];

// ── TOSS RESULT ──
export const EN_TOSS_RESULT: CommentaryLine[] = [
  { id: 'etr1', text: 'The coin goes up! And the toss is done!', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'etr2', text: 'Toss decided! A crucial moment in every match.', voice: 'main', emotion: 'neutral', rate: 1.0, pitch: 1.0, delay: 0 },
  { id: 'etr3', text: 'The toss is complete. Let the battle begin!', voice: 'main', emotion: 'neutral', rate: 1.05, pitch: 1.0, delay: 0 },
];
