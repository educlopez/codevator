import type { Metadata } from "next";
import { Instrument_Serif, Inter, IBM_Plex_Mono, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ActivityBeacon } from "@/components/ActivityBeacon";
import { WebMcpScript } from "@/components/WebMcpScript";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";
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

const title = SITE_TITLE;
const description = SITE_DESCRIPTION;

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    types: {
      "text/markdown": "/",
      "application/linkset+json": "/.well-known/api-catalog",
    },
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
      <head>
        <link rel="api-catalog" href="/.well-known/api-catalog" type="application/linkset+json" />
        <link rel="service-desc" href="/openapi.json" type="application/vnd.oai.openapi+json" />
        <link rel="service-doc" href="/docs" type="text/html" />
        <link rel="describedby" href="/.well-known/ai-catalog.json" type="application/json" />
        <link rel="describedby" href="/.well-known/agent-skills/index.json" type="application/json" />
        <link rel="alternate" type="text/markdown" href="/" />
      </head>
      <body className="font-sans">
        <WebMcpScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Codevator",
              description,
              url: SITE_URL,
              author: {
                "@type": "Person",
                name: "Eduardo Calvo Lopez",
                url: "https://github.com/educlopez",
              },
            }),
          }}
        />
        {children}
        <ActivityBeacon />
        <Analytics />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="fa4a31fe-398a-4936-925f-c6e507c74793" />
      </body>
    </html>
  );
}
