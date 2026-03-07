import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getConfig, getConfigDir } from "./config.js";
import { recordPlay } from "./stats.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Path helpers ---

export function getPidFile(): string {
  return path.join(getConfigDir(), "player.pid");
}

function getDaemonPidFile(): string {
  return path.join(getConfigDir(), "daemon.pid");
}

function getCommandFile(): string {
  return path.join(getConfigDir(), "command.json");
}

function getStateFile(): string {
  return path.join(getConfigDir(), "state.json");
}

function getDaemonScriptFile(): string {
  return path.join(getConfigDir(), "daemon.js");
}

function getLockFile(): string {
  return path.join(getConfigDir(), "player.lock");
}

function getSessionsDir(): string {
  return path.join(getConfigDir(), "sessions");
}

// --- Session identity ---

let _sessionId: string | undefined;

/**
 * Set the stable session identifier (from Claude Code's hook JSON on stdin).
 * Must be called before play()/stop() for correct multi-session tracking.
 */
export function setSessionId(id: string): void {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error(`Invalid session ID: contains disallowed characters`);
  }
  _sessionId = id;
}

function getSessionId(): string {
  return _sessionId || String(process.ppid);
}

// --- Session management (multi-session support) ---

const STALE_SESSION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Register this invocation's session. Called on every play() to act as a
 * heartbeat — PreToolUse fires on every tool use, keeping the file fresh.
 */
function registerSession(): void {
  const dir = getSessionsDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, getSessionId()), String(Date.now()));
}

/** Unregister this invocation's session (called on stop). */
function unregisterSession(): void {
  try {
    fs.unlinkSync(path.join(getSessionsDir(), getSessionId()));
  } catch {
    // Already gone
  }
}

/** Check if any non-stale session files exist. */
function hasActiveSessions(): boolean {
  const dir = getSessionsDir();
  try {
    const files = fs.readdirSync(dir);
    const now = Date.now();
    for (const f of files) {
      try {
        const ts = parseInt(fs.readFileSync(path.join(dir, f), "utf-8"), 10);
        if (now - ts <= STALE_SESSION_MS) return true;
        // Stale — clean up
        fs.unlinkSync(path.join(dir, f));
      } catch {
        // Unreadable — remove
        try { fs.unlinkSync(path.join(dir, f)); } catch {}
      }
    }
  } catch {
    // Dir doesn't exist
  }
  return false;
}

// --- Atomic lock (prevents race conditions from concurrent hook invocations) ---

function acquireLock(): boolean {
  const lockFile = getLockFile();
  try {
    fs.mkdirSync(path.dirname(lockFile), { recursive: true });
    const fd = fs.openSync(lockFile, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY);
    fs.writeSync(fd, String(process.pid));
    fs.closeSync(fd);
    return true;
  } catch {
    try {
      const stat = fs.statSync(lockFile);
      if (Date.now() - stat.mtimeMs > 10_000) {
        fs.unlinkSync(lockFile);
        const fd = fs.openSync(lockFile, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY);
        fs.writeSync(fd, String(process.pid));
        fs.closeSync(fd);
        return true;
      }
    } catch {
      // Another process beat us
    }
    return false;
  }
}

function releaseLock(): void {
  try {
    fs.unlinkSync(getLockFile());
  } catch {
    // Already gone
  }
}

// --- Spotify helpers ---

export function getSpotifyOriginalVolumeFile(): string {
  return path.join(getConfigDir(), "spotify-original-volume");
}

export function isSpotifyRunning(): boolean {
  if (process.platform !== "darwin") return false;
  try {
    const result = execSync(
      'osascript -e \'tell application "System Events" to (name of processes) contains "Spotify"\'',
      { encoding: "utf-8", timeout: 3000 },
    ).trim();
    return result === "true";
  } catch {
    return false;
  }
}

function generateSpotifyJXAScript(): string {
  return `
ObjC.import('Foundation');

var commandPath = ${JSON.stringify(getCommandFile())};
var statePath = ${JSON.stringify(getStateFile())};
var sessionsPath = ${JSON.stringify(getSessionsDir())};
var originalVolumePath = ${JSON.stringify(getSpotifyOriginalVolumeFile())};
var isActive = false;
var wasPlaying = false;
var FADE_STEPS = 15;
var FADE_INTERVAL = 0.05;
var STALE_SESSION_MS = 10 * 60 * 1000;
var IDLE_TIMEOUT_MS = 30 * 60 * 1000;
var originalVolume = null;

function readFile(p) {
  try {
    var s = $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null);
    if (s && !s.isNil()) return s.js;
  } catch(e) {}
  return null;
}

function writeFile(p, content) {
  var s = $.NSString.alloc.initWithUTF8String(content);
  s.writeToFileAtomicallyEncodingError(p, true, $.NSUTF8StringEncoding, null);
}

function removeFile(p) {
  try { $.NSFileManager.defaultManager.removeItemAtPathError(p, null); } catch(e) {}
}

function writeState(playing) {
  writeFile(statePath, JSON.stringify({
    playing: playing,
    mode: 'spotify',
    volume: originalVolume
  }));
}

function spotifyRunning() {
  try {
    return Application('Spotify').running();
  } catch(e) {
    return false;
  }
}

function getSpotifyVolume() {
  try {
    if (!spotifyRunning()) return null;
    return Application('Spotify').soundVolume();
  } catch(e) {
    return null;
  }
}

function setSpotifyVolume(vol) {
  try {
    if (!spotifyRunning()) return;
    Application('Spotify').soundVolume = Math.round(Math.max(0, Math.min(100, vol)));
  } catch(e) {}
}

function getSpotifyPlayerState() {
  try {
    if (!spotifyRunning()) return null;
    return Application('Spotify').playerState();
  } catch(e) {
    return null;
  }
}

function spotifyPlay() {
  try {
    if (!spotifyRunning()) return;
    Application('Spotify').play();
  } catch(e) {}
}

function spotifyPause() {
  try {
    if (!spotifyRunning()) return;
    Application('Spotify').pause();
  } catch(e) {}
}

function saveOriginalVolume() {
  // Check if we already have a saved volume (from a previous daemon crash)
  var saved = readFile(originalVolumePath);
  if (saved !== null) {
    originalVolume = parseInt(saved, 10);
    if (isNaN(originalVolume) || originalVolume < 0) originalVolume = null;
  }

  if (originalVolume === null) {
    var current = getSpotifyVolume();
    if (current !== null && current > 0) {
      originalVolume = current;
    } else {
      originalVolume = 50; // sensible default if Spotify is muted or unreachable
    }
  }
  writeFile(originalVolumePath, String(originalVolume));

  // Remember if Spotify was already playing before we took control
  var state = getSpotifyPlayerState();
  wasPlaying = (state === 'playing');
}

function restoreOriginalVolume() {
  if (originalVolume !== null) {
    setSpotifyVolume(originalVolume);
  }
  // Restore playback state: if Spotify was paused before we started, pause it again
  if (!wasPlaying) {
    spotifyPause();
  }
  removeFile(originalVolumePath);
}

// --- Session checking ---

function checkActiveSessions() {
  try {
    var fm = $.NSFileManager.defaultManager;
    var contents = fm.contentsOfDirectoryAtPathError(sessionsPath, null);
    if (!contents || contents.isNil() || contents.count === 0) return false;

    var now = Date.now();
    var activeCount = 0;

    for (var i = 0; i < contents.count; i++) {
      var filename = contents.objectAtIndex(i).js;
      var filePath = sessionsPath + '/' + filename;
      var str = readFile(filePath);
      if (str) {
        var ts = parseInt(str, 10);
        if (now - ts > STALE_SESSION_MS) {
          removeFile(filePath);
        } else {
          activeCount++;
        }
      } else {
        removeFile(filePath);
      }
    }

    return activeCount > 0;
  } catch(e) {
    return false;
  }
}

// --- Fade controls ---

function fadeIn() {
  if (!spotifyRunning()) {
    writeState(false);
    return;
  }
  if (originalVolume === null) saveOriginalVolume();

  // Ensure Spotify is playing
  var state = getSpotifyPlayerState();
  if (state !== 'playing') {
    spotifyPlay();
    delay(0.2);
  }

  var current = getSpotifyVolume();
  if (current === null) return;

  var target = originalVolume;
  if (current >= target - 1) {
    isActive = true;
    writeState(true);
    return;
  }

  var step = (target - current) / FADE_STEPS;
  for (var i = 1; i <= FADE_STEPS; i++) {
    setSpotifyVolume(current + (i * step));
    delay(FADE_INTERVAL);
  }
  setSpotifyVolume(target);
  isActive = true;
  writeState(true);
}

function fadeOut() {
  if (!spotifyRunning()) {
    isActive = false;
    writeState(false);
    return;
  }

  var current = getSpotifyVolume();
  if (current === null || current <= 1) {
    spotifyPause();
    isActive = false;
    writeState(false);
    return;
  }

  var step = current / FADE_STEPS;
  for (var i = FADE_STEPS - 1; i >= 0; i--) {
    setSpotifyVolume(Math.max(i * step, 0));
    delay(FADE_INTERVAL);
  }
  setSpotifyVolume(0);
  spotifyPause();
  isActive = false;
  writeState(false);
}

// --- Initialize ---
saveOriginalVolume();
fadeIn();

// --- Main control loop ---
var idleSince = null;

while (true) {
  // 1. Check for explicit commands
  var raw = readFile(commandPath);
  if (raw) {
    try {
      removeFile(commandPath);
      var cmd = JSON.parse(raw);

      if (cmd.action === 'fadeIn') {
        idleSince = null;
        fadeIn();
      } else if (cmd.action === 'fadeOut') {
        fadeOut();
        idleSince = Date.now();
      } else if (cmd.action === 'restoreQuit') {
        // All sessions ended — restore volume directly (no fade to zero)
        restoreOriginalVolume();
        writeState(false);
        break;
      } else if (cmd.action === 'quit') {
        fadeOut();
        restoreOriginalVolume();
        writeState(false);
        break;
      }
    } catch(e) {}
  }

  // 2. Multi-session awareness (stale heartbeats — Claude idle, not exited)
  var activeSessions = checkActiveSessions();
  if (isActive && !activeSessions) {
    fadeOut();
    idleSince = Date.now();
  } else if (!isActive && activeSessions && !idleSince) {
    fadeIn();
  }

  // 3. Auto-exit after extended idle
  if (idleSince && (Date.now() - idleSince) > IDLE_TIMEOUT_MS) {
    restoreOriginalVolume();
    writeState(false);
    break;
  }

  delay(0.25);
}
`;
}

function startSpotifyDaemon(): void {
  const configDir = getConfigDir();
  fs.mkdirSync(configDir, { recursive: true });

  const script = generateSpotifyJXAScript();
  fs.writeFileSync(getDaemonScriptFile(), script);

  const child = spawn("osascript", ["-l", "JavaScript", getDaemonScriptFile()], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  if (child.pid) {
    fs.writeFileSync(getDaemonPidFile(), String(child.pid));
  }
}

async function playSpotify(): Promise<void> {
  if (process.platform !== "darwin") return;

  if (isDaemonRunning()) {
    // Already running as spotify daemon — just send fadeIn
    writeCommand({ action: "fadeIn" });
    return;
  }

  startSpotifyDaemon();
}

// --- Sound file discovery ---

export function detectPlayer(): string {
  const platform = process.platform;
  if (platform === "darwin") return "afplay";
  try {
    execSync("which paplay", { stdio: "ignore" });
    return "paplay";
  } catch {
    return "aplay";
  }
}

function buildArgs(player: string, volume: number, filePath: string): string[] {
  if (player === "afplay") {
    return ["-v", String(volume / 100), filePath];
  }
  return [filePath];
}

export function getSoundFile(mode: string): string | null {
  const files = getSoundFiles(mode);
  return files.length > 0 ? files[0] : null;
}

const SOUND_EXTENSIONS = [".mp3", ".wav", ".ogg", ".m4a"] as const;

/**
 * Get all sound files for a mode, including numbered variations.
 * Looks for: mode.ext, mode-2.ext, mode-3.ext, etc. (ext = mp3, wav, ogg, m4a)
 * Checks user's local sounds dir first, then bundled sounds.
 */
export function getSoundFiles(mode: string): string[] {
  const seen = new Set<string>();
  const files: string[] = [];

  const localDir = path.join(getConfigDir(), "sounds");
  const bundledDir = path.join(__dirname, "..", "sounds");

  for (const dir of [localDir, bundledDir]) {
    for (const ext of SOUND_EXTENSIONS) {
      const primary = path.join(dir, `${mode}${ext}`);
      if (fs.existsSync(primary) && !seen.has(path.basename(primary))) {
        seen.add(path.basename(primary));
        files.push(primary);
      }
      for (let i = 2; i <= 99; i++) {
        const variant = path.join(dir, `${mode}-${i}${ext}`);
        if (fs.existsSync(variant) && !seen.has(path.basename(variant))) {
          seen.add(path.basename(variant));
          files.push(variant);
        } else if (!fs.existsSync(variant)) {
          break; // Variants are expected to be sequentially numbered; stop at first gap
        }
      }
    }
  }

  return files;
}

// --- State & command management ---

interface PlayerState {
  playing: boolean;
  mode?: string;
  volume?: number;
}

function readState(): PlayerState {
  try {
    return JSON.parse(fs.readFileSync(getStateFile(), "utf-8"));
  } catch {
    return { playing: false };
  }
}

function writeCommand(cmd: Record<string, unknown>): void {
  const dir = getConfigDir();
  fs.mkdirSync(dir, { recursive: true });
  // Atomic write: write to temp file then rename
  const tmpFile = getCommandFile() + ".tmp";
  fs.writeFileSync(tmpFile, JSON.stringify({ ...cmd, ts: Date.now() }));
  fs.renameSync(tmpFile, getCommandFile());
}

// --- macOS JXA daemon ---

export function isDaemonRunning(): boolean {
  try {
    const pid = parseInt(fs.readFileSync(getDaemonPidFile(), "utf-8").trim(), 10);
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function generateJXAScript(
  soundFiles: string[],
  volume: number,
  mode: string,
): string {
  // JXA script using AVFoundation's AVAudioPlayer for full playback control.
  // Provides: fade in/out, position persistence, file rotation, random start,
  // and multi-session awareness via heartbeat files.
  return `
ObjC.import('AVFoundation');
ObjC.import('Foundation');

var soundFiles = ${JSON.stringify(soundFiles)};
var currentIndex = 0;
var targetVolume = ${volume};
var mode = ${JSON.stringify(mode)};
var commandPath = ${JSON.stringify(getCommandFile())};
var statePath = ${JSON.stringify(getStateFile())};
var sessionsPath = ${JSON.stringify(getSessionsDir())};
var player = null;
var isActive = false;
var FADE_STEPS = 12;
var FADE_INTERVAL = 0.06;
var STALE_SESSION_MS = 10 * 60 * 1000;
var IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function readFile(p) {
  try {
    var s = $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null);
    if (s && !s.isNil()) return s.js;
  } catch(e) {}
  return null;
}

function writeFile(p, content) {
  var s = $.NSString.alloc.initWithUTF8String(content);
  s.writeToFileAtomicallyEncodingError(p, true, $.NSUTF8StringEncoding, null);
}

function removeFile(p) {
  try { $.NSFileManager.defaultManager.removeItemAtPathError(p, null); } catch(e) {}
}

function writeState(playing) {
  writeFile(statePath, JSON.stringify({
    playing: playing,
    mode: mode,
    volume: targetVolume
  }));
}

function createPlayer(filePath) {
  var url = $.NSURL.fileURLWithPath(filePath);
  var p = $.AVAudioPlayer.alloc.initWithContentsOfURLError(url, null);
  if (!p || p.isNil()) return null;
  p.numberOfLoops = -1;
  p.volume = 0;
  p.prepareToPlay;
  return p;
}

// --- Session checking ---

function checkActiveSessions() {
  try {
    var fm = $.NSFileManager.defaultManager;
    var contents = fm.contentsOfDirectoryAtPathError(sessionsPath, null);
    if (!contents || contents.isNil() || contents.count === 0) return false;

    var now = Date.now();
    var activeCount = 0;

    for (var i = 0; i < contents.count; i++) {
      var filename = contents.objectAtIndex(i).js;
      var filePath = sessionsPath + '/' + filename;
      var str = readFile(filePath);
      if (str) {
        var ts = parseInt(str, 10);
        if (now - ts > STALE_SESSION_MS) {
          removeFile(filePath);
        } else {
          activeCount++;
        }
      } else {
        removeFile(filePath);
      }
    }

    return activeCount > 0;
  } catch(e) {
    return false;
  }
}

// --- Fade controls ---

function fadeIn() {
  if (!player) {
    player = createPlayer(soundFiles[currentIndex]);
    if (!player) return;
    var dur = player.duration;
    if (dur > 10) {
      player.currentTime = Math.random() * dur;
    }
    player.play;
  } else if (!player.isPlaying) {
    player.play;
  }

  var startVol = player.volume;
  var delta = targetVolume - startVol;
  if (delta <= 0.01) {
    player.volume = targetVolume;
    isActive = true;
    writeState(true);
    return;
  }
  var step = delta / FADE_STEPS;
  for (var i = 1; i <= FADE_STEPS; i++) {
    player.volume = Math.min(startVol + (i * step), targetVolume);
    delay(FADE_INTERVAL);
  }
  player.volume = targetVolume;
  isActive = true;
  writeState(true);
}

function fadeOut() {
  if (!player) return;
  var startVol = player.volume;
  if (startVol <= 0.01) {
    isActive = false;
    writeState(false);
    return;
  }
  var step = startVol / FADE_STEPS;
  for (var i = FADE_STEPS - 1; i >= 0; i--) {
    player.volume = Math.max(i * step, 0);
    delay(FADE_INTERVAL);
  }
  player.volume = 0;
  isActive = false;
  writeState(false);
}

function switchMode(newMode, files, vol) {
  fadeOut();
  if (player) {
    player.stop;
    player = null;
  }
  mode = newMode;
  soundFiles = files;
  currentIndex = 0;
  targetVolume = vol;
  fadeIn();
}

function rotateTrack() {
  if (soundFiles.length <= 1) return;
  var oldPlayer = player;
  currentIndex = (currentIndex + 1) % soundFiles.length;
  player = createPlayer(soundFiles[currentIndex]);
  if (!player) {
    player = oldPlayer;
    return;
  }
  player.volume = 0;
  player.play;
  var steps = 8;
  var interval = 0.1;
  for (var i = 1; i <= steps; i++) {
    var frac = i / steps;
    player.volume = targetVolume * frac;
    if (oldPlayer) oldPlayer.volume = targetVolume * (1 - frac);
    delay(interval);
  }
  player.volume = targetVolume;
  if (oldPlayer) {
    oldPlayer.stop;
  }
}

// --- Initialize and fade in ---
fadeIn();

// --- Main control loop ---
var idleSince = null;
var lastRotateCheck = Date.now();
var ROTATE_INTERVAL_MS = 3 * 60 * 1000;

while (true) {
  // 1. Check for explicit commands (fadeIn from play(), quit from shutdown())
  var raw = readFile(commandPath);
  if (raw) {
    try {
      removeFile(commandPath);
      var cmd = JSON.parse(raw);

      if (cmd.action === 'fadeIn') {
        idleSince = null;
        if (cmd.mode && cmd.mode !== mode && cmd.files) {
          switchMode(cmd.mode, cmd.files, cmd.volume ?? targetVolume);
        } else {
          if (cmd.volume !== undefined) targetVolume = cmd.volume;
          fadeIn();
        }
      } else if (cmd.action === 'fadeOut') {
        fadeOut();
        idleSince = Date.now();
      } else if (cmd.action === 'quit') {
        fadeOut();
        if (player) player.stop;
        writeState(false);
        break;
      }
    } catch(e) {}
  }

  // 2. Multi-session awareness: fade based on active session count
  var activeSessions = checkActiveSessions();
  if (isActive && !activeSessions) {
    // All sessions gone — fade out, but daemon stays alive
    fadeOut();
    idleSince = Date.now();
  } else if (!isActive && activeSessions && !idleSince) {
    // Edge case: sessions reappeared without a fadeIn command
    fadeIn();
  }

  // 3. Rotate tracks for variety when multiple files available
  if (isActive && soundFiles.length > 1) {
    var now = Date.now();
    if (now - lastRotateCheck > ROTATE_INTERVAL_MS) {
      lastRotateCheck = now;
      rotateTrack();
    }
  }

  // 4. Auto-exit after extended idle (safety net — daemon shouldn't live forever)
  if (idleSince && (Date.now() - idleSince) > IDLE_TIMEOUT_MS) {
    if (player) player.stop;
    writeState(false);
    break;
  }

  delay(0.25);
}
`;
}

function startDaemon(soundFiles: string[], volume: number, mode: string): void {
  const configDir = getConfigDir();
  fs.mkdirSync(configDir, { recursive: true });

  const script = generateJXAScript(soundFiles, volume, mode);
  fs.writeFileSync(getDaemonScriptFile(), script);

  const child = spawn("osascript", ["-l", "JavaScript", getDaemonScriptFile()], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  if (child.pid) {
    fs.writeFileSync(getDaemonPidFile(), String(child.pid));
  }
}

function killDaemon(): void {
  try {
    const pid = parseInt(fs.readFileSync(getDaemonPidFile(), "utf-8").trim(), 10);
    process.kill(-pid, "SIGTERM");
  } catch {
    // Already dead
  }
  try { fs.unlinkSync(getDaemonPidFile()); } catch {}
  try { fs.unlinkSync(getStateFile()); } catch {}
  try { fs.unlinkSync(getCommandFile()); } catch {}
}

// --- Linux player (enhanced with file rotation) ---

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function spawnLinuxPlayer(soundFiles: string[], volume: number): void {
  const player = detectPlayer();

  let loopBody: string;
  if (soundFiles.length === 1) {
    const args = buildArgs(player, volume * 100, soundFiles[0]);
    loopBody = `${shellQuote(player)} ${args.map(shellQuote).join(" ")}`;
  } else {
    const playCommands = soundFiles.map(f => {
      const args = buildArgs(player, volume * 100, f);
      return `${shellQuote(player)} ${args.map(shellQuote).join(" ")}`;
    });
    loopBody = playCommands.join("; ");
  }

  const child = spawn("sh", ["-c", `while true; do ${loopBody}; done`], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  if (child.pid) {
    const configDir = getConfigDir();
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(getPidFile(), String(child.pid));
  }
}

function killLinuxPlayer(): void {
  const pidFile = getPidFile();
  try {
    const pid = parseInt(fs.readFileSync(pidFile, "utf-8").trim(), 10);
    process.kill(-pid, "SIGTERM");
  } catch {
    // Already dead
  }
  try { fs.unlinkSync(pidFile); } catch {}
}

export function isLinuxPlayerRunning(): boolean {
  try {
    const pid = parseInt(fs.readFileSync(getPidFile(), "utf-8").trim(), 10);
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// --- Daemon mode management ---

async function killMismatchedDaemon(targetMode: string): Promise<void> {
  if (!isDaemonRunning()) return;
  const state = readState();
  if (state.mode && state.mode !== targetMode) {
    writeCommand({ action: "quit" });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Always clean up files — killDaemon() handles already-dead gracefully
    killDaemon();
  }
}

// --- Public API ---

export function isPlaying(): boolean {
  if (process.platform === "darwin") {
    if (!isDaemonRunning()) return false;
    return readState().playing;
  }
  return isLinuxPlayerRunning();
}

export async function play(): Promise<void> {
  if (!acquireLock()) return;

  try {
    const config = getConfig();
    if (!config.enabled) return;

    // Register this session's heartbeat (multi-session support)
    registerSession();

    // Track play stats
    try { recordPlay(config.mode); } catch { /* stats are non-critical */ }

    // Kill any running daemon whose mode doesn't match the target
    await killMismatchedDaemon(config.mode);

    // Spotify mode: control Spotify volume instead of playing sound files
    if (config.mode === "spotify") {
      await playSpotify();
      return;
    }

    let soundFiles = getSoundFiles(config.mode);

    // Lazy download if no files found
    if (soundFiles.length === 0) {
      try {
        const { downloadSound } = await import("./registry.js");
        await downloadSound(config.mode);
        soundFiles = getSoundFiles(config.mode);
      } catch {
        soundFiles = getSoundFiles("elevator");
      }
    }

    if (soundFiles.length === 0) return;

    const volume = config.volume / 100;

    if (process.platform === "darwin") {
      if (isDaemonRunning()) {
        // Daemon alive: send fadeIn command (fast path)
        writeCommand({
          action: "fadeIn",
          mode: config.mode,
          volume,
          files: soundFiles,
        });
      } else {
        // Start new daemon (it auto-fades in)
        startDaemon(soundFiles, volume, config.mode);
      }
    } else {
      // Linux: only restart if not already running
      if (!isLinuxPlayerRunning()) {
        spawnLinuxPlayer(soundFiles, volume);
      }
    }
  } finally {
    releaseLock();
  }
}

export function stop(): void {
  // Remove this session's heartbeat. The daemon detects when all sessions
  // are gone and fades out on its own — no explicit fadeOut command needed.
  // This means other active sessions keep their music.
  unregisterSession();

  if (process.platform !== "darwin") {
    // Linux: no daemon, so check if any other sessions are still active
    if (!hasActiveSessions()) {
      killLinuxPlayer();
    }
  }
}

/** Called from SessionEnd hook when a Claude session truly exits. */
export function sessionEnd(): void {
  unregisterSession();

  if (process.platform === "darwin" && isDaemonRunning()) {
    if (!hasActiveSessions()) {
      const state = readState();
      if (state.mode === "spotify") {
        // Last session exited — restore Spotify volume and stop daemon
        writeCommand({ action: "restoreQuit" });
      } else {
        // Last session exited — quit regular daemon immediately
        writeCommand({ action: "quit" });
      }
    }
  }

  if (process.platform !== "darwin") {
    if (!hasActiveSessions()) {
      killLinuxPlayer();
    }
  }
}

/** Full shutdown: kill daemon process (used by uninstall/off). */
export async function shutdown(): Promise<void> {
  unregisterSession();

  if (process.platform === "darwin") {
    if (isDaemonRunning()) {
      writeCommand({ action: "quit" });
      // Wait for daemon to process quit command
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Always clean up files — killDaemon() handles already-dead gracefully
      killDaemon();
      try { fs.unlinkSync(getSpotifyOriginalVolumeFile()); } catch {}
      return;
    }
    // Not running — clean up stale PID/state files
    killDaemon();
    try { fs.unlinkSync(getSpotifyOriginalVolumeFile()); } catch {}
  } else {
    killLinuxPlayer();
  }
}
