import { getConfig, setConfig, MODES, type CodevatorConfig } from "./config.js";
import { isValidMode } from "./config.js";
import { runDoctor } from "./doctor.js";
import { play, stop, sessionEnd, shutdown, isPlaying, getSoundFile, getSoundFiles, isSpotifyRunning, detectPlayer } from "./player.js";
import { fetchManifest, downloadSound, isInstalled, listInstalled, getCachedManifest, type SoundEntry } from "./registry.js";
import { setupHooks, removeHooks } from "./setup.js";
import { getStats } from "./stats.js";
import { intro, outro, success, warn, p, pc, volumeBar } from "./ui.js";

const VALID_COMMANDS = [
  "setup", "mode", "add", "on", "off", "volume", "status",
  "play", "stop", "session-end", "uninstall", "help",
  "doctor", "list", "preview", "stats",
] as const;

type Command = (typeof VALID_COMMANDS)[number];

export function parseArgs(argv: string[]): { command: Command; args: string[] } {
  const [cmd, ...args] = argv;
  if (!cmd) {
    return { command: "setup", args: [] };
  }
  if (!VALID_COMMANDS.includes(cmd as Command)) {
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
    case "add":
      return runAdd(args[0]);
    case "on":
      return runOn();
    case "off":
      return await runOff();
    case "volume":
      return runVolume(args[0]);
    case "status":
      return runStatus();
    case "play":
      return runPlay();
    case "stop":
      return runStop();
    case "session-end":
      return runSessionEnd();
    case "uninstall":
      return await runUninstall();
    case "doctor":
      return runDoctorCommand();
    case "list":
      return runList();
    case "preview":
      return runPreview(args[0]);
    case "stats":
      return runStatsCommand();
    case "help":
      return runHelp();
  }
}

async function runSetup(): Promise<void> {
  intro();
  const s = p.spinner();
  s.start("Configuring hooks");
  setupHooks();
  s.stop("Hooks configured in ~/.claude/settings.json");

  // Download default sound if not already available (bundled or local)
  if (!getSoundFile("elevator")) {
    const dl = p.spinner();
    dl.start("Downloading default sound");
    try {
      await downloadSound("elevator");
      dl.stop("Default sound ready");
    } catch {
      dl.stop("Could not download default sound (will retry on first play)");
    }
  }

  p.log.step(
    [
      `${pc.cyan("npx codevator mode")} <name>  Set sound mode`,
      `${pc.cyan("npx codevator add")} [name]   Download a sound`,
      `${pc.cyan("npx codevator on")} / ${pc.cyan("off")}     Enable or disable sounds`,
      `${pc.cyan("npx codevator volume")} <n>   Set volume (0-100)`,
      `${pc.cyan("npx codevator status")}       Show current settings`,
      `${pc.cyan("npx codevator uninstall")}    Remove hooks`,
    ].join("\n")
  );
  outro("Installed! Default mode: elevator");
}

async function runMode(mode: string | undefined): Promise<void> {
  if (!mode) {
    intro();

    // Build options from installed sounds + built-in modes
    const installed = listInstalled();
    const allModes = [...new Set([...MODES, ...installed])];

    const selected = await p.select({
      message: "Select a sound mode",
      options: allModes.map((m) => ({
        value: m,
        label: m,
        hint: m === "spotify"
          ? "controls Spotify volume"
          : (MODES as readonly string[]).includes(m) ? "built-in" : "downloaded",
      })),
    });

    if (p.isCancel(selected)) {
      p.cancel("Cancelled.");
      return;
    }

    mode = selected;
  }

  if (!isValidMode(mode)) {
    warn(`Sound '${mode}' not found. Run ${pc.cyan("npx codevator add")} to download sounds.`);
    return;
  }

  if (mode === "spotify" && !isSpotifyRunning()) {
    warn("Spotify is not running. Start Spotify and play something first.");
    return;
  }

  setConfig({ mode });

  // Daemon handles mode switching with crossfade; no need to stop first
  await play();
  outro(`Mode set to: ${pc.cyan(mode)}`);
}

async function runAdd(name: string | undefined): Promise<void> {
  intro();
  const s = p.spinner();
  s.start("Fetching sound registry");
  let manifest;
  try {
    manifest = await fetchManifest();
  } catch {
    s.stop("Failed to fetch registry");
    warn("Could not connect to codevator.dev. Check your internet connection.");
    return;
  }
  s.stop("Registry loaded");

  if (!name) {
    // Interactive selection
    const selected = await p.select({
      message: "Select a sound to download",
      options: manifest.sounds.map((s: SoundEntry) => ({
        value: s.name,
        label: s.name,
        hint: isInstalled(s.name) ? "installed" : undefined,
      })),
    });

    if (p.isCancel(selected)) {
      p.cancel("Cancelled.");
      return;
    }

    name = selected;
  }

  const entry = manifest.sounds.find((s: SoundEntry) => s.name === name);
  if (!entry) {
    warn(`Sound '${name}' not found in registry. Run ${pc.cyan("npx codevator add")} to see available sounds.`);
    return;
  }

  if (isInstalled(name)) {
    success(`${pc.cyan(name)} is already installed`);
  } else {
    const dl = p.spinner();
    dl.start(`Downloading ${name}`);
    try {
      await downloadSound(name, manifest);
      dl.stop(`Downloaded ${pc.cyan(name)}`);
    } catch (err) {
      dl.stop("Download failed");
      warn(`Could not download ${name}: ${err instanceof Error ? err.message : "unknown error"}`);
      return;
    }
  }

  const activate = await p.confirm({
    message: `Set ${pc.cyan(name)} as active mode?`,
  });

  if (p.isCancel(activate) || !activate) {
    outro(`${pc.cyan(name)} is ready. Use ${pc.cyan(`npx codevator mode ${name}`)} to activate it.`);
    return;
  }

  setConfig({ mode: name });
  await play();
  outro(`Mode set to: ${pc.cyan(name)}`);
}

function runOn(): void {
  setConfig({ enabled: true });
  success("Sounds enabled");
}

async function runOff(): Promise<void> {
  await shutdown();
  setConfig({ enabled: false });
  success("Sounds disabled");
}

async function runVolume(level: string | undefined): Promise<void> {
  const vol = parseInt(level ?? "", 10);
  if (isNaN(vol) || vol < 0 || vol > 100) {
    warn("Usage: npx codevator volume <0-100>");
    return;
  }
  setConfig({ volume: vol });
  // Daemon picks up new volume on next fadeIn; send play to apply immediately
  await play();
  success(`Volume set to ${vol}%  ${volumeBar(vol)}`);
}

function runStatus(): void {
  const config = getConfig();
  const playing = isPlaying();
  intro();
  p.note(
    [
      `Mode     ${pc.cyan(config.mode)}`,
      `Volume   ${volumeBar(config.volume)} ${config.volume}%`,
      `Enabled  ${config.enabled ? pc.green("yes") : pc.red("no")}`,
      `Playing  ${playing ? pc.green("yes") : pc.dim("no")}`,
    ].join("\n"),
    "Status"
  );
  p.outro("");
}

async function runPlay(): Promise<void> {
  await play();
}

function runStop(): void {
  stop();
}

function runSessionEnd(): void {
  sessionEnd();
}

async function runUninstall(): Promise<void> {
  intro();
  const s = p.spinner();
  s.start("Removing hooks");
  await shutdown();
  removeHooks();
  s.stop("Hooks removed from ~/.claude/settings.json");
  outro("Uninstalled. Config remains at ~/.codevator/");
}

export async function runDoctorCommand(): Promise<void> {
  intro();
  const results = await runDoctor();
  const allPass = results.every((r) => r.pass);

  for (const result of results) {
    const icon = result.pass ? pc.green("\u2713") : pc.red("\u2717");
    p.log.step(`${icon}  ${result.message}`);
    if (!result.pass && result.hint) {
      p.log.step(`   ${pc.dim(result.hint)}`);
    }
  }

  const passCount = results.filter((r) => r.pass).length;
  if (allPass) {
    outro(`All ${results.length} checks passed`);
  } else {
    outro(`${passCount}/${results.length} checks passed`);
  }
}

export async function runList(): Promise<void> {
  intro();

  const installed = listInstalled();
  const manifest = getCachedManifest();
  const config = getConfig();

  const rows: string[] = [];

  // Show installed sounds
  for (const name of installed) {
    const active = name === config.mode ? pc.green(" (active)") : "";
    const files = getSoundFiles(name);
    rows.push(`  ${pc.cyan(name)}  ${pc.dim(`${files.length} file(s)`)}  installed${active}`);
  }

  // Show built-in modes not in installed list
  for (const mode of MODES) {
    if (mode === "spotify") continue;
    if (installed.includes(mode)) continue;
    const files = getSoundFiles(mode);
    if (files.length > 0) {
      const active = mode === config.mode ? pc.green(" (active)") : "";
      rows.push(`  ${pc.cyan(mode)}  ${pc.dim(`${files.length} file(s)`)}  bundled${active}`);
    }
  }

  // Spotify mode
  const spotifyActive = config.mode === "spotify" ? pc.green(" (active)") : "";
  rows.push(`  ${pc.cyan("spotify")}  ${pc.dim("controls Spotify volume")}  built-in${spotifyActive}`);

  // Show available-but-not-installed from manifest
  if (manifest) {
    for (const entry of manifest.sounds) {
      if (installed.includes(entry.name)) continue;
      if ((MODES as readonly string[]).includes(entry.name)) continue;
      rows.push(`  ${pc.dim(entry.name)}  ${pc.dim(entry.description)}  ${pc.dim("available")}`);
    }
  }

  p.note(rows.join("\n"), "Sounds");
  outro(`Use ${pc.cyan("npx codevator add <name>")} to download more sounds`);
}

export async function runPreview(mode: string | undefined): Promise<void> {
  if (!mode) {
    warn("Usage: npx codevator preview <mode>");
    return;
  }

  if (mode === "spotify") {
    warn("Preview is not available for spotify mode (it controls Spotify volume, not sound files).");
    return;
  }

  if (!isValidMode(mode)) {
    warn(`Sound '${mode}' not found. Run ${pc.cyan("npx codevator add")} to download sounds.`);
    return;
  }

  intro();
  const files = getSoundFiles(mode);
  if (files.length === 0) {
    warn(`No sound files found for mode "${mode}".`);
    return;
  }

  const player = detectPlayer();
  const config = getConfig();
  const volume = config.volume / 100;

  p.log.step(`Previewing ${pc.cyan(mode)} for 5 seconds...`);

  const { spawn } = await import("node:child_process");
  const args = player === "afplay"
    ? ["-v", String(volume), files[0]]
    : [files[0]];

  const child = spawn(player, args, { stdio: "ignore" });

  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      child.kill();
      resolve();
    }, 5000);
    child.on("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });

  outro("Preview complete (no config changed)");
}

export function runStatsCommand(): void {
  intro();
  const stats = getStats();

  const favoriteMode = Object.entries(stats.modeUsage)
    .sort(([, a], [, b]) => b - a)[0];

  const lines = [
    `Total plays      ${pc.cyan(String(stats.totalPlays))}`,
    `Total sessions   ${pc.cyan(String(stats.totalSessions))}`,
    `Favorite mode    ${favoriteMode ? pc.cyan(favoriteMode[0]) : pc.dim("none yet")}`,
    `Last played      ${stats.lastPlayed ? pc.cyan(stats.lastPlayed) : pc.dim("never")}`,
  ];

  p.note(lines.join("\n"), "Stats");
  p.outro("");
}

function runHelp(): void {
  intro();
  p.note(
    [
      `Usage: ${pc.cyan("npx codevator")} <command>`,
      "",
      "Commands:",
      `  ${pc.cyan("npx codevator")}              Install hooks (default)`,
      `  ${pc.cyan("npx codevator mode")} <name>  Set sound mode`,
      `  ${pc.cyan("npx codevator add")} [name]   Download a sound from the registry`,
      `  ${pc.cyan("npx codevator on")} / ${pc.cyan("off")}     Enable or disable sounds`,
      `  ${pc.cyan("npx codevator volume")} <n>   Set volume (0-100)`,
      `  ${pc.cyan("npx codevator status")}       Show current settings`,
      `  ${pc.cyan("npx codevator doctor")}       Check installation health`,
      `  ${pc.cyan("npx codevator list")}         List available sounds`,
      `  ${pc.cyan("npx codevator preview")} <m>  Preview a sound for 5 seconds`,
      `  ${pc.cyan("npx codevator stats")}        Show usage statistics`,
      `  ${pc.cyan("npx codevator uninstall")}    Remove hooks`,
      "",
      `  ${pc.dim(`Modes: ${MODES.join(", ")}`)}`,
      `  ${pc.dim("spotify mode controls your Spotify volume (macOS only)")}`,
    ].join("\n"),
    "Elevator music for your AI coding agent"
  );
  outro(`Quick start: ${pc.cyan("npx codevator")}`);
}
