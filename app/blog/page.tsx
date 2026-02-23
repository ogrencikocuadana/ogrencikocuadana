import Link from "next/link";
import { posts } from "../data/posts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Öğrenci Koçu Adana",
  description:
    "LGS ve YKS hazırlık sürecinde işinize yarayacak yazılar. Zaman yönetimi, sınav kaygısı, verimli ders çalışma ve daha fazlası.",
  alternates: { canonical: "https://ogrencikocuadana.com/blog" },
};

export default function BlogPage() {
  return (
    <main style={{ minHeight: "100vh", background: "white", padding: "60px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Başlık */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-block", marginBottom: 16, padding: "8px 20px", background: "#dbeafe", borderRadius: 9999 }}>
            <span style={{ color: "#1e40af", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.05em" }}>BLOG</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>
            Faydalı Yazılar
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#4b5563", maxWidth: 560, margin: "0 auto" }}>
            LGS ve YKS sürecinde işinize yarayacak içerikler
          </p>
        </div>

        {/* Yazı Listesi */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <article style={{
                background: "white", borderRadius: 16, padding: 36,
                border: "2px solid #e5e7eb", transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#bfdbfe";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 40px rgba(0,0,0,0.10)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, background: "#dbeafe", color: "#1e40af", padding: "4px 12px", borderRadius: 9999 }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    {new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>· {post.readTime} okuma</span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#0f1f4f", marginBottom: 12, lineHeight: 1.35 }}>
                  {post.title}
                </h2>
                <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 20 }}>
                  {post.description}
                </p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#1e3a8a", fontWeight: 600, fontSize: "0.9rem" }}>
                  Devamını oku
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Alt bağlantı */}
        <div style={{ textAlign: "center", marginTop: 64 }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: "#1e3a8a", fontWeight: 600, textDecoration: "none",
            padding: "12px 28px", border: "2px solid #bfdbfe", borderRadius: 8,
            transition: "all 0.3s",
          }}>
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}