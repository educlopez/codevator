import type { Metadata } from "next";
import { SoundsContent } from "./content";

export const metadata: Metadata = {
  title: "Sounds — Codevator",
  description:
    "Browse and preview 15+ ambient sounds for Codevator — lo-fi beats, nature sounds, jazz, classical piano, and more. Download any sound with a single command.",
  alternates: {
    canonical: "/sounds",
  },
};

export default function SoundsPage() {
  return <SoundsContent />;
}
