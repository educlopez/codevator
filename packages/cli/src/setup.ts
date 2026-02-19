import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getClaudeDir(): string {
  if (process.env.CODEVATOR_CLAUDE_HOME) return process.env.CODEVATOR_CLAUDE_HOME;
  return path.join(os.homedir(), ".claude");
}

function getSettingsPath(): string {
  return path.join(getClaudeDir(), "settings.json");
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

const CODEVATOR_HOOKS = {
  PreToolUse: {
    matcher: "",
    hooks: [{ type: "command", command: "codevator play", async: true }],
  },
  Stop: {
    matcher: "",
    hooks: [{ type: "command", command: "codevator stop" }],
  },
  Notification: {
    matcher: "permission_prompt|idle_prompt",
    hooks: [{ type: "command", command: "codevator stop" }],
  },
};

function isCodevatorHook(entry: any): boolean {
  return entry?.hooks?.some(
    (h: any) =>
      typeof h.command === "string" && h.command.startsWith("codevator")
  );
}

export function setupHooks(): void {
  const settings = readSettings();
  if (!settings.hooks) settings.hooks = {};

  for (const [event, hookEntry] of Object.entries(CODEVATOR_HOOKS)) {
    if (!settings.hooks[event]) settings.hooks[event] = [];

    // Remove existing codevator hooks first (idempotent)
    settings.hooks[event] = settings.hooks[event].filter(
      (e: any) => !isCodevatorHook(e)
    );

    // Add fresh codevator hook
    settings.hooks[event].push(hookEntry);
  }

  writeSettings(settings);
  installSkill();
}

function installSkill(): void {
  const skillDir = path.join(getClaudeDir(), "skills");
  fs.mkdirSync(skillDir, { recursive: true });
  const skillSrc = path.join(__dirname, "..", "skill", "codevator.md");
  const skillDest = path.join(skillDir, "codevator.md");
  try {
    fs.copyFileSync(skillSrc, skillDest);
  } catch {
    // Skill file not found in package — skip (dev environment)
  }
}

function removeSkill(): void {
  const skillPath = path.join(getClaudeDir(), "skills", "codevator.md");
  try { fs.unlinkSync(skillPath); } catch {}
}

export function removeHooks(): void {
  const settings = readSettings();
  if (!settings.hooks) return;

  for (const event of Object.keys(CODEVATOR_HOOKS)) {
    if (!settings.hooks[event]) continue;
    settings.hooks[event] = settings.hooks[event].filter(
      (e: any) => !isCodevatorHook(e)
    );
    if (settings.hooks[event].length === 0) {
      delete settings.hooks[event];
    }
  }

  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  writeSettings(settings);
  removeSkill();
}
