import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { AgentAdapter } from "./types.js";

function getGeminiDir(): string {
  if (process.env.CODEVATOR_GEMINI_HOME) return process.env.CODEVATOR_GEMINI_HOME;
  return path.join(os.homedir(), ".gemini");
}

function getSettingsPath(): string {
  return path.join(getGeminiDir(), "settings.json");
}

function readSettings(): Record<string, any> {
  try {
    return JSON.parse(fs.readFileSync(getSettingsPath(), "utf-8"));
  } catch {
    return {};
  }
}

function writeSettings(settings: Record<string, any>): void {
  const dir = path.dirname(getSettingsPath());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2));
}

function codevatorCommand(sub: string): Record<string, any> {
  return { type: "command", command: `npx -y codevator ${sub}` };
}

function buildHooks() {
  return {
    SessionStart: {
      matcher: "",
      hooks: [codevatorCommand("play")],
    },
    BeforeTool: {
      matcher: "",
      hooks: [codevatorCommand("play")],
    },
    Stop: {
      matcher: "",
      hooks: [codevatorCommand("stop")],
    },
    SessionEnd: {
      matcher: "",
      hooks: [codevatorCommand("session-end")],
    },
  };
}

function isCodevatorHook(entry: any): boolean {
  return entry?.hooks?.some(
    (h: any) =>
      typeof h.command === "string" &&
      (h.command.startsWith("codevator") ||
        h.command.includes("npx -y codevator")),
  );
}

export const geminiAdapter: AgentAdapter = {
  name: "gemini",

  detect(): boolean {
    return fs.existsSync(getGeminiDir());
  },

  isInstalled(): boolean {
    const settings = readSettings();
    if (!settings.hooks) return false;

    const requiredEvents = ["SessionStart", "BeforeTool", "Stop", "SessionEnd"];
    return requiredEvents.every((event) => {
      const entries = settings.hooks[event];
      return Array.isArray(entries) && entries.some((e: any) => isCodevatorHook(e));
    });
  },

  setupHooks(): void {
    const settings = readSettings();
    if (!settings.hooks) settings.hooks = {};

    const hooks = buildHooks();
    for (const [event, hookEntry] of Object.entries(hooks)) {
      if (!settings.hooks[event]) settings.hooks[event] = [];

      // Remove existing codevator hooks first (idempotent)
      settings.hooks[event] = settings.hooks[event].filter(
        (e: any) => !isCodevatorHook(e),
      );

      // Add fresh codevator hook
      settings.hooks[event].push(hookEntry);
    }

    writeSettings(settings);
  },

  removeHooks(): void {
    const settings = readSettings();
    if (!settings.hooks) return;

    for (const event of ["SessionStart", "BeforeTool", "Stop", "SessionEnd"]) {
      if (!settings.hooks[event]) continue;
      settings.hooks[event] = settings.hooks[event].filter(
        (e: any) => !isCodevatorHook(e),
      );
      if (settings.hooks[event].length === 0) {
        delete settings.hooks[event];
      }
    }

    if (Object.keys(settings.hooks).length === 0) {
      delete settings.hooks;
    }

    writeSettings(settings);
  },
};
