# Codevator Phase 1+2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the `codevator` CLI that plays waiting sounds while Claude Code works, with 5 sound modes, auto-setup of hooks, and a Claude Code skill for conversational control.

**Architecture:** TypeScript monorepo with a CLI package. The CLI manages audio playback via OS-native players (`afplay` on macOS, `paplay` on Linux), stores config at `~/.codevator/`, and auto-configures Claude Code hooks in `~/.claude/settings.json`. A skill file enables in-conversation control.

**Tech Stack:** TypeScript, Node.js, tsup (build), vitest (test), ffmpeg (audio generation)

**Environment:** Node v25.2.1, npm 11.6.2, macOS (afplay available), ffmpeg 7.1.1 available

---

### Task 1: Project Scaffolding

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/tsup.config.ts`
- Create: `package.json` (root monorepo)
- Create: `tsconfig.json` (root)
- Create: `.gitignore`

**Step 1: Initialize git repo**

```bash
cd /Users/eduardocalvolopez/Developer/local/codevator
git init
```

**Step 2: Create root package.json**

Create `package.json`:
```json
{
  "name": "codevator-monorepo",
  "private": true,
  "workspaces": ["packages/*"]
}
```

**Step 3: Create .gitignore**

Create `.gitignore`:
```
node_modules/
dist/
*.tgz
.DS_Store
```

**Step 4: Create CLI package.json**

Create `packages/cli/package.json`:
```json
{
  "name": "codevator",
  "version": "0.1.0",
  "description": "Elevator music for your AI coding agent",
  "bin": {
    "codevator": "./dist/bin.js"
  },
  "files": ["dist", "sounds"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "keywords": ["claude", "ai", "music", "elevator", "coding", "cli"],
  "license": "MIT"
}
```

**Step 5: Create TypeScript configs**

Create root `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "declaration": true,
    "skipLibCheck": true
  }
}
```

Create `packages/cli/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 6: Create tsup config**

Create `packages/cli/tsup.config.ts`:
```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    bin: "src/bin.ts",
  },
  format: ["esm"],
  target: "node20",
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
```

**Step 7: Install dependencies**

```bash
cd /Users/eduardocalvolopez/Developer/local/codevator
npm install -D typescript tsup vitest -w
cd packages/cli && npm install -D typescript tsup vitest
```

**Step 8: Create placeholder bin entry**

Create `packages/cli/src/bin.ts`:
```ts
console.log("codevator v0.1.0");
```

**Step 9: Build and verify**

```bash
cd /Users/eduardocalvolopez/Developer/local/codevator/packages/cli
npx tsup
node dist/bin.js
```
Expected: prints "codevator v0.1.0"

**Step 10: Commit**

```bash
git add -A && git commit -m "feat: scaffold monorepo with CLI package"
```

---

### Task 2: Config Module

**Files:**
- Create: `packages/cli/src/config.ts`
- Create: `packages/cli/src/__tests__/config.test.ts`

**Step 1: Write failing tests**

Create `packages/cli/src/__tests__/config.test.ts`:
```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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

vi.mock("node:os", async () => {
  const actual = await vi.importActual("node:os");
  return { ...actual, homedir: () => TEST_DIR };
});

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("getConfigDir", () => {
  it("returns ~/.codevator path", () => {
    expect(getConfigDir()).toBe(path.join(TEST_DIR, ".codevator"));
  });
});

describe("getConfig", () => {
  it("returns default config when no file exists", () => {
    expect(getConfig()).toEqual(DEFAULT_CONFIG);
  });

  it("reads existing config", () => {
    const configDir = path.join(TEST_DIR, ".codevator");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, "config.json"),
      JSON.stringify({ mode: "retro", volume: 50, enabled: false })
    );
    expect(getConfig()).toEqual({ mode: "retro", volume: 50, enabled: false });
  });
});

describe("setConfig", () => {
  it("writes config and creates directory", () => {
    setConfig({ mode: "ambient", volume: 80, enabled: true });
    const raw = fs.readFileSync(
      path.join(TEST_DIR, ".codevator", "config.json"),
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
```

**Step 2: Run tests to verify they fail**

```bash
cd /Users/eduardocalvolopez/Developer/local/codevator/packages/cli
npx vitest run src/__tests__/config.test.ts
```
Expected: FAIL — module `../config.js` not found

**Step 3: Implement config module**

Create `packages/cli/src/config.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface CodevatorConfig {
  mode: "elevator" | "typewriter" | "ambient" | "retro" | "minimal";
  volume: number;
  enabled: boolean;
}

export const MODES = [
  "elevator",
  "typewriter",
  "ambient",
  "retro",
  "minimal",
] as const;

export const DEFAULT_CONFIG: CodevatorConfig = {
  mode: "elevator",
  volume: 70,
  enabled: true,
};

export function getConfigDir(): string {
  return path.join(os.homedir(), ".codevator");
}

function getConfigPath(): string {
  return path.join(getConfigDir(), "config.json");
}

export function getConfig(): CodevatorConfig {
  try {
    const raw = fs.readFileSync(getConfigPath(), "utf-8");
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function setConfig(partial: Partial<CodevatorConfig>): void {
  const current = getConfig();
  const merged = { ...current, ...partial };
  const dir = getConfigDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getConfigPath(), JSON.stringify(merged, null, 2));
}
```

**Step 4: Run tests to verify they pass**

```bash
cd /Users/eduardocalvolopez/Developer/local/codevator/packages/cli
npx vitest run src/__tests__/config.test.ts
```
Expected: all PASS

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add config module with read/write/defaults"
```

---

### Task 3: Audio Player Module

**Files:**
- Create: `packages/cli/src/player.ts`
- Create: `packages/cli/src/__tests__/player.test.ts`

**Step 1: Write failing tests**

Create `packages/cli/src/__tests__/player.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { detectPlayer, getPidFile, isPlaying } from "../player.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-player-test-" + Date.now());

vi.mock("node:os", async () => {
  const actual = await vi.importActual("node:os");
  return { ...actual, homedir: () => TEST_DIR };
});

beforeEach(() => {
  fs.mkdirSync(path.join(TEST_DIR, ".codevator"), { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("detectPlayer", () => {
  it("returns a player command string", () => {
    const player = detectPlayer();
    // On macOS should return afplay, on Linux paplay or aplay
    expect(typeof player).toBe("string");
    expect(player.length).toBeGreaterThan(0);
  });
});

describe("getPidFile", () => {
  it("returns path inside .codevator", () => {
    expect(getPidFile()).toBe(path.join(TEST_DIR, ".codevator", "player.pid"));
  });
});

describe("isPlaying", () => {
  it("returns false when no PID file exists", () => {
    expect(isPlaying()).toBe(false);
  });

  it("returns false when PID file has stale PID", () => {
    fs.writeFileSync(getPidFile(), "999999999");
    expect(isPlaying()).toBe(false);
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
cd /Users/eduardocalvolopez/Developer/local/codevator/packages/cli
npx vitest run src/__tests__/player.test.ts
```
Expected: FAIL — module not found

**Step 3: Implement player module**

Create `packages/cli/src/player.ts`:
```ts
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getConfig, getConfigDir } from "./config.js";

export function getPidFile(): string {
  return path.join(getConfigDir(), "player.pid");
}

export function detectPlayer(): string {
  const platform = process.platform;
  if (platform === "darwin") return "afplay";
  // Linux: try paplay first, then aplay
  try {
    execSync("which paplay", { stdio: "ignore" });
    return "paplay";
  } catch {
    return "aplay";
  }
}

function buildArgs(player: string, volume: number, filePath: string): string[] {
  if (player === "afplay") {
    // afplay volume: 0.0 to 1.0
    return ["-v", String(volume / 100), filePath];
  }
  // paplay/aplay — volume not easily controllable, just play
  return [filePath];
}

export function getSoundFile(mode: string): string {
  // Sounds are bundled with the package
  const soundsDir = path.join(__dirname, "..", "sounds");
  return path.join(soundsDir, `${mode}.mp3`);
}

export function isPlaying(): boolean {
  const pidFile = getPidFile();
  try {
    const pid = parseInt(fs.readFileSync(pidFile, "utf-8").trim(), 10);
    // Check if process is alive
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function play(): void {
  if (isPlaying()) return; // Already playing, don't restart

  const config = getConfig();
  if (!config.enabled) return;

  const player = detectPlayer();
  const soundFile = getSoundFile(config.mode);

  if (!fs.existsSync(soundFile)) {
    console.error(`Sound file not found: ${soundFile}`);
    return;
  }

  const args = buildArgs(player, config.volume, soundFile);

  // Spawn looping playback in background
  // We wrap in a shell loop for continuous play
  const child = spawn("sh", ["-c", `while true; do ${player} ${args.map(a => `"${a}"`).join(" ")}; done`], {
    detached: true,
    stdio: "ignore",
  });

  child.unref();

  // Save PID
  const configDir = getConfigDir();
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(getPidFile(), String(child.pid));
}

export function stop(): void {
  const pidFile = getPidFile();
  try {
    const pid = parseInt(fs.readFileSync(pidFile, "utf-8").trim(), 10);
    // Kill the process group (negative PID kills the group)
    process.kill(-pid, "SIGTERM");
  } catch {
    // Process already dead or PID file doesn't exist
  }
  try {
    fs.unlinkSync(pidFile);
  } catch {
    // Already gone
  }
}
```

**Step 4: Run tests to verify they pass**

```bash
cd /Users/eduardocalvolopez/Developer/local/codevator/packages/cli
npx vitest run src/__tests__/player.test.ts
```
Expected: all PASS

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add audio player with OS detection and PID management"
```

---

### Task 4: Generate Sound Files

**Files:**
- Create: `packages/cli/sounds/elevator.mp3`
- Create: `packages/cli/sounds/typewriter.mp3`
- Create: `packages/cli/sounds/ambient.mp3`
- Create: `packages/cli/sounds/retro.mp3`
- Create: `packages/cli/sounds/minimal.mp3`

We use ffmpeg to generate distinctive placeholder sounds for each mode. These are functional MVPs — recognizable and pleasant enough for real use. They can be replaced with higher-quality audio later.

**Step 1: Generate elevator sound (bossa nova-ish easy listening)**

```bash
mkdir -p /Users/eduardocalvolopez/Developer/local/codevator/packages/cli/sounds

# Elevator: warm sine-wave melody with soft harmonics, 45 seconds
ffmpeg -y -f lavfi -i "sine=frequency=440:duration=45[s1];sine=frequency=554:duration=45[s2];sine=frequency=659:duration=45[s3];[s1][s2]amix=inputs=2[m1];[m1][s3]amix=inputs=2,volume=0.3,atempo=0.9" -t 45 /Users/eduardocalvolopez/Developer/local/codevator/packages/cli/sounds/elevator.mp3
```

**Step 2: Generate typewriter sound**

```bash
# Typewriter: clicks and clacks from noise bursts
ffmpeg -y -f lavfi -i "anoisesrc=d=45:c=white:r=44100,agate=threshold=0.8:ratio=20:attack=0.5:release=10,highpass=f=2000,volume=0.4" -t 45 /Users/eduardocalvolopez/Developer/local/codevator/packages/cli/sounds/typewriter.mp3
```

**Step 3: Generate ambient sound**

```bash
# Ambient: filtered pink noise (rain-like) with low sine drone
ffmpeg -y -f lavfi -i "anoisesrc=d=45:c=pink:r=44100,lowpass=f=800,volume=0.25[rain];sine=frequency=174:duration=45,volume=0.08[drone];[rain][drone]amix=inputs=2" -t 45 /Users/eduardocalvolopez/Developer/local/codevator/packages/cli/sounds/ambient.mp3
```

**Step 4: Generate retro sound**

```bash
# Retro: square wave arpeggios (8-bit style)
ffmpeg -y -f lavfi -i "sine=frequency=523:duration=0.15,asetpts=PTS-STARTPTS[c1];sine=frequency=659:duration=0.15,asetpts=PTS-STARTPTS[e1];sine=frequency=784:duration=0.15,asetpts=PTS-STARTPTS[g1];sine=frequency=1047:duration=0.15,asetpts=PTS-STARTPTS[c2];[c1][e1][g1][c2]concat=n=4:v=0:a=1,aloop=loop=74:size=26460,volume=0.3" -t 45 /Users/eduardocalvolopez/Developer/local/codevator/packages/cli/sounds/retro.mp3
```

**Step 5: Generate minimal sound**

```bash
# Minimal: very subtle low-frequency pulse
ffmpeg -y -f lavfi -i "sine=frequency=60:duration=45,tremolo=f=1:d=0.4,volume=0.15" -t 45 /Users/eduardocalvolopez/Developer/local/codevator/packages/cli/sounds/minimal.mp3
```

**Step 6: Verify all files exist and are reasonable size**

```bash
ls -lh /Users/eduardocalvolopez/Developer/local/codevator/packages/cli/sounds/
```
Expected: 5 mp3 files, each ~50-500KB

**Step 7: Quick listen test**

```bash
afplay /Users/eduardocalvolopez/Developer/local/codevator/packages/cli/sounds/elevator.mp3 &
sleep 3 && kill %1
```
Expected: hear sound for ~3 seconds

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add generated sound files for all 5 modes"
```

---

### Task 5: CLI Command Router

**Files:**
- Modify: `packages/cli/src/bin.ts`
- Create: `packages/cli/src/commands.ts`
- Create: `packages/cli/src/__tests__/commands.test.ts`

**Step 1: Write failing tests**

Create `packages/cli/src/__tests__/commands.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseArgs } from "../commands.js";

describe("parseArgs", () => {
  it("parses 'setup' command", () => {
    expect(parseArgs(["setup"])).toEqual({ command: "setup", args: [] });
  });

  it("parses 'mode retro' command", () => {
    expect(parseArgs(["mode", "retro"])).toEqual({
      command: "mode",
      args: ["retro"],
    });
  });

  it("parses 'volume 80' command", () => {
    expect(parseArgs(["volume", "80"])).toEqual({
      command: "volume",
      args: ["80"],
    });
  });

  it("parses 'on' command", () => {
    expect(parseArgs(["on"])).toEqual({ command: "on", args: [] });
  });

  it("parses 'off' command", () => {
    expect(parseArgs(["off"])).toEqual({ command: "off", args: [] });
  });

  it("parses 'status' command", () => {
    expect(parseArgs(["status"])).toEqual({ command: "status", args: [] });
  });

  it("parses 'play' command (internal, used by hooks)", () => {
    expect(parseArgs(["play"])).toEqual({ command: "play", args: [] });
  });

  it("parses 'stop' command (internal, used by hooks)", () => {
    expect(parseArgs(["stop"])).toEqual({ command: "stop", args: [] });
  });

  it("returns help for no args", () => {
    expect(parseArgs([])).toEqual({ command: "help", args: [] });
  });

  it("returns help for unknown command", () => {
    expect(parseArgs(["unknown"])).toEqual({ command: "help", args: [] });
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/commands.test.ts
```

**Step 3: Implement commands module**

Create `packages/cli/src/commands.ts`:
```ts
import { getConfig, setConfig, MODES, type CodevatorConfig } from "./config.js";
import { play, stop, isPlaying } from "./player.js";
import { setupHooks, removeHooks } from "./setup.js";

const VALID_COMMANDS = [
  "setup", "mode", "on", "off", "volume", "status",
  "play", "stop", "uninstall", "help",
] as const;

type Command = (typeof VALID_COMMANDS)[number];

export function parseArgs(argv: string[]): { command: Command; args: string[] } {
  const [cmd, ...args] = argv;
  if (!cmd || !VALID_COMMANDS.includes(cmd as Command)) {
    return { command: "help", args: [] };
  }
  return { command: cmd as Command, args };
}

export async function run(command: Command, args: string[]): Promise<void> {
  switch (command) {
    case "setup":
      return runSetup();
    case "mode":
      return runMode(args[0]);
    case "on":
      return runOn();
    case "off":
      return runOff();
    case "volume":
      return runVolume(args[0]);
    case "status":
      return runStatus();
    case "play":
      return runPlay();
    case "stop":
      return runStop();
    case "uninstall":
      return runUninstall();
    case "help":
      return runHelp();
  }
}

function runSetup(): void {
  setupHooks();
  console.log("🛗 Codevator installed!");
  console.log("   Hooks configured in ~/.claude/settings.json");
  console.log("   Default mode: elevator");
  console.log("   Run 'codevator mode <name>' to change sounds");
}

function runMode(mode: string | undefined): void {
  if (!mode || !MODES.includes(mode as CodevatorConfig["mode"])) {
    console.log(`Available modes: ${MODES.join(", ")}`);
    return;
  }
  setConfig({ mode: mode as CodevatorConfig["mode"] });
  // Restart playback if currently playing
  if (isPlaying()) {
    stop();
    play();
  }
  console.log(`🛗 Mode set to: ${mode}`);
}

function runOn(): void {
  setConfig({ enabled: true });
  console.log("🛗 Sounds enabled");
}

function runOff(): void {
  stop();
  setConfig({ enabled: false });
  console.log("🛗 Sounds disabled");
}

function runVolume(level: string | undefined): void {
  const vol = parseInt(level ?? "", 10);
  if (isNaN(vol) || vol < 0 || vol > 100) {
    console.log("Usage: codevator volume <0-100>");
    return;
  }
  setConfig({ volume: vol });
  // Restart playback with new volume if currently playing
  if (isPlaying()) {
    stop();
    play();
  }
  console.log(`🛗 Volume set to: ${vol}%`);
}

function runStatus(): void {
  const config = getConfig();
  const playing = isPlaying();
  console.log("🛗 Codevator Status");
  console.log(`   Mode:    ${config.mode}`);
  console.log(`   Volume:  ${config.volume}%`);
  console.log(`   Enabled: ${config.enabled ? "yes" : "no"}`);
  console.log(`   Playing: ${playing ? "yes" : "no"}`);
}

function runPlay(): void {
  play();
}

function runStop(): void {
  stop();
}

function runUninstall(): void {
  stop();
  removeHooks();
  console.log("🛗 Codevator uninstalled");
  console.log("   Hooks removed from ~/.claude/settings.json");
  console.log("   Config remains at ~/.codevator/ (delete manually if desired)");
}

function runHelp(): void {
  console.log(`🛗 Codevator — Elevator music for your AI coding agent

Usage: codevator <command>

Commands:
  setup              Install hooks into Claude Code
  mode <name>        Set sound mode (elevator|typewriter|ambient|retro|minimal)
  on                 Enable sounds
  off                Disable sounds
  volume <0-100>     Set volume level
  status             Show current settings
  uninstall          Remove hooks from Claude Code`);
}
```

**Step 4: Update bin.ts to use command router**

Modify `packages/cli/src/bin.ts`:
```ts
import { parseArgs, run } from "./commands.js";

const { command, args } = parseArgs(process.argv.slice(2));
run(command, args);
```

**Step 5: Run tests**

```bash
npx vitest run src/__tests__/commands.test.ts
```
Expected: all PASS

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add CLI command router with all commands"
```

---

### Task 6: Setup Module (Hook Configuration)

**Files:**
- Create: `packages/cli/src/setup.ts`
- Create: `packages/cli/src/__tests__/setup.test.ts`

**Step 1: Write failing tests**

Create `packages/cli/src/__tests__/setup.test.ts`:
```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { setupHooks, removeHooks } from "../setup.js";

const TEST_DIR = path.join(os.tmpdir(), "codevator-setup-test-" + Date.now());

vi.mock("node:os", async () => {
  const actual = await vi.importActual("node:os");
  return { ...actual, homedir: () => TEST_DIR };
});

beforeEach(() => {
  fs.mkdirSync(path.join(TEST_DIR, ".claude"), { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("setupHooks", () => {
  it("creates settings.json with hooks when no file exists", () => {
    setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(TEST_DIR, ".claude", "settings.json"), "utf-8")
    );
    expect(settings.hooks).toBeDefined();
    expect(settings.hooks.PreToolUse).toBeDefined();
    expect(settings.hooks.Stop).toBeDefined();
    expect(settings.hooks.Notification).toBeDefined();
  });

  it("preserves existing settings when adding hooks", () => {
    fs.writeFileSync(
      path.join(TEST_DIR, ".claude", "settings.json"),
      JSON.stringify({ model: "opus", permissions: {} })
    );
    setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(TEST_DIR, ".claude", "settings.json"), "utf-8")
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
      path.join(TEST_DIR, ".claude", "settings.json"),
      JSON.stringify(existing)
    );
    setupHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(TEST_DIR, ".claude", "settings.json"), "utf-8")
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
      path.join(TEST_DIR, ".claude", "settings.json"),
      JSON.stringify(existing)
    );
    removeHooks();
    const settings = JSON.parse(
      fs.readFileSync(path.join(TEST_DIR, ".claude", "settings.json"), "utf-8")
    );
    expect(settings.hooks.PreToolUse).toHaveLength(1);
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toBe("other-tool");
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx vitest run src/__tests__/setup.test.ts
```

**Step 3: Implement setup module**

Create `packages/cli/src/setup.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

function getSettingsPath(): string {
  return path.join(os.homedir(), ".claude", "settings.json");
}

function readSettings(): Record<string, any> {
  try {
    return JSON.parse(fs.readFileSync(getSettingsPath(), "utf-8"));
  } catch {
    return {};
  }
}

function writeSettings(settings: Record<string, any>): void {
  const dir = path.dirname(getSettingsPath());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2));
}

const CODEVATOR_HOOKS = {
  PreToolUse: {
    matcher: "",
    hooks: [{ type: "command", command: "codevator play", async: true }],
  },
  Stop: {
    matcher: "",
    hooks: [{ type: "command", command: "codevator stop" }],
  },
  Notification: {
    matcher: "permission_prompt|idle_prompt",
    hooks: [{ type: "command", command: "codevator stop" }],
  },
};

function isCodevatorHook(entry: any): boolean {
  return entry?.hooks?.some(
    (h: any) =>
      typeof h.command === "string" && h.command.startsWith("codevator")
  );
}

export function setupHooks(): void {
  const settings = readSettings();
  if (!settings.hooks) settings.hooks = {};

  for (const [event, hookEntry] of Object.entries(CODEVATOR_HOOKS)) {
    if (!settings.hooks[event]) settings.hooks[event] = [];

    // Remove existing codevator hooks first (idempotent)
    settings.hooks[event] = settings.hooks[event].filter(
      (e: any) => !isCodevatorHook(e)
    );

    // Add fresh codevator hook
    settings.hooks[event].push(hookEntry);
  }

  writeSettings(settings);
}

export function removeHooks(): void {
  const settings = readSettings();
  if (!settings.hooks) return;

  for (const event of Object.keys(CODEVATOR_HOOKS)) {
    if (!settings.hooks[event]) continue;
    settings.hooks[event] = settings.hooks[event].filter(
      (e: any) => !isCodevatorHook(e)
    );
    if (settings.hooks[event].length === 0) {
      delete settings.hooks[event];
    }
  }

  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  writeSettings(settings);
}
```

**Step 4: Run tests**

```bash
npx vitest run src/__tests__/setup.test.ts
```
Expected: all PASS

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add hook setup/removal for Claude Code settings"
```

---

### Task 7: Build, Link & End-to-End Test

**Step 1: Build the CLI**

```bash
cd /Users/eduardocalvolopez/Developer/local/codevator/packages/cli
npx tsup
```

**Step 2: Link globally for testing**

```bash
cd /Users/eduardocalvolopez/Developer/local/codevator/packages/cli
npm link
```

**Step 3: Test all commands**

```bash
codevator help
codevator status
codevator mode retro
codevator status
codevator volume 50
codevator status
codevator mode elevator
codevator play &
sleep 3
codevator stop
codevator off
codevator on
```

**Step 4: Run full test suite**

```bash
cd /Users/eduardocalvolopez/Developer/local/codevator/packages/cli
npx vitest run
```
Expected: all tests pass

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: complete CLI with build and end-to-end verification"
```

---

### Task 8: Claude Code Skill

**Files:**
- Create: `packages/cli/skill/codevator.md`
- Modify: `packages/cli/src/setup.ts` (add skill installation)

**Step 1: Create skill file**

Create `packages/cli/skill/codevator.md`:
```markdown
---
name: codevator
description: Control waiting sounds. Trigger on "music", "sound", "codevator", "elevator", "volume", "mute", or /codevator
---

You control codevator, a tool that plays waiting sounds while you work.

Available commands (run via Bash):
- `codevator mode <name>` — Switch mode: elevator, typewriter, ambient, retro, minimal
- `codevator on` / `codevator off` — Toggle sounds
- `codevator volume <0-100>` — Set volume
- `codevator status` — Show current mode, volume, and state

When the user asks to change sounds, music, or modes, run the appropriate command and confirm what you did. Be brief.
```

**Step 2: Add skill installation to setup.ts**

Add to `setupHooks()` in `packages/cli/src/setup.ts` — after writing hooks, also copy the skill file:

```ts
// Add at the end of setupHooks():
function installSkill(): void {
  const skillDir = path.join(os.homedir(), ".claude", "skills");
  fs.mkdirSync(skillDir, { recursive: true });
  const skillSrc = path.join(__dirname, "..", "skill", "codevator.md");
  const skillDest = path.join(skillDir, "codevator.md");
  try {
    fs.copyFileSync(skillSrc, skillDest);
  } catch {
    // Skill file not found in package — skip (dev environment)
  }
}
```

Call `installSkill()` at the end of `setupHooks()`.

Add `removeSkill()` to `removeHooks()`:
```ts
function removeSkill(): void {
  const skillPath = path.join(os.homedir(), ".claude", "skills", "codevator.md");
  try { fs.unlinkSync(skillPath); } catch {}
}
```

**Step 3: Rebuild and test**

```bash
cd /Users/eduardocalvolopez/Developer/local/codevator/packages/cli
npx tsup
codevator setup
cat ~/.claude/skills/codevator.md
```
Expected: skill file exists with correct content

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Claude Code skill with auto-install on setup"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Project scaffolding | package.json, tsconfig, tsup, gitignore |
| 2 | Config module | config.ts + tests |
| 3 | Audio player | player.ts + tests |
| 4 | Sound files | 5 generated mp3s via ffmpeg |
| 5 | CLI commands | commands.ts, bin.ts + tests |
| 6 | Hook setup | setup.ts + tests |
| 7 | Build & E2E test | Build, link, manual test |
| 8 | Skill | codevator.md, setup integration |

After completing all tasks, the user can run `npx codevator setup` and immediately have elevator music while Claude Code works.
