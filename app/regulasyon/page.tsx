"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Haciyatmaz from "./Haciyatmaz";
import DenemeYirt from "./DenemeYirt";
import KaralamaDefteri from "./KaralamaDefteri";
import NefesEgzersizi from "./NefesEgzersizi";

type Modul = "home" | "haciyatmaz" | "yirt" | "karalama" | "nefes";
type Tema = "gece" | "gunduz";

// ── TEMA PALETLERİ ──────────────────────────────────────────────────────
const TEMA = {
  gece: {
    sayfa:         "#0f1d2e",
    metin:         "#ffffff",
    metinSoluk:    "rgba(232,244,253,0.55)",
    metinCokSoluk: "rgba(232,244,253,0.25)",
    eyebrow:       "#f5a623",
    vurgu:         "#f5a623",
    kartBorder:    "rgba(255,255,255,0.07)",
    gecisBg:       "rgba(255,255,255,0.08)",
    gecisBorder:   "rgba(255,255,255,0.16)",
    gecisMetin:    "rgba(255,255,255,0.7)",
    kartBg: {
      haciyatmaz: "linear-gradient(135deg,#1e0808,#2d1010)",
      yirt:       "linear-gradient(135deg,#080e1e,#101828)",
      karalama:   "linear-gradient(135deg,#08130a,#0f1d10)",
      nefes:      "linear-gradient(135deg,#0e0818,#1a1028)",
    },
    ikonBg: {
      haciyatmaz: "rgba(220,50,50,0.22)",
      yirt:       "rgba(60,100,220,0.22)",
      karalama:   "rgba(40,160,75,0.22)",
      nefes:      "rgba(140,65,220,0.22)",
    },
  },
  gunduz: {
    sayfa:         "#f2f6fa",
    metin:         "#1a2e4a",
    metinSoluk:    "rgba(26,46,74,0.62)",
    metinCokSoluk: "rgba(26,46,74,0.32)",
    eyebrow:       "#b06b08",
    vurgu:         "#c47a0e",
    kartBorder:    "rgba(26,46,74,0.1)",
    gecisBg:       "rgba(26,46,74,0.07)",
    gecisBorder:   "rgba(26,46,74,0.2)",
    gecisMetin:    "rgba(26,46,74,0.65)",
    kartBg: {
      haciyatmaz: "linear-gradient(135deg,#fceaea,#f5d5d5)",
      yirt:       "linear-gradient(135deg,#eaeffc,#d8e3f7)",
      karalama:   "linear-gradient(135deg,#eaf5ec,#d5edda)",
      nefes:      "linear-gradient(135deg,#f0eafc,#e2d5f7)",
    },
    ikonBg: {
      haciyatmaz: "rgba(200,40,40,0.13)",
      yirt:       "rgba(40,80,200,0.13)",
      karalama:   "rgba(30,140,60,0.13)",
      nefes:      "rgba(120,50,200,0.13)",
    },
  },
} as const;

const KARTLAR = [
  {
    id: "haciyatmaz" as Modul,
    emoji: "🥊",
    etiket: "Fiziksel rahatlama",
    baslik: "Hacıyatmaz",
    aciklama: "Üzerine yaz, vur, devril kalksın. Sinirini at.",
    hoverRenk: "rgba(220,60,60,0.5)",
  },
  {
    id: "yirt" as Modul,
    emoji: "📄",
    etiket: "Sembolik rahatlama",
    baslik: "Deneme Yırt",
    aciklama: "O berbat denemeyi ekranda parçala. Rahatla.",
    hoverRenk: "rgba(60,110,220,0.5)",
  },
  {
    id: "karalama" as Modul,
    emoji: "✏️",
    etiket: "Yaratıcı ifade",
    baslik: "Karalama Defteri",
    aciklama: "Çiz, yaz, karala. Kimse görmeyecek, söz.",
    hoverRenk: "rgba(50,160,80,0.5)",
  },
  {
    id: "nefes" as Modul,
    emoji: "🫧",
    etiket: "Sakinleşme",
    baslik: "Nefes Egzersizi",
    aciklama: "4-7-8 tekniğiyle sinir sistemini sıfırla.",
    hoverRenk: "rgba(140,70,220,0.5)",
  },
];

export default function DuyguAtölyesiPage() {
  const [ekran, setEkran]       = useState<Modul>("home");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tema, setTema]         = useState<Tema>("gece");

  const t = TEMA[tema];

  return (
    <>
      <Navbar />
      <main
        style={{
          backgroundColor: t.sayfa,
          minHeight: "100vh",
          fontFamily: "'Sora', sans-serif",
          color: t.metin,
          position: "relative",
          transition: "background-color 0.35s, color 0.35s",
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
              background: t.gecisBg,
              border: `1px solid ${t.gecisBorder}`,
              color: t.metin,
              fontFamily: "'Sora', sans-serif",
              fontSize: 12,
              padding: "7px 13px",
              borderRadius: 9,
              cursor: "pointer",
              zIndex: 20,
              transition: "all 0.3s",
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
              padding: "28px 18px 52px",
            }}
          >

            {/* GECE / GÜNDÜZ TOGGLE — sağ üst */}
            <div style={{ alignSelf: "flex-end", marginBottom: 20, marginRight: 4 }}>
              <button
                onClick={() => setTema(tema === "gece" ? "gunduz" : "gece")}
                title={tema === "gece" ? "Gündüz moduna geç" : "Gece moduna geç"}
                style={{
                  background: t.gecisBg,
                  border: `1px solid ${t.gecisBorder}`,
                  borderRadius: 20,
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontSize: 12,
                  color: t.gecisMetin,
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.3s",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: 15 }}>
                  {tema === "gece" ? "☀️" : "🌙"}
                </span>
                {tema === "gece" ? "Gündüz modu" : "Gece modu"}
              </button>
            </div>

            {/* ÜSTBAŞLIK */}
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 3,
                color: t.eyebrow,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Duygu Atölyesi
            </p>

            {/* ANA BAŞLIK */}
            <h1
              style={{
                fontSize: "clamp(22px,5vw,30px)",
                fontWeight: 800,
                textAlign: "center",
                lineHeight: 1.25,
                marginBottom: 10,
                color: t.metin,
              }}
            >
              Bugün nasıl{" "}
              <span style={{ color: t.vurgu }}>ifade etmek istiyorsun?</span>
            </h1>

            {/* ALT BAŞLIK */}
            <p
              style={{
                fontSize: 12,
                color: t.metinSoluk,
                textAlign: "center",
                maxWidth: 285,
                lineHeight: 1.75,
                marginBottom: 30,
              }}
            >
              Duygularını hissetmek için güvenli bir alan.
              İstediğini seç, istediğin kadar kal.
            </p>

            {/* KARTLAR */}
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
                    background: t.kartBg[k.id as keyof typeof t.kartBg],
                    border: `1.5px solid ${hoverIdx === i ? k.hoverRenk : t.kartBorder}`,
                    borderRadius: 14,
                    padding: "15px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    textAlign: "left",
                    color: t.metin,
                    fontFamily: "'Sora', sans-serif",
                    transform: hoverIdx === i ? "translateX(5px)" : "translateX(0)",
                    transition: "transform 0.16s, border-color 0.2s, background 0.35s",
                    width: "100%",
                  }}
                >
                  {/* İKON KUTUSU */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 11,
                      background: t.ikonBg[k.id as keyof typeof t.ikonBg],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      flexShrink: 0,
                      transition: "background 0.35s",
                    }}
                  >
                    {k.emoji}
                  </div>

                  {/* METİNLER */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: t.metinSoluk,
                        marginBottom: 3,
                      }}
                    >
                      {k.etiket}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: t.metin,
                        marginBottom: 3,
                      }}
                    >
                      {k.baslik}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: t.metinSoluk,
                        lineHeight: 1.45,
                      }}
                    >
                      {k.aciklama}
                    </div>
                  </div>

                  <div style={{ fontSize: 16, color: t.metinSoluk, flexShrink: 0 }}>›</div>
                </button>
              ))}
            </div>

            {/* ALT NOT */}
            <p
              style={{
                fontSize: 10,
                color: t.metinCokSoluk,
                textAlign: "center",
                marginTop: 28,
                lineHeight: 1.75,
              }}
            >
              Bu alan seni dinliyor. Duygularını burada bırakabilirsin.
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