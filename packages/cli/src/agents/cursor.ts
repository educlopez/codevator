import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { AgentAdapter } from "./types.js";

function getCursorDir(): string {
  if (process.env.CODEVATOR_CURSOR_HOME) return process.env.CODEVATOR_CURSOR_HOME;
  return path.join(os.homedir(), ".cursor");
}

function getHooksPath(): string {
  return path.join(getCursorDir(), "hooks.json");
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

export const cursorAdapter: AgentAdapter = {
  name: "cursor",

  detect(): boolean {
    return fs.existsSync(getCursorDir());
  },

  isInstalled(): boolean {
    const config = readHooks();
    if (!config.hooks) return false;

    const hasPlay =
      Array.isArray(config.hooks.beforeSubmitPrompt) &&
      config.hooks.beforeSubmitPrompt.some((e: any) => isCodevatorEntry(e));
    const hasStop =
      Array.isArray(config.hooks.stop) &&
      config.hooks.stop.some((e: any) => isCodevatorEntry(e));

    return hasPlay && hasStop;
  },

  setupHooks(): void {
    const config = readHooks();
    if (!config.version) config.version = 1;
    if (!config.hooks) config.hooks = {};

    // beforeSubmitPrompt — heartbeat play
    if (!Array.isArray(config.hooks.beforeSubmitPrompt)) config.hooks.beforeSubmitPrompt = [];
    config.hooks.beforeSubmitPrompt = stripCodevatorEntries(config.hooks.beforeSubmitPrompt);
    config.hooks.beforeSubmitPrompt.push({ command: "npx -y codevator play" });

    // stop — explicit stop
    if (!Array.isArray(config.hooks.stop)) config.hooks.stop = [];
    config.hooks.stop = stripCodevatorEntries(config.hooks.stop);
    config.hooks.stop.push({ command: "npx -y codevator stop" });

    writeHooks(config);
  },

  removeHooks(): void {
    const config = readHooks();
    if (!config.hooks) return;

    for (const event of ["beforeSubmitPrompt", "stop"]) {
      if (!Array.isArray(config.hooks[event])) continue;
      config.hooks[event] = stripCodevatorEntries(config.hooks[event]);
      if (config.hooks[event].length === 0) {
        delete config.hooks[event];
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
