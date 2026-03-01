import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Mock child_process before importing player
const mockSpawn = vi.fn();
vi.mock("node:child_process", async () => {
  const actual = await vi.importActual<typeof import("node:child_process")>("node:child_process");
  return {
    ...actual,
    execSync: vi.fn(actual.execSync),
    spawn: (...args: unknown[]) => {
      const result = mockSpawn(...args);
      return result ?? { pid: 12345, unref: vi.fn() };
    },
  };
});

import {
  play,
  stop,
  sessionEnd,
  shutdown,
  setSessionId,
  isPlaying,
  getSpotifyOriginalVolumeFile,
} from "../player.js";
import { setConfig } from "../config.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-daemon-test-" + Date.now());
const TEST_CONFIG_DIR = path.join(TEST_DIR, ".codevator");

function daemonPidFile() { return path.join(TEST_CONFIG_DIR, "daemon.pid"); }
function stateFile() { return path.join(TEST_CONFIG_DIR, "state.json"); }
function commandFile() { return path.join(TEST_CONFIG_DIR, "command.json"); }
function sessionsDir() { return path.join(TEST_CONFIG_DIR, "sessions"); }
function pidFile() { return path.join(TEST_CONFIG_DIR, "player.pid"); }

/** Simulate a running daemon by writing its PID file with our own PID. */
function simulateDaemon(mode: string, playing = true) {
  fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
  // Use current process PID so isDaemonRunning() returns true (process.kill(pid, 0) succeeds)
  fs.writeFileSync(daemonPidFile(), String(process.pid));
  fs.writeFileSync(stateFile(), JSON.stringify({ playing, mode }));
}

/** Simulate a running Linux player by writing PID file with our own PID. */
function simulateLinuxPlayer() {
  fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
  fs.writeFileSync(pidFile(), String(process.pid));
}

/** Register a fake session heartbeat. */
function registerFakeSession(id: string) {
  const dir = sessionsDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, id), String(Date.now()));
}

/** Read the command file if it exists. */
function readCommand(): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(commandFile(), "utf-8"));
  } catch {
    return null;
  }
}

const originalPlatform = process.platform;

beforeEach(() => {
  process.env.CODEVATOR_HOME = TEST_CONFIG_DIR;
  fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
  // Create a sounds dir with a dummy file so play() has something to find
  const soundsDir = path.join(TEST_CONFIG_DIR, "sounds");
  fs.mkdirSync(soundsDir, { recursive: true });
  fs.writeFileSync(path.join(soundsDir, "elevator.mp3"), "fake-audio");
  // Enable audio by default
  setConfig({ enabled: true, mode: "elevator", volume: 50 });
  mockSpawn.mockReturnValue({ pid: 99999, unref: vi.fn() });
});

afterEach(() => {
  delete process.env.CODEVATOR_HOME;
  Object.defineProperty(process, "platform", { value: originalPlatform });
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
  vi.restoreAllMocks();
});

// =============================================================================
// shutdown() — async race condition fix
// =============================================================================

describe("shutdown()", () => {
  it("returns a promise (is async)", () => {
    const result = shutdown();
    expect(result).toBeInstanceOf(Promise);
  });

  it("on darwin with running daemon: writes quit command and awaits before cleanup", async () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    simulateDaemon("elevator");

    // shutdown sends quit, waits 2s, then force-kills if still running
    const start = Date.now();
    await shutdown();
    const elapsed = Date.now() - start;

    // Should have waited ~2000ms
    expect(elapsed).toBeGreaterThanOrEqual(1900);
  });

  it("on darwin without daemon: cleans up stale files synchronously", async () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    // Write stale files but no live daemon
    fs.writeFileSync(daemonPidFile(), "999999999");
    fs.writeFileSync(stateFile(), '{"playing":false}');
    const volFile = getSpotifyOriginalVolumeFile();
    fs.writeFileSync(volFile, "75");

    const start = Date.now();
    await shutdown();
    const elapsed = Date.now() - start;

    // Should be fast (no 2s wait)
    expect(elapsed).toBeLessThan(500);
    // Spotify volume file should be cleaned up
    expect(fs.existsSync(volFile)).toBe(false);
  });

  it("on linux: kills linux player", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    // Write a stale PID (won't actually kill anything)
    fs.writeFileSync(pidFile(), "999999999");

    await shutdown();

    // PID file should be cleaned up
    expect(fs.existsSync(pidFile())).toBe(false);
  });
});

// =============================================================================
// sessionEnd() — handles both spotify and regular modes
// =============================================================================

describe("sessionEnd()", () => {
  it("sends restoreQuit for spotify mode when last session ends", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    simulateDaemon("spotify");
    setSessionId("session-spotify-1");
    registerFakeSession("session-spotify-1");

    // sessionEnd unregisters this session, sees no active sessions, checks mode
    sessionEnd();

    const cmd = readCommand();
    expect(cmd).not.toBeNull();
    expect(cmd!.action).toBe("restoreQuit");
  });

  it("sends quit for regular mode when last session ends", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    simulateDaemon("elevator");
    setSessionId("session-regular-1");
    registerFakeSession("session-regular-1");

    sessionEnd();

    const cmd = readCommand();
    expect(cmd).not.toBeNull();
    expect(cmd!.action).toBe("quit");
  });

  it("does NOT send quit when other sessions still active", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    simulateDaemon("elevator");
    setSessionId("session-A");
    registerFakeSession("session-A");
    registerFakeSession("session-B"); // another session still alive

    sessionEnd();

    // Session A removed, but B still active — no command should be sent
    const cmd = readCommand();
    expect(cmd).toBeNull();
  });

  it("on linux: kills player when last session ends", () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    simulateLinuxPlayer();
    setSessionId("session-linux-1");
    registerFakeSession("session-linux-1");

    sessionEnd();

    // PID file should be cleaned up (player killed)
    expect(fs.existsSync(pidFile())).toBe(false);
  });

  it("on linux: does NOT kill player when other sessions active", () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    simulateLinuxPlayer();
    setSessionId("session-linux-A");
    registerFakeSession("session-linux-A");
    registerFakeSession("session-linux-B");

    sessionEnd();

    // PID file should still exist (another session is active)
    expect(fs.existsSync(pidFile())).toBe(true);
  });
});

// =============================================================================
// play() — Linux dedup (doesn't restart when already running)
// =============================================================================

describe("play() — Linux dedup", () => {
  it("on linux: does NOT spawn new player if one is already running", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    simulateLinuxPlayer();
    setSessionId("session-linux-dedup");
    setConfig({ enabled: true, mode: "elevator", volume: 50 });

    mockSpawn.mockClear();
    await play();

    // spawn should NOT have been called — player already running
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it("on linux: spawns player if none running", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    setSessionId("session-linux-new");
    setConfig({ enabled: true, mode: "elevator", volume: 50 });

    mockSpawn.mockClear();
    await play();

    // spawn should have been called to start the player
    expect(mockSpawn).toHaveBeenCalled();
  });
});

// =============================================================================
// play() — killMismatchedDaemon consolidation
// =============================================================================

describe("play() — daemon mode switching", () => {
  it("on darwin: kills daemon in wrong mode before starting new one", async () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    // Daemon running in spotify mode
    simulateDaemon("spotify");
    setSessionId("session-switch-1");
    // User switches to elevator mode
    setConfig({ enabled: true, mode: "elevator", volume: 50 });

    const start = Date.now();
    await play();
    const elapsed = Date.now() - start;

    // Should have waited ~1500ms for daemon to process quit command
    expect(elapsed).toBeGreaterThanOrEqual(1400);
  });

  it("on darwin: does NOT kill daemon if mode matches", async () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    simulateDaemon("elevator");
    setSessionId("session-same-mode");
    setConfig({ enabled: true, mode: "elevator", volume: 50 });

    mockSpawn.mockClear();
    const start = Date.now();
    await play();
    const elapsed = Date.now() - start;

    // Should be fast (no 1500ms wait for mode kill)
    expect(elapsed).toBeLessThan(500);
    // Should have sent a fadeIn command, not spawned a new daemon
    const cmd = readCommand();
    expect(cmd).not.toBeNull();
    expect(cmd!.action).toBe("fadeIn");
    expect(mockSpawn).not.toHaveBeenCalled();
  });
});

// =============================================================================
// stop() — session-based (unchanged, but verify it still works)
// =============================================================================

describe("stop()", () => {
  it("removes session file", () => {
    setSessionId("session-stop-test");
    registerFakeSession("session-stop-test");

    expect(fs.existsSync(path.join(sessionsDir(), "session-stop-test"))).toBe(true);
    stop();
    expect(fs.existsSync(path.join(sessionsDir(), "session-stop-test"))).toBe(false);
  });
});
