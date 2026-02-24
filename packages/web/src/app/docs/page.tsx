import type { Metadata } from "next";
import { DocsContent } from "./content";

export const metadata: Metadata = {
  title: "Docs — Codevator",
  description:
    "Installation, commands, configuration, and everything you need to know about Codevator.",
  alternates: {
    canonical: "/docs",
  },
};

export default function DocsPage() {
  return <DocsContent />;
}
