"use client";

import Link from "next/link";

interface PostNavProps {
  prevPost: { slug: string; title: string } | null;
  nextPost: { slug: string; title: string } | null;
}

export default function PostNavigation({ prevPost, nextPost }: PostNavProps) {
  if (!prevPost && !nextPost) return null;

  return (
    <div style={{
      marginTop: 48,
      display: "grid",
      gridTemplateColumns: prevPost && nextPost ? "1fr 1fr" : "1fr",
      gap: 16,
    }}>
      {prevPost && (
        <Link href={`/blog/${prevPost.slug}`} style={{ textDecoration: "none" }}>
          <div
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#bfdbfe";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
            style={{
              padding: "20px 24px", borderRadius: 14,
              border: "2px solid #e5e7eb",
              transition: "all 0.2s ease",
              background: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9ca3af", fontSize: "0.75rem", fontWeight: 600, marginBottom: 8, letterSpacing: "0.04em" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
              ÖNCEKİ YAZI
            </div>
            <p style={{ color: "#0f1f4f", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.4, margin: 0 }}>
              {prevPost.title}
            </p>
          </div>
        </Link>
      )}
      {nextPost && (
        <Link href={`/blog/${nextPost.slug}`} style={{ textDecoration: "none" }}>
          <div
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#bfdbfe";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
            style={{
              padding: "20px 24px", borderRadius: 14,
              border: "2px solid #e5e7eb",
              transition: "all 0.2s ease",
              background: "white",
              textAlign: "right",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, color: "#9ca3af", fontSize: "0.75rem", fontWeight: 600, marginBottom: 8, letterSpacing: "0.04em" }}>
              SONRAKİ YAZI
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
            </div>
            <p style={{ color: "#0f1f4f", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.4, margin: 0 }}>
              {nextPost.title}
            </p>
          </div>
        </Link>
      )}
    </div>
  );
}