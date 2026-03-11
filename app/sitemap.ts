// app/sitemap.ts
// Next.js App Router'ın MetadataRoute.Sitemap API'si ile dinamik sitemap.
// Bu dosya app/ klasörüne koyulduğunda otomatik olarak /sitemap.xml endpoint'i oluşturur.
// Blog yazıları için CMS/dosya sistemi ile dinamik genişletilebilir.

import { MetadataRoute } from "next";
import { posts } from "./data/posts";

// Blog yazılarınız bir CMS veya MDX dosya sistemindeyse buraya entegre edin.
// Şimdilik statik slug örnekleri mevcut:


export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ogrencikocuadana.com";
  const now = new Date();

  // ── Statik sayfalar ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,   // Ana sayfa — en yüksek öncelik
    },
    {
      url: `${baseUrl}/net-hesaplama`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,   // Yüksek arama hacimli araç sayfası
    },
    {
      url: `${baseUrl}/pomodoro`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hiz-analizoru`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // ── Dinamik blog yazıları ────────────────────────────────────────────────────
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}