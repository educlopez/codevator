import type { Metadata } from "next";
import { RoadmapContent } from "./content";

export const metadata: Metadata = {
  title: "Roadmap — Codevator",
  description:
    "See what's coming next for Codevator. Features we're exploring based on community feedback.",
  alternates: {
    canonical: "/roadmap",
  },
};

export default function RoadmapPage() {
  return <RoadmapContent />;
}
