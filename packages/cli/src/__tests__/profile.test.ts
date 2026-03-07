import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getConfig, setConfig } from "../config.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-profile-test-" + Date.now());
const TEST_CONFIG_DIR = path.join(TEST_DIR, ".codevator");

beforeEach(() => {
  process.env.CODEVATOR_HOME = TEST_CONFIG_DIR;
  fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
});

afterEach(() => {
  delete process.env.CODEVATOR_HOME;
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("profiles in config", () => {
  it("config has no profiles by default", () => {
    const config = getConfig();
    expect(config.profiles).toBeUndefined();
    expect(config.activeProfile).toBeUndefined();
  });

  it("stores profiles in config", () => {
    setConfig({
      profiles: {
        work: { mode: "ambient", volume: 50 },
        chill: { mode: "elevator", volume: 80 },
      },
    });

    const config = getConfig();
    expect(config.profiles).toEqual({
      work: { mode: "ambient", volume: 50 },
      chill: { mode: "elevator", volume: 80 },
    });
  });

  it("stores activeProfile in config", () => {
    setConfig({
      profiles: { work: { mode: "ambient", volume: 50 } },
      activeProfile: "work",
    });

    const config = getConfig();
    expect(config.activeProfile).toBe("work");
  });

  it("preserves existing config fields when adding profiles", () => {
    setConfig({ mode: "retro", volume: 60, enabled: true });
    setConfig({
      profiles: { focus: { mode: "minimal", volume: 40 } },
    });

    const config = getConfig();
    expect(config.mode).toBe("retro");
    expect(config.volume).toBe(60);
    expect(config.enabled).toBe(true);
    expect(config.profiles).toEqual({ focus: { mode: "minimal", volume: 40 } });
  });

  it("is backward compatible — missing profiles field works fine", () => {
    // Write config without profiles (simulates old config format)
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "config.json"),
      JSON.stringify({ mode: "elevator", volume: 70, enabled: true })
    );

    const config = getConfig();
    expect(config.mode).toBe("elevator");
    expect(config.profiles).toBeUndefined();
  });

  it("can delete a profile", () => {
    setConfig({
      profiles: {
        work: { mode: "ambient", volume: 50 },
        chill: { mode: "elevator", volume: 80 },
      },
    });

    const config = getConfig();
    const profiles = { ...config.profiles };
    delete profiles["chill"];
    setConfig({ profiles });

    const updated = getConfig();
    expect(updated.profiles).toEqual({ work: { mode: "ambient", volume: 50 } });
    expect(updated.profiles!["chill"]).toBeUndefined();
  });

  it("clears activeProfile when deleting the active profile", () => {
    setConfig({
      profiles: { work: { mode: "ambient", volume: 50 } },
      activeProfile: "work",
    });

    const config = getConfig();
    delete config.profiles!["work"];
    setConfig({ profiles: config.profiles, activeProfile: undefined });

    const updated = getConfig();
    expect(updated.activeProfile).toBeUndefined();
  });

  it("applying a profile updates mode and volume", () => {
    setConfig({
      profiles: { deep: { mode: "minimal", volume: 30 } },
    });

    // Simulate "profile use deep"
    const config = getConfig();
    const profile = config.profiles!["deep"];
    setConfig({ mode: profile.mode, volume: profile.volume, activeProfile: "deep" });

    const updated = getConfig();
    expect(updated.mode).toBe("minimal");
    expect(updated.volume).toBe(30);
    expect(updated.activeProfile).toBe("deep");
  });

  it("handles empty profiles object gracefully", () => {
    setConfig({ profiles: {} });
    const config = getConfig();
    expect(config.profiles).toEqual({});
  });

  it("is backward compatible — missing agent field works fine", () => {
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "config.json"),
      JSON.stringify({ mode: "elevator", volume: 70, enabled: true })
    );

    const config = getConfig();
    expect(config.agent).toBeUndefined();
    expect(config.mode).toBe("elevator");
  });

  it("stores agent field in config", () => {
    setConfig({ agent: "codex" });
    const config = getConfig();
    expect(config.agent).toBe("codex");
  });

  it("preserves profiles when updating agent", () => {
    setConfig({
      profiles: { work: { mode: "ambient", volume: 50 } },
      agent: "claude",
    });
    setConfig({ agent: "codex" });

    const config = getConfig();
    expect(config.agent).toBe("codex");
    expect(config.profiles).toEqual({ work: { mode: "ambient", volume: 50 } });
  });

  it("using a non-existent profile name does not crash — just returns undefined", () => {
    setConfig({
      profiles: { work: { mode: "ambient", volume: 50 } },
    });

    const config = getConfig();
    expect(config.profiles!["nonexistent"]).toBeUndefined();
  });
});
