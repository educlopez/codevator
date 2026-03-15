import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { groupByCategory, pickRandom, CATEGORY_ORDER, CATEGORY_LABELS, type SoundEntry } from "../registry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// Helper factory
// ============================================================

function makeSoundEntry(overrides: Partial<SoundEntry> & { name: string }): SoundEntry {
  return {
    description: "",
    category: "focus",
    color: "#000",
    ...overrides,
  };
}

// ============================================================
// groupByCategory
// ============================================================

describe("groupByCategory", () => {
  it("groups sounds by their category", () => {
    const sounds: SoundEntry[] = [
      makeSoundEntry({ name: "deep-focus", category: "focus" }),
      makeSoundEntry({ name: "rain", category: "nature" }),
      makeSoundEntry({ name: "elevator", category: "music" }),
      makeSoundEntry({ name: "ocean", category: "nature" }),
    ];

    const grouped = groupByCategory(sounds);

    expect(grouped.get("focus")).toHaveLength(1);
    expect(grouped.get("nature")).toHaveLength(2);
    expect(grouped.get("music")).toHaveLength(1);
    expect(grouped.get("focus")![0].name).toBe("deep-focus");
    expect(grouped.get("nature")!.map((s) => s.name)).toEqual(["rain", "ocean"]);
  });

  it("respects CATEGORY_ORDER for key ordering", () => {
    // Insert in reverse order to test ordering
    const sounds: SoundEntry[] = [
      makeSoundEntry({ name: "spotify", category: "integration" }),
      makeSoundEntry({ name: "synthwave", category: "music" }),
      makeSoundEntry({ name: "rain", category: "nature" }),
      makeSoundEntry({ name: "deep-focus", category: "focus" }),
    ];

    const grouped = groupByCategory(sounds);
    const keys = [...grouped.keys()];

    // Keys should follow CATEGORY_ORDER
    expect(keys).toEqual(["focus", "nature", "music", "integration"]);
  });

  it("puts unknown categories into 'other' bucket at the end", () => {
    const sounds: SoundEntry[] = [
      makeSoundEntry({ name: "deep-focus", category: "focus" }),
      makeSoundEntry({ name: "weird", category: "experimental" }),
      makeSoundEntry({ name: "alien", category: "sci-fi" }),
    ];

    const grouped = groupByCategory(sounds);
    const keys = [...grouped.keys()];

    expect(keys[keys.length - 1]).toBe("other");
    expect(grouped.get("other")).toHaveLength(2);
    expect(grouped.get("other")!.map((s) => s.name)).toEqual(["weird", "alien"]);
  });

  it("returns empty map for empty input", () => {
    const grouped = groupByCategory([]);
    expect(grouped.size).toBe(0);
  });

  it("preserves original array order within each category", () => {
    const sounds: SoundEntry[] = [
      makeSoundEntry({ name: "alpha", category: "nature" }),
      makeSoundEntry({ name: "beta", category: "nature" }),
      makeSoundEntry({ name: "gamma", category: "nature" }),
    ];

    const grouped = groupByCategory(sounds);
    expect(grouped.get("nature")!.map((s) => s.name)).toEqual(["alpha", "beta", "gamma"]);
  });

  it("does not include empty categories", () => {
    const sounds: SoundEntry[] = [
      makeSoundEntry({ name: "rain", category: "nature" }),
    ];

    const grouped = groupByCategory(sounds);

    expect(grouped.has("focus")).toBe(false);
    expect(grouped.has("music")).toBe(false);
    expect(grouped.has("nature")).toBe(true);
  });

  it("handles sounds all in one category", () => {
    const sounds: SoundEntry[] = [
      makeSoundEntry({ name: "a", category: "focus" }),
      makeSoundEntry({ name: "b", category: "focus" }),
      makeSoundEntry({ name: "c", category: "focus" }),
    ];

    const grouped = groupByCategory(sounds);

    expect(grouped.size).toBe(1);
    expect(grouped.get("focus")).toHaveLength(3);
  });
});

// ============================================================
// pickRandom
// ============================================================

describe("pickRandom", () => {
  it("returns a valid entry from the list", () => {
    const sounds: SoundEntry[] = [
      makeSoundEntry({ name: "rain" }),
      makeSoundEntry({ name: "ocean" }),
      makeSoundEntry({ name: "forest" }),
    ];

    const picked = pickRandom(sounds);
    expect(sounds.map((s) => s.name)).toContain(picked.name);
  });

  it("excludes lastRandom name when multiple candidates exist", () => {
    const sounds: SoundEntry[] = [
      makeSoundEntry({ name: "rain" }),
      makeSoundEntry({ name: "ocean" }),
    ];

    // Run many iterations; "rain" should never be picked when excluded
    for (let i = 0; i < 50; i++) {
      const picked = pickRandom(sounds, "rain");
      expect(picked.name).toBe("ocean");
    }
  });

  it("returns the single sound when only one exists (anti-repeat waived)", () => {
    const sounds: SoundEntry[] = [makeSoundEntry({ name: "rain" })];

    const picked = pickRandom(sounds, "rain");
    expect(picked.name).toBe("rain");
  });

  it("throws on empty list", () => {
    expect(() => pickRandom([])).toThrow("No sounds available for random selection");
  });

  it("all returned values are valid entries over N iterations", () => {
    const sounds: SoundEntry[] = [
      makeSoundEntry({ name: "a" }),
      makeSoundEntry({ name: "b" }),
      makeSoundEntry({ name: "c" }),
      makeSoundEntry({ name: "d" }),
    ];

    const validNames = new Set(sounds.map((s) => s.name));
    for (let i = 0; i < 100; i++) {
      const picked = pickRandom(sounds);
      expect(validNames.has(picked.name)).toBe(true);
    }
  });

  it("returns from full list if exclude filters out all candidates", () => {
    // edge case: all entries have same name (degenerate but safe)
    const sounds: SoundEntry[] = [
      makeSoundEntry({ name: "only" }),
    ];

    const picked = pickRandom(sounds, "only");
    expect(picked.name).toBe("only");
  });

  it("works without exclude parameter", () => {
    const sounds: SoundEntry[] = [
      makeSoundEntry({ name: "rain" }),
      makeSoundEntry({ name: "ocean" }),
    ];

    // Should not throw
    const picked = pickRandom(sounds);
    expect(["rain", "ocean"]).toContain(picked.name);
  });
});

// ============================================================
// Constants validation
// ============================================================

describe("CATEGORY_ORDER and CATEGORY_LABELS", () => {
  it("CATEGORY_ORDER has all expected categories", () => {
    expect(CATEGORY_ORDER).toContain("focus");
    expect(CATEGORY_ORDER).toContain("nature");
    expect(CATEGORY_ORDER).toContain("music");
    expect(CATEGORY_ORDER).toContain("integration");
  });

  it("every CATEGORY_ORDER entry has a label in CATEGORY_LABELS", () => {
    for (const cat of CATEGORY_ORDER) {
      expect(CATEGORY_LABELS[cat]).toBeDefined();
      expect(typeof CATEGORY_LABELS[cat]).toBe("string");
      expect(CATEGORY_LABELS[cat].length).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// Integration: validate actual sounds.json
// ============================================================

describe("sounds.json integration validation", () => {
  // cwd is packages/cli when pnpm test runs; resolve to sibling web package
  const soundsJsonPath = path.resolve(process.cwd(), "../web/public/sounds.json");

  // Skip if sounds.json doesn't exist (CI without web package)
  const soundsJsonExists = fs.existsSync(soundsJsonPath);

  it.skipIf(!soundsJsonExists)("all entries have a category in CATEGORY_ORDER or integration", () => {
    const raw = JSON.parse(fs.readFileSync(soundsJsonPath, "utf-8"));
    const validCategories = new Set<string>([...CATEGORY_ORDER]);

    for (const entry of raw.sounds) {
      expect(validCategories.has(entry.category)).toBe(true);
    }
  });

  it.skipIf(!soundsJsonExists)("all names are unique", () => {
    const raw = JSON.parse(fs.readFileSync(soundsJsonPath, "utf-8"));
    const names = raw.sounds.map((s: SoundEntry) => s.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it.skipIf(!soundsJsonExists)("all entries have required fields", () => {
    const raw = JSON.parse(fs.readFileSync(soundsJsonPath, "utf-8"));
    for (const entry of raw.sounds) {
      expect(typeof entry.name).toBe("string");
      expect(entry.name.length).toBeGreaterThan(0);
      expect(typeof entry.description).toBe("string");
      expect(entry.description.length).toBeGreaterThan(0);
      expect(typeof entry.category).toBe("string");
      expect(typeof entry.color).toBe("string");
    }
  });

  it.skipIf(!soundsJsonExists)("has at least 15 entries", () => {
    const raw = JSON.parse(fs.readFileSync(soundsJsonPath, "utf-8"));
    expect(raw.sounds.length).toBeGreaterThanOrEqual(15);
  });

  it.skipIf(!soundsJsonExists)("covers at least 3 content categories", () => {
    const raw = JSON.parse(fs.readFileSync(soundsJsonPath, "utf-8"));
    const contentCategories = new Set(
      raw.sounds
        .filter((s: SoundEntry) => s.category !== "integration")
        .map((s: SoundEntry) => s.category)
    );
    expect(contentCategories.size).toBeGreaterThanOrEqual(3);
  });
});
