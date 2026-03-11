import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import type { AgentAdapter } from "./types.js";
import { getConfigDir } from "../config.js";

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

function codevatorCommand(sub: string, extra?: Record<string, boolean>): Record<string, any> {
  return { type: "command", command: `npx -y codevator ${sub}`, ...extra };
}

function getPlayHookPath(): string {
  return path.join(getConfigDir(), "play-hook.sh");
}

/**
 * Generate a lightweight shell script that acts as the PreToolUse hook.
 * When the daemon is already running (99% of invocations), this writes the
 * session heartbeat and exits immediately — no Node.js process needed.
 * Only falls through to `npx -y codevator play` for cold starts.
 */
function generatePlayHookScript(): string {
  const configDir = getConfigDir();
  return `#!/bin/bash
# Codevator fast-path play hook
# Avoids spawning node when daemon is already running
DIR="${configDir}"
DAEMON_PID="\${DIR}/daemon.pid"
CONFIG="\${DIR}/config.json"
SESSIONS="\${DIR}/sessions"
LOCK="\${DIR}/player.lock"

# Read stdin (Claude passes hook context as JSON)
INPUT=""
if [ ! -t 0 ]; then
  INPUT=$(cat)
fi

# Check if enabled (quick grep of config.json)
if [ -f "$CONFIG" ]; then
  if grep -q '"enabled":false' "$CONFIG" 2>/dev/null || grep -q '"enabled": false' "$CONFIG" 2>/dev/null; then
    exit 0
  fi
fi

# Extract session_id from JSON stdin
SID=$(echo "$INPUT" | grep -o '"session_id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$SID" ] && SID="$$"

# Always write session heartbeat
mkdir -p "$SESSIONS"
echo "$(date +%s)000" > "\${SESSIONS}/\${SID}"

# Fast path: if daemon is alive, heartbeat is enough — exit now
if [ -f "$DAEMON_PID" ]; then
  PID=$(cat "$DAEMON_PID" 2>/dev/null)
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    exit 0
  fi
fi

# Slow path: daemon not running, need full codevator to start it
echo "$INPUT" | npx -y codevator play
`;
}

function installPlayHook(): void {
  const hookPath = getPlayHookPath();
  const dir = path.dirname(hookPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(hookPath, generatePlayHookScript());
  fs.chmodSync(hookPath, 0o755);
}

function removePlayHook(): void {
  try { fs.unlinkSync(getPlayHookPath()); } catch {}
}

function buildHooks() {
  const hookPath = getPlayHookPath();
  return {
    PreToolUse: {
      matcher: "",
      hooks: [{ type: "command", command: `bash ${hookPath}`, async: true }],
    },
    Stop: {
      matcher: "",
      hooks: [codevatorCommand("stop")],
    },
    Notification: {
      matcher: "permission_prompt|idle_prompt",
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
       h.command.includes("npx -y codevator") ||
       h.command.includes("play-hook.sh"))
  );
}

function installSkill(): void {
  const skillDir = path.join(getClaudeDir(), "skills");
  fs.mkdirSync(skillDir, { recursive: true });
  const skillSrc = path.join(__dirname, "..", "..", "skill", "codevator.md");
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

export const claudeAdapter: AgentAdapter = {
  name: "claude",

  detect(): boolean {
    return fs.existsSync(getClaudeDir());
  },

  isInstalled(): boolean {
    const settings = readSettings();
    if (!settings.hooks) return false;

    const requiredEvents = ["PreToolUse", "Stop", "Notification", "SessionEnd"];
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
        (e: any) => !isCodevatorHook(e)
      );

      // Add fresh codevator hook
      settings.hooks[event].push(hookEntry);
    }

    writeSettings(settings);
    installSkill();
    installPlayHook();
  },

  removeHooks(): void {
    const settings = readSettings();
    if (!settings.hooks) return;

    for (const event of ["PreToolUse", "Stop", "Notification", "SessionEnd"]) {
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
    removePlayHook();
  },
};
