import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { SoundsContent } from "./content";

export const metadata: Metadata = pageMetadata({
  title: "Sounds — Codevator",
  description:
    "Browse and preview 15+ ambient sounds for Codevator — lo-fi beats, nature sounds, jazz, classical piano, and more. Download any sound with a single command.",
  path: "/sounds",
});

export default function SoundsPage() {
  return <SoundsContent />;
}
