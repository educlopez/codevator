<div align="center">

# codevator

[![npm version](https://img.shields.io/npm/v/codevator.svg)](https://www.npmjs.com/package/codevator)
[![License: MIT](https://img.shields.io/badge/License-MIT-olive.svg)](LICENSE)

Background music for your AI coding agent.

Agent starts working → music plays. Agent stops → music stops. Simple as that.

[Website](https://codevator.dev) · [Docs](https://codevator.dev/docs) · [Sounds Gallery](https://codevator.dev/sounds) · [npm](https://www.npmjs.com/package/codevator) · [Issues](https://github.com/educlopez/codevator/issues)

![Codevator](.github/screenshot.png)

</div>

## Quick Start

```bash
npx codevator setup
```

That's it. Next time Claude Code starts working, you'll hear elevator music. 🎵

### Other agents?

```bash
npx codevator setup --agent <name>
```

Supported agents: `claude` (default), `codex`, `gemini`, `copilot`, `cursor`, `windsurf`, `opencode`

## Agent Skill

Install the codevator skill so any AI agent can control your music directly:

```bash
npx skills add educlopez/codevator
```

Works across Claude Code, Cursor, Windsurf, Gemini CLI, and more. The agent gets the ability to switch sounds, adjust volume, and toggle playback — hands-free.

## Sounds

15 built-in sounds in 3 categories, plus Spotify integration:

| Category | Sounds |
|----------|--------|
| **Focus & Ambient** | `elevator` (default), `typewriter`, `minimal`, `lofi-relax`, `lofi-chill`, `lofi-cozy` |
| **Nature** | `ambient`, `rain`, `forest`, `ocean` |
| **Music & Retro** | `retro`, `classical-piano`, `ambient-guitar`, `epic-strings` |
| **Integration** | `spotify` — plays from your Spotify account |

```bash
npx codevator mode lofi-chill
npx codevator mode --random           # random sound each session
npx codevator mode --category nature   # random from a category
```

**Custom sounds** — import your own audio files:

```bash
npx codevator add my-vibe ~/Music/chill-loop.mp3
```

## Commands

| Command | What it does |
|---------|-------------|
| `setup` | Install hooks for your agent |
| `mode <name>` | Set the sound mode |
| `on` / `off` | Enable or disable sounds |
| `volume <n>` | Set volume (0–100) |
| `list` | Show all available sounds |
| `add <name> <file>` | Import a custom sound |
| `preview <name>` | Preview a sound without installing |
| `stats` | Show your listening stats |
| `doctor` | Diagnose issues with your setup |
| `profile <name>` | Save/load mode + volume presets |
| `import <file>` | Import settings from a file |
| `install-menubar` | Install the macOS menu bar app |

## Profiles

Save your favorite setups as presets:

```bash
npx codevator profile save chill --mode lofi-relax --volume 40
npx codevator profile load chill
```

## macOS Menu Bar

Control codevator from your menu bar — no terminal needed:

```bash
npx codevator install-menubar
```

## Packages

| Package | Description |
|---------|-------------|
| [`packages/cli`](packages/cli) | CLI tool — [npm](https://www.npmjs.com/package/codevator) |
| [`packages/web`](packages/web) | Website — [codevator.dev](https://codevator.dev) |

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
