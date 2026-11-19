import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { DocsContent } from "./content";

export const metadata: Metadata = pageMetadata({
  title: "Docs — Codevator",
  description:
    "Installation guide, CLI commands, configuration, and multi-agent setup for Codevator — background music for AI coding agents like Claude Code, Cursor, and more.",
  path: "/docs",
});

export default function DocsPage() {
  return <DocsContent />;
}
