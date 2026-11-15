"use client";

import { copy } from "@/copy";
import { FailedToLoad } from "@/components/FailedToLoad";
import { fontVariables } from "@/styles/fonts";
import "@/styles/app.css";

// A failure in the root layout itself. It replaces the whole document, so it brings its
// own html, body, styles and fonts, and the same neutral title as every other page.
export default function GlobalError() {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        <title>{copy["2.9"]}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </head>
      <body>
        <FailedToLoad />
      </body>
    </html>
  );
}
