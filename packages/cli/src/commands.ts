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
