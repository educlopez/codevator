import { getConfig, setConfig, MODES, type CodevatorConfig } from "./config.js";
import { play, stop, isPlaying } from "./player.js";
import { setupHooks, removeHooks } from "./setup.js";
import { intro, outro, success, warn, p, pc, volumeBar } from "./ui.js";

const VALID_COMMANDS = [
  "setup", "mode", "on", "off", "volume", "status",
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
  intro();
  const s = p.spinner();
  s.start("Configuring hooks");
  setupHooks();
  s.stop("Hooks configured in ~/.claude/settings.json");
  outro("Installed! Default mode: elevator");
}

async function runMode(mode: string | undefined): Promise<void> {
  if (!mode || !MODES.includes(mode as CodevatorConfig["mode"])) {
    intro();
    const selected = await p.select({
      message: "Select a sound mode",
      options: MODES.map((m) => ({
        value: m,
        label: m,
        hint: m === "elevator" ? "default" : undefined,
      })),
    });

    if (p.isCancel(selected)) {
      p.cancel("Cancelled.");
      return;
    }

    mode = selected;
  }

  setConfig({ mode: mode as CodevatorConfig["mode"] });
  if (isPlaying()) {
    stop();
    play();
  }
  outro(`Mode set to: ${pc.cyan(mode)}`);
}

function runOn(): void {
  setConfig({ enabled: true });
  success("Sounds enabled");
}

function runOff(): void {
  stop();
  setConfig({ enabled: false });
  success("Sounds disabled");
}

function runVolume(level: string | undefined): void {
  const vol = parseInt(level ?? "", 10);
  if (isNaN(vol) || vol < 0 || vol > 100) {
    warn("Usage: codevator volume <0-100>");
    return;
  }
  setConfig({ volume: vol });
  if (isPlaying()) {
    stop();
    play();
  }
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

function runPlay(): void {
  play();
}

function runStop(): void {
  stop();
}

function runUninstall(): void {
  intro();
  const s = p.spinner();
  s.start("Removing hooks");
  stop();
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
      `  ${pc.cyan("setup")}            Install hooks into Claude Code`,
      `  ${pc.cyan("mode")} <name>      Set sound mode`,
      `  ${pc.cyan("on")} / ${pc.cyan("off")}         Enable or disable sounds`,
      `  ${pc.cyan("volume")} <0-100>   Set volume level`,
      `  ${pc.cyan("status")}           Show current settings`,
      `  ${pc.cyan("uninstall")}        Remove hooks`,
    ].join("\n"),
    "Elevator music for your AI coding agent"
  );
  outro(`Quick start: ${pc.cyan("npx codevator")}`);
}
