import { getConfig, setConfig, MODES, type CodevatorConfig } from "./config.js";
import { isValidMode } from "./config.js";
import { play, stop, shutdown, isPlaying, getSoundFile, isSpotifyRunning } from "./player.js";
import { fetchManifest, downloadSound, isInstalled, listInstalled, type SoundEntry } from "./registry.js";
import { setupHooks, removeHooks } from "./setup.js";
import { intro, outro, success, warn, p, pc, volumeBar } from "./ui.js";

const VALID_COMMANDS = [
  "setup", "mode", "add", "on", "off", "volume", "status",
  "play", "stop", "uninstall", "help",
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

function runOff(): void {
  shutdown();
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

function runUninstall(): void {
  intro();
  const s = p.spinner();
  s.start("Removing hooks");
  shutdown();
  removeHooks();
  s.stop("Hooks removed from ~/.claude/settings.json");
  outro("Uninstalled. Config remains at ~/.codevator/");
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
      `  ${pc.cyan("npx codevator uninstall")}    Remove hooks`,
      "",
      `  ${pc.dim(`Modes: ${MODES.join(", ")}`)}`,
      `  ${pc.dim("spotify mode controls your Spotify volume (macOS only)")}`,
    ].join("\n"),
    "Elevator music for your AI coding agent"
  );
  outro(`Quick start: ${pc.cyan("npx codevator")}`);
}
