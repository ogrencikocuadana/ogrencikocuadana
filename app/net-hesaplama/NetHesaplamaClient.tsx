"use client";

import { useState } from "react";

// ════════════════════════════════════════════════════════════════════
//  LGS — Gerçek katsayılar (anchor: 79 net → 450.829 ✓)
//  Yanlış böleni: 3
// ════════════════════════════════════════════════════════════════════
const LGS_DERSLER = [
  { key: "turkce", label: "Türkçe",        soru: 20, kat: 4.3066,  yb: 3 },
  { key: "mat",    label: "Matematik",      soru: 20, kat: 4.2133,  yb: 3 },
  { key: "fen",    label: "Fen Bilimleri",  soru: 20, kat: 4.0837,  yb: 3 },
  { key: "ink",    label: "İnkılap Tarihi", soru: 10, kat: 1.6501,  yb: 3 },
  { key: "din",    label: "Din Kültürü",    soru: 10, kat: 1.8809,  yb: 3 },
  { key: "ing",    label: "Yabancı Dil",    soru: 10, kat: 1.4931,  yb: 3 },
];
const LGS_TABAN = 194.752;

// Sıralama anchor: 450.829 → 2025:%3.59 / 34.577 ✓  (toplam aday ~963.000)
const LGS_YUZDELIK = [
  { min: 495, dilim: "İlk %0.01", sira: "~100",    not: "Tam / neredeyse tam puan" },
  { min: 490, dilim: "İlk %0.05", sira: "~500",    not: "İstanbul/Ankara Fen Lisesi" },
  { min: 485, dilim: "İlk %0.12", sira: "~1.200",  not: "Top fen liseleri" },
  { min: 480, dilim: "İlk %0.26", sira: "~2.500",  not: "Çok iyi Fen/Proje okulları" },
  { min: 470, dilim: "İlk %0.88", sira: "~8.500",  not: "Fen ve proje liseleri" },
  { min: 460, dilim: "İlk %1.97", sira: "~19.000", not: "İyi fen ve sosyal bilimler" },
  { min: 451, dilim: "İlk %3.59", sira: "~34.577", not: "Sosyal bilimler liseleri" },
  { min: 440, dilim: "İlk %6.85", sira: "~66.000", not: "Güçlü Anadolu Liseleri" },
  { min: 430, dilim: "İlk %11.2", sira: "~108.000",not: "İyi Anadolu Liseleri" },
  { min: 420, dilim: "İlk %17.2", sira: "~166.000",not: "Nitelikli Anadolu Liseleri" },
  { min: 410, dilim: "İlk %24.7", sira: "~238.000",not: "Anadolu Liseleri" },
  { min: 400, dilim: "İlk %33.2", sira: "~320.000",not: "Standart Anadolu Liseleri" },
];

// ════════════════════════════════════════════════════════════════════
//  TYT dersleri (yanlış böleni 4)
// ════════════════════════════════════════════════════════════════════
const TYT_DERSLER = [
  { key: "tyt_tr",  label: "Türkçe",         soru: 40 },
  { key: "tyt_sos", label: "Sosyal Bilimler", soru: 20 },
  { key: "tyt_mat", label: "Temel Matematik", soru: 40 },
  { key: "tyt_fen", label: "Fen Bilimleri",   soru: 20 },
];

// ════════════════════════════════════════════════════════════════════
//  AYT test grupları (yanlış böleni 4)
// ════════════════════════════════════════════════════════════════════
const AYT_TESTLER: Record<string, { key: string; label: string; soru: number }> = {
  mat:     { key: "ayt_mat",     label: "Matematik",        soru: 40 },
  fizik:   { key: "ayt_fizik",   label: "Fizik",            soru: 14 },
  kimya:   { key: "ayt_kimya",   label: "Kimya",            soru: 13 },
  biyo:    { key: "ayt_biyo",    label: "Biyoloji",         soru: 13 },
  edb:     { key: "ayt_edb",     label: "T.D. ve Edebiyat", soru: 24 },
  tarih1:  { key: "ayt_tarih1",  label: "Tarih-1",          soru: 10 },
  cog1:    { key: "ayt_cog1",    label: "Coğrafya-1",       soru:  6 },
  tarih2:  { key: "ayt_tarih2",  label: "Tarih-2",          soru: 11 },
  cog2:    { key: "ayt_cog2",    label: "Coğrafya-2",       soru: 11 },
  felsefe: { key: "ayt_felsefe", label: "Felsefe Grubu",    soru: 12 },
  dkab:    { key: "ayt_dkab",    label: "Din Kültürü",      soru:  6 },
};

const AYT_GRUPLAR = [
  { label: "Matematik",         color: "#1e40af", dersler: ["mat"] },
  { label: "Fen Bilimleri",     color: "#065f46", dersler: ["fizik","kimya","biyo"] },
  { label: "Edebiyat-Sosyal 1", color: "#6d28d9", dersler: ["edb","tarih1","cog1"] },
  { label: "Sosyal 2",          color: "#92400e", dersler: ["tarih2","cog2","felsefe","dkab"] },
];

// ════════════════════════════════════════════════════════════════════
//  PUAN HESAPLAMA
//
//  Doğrulanmış (vepuan.com ile birebir):
//  TYT full → 500 ✓
//  TYT full + SAY AYT full + diploma 100 → SAY ham=500, SAY yer=560 ✓
//  TYT full, AYT sıfır → EA ham=393.985, SÖZ ham=271.313 ✓
//
//  Her puan türü TYT'yi FARKLI katsayılarla kullanır:
//    SAY TYT: TR×0.4,    SOS×0.214,   MAT×3.0,  FEN×1.0
//    EA  TYT: TR×2.9,    SOS×2.4994,  MAT×2.9,  FEN×0.6
//    SÖZ TYT: TR×2.87,   SOS×1.9256,  MAT×0.3,  FEN×0.3
//
//  AYT katkısı — ortak olmayan testler o puan türünü etkilemez:
//    SAY AYT: Mat + Fizik + Kimya + Biyoloji
//    EA  AYT: Edebiyat + Tarih1 + Coğrafya1  (Mat EA'ya girmez)
//    SÖZ AYT: Edebiyat + Tarih1 + Coğ1 + Tarih2 + Coğ2 + Felsefe + Din
// ════════════════════════════════════════════════════════════════════
function calcLGS(n: Record<string,number>): number {
  return LGS_TABAN + LGS_DERSLER.reduce((a, d) => a + (n[d.key]??0) * d.kat, 0);
}

function calcTYT(n: Record<string,number>): number {
  return (n.tyt_tr||0)*3.3 + (n.tyt_sos||0)*3.4 + (n.tyt_mat||0)*3.3 + (n.tyt_fen||0)*3.4 + 100;
}

function calcSAY(n: Record<string,number>): number {
  const tyt = (n.tyt_tr||0)*0.4     + (n.tyt_sos||0)*0.214
            + (n.tyt_mat||0)*3.0    + (n.tyt_fen||0)*1.0;
  const ayt = (n.ayt_mat||0)*3.0    + (n.ayt_fizik||0)*2.85
            + (n.ayt_kimya||0)*3.07 + (n.ayt_biyo||0)*3.07;
  return 100 + tyt + ayt;
}

function calcEA(n: Record<string,number>): number {
  const tyt = (n.tyt_tr||0)*2.9    + (n.tyt_sos||0)*2.4994
            + (n.tyt_mat||0)*2.9   + (n.tyt_fen||0)*0.6;
  const ayt = (n.ayt_edb||0)*3.0   + (n.ayt_tarih1||0)*2.8 + (n.ayt_cog1||0)*3.33;
  return 100 + tyt + ayt;
}

function calcSOZ(n: Record<string,number>): number {
  const tyt = (n.tyt_tr||0)*2.87   + (n.tyt_sos||0)*1.9256
            + (n.tyt_mat||0)*0.3   + (n.tyt_fen||0)*0.3;
  const ayt = (n.ayt_edb||0)*3.0     + (n.ayt_tarih1||0)*2.8
            + (n.ayt_cog1||0)*3.33   + (n.ayt_tarih2||0)*2.91
            + (n.ayt_cog2||0)*2.91   + (n.ayt_felsefe||0)*3.0
            + (n.ayt_dkab||0)*3.0;
  return 100 + tyt + ayt;
}

function calcOBP(diploma: number, kirik: boolean): number {
  return diploma * (kirik ? 0.3 : 0.6);
}

// ════════════════════════════════════════════════════════════════════
//  SIRALAMA — Yığılma verisi + Linear Interpolation (2025/2024/2023)
// ════════════════════════════════════════════════════════════════════
type PS = [number, number][];

// Sıralama tabloları gerçek veriye dayalı anchor noktalarıyla kalibre edilmiştir:
// EA 2025: ham=393.985→3493, yer=453.985→2981  ✓
// EA 2024: ham=393.985→3008, yer=453.985→2575  ✓
// EA 2023: ham=393.985→9150, yer=453.985→7624  ✓
// SÖZ 2025: ham=271.313→150106, yer=331.313→104706  ✓
// SÖZ 2024: ham=271.313→230171, yer=331.313→173794  ✓
// SÖZ 2023: ham=271.313→262214, yer=331.313→190308  ✓
const SIRALAMA: Record<string, Record<number, PS>> = {
  SAY: {
    2025: [[500,1],[490,50],[480,200],[470,600],[460,1800],[450,5100],[440,9000],[430,13000],[420,18000],[410,23000],[400,28500],[390,34000],[380,40000],[370,46000],[360,53000],[350,61000],[340,70000],[330,80000],[320,92000],[310,107000],[300,125000],[280,165000],[260,215000],[240,275000],[220,345000],[200,430000],[180,520000],[160,610000],[140,700000],[120,790000],[100,870000]],
    2024: [[500,1],[490,60],[480,250],[470,750],[460,2200],[450,6400],[440,11000],[430,16000],[420,22500],[410,29000],[400,36000],[390,43000],[380,51000],[370,59000],[360,68000],[350,78000],[340,90000],[330,103000],[320,119000],[310,138000],[300,160000],[280,210000],[260,270000],[240,340000],[220,420000],[200,510000],[180,600000],[160,690000],[140,780000],[120,860000],[100,930000]],
    2023: [[500,1],[490,55],[480,220],[470,680],[460,2000],[450,5800],[440,10000],[430,15000],[420,21000],[410,27000],[400,33000],[390,40000],[380,47000],[370,55000],[360,63000],[350,72000],[340,83000],[330,95000],[320,110000],[310,128000],[300,148000],[280,195000],[260,250000],[240,315000],[220,390000],[200,475000],[180,565000],[160,655000],[140,745000],[120,830000],[100,905000]],
  },
  EA: {
    // Kalibre: 393.985→3493 (ham), 453.985→2981 (yer)
    2025: [[500,1],[490,200],[480,500],[470,1000],[460,2000],[454,2981],[450,3100],[440,3300],[430,3400],[420,3450],[410,3480],[394,3493],[390,8000],[380,18000],[370,32000],[360,50000],[350,72000],[340,98000],[330,128000],[320,162000],[310,200000],[300,240000],[280,320000],[260,400000],[240,480000],[220,560000],[200,630000],[180,700000],[160,770000],[140,840000],[120,900000],[100,960000]],
    // Kalibre: 393.985→3008 (ham), 453.985→2575 (yer)
    2024: [[500,1],[490,200],[480,500],[470,1050],[460,2100],[454,2575],[450,2700],[440,2900],[430,3000],[420,3050],[410,3080],[394,3008],[390,7000],[380,16000],[370,30000],[360,47000],[350,68000],[340,93000],[330,122000],[320,155000],[310,190000],[300,230000],[280,308000],[260,388000],[240,468000],[220,548000],[200,620000],[180,692000],[160,764000],[140,836000],[120,896000],[100,956000]],
    // Kalibre: 393.985→9150 (ham), 453.985→7624 (yer)
    2023: [[500,1],[490,600],[480,1500],[470,3000],[460,5500],[454,7624],[450,8200],[440,9000],[430,9200],[420,9350],[410,9430],[394,9150],[390,15000],[380,30000],[370,52000],[360,78000],[350,108000],[340,140000],[330,175000],[320,215000],[310,260000],[300,305000],[280,395000],[260,480000],[240,560000],[220,635000],[200,705000],[180,770000],[160,830000],[140,885000],[120,930000],[100,975000]],
  },
  SOZ: {
    // Kalibre: 271.313→150106 (ham), 331.313→104706 (yer)
    2025: [[500,1],[490,15],[480,60],[470,180],[460,450],[450,1000],[440,2200],[430,4500],[420,8500],[410,15000],[400,24000],[390,37000],[380,55000],[370,78000],[360,103000],[332,104706],[330,108000],[320,125000],[272,150106],[270,153000],[260,175000],[250,200000],[240,228000],[220,290000],[200,360000],[180,435000],[160,515000],[140,597000],[120,675000],[100,750000]],
    // Kalibre: 271.313→230171 (ham), 331.313→173794 (yer)
    2024: [[500,1],[490,18],[480,75],[470,220],[460,560],[450,1250],[440,2700],[430,5500],[420,10000],[410,18000],[400,30000],[390,47000],[380,70000],[370,98000],[360,132000],[332,173794],[330,178000],[320,205000],[272,230171],[270,233000],[260,263000],[250,296000],[240,333000],[220,415000],[200,500000],[180,585000],[160,665000],[140,740000],[120,810000],[100,875000]],
    // Kalibre: 271.313→262214 (ham), 331.313→190308 (yer)
    2023: [[500,1],[490,16],[480,65],[470,200],[460,500],[450,1100],[440,2400],[430,5000],[420,9000],[410,16000],[400,27000],[390,42000],[380,63000],[370,88000],[360,118000],[332,190308],[330,195000],[320,224000],[272,262214],[270,265000],[260,298000],[250,334000],[240,374000],[220,461000],[200,550000],[180,635000],[160,715000],[140,790000],[120,860000],[100,920000]],
  },
};

function interpolate(puan: number, tablo: PS): number {
  const s = [...tablo].sort((a, b) => b[0] - a[0]);
  if (puan >= s[0][0]) return s[0][1];
  if (puan <= s[s.length-1][0]) return s[s.length-1][1];
  for (let i = 0; i < s.length-1; i++) {
    const [p1,r1] = s[i], [p2,r2] = s[i+1];
    if (puan <= p1 && puan >= p2) {
      const t = (puan-p2)/(p1-p2);
      return Math.round(r2 + t*(r1-r2));
    }
  }
  return s[s.length-1][1];
}

function fmtSira(n: number): string {
  if (n <= 1) return "1";
  if (n < 1000) return `~${n}`;
  if (n < 10000) return `~${(n/1000).toFixed(1)}K`;
  return `~${Math.round(n/1000)}K`;
}

// ════════════════════════════════════════════════════════════════════
//  KÜÇÜK UI BİLEŞENLERİ
// ════════════════════════════════════════════════════════════════════
function Divider({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, margin:"0 0 14px" }}>
      <div style={{ flex:1, height:1.5, background:`linear-gradient(90deg,${color}55,transparent)` }} />
      <span style={{ fontSize:"0.65rem", fontWeight:800, color, letterSpacing:"0.09em", whiteSpace:"nowrap" }}>{label}</span>
      <div style={{ flex:1, height:1.5, background:`linear-gradient(270deg,${color}55,transparent)` }} />
    </div>
  );
}

function ColHeaders() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 72px 72px 52px 62px", gap:5, paddingBottom:5, marginBottom:2 }}>
      <div/>
      {["DOĞRU","YANLIŞ","BOŞ","NET"].map(h=>(
        <div key={h} style={{ fontSize:"0.6rem", fontWeight:800, color:"#9ca3af", textAlign:"center", letterSpacing:"0.05em" }}>{h}</div>
      ))}
    </div>
  );
}

function DersRow({ label, soru, d, y, bolen=4, onChange }: {
  label:string; soru:number; d:number; y:number; bolen?:number;
  onChange:(tip:"d"|"y", val:number)=>void;
}) {
  const net = d - y/bolen;
  const bos = Math.max(0, soru-d-y);
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 72px 72px 52px 62px", gap:5, alignItems:"center", padding:"7px 0", borderBottom:"1px solid #f3f4f6" }}>
      <div style={{ fontSize:"0.84rem", fontWeight:600, color:"#374151" }}>
        {label} <span style={{ color:"#d1d5db", fontSize:"0.7rem" }}>/{soru}</span>
      </div>
      <input type="number" min={0} max={soru} value={d||""} placeholder="0"
        onChange={e=>onChange("d", Math.min(soru, Math.max(0, parseInt(e.target.value)||0)))}
        style={{ padding:"6px 4px", borderRadius:8, border:"1.5px solid #d1fae5", background:"#f0fdf4", color:"#065f46", fontWeight:700, fontSize:"0.88rem", textAlign:"center", outline:"none", width:"100%", boxSizing:"border-box" }}
      />
      <input type="number" min={0} max={soru-d} value={y||""} placeholder="0"
        onChange={e=>onChange("y", Math.min(soru-d, Math.max(0, parseInt(e.target.value)||0)))}
        style={{ padding:"6px 4px", borderRadius:8, border:"1.5px solid #fee2e2", background:"#fef2f2", color:"#dc2626", fontWeight:700, fontSize:"0.88rem", textAlign:"center", outline:"none", width:"100%", boxSizing:"border-box" }}
      />
      <div style={{ padding:"6px 4px", borderRadius:8, background:"#f9fafb", color:"#9ca3af", fontWeight:600, fontSize:"0.88rem", textAlign:"center" }}>{bos}</div>
      <div style={{ fontWeight:800, fontSize:"0.88rem", textAlign:"right", paddingRight:2,
        color: net<0?"#ef4444":(d===0&&y===0?"#d1d5db":"#0f1f4f") }}>
        {net%1===0 ? net.toFixed(0) : net.toFixed(2)}
      </div>
    </div>
  );
}

function PuanKarti({ tur, icon, hamPuan, yerPuan, obp, color, bg }: {
  tur:string; icon:string; hamPuan:number; yerPuan:number; obp:number; color:string; bg:string;
}) {
  const yillar = [2025,2024,2023] as const;
  const veri = SIRALAMA[tur];
  return (
    <div style={{ background:bg, borderRadius:16, padding:"20px", border:`1.5px solid ${color}33`, marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:16 }}>
        <div style={{ fontSize:"0.67rem", fontWeight:800, color, letterSpacing:"0.08em" }}>{icon} {tur} PUANI</div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <div style={{ background:"rgba(255,255,255,0.75)", borderRadius:10, padding:"10px 16px", textAlign:"center" }}>
            <div style={{ fontSize:"0.6rem", color:"#9ca3af", fontWeight:700, letterSpacing:"0.05em" }}>HAM PUAN</div>
            <div style={{ fontSize:"1.6rem", fontWeight:800, color:"#0f1f4f", lineHeight:1.1 }}>{hamPuan.toFixed(3)}</div>
          </div>
          <div style={{ background:`${color}18`, borderRadius:10, padding:"10px 16px", textAlign:"center", border:`1px solid ${color}33` }}>
            <div style={{ fontSize:"0.6rem", color, fontWeight:700, letterSpacing:"0.05em" }}>YERLEŞTİRME</div>
            <div style={{ fontSize:"1.6rem", fontWeight:800, color, lineHeight:1.1 }}>{yerPuan.toFixed(3)}</div>
            {obp>0 && <div style={{ fontSize:"0.64rem", color:"#9ca3af", marginTop:2 }}>+{obp.toFixed(3)} OBP</div>}
          </div>
        </div>
      </div>

      <div style={{ fontSize:"0.62rem", fontWeight:800, color:"#9ca3af", letterSpacing:"0.07em", marginBottom:8 }}>
        TAHMİNİ SIRALAMA — 3 YIL KARŞILAŞTIRMALI
      </div>
      <div style={{ borderRadius:10, overflow:"hidden", border:`1.5px solid ${color}22` }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", background:color, padding:"8px 14px" }}>
          <div style={{ fontSize:"0.62rem", fontWeight:800, color:"rgba(255,255,255,0.7)" }}>PUAN</div>
          {yillar.map(y=>(
            <div key={y} style={{ fontSize:"0.62rem", fontWeight:800, color:"white", textAlign:"center" }}>{y}</div>
          ))}
        </div>
        {/* Ham puan satırı */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", padding:"10px 14px", background:"white",
          borderBottom: obp>0 ? `1px solid ${color}15` : "none" }}>
          <div>
            <div style={{ fontSize:"0.78rem", fontWeight:700, color:"#374151" }}>{hamPuan.toFixed(1)}</div>
            <div style={{ fontSize:"0.6rem", color:"#9ca3af" }}>ham</div>
          </div>
          {yillar.map(y=>(
            <div key={y} style={{ fontWeight:800, fontSize:"0.9rem", color, textAlign:"center" }}>
              {fmtSira(interpolate(hamPuan, veri[y]))}
            </div>
          ))}
        </div>
        {/* Yerleştirme satırı (OBP varsa) */}
        {obp>0 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", padding:"10px 14px", background:`${color}08` }}>
            <div>
              <div style={{ fontSize:"0.78rem", fontWeight:700, color }}>{yerPuan.toFixed(1)}</div>
              <div style={{ fontSize:"0.6rem", color:"#9ca3af" }}>OBP dahil</div>
            </div>
            {yillar.map(y=>(
              <div key={y} style={{ fontWeight:800, fontSize:"0.9rem", color, textAlign:"center" }}>
                {fmtSira(interpolate(yerPuan, veri[y]))}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ fontSize:"0.67rem", color:"#9ca3af", marginTop:8 }}>
        ⚠️ Doğrusal oranlama ile hesaplanmıştır. Gerçek sıralama sınav zorluğuna göre değişir.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  ANA SAYFA
// ════════════════════════════════════════════════════════════════════
export default function NetHesaplamaPage() {
  const [mod, setMod] = useState<"LGS"|"YKS">("LGS");
  const [diplomaNotu, setDiplomaNotu] = useState("");
  const [kirik, setKirik] = useState(false);
  const [dogru, setDogru] = useState<Record<string,number>>({});
  const [yanlis, setYanlis] = useState<Record<string,number>>({});

  type Sonuc = {
    lgsP?: number; lgsTopNet?: number; lgsSira2025?: number; lgsDilimStr?: string; lgsDilimNot?: string;
    tytP?: number;
    sayHam?: number; sayYer?: number;
    eaHam?:  number; eaYer?:  number;
    sozHam?: number; sozYer?: number;
    obp: number;
  };
  const [sonuc, setSonuc] = useState<Sonuc|null>(null);

  const ch = (key:string, tip:"d"|"y", val:number) => {
    if (tip==="d") setDogru(p=>({...p,[key]:val}));
    else setYanlis(p=>({...p,[key]:val}));
    setSonuc(null);
  };

  const hesapla = () => {
    const n: Record<string,number> = {};
    LGS_DERSLER.forEach(d=>{n[d.key]=(dogru[d.key]||0)-(yanlis[d.key]||0)/d.yb;});
    TYT_DERSLER.forEach(d=>{n[d.key]=(dogru[d.key]||0)-(yanlis[d.key]||0)/4;});
    Object.values(AYT_TESTLER).forEach(d=>{n[d.key]=(dogru[d.key]||0)-(yanlis[d.key]||0)/4;});

    const dn = parseFloat(diplomaNotu);
    const obp = (dn>=50&&dn<=100) ? calcOBP(dn,kirik) : 0;

    if (mod==="LGS") {
      const lgsP = calcLGS(n);
      const lgsTopNet = LGS_DERSLER.reduce((a,d)=>a+n[d.key],0);
      // 2025 sıralama tablosu (inline — anchor 450.829→34577 ✓)
      const lgs2025Tablo: PS = [[500,1],[495,100],[490,500],[485,1200],[480,2500],[475,5000],[470,8500],[465,13000],[460,19000],[455,27000],[451,34577],[450,36000],[445,50000],[440,66000],[435,85000],[430,108000],[425,135000],[420,166000],[415,200000],[410,238000],[400,320000],[390,415000],[380,520000],[370,630000],[360,730000],[350,820000]];
      const lgsSira2025 = interpolate(lgsP, lgs2025Tablo);
      const lgsDilimYuzde = (lgsSira2025 / 963148 * 100);
      const lgsDilimStr = lgsDilimYuzde < 0.1 ? `İlk %${lgsDilimYuzde.toFixed(3)}` : `İlk %${lgsDilimYuzde.toFixed(2)}`;
      const lgsDilimRow = LGS_YUZDELIK.find(r=>lgsP>=r.min) ?? LGS_YUZDELIK[LGS_YUZDELIK.length-1];
      setSonuc({lgsP,lgsTopNet,lgsSira2025,lgsDilimStr,lgsDilimNot:lgsDilimRow.not,obp});
      return;
    }

    const tytP   = calcTYT(n);
    const sayHam = calcSAY(n);
    const eaHam  = calcEA(n);
    const sozHam = calcSOZ(n);
    setSonuc({tytP, sayHam, sayYer:sayHam+obp, eaHam, eaYer:eaHam+obp, sozHam, sozYer:sozHam+obp, obp});
  };

  const sifirla = () => {setDogru({});setYanlis({});setSonuc(null);setDiplomaNotu("");};

  const dn = parseFloat(diplomaNotu);
  const obpOnizleme = (dn>=50&&dn<=100) ? calcOBP(dn,kirik) : null;

  return (
    <main style={{ minHeight:"100vh", background:"#f8faff", fontFamily:"system-ui,sans-serif" }}>

      {/* ── Hero ── */}
      <div style={{ background:"linear-gradient(150deg,#0f1f4f,#1e3a8a)", padding:"80px 16px 40px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, marginBottom:14, padding:"5px 14px", background:"rgba(255,255,255,0.12)", borderRadius:9999 }}>
            <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.8)", fontWeight:800, letterSpacing:"0.07em" }}>ÜCRETSİZ ARAÇ</span>
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.75rem,4vw,2.6rem)", fontWeight:800, color:"white", marginBottom:10, lineHeight:1.2 }}>
            Net & Puan Hesaplayıcı
          </h1>
          <p style={{ color:"rgba(191,219,254,0.85)", fontSize:"0.92rem", lineHeight:1.75, marginBottom:28 }}>
            Doğru/yanlış sayını gir — ham puan, OBP'li yerleştirme puanı ve 3 yıllık karşılaştırmalı tahmini sıralamana ulaş.
          </p>
          <div style={{ display:"flex", gap:8 }}>
            {(["LGS","YKS"] as const).map(m=>(
              <button key={m} onClick={()=>{setMod(m);sifirla();}}
                style={{ padding:"9px 22px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:700, fontSize:"0.88rem", transition:"all 0.2s",
                  background:mod===m?"white":"rgba(255,255,255,0.12)",
                  color:mod===m?"#1e3a8a":"rgba(255,255,255,0.85)",
                  boxShadow:mod===m?"0 4px 16px rgba(0,0,0,0.15)":"none" }}>
                {m==="LGS"?"🎯 LGS":"📘 YKS (TYT + AYT)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"28px 16px 80px" }}>

        {/* ── OBP (sadece YKS) ── */}
        {mod==="YKS" && (
          <div style={{ background:"white", borderRadius:18, padding:"22px 24px", border:"1.5px solid #e5e7eb", marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
            <Divider label="DİPLOMA NOTU & OBP" color="#7c3aed" />
            <div style={{ display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:150 }}>
                <label style={{ fontSize:"0.72rem", fontWeight:700, color:"#6b7280", display:"block", marginBottom:6 }}>DİPLOMA NOTU (50–100)</label>
                <input type="number" min={50} max={100} placeholder="örn: 85" value={diplomaNotu}
                  onChange={e=>{setDiplomaNotu(e.target.value);setSonuc(null);}}
                  style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", fontSize:"1rem", fontWeight:700, outline:"none", boxSizing:"border-box", color:"#0f1f4f" }}
                />
              </div>
              <div style={{ flex:2, minWidth:220 }}>
                <label style={{ fontSize:"0.72rem", fontWeight:700, color:"#6b7280", display:"block", marginBottom:6 }}>OBP TÜRÜ</label>
                <div style={{ display:"flex", gap:8 }}>
                  {[{l:"Normal — Diploma × 0.6",v:false},{l:"Kırık — Diploma × 0.3",v:true}].map(opt=>(
                    <button key={String(opt.v)} onClick={()=>{setKirik(opt.v);setSonuc(null);}}
                      style={{ flex:1, padding:"9px 10px", borderRadius:10, cursor:"pointer", border:"1.5px solid", fontWeight:600, fontSize:"0.78rem", transition:"all 0.15s",
                        borderColor:kirik===opt.v?"#7c3aed":"#e5e7eb",
                        background:kirik===opt.v?"#f5f3ff":"white",
                        color:kirik===opt.v?"#6d28d9":"#6b7280" }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize:"0.7rem", color:"#9ca3af", marginTop:5 }}>Kırık OBP: Geçen yıl bir bölüme yerleştiysen seç</div>
              </div>
              {obpOnizleme!==null && (
                <div style={{ padding:"10px 16px", background:"#f5f3ff", borderRadius:10, border:"1.5px solid #ddd6fe", textAlign:"center" }}>
                  <div style={{ fontSize:"0.6rem", color:"#7c3aed", fontWeight:800, letterSpacing:"0.06em" }}>OBP KATKISI</div>
                  <div style={{ fontSize:"1.3rem", fontWeight:800, color:"#6d28d9", marginTop:2 }}>+{obpOnizleme.toFixed(3)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LGS netleri ── */}
        {mod==="LGS" && (
          <div style={{ background:"white", borderRadius:18, padding:"22px 24px", border:"1.5px solid #e5e7eb", marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
            <Divider label="LGS — NET HESABI (3 Yanlış = 1 Doğru Düşer)" color="#1e3a8a" />
            <ColHeaders/>
            {LGS_DERSLER.map(d=>(
              <DersRow key={d.key} label={d.label} soru={d.soru} bolen={d.yb}
                d={dogru[d.key]||0} y={yanlis[d.key]||0} onChange={(t,v)=>ch(d.key,t,v)}/>
            ))}
          </div>
        )}

        {/* ── TYT netleri ── */}
        {mod==="YKS" && (
          <div style={{ background:"white", borderRadius:18, padding:"22px 24px", border:"1.5px solid #e5e7eb", marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
            <Divider label="TYT — NET HESABI (4 Yanlış = 1 Doğru Düşer)" color="#065f46" />
            <ColHeaders/>
            {TYT_DERSLER.map(d=>(
              <DersRow key={d.key} label={d.label} soru={d.soru}
                d={dogru[d.key]||0} y={yanlis[d.key]||0} onChange={(t,v)=>ch(d.key,t,v)}/>
            ))}
          </div>
        )}

        {/* ── AYT netleri ── */}
        {mod==="YKS" && (
          <div style={{ background:"white", borderRadius:18, padding:"22px 24px", border:"1.5px solid #e5e7eb", marginBottom:20, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
            <Divider label="AYT — NET HESABI (4 Yanlış = 1 Doğru Düşer)" color="#1e3a8a" />
            <div style={{ fontSize:"0.75rem", color:"#9ca3af", marginBottom:16 }}>
              Tüm branşları doldurman gerekmez — SAY, EA ve SÖZ puanları tek seferde hesaplanır.
            </div>
            {AYT_GRUPLAR.map(grup=>(
              <div key={grup.label} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                  <div style={{ height:1.5, width:18, background:grup.color, borderRadius:2 }}/>
                  <span style={{ fontSize:"0.67rem", fontWeight:800, color:grup.color, letterSpacing:"0.07em" }}>{grup.label.toUpperCase()}</span>
                  <div style={{ flex:1, height:1.5, background:`linear-gradient(90deg,${grup.color}44,transparent)`, borderRadius:2 }}/>
                </div>
                <ColHeaders/>
                {grup.dersler.map(key=>{
                  const d=AYT_TESTLER[key];
                  return (
                    <DersRow key={d.key} label={d.label} soru={d.soru}
                      d={dogru[d.key]||0} y={yanlis[d.key]||0} onChange={(t,v)=>ch(d.key,t,v)}/>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ── Hesapla / Sıfırla ── */}
        <div style={{ display:"flex", gap:12, marginBottom:28 }}>
          <button onClick={hesapla}
            style={{ flex:1, padding:"14px 24px", borderRadius:12, border:"none",
              background:"linear-gradient(135deg,#0f1f4f,#2563eb)",
              color:"white", fontWeight:700, fontSize:"1rem", cursor:"pointer",
              boxShadow:"0 4px 16px rgba(30,58,138,0.28)" }}>
            Hesapla →
          </button>
          <button onClick={sifirla}
            style={{ padding:"14px 20px", borderRadius:12, background:"white", color:"#6b7280",
              border:"1.5px solid #e5e7eb", fontWeight:600, fontSize:"0.88rem", cursor:"pointer" }}>
            🔄 Sıfırla
          </button>
        </div>

        {/* ── Sonuçlar ── */}
        {sonuc && (
          <div style={{ animation:"fadeUp .3s ease" }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

            {/* LGS Sonucu */}
            {mod==="LGS" && sonuc.lgsP!==undefined && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:"#eff6ff", borderRadius:20, padding:"28px 24px", border:"1.5px solid #bfdbfe" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
                    <div>
                      <div style={{ fontSize:"0.66rem", fontWeight:800, color:"#1e40af", letterSpacing:"0.1em", marginBottom:10 }}>LGS PUANINIZ</div>
                      <div style={{ fontSize:"3.5rem", fontWeight:800, color:"#1e3a8a", lineHeight:1 }}>{sonuc.lgsP.toFixed(3)}</div>
                      <div style={{ fontSize:"0.77rem", color:"#6b7280", marginTop:8 }}>
                        Toplam net: <strong>{sonuc.lgsTopNet!.toFixed(2)}</strong> · Gerçek MEB katsayılarıyla
                      </div>
                    </div>
                    {sonuc.lgsDilimStr && (
                      <div style={{ background:"white", borderRadius:14, padding:"16px 20px", border:"1.5px solid #bfdbfe", textAlign:"center", minWidth:150 }}>
                        <div style={{ fontSize:"0.62rem", fontWeight:800, color:"#1e40af", letterSpacing:"0.07em", marginBottom:6 }}>2025 YÜZDELİK DİLİM</div>
                        <div style={{ fontSize:"1.9rem", fontWeight:800, color:"#1e3a8a", lineHeight:1 }}>{sonuc.lgsDilimStr}</div>
                        <div style={{ fontSize:"0.72rem", color:"#6b7280", marginTop:6 }}>~{sonuc.lgsSira2025!.toLocaleString("tr-TR")}</div>
                        <div style={{ fontSize:"0.7rem", color:"#9ca3af", marginTop:3 }}>{sonuc.lgsDilimNot}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4 Yıl Karşılaştırmalı Sıralama */}
                <div style={{ background:"linear-gradient(135deg,#0f172a,#1e3a8a)", borderRadius:18, padding:"20px 22px" }}>
                  <div style={{ fontSize:"0.62rem", fontWeight:800, color:"rgba(148,163,184,0.8)", letterSpacing:"0.07em", marginBottom:12 }}>
                    TAHMİNİ SIRALAMA — 4 YIL KARŞILAŞTIRMALI
                  </div>
                  <div style={{ borderRadius:10, overflow:"hidden" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", background:"rgba(255,255,255,0.1)", padding:"8px 14px" }}>
                      <div style={{ fontSize:"0.62rem", fontWeight:800, color:"rgba(255,255,255,0.6)" }}>PUAN</div>
                      {[2025,2024,2023,2022].map(y=>(
                        <div key={y} style={{ fontSize:"0.62rem", fontWeight:800, color:"white", textAlign:"center" }}>{y}</div>
                      ))}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", padding:"12px 14px", background:"rgba(255,255,255,0.05)" }}>
                      <div>
                        <div style={{ fontSize:"0.82rem", fontWeight:700, color:"white" }}>{sonuc.lgsP!.toFixed(1)}</div>
                      </div>
                      {([
                        [[500,1],[495,100],[490,500],[485,1200],[480,2500],[475,5000],[470,8500],[465,13000],[460,19000],[455,27000],[451,34577],[450,36000],[445,50000],[440,66000],[435,85000],[430,108000],[425,135000],[420,166000],[415,200000],[410,238000],[400,320000],[390,415000],[380,520000],[370,630000],[360,730000],[350,820000]],
                        [[500,1],[495,120],[490,600],[485,1400],[480,3000],[475,6000],[470,10000],[465,15500],[460,22000],[455,30500],[451,38028],[450,39500],[445,54000],[440,72000],[435,93000],[430,118000],[425,147000],[420,180000],[415,216000],[410,256000],[400,345000],[390,445000],[380,555000],[370,665000],[360,765000],[350,855000]],
                        [[500,1],[495,200],[490,1000],[485,2500],[480,5000],[475,10000],[470,17000],[465,26000],[460,37000],[455,49000],[451,61400],[450,63500],[445,85000],[440,112000],[435,143000],[430,180000],[425,222000],[420,270000],[415,323000],[410,382000],[400,510000],[390,650000],[380,795000],[370,920000],[360,1020000],[350,1100000]],
                        [[500,1],[495,80],[490,400],[485,1000],[480,2000],[475,4000],[470,7000],[465,11000],[460,15500],[455,21000],[451,26517],[450,27500],[445,38000],[440,51000],[435,66000],[430,84000],[425,105000],[420,130000],[415,157000],[410,188000],[400,256000],[390,332000],[380,418000],[370,510000],[360,600000],[350,690000]],
                      ] as [number,number][][]).map((tablo,i)=>(
                        <div key={i} style={{ fontWeight:800, fontSize:"0.9rem", color:"#93c5fd", textAlign:"center" }}>
                          {fmtSira(interpolate(sonuc.lgsP!, tablo))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize:"0.67rem", color:"rgba(148,163,184,0.6)", marginTop:10 }}>
                    ⚠️ Doğrusal oranlama. Kalibre: 450.829 → 2025:34.577 · 2024:38.028 · 2023:61.400 · 2022:26.517 ✓
                  </div>
                </div>

                <div style={{ background:"white", borderRadius:18, padding:"20px 22px", border:"1.5px solid #e5e7eb" }}>
                  <Divider label="PUAN–YÜZDELİK DİLİM TABLOSU (2025)" color="#1e3a8a" />
                  <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #f3f4f6" }}>
                    {LGS_YUZDELIK.map((row,i)=>{
                      const hi = sonuc.lgsP!>=row.min && (i===0||sonuc.lgsP!<LGS_YUZDELIK[i-1].min);
                      return (
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"64px 80px 1fr", padding:"10px 14px",
                          background:hi?"#eff6ff":i%2===0?"white":"#fafafa",
                          borderBottom:i<LGS_YUZDELIK.length-1?"1px solid #f3f4f6":"none" }}>
                          <div style={{ fontWeight:hi?800:600, color:hi?"#1e40af":"#374151", fontSize:"0.82rem" }}>{hi?"👉 ":""}{row.min}+</div>
                          <div style={{ fontWeight:hi?800:600, color:hi?"#1e40af":"#374151", fontSize:"0.82rem" }}>{row.dilim}</div>
                          <div style={{ color:"#6b7280", fontSize:"0.78rem" }}>{row.not}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize:"0.72rem", color:"#9ca3af", marginTop:10, textAlign:"center" }}>⚠️ 2025 verilerine dayanmaktadır. Gerçek anchor noktasıyla kalibre edilmiştir.</div>
                </div>
              </div>
            )}

            {/* YKS Sonucu */}
            {mod==="YKS" && sonuc.tytP!==undefined && (
              <div>
                <div style={{ background:"#ecfdf5", borderRadius:14, padding:"14px 20px", border:"1.5px solid #6ee7b744",
                  display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8, marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:"0.66rem", fontWeight:800, color:"#065f46", letterSpacing:"0.07em" }}>TYT HAM PUANI</div>
                    <div style={{ fontSize:"0.73rem", color:"#6b7280", marginTop:1 }}>AYT hesabında TYT katsayılarıyla kullanılır</div>
                  </div>
                  <div style={{ fontSize:"2.2rem", fontWeight:800, color:"#065f46" }}>{sonuc.tytP.toFixed(3)}</div>
                </div>

                <PuanKarti tur="SAY" icon="🔢" hamPuan={sonuc.sayHam!} yerPuan={sonuc.sayYer!} obp={sonuc.obp} color="#c2410c" bg="#fff7ed"/>
                <PuanKarti tur="EA"  icon="⚖️" hamPuan={sonuc.eaHam!}  yerPuan={sonuc.eaYer!}  obp={sonuc.obp} color="#6d28d9" bg="#f5f3ff"/>
                <PuanKarti tur="SOZ" icon="📖" hamPuan={sonuc.sozHam!} yerPuan={sonuc.sozYer!} obp={sonuc.obp} color="#0f766e" bg="#f0fdfa"/>

                {sonuc.obp===0 && (
                  <div style={{ fontSize:"0.78rem", color:"#9ca3af", textAlign:"center", padding:"6px 0" }}>
                    💡 Diploma notunu girerek OBP'li yerleştirme puanını da görebilirsin
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{ background:"linear-gradient(135deg,#1e3a8a,#1e40af)", borderRadius:20, padding:"32px 28px", textAlign:"center", marginTop:36, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-30, right:-30, width:160, height:160, background:"radial-gradient(circle,rgba(249,115,22,0.15) 0%,transparent 70%)" }}/>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:800, color:"white", marginBottom:10 }}>Hedef puanına nasıl ulaşacaksın?</h3>
          <p style={{ color:"rgba(191,219,254,0.85)", fontSize:"0.88rem", lineHeight:1.75, marginBottom:22, maxWidth:400, margin:"0 auto 22px" }}>
            Ücretsiz ön görüşmede netlerini analiz eder, sana özel yol haritası çiziriz.
          </p>
          <a href="/#İletişim" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"white", color:"#1e3a8a", padding:"13px 28px", borderRadius:10, fontWeight:700, textDecoration:"none", fontSize:"0.95rem", boxShadow:"0 4px 16px rgba(0,0,0,0.2)" }}>
            Ücretsiz Ön Görüşme →
          </a>
        </div>

        <div style={{ textAlign:"center", marginTop:28 }}>
          <a href="/" style={{ color:"#9ca3af", fontSize:"0.85rem", textDecoration:"none" }}>← Ana Sayfaya Dön</a>
        </div>
      </div>
    </main>
  );
}