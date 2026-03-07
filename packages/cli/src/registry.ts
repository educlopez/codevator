import fs from "node:fs";
import path from "node:path";
import { getConfigDir } from "./config.js";

const REGISTRY_URL = "https://codevator.dev/sounds.json";
const FETCH_TIMEOUT_MS = 15_000;

function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

function isValidManifest(m: unknown): m is SoundManifest {
  return (
    typeof m === "object" &&
    m !== null &&
    typeof (m as SoundManifest).baseUrl === "string" &&
    (m as SoundManifest).baseUrl.length > 0 &&
    Array.isArray((m as SoundManifest).sounds)
  );
}

export interface SoundEntry {
  name: string;
  files?: number;
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
    const res = await fetchWithTimeout(REGISTRY_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw: unknown = await res.json();
    if (!isValidManifest(raw)) throw new Error("Invalid manifest format");
    const manifest = raw;
    // Cache locally
    const dir = getConfigDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(getManifestCache(), JSON.stringify(manifest, null, 2));
    return manifest;
  } catch {
    // Fallback to cached version
    try {
      const cached: unknown = JSON.parse(fs.readFileSync(getManifestCache(), "utf-8"));
      if (!isValidManifest(cached)) throw new Error("Invalid cached manifest");
      return cached;
    } catch {
      throw new Error("Could not fetch sound registry and no local cache found");
    }
  }
}

export function getCachedManifest(): SoundManifest | null {
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(getManifestCache(), "utf-8"));
    return isValidManifest(raw) ? raw : null;
  } catch {
    return null;
  }
}

async function downloadFile(baseUrl: string, filename: string, soundsDir: string): Promise<string> {
  const dest = path.join(soundsDir, `${filename}.mp3`);
  if (!dest.startsWith(soundsDir + path.sep)) throw new Error("Invalid sound name");
  if (fs.existsSync(dest)) return dest;
  const url = `${baseUrl}/${filename}.mp3`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Failed to download: HTTP ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

export async function downloadSound(name: string, manifest?: SoundManifest): Promise<string> {
  const m = manifest ?? await fetchManifest();
  const entry = m.sounds.find((s) => s.name === name);
  if (!entry) throw new Error(`Sound '${name}' not found in registry`);

  const soundsDir = getSoundsDir();
  fs.mkdirSync(soundsDir, { recursive: true });

  // Download primary
  const dest = await downloadFile(m.baseUrl, name, soundsDir);

  // Download variants in parallel (non-fatal)
  const fileCount = entry.files ?? 1;
  if (fileCount > 1) {
    await Promise.all(
      Array.from({ length: fileCount - 1 }, (_, i) =>
        downloadFile(m.baseUrl, `${name}-${i + 2}`, soundsDir).catch(() => {})
      )
    );
  }

  return dest;
}

export function isInstalled(name: string): boolean {
  const soundsDir = getSoundsDir();
  const filePath = path.join(soundsDir, `${name}.mp3`);
  if (!filePath.startsWith(soundsDir + path.sep)) return false;
  return fs.existsSync(filePath);
}

const SOUND_EXTENSIONS = [".mp3", ".wav", ".ogg", ".m4a"];

export function listInstalled(): string[] {
  const dir = getSoundsDir();
  try {
    const names = new Set<string>();
    for (const f of fs.readdirSync(dir)) {
      const ext = path.extname(f);
      if (!SOUND_EXTENSIONS.includes(ext)) continue;
      const base = f.slice(0, -ext.length);
      // Skip numbered variants (e.g., mode-2.mp3)
      if (/^.+-\d+$/.test(base)) continue;
      names.add(base);
    }
    return [...names];
  } catch {
    return [];
  }
}
