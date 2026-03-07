# codevator

Elevator music for your AI coding agent. Background sounds that play while your agent works and stop when it needs your attention.

## Quick Start

```bash
npx codevator
```

This installs hooks into your AI coding agent that automatically:

- **Play** music when the agent starts working
- **Stop** when it finishes or needs your input

## Sound Modes

Six built-in modes:

| Mode | Description |
|------|-------------|
| `elevator` | Classic smooth jazz elevator music (default) |
| `typewriter` | Rhythmic mechanical keystrokes |
| `ambient` | Soft atmospheric background |
| `retro` | Mellow 8-bit synthesized arpeggios |
| `minimal` | Deep warm hum with slow breathing |
| `spotify` | Controls your Spotify volume (macOS only) |

Switch modes:

```bash
npx codevator mode ambient
```

### Spotify Mode

Instead of playing bundled sounds, `spotify` mode controls the volume of your running Spotify desktop app — fading your music up when Claude is working and back down when it's idle.

```bash
npx codevator mode spotify
```

**Requirements:** macOS only. Requires the Spotify desktop app (not the web player) to be running with music already playing. Codevator saves your current Spotify volume on activation and restores it on exit. The `volume` setting is ignored in this mode — it uses your own Spotify volume as the target.

## Custom Sounds

Import your own audio files (mp3, wav, ogg, m4a):

```bash
npx codevator import ./my-sound.mp3 --name chill
npx codevator mode chill
```

Remove a custom sound:

```bash
npx codevator remove chill
```

Preview any mode for 5 seconds without switching:

```bash
npx codevator preview retro
```

List all available sounds (built-in + custom + registry):

```bash
npx codevator list
```

## Sound Profiles

Save your favorite configurations as named presets:

```bash
npx codevator profile create deep-work --mode retro --volume 80
npx codevator profile create chill-vibes --mode ambient --volume 40
```

Switch instantly between presets:

```bash
npx codevator profile use deep-work
```

Manage profiles:

```bash
npx codevator profile list
npx codevator profile delete deep-work
```

## Multi-Agent Support

Codevator works with multiple AI coding agents:

| Agent | Setup |
|-------|-------|
| **Claude Code** | `npx codevator` (default) |
| **OpenAI Codex CLI** | `npx codevator setup --agent codex` |
| **OpenCode** | `npx codevator setup --agent opencode` |

Each agent adapter configures the appropriate hooks for that agent's lifecycle events.

## Commands

```
npx codevator                          Install hooks (Claude Code by default)
npx codevator setup --agent <name>     Install hooks for a specific agent
npx codevator mode <name>              Set sound mode
npx codevator on / off                 Enable or disable sounds
npx codevator volume <n>               Set volume (0-100)
npx codevator status                   Show current settings and active agent
npx codevator doctor                   Diagnose hooks, audio, config, and sounds
npx codevator stats                    Show session count, play time, favorite mode
npx codevator list                     List all available sounds
npx codevator preview <mode>           Preview a sound for 5 seconds
npx codevator import <file> --name <n> Import a custom sound file
npx codevator remove <name>            Remove a custom sound
npx codevator profile create <name>    Create a sound profile
npx codevator profile use <name>       Apply a sound profile
npx codevator profile list             List all profiles
npx codevator profile delete <name>    Delete a profile
npx codevator uninstall                Remove hooks from agent
```

## Troubleshooting

Run the built-in diagnostics:

```bash
npx codevator doctor
```

This checks hooks installation, audio player availability, sound files, config validity, and daemon status.

## How It Works

Codevator registers hooks in your AI agent's configuration:

- **PreToolUse** — starts playback when the agent begins working
- **Stop** — stops playback when the session ends
- **Notification** — stops on permission prompts and idle states

Music plays through your system's native audio player (`afplay` on macOS, `paplay`/`aplay` on Linux).

Config is stored at `~/.codevator/config.json`. Custom sounds go in `~/.codevator/sounds/`.

## Claude Code Skill

Setup also installs a Claude Code skill that lets the agent control music directly. Ask Claude to "change the music to retro" or "turn off the elevator music" and it will run the right command.

## Uninstall

```bash
npx codevator uninstall
```

## License

MIT
