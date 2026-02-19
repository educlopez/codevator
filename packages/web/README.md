# codevator web

Promotional website for [codevator](https://www.npmjs.com/package/codevator) — elevator music for your AI coding agent.

## Stack

- Next.js 16
- Tailwind CSS 4
- GSAP (door animations)
- Web Audio API (real-time audio visualizer)
- Framer Motion

## Development

```bash
# from repo root
pnpm dev:web

# or from this directory
pnpm dev
```

Opens at `http://localhost:3000`.

## Build

```bash
pnpm build
```

## Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main page
│   └── globals.css         # Tailwind + custom styles
├── components/
│   ├── ElevatorDoors.tsx    # Hero: interactive door animation
│   ├── ElevatorShell.tsx    # Content wrapper
│   ├── AudioVisualizer.tsx  # Real-time frequency bar visualizer
│   ├── CopyCommand.tsx      # Click-to-copy install command
│   ├── TerminalSimulation.tsx
│   └── floors/
│       ├── Floor1Welcome.tsx      # Intro + terminal demo
│       ├── Floor2Modes.tsx        # Sound mode selector with live audio
│       ├── Floor3Install.tsx      # Installation steps
│       ├── Floor4Testimonials.tsx # Social proof
│       └── Floor5Rooftop.tsx      # CTA footer
├── lib/
│   └── audio.ts            # Web Audio engine (5 modes + analyser)
public/
└── sounds/                 # MP3 files for web playback
```

## Deployment

Deployed on Vercel. Set **Root Directory** to `packages/web` in project settings.
