import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getStats, updateStats, recordPlay, getStatsPath } from "../stats.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-stats-test-" + Date.now());
const TEST_CONFIG_DIR = path.join(TEST_DIR, ".codevator");

beforeEach(() => {
  process.env.CODEVATOR_HOME = TEST_CONFIG_DIR;
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  delete process.env.CODEVATOR_HOME;
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("getStatsPath", () => {
  it("returns path inside CODEVATOR_HOME", () => {
    expect(getStatsPath()).toBe(path.join(TEST_CONFIG_DIR, "stats.json"));
  });
});

describe("getStats", () => {
  it("returns default stats when no file exists", () => {
    expect(getStats()).toEqual({
      totalSessions: 0,
      totalPlays: 0,
      lastPlayed: null,
      modeUsage: {},
    });
  });

  it("reads existing stats file", () => {
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "stats.json"),
      JSON.stringify({ totalSessions: 5, totalPlays: 42, lastPlayed: "2026-01-01T00:00:00.000Z", modeUsage: { elevator: 30 } })
    );
    expect(getStats()).toEqual({
      totalSessions: 5,
      totalPlays: 42,
      lastPlayed: "2026-01-01T00:00:00.000Z",
      modeUsage: { elevator: 30 },
    });
  });
});

describe("updateStats", () => {
  it("writes stats and creates directory", () => {
    updateStats({ totalSessions: 1, totalPlays: 10, lastPlayed: null, modeUsage: {} });
    const raw = fs.readFileSync(path.join(TEST_CONFIG_DIR, "stats.json"), "utf-8");
    expect(JSON.parse(raw).totalPlays).toBe(10);
  });

  it("merges partial updates", () => {
    updateStats({ totalSessions: 1, totalPlays: 5, lastPlayed: null, modeUsage: {} });
    updateStats({ totalPlays: 10 });
    expect(getStats().totalPlays).toBe(10);
    expect(getStats().totalSessions).toBe(1);
  });
});

describe("recordPlay", () => {
  it("increments totalPlays and modeUsage", () => {
    recordPlay("elevator");
    recordPlay("elevator");
    recordPlay("ambient");
    const stats = getStats();
    expect(stats.totalPlays).toBe(3);
    expect(stats.modeUsage.elevator).toBe(2);
    expect(stats.modeUsage.ambient).toBe(1);
    expect(stats.lastPlayed).toBeTruthy();
  });

  it("sets lastPlayed to a valid ISO string", () => {
    recordPlay("elevator");
    const stats = getStats();
    expect(stats.lastPlayed).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("works correctly with a single play", () => {
    recordPlay("retro");
    const stats = getStats();
    expect(stats.totalPlays).toBe(1);
    expect(stats.modeUsage.retro).toBe(1);
  });
});
