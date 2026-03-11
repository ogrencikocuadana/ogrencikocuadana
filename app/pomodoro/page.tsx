import type { Metadata } from "next";
import PomodoroClient from "./PomodoroClient";

export const metadata: Metadata = {
  title: "Pomodoro Zamanlayıcı | LGS & YKS Çalışma Takibi",
  description:
    "LGS ve YKS hazırlığına özel ücretsiz Pomodoro zamanlayıcı. Klasik 25dk, Derin Odak 50dk ve Maraton 90dk modları, günlük hedef takibi, ders bazlı istatistik ve odak skoru ile çalışmana odaklan.",
  alternates: { canonical: "https://ogrencikocuadana.com/pomodoro" },
  openGraph: {
    title: "Pomodoro Zamanlayıcı | Öğrenci Koçu Adana",
    description:
      "LGS & YKS'ye hazırlanan öğrencilere özel Pomodoro uygulaması. Günlük hedef, ders takibi, ambient ses ve odak skoru bir arada.",
    url: "https://ogrencikocuadana.com/pomodoro",
    type: "website",
  },
};

// JSON-LD: WebApplication schema
const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LGS & YKS Pomodoro Zamanlayıcı",
  url: "https://ogrencikocuadana.com/pomodoro",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "LGS ve YKS öğrencileri için Pomodoro tekniğiyle çalışma zamanlayıcısı. Ders takibi, günlük hedef, odak skoru ve sanal kütüphane özellikleri içerir.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
  featureList: [
    "Klasik 25dk / Derin Odak 50dk / Maraton 90dk / Serbest modları",
    "Ders bazlı çalışma takibi",
    "Günlük hedef ve seri takibi",
    "Odak skoru hesaplama",
    "Ambient ses (yağmur, şömine, orman, okyanus)",
    "LGS & YKS sınav geri sayımı",
    "Sanal kütüphane ve istatistik raporu",
  ],
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
    { "@type": "ListItem", position: 2, name: "Pomodoro Zamanlayıcı", item: "https://ogrencikocuadana.com/pomodoro" },
  ],
};

export default function PomodoroPage() {
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
      <PomodoroClient />
    </>
  );
}