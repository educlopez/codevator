import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { runDoctor, checks } from "../doctor.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-doctor-test-" + Date.now());
const TEST_CONFIG_DIR = path.join(TEST_DIR, ".codevator");
const TEST_CLAUDE_DIR = path.join(TEST_DIR, ".claude");

beforeEach(() => {
  process.env.CODEVATOR_HOME = TEST_CONFIG_DIR;
  process.env.CODEVATOR_CLAUDE_HOME = TEST_CLAUDE_DIR;
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  delete process.env.CODEVATOR_HOME;
  delete process.env.CODEVATOR_CLAUDE_HOME;
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("checks", () => {
  it("has 5 checks defined", () => {
    expect(checks).toHaveLength(5);
  });

  it("hooks check fails when no settings exist", () => {
    const hooksCheck = checks.find((c) => c.name === "Hooks")!;
    const result = hooksCheck.check();
    expect(result).toMatchObject({ pass: false });
  });

  it("config check fails when no config exists", () => {
    const configCheck = checks.find((c) => c.name === "Config file")!;
    const result = configCheck.check();
    expect(result).toMatchObject({ pass: false });
  });

  it("config check passes with valid config", () => {
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "config.json"),
      JSON.stringify({ mode: "elevator", volume: 70, enabled: true })
    );
    const configCheck = checks.find((c) => c.name === "Config file")!;
    const result = configCheck.check();
    expect(result).toMatchObject({ pass: true });
  });

  it("config check fails when config has missing fields", () => {
    fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, "config.json"),
      JSON.stringify({ mode: "elevator" })
    );
    const configCheck = checks.find((c) => c.name === "Config file")!;
    const result = configCheck.check();
    expect(result).toMatchObject({ pass: false });
    expect(result.hint).toBeDefined();
  });

  it("hooks check provides hint when failing", () => {
    const hooksCheck = checks.find((c) => c.name === "Hooks")!;
    const result = hooksCheck.check();
    expect(result).toMatchObject({ pass: false });
    expect(result.hint).toBeDefined();
  });

  it("audio player check returns a result", () => {
    const audioCheck = checks.find((c) => c.name === "Audio player")!;
    const result = audioCheck.check();
    expect(result).toHaveProperty("pass");
    expect(result).toHaveProperty("message");
  });

  it("daemon status check always passes (informational)", () => {
    const daemonCheck = checks.find((c) => c.name === "Daemon status")!;
    const result = daemonCheck.check();
    expect(result).toMatchObject({ pass: true });
  });

  it("sound files check returns a result with pass property", () => {
    const soundCheck = checks.find((c) => c.name === "Sound files")!;
    const result = soundCheck.check();
    // Bundled sounds may or may not exist depending on build state
    expect(result).toHaveProperty("pass");
    expect(result).toHaveProperty("message");
  });
});

describe("runDoctor", () => {
  it("returns results for all checks", async () => {
    const results = await runDoctor();
    expect(results).toHaveLength(5);
    for (const result of results) {
      expect(result).toHaveProperty("pass");
      expect(result).toHaveProperty("message");
    }
  });
});
