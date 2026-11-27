import type { NextConfig } from "next";

// React/Turbopack uses eval() for development-only debugging and source maps.
// Keep it disabled in production, where application code does not require it.
const scriptSource = process.env.NODE_ENV === "development"
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com"
  : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src 'self' https://www.google.com https://maps.google.com",
      "object-src 'none'",
      scriptSource,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // Google Analytics 4 sends hits to all of these; with only
      // *.google-analytics.com allowed, every page view was blocked.
      "connect-src 'self' https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://www.google.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 88, 90],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // The old admin screens were replaced by the task-based admin. Send old
  // bookmarks and links to the screen that does the same job now.
  async redirects() {
    const to = (source: string, destination: string) => ({ source, destination, permanent: false });
    return [
      to("/admin/dashboard", "/admin"),
      to("/admin/pos", "/admin/sale"),
      to("/admin/counter", "/admin/sale"),
      to("/admin/invoices", "/admin/bills"),
      to("/admin/invoices/:id", "/admin/bills/:id"),
      to("/admin/payments", "/admin/take-payment"),
      to("/admin/eye-tests", "/admin/eye-test"),
      to("/admin/eye-tests/new", "/admin/eye-test"),
      to("/admin/customers/new", "/admin/customers"),
      to("/admin/customers/:id", "/admin/customers?q=:id"),
      to("/admin/inventory", "/admin/stock"),
      to("/admin/purchases", "/admin/stock?tab=deliveries"),
      to("/admin/suppliers", "/admin/stock?tab=suppliers"),
      to("/admin/expenses", "/admin/money"),
      to("/admin/reports", "/admin/report"),
      to("/admin/staff", "/admin/settings?tab=staff"),
      to("/admin/audit", "/admin/settings?tab=activity"),
      to("/admin/products/:shelf(frames|lenses|sunglasses)", "/admin/products"),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/api/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/:all*(svg|jpg|png|webp|avif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
