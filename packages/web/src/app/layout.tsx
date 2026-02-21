import type { Metadata } from "next";
import { Instrument_Serif, Inter, IBM_Plex_Mono, Caveat } from "next/font/google";
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

const siteUrl = "https://codevator.com";
const title = "Codevator — Elevator music for your AI coding agent";
const description =
  "Elevator music, retro beats, and ambient vibes while your coding agent thinks. Your AI is working. Enjoy the ride.";

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
    url: siteUrl,
    siteName: "Codevator",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Codevator — Elevator music for your coding agent",
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
              "@type": "SoftwareApplication",
              name: "Codevator",
              description,
              url: siteUrl,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "macOS, Linux",
              downloadUrl: "https://www.npmjs.com/package/codevator",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              author: {
                "@type": "Person",
                name: "Eduardo Calvo Lopez",
                url: "https://github.com/educlopez",
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
