import type { Metadata } from "next";
import { SoundsContent } from "./content";

export const metadata: Metadata = {
  title: "Sounds — Codevator",
  description:
    "Browse and preview all available Codevator sounds. Download any sound with a single command.",
  alternates: {
    canonical: "/sounds",
  },
};

export default function SoundsPage() {
  return <SoundsContent />;
}
