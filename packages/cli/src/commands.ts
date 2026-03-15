import { getConfig, setConfig, MODES, type CodevatorConfig, type SoundProfile } from "./config.js";
import { isValidMode } from "./config.js";
import { runDoctor } from "./doctor.js";
import { importSound, removeSound } from "./import.js";
import { play, stop, sessionEnd, shutdown, isPlaying, getSoundFile, getSoundFiles, isSpotifyRunning, detectPlayer } from "./player.js";
import { fetchManifest, downloadSound, isInstalled, listInstalled, getCachedManifest, groupByCategory, pickRandom, CATEGORY_ORDER, CATEGORY_LABELS, type SoundEntry } from "./registry.js";
import { setupHooks, removeHooks } from "./setup.js";
import { getAdapter, listAdapters } from "./agents/index.js";
import { getStats, formatDuration, computeStreaks, checkMilestone } from "./stats.js";

const GITHUB_URL = "https://github.com/educlopez/codevator";
import { installMenubar, uninstallMenubar } from "./menubar.js";
import { intro, outro, success, warn, p, pc, volumeBar } from "./ui.js";

const VALID_COMMANDS = [
  "setup", "mode", "add", "on", "off", "volume", "status",
  "play", "stop", "session-end", "uninstall", "help",
  "doctor", "list", "preview", "stats",
  "import", "remove", "profile",
  "install-menubar", "uninstall-menubar",
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

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function getFlagValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

export async function run(command: Command, args: string[]): Promise<void> {
  switch (command) {
    case "setup":
      return runSetup(args);
    case "mode":
      return runMode(args[0]?.startsWith("--") ? undefined : args[0], args);
    case "add":
      return runAdd(args[0]?.startsWith("--") ? undefined : args[0], args);
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
      return runList(args);
    case "preview":
      return runPreview(args[0]);
    case "stats":
      return runStatsCommand();
    case "import":
      return runImport(args);
    case "remove":
      return runRemove(args[0]);
    case "profile":
      return runProfile(args);
    case "install-menubar":
      return runInstallMenubar();
    case "uninstall-menubar":
      return runUninstallMenubar();
    case "help":
      return runHelp();
  }
}

async function runSetup(args: string[] = []): Promise<void> {
  const agentIdx = args.indexOf("--agent");
  const agentName = agentIdx !== -1 ? args[agentIdx + 1] : undefined;

  intro();
  const s = p.spinner();

  if (agentName) {
    const adapter = getAdapter(agentName);
    if (!adapter) {
      s.stop("");
      warn(`Unknown agent "${agentName}". Available agents: ${listAdapters().join(", ")}`);
      return;
    }
    s.start(`Configuring hooks for ${agentName}`);
    adapter.setupHooks();
    setConfig({ agent: agentName });
    s.stop(`Hooks configured for ${agentName}`);
  } else {
    s.start("Configuring hooks");
    setupHooks();
    s.stop("Hooks configured in ~/.claude/settings.json");
  }

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

  p.log.step(`Tip: Run ${pc.cyan("npx codevator mode")} to explore sound modes`);
  p.log.step(`Tip: Run ${pc.cyan("npx codevator stats")} to see your listening history`);
  p.log.step(`Tip: Run ${pc.cyan("npx codevator add")} to download community sounds`);

  outro("Installed! Default mode: elevator");
}

async function runMode(mode: string | undefined, args: string[] = []): Promise<void> {
  const isRandom = hasFlag(args, "--random");
  const categoryFilter = getFlagValue(args, "--category");

  // Handle --random with explicit mode name (error)
  if (isRandom && mode) {
    warn(`Cannot use --random with an explicit mode name. Using "${mode}" directly.`);
    // Fall through to direct mode set (explicit name takes precedence)
  }

  // Handle --random mode
  if (isRandom && !mode) {
    const manifest = getCachedManifest();
    const installed = listInstalled();
    const allModes = [...new Set([...MODES.filter(m => m !== "spotify"), ...installed])];

    if (allModes.length === 0) {
      warn("No sounds available for random selection. Run " + pc.cyan("npx codevator add") + " to download sounds.");
      return;
    }

    // Build SoundEntry-like objects for built-in modes that aren't in manifest
    let candidates: SoundEntry[] = allModes.map((name) => {
      const entry = manifest?.sounds.find((s) => s.name === name);
      return entry ?? { name, description: "", category: "focus", color: "#999" };
    });

    // Filter by category if specified
    if (categoryFilter) {
      candidates = candidates.filter((s) => s.category === categoryFilter);
      if (candidates.length === 0) {
        warn(`No installed sounds in category "${categoryFilter}". Available categories: ${CATEGORY_ORDER.filter(c => c !== "integration").join(", ")}`);
        return;
      }
    }

    const config = getConfig();
    const picked = pickRandom(candidates, config.lastRandom);
    setConfig({ mode: picked.name, lastRandom: picked.name });
    await play();
    outro(`Random mode: ${pc.cyan(picked.name)}`);
    return;
  }

  if (!mode) {
    intro();

    // Build options from installed sounds + built-in modes
    const installed = listInstalled();
    const allModes = [...new Set([...MODES, ...installed])];
    const manifest = getCachedManifest();

    // Decide: two-step category picker or flat list
    if (allModes.length > 8 && manifest) {
      // Build SoundEntry list for all available modes
      const soundEntries: SoundEntry[] = allModes.map((name) => {
        const entry = manifest.sounds.find((s) => s.name === name);
        return entry ?? { name, description: "", category: "focus", color: "#999" };
      });

      const grouped = groupByCategory(soundEntries);

      // Step 1: Select category
      const categoryOptions = [...grouped.entries()].map(([cat, entries]) => ({
        value: cat,
        label: CATEGORY_LABELS[cat] ?? cat,
        hint: `${entries.length} sound${entries.length !== 1 ? "s" : ""}`,
      }));

      const selectedCategory = await p.select({
        message: "Select a category",
        options: categoryOptions,
      });

      if (p.isCancel(selectedCategory)) {
        p.cancel("Cancelled.");
        return;
      }

      // Step 2: Select sound within category
      const soundsInCategory = grouped.get(selectedCategory) ?? [];
      const soundOptions = soundsInCategory.map((s) => ({
        value: s.name,
        label: s.name,
        hint: s.name === "spotify"
          ? "controls Spotify volume"
          : isInstalled(s.name)
            ? "installed"
            : (MODES as readonly string[]).includes(s.name)
              ? "built-in"
              : "not installed",
      }));

      const selectedSound = await p.select({
        message: `Select a sound from ${CATEGORY_LABELS[selectedCategory] ?? selectedCategory}`,
        options: soundOptions,
      });

      if (p.isCancel(selectedSound)) {
        p.cancel("Cancelled.");
        return;
      }

      mode = selectedSound;

      // Warn if not installed
      if (!isValidMode(mode)) {
        warn(`Sound '${mode}' is not installed. Run ${pc.cyan(`npx codevator add ${mode}`)} to download it first.`);
        return;
      }
    } else {
      // Flat list fallback (<=8 sounds or no manifest)
      const selected = await p.select({
        message: "Select a sound mode",
        options: allModes.map((m) => {
          const entry = manifest?.sounds.find((s) => s.name === m);
          const categoryHint = entry ? ` [${CATEGORY_LABELS[entry.category] ?? entry.category}]` : "";
          return {
            value: m,
            label: m,
            hint: m === "spotify"
              ? "controls Spotify volume"
              : ((MODES as readonly string[]).includes(m) ? "built-in" : "downloaded") + categoryHint,
          };
        }),
      });

      if (p.isCancel(selected)) {
        p.cancel("Cancelled.");
        return;
      }

      mode = selected;
    }
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

async function runAdd(name: string | undefined, args: string[] = []): Promise<void> {
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
    const categoryFilter = getFlagValue(args, "--category");

    let soundsToShow = manifest.sounds.filter((s: SoundEntry) => s.category !== "integration");

    // Filter by category if specified
    if (categoryFilter) {
      const validCategories = CATEGORY_ORDER.filter(c => c !== "integration");
      if (!validCategories.includes(categoryFilter as typeof validCategories[number])) {
        warn(`Unknown category "${categoryFilter}". Available categories: ${validCategories.join(", ")}`);
        return;
      }
      soundsToShow = soundsToShow.filter((s: SoundEntry) => s.category === categoryFilter);
    }

    const grouped = groupByCategory(soundsToShow);

    // Build flat options grouped by category headers
    const options: { value: string; label: string; hint?: string }[] = [];
    for (const [cat, entries] of grouped) {
      // Add category separator as a disabled-looking label
      options.push({ value: `__cat_${cat}`, label: `── ${CATEGORY_LABELS[cat] ?? cat} ──`, hint: "" });
      for (const entry of entries) {
        options.push({
          value: entry.name,
          label: `  ${entry.name}`,
          hint: isInstalled(entry.name) ? "installed" : entry.description,
        });
      }
    }

    // Filter out category separators from being selectable by using a simple select
    // Since @clack/prompts doesn't support disabled options, we just use the flat list
    const flatOptions = soundsToShow.map((entry: SoundEntry) => ({
      value: entry.name,
      label: entry.name,
      hint: isInstalled(entry.name)
        ? `installed [${CATEGORY_LABELS[entry.category] ?? entry.category}]`
        : `${entry.description} [${CATEGORY_LABELS[entry.category] ?? entry.category}]`,
    }));

    const selected = await p.select({
      message: categoryFilter
        ? `Select a sound to download (${CATEGORY_LABELS[categoryFilter] ?? categoryFilter})`
        : "Select a sound to download",
      options: flatOptions,
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
  const agent = config.agent ?? "claude";
  const stats = getStats();
  intro();
  p.note(
    [
      `Agent    ${pc.cyan(agent)}`,
      `Mode     ${pc.cyan(config.mode)}`,
      `Volume   ${volumeBar(config.volume)} ${config.volume}%`,
      `Enabled  ${config.enabled ? pc.green("yes") : pc.red("no")}`,
      `Playing  ${playing ? pc.green("yes") : pc.dim("no")}`,
      "",
      `Played ${pc.cyan(formatDuration(stats.totalPlayTimeMs))} across ${pc.cyan(String(stats.totalSessions))} sessions`,
      "",
      pc.dim(GITHUB_URL),
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

  // Check if a specific agent was configured
  const config = getConfig();
  if (config.agent) {
    const adapter = getAdapter(config.agent);
    if (adapter) {
      adapter.removeHooks();
      s.stop(`Hooks removed for ${config.agent}`);
    } else {
      removeHooks();
      s.stop("Hooks removed");
    }
  } else {
    removeHooks();
    s.stop("Hooks removed from ~/.claude/settings.json");
  }

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

export async function runList(args: string[] = []): Promise<void> {
  intro();

  const installed = listInstalled();
  const manifest = getCachedManifest();
  const config = getConfig();
  const categoryFilter = getFlagValue(args, "--category");

  // Validate category filter
  if (categoryFilter) {
    const validCategories = [...CATEGORY_ORDER];
    if (!validCategories.includes(categoryFilter as typeof validCategories[number])) {
      warn(`Unknown category "${categoryFilter}". Available categories: ${CATEGORY_ORDER.join(", ")}`);
      return;
    }
  }

  // Build a unified list of all sounds with status
  interface SoundRow {
    name: string;
    category: string;
    description: string;
    status: "installed" | "bundled" | "available";
    active: boolean;
    fileCount: number;
    isSpotify: boolean;
  }

  const allSounds: SoundRow[] = [];
  const seen = new Set<string>();

  // Installed sounds
  for (const name of installed) {
    seen.add(name);
    const entry = manifest?.sounds.find((s) => s.name === name);
    const files = getSoundFiles(name);
    allSounds.push({
      name,
      category: entry?.category ?? "focus",
      description: entry?.description ?? "",
      status: "installed",
      active: name === config.mode,
      fileCount: files.length,
      isSpotify: false,
    });
  }

  // Built-in modes not in installed list
  for (const mode of MODES) {
    if (seen.has(mode)) continue;
    seen.add(mode);
    const entry = manifest?.sounds.find((s) => s.name === mode);
    if (mode === "spotify") {
      allSounds.push({
        name: "spotify",
        category: "integration",
        description: "controls Spotify volume",
        status: "bundled",
        active: config.mode === "spotify",
        fileCount: 0,
        isSpotify: true,
      });
    } else {
      const files = getSoundFiles(mode);
      if (files.length > 0) {
        allSounds.push({
          name: mode,
          category: entry?.category ?? "focus",
          description: entry?.description ?? "",
          status: "bundled",
          active: mode === config.mode,
          fileCount: files.length,
          isSpotify: false,
        });
      }
    }
  }

  // Available from manifest but not installed
  if (manifest) {
    for (const entry of manifest.sounds) {
      if (seen.has(entry.name)) continue;
      seen.add(entry.name);
      allSounds.push({
        name: entry.name,
        category: entry.category,
        description: entry.description,
        status: "available",
        active: false,
        fileCount: 0,
        isSpotify: false,
      });
    }
  }

  // Filter by category if specified
  const filtered = categoryFilter
    ? allSounds.filter((s) => s.category === categoryFilter)
    : allSounds;

  // Group by category
  const grouped = new Map<string, SoundRow[]>();
  for (const sound of filtered) {
    if (!grouped.has(sound.category)) grouped.set(sound.category, []);
    grouped.get(sound.category)!.push(sound);
  }

  // Build output in category order
  const rows: string[] = [];
  const knownCategories = new Set<string>(CATEGORY_ORDER);

  for (const cat of CATEGORY_ORDER) {
    const entries = grouped.get(cat);
    if (!entries || entries.length === 0) continue;
    const label = CATEGORY_LABELS[cat] ?? cat;
    rows.push(`  ${pc.cyan(label)}`);
    for (const s of entries) {
      const active = s.active ? pc.green(" (active)") : "";
      if (s.isSpotify) {
        rows.push(`    ${pc.cyan(s.name)}  ${pc.dim(s.description)}  built-in${active}`);
      } else if (s.status === "installed") {
        rows.push(`    ${pc.cyan(s.name)}  ${pc.dim(`${s.fileCount} file(s)`)}  installed${active}`);
      } else if (s.status === "bundled") {
        rows.push(`    ${pc.cyan(s.name)}  ${pc.dim(`${s.fileCount} file(s)`)}  bundled${active}`);
      } else {
        rows.push(`    ${pc.dim(s.name)}  ${pc.dim(s.description)}  ${pc.dim("available")}`);
      }
    }
  }

  // Unknown categories
  for (const [cat, entries] of grouped) {
    if (knownCategories.has(cat)) continue;
    rows.push(`  ${pc.cyan(cat)}`);
    for (const s of entries) {
      const active = s.active ? pc.green(" (active)") : "";
      rows.push(`    ${pc.dim(s.name)}  ${pc.dim(s.description)}  ${pc.dim(s.status)}${active}`);
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

  const streaks = computeStreaks(stats.activeDays);
  const dayLabel = (n: number) => n === 1 ? "day" : "days";

  const lines = [
    `Total plays      ${pc.cyan(String(stats.totalPlays))}`,
    `Total sessions   ${pc.cyan(String(stats.totalSessions))}`,
    `Total play time  ${pc.cyan(formatDuration(stats.totalPlayTimeMs))}`,
    `Favorite mode    ${favoriteMode ? `${pc.cyan(favoriteMode[0])} (${favoriteMode[1]} plays)` : pc.dim("none yet")}`,
    `Current streak   ${pc.cyan(String(streaks.current))} ${dayLabel(streaks.current)}`,
    `Longest streak   ${pc.cyan(String(streaks.longest))} ${dayLabel(streaks.longest)}`,
    `Last played      ${stats.lastPlayed ? pc.cyan(stats.lastPlayed) : pc.dim("never")}`,
  ];

  const milestone = checkMilestone(stats.totalPlays);
  if (milestone !== null) {
    if (milestone >= 50) {
      lines.push("", `🎉 ${milestone} plays! If you're enjoying codevator, a ⭐ on GitHub helps a lot: ${GITHUB_URL}`);
    } else {
      lines.push("", `🎉 ${milestone} plays! You're getting into the groove.`);
    }
  }

  p.note(lines.join("\n"), "Stats");
  p.outro("");
}

async function runImport(args: string[]): Promise<void> {
  const filePath = args[0];
  if (!filePath) {
    warn("Usage: npx codevator import <file> [--name <name>] [--force]");
    return;
  }

  const nameIdx = args.indexOf("--name");
  const name = nameIdx !== -1 ? args[nameIdx + 1] : undefined;
  const force = args.includes("--force");

  try {
    const soundName = await importSound(filePath, { name, force });
    success(`Imported sound "${pc.cyan(soundName)}"`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Import failed";

    // If duplicate detected and --force not used, prompt the user
    if (msg.includes("already exists") && !force) {
      const overwrite = await p.confirm({
        message: "Sound already exists. Overwrite?",
      });

      if (p.isCancel(overwrite) || !overwrite) {
        warn("Import cancelled.");
        return;
      }

      // Retry with force
      try {
        const soundName = await importSound(filePath, { name, force: true });
        success(`Imported sound "${pc.cyan(soundName)}"`);
      } catch (retryErr) {
        warn(retryErr instanceof Error ? retryErr.message : "Import failed");
      }
      return;
    }

    warn(msg);
  }
}

function runRemove(name: string | undefined): void {
  if (!name) {
    warn("Usage: npx codevator remove <name>");
    return;
  }

  try {
    removeSound(name);
    success(`Removed sound "${pc.cyan(name)}"`);
  } catch (err) {
    warn(err instanceof Error ? err.message : "Remove failed");
  }
}

async function runProfile(args: string[]): Promise<void> {
  const subcommand = args[0];

  if (!subcommand) {
    warn("Usage: npx codevator profile <create|use|list|delete> [options]");
    return;
  }

  switch (subcommand) {
    case "create":
      return runProfileCreate(args.slice(1));
    case "use":
      return runProfileUse(args[1]);
    case "list":
      return runProfileList();
    case "delete":
      return runProfileDelete(args[1]);
    default:
      warn(`Unknown profile subcommand: ${subcommand}. Use create, use, list, or delete.`);
  }
}

async function runProfileCreate(args: string[]): Promise<void> {
  const name = args[0];
  if (!name) {
    warn("Usage: npx codevator profile create <name> --mode <mode> [--volume <vol>]");
    return;
  }

  const modeIdx = args.indexOf("--mode");
  const mode = modeIdx !== -1 ? args[modeIdx + 1] : undefined;
  if (!mode) {
    warn("Profile requires --mode. Usage: npx codevator profile create <name> --mode <mode>");
    return;
  }

  if (!isValidMode(mode)) {
    warn(`Sound '${mode}' not found. Run ${pc.cyan("npx codevator add")} to download sounds.`);
    return;
  }

  const volIdx = args.indexOf("--volume");
  const volStr = volIdx !== -1 ? args[volIdx + 1] : undefined;
  const volume = volStr !== undefined ? parseInt(volStr, 10) : 70;

  if (isNaN(volume) || volume < 0 || volume > 100) {
    warn("Volume must be between 0 and 100.");
    return;
  }

  const config = getConfig();
  const profiles = config.profiles ?? {};
  profiles[name] = { mode, volume };
  setConfig({ profiles });
  success(`Created profile "${pc.cyan(name)}" (mode: ${mode}, volume: ${volume}%)`);
}

async function runProfileUse(name: string | undefined): Promise<void> {
  if (!name) {
    warn("Usage: npx codevator profile use <name>");
    return;
  }

  const config = getConfig();
  const profiles = config.profiles ?? {};
  const profile = profiles[name];

  if (!profile) {
    warn(`Profile "${name}" not found. Run ${pc.cyan("npx codevator profile list")} to see available profiles.`);
    return;
  }

  setConfig({ mode: profile.mode, volume: profile.volume, activeProfile: name });
  await play();
  outro(`Switched to profile "${pc.cyan(name)}" (mode: ${profile.mode}, volume: ${profile.volume}%)`);
}

function runProfileList(): void {
  const config = getConfig();
  const profiles = config.profiles ?? {};
  const names = Object.keys(profiles);

  if (names.length === 0) {
    warn("No profiles configured. Use npx codevator profile create <name> --mode <mode> to create one.");
    return;
  }

  intro();
  const rows = names.map((name) => {
    const prof = profiles[name];
    const active = name === config.activeProfile ? pc.green(" (active)") : "";
    return `  ${pc.cyan(name)}  mode: ${prof.mode}  volume: ${prof.volume}%${active}`;
  });

  p.note(rows.join("\n"), "Profiles");
  p.outro("");
}

function runProfileDelete(name: string | undefined): void {
  if (!name) {
    warn("Usage: npx codevator profile delete <name>");
    return;
  }

  const config = getConfig();
  const profiles = config.profiles ?? {};

  if (!profiles[name]) {
    warn(`Profile "${name}" not found.`);
    return;
  }

  delete profiles[name];
  const updates: Partial<CodevatorConfig> = { profiles };
  if (config.activeProfile === name) {
    updates.activeProfile = undefined;
  }
  setConfig(updates);
  success(`Deleted profile "${pc.cyan(name)}"`);
}

async function runInstallMenubar(): Promise<void> {
  if (process.platform !== "darwin") {
    warn("Menu bar app is only available on macOS.");
    return;
  }

  intro();
  const s = p.spinner();
  s.start("Building menu bar app (this may take a minute)");

  const result = await installMenubar();

  if (result.success) {
    s.stop("Menu bar app installed");
    success(result.message);
    p.log.step(pc.dim("The app will launch automatically when you start a coding session."));
    p.log.step(pc.dim(`To remove it: ${pc.cyan("npx codevator uninstall-menubar")}`));
  } else {
    s.stop("Installation failed");
    warn(result.message);
  }
}

function runUninstallMenubar(): void {
  intro();
  const result = uninstallMenubar();
  if (result.success) {
    success(result.message);
  } else {
    warn(result.message);
  }
}

function runHelp(): void {
  intro();
  p.note(
    [
      `Usage: ${pc.cyan("npx codevator")} <command>`,
      "",
      "Commands:",
      `  ${pc.cyan("npx codevator")}              Install hooks (default, Claude Code)`,
      `  ${pc.cyan("npx codevator setup --agent")} <name>  Install hooks for a specific agent`,
      `  ${pc.cyan("npx codevator mode")} <name>  Set sound mode`,
      `  ${pc.cyan("npx codevator mode --random")}  Pick a random installed sound`,
      `  ${pc.cyan("npx codevator mode --random --category")} <cat>  Random from category`,
      `  ${pc.cyan("npx codevator add")} [name]   Download a sound from the registry`,
      `  ${pc.cyan("npx codevator add --category")} <cat>  Browse sounds by category`,
      `  ${pc.cyan("npx codevator on")} / ${pc.cyan("off")}     Enable or disable sounds`,
      `  ${pc.cyan("npx codevator volume")} <n>   Set volume (0-100)`,
      `  ${pc.cyan("npx codevator status")}       Show current settings`,
      `  ${pc.cyan("npx codevator doctor")}       Check installation health`,
      `  ${pc.cyan("npx codevator list")}         List available sounds`,
      `  ${pc.cyan("npx codevator list --category")} <cat>  List sounds by category`,
      `  ${pc.cyan("npx codevator preview")} <m>  Preview a sound for 5 seconds`,
      `  ${pc.cyan("npx codevator stats")}        Show usage statistics`,
      `  ${pc.cyan("npx codevator import")} <file> Import a custom sound file`,
      `  ${pc.cyan("npx codevator remove")} <name> Remove a custom sound`,
      `  ${pc.cyan("npx codevator profile")} ...   Manage sound profiles`,
      `  ${pc.cyan("npx codevator install-menubar")}  Install macOS menu bar app`,
      `  ${pc.cyan("npx codevator uninstall-menubar")} Remove menu bar app`,
      `  ${pc.cyan("npx codevator uninstall")}    Remove hooks`,
      "",
      `  ${pc.dim(`Agents: ${listAdapters().join(", ")}`)}`,
      `  ${pc.dim(`Modes: ${MODES.join(", ")}`)}`,
      `  ${pc.dim("spotify mode controls your Spotify volume (macOS only)")}`,
      "",
      `  ${pc.dim(`GitHub: ${GITHUB_URL}`)}`,
      `  ${pc.dim(`Issues: ${GITHUB_URL}/issues`)}`,
    ].join("\n"),
    "Elevator music for your AI coding agent"
  );
  outro(`Quick start: ${pc.cyan("npx codevator")}`);
}
