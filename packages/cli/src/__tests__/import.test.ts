import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { importSound, removeSound, getSoundsDir, VALID_EXTENSIONS } from "../import.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-import-test-" + Date.now());
const TEST_CONFIG_DIR = path.join(TEST_DIR, ".codevator");
const TEST_SOURCE_DIR = path.join(TEST_DIR, "source");

beforeEach(() => {
  process.env.CODEVATOR_HOME = TEST_CONFIG_DIR;
  fs.mkdirSync(TEST_SOURCE_DIR, { recursive: true });
});

afterEach(() => {
  delete process.env.CODEVATOR_HOME;
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("VALID_EXTENSIONS", () => {
  it("includes mp3, wav, ogg, m4a", () => {
    expect(VALID_EXTENSIONS).toContain(".mp3");
    expect(VALID_EXTENSIONS).toContain(".wav");
    expect(VALID_EXTENSIONS).toContain(".ogg");
    expect(VALID_EXTENSIONS).toContain(".m4a");
  });
});

describe("importSound", () => {
  it("imports an mp3 file using original filename", async () => {
    const src = path.join(TEST_SOURCE_DIR, "ocean.mp3");
    fs.writeFileSync(src, "fake-audio");

    const name = await importSound(src);
    expect(name).toBe("ocean");
    expect(fs.existsSync(path.join(getSoundsDir(), "ocean.mp3"))).toBe(true);
  });

  it("imports with a custom name", async () => {
    const src = path.join(TEST_SOURCE_DIR, "file.wav");
    fs.writeFileSync(src, "fake-audio");

    const name = await importSound(src, { name: "deep-focus" });
    expect(name).toBe("deep-focus");
    expect(fs.existsSync(path.join(getSoundsDir(), "deep-focus.wav"))).toBe(true);
  });

  it("throws on missing file", async () => {
    await expect(importSound("/nonexistent/file.mp3")).rejects.toThrow("File not found");
  });

  it("throws on invalid extension", async () => {
    const src = path.join(TEST_SOURCE_DIR, "sound.flac");
    fs.writeFileSync(src, "fake-audio");

    await expect(importSound(src)).rejects.toThrow("Unsupported file format");
  });

  it("throws on duplicate without force", async () => {
    const src = path.join(TEST_SOURCE_DIR, "dup.mp3");
    fs.writeFileSync(src, "fake-audio");

    await importSound(src);
    await expect(importSound(src)).rejects.toThrow("already exists");
  });

  it("overwrites duplicate with force", async () => {
    const src = path.join(TEST_SOURCE_DIR, "dup.mp3");
    fs.writeFileSync(src, "original");
    await importSound(src);

    fs.writeFileSync(src, "updated");
    const name = await importSound(src, { force: true });
    expect(name).toBe("dup");

    const content = fs.readFileSync(path.join(getSoundsDir(), "dup.mp3"), "utf-8");
    expect(content).toBe("updated");
  });
});

describe("removeSound", () => {
  it("removes an imported sound", async () => {
    const src = path.join(TEST_SOURCE_DIR, "removeme.mp3");
    fs.writeFileSync(src, "fake-audio");
    await importSound(src);

    removeSound("removeme");
    expect(fs.existsSync(path.join(getSoundsDir(), "removeme.mp3"))).toBe(false);
  });

  it("throws when removing bundled sound", () => {
    expect(() => removeSound("elevator")).toThrow("Cannot remove bundled sound");
  });

  it("throws when sound not found", () => {
    expect(() => removeSound("nonexistent")).toThrow("not found");
  });

  it("removes sounds of any supported extension", async () => {
    const src = path.join(TEST_SOURCE_DIR, "mywave.wav");
    fs.writeFileSync(src, "fake-audio");
    await importSound(src);

    removeSound("mywave");
    expect(fs.existsSync(path.join(getSoundsDir(), "mywave.wav"))).toBe(false);
  });
});

describe("importSound — additional extension coverage", () => {
  it("imports .ogg files", async () => {
    const src = path.join(TEST_SOURCE_DIR, "birds.ogg");
    fs.writeFileSync(src, "fake-audio");

    const name = await importSound(src);
    expect(name).toBe("birds");
    expect(fs.existsSync(path.join(getSoundsDir(), "birds.ogg"))).toBe(true);
  });

  it("imports .m4a files", async () => {
    const src = path.join(TEST_SOURCE_DIR, "rain.m4a");
    fs.writeFileSync(src, "fake-audio");

    const name = await importSound(src);
    expect(name).toBe("rain");
    expect(fs.existsSync(path.join(getSoundsDir(), "rain.m4a"))).toBe(true);
  });

  it("creates sounds directory if it does not exist", async () => {
    const src = path.join(TEST_SOURCE_DIR, "newsound.mp3");
    fs.writeFileSync(src, "fake-audio");

    // Ensure sounds dir does NOT exist yet
    const soundsDir = getSoundsDir();
    expect(fs.existsSync(soundsDir)).toBe(false);

    await importSound(src);
    expect(fs.existsSync(soundsDir)).toBe(true);
    expect(fs.existsSync(path.join(soundsDir, "newsound.mp3"))).toBe(true);
  });
});
