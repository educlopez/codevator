import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface SoundProfile {
  mode: string;
  volume: number;
}

export interface CodevatorConfig {
  mode: string;
  volume: number;
  enabled: boolean;
  profiles?: Record<string, SoundProfile>;
  activeProfile?: string;
  agent?: string;
  lastRandom?: string;
}

export const MODES = [
  "elevator",
  "typewriter",
  "ambient",
  "retro",
  "minimal",
  "spotify",
] as const;

export const DEFAULT_CONFIG: CodevatorConfig = {
  mode: "elevator",
  volume: 70,
  enabled: true,
};

export function getConfigDir(): string {
  if (process.env.CODEVATOR_HOME) return process.env.CODEVATOR_HOME;
  return path.join(os.homedir(), ".codevator");
}

function getConfigPath(): string {
  return path.join(getConfigDir(), "config.json");
}

export function getConfig(): CodevatorConfig {
  try {
    const raw = fs.readFileSync(getConfigPath(), "utf-8");
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function setConfig(partial: Partial<CodevatorConfig>): void {
  const current = getConfig();
  const merged = { ...current, ...partial };
  const dir = getConfigDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getConfigPath(), JSON.stringify(merged, null, 2));
}

const SOUND_EXTENSIONS = [".mp3", ".wav", ".ogg", ".m4a"] as const;

export function isValidMode(mode: string): boolean {
  if ((MODES as readonly string[]).includes(mode)) return true;
  const soundsDir = path.join(getConfigDir(), "sounds");
  return SOUND_EXTENSIONS.some((ext) => fs.existsSync(path.join(soundsDir, `${mode}${ext}`)));
}
