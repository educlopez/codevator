import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { AgentAdapter } from "./types.js";

function getCodexDir(): string {
  if (process.env.CODEVATOR_CODEX_HOME) return process.env.CODEVATOR_CODEX_HOME;
  return path.join(os.homedir(), ".codex");
}

function getConfigPath(): string {
  return path.join(getCodexDir(), "config.toml");
}

const MARKER_START = "# --- codevator hooks start ---";
const MARKER_END = "# --- codevator hooks end ---";

function buildHookBlock(): string {
  return [
    MARKER_START,
    '[hooks]',
    'on_agent_start = "npx -y codevator play"',
    'on_agent_stop = "npx -y codevator stop"',
    'on_session_end = "npx -y codevator session-end"',
    MARKER_END,
  ].join("\n");
}

function readConfig(): string {
  try {
    return fs.readFileSync(getConfigPath(), "utf-8");
  } catch {
    return "";
  }
}

function writeConfig(content: string): void {
  const dir = path.dirname(getConfigPath());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getConfigPath(), content);
}

function stripCodevatorBlock(content: string): string {
  const startIdx = content.indexOf(MARKER_START);
  const endIdx = content.indexOf(MARKER_END);
  if (startIdx === -1 || endIdx === -1) return content;
  const before = content.slice(0, startIdx).trimEnd();
  const after = content.slice(endIdx + MARKER_END.length).trimStart();
  return [before, after].filter(Boolean).join("\n\n") || "";
}

export const codexAdapter: AgentAdapter = {
  name: "codex",

  detect(): boolean {
    return fs.existsSync(getCodexDir());
  },

  isInstalled(): boolean {
    const content = readConfig();
    return content.includes(MARKER_START) && content.includes(MARKER_END);
  },

  setupHooks(): void {
    let content = readConfig();
    // Remove existing block first (idempotent)
    content = stripCodevatorBlock(content);
    // Append hook block
    const separator = content.length > 0 ? "\n\n" : "";
    writeConfig(content + separator + buildHookBlock() + "\n");
  },

  removeHooks(): void {
    let content = readConfig();
    content = stripCodevatorBlock(content);
    writeConfig(content);
  },
};
