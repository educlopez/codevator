import fs from "node:fs";
import path from "node:path";
import { execSync, spawn } from "node:child_process";
import { getConfigDir } from "./config.js";

const MENUBAR_DIR = path.join(getConfigDir(), "menubar");
const BINARY_PATH = path.join(MENUBAR_DIR, "CodevatorMenuBar");
const REPO_URL = "https://github.com/educlopez/codevator";

export function isMenubarInstalled(): boolean {
  return fs.existsSync(BINARY_PATH);
}

export function isMenubarRunning(): boolean {
  if (process.platform !== "darwin") return false;
  try {
    const result = execSync(`pgrep -f '${BINARY_PATH}'`, { encoding: "utf-8" });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

export function launchMenubar(): void {
  if (!isMenubarInstalled() || isMenubarRunning()) return;
  spawn(BINARY_PATH, [], { detached: true, stdio: "ignore" }).unref();
}

export async function installMenubar(
  onProgress?: (msg: string) => void,
): Promise<{ success: boolean; message: string }> {
  if (process.platform !== "darwin") {
    return { success: false, message: "Menu bar app is only available on macOS." };
  }

  try {
    execSync("swift --version", { stdio: "ignore" });
  } catch {
    return {
      success: false,
      message: "Xcode Command Line Tools not found. Install them with: xcode-select --install",
    };
  }

  let menubarDir = findMenubarLocal();

  if (!menubarDir) {
    onProgress?.("Downloading menubar source from GitHub");
    menubarDir = await downloadMenubarSource();
    if (!menubarDir) {
      return {
        success: false,
        message: "Could not download menubar source. Check your internet connection.",
      };
    }
  }

  onProgress?.("Compiling (this may take a minute)");
  try {
    execSync("swift build -c release", {
      cwd: menubarDir,
      stdio: "pipe",
      timeout: 300_000,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, message: `Build failed: ${msg}` };
  }

  const buildDir = path.join(menubarDir, ".build", "release");
  const builtBinary = path.join(buildDir, "CodevatorMenuBar");

  if (!fs.existsSync(builtBinary)) {
    return { success: false, message: `Binary not found at ${builtBinary}` };
  }

  // Copy binary to ~/.codevator/menubar/
  fs.mkdirSync(MENUBAR_DIR, { recursive: true });
  fs.copyFileSync(builtBinary, BINARY_PATH);
  fs.chmodSync(BINARY_PATH, 0o755);

  return { success: true, message: `Installed to ${BINARY_PATH}` };
}

export function uninstallMenubar(): { success: boolean; message: string } {
  if (!isMenubarInstalled()) {
    return { success: false, message: "Menu bar companion is not installed." };
  }

  if (isMenubarRunning()) {
    try {
      execSync(`kill $(pgrep -f '${BINARY_PATH}')`, { stdio: "ignore" });
    } catch { /* already dead */ }
  }

  fs.rmSync(MENUBAR_DIR, { recursive: true, force: true });
  return { success: true, message: "Menu bar companion removed." };
}

function findMenubarLocal(): string | null {
  const thisDir = path.dirname(new URL(import.meta.url).pathname);
  const candidates = [
    path.resolve(thisDir, "../../menubar"),
    path.resolve(thisDir, "../../../packages/menubar"),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "Package.swift"))) {
      return dir;
    }
  }

  return null;
}

async function downloadMenubarSource(): Promise<string | null> {
  const srcDir = path.join(getConfigDir(), "menubar-src");

  if (fs.existsSync(path.join(srcDir, "packages", "menubar", "Package.swift"))) {
    try {
      execSync("git pull --ff-only", {
        cwd: srcDir,
        stdio: "pipe",
        timeout: 30_000,
      });
    } catch { /* offline — use cached */ }
    return path.join(srcDir, "packages", "menubar");
  }

  try {
    fs.rmSync(srcDir, { recursive: true, force: true });
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse ${REPO_URL}.git "${srcDir}"`,
      { stdio: "pipe", timeout: 60_000 }
    );
    execSync(
      "git sparse-checkout set packages/menubar",
      { cwd: srcDir, stdio: "pipe", timeout: 15_000 }
    );
  } catch {
    fs.rmSync(srcDir, { recursive: true, force: true });
    return null;
  }

  const menubarDir = path.join(srcDir, "packages", "menubar");
  if (fs.existsSync(path.join(menubarDir, "Package.swift"))) {
    return menubarDir;
  }

  return null;
}
