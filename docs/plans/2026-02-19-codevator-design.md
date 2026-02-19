# Codevator — Design Document

> "Your AI is working. Enjoy the ride." 🛗

## Overview

**codevator** is an npm package that plays waiting sounds while Claude Code (or any AI coding agent) works. It hooks into Claude Code's event system to play audio when tools execute and stops when the agent finishes or asks for input.

The project includes a CLI tool, a Claude Code skill for conversational control, and an interactive promotional website with a scroll-driven elevator experience.

## Architecture

```
codevator/
├── packages/
│   ├── cli/                  # npm package (main)
│   │   ├── bin/              # CLI entry point
│   │   ├── src/
│   │   │   ├── setup.ts      # Auto-configure Claude Code hooks
│   │   │   ├── player.ts     # Audio playback (afplay/paplay)
│   │   │   ├── config.ts     # User config (~/.codevator/config.json)
│   │   │   └── hooks/        # Shell scripts for Claude Code hooks
│   │   ├── sounds/           # Audio files (.mp3, royalty-free)
│   │   └── skill/            # Claude Code skill file
│   └── web/                  # Next.js landing page
├── package.json              # Monorepo with workspaces
└── README.md
```

## Component 1: CLI

### Audio System

- **Tool-based activation**: Sounds play while Claude executes tools, stops on agent finish or user input request
- **OS detection**: macOS (`afplay`), Linux (`paplay`/`aplay`)
- **PID management**: Lockfile at `~/.codevator/player.pid` prevents duplicate playback
- **Background execution**: Audio runs in background process, killed cleanly on stop

### Sound Modes

| Mode | Description | Audio |
|------|-------------|-------|
| `elevator` | Classic elevator muzak | 30-60s bossa nova/easy listening loop |
| `typewriter` | Mechanical typewriter | Random keystrokes loop, carriage return ding on tool completion |
| `ambient` | Rain + lo-fi | Soft rain with ambient piano |
| `retro` | 8-bit chiptune | Chiptune "processing" melody |
| `minimal` | Subtle pulse | Soft tick-tock or electronic hum |

All audio files: `.mp3`, ~200-500KB each, royalty-free (CC0/public domain).

### CLI Commands

```bash
codevator setup              # Auto-configure hooks + install sounds
codevator mode <name>        # Switch mode: elevator|typewriter|ambient|retro|minimal
codevator on                 # Enable sounds
codevator off                # Disable sounds
codevator volume <0-100>     # Set volume level
codevator status             # Show current mode, volume, state
codevator uninstall          # Clean removal of hooks, sounds, config
```

### Hook Configuration

The `setup` command writes to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "codevator play",
            "async": true
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "codevator stop"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "permission_prompt|idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "codevator stop"
          }
        ]
      }
    ]
  }
}
```

### Config Storage

User preferences stored at `~/.codevator/config.json`:

```json
{
  "mode": "elevator",
  "volume": 70,
  "enabled": true
}
```

## Component 2: Claude Code Skill

Installed at `~/.claude/skills/codevator.md`:

```markdown
---
name: codevator
description: Control waiting sounds. Trigger on "music", "sound", "codevator",
  "elevator", "volume", "mute", or /codevator
---

You control codevator, a tool that plays sounds while you work.

Available commands (run via Bash):
- `codevator mode <name>` — Switch mode: elevator, typewriter, ambient, retro, minimal
- `codevator on` / `codevator off` — Toggle sounds
- `codevator volume <0-100>` — Set volume
- `codevator status` — Show current mode, volume, and state

When the user asks to change sounds, run the appropriate command and confirm.
```

## Component 3: Landing Page — codevator.dev

### Concept

The scroll IS the elevator. The user "rides up floors" as they scroll. Each section is a floor. Aesthetic inspired by Severance (Apple TV) — clean, corporate, retro-futuristic, unsettlingly organized.

### Scroll Experience

```
GROUND FLOOR (initial viewport)
├── Closed elevator doors, floor display: "B"
├── On scroll → doors open with animation
├── Elevator mode music starts playing (Web Audio API)
└── Sticky side panel: elevator floor indicator (B ● 1 2 3 4 5)

FLOOR 1 — "Welcome to Codevator Industries"
├── Corporate memo aesthetic (Lumon style)
├── "Your coding agent is working. Please enjoy the ride."
├── Minimalist terminal showing Claude executing tools
└── Text appears synchronized with scroll (parallax)

BETWEEN FLOORS — Transition
├── Elevator shaft visible, cables, floor numbers passing
├── Vertical movement parallax effect
└── Floor number changes on side panel

FLOOR 2 — "Select your floor experience"
├── 5 modes as physical elevator buttons
├── Click each → changes music AND visual theme:
│   ├── Elevator: Severance mint green
│   ├── Typewriter: Sepia 1960s office
│   ├── Ambient: Dark blue, rain on window
│   ├── Retro: Neon arcade purple
│   └── Minimal: Pure white, near-empty
├── Audio visualizer integrated into elevator wall
└── Side panel updates

FLOOR 3 — "Installation Protocol"
├── Corporate onboarding manual style (Severance handbook)
├── 3 steps as internal memos:
│   "STEP 1: Initialize your experience"
│   $ npx codevator setup
│   "STEP 2: Return to your work. Music will commence."
│   "STEP 3: Your outie will thank you."
└── Side panel updates

FLOOR 4 — "Employee Testimonials"
├── Fake corporate-cringe quotes:
│   "Since Codevator, my wait times feel 47% more productive"
│   — Mark S., Severed Floor Developer
├── Employee-of-the-month card style
└── Side panel updates

FLOOR 5 — Rooftop (final)
├── Doors open → exterior visible (sky, light)
├── Big CTA: "Exit the elevator. Install codevator."
├── npm install command with copy button
├── Links: GitHub, npm
├── Music stops. Silence.
└── "The music stops when the work is done."
```

### Tech Stack

- **Next.js 15** — App Router, SSG (`output: export`)
- **Tailwind CSS v4** — Styling
- **GSAP ScrollTrigger** — Scroll-driven animations, pinning, parallax
- **Web Audio API** — Sound playback in browser
- **Framer Motion** — Micro-interactions and transitions

### Visual Design

- **Fonts**: Playfair Display (headers), IBM Plex Mono (code)
- **Colors**: `#f0f4f0` background, `#0a3d2a` Lumon green, `#1a1a1a` text
- **Textures**: Subtle corporate wall textures, wood panels
- **Elevator buttons**: Round buttons with LED glow effect
- **Elevator doors**: CSS `clip-path` animated with scroll progress
- **Floor indicator**: `position: sticky` side panel, lights up current floor

## Execution Plan

### Phase 1 — CLI Core
- Package structure with TypeScript
- Audio player with OS detection and PID management
- 5 sound modes with royalty-free audio files
- All CLI commands (setup, mode, on, off, volume, status, uninstall)
- Auto-setup of Claude Code hooks in settings.json
- Testing on macOS

### Phase 2 — Skill
- Claude Code skill file
- Test conversational integration in real session

### Phase 3 — Web
- Next.js project with Tailwind + GSAP
- Scroll-driven elevator experience
- Interactive demo with Web Audio API
- All 5 modes playable in browser
- Deploy to Vercel

### Phase 4 — Polish & Launch
- README with GIFs/video
- Publish to npm
- Deploy web to codevator.dev domain
- Social media / Product Hunt post
