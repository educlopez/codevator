// Thin wrapper that delegates to the Claude Code adapter for backward compatibility.
// All hook logic now lives in agents/claude.ts.
import { claudeAdapter } from "./agents/claude.js";

export function isHooksInstalled(): boolean {
  return claudeAdapter.isInstalled();
}

export function setupHooks(): void {
  claudeAdapter.setupHooks();
}

export function removeHooks(): void {
  claudeAdapter.removeHooks();
}
