import fs from "node:fs";
import path from "node:path";
import { getConfigDir } from "./config.js";

const REGISTRY_URL = "https://codevator.dev/sounds.json";

export interface SoundEntry {
  name: string;
  description: string;
  category: string;
  color: string;
}

interface SoundManifest {
  version: number;
  baseUrl: string;
  sounds: SoundEntry[];
}

function getSoundsDir(): string {
  return path.join(getConfigDir(), "sounds");
}

function getManifestCache(): string {
  return path.join(getConfigDir(), "sounds.json");
}

export async function fetchManifest(): Promise<SoundManifest> {
  try {
    const res = await fetch(REGISTRY_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const manifest: SoundManifest = await res.json();
    // Cache locally
    const dir = getConfigDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(getManifestCache(), JSON.stringify(manifest, null, 2));
    return manifest;
  } catch {
    // Fallback to cached version
    try {
      return JSON.parse(fs.readFileSync(getManifestCache(), "utf-8"));
    } catch {
      throw new Error("Could not fetch sound registry and no local cache found");
    }
  }
}

export function getCachedManifest(): SoundManifest | null {
  try {
    return JSON.parse(fs.readFileSync(getManifestCache(), "utf-8"));
  } catch {
    return null;
  }
}

export async function downloadSound(name: string, manifest?: SoundManifest): Promise<string> {
  const m = manifest ?? await fetchManifest();
  const entry = m.sounds.find((s) => s.name === name);
  if (!entry) throw new Error(`Sound '${name}' not found in registry`);

  const soundsDir = getSoundsDir();
  fs.mkdirSync(soundsDir, { recursive: true });
  const dest = path.join(soundsDir, `${name}.mp3`);

  // Prevent path traversal
  if (!dest.startsWith(soundsDir + path.sep)) {
    throw new Error(`Invalid sound name: '${name}'`);
  }

  // Skip if already downloaded
  if (fs.existsSync(dest)) return dest;

  const url = `${m.baseUrl}/${name}.mp3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${name}: HTTP ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  return dest;
}

export function isInstalled(name: string): boolean {
  return fs.existsSync(path.join(getSoundsDir(), `${name}.mp3`));
}

export function listInstalled(): string[] {
  const dir = getSoundsDir();
  try {
    return fs.readdirSync(dir)
      .filter((f) => f.endsWith(".mp3"))
      .map((f) => f.replace(/\.mp3$/, ""));
  } catch {
    return [];
  }
}
