import fs from "node:fs";
import path from "node:path";
import { getConfigDir } from "./config.js";

export const VALID_EXTENSIONS = [".mp3", ".wav", ".ogg", ".m4a"] as const;

const BUNDLED_MODES = ["elevator", "typewriter", "ambient", "retro", "minimal"] as const;

export function getSoundsDir(): string {
  return path.join(getConfigDir(), "sounds");
}

export interface ImportOptions {
  name?: string;
  force?: boolean;
}

export async function importSound(filePath: string, options: ImportOptions = {}): Promise<string> {
  // Validate file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Validate extension
  const ext = path.extname(filePath).toLowerCase();
  if (!VALID_EXTENSIONS.includes(ext as typeof VALID_EXTENSIONS[number])) {
    throw new Error(
      `Unsupported file format: ${ext || "(none)"}. Supported formats: ${VALID_EXTENSIONS.join(", ")}`
    );
  }

  // Derive sound name
  const soundName = options.name ?? path.basename(filePath, ext);
  const destDir = getSoundsDir();
  const destPath = path.join(destDir, `${soundName}${ext}`);

  // Safety: ensure dest is inside sounds dir
  if (!destPath.startsWith(destDir + path.sep)) {
    throw new Error("Invalid sound name");
  }

  // Check for duplicate
  if (fs.existsSync(destPath) && !options.force) {
    throw new Error(
      `Sound "${soundName}" already exists. Use --force to overwrite.`
    );
  }

  // Create sounds dir if missing
  fs.mkdirSync(destDir, { recursive: true });

  // Copy file
  fs.copyFileSync(filePath, destPath);

  return soundName;
}

export function removeSound(name: string): void {
  // Protect bundled sounds
  if ((BUNDLED_MODES as readonly string[]).includes(name)) {
    throw new Error(`Cannot remove bundled sound "${name}".`);
  }

  const dir = getSoundsDir();
  let found = false;

  for (const ext of VALID_EXTENSIONS) {
    const filePath = path.join(dir, `${name}${ext}`);
    if (!filePath.startsWith(dir + path.sep)) {
      throw new Error("Invalid sound name");
    }
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      found = true;
    }
  }

  if (!found) {
    throw new Error(`Sound "${name}" not found.`);
  }
}
