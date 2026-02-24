"use client";

import { Header } from "@/components/Header";
import { Floor5Rooftop } from "@/components/floors/Floor5Rooftop";

const ITEMS = [
  {
    title: "Multi-agent mode",
    description:
      "Each agent plays a different instrument. The group of agents generates a final high-quality song together in real time.",
  },
  {
    title: "Spotify integration",
    description:
      "Connect your Spotify account and use your own playlists as a sound mode. Music starts and stops with your agent.",
  },
  {
    title: "Custom sounds",
    description:
      "Upload your own MP3 or WAV files as a custom sound mode. Use any audio you want while your agent works.",
  },
  {
    title: "More agents support",
    description:
      "Extend codevator beyond Claude Code. Support for Cursor, Windsurf, Codex, and OpenCode.",
  },
  {
    title: "Sound themes",
    description:
      "Downloadable theme packs — lofi, jazz, nature, coffee shop, and more. Curated sets of sounds for different vibes.",
  },
];

export function RoadmapContent() {
  return (
    <main>
      <Header alwaysVisible />

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Content */}
      <div className="mx-auto w-full max-w-2xl px-6 py-20 sm:py-28">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-16 sm:mb-20">
          <p className="text-sm/7 font-semibold text-olive-700">Roadmap</p>
          <h1 className="font-display text-[2rem]/10 sm:text-5xl/14 text-olive-950 tracking-tight text-pretty">
            What&apos;s next
          </h1>
          <p className="text-base/7 text-olive-600 max-w-lg">
            Ideas we&apos;re exploring based on community feedback. Nothing
            here is a promise — just directions we&apos;re thinking about.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-olive-300" />

          <div className="flex flex-col gap-12">
            {ITEMS.map((item) => (
              <div key={item.title} className="relative pl-10">
                {/* Dot */}
                <div className="absolute left-0 top-1.5 size-[15px] rounded-full border-2 border-olive-400 bg-olive-100" />

                {/* Badge */}
                <span className="inline-block mb-3 rounded-full bg-olive-200 px-2.5 py-0.5 text-xs font-medium text-olive-700">
                  Exploring
                </span>

                {/* Content */}
                <h2 className="font-display text-xl text-olive-950 mb-1">
                  {item.title}
                </h2>
                <p className="text-sm/7 text-olive-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 sm:mt-28 rounded-xl bg-olive-950/[0.03] p-8 sm:p-10 text-center">
          <p className="font-display text-xl text-olive-950 mb-2">
            Have an idea?
          </p>
          <p className="text-sm/7 text-olive-600 mb-6">
            We&apos;d love to hear what you want next.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/educlopez/codevator/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-olive-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-olive-800 transition-colors"
            >
              Open an issue
            </a>
            <a
              href="https://x.com/educalvolpz"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-olive-950/15 px-5 py-2.5 text-sm font-medium text-olive-950 hover:bg-olive-950/5 transition-colors"
            >
              Tell us on X
            </a>
          </div>
        </div>
      </div>

      {/* Footer — same as home */}
      <Floor5Rooftop />
    </main>
  );
}
