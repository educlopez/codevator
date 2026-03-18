import { Header } from "@/components/Header";
import { Floor5Rooftop } from "@/components/floors/Floor5Rooftop";
import { CopyButton } from "./copy-button";
import { DocsTabs } from "./docs-tabs";

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

export type TabKey = "setup" | "sounds" | "reference";

export const TAB_TOC: Record<TabKey, { id: string; label: string }[]> = {
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

/* ── Tab content components ── */

function SetupTab() {
  return (
    <>
      <Section id="quick-start" title="Quick start">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>
            Install{" "}
            <a href="https://www.npmjs.com/package/codevator" target="_blank" rel="noopener noreferrer" className="text-olive-950 underline underline-offset-2 hover:text-olive-700">
              codevator
            </a>{" "}
            via npx. It sets up hooks and downloads the default sound:
          </p>
          <CodeBlock copyText="npx codevator">npx codevator</CodeBlock>
          <p>
            Done. Next time your agent starts working, elevator music plays.
            When it finishes or waits for input, the music stops. Fully automatic.
          </p>
        </div>
      </Section>

      <Section id="multi-agent" title="Multi-agent support">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>
            Codevator works with 7 coding agents. Pick yours during setup:
          </p>
          <CodeBlock copyText="npx codevator setup --agent claude">npx codevator setup --agent claude</CodeBlock>
          <div className="grid gap-2 mt-2">
            {[
              { name: "claude", desc: "Claude Code (default)", url: "https://docs.anthropic.com/en/docs/claude-code" },
              { name: "codex", desc: "Codex CLI", url: "https://github.com/openai/codex" },
              { name: "gemini", desc: "Gemini CLI", url: "https://github.com/google-gemini/gemini-cli" },
              { name: "copilot", desc: "Copilot CLI", url: "https://docs.github.com/en/copilot/github-copilot-in-the-cli" },
              { name: "cursor", desc: "Cursor", url: "https://cursor.com" },
              { name: "windsurf", desc: "Windsurf", url: "https://windsurf.com" },
              { name: "opencode", desc: "OpenCode", url: "https://github.com/opencode-ai/opencode" },
            ].map((agent) => (
              <div key={agent.name} className="flex items-baseline gap-3 py-1">
                <code className="text-sm font-mono text-olive-950">{agent.name}</code>
                <a href={agent.url} target="_blank" rel="noopener noreferrer" className="text-sm text-olive-500 underline underline-offset-2 hover:text-olive-700">{agent.desc}</a>
              </div>
            ))}
          </div>
          <p>
            All agents share the same sounds, config, and profiles. You can set up
            multiple agents on the same machine.
          </p>
        </div>
      </Section>

      <Section id="agent-skill" title="Agent skill">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>
            Want your agent to change music for you? Install the codevator skill:
          </p>
          <CodeBlock copyText="npx skills add educlopez/codevator">npx skills add educlopez/codevator</CodeBlock>
          <p>
            Skills is an open registry for agent capabilities — learn more on{" "}
            <a href="https://github.com/vercel-labs/skills" target="_blank" rel="noopener noreferrer" className="text-olive-950 underline underline-offset-2 hover:text-olive-700">
              GitHub
            </a>.
          </p>
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

      <Section id="uninstall" title="Uninstall">
        <div className="flex flex-col gap-4 text-sm/7 text-olive-600">
          <p>Remove hooks from your agent:</p>
          <CodeBlock copyText="npx codevator uninstall">npx codevator uninstall</CodeBlock>
          <p>
            This removes the hooks only. Your config and downloaded sounds
            at <code className="font-mono text-olive-950">~/.codevator/</code> are kept.
            Delete that folder manually for a full cleanup.
          </p>
          <p>
            Found a bug? Open an issue on{" "}
            <a href="https://github.com/educlopez/codevator" target="_blank" rel="noopener noreferrer" className="text-olive-950 underline underline-offset-2 hover:text-olive-700">
              GitHub
            </a>.
          </p>
        </div>
      </Section>
    </>
  );
}

/* ── All tab panels (rendered in HTML for SEO, toggled client-side) ── */

export const TAB_PANELS: { key: TabKey; content: React.ReactNode }[] = [
  { key: "setup", content: <SetupTab /> },
  { key: "sounds", content: <SoundsTab /> },
  { key: "reference", content: <ReferenceTab /> },
];

/* ── Main docs content ── */

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
            Set up in 30 seconds
          </h1>
          <p className="text-base/7 text-olive-600 max-w-lg">
            One command. Background music plays while your agent works, stops when it&apos;s done. No config needed.
          </p>
        </div>

        {/* Client-side tab controller wraps all panels */}
        <DocsTabs />
      </div>

      {/* Footer */}
      <Floor5Rooftop />
    </main>
  );
}
