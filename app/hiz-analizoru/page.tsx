"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
//  SINAV VERİSİ
// ═══════════════════════════════════════════════════════════════
type SinavTur = "TYT" | "AYT_SAY" | "AYT_EA" | "AYT_SOZ" | "LGS";

interface Ders {
  key: string;
  label: string;
  soru: number;
  sure: number;         // ÖSYM önerilen toplam süre (dk)
  hedefRef: Record<string, number>; // hedef net referansları
}

// Başarılı öğrenci referans hızları (sn/soru) — puan aralığına göre
// Kaynak: genel TYT/AYT deneme ortalamaları
const REF_HIZ: Record<string, Record<string, number>> = {
  // net aralığı → sn/soru ortalaması
  TYT: {
    turkce:  70,   // 40 soru 120dk → ~90sn ama iyi öğrenci 70sn
    sosyal:  55,
    mat:     90,
    fen:     75,
  },
  AYT_SAY: {
    mat:     120,
    fizik:   110,
    kimya:   100,
    biyo:    90,
  },
  AYT_EA: {
    edb:     90,
    tarih1:  70,
    cog1:    65,
    mat:     120,
  },
  AYT_SOZ: {
    edb:     90,
    tarih1:  70,
    cog1:    65,
    tarih2:  70,
    cog2:    65,
    felsefe: 80,
    dkab:    60,
  },
  LGS: {
    turkce:  65,
    mat:     80,
    fen:     70,
    ink:     50,
    din:     45,
    ing:     55,
  },
};

// Hedef net referansları (puan hedefine göre)
const HEDEF_NETLERI: Record<SinavTur, Record<string, Record<string, number>>> = {
  TYT: {
    "400": { turkce: 25, sosyal: 12, mat: 18, fen: 12 },
    "430": { turkce: 29, sosyal: 14, mat: 22, fen: 14 },
    "460": { turkce: 33, sosyal: 16, mat: 27, fen: 16 },
    "490": { turkce: 36, sosyal: 18, mat: 33, fen: 18 },
  },
  AYT_SAY: {
    "400": { mat: 18, fizik: 7, kimya: 6, biyo: 6 },
    "430": { mat: 24, fizik: 9, kimya: 8, biyo: 8 },
    "460": { mat: 30, fizik: 11, kimya: 10, biyo: 10 },
    "490": { mat: 36, fizik: 13, kimya: 12, biyo: 12 },
  },
  AYT_EA: {
    "400": { edb: 12, tarih1: 5, cog1: 3, mat: 16 },
    "430": { edb: 16, tarih1: 7, cog1: 4, mat: 22 },
    "460": { edb: 19, tarih1: 8, cog1: 5, mat: 28 },
    "490": { edb: 22, tarih1: 9, cog1: 5, mat: 34 },
  },
  AYT_SOZ: {
    "400": { edb: 14, tarih1: 6, cog1: 4, tarih2: 6, cog2: 6, felsefe: 7, dkab: 4 },
    "430": { edb: 18, tarih1: 7, cog1: 4, tarih2: 8, cog2: 8, felsefe: 9, dkab: 4 },
    "460": { edb: 20, tarih1: 8, cog1: 5, tarih2: 9, cog2: 9, felsefe: 10, dkab: 5 },
    "490": { edb: 22, tarih1: 9, cog1: 5, tarih2: 10, cog2: 10, felsefe: 11, dkab: 6 },
  },
  LGS: {
    "400": { turkce: 12, mat: 11, fen: 11, ink: 6, din: 5, ing: 5 },
    "430": { turkce: 14, mat: 13, fen: 13, ink: 7, din: 6, ing: 6 },
    "460": { turkce: 16, mat: 15, fen: 15, ink: 8, din: 7, ing: 7 },
    "490": { turkce: 18, mat: 17, fen: 17, ink: 9, din: 8, ing: 8 },
  },
};

const SINAV_KONFIG: Record<SinavTur, { label: string; toplamSure: number; dersler: Ders[] }> = {
  TYT: {
    label: "TYT",
    toplamSure: 165,
    dersler: [
      { key: "turkce",  label: "Türkçe",         soru: 40, sure: 50, hedefRef: {} },
      { key: "sosyal",  label: "Sosyal Bilimler", soru: 20, sure: 20, hedefRef: {} },
      { key: "mat",     label: "Temel Matematik", soru: 40, sure: 45, hedefRef: {} },
      { key: "fen",     label: "Fen Bilimleri",   soru: 20, sure: 20, hedefRef: {} },
    ],
  },
  AYT_SAY: {
    label: "AYT Sayısal",
    toplamSure: 180,
    dersler: [
      { key: "mat",   label: "Matematik", soru: 40, sure: 75, hedefRef: {} },
      { key: "fizik", label: "Fizik",     soru: 14, sure: 35, hedefRef: {} },
      { key: "kimya", label: "Kimya",     soru: 13, sure: 35, hedefRef: {} },
      { key: "biyo",  label: "Biyoloji",  soru: 13, sure: 35, hedefRef: {} },
    ],
  },
  AYT_EA: {
    label: "AYT Eşit Ağırlık",
    toplamSure: 180,
    dersler: [
      { key: "edb",    label: "Edebiyat",    soru: 24, sure: 45, hedefRef: {} },
      { key: "tarih1", label: "Tarih-1",     soru: 10, sure: 25, hedefRef: {} },
      { key: "cog1",   label: "Coğrafya-1",  soru:  6, sure: 15, hedefRef: {} },
      { key: "mat",    label: "Matematik",   soru: 40, sure: 75, hedefRef: {} },
    ],
  },
  AYT_SOZ: {
    label: "AYT Sözel",
    toplamSure: 180,
    dersler: [
      { key: "edb",     label: "Edebiyat",    soru: 24, sure: 40, hedefRef: {} },
      { key: "tarih1",  label: "Tarih-1",     soru: 10, sure: 20, hedefRef: {} },
      { key: "cog1",    label: "Coğrafya-1",  soru:  6, sure: 15, hedefRef: {} },
      { key: "tarih2",  label: "Tarih-2",     soru: 11, sure: 22, hedefRef: {} },
      { key: "cog2",    label: "Coğrafya-2",  soru: 11, sure: 22, hedefRef: {} },
      { key: "felsefe", label: "Felsefe",     soru: 12, sure: 28, hedefRef: {} },
      { key: "dkab",    label: "Din Kültürü", soru:  6, sure: 13, hedefRef: {} },
    ],
  },
  LGS: {
    label: "LGS",
    toplamSure: 155,
    dersler: [
      { key: "turkce", label: "Türkçe",        soru: 20, sure: 22, hedefRef: {} },
      { key: "mat",    label: "Matematik",      soru: 20, sure: 24, hedefRef: {} },
      { key: "fen",    label: "Fen Bilimleri",  soru: 20, sure: 22, hedefRef: {} },
      { key: "ink",    label: "İnkılap Tarihi", soru: 10, sure: 10, hedefRef: {} },
      { key: "din",    label: "Din Kültürü",    soru: 10, sure:  6, hedefRef: {} },
      { key: "ing",    label: "Yabancı Dil",    soru: 10, sure:  6, hedefRef: {} },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
//  YARDIMCI
// ═══════════════════════════════════════════════════════════════
function fmtSure(sn: number): string {
  if (sn < 60) return `${Math.round(sn)}sn`;
  const dk = Math.floor(sn / 60);
  const s  = Math.round(sn % 60);
  return s > 0 ? `${dk}dk ${s}sn` : `${dk}dk`;
}

// Hız kategorisi (sadece tempo değerlendirmesi için)
type HizKat = "cok_hizli" | "hizli" | "normal" | "yavas" | "cok_yavas";
function hizKat(snPerSoru: number, refSn: number): HizKat {
  if (snPerSoru === 0) return "normal";
  const oran = snPerSoru / refSn;
  if (oran <= 0.80) return "cok_hizli";
  if (oran <= 0.95) return "hizli";
  if (oran <= 1.15) return "normal";
  if (oran <= 1.40) return "yavas";
  return "cok_yavas";
}

// Net verimliliği kategorisi
type NetKat = "iyi" | "orta" | "dusuk";
function netKat(net: number, soru: number): NetKat {
  const oran = soru > 0 ? net / soru : 0;
  if (oran >= 0.75) return "iyi";
  if (oran >= 0.50) return "orta";
  return "dusuk";
}

// Kombine değerlendirme — hem hız hem net birlikte
interface KombineDurum {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  mesaj: string;
  oncelik: number; // 1=acil, 2=dikkat, 3=iyi
}

function kombineDeğerlendir(hiz: HizKat, net: NetKat, label: string, kalanSoru: number): KombineDurum {
  // Net iyi (>=0.75)
  if (net === "iyi" && hiz === "cok_hizli") return {
    label: "Fazla süre var", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", icon: "⚡",
    mesaj: `Netlerin güçlü, hız referansın üzerinde. Bu süreyi eksik olduğun derslere aktarabilirsin.`,
    oncelik: 3,
  };
  if (net === "iyi" && (hiz === "hizli" || hiz === "normal")) return {
    label: "Dengeli", color: "#059669", bg: "#ecfdf5", border: "#6ee7b7", icon: "✓",
    mesaj: `Net oranın ve hızın dengeli. Bu tempoda devam et.`,
    oncelik: 3,
  };
  if (net === "iyi" && hiz === "yavas") return {
    label: "Hız artırılmalı", color: "#d97706", bg: "#fffbeb", border: "#fcd34d", icon: "⚠",
    mesaj: `Netlerin iyi ama yavaşsın — referans hıza yaklaşırsan diğer testlere daha fazla süre kalır.`,
    oncelik: 2,
  };
  if (net === "iyi" && hiz === "cok_yavas") return {
    label: "Çok yavaş", color: "#dc2626", bg: "#fff1f2", border: "#fca5a5", icon: "⚠",
    mesaj: `Netlerin iyi ama tempo çok düşük — bu ders diğer testlerinin süresini yiyor. Hız çalışması şart.`,
    oncelik: 1,
  };
  // Net orta (0.5-0.75)
  if (net === "orta" && hiz === "cok_hizli") return {
    label: "Doğruluk sorunu", color: "#d97706", bg: "#fffbeb", border: "#fcd34d", icon: "◎",
    mesaj: `Süre yeterli ama ${kalanSoru} soru kaçırmışsın — sorun hız değil doğruluk. Tempoyu biraz düşür, her soruya daha dikkatli bak.`,
    oncelik: 2,
  };
  if (net === "orta" && (hiz === "hizli" || hiz === "normal")) return {
    label: "Gelişmeli", color: "#d97706", bg: "#fffbeb", border: "#fcd34d", icon: "◎",
    mesaj: `Net oranın orta düzeyde. ${kalanSoru} soruyu kaçırıyorsun — kontrol ve doğruluk çalışması yapılmalı.`,
    oncelik: 2,
  };
  if (net === "orta" && (hiz === "yavas" || hiz === "cok_yavas")) return {
    label: "Kritik alan", color: "#dc2626", bg: "#fff1f2", border: "#fca5a5", icon: "🚨",
    mesaj: `Hem yavaşsın hem ${kalanSoru} soru kaçırıyorsun. Bu ders öncelikli çalışma alanın olmalı.`,
    oncelik: 1,
  };
  // Net düşük (<0.5)
  if (net === "dusuk" && hiz === "cok_hizli") return {
    label: "Verim çok düşük", color: "#9f1239", bg: "#fff1f2", border: "#fda4af", icon: "🚨",
    mesaj: `Hızlısın ama ${kalanSoru} soruyu kaçırıyorsun — tempo fazla yüksek, acele etmek hata üretiyor. Yavaşla ve her soruyu oku.`,
    oncelik: 1,
  };
  // net düşük, hız hızlı/normal/yavaş
  return {
    label: "Öncelikli alan", color: "#9f1239", bg: "#fff1f2", border: "#fda4af", icon: "🚨",
    mesaj: `${kalanSoru} soruyu kaçırıyorsun — konu eksikleri var ve acil çalışma gerekiyor.`,
    oncelik: 1,
  };
}

// ═══════════════════════════════════════════════════════════════
//  ANALİZ
// ═══════════════════════════════════════════════════════════════
interface DersGirdi { net: number; sure: number; }  // sure = dakika

interface DersSonuc {
  key: string; label: string; soru: number;
  net: number; sure: number;
  snPerSoru: number;
  refSnPerSoru: number;
  hiz: HizKat;
  netV: NetKat;
  durum: KombineDurum;
  kalanSoru: number;        // soru - net (kaçırılan)
  kaybedilenSoru: number;   // hız kaybından gelen soru kaybı
  hedefNet: number;
  netFark: number;
  optimal: number;
}

function analiz(
  sinav: SinavTur,
  girdiler: Record<string, DersGirdi>,
  hedef: string,
): DersSonuc[] {
  const konfig = SINAV_KONFIG[sinav];
  const hedefNetler = HEDEF_NETLERI[sinav][hedef] ?? {};
  const refHizlar = REF_HIZ[sinav] ?? {};

  return konfig.dersler.map(ders => {
    const g = girdiler[ders.key] ?? { net: 0, sure: 0 };
    const snPerSoru = g.sure > 0 ? (g.sure * 60) / ders.soru : 0;
    const refSn     = refHizlar[ders.key] ?? 90;

    const hiz    = snPerSoru > 0 ? hizKat(snPerSoru, refSn) : "normal";
    const netV   = netKat(g.net, ders.soru);
    const kalanSoru = Math.max(0, Math.round(ders.soru - g.net)); // kaçırılan soru = toplam - net
    const durum  = kombineDeğerlendir(hiz, netV, ders.label, kalanSoru);

    // Hız kaybından gelen soru kaybı (sadece yavaşsa anlamlı)
    const refToplam    = refSn * ders.soru;
    const gercekToplam = g.sure * 60;
    const fazlaSn      = Math.max(0, gercekToplam - refToplam);
    const kaybedilenSoru = Math.round(fazlaSn / refSn);

    const hedefNet = hedefNetler[ders.key] ?? 0;
    const netFark  = hedefNet - g.net;
    const optimal  = Math.round((refSn * ders.soru * 1.05) / 60);

    return {
      key: ders.key, label: ders.label, soru: ders.soru,
      net: g.net, sure: g.sure,
      snPerSoru, refSnPerSoru: refSn,
      hiz, netV, durum, kalanSoru,
      kaybedilenSoru, hedefNet, netFark, optimal,
    };
  });
}

// ═══════════════════════════════════════════════════════════════
//  ALT BİLEŞENLER
// ═══════════════════════════════════════════════════════════════
function SureBar({ val, max, color }: { val: number; max: number; color: string }) {
  const pct = Math.min(100, (val / max) * 100);
  return (
    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
    </div>
  );
}

function DersKarti({ sonuc, hedefLabel }: { sonuc: DersSonuc; hedefLabel: string }) {
  const d = sonuc.durum;
  const maxSn = Math.max(sonuc.snPerSoru, sonuc.refSnPerSoru) * 1.3 || 120;
  const netOran = sonuc.soru > 0 ? Math.round((sonuc.net / sonuc.soru) * 100) : 0;

  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "18px 20px",
      border: `1.5px solid ${d.oncelik === 3 ? "#e2e8f0" : d.border}`,
    }}>
      {/* Başlık */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>{sonuc.label}</div>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>{sonuc.soru} soru</div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
          borderRadius: 99, background: d.bg, border: `1px solid ${d.border}`,
        }}>
          <span style={{ fontSize: "0.75rem" }}>{d.icon}</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: d.color }}>{d.label}</span>
        </div>
      </div>

      {/* Net verimi çubuğu */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#64748b", marginBottom: 5 }}>
          <span>Net oranı</span>
          <span style={{ fontWeight: 700, color: d.color }}>%{netOran} ({sonuc.net}/{sonuc.soru})</span>
        </div>
        <SureBar val={sonuc.net} max={sonuc.soru} color={d.color} />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#64748b", marginTop: 10, marginBottom: 5 }}>
          <span>Senin hızın</span>
          <span style={{ fontWeight: 700, color: "#475569" }}>{sonuc.snPerSoru > 0 ? fmtSure(sonuc.snPerSoru) : "—"} / soru</span>
        </div>
        <SureBar val={sonuc.snPerSoru} max={maxSn} color="#475569" />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#64748b", marginTop: 6, marginBottom: 5 }}>
          <span>Referans hız</span>
          <span style={{ fontWeight: 600, color: "#94a3b8" }}>{fmtSure(sonuc.refSnPerSoru)} / soru</span>
        </div>
        <SureBar val={sonuc.refSnPerSoru} max={maxSn} color="#cbd5e1" />
      </div>

      {/* İstatistik kutuları */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ textAlign: "center", padding: "10px 6px", background: "#f8fafc", borderRadius: 10 }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>{sonuc.net}</div>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 2 }}>Mevcut net</div>
        </div>
        <div style={{ textAlign: "center", padding: "10px 6px", background: "#f8fafc", borderRadius: 10 }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: sonuc.kalanSoru > 5 ? "#dc2626" : sonuc.kalanSoru > 0 ? "#d97706" : "#059669" }}>
            {sonuc.kalanSoru > 0 ? `−${sonuc.kalanSoru}` : "✓"}
          </div>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 2 }}>Kaçan soru</div>
        </div>
        <div style={{ textAlign: "center", padding: "10px 6px", background: "#f8fafc", borderRadius: 10 }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: sonuc.netFark > 0 ? "#dc2626" : "#059669" }}>
            {sonuc.netFark > 0 ? `−${sonuc.netFark}` : "✓"}
          </div>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 2 }}>{hedefLabel} fark</div>
        </div>
      </div>

      {/* Mesaj kutusu — her zaman göster */}
      <div style={{
        padding: "10px 12px", borderRadius: 10,
        background: d.bg, border: `1px solid ${d.border}`,
        fontSize: "0.76rem", color: d.color, lineHeight: 1.6,
      }}>
        {d.mesaj}
        {(sonuc.hiz === "yavas" || sonuc.hiz === "cok_yavas") && sonuc.kaybedilenSoru > 0 && (
          <span> Referans hıza geçsen <strong>{sonuc.kaybedilenSoru} soru</strong> daha çözebilirdin (önerilen: <strong>{sonuc.optimal}dk</strong>).</span>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ÖZET RAPOR
// ═══════════════════════════════════════════════════════════════
function OzetRapor({ sonuclar, toplamSure, sinav, hedef }: {
  sonuclar: DersSonuc[];
  toplamSure: number;
  sinav: SinavTur;
  hedef: string;
}) {
  const toplamGirilen  = sonuclar.reduce((a, s) => a + s.sure, 0);
  const toplamKayip    = sonuclar.reduce((a, s) => a + s.kaybedilenSoru, 0);
  const toplamNetFark  = sonuclar.reduce((a, s) => a + Math.max(0, s.netFark), 0);
  const kritikler      = sonuclar.filter(s => s.durum.oncelik === 1);
  const dikkatler      = sonuclar.filter(s => s.durum.oncelik === 2);
  const hizFazlasi     = sonuclar.filter(s => s.hiz === "cok_hizli" && s.netV === "iyi");
  const kalan          = toplamSure - toplamGirilen;

  // Optimal dağılım önerisi
  const toplamRef = sonuclar.reduce((a, s) => a + s.optimal, 0);
  const katsayi   = toplamSure / toplamRef;

  return (
    <div style={{
      background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
      borderRadius: 20, padding: "28px 24px", color: "white", marginBottom: 24,
    }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "rgba(148,163,184,0.8)", letterSpacing: "0.1em", marginBottom: 16 }}>
        STRATEJİK ÖZET RAPOR
      </div>

      {/* Ana metrikler */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { val: `${toplamGirilen}/${toplamSure}`, sub: "dk kullandın", warn: toplamGirilen > toplamSure },
          { val: toplamKayip > 0 ? `${toplamKayip} soru` : "Yok", sub: "hız kaybı", warn: toplamKayip > 3 },
          { val: toplamNetFark > 0 ? `${toplamNetFark} net` : "Ulaştın!", sub: `${hedef} hedef farkı`, warn: toplamNetFark > 5 },
        ].map((m, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 12px", textAlign: "center",
            border: m.warn ? "1px solid rgba(252,165,165,0.3)" : "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: m.warn ? "#fca5a5" : "white" }}>{m.val}</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(148,163,184,0.8)", marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Mesajlar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {kalan < 0 && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.15)", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", fontSize: "0.8rem", color: "#fca5a5" }}>
            🚨 Toplam süreyi <strong>{Math.abs(kalan)} dk aştın!</strong> Soru başına hızlanman şart.
          </div>
        )}
        {kritikler.length > 0 && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.15)", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", fontSize: "0.8rem", color: "#fca5a5", lineHeight: 1.6 }}>
            🚨 <strong>{kritikler.map(s => s.label).join(", ")}</strong> — öncelikli çalışma alanın. Net oranı ve/veya hız kritik seviyede.
          </div>
        )}
        {dikkatler.length > 0 && (
          <div style={{ padding: "10px 14px", background: "rgba(251,191,36,0.1)", borderRadius: 10, border: "1px solid rgba(251,191,36,0.2)", fontSize: "0.8rem", color: "#fde68a", lineHeight: 1.6 }}>
            ⚠️ <strong>{dikkatler.map(s => s.label).join(", ")}</strong> — dikkat edilmesi gereken alanlar.
          </div>
        )}
        {hizFazlasi.length > 0 && (
          <div style={{ padding: "10px 14px", background: "rgba(6,182,212,0.1)", borderRadius: 10, border: "1px solid rgba(6,182,212,0.2)", fontSize: "0.8rem", color: "#a5f3fc", lineHeight: 1.6 }}>
            ⚡ <strong>{hizFazlasi.map(s => s.label).join(", ")}</strong> derslerinde fazla süren var — bu zamanı kritik derslere kaydır.
          </div>
        )}
        {kritikler.length === 0 && dikkatler.length === 0 && kalan >= 0 && (
          <div style={{ padding: "10px 14px", background: "rgba(16,185,129,0.1)", borderRadius: 10, border: "1px solid rgba(16,185,129,0.2)", fontSize: "0.8rem", color: "#6ee7b7" }}>
            ✓ Net oranın ve hızın dengeli — devam et, odağı artırmaya kaydır.
          </div>
        )}
      </div>

      {/* Optimal dağılım */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "rgba(148,163,184,0.7)", letterSpacing: "0.08em", marginBottom: 10 }}>
          ÖNERİLEN SÜRE DAĞILIMI
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sonuclar.map(s => {
            const onerilen = Math.round(s.optimal * katsayi);
            const fark = s.sure - onerilen;
            return (
              <div key={s.key} style={{
                padding: "6px 12px", borderRadius: 99, fontSize: "0.72rem", fontWeight: 600,
                background: fark > 5 ? "rgba(239,68,68,0.2)" : fark < -5 ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.1)",
                color: fark > 5 ? "#fca5a5" : fark < -5 ? "#a5f3fc" : "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                {s.label}: <strong>{onerilen}dk</strong>
                {fark > 5 && <span style={{ marginLeft: 4, opacity: 0.7 }}>↓{fark}dk</span>}
                {fark < -5 && <span style={{ marginLeft: 4, opacity: 0.7 }}>↑{Math.abs(fark)}dk</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  GİRDİ FORMU
// ═══════════════════════════════════════════════════════════════
function DersGirdiRow({ ders, val, onChange }: {
  ders: { key: string; label: string; soru: number };
  val: DersGirdi;
  onChange: (v: DersGirdi) => void;
}) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 90px 90px",
      gap: 10, alignItems: "center",
      padding: "10px 0", borderBottom: "1px solid #f1f5f9",
    }}>
      <div>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>{ders.label}</div>
        <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{ders.soru} soru</div>
      </div>
      <div>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", marginBottom: 4, textAlign: "center" }}>NET</div>
        <input
          type="number" min={0} max={ders.soru} placeholder="0"
          value={val.net || ""}
          onChange={e => onChange({ ...val, net: Math.min(ders.soru, Math.max(0, parseFloat(e.target.value) || 0)) })}
          style={{
            width: "100%", padding: "8px 6px", borderRadius: 8, border: "1.5px solid #e2e8f0",
            background: "#f8fafc", textAlign: "center", fontWeight: 700,
            fontSize: "0.9rem", color: "#0f172a", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>
      <div>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", marginBottom: 4, textAlign: "center" }}>SÜRE (dk)</div>
        <input
          type="number" min={0} max={200} placeholder="0"
          value={val.sure || ""}
          onChange={e => onChange({ ...val, sure: Math.max(0, parseInt(e.target.value) || 0) })}
          style={{
            width: "100%", padding: "8px 6px", borderRadius: 8, border: "1.5px solid #dbeafe",
            background: "#eff6ff", textAlign: "center", fontWeight: 700,
            fontSize: "0.9rem", color: "#1e40af", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ANA SAYFA
// ═══════════════════════════════════════════════════════════════
export default function HizAnalizorPage() {
  const [sinav, setSinav]   = useState<SinavTur>("TYT");
  const [hedef, setHedef]   = useState("430");
  const [girdiler, setGirdiler] = useState<Record<string, DersGirdi>>({});
  const [sonuclar, setSonuclar] = useState<DersSonuc[] | null>(null);

  const konfig = SINAV_KONFIG[sinav];

  const setDers = (key: string, val: DersGirdi) => {
    setGirdiler(p => ({ ...p, [key]: val }));
    setSonuclar(null);
  };

  const hesapla = () => {
    const s = analiz(sinav, girdiler, hedef);
    setSonuclar(s);
    setTimeout(() => {
      document.getElementById("hiz-sonuc")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const sifirla = () => { setGirdiler({}); setSonuclar(null); };

  const hedefler = Object.keys(HEDEF_NETLERI[sinav]);

  return (
    <main style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "system-ui, sans-serif" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(150deg, #0f172a, #1e3a8a)", padding: "80px 16px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14,
            padding: "5px 14px", background: "rgba(255,255,255,0.12)", borderRadius: 9999,
          }}>
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.8)", fontWeight: 800, letterSpacing: "0.07em" }}>
              ÜCRETSİZ ARAÇ
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.75rem, 4vw, 2.6rem)",
            fontWeight: 800, color: "white", marginBottom: 10, lineHeight: 1.2,
          }}>
            Kaç Net Kaç Dakika?
          </h1>
          <p style={{ color: "rgba(191,219,254,0.85)", fontSize: "0.92rem", lineHeight: 1.8, marginBottom: 8, maxWidth: 520 }}>
            Netlerini değil, <strong style={{ color: "white" }}>hızını</strong> kaybediyorsun.
            Her teste ne kadar süre harcadığını gir — sana tam olarak nerede zaman kaybettiğini ve
            nasıl <strong style={{ color: "white" }}>daha fazla soru</strong> çözebileceğini gösterelim.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px 80px" }}>

        {/* Sınav & Hedef seçimi */}
        <div style={{
          background: "white", borderRadius: 18, padding: "22px 24px",
          border: "1.5px solid #e2e8f0", marginBottom: 14,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 14 }}>
            SINAV & HEDEF
          </div>

          {/* Sınav seçimi */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 8 }}>SINAV TÜRÜ</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(Object.keys(SINAV_KONFIG) as SinavTur[]).map(k => (
                <button key={k} onClick={() => { setSinav(k); sifirla(); }}
                  style={{
                    padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 600,
                    fontSize: "0.8rem", border: "1.5px solid", transition: "all 0.15s",
                    borderColor: sinav === k ? "#1e3a8a" : "#e2e8f0",
                    background: sinav === k ? "#1e3a8a" : "white",
                    color: sinav === k ? "white" : "#64748b",
                  }}>
                  {SINAV_KONFIG[k].label}
                </button>
              ))}
            </div>
          </div>

          {/* Hedef puan */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 8 }}>HEDEF PUAN</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {hedefler.map(h => (
                <button key={h} onClick={() => setHedef(h)}
                  style={{
                    padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 600,
                    fontSize: "0.8rem", border: "1.5px solid", transition: "all 0.15s",
                    borderColor: hedef === h ? "#f97316" : "#e2e8f0",
                    background: hedef === h ? "#fff7ed" : "white",
                    color: hedef === h ? "#ea580c" : "#64748b",
                  }}>
                  {h}+
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Giriş formu */}
        <div style={{
          background: "white", borderRadius: 18, padding: "22px 24px",
          border: "1.5px solid #e2e8f0", marginBottom: 14,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 4 }}>
            DENEME SONUÇLARIN
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: 16 }}>
            Toplam süre: <strong style={{ color: "#475569" }}>{konfig.toplamSure} dk</strong>
          </div>

          {konfig.dersler.map(ders => (
            <DersGirdiRow
              key={ders.key}
              ders={ders}
              val={girdiler[ders.key] ?? { net: 0, sure: 0 }}
              onChange={v => setDers(ders.key, v)}
            />
          ))}
        </div>

        {/* Hesapla */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          <button onClick={hesapla} style={{
            flex: 1, padding: "14px 24px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #0f172a, #2563eb)",
            color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(30,58,138,0.28)",
          }}>
            Hızımı Analiz Et →
          </button>
          <button onClick={sifirla} style={{
            padding: "14px 20px", borderRadius: 12, background: "white",
            color: "#64748b", border: "1.5px solid #e2e8f0",
            fontWeight: 600, fontSize: "0.88rem", cursor: "pointer",
          }}>
            🔄 Sıfırla
          </button>
        </div>

        {/* Sonuçlar */}
        {sonuclar && (
          <div id="hiz-sonuc" style={{ animation: "fadeUp .3s ease" }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

            <OzetRapor
              sonuclar={sonuclar}
              toplamSure={konfig.toplamSure}
              sinav={sinav}
              hedef={hedef}
            />

            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 12 }}>
              DERS BAZLI ANALİZ
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {sonuclar.map(s => (
                <DersKarti key={s.key} sonuc={s} hedefLabel={`${hedef}+`} />
              ))}
            </div>

            {/* CTA */}
            <div style={{
              background: "linear-gradient(135deg,#1e3a8a,#1e40af)",
              borderRadius: 20, padding: "32px 28px", textAlign: "center",
              marginTop: 32, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -30, right: -30, width: 160, height: 160,
                background: "radial-gradient(circle,rgba(249,115,22,0.15) 0%,transparent 70%)",
              }}/>
              <h3 style={{
                fontFamily: "'Playfair Display', serif", fontSize: "1.3rem",
                fontWeight: 800, color: "white", marginBottom: 10,
              }}>
                Hız analizin hazır — strateji için koç lazım
              </h3>
              <p style={{
                color: "rgba(191,219,254,0.85)", fontSize: "0.88rem",
                lineHeight: 1.75, marginBottom: 22, maxWidth: 400, margin: "0 auto 22px",
              }}>
                Sana özel süre dağılımı planı ve deneme stratejisi için ücretsiz ön görüşme al.
              </p>
              <a href="/#İletişim" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "white", color: "#1e3a8a", padding: "13px 28px",
                borderRadius: 10, fontWeight: 700, textDecoration: "none",
                fontSize: "0.95rem", boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}>
                Ücretsiz Ön Görüşme →
              </a>
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <a href="/" style={{ color: "#94a3b8", fontSize: "0.85rem", textDecoration: "none" }}>
                ← Ana Sayfaya Dön
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}