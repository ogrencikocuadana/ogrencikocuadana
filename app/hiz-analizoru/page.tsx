import type { Metadata } from "next";
import HizAnalizorClient from "./HizAnalizorClient";

export const metadata: Metadata = {
  title: "Kaç Net Kaç Dakika? | LGS & YKS Hız Analizörü",
  description:
    "LGS, TYT ve AYT denemeleri için hız analizi aracı. Her testte kaç neti kaç dakikada yaptığını gir; hızlı mı yavaş mı öğren, süre dağılımını optimize et.",
  alternates: { canonical: "https://ogrencikocuadana.com/hiz-analizoru" },
  openGraph: {
    title: "Kaç Net Kaç Dakika? | Hız Analizörü – Öğrenci Koçu Adana",
    description:
      "Deneme sınavında her branşa ayırdığın süreyi analiz et. Nerede zaman kaybettiğini gör, optimal süre dağılımını öğren.",
    url: "https://ogrencikocuadana.com/hiz-analizoru",
    type: "website",
  },
};

// JSON-LD: WebApplication schema
const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LGS & YKS Hız Analizörü — Kaç Net Kaç Dakika",
  url: "https://ogrencikocuadana.com/hiz-analizoru",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "Deneme sınavı hız analizi: her branştan kaç neti kaç dakikada yaptığını gir, tempo değerlendirmesi ve önerilen süre dağılımını al.",
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
    { "@type": "ListItem", position: 2, name: "Hız Analizörü", item: "https://ogrencikocuadana.com/hiz-analizoru" },
  ],
};

export default function HizAnalizorPage() {
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
      <HizAnalizorClient />
    </>
  );
}