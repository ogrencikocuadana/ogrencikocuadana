"use client";

import { useRef, useEffect, useState } from "react";

const FAZLAR = [
  { ad: "Nefes al", sure: 4, renk: "#3498db" },
  { ad: "Tut", sure: 7, renk: "#9b59b6" },
  { ad: "Ver", sure: 8, renk: "#2ecc71" },
];

export default function NefesEgzersizi() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [calisyor, setCalisyor] = useState(false);
  const [fazAd, setFazAd] = useState("Başlamak için\ndokun");
  const [sayac, setSayac] = useState<number | null>(null);
  const [tur, setTur] = useState(0);

  const durumRef = useRef({
    on: false, faz: 0, tik: 0, tur: 0,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function ciz(prog: number, bosta: boolean) {
    const c = canvasRef.current; if (!c) return;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 200, 200);

    // Arka halka
    g.beginPath(); g.arc(100, 100, 68, 0, Math.PI * 2);
    g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 10; g.stroke();

    // İlerleme yayı
    if (!bosta) {
      const renk = FAZLAR[durumRef.current.faz].renk;
      g.beginPath(); g.arc(100, 100, 68, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
      g.strokeStyle = renk; g.lineWidth = 10; g.lineCap = "round"; g.stroke();
    }

    // Balon
    const r = bosta ? 36 : 26 + prog * 20;
    const gr = g.createRadialGradient(90, 90, 3, 100, 100, r);
    const faz = durumRef.current.faz;
    if (bosta) {
      gr.addColorStop(0, "rgba(100,155,255,0.58)"); gr.addColorStop(1, "rgba(60,100,200,0.18)");
    } else if (faz === 0) {
      gr.addColorStop(0, "rgba(80,175,255,0.68)"); gr.addColorStop(1, "rgba(52,152,219,0.2)");
    } else if (faz === 1) {
      gr.addColorStop(0, "rgba(175,100,255,0.68)"); gr.addColorStop(1, "rgba(155,89,182,0.2)");
    } else {
      gr.addColorStop(0, "rgba(80,215,135,0.68)"); gr.addColorStop(1, "rgba(46,204,113,0.2)");
    }
    g.beginPath(); g.arc(100, 100, r, 0, Math.PI * 2);
    g.fillStyle = gr; g.fill();
    g.beginPath(); g.arc(100 - r * 0.22, 100 - r * 0.22, r * 0.2, 0, Math.PI * 2);
    g.fillStyle = "rgba(255,255,255,0.22)"; g.fill();
  }

  function baslat() {
    const d = durumRef.current;
    d.on = true; d.faz = 0; d.tik = 0; d.tur = 0;
    setCalisyor(true); setFazAd(FAZLAR[0].ad); setSayac(FAZLAR[0].sure); setTur(0);
    intervalRef.current = setInterval(() => {
      const d = durumRef.current;
      d.tik++;
      const faz = FAZLAR[d.faz];
      const prog = d.tik / faz.sure;
      setSayac(Math.max(1, faz.sure - d.tik + 1));
      ciz(prog, false);
      if (d.tik >= faz.sure) {
        d.tik = 0;
        d.faz = (d.faz + 1) % 3;
        if (d.faz === 0) { d.tur++; setTur(d.tur); }
        setFazAd(FAZLAR[d.faz].ad);
        setSayac(FAZLAR[d.faz].sure);
      }
    }, 1000);
  }

  function durdur() {
    durumRef.current.on = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setCalisyor(false); setFazAd("Başlamak için\ndokun"); setSayac(null);
    ciz(0, true);
  }

  function toggle() { calisyor ? durdur() : baslat(); }

  useEffect(() => {
    ciz(0, true);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "52px 18px 36px", width: "100%" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>🫧 Nefes Egzersizi</div>
      <div style={{ fontSize: 11, color: "rgba(232,244,253,0.45)", marginBottom: 20, textAlign: "center" }}>4-7-8 tekniğiyle sinir sistemini sıfırla.</div>

      <div
        onClick={toggle}
        style={{ position: "relative", width: 200, height: 200, margin: "0 auto 20px", cursor: "pointer" }}
      >
        <canvas ref={canvasRef} width={200} height={200} style={{ display: "block" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.4, whiteSpace: "pre-line" }}>
            {fazAd}
          </div>
          {sayac !== null && (
            <div style={{ fontSize: 26, fontWeight: 800, color: "#f5a623", marginTop: 2 }}>
              {sayac}
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "rgba(232,244,253,0.4)", textAlign: "center", maxWidth: 250, lineHeight: 1.7, marginBottom: 10 }}>
        4 sn <strong style={{ color: "rgba(232,244,253,0.7)" }}>nefes al</strong>
        {" → "}7 sn <strong style={{ color: "rgba(232,244,253,0.7)" }}>tut</strong>
        {" → "}8 sn <strong style={{ color: "rgba(232,244,253,0.7)" }}>ver</strong>
      </div>

      {tur > 0 && (
        <div style={{ fontSize: 11, color: "#f5a623", fontWeight: 700 }}>
          {tur} tur tamamlandı
        </div>
      )}
    </div>
  );
}