import type { AgentAdapter } from "./types.js";
import { claudeAdapter } from "./claude.js";
import { codexAdapter } from "./codex.js";
import { opencodeAdapter } from "./opencode.js";
import { geminiAdapter } from "./gemini.js";
import { copilotAdapter } from "./copilot.js";
import { cursorAdapter } from "./cursor.js";
import { windsurfAdapter } from "./windsurf.js";

const adapters: AgentAdapter[] = [
  claudeAdapter,
  codexAdapter,
  opencodeAdapter,
  geminiAdapter,
  copilotAdapter,
  cursorAdapter,
  windsurfAdapter,
];

export function getAdapter(name: string): AgentAdapter | undefined {
  return adapters.find((a) => a.name === name);
}

export function detectAgent(): AgentAdapter | null {
  return adapters.find((a) => a.detect()) ?? null;
}

export function listAdapters(): string[] {
  return adapters.map((a) => a.name);
}

export type { AgentAdapter } from "./types.js";
