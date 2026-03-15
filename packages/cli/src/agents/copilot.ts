import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { AgentAdapter } from "./types.js";

function getCopilotDir(): string {
  if (process.env.CODEVATOR_COPILOT_HOME) return process.env.CODEVATOR_COPILOT_HOME;
  return path.join(os.homedir(), ".copilot");
}

function getHooksDir(): string {
  return path.join(getCopilotDir(), "hooks");
}

function getHooksPath(): string {
  return path.join(getHooksDir(), "codevator.json");
}

function buildHooksFile(): Record<string, any> {
  return {
    version: 1,
    hooks: {
      sessionStart: [
        {
          type: "command",
          bash: "npx -y codevator play",
          comment: "codevator: start background music",
        },
      ],
      sessionEnd: [
        {
          type: "command",
          bash: "npx -y codevator session-end",
          comment: "codevator: end session",
        },
      ],
    },
  };
}

export const copilotAdapter: AgentAdapter = {
  name: "copilot",

  detect(): boolean {
    return fs.existsSync(getCopilotDir());
  },

  isInstalled(): boolean {
    return fs.existsSync(getHooksPath());
  },

  setupHooks(): void {
    const hooksDir = getHooksDir();
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.writeFileSync(getHooksPath(), JSON.stringify(buildHooksFile(), null, 2));
  },

  removeHooks(): void {
    try {
      fs.unlinkSync(getHooksPath());
    } catch {
      // File doesn't exist — nothing to remove
    }
  },
};
