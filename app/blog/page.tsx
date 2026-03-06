"use client";

import { useState } from "react";
import Link from "next/link";
import { posts } from "../data/posts";

const ALL = "Tümü";
const categories = [ALL, ...Array.from(new Set(posts.map((p) => p.category)))];

const categoryColors: Record<string, { bg: string; text: string; activeBg: string; activeText: string }> = {
  "LGS Hazırlık":           { bg: "#eff6ff", text: "#1e40af", activeBg: "#1e3a8a", activeText: "white" },
  "YKS Hazırlık":           { bg: "#fff7ed", text: "#c2410c", activeBg: "#c2410c", activeText: "white" },
  "Zaman Yönetimi":         { bg: "#f0fdf4", text: "#15803d", activeBg: "#15803d", activeText: "white" },
  "Verimli Çalışma":        { bg: "#faf5ff", text: "#7c3aed", activeBg: "#7c3aed", activeText: "white" },
  "Sınav Kaygısı":          { bg: "#fff1f2", text: "#be123c", activeBg: "#be123c", activeText: "white" },
  "Psikolojik Dayanıklılık":{ bg: "#ecfdf5", text: "#065f46", activeBg: "#065f46", activeText: "white" },
};

const defaultColor = { bg: "#f3f4f6", text: "#374151", activeBg: "#374151", activeText: "white" };

function getCategoryColor(cat: string) {
  return categoryColors[cat] ?? defaultColor;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState(ALL);

  const filtered = activeCategory === ALL
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <main style={{ minHeight: "100vh", background: "white" }}>

      {/* ── Hero başlık ── */}
      <div style={{ background: "linear-gradient(150deg, #ffffff 0%, #eef4ff 55%, #fff8f3 100%)", padding: "100px 16px 64px", textAlign: "center" }}>
        <div style={{ display: "inline-block", marginBottom: 16, padding: "7px 18px", background: "#dbeafe", borderRadius: 9999 }}>
          <span style={{ color: "#1e40af", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em" }}>BLOG</span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 14, margin: "0 auto 14px" }}>
          Faydalı Yazılar
        </h1>
        <p style={{ fontSize: "1.05rem", color: "#4b5563", maxWidth: 500, margin: "0 auto 40px" }}>
          LGS ve YKS sürecinde işinize yarayacak içerikler
        </p>

        {/* Kategori filtreleri */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const color = cat === ALL
              ? { bg: "#f3f4f6", text: "#374151", activeBg: "#0f1f4f", activeText: "white" }
              : getCategoryColor(cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  transition: "all 0.2s ease",
                  background: isActive ? color.activeBg : color.bg,
                  color: isActive ? color.activeText : color.text,
                  boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                  transform: isActive ? "translateY(-1px)" : "none",
                }}
              >
                {cat}
                <span style={{
                  marginLeft: 6,
                  fontSize: "0.72rem",
                  opacity: 0.75,
                  fontWeight: 500,
                }}>
                  {cat === ALL ? posts.length : posts.filter(p => p.category === cat).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── İçerik ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 16px 80px" }}>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "1rem", marginTop: 40 }}>
            Bu kategoride henüz yazı yok.
          </p>
        )}

        {/* Featured kart */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: 40 }}>
            <article
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 24px 56px rgba(30,58,138,0.12)";
                (e.currentTarget as HTMLElement).style.borderColor = "#bfdbfe";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
              }}
              style={{
                background: "linear-gradient(135deg, #f8faff 0%, white 60%)",
                borderRadius: 24,
                padding: "44px 48px",
                border: "2px solid #e5e7eb",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Dekoratif arka plan */}
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "radial-gradient(circle, rgba(30,58,138,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

              {/* Featured etiketi */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "5px 14px", background: "#0f1f4f", borderRadius: 9999 }}>
                <span style={{ color: "white", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.06em" }}>✦ ÖNE ÇIKAN</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                {(() => {
                  const c = getCategoryColor(featured.category);
                  return (
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, background: c.bg, color: c.text, padding: "4px 14px", borderRadius: 9999 }}>
                      {featured.category}
                    </span>
                  );
                })()}
                <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>{formatDate(featured.date)}</span>
                <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>· {featured.readTime} okuma</span>
              </div>

              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 3vw, 2.1rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 14, lineHeight: 1.25, maxWidth: 720 }}>
                {featured.title}
              </h2>
              <p style={{ color: "#4b5563", lineHeight: 1.75, fontSize: "1rem", maxWidth: 680, marginBottom: 24 }}>
                {featured.description}
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#1e3a8a", fontWeight: 700, fontSize: "0.9rem", background: "#eff6ff", padding: "10px 20px", borderRadius: 9999 }}>
                Devamını oku
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </div>
            </article>
          </Link>
        )}

        {/* Geri kalan yazılar — 2 kolonlu grid */}
        {rest.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 24,
          }}>
            {rest.map((post) => {
              const c = getCategoryColor(post.category);
              return (
                <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                  <article
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 40px rgba(0,0,0,0.10)";
                      (e.currentTarget as HTMLElement).style.borderColor = "#bfdbfe";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
                      (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                    }}
                    style={{
                      background: "white",
                      borderRadius: 20,
                      padding: "28px 28px 24px",
                      border: "2px solid #e5e7eb",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                      transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, background: c.bg, color: c.text, padding: "3px 11px", borderRadius: 9999 }}>
                        {post.category}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{formatDate(post.date)}</span>
                    </div>

                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#0f1f4f", marginBottom: 10, lineHeight: 1.35, flexGrow: 1 }}>
                      {post.title}
                    </h2>

                    <p style={{ color: "#6b7280", lineHeight: 1.65, fontSize: "0.88rem", marginBottom: 18, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {post.description}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500 }}>⏱ {post.readTime} okuma</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#1e3a8a", fontWeight: 700, fontSize: "0.82rem" }}>
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

        {/* Ana sayfaya dön */}
        <div style={{ textAlign: "center", marginTop: 64 }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: "#1e3a8a", fontWeight: 600, textDecoration: "none",
            padding: "12px 28px", border: "2px solid #bfdbfe", borderRadius: 10,
            fontSize: "0.9rem", transition: "all 0.2s",
          }}>
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}