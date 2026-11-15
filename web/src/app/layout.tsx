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
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
