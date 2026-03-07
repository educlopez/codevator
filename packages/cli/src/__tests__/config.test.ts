import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  getConfig,
  setConfig,
  getConfigDir,
  DEFAULT_CONFIG,
  isValidMode,
} from "../config.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-test-" + Date.now());
const TEST_CONFIG_DIR = path.join(TEST_DIR, ".codevator");

beforeEach(() => {
  process.env.CODEVATOR_HOME = TEST_CONFIG_DIR;
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  delete process.env.CODEVATOR_HOME;
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("getConfigDir", () => {
  it("returns CODEVATOR_HOME when set", () => {
    expect(getConfigDir()).toBe(TEST_CONFIG_DIR);
  });
});

describe("getConfig", () => {
  it("returns default config when no file exists", () => {
    expect(getConfig()).toEqual(DEFAULT_CONFIG);
  });

  it("reads existing config", () => {
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "config.json"),
      JSON.stringify({ mode: "retro", volume: 50, enabled: false })
    );
    expect(getConfig()).toEqual({ mode: "retro", volume: 50, enabled: false });
  });
});

describe("setConfig", () => {
  it("writes config and creates directory", () => {
    setConfig({ mode: "ambient", volume: 80, enabled: true });
    const raw = fs.readFileSync(
      path.join(TEST_CONFIG_DIR, "config.json"),
      "utf-8"
    );
    expect(JSON.parse(raw)).toEqual({
      mode: "ambient",
      volume: 80,
      enabled: true,
    });
  });

  it("merges partial updates with existing config", () => {
    setConfig({ mode: "elevator", volume: 70, enabled: true });
    setConfig({ mode: "retro" });
    expect(getConfig()).toEqual({ mode: "retro", volume: 70, enabled: true });
  });
});

describe("backward compatibility", () => {
  it("handles config without profiles field", () => {
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "config.json"),
      JSON.stringify({ mode: "elevator", volume: 70, enabled: true })
    );
    const config = getConfig();
    expect(config.mode).toBe("elevator");
    expect(config.profiles).toBeUndefined();
    expect(config.activeProfile).toBeUndefined();
  });

  it("handles config without agent field", () => {
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "config.json"),
      JSON.stringify({ mode: "retro", volume: 50, enabled: false })
    );
    const config = getConfig();
    expect(config.agent).toBeUndefined();
  });

  it("adding profiles to old config preserves all fields", () => {
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "config.json"),
      JSON.stringify({ mode: "ambient", volume: 80, enabled: true })
    );
    setConfig({ profiles: { work: { mode: "minimal", volume: 40 } } });
    const config = getConfig();
    expect(config.mode).toBe("ambient");
    expect(config.volume).toBe(80);
    expect(config.enabled).toBe(true);
    expect(config.profiles).toEqual({ work: { mode: "minimal", volume: 40 } });
  });
});

describe("isValidMode", () => {
  it("returns true for built-in modes", () => {
    expect(isValidMode("elevator")).toBe(true);
    expect(isValidMode("typewriter")).toBe(true);
    expect(isValidMode("ambient")).toBe(true);
    expect(isValidMode("retro")).toBe(true);
    expect(isValidMode("minimal")).toBe(true);
    expect(isValidMode("spotify")).toBe(true);
  });

  it("returns false for nonexistent mode", () => {
    expect(isValidMode("nonexistent-mode-xyz")).toBe(false);
  });

  it("returns true for custom imported sounds", () => {
    const soundsDir = path.join(TEST_CONFIG_DIR, "sounds");
    fs.mkdirSync(soundsDir, { recursive: true });
    fs.writeFileSync(path.join(soundsDir, "ocean-waves.mp3"), "fake-audio");

    expect(isValidMode("ocean-waves")).toBe(true);
  });

  it("returns true for custom .wav imports", () => {
    const soundsDir = path.join(TEST_CONFIG_DIR, "sounds");
    fs.mkdirSync(soundsDir, { recursive: true });
    fs.writeFileSync(path.join(soundsDir, "rain.wav"), "fake-audio");

    expect(isValidMode("rain")).toBe(true);
  });

  it("returns true for custom .ogg imports", () => {
    const soundsDir = path.join(TEST_CONFIG_DIR, "sounds");
    fs.mkdirSync(soundsDir, { recursive: true });
    fs.writeFileSync(path.join(soundsDir, "birds.ogg"), "fake-audio");

    expect(isValidMode("birds")).toBe(true);
  });

  it("returns true for custom .m4a imports", () => {
    const soundsDir = path.join(TEST_CONFIG_DIR, "sounds");
    fs.mkdirSync(soundsDir, { recursive: true });
    fs.writeFileSync(path.join(soundsDir, "forest.m4a"), "fake-audio");

    expect(isValidMode("forest")).toBe(true);
  });
});
