"use client";

import { useRef, useEffect, useState } from "react";

const reviews = [
  { type: "Veli", name: "Ayşe K.", role: "8. Sınıf Velisi", color: "#1e3a8a", bg: "#eff6ff", border: "#bfdbfe", text: "Kızımın LGS sürecinde çok karamsardık. Sisteme dahil olduktan sonra hem akademik hem de psikolojik olarak inanılmaz bir değişim yaşadı. Haftalık raporlar bizi çok rahatlattı." },
  { type: "Öğrenci", name: "Emirhan T.", role: "YKS Öğrencisi", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", text: "Daha önce ne çalışacağımı bilmiyordum, motivasyonum sürekli düşüyordu. Şimdi her haftanın planı belli, deneme analizlerim yapılıyor. Net ortalamam 3 ayda ciddi arttı." },
  { type: "Veli", name: "Melek A.", role: "12. Sınıf Velisi", color: "#1e3a8a", bg: "#eff6ff", border: "#bfdbfe", text: "Kızım sınav kaygısı yüzünden denemede bildiğini yapamıyordu. Psikolojik dayanıklılık eğitimiyle bu sorunun üstesinden geldi. Şimdi çok daha sakin ve odaklı." },
  { type: "Öğrenci", name: "Zeynep S.", role: "LGS Öğrencisi", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", text: "Hızlı okuma eğitimi benim için çok faydalı oldu. Artık metinleri çok daha hızlı okuyup anlıyorum. Türkçe netlerim fark edilir şekilde yükseldi." },
  { type: "Veli", name: "Fatma Y.", role: "8. Sınıf Velisi", color: "#1e3a8a", bg: "#eff6ff", border: "#bfdbfe", text: "30 öğrenci kapasitesi olduğunu duyunca önce tereddüt ettim ama bu sınırlı kontenjanın neden olduğunu şimdi çok iyi anlıyorum. Bireysel ilgi gerçekten fark yaratıyor." },
  { type: "Öğrenci", name: "Burak D.", role: "YKS Öğrencisi", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", text: "Telefon bağımlılığı ve zaman yönetimi konusundaki seminerler hayatımı değiştirdi. Artık çok daha verimli çalışıyorum ve boş zamanlarımı doğru kullanıyorum." },
];

const doubled = [...reviews, ...reviews];

export default function ReviewsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const SPEED = 0.5; // px per frame

  // Touch state
  const touchStartX = useRef(0);
  const touchLastX = useRef(0);
  const isTouching = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const totalWidth = track.scrollWidth / 2; // yarısı duplicate

    const animate = () => {
      if (!pausedRef.current && !isTouching.current) {
        posRef.current += SPEED;
        if (posRef.current >= totalWidth) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    isTouching.current = true;
    touchStartX.current = e.touches[0].clientX;
    touchLastX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = touchLastX.current - e.touches[0].clientX;
    touchLastX.current = e.touches[0].clientX;
    const track = trackRef.current;
    if (!track) return;
    const totalWidth = track.scrollWidth / 2;
    posRef.current = Math.max(0, Math.min(posRef.current + dx, totalWidth));
    track.style.transform = `translateX(-${posRef.current}px)`;
  };

  const handleTouchEnd = () => {
    isTouching.current = false;
  };

  return (
    <div
      style={{ overflow: "hidden", userSelect: "none", cursor: "grab" }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={trackRef}
        style={{ display: "flex", gap: 22, padding: "12px 0", width: "max-content", willChange: "transform" }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            style={{
              width: 340, flexShrink: 0,
              background: item.bg,
              borderRadius: 20,
              padding: "28px 28px 24px",
              border: `1.5px solid ${item.border}`,
              display: "flex", flexDirection: "column", gap: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Dekoratif köşe */}
            <div style={{ position: "absolute", top: -18, right: -18, width: 72, height: 72, borderRadius: "50%", background: item.border, opacity: 0.5 }} />

            {/* Yıldızlar */}
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: 5 }).map((_, s) => (
                <svg key={s} width="15" height="15" fill="#f97316" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            {/* Yorum metni */}
            <p style={{ color: "#374151", lineHeight: 1.75, margin: 0, fontSize: "0.9rem", flexGrow: 1, fontStyle: "italic" }}>
              &ldquo;{item.text}&rdquo;
            </p>

            {/* Alt bilgi */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 14, borderTop: `1px solid ${item.border}` }}>
              {/* Avatar */}
              <div style={{
                width: 40, height: 40,
                background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)`,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 2px 8px ${item.color}44`,
              }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: "0.95rem" }}>{item.name[0]}</span>
              </div>

              {/* İsim + rol */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#0f1f4f", fontSize: "0.88rem" }}>{item.name}</div>
                <div style={{ fontSize: "0.75rem", color: item.color, fontWeight: 500, marginTop: 1 }}>{item.role}</div>
              </div>

              {/* Tip etiketi */}
              <div style={{
                fontSize: "0.65rem", fontWeight: 800,
                background: item.color, color: "white",
                padding: "3px 10px", borderRadius: 9999,
                letterSpacing: "0.04em", flexShrink: 0,
              }}>
                {item.type.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}