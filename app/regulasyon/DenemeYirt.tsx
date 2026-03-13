"use client";

import { useRef, useState } from "react";

const MESAJLAR = [
  "Bitti. Artık geride kaldı.",
  "Sen ondan büyüksün. Gerçekten.",
  "Bir sayfa kapandı. Yenisi başlıyor.",
  "Bu kağıt senin değerin değil.",
  "Duygu gerçekti. Deneme sadece bir puandı.",
];

export default function DenemeYirt() {
  const [adiVar, setAdiVar] = useState(false);
  const [yirtildi, setYirtildi] = useState(false);
  const [mesaj, setMesaj] = useState(
    'Üstteki alana deneme adını yaz, ardından "Hazırla"ya bas.'
  );
  const [inputVal, setInputVal] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const adRef = useRef("");
  const ilerlemeRef = useRef(0);
  const suruklemeRef = useRef(false);

  function kagitCiz(ilerleme: number, yirtilmis: boolean) {
    const c = canvasRef.current; if (!c) return;
    const g = c.getContext("2d")!;
    const W = 320, H = 210;
    g.clearRect(0, 0, W, H);

    if (!yirtilmis) {
      g.fillStyle = "#f5f0e8";
      g.beginPath(); (g as any).roundRect(0, 0, W, H, 7); g.fill();
      g.strokeStyle = "rgba(170,190,210,0.55)"; g.lineWidth = 1;
      for (let y = 26; y < H; y += 22) { g.beginPath(); g.moveTo(12, y); g.lineTo(W - 12, y); g.stroke(); }
      g.strokeStyle = "rgba(210,80,80,0.45)"; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(42, 0); g.lineTo(42, H); g.stroke();
      [44, 100, 156].forEach(y => { g.beginPath(); g.arc(11, y, 4.5, 0, Math.PI * 2); g.fillStyle = "#d4c8b0"; g.fill(); });
      g.font = "bold 14px 'Sora', sans-serif"; g.fillStyle = "#2c3e50"; g.textAlign = "center";
      const ad = adRef.current;
      g.fillText(ad.length > 28 ? ad.slice(0, 27) + "…" : ad, W / 2, 30);
      g.font = "12px 'Sora', sans-serif"; g.fillStyle = "rgba(44,62,80,0.48)"; g.textAlign = "left";
      ["Net: ???", "Türkçe: — / 40", "Mat: — / 40", "Fen: — / 20", "Sosyal: — / 20"].forEach((t, i) => g.fillText(t, 50, 60 + i * 22));
      if (ilerleme > 0) {
        const tx = ilerleme * W;
        g.strokeStyle = "rgba(255,50,50,0.8)"; g.lineWidth = 2.5; g.setLineDash([5, 4]);
        g.beginPath();
        for (let y = 0; y <= H; y += 8) g.lineTo(tx + Math.sin(y * 0.25) * 5, y);
        g.stroke(); g.setLineDash([]);
      }
    } else {
      const tear = W * 0.46;
      g.save(); g.beginPath(); g.moveTo(0, 0);
      for (let y = 0; y <= H; y += 6) g.lineTo(tear + Math.sin(y * 0.35) * 6, y);
      g.lineTo(0, H); g.closePath(); g.clip();
      g.fillStyle = "#f5f0e8"; g.fillRect(0, 0, W, H);
      g.strokeStyle = "rgba(170,190,210,0.5)"; g.lineWidth = 1;
      for (let y = 26; y < H; y += 22) { g.beginPath(); g.moveTo(12, y); g.lineTo(W / 2, y); g.stroke(); }
      g.restore();
      g.save(); g.translate(W * 0.58, H * 0.12); g.rotate(0.15); g.globalAlpha = 0.62;
      g.beginPath(); g.moveTo(0, 0);
      for (let y = 0; y <= H; y += 6) g.lineTo(-Math.sin(y * 0.35) * 5, y);
      g.lineTo(W / 2, H); g.lineTo(W / 2, 0); g.closePath();
      g.fillStyle = "#ebe6d6"; g.fill(); g.restore();
      for (let i = 0; i < 24; i++) {
        const cx = Math.sin(i * 137.5) * 118 + W / 2, cy = Math.cos(i * 97.3) * 84 + H / 2;
        g.save(); g.translate(cx, cy); g.rotate(i * 0.75);
        g.fillStyle = ["#f5a623","#e74c3c","#3498db","#2ecc71","#9b59b6"][i % 5];
        g.fillRect(-5, -2.5, 10, 5); g.restore();
      }
      g.font = "bold 14px 'Sora', sans-serif"; g.fillStyle = "#f5a623"; g.textAlign = "center";
      g.fillText(MESAJLAR[Math.floor(Math.random() * MESAJLAR.length)], W / 2, H - 14);
    }
  }

  function hazirla() {
    const v = inputVal.trim(); if (!v) return;
    adRef.current = v; ilerlemeRef.current = 0;
    setAdiVar(true); setYirtildi(false);
    setMesaj('Hazır! Yırtmak için butona bas ya da sürükle.');
    setTimeout(() => kagitCiz(0, false), 50);
  }

  function yirt() {
    setYirtildi(true);
    setMesaj("✓ Yırtıldı. Bir dahaki sefere daha iyi olacak.");
    setTimeout(() => kagitCiz(1, true), 10);
  }

  function sifirla() {
    setAdiVar(false); setYirtildi(false); setInputVal("");
    adRef.current = ""; ilerlemeRef.current = 0;
    setMesaj('Üstteki alana deneme adını yaz, ardından "Hazırla"ya bas.');
  }

  function surukleBasla() { suruklemeRef.current = true; }
  function surukleHareket(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!suruklemeRef.current || yirtildi) return;
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    ilerlemeRef.current = Math.max(0, Math.min(1, (e.clientX - r.left) / 320));
    kagitCiz(ilerlemeRef.current, false);
  }
  function surekleBirak() {
    suruklemeRef.current = false;
    if (ilerlemeRef.current > 0.38) yirt();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "52px 18px 36px", width: "100%" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>📄 Deneme Yırt</div>
      <div style={{ fontSize: 11, color: "rgba(232,244,253,0.45)", marginBottom: 16, textAlign: "center" }}>Hangi deneme seni üzdü? Yaz, sonra yırt.</div>

      <div style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.28)", borderRadius: 11, padding: "9px 14px", fontSize: 12, color: "#f5a623", fontWeight: 600, textAlign: "center", lineHeight: 1.5, maxWidth: 320, width: "100%", minHeight: 40, marginBottom: 14 }}>
        {mesaj}
      </div>

      <div style={{ display: "flex", gap: 7, maxWidth: 310, width: "100%", marginBottom: 14 }}>
        <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && hazirla()} maxLength={32} placeholder="Örn: 28 Şubat TYT denemesi" style={{ flex: 1, padding: "9px 11px", borderRadius: 8, border: "1.5px solid rgba(232,244,253,0.18)", background: "rgba(232,244,253,0.06)", color: "white", fontSize: 12, fontFamily: "'Sora', sans-serif", outline: "none" }} />
        <button onClick={hazirla} style={{ padding: "9px 14px", background: "#f5a623", color: "#1a2e4a", fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "'Sora', sans-serif" }}>Hazırla</button>
      </div>

      {adiVar && (
        <>
          <div style={{ width: "100%", maxWidth: 320, position: "relative", marginBottom: 14 }}>
            <canvas
              ref={canvasRef} width={320} height={210}
              style={{ display: "block", borderRadius: 8, cursor: yirtildi ? "default" : "grab", width: "100%", maxWidth: 320 }}
              onMouseDown={surukleBasla}
              onMouseMove={surukleHareket}
              onMouseUp={surekleBirak}
            />
            {!yirtildi && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 12, color: "rgba(255,255,255,0.4)", pointerEvents: "none", textAlign: "center", lineHeight: 1.7 }}>
                Sürükle veya butona bas<br />— yırt!
              </div>
            )}
          </div>

          {!yirtildi && (
            <button onClick={yirt} style={{ padding: "9px 20px", background: "#c0392b", color: "white", fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Sora', sans-serif", marginBottom: 8 }}>
              💥 Yırt!
            </button>
          )}

          {yirtildi && (
            <button onClick={sifirla} style={{ padding: "6px 13px", background: "transparent", color: "rgba(232,244,253,0.35)", border: "1px solid rgba(232,244,253,0.14)", borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: "'Sora', sans-serif" }}>
              Başka bir deneme yırt
            </button>
          )}
        </>
      )}
    </div>
  );
}