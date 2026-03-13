"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const MESAJLAR = [
  "Devril ama kalkmayı biliyorsun, tıpkı sen gibi.",
  "Bu his geçecek. Söz.",
  "Bugün zor, ama yarın hâlâ oradasın.",
  "Bazen denemeler bizi dener. Sen kazanacaksın.",
  "Duygularını hissetmek güçlü olduğunun kanıtı.",
  "Bir adım geri, iki adım ileri.",
  "Her vuruş bir nefes. Her nefes bir başlangıç.",
  "Kötü gün, kötü hayat değil.",
  "Sen bu sınavdan büyüksün.",
  "Hacıyatmaz gibi: ne kadar vururlarsa o kadar kalkarsın.",
];

const YONLER: [number, number][] = [
  [0.9, 0], [-0.9, 0], [0.75, 0.5], [-0.75, 0.5],
  [0.6, -0.4], [-0.6, -0.4], [0.82, 0.2], [-0.82, 0.2],
];

function yuvarlatKose(
  g: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y);
  g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h);
  g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.closePath();
}

export default function Haciyatmaz() {
  const [vurus, setVurus] = useState(0);
  const [mesaj, setMesaj] = useState("Bir şey yapıştır — sonra vur!");
  const [mesajKey, setMesajKey] = useState(0);
  const [inputVal, setInputVal] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gloveRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const etiketRef = useRef("Vur beni!");
  const vurusRef = useRef(0);
  const tiltZ = useRef(0);
  const tiltX = useRef(0);
  const mesgul = useRef(false);
  const afr = useRef<number | null>(null);

  const ciz = useCallback((tz: number, tx: number, sq: boolean) => {
    const c = canvasRef.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 170, 278);
    const cx = 85 + tz * 7, cy = 11 + tx * 4;
    g.save();
    g.translate(cx, cy);
    if (sq) g.scale(0.9, 1.08);

    // Taban
    const bg = g.createRadialGradient(0, 146, 4, 0, 140, 43);
    bg.addColorStop(0, "#cc2020"); bg.addColorStop(1, "#7a0808");
    g.beginPath(); g.ellipse(0, 150, 38, 24, 0, 0, Math.PI * 2);
    g.fillStyle = bg; g.fill();
    g.beginPath(); g.ellipse(0, 137, 38, 8, 0, 0, Math.PI * 2);
    g.fillStyle = "rgba(255,255,255,0.09)"; g.fill();

    // Gövde
    const bod = g.createRadialGradient(-15, 33, 7, 0, 53, 66);
    bod.addColorStop(0, "#ff5252"); bod.addColorStop(0.55, "#e02020"); bod.addColorStop(1, "#9a0808");
    g.beginPath();
    g.moveTo(-38, 160);
    g.bezierCurveTo(-44, 94, -36, -16, -15, -54);
    g.bezierCurveTo(-5, -68, 5, -68, 15, -54);
    g.bezierCurveTo(36, -16, 44, 94, 38, 160);
    g.closePath();
    g.fillStyle = bod; g.fill();
    g.beginPath(); g.ellipse(-18, 46, 8, 34, Math.PI * 0.1, 0, Math.PI * 2);
    g.fillStyle = "rgba(255,255,255,0.1)"; g.fill();

    // Yüz
    const fg = g.createRadialGradient(-7, -58, 4, 0, -50, 36);
    fg.addColorStop(0, "#ffd050"); fg.addColorStop(0.6, "#f5a623"); fg.addColorStop(1, "#c47a10");
    g.beginPath(); g.arc(0, -50, 34, 0, Math.PI * 2);
    g.fillStyle = fg; g.fill();
    g.beginPath(); g.ellipse(-11, -62, 11, 11, 0, 0, Math.PI * 2);
    g.fillStyle = "rgba(255,255,255,0.14)"; g.fill();

    // Gözler
    const ey = -56 + tx * 3;
    ([ [-12, ey], [12, ey] ] as [number, number][]).forEach(([ex, ey2]) => {
      g.beginPath(); g.arc(ex, ey2, 5, 0, Math.PI * 2);
      g.fillStyle = "#1a1a2e"; g.fill();
      g.beginPath(); g.arc(ex + 1.4, ey2 - 1.4, 1.8, 0, Math.PI * 2);
      g.fillStyle = "rgba(255,255,255,0.68)"; g.fill();
    });

    // Gülüş (vurus arttıkça büyür)
    const so = Math.min(1, vurusRef.current / 6);
    g.beginPath(); g.arc(0, -40 + so * 3, 8 + so * 4, 0.15, Math.PI - 0.15);
    g.strokeStyle = "#1a1a2e"; g.lineWidth = 2.5; g.lineCap = "round"; g.stroke();
    if (so > 0.3) {
      g.beginPath(); g.arc(0, -36 + so * 3, 4, 0, Math.PI);
      g.fillStyle = "#c0392b"; g.fill();
    }

    // Yanaklar
    ([ [-16, -40], [16, -40] ] as [number, number][]).forEach(([bx, by]) => {
      g.beginPath(); g.arc(bx, by, 6, 0, Math.PI * 2);
      g.fillStyle = "rgba(255,100,100,0.3)"; g.fill();
    });

    // Etiket
    g.save();
    g.translate(0, -8); g.rotate(tz * 0.05);
    const tw = 76, th = 22;
    yuvarlatKose(g, -tw / 2 + 2, -th / 2 + 2, tw, th, 5);
    g.fillStyle = "rgba(0,0,0,0.28)"; g.fill();
    yuvarlatKose(g, -tw / 2, -th / 2, tw, th, 5);
    g.fillStyle = "rgba(10,18,38,0.88)";
    g.strokeStyle = "rgba(245,166,35,0.62)";
    g.lineWidth = 1.5; g.fill(); g.stroke();
    g.beginPath();
    g.moveTo(-tw / 2 + 5, -th / 2);
    g.lineTo(-tw / 2 + 9, -th / 2 - 4);
    g.lineTo(-tw / 2 + 13, -th / 2);
    g.fillStyle = "rgba(245,166,35,0.48)"; g.fill();
    const dt = etiketRef.current.length > 13 ? etiketRef.current.slice(0, 12) + "…" : etiketRef.current;
    g.font = "bold 11px 'Sora', sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "white"; g.fillText(dt, 0, 1);
    g.restore();
    g.restore();
  }, []);

  const yay = useCallback(() => {
    tiltZ.current *= 0.81; tiltX.current *= 0.81;
    ciz(tiltZ.current, tiltX.current, false);
    if (shadowRef.current) {
      const m = Math.sqrt(tiltZ.current ** 2 + tiltX.current ** 2);
      shadowRef.current.style.transform = `translateX(calc(-50% + ${tiltZ.current * 5}px)) scaleX(${1 - m * 0.02})`;
      shadowRef.current.style.opacity = String(Math.max(0, 0.42 - m * 0.01));
    }
    if (Math.abs(tiltZ.current) > 0.05 || Math.abs(tiltX.current) > 0.05) {
      afr.current = requestAnimationFrame(yay);
    } else {
      tiltZ.current = 0; tiltX.current = 0;
      ciz(0, 0, false); mesgul.current = false;
    }
  }, [ciz]);

  useEffect(() => { ciz(0, 0, false); }, [ciz]);

  function eldivenOlustur(soldan: boolean) {
    const layer = gloveRef.current; if (!layer) return;
    const gc = document.createElement("canvas"); gc.width = 95; gc.height = 78;
    gc.style.cssText = `position:absolute;top:74px;${soldan ? "left:-22px" : "right:-22px"};pointer-events:none;animation:gloveHit .52s ease-out forwards;`;
    const g = gc.getContext("2d")!;
    g.save(); g.translate(soldan ? 15 : 80, 39); g.scale(soldan ? 1 : -1, 1);
    const gg = g.createRadialGradient(-5, -5, 3, 0, 0, 28);
    gg.addColorStop(0, "#ee4444"); gg.addColorStop(0.55, "#bb1818"); gg.addColorStop(1, "#6a0808");
    g.beginPath(); g.ellipse(0, 4, 25, 20, 0, 0, Math.PI * 2); g.fillStyle = gg; g.fill();
    g.beginPath(); g.ellipse(22, -6, 9, 7, Math.PI * 0.3, 0, Math.PI * 2); g.fillStyle = "#cc2020"; g.fill();
    g.strokeStyle = "rgba(0,0,0,0.2)"; g.lineWidth = 1.6;
    [-10, -2, 6, 14].forEach(x => { g.beginPath(); g.moveTo(x, -16); g.lineTo(x, -6); g.stroke(); });
    g.fillStyle = "white"; g.fillRect(-24, 18, 48, 16);
    g.fillStyle = "#cc2020"; g.fillRect(-24, 20, 48, 8);
    g.beginPath(); g.ellipse(-7, -3, 6, 4, Math.PI * 0.2, 0, Math.PI * 2); g.fillStyle = "rgba(255,255,255,0.2)"; g.fill();
    g.restore(); layer.appendChild(gc);
    setTimeout(() => gc.remove(), 580);
  }

  function carpmaEfekti() {
    const layer = gloveRef.current; if (!layer) return;
    const ic = document.createElement("canvas"); ic.width = 76; ic.height = 76;
    ic.style.cssText = "position:absolute;top:52px;left:44px;pointer-events:none;animation:impactBurst .42s ease-out forwards;";
    const g = ic.getContext("2d")!;
    g.save(); g.translate(38, 38);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2, r = i % 2 ? 12 : 26;
      g.beginPath(); g.moveTo(Math.cos(a) * 5, Math.sin(a) * 5);
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      g.strokeStyle = i % 3 === 0 ? "#ff4400" : i % 3 === 1 ? "#ffaa00" : "#fff";
      g.lineWidth = 2.5; g.lineCap = "round"; g.stroke();
    }
    g.restore(); layer.appendChild(ic);
    setTimeout(() => ic.remove(), 460);
  }

  function vur() {
    if (mesgul.current) return;
    mesgul.current = true;
    const n = vurus + 1;
    vurusRef.current = n; setVurus(n);
    setMesaj(MESAJLAR[Math.floor(Math.random() * MESAJLAR.length)]);
    setMesajKey(k => k + 1);
    const d = YONLER[Math.floor(Math.random() * YONLER.length)];
    tiltZ.current = d[0] * 4;
    tiltX.current = d[1] * 2.8;
    ciz(tiltZ.current, tiltX.current, true);
    eldivenOlustur(d[0] > 0);
    setTimeout(carpmaEfekti, 120);
    if (shadowRef.current) {
      shadowRef.current.style.transform = `translateX(calc(-50% + ${tiltZ.current * 5}px)) scaleX(0.8)`;
      shadowRef.current.style.opacity = "0.16";
    }
    if (afr.current) cancelAnimationFrame(afr.current);
    setTimeout(() => { afr.current = requestAnimationFrame(yay); }, 180);
  }

  function yapistir() {
    const v = inputVal.trim(); if (!v) return;
    etiketRef.current = v; setInputVal(""); ciz(0, 0, false);
  }

  function temizle() {
    etiketRef.current = "Vur beni!"; vurusRef.current = 0;
    mesgul.current = false; setVurus(0);
    setMesaj("Bir şey yapıştır — sonra vur!"); setMesajKey(k => k + 1);
    ciz(0, 0, false);
  }

  return (
    <>
      <style>{`
        @keyframes gloveHit{0%{opacity:0;transform:scale(.4) rotate(-20deg);}35%{opacity:1;transform:scale(1.1) rotate(-4deg);}65%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(.4) rotate(14deg);}}
        @keyframes impactBurst{0%{opacity:1;transform:scale(.2);}55%{opacity:1;transform:scale(1.3);}100%{opacity:0;transform:scale(1.8);}}
        @keyframes hcMsg{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "52px 18px 36px", width: "100%" }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>🥊 Hacıyatmaz</div>
        <div style={{ fontSize: 11, color: "rgba(232,244,253,0.45)", marginBottom: 16, textAlign: "center" }}>Üzerine bir şey yapıştır, sonra vur.</div>
        <div style={{ fontSize: 11, color: "#f5a623", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
          {vurus === 0 ? "Henüz vurmadın" : `${vurus} kez vurdun`}
        </div>
        <div
          key={mesajKey}
          style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.28)", borderRadius: 11, padding: "9px 14px", fontSize: 12, color: "#f5a623", fontWeight: 600, textAlign: "center", lineHeight: 1.5, maxWidth: 320, width: "100%", minHeight: 40, marginBottom: 14, animation: "hcMsg .3s ease-out" }}
        >
          {mesaj}
        </div>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 18 }}>
          <canvas ref={canvasRef} width={170} height={278} style={{ display: "block", cursor: "pointer" }} onClick={vur} />
          <div ref={gloveRef} style={{ position: "absolute", top: 0, left: 0, width: 170, height: 278, pointerEvents: "none", overflow: "visible" }} />
          <div ref={shadowRef} style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 72, height: 14, background: "rgba(0,0,0,0.38)", borderRadius: "50%", filter: "blur(4px)", opacity: 0.42, transition: "all .25s" }} />
        </div>
        <div style={{ display: "flex", gap: 7, maxWidth: 310, width: "100%", marginBottom: 8 }}>
          <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && yapistir()} maxLength={18} placeholder="Ne yazayım?" style={{ flex: 1, padding: "9px 11px", borderRadius: 8, border: "1.5px solid rgba(232,244,253,0.18)", background: "rgba(232,244,253,0.06)", color: "white", fontSize: 12, fontFamily: "'Sora', sans-serif", outline: "none" }} />
          <button onClick={yapistir} style={{ padding: "9px 14px", background: "#f5a623", color: "#1a2e4a", fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "'Sora', sans-serif" }}>Yapıştır</button>
        </div>
        <button onClick={temizle} style={{ padding: "6px 13px", background: "transparent", color: "rgba(232,244,253,0.35)", border: "1px solid rgba(232,244,253,0.14)", borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: "'Sora', sans-serif" }}>Temizle</button>
      </div>
    </>
  );
}