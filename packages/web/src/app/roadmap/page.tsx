import type { Metadata } from "next";
import { RoadmapContent } from "./content";

export const metadata: Metadata = {
  title: "Roadmap — Codevator",
  description:
    "See what's coming next for Codevator — upcoming features, planned improvements, and ideas we're exploring based on community feedback and requests.",
  alternates: {
    canonical: "/roadmap",
  },
};

export default function RoadmapPage() {
  return <RoadmapContent />;
}
