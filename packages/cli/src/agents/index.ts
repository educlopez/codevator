import type { AgentAdapter } from "./types.js";
import { claudeAdapter } from "./claude.js";
import { codexAdapter } from "./codex.js";
import { opencodeAdapter } from "./opencode.js";

const adapters: AgentAdapter[] = [
  claudeAdapter,
  codexAdapter,
  opencodeAdapter,
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
