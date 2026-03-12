"use client";

import { useState } from "react";
import Link from "next/link";
import { posts, Post } from "./data/posts";

const ALL = "Tümü";
const categories: string[] = [ALL, ...Array.from(new Set<string>(posts.map((p: Post) => p.category)))];

const categoryColors: Record<string, { bg: string; text: string; activeBg: string; activeText: string; accent: string }> = {
  "LGS Hazırlık":            { bg: "#eff6ff", text: "#1e40af", activeBg: "#1e3a8a", activeText: "white", accent: "#3b82f6" },
  "YKS Hazırlık":            { bg: "#fff7ed", text: "#c2410c", activeBg: "#c2410c", activeText: "white", accent: "#f97316" },
  "Zaman Yönetimi":          { bg: "#f0fdf4", text: "#15803d", activeBg: "#15803d", activeText: "white", accent: "#22c55e" },
  "Verimli Çalışma":         { bg: "#faf5ff", text: "#7c3aed", activeBg: "#7c3aed", activeText: "white", accent: "#a855f7" },
  "Sınav Kaygısı":           { bg: "#fff1f2", text: "#be123c", activeBg: "#be123c", activeText: "white", accent: "#f43f5e" },
  "Psikolojik Dayanıklılık": { bg: "#ecfdf5", text: "#065f46", activeBg: "#065f46", activeText: "white", accent: "#10b981" },
};

const defaultColor = { bg: "#f3f4f6", text: "#374151", activeBg: "#374151", activeText: "white", accent: "#6b7280" };

function getCategoryColor(cat: string) {
  return categoryColors[cat] ?? defaultColor;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

const categoryIcons: Record<string, string> = {
  "LGS Hazırlık": "📘",
  "YKS Hazırlık": "🎯",
  "Zaman Yönetimi": "⏰",
  "Verimli Çalışma": "⚡",
  "Sınav Kaygısı": "🧘",
  "Psikolojik Dayanıklılık": "💪",
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filtered: Post[] = activeCategory === ALL
    ? posts
    : posts.filter((p: Post) => p.category === activeCategory);

  const featured: Post | undefined = filtered[0];
  const rest: Post[] = filtered.slice(1);

  return (
    <main style={{ minHeight: "100vh", background: "#fafafa" }}>

      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(150deg, #ffffff 0%, #eef4ff 55%, #fff8f3 100%)",
        padding: "100px 16px 56px",
        textAlign: "center",
        borderBottom: "1px solid #e5e7eb",
      }}>
        <div style={{ display: "inline-block", marginBottom: 16, padding: "6px 16px", background: "#dbeafe", borderRadius: 9999 }}>
          <span style={{ color: "#1e40af", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.1em" }}>BLOG</span>
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 800,
          color: "#0f1f4f",
          margin: "0 auto 12px",
        }}>
          Faydalı Yazılar
        </h1>
        <p style={{ fontSize: "1rem", color: "#6b7280", maxWidth: 440, margin: "0 auto 36px" }}>
          LGS ve YKS sürecinde işinize yarayacak içerikler
        </p>

        {/* Kategori filtreleri */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
          maxWidth: 700,
          margin: "0 auto",
          padding: "0 8px",
        }}>
          {categories.map((cat: string) => {
            const isActive = activeCategory === cat;
            const color = cat === ALL
              ? { bg: "#f3f4f6", text: "#374151", activeBg: "#0f1f4f", activeText: "white" }
              : getCategoryColor(cat);
            const icon: string = cat === ALL ? "✦" : (categoryIcons[cat] ?? "");
            const count: number = cat === ALL ? posts.length : posts.filter((p: Post) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 9999,
                  border: isActive ? "none" : "1.5px solid #e5e7eb",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  transition: "all 0.2s ease",
                  background: isActive ? color.activeBg : "white",
                  color: isActive ? color.activeText : color.text,
                  boxShadow: isActive ? "0 4px 14px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
                  transform: isActive ? "translateY(-1px)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span style={{ fontSize: "0.75rem" }}>{icon}</span>
                {cat}
                <span style={{
                  background: isActive ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                  color: isActive ? "rgba(255,255,255,0.9)" : "#9ca3af",
                  borderRadius: 9999,
                  padding: "1px 7px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── İçerik ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 16px 80px" }}>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "1rem", marginTop: 40 }}>
            Bu kategoride henüz yazı yok.
          </p>
        )}

        {/* ── Öne çıkan kart ── */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: 32 }}>
            <article
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 48px rgba(15,31,79,0.12)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
              }}
              style={{
                background: "white",
                borderRadius: 24,
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                transition: "all 0.3s ease",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: "1fr auto",
              }}
            >
              {/* Sol: içerik */}
              <div style={{ padding: "44px 48px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                  <span style={{
                    background: "#0f1f4f", color: "white",
                    fontSize: "0.68rem", fontWeight: 700,
                    padding: "5px 12px", borderRadius: 9999, letterSpacing: "0.06em",
                  }}>
                    ✦ ÖNE ÇIKAN
                  </span>
                  {(() => {
                    const c = getCategoryColor(featured.category);
                    return (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, background: c.bg, color: c.text, padding: "5px 12px", borderRadius: 9999 }}>
                        {categoryIcons[featured.category] ?? ""} {featured.category}
                      </span>
                    );
                  })()}
                </div>

                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                  fontWeight: 800, color: "#0f1f4f",
                  marginBottom: 14, lineHeight: 1.3, maxWidth: 600,
                }}>
                  {featured.title}
                </h2>

                <p style={{ color: "#6b7280", lineHeight: 1.75, fontSize: "0.97rem", maxWidth: 580, marginBottom: 28 }}>
                  {featured.description}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: 9999, padding: "6px 14px",
                  }}>
                    <span style={{ fontSize: "0.85rem" }}>⏱</span>
                    <span style={{ color: "#15803d", fontWeight: 700, fontSize: "0.82rem" }}>{featured.readTime} okuma</span>
                  </div>

                  <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>📅 {formatDate(featured.date)}</span>

                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    color: "#1e3a8a", fontWeight: 700, fontSize: "0.88rem",
                    background: "#eff6ff", padding: "8px 18px",
                    borderRadius: 9999, border: "1px solid #bfdbfe",
                  }}>
                    Devamını oku
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Sağ: dekoratif renk bloğu */}
              {(() => {
                const c = getCategoryColor(featured.category);
                return (
                  <div style={{
                    width: 180,
                    background: `linear-gradient(160deg, ${c.bg} 0%, white 100%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "5rem", borderLeft: `1px solid ${c.bg}`, flexShrink: 0,
                  }}>
                    <div style={{ opacity: 0.6 }}>{categoryIcons[featured.category] ?? "📝"}</div>
                  </div>
                );
              })()}
            </article>
          </Link>
        )}

        {/* ── Grid kartlar ── */}
        {rest.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 20 }}>
            {rest.map((post: Post) => {
              const c = getCategoryColor(post.category);
              const isHovered = hoveredCard === post.slug;
              return (
                <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                  <article
                    onMouseEnter={() => setHoveredCard(post.slug)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background: "white", borderRadius: 18,
                      padding: "26px 26px 22px",
                      border: isHovered ? `1.5px solid ${c.accent}` : "1.5px solid #e5e7eb",
                      boxShadow: isHovered ? "0 16px 36px rgba(0,0,0,0.09)" : "0 2px 8px rgba(0,0,0,0.04)",
                      transition: "all 0.25s ease",
                      transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                      height: "100%", display: "flex", flexDirection: "column",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, background: c.bg, color: c.text, padding: "4px 10px", borderRadius: 9999, whiteSpace: "nowrap" }}>
                        {categoryIcons[post.category] ?? ""} {post.category}
                      </span>
                      <span style={{ fontSize: "0.73rem", color: "#9ca3af" }}>{formatDate(post.date)}</span>
                    </div>

                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.12rem", fontWeight: 700, color: "#0f1f4f", marginBottom: 10, lineHeight: 1.4 }}>
                      {post.title}
                    </h2>

                    <p style={{
                      color: "#6b7280", lineHeight: 1.65, fontSize: "0.86rem",
                      marginBottom: 18, flexGrow: 1,
                      display: "-webkit-box", WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                    }}>
                      {post.description}
                    </p>

                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginTop: "auto", paddingTop: 14, borderTop: "1px solid #f3f4f6",
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                        borderRadius: 9999, padding: "4px 10px",
                      }}>
                        <span style={{ fontSize: "0.75rem" }}>⏱</span>
                        <span style={{ color: "#15803d", fontWeight: 700, fontSize: "0.75rem" }}>{post.readTime}</span>
                      </div>

                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        color: isHovered ? c.text : "#1e3a8a",
                        fontWeight: 700, fontSize: "0.8rem", transition: "color 0.2s",
                      }}>
                        Oku
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── CTA Kutusu ── */}
        <div style={{
          marginTop: 72,
          background: "linear-gradient(135deg, #0f1f4f 0%, #1e3a8a 100%)",
          borderRadius: 24, padding: "52px 40px", textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 9999, padding: "6px 18px", marginBottom: 20 }}>
              <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.06em" }}>🎯 ÜCRETSİZ ÖN GÖRÜŞME</span>
            </div>

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800, color: "white", marginBottom: 14, lineHeight: 1.3 }}>
              Sistematik bir destek almak ister misiniz?
            </h3>

            <p style={{ color: "#93c5fd", lineHeight: 1.75, fontSize: "0.97rem", maxWidth: 480, margin: "0 auto 32px" }}>
              Mevcut durumunuzu değerlendirip size özel bir yol haritası çizelim. İlk görüşme tamamen ücretsiz.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://wa.me/905473803801"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#25d366", color: "white",
                  padding: "14px 28px", borderRadius: 12, fontWeight: 700,
                  textDecoration: "none", fontSize: "0.95rem",
                  boxShadow: "0 4px 16px rgba(37,211,102,0.35)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp&apos;tan Yaz
              </a>

              <Link href="/#İletişim" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.1)", color: "white",
                padding: "14px 28px", borderRadius: 12, fontWeight: 700,
                textDecoration: "none", fontSize: "0.95rem",
                border: "1px solid rgba(255,255,255,0.2)",
              }}>
                Randevu Al →
              </Link>
            </div>
          </div>
        </div>

        {/* Ana sayfaya dön */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: "#6b7280", fontWeight: 500, textDecoration: "none",
            padding: "10px 24px", border: "1.5px solid #e5e7eb",
            borderRadius: 10, fontSize: "0.88rem", background: "white",
          }}>
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}