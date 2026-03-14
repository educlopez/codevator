import fs from "node:fs";
import path from "node:path";
import { getConfigDir } from "./config.js";

export interface CodevatorStats {
  totalSessions: number;
  totalPlays: number;
  lastPlayed: string | null;
  modeUsage: Record<string, number>;
  totalPlayTimeMs: number;
  activeDays: string[];
  lastSessionStartMs: number | null;
}

const DEFAULT_STATS: CodevatorStats = {
  totalSessions: 0,
  totalPlays: 0,
  lastPlayed: null,
  modeUsage: {},
  totalPlayTimeMs: 0,
  activeDays: [],
  lastSessionStartMs: null,
};

/** Cap single session to 8 hours */
export const MAX_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

/** Max days to retain in activeDays */
export const MAX_ACTIVE_DAYS = 365;

/** Milestones that trigger celebration */
export const MILESTONES = [10, 50, 100, 500, 1000] as const;

export function getStatsPath(): string {
  return path.join(getConfigDir(), "stats.json");
}

export function getStats(): CodevatorStats {
  try {
    const raw = fs.readFileSync(getStatsPath(), "utf-8");
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function updateStats(partial: Partial<CodevatorStats>): void {
  const current = getStats();
  const merged = { ...current, ...partial };
  const dir = getConfigDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getStatsPath(), JSON.stringify(merged, null, 2));
}

export function recordPlay(mode: string): void {
  const current = getStats();
  current.totalPlays += 1;
  current.modeUsage[mode] = (current.modeUsage[mode] ?? 0) + 1;
  current.lastPlayed = new Date().toISOString();
  current.lastSessionStartMs = Date.now();

  // Add today to activeDays (deduplicated, pruned)
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const days = new Set(current.activeDays);
  days.add(today);
  current.activeDays = [...days].sort().slice(-MAX_ACTIVE_DAYS);

  updateStats(current);
}

/**
 * Called from sessionEnd() in player.ts.
 * Calculates duration since lastSessionStartMs, clamps to MAX_SESSION_DURATION_MS,
 * adds to totalPlayTimeMs, and nulls lastSessionStartMs.
 */
export function recordSessionEnd(): void {
  const current = getStats();
  if (current.lastSessionStartMs == null) return;

  const elapsed = Date.now() - current.lastSessionStartMs;
  const clamped = Math.min(Math.max(elapsed, 0), MAX_SESSION_DURATION_MS);

  current.totalPlayTimeMs += clamped;
  current.lastSessionStartMs = null;
  updateStats(current);
}

/**
 * Formats milliseconds as human-readable duration.
 * Examples: "0m" | "45m" | "2h 15m" | "128h 3m"
 */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

/**
 * Computes current and longest streaks from activeDays array.
 * Days must be YYYY-MM-DD strings. Returns { current, longest } in days.
 */
export function computeStreaks(activeDays: string[]): {
  current: number;
  longest: number;
} {
  if (activeDays.length === 0) return { current: 0, longest: 0 };

  // Deduplicate and sort
  const sorted = [...new Set(activeDays)].sort();

  let longest = 1;
  let streak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);

    if (Math.round(diffDays) === 1) {
      streak++;
    } else {
      streak = 1;
    }
    longest = Math.max(longest, streak);
  }

  // Current streak: check if last day is today or yesterday
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const lastDay = sorted[sorted.length - 1];

  if (lastDay !== today && lastDay !== yesterday) {
    return { current: 0, longest };
  }

  // Walk backwards from end to find current streak length
  let current = 1;
  for (let i = sorted.length - 2; i >= 0; i--) {
    const prev = new Date(sorted[i]);
    const curr = new Date(sorted[i + 1]);
    const diffDays = (curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
    if (Math.round(diffDays) === 1) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

/**
 * Returns the highest milestone reached by totalPlays, or null.
 */
export function checkMilestone(totalPlays: number): number | null {
  let highest: number | null = null;
  for (const threshold of MILESTONES) {
    if (totalPlays >= threshold) {
      highest = threshold;
    }
  }
  return highest;
}
