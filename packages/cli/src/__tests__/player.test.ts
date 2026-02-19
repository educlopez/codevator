import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { detectPlayer, getPidFile, isPlaying } from "../player.js";

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

describe("isPlaying", () => {
  it("returns false when no PID file exists", () => {
    expect(isPlaying()).toBe(false);
  });

  it("returns false when PID file has stale PID", () => {
    fs.writeFileSync(getPidFile(), "999999999");
    expect(isPlaying()).toBe(false);
  });
});
