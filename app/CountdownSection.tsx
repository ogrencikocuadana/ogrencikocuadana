"use client";

// app/CountdownSection.tsx
// dynamic(() => import("./CountdownSection"), { ssr: false }) ile import edilir
// Server'da hiç render edilmez → hydration hatası olmaz

import { useState, useEffect } from "react";

const D = "var(--font-display), 'Bricolage Grotesque', sans-serif";

const exams = [
  { name: "LGS", date: new Date("2026-06-14T09:00:00"), tarih: "14 Haziran 2026", color: "#1e3a8a", bg: "#eff6ff", border: "#bfdbfe", tag: "8. Sınıf" },
  { name: "YKS", date: new Date("2026-06-20T10:00:00"), tarih: "20–21 Haziran 2026", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", tag: "12. Sınıf" },
];

function getLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, done: true };
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    done: false,
  };
}

export default function CountdownSection() {
  const [times, setTimes] = useState(() => exams.map(e => getLeft(e.date)));

  useEffect(() => {
    setTimes(exams.map(e => getLeft(e.date)));
    const id = setInterval(() => setTimes(exams.map(e => getLeft(e.date))), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ padding: "44px 16px", background: "linear-gradient(135deg,#f8faff,#eff6ff)" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <p style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", letterSpacing: "0.12em", marginBottom: 24 }}>
          SINAVA NE KADAR KALDI?
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {exams.map((exam, i) => {
            const t = times[i];
            return (
              <div key={i} style={{ background: exam.bg, borderRadius: 18, padding: "24px 20px", border: `2px solid ${exam.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <span style={{ fontSize: "1.4rem", fontWeight: 800, color: exam.color, fontFamily: D }}>{exam.name}</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, background: exam.border, color: exam.color, padding: "3px 10px", borderRadius: 9999 }}>{exam.tag}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "#6b7280", fontWeight: 500 }}>{exam.tarih}</span>
                </div>
                {t.done ? (
                  <div style={{ textAlign: "center", fontSize: "1.3rem", fontWeight: 800, color: exam.color }}>🎉 Sınav günü!</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {[{ v: t.days, l: "Gün" }, { v: t.hours, l: "Saat" }, { v: t.minutes, l: "Dakika" }].map(b => (
                      <div key={b.l} style={{ background: "white", borderRadius: 10, padding: "14px 6px", textAlign: "center", border: `1.5px solid ${exam.border}` }}>
                        <div style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: exam.color, lineHeight: 1, fontFamily: D, fontVariantNumeric: "tabular-nums" }}>
                          {String(b.v).padStart(2, "0")}
                        </div>
                        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: exam.color, opacity: 0.6, marginTop: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>{b.l}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}