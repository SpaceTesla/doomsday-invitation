import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// A static policy: no middleware, so no nonces (docs/ARCHITECTURE.md, section 7.4).
// Nothing but our own origin is allowed. Inline scripts and styles are allowed
// because Next.js needs them for hydration; 'unsafe-eval' is for development only.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self'",
  "font-src 'self'",
  "media-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const privateNoStore = [{ key: "Cache-Control", value: "private, no-store" }];
const longLived = [{ key: "Cache-Control", value: "public, max-age=2592000" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: privateNoStore },
      { source: "/s/:path*", headers: privateNoStore },
      { source: "/throne/:path*", headers: privateNoStore },
      ...(isDev
        ? []
        : [
            { source: "/art/:path*", headers: longLived },
            { source: "/icons/:path*", headers: longLived },
          ]),
    ];
  },
};

export default nextConfig;
