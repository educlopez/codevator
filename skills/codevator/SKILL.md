---
name: codevator
description: Control codevator — background music and sounds for AI coding agents. Use when the user mentions music, sounds, elevator music, background audio, coding music, volume, mute, sound modes, lo-fi, nature sounds, ambient, retro, focus music, or /codevator. Also use when the user wants to set up codevator with a new agent, check playback stats, manage sound profiles, import custom sounds, or preview available sounds.
---

You control **codevator**, a CLI that plays background music while AI coding agents work. It hooks into agents so music starts/stops automatically with sessions.

## Quick Reference

All commands: `npx codevator <command>` (or `codevator` if globally installed).

### Playback

| Command | What it does |
|---------|-------------|
| `mode <name>` | Switch to a sound (e.g. `mode lofi-relax`) |
| `mode --random` | Pick a random installed sound |
| `mode --random --category <cat>` | Random within a category |
| `on` / `off` | Enable or disable sounds |
| `play` / `stop` | Start or stop playback |
| `volume <0-100>` | Set volume |
| `preview <name>` | Preview a sound for 5 seconds |

### Sound Management

| Command | What it does |
|---------|-------------|
| `list` | List all sounds grouped by category |
| `list --category <cat>` | List sounds in a category |
| `add [name]` | Download sounds from the registry |
| `add --category <cat>` | Browse and download by category |
| `import <file> --name <n>` | Import a custom audio file (mp3/wav/ogg/m4a) |
| `remove <name>` | Remove a custom sound |

### Setup & Diagnostics

| Command | What it does |
|---------|-------------|
| `setup` | Install hooks for Claude Code (default) |
| `setup --agent <name>` | Install hooks for a specific agent |
| `status` | Show current mode, volume, agent, mini-stats |
| `stats` | Full stats: plays, time, streaks, milestones |
| `doctor` | Diagnose issues (hooks, audio, config, sounds) |
| `uninstall` | Remove all hooks |

### Profiles

| Command | What it does |
|---------|-------------|
| `profile create <name>` | Save current mode + volume as a preset |
| `profile use <name>` | Switch to a saved profile |
| `profile list` | List all profiles |
| `profile delete <name>` | Delete a profile |

### macOS Menu Bar

| Command | What it does |
|---------|-------------|
| `install-menubar` | Install the macOS menu bar controller |
| `uninstall-menubar` | Remove menu bar app |

## Available Sounds

**Focus & Ambient**: elevator (default), typewriter, minimal, lofi-relax, lofi-chill, lofi-cozy

**Nature**: ambient, rain, forest, ocean

**Music & Retro**: retro, classical-piano, ambient-guitar, epic-strings

**Integration**: spotify (controls Spotify volume on macOS — not a sound file)

Categories for `--category` flag: `focus`, `nature`, `music`, `integration`

## Supported Agents

claude (default), codex, gemini, copilot, cursor, windsurf, opencode

Example: `npx codevator setup --agent gemini`

## Behavior

- When the user asks to change sounds/music/modes, run the command and confirm briefly
- When asked "what sounds are available", run `list` or describe from the table above
- For troubleshooting, suggest `doctor` first
- Spotify mode requires macOS and an active Spotify session
