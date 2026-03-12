import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, posts } from "../data/posts";
import { Metadata } from "next";
import ReadingProgress from "../../components/ReadingProgress";
import PostNavigation from "../../components/PostNavigation";
import ShareButtons from "../../components/ShareButtons";

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Öğrenci Koçu Adana`,
    description: post.description,
    alternates: {
      canonical: `https://ogrencikocuadana.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://ogrencikocuadana.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: ["Öğrenci Koçu Adana"],
      tags: [post.category, "LGS", "YKS", "Adana", "akademik koçluk"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  "LGS Hazırlık":            { bg: "rgba(219,234,254,0.25)", text: "#93c5fd" },
  "YKS Hazırlık":            { bg: "rgba(254,215,170,0.25)", text: "#fdba74" },
  "Zaman Yönetimi":          { bg: "rgba(187,247,208,0.25)", text: "#86efac" },
  "Verimli Çalışma":         { bg: "rgba(233,213,255,0.25)", text: "#d8b4fe" },
  "Sınav Kaygısı":           { bg: "rgba(254,205,211,0.25)", text: "#fda4af" },
  "Psikolojik Dayanıklılık": { bg: "rgba(167,243,208,0.25)", text: "#6ee7b7" },
};

const POMODORO_KEYWORDS = ["pomodoro", "pomodoro tekniği", "25 dakika"];
const NET_KEYWORDS = ["net hesaplama", "net hesapla", "puan hesaplama", "puan hesapla"];

// Araç kutusu: yazı içinde araç linklerini belirgin göster
function ToolBox({ href, icon, label, desc }: { href: string; icon: string; label: string; desc: string }) {
  return (
    `<a href="${href}" style="display:inline-flex;align-items:center;gap:12px;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:12px;padding:12px 18px;text-decoration:none;margin:4px 0;" title="${desc}">
      <span style="font-size:1.3rem">${icon}</span>
      <span style="display:flex;flex-direction:column;gap:2px;">
        <span style="color:#1e3a8a;font-weight:700;font-size:0.88rem">${label} →</span>
        <span style="color:#6b7280;font-size:0.75rem">${desc}</span>
      </span>
    </a>`
  );
}

function renderContent(content: string, slug: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let pomodoroLinked = false;
  let netLinked = false;

  const injectToolLinks = (text: string): string => {
    let result = text;

    // Pomodoro linki
    if (!pomodoroLinked) {
      for (const kw of POMODORO_KEYWORDS) {
        const regex = new RegExp(`(${kw})`, "i");
        if (regex.test(result)) {
          pomodoroLinked = true;
          result = result.replace(
            regex,
            `<a href="/pomodoro" style="color:#1e3a8a;font-weight:700;text-decoration:underline;text-underline-offset:3px;background:#eff6ff;padding:1px 6px;border-radius:4px;" title="Ücretsiz Pomodoro aracımızı deneyin">$1 ⏱</a>`
          );
          break;
        }
      }
    }

    // Net hesaplama linki
    if (!netLinked) {
      for (const kw of NET_KEYWORDS) {
        const regex = new RegExp(`(${kw})`, "i");
        if (regex.test(result)) {
          netLinked = true;
          result = result.replace(
            regex,
            `<a href="/net-hesaplama" style="color:#c2410c;font-weight:700;text-decoration:underline;text-underline-offset:3px;background:#fff7ed;padding:1px 6px;border-radius:4px;" title="Ücretsiz net hesaplama aracımızı deneyin">$1 🎯</a>`
          );
          break;
        }
      }
    }

    return result;
  };

  const parseInline = (text: string): string => {
    let result = text.replace(
      /\*\*(.*?)\*\*/g,
      '<strong style="color:#0f1f4f">$1</strong>'
    );
    result = injectToolLinks(result);
    return result;
  };

  // Numaralı liste mi kontrol et (1. veya 1-)
  const isNumberedItem = (line: string): boolean => /^\d+[\.\-]\s/.test(line);
  const getNumberedText = (line: string): string => line.replace(/^\d+[\.\-]\s/, "");

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.45rem",
          fontWeight: 700,
          color: "#0f1f4f",
          marginTop: 48,
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: "2px solid #f3f4f6",
        }}>
          {line.replace("## ", "")}
        </h2>
      );

    } else if (line.startsWith("- ")) {
      // Madde işaretli liste
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].replace("- ", ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ paddingLeft: 0, marginBottom: 24, listStyle: "none" }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1e3a8a", flexShrink: 0, marginTop: 11 }} />
              <span
                style={{ color: "#374151", lineHeight: 1.8, fontSize: "1.02rem" }}
                dangerouslySetInnerHTML={{ __html: parseInline(item) }}
              />
            </li>
          ))}
        </ul>
      );
      continue;

    } else if (isNumberedItem(line)) {
      // Numaralı liste — düzgün ol sırayla göster
      const items: string[] = [];
      while (i < lines.length && isNumberedItem(lines[i])) {
        items.push(getNumberedText(lines[i]));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ paddingLeft: 0, marginBottom: 24, listStyle: "none", counterReset: "list-counter" }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <span style={{
                minWidth: 28, height: 28,
                background: "#0f1f4f", color: "white",
                borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "0.78rem", fontWeight: 700, flexShrink: 0,
                marginTop: 2,
              }}>
                {j + 1}
              </span>
              <span
                style={{ color: "#374151", lineHeight: 1.8, fontSize: "1.02rem" }}
                dangerouslySetInnerHTML={{ __html: parseInline(item) }}
              />
            </li>
          ))}
        </ol>
      );
      continue;

    } else if (line.startsWith("---")) {
      elements.push(
        <hr key={i} style={{ border: "none", borderTop: "2px solid #f3f4f6", margin: "40px 0" }} />
      );

    } else if (line.startsWith("| ")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].startsWith("|--")) tableLines.push(lines[i]);
        i++;
      }
      const [header, ...rows] = tableLines;
      const headers = header.split("|").filter(Boolean).map((h) => h.trim());
      elements.push(
        <div key={`table-${i}`} style={{ overflowX: "auto", marginBottom: 28, borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#1e3a8a" }}>
                {headers.map((h, j) => (
                  <th key={j} style={{ color: "white", padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, j) => {
                const cells = row.split("|").filter(Boolean).map((c) => c.trim());
                return (
                  <tr key={j} style={{ background: j % 2 === 0 ? "white" : "#f8faff" }}>
                    {cells.map((cell, k) => (
                      <td key={k} style={{ padding: "11px 16px", color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{cell}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;

    } else if (line.trim() !== "") {
      elements.push(
        <p key={i} style={{ color: "#374151", lineHeight: 1.9, marginBottom: 20, fontSize: "1.02rem" }}
          dangerouslySetInnerHTML={{ __html: parseInline(line) }}
        />
      );
    }
    i++;
  }
  return elements;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const postIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = postIndex > 0 ? posts[postIndex - 1] : null;
  const nextPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null;

  const catColor = categoryColors[post!.category] ?? { bg: "rgba(255,255,255,0.15)", text: "#bfdbfe" };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post!.title,
    description: post!.description,
    url: `https://ogrencikocuadana.com/blog/${post!.slug}`,
    datePublished: post!.date,
    dateModified: post!.date,
    author: { "@type": "Organization", name: "Öğrenci Koçu Adana", url: "https://ogrencikocuadana.com" },
    publisher: { "@type": "Organization", name: "Öğrenci Koçu Adana", url: "https://ogrencikocuadana.com" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://ogrencikocuadana.com/blog/${post!.slug}` },
    articleSection: post!.category,
    keywords: `${post!.category}, LGS, YKS, Adana, akademik koçluk, öğrenci koçu`,
    inLanguage: "tr-TR",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://ogrencikocuadana.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://ogrencikocuadana.com/blog" },
      { "@type": "ListItem", position: 3, name: post!.title, item: `https://ogrencikocuadana.com/blog/${post!.slug}` },
    ],
  };

  // Araç kutuları — yazıya göre hangileri gösterilsin
  const showPomodoro = post!.content.toLowerCase().includes("pomodoro") || post!.category === "Verimli Çalışma" || post!.category === "Zaman Yönetimi";
  const showNet = post!.content.toLowerCase().includes("net") && (post!.category === "YKS Hazırlık" || post!.category === "LGS Hazırlık");

  return (
    <main style={{ minHeight: "100vh", background: "white" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ReadingProgress />

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(150deg, #0f1f4f, #1e3a8a)", padding: "72px 16px 88px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <Link href="/blog" style={{ color: "#93c5fd", fontSize: "0.88rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
              Blog
            </Link>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem" }}>{post!.category}</span>
          </nav>

          <span style={{ fontSize: "0.72rem", fontWeight: 700, background: catColor.bg, color: catColor.text, padding: "5px 14px", borderRadius: 9999, display: "inline-block", marginBottom: 22, border: `1px solid ${catColor.text}33`, letterSpacing: "0.04em" }}>
            {post!.category}
          </span>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "white", lineHeight: 1.28, marginBottom: 20 }}>
            {post!.title}
          </h1>

          <p style={{ color: "#93c5fd", fontSize: "1rem", lineHeight: 1.75, marginBottom: 30, maxWidth: 600 }}>
            {post!.description}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.55)", fontSize: "0.82rem" }}>
              📅 {new Date(post!.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.55)", fontSize: "0.82rem" }}>
              ⏱ {post!.readTime} okuma
            </span>
          </div>
        </div>
      </div>

      {/* ── Makale içeriği ── */}
      {/* maxWidth 680 → satırlar daha kısa, okuma konforu artar */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "56px 20px 0" }}>
        <article>
          {renderContent(post!.content, slug)}
        </article>

        {/* ── Araç kutuları ── */}
        {(showPomodoro || showNet) && (
          <div style={{ marginTop: 48, padding: "28px 28px", background: "#f8faff", borderRadius: 16, border: "1px solid #e0eaff" }}>
            <p style={{ color: "#6b7280", fontSize: "0.82rem", fontWeight: 600, marginBottom: 14, letterSpacing: "0.05em" }}>
              🔧 BU YAZIDA BAHSEDILEN ARAÇLAR
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {showPomodoro && (
                <Link href="/pomodoro" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "white", border: "1.5px solid #bfdbfe", borderRadius: 12,
                  padding: "12px 18px", textDecoration: "none",
                }}>
                  <span style={{ fontSize: "1.3rem" }}>⏱</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ color: "#1e3a8a", fontWeight: 700, fontSize: "0.88rem" }}>Pomodoro Zamanlayıcısı →</span>
                    <span style={{ color: "#9ca3af", fontSize: "0.73rem" }}>Ücretsiz, tarayıcıda çalışır</span>
                  </span>
                </Link>
              )}
              {showNet && (
                <Link href="/net-hesaplama" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "white", border: "1.5px solid #fed7aa", borderRadius: 12,
                  padding: "12px 18px", textDecoration: "none",
                }}>
                  <span style={{ fontSize: "1.3rem" }}>🎯</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ color: "#c2410c", fontWeight: 700, fontSize: "0.88rem" }}>Net Hesaplama Aracı →</span>
                    <span style={{ color: "#9ca3af", fontSize: "0.73rem" }}>YKS puan hesapla</span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── CTA bloğu ── */}
        <div style={{ marginTop: 56, background: "linear-gradient(135deg, #1e3a8a, #1e40af)", borderRadius: 20, padding: "40px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.55rem", fontWeight: 800, color: "white", marginBottom: 12 }}>
            Sistematik bir destek almak ister misiniz?
          </h3>
          <p style={{ color: "#bfdbfe", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 28px" }}>
            Ücretsiz ön görüşmede mevcut durumunuzu değerlendirir, size özel bir yol haritası çiziriz.
          </p>
          <Link href="/#İletişim" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", color: "#1e3a8a", padding: "14px 32px", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: "1rem", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
            Ücretsiz Ön Görüşme Planla →
          </Link>
        </div>

        <ShareButtons title={post!.title} slug={slug} />
        <PostNavigation prevPost={prevPost} nextPost={nextPost} />

        <div style={{ textAlign: "center", margin: "40px 0 80px" }}>
          <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#1e3a8a", fontWeight: 600, textDecoration: "none", padding: "11px 24px", border: "2px solid #bfdbfe", borderRadius: 10, fontSize: "0.88rem" }}>
            ← Tüm Yazılara Dön
          </Link>
        </div>
      </div>
    </main>
  );
}