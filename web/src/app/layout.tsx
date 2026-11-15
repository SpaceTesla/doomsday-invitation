import type { Metadata, Viewport } from "next";
import { copy } from "@/copy";
import { fontVariables } from "@/styles/fonts";
import "@/styles/app.css";

// The same title and preview for every address, so a forwarded link reveals no name
// and nothing about the event. The site asks not to be indexed.
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
    // The class "js" is added before first paint, so scenes that animate can hold their
    // final frame back until their script takes over (see scenes.css).
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
