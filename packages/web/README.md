# codevator web

![Codevator](public/og-image.jpg)

Promotional website for [codevator](https://www.npmjs.com/package/codevator) — elevator music for your AI coding agent.

**Live at [codevator.dev](https://codevator.dev)**

## Features

- Interactive elevator door intro with draggable post-it notes
- Live audio playback with real-time frequency visualizer
- 5 sound modes you can preview in the browser
- Click-to-copy `npx codevator` install command
- Severance / The Office-inspired design and copy

## Stack

- [Next.js 16](https://nextjs.org/) — App Router
- [Tailwind CSS 4](https://tailwindcss.com/)
- [GSAP](https://gsap.com/) — elevator door animations
- [Framer Motion](https://motion.dev/) — scroll & layout transitions
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — real-time audio engine & visualizer
- [Vercel Analytics](https://vercel.com/analytics)

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
│   ├── layout.tsx          # Root layout with fonts & metadata
│   ├── page.tsx            # Main page (lazy-loads floors)
│   ├── not-found.tsx       # Custom 404 page
│   └── globals.css         # Tailwind + custom styles
├── components/
│   ├── ElevatorDoors.tsx    # Hero: interactive door animation
│   ├── ElevatorShell.tsx    # Content wrapper
│   ├── Header.tsx           # Sticky nav (GitHub, npm, Follow me)
│   ├── AudioVisualizer.tsx  # Real-time frequency bar visualizer
│   ├── CopyCommand.tsx      # Click-to-copy install command
│   ├── TerminalSimulation.tsx
│   └── floors/
│       ├── Floor1Welcome.tsx      # Intro + terminal demo
│       ├── Floor2Modes.tsx        # Sound mode selector with live audio
│       ├── Floor3Install.tsx      # Three-step installation guide
│       ├── Floor4Testimonials.tsx # Fictional testimonials
│       └── Floor5Rooftop.tsx      # CTA footer
├── lib/
│   ├── audio.ts            # Web Audio engine (5 modes + analyser)
│   └── patterns.ts         # Noise texture patterns
public/
└── sounds/                 # MP3 files for web playback
```

## Deployment

Deployed on [Vercel](https://vercel.com). Set **Root Directory** to `packages/web` in project settings.
