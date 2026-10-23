import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans, Jost, News_Cycle } from "next/font/google";

import { EVENT } from "@/content/event";
import { INTRO_SCRIPT } from "@/lib/intro";
import { SIDE_SCRIPT } from "@/lib/side";

import "./globals.css";

const logo = Archivo({ variable: "--font-archivo", axes: ["wdth"], subsets: ["latin"] });
const display = Jost({ variable: "--font-jost", subsets: ["latin"] });
const body = IBM_Plex_Sans({ variable: "--font-plex", subsets: ["latin"] });
const mono = IBM_Plex_Mono({ variable: "--font-plex-mono", weight: ["400", "500", "700"], subsets: ["latin"] });
const crawl = News_Cycle({ variable: "--font-news", weight: ["400", "700"], subsets: ["latin"] });

const DESCRIPTION = `The ${EVENT.edition}th annual ICPC-style programming contest by ${EVENT.organizerShort}. Teams of up to three, five hours, ${EVENT.contest.dateLabel} at ${EVENT.venue.name}.`;

export const metadata: Metadata = {
  // placeholder: last year's domain; social previews resolve image URLs against it.
  metadataBase: new URL(process.env.SITE_URL ?? "https://nuopen.nuacm.kz"),
  title: `${EVENT.name} 2026 · Episode ${EVENT.episode}: ${EVENT.subtitle}`,
  description: DESCRIPTION,
  openGraph: { title: `${EVENT.name} 2026`, description: DESCRIPTION, type: "website", url: "/" },
};

export const viewport: Viewport = {
  themeColor: "#03040a",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-side="light"
      // The pre-paint script may change data-side before hydration.
      suppressHydrationWarning
      className={`${logo.variable} ${display.variable} ${body.variable} ${mono.variable} ${crawl.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SIDE_SCRIPT + INTRO_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
