<div align="center">

# codevator

[![npm version](https://img.shields.io/npm/v/codevator.svg)](https://www.npmjs.com/package/codevator)
[![License: MIT](https://img.shields.io/badge/License-MIT-olive.svg)](LICENSE)

Elevator music for your AI coding agent.

Background sounds that play while [Claude Code](https://docs.anthropic.com/en/docs/claude-code) works and stop when it needs your attention.

[Website](https://codevator.dev) · [npm](https://www.npmjs.com/package/codevator) · [Issues](https://github.com/educlopez/codevator/issues)

![Codevator](.github/screenshot.png)

</div>

## Quick Start

```bash
npx codevator
```

That's it. Next time Claude Code starts working, you'll hear elevator music.

## Sound Modes

Five built-in modes:

| Mode | Description |
|------|-------------|
| `elevator` | Classic smooth jazz elevator music (default) |
| `typewriter` | Rhythmic mechanical keystrokes |
| `ambient` | Soft atmospheric background |
| `retro` | Mellow 8-bit synthesized arpeggios |
| `minimal` | Deep warm hum with slow breathing |

```bash
npx codevator mode ambient
```

## Commands

```
npx codevator              Install hooks into Claude Code
npx codevator mode <name>  Set sound mode
npx codevator volume <n>   Set volume (0-100)
npx codevator on / off     Enable or disable sounds
npx codevator status       Show current settings
npx codevator uninstall    Remove hooks from Claude Code
```

## How It Works

Codevator registers hooks in Claude Code's settings (`~/.claude/settings.json`):

- **PreToolUse** — starts playback when the agent begins working
- **Stop** — stops playback when the session ends
- **Notification** — stops on permission prompts and idle states

Music plays through your system's native audio player (`afplay` on macOS, `paplay`/`aplay` on Linux). Config is stored at `~/.codevator/config.json`.

## Packages

| Package | Description |
|---------|-------------|
| [`packages/cli`](packages/cli) | CLI tool — [npm](https://www.npmjs.com/package/codevator) |
| [`packages/web`](packages/web) | Promotional website — [codevator.dev](https://codevator.dev) |

## Development

```bash
pnpm install
pnpm dev:web    # Next.js dev server
pnpm dev:cli    # CLI watch mode
pnpm build      # Build all packages
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

[MIT](LICENSE)
