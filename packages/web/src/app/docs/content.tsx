"use client";

import { useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
    <section id={id} className="scroll-mt-36">
      <h2 className="font-display text-2xl text-olive-950 mb-6">{title}</h2>
      {children}
    </section>
  );
}

const TABS = [
  { key: "setup", label: "Setup" },
  { key: "sounds", label: "Sounds" },
  { key: "reference", label: "Reference" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TAB_TOC: Record<TabKey, { id: string; label: string }[]> = {
  setup: [
    { id: "quick-start", label: "Quick start" },
    { id: "multi-agent", label: "Multi-agent support" },
    { id: "agent-skill", label: "Agent skill" },
  ],
  sounds: [
    { id: "sounds", label: "Sounds" },
    { id: "custom-sounds", label: "Custom sounds" },
    { id: "profiles", label: "Profiles" },
  ],
  reference: [
    { id: "commands", label: "Commands" },
    { id: "menubar", label: "Menubar app" },
    { id: "how-it-works", label: "Under the hood" },
    { id: "configuration", label: "Configuration" },
    { id: "uninstall", label: "Uninstall" },
  ],
};

function isValidTab(value: string | null): value is TabKey {
  return value === "setup" || value === "sounds" || value === "reference";
}

/* ── Tab content components ── */

function SetupTab() {
  return (
    <>
      {/* Quick start */}
      <Section id="quick-start" title="Quick start">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>
            Run this. It installs hooks and downloads the default sound:
          </p>
          <CodeBlock copyText="npx codevator">npx codevator</CodeBlock>
          <p>
            Done. Next time your agent starts working, elevator music plays.
            When it finishes or waits for input, the music stops. Fully automatic.
          </p>
        </div>
      </Section>

      {/* Multi-agent support */}
      <Section id="multi-agent" title="Multi-agent support">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>
            Codevator works with 7 coding agents. Pick yours during setup:
          </p>
          <CodeBlock copyText="npx codevator setup --agent claude">npx codevator setup --agent claude</CodeBlock>
          <div className="grid gap-2 mt-2">
            {[
              { name: "claude", desc: "Claude Code (default)" },
              { name: "codex", desc: "Codex CLI" },
              { name: "gemini", desc: "Gemini CLI" },
              { name: "copilot", desc: "Copilot CLI" },
              { name: "cursor", desc: "Cursor" },
              { name: "windsurf", desc: "Windsurf" },
              { name: "opencode", desc: "OpenCode" },
            ].map((agent) => (
              <div key={agent.name} className="flex items-baseline gap-3 py-1">
                <code className="text-sm font-mono text-olive-950">{agent.name}</code>
                <span className="text-sm text-olive-500">{agent.desc}</span>
              </div>
            ))}
          </div>
          <p>
            All agents share the same sounds, config, and profiles. You can set up
            multiple agents on the same machine.
          </p>
        </div>
      </Section>

      {/* Agent skill */}
      <Section id="agent-skill" title="Agent skill">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>
            Want your agent to change music for you? Install the codevator skill:
          </p>
          <CodeBlock copyText="npx skills add educlopez/codevator">npx skills add educlopez/codevator</CodeBlock>
          <p>
            Works across Claude Code, Cursor, Windsurf, Gemini CLI, and 30+ other agents.
            Once installed, just ask:
          </p>
          <ul className="list-disc list-inside space-y-1 text-olive-600">
            <li>&ldquo;Play some lo-fi while I review this PR&rdquo;</li>
            <li>&ldquo;Switch to nature sounds&rdquo;</li>
            <li>&ldquo;Turn the volume down to 30&rdquo;</li>
            <li>&ldquo;Show me my listening stats&rdquo;</li>
          </ul>
          <p>Your agent runs the right codevator command behind the scenes.</p>
        </div>
      </Section>
    </>
  );
}

function SoundsTab() {
  return (
    <>
      {/* Sounds */}
      <Section id="sounds" title="Sounds">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>
            15 sounds across three categories. Pick what fits your flow.
          </p>

          <p className="font-semibold text-olive-950 mt-2 mb-0">Focus &amp; Ambient</p>
          <div className="grid gap-2">
            {[
              { name: "elevator", desc: "Smooth jazz elevator music (default)" },
              { name: "typewriter", desc: "Rhythmic mechanical keystrokes" },
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
              { name: "spotify", desc: "Fades your Spotify in/out with coding sessions (macOS)" },
            ].map((mode) => (
              <div key={mode.name} className="flex items-baseline gap-3 py-1">
                <code className="text-sm font-mono text-olive-950">{mode.name}</code>
                <span className="text-sm text-olive-500">{mode.desc}</span>
              </div>
            ))}
          </div>

          <p>Switch modes any time:</p>
          <CodeBlock copyText="npx codevator mode lofi-relax">npx codevator mode lofi-relax</CodeBlock>
          <p>
            Run <code className="font-mono text-olive-950">npx codevator mode</code> without
            a name to browse an interactive picker. Add{" "}
            <code className="font-mono text-olive-950">--random</code> for a surprise, or{" "}
            <code className="font-mono text-olive-950">--category focus</code> to filter.
          </p>
          <p>
            Preview and browse all sounds at{" "}
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
            Download more sounds from the registry:
          </p>
          <CodeBlock copyText="npx codevator add">npx codevator add</CodeBlock>
          <p>
            Or grab a specific one:
          </p>
          <CodeBlock copyText="npx codevator add rain">npx codevator add rain</CodeBlock>
          <p>
            Bring your own audio too. Import any mp3, wav, ogg, or m4a file:
          </p>
          <CodeBlock copyText="npx codevator import my-music.mp3 --name chill">npx codevator import my-music.mp3 --name chill</CodeBlock>
          <p>
            Your custom sounds show up alongside built-in ones. Remove them
            with <code className="font-mono text-olive-950">npx codevator remove chill</code>.
          </p>
        </div>
      </Section>

      {/* Profiles */}
      <Section id="profiles" title="Profiles">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>
            Save mode + volume combos as presets. A quiet ambient setup for deep work,
            louder retro for background tasks — switch instantly.
          </p>
          <CodeBlock copyText="npx codevator profile create deepwork">{`npx codevator profile create deepwork\nnpx codevator profile use deepwork`}</CodeBlock>
          <p>
            List all profiles
            with <code className="font-mono text-olive-950">profile list</code>,
            remove with <code className="font-mono text-olive-950">profile delete</code>.
            Profiles live
            in <code className="font-mono text-olive-950">~/.codevator/config.json</code>.
          </p>
        </div>
      </Section>
    </>
  );
}

function ReferenceTab() {
  return (
    <>
      {/* Commands */}
      <Section id="commands" title="Commands">
        <div className="flex flex-col gap-3">
          {[
            { cmd: "npx codevator", desc: "Install hooks and download default sound" },
            { cmd: "npx codevator mode [name]", desc: "Set sound mode (--random, --category)" },
            { cmd: "npx codevator add [name]", desc: "Download a sound from the registry" },
            { cmd: "npx codevator on / off", desc: "Enable or disable sounds" },
            { cmd: "npx codevator volume <n>", desc: "Set volume (0\u2013100)" },
            { cmd: "npx codevator list", desc: "Show all sounds grouped by category" },
            { cmd: "npx codevator preview <mode>", desc: "Play a 5-second preview" },
            { cmd: "npx codevator stats", desc: "Play time, streaks, and milestones" },
            { cmd: "npx codevator status", desc: "Current settings and quick stats" },
            { cmd: "npx codevator import <file>", desc: "Import a custom audio file" },
            { cmd: "npx codevator remove <name>", desc: "Delete a custom sound" },
            { cmd: "npx codevator profile <action>", desc: "Manage presets (create, use, list, delete)" },
            { cmd: "npx codevator doctor", desc: "Diagnose installation issues" },
            { cmd: "npx codevator install-menubar", desc: "Install the macOS menubar app" },
            { cmd: "npx codevator uninstall", desc: "Remove hooks from your agent" },
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

      {/* Menubar app */}
      <Section id="menubar" title="Menubar app">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>
            A native macOS menu bar companion. Toggle playback, switch modes, and adjust
            volume without leaving your editor.
          </p>
          <CodeBlock copyText="npx codevator install-menubar">npx codevator install-menubar</CodeBlock>
          <ul className="list-disc list-inside space-y-1 text-olive-600">
            <li>Playback toggle with on/off switch</li>
            <li>Sound mode picker with visual grid</li>
            <li>Volume slider (0–100%)</li>
            <li>Live status indicator with animated equalizer</li>
          </ul>
          <p>
            Requires macOS and Xcode Command Line Tools.
            Remove with <code className="font-mono text-olive-950">npx codevator uninstall-menubar</code>.
          </p>
        </div>
      </Section>

      {/* Under the hood */}
      <Section id="how-it-works" title="Under the hood">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>
            Codevator registers hooks in your agent&apos;s config. For Claude Code,
            that&apos;s <code className="font-mono text-olive-950">~/.claude/settings.json</code>:
          </p>
          <div className="grid gap-2">
            {[
              { hook: "PreToolUse", desc: "Starts playback when the agent begins working" },
              { hook: "Stop", desc: "Stops playback when the session ends" },
              { hook: "Notification", desc: "Pauses on permission prompts and idle states" },
            ].map((h) => (
              <div key={h.hook} className="flex items-baseline gap-3 py-1">
                <code className="text-sm font-mono text-olive-950">{h.hook}</code>
                <span className="text-sm text-olive-500">{h.desc}</span>
              </div>
            ))}
          </div>
          <p>
            Audio plays through your system&apos;s native
            player — <code className="font-mono text-olive-950">afplay</code> on
            macOS, <code className="font-mono text-olive-950">paplay</code> or <code className="font-mono text-olive-950">aplay</code> on Linux.
            Sounds are downloaded on demand
            from <code className="font-mono text-olive-950">codevator.dev</code> and
            cached in <code className="font-mono text-olive-950">~/.codevator/sounds/</code>.
          </p>
        </div>
      </Section>

      {/* Configuration */}
      <Section id="configuration" title="Configuration">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>
            All settings live
            in <code className="font-mono text-olive-950">~/.codevator/config.json</code>:
          </p>
          <CodeBlock>{`{
  "mode": "elevator",
  "volume": 70,
  "enabled": true
}`}</CodeBlock>
          <div className="grid gap-2">
            {[
              { key: "mode", desc: "Active sound mode" },
              { key: "volume", desc: "Playback volume (0\u2013100)" },
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

      {/* Uninstall */}
      <Section id="uninstall" title="Uninstall">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>Remove hooks from your agent:</p>
          <CodeBlock copyText="npx codevator uninstall">npx codevator uninstall</CodeBlock>
          <p>
            This removes the hooks only. Your config and downloaded sounds
            at <code className="font-mono text-olive-950">~/.codevator/</code> are kept.
            Delete that folder manually for a full cleanup.
          </p>
        </div>
      </Section>
    </>
  );
}

const TAB_CONTENT: Record<TabKey, () => React.JSX.Element> = {
  setup: SetupTab,
  sounds: SoundsTab,
  reference: ReferenceTab,
};

/* ── Main docs content with tabs ── */

function DocsContentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab");
  const activeTab: TabKey = isValidTab(rawTab) ? rawTab : "setup";

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "setup") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const query = params.toString();
      router.replace(`/docs${query ? `?${query}` : ""}`, { scroll: false });
    },
    [searchParams, router],
  );

  const ActiveTabContent = TAB_CONTENT[activeTab];
  const tocItems = TAB_TOC[activeTab];

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
            Set up in 30 seconds
          </h1>
          <p className="text-base/7 text-olive-600 max-w-lg">
            One command. Background music plays while your agent works, stops when it&apos;s done. No config needed.
          </p>
        </div>

        {/* Tab bar */}
        <div className="sticky top-16 z-30 bg-olive-100/80 backdrop-blur-md border-b border-olive-950/10 mb-12 overflow-x-auto -mx-6 px-6 lg:-mx-10 lg:px-10 pt-4">
          <div className="flex gap-8">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-olive-950 border-b-2 border-olive-950"
                    : "text-olive-500 hover:text-olive-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-16">
          {/* Table of contents — desktop sidebar */}
          <nav className="hidden lg:block w-48 shrink-0 sticky top-36 self-start pt-4">
            <ul className="flex flex-col gap-2.5">
              {tocItems.map((item) => (
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
            <ActiveTabContent />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Floor5Rooftop />
    </main>
  );
}

export function DocsContent() {
  return (
    <Suspense>
      <DocsContentInner />
    </Suspense>
  );
}
