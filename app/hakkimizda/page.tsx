// app/hakkimizda/page.tsx
// Server Component — metadata burada, etkileşim HakkimizdaClient'ta

import type { Metadata } from "next";
import HakkimizdaClient from "./HakkimizdaClient";

export const metadata: Metadata = {
  title: "Hakkımızda — Cumali & Şükran Özdemir",
  description:
    "Psikolojik Danışman Cumali Özdemir ve Uzman Psikolojik Danışman Şükran Özdemir. " +
    "Adana'da LGS ve YKS öğrencilerine akademik koçluk ve psikolojik danışmanlık hizmeti. " +
    "İki uzman danışman, 8 yıllık deneyim.",
  alternates: { canonical: "https://ogrencikocuadana.com/hakkimizda" },
  openGraph: {
    title: "Hakkımızda | Öğrenci Koçu Adana",
    description:
      "Cumali & Şükran Özdemir — İki uzman psikolojik danışman, 8 yıllık deneyim. " +
      "Adana'da LGS ve YKS öğrencilerine bütüncül destek.",
    url: "https://ogrencikocuadana.com/hakkimizda",
  },
};

const personJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Cumali Özdemir",
    jobTitle: "Psikolojik Danışman & Öğrenci Koçu",
    alumniOf: { "@type": "CollegeOrUniversity", name: "Hasan Kalyoncu Üniversitesi" },
    worksFor: { "@type": "LocalBusiness", name: "Öğrenci Koçu Adana" },
    url: "https://ogrencikocuadana.com/hakkimizda",
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Şükran Özdemir",
    jobTitle: "Uzman Psikolojik Danışman & Öğrenci Koçu",
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Erciyes Üniversitesi" },
      { "@type": "CollegeOrUniversity", name: "İstanbul Cerrahpaşa Üniversitesi" },
    ],
    worksFor: { "@type": "LocalBusiness", name: "Öğrenci Koçu Adana" },
    url: "https://ogrencikocuadana.com/hakkimizda",
  },
];

export default function HakkimizdaPage() {
  return (
    <>
      {personJsonLd.map((p, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(p) }}
        />
      ))}
      <HakkimizdaClient />
    </>
  );
}