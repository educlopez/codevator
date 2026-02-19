import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  getConfig,
  setConfig,
  getConfigDir,
  DEFAULT_CONFIG,
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
