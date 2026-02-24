type Mode = "elevator" | "typewriter" | "ambient" | "retro" | "minimal";

const MP3_MODES: Mode[] = ["elevator", "typewriter", "ambient", "retro", "minimal"];

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let masterGain: GainNode | null = null;
let audioEl: HTMLAudioElement | null = null;
let mediaSource: MediaElementAudioSourceNode | null = null;
let activeNodes: AudioNode[] = [];
let activeTimers: ReturnType<typeof setTimeout>[] = [];
let currentMode: Mode | null = null;
let muted = false;
let volume = 0.35;

let _mobile: boolean | null = null;
function isMobileDevice(): boolean {
  if (_mobile === null) {
    _mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  }
  return _mobile;
}

export function isMobile(): boolean {
  return isMobileDevice();
}

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
    if (isMobileDevice()) muted = true;
    masterGain.gain.value = muted ? 0 : volume;
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

export function playMode(mode: Mode) {
  if (currentMode === mode) return;
  stopAll();
  currentMode = mode;

  playMp3(mode);

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
    masterGain.gain.value = muted ? 0 : volume;
  }
  return muted;
}

export function isMuted(): boolean {
  return muted;
}

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (volume === 0) {
    muted = true;
  } else if (muted) {
    muted = false;
  }
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : volume;
  }
}

export function getVolume(): number {
  return volume;
}
