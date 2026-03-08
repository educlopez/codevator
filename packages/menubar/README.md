# @codevator/menubar

A native macOS menu bar app for controlling [codevator](https://github.com/educlopez/codevator) without touching the terminal.

## Features

- **Toggle on/off** — enable or disable codevator with a single click
- **Mode picker** — switch between elevator, typewriter, ambient, retro, minimal, and spotify modes
- **Volume slider** — adjust playback volume live (0–100)
- **Preview** — hear the current mode for 5 seconds
- **Live sync** — the UI updates automatically when the CLI modifies config

## Requirements

- macOS 26+
- Xcode 26 command line tools
- [codevator](https://www.npmjs.com/package/codevator) installed and set up (`npx codevator`)

## Development

```bash
# From monorepo root
pnpm install
pnpm build:menubar   # compile the Swift app

# Run in dev mode
pnpm dev:menubar
```

## Package as a .app

```bash
pnpm pack:menubar
# Output: packages/menubar/release/Codevator.dmg
```

Drag `Codevator.app` to `/Applications`, then launch it. It will appear in your menu bar.

## How it works

The app reads and writes `~/.codevator/config.json` directly — the same file the CLI uses. A `fs.watch` listener keeps the UI in sync if you use the CLI alongside the app.

For preview, it shells out to `npx codevator preview <mode>`.

The app is implemented with `SwiftUI.MenuBarExtra` as a menu-bar-only utility. It hides its Dock presence at runtime and uses SF Symbols for the menu bar icon, including a slashed note when Codevator is disabled.
