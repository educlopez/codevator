"use client";

import { ElevatorShell } from "@/components/ElevatorShell";
import { ElevatorDoors } from "@/components/ElevatorDoors";
import { MuteButton } from "@/components/MuteButton";
import { Floor1Welcome } from "@/components/floors/Floor1Welcome";
import { Floor2Modes } from "@/components/floors/Floor2Modes";
import { Floor3Install } from "@/components/floors/Floor3Install";
import { Floor4Testimonials } from "@/components/floors/Floor4Testimonials";
import { Floor5Rooftop } from "@/components/floors/Floor5Rooftop";

export default function Home() {
  return (
    <main>
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
