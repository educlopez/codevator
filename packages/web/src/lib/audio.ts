type Mode = "elevator" | "typewriter" | "ambient" | "retro" | "minimal";

const MP3_MODES: Mode[] = ["elevator", "typewriter", "ambient"];

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let masterGain: GainNode | null = null;
let audioEl: HTMLAudioElement | null = null;
let mediaSource: MediaElementAudioSourceNode | null = null;
let activeNodes: AudioNode[] = [];
let activeTimers: ReturnType<typeof setTimeout>[] = [];
let currentMode: Mode | null = null;
let muted = false;

/** Call on a user gesture (click/tap) to unlock AudioContext for the session. */
export function unlockAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMasterGain(): GainNode {
  const ctx = getCtx();
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(ctx.destination);
  }
  return masterGain;
}

function getAnalyserNode(): AnalyserNode {
  const ctx = getCtx();
  if (!analyser) {
    analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.82;
    analyser.connect(getMasterGain());
  }
  return analyser;
}

/** Get the AnalyserNode for visualization. Returns null if audio not initialized. */
export function getAnalyser(): AnalyserNode | null {
  return analyser;
}


function stopAll() {
  // Stop MP3 playback
  if (audioEl) {
    audioEl.pause();
    audioEl.src = "";
    audioEl = null;
  }
  if (mediaSource) {
    try { mediaSource.disconnect(); } catch {}
    mediaSource = null;
  }

  // Stop synthesis
  activeTimers.forEach(clearTimeout);
  activeTimers = [];
  activeNodes.forEach((node) => {
    try {
      if (node instanceof OscillatorNode) node.stop();
      if (node instanceof AudioBufferSourceNode) node.stop();
      node.disconnect();
    } catch {}
  });
  activeNodes = [];
  currentMode = null;
}

// -- MP3 playback for elevator, typewriter, ambient --
function playMp3(mode: Mode) {
  const ctx = getCtx();
  const dest = getAnalyserNode();

  audioEl = new Audio();
  audioEl.crossOrigin = "anonymous";
  audioEl.loop = true;
  audioEl.volume = 1;
  audioEl.src = `/sounds/${mode}.mp3`;

  mediaSource = ctx.createMediaElementSource(audioEl);

  const gain = ctx.createGain();
  gain.gain.value = 0.7;

  mediaSource.connect(gain);
  gain.connect(dest);
  activeNodes.push(gain);

  audioEl.play().catch(() => {});
}

// -- Vinyl crackle layer (shared lo-fi texture) --
function addVinylCrackle(ctx: AudioContext, destination: AudioNode, volume = 0.02) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() < 0.002 ? (Math.random() - 0.5) * 2 : 0;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1200;
  filter.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start();

  activeNodes.push(source, filter, gain);
}

// -- Retro: mellow 8-bit arpeggio, lo-fi filtered --
function playRetro() {
  const ctx = getCtx();
  const dest = getAnalyserNode();

  const lpf = ctx.createBiquadFilter();
  lpf.type = "lowpass";
  lpf.frequency.value = 2000;
  lpf.Q.value = 0.5;

  const master = ctx.createGain();
  master.gain.value = 0.1;

  lpf.connect(master);
  master.connect(dest);
  activeNodes.push(lpf, master);

  addVinylCrackle(ctx, master, 0.02);

  const notes = [523, 659, 784, 1047, 784, 659];
  let noteIndex = 0;

  function playNote() {
    if (currentMode !== "retro") return;

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = notes[noteIndex % notes.length];

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.2, ctx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(noteGain);
    noteGain.connect(lpf);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);

    noteIndex++;
    activeTimers.push(setTimeout(playNote, 200));
  }

  playNote();
}

// -- Minimal: deep warm hum with slow breathing --
function playMinimal() {
  const ctx = getCtx();
  const dest = getAnalyserNode();

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 55;

  const tremolo = ctx.createGain();
  tremolo.gain.value = 0.5;
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.12;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.3;
  lfo.connect(lfoGain);
  lfoGain.connect(tremolo.gain);

  const lpf = ctx.createBiquadFilter();
  lpf.type = "lowpass";
  lpf.frequency.value = 200;

  const master = ctx.createGain();
  master.gain.value = 0.1;

  osc.connect(tremolo);
  tremolo.connect(lpf);
  lpf.connect(master);
  master.connect(dest);
  osc.start();
  lfo.start();

  addVinylCrackle(ctx, master, 0.01);
  activeNodes.push(osc, lfo, lfoGain, tremolo, lpf, master);
}

export function playMode(mode: Mode) {
  if (currentMode === mode) return;
  stopAll();
  currentMode = mode;

  if (MP3_MODES.includes(mode)) {
    playMp3(mode);
  } else {
    switch (mode) {
      case "retro": playRetro(); break;
      case "minimal": playMinimal(); break;
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("codevator:mode", { detail: mode }));
  }
}

export function stopAudio() {
  stopAll();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("codevator:mode", { detail: null }));
  }
}

export function isAudioPlaying(): boolean {
  return currentMode !== null;
}

export function getCurrentMode(): Mode | null {
  return currentMode;
}

export function toggleMute(): boolean {
  muted = !muted;
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 1;
  }
  return muted;
}

export function isMuted(): boolean {
  return muted;
}
