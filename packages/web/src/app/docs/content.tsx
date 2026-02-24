"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Floor5Rooftop } from "@/components/floors/Floor5Rooftop";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 rounded-md px-2 py-1 text-xs font-medium text-olive-400 hover:text-olive-700 hover:bg-olive-950/5 transition-colors"
      aria-label="Copy command"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ children, copyText }: { children: string; copyText?: string }) {
  return (
    <div className="relative rounded-lg bg-olive-950 px-4 py-3 font-mono text-sm text-olive-200 overflow-x-auto">
      <CopyButton text={copyText ?? children} />
      <pre className="pr-16">{children}</pre>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl text-olive-950 mb-6">{title}</h2>
      {children}
    </section>
  );
}

const TOC = [
  { id: "quick-start", label: "Quick start" },
  { id: "commands", label: "Commands" },
  { id: "sounds", label: "Sounds" },
  { id: "custom-sounds", label: "Custom sounds" },
  { id: "how-it-works", label: "How it works" },
  { id: "configuration", label: "Configuration" },
  { id: "skill", label: "Claude Code skill" },
  { id: "uninstall", label: "Uninstall" },
];

export function DocsContent() {
  return (
    <main>
      <Header alwaysVisible />

      {/* Spacer for fixed header */}
      <div className="h-16" />

      <div className="mx-auto w-full max-w-4xl px-6 py-20 sm:py-28">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-16 sm:mb-20">
          <p className="text-sm/7 font-semibold text-olive-700">Documentation</p>
          <h1 className="font-display text-[2rem]/10 sm:text-5xl/14 text-olive-950 tracking-tight text-pretty">
            Getting started
          </h1>
          <p className="text-base/7 text-olive-600 max-w-lg">
            Everything you need to set up and use Codevator with Claude Code.
          </p>
        </div>

        <div className="flex gap-16">
          {/* Table of contents — desktop sidebar */}
          <nav className="hidden lg:block w-48 shrink-0 sticky top-24 self-start">
            <ul className="flex flex-col gap-2.5">
              {TOC.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-olive-500 hover:text-olive-950 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="flex flex-col gap-16 min-w-0">
            {/* Quick start */}
            <Section id="quick-start" title="Quick start">
              <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
                <p>
                  One command sets everything up. It installs hooks into Claude Code
                  and downloads the default sound:
                </p>
                <CodeBlock copyText="npx codevator">npx codevator</CodeBlock>
                <p>
                  That&apos;s it. Next time Claude Code starts working, you&apos;ll hear elevator music.
                  It stops automatically when Claude finishes or asks for your input.
                </p>
              </div>
            </Section>

            {/* Commands */}
            <Section id="commands" title="Commands">
              <div className="flex flex-col gap-3">
                {[
                  { cmd: "npx codevator", desc: "Install hooks and download default sound" },
                  { cmd: "npx codevator mode <name>", desc: "Set sound mode" },
                  { cmd: "npx codevator add [name]", desc: "Download a sound from the registry" },
                  { cmd: "npx codevator on / off", desc: "Enable or disable sounds" },
                  { cmd: "npx codevator volume <n>", desc: "Set volume (0\u2013100)" },
                  { cmd: "npx codevator status", desc: "Show current settings" },
                  { cmd: "npx codevator uninstall", desc: "Remove hooks from Claude Code" },
                ].map((row) => (
                  <div
                    key={row.cmd}
                    className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-2 border-b border-olive-950/5 last:border-0"
                  >
                    <code className="text-sm font-mono text-olive-950 shrink-0">
                      {row.cmd}
                    </code>
                    <span className="text-sm text-olive-500">{row.desc}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Sounds */}
            <Section id="sounds" title="Sounds">
              <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
                <p>Five built-in sound modes:</p>
                <div className="grid gap-2">
                  {[
                    { name: "elevator", desc: "Smooth jazz elevator music (default)" },
                    { name: "typewriter", desc: "Rhythmic mechanical keystrokes" },
                    { name: "ambient", desc: "Gentle rain and atmospheric background" },
                    { name: "retro", desc: "Mellow 8-bit synthesized arpeggios" },
                    { name: "minimal", desc: "Deep warm hum with slow breathing" },
                  ].map((mode) => (
                    <div key={mode.name} className="flex items-baseline gap-3 py-1">
                      <code className="text-sm font-mono text-olive-950">{mode.name}</code>
                      <span className="text-sm text-olive-500">{mode.desc}</span>
                    </div>
                  ))}
                </div>
                <p>Switch modes:</p>
                <CodeBlock copyText="npx codevator mode ambient">npx codevator mode ambient</CodeBlock>
                <p>
                  Or run <code className="font-mono text-olive-950">npx codevator mode</code> without
                  a name to pick from an interactive list.
                </p>
                <p>
                  Browse and preview all sounds at{" "}
                  <a href="/sounds" className="text-olive-950 underline underline-offset-2 hover:text-olive-700">
                    codevator.dev/sounds
                  </a>.
                </p>
              </div>
            </Section>

            {/* Custom sounds */}
            <Section id="custom-sounds" title="Custom sounds">
              <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
                <p>
                  Download additional sounds from the registry:
                </p>
                <CodeBlock copyText="npx codevator add">npx codevator add</CodeBlock>
                <p>
                  Or install a specific sound by name:
                </p>
                <CodeBlock copyText="npx codevator add lofi">npx codevator add lofi</CodeBlock>
                <p>
                  You can also use your own audio files. Place any <code className="font-mono text-olive-950">.mp3</code> file
                  in <code className="font-mono text-olive-950">~/.codevator/sounds/</code> and use its filename as the mode:
                </p>
                <CodeBlock copyText="cp my-music.mp3 ~/.codevator/sounds/chill.mp3">{`cp my-music.mp3 ~/.codevator/sounds/chill.mp3\nnpx codevator mode chill`}</CodeBlock>
              </div>
            </Section>

            {/* How it works */}
            <Section id="how-it-works" title="How it works">
              <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
                <p>
                  Codevator registers hooks in Claude Code&apos;s settings
                  (<code className="font-mono text-olive-950">~/.claude/settings.json</code>):
                </p>
                <div className="grid gap-2">
                  {[
                    { hook: "PreToolUse", desc: "Starts playback when the agent begins working" },
                    { hook: "Stop", desc: "Stops playback when the session ends" },
                    { hook: "Notification", desc: "Stops on permission prompts and idle states" },
                  ].map((h) => (
                    <div key={h.hook} className="flex items-baseline gap-3 py-1">
                      <code className="text-sm font-mono text-olive-950">{h.hook}</code>
                      <span className="text-sm text-olive-500">{h.desc}</span>
                    </div>
                  ))}
                </div>
                <p>
                  Music plays through your system&apos;s native audio
                  player: <code className="font-mono text-olive-950">afplay</code> on
                  macOS, <code className="font-mono text-olive-950">paplay</code> or <code className="font-mono text-olive-950">aplay</code> on Linux.
                </p>
                <p>
                  Sounds are downloaded on demand from <code className="font-mono text-olive-950">codevator.dev</code> and
                  cached locally in <code className="font-mono text-olive-950">~/.codevator/sounds/</code>.
                  A small fallback sound is bundled with the package for offline use.
                </p>
              </div>
            </Section>

            {/* Configuration */}
            <Section id="configuration" title="Configuration">
              <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
                <p>
                  Config is stored
                  at <code className="font-mono text-olive-950">~/.codevator/config.json</code>:
                </p>
                <CodeBlock>{`{
  "mode": "elevator",
  "volume": 70,
  "enabled": true
}`}</CodeBlock>
                <div className="grid gap-2">
                  {[
                    { key: "mode", desc: "Active sound mode name" },
                    { key: "volume", desc: "Playback volume, 0\u2013100" },
                    { key: "enabled", desc: "Whether sounds play on hook triggers" },
                  ].map((c) => (
                    <div key={c.key} className="flex items-baseline gap-3 py-1">
                      <code className="text-sm font-mono text-olive-950">{c.key}</code>
                      <span className="text-sm text-olive-500">{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* Claude Code skill */}
            <Section id="skill" title="Claude Code skill">
              <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
                <p>
                  Setup also installs a Claude Code skill that lets the agent control
                  music directly. Ask Claude things like:
                </p>
                <ul className="list-disc list-inside space-y-1 text-olive-600">
                  <li>&ldquo;Change the music to retro&rdquo;</li>
                  <li>&ldquo;Turn off the elevator music&rdquo;</li>
                  <li>&ldquo;Set the volume to 50&rdquo;</li>
                </ul>
                <p>Claude will run the appropriate codevator command.</p>
              </div>
            </Section>

            {/* Uninstall */}
            <Section id="uninstall" title="Uninstall">
              <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
                <p>Remove hooks from Claude Code:</p>
                <CodeBlock copyText="npx codevator uninstall">npx codevator uninstall</CodeBlock>
                <p>
                  This removes the hooks
                  from <code className="font-mono text-olive-950">~/.claude/settings.json</code>.
                  Your config and downloaded sounds
                  at <code className="font-mono text-olive-950">~/.codevator/</code> are kept.
                  Delete that folder manually if you want a full cleanup.
                </p>
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Floor5Rooftop />
    </main>
  );
}
