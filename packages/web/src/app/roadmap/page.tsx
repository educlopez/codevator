import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { RoadmapContent } from "./content";

export const metadata: Metadata = pageMetadata({
  title: "Roadmap — Codevator",
  description:
    "See what's coming next for Codevator — upcoming features, planned improvements, and ideas we're exploring based on community feedback and requests.",
  path: "/roadmap",
});

export default function RoadmapPage() {
  return <RoadmapContent />;
}
