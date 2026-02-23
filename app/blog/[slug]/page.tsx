import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, posts } from "../../data/posts";
import { Metadata } from "next";

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | Öğrenci Koçu Adana`,
    description: post.description,
    alternates: { canonical: `https://ogrencikocuadana.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://ogrencikocuadana.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

// Markdown benzeri içeriği HTML'e çeviren basit parser
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "#0f1f4f", marginTop: 48, marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #e5e7eb" }}>
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].replace("- ", ""));
        i++;
      }
      elements.push(
        <ul key={i} style={{ paddingLeft: 24, marginBottom: 20 }}>
          {items.map((item, j) => (
            <li key={j} style={{ color: "#374151", lineHeight: 1.8, marginBottom: 8, fontSize: "1.05rem" }}
              dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f1f4f">$1</strong>') }}
            />
          ))}
        </ul>
      );
      continue;
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} style={{ border: "none", borderTop: "2px solid #f3f4f6", margin: "36px 0" }} />);
    } else if (line.startsWith("| ")) {
      // Tablo
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].startsWith("|--")) tableLines.push(lines[i]);
        i++;
      }
      const [header, ...rows] = tableLines;
      const headers = header.split("|").filter(Boolean).map(h => h.trim());
      elements.push(
        <div key={i} style={{ overflowX: "auto", marginBottom: 28 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#1e3a8a" }}>
                {headers.map((h, j) => (
                  <th key={j} style={{ color: "white", padding: "10px 14px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, j) => {
                const cells = row.split("|").filter(Boolean).map(c => c.trim());
                return (
                  <tr key={j} style={{ background: j % 2 === 0 ? "white" : "#f8faff" }}>
                    {cells.map((cell, k) => (
                      <td key={k} style={{ padding: "10px 14px", color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{cell}</td>
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
        <p key={i} style={{ color: "#374151", lineHeight: 1.85, marginBottom: 20, fontSize: "1.05rem" }}
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f1f4f">$1</strong>') }}
        />
      );
    }
    i++;
  }
  return elements;
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <main style={{ minHeight: "100vh", background: "white" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f1f4f, #1e3a8a)", padding: "60px 16px 80px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Link href="/blog" style={{ color: "#bfdbfe", fontSize: "0.9rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
              Blog
            </Link>
            <span style={{ color: "#4b5563" }}>/</span>
            <span style={{ color: "#bfdbfe", fontSize: "0.9rem" }}>{post.category}</span>
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, background: "rgba(255,255,255,0.15)", color: "#bfdbfe", padding: "4px 12px", borderRadius: 9999, display: "inline-block", marginBottom: 20 }}>
            {post.category}
          </span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "white", lineHeight: 1.3, marginBottom: 20 }}>
            {post.title}
          </h1>
          <p style={{ color: "#bfdbfe", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: 28 }}>
            {post.description}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#93c5fd", fontSize: "0.85rem" }}>
            <span>📅 {new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>·</span>
            <span>⏱ {post.readTime} okuma</span>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "60px 16px" }}>
        <article>{renderContent(post.content)}</article>

        {/* CTA kutusu */}
        <div style={{ marginTop: 64, background: "linear-gradient(135deg, #1e3a8a, #1e40af)", borderRadius: 16, padding: "40px 36px", textAlign: "center" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 800, color: "white", marginBottom: 12 }}>
            Sistematik bir destek almak ister misiniz?
          </h3>
          <p style={{ color: "#bfdbfe", marginBottom: 28, lineHeight: 1.7 }}>
            Ücretsiz ön görüşmede mevcut durumunuzu değerlendirir, size özel bir yol haritası çiziriz.
          </p>
          <Link href="/#İletişim" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "white", color: "#1e3a8a", padding: "14px 32px",
            borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: "1rem",
          }}>
            Ücretsiz Ön Görüşme Planla →
          </Link>
        </div>

        {/* Alt navigasyon */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <Link href="/blog" style={{ color: "#1e3a8a", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            ← Tüm Yazılara Dön
          </Link>
        </div>
      </div>
    </main>
  );
}