// app/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// "use client" direktifi metadata ile birlikte kullanılamaz.
// Çözüm: Sayfayı ikiye böldük:
//   • Bu dosya (Server Component) → metadata export eder, JSON-LD yazar
//   • HomeClient.tsx (Client Component) → tüm state/modal/etkileşim mantığı
//
// Şu an page.tsx tek dosyada "use client" + tüm içerik barındırıyor,
// bu yüzden metadata export edilemiyor. Aşağıda ikisi bir arada çalışacak
// şekilde düzenledik: metadata ayrı export, geri kalan kod aynı.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import HomeClient from "./HomeClient"; // ← Aşağıda oluşturuyoruz

// ─── Sayfa Metadata (SEO) ────────────────────────────────────────────────────
// layout.tsx'teki title.template ile birleşince:
// "Öğrenci Koçu Adana | LGS & YKS Koçluk | Akademik Başarı — Adana'nın Uzman Koçu"
export const metadata: Metadata = {
  title: "Adana'nın LGS & YKS Koçu | Bireysel Akademik Koçluk",
  description:
    "Adana'da LGS ve YKS öğrencilerine özel bireysel akademik koçluk, psikolojik dayanıklılık eğitimi, haftalık takip ve deneme analizi. Online ve yüz yüze seçeneklerle — ilk görüşme ücretsiz.",
  alternates: {
    canonical: "https://ogrencikocuadana.com",
  },
  openGraph: {
    title: "Öğrenci Koçu Adana | LGS & YKS Koçu",
    description:
      "Adana'da LGS ve YKS öğrencilerine özel bireysel akademik koçluk. İlk görüşme ücretsiz.",
    url: "https://ogrencikocuadana.com",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Öğrenci Koçu Adana" }],
  },
};

// ─── JSON-LD: FAQPage ────────────────────────────────────────────────────────
// Google arama sonuçlarında doğrudan "Sıkça Sorulan Sorular" olarak görünür.
// Bu, tıklama oranını (CTR) ciddi ölçüde artırır.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "LGS koçluğu nedir ve nasıl işliyor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LGS koçluğu, 8. sınıf öğrencilerine haftalık bireysel görüşmeler, deneme analizi ve kişisel çalışma planı ile sistematik destek sunar. Adana'da yüz yüze veya online olarak hizmet veriyoruz.",
      },
    },
    {
      "@type": "Question",
      name: "YKS koçluğu ile özel dersin farkı nedir?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Özel ders konu anlatımına odaklanırken, YKS koçluğu çalışma sistemi, zaman yönetimi, psikolojik dayanıklılık ve deneme analizi gibi konularla bütüncül bir akademik performans modeli sunar.",
      },
    },
    {
      "@type": "Question",
      name: "Online koçluk nasıl yapılıyor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Online koçluk görüşmeleri video konferans aracılığıyla, haftada bir gerçekleşir. Öğrenciler haftalık takip, deneme analizi ve seminerlere online olarak katılım sağlar.",
      },
    },
    {
      "@type": "Question",
      name: "Kaç öğrenci ile çalışıyorsunuz?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kaliteyi korumak için maksimum 30 öğrenci ile çalışıyoruz. Bireysel takibin etkinliğini sağlamak adına kontenjanımız sınırlıdır.",
      },
    },
    {
      "@type": "Question",
      name: "Ön görüşme ücretsiz mi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evet, ilk ön görüşme tamamen ücretsizdir. Bu görüşmede öğrencinin mevcut durumu değerlendirilerek en uygun program belirlenir.",
      },
    },
  ],
};

// ─── JSON-LD: Service ────────────────────────────────────────────────────────
// Sunduğunuz hizmetlerin yapısal verisi — Google'ın hizmet kartları için.
const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Akademik Koçluk",
  provider: {
    "@type": "LocalBusiness",
    name: "Öğrenci Koçu Adana",
    url: "https://ogrencikocuadana.com",
  },
  areaServed: { "@type": "City", name: "Adana" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Koçluk Paketleri",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Akademik Performans Paketi",
          description:
            "Haftalık bireysel koçluk, özel akademik planlama, deneme analizi ve aylık performans raporu.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Akademik Performans ve Psikolojik Dayanıklılık Paketi",
          description:
            "Akademik koçluk + haftalık seminer, sınav kaygısı yönetimi, zaman yönetimi ve hızlı okuma eğitimi.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Sınav Odaklı Hızlı Okuma Programı",
          description:
            "4 haftalık online eğitim, 21 günlük ödev sistemi, Moxo Dikkat Testi ve veli rapor sistemi.",
        },
      },
    ],
  },
};

// ─── Ana Sayfa (Server Component) ────────────────────────────────────────────
export default function Page() {
  return (
    <>
      {/* JSON-LD yapısal verileri */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {/* Tüm etkileşimli içerik HomeClient'ta */}
      <HomeClient />
    </>
  );
}