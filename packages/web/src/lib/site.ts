export const SITE_URL = "https://codevator.dev";
export const SITE_NAME = "Codevator";
export const SITE_TITLE = "Codevator — Background music for AI coding agents";
export const SITE_DESCRIPTION =
  "Background music that plays while your AI agent codes and stops when it's done. 15 sounds, 7 agents supported. Free and open source.";

export const SUPPORTED_AGENTS = [
  { name: "claude", description: "Claude Code (default)" },
  { name: "codex", description: "Codex CLI" },
  { name: "gemini", description: "Gemini CLI" },
  { name: "copilot", description: "Copilot CLI" },
  { name: "cursor", description: "Cursor" },
  { name: "windsurf", description: "Windsurf" },
  { name: "opencode", description: "OpenCode" },
] as const;

export const INSTALL_COMMAND = "npx codevator";
export const SKILL_INSTALL_COMMAND = "npx skills add educlopez/codevator";
