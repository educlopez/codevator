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
  { id: "profiles", label: "Profiles" },
  { id: "multi-agent", label: "Multi-agent" },
  { id: "agent-skill", label: "Agent Skill" },
  { id: "menubar", label: "Menubar app" },
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
            Everything you need to set up and use Codevator with your coding agent.
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
                  { cmd: "npx codevator mode [name]", desc: "Set sound mode (--category to filter, --random for a surprise)" },
                  { cmd: "npx codevator add [name]", desc: "Download a sound from the registry" },
                  { cmd: "npx codevator on / off", desc: "Enable or disable sounds" },
                  { cmd: "npx codevator volume <n>", desc: "Set volume (0\u2013100)" },
                  { cmd: "npx codevator status", desc: "Show current settings, mini-stats, and feedback link" },
                  { cmd: "npx codevator list", desc: "Show installed, bundled, and available sounds" },
                  { cmd: "npx codevator preview <mode>", desc: "Play a 5-second preview of a sound mode" },
                  { cmd: "npx codevator import <file>", desc: "Import a custom audio file as a sound mode" },
                  { cmd: "npx codevator remove <name>", desc: "Delete a custom sound (bundled sounds are protected)" },
                  { cmd: "npx codevator doctor", desc: "Check installation health (hooks, audio, config)" },
                  { cmd: "npx codevator stats", desc: "Show usage statistics (play time, streaks, milestones)" },
                  { cmd: "npx codevator profile <action>", desc: "Manage saved presets (create, use, list, delete)" },
                  { cmd: "npx codevator install-menubar", desc: "Compile and install the macOS menubar app" },
                  { cmd: "npx codevator uninstall-menubar", desc: "Remove the menubar app" },
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
                <p>
                  Sounds are organized in three categories. Built-in sound modes:
                </p>
                <p className="font-semibold text-olive-950 mt-2 mb-0">Focus &amp; Ambient</p>
                <div className="grid gap-2">
                  {[
                    { name: "elevator", desc: "Smooth jazz elevator music (default)" },
                    { name: "typewriter", desc: "Rhythmic mechanical keystrokes" },
                    { name: "ambient", desc: "Gentle atmospheric background" },
                    { name: "minimal", desc: "Deep warm hum with slow breathing" },
                    { name: "lofi-relax", desc: "Laid-back lo-fi beats" },
                    { name: "lofi-chill", desc: "Mellow lo-fi grooves" },
                    { name: "lofi-cozy", desc: "Warm lo-fi vibes" },
                  ].map((mode) => (
                    <div key={mode.name} className="flex items-baseline gap-3 py-1">
                      <code className="text-sm font-mono text-olive-950">{mode.name}</code>
                      <span className="text-sm text-olive-500">{mode.desc}</span>
                    </div>
                  ))}
                </div>
                <p className="font-semibold text-olive-950 mt-2 mb-0">Nature</p>
                <div className="grid gap-2">
                  {[
                    { name: "ambient", desc: "Gentle atmospheric background" },
                    { name: "rain", desc: "Steady rainfall" },
                    { name: "forest", desc: "Birds and rustling leaves" },
                    { name: "ocean", desc: "Gentle ocean waves" },
                  ].map((mode) => (
                    <div key={mode.name} className="flex items-baseline gap-3 py-1">
                      <code className="text-sm font-mono text-olive-950">{mode.name}</code>
                      <span className="text-sm text-olive-500">{mode.desc}</span>
                    </div>
                  ))}
                </div>
                <p className="font-semibold text-olive-950 mt-2 mb-0">Music &amp; Retro</p>
                <div className="grid gap-2">
                  {[
                    { name: "retro", desc: "Mellow 8-bit synthesized arpeggios" },
                    { name: "classical-piano", desc: "Soft classical piano pieces" },
                    { name: "ambient-guitar", desc: "Gentle fingerpicked guitar" },
                    { name: "epic-strings", desc: "Cinematic orchestral strings" },
                    { name: "spotify", desc: "Controls Spotify volume — fades in/out with your coding session (macOS)" },
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
                  a name to pick from an interactive category → sound picker. Use{" "}
                  <code className="font-mono text-olive-950">--category</code> to filter by category
                  or <code className="font-mono text-olive-950">--random</code> to play a random sound.
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
                <CodeBlock copyText="npx codevator add ambient">npx codevator add ambient</CodeBlock>
                <p>
                  You can also use your own audio files. Place any <code className="font-mono text-olive-950">.mp3</code> file
                  in <code className="font-mono text-olive-950">~/.codevator/sounds/</code> and use its filename as the mode:
                </p>
                <CodeBlock copyText="cp my-music.mp3 ~/.codevator/sounds/chill.mp3">{`cp my-music.mp3 ~/.codevator/sounds/chill.mp3\nnpx codevator mode chill`}</CodeBlock>
              </div>
            </Section>

            {/* Profiles */}
            <Section id="profiles" title="Profiles">
              <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
                <p>
                  Profiles let you save named presets for different contexts — a calm setup for deep
                  work, a louder one for background tasks.
                </p>
                <p>Create a profile:</p>
                <CodeBlock copyText="npx codevator profile create work --mode ambient --volume 50">npx codevator profile create work --mode ambient --volume 50</CodeBlock>
                <p>Switch to a saved profile:</p>
                <CodeBlock copyText="npx codevator profile use work">npx codevator profile use work</CodeBlock>
                <p>List all profiles:</p>
                <CodeBlock copyText="npx codevator profile list">npx codevator profile list</CodeBlock>
                <p>Delete a profile:</p>
                <CodeBlock copyText="npx codevator profile delete work">npx codevator profile delete work</CodeBlock>
                <p>
                  Each profile stores a <code className="font-mono text-olive-950">mode</code> and <code className="font-mono text-olive-950">volume</code>.
                  When you switch profiles, both are applied immediately. Profiles are saved
                  in <code className="font-mono text-olive-950">~/.codevator/config.json</code> under
                  the <code className="font-mono text-olive-950">profiles</code> key.
                </p>
              </div>
            </Section>

            {/* Multi-agent */}
            <Section id="multi-agent" title="Multi-agent">
              <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
                <p>
                  Codevator works with multiple coding agents. During setup, choose which agent
                  to configure hooks for:
                </p>
                <CodeBlock copyText="npx codevator setup --agent claude">npx codevator setup --agent claude</CodeBlock>
                <p>Supported agents:</p>
                <div className="grid gap-2">
                  {[
                    { name: "claude", desc: "Claude Code (default) — hooks in ~/.claude/settings.json" },
                    { name: "codex", desc: "Codex CLI — hooks in ~/.codex/config.toml" },
                    { name: "gemini", desc: "Gemini CLI — hooks in ~/.gemini/settings.json" },
                    { name: "copilot", desc: "Copilot CLI — hooks in ~/.github-copilot/config.json" },
                    { name: "cursor", desc: "Cursor — hooks in ~/.cursor/settings.json" },
                    { name: "windsurf", desc: "Windsurf — hooks in ~/.windsurf/settings.json" },
                    { name: "opencode", desc: "OpenCode — plugin in ~/.config/opencode/plugins/" },
                  ].map((agent) => (
                    <div key={agent.name} className="flex items-baseline gap-3 py-1">
                      <code className="text-sm font-mono text-olive-950">{agent.name}</code>
                      <span className="text-sm text-olive-500">{agent.desc}</span>
                    </div>
                  ))}
                </div>
                <p>
                  All agents share the same config, sounds, and profiles. The only difference is
                  where the hooks are installed. You can set up multiple agents on the same machine.
                </p>
              </div>
            </Section>

            {/* Agent Skill */}
            <Section id="agent-skill" title="Agent Skill">
              <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
                <p>
                  Install the codevator skill so your AI agent can control music for you:
                </p>
                <CodeBlock copyText="npx skills add educlopez/codevator">npx skills add educlopez/codevator</CodeBlock>
                <p>
                  This installs the skill across all supported agents — Claude Code, Cursor,
                  Windsurf, Gemini CLI, and 30+ more. Once installed, just ask your agent
                  things like &quot;play some lo-fi&quot; or &quot;switch to nature sounds&quot;.
                </p>
              </div>
            </Section>

            {/* Menubar app */}
            <Section id="menubar" title="Menubar app">
              <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
                <p>
                  A native macOS menu bar companion app that gives you visual controls without
                  leaving your editor. Toggle playback, switch modes, and adjust volume from the
                  system tray.
                </p>
                <p>Install it with one command:</p>
                <CodeBlock copyText="npx codevator install-menubar">npx codevator install-menubar</CodeBlock>
                <p>
                  This compiles a Swift binary and installs it
                  at <code className="font-mono text-olive-950">~/.codevator/menubar/</code>.
                  Xcode Command Line Tools are required for compilation.
                </p>
                <p>Features:</p>
                <ul className="list-disc list-inside space-y-1 text-olive-600">
                  <li>Playback toggle — enable or disable sounds with a switch</li>
                  <li>Sound mode picker — visual grid of all available modes</li>
                  <li>Volume slider — 0-100% control</li>
                  <li>Status indicator — LIVE/IDLE badge with animated equalizer</li>
                  <li>Daemon status — shows if the audio daemon is active</li>
                </ul>
                <p>
                  The menubar app auto-launches when a coding session starts and reads
                  the same config as the CLI. Changes made in the menubar are reflected
                  in the CLI and vice versa.
                </p>
                <p>
                  <strong className="text-olive-950">macOS only.</strong> Requires macOS and Xcode
                  Command Line Tools. Linux and Windows users should use the CLI.
                </p>
                <p>To remove it:</p>
                <CodeBlock copyText="npx codevator uninstall-menubar">npx codevator uninstall-menubar</CodeBlock>
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
