import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Görsel Optimizasyonu ─────────────────────────────────────────────────────
  images: {
    // Modern formatlar: WebP → AVIF sırasıyla denenir, desteklenmiyorsa orijinal
    formats: ["image/avif", "image/webp"],
    // Responsive boyutlar — next/image'ın srcset üretimi için
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Görseller CDN veya harici kaynaktan geliyorsa buraya domain ekleyin:
    // remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    // Görselleri agresif şekilde önbelleğe al (saniye cinsinden — 30 gün)
    minimumCacheTTL: 2592000,
  },

  // ── Sıkıştırma ────────────────────────────────────────────────────────────────
  // Vercel'de zaten Gzip/Brotli var; self-hosted için faydalı.
  compress: true,

  // ── Güvenlik & Performans HTTP Başlıkları ────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Clickjacking koruması
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // MIME-type sniffing koruması
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer bilgisi — Analytics için "same-origin" kısmı korunur
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // XSS koruması (modern tarayıcılarda CSP daha etkili, eski için)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // İzin verilmeyen tarayıcı özelliklerini kapat
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Statik varlıklar için agresif önbellekleme (1 yıl)
      // next/image, _next/static ve public klasörü için
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)\\.(png|jpg|jpeg|gif|svg|ico|webp|avif|woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ── Yönlendirmeler ────────────────────────────────────────────────────────────
  // www → non-www canonical yönlendirmesi (çift içerik sorununu önler)
  async redirects() {
    return [
      {
        source: "/(.*)",
        has: [{ type: "host", value: "www.ogrencikocuadana.com" }],
        destination: "https://ogrencikocuadana.com/:path*",
        permanent: true, // 301
      },
    ];
  },
};

export default nextConfig;