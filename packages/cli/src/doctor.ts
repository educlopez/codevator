import fs from "node:fs";
import path from "node:path";
import { getConfig, getConfigDir } from "./config.js";
import { detectPlayer, getSoundFiles, isDaemonRunning, isLinuxPlayerRunning } from "./player.js";
import { isHooksInstalled } from "./setup.js";
import { getAdapter } from "./agents/index.js";

export interface DoctorResult {
  pass: boolean;
  message: string;
  hint?: string;
}

export interface DoctorCheck {
  name: string;
  check: () => Promise<DoctorResult> | DoctorResult;
}

export const checks: DoctorCheck[] = [
  {
    name: "Hooks",
    check: (): DoctorResult => {
      const config = getConfig();
      if (config.agent) {
        const adapter = getAdapter(config.agent);
        if (adapter) {
          const installed = adapter.isInstalled();
          return installed
            ? { pass: true, message: `${config.agent} hooks are installed` }
            : { pass: false, message: `${config.agent} hooks are not installed`, hint: `Run \`npx codevator setup --agent ${config.agent}\` to install hooks` };
        }
      }
      const installed = isHooksInstalled();
      return installed
        ? { pass: true, message: "Claude Code hooks are installed" }
        : { pass: false, message: "Claude Code hooks are not installed", hint: "Run `npx codevator` to install hooks" };
    },
  },
  {
    name: "Audio player",
    check: (): DoctorResult => {
      try {
        const player = detectPlayer();
        return { pass: true, message: `Found audio player: ${player}` };
      } catch {
        return { pass: false, message: "No supported audio player found", hint: "Install afplay (macOS) or paplay/aplay (Linux)" };
      }
    },
  },
  {
    name: "Sound files",
    check: (): DoctorResult => {
      const config = getConfig();
      const files = getSoundFiles(config.mode);
      return files.length > 0
        ? { pass: true, message: `Found ${files.length} sound file(s) for mode "${config.mode}"` }
        : { pass: false, message: `No sound files found for mode "${config.mode}"`, hint: `Run \`npx codevator add ${config.mode}\` to download sounds` };
    },
  },
  {
    name: "Config file",
    check: (): DoctorResult => {
      const configPath = path.join(getConfigDir(), "config.json");
      try {
        const raw = fs.readFileSync(configPath, "utf-8");
        const parsed = JSON.parse(raw);
        const hasMode = typeof parsed.mode === "string" && parsed.mode.length > 0;
        const hasVolume = typeof parsed.volume === "number" && parsed.volume >= 0 && parsed.volume <= 100;
        const hasEnabled = typeof parsed.enabled === "boolean";
        if (hasMode && hasVolume && hasEnabled) {
          return { pass: true, message: "Config file is valid" };
        }
        return { pass: false, message: "Config file is missing required fields", hint: "Run `npx codevator` to regenerate config" };
      } catch {
        return { pass: false, message: "Config file not found or invalid JSON", hint: "Run `npx codevator` to create config" };
      }
    },
  },
  {
    name: "Daemon status",
    check: (): DoctorResult => {
      if (process.platform === "darwin") {
        const running = isDaemonRunning();
        return running
          ? { pass: true, message: "Audio daemon is running" }
          : { pass: true, message: "Audio daemon is not running (starts on first play)" };
      }
      const running = isLinuxPlayerRunning();
      return running
        ? { pass: true, message: "Linux player process is running" }
        : { pass: true, message: "Linux player is not running (starts on first play)" };
    },
  },
];

export async function runDoctor(): Promise<DoctorResult[]> {
  const results: DoctorResult[] = [];
  for (const check of checks) {
    results.push(await check.check());
  }
  return results;
}
