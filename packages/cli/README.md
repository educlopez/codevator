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

Five built-in modes:

| Mode | Description |
|------|-------------|
| `elevator` | Classic smooth jazz elevator music (default) |
| `typewriter` | Rhythmic mechanical keystrokes |
| `ambient` | Soft atmospheric background |
| `retro` | Mellow 8-bit synthesized arpeggios |
| `minimal` | Deep warm hum with slow breathing |

Switch modes:

```bash
codevator mode ambient
```

## Commands

```
codevator setup            Install hooks into Claude Code
codevator mode <name>      Set sound mode
codevator on               Enable sounds
codevator off              Disable sounds
codevator volume <0-100>   Set volume level
codevator status           Show current settings
codevator uninstall        Remove hooks from Claude Code
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
