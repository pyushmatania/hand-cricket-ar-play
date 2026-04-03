// Ambient stadium atmosphere — generative Web Audio loop
// Layers vary by arena: classroom (kids), street (neighborhood), IPL (massive crowd)

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let running = false;
let noiseSource: AudioBufferSourceNode | null = null;
let droneOsc1: OscillatorNode | null = null;
let droneOsc2: OscillatorNode | null = null;
let chantInterval: ReturnType<typeof setInterval> | null = null;
let baseVolume = 0.3;
let boosting = false;
let boostTimeout: ReturnType<typeof setTimeout> | null = null;
let silenceTimeout: ReturnType<typeof setTimeout> | null = null;
let currentArenaId: string | null = null;

export type ArenaAudioProfile = "school" | "rooftop" | "street" | "beach" | "ipl" | "worldcup";

interface ArenaAudioConfig {
  noiseGain: number;
  noiseBandpass: number;
  noiseQ: number;
  noiseBrownianFactor: number;
  droneFreq1: number;
  droneFreq2: number;
  droneGain: number;
  chantBaseFreq: number;
  chantGain: number;
  chantIntervalMs: number;
  chantVariance: number;
}

const ARENA_AUDIO: Record<ArenaAudioProfile, ArenaAudioConfig> = {
  // Classroom: kids chattering, higher pitch, lighter
  school: {
    noiseGain: 0.2,
    noiseBandpass: 700,
    noiseQ: 0.8,
    noiseBrownianFactor: 0.06,
    droneFreq1: 180,
    droneFreq2: 270,
    droneGain: 0.04,
    chantBaseFreq: 400,
    chantGain: 0.04,
    chantIntervalMs: 1800,
    chantVariance: 100,
  },
  // Street: neighborhood sounds, mid-range, organic
  street: {
    noiseGain: 0.3,
    noiseBandpass: 500,
    noiseQ: 0.5,
    noiseBrownianFactor: 0.05,
    droneFreq1: 140,
    droneFreq2: 200,
    droneGain: 0.06,
    chantBaseFreq: 300,
    chantGain: 0.05,
    chantIntervalMs: 2200,
    chantVariance: 80,
  },
  // IPL: massive roaring crowds, deep bass, powerful
  ipl: {
    noiseGain: 0.45,
    noiseBandpass: 350,
    noiseQ: 0.4,
    noiseBrownianFactor: 0.04,
    droneFreq1: 80,
    droneFreq2: 130,
    droneGain: 0.1,
    chantBaseFreq: 200,
    chantGain: 0.08,
    chantIntervalMs: 2800,
    chantVariance: 50,
  },
};

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function getArenaConfig(arenaId?: string): ArenaAudioConfig {
  if (arenaId && arenaId in ARENA_AUDIO) return ARENA_AUDIO[arenaId as ArenaAudioProfile];
  // Map unknown arena ids to closest profile
  if (arenaId === "classroom") return ARENA_AUDIO.school;
  return ARENA_AUDIO.ipl; // default to IPL
}

function createCrowdNoise(ac: AudioContext, dest: AudioNode, cfg: ArenaAudioConfig) {
  const len = ac.sampleRate * 4;
  const buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (i === 0 ? 0 : d[i - 1]) + (Math.random() * 2 - 1) * cfg.noiseBrownianFactor;
      d[i] *= 0.95;
    }
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = cfg.noiseBandpass;
  bp.Q.value = cfg.noiseQ;

  const g = ac.createGain();
  g.gain.value = cfg.noiseGain;

  src.connect(bp);
  bp.connect(g);
  g.connect(dest);
  src.start();
  return src;
}

function createDrone(ac: AudioContext, dest: AudioNode, cfg: ArenaAudioConfig) {
  const o1 = ac.createOscillator();
  const o2 = ac.createOscillator();
  o1.type = "sine";
  o2.type = "sine";
  o1.frequency.value = cfg.droneFreq1;
  o2.frequency.value = cfg.droneFreq2;
  o2.detune.value = 5;

  const g = ac.createGain();
  g.gain.value = cfg.droneGain;

  o1.connect(g);
  o2.connect(g);
  g.connect(dest);
  o1.start();
  o2.start();
  return { o1, o2 };
}

function startChantPulse(ac: AudioContext, dest: AudioNode, cfg: ArenaAudioConfig) {
  const pulse = () => {
    try {
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = cfg.chantBaseFreq + Math.random() * cfg.chantVariance;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(cfg.chantGain, t + 0.8);
      g.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 2.5);
    } catch { /* ignore */ }
  };
  const id = setInterval(pulse, cfg.chantIntervalMs + Math.random() * 1500);
  pulse();
  return id;
}

export function startAmbientStadium(volume = 0.3, arenaId?: string) {
  // If arena changed, restart with new profile
  if (running && arenaId !== currentArenaId) {
    stopAmbientStadium();
  }
  if (running) {
    setAmbientVolume(volume);
    return;
  }
  try {
    const ac = getCtx();
    const cfg = getArenaConfig(arenaId);
    currentArenaId = arenaId || null;
    baseVolume = Math.max(0, Math.min(1, volume));
    masterGain = ac.createGain();
    masterGain.gain.value = baseVolume;
    masterGain.connect(ac.destination);

    noiseSource = createCrowdNoise(ac, masterGain, cfg);
    const drone = createDrone(ac, masterGain, cfg);
    droneOsc1 = drone.o1;
    droneOsc2 = drone.o2;
    chantInterval = startChantPulse(ac, masterGain, cfg);
    running = true;
  } catch { /* Audio not supported */ }
}

export function stopAmbientStadium() {
  if (!running) return;
  try {
    noiseSource?.stop();
    droneOsc1?.stop();
    droneOsc2?.stop();
    if (chantInterval) clearInterval(chantInterval);
    if (boostTimeout) clearTimeout(boostTimeout);
    if (silenceTimeout) clearTimeout(silenceTimeout);
  } catch { /* ignore */ }
  noiseSource = null;
  droneOsc1 = null;
  droneOsc2 = null;
  chantInterval = null;
  boostTimeout = null;
  silenceTimeout = null;
  masterGain = null;
  boosting = false;
  running = false;
  currentArenaId = null;
}

export function setAmbientVolume(v: number) {
  baseVolume = Math.max(0, Math.min(1, v));
  if (masterGain && !boosting) {
    masterGain.gain.setTargetAtTime(baseVolume, masterGain.context.currentTime, 0.1);
  }
}

/** Temporarily boost ambient volume for a crowd roar effect */
export function crowdRoar(intensity: "four" | "six" = "six") {
  if (!masterGain || !running) return;
  const peak = intensity === "six" ? Math.min(baseVolume * 3.5, 1) : Math.min(baseVolume * 2.5, 1);
  const duration = intensity === "six" ? 2.5 : 1.8;
  const ac = masterGain.context;

  boosting = true;
  if (boostTimeout) clearTimeout(boostTimeout);
  if (silenceTimeout) clearTimeout(silenceTimeout);

  masterGain.gain.cancelScheduledValues(ac.currentTime);
  masterGain.gain.setTargetAtTime(peak, ac.currentTime, 0.08);

  try {
    const burstLen = Math.floor(ac.sampleRate * duration);
    const buf = ac.createBuffer(2, burstLen, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < burstLen; i++) {
        d[i] = (Math.random() * 2 - 1) * 0.6;
      }
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 600;
    bp.Q.value = 0.4;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.12, ac.currentTime);
    g.gain.setValueAtTime(0.12, ac.currentTime + duration * 0.4);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    src.connect(bp);
    bp.connect(g);
    g.connect(masterGain);
    src.start();
    src.stop(ac.currentTime + duration);
  } catch { /* ignore */ }

  boostTimeout = setTimeout(() => {
    if (masterGain) {
      masterGain.gain.setTargetAtTime(baseVolume, masterGain.context.currentTime, 0.3);
    }
    boosting = false;
  }, duration * 1000);
}

/** Briefly duck the stadium ambience on a wicket, then restore it. */
export function crowdGaspMute(durationMs = 1000) {
  if (!masterGain || !running) return;
  const ac = masterGain.context;

  boosting = true;
  if (boostTimeout) clearTimeout(boostTimeout);
  if (silenceTimeout) clearTimeout(silenceTimeout);

  masterGain.gain.cancelScheduledValues(ac.currentTime);
  masterGain.gain.setTargetAtTime(0.001, ac.currentTime, 0.05);

  silenceTimeout = setTimeout(() => {
    if (masterGain) {
      masterGain.gain.setTargetAtTime(baseVolume, masterGain.context.currentTime, 0.25);
    }
    boosting = false;
  }, durationMs);
}

export function isAmbientPlaying() {
  return running;
}
