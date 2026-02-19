import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { setupHooks, removeHooks } from "../setup.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-setup-test-" + Date.now());
const TEST_CLAUDE_DIR = path.join(TEST_DIR, ".claude");

beforeEach(() => {
  process.env.CODEVATOR_CLAUDE_HOME = TEST_CLAUDE_DIR;
  fs.mkdirSync(TEST_CLAUDE_DIR, { recursive: true });
});

afterEach(() => {
  delete process.env.CODEVATOR_CLAUDE_HOME;
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("setupHooks", () => {
  it("creates settings.json with hooks when no file exists", () => {
    setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(TEST_CLAUDE_DIR, "settings.json"), "utf-8")
    );
    expect(settings.hooks).toBeDefined();
    expect(settings.hooks.PreToolUse).toBeDefined();
    expect(settings.hooks.Stop).toBeDefined();
    expect(settings.hooks.Notification).toBeDefined();
  });

  it("preserves existing settings when adding hooks", () => {
    fs.writeFileSync(
      path.join(TEST_CLAUDE_DIR, "settings.json"),
      JSON.stringify({ model: "opus", permissions: {} })
    );
    setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(TEST_CLAUDE_DIR, "settings.json"), "utf-8")
    );
    expect(settings.model).toBe("opus");
    expect(settings.hooks.PreToolUse).toBeDefined();
  });

  it("preserves existing hooks from other tools", () => {
    const existing = {
      hooks: {
        PreToolUse: [
          { matcher: "Bash", hooks: [{ type: "command", command: "other-tool" }] },
        ],
      },
    };
    fs.writeFileSync(
      path.join(TEST_CLAUDE_DIR, "settings.json"),
      JSON.stringify(existing)
    );
    setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(TEST_CLAUDE_DIR, "settings.json"), "utf-8")
    );
    // Should have both the existing hook and codevator hooks
    expect(settings.hooks.PreToolUse.length).toBeGreaterThanOrEqual(2);
  });
});

describe("removeHooks", () => {
  it("removes codevator hooks but keeps others", () => {
    const existing = {
      hooks: {
        PreToolUse: [
          { matcher: "Bash", hooks: [{ type: "command", command: "other-tool" }] },
          { matcher: "", hooks: [{ type: "command", command: "codevator play", async: true }] },
        ],
      },
    };
    fs.writeFileSync(
      path.join(TEST_CLAUDE_DIR, "settings.json"),
      JSON.stringify(existing)
    );
    removeHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(TEST_CLAUDE_DIR, "settings.json"), "utf-8")
    );
    expect(settings.hooks.PreToolUse).toHaveLength(1);
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toBe("other-tool");
  });
});
