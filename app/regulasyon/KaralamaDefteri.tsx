"use client";

import { useRef, useEffect, useState } from "react";

const RENKLER = [
  { label: "Beyaz", hex: "#ffffff" },
  { label: "Turuncu", hex: "#f5a623" },
  { label: "Kırmızı", hex: "#e74c3c" },
  { label: "Mavi", hex: "#3498db" },
  { label: "Yeşil", hex: "#2ecc71" },
  { label: "Mor", hex: "#9b59b6" },
];

const KALINLIKLAR = [
  { label: "İnce", deger: 3 },
  { label: "Normal", deger: 9 },
  { label: "Kalın", deger: 20 },
  { label: "Çok kalın", deger: 38 },
];

export default function KaralamaDefteri() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ciziyorRef = useRef(false);
  const sonNoktaRef = useRef<{ x: number; y: number } | null>(null);
  const renkRef = useRef("#ffffff");
  const kalinlikRef = useRef(9);
  const [aktifRenk, setAktifRenk] = useState("#ffffff");
  const [aktifKalinlik, setAktifKalinlik] = useState(9);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const g = c.getContext("2d")!;
    g.fillStyle = "#0a1520"; g.fillRect(0, 0, 330, 270);
  }, []);

  function konum(e: MouseEvent | Touch, c: HTMLCanvasElement) {
    const r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (330 / r.width),
      y: (e.clientY - r.top) * (270 / r.height),
    };
  }

  function cizgi(a: { x: number; y: number }, b: { x: number; y: number }) {
    const g = canvasRef.current?.getContext("2d"); if (!g) return;
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y);
    g.strokeStyle = renkRef.current; g.lineWidth = kalinlikRef.current;
    g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
  }

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const bas = (e: MouseEvent) => { ciziyorRef.current = true; sonNoktaRef.current = konum(e, c); };
    const hare = (e: MouseEvent) => {
      if (!ciziyorRef.current) return;
      const p = konum(e, c); cizgi(sonNoktaRef.current!, p); sonNoktaRef.current = p;
    };
    const birak = () => { ciziyorRef.current = false; sonNoktaRef.current = null; };
    const tBas = (e: TouchEvent) => { e.preventDefault(); ciziyorRef.current = true; sonNoktaRef.current = konum(e.touches[0], c); };
    const tHare = (e: TouchEvent) => {
      e.preventDefault();
      if (!ciziyorRef.current) return;
      const p = konum(e.touches[0], c); cizgi(sonNoktaRef.current!, p); sonNoktaRef.current = p;
    };
    const tBirak = () => { ciziyorRef.current = false; sonNoktaRef.current = null; };
    c.addEventListener("mousedown", bas); c.addEventListener("mousemove", hare);
    c.addEventListener("mouseup", birak); c.addEventListener("mouseleave", birak);
    c.addEventListener("touchstart", tBas, { passive: false });
    c.addEventListener("touchmove", tHare, { passive: false });
    c.addEventListener("touchend", tBirak);
    return () => {
      c.removeEventListener("mousedown", bas); c.removeEventListener("mousemove", hare);
      c.removeEventListener("mouseup", birak); c.removeEventListener("mouseleave", birak);
      c.removeEventListener("touchstart", tBas); c.removeEventListener("touchmove", tHare);
      c.removeEventListener("touchend", tBirak);
    };
  }, []);

  function renkSec(hex: string) { renkRef.current = hex; setAktifRenk(hex); }
  function kalinlikSec(d: number) { kalinlikRef.current = d; setAktifKalinlik(d); }

  function temizle() {
    const g = canvasRef.current?.getContext("2d"); if (!g) return;
    g.fillStyle = "#0a1520"; g.fillRect(0, 0, 330, 270);
  }

  function indir() {
    const a = document.createElement("a");
    a.download = "karalama.png";
    a.href = canvasRef.current!.toDataURL();
    a.click();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "52px 18px 36px", width: "100%" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>✏️ Karalama Defteri</div>
      <div style={{ fontSize: 11, color: "rgba(232,244,253,0.45)", marginBottom: 16, textAlign: "center" }}>Çiz, yaz, karala. Kimse görmeyecek, söz.</div>

      {/* Renk seçici */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 8 }}>
        {RENKLER.map(r => (
          <button
            key={r.hex}
            onClick={() => renkSec(r.hex)}
            style={{
              padding: "5px 10px",
              borderRadius: 7,
              border: `1.5px solid ${aktifRenk === r.hex ? r.hex : "rgba(255,255,255,0.14)"}`,
              background: aktifRenk === r.hex ? `${r.hex}22` : "transparent",
              color: r.hex,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'Sora', sans-serif",
              fontWeight: aktifRenk === r.hex ? 700 : 400,
            }}
          >
            ⬤ {r.label}
          </button>
        ))}
      </div>

      {/* Kalınlık seçici */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {KALINLIKLAR.map(k => (
          <button
            key={k.deger}
            onClick={() => kalinlikSec(k.deger)}
            style={{
              padding: "5px 9px",
              borderRadius: 7,
              border: `1px solid ${aktifKalinlik === k.deger ? "rgba(245,166,35,0.6)" : "rgba(255,255,255,0.14)"}`,
              background: aktifKalinlik === k.deger ? "rgba(245,166,35,0.12)" : "transparent",
              color: aktifKalinlik === k.deger ? "#f5a623" : "rgba(232,244,253,0.35)",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {k.label}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={330}
        height={270}
        style={{
          display: "block",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: "crosshair",
          touchAction: "none",
          maxWidth: "100%",
        }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={temizle} style={{ padding: "6px 13px", background: "transparent", color: "rgba(232,244,253,0.35)", border: "1px solid rgba(232,244,253,0.14)", borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: "'Sora', sans-serif" }}>
          🗑 Temizle
        </button>
        <button onClick={indir} style={{ padding: "6px 13px", background: "#f5a623", color: "#1a2e4a", fontWeight: 700, border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: "'Sora', sans-serif" }}>
          💾 İndir
        </button>
      </div>
    </div>
  );
}