import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog | LGS & YKS Hazırlık Yazıları",
  description:
    "LGS ve YKS hazırlık sürecinde işinize yarayacak içerikler: zaman yönetimi, verimli çalışma teknikleri, sınav kaygısı ve psikolojik dayanıklılık üzerine uzman yazıları.",
  alternates: { canonical: "https://ogrencikocuadana.com/blog" },
  openGraph: {
    title: "Blog | Öğrenci Koçu Adana",
    description:
      "LGS ve YKS öğrencilerine özel: verimli çalışma, zaman yönetimi, sınav kaygısı ve psikolojik dayanıklılık üzerine pratik rehberler.",
    url: "https://ogrencikocuadana.com/blog",
    type: "website",
  },
};

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Öğrenci Koçu Adana Blog",
  url: "https://ogrencikocuadana.com/blog",
  description:
    "LGS ve YKS hazırlık sürecinde öğrencilere yönelik verimli çalışma, zaman yönetimi ve psikolojik dayanıklılık yazıları.",
  publisher: {
    "@type": "LocalBusiness",
    name: "Öğrenci Koçu Adana",
    url: "https://ogrencikocuadana.com",
  },
  blogPost: [
    {
      "@type": "BlogPosting",
      headline: "YKS'ye Nasıl Hazırlanılır? Adım Adım Kapsamlı Rehber",
      url: "https://ogrencikocuadana.com/blog/yks-hazirlik-rehberi",
      datePublished: "2026-02-10",
    },
    {
      "@type": "BlogPosting",
      headline: "LGS'ye Nasıl Hazırlanılır? 8. Sınıf Öğrencileri İçin Kapsamlı Rehber",
      url: "https://ogrencikocuadana.com/blog/lgs-hazirlik-rehberi",
      datePublished: "2026-02-20",
    },
    {
      "@type": "BlogPosting",
      headline: "Sınav Kaygısı Nasıl Yenilir? Psikolojik Dayanıklılık Rehberi",
      url: "https://ogrencikocuadana.com/blog/sinav-kaygisi-nasil-yenilir",
      datePublished: "2026-02-24",
    },
    {
      "@type": "BlogPosting",
      headline: "Deneme Analizi Nasıl Yapılır? Net Artışının Sırrı",
      url: "https://ogrencikocuadana.com/blog/deneme-analizi-nasil-yapilir",
      datePublished: "2026-03-24",
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Ana Sayfa",
      item: "https://ogrencikocuadana.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: "https://ogrencikocuadana.com/blog",
    },
  ],
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogClient />
    </>
  );
}