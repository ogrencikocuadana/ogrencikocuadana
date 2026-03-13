"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Haciyatmaz from "./Haciyatmaz";
import DenemeYirt from "./DenemeYirt";
import KaralamaDefteri from "./KaralamaDefteri";
import NefesEgzersizi from "./NefesEgzersizi";

type Modul = "home" | "haciyatmaz" | "yirt" | "karalama" | "nefes";

const KARTLAR = [
  {
    id: "haciyatmaz" as Modul,
    emoji: "🥊",
    etiket: "Fiziksel boşalım",
    baslik: "Hacıyatmaz",
    aciklama: "Üzerine yaz, vur, devril kalksın. Sinirini çıkar.",
    bg: "linear-gradient(135deg,#1e0808,#2d1010)",
    hover: "rgba(220,60,60,0.45)",
    icon: "rgba(220,50,50,0.18)",
  },
  {
    id: "yirt" as Modul,
    emoji: "📄",
    etiket: "Sembolik boşalım",
    baslik: "Deneme Yırt",
    aciklama: "O berbat denemeyi ekranda parçala. Rahatla.",
    bg: "linear-gradient(135deg,#080e1e,#101828)",
    hover: "rgba(60,110,220,0.45)",
    icon: "rgba(60,100,220,0.18)",
  },
  {
    id: "karalama" as Modul,
    emoji: "✏️",
    etiket: "Yaratıcı boşalım",
    baslik: "Karalama Defteri",
    aciklama: "Çiz, yaz, karala. Kimse görmeyecek, söz.",
    bg: "linear-gradient(135deg,#08130a,#0f1d10)",
    hover: "rgba(50,160,80,0.45)",
    icon: "rgba(40,160,75,0.18)",
  },
  {
    id: "nefes" as Modul,
    emoji: "🫧",
    etiket: "Sakinleşme",
    baslik: "Nefes Egzersizi",
    aciklama: "4-7-8 tekniğiyle sinir sistemini sıfırla.",
    bg: "linear-gradient(135deg,#0e0818,#1a1028)",
    hover: "rgba(140,70,220,0.45)",
    icon: "rgba(140,65,220,0.18)",
  },
];

export default function RegulasyonPage() {
  const [ekran, setEkran] = useState<Modul>("home");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main
        style={{
          backgroundColor: "#0f1d2e",
          minHeight: "100vh",
          fontFamily: "'Sora', sans-serif",
          color: "white",
          position: "relative",
        }}
      >
        {/* ── GERİ BUTONU ── */}
        {ekran !== "home" && (
          <button
            onClick={() => setEkran("home")}
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
              fontFamily: "'Sora', sans-serif",
              fontSize: 12,
              padding: "7px 13px",
              borderRadius: 9,
              cursor: "pointer",
              zIndex: 20,
            }}
          >
            ‹ Geri
          </button>
        )}

        {/* ── ANA EKRAN ── */}
        {ekran === "home" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "36px 18px 52px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 3,
                color: "#f5a623",
                opacity: 0.75,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Duygu Regülasyon Odası
            </p>

            <h1
              style={{
                fontSize: "clamp(22px,5vw,30px)",
                fontWeight: 800,
                textAlign: "center",
                lineHeight: 1.2,
                marginBottom: 8,
              }}
            >
              Bugün nasıl{" "}
              <span style={{ color: "#f5a623" }}>boşalmak istiyorsun?</span>
            </h1>

            <p
              style={{
                fontSize: 12,
                color: "rgba(232,244,253,0.5)",
                textAlign: "center",
                maxWidth: 280,
                lineHeight: 1.7,
                marginBottom: 30,
              }}
            >
              Duygularını hissetmek için güvenli bir alan. İstediğini seç,
              istediğin kadar kal.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                width: "100%",
                maxWidth: 360,
              }}
            >
              {KARTLAR.map((k, i) => (
                <button
                  key={k.id}
                  onClick={() => setEkran(k.id)}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  style={{
                    background: k.bg,
                    border: `1.5px solid ${
                      hoverIdx === i ? k.hover : "rgba(255,255,255,0.06)"
                    }`,
                    borderRadius: 14,
                    padding: "15px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    textAlign: "left",
                    color: "white",
                    fontFamily: "'Sora', sans-serif",
                    transform: hoverIdx === i ? "translateX(5px)" : "none",
                    transition: "transform 0.16s, border-color 0.16s",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 11,
                      background: k.icon,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {k.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        opacity: 0.5,
                        marginBottom: 2,
                      }}
                    >
                      {k.etiket}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                      {k.baslik}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.45, lineHeight: 1.4 }}>
                      {k.aciklama}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, opacity: 0.3 }}>›</div>
                </button>
              ))}
            </div>

            <p
              style={{
                fontSize: 10,
                color: "rgba(232,244,253,0.2)",
                textAlign: "center",
                marginTop: 24,
                lineHeight: 1.7,
              }}
            >
              Bu oda seni dinliyor. Duygularını burada bırakabilirsin.
            </p>
          </div>
        )}

        {/* ── MODÜLLER ── */}
        {ekran === "haciyatmaz" && <Haciyatmaz />}
        {ekran === "yirt"       && <DenemeYirt />}
        {ekran === "karalama"   && <KaralamaDefteri />}
        {ekran === "nefes"      && <NefesEgzersizi />}
      </main>
    </>
  );
}