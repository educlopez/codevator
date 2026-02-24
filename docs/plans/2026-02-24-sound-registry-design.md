# Sound Registry & Custom Sounds

**Date:** 2026-02-24
**Status:** In Progress
**Branch:** `feat/sound-registry`

## Summary

Add a sound registry system that lets users browse, preview, and install sounds from the web and CLI. Sounds are served from `codevator.dev/sounds/`, described by a central manifest (`sounds.json`), and cached locally in `~/.codevator/sounds/`.

The npm package drops from 14.6 MB to ~100 KB by bundling only `typewriter.mp3` as an offline fallback.

## Architecture

```
codevator.dev/sounds.json        ← manifest (source of truth)
codevator.dev/sounds/*.mp3       ← hosted files (web preview + CLI download)

~/.codevator/
  config.json                    ← { mode: "elevator", volume: 70, enabled: true }
  sounds/                        ← downloaded sounds
    elevator.mp3
    lofi.mp3

packages/cli/sounds/
  typewriter.mp3                 ← only bundled fallback
```

## Implementation Plan

### Step 1: Manifest & registry module (CLI)

Create `packages/web/public/sounds.json` with the 5 built-in sounds.

Create `packages/cli/src/registry.ts`:
- `fetchManifest()`: GET `codevator.dev/sounds.json`, cache to `~/.codevator/sounds.json`
- `downloadSound(name)`: download mp3 from `${baseUrl}/${name}.mp3` to `~/.codevator/sounds/`
- `listInstalled()`: scan `~/.codevator/sounds/*.mp3`
- `listAvailable()`: read cached manifest

Uses native `fetch()` (Node 20 target). No new dependencies.

### Step 2: Update player.ts

Change `getSoundFile()` resolution order:
1. `~/.codevator/sounds/{mode}.mp3`
2. `{packageDir}/sounds/{mode}.mp3` (bundled fallback)
3. Auto-download from registry (lazy migration)
4. Fallback to `typewriter.mp3` if download fails
5. Silence if nothing works (no crash)

### Step 3: Update config.ts

- Change `mode` type from union to `string`
- Add `isValidMode()`: check built-in list OR file exists in `~/.codevator/sounds/`
- Keep `MODES` array as a constant for the 5 originals (used by `mode` interactive selector as defaults)

### Step 4: Add `add` command (CLI)

`codevator add [name]`:
- With name: fetch manifest, validate, download, ask to set as active mode
- Without name: fetch manifest, show interactive list (mark installed), download selection

Update `VALID_COMMANDS` and `parseArgs` in commands.ts.

### Step 5: Update `setup` and `mode` commands

`setup`: after hook installation, download `elevator.mp3` to `~/.codevator/sounds/`.

`mode`:
- Accept any valid string (not just MODES union)
- Interactive selector shows installed sounds (built-in + downloaded)
- If selected mode not downloaded, download it first

### Step 6: Slim down npm package

- Remove `elevator.mp3`, `retro.mp3`, `ambient.mp3`, `minimal.mp3` from `packages/cli/sounds/`
- Keep only `typewriter.mp3`
- Update `package.json` files field: `["dist", "sounds/typewriter.mp3"]`

### Step 7: Web — `/sounds` page

Create `packages/web/src/app/sounds/page.tsx` (server component):
- Fetch and parse `public/sounds.json`
- Pass data to client component

Create `packages/web/src/app/sounds/content.tsx` (client component):
- Responsive grid of sound cards
- Each card: name, description, play/stop preview button, audio visualizer, copy-to-clipboard command (`npx codevator add <name>`)
- Reuse `AudioVisualizer` component and `lib/audio.ts` logic

Update `Header.tsx`: add "Sounds" link.

Adapt `lib/audio.ts`: accept any sound name, not just hardcoded modes.

### Step 8: Update Floor2Modes to use manifest

Read MODES from `sounds.json` instead of hardcoding in `Floor2Modes.tsx`. This keeps the home page in sync with the registry automatically.

### Step 9: Tests

- `registry.test.ts`: mock fetch, test manifest parsing, download logic
- Update `config.test.ts`: test `isValidMode()` with custom sounds
- Update `player.test.ts`: test new `getSoundFile()` resolution order
- Update `commands.test.ts`: test `add` command flow

## Not in scope

- SHA-256 integrity checks (add later if needed)
- Community-contributed sounds (future)
- Spotify integration (separate feature)
- Multi-agent mode (separate feature)
