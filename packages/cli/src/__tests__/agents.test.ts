import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { AgentAdapter } from "../agents/types.js";
import { claudeAdapter } from "../agents/claude.js";
import { codexAdapter } from "../agents/codex.js";
import { opencodeAdapter } from "../agents/opencode.js";
import { getAdapter, detectAgent, listAdapters } from "../agents/index.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-agents-test-" + Date.now());

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  delete process.env.CODEVATOR_CLAUDE_HOME;
  delete process.env.CODEVATOR_CODEX_HOME;
  delete process.env.CODEVATOR_OPENCODE_HOME;
  delete process.env.XDG_CONFIG_HOME;
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

// ============================================================
// AgentAdapter interface compliance
// ============================================================

describe("AgentAdapter interface compliance", () => {
  const adapters: AgentAdapter[] = [claudeAdapter, codexAdapter, opencodeAdapter];

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
  it("listAdapters returns all three adapter names", () => {
    const names = listAdapters();
    expect(names).toContain("claude");
    expect(names).toContain("codex");
    expect(names).toContain("opencode");
    expect(names).toHaveLength(3);
  });

  it("getAdapter returns correct adapter by name", () => {
    expect(getAdapter("claude")).toBe(claudeAdapter);
    expect(getAdapter("codex")).toBe(codexAdapter);
    expect(getAdapter("opencode")).toBe(opencodeAdapter);
  });

  it("getAdapter returns undefined for unknown name", () => {
    expect(getAdapter("aider")).toBeUndefined();
  });

  it("detectAgent returns null when no agent dirs exist", () => {
    // Point all env vars to nonexistent dirs
    process.env.CODEVATOR_CLAUDE_HOME = path.join(TEST_DIR, "no-claude");
    process.env.CODEVATOR_CODEX_HOME = path.join(TEST_DIR, "no-codex");
    process.env.CODEVATOR_OPENCODE_HOME = path.join(TEST_DIR, "no-opencode");
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
