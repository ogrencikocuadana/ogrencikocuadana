import type { Metadata } from "next";
import NetHesaplamaClient from "./NetHesaplamaClient";

export const metadata: Metadata = {
  title: "LGS & YKS Net Hesaplama | Puan ve Sıralama Tahmini",
  description:
    "LGS, TYT ve AYT net hesaplama aracı. Doğru/yanlış sayını gir; ham puan, OBP'li yerleştirme puanı ve 3 yıllık karşılaştırmalı tahmini sıralamana ulaş. Ücretsiz.",
  alternates: { canonical: "https://ogrencikocuadana.com/net-hesaplama" },
  openGraph: {
    title: "LGS & YKS Net Hesaplama | Öğrenci Koçu Adana",
    description:
      "Doğru/yanlış sayını gir, anında LGS puanını ve YKS puan türlerini (SAY, EA, SÖZ) hesapla. 3 yıllık karşılaştırmalı sıralama tahmini dahil.",
    url: "https://ogrencikocuadana.com/net-hesaplama",
    type: "website",
  },
};

// JSON-LD: WebApplication schema
const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LGS & YKS Net Hesaplama Aracı",
  url: "https://ogrencikocuadana.com/net-hesaplama",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "LGS, TYT ve AYT sınavları için net hesaplama, puan hesaplama ve tahmini sıralama aracı.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
  provider: {
    "@type": "LocalBusiness",
    name: "Öğrenci Koçu Adana",
    url: "https://ogrencikocuadana.com",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://ogrencikocuadana.com" },
    { "@type": "ListItem", position: 2, name: "Net Hesaplama", item: "https://ogrencikocuadana.com/net-hesaplama" },
  ],
};

export default function NetHesaplamaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <NetHesaplamaClient />
    </>
  );
}