import type { Metadata } from "next";
import { DocsContent } from "./content";

export const metadata: Metadata = {
  title: "Docs — Codevator",
  description:
    "Installation guide, CLI commands, configuration, and multi-agent setup for Codevator — background music for AI coding agents like Claude Code, Cursor, and more.",
  alternates: {
    canonical: "/docs",
  },
};

export default function DocsPage() {
  return <DocsContent />;
}
