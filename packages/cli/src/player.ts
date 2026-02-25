import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getConfig, getConfigDir } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

export function getSoundFile(mode: string): string | null {
  // 1. Check user's local sounds directory (downloaded + custom)
  const localFile = path.join(getConfigDir(), "sounds", `${mode}.mp3`);
  if (fs.existsSync(localFile)) return localFile;

  // 2. Check bundled sounds (fallback - only elevator.mp3 in package)
  const bundledFile = path.join(__dirname, "..", "sounds", `${mode}.mp3`);
  if (fs.existsSync(bundledFile)) return bundledFile;

  return null;
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

export async function play(): Promise<void> {
  if (isPlaying()) return; // Already playing, don't restart

  const config = getConfig();
  if (!config.enabled) return;

  let soundFile = getSoundFile(config.mode);

  // Lazy download: if sound not found locally, try downloading from registry
  if (!soundFile) {
    try {
      const { downloadSound } = await import("./registry.js");
      soundFile = await downloadSound(config.mode);
    } catch {
      // Fallback to bundled elevator
      soundFile = getSoundFile("elevator");
    }
  }

  if (!soundFile) return; // Nothing works, silent

  const player = detectPlayer();
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
