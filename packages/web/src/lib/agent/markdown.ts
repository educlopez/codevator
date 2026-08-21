import soundsManifest from "../../../public/sounds.json";
import { FALLBACK_ITEMS } from "../roadmap";
import {
  INSTALL_COMMAND,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  SKILL_INSTALL_COMMAND,
  SUPPORTED_AGENTS,
} from "../site";

function soundsMarkdown(): string {
  const groups = new Map<string, typeof soundsManifest.sounds>();
  for (const sound of soundsManifest.sounds) {
    const list = groups.get(sound.category) ?? [];
    list.push(sound);
    groups.set(sound.category, list);
  }

  const categoryTitle: Record<string, string> = {
    focus: "Focus & Ambient",
    nature: "Nature",
    music: "Music & Retro",
    integration: "Integration",
  };

  const sections = [...groups.entries()].map(([category, sounds]) => {
    const heading = categoryTitle[category] ?? category;
    const rows = sounds
      .map((sound) => `- \`${sound.name}\` — ${sound.description}`)
      .join("\n");
    return `## ${heading}\n\n${rows}`;
  });

  return `# Sounds — ${SITE_NAME}

Browse and preview ${soundsManifest.sounds.length} background sounds. Install any sound with:

\`\`\`bash
npx codevator add <name>
\`\`\`

${sections.join("\n\n")}

Preview them in the browser at ${SITE_URL}/sounds.
`;
}

function docsMarkdown(): string {
  const agents = SUPPORTED_AGENTS.map(
    (agent) => `- \`${agent.name}\` — ${agent.description}`,
  ).join("\n");

  return `# Docs — ${SITE_NAME}

One command. Background music plays while your agent works and stops when it is done.

## Quick start

\`\`\`bash
${INSTALL_COMMAND}
\`\`\`

That installs hooks and downloads the default sound. Next time your agent starts working, elevator music plays.

## Multi-agent support

Codevator works with 7 coding agents. Pick yours during setup:

\`\`\`bash
npx codevator setup --agent claude
\`\`\`

${agents}

All agents share the same sounds, config, and profiles.

## Agent skill

Install the codevator skill so any AI agent can control music directly:

\`\`\`bash
${SKILL_INSTALL_COMMAND}
\`\`\`

Then you can ask: "Play some lo-fi", "Switch to nature sounds", "Turn the volume down to 30".

## Sounds

15 sounds across Focus & Ambient, Nature, Music & Retro, plus Spotify on macOS. Switch anytime:

\`\`\`bash
npx codevator mode lofi-relax
npx codevator mode --random
npx codevator mode --category nature
\`\`\`

Browse them at ${SITE_URL}/sounds.

## Custom sounds

\`\`\`bash
npx codevator add
npx codevator add rain
npx codevator import my-music.mp3 --name chill
npx codevator remove chill
\`\`\`

## Profiles

\`\`\`bash
npx codevator profile create deepwork
npx codevator profile use deepwork
npx codevator profile list
npx codevator profile delete deepwork
\`\`\`

Profiles live in \`~/.codevator/config.json\`.

## Commands

| Command | What it does |
|---------|--------------|
| \`npx codevator\` | Install hooks and download the default sound |
| \`npx codevator mode [name]\` | Set sound mode (\`--random\`, \`--category\`) |
| \`npx codevator add [name]\` | Download a sound from the registry |
| \`npx codevator on\` / \`off\` | Enable or disable sounds |
| \`npx codevator volume <n>\` | Set volume (0–100) |
| \`npx codevator list\` | Show all sounds grouped by category |
| \`npx codevator preview <mode>\` | Play a 5-second preview |
| \`npx codevator stats\` | Play time, streaks, and milestones |
| \`npx codevator status\` | Current settings and quick stats |
| \`npx codevator import <file>\` | Import a custom audio file |
| \`npx codevator remove <name>\` | Delete a custom sound |
| \`npx codevator profile <action>\` | Manage presets (create, use, list, delete) |
| \`npx codevator doctor\` | Diagnose installation issues |
| \`npx codevator install-menubar\` | Install the macOS menu bar app |
| \`npx codevator uninstall\` | Remove hooks from your agent |

## macOS menu bar

\`\`\`bash
npx codevator install-menubar
\`\`\`

Toggle playback, switch modes, and adjust volume from the menu bar. Requires macOS and Xcode Command Line Tools.

## How it works

Codevator registers hooks in your agent's config. For Claude Code that is \`~/.claude/settings.json\`:

- \`PreToolUse\` — starts playback when the agent begins working
- \`Stop\` — stops playback when the session ends
- \`Notification\` — pauses on permission prompts and idle states

Audio plays through the system player (\`afplay\` on macOS, \`paplay\` or \`aplay\` on Linux). Sounds download from ${SITE_URL} and cache in \`~/.codevator/sounds/\`.

## Configuration

\`~/.codevator/config.json\`:

\`\`\`json
{
  "mode": "elevator",
  "volume": 70,
  "enabled": true
}
\`\`\`

## Uninstall

\`\`\`bash
npx codevator uninstall
\`\`\`

This removes hooks only. Delete \`~/.codevator/\` for a full cleanup.

Source: https://github.com/educlopez/codevator
`;
}

function homeMarkdown(): string {
  return `# ${SITE_TITLE}

${SITE_DESCRIPTION}

Website: ${SITE_URL}
Docs: ${SITE_URL}/docs
Sounds: ${SITE_URL}/sounds
npm: https://www.npmjs.com/package/codevator
Source: https://github.com/educlopez/codevator

## Install

\`\`\`bash
${INSTALL_COMMAND}
\`\`\`

That's it. Next time your coding agent starts working, you'll hear elevator music. When it stops or waits for input, the music stops.

## Agent skill

\`\`\`bash
${SKILL_INSTALL_COMMAND}
\`\`\`

Works across Claude Code, Cursor, Windsurf, Gemini CLI, and more. The agent can switch sounds, adjust volume, and toggle playback.

## Supported agents

${SUPPORTED_AGENTS.map((agent) => `- \`${agent.name}\` — ${agent.description}`).join("\n")}

\`\`\`bash
npx codevator setup --agent cursor
\`\`\`

## Machine-readable discovery

- API catalog: ${SITE_URL}/.well-known/api-catalog
- OpenAPI: ${SITE_URL}/openapi.json
- Agent skills: ${SITE_URL}/.well-known/agent-skills/index.json
- ARD catalog: ${SITE_URL}/.well-known/ai-catalog.json
- Sound registry: ${SITE_URL}/sounds.json

Request any HTML page with \`Accept: text/markdown\` to receive this markdown representation.
`;
}

function roadmapMarkdown(): string {
  const items = FALLBACK_ITEMS.map(
    (item) => `### ${item.title} (${item.status})\n\n${item.description}`,
  ).join("\n\n");

  return `# Roadmap — ${SITE_NAME}

What's shipping and what's still being explored. Live data is also published from the public roadmap spreadsheet.

${items}

See the interactive timeline at ${SITE_URL}/roadmap.
`;
}

const PAGE_MARKDOWN: Record<string, string> = {
  "/": homeMarkdown(),
  "/docs": docsMarkdown(),
  "/sounds": soundsMarkdown(),
  "/roadmap": roadmapMarkdown(),
};

export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname || "/";
}

export function getMarkdownForPath(pathname: string): string | null {
  return PAGE_MARKDOWN[normalizePathname(pathname)] ?? null;
}

/**
 * True when the client prefers text/markdown, including `Accept: text/markdown`
 * and mixed lists such as `text/markdown, text/html`.
 */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;

  let markdownQ = -1;
  let htmlQ = -1;

  for (const part of accept.split(",")) {
    const [media, ...params] = part.trim().split(";").map((item) => item.trim());
    if (!media) continue;

    const qParam = params.find((param) => param.startsWith("q="));
    const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
    if (!Number.isFinite(q)) continue;

    if (media === "text/markdown" || media === "text/x-markdown") {
      markdownQ = Math.max(markdownQ, q);
    } else if (media === "text/html") {
      htmlQ = Math.max(htmlQ, q);
    }
  }

  if (markdownQ < 0) return false;
  if (htmlQ < 0) return true;
  return markdownQ >= htmlQ;
}

export function estimateMarkdownTokens(markdown: string): number {
  return Math.max(1, Math.ceil(markdown.length / 4));
}
