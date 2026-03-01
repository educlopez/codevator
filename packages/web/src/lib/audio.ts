let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let masterGain: GainNode | null = null;
let audioEl: HTMLAudioElement | null = null;
let mediaSource: MediaElementAudioSourceNode | null = null;
let activeNodes: AudioNode[] = [];
let activeTimers: ReturnType<typeof setTimeout>[] = [];
let currentMode: string | null = null;
let volume = 0.35;

let _mobile: boolean | null = null;
function isMobileDevice(): boolean {
  if (_mobile === null) {
    _mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  }
  return _mobile;
}

let muted = isMobileDevice();

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
  // Cancel any pending cleanup timers from previous stopAll calls
  activeTimers.forEach(clearTimeout);
  activeTimers = [];

  // Fade out active gain nodes before stopping
  if (audioCtx && activeNodes.length > 0) {
    const now = audioCtx.currentTime;
    activeNodes.forEach((node) => {
      if (node instanceof GainNode) {
        node.gain.linearRampToValueAtTime(0, now + 0.5);
      }
    });
  }

  if (audioCtx && activeNodes.some((n) => n instanceof GainNode)) {
    // Capture snapshots of resources to clean up, so a later playMode
    // call won't have its resources torn down by this stale closure.
    const capturedAudioEl = audioEl;
    const capturedMediaSource = mediaSource;
    const capturedNodes = activeNodes;

    // Clear globals immediately so new playMode gets fresh state
    audioEl = null;
    mediaSource = null;
    activeNodes = [];
    currentMode = null;

    const timer = setTimeout(() => {
      if (capturedAudioEl) {
        capturedAudioEl.pause();
        capturedAudioEl.src = "";
      }
      if (capturedMediaSource) {
        try { capturedMediaSource.disconnect(); } catch {}
      }
      capturedNodes.forEach((node) => {
        try {
          if (node instanceof OscillatorNode) node.stop();
          if (node instanceof AudioBufferSourceNode) node.stop();
          node.disconnect();
        } catch {}
      });
    }, 550);
    activeTimers.push(timer);
  } else {
    // No fade needed — clean up immediately on current globals
    if (audioEl) {
      audioEl.pause();
      audioEl.src = "";
      audioEl = null;
    }
    if (mediaSource) {
      try { mediaSource.disconnect(); } catch {}
      mediaSource = null;
    }
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
}

// -- MP3 playback --
function playMp3(mode: string) {
  const ctx = getCtx();
  const dest = getAnalyserNode();

  audioEl = new Audio();
  audioEl.crossOrigin = "anonymous";
  audioEl.loop = true;
  audioEl.volume = 1;
  audioEl.src = `/sounds/${mode}.mp3`;

  mediaSource = ctx.createMediaElementSource(audioEl);

  const gain = ctx.createGain();
  // Fade in smoothly over 800ms instead of starting abruptly
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.8);

  mediaSource.connect(gain);
  gain.connect(dest);
  activeNodes.push(gain);

  audioEl.play().catch(() => {});
}

export function playMode(mode: string) {
  if (currentMode === mode) return;
  stopAll();
  currentMode = mode;

  playMp3(mode);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("codevator:mode", { detail: mode }));
  }
}

/** Play an arbitrary sound URL. `detail` is dispatched via codevator:mode for cross-component sync. */
export function playFile(url: string, detail: string) {
  if (currentMode === detail) return;
  stopAll();
  currentMode = detail;

  const ctx = getCtx();
  const dest = getAnalyserNode();

  audioEl = new Audio();
  audioEl.crossOrigin = "anonymous";
  audioEl.loop = true;
  audioEl.volume = 1;
  audioEl.src = url;

  mediaSource = ctx.createMediaElementSource(audioEl);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.8);

  mediaSource.connect(gain);
  gain.connect(dest);
  activeNodes.push(gain);

  audioEl.play().catch(() => {});

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("codevator:mode", { detail }));
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

export function getCurrentMode(): string | null {
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
