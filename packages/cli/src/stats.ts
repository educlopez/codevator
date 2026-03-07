import fs from "node:fs";
import path from "node:path";
import { getConfigDir } from "./config.js";

export interface CodevatorStats {
  totalSessions: number;
  totalPlays: number;
  lastPlayed: string | null;
  modeUsage: Record<string, number>;
}

const DEFAULT_STATS: CodevatorStats = {
  totalSessions: 0,
  totalPlays: 0,
  lastPlayed: null,
  modeUsage: {},
};

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
  updateStats(current);
}
