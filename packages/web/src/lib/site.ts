import type { Metadata } from "next";

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

export const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Codevator — Background music for AI coding agents, with terminal UI and 15 built-in sounds",
};

/**
 * Metadata for a page under the root layout. Next.js replaces `openGraph`,
 * `twitter` and `alternates` objects instead of merging them, so each page
 * repeats the shared fields with its own title, description and path.
 * The same path serves Markdown when the request prefers `text/markdown`.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
      types: {
        "text/markdown": path,
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName: SITE_NAME,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
