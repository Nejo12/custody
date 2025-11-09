import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'", // Allow inline scripts (less secure but fixes the issue)
      isDev ? "'unsafe-eval'" : "",
      "'wasm-unsafe-eval'",
      "blob:",
    ]
      .filter(Boolean)
      .join(" ");
    const connectSrc = [
      "'self'",
      "https://api.openai.com",
      isDev ? "http:" : "",
      isDev ? "https:" : "https:",
      isDev ? "ws:" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const csp = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      `connect-src ${connectSrc}`,
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "geolocation=(self), microphone=(self), camera=()" },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/learn/:slug",
        destination: "/learn/item?slug=:slug",
      },
    ];
  },
};

export default nextConfig;
