import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Görsel Optimizasyonu ─────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 2592000,
  },

  // ── Sıkıştırma ────────────────────────────────────────────────────────────────
  compress: true,

  // ── Güvenlik & Performans HTTP Başlıkları ────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)\\.(png|jpg|jpeg|gif|svg|ico|webp|avif|woff2|woff)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ── Yönlendirmeler ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: "/(.*)",
        has: [{ type: "host", value: "www.ogrencikocuadana.com" }],
        destination: "https://ogrencikocuadana.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;