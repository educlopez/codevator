import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import * as childProcess from "node:child_process";

vi.mock("node:child_process", async () => {
  const actual = await vi.importActual<typeof import("node:child_process")>("node:child_process");
  return { ...actual, execSync: vi.fn(actual.execSync) };
});

import { detectPlayer, getPidFile, isPlaying, isSpotifyRunning, getSpotifyOriginalVolumeFile } from "../player.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-player-test-" + Date.now());
const TEST_CONFIG_DIR = path.join(TEST_DIR, ".codevator");

beforeEach(() => {
  process.env.CODEVATOR_HOME = TEST_CONFIG_DIR;
  fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
});

afterEach(() => {
  delete process.env.CODEVATOR_HOME;
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("detectPlayer", () => {
  it("returns a player command string", () => {
    const player = detectPlayer();
    // On macOS should return afplay, on Linux paplay or aplay
    expect(typeof player).toBe("string");
    expect(player.length).toBeGreaterThan(0);
  });
});

describe("getPidFile", () => {
  it("returns path inside config dir", () => {
    expect(getPidFile()).toBe(path.join(TEST_CONFIG_DIR, "player.pid"));
  });
});

describe("isSpotifyRunning", () => {
  const originalPlatform = process.platform;

  afterEach(() => {
    Object.defineProperty(process, "platform", { value: originalPlatform });
    vi.restoreAllMocks();
  });

  it("returns false on non-darwin platforms", () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    expect(isSpotifyRunning()).toBe(false);
  });

  it("returns true when osascript reports Spotify is running", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    vi.mocked(childProcess.execSync).mockReturnValue("true\n");
    expect(isSpotifyRunning()).toBe(true);
  });

  it("returns false when osascript reports Spotify is not running", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    vi.mocked(childProcess.execSync).mockReturnValue("false\n");
    expect(isSpotifyRunning()).toBe(false);
  });

  it("returns false when execSync throws", () => {
    Object.defineProperty(process, "platform", { value: "darwin" });
    vi.mocked(childProcess.execSync).mockImplementation(() => {
      throw new Error("Command failed");
    });
    expect(isSpotifyRunning()).toBe(false);
  });
});

describe("getSpotifyOriginalVolumeFile", () => {
  it("returns path inside config dir", () => {
    expect(getSpotifyOriginalVolumeFile()).toBe(
      path.join(TEST_CONFIG_DIR, "spotify-original-volume")
    );
  });
});

describe("isPlaying", () => {
  it("returns false when no PID file exists", () => {
    expect(isPlaying()).toBe(false);
  });

  it("returns false when PID file has stale PID", () => {
    fs.writeFileSync(getPidFile(), "999999999");
    expect(isPlaying()).toBe(false);
  });
});
