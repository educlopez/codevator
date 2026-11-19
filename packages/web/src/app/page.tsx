"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { ElevatorShell } from "@/components/ElevatorShell";
import { ElevatorDoors } from "@/components/ElevatorDoors";
import { MuteButton } from "@/components/MuteButton";
import { Floor1Welcome } from "@/components/floors/Floor1Welcome";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

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

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux",
  url: SITE_URL,
  downloadUrl: "https://www.npmjs.com/package/codevator",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Eduardo Calvo Lopez",
    url: "https://github.com/educlopez",
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
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
