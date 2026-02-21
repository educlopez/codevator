"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { ElevatorShell } from "@/components/ElevatorShell";
import { ElevatorDoors } from "@/components/ElevatorDoors";
import { MuteButton } from "@/components/MuteButton";
import { Floor1Welcome } from "@/components/floors/Floor1Welcome";

const Floor2Modes = dynamic(
  () => import("@/components/floors/Floor2Modes").then((m) => m.Floor2Modes),
  { ssr: false },
);
const Floor3Install = dynamic(
  () => import("@/components/floors/Floor3Install").then((m) => m.Floor3Install),
  { ssr: false },
);
const Floor4Testimonials = dynamic(
  () => import("@/components/floors/Floor4Testimonials").then((m) => m.Floor4Testimonials),
  { ssr: false },
);
const Floor5Rooftop = dynamic(
  () => import("@/components/floors/Floor5Rooftop").then((m) => m.Floor5Rooftop),
  { ssr: false },
);

export default function Home() {
  return (
    <main>
      <a href="#content" className="skip-to-content">
        Skip to content
      </a>
      <Header />
      <MuteButton />
      <ElevatorDoors />

      <ElevatorShell>
        <Floor1Welcome />
        <Floor2Modes />
        <Floor3Install />
        <Floor4Testimonials />
        <Floor5Rooftop />
      </ElevatorShell>
    </main>
  );
}
