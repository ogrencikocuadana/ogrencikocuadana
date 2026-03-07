"use client";

import { useState } from "react";

// ─── LGS 2024 Gerçek Katsayılar (MEB Standart Puan Formülünden Türetilmiş) ──
// Formül: Net × katsayı toplamı + 194.752 = MSP
// Full net (90 net) → ~500 puan
const LGS_DERSLER = [
  { key: "turkce", label: "Türkçe",        soru: 20, kat: 4.348,  yb: 3 },
  { key: "mat",    label: "Matematik",      soru: 20, kat: 4.2538, yb: 3 },
  { key: "fen",    label: "Fen Bilimleri",  soru: 20, kat: 4.1230, yb: 3 },
  { key: "ink",    label: "İnkılap Tarihi", soru: 10, kat: 1.666,  yb: 3 },
  { key: "din",    label: "Din Kültürü",    soru: 10, kat: 1.899,  yb: 3 },
  { key: "ing",    label: "Yabancı Dil",    soru: 10, kat: 1.5075, yb: 3 },
];
const LGS_TABAN = 194.752;

// ─── TYT Katsayılar ──────────────────────────────────────────────────────────
const TYT_DERSLER = [
  { key: "tyt_turkce", label: "Türkçe",         soru: 40, kat: 3.3 },
  { key: "tyt_mat",    label: "Temel Matematik", soru: 40, kat: 3.3 },
  { key: "tyt_sosyal", label: "Sosyal Bilimler", soru: 20, kat: 3.4 },
  { key: "tyt_fen",    label: "Fen Bilimleri",   soru: 20, kat: 3.4 },
];

// ─── AYT Konfigürasyonları ────────────────────────────────────────────────────
const AYT_TURLERI = {
  SAY: {
    label: "Sayısal", fullLabel: "Sayısal (SAY)", icon: "🔢",
    color: "#c2410c", bg: "#fff7ed",
    dersler: [
      { key: "ayt_mat",   label: "Matematik", soru: 40, kat: 3.0  },
      { key: "ayt_fizik", label: "Fizik",     soru: 14, kat: 2.85 },
      { key: "ayt_kimya", label: "Kimya",     soru: 13, kat: 3.07 },
      { key: "ayt_biyo",  label: "Biyoloji",  soru: 13, kat: 3.07 },
    ],
    aytHam: (n: Record<string, number>) =>
      (n.ayt_mat||0)*3.0 + (n.ayt_fizik||0)*2.85 + (n.ayt_kimya||0)*3.07 + (n.ayt_biyo||0)*3.07,
  },
  EA: {
    label: "Eşit Ağırlık", fullLabel: "Eşit Ağırlık (EA)", icon: "⚖️",
    color: "#6d28d9", bg: "#f5f3ff",
    dersler: [
      { key: "ayt_mat",    label: "Matematik",        soru: 40, kat: 3.0  },
      { key: "ayt_edb",    label: "T.D. ve Edebiyat", soru: 24, kat: 3.0  },
      { key: "ayt_tarih1", label: "Tarih-1",           soru: 10, kat: 2.8  },
      { key: "ayt_cog1",   label: "Coğrafya-1",        soru: 6,  kat: 3.33 },
    ],
    aytHam: (n: Record<string, number>) =>
      (n.ayt_mat||0)*3.0 + (n.ayt_edb||0)*3.0 + (n.ayt_tarih1||0)*2.8 + (n.ayt_cog1||0)*3.33,
  },
  SOZ: {
    label: "Sözel", fullLabel: "Sözel (SÖZ)", icon: "📖",
    color: "#0f766e", bg: "#f0fdfa",
    dersler: [
      { key: "ayt_edb",     label: "T.D. ve Edebiyat",  soru: 24, kat: 3.0 },
      { key: "ayt_tarih1",  label: "Tarih-1",             soru: 10, kat: 2.8 },
      { key: "ayt_cog1",    label: "Coğrafya-1",          soru: 6,  kat: 3.3 },
      { key: "ayt_tarih2",  label: "Tarih-2",             soru: 11, kat: 2.9 },
      { key: "ayt_cog2",    label: "Coğrafya-2",          soru: 11, kat: 2.9 },
      { key: "ayt_felsefe", label: "Felsefe Grubu",       soru: 12, kat: 3.0 },
      { key: "ayt_dkab",    label: "Din Kültürü (DKAB)", soru: 6,  kat: 3.0 },
    ],
    aytHam: (n: Record<string, number>) =>
      (n.ayt_edb||0)*3.0 + (n.ayt_tarih1||0)*2.8 + (n.ayt_cog1||0)*3.3
      + (n.ayt_tarih2||0)*2.9 + (n.ayt_cog2||0)*2.9 + (n.ayt_felsefe||0)*3.0 + (n.ayt_dkab||0)*3.0,
  },
} as const;

type AYTTur = keyof typeof AYT_TURLERI;

// ─── Yüzdelik Dilim Tablosu (2024 LGS Gerçek Verileri) ───────────────────────
const LGS_YUZDELIK: { minPuan: number; dilim: string; siralama: string; aciklama: string }[] = [
  { minPuan: 499, dilim: "%0.1",  siralama: "İlk ~1.000",   aciklama: "Tam / neredeyse tam puan" },
  { minPuan: 494, dilim: "%0.1",  siralama: "İlk ~1.000",   aciklama: "Ankara/İzmir Fen Lisesi seviyesi" },
  { minPuan: 490, dilim: "%0.29", siralama: "İlk ~2.900",   aciklama: "En iyi Anadolu Liseleri" },
  { minPuan: 485, dilim: "%0.41", siralama: "İlk ~4.000",   aciklama: "Adana Fen Lisesi seviyesi" },
  { minPuan: 480, dilim: "%0.6",  siralama: "İlk ~6.000",   aciklama: "Çok iyi Fen / Proje okulları" },
  { minPuan: 470, dilim: "%1",    siralama: "İlk ~10.000",  aciklama: "Fen liseleri ve proje okulları" },
  { minPuan: 460, dilim: "%1.5",  siralama: "İlk ~15.000",  aciklama: "İyi fen ve sosyal bilimler liseleri" },
  { minPuan: 450, dilim: "%2",    siralama: "İlk ~20.000",  aciklama: "Sosyal bilimler liseleri" },
  { minPuan: 440, dilim: "%3",    siralama: "İlk ~30.000",  aciklama: "Güçlü Anadolu Liseleri" },
  { minPuan: 430, dilim: "%4",    siralama: "İlk ~40.000",  aciklama: "İyi Anadolu Liseleri" },
  { minPuan: 420, dilim: "%6",    siralama: "İlk ~60.000",  aciklama: "Nitelikli Anadolu Liseleri" },
  { minPuan: 400, dilim: "%10",   siralama: "İlk ~100.000", aciklama: "Anadolu Liseleri" },
  { minPuan: 380, dilim: "%15",   siralama: "İlk ~150.000", aciklama: "Orta-iyi Anadolu Liseleri" },
  { minPuan: 350, dilim: "%25",   siralama: "İlk ~250.000", aciklama: "Standart Anadolu Liseleri" },
  { minPuan: 300, dilim: "%40",   siralama: "İlk ~400.000", aciklama: "Anadolu / Meslek Liseleri" },
  { minPuan: 250, dilim: "%60",   siralama: "İlk ~600.000", aciklama: "Meslek ve İmam Hatip Liseleri" },
  { minPuan: 200, dilim: "%80+",  siralama: "—",             aciklama: "Taban puan (hiç doğru yapılmasa)" },
];

function tahminYuzdelik(puan: number) {
  for (const row of LGS_YUZDELIK) {
    if (puan >= row.minPuan) return row;
  }
  return LGS_YUZDELIK[LGS_YUZDELIK.length - 1];
}

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
const netHesapla = (d: number, y: number, bolen = 4) => d - y / bolen;

const lgsPuanHesapla = (netler: Record<string, number>) =>
  LGS_TABAN + LGS_DERSLER.reduce((acc, d) => acc + (netler[d.key] ?? 0) * d.kat, 0);

const tytPuanHesapla = (netler: Record<string, number>) =>
  100 + TYT_DERSLER.reduce((acc, d) => acc + (netler[d.key] ?? 0) * d.kat, 0);

const aytPuanHesapla = (tytP: number, aytHam: number) =>
  tytP * 0.4 + (100 + aytHam) * 0.6;

const obpHesapla = (diploma: number, kirik: boolean) =>
  diploma * 5 * (kirik ? 0.06 : 0.12);

// ─── Alt Bileşenler ───────────────────────────────────────────────────────────
function Divider({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 14px" }}>
      <div style={{ flex: 1, height: 1.5, background: `linear-gradient(90deg,${color}55,transparent)`, borderRadius: 2 }} />
      <span style={{ fontSize: "0.67rem", fontWeight: 800, color, letterSpacing: "0.09em", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1.5, background: `linear-gradient(270deg,${color}55,transparent)`, borderRadius: 2 }} />
    </div>
  );
}

function ColHeaders() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 76px 76px 60px 68px", gap: 6, paddingBottom: 6, marginBottom: 2 }}>
      <div />
      {["DOĞRU", "YANLIŞ", "BOŞ", "NET"].map(h => (
        <div key={h} style={{ fontSize: "0.61rem", fontWeight: 800, color: "#9ca3af", textAlign: "center", letterSpacing: "0.05em" }}>{h}</div>
      ))}
    </div>
  );
}

function DersRow({ label, soru, d, y, bolen = 4, onChange }: {
  label: string; soru: number; d: number; y: number; bolen?: number;
  onChange: (tip: "d" | "y", val: number) => void;
}) {
  const n = netHesapla(d, y, bolen);
  const bos = Math.max(0, soru - d - y);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 76px 76px 60px 68px", gap: 6, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
        {label} <span style={{ color: "#d1d5db", fontSize: "0.72rem" }}>/{soru}</span>
      </div>
      <input type="number" min={0} max={soru} value={d || ""} placeholder="0"
        onChange={e => onChange("d", Math.min(soru, Math.max(0, parseInt(e.target.value) || 0)))}
        style={{ padding: "7px 6px", borderRadius: 8, border: "1.5px solid #d1fae5", background: "#f0fdf4", color: "#065f46", fontWeight: 700, fontSize: "0.88rem", textAlign: "center", outline: "none", width: "100%", boxSizing: "border-box" }}
      />
      <input type="number" min={0} max={soru - d} value={y || ""} placeholder="0"
        onChange={e => onChange("y", Math.min(soru - d, Math.max(0, parseInt(e.target.value) || 0)))}
        style={{ padding: "7px 6px", borderRadius: 8, border: "1.5px solid #fee2e2", background: "#fef2f2", color: "#dc2626", fontWeight: 700, fontSize: "0.88rem", textAlign: "center", outline: "none", width: "100%", boxSizing: "border-box" }}
      />
      <div style={{ padding: "7px 6px", borderRadius: 8, background: "#f9fafb", color: "#9ca3af", fontWeight: 600, fontSize: "0.88rem", textAlign: "center" }}>{bos}</div>
      <div style={{ fontWeight: 800, fontSize: "0.9rem", textAlign: "right", paddingRight: 4, color: n < 0 ? "#ef4444" : (d === 0 && y === 0 ? "#d1d5db" : "#0f1f4f") }}>
        {n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}
      </div>
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function NetHesaplamaPage() {
  const [mod, setMod] = useState<"YKS" | "LGS">("LGS");
  const [aktifAYT, setAktifAYT] = useState<AYTTur>("SAY");
  const [diplomaNotu, setDiplomaNotu] = useState("");
  const [kirik, setKirik] = useState(false);
  const [dogru, setDogru] = useState<Record<string, number>>({});
  const [yanlis, setYanlis] = useState<Record<string, number>>({});

  type Sonuc = {
    tytPuan: number; aytHamPuan: number; aytObpliPuan: number; obp: number;
    lgsHamPuan?: number; lgsYuzdelik?: ReturnType<typeof tahminYuzdelik>;
    toplamNet?: number;
  };
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);

  const ch = (key: string, tip: "d" | "y", val: number) => {
    if (tip === "d") setDogru(p => ({ ...p, [key]: val }));
    else setYanlis(p => ({ ...p, [key]: val }));
    setSonuc(null);
  };

  const hesapla = () => {
    const dn = parseFloat(diplomaNotu);
    const obp = dn >= 50 && dn <= 100 ? obpHesapla(dn, kirik) : 0;

    if (mod === "LGS") {
      const netler: Record<string, number> = {};
      LGS_DERSLER.forEach(d => { netler[d.key] = netHesapla(dogru[d.key] || 0, yanlis[d.key] || 0, d.yb); });
      const toplamNet = Object.values(netler).reduce((a, b) => a + b, 0);
      const lgsP = lgsPuanHesapla(netler);
      setSonuc({ tytPuan: 0, aytHamPuan: 0, aytObpliPuan: 0, obp, lgsHamPuan: lgsP, lgsYuzdelik: tahminYuzdelik(lgsP), toplamNet });
      return;
    }

    const tytN: Record<string, number> = {};
    TYT_DERSLER.forEach(d => { tytN[d.key] = netHesapla(dogru[d.key] || 0, yanlis[d.key] || 0); });
    const tytP = tytPuanHesapla(tytN);

    const tur = AYT_TURLERI[aktifAYT];
    const aytN: Record<string, number> = {};
    tur.dersler.forEach(d => { aytN[d.key] = netHesapla(dogru[d.key] || 0, yanlis[d.key] || 0); });
    const ham = tur.aytHam(aytN);
    const aytP = aytPuanHesapla(tytP, ham);

    setSonuc({ tytPuan: tytP, aytHamPuan: aytP, aytObpliPuan: aytP + obp, obp });
  };

  const sifirla = () => { setDogru({}); setYanlis({}); setSonuc(null); setDiplomaNotu(""); };

  const tur = AYT_TURLERI[aktifAYT];
  const dn = parseFloat(diplomaNotu);
  const obpOnizleme = dn >= 50 && dn <= 100 ? obpHesapla(dn, kirik) : null;

  return (
    <main style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "system-ui, sans-serif" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(150deg, #0f1f4f 0%, #1e3a8a 100%)", padding: "80px 16px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14, padding: "5px 14px", background: "rgba(255,255,255,0.12)", borderRadius: 9999 }}>
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.8)", fontWeight: 800, letterSpacing: "0.07em" }}>ÜCRETSİZ ARAÇ</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.75rem, 4vw, 2.6rem)", fontWeight: 800, color: "white", marginBottom: 10, lineHeight: 1.2 }}>
            Net & Puan Hesaplayıcı
          </h1>
          <p style={{ color: "rgba(191,219,254,0.85)", fontSize: "0.92rem", lineHeight: 1.75, marginBottom: 28 }}>
            Doğru/yanlış sayını gir — net, puan ve yüzdelik dilimini anında hesapla. LGS 2024 gerçek katsayılarıyla.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {(["LGS", "YKS"] as const).map(m => (
              <button key={m} onClick={() => { setMod(m); sifirla(); }}
                style={{
                  padding: "9px 22px", borderRadius: 10, border: "none", cursor: "pointer",
                  fontWeight: 700, fontSize: "0.88rem", transition: "all 0.2s",
                  background: mod === m ? "white" : "rgba(255,255,255,0.12)",
                  color: mod === m ? "#1e3a8a" : "rgba(255,255,255,0.85)",
                  boxShadow: mod === m ? "0 4px 16px rgba(0,0,0,0.15)" : "none",
                }}>
                {m === "LGS" ? "🎯 LGS" : "📘 YKS (TYT + AYT)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px 80px" }}>

        {/* ── OBP (YKS için) ── */}
        {mod === "YKS" && (
          <div style={{ background: "white", borderRadius: 18, padding: "22px 24px", border: "1.5px solid #e5e7eb", marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <Divider label="DİPLOMA NOTU & OBP" color="#7c3aed" />
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 150 }}>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>DİPLOMA NOTU (50–100)</label>
                <input type="number" min={50} max={100} placeholder="örn: 85"
                  value={diplomaNotu}
                  onChange={e => { setDiplomaNotu(e.target.value); setSonuc(null); }}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "1rem", fontWeight: 700, outline: "none", boxSizing: "border-box", color: "#0f1f4f" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>OBP TÜRÜ</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ label: "Normal (×0.12)", val: false }, { label: "Kırık (×0.06)", val: true }].map(opt => (
                    <button key={String(opt.val)} onClick={() => { setKirik(opt.val); setSonuc(null); }}
                      style={{
                        flex: 1, padding: "9px 10px", borderRadius: 10, cursor: "pointer",
                        border: "1.5px solid", fontWeight: 600, fontSize: "0.8rem", transition: "all 0.15s",
                        borderColor: kirik === opt.val ? "#7c3aed" : "#e5e7eb",
                        background: kirik === opt.val ? "#f5f3ff" : "white",
                        color: kirik === opt.val ? "#6d28d9" : "#6b7280",
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {obpOnizleme !== null && (
                <div style={{ padding: "10px 18px", background: "#f5f3ff", borderRadius: 10, border: "1.5px solid #ddd6fe", textAlign: "center" }}>
                  <div style={{ fontSize: "0.65rem", color: "#7c3aed", fontWeight: 800, letterSpacing: "0.06em" }}>OBP</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#6d28d9", marginTop: 2 }}>+{obpOnizleme.toFixed(3)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LGS Netleri ── */}
        {mod === "LGS" && (
          <div style={{ background: "white", borderRadius: 18, padding: "22px 24px", border: "1.5px solid #e5e7eb", marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <Divider label="LGS — DOĞRU / YANLIŞ / BOŞ (3 Yanlış = 1 Doğru)" color="#1e3a8a" />
            <ColHeaders />
            {LGS_DERSLER.map(d => (
              <DersRow key={d.key} label={d.label} soru={d.soru} bolen={d.yb}
                d={dogru[d.key] || 0} y={yanlis[d.key] || 0}
                onChange={(tip, val) => ch(d.key, tip, val)}
              />
            ))}
          </div>
        )}

        {/* ── TYT Netleri ── */}
        {mod === "YKS" && (
          <div style={{ background: "white", borderRadius: 18, padding: "22px 24px", border: "1.5px solid #e5e7eb", marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <Divider label="TYT — DOĞRU / YANLIŞ / BOŞ (4 Yanlış = 1 Doğru)" color="#065f46" />
            <ColHeaders />
            {TYT_DERSLER.map(d => (
              <DersRow key={d.key} label={d.label} soru={d.soru}
                d={dogru[d.key] || 0} y={yanlis[d.key] || 0}
                onChange={(tip, val) => ch(d.key, tip, val)}
              />
            ))}
          </div>
        )}

        {/* ── AYT ── */}
        {mod === "YKS" && (
          <div style={{ background: "white", borderRadius: 18, padding: "22px 24px", border: "1.5px solid #e5e7eb", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <Divider label="AYT — PUAN TÜRÜ VE NET HESABI" color={tur.color} />
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {(Object.keys(AYT_TURLERI) as AYTTur[]).map(key => {
                const t = AYT_TURLERI[key];
                return (
                  <button key={key} onClick={() => { setAktifAYT(key); setSonuc(null); }}
                    style={{
                      padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                      fontWeight: 700, fontSize: "0.82rem",
                      border: "1.5px solid", transition: "all 0.15s",
                      borderColor: aktifAYT === key ? t.color : "#e5e7eb",
                      background: aktifAYT === key ? t.bg : "white",
                      color: aktifAYT === key ? t.color : "#6b7280",
                    }}>
                    {t.icon} {t.label}
                  </button>
                );
              })}
            </div>
            <ColHeaders />
            {tur.dersler.map(d => (
              <DersRow key={`${aktifAYT}-${d.key}`} label={d.label} soru={d.soru}
                d={dogru[d.key] || 0} y={yanlis[d.key] || 0}
                onChange={(tip, val) => ch(d.key, tip, val)}
              />
            ))}
          </div>
        )}

        {/* ── Butonlar ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          <button onClick={hesapla}
            style={{
              flex: 1, padding: "14px 24px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(30,58,138,0.28)", transition: "all 0.2s",
            }}>
            Hesapla →
          </button>
          <button onClick={sifirla}
            style={{
              padding: "14px 20px", borderRadius: 12, background: "white",
              color: "#6b7280", border: "1.5px solid #e5e7eb",
              fontWeight: 600, fontSize: "0.88rem", cursor: "pointer",
            }}>
            🔄 Sıfırla
          </button>
        </div>

        {/* ── Sonuçlar ── */}
        {sonuc && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

            {mod === "LGS" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Puan */}
                <div style={{ background: "#eff6ff", borderRadius: 20, padding: "28px 24px", border: "1.5px solid #bfdbfe" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#1e40af", letterSpacing: "0.1em", marginBottom: 10 }}>LGS PUANINIZ</div>
                      <div style={{ fontSize: "3.5rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1 }}>{sonuc.lgsHamPuan!.toFixed(3)}</div>
                      <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 8 }}>
                        Toplam net: <strong>{sonuc.toplamNet!.toFixed(2)}</strong> · 2024 MEB katsayılarıyla
                      </div>
                    </div>
                    {/* Yüzdelik dilim */}
                    {sonuc.lgsYuzdelik && (
                      <div style={{ background: "white", borderRadius: 14, padding: "16px 20px", border: "1.5px solid #bfdbfe", textAlign: "center", minWidth: 140 }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#1e40af", letterSpacing: "0.07em", marginBottom: 6 }}>YÜZDELİK DİLİM</div>
                        <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1 }}>{sonuc.lgsYuzdelik.dilim}</div>
                        <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 6 }}>{sonuc.lgsYuzdelik.siralama}</div>
                        <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 4 }}>{sonuc.lgsYuzdelik.aciklama}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Yüzdelik dilim referans tablosu */}
                <div style={{ background: "white", borderRadius: 18, padding: "20px 22px", border: "1.5px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <Divider label="2024 PUAN–YÜZDELİK DİLİM TABLOSU" color="#1e3a8a" />
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #f3f4f6" }}>
                    {LGS_YUZDELIK.slice(0, 12).map((row, i) => {
                      const isHighlight = sonuc.lgsHamPuan! >= row.minPuan &&
                        (i === 0 || sonuc.lgsHamPuan! < LGS_YUZDELIK[i - 1].minPuan);
                      return (
                        <div key={i} style={{
                          display: "grid", gridTemplateColumns: "60px 70px 1fr",
                          padding: "10px 14px",
                          background: isHighlight ? "#eff6ff" : i % 2 === 0 ? "white" : "#fafafa",
                          borderBottom: i < 11 ? "1px solid #f3f4f6" : "none",
                        }}>
                          <div style={{ fontWeight: isHighlight ? 800 : 600, color: isHighlight ? "#1e40af" : "#374151", fontSize: "0.82rem" }}>
                            {isHighlight ? "👉 " : ""}{row.minPuan}+
                          </div>
                          <div style={{ fontWeight: isHighlight ? 800 : 600, color: isHighlight ? "#1e40af" : "#374151", fontSize: "0.82rem" }}>{row.dilim}</div>
                          <div style={{ color: "#6b7280", fontSize: "0.78rem" }}>{row.aciklama}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 10, textAlign: "center" }}>
                    ⚠️ Tahmini değerler — 2024 LGS verilerine dayanmaktadır. Her yıl sınavın zorluğuna göre değişir.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* TYT */}
                <div style={{ background: "#ecfdf5", borderRadius: 16, padding: "18px 22px", border: "1.5px solid #6ee7b744", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#065f46", letterSpacing: "0.07em" }}>TYT PUANI</div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 2 }}>AYT hesabında %40 ağırlıkla kullanılır</div>
                  </div>
                  <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#065f46" }}>{sonuc.tytPuan.toFixed(3)}</div>
                </div>
                {/* AYT */}
                <div style={{ background: tur.bg, borderRadius: 16, padding: "22px 22px", border: `1.5px solid ${tur.color}33` }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 800, color: tur.color, letterSpacing: "0.07em", marginBottom: 16 }}>
                    {tur.icon} {tur.fullLabel} PUANI
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ background: "white", borderRadius: 12, padding: "16px 18px", border: "1.5px solid #e5e7eb" }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#9ca3af", letterSpacing: "0.06em", marginBottom: 8 }}>HAM PUAN</div>
                      <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f1f4f", lineHeight: 1 }}>{sonuc.aytHamPuan.toFixed(3)}</div>
                      <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 6 }}>OBP eklenmeden</div>
                    </div>
                    <div style={{ background: tur.bg, borderRadius: 12, padding: "16px 18px", border: `1.5px solid ${tur.color}44` }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 800, color: tur.color, letterSpacing: "0.06em", marginBottom: 8 }}>YERLEŞTİRME PUANI</div>
                      <div style={{ fontSize: "2rem", fontWeight: 800, color: tur.color, lineHeight: 1 }}>{sonuc.aytObpliPuan.toFixed(3)}</div>
                      <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 6 }}>
                        {sonuc.obp > 0 ? `+${sonuc.obp.toFixed(3)} OBP dahil` : "Diploma notu girilmedi"}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,255,255,0.6)", borderRadius: 10, fontSize: "0.74rem", color: "#6b7280", textAlign: "center" }}>
                    TYT ({sonuc.tytPuan.toFixed(2)}) × 0.40 + AYT kısmı × 0.60
                    {sonuc.obp > 0 ? ` + OBP (${sonuc.obp.toFixed(3)})` : ""}
                  </div>
                </div>
                {sonuc.obp === 0 && (
                  <div style={{ fontSize: "0.78rem", color: "#9ca3af", textAlign: "center", padding: "4px 0" }}>
                    💡 Diploma notunu girerek OBP'li yerleştirme puanını da görebilirsin
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1e40af)", borderRadius: 20, padding: "32px 28px", textAlign: "center", marginTop: 36, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)" }} />
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 800, color: "white", marginBottom: 10 }}>
            Hedef puanına nasıl ulaşacaksın?
          </h3>
          <p style={{ color: "rgba(191,219,254,0.85)", fontSize: "0.88rem", lineHeight: 1.75, marginBottom: 22, maxWidth: 400, margin: "0 auto 22px" }}>
            Ücretsiz ön görüşmede netlerini analiz eder, sana özel bir yol haritası çiziriz.
          </p>
          <a href="/#İletişim" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", color: "#1e3a8a", padding: "13px 28px", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: "0.95rem", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
            Ücretsiz Ön Görüşme →
          </a>
        </div>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <a href="/" style={{ color: "#9ca3af", fontSize: "0.85rem", textDecoration: "none" }}>← Ana Sayfaya Dön</a>
        </div>
      </div>
    </main>
  );
}