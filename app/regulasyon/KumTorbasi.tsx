"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const MESAJLAR = [
  "İyi vurdu. Bir daha.",
  "Bu his geçecek. Söz.",
  "Bugün zor, ama yarın hâlâ oradasın.",
  "Bazen denemeler bizi dener. Sen kazanacaksın.",
  "Her vuruş bir nefes. Her nefes bir başlangıç.",
  "Bir adım geri, iki adım ileri.",
  "Kötü gün, kötü hayat değil.",
  "Sen bu sınavdan büyüksün.",
  "Devril ama kalkmayı biliyorsun.",
  "Güçlüsün. Bunu unutma.",
];

// ─── SES ──────────────────────────────────────────────────────────────────
function playHit(ctx: AudioContext, power: number) {
  const now = ctx.currentTime;
  // Deri çarpma sesi — noise burst + low thump
  const bufLen = ctx.sampleRate * 0.12;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2.5);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 800 + power * 400;
  bandpass.Q.value = 1.2;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.9 + power * 0.4, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  noise.connect(bandpass);
  bandpass.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);

  // Bas thump
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120 + power * 60, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + 0.2);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(1.4 + power * 0.6, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

// ─── FİZİK: SARKAÇ ────────────────────────────────────────────────────────
// Gerçek sarkaç simülasyonu: açı, açısal hız, sönümleme
function usePendulum() {
  const angle    = useRef(0);   // radyan
  const velocity = useRef(0);   // rad/s
  const afr      = useRef<number | null>(null);
  const last     = useRef<number | null>(null);
  const [displayAngle, setDisplayAngle] = useState(0);

  const simulate = useCallback((ts: number) => {
    if (last.current === null) last.current = ts;
    const dt = Math.min((ts - last.current) / 1000, 0.05); // max 50ms
    last.current = ts;

    const g       = 9.8;
    const L       = 0.35;  // sarkaç uzunluğu (metre cinsinden normalize)
    const damping = 0.985; // sönümleme

    // Sarkaç diferansiyel denklemi: α = -(g/L) * sin(θ)
    const acceleration = -(g / L) * Math.sin(angle.current);
    velocity.current = (velocity.current + acceleration * dt) * damping;
    angle.current += velocity.current * dt;

    setDisplayAngle(angle.current * (180 / Math.PI));

    if (Math.abs(angle.current) > 0.002 || Math.abs(velocity.current) > 0.01) {
      afr.current = requestAnimationFrame(simulate);
    } else {
      angle.current = 0;
      velocity.current = 0;
      setDisplayAngle(0);
      afr.current = null;
      last.current = null;
    }
  }, []);

  const hit = useCallback((force: number, fromLeft: boolean) => {
    if (afr.current) cancelAnimationFrame(afr.current);
    last.current = null;
    // Ani hız ver
    velocity.current = force * (fromLeft ? 1 : -1);
    afr.current = requestAnimationFrame(simulate);
  }, [simulate]);

  useEffect(() => () => { if (afr.current) cancelAnimationFrame(afr.current); }, []);

  return { displayAngle, hit };
}

// ─── ANA COMPONENT ────────────────────────────────────────────────────────
export default function Haciyatmaz() {
  const [vurus, setVurus]       = useState(0);
  const [mesaj, setMesaj]       = useState("");
  const [mesajKey, setMesajKey] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [etiket, setEtiket]     = useState("Bana İsim Ver");
  const [animKey, setAnimKey]   = useState(0);
  const [fromLeft, setFromLeft] = useState(true);
  const [isHit, setIsHit]       = useState(false);

  const audioCtx = useRef<AudioContext | null>(null);
  const busy     = useRef(false);
  const { displayAngle, hit } = usePendulum();

  const vur = useCallback(() => {
    if (busy.current) return;
    busy.current = true;

    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === "suspended") audioCtx.current.resume();

    const n = vurus + 1;
    setVurus(n);
    setMesaj(MESAJLAR[Math.floor(Math.random() * MESAJLAR.length)]);
    setMesajKey(k => k + 1);

    const left  = Math.random() > 0.5;
    const power = 0.6 + Math.random() * 0.8; // 0.6–1.4 arası
    setFromLeft(left);
    setAnimKey(k => k + 1);
    setIsHit(true);
    setTimeout(() => setIsHit(false), 120);

    playHit(audioCtx.current, power);
    hit(power * 2.8, left);

    setTimeout(() => { busy.current = false; }, 300);
  }, [vurus, hit]);

  function yapistir() {
    const v = inputVal.trim();
    if (!v) return;
    setEtiket(v);
    setInputVal("");
  }

  function temizle() {
    setEtiket("Bana İsim Ver");
    setVurus(0);
    setMesaj("");
    busy.current = false;
  }

  return (
    <>
      <style>{`
        .pb-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 52px 20px 40px;
          width: 100%;
          font-family: 'Sora', sans-serif;
        }
        .pb-scene {
          position: relative;
          width: 300px;
          height: 380px;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          user-select: none;
          box-shadow:
            0 2px 0 rgba(255,255,255,0.06) inset,
            0 28px 72px rgba(0,0,0,0.8),
            0 8px 24px rgba(0,0,0,0.5);
          margin-bottom: 22px;
          flex-shrink: 0;
        }
        /* Tüm bilgi alanları sabit yükseklik — sahne kaymasın */
        .pb-info {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .pb-counter {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 10px;
          transition: color .3s;
          height: 16px;
        }
        .pb-msg-wrap {
          height: 58px;
          width: 100%;
          max-width: 290px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          overflow: hidden;
          flex-shrink: 0;
        }
        @keyframes msgIn { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
        .pb-msg {
          animation: msgIn .28s ease-out;
          font-size: 11.5px;
          color: rgba(232,244,253,.62);
          font-style: italic;
          text-align: center;
          line-height: 1.6;
          width: 100%;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── TORBA PIVOT (zincir bağlantı noktası etrafında döner) ── */
        .pb-pivot {
          position: absolute;
          top: 0; left: 50%;
          transform-origin: 50% 0%;
          transform: translateX(-50%) rotate(var(--angle, 0deg));
          transition: none;
          pointer-events: none;
          width: 200px;
        }

        /* Vurma flash */
        @keyframes hitFlash {
          0%  { opacity: .9; }
          100%{ opacity: 0; }
        }
        .pb-flash {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: hitFlash .18s ease-out forwards;
          background: radial-gradient(circle,
            rgba(255,220,80,0.95) 0%,
            rgba(255,140,20,0.5) 40%,
            transparent 68%
          );
        }

        /* Eldiven animasyonu */
        @keyframes gloveL {
          0%  { opacity:0; transform: translate(-60px, 20px) rotate(-20deg) scale(.4); }
          35% { opacity:1; transform: translate(0,0) rotate(-4deg) scale(1.08); }
          65% { opacity:1; transform: translate(0,0) rotate(0deg) scale(1); }
          100%{ opacity:0; transform: translate(20px,-10px) rotate(8deg) scale(.5); }
        }
        @keyframes gloveR {
          0%  { opacity:0; transform: translate(60px, 20px) rotate(20deg) scale(.4) scaleX(-1); }
          35% { opacity:1; transform: translate(0,0) rotate(4deg) scale(1.08) scaleX(-1); }
          65% { opacity:1; transform: translate(0,0) rotate(0deg) scale(1) scaleX(-1); }
          100%{ opacity:0; transform: translate(-20px,-10px) rotate(-8deg) scale(.5) scaleX(-1); }
        }
        .pb-glove {
          position: absolute;
          width: 68px; height: 58px;
          bottom: 44%; opacity: 0;
          pointer-events: none;
        }
        .pb-glove-l { left: 8%; }
        .pb-glove-r { right: 8%; }
        .pb-glove-l.active { animation: gloveL .52s ease-out forwards; }
        .pb-glove-r.active { animation: gloveR .52s ease-out forwards; }
      `}</style>

      <div className="pb-root">
        {/* Başlık */}
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4, color: "white", letterSpacing: "-.02em" }}>
          🥊 Boks Torbası
        </div>
        <div style={{ fontSize: 11, color: "rgba(232,244,253,.38)", marginBottom: 16, flexShrink: 0 }}>
          Üzerine bir şey yaz, sonra vur.
        </div>

        {/* Sabit bilgi alanı */}
        <div className="pb-info">
          <div className="pb-counter" style={{ color: vurus > 0 ? "#f5a623" : "rgba(232,244,253,.2)" }}>
            {vurus === 0 ? "Henüz vurmadın" : `${vurus} vuruş`}
          </div>
          <div className="pb-msg-wrap">
            {mesaj && <div key={mesajKey} className="pb-msg">"{mesaj}"</div>}
          </div>
        </div>

        {/* ── SAHNE ── */}
        <div className="pb-scene" onClick={vur}>

          {/* Oda arka planı */}
          <GymRoom />

          {/* Sarkaç pivot grubu */}
          <div
            className="pb-pivot"
            style={{ "--angle": `${displayAngle}deg` } as React.CSSProperties}
          >
            <PunchingBagSVG isHit={isHit} etiket={etiket} vurus={vurus} />
          </div>

          {/* Vurma flash */}
          {isHit && (
            <div
              key={`f${animKey}`}
              className="pb-flash"
              style={{
                width: 72, height: 72,
                bottom: "44%",
                left: fromLeft ? "58%" : "28%",
                transform: "translate(-50%, 50%)",
              }}
            />
          )}

          {/* Eldivenler */}
          <div key={`gl${animKey}`} className={`pb-glove pb-glove-l${fromLeft ? " active" : ""}`}>
            <GloveSVG />
          </div>
          <div key={`gr${animKey}`} className={`pb-glove pb-glove-r${!fromLeft ? " active" : ""}`}>
            <GloveSVG />
          </div>

        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 8, maxWidth: 290, width: "100%", marginBottom: 10, flexShrink: 0 }}>
          <input
            type="text" value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && yapistir()}
            maxLength={18} placeholder="Ne yazayım?"
            style={{
              flex: 1, padding: "10px 13px", borderRadius: 9,
              border: "1px solid rgba(255,255,255,.1)",
              background: "rgba(255,255,255,.05)",
              color: "white", fontSize: 12,
              fontFamily: "'Sora',sans-serif", outline: "none",
            }}
          />
          <button onClick={yapistir} style={{
            padding: "10px 16px",
            background: "linear-gradient(135deg,#f5a623,#e08c10)",
            color: "#1a1a1a", fontWeight: 700, border: "none",
            borderRadius: 9, cursor: "pointer", fontSize: 12,
            fontFamily: "'Sora',sans-serif",
            boxShadow: "0 4px 12px rgba(245,166,35,.3)",
          }}>
            Yaz
          </button>
        </div>
        <button onClick={temizle} style={{
          padding: "6px 14px", background: "transparent",
          color: "rgba(232,244,253,.25)",
          border: "1px solid rgba(232,244,253,.08)",
          borderRadius: 7, cursor: "pointer", fontSize: 11,
          fontFamily: "'Sora',sans-serif", flexShrink: 0,
        }}>
          Sıfırla
        </button>
      </div>
    </>
  );
}

// ─── GYM ODASI ────────────────────────────────────────────────────────────
function GymRoom() {
  return (
    <svg viewBox="0 0 300 380" width="300" height="380"
      style={{ position: "absolute", inset: 0, display: "block" }}>
      <defs>
        <linearGradient id="roomWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1C1008" />
          <stop offset="100%" stopColor="#120A04" />
        </linearGradient>
        <linearGradient id="roomFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A1A0A" />
          <stop offset="100%" stopColor="#160C04" />
        </linearGradient>
        <radialGradient id="spotlight" cx="50%" cy="5%" r="65%">
          <stop offset="0%" stopColor="rgba(255,210,140,0.32)" />
          <stop offset="55%" stopColor="rgba(255,180,80,0.08)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="floorGlow" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="rgba(255,190,100,0.18)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Duvar */}
      <rect width="300" height="380" fill="url(#roomWall)" />

      {/* Spotlight ışığı */}
      <ellipse cx="150" cy="0" rx="200" ry="220" fill="url(#spotlight)" />

      {/* Arka duvar panel çizgileri (gym duvar lambiri) */}
      {[0, 60, 120, 180, 240, 300].map((x, i) => (
        <line key={i} x1={x} y1="0" x2={x} y2="260"
          stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
      ))}
      {[80, 160].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="300" y2={y}
          stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
      ))}

      {/* Zemin */}
      <rect y="260" width="300" height="120" fill="url(#roomFloor)" />
      {/* Zemin desen */}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={i * 44 - 10} y1="260" x2={i * 44 + 20} y2="380"
          stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
      ))}
      {[275, 295, 315, 335, 355, 375].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="300" y2={y + 2}
          stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
      ))}
      {/* Zemin ışık yansıması */}
      <ellipse cx="150" cy="260" rx="110" ry="32" fill="url(#floorGlow)" />

      {/* Süpürgelik */}
      <rect y="257" width="300" height="6" fill="#1A0A02" />
      <rect y="261" width="300" height="1.5" fill="rgba(255,200,100,0.06)" />

      {/* Tavan rayı (torba askı kirişi) */}
      <rect x="60" y="14" width="180" height="10" rx="5"
        fill="url(#railGrad)" />
      <defs>
        <linearGradient id="railGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5A5A6A" />
          <stop offset="40%" stopColor="#3A3A4A" />
          <stop offset="100%" stopColor="#1A1A22" />
        </linearGradient>
      </defs>
      <rect x="60" y="14" width="180" height="3" rx="2"
        fill="rgba(255,255,255,0.12)" />
      {/* Kiriş vidaları */}
      {[80, 150, 220].map((x, i) => (
        <circle key={i} cx={x} cy="19" r="3.5" fill="#2A2A32" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
    </svg>
  );
}

// ─── TORBA SVG ────────────────────────────────────────────────────────────
function PunchingBagSVG({
  isHit, etiket, vurus,
}: {
  isHit: boolean; etiket: string; vurus: number;
}) {
  const scX = isHit ? 0.88 : 1;
  const scY = isHit ? 1.1  : 1;

  return (
    <svg
      viewBox="0 0 200 340"
      width="200" height="340"
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <defs>
        {/* Zincir metal */}
        <linearGradient id="chain" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3A3A4A" />
          <stop offset="40%" stopColor="#6A6A7A" />
          <stop offset="70%" stopColor="#4A4A5A" />
          <stop offset="100%" stopColor="#2A2A32" />
        </linearGradient>
        {/* Torba ana deri */}
        <radialGradient id="bag" cx="28%" cy="22%" r="78%">
          <stop offset="0%" stopColor="#CC4422" />
          <stop offset="30%" stopColor="#AA2A10" />
          <stop offset="65%" stopColor="#881808" />
          <stop offset="88%" stopColor="#5A0E04" />
          <stop offset="100%" stopColor="#380800" />
        </radialGradient>
        {/* Torba sol parlama */}
        <radialGradient id="bagShineL" cx="20%" cy="25%" r="55%">
          <stop offset="0%" stopColor="rgba(255,160,100,0.32)" />
          <stop offset="100%" stopColor="rgba(255,160,100,0)" />
        </radialGradient>
        {/* Torba sağ gölge */}
        <linearGradient id="bagShadowR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.38)" />
        </linearGradient>
        {/* Üst kapak (deri) */}
        <radialGradient id="cap" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#4A4A5A" />
          <stop offset="55%" stopColor="#2A2A32" />
          <stop offset="100%" stopColor="#121218" />
        </radialGradient>
        {/* Dikiş şerit */}
        <linearGradient id="strap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6A3010" />
          <stop offset="50%" stopColor="#8A4018" />
          <stop offset="100%" stopColor="#4A2008" />
        </linearGradient>
        <filter id="bagShadow" x="-25%" y="-15%" width="150%" height="130%">
          <feDropShadow dx="3" dy="6" stdDeviation="8" floodColor="rgba(0,0,0,0.7)" />
        </filter>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── ZİNCİR ── */}
      <ChainLinks />

      {/* ── BAĞLANTI HALKASI ── */}
      <ellipse cx="100" cy="72" rx="10" ry="7"
        fill="none" stroke="#5A5A6A" strokeWidth="4" />
      <ellipse cx="100" cy="72" rx="10" ry="7"
        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

      {/* ── TORBA GÖVDE ── */}
      <g
        transform={`translate(100, 195) scale(${scX}, ${scY}) translate(-100, -195)`}
        style={{ transition: "transform 0.1s" }}
        filter="url(#bagShadow)"
      >
        {/* Ana torba şekli */}
        <path d="
          M 68 82
          C 58 90, 50 110, 50 140
          C 50 175, 52 210, 55 235
          C 60 265, 72 282, 100 284
          C 128 282, 140 265, 145 235
          C 148 210, 150 175, 150 140
          C 150 110, 142 90, 132 82
          C 122 74, 78 74, 68 82 Z
        " fill="url(#bag)" />

        {/* Sağ gölge katmanı */}
        <path d="
          M 68 82
          C 58 90, 50 110, 50 140
          C 50 175, 52 210, 55 235
          C 60 265, 72 282, 100 284
          C 128 282, 140 265, 145 235
          C 148 210, 150 175, 150 140
          C 150 110, 142 90, 132 82
          C 122 74, 78 74, 68 82 Z
        " fill="url(#bagShadowR)" />

        {/* Sol parlama */}
        <path d="
          M 68 82
          C 58 90, 50 110, 50 140
          C 50 175, 52 210, 55 235
          C 60 265, 72 282, 100 284
          C 128 282, 140 265, 145 235
          C 148 210, 150 175, 150 140
          C 150 110, 142 90, 132 82
          C 122 74, 78 74, 68 82 Z
        " fill="url(#bagShineL)" />

        {/* Kontur */}
        <path d="
          M 68 82
          C 58 90, 50 110, 50 140
          C 50 175, 52 210, 55 235
          C 60 265, 72 282, 100 284
          C 128 282, 140 265, 145 235
          C 148 210, 150 175, 150 140
          C 150 110, 142 90, 132 82
          C 122 74, 78 74, 68 82 Z
        " fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />

        {/* ── DERİ DİKİŞ ŞERİTLERİ ── */}
        {/* Yatay dikiş bantları */}
        {[118, 148, 178, 208, 238].map((y, i) => (
          <g key={i}>
            {/* Bant zemini */}
            <path
              d={`M ${48 + i * 1.5} ${y} Q 100 ${y + 3} ${152 - i * 1.5} ${y}`}
              fill="none" stroke="#6A2A08" strokeWidth="8" strokeLinecap="round"
            />
            {/* Bant üst parlama */}
            <path
              d={`M ${50 + i * 1.5} ${y - 1} Q 100 ${y + 2} ${150 - i * 1.5} ${y - 1}`}
              fill="none" stroke="rgba(180,80,30,0.4)" strokeWidth="2" strokeLinecap="round"
            />
            {/* Dikiş çizgisi */}
            <path
              d={`M ${52 + i * 1.5} ${y} Q 100 ${y + 3} ${148 - i * 1.5} ${y}`}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Dikey orta dikiş */}
        <line x1="100" y1="82" x2="100" y2="284"
          stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeDasharray="5 4" />

        {/* ── ÜST KAPAK ── */}
        <ellipse cx="100" cy="82" rx="32" ry="11"
          fill="url(#cap)" />
        <ellipse cx="100" cy="82" rx="32" ry="11"
          fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
        {/* Kapak parlama */}
        <ellipse cx="90" cy="79" rx="18" ry="5"
          fill="rgba(255,255,255,0.1)" />

        {/* ── ALT KAPAK ── */}
        <ellipse cx="100" cy="284" rx="28" ry="9"
          fill="url(#cap)" />
        <ellipse cx="100" cy="284" rx="28" ry="9"
          fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />

        {/* ── ETİKET ── */}
        <BagLabel etiket={etiket} vurus={vurus} />
      </g>

      {/* ── ZEMIN GÖLGE (torbanın altında) ── */}
      <ellipse cx="100" cy="318" rx={isHit ? 28 : 36} ry={isHit ? 6 : 9}
        fill="rgba(0,0,0,0.55)"
        style={{ filter: "blur(4px)", transition: "all 0.1s" }}
      />
    </svg>
  );
}

// Zincir halkaları
function ChainLinks() {
  const links = [
    { y: 14, rx: 7, ry: 4.5, rot: 0 },
    { y: 24, rx: 4.5, ry: 7, rot: 90 },
    { y: 36, rx: 7, ry: 4.5, rot: 0 },
    { y: 46, rx: 4.5, ry: 7, rot: 90 },
    { y: 57, rx: 7, ry: 4.5, rot: 0 },
    { y: 67, rx: 4.5, ry: 6, rot: 90 },
  ];
  return (
    <g>
      {links.map((l, i) => (
        <g key={i} transform={`translate(100, ${l.y})`}>
          <ellipse rx={l.rx} ry={l.ry}
            fill="none" stroke="#3A3A4A" strokeWidth="3.5" />
          <ellipse rx={l.rx} ry={l.ry}
            fill="none" stroke="url(#chain)" strokeWidth="2" />
          {/* Halka parlama */}
          <ellipse rx={l.rx * 0.6} ry={l.ry * 0.4}
            transform={`translate(-${l.rx * 0.2}, -${l.ry * 0.2})`}
            fill="rgba(255,255,255,0.12)" />
        </g>
      ))}
    </g>
  );
}

// Torba etiketi
function BagLabel({ etiket, vurus }: { etiket: string; vurus: number }) {
  const text = etiket.length > 14 ? etiket.slice(0, 13) + "…" : etiket;
  const worn = Math.min(1, vurus / 10); // yıpranma efekti

  return (
    <g transform="translate(100, 183)">
      {/* Etiket yıpranma / yanma efekti */}
      {worn > 0.3 && (
        <rect x="-36" y="-17" width={72 * worn * 0.4} height="34" rx="4"
          fill={`rgba(80,20,0,${worn * 0.4})`} />
      )}
      {/* Etiket gölgesi */}
      <rect x="-35" y="-14" width="70" height="30" rx="5"
        fill="rgba(0,0,0,0.5)" transform="translate(2,3)" />
      {/* Etiket zemini — krem kağıt rengi */}
      <rect x="-35" y="-14" width="70" height="30" rx="5"
        fill={`rgba(${240 - vurus * 8},${220 - vurus * 12},${180 - vurus * 10},0.92)`} />
      {/* Etiket kenarlık */}
      <rect x="-35" y="-14" width="70" height="30" rx="5"
        fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" />
      {/* Etiket çizgiler (defter kağıdı efekti) */}
      {[-5, 3, 11].map((ly, i) => (
        <line key={i} x1="-28" y1={ly} x2="28" y2={ly}
          stroke="rgba(100,150,200,0.2)" strokeWidth="0.8" />
      ))}
      {/* Metin */}
      <text x="0" y="1"
        textAnchor="middle" dominantBaseline="middle"
        fill={`rgba(${20 + vurus * 10},${10 + vurus * 5},0,0.9)`}
        fontSize="9.5" fontWeight="700"
        fontFamily="'Sora', sans-serif"
        style={{ letterSpacing: "0.03em" }}
      >
        {text}
      </text>
      {/* Bant yapıştırma köşe detayı */}
      <path d="M-35,-14 L-25,-14 L-35,-6 Z" fill="rgba(200,180,120,0.3)" />
      <path d="M35,-14 L25,-14 L35,-6 Z" fill="rgba(200,180,120,0.3)" />
    </g>
  );
}

// ─── ELDİVEN SVG ──────────────────────────────────────────────────────────
function GloveSVG() {
  return (
    <svg viewBox="0 0 68 58" fill="none" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="glv" cx="28%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#FF6858" />
          <stop offset="40%" stopColor="#E02020" />
          <stop offset="80%" stopColor="#AA0808" />
          <stop offset="100%" stopColor="#600000" />
        </radialGradient>
        <radialGradient id="glvSh" cx="22%" cy="20%" r="52%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <linearGradient id="cuff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0F0F0" />
          <stop offset="100%" stopColor="#C8C8C8" />
        </linearGradient>
      </defs>
      {/* Bilek bandı */}
      <rect x="16" y="38" width="32" height="18" rx="4" fill="url(#glv)" />
      <rect x="16" y="38" width="32" height="8" rx="4" fill="url(#cuff)" />
      <rect x="16" y="43" width="32" height="3" fill="#DD2020" />
      {/* Ana gövde */}
      <path d="M8 38 C2 22 4 7 14 2 C21-2 42-2 50 3 C58 9 60 25 56 38 Z" fill="url(#glv)" />
      <path d="M8 38 C2 22 4 7 14 2 C21-2 42-2 50 3 C58 9 60 25 56 38 Z"
        stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" fill="none" />
      {/* Başparmak */}
      <ellipse cx="57" cy="15" rx="9" ry="6"
        transform="rotate(30 57 15)" fill="#CC1818" />
      <ellipse cx="57" cy="15" rx="9" ry="6"
        transform="rotate(30 57 15)"
        stroke="rgba(0,0,0,0.18)" strokeWidth="1" fill="none" />
      {/* Parmak dikişleri */}
      {[18, 25, 32, 39].map((x, i) => (
        <line key={i} x1={x} y1="2" x2={x - 1} y2="16"
          stroke="rgba(0,0,0,0.2)" strokeWidth="1.8" strokeLinecap="round" />
      ))}
      {/* Parlama */}
      <ellipse cx="20" cy="14" rx="12" ry="8" fill="url(#glvSh)" />
    </svg>
  );
}