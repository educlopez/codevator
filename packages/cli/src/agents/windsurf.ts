import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { AgentAdapter } from "./types.js";

function getWindsurfDir(): string {
  if (process.env.CODEVATOR_WINDSURF_HOME) return process.env.CODEVATOR_WINDSURF_HOME;
  return path.join(os.homedir(), ".codeium", "windsurf");
}

function getHooksPath(): string {
  return path.join(getWindsurfDir(), "hooks.json");
}

function readHooks(): Record<string, any> {
  try {
    return JSON.parse(fs.readFileSync(getHooksPath(), "utf-8"));
  } catch {
    return {};
  }
}

function writeHooks(config: Record<string, any>): void {
  const dir = path.dirname(getHooksPath());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getHooksPath(), JSON.stringify(config, null, 2));
}

function isCodevatorEntry(entry: any): boolean {
  return typeof entry?.command === "string" && entry.command.includes("codevator");
}

function stripCodevatorEntries(arr: any[]): any[] {
  return arr.filter((e) => !isCodevatorEntry(e));
}

export const windsurfAdapter: AgentAdapter = {
  name: "windsurf",

  detect(): boolean {
    return fs.existsSync(getWindsurfDir());
  },

  isInstalled(): boolean {
    const config = readHooks();
    if (!config.hooks) return false;

    return (
      Array.isArray(config.hooks.pre_user_prompt) &&
      config.hooks.pre_user_prompt.some((e: any) => isCodevatorEntry(e))
    );
  },

  setupHooks(): void {
    const config = readHooks();
    if (!config.hooks) config.hooks = {};

    // pre_user_prompt — heartbeat play (only hook, no stop event)
    if (!Array.isArray(config.hooks.pre_user_prompt)) config.hooks.pre_user_prompt = [];
    config.hooks.pre_user_prompt = stripCodevatorEntries(config.hooks.pre_user_prompt);
    config.hooks.pre_user_prompt.push({
      command: "npx -y codevator play",
      show_output: false,
    });

    writeHooks(config);
  },

  removeHooks(): void {
    const config = readHooks();
    if (!config.hooks) return;

    if (Array.isArray(config.hooks.pre_user_prompt)) {
      config.hooks.pre_user_prompt = stripCodevatorEntries(config.hooks.pre_user_prompt);
      if (config.hooks.pre_user_prompt.length === 0) {
        delete config.hooks.pre_user_prompt;
      }
    }

    if (Object.keys(config.hooks).length === 0) {
      // No hooks left — remove the file
      try {
        fs.unlinkSync(getHooksPath());
      } catch {}
      return;
    }

    writeHooks(config);
  },
};
