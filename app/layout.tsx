import "./globals.css";
import { Sora } from "next/font/google";
import Navbar from "./components/Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";

// ─── Font ────────────────────────────────────────────────────────────────────
// Sora: proje brief'indeki asıl font. Latin + Latin-ext ile Türkçe karakterler
// (ş, ğ, ü, ö, ç, ı) tam desteklenir.
// display:"swap" → LCP'yi bloklamaz, FOUT yerine FOIT yaşanmaz.
// preload:true   → kritik font dosyası <link rel="preload"> ile önceden yüklenir.
const sora = Sora({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
  variable: "--font-sora",
});

// ─── Site-geneli Metadata ─────────────────────────────────────────────────────
// Her sayfa kendi metadata'sını export edebilir; buradaki değerler fallback olarak
// kullanılır (template pattern ile).
export const metadata: Metadata = {
  // title.template → alt sayfalarda "Net Hesaplama | Öğrenci Koçu Adana" gibi
  // title.default  → yalnızca layout seviyesinde (hiçbir sayfa override etmezse)
  title: {
    template: "%s | Öğrenci Koçu Adana",
    default:
      "Öğrenci Koçu Adana | LGS & YKS Koçluk | Akademik Başarı ve Sınav Hazırlığı",
  },
  description:
    "Adana'nın uzman LGS ve YKS koçu. Bireysel akademik koçluk, psikolojik dayanıklılık eğitimi, haftalık takip, deneme analizi. Online ve yüz yüze seçeneklerle.",
  metadataBase: new URL("https://ogrencikocuadana.com"),
  alternates: {
    canonical: "https://ogrencikocuadana.com",
  },
  // Anahtar kelimeler: Google resmi olarak keywords meta'ya ağırlık vermez,
  // ancak bazı arama motorları (Yandex, Bing) hâlâ değerlendiriyor.
  keywords: [
    "öğrenci koçu adana",
    "lgs koçu adana",
    "yks koçu adana",
    "adana lgs koçu",
    "adana yks koçu",
    "akademik koçluk adana",
    "lgs hazırlık adana",
    "yks hazırlık adana",
    "sınav koçu adana",
    "psikolojik dayanıklılık eğitimi",
    "online lgs koçu",
    "online yks koçu",
    "bireysel ders adana",
    "yks puan hesaplama",
    "tyt sıralama hesaplama",
    "pomodoro tekniği",
  ],

  // ── Open Graph ──────────────────────────────────────────────────────────────
  openGraph: {
    title: "Öğrenci Koçu Adana | LGS & YKS Koçu",
    description:
      "Adana'nın uzman LGS ve YKS koçu. Bireysel akademik koçluk, psikolojik dayanıklılık eğitimi. Online ve yüz yüze.",
    url: "https://ogrencikocuadana.com",
    siteName: "Öğrenci Koçu Adana",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/og-image.png",   // public/og-image.png → 1200×630 px önerilir
        width: 1200,
        height: 630,
        alt: "Öğrenci Koçu Adana — LGS ve YKS Koçu",
      },
    ],
  },

  // ── Twitter / X Card ────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "Öğrenci Koçu Adana | LGS & YKS Koçu",
    description:
      "Adana'nın uzman LGS ve YKS koçu. Bireysel akademik koçluk ve psikolojik dayanıklılık eğitimi.",
    images: ["/og-image.png"],
  },

  // ── Robots ──────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  // ── Google Search Console doğrulama ────────────────────────────────────────
  verification: {
    google: "hcEpeTsta9BYeI_63ruaZco1k3_92EYv9l9yHDMLNVw",
  },
};

// ─── JSON-LD: LocalBusiness ───────────────────────────────────────────────────
// Google'ın yerel işletme kartı (Knowledge Panel) için yapısal veri.
// Adana aramaları için kritik öneme sahip.
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://ogrencikocuadana.com/#organization",
  name: "Öğrenci Koçu Adana",
  description:
    "Adana'da LGS ve YKS öğrencilerine özel bireysel akademik koçluk, psikolojik dayanıklılık eğitimi ve sınav hazırlık hizmetleri.",
  url: "https://ogrencikocuadana.com",
  logo: "https://ogrencikocuadana.com/logo.png",
  image: "https://ogrencikocuadana.com/og-image.png",
  telephone: "+90-547-380-38-01", // ← kendi numaranızla değiştirin
  email: "ogrencikocuadana@gmail.com", // ← kendi e-postanızla değiştirin
  address: {
    "@type": "PostalAddress",
    addressLocality: "Adana",
    addressRegion: "Adana",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 37.0475157,
    longitude: 35.3033051, // ← iş yerinizin koordinatlarıyla güncelleyin
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "21:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "10:00",
      closes: "18:00",
    },
  ],
  areaServed: [
    { "@type": "City", name: "Adana" },
    { "@type": "Country", name: "Türkiye" },
  ],
  serviceType: [
    "LGS Koçluğu",
    "YKS Koçluğu",
    "Akademik Koçluk",
    "Psikolojik Dayanıklılık Eğitimi",
  ],
  priceRange: "₺₺",
  sameAs: [
    // Sosyal medya hesaplarınızı buraya ekleyin
    // "https://www.instagram.com/ogrencikocuadana",
    // "https://www.youtube.com/@ogrencikocuadana",
  ],
};

// ─── JSON-LD: WebSite (Sitelinks Searchbox) ───────────────────────────────────
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://ogrencikocuadana.com/#website",
  url: "https://ogrencikocuadana.com",
  name: "Öğrenci Koçu Adana",
  description: "LGS ve YKS öğrencileri için ücretsiz araçlar ve koçluk hizmetleri",
  inLanguage: "tr-TR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://ogrencikocuadana.com/blog?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`scroll-smooth ${sora.variable}`}>
      <head>
        {/* JSON-LD yapısal verileri — <head> içinde olmak zorunda */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${sora.className} bg-white text-slate-900`}
        // antialiased → macOS'ta font render kalitesini artırır
        style={{ WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}
      >
        <Navbar />
        {/* Navbar yüksekliği kadar boşluk — fixed navbar'ın içeriği örtmemesi için */}
        <div className="h-20" aria-hidden="true" />
        {children}
      </body>
      {/* GoogleAnalytics — <body> SONRASI değil, <html> içinde olmalı.
          @next/third-parties bu scripti otomatik olarak <head>'e yerleştirir. */}
      <GoogleAnalytics gaId="G-NNBBQFHR54" />
    </html>
  );
}