"use client";

import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `https://ogrencikocuadana.com/blog/${slug}`;

  const handleWhatsApp = () => {
    const text = `${title}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      marginTop: 48,
      padding: "24px 28px",
      background: "#f8faff",
      borderRadius: 16,
      border: "1.5px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      gap: 16,
      flexWrap: "wrap",
    }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontWeight: 700, color: "#0f1f4f", fontSize: "0.9rem" }}>Bu yazıyı paylaş</div>
        <div style={{ color: "#6b7280", fontSize: "0.78rem", marginTop: 2 }}>Faydalı bulduysan arkadaşlarına da ilet</div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 18px",
            background: "#25D366", color: "white",
            border: "none", borderRadius: 10,
            fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
            boxShadow: "0 2px 8px rgba(37,211,102,0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>

        {/* Link kopyala */}
        <button
          onClick={handleCopy}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 18px",
            background: copied ? "#f0fdf4" : "white",
            color: copied ? "#15803d" : "#374151",
            border: `1.5px solid ${copied ? "#86efac" : "#e5e7eb"}`,
            borderRadius: 10,
            fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { if (!copied) (e.currentTarget.style.borderColor = "#bfdbfe"); }}
          onMouseLeave={e => { if (!copied) (e.currentTarget.style.borderColor = "#e5e7eb"); }}
        >
          {copied ? (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Kopyalandı!
            </>
          ) : (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Linki Kopyala
            </>
          )}
        </button>
      </div>
    </div>
  );
}