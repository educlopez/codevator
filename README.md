# codevator

Elevator music for your AI coding agent.

Background sounds that play while Claude Code works and stop when it needs your attention.

## Packages

| Package | Description |
|---------|-------------|
| [`packages/cli`](packages/cli) | CLI tool — [npm](https://www.npmjs.com/package/codevator) |
| [`packages/web`](packages/web) | Promotional website |

## Quick Start

```bash
npm install -g codevator
codevator setup
```

That's it. Next time Claude Code starts working, you'll hear elevator music.

## Development

```bash
pnpm install
pnpm dev:web    # Next.js dev server
pnpm dev:cli    # CLI watch mode
pnpm build      # Build all packages
```

## License

MIT
