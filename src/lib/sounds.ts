// ═══════════════════════════════════════════════════════════════
// V10 Sound Effects — 85+ Web Audio API Synthesized SFX
// ═══════════════════════════════════════════════════════════════

let audioCtx: AudioContext | null = null;
let _soundEnabled = true;
let _hapticsEnabled = true;
let _reducedMotion = false;

// Check prefers-reduced-motion
if (typeof window !== "undefined") {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  _reducedMotion = mq.matches;
  mq.addEventListener("change", (e) => { _reducedMotion = e.matches; });
}

export function setSoundEnabled(v: boolean) { _soundEnabled = v; }
export function setHapticsEnabled(v: boolean) { _hapticsEnabled = v; }
export function getSoundEnabled() { return _soundEnabled; }
export function getHapticsEnabled() { return _hapticsEnabled; }

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function canPlay() { return _soundEnabled && !_reducedMotion; }

// ─── Low-level helpers ───────────────────────────────────────

function playTone(
  freq: number, duration: number, type: OscillatorType = "sine",
  volume = 0.12, delay = 0, detune = 0
) {
  if (!canPlay()) return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  } catch { /* Audio not supported */ }
}

function playChord(freqs: number[], duration: number, type: OscillatorType = "sine", volume = 0.06, delay = 0) {
  freqs.forEach(f => playTone(f, duration, type, volume / freqs.length, delay));
}

function playNote(freq: number, dur: number, delay = 0, vol = 0.1) {
  if (!canPlay()) return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.015);
    gain.gain.setValueAtTime(vol, t + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  } catch { /* Audio not supported */ }
}

function playPercussion(freq: number, dur: number, vol = 0.08, delay = 0) {
  if (!canPlay()) return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.3, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  } catch { /* Audio not supported */ }
}

function playSoftNoise(duration: number, volume = 0.04, delay = 0) {
  if (!canPlay()) return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime + delay;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 2000;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(t);
    source.stop(t + duration);
  } catch { /* Audio not supported */ }
}

function playFilteredNoise(duration: number, filterType: BiquadFilterType, filterFreq: number, vol = 0.05, delay = 0) {
  if (!canPlay()) return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime + delay;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    filter.Q.value = 1;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(t);
    source.stop(t + duration);
  } catch { /* Audio not supported */ }
}

function playSweep(startFreq: number, endFreq: number, dur: number, type: OscillatorType = "sine", vol = 0.06, delay = 0) {
  if (!canPlay()) return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  } catch { /* Audio not supported */ }
}

// ═══════════════════════════════════════════════════════════════
// SFX — 85+ synthesized effects
// ═══════════════════════════════════════════════════════════════

export const SFX = {
  // ── UI CORE ──────────────────────────────────────────────
  /** Quick UI tap — soft xylophone click */
  tap() {
    playNote(1200, 0.06, 0, 0.06);
    playNote(1800, 0.04, 0.01, 0.03);
  },
  /** Navigation tab switch — soft pop */
  navTap() {
    playNote(880, 0.04, 0, 0.05);
    playNote(1320, 0.03, 0.02, 0.03);
  },
  /** Toggle switch — light click */
  toggle() {
    playNote(1100, 0.03, 0, 0.06);
  },
  /** Modal/sheet open — soft whoosh up */
  modalOpen() {
    playSweep(200, 800, 0.15, "sine", 0.04);
    playNote(1000, 0.05, 0.1, 0.04);
  },
  /** Modal/sheet close — soft whoosh down */
  modalClose() {
    playSweep(800, 200, 0.12, "sine", 0.03);
  },
  /** Drawer open — heavier slide up */
  drawerOpen() {
    playSweep(150, 600, 0.2, "triangle", 0.05);
    playNote(800, 0.06, 0.15, 0.04);
  },
  /** Drawer close — heavier slide down */
  drawerClose() {
    playSweep(600, 150, 0.18, "triangle", 0.04);
  },
  /** Card slide in */
  cardSlideIn() {
    playSweep(300, 900, 0.12, "sine", 0.04);
    playNote(1100, 0.04, 0.08, 0.03);
  },
  /** Card slide out */
  cardSlideOut() {
    playSweep(900, 300, 0.1, "sine", 0.03);
  },
  /** Score tick — scoreboard number changing */
  scoreTick() {
    playNote(1400, 0.025, 0, 0.05);
    playPercussion(600, 0.02, 0.03);
  },
  /** Tab switch — musical scale note */
  tabSwitch(index: number) {
    const scale = [523, 587, 659, 698, 784];
    playNote(scale[index % scale.length], 0.08, 0, 0.06);
  },
  /** Error / denied — descending buzz */
  error() {
    playNote(400, 0.12, 0, 0.08);
    playNote(300, 0.15, 0.1, 0.06);
  },
  /** Success confirmation — bright ding */
  success() {
    playNote(880, 0.08, 0, 0.08);
    playNote(1175, 0.12, 0.06, 0.1);
  },
  /** Button press with 3D depth */
  buttonPress() {
    playPercussion(500, 0.04, 0.06);
    playNote(1000, 0.03, 0.01, 0.04);
  },
  /** Button release */
  buttonRelease() {
    playNote(1200, 0.025, 0, 0.03);
  },
  /** Scroll snap */
  scrollSnap() {
    playNote(1600, 0.02, 0, 0.03);
  },
  /** Swipe gesture */
  swipe() {
    playSweep(500, 1200, 0.08, "sine", 0.03);
  },

  // ── BAT HITS ─────────────────────────────────────────────
  /** Generic bat hit — crisp wooden thwack */
  batHit() {
    playPercussion(800, 0.08, 0.1);
    playSoftNoise(0.06, 0.06);
    playNote(300, 0.06, 0.02, 0.04);
  },
  /** Soft bat — dot ball / defensive prod */
  batSoft() {
    playPercussion(600, 0.05, 0.05);
    playSoftNoise(0.03, 0.03);
  },
  /** Medium bat — 2s and 3s */
  batMedium() {
    playPercussion(750, 0.07, 0.08);
    playSoftNoise(0.05, 0.05);
    playNote(350, 0.05, 0.02, 0.03);
  },
  /** Hard bat — boundary fours */
  batHard() {
    playPercussion(900, 0.09, 0.12);
    playSoftNoise(0.07, 0.07);
    playNote(400, 0.06, 0.02, 0.05);
    playNote(250, 0.04, 0.04, 0.03);
  },
  /** Massive bat — SIXES, full power */
  batMassive() {
    playPercussion(1000, 0.1, 0.14);
    playSoftNoise(0.09, 0.09);
    playNote(500, 0.08, 0.02, 0.06);
    playNote(250, 0.06, 0.05, 0.04);
    // Shockwave sub-bass
    playTone(60, 0.15, "sine", 0.06, 0.03);
  },

  // ── BALL SOUNDS ──────────────────────────────────────────
  /** Ball bouncing on pitch */
  ballBounce() {
    playPercussion(400, 0.04, 0.06);
    playNote(200, 0.03, 0.01, 0.03);
  },
  /** Ball into keeper's gloves */
  ballIntoGloves() {
    playFilteredNoise(0.06, "bandpass", 800, 0.05);
    playNote(500, 0.03, 0.02, 0.03);
  },
  /** Faint edge off bat */
  ballEdge() {
    playPercussion(1200, 0.03, 0.04);
    playSoftNoise(0.02, 0.02);
  },
  /** Ball hitting pad (LBW) */
  ballPadHit() {
    playFilteredNoise(0.05, "lowpass", 600, 0.06);
    playPercussion(300, 0.04, 0.05);
  },
  /** Ball sailing through air (sixes) */
  ballFlight() {
    playSweep(200, 800, 0.4, "sine", 0.03);
    playFilteredNoise(0.3, "bandpass", 1500, 0.02, 0.05);
  },

  // ── STUMPS ───────────────────────────────────────────────
  /** Stumps shattered — timber! */
  stumpsHit() {
    playPercussion(150, 0.15, 0.12);
    playPercussion(800, 0.06, 0.08, 0.02);
    playSoftNoise(0.12, 0.08, 0.03);
    playNote(120, 0.2, 0.05, 0.05);
  },
  /** Bails dislodged — lighter rattle */
  bailsFlying() {
    for (let i = 0; i < 4; i++) {
      playPercussion(1200 + Math.random() * 800, 0.03, 0.04, i * 0.03);
    }
  },

  // ── CROWD ────────────────────────────────────────────────
  /** Polite applause for singles/doubles */
  crowdCheerMild() {
    playFilteredNoise(0.5, "bandpass", 1200, 0.04);
    playFilteredNoise(0.4, "highpass", 3000, 0.02, 0.05);
  },
  /** Louder cheer for boundaries */
  crowdCheerExcited() {
    playFilteredNoise(0.7, "bandpass", 1000, 0.07);
    playFilteredNoise(0.5, "highpass", 2500, 0.04, 0.1);
    playNote(500, 0.3, 0.05, 0.02);
  },
  /** MAXIMUM crowd roar for sixes */
  crowdEruption() {
    playFilteredNoise(1.0, "bandpass", 800, 0.1);
    playFilteredNoise(0.8, "highpass", 2000, 0.06, 0.1);
    playFilteredNoise(0.6, "lowpass", 600, 0.04, 0.15);
    playNote(400, 0.5, 0.1, 0.03);
  },
  /** Collective gasp */
  crowdGasp() {
    playSweep(400, 800, 0.3, "sine", 0.04);
    playFilteredNoise(0.4, "bandpass", 2000, 0.05, 0.05);
  },
  /** Disappointment groan */
  crowdGroan() {
    playSweep(500, 200, 0.5, "sine", 0.03);
    playFilteredNoise(0.4, "lowpass", 500, 0.04);
  },
  /** HOWZAT! appeal */
  crowdAppeal() {
    playFilteredNoise(0.6, "bandpass", 1500, 0.08);
    playSweep(400, 1200, 0.3, "sawtooth", 0.03);
    playFilteredNoise(0.5, "highpass", 3000, 0.04, 0.1);
  },

  // ── SCORING ──────────────────────────────────────────────
  /** Runs scored — ascending marimba */
  runs(count: number) {
    const scale = [523, 587, 659, 698, 784, 880];
    for (let i = 0; i < Math.min(count, 6); i++) {
      playNote(scale[i], 0.12, i * 0.08, 0.08);
    }
  },
  /** OUT! — dramatic low brass + timpani */
  out() {
    playPercussion(120, 0.4, 0.12);
    playTone(400, 0.2, "sawtooth", 0.06, 0.05);
    playTone(300, 0.25, "sawtooth", 0.05, 0.2);
    playTone(200, 0.4, "sawtooth", 0.04, 0.35);
    playSoftNoise(0.3, 0.05, 0.1);
  },
  /** SIX — triumphant stadium horn fanfare */
  six() {
    playNote(523, 0.15, 0, 0.1);
    playNote(659, 0.15, 0.12, 0.1);
    playNote(784, 0.18, 0.24, 0.12);
    playNote(1047, 0.3, 0.38, 0.14);
    playChord([1047, 1318, 1568], 0.5, "sine", 0.08, 0.55);
    playSoftNoise(0.2, 0.03, 0.6);
  },
  /** FOUR — quick boundary chirp */
  four() {
    playNote(659, 0.12, 0, 0.1);
    playNote(784, 0.12, 0.1, 0.1);
    playNote(1047, 0.18, 0.2, 0.08);
  },
  /** Dot ball — subtle thud */
  dotBall() {
    playPercussion(400, 0.04, 0.04);
    playNote(600, 0.03, 0.02, 0.02);
  },
  /** Single — tiny chime */
  single() {
    playNote(784, 0.06, 0, 0.05);
  },
  /** Double — two quick notes */
  double() {
    playNote(784, 0.06, 0, 0.05);
    playNote(880, 0.06, 0.08, 0.05);
  },
  /** Triple — three quick notes */
  triple() {
    playNote(784, 0.06, 0, 0.05);
    playNote(880, 0.06, 0.06, 0.05);
    playNote(988, 0.06, 0.12, 0.05);
  },
  /** Defence — soft shield ping */
  defence() {
    playNote(600, 0.06, 0, 0.05);
    playNote(900, 0.05, 0.03, 0.03);
  },

  // ── MATCH FLOW ───────────────────────────────────────────
  /** Win — victory melody + triumph chord */
  win() {
    const melody = [523, 587, 659, 784, 880, 1047, 1175, 1318];
    melody.forEach((n, i) => playNote(n, 0.2, i * 0.12, 0.1));
    playChord([523, 659, 784, 1047], 0.8, "sine", 0.1, melody.length * 0.12);
  },
  /** Loss — gentle sad descend */
  loss() {
    playNote(440, 0.25, 0, 0.07);
    playNote(392, 0.25, 0.2, 0.06);
    playNote(330, 0.4, 0.4, 0.05);
  },
  /** Draw — neutral resolution */
  draw() {
    playNote(523, 0.2, 0, 0.06);
    playNote(523, 0.25, 0.2, 0.05);
  },
  /** Game start — warm welcome chime */
  gameStart() {
    playNote(440, 0.15, 0, 0.08);
    playNote(554, 0.15, 0.15, 0.08);
    playNote(659, 0.25, 0.3, 0.1);
  },
  /** Innings switch — transition fanfare */
  inningsSwitch() {
    playNote(523, 0.12, 0, 0.08);
    playNote(659, 0.12, 0.1, 0.08);
    playPercussion(200, 0.1, 0.06, 0.2);
    playNote(784, 0.2, 0.25, 0.1);
  },
  /** Over break — subtle separator */
  overBreak() {
    playNote(440, 0.1, 0, 0.05);
    playPercussion(300, 0.06, 0.04, 0.08);
    playNote(554, 0.15, 0.12, 0.06);
  },
  /** Match found — exciting alert */
  matchFound() {
    playNote(659, 0.1, 0, 0.1);
    playNote(784, 0.1, 0.08, 0.1);
    playNote(988, 0.1, 0.16, 0.12);
    playNote(1175, 0.15, 0.24, 0.12);
    playChord([988, 1175, 1480], 0.3, "sine", 0.08, 0.35);
  },
  /** VS slam — heavy impact for VS screen */
  vsSlam() {
    playPercussion(80, 0.3, 0.14);
    playSoftNoise(0.15, 0.1);
    playTone(60, 0.2, "sine", 0.08, 0.02);
    playNote(200, 0.1, 0.08, 0.06);
  },
  /** Walkout drums — rhythmic entrance */
  walkoutDrums() {
    for (let i = 0; i < 4; i++) {
      playPercussion(120, 0.1, 0.08, i * 0.25);
      playPercussion(250, 0.05, 0.04, i * 0.25 + 0.12);
    }
  },
  /** Countdown tick — subtle clock */
  tick() {
    playNote(1200, 0.03, 0, 0.05);
  },
  /** Timer expire — buzzer */
  timerExpire() {
    playTone(300, 0.3, "square", 0.08);
    playTone(250, 0.2, "square", 0.06, 0.15);
  },
  /** Heartbeat — tension loop pulse */
  heartbeat() {
    playPercussion(80, 0.12, 0.08);
    playPercussion(80, 0.1, 0.06, 0.15);
  },

  // ── TOSS ─────────────────────────────────────────────────
  tossSelect() {
    playNote(880, 0.06, 0, 0.08);
    playNote(1100, 0.05, 0.05, 0.06);
  },
  tossHandPick() {
    playNote(660, 0.06, 0, 0.08);
    playPercussion(400, 0.04, 0.04);
  },
  tossRevealBuild() {
    for (let i = 0; i < 6; i++) {
      playNote(400 + i * 100, 0.08, i * 0.08, 0.04 + i * 0.01);
    }
  },
  tossReveal() {
    playNote(523, 0.12, 0, 0.1);
    playNote(784, 0.12, 0.1, 0.1);
    playNote(1047, 0.25, 0.2, 0.12);
  },
  tossWon() {
    playChord([523, 659, 784], 0.2, "sine", 0.1, 0);
    playChord([659, 784, 1047], 0.25, "sine", 0.1, 0.2);
    playChord([784, 1047, 1318], 0.35, "sine", 0.08, 0.4);
  },
  tossLost() {
    playNote(500, 0.2, 0, 0.07);
    playNote(400, 0.25, 0.15, 0.05);
  },
  /** Coin flip — metallic spinning */
  coinFlip() {
    for (let i = 0; i < 8; i++) {
      playNote(2000 + (i % 2) * 500, 0.02, i * 0.04, 0.04);
    }
  },
  /** Coin landing */
  coinLand() {
    playPercussion(1500, 0.06, 0.06);
    playNote(800, 0.04, 0.03, 0.04);
    playPercussion(1200, 0.04, 0.03, 0.06);
  },

  // ── DRS ──────────────────────────────────────────────────
  /** DRS whoosh — dramatic sweep */
  drsWhoosh() {
    playSweep(100, 2000, 0.4, "sawtooth", 0.05);
    playFilteredNoise(0.3, "bandpass", 1500, 0.04, 0.05);
  },
  /** DRS verdict — decision reveal */
  drsVerdict() {
    playPercussion(200, 0.15, 0.1);
    playNote(659, 0.12, 0.1, 0.1);
    playNote(784, 0.2, 0.2, 0.12);
  },
  /** DRS scanning — electronic blip sequence */
  drsScanning() {
    for (let i = 0; i < 5; i++) {
      playNote(1000 + i * 200, 0.04, i * 0.15, 0.04);
    }
  },

  // ── REWARDS ──────────────────────────────────────────────
  /** Reward claim — sparkle cascade */
  rewardClaim() {
    playNote(784, 0.1, 0, 0.1);
    playNote(988, 0.1, 0.08, 0.1);
    playNote(1175, 0.12, 0.16, 0.12);
    playNote(1568, 0.2, 0.26, 0.1);
    playChord([1175, 1568, 1976], 0.4, "sine", 0.06, 0.4);
  },
  /** Coin spend — metallic clink */
  coinSpend() {
    playNote(1400, 0.06, 0, 0.08);
    playNote(1000, 0.08, 0.04, 0.06);
    playNote(700, 0.1, 0.1, 0.04);
  },
  /** Coin collect — bright clink */
  coinCollect() {
    playNote(1800, 0.04, 0, 0.07);
    playNote(2200, 0.05, 0.03, 0.06);
  },
  /** Gem collect — crystal chime */
  gemCollect() {
    playNote(2000, 0.06, 0, 0.06);
    playNote(2400, 0.08, 0.04, 0.07);
    playNote(3000, 0.1, 0.08, 0.05);
  },
  /** Card flip — paper flip */
  cardFlip() {
    playSoftNoise(0.04, 0.05);
    playNote(800, 0.03, 0.02, 0.04);
  },
  /** Legendary card reveal — dramatic stinger */
  legendaryReveal() {
    playPercussion(100, 0.2, 0.1);
    for (let i = 0; i < 5; i++) {
      playNote(523 + i * 130, 0.15, i * 0.1, 0.08);
    }
    playChord([784, 1047, 1318, 1568], 0.6, "sine", 0.08, 0.5);
  },
  /** Chest shake */
  chestShake() {
    for (let i = 0; i < 3; i++) {
      playPercussion(300, 0.05, 0.06, i * 0.08);
    }
  },
  /** Chest crack — first break */
  chestCrack() {
    playPercussion(400, 0.08, 0.1);
    playSoftNoise(0.06, 0.06);
  },
  /** Chest burst — full open */
  chestBurst() {
    playPercussion(200, 0.15, 0.12);
    playSoftNoise(0.15, 0.08, 0.05);
    playNote(523, 0.15, 0.1, 0.1);
    playNote(659, 0.15, 0.2, 0.1);
    playNote(784, 0.15, 0.3, 0.12);
    playNote(1047, 0.3, 0.4, 0.14);
  },
  /** Chest open — classic dramatic unlock (alias) */
  chestOpen() {
    SFX.chestBurst();
  },
  /** XP gain — subtle ascending */
  xpGain() {
    playNote(880, 0.06, 0, 0.05);
    playNote(1047, 0.06, 0.05, 0.05);
    playNote(1175, 0.08, 0.1, 0.06);
  },
  /** Level up — ascending fanfare */
  levelUp() {
    const notes = [523, 659, 784, 1047, 1318];
    notes.forEach((n, i) => playNote(n, 0.18, i * 0.1, 0.1));
    playChord([1047, 1318, 1568], 0.6, "sine", 0.08, notes.length * 0.1);
  },
  /** Streak milestone — warm celebration */
  streakMilestone() {
    playNote(659, 0.12, 0, 0.08);
    playNote(784, 0.12, 0.1, 0.08);
    playNote(988, 0.15, 0.2, 0.1);
    playNote(1175, 0.2, 0.32, 0.1);
  },
  /** Battle pass tier unlock */
  battlePassTier() {
    playNote(659, 0.1, 0, 0.08);
    playNote(784, 0.1, 0.08, 0.08);
    playNote(1047, 0.15, 0.16, 0.1);
    playSoftNoise(0.1, 0.03, 0.2);
  },
  /** Spin wheel tick — each segment */
  spinTick() {
    playNote(1400 + Math.random() * 400, 0.02, 0, 0.05);
  },
  /** Spin wheel result — reveal */
  spinResult() {
    playPercussion(300, 0.1, 0.08);
    playNote(784, 0.12, 0.05, 0.1);
    playNote(1047, 0.2, 0.15, 0.12);
  },

  // ── SOCIAL ───────────────────────────────────────────────
  /** Match invite notification */
  matchInvite() {
    playNote(880, 0.1, 0, 0.1);
    playNote(1047, 0.1, 0.1, 0.12);
    playNote(1318, 0.12, 0.2, 0.14);
    playNote(1047, 0.08, 0.35, 0.1);
    playNote(1318, 0.15, 0.43, 0.14);
  },
  /** Friend came online — gentle two-note chime */
  friendOnline() {
    playNote(880, 0.1, 0, 0.07);
    playNote(1175, 0.18, 0.12, 0.09);
  },
  /** Friend request received */
  friendRequest() {
    playNote(784, 0.08, 0, 0.07);
    playNote(988, 0.08, 0.08, 0.07);
    playNote(1175, 0.12, 0.16, 0.08);
  },
  /** Chat message received */
  chatMessage() {
    playNote(1047, 0.05, 0, 0.06);
    playNote(1318, 0.06, 0.04, 0.05);
  },
  /** Chat message sent */
  chatSend() {
    playSweep(600, 1200, 0.08, "sine", 0.04);
  },
  /** Clan war horn — deep brass */
  clanWarHorn() {
    playTone(130, 0.6, "sawtooth", 0.05);
    playTone(195, 0.5, "sawtooth", 0.04, 0.1);
    playTone(260, 0.4, "sawtooth", 0.03, 0.2);
  },
  /** Emote sent — pop */
  emoteSend() {
    playNote(1400, 0.04, 0, 0.06);
    playNote(1800, 0.03, 0.03, 0.04);
  },
  /** Notification alert */
  notification() {
    playNote(880, 0.06, 0, 0.07);
    playNote(1047, 0.08, 0.06, 0.08);
  },

  // ── CEREMONIES ───────────────────────────────────────────
  /** Pre-match ceremony horn — warm brass */
  ceremonyHorn() {
    if (!canPlay()) return;
    try {
      const ctx = getCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.value = 220;
      osc2.frequency.value = 330;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.06, ctx.currentTime + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.5);
      osc2.stop(ctx.currentTime + 1.5);
    } catch { /* Audio not supported */ }
  },
  /** Post-match victory anthem */
  victoryAnthem() {
    const melody = [523, 659, 784, 880, 1047, 880, 1047, 1318, 1047];
    melody.forEach((n, i) => {
      playNote(n, 0.22, i * 0.16, 0.08);
      if (i % 2 === 0) playNote(n / 2, 0.28, i * 0.16, 0.03);
    });
    playChord([523, 659, 784, 1047], 0.8, "sine", 0.08, melody.length * 0.16);
  },
  /** Trophy ceremony — grand fanfare */
  trophyCeremony() {
    playPercussion(100, 0.2, 0.1);
    const notes = [523, 659, 784, 1047, 1318, 1568];
    notes.forEach((n, i) => playNote(n, 0.2, i * 0.15, 0.1));
    playChord([784, 1047, 1318, 1568], 0.8, "sine", 0.1, notes.length * 0.15);
  },

  // ── FIREWORKS ────────────────────────────────────────────
  /** Firework whoosh */
  fireworkWhoosh() {
    if (!canPlay()) return;
    try {
      const ctx = getCtx();
      const bufferSize = Math.floor(ctx.sampleRate * 0.4);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.25);
      filter.Q.value = 1.5;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch { /* Audio not supported */ }
  },
  /** Firework pop */
  fireworkPop() {
    playSoftNoise(0.12, 0.1);
    playNote(300 + Math.random() * 400, 0.08, 0.02, 0.06);
  },
  /** Firework crackle — multi-pop */
  fireworkCrackle() {
    for (let i = 0; i < 6; i++) {
      playNote(800 + Math.random() * 1200, 0.03, i * 0.04 + Math.random() * 0.02, 0.04);
    }
  },

  // ── SPLASH / AMBIENT ─────────────────────────────────────
  /** Splash screen stadium ambience — warm low hum */
  splashAmbience() {
    if (!canPlay()) return;
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      // Low crowd murmur
      const bufferSize = Math.floor(ctx.sampleRate * 3);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 400;
      filter.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.03, t + 0.5);
      gain.gain.setValueAtTime(0.03, t + 2.0);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(t);
      source.stop(t + 3.0);
    } catch { /* Audio not supported */ }
  },
  /** Splash complete — stadium horn blast */
  splashComplete() {
    playTone(220, 0.5, "sawtooth", 0.05);
    playTone(330, 0.4, "triangle", 0.04, 0.1);
  },
};

// ═══════════════════════════════════════════════════════════════
// Haptics — 85+ vibration patterns
// ═══════════════════════════════════════════════════════════════

function vib(pattern: number | number[]) {
  if (!_hapticsEnabled || _reducedMotion) return;
  navigator?.vibrate?.(pattern);
}

export const Haptics = {
  // ── Intensity tiers ──
  micro()  { vib(3); },
  light()  { vib(8); },
  medium() { vib(20); },
  heavy()  { vib(40); },
  impact() { vib(60); },

  // ── UI ──
  tap()          { vib(5); },
  navTap()       { vib(6); },
  buttonPress()  { vib(10); },
  buttonRelease(){ vib(3); },
  toggle()       { vib(8); },
  scrollSnap()   { vib(4); },
  swipe()        { vib(6); },
  modalOpen()    { vib(12); },
  modalClose()   { vib(8); },
  drawerOpen()   { vib(15); },
  drawerClose()  { vib(10); },
  cardSlideIn()  { vib(8); },
  cardSlideOut() { vib(6); },
  scoreTick()    { vib(5); },
  tabSwitch()    { vib(6); },
  error()        { vib([30, 25, 30]); },
  success()      { vib([12, 40, 12]); },

  // ── Bat hits ──
  batSoft()    { vib(8); },
  batMedium()  { vib(15); },
  batHard()    { vib(30); },
  batMassive() { vib([40, 15, 50]); },
  batHit()     { vib(20); },

  // ── Ball ──
  ballBounce()    { vib(6); },
  ballIntoGloves(){ vib(8); },
  ballEdge()      { vib(5); },
  ballPadHit()    { vib(12); },
  ballFlight()    { vib(4); },

  // ── Stumps ──
  stumpsHit()   { vib([40, 20, 60]); },
  bailsFlying() { vib([8, 10, 8, 10, 8]); },

  // ── Crowd ──
  crowdCheerMild()   { vib(6); },
  crowdCheerExcited(){ vib(12); },
  crowdEruption()    { vib([15, 10, 20, 10, 25]); },
  crowdGasp()        { vib(10); },
  crowdGroan()       { vib(15); },
  crowdAppeal()      { vib([20, 15, 20]); },

  // ── Scoring ──
  dotBall()  { vib(4); },
  single()   { vib(6); },
  double()   { vib([6, 8, 6]); },
  triple()   { vib([6, 6, 6, 6, 6]); },
  four()     { vib([15, 10, 20]); },
  six()      { vib([20, 10, 25, 10, 30]); },
  out()      { vib([40, 25, 60]); },

  // ── Match flow ──
  gameStart()     { vib([15, 30, 15]); },
  inningsSwitch() { vib([12, 20, 12, 20, 15]); },
  overBreak()     { vib(10); },
  matchFound()    { vib([20, 15, 20, 15, 30]); },
  vsSlam()        { vib([50, 20, 60]); },
  walkoutDrums()  { vib([15, 15, 15, 15, 15, 15, 15]); },
  countdownTick() { vib([15, 20, 15]); },
  timerExpire()   { vib([30, 20, 50]); },
  heartbeat()     { vib([20, 30, 15]); },

  // ── Toss ──
  tossSelect()     { vib(10); },
  tossHandPick()   { vib(12); },
  tossRevealBuild(){ vib([8, 8, 10, 8, 12, 8, 15]); },
  tossReveal()     { vib([20, 15, 25]); },
  tossWon()        { vib([15, 20, 15, 20, 20]); },
  tossLost()       { vib(20); },
  coinFlip()       { vib([5, 5, 5, 5, 5, 5, 5, 5]); },
  coinLand()       { vib(15); },

  // ── DRS ──
  drsWhoosh()   { vib([10, 10, 15, 10, 20]); },
  drsVerdict()  { vib([30, 20, 40]); },
  drsScanning() { vib([5, 10, 5, 10, 5, 10, 5]); },

  // ── Rewards ──
  rewardClaim()    { vib([15, 30, 15, 30, 25]); },
  coinSpend()      { vib([10, 20, 10]); },
  coinCollect()    { vib(6); },
  gemCollect()     { vib([8, 12, 8]); },
  cardFlip()       { vib(8); },
  legendaryReveal(){ vib([20, 15, 25, 15, 30, 10, 40]); },
  chestShake()     { vib([10, 8, 12, 8, 15]); },
  chestCrack()     { vib([20, 15, 25]); },
  chestBurst()     { vib([20, 10, 30, 10, 40, 10, 50]); },
  chestOpen()      { vib([20, 30, 40, 30, 60]); },
  xpGain()         { vib([6, 10, 6]); },
  levelUp()        { vib([15, 15, 20, 15, 25, 15, 30]); },
  streakMilestone(){ vib([10, 15, 10, 15, 20]); },
  battlePassTier() { vib([12, 15, 15, 15, 20]); },
  spinTick()       { vib(4); },
  spinResult()     { vib([20, 15, 30]); },

  // ── Social ──
  matchInvite()  { vib([25, 40, 25, 40, 50]); },
  friendOnline() { vib([8, 20, 8]); },
  friendRequest(){ vib([10, 15, 10, 15]); },
  chatMessage()  { vib(8); },
  chatSend()     { vib(6); },
  clanWarHorn()  { vib([30, 20, 40, 20, 50]); },
  emoteSend()    { vib(6); },
  notification() { vib([10, 15, 10]); },

  // ── Ceremonies ──
  ceremonyHorn()   { vib([15, 10, 20, 10, 25]); },
  victoryAnthem()  { vib([15, 15, 20, 15, 25, 15, 30, 15, 35]); },
  trophyCeremony() { vib([20, 15, 25, 15, 30, 15, 35, 15, 40]); },

  // ── Fireworks ──
  firework()       { vib([8, 15, 8, 15, 20]); },
  fireworkWhoosh() { vib([5, 5, 8, 5, 10]); },
  fireworkPop()    { vib(12); },
  fireworkCrackle(){ vib([5, 5, 5, 5, 5, 5, 5]); },

  // ── Splash ──
  splashAmbience() { vib(10); },
  splashComplete() { vib([15, 20, 25]); },
};
