import type { Metadata } from "next";
import { Instrument_Serif, Inter, IBM_Plex_Mono, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const siteUrl = "https://codevator.dev";
const title = "Codevator — Background music for AI coding agents";
const description =
  "Background music that plays while your AI agent codes and stops when it's done. 15 sounds, 7 agents supported. Free and open source.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Codevator",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Codevator — Background music for AI coding agents, with terminal UI and 15 built-in sounds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable} ${ibmPlexMono.variable} ${caveat.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Codevator",
              description,
              url: siteUrl,
              author: {
                "@type": "Person",
                name: "Eduardo Calvo Lopez",
                url: "https://github.com/educlopez",
              },
            }),
          }}
        />
        {children}
        <Analytics />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="fa4a31fe-398a-4936-925f-c6e507c74793" />
      </body>
    </html>
  );
}
