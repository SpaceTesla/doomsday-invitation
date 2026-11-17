import type { Metadata, Viewport } from "next";
import { copy } from "@/copy";
import { fontVariables } from "@/styles/fonts";
import "@/styles/app.css";

// The same title and preview for every address, so a forwarded link reveals no name
// and nothing about the event. The site asks not to be indexed.
// The title is set twice on purpose. Here, for the pages Next.js renders without the layout
// (an invalid link's 404 shell carries only the metadata). And in the layout below, because
// Next.js renders metadata in a boundary that can suspend while a refresh streams in, and
// the title then vanishes for a moment (axe caught it on a slower machine); the layout's
// is never unmounted. Both say the same thing; the first in the document is the one used.
export const metadata: Metadata = {
  title: copy["2.9"],
  description: copy["2.11"],
  openGraph: { title: copy["2.10"], description: copy["2.11"], type: "website" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: "#0a0d12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Scenes that animate hold their final frame back until their script takes over; the
    // stylesheet asks whether scripts run with @media (scripting: enabled) (see scenes.css).
    <html lang="en" className={fontVariables}>
      <head>
        <title>{copy["2.9"]}</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
