import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { AgentAdapter } from "../agents/types.js";
import { claudeAdapter } from "../agents/claude.js";
import { codexAdapter } from "../agents/codex.js";
import { opencodeAdapter } from "../agents/opencode.js";
import { geminiAdapter } from "../agents/gemini.js";
import { copilotAdapter } from "../agents/copilot.js";
import { cursorAdapter } from "../agents/cursor.js";
import { windsurfAdapter } from "../agents/windsurf.js";
import { getAdapter, detectAgent, listAdapters } from "../agents/index.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-agents-test-" + Date.now());

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  delete process.env.CODEVATOR_CLAUDE_HOME;
  delete process.env.CODEVATOR_CODEX_HOME;
  delete process.env.CODEVATOR_OPENCODE_HOME;
  delete process.env.CODEVATOR_GEMINI_HOME;
  delete process.env.CODEVATOR_COPILOT_HOME;
  delete process.env.CODEVATOR_CURSOR_HOME;
  delete process.env.CODEVATOR_WINDSURF_HOME;
  delete process.env.XDG_CONFIG_HOME;
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

// ============================================================
// AgentAdapter interface compliance
// ============================================================

describe("AgentAdapter interface compliance", () => {
  const adapters: AgentAdapter[] = [claudeAdapter, codexAdapter, opencodeAdapter, geminiAdapter, copilotAdapter, cursorAdapter, windsurfAdapter];

  it.each(adapters.map((a) => [a.name, a] as const))(
    "%s adapter has all required interface methods",
    (_name, adapter) => {
      expect(typeof adapter.name).toBe("string");
      expect(adapter.name.length).toBeGreaterThan(0);
      expect(typeof adapter.detect).toBe("function");
      expect(typeof adapter.setupHooks).toBe("function");
      expect(typeof adapter.removeHooks).toBe("function");
      expect(typeof adapter.isInstalled).toBe("function");
    }
  );
});

// ============================================================
// agents/index.ts — getAdapter, detectAgent, listAdapters
// ============================================================

describe("agents/index", () => {
  it("listAdapters returns all seven adapter names", () => {
    const names = listAdapters();
    expect(names).toContain("claude");
    expect(names).toContain("codex");
    expect(names).toContain("opencode");
    expect(names).toContain("gemini");
    expect(names).toContain("copilot");
    expect(names).toContain("cursor");
    expect(names).toContain("windsurf");
    expect(names).toHaveLength(7);
  });

  it("getAdapter returns correct adapter by name", () => {
    expect(getAdapter("claude")).toBe(claudeAdapter);
    expect(getAdapter("codex")).toBe(codexAdapter);
    expect(getAdapter("opencode")).toBe(opencodeAdapter);
    expect(getAdapter("gemini")).toBe(geminiAdapter);
    expect(getAdapter("copilot")).toBe(copilotAdapter);
    expect(getAdapter("cursor")).toBe(cursorAdapter);
    expect(getAdapter("windsurf")).toBe(windsurfAdapter);
  });

  it("getAdapter returns undefined for unknown name", () => {
    expect(getAdapter("aider")).toBeUndefined();
  });

  it("detectAgent returns null when no agent dirs exist", () => {
    // Point all env vars to nonexistent dirs
    process.env.CODEVATOR_CLAUDE_HOME = path.join(TEST_DIR, "no-claude");
    process.env.CODEVATOR_CODEX_HOME = path.join(TEST_DIR, "no-codex");
    process.env.CODEVATOR_OPENCODE_HOME = path.join(TEST_DIR, "no-opencode");
    process.env.CODEVATOR_GEMINI_HOME = path.join(TEST_DIR, "no-gemini");
    process.env.CODEVATOR_COPILOT_HOME = path.join(TEST_DIR, "no-copilot");
    process.env.CODEVATOR_CURSOR_HOME = path.join(TEST_DIR, "no-cursor");
    process.env.CODEVATOR_WINDSURF_HOME = path.join(TEST_DIR, "no-windsurf");
    process.env.XDG_CONFIG_HOME = path.join(TEST_DIR, "no-xdg");
    expect(detectAgent()).toBeNull();
  });
});

// ============================================================
// Claude adapter
// ============================================================

describe("claudeAdapter", () => {
  const claudeDir = path.join(TEST_DIR, ".claude");

  beforeEach(() => {
    process.env.CODEVATOR_CLAUDE_HOME = claudeDir;
    fs.mkdirSync(claudeDir, { recursive: true });
  });

  it("detect returns true when .claude dir exists", () => {
    expect(claudeAdapter.detect()).toBe(true);
  });

  it("detect returns false when .claude dir missing", () => {
    process.env.CODEVATOR_CLAUDE_HOME = path.join(TEST_DIR, "nope");
    expect(claudeAdapter.detect()).toBe(false);
  });

  it("isInstalled returns false before setup", () => {
    expect(claudeAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks creates settings.json with hooks", () => {
    claudeAdapter.setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(claudeDir, "settings.json"), "utf-8")
    );
    expect(settings.hooks).toBeDefined();
    expect(settings.hooks.PreToolUse).toBeDefined();
    expect(settings.hooks.Stop).toBeDefined();
    expect(settings.hooks.Notification).toBeDefined();
    expect(settings.hooks.SessionEnd).toBeDefined();
  });

  it("isInstalled returns true after setup", () => {
    claudeAdapter.setupHooks();
    expect(claudeAdapter.isInstalled()).toBe(true);
  });

  it("removeHooks cleans up hooks", () => {
    claudeAdapter.setupHooks();
    claudeAdapter.removeHooks();
    expect(claudeAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks is idempotent — no duplicate entries", () => {
    claudeAdapter.setupHooks();
    claudeAdapter.setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(claudeDir, "settings.json"), "utf-8")
    );
    // Each event should have exactly 1 codevator hook
    expect(settings.hooks.PreToolUse).toHaveLength(1);
    expect(settings.hooks.Stop).toHaveLength(1);
  });

  it("setupHooks preserves existing non-codevator hooks", () => {
    fs.writeFileSync(
      path.join(claudeDir, "settings.json"),
      JSON.stringify({
        hooks: {
          PreToolUse: [
            { matcher: "Bash", hooks: [{ type: "command", command: "other-tool" }] },
          ],
        },
      })
    );
    claudeAdapter.setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(claudeDir, "settings.json"), "utf-8")
    );
    expect(settings.hooks.PreToolUse.length).toBeGreaterThanOrEqual(2);
    expect(settings.hooks.PreToolUse.some((e: any) => e.hooks?.[0]?.command === "other-tool")).toBe(true);
  });
});

// ============================================================
// Codex adapter
// ============================================================

describe("codexAdapter", () => {
  const codexDir = path.join(TEST_DIR, ".codex");

  beforeEach(() => {
    process.env.CODEVATOR_CODEX_HOME = codexDir;
    fs.mkdirSync(codexDir, { recursive: true });
  });

  it("detect returns true when .codex dir exists", () => {
    expect(codexAdapter.detect()).toBe(true);
  });

  it("detect returns false when .codex dir missing", () => {
    process.env.CODEVATOR_CODEX_HOME = path.join(TEST_DIR, "nope");
    expect(codexAdapter.detect()).toBe(false);
  });

  it("isInstalled returns false before setup", () => {
    expect(codexAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks writes marker-delimited block to config.toml", () => {
    codexAdapter.setupHooks();
    const content = fs.readFileSync(path.join(codexDir, "config.toml"), "utf-8");
    expect(content).toContain("# --- codevator hooks start ---");
    expect(content).toContain("# --- codevator hooks end ---");
    expect(content).toContain("npx -y codevator play");
    expect(content).toContain("npx -y codevator stop");
  });

  it("isInstalled returns true after setup", () => {
    codexAdapter.setupHooks();
    expect(codexAdapter.isInstalled()).toBe(true);
  });

  it("removeHooks removes marker block", () => {
    codexAdapter.setupHooks();
    codexAdapter.removeHooks();
    expect(codexAdapter.isInstalled()).toBe(false);
    const content = fs.readFileSync(path.join(codexDir, "config.toml"), "utf-8");
    expect(content).not.toContain("codevator");
  });

  it("setupHooks is idempotent — no duplicate blocks", () => {
    codexAdapter.setupHooks();
    codexAdapter.setupHooks();
    const content = fs.readFileSync(path.join(codexDir, "config.toml"), "utf-8");
    const starts = content.split("# --- codevator hooks start ---").length - 1;
    expect(starts).toBe(1);
  });

  it("setupHooks preserves existing config content", () => {
    fs.writeFileSync(path.join(codexDir, "config.toml"), "[model]\nname = \"gpt-4o\"\n");
    codexAdapter.setupHooks();
    const content = fs.readFileSync(path.join(codexDir, "config.toml"), "utf-8");
    expect(content).toContain("[model]");
    expect(content).toContain("codevator hooks start");
  });
});

// ============================================================
// OpenCode adapter
// ============================================================

describe("opencodeAdapter", () => {
  const openCodeDir = path.join(TEST_DIR, "opencode");

  beforeEach(() => {
    process.env.XDG_CONFIG_HOME = TEST_DIR;
    fs.mkdirSync(openCodeDir, { recursive: true });
  });

  it("detect returns true when opencode dir exists", () => {
    expect(opencodeAdapter.detect()).toBe(true);
  });

  it("detect returns false when opencode dir missing", () => {
    process.env.XDG_CONFIG_HOME = path.join(TEST_DIR, "nope");
    // Also override CODEVATOR_OPENCODE_HOME to nonexistent
    process.env.CODEVATOR_OPENCODE_HOME = path.join(TEST_DIR, "nope", "opencode");
    expect(opencodeAdapter.detect()).toBe(false);
  });

  it("isInstalled returns false before setup", () => {
    expect(opencodeAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks creates plugin file", () => {
    opencodeAdapter.setupHooks();
    const pluginPath = path.join(openCodeDir, "plugins", "codevator.ts");
    expect(fs.existsSync(pluginPath)).toBe(true);
    const content = fs.readFileSync(pluginPath, "utf-8");
    expect(content).toContain("npx -y codevator play");
    expect(content).toContain("onAgentStart");
    expect(content).toContain("onAgentStop");
    expect(content).toContain("onSessionEnd");
  });

  it("isInstalled returns true after setup", () => {
    opencodeAdapter.setupHooks();
    expect(opencodeAdapter.isInstalled()).toBe(true);
  });

  it("removeHooks deletes plugin file", () => {
    opencodeAdapter.setupHooks();
    opencodeAdapter.removeHooks();
    expect(opencodeAdapter.isInstalled()).toBe(false);
  });

  it("removeHooks is safe when no plugin exists", () => {
    expect(() => opencodeAdapter.removeHooks()).not.toThrow();
  });
});

// ============================================================
// Gemini adapter
// ============================================================

describe("geminiAdapter", () => {
  const geminiDir = path.join(TEST_DIR, ".gemini");

  beforeEach(() => {
    process.env.CODEVATOR_GEMINI_HOME = geminiDir;
    fs.mkdirSync(geminiDir, { recursive: true });
  });

  it("detect returns true when .gemini dir exists", () => {
    expect(geminiAdapter.detect()).toBe(true);
  });

  it("detect returns false when .gemini dir missing", () => {
    process.env.CODEVATOR_GEMINI_HOME = path.join(TEST_DIR, "nope");
    expect(geminiAdapter.detect()).toBe(false);
  });

  it("isInstalled returns false before setup", () => {
    expect(geminiAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks creates settings.json with hooks", () => {
    geminiAdapter.setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(geminiDir, "settings.json"), "utf-8")
    );
    expect(settings.hooks).toBeDefined();
    expect(settings.hooks.SessionStart).toBeDefined();
    expect(settings.hooks.BeforeTool).toBeDefined();
    expect(settings.hooks.Stop).toBeDefined();
    expect(settings.hooks.SessionEnd).toBeDefined();

    expect(settings.hooks.SessionStart[0].hooks[0].command).toContain("npx -y codevator play");
    expect(settings.hooks.Stop[0].hooks[0].command).toContain("npx -y codevator stop");
    expect(settings.hooks.SessionEnd[0].hooks[0].command).toContain("npx -y codevator session-end");
    expect(settings.hooks.BeforeTool[0].hooks[0].command).toContain("npx -y codevator play");
  });

  it("isInstalled returns true after setup", () => {
    geminiAdapter.setupHooks();
    expect(geminiAdapter.isInstalled()).toBe(true);
  });

  it("removeHooks cleans up hooks", () => {
    geminiAdapter.setupHooks();
    geminiAdapter.removeHooks();
    expect(geminiAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks is idempotent — no duplicate entries", () => {
    geminiAdapter.setupHooks();
    geminiAdapter.setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(geminiDir, "settings.json"), "utf-8")
    );
    expect(settings.hooks.SessionStart).toHaveLength(1);
    expect(settings.hooks.Stop).toHaveLength(1);
    expect(settings.hooks.BeforeTool).toHaveLength(1);
    expect(settings.hooks.SessionEnd).toHaveLength(1);
  });

  it("setupHooks preserves existing non-codevator hooks", () => {
    fs.writeFileSync(
      path.join(geminiDir, "settings.json"),
      JSON.stringify({
        hooks: {
          BeforeTool: [
            { matcher: "shell", hooks: [{ type: "command", command: "security-check.sh" }] },
          ],
        },
      })
    );
    geminiAdapter.setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(geminiDir, "settings.json"), "utf-8")
    );
    expect(settings.hooks.BeforeTool.length).toBeGreaterThanOrEqual(2);
    expect(settings.hooks.BeforeTool.some((e: any) => e.hooks?.[0]?.command === "security-check.sh")).toBe(true);
  });

  it("removeHooks preserves non-codevator hooks", () => {
    fs.writeFileSync(
      path.join(geminiDir, "settings.json"),
      JSON.stringify({
        hooks: {
          BeforeTool: [
            { matcher: "shell", hooks: [{ type: "command", command: "security-check.sh" }] },
          ],
        },
      })
    );
    geminiAdapter.setupHooks();
    geminiAdapter.removeHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(geminiDir, "settings.json"), "utf-8")
    );
    expect(settings.hooks.BeforeTool).toHaveLength(1);
    expect(settings.hooks.BeforeTool[0].hooks[0].command).toBe("security-check.sh");
  });

  it("removeHooks is safe when settings.json missing", () => {
    expect(() => geminiAdapter.removeHooks()).not.toThrow();
  });

  it("uses CODEVATOR_GEMINI_HOME env var", () => {
    const customDir = path.join(TEST_DIR, "custom-gemini");
    fs.mkdirSync(customDir, { recursive: true });
    process.env.CODEVATOR_GEMINI_HOME = customDir;
    geminiAdapter.setupHooks();
    expect(fs.existsSync(path.join(customDir, "settings.json"))).toBe(true);
  });

  it("setupHooks creates directory if missing", () => {
    const newDir = path.join(TEST_DIR, "new-gemini");
    process.env.CODEVATOR_GEMINI_HOME = newDir;
    geminiAdapter.setupHooks();
    expect(fs.existsSync(path.join(newDir, "settings.json"))).toBe(true);
  });

  it("isInstalled returns false on partial installation", () => {
    fs.writeFileSync(
      path.join(geminiDir, "settings.json"),
      JSON.stringify({
        hooks: {
          SessionStart: [
            { matcher: "", hooks: [{ type: "command", command: "npx -y codevator play" }] },
          ],
        },
      })
    );
    expect(geminiAdapter.isInstalled()).toBe(false);
  });
});

// ============================================================
// Copilot adapter
// ============================================================

describe("copilotAdapter", () => {
  const copilotDir = path.join(TEST_DIR, ".copilot");

  beforeEach(() => {
    process.env.CODEVATOR_COPILOT_HOME = copilotDir;
    fs.mkdirSync(copilotDir, { recursive: true });
  });

  it("detect returns true when .copilot dir exists", () => {
    expect(copilotAdapter.detect()).toBe(true);
  });

  it("detect returns false when .copilot dir missing", () => {
    process.env.CODEVATOR_COPILOT_HOME = path.join(TEST_DIR, "nope");
    expect(copilotAdapter.detect()).toBe(false);
  });

  it("isInstalled returns false before setup", () => {
    expect(copilotAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks creates hooks/codevator.json", () => {
    copilotAdapter.setupHooks();
    const hooksPath = path.join(copilotDir, "hooks", "codevator.json");
    expect(fs.existsSync(hooksPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(hooksPath, "utf-8"));
    expect(content.version).toBe(1);
    expect(content.hooks.sessionStart).toBeDefined();
    expect(content.hooks.sessionEnd).toBeDefined();
    expect(content.hooks.sessionStart[0].bash).toContain("npx -y codevator play");
    expect(content.hooks.sessionStart[0].type).toBe("command");
    expect(content.hooks.sessionEnd[0].bash).toContain("npx -y codevator session-end");
  });

  it("isInstalled returns true after setup", () => {
    copilotAdapter.setupHooks();
    expect(copilotAdapter.isInstalled()).toBe(true);
  });

  it("removeHooks deletes codevator.json", () => {
    copilotAdapter.setupHooks();
    copilotAdapter.removeHooks();
    expect(copilotAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks is idempotent — file content identical", () => {
    copilotAdapter.setupHooks();
    const first = fs.readFileSync(path.join(copilotDir, "hooks", "codevator.json"), "utf-8");
    copilotAdapter.setupHooks();
    const second = fs.readFileSync(path.join(copilotDir, "hooks", "codevator.json"), "utf-8");
    expect(first).toBe(second);
  });

  it("setupHooks creates directories recursively", () => {
    const freshDir = path.join(TEST_DIR, "fresh-copilot");
    process.env.CODEVATOR_COPILOT_HOME = freshDir;
    copilotAdapter.setupHooks();
    expect(fs.existsSync(path.join(freshDir, "hooks", "codevator.json"))).toBe(true);
  });

  it("removeHooks is safe when file missing", () => {
    expect(() => copilotAdapter.removeHooks()).not.toThrow();
  });

  it("setupHooks does not interfere with other hook files", () => {
    const hooksDir = path.join(copilotDir, "hooks");
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.writeFileSync(path.join(hooksDir, "other-tool.json"), '{"version":1}');
    copilotAdapter.setupHooks();
    const otherContent = fs.readFileSync(path.join(hooksDir, "other-tool.json"), "utf-8");
    expect(otherContent).toBe('{"version":1}');
  });

  it("uses CODEVATOR_COPILOT_HOME env var", () => {
    const customDir = path.join(TEST_DIR, "custom-copilot");
    fs.mkdirSync(customDir, { recursive: true });
    process.env.CODEVATOR_COPILOT_HOME = customDir;
    copilotAdapter.setupHooks();
    expect(fs.existsSync(path.join(customDir, "hooks", "codevator.json"))).toBe(true);
  });
});

// ============================================================
// Cursor adapter
// ============================================================

describe("cursorAdapter", () => {
  const cursorDir = path.join(TEST_DIR, ".cursor");

  beforeEach(() => {
    process.env.CODEVATOR_CURSOR_HOME = cursorDir;
    fs.mkdirSync(cursorDir, { recursive: true });
  });

  it("detect returns true when .cursor dir exists", () => {
    expect(cursorAdapter.detect()).toBe(true);
  });

  it("detect returns false when .cursor dir missing", () => {
    process.env.CODEVATOR_CURSOR_HOME = path.join(TEST_DIR, "nope");
    expect(cursorAdapter.detect()).toBe(false);
  });

  it("isInstalled returns false before setup", () => {
    expect(cursorAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks creates hooks.json with beforeSubmitPrompt and stop", () => {
    cursorAdapter.setupHooks();
    const config = JSON.parse(
      fs.readFileSync(path.join(cursorDir, "hooks.json"), "utf-8")
    );
    expect(config.version).toBe(1);
    expect(config.hooks.beforeSubmitPrompt).toBeDefined();
    expect(config.hooks.stop).toBeDefined();
    expect(config.hooks.beforeSubmitPrompt).toHaveLength(1);
    expect(config.hooks.beforeSubmitPrompt[0].command).toBe("npx -y codevator play");
    expect(config.hooks.stop[0].command).toBe("npx -y codevator stop");
  });

  it("isInstalled returns true after setup", () => {
    cursorAdapter.setupHooks();
    expect(cursorAdapter.isInstalled()).toBe(true);
  });

  it("removeHooks cleans up hooks", () => {
    cursorAdapter.setupHooks();
    cursorAdapter.removeHooks();
    expect(cursorAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks is idempotent — no duplicate entries", () => {
    cursorAdapter.setupHooks();
    cursorAdapter.setupHooks();
    const config = JSON.parse(
      fs.readFileSync(path.join(cursorDir, "hooks.json"), "utf-8")
    );
    expect(config.hooks.beforeSubmitPrompt).toHaveLength(1);
    expect(config.hooks.stop).toHaveLength(1);
  });

  it("setupHooks preserves existing non-codevator hooks", () => {
    fs.writeFileSync(
      path.join(cursorDir, "hooks.json"),
      JSON.stringify({
        version: 1,
        hooks: {
          afterFileEdit: [{ command: "hooks/lint.sh" }],
          beforeSubmitPrompt: [{ command: "hooks/audit.sh" }],
        },
      })
    );
    cursorAdapter.setupHooks();
    const config = JSON.parse(
      fs.readFileSync(path.join(cursorDir, "hooks.json"), "utf-8")
    );
    // afterFileEdit preserved entirely
    expect(config.hooks.afterFileEdit).toHaveLength(1);
    expect(config.hooks.afterFileEdit[0].command).toBe("hooks/lint.sh");
    // beforeSubmitPrompt has both the existing non-codevator and the new codevator
    expect(config.hooks.beforeSubmitPrompt).toHaveLength(2);
    expect(config.hooks.beforeSubmitPrompt.some((e: any) => e.command === "hooks/audit.sh")).toBe(true);
    expect(config.hooks.beforeSubmitPrompt.some((e: any) => e.command.includes("codevator"))).toBe(true);
  });

  it("removeHooks preserves non-codevator hooks", () => {
    fs.writeFileSync(
      path.join(cursorDir, "hooks.json"),
      JSON.stringify({
        version: 1,
        hooks: {
          beforeSubmitPrompt: [
            { command: "hooks/audit.sh" },
            { command: "npx -y codevator play" },
          ],
          stop: [{ command: "npx -y codevator stop" }],
        },
      })
    );
    cursorAdapter.removeHooks();
    const config = JSON.parse(
      fs.readFileSync(path.join(cursorDir, "hooks.json"), "utf-8")
    );
    expect(config.hooks.beforeSubmitPrompt).toHaveLength(1);
    expect(config.hooks.beforeSubmitPrompt[0].command).toBe("hooks/audit.sh");
    expect(config.hooks.stop).toBeUndefined(); // empty array removed
  });

  it("removeHooks deletes file when no hooks remain", () => {
    cursorAdapter.setupHooks();
    cursorAdapter.removeHooks();
    expect(fs.existsSync(path.join(cursorDir, "hooks.json"))).toBe(false);
  });

  it("removeHooks is safe when hooks.json missing", () => {
    expect(() => cursorAdapter.removeHooks()).not.toThrow();
  });

  it("isInstalled returns false on partial installation", () => {
    // Only beforeSubmitPrompt, no stop
    fs.writeFileSync(
      path.join(cursorDir, "hooks.json"),
      JSON.stringify({
        version: 1,
        hooks: {
          beforeSubmitPrompt: [{ command: "npx -y codevator play" }],
        },
      })
    );
    expect(cursorAdapter.isInstalled()).toBe(false);
  });

  it("uses custom path from CODEVATOR_CURSOR_HOME", () => {
    const customDir = path.join(TEST_DIR, "custom-cursor");
    fs.mkdirSync(customDir, { recursive: true });
    process.env.CODEVATOR_CURSOR_HOME = customDir;
    cursorAdapter.setupHooks();
    expect(fs.existsSync(path.join(customDir, "hooks.json"))).toBe(true);
  });
});

// ============================================================
// Windsurf adapter
// ============================================================

describe("windsurfAdapter", () => {
  const windsurfDir = path.join(TEST_DIR, ".codeium", "windsurf");

  beforeEach(() => {
    process.env.CODEVATOR_WINDSURF_HOME = windsurfDir;
    fs.mkdirSync(windsurfDir, { recursive: true });
  });

  it("detect returns true when windsurf dir exists", () => {
    expect(windsurfAdapter.detect()).toBe(true);
  });

  it("detect returns false when windsurf dir missing", () => {
    process.env.CODEVATOR_WINDSURF_HOME = path.join(TEST_DIR, "nope");
    expect(windsurfAdapter.detect()).toBe(false);
  });

  it("isInstalled returns false before setup", () => {
    expect(windsurfAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks creates hooks.json with pre_user_prompt", () => {
    windsurfAdapter.setupHooks();
    const config = JSON.parse(
      fs.readFileSync(path.join(windsurfDir, "hooks.json"), "utf-8")
    );
    expect(config.hooks.pre_user_prompt).toBeDefined();
    expect(config.hooks.pre_user_prompt).toHaveLength(1);
    expect(config.hooks.pre_user_prompt[0].command).toBe("npx -y codevator play");
    expect(config.hooks.pre_user_prompt[0].show_output).toBe(false);
  });

  it("setupHooks does not include stop hook", () => {
    windsurfAdapter.setupHooks();
    const config = JSON.parse(
      fs.readFileSync(path.join(windsurfDir, "hooks.json"), "utf-8")
    );
    expect(config.hooks.stop).toBeUndefined();
  });

  it("isInstalled returns true after setup", () => {
    windsurfAdapter.setupHooks();
    expect(windsurfAdapter.isInstalled()).toBe(true);
  });

  it("removeHooks cleans up hooks", () => {
    windsurfAdapter.setupHooks();
    windsurfAdapter.removeHooks();
    expect(windsurfAdapter.isInstalled()).toBe(false);
  });

  it("setupHooks is idempotent — no duplicate entries", () => {
    windsurfAdapter.setupHooks();
    windsurfAdapter.setupHooks();
    const config = JSON.parse(
      fs.readFileSync(path.join(windsurfDir, "hooks.json"), "utf-8")
    );
    expect(config.hooks.pre_user_prompt).toHaveLength(1);
  });

  it("setupHooks preserves existing non-codevator hooks", () => {
    fs.writeFileSync(
      path.join(windsurfDir, "hooks.json"),
      JSON.stringify({
        hooks: {
          pre_write_code: [{ command: "python3 lint.py", show_output: true }],
          pre_user_prompt: [{ command: "python3 audit.py", show_output: false }],
        },
      })
    );
    windsurfAdapter.setupHooks();
    const config = JSON.parse(
      fs.readFileSync(path.join(windsurfDir, "hooks.json"), "utf-8")
    );
    // pre_write_code preserved entirely
    expect(config.hooks.pre_write_code).toHaveLength(1);
    expect(config.hooks.pre_write_code[0].command).toBe("python3 lint.py");
    // pre_user_prompt has both existing non-codevator and new codevator
    expect(config.hooks.pre_user_prompt).toHaveLength(2);
    expect(config.hooks.pre_user_prompt.some((e: any) => e.command === "python3 audit.py")).toBe(true);
    expect(config.hooks.pre_user_prompt.some((e: any) => e.command.includes("codevator"))).toBe(true);
  });

  it("removeHooks preserves non-codevator hooks", () => {
    fs.writeFileSync(
      path.join(windsurfDir, "hooks.json"),
      JSON.stringify({
        hooks: {
          pre_user_prompt: [
            { command: "python3 audit.py", show_output: false },
            { command: "npx -y codevator play", show_output: false },
          ],
        },
      })
    );
    windsurfAdapter.removeHooks();
    const config = JSON.parse(
      fs.readFileSync(path.join(windsurfDir, "hooks.json"), "utf-8")
    );
    expect(config.hooks.pre_user_prompt).toHaveLength(1);
    expect(config.hooks.pre_user_prompt[0].command).toBe("python3 audit.py");
  });

  it("removeHooks deletes file when no hooks remain", () => {
    windsurfAdapter.setupHooks();
    windsurfAdapter.removeHooks();
    expect(fs.existsSync(path.join(windsurfDir, "hooks.json"))).toBe(false);
  });

  it("removeHooks is safe when hooks.json missing", () => {
    expect(() => windsurfAdapter.removeHooks()).not.toThrow();
  });

  it("show_output is false on all codevator hook entries", () => {
    windsurfAdapter.setupHooks();
    const config = JSON.parse(
      fs.readFileSync(path.join(windsurfDir, "hooks.json"), "utf-8")
    );
    for (const entry of config.hooks.pre_user_prompt) {
      if (entry.command.includes("codevator")) {
        expect(entry.show_output).toBe(false);
      }
    }
  });

  it("uses custom path from CODEVATOR_WINDSURF_HOME", () => {
    const customDir = path.join(TEST_DIR, "custom-windsurf");
    fs.mkdirSync(customDir, { recursive: true });
    process.env.CODEVATOR_WINDSURF_HOME = customDir;
    windsurfAdapter.setupHooks();
    expect(fs.existsSync(path.join(customDir, "hooks.json"))).toBe(true);
  });
});
