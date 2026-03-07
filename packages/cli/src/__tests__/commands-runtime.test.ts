import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// --- Mocks must be declared before imports ---

vi.mock("../ui.js", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  success: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  p: {
    intro: vi.fn(),
    outro: vi.fn(),
    note: vi.fn(),
    log: {
      step: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
    },
    spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
    select: vi.fn(),
    confirm: vi.fn(),
    isCancel: vi.fn(() => false),
  },
  pc: {
    cyan: (s: string) => s,
    green: (s: string) => s,
    red: (s: string) => s,
    dim: (s: string) => s,
    bgCyan: (s: string) => s,
    black: (s: string) => s,
  },
  volumeBar: vi.fn(() => "████████░░"),
}));

vi.mock("../stats.js", () => ({
  getStats: vi.fn(),
}));

vi.mock("../config.js", () => ({
  getConfig: vi.fn(),
  setConfig: vi.fn(),
  isValidMode: vi.fn(),
  MODES: ["elevator", "typewriter", "ambient", "retro", "minimal", "spotify"],
}));

vi.mock("../player.js", () => ({
  play: vi.fn(),
  stop: vi.fn(),
  sessionEnd: vi.fn(),
  shutdown: vi.fn(),
  isPlaying: vi.fn(),
  getSoundFile: vi.fn(),
  getSoundFiles: vi.fn(),
  isSpotifyRunning: vi.fn(),
  detectPlayer: vi.fn(),
}));

vi.mock("../registry.js", () => ({
  fetchManifest: vi.fn(),
  downloadSound: vi.fn(),
  isInstalled: vi.fn(),
  listInstalled: vi.fn(),
  getCachedManifest: vi.fn(),
}));

vi.mock("../setup.js", () => ({
  setupHooks: vi.fn(),
  removeHooks: vi.fn(),
}));

vi.mock("../doctor.js", () => ({
  runDoctor: vi.fn(),
}));

vi.mock("../import.js", () => ({
  importSound: vi.fn(),
  removeSound: vi.fn(),
}));

vi.mock("../agents/index.js", () => ({
  getAdapter: vi.fn(),
  listAdapters: vi.fn(() => ["claude", "codex"]),
}));

// --- Imports (after mocks) ---

import { runStatsCommand, runList, runPreview, run } from "../commands.js";
import { getStats } from "../stats.js";
import { getConfig, isValidMode } from "../config.js";
import { getSoundFiles, detectPlayer } from "../player.js";
import { listInstalled, getCachedManifest } from "../registry.js";
import { intro, outro, warn, success, p } from "../ui.js";
import { importSound } from "../import.js";
import { setConfig } from "../config.js";

// Typed mock helpers
const mockGetStats = vi.mocked(getStats);
const mockGetConfig = vi.mocked(getConfig);
const mockIsValidMode = vi.mocked(isValidMode);
const mockGetSoundFiles = vi.mocked(getSoundFiles);
const mockDetectPlayer = vi.mocked(detectPlayer);
const mockListInstalled = vi.mocked(listInstalled);
const mockGetCachedManifest = vi.mocked(getCachedManifest);
const mockIntro = vi.mocked(intro);
const mockOutro = vi.mocked(outro);
const mockWarn = vi.mocked(warn);
const mockPNote = vi.mocked(p.note);
const mockPLogStep = vi.mocked(p.log.step);
const mockPOutro = vi.mocked(p.outro);
const mockSuccess = vi.mocked(success);
const mockImportSound = vi.mocked(importSound);
const mockSetConfig = vi.mocked(setConfig);
const mockPConfirm = vi.mocked(p.confirm);
const mockPIsCancel = vi.mocked(p.isCancel);

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================
// runStatsCommand
// ============================================================

describe("runStatsCommand", () => {
  it("displays session count, total plays, favorite mode, and last played when stats exist", () => {
    mockGetStats.mockReturnValue({
      totalSessions: 12,
      totalPlays: 42,
      lastPlayed: "2026-03-01T10:00:00.000Z",
      modeUsage: { elevator: 30, ambient: 12 },
    });

    runStatsCommand();

    expect(mockIntro).toHaveBeenCalled();
    expect(mockPNote).toHaveBeenCalledTimes(1);

    const noteContent = mockPNote.mock.calls[0][0] as string;
    expect(noteContent).toContain("42");
    expect(noteContent).toContain("12");
    expect(noteContent).toContain("elevator");
    expect(noteContent).toContain("2026-03-01T10:00:00.000Z");
  });

  it("displays 'none yet' and 'never' when stats are empty/missing", () => {
    mockGetStats.mockReturnValue({
      totalSessions: 0,
      totalPlays: 0,
      lastPlayed: null,
      modeUsage: {},
    });

    runStatsCommand();

    expect(mockIntro).toHaveBeenCalled();
    expect(mockPNote).toHaveBeenCalledTimes(1);

    const noteContent = mockPNote.mock.calls[0][0] as string;
    expect(noteContent).toContain("0");
    expect(noteContent).toContain("none yet");
    expect(noteContent).toContain("never");
  });
});

// ============================================================
// runList
// ============================================================

describe("runList", () => {
  beforeEach(() => {
    mockGetConfig.mockReturnValue({ mode: "elevator", volume: 70, enabled: true });
  });

  it("shows built-in modes in the output", async () => {
    mockListInstalled.mockReturnValue([]);
    mockGetCachedManifest.mockReturnValue(null);
    mockGetSoundFiles.mockImplementation((mode: string) => {
      if (mode === "elevator") return ["/path/elevator.mp3"];
      if (mode === "typewriter") return ["/path/typewriter.mp3"];
      return [];
    });

    await runList();

    expect(mockIntro).toHaveBeenCalled();
    expect(mockPNote).toHaveBeenCalledTimes(1);

    const noteContent = mockPNote.mock.calls[0][0] as string;
    // Built-in modes with files should appear as bundled
    expect(noteContent).toContain("elevator");
    expect(noteContent).toContain("typewriter");
    // Spotify should always appear
    expect(noteContent).toContain("spotify");
    expect(noteContent).toContain("built-in");
  });

  it("shows registry sounds with installed/available status", async () => {
    mockListInstalled.mockReturnValue(["lofi"]);
    mockGetSoundFiles.mockImplementation((mode: string) => {
      if (mode === "lofi") return ["/path/lofi.mp3"];
      return [];
    });
    mockGetCachedManifest.mockReturnValue({
      version: 1,
      baseUrl: "https://codevator.dev/sounds",
      sounds: [
        { name: "lofi", description: "Lo-fi beats", category: "music", color: "#000", files: 1 },
        { name: "jazz", description: "Jazz piano", category: "music", color: "#111", files: 1 },
      ],
    });

    await runList();

    const noteContent = mockPNote.mock.calls[0][0] as string;
    // lofi is installed
    expect(noteContent).toContain("lofi");
    expect(noteContent).toContain("installed");
    // jazz is available but not installed
    expect(noteContent).toContain("jazz");
    expect(noteContent).toContain("available");
  });

  it("works non-interactively (no prompts, just output)", async () => {
    mockListInstalled.mockReturnValue([]);
    mockGetCachedManifest.mockReturnValue(null);
    mockGetSoundFiles.mockReturnValue([]);

    await runList();

    // Should call p.note for display and outro for the hint, but no interactive prompts
    expect(mockPNote).toHaveBeenCalled();
    expect(mockOutro).toHaveBeenCalled();
    // No interactive prompts should be called
    expect(p.select).not.toHaveBeenCalled();
    expect(p.confirm).not.toHaveBeenCalled();
  });
});

// ============================================================
// runPreview
// ============================================================

describe("runPreview", () => {
  it("shows warning and skips when mode is 'spotify'", async () => {
    await runPreview("spotify");

    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockWarn.mock.calls[0][0]).toContain("spotify");
    // Should NOT call intro or spawn anything
    expect(mockIntro).not.toHaveBeenCalled();
  });

  it("shows error when mode doesn't exist", async () => {
    mockIsValidMode.mockReturnValue(false);

    await runPreview("nonexistent");

    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockWarn.mock.calls[0][0]).toContain("not found");
    expect(mockIntro).not.toHaveBeenCalled();
  });

  it("shows usage warning when no mode specified", async () => {
    await runPreview(undefined);

    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockWarn.mock.calls[0][0]).toContain("Usage");
  });

  it("displays what mode is being previewed and does not change config", async () => {
    mockIsValidMode.mockReturnValue(true);
    mockGetSoundFiles.mockReturnValue(["/sounds/elevator.mp3"]);
    mockDetectPlayer.mockReturnValue("afplay");
    mockGetConfig.mockReturnValue({ mode: "ambient", volume: 70, enabled: true });

    // Mock the dynamic import of child_process spawn
    const mockKill = vi.fn();
    const mockOn = vi.fn((_event: string, cb: () => void) => {
      // Simulate child exiting immediately so the promise resolves
      cb();
    });
    const mockSpawn = vi.fn(() => ({
      kill: mockKill,
      on: mockOn,
      pid: 12345,
    }));

    // Mock node:child_process
    vi.doMock("node:child_process", () => ({
      spawn: mockSpawn,
      execSync: vi.fn(),
    }));

    await runPreview("elevator");

    expect(mockIntro).toHaveBeenCalled();
    expect(mockPLogStep).toHaveBeenCalled();
    const stepMsg = mockPLogStep.mock.calls[0][0] as string;
    expect(stepMsg).toContain("elevator");
    expect(stepMsg).toContain("5 seconds");

    // outro should indicate no config was changed
    expect(mockOutro).toHaveBeenCalled();
    const outroMsg = mockOutro.mock.calls[0][0] as string;
    expect(outroMsg).toContain("no config changed");

    // setConfig should NOT have been called
    const { setConfig } = await import("../config.js");
    expect(setConfig).not.toHaveBeenCalled();
  });

  it("spawns a player process for the preview", async () => {
    mockIsValidMode.mockReturnValue(true);
    mockGetSoundFiles.mockReturnValue(["/sounds/retro.mp3"]);
    mockDetectPlayer.mockReturnValue("afplay");
    mockGetConfig.mockReturnValue({ mode: "ambient", volume: 50, enabled: true });

    const mockKill = vi.fn();
    const mockOn = vi.fn((_event: string, cb: () => void) => {
      cb(); // Simulate immediate exit
    });
    const mockSpawn = vi.fn(() => ({
      kill: mockKill,
      on: mockOn,
      pid: 99999,
    }));

    vi.doMock("node:child_process", () => ({
      spawn: mockSpawn,
      execSync: vi.fn(),
    }));

    await runPreview("retro");

    expect(mockIntro).toHaveBeenCalled();
    expect(mockOutro).toHaveBeenCalledWith("Preview complete (no config changed)");
  });
});

// ============================================================
// runProfile list
// ============================================================

describe("runProfile list", () => {
  it("displays profile names, modes, and volumes", async () => {
    mockGetConfig.mockReturnValue({
      mode: "elevator",
      volume: 70,
      enabled: true,
      profiles: {
        work: { mode: "ambient", volume: 50 },
        chill: { mode: "elevator", volume: 80 },
      },
      activeProfile: "work",
    });

    await run("profile", ["list"]);

    expect(mockIntro).toHaveBeenCalled();
    expect(mockPNote).toHaveBeenCalledTimes(1);

    const noteContent = mockPNote.mock.calls[0][0] as string;
    // Profile names
    expect(noteContent).toContain("work");
    expect(noteContent).toContain("chill");
    // Modes
    expect(noteContent).toContain("ambient");
    expect(noteContent).toContain("elevator");
    // Volumes
    expect(noteContent).toContain("50%");
    expect(noteContent).toContain("80%");
    // Active indicator
    expect(noteContent).toContain("(active)");
    // Title
    expect(mockPNote.mock.calls[0][1]).toBe("Profiles");
  });

  it("shows warning when no profiles exist", async () => {
    mockGetConfig.mockReturnValue({
      mode: "elevator",
      volume: 70,
      enabled: true,
      profiles: {},
    });

    await run("profile", ["list"]);

    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockWarn.mock.calls[0][0]).toContain("No profiles configured");
    expect(mockPNote).not.toHaveBeenCalled();
  });

  it("shows warning when profiles is undefined", async () => {
    mockGetConfig.mockReturnValue({
      mode: "elevator",
      volume: 70,
      enabled: true,
    });

    await run("profile", ["list"]);

    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockWarn.mock.calls[0][0]).toContain("No profiles configured");
  });
});

// ============================================================
// runImport — interactive duplicate prompt
// ============================================================

describe("runImport interactive duplicate prompt", () => {
  it("prompts user on duplicate and overwrites when confirmed", async () => {
    // First call throws duplicate error, second (with force) succeeds
    mockImportSound
      .mockRejectedValueOnce(new Error('Sound "mysound" already exists. Use --force to overwrite.'))
      .mockResolvedValueOnce("mysound");
    mockPConfirm.mockResolvedValue(true);
    mockPIsCancel.mockReturnValue(false);

    await run("import", ["/path/to/mysound.mp3"]);

    // Should have prompted
    expect(mockPConfirm).toHaveBeenCalledTimes(1);
    expect(mockPConfirm.mock.calls[0][0]).toEqual(
      expect.objectContaining({ message: "Sound already exists. Overwrite?" })
    );
    // Should have retried with force
    expect(mockImportSound).toHaveBeenCalledTimes(2);
    expect(mockImportSound.mock.calls[1][1]).toEqual(
      expect.objectContaining({ force: true })
    );
    // Should show success
    expect(mockSuccess).toHaveBeenCalledTimes(1);
    expect(mockSuccess.mock.calls[0][0]).toContain("mysound");
  });

  it("aborts import when user declines overwrite", async () => {
    mockImportSound
      .mockRejectedValueOnce(new Error('Sound "mysound" already exists. Use --force to overwrite.'));
    mockPConfirm.mockResolvedValue(false);
    mockPIsCancel.mockReturnValue(false);

    await run("import", ["/path/to/mysound.mp3"]);

    expect(mockPConfirm).toHaveBeenCalledTimes(1);
    // Should NOT retry
    expect(mockImportSound).toHaveBeenCalledTimes(1);
    // Should warn about cancellation
    expect(mockWarn).toHaveBeenCalledWith("Import cancelled.");
  });

  it("aborts import when user cancels prompt", async () => {
    mockImportSound
      .mockRejectedValueOnce(new Error('Sound "mysound" already exists. Use --force to overwrite.'));
    mockPConfirm.mockResolvedValue(Symbol("cancel") as any);
    mockPIsCancel.mockReturnValue(true);

    await run("import", ["/path/to/mysound.mp3"]);

    expect(mockImportSound).toHaveBeenCalledTimes(1);
    expect(mockWarn).toHaveBeenCalledWith("Import cancelled.");
  });

  it("skips prompt when --force is used", async () => {
    mockImportSound.mockResolvedValue("mysound");

    await run("import", ["/path/to/mysound.mp3", "--force"]);

    expect(mockPConfirm).not.toHaveBeenCalled();
    expect(mockImportSound).toHaveBeenCalledTimes(1);
    expect(mockImportSound.mock.calls[0][1]).toEqual(
      expect.objectContaining({ force: true })
    );
    expect(mockSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows error for non-duplicate errors without prompting", async () => {
    mockImportSound.mockRejectedValueOnce(new Error("File not found: /bad/path.mp3"));

    await run("import", ["/bad/path.mp3"]);

    expect(mockPConfirm).not.toHaveBeenCalled();
    expect(mockWarn).toHaveBeenCalledWith("File not found: /bad/path.mp3");
  });
});
