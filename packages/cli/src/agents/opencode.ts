import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { AgentAdapter } from "./types.js";

function getOpenCodeDir(): string {
  if (process.env.CODEVATOR_OPENCODE_HOME) return process.env.CODEVATOR_OPENCODE_HOME;
  // XDG_CONFIG_HOME or default
  const configHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
  return path.join(configHome, "opencode");
}

function getPluginDir(): string {
  return path.join(getOpenCodeDir(), "plugins");
}

function getPluginPath(): string {
  return path.join(getPluginDir(), "codevator.ts");
}

const PLUGIN_CONTENT = `// Codevator plugin for OpenCode
// Auto-generated — do not edit manually
import { execSync } from "node:child_process";

export default {
  name: "codevator",

  onAgentStart() {
    try { execSync("npx -y codevator play", { stdio: "ignore" }); } catch {}
  },

  onAgentStop() {
    try { execSync("npx -y codevator stop", { stdio: "ignore" }); } catch {}
  },

  onSessionEnd() {
    try { execSync("npx -y codevator session-end", { stdio: "ignore" }); } catch {}
  },
};
`;

export const opencodeAdapter: AgentAdapter = {
  name: "opencode",

  detect(): boolean {
    return fs.existsSync(getOpenCodeDir());
  },

  isInstalled(): boolean {
    return fs.existsSync(getPluginPath());
  },

  setupHooks(): void {
    const pluginDir = getPluginDir();
    fs.mkdirSync(pluginDir, { recursive: true });
    fs.writeFileSync(getPluginPath(), PLUGIN_CONTENT);
  },

  removeHooks(): void {
    try {
      fs.unlinkSync(getPluginPath());
    } catch {
      // Plugin file doesn't exist — nothing to remove
    }
  },
};
