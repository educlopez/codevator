# codevator

Elevator music for your AI coding agent. Background sounds that play while Claude Code works and stop when it needs your attention.

## Quick Start

```bash
npx codevator
```

This installs hooks into Claude Code (`~/.claude/settings.json`) that automatically:

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

## Commands

```
npx codevator              Install hooks into Claude Code
npx codevator mode <name>  Set sound mode
npx codevator on / off     Enable or disable sounds
npx codevator volume <n>   Set volume (0-100)
npx codevator status       Show current settings
npx codevator uninstall    Remove hooks from Claude Code
```

## How It Works

Codevator registers hooks in Claude Code's settings:

- **PreToolUse** — starts playback when the agent begins working
- **Stop** — stops playback when the session ends
- **Notification** — stops on permission prompts and idle states

Music plays through your system's native audio player (`afplay` on macOS, `paplay`/`aplay` on Linux).

Config is stored at `~/.codevator/config.json`.

## Claude Code Skill

Setup also installs a Claude Code skill that lets the agent control music directly. Ask Claude to "change the music to retro" or "turn off the elevator music" and it will run the right command.

## Uninstall

```bash
npx codevator uninstall
```

## License

MIT
