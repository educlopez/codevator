import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  getStats,
  updateStats,
  recordPlay,
  getStatsPath,
  recordSessionEnd,
  formatDuration,
  computeStreaks,
  checkMilestone,
  MAX_SESSION_DURATION_MS,
  MAX_ACTIVE_DAYS,
} from "../stats.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-stats-test-" + Date.now());
const TEST_CONFIG_DIR = path.join(TEST_DIR, ".codevator");

beforeEach(() => {
  process.env.CODEVATOR_HOME = TEST_CONFIG_DIR;
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  vi.useRealTimers();
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
      totalPlayTimeMs: 0,
      activeDays: [],
      lastSessionStartMs: null,
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
      totalPlayTimeMs: 0,
      activeDays: [],
      lastSessionStartMs: null,
    });
  });

  it("populates new fields with defaults for pre-existing stats.json without them", () => {
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "stats.json"),
      JSON.stringify({ totalSessions: 3, totalPlays: 10, lastPlayed: "2026-01-15T08:00:00.000Z", modeUsage: { ambient: 10 } })
    );
    const stats = getStats();
    expect(stats.totalPlayTimeMs).toBe(0);
    expect(stats.activeDays).toEqual([]);
    expect(stats.lastSessionStartMs).toBeNull();
  });

  it("preserves all persisted values when stats.json has all fields", () => {
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "stats.json"),
      JSON.stringify({
        totalSessions: 5,
        totalPlays: 42,
        lastPlayed: "2026-03-10T12:00:00.000Z",
        modeUsage: { elevator: 30 },
        totalPlayTimeMs: 3600000,
        activeDays: ["2026-03-10"],
        lastSessionStartMs: 1710000000000,
      })
    );
    const stats = getStats();
    expect(stats.totalPlayTimeMs).toBe(3600000);
    expect(stats.activeDays).toEqual(["2026-03-10"]);
    expect(stats.lastSessionStartMs).toBe(1710000000000);
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

  it("sets lastSessionStartMs within 1000ms of Date.now()", () => {
    const before = Date.now();
    recordPlay("elevator");
    const after = Date.now();
    const stats = getStats();
    expect(stats.lastSessionStartMs).toBeGreaterThanOrEqual(before);
    expect(stats.lastSessionStartMs).toBeLessThanOrEqual(after);
  });

  it("adds today's date to activeDays", () => {
    recordPlay("elevator");
    const stats = getStats();
    const today = new Date().toISOString().slice(0, 10);
    expect(stats.activeDays).toContain(today);
  });

  it("does not duplicate today's date on second call", () => {
    recordPlay("elevator");
    recordPlay("ambient");
    const stats = getStats();
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = stats.activeDays.filter((d) => d === today).length;
    expect(todayCount).toBe(1);
  });

  it("overwrites lastSessionStartMs on subsequent calls", () => {
    recordPlay("elevator");
    const first = getStats().lastSessionStartMs;
    // Small delay to ensure different timestamp is possible
    recordPlay("ambient");
    const second = getStats().lastSessionStartMs;
    expect(second).toBeGreaterThanOrEqual(first!);
  });

  it("prunes activeDays to MAX_ACTIVE_DAYS entries", () => {
    // Seed 365 days
    const days: string[] = [];
    for (let i = 0; i < 365; i++) {
      const d = new Date(2025, 0, 1 + i);
      days.push(d.toISOString().slice(0, 10));
    }
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "stats.json"),
      JSON.stringify({
        totalSessions: 0,
        totalPlays: 0,
        lastPlayed: null,
        modeUsage: {},
        totalPlayTimeMs: 0,
        activeDays: days,
        lastSessionStartMs: null,
      })
    );

    // recordPlay adds today which is not in the 2025 range
    recordPlay("elevator");
    const stats = getStats();
    expect(stats.activeDays.length).toBe(MAX_ACTIVE_DAYS);
    const today = new Date().toISOString().slice(0, 10);
    expect(stats.activeDays).toContain(today);
    // Oldest entry should have been removed
    expect(stats.activeDays).not.toContain(days[0]);
  });
});

// ============================================================
// formatDuration
// ============================================================

describe("formatDuration", () => {
  it("returns '0m' for 0ms", () => {
    expect(formatDuration(0)).toBe("0m");
  });

  it("returns '45m' for 2700000ms (45 minutes)", () => {
    expect(formatDuration(2700000)).toBe("45m");
  });

  it("returns '12h 34m' for 45240000ms", () => {
    expect(formatDuration(45240000)).toBe("12h 34m");
  });

  it("returns '1h 0m' for exactly 3600000ms (1 hour)", () => {
    expect(formatDuration(3600000)).toBe("1h 0m");
  });

  it("floors minutes correctly for sub-minute remainders", () => {
    // 1 minute + 30 seconds = 90000ms → should be 1m
    expect(formatDuration(90000)).toBe("1m");
  });
});

// ============================================================
// computeStreaks
// ============================================================

describe("computeStreaks", () => {
  it("returns { current: 0, longest: 0 } for empty array", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00"));
    expect(computeStreaks([])).toEqual({ current: 0, longest: 0 });
  });

  it("returns { current: 1, longest: 1 } for single day (today)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00"));
    expect(computeStreaks(["2026-03-14"])).toEqual({ current: 1, longest: 1 });
  });

  it("returns 3-day current and longest for 3 consecutive days ending today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00"));
    expect(computeStreaks(["2026-03-12", "2026-03-13", "2026-03-14"])).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("breaks current streak on gap", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00"));
    // Gap on 2026-03-12
    expect(computeStreaks(["2026-03-10", "2026-03-11", "2026-03-13", "2026-03-14"])).toEqual({
      current: 2,
      longest: 2,
    });
  });

  it("continues current streak when last activity was yesterday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00"));
    // Last day is yesterday — implementation treats this as continuing the streak
    expect(computeStreaks(["2026-03-12", "2026-03-13"])).toEqual({
      current: 2,
      longest: 2,
    });
  });

  it("returns current=0 when last activity is older than yesterday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00"));
    expect(computeStreaks(["2026-03-10", "2026-03-11"])).toEqual({
      current: 0,
      longest: 2,
    });
  });

  it("handles unsorted input", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00"));
    expect(computeStreaks(["2026-03-14", "2026-03-12", "2026-03-13"])).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("handles duplicate entries", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00"));
    expect(computeStreaks(["2026-03-14", "2026-03-14", "2026-03-13"])).toEqual({
      current: 2,
      longest: 2,
    });
  });

  it("returns longest streak across non-contiguous groups", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00"));
    // Two groups: 3-day and 2-day, with 2-day being most recent
    expect(computeStreaks(["2026-03-05", "2026-03-06", "2026-03-07", "2026-03-13", "2026-03-14"])).toEqual({
      current: 2,
      longest: 3,
    });
  });
});

// ============================================================
// checkMilestone
// ============================================================

describe("checkMilestone", () => {
  it("returns null for totalPlays below 10", () => {
    expect(checkMilestone(0)).toBeNull();
    expect(checkMilestone(5)).toBeNull();
    expect(checkMilestone(9)).toBeNull();
  });

  it("returns 10 for exactly 10 plays", () => {
    expect(checkMilestone(10)).toBe(10);
  });

  it("returns 50 for 75 plays (highest milestone <= 75)", () => {
    expect(checkMilestone(75)).toBe(50);
  });

  it("returns 100 for 120 plays", () => {
    expect(checkMilestone(120)).toBe(100);
  });

  it("returns 1000 for 1500 plays", () => {
    expect(checkMilestone(1500)).toBe(1000);
  });

  it("returns 500 for exactly 500 plays", () => {
    expect(checkMilestone(500)).toBe(500);
  });
});

// ============================================================
// recordSessionEnd
// ============================================================

describe("recordSessionEnd", () => {
  it("adds elapsed duration to totalPlayTimeMs for a normal session", () => {
    vi.useFakeTimers();
    const start = new Date("2026-03-14T10:00:00").getTime();
    vi.setSystemTime(start);

    // Simulate recordPlay setting lastSessionStartMs
    updateStats({ lastSessionStartMs: start, totalPlayTimeMs: 0 });

    // Advance 30 minutes
    vi.advanceTimersByTime(30 * 60 * 1000);
    recordSessionEnd();

    const stats = getStats();
    expect(stats.totalPlayTimeMs).toBe(30 * 60 * 1000);
    expect(stats.lastSessionStartMs).toBeNull();
  });

  it("is a no-op when lastSessionStartMs is null", () => {
    updateStats({ lastSessionStartMs: null, totalPlayTimeMs: 5000 });
    recordSessionEnd();
    const stats = getStats();
    expect(stats.totalPlayTimeMs).toBe(5000);
    expect(stats.lastSessionStartMs).toBeNull();
  });

  it("caps duration at MAX_SESSION_DURATION_MS for sessions over 8 hours", () => {
    vi.useFakeTimers();
    const start = new Date("2026-03-14T00:00:00").getTime();
    vi.setSystemTime(start);

    updateStats({ lastSessionStartMs: start, totalPlayTimeMs: 0 });

    // Advance 10 hours
    vi.advanceTimersByTime(10 * 60 * 60 * 1000);
    recordSessionEnd();

    const stats = getStats();
    expect(stats.totalPlayTimeMs).toBe(MAX_SESSION_DURATION_MS);
    expect(stats.lastSessionStartMs).toBeNull();
  });

  it("clamps negative elapsed (clock skew) to 0", () => {
    vi.useFakeTimers();
    // Set lastSessionStartMs in the future
    const futureTime = Date.now() + 60_000;
    updateStats({ lastSessionStartMs: futureTime, totalPlayTimeMs: 1000 });

    recordSessionEnd();

    const stats = getStats();
    // totalPlayTimeMs should remain unchanged (added 0)
    expect(stats.totalPlayTimeMs).toBe(1000);
    expect(stats.lastSessionStartMs).toBeNull();
  });

  it("accumulates totalPlayTimeMs across multiple sessions", () => {
    vi.useFakeTimers();
    const start1 = new Date("2026-03-14T10:00:00").getTime();
    vi.setSystemTime(start1);
    updateStats({ lastSessionStartMs: start1, totalPlayTimeMs: 0 });

    vi.advanceTimersByTime(15 * 60 * 1000); // 15 min
    recordSessionEnd();

    const start2 = Date.now();
    updateStats({ lastSessionStartMs: start2 });

    vi.advanceTimersByTime(20 * 60 * 1000); // 20 min
    recordSessionEnd();

    const stats = getStats();
    expect(stats.totalPlayTimeMs).toBe(35 * 60 * 1000);
  });
});
