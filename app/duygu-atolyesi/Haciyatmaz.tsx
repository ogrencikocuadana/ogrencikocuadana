"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const MESAJLAR = [
  "Devril ama kalkmayı biliyorsun.",
  "Bu his geçecek. Söz.",
  "Bugün zor, ama yarın hâlâ oradasın.",
  "Bazen denemeler bizi dener. Sen kazanacaksın.",
  "Her vuruş bir nefes. Her nefes bir başlangıç.",
  "Bir adım geri, iki adım ileri.",
  "Kötü gün, kötü hayat değil.",
  "Sen bu sınavdan büyüksün.",
  "Güçlüsün. Bunu unutma.",
  "Hacıyatmaz gibi: ne kadar vururlarsa o kadar kalkarsın.",
];

// ─── KARAKTER TANIMLARI ───────────────────────────────────────────────────
type KarakterID = "insan" | "ayi" | "uzayli" | "robot" | "iskelet" | "zombi" | "canavar";

interface Karakter {
  id: KarakterID;
  label: string;
  emoji: string;
  aciklama: string;
  renk: string;        // kart vurgu rengi
  bg: string;          // kart arka plan
}

const KARAKTERLER: Karakter[] = [
  { id:"insan",   label:"İnsan",   emoji:"👤", aciklama:"Klasik hacıyatmaz",         renk:"#f5a623", bg:"linear-gradient(135deg,#1e1208,#2a1a0c)" },
  { id:"ayi",     label:"Ayı",     emoji:"🐻", aciklama:"Güçlü ama devrilir",        renk:"#8d6e63", bg:"linear-gradient(135deg,#150e08,#1e1408)" },
  { id:"uzayli",  label:"Uzaylı",  emoji:"👽", aciklama:"Başka gezegenden stres",    renk:"#69f0ae", bg:"linear-gradient(135deg,#051a0e,#0a2218)" },
  { id:"robot",   label:"Robot",   emoji:"🤖", aciklama:"Soğuk hesapçı",             renk:"#40c4ff", bg:"linear-gradient(135deg,#051018,#0a1a28)" },
  { id:"iskelet", label:"İskelet", emoji:"💀", aciklama:"Korkuları kafesle",         renk:"#e0e0e0", bg:"linear-gradient(135deg,#111114,#1a1a20)" },
  { id:"zombi",   label:"Zombi",   emoji:"🧟", aciklama:"Ölü ama devriliyor",       renk:"#8bc34a", bg:"linear-gradient(135deg,#0a1205,#121a08)" },
  { id:"canavar", label:"Canavar", emoji:"👾", aciklama:"Karanlık tarafın simgesi", renk:"#ff6e40", bg:"linear-gradient(135deg,#1a0805,#251008)" },
];

// ─── SES ──────────────────────────────────────────────────────────────────
function playHit(ctx: AudioContext, power: number) {
  const now = ctx.currentTime;
  const bufLen = ctx.sampleRate * 0.11;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++)
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2.4);
  const noise = ctx.createBufferSource(); noise.buffer = buf;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900 + power * 350; bp.Q.value = 1.1;
  const ng = ctx.createGain(); ng.gain.setValueAtTime(0.9 + power * 0.4, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
  noise.connect(bp); bp.connect(ng); ng.connect(ctx.destination); noise.start(now);
  const osc = ctx.createOscillator(); osc.type = "sine";
  osc.frequency.setValueAtTime(110 + power * 60, now); osc.frequency.exponentialRampToValueAtTime(26, now + 0.2);
  const og = ctx.createGain(); og.gain.setValueAtTime(1.4 + power * 0.6, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(og); og.connect(ctx.destination); osc.start(now); osc.stop(now + 0.25);
}

// ─── FİZİK ────────────────────────────────────────────────────────────────
function usePendulum() {
  const angle = useRef(0), velocity = useRef(0);
  const afr = useRef<number | null>(null), last = useRef<number | null>(null);
  const [deg, setDeg] = useState(0);

  const sim = useCallback((ts: number) => {
    if (last.current === null) last.current = ts;
    const dt = Math.min((ts - last.current) / 1000, 0.05);
    last.current = ts;
    velocity.current = (velocity.current - (9.8 / 0.35) * Math.sin(angle.current) * dt) * 0.985;
    angle.current += velocity.current * dt;
    setDeg(angle.current * (180 / Math.PI));
    if (Math.abs(angle.current) > 0.002 || Math.abs(velocity.current) > 0.01) {
      afr.current = requestAnimationFrame(sim);
    } else {
      angle.current = 0; velocity.current = 0; setDeg(0);
      afr.current = null; last.current = null;
    }
  }, []);

  const hit = useCallback((force: number, left: boolean) => {
    if (afr.current) cancelAnimationFrame(afr.current);
    last.current = null;
    velocity.current = force * (left ? 1 : -1);
    afr.current = requestAnimationFrame(sim);
  }, [sim]);

  useEffect(() => () => { if (afr.current) cancelAnimationFrame(afr.current); }, []);
  return { deg, hit };
}

// ─── ANA COMPONENT ────────────────────────────────────────────────────────
export default function Haciyatmaz() {
  const [secim, setSecim]       = useState<KarakterID | null>(null);
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
  const { deg, hit } = usePendulum();

  const vur = useCallback(() => {
    if (busy.current || !secim) return;
    busy.current = true;
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.current.state === "suspended") audioCtx.current.resume();
    const n = vurus + 1; setVurus(n);
    setMesaj(MESAJLAR[Math.floor(Math.random() * MESAJLAR.length)]);
    setMesajKey(k => k + 1);
    const left = Math.random() > .5, power = 0.6 + Math.random() * 0.8;
    setFromLeft(left); setAnimKey(k => k + 1); setIsHit(true);
    setTimeout(() => setIsHit(false), 120);
    playHit(audioCtx.current, power);
    hit(power * 2.8, left);
    setTimeout(() => { busy.current = false; }, 300);
  }, [vurus, hit, secim]);

  function geriDon() {
    setSecim(null); setVurus(0); setMesaj(""); setEtiket("Bana İsim Ver");
    busy.current = false;
  }

  function yapistir() {
    const v = inputVal.trim(); if (!v) return;
    setEtiket(v); setInputVal("");
  }

  const karakter = KARAKTERLER.find(k => k.id === secim);

  // ── KARAKTER SEÇİM EKRANI ──────────────────────────────────────────────
  if (!secim) {
    return (
      <>
        <style>{`
          @keyframes fadeUp { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
          .hc-sel-card {
            display: flex; align-items: center; gap: 14px;
            padding: 14px 16px; border-radius: 14px; cursor: pointer; width: 100%;
            border: 1.5px solid rgba(255,255,255,0.06);
            transition: transform .15s, border-color .15s, box-shadow .15s;
            text-align: left; font-family: 'Sora', sans-serif;
          }
          .hc-sel-card:hover {
            transform: translateX(5px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          }
        `}</style>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"52px 20px 40px", width:"100%", fontFamily:"'Sora',sans-serif" }}>

          <div style={{ fontSize:17, fontWeight:800, color:"white", marginBottom:4, letterSpacing:"-.02em" }}>
            🥊 Hacıyatmaz
          </div>
          <div style={{ fontSize:11, color:"rgba(232,244,253,.38)", marginBottom:28 }}>
            Önce bir karakter seç.
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, width:"100%", maxWidth:340 }}>
            {KARAKTERLER.map((k, i) => (
              <button
                key={k.id}
                onClick={() => setSecim(k.id)}
                className="hc-sel-card"
                style={{
                  background: k.bg,
                  flexDirection:"column", alignItems:"center", justifyContent:"center",
                  gap:8, padding:"14px 10px",
                  animationName: "fadeUp",
                  animationDuration: ".3s",
                  animationDelay: `${i * 0.05}s`,
                  animationFillMode: "both",
                  animationTimingFunction: "ease-out",
                }}
              >
                <div style={{ fontSize:34 }}>{k.emoji}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"white" }}>{k.label}</div>
                <div style={{ fontSize:10, color:"rgba(232,244,253,.38)", textAlign:"center", lineHeight:1.4 }}>
                  {k.aciklama}
                </div>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ── VUR EKRANI ────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .hc-root { display:flex; flex-direction:column; align-items:center; padding:52px 20px 40px; width:100%; font-family:'Sora',sans-serif; }
        .hc-scene {
          position:relative; width:300px; height:360px; border-radius:20px; overflow:hidden;
          cursor:pointer; user-select:none;
          box-shadow: 0 2px 0 rgba(255,255,255,.06) inset, 0 28px 72px rgba(0,0,0,.8), 0 8px 24px rgba(0,0,0,.5);
          margin-bottom:20px; flex-shrink:0;
        }
        .hc-pivot {
          position:absolute; top:0; left:50%;
          transform-origin:50% 0%;
          transform:translateX(-50%) rotate(var(--a,0deg));
          pointer-events:none; width:156px;
        }
        .hc-info { flex-shrink:0; display:flex; flex-direction:column; align-items:center; width:100%; }
        .hc-counter { font-size:10px; font-weight:700; letter-spacing:3px; text-transform:uppercase; margin-bottom:10px; transition:color .3s; height:16px; }
        .hc-msg-wrap { height:56px; width:100%; max-width:290px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; overflow:hidden; flex-shrink:0; }
        @keyframes msgIn { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
        .hc-msg { animation:msgIn .28s ease-out; font-size:11.5px; color:rgba(232,244,253,.62); font-style:italic; text-align:center; line-height:1.6; width:100%; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        @keyframes hitFlash { 0%{opacity:.9;} 100%{opacity:0;} }
        .hc-flash { position:absolute; border-radius:50%; pointer-events:none; animation:hitFlash .18s ease-out forwards; background:radial-gradient(circle,rgba(255,220,80,.95) 0%,rgba(255,140,20,.5) 40%,transparent 68%); }
        @keyframes gL { 0%{opacity:0;transform:translate(-60px,20px) rotate(-20deg) scale(.4);} 35%{opacity:1;transform:translate(0,0) rotate(-4deg) scale(1.08);} 65%{opacity:1;transform:scale(1);} 100%{opacity:0;transform:translate(20px,-10px) rotate(8deg) scale(.5);} }
        @keyframes gR { 0%{opacity:0;transform:translate(60px,20px) rotate(20deg) scale(.4) scaleX(-1);} 35%{opacity:1;transform:translate(0,0) rotate(4deg) scale(1.08) scaleX(-1);} 65%{opacity:1;transform:scaleX(-1) scale(1);} 100%{opacity:0;transform:translate(-20px,-10px) rotate(-8deg) scale(.5) scaleX(-1);} }
        .hc-glove { position:absolute; width:64px; height:56px; bottom:44%; opacity:0; pointer-events:none; }
        .hc-glove-l { left:26%; } .hc-glove-r { right:26%; }
        .hc-glove-l.on { animation:gL .5s ease-out forwards; }
        .hc-glove-r.on { animation:gR .5s ease-out forwards; }
      `}</style>

      <div className="hc-root">

        {/* Üst bar: karakter adı + geri */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, width:"100%", maxWidth:300 }}>
          <button onClick={geriDon} style={{
            padding:"5px 10px", background:"rgba(255,255,255,.06)",
            border:"1px solid rgba(255,255,255,.1)", borderRadius:8,
            color:"rgba(232,244,253,.55)", fontSize:11, cursor:"pointer",
            fontFamily:"'Sora',sans-serif", flexShrink:0,
          }}>‹ Karakter</button>
          <div style={{ display:"flex", alignItems:"center", gap:7, flex:1, justifyContent:"center" }}>
            <span style={{ fontSize:20 }}>{karakter?.emoji}</span>
            <span style={{ fontSize:14, fontWeight:700, color:"white" }}>{karakter?.label}</span>
          </div>
          <div style={{ width:68 }}/>
        </div>

        {/* Sabit bilgi alanı */}
        <div className="hc-info">
          <div className="hc-counter" style={{ color: vurus > 0 ? "#f5a623" : "rgba(232,244,253,.2)" }}>
            {vurus === 0 ? "Henüz vurmadın" : `${vurus} vuruş`}
          </div>
          <div className="hc-msg-wrap">
            {mesaj && <div key={mesajKey} className="hc-msg">"{mesaj}"</div>}
          </div>
        </div>

        {/* SAHNE */}
        <div className="hc-scene" onClick={vur}>
          <RoomBg />

          {/* Hacıyatmaz */}
          <div className="hc-pivot" style={{ "--a": `${deg}deg` } as React.CSSProperties}>
            <HaciyatmazSVG karakterId={secim} isHit={isHit} etiket={etiket} vurus={vurus} />
          </div>

          {/* Flash */}
          {isHit && (
            <div key={`f${animKey}`} className="hc-flash"
              style={{ width:68, height:68, bottom:"44%", left:fromLeft?"60%":"30%", transform:"translate(-50%,50%)" }} />
          )}

          {/* Eldivenler */}
          <div key={`gl${animKey}`} className={`hc-glove hc-glove-l${fromLeft?" on":""}`}><GloveSVG /></div>
          <div key={`gr${animKey}`} className={`hc-glove hc-glove-r${!fromLeft?" on":""}`}><GloveSVG /></div>
        </div>

        {/* Input */}
        <div style={{ display:"flex", gap:8, maxWidth:290, width:"100%", marginBottom:10, flexShrink:0 }}>
          <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && yapistir()} maxLength={16} placeholder="İsim ver..."
            style={{ flex:1, padding:"10px 13px", borderRadius:9, border:"1px solid rgba(255,255,255,.1)", background:"rgba(255,255,255,.05)", color:"white", fontSize:12, fontFamily:"'Sora',sans-serif", outline:"none" }} />
          <button onClick={yapistir} style={{ padding:"10px 16px", background:"linear-gradient(135deg,#f5a623,#e08c10)", color:"#1a1a1a", fontWeight:700, border:"none", borderRadius:9, cursor:"pointer", fontSize:12, fontFamily:"'Sora',sans-serif" }}>
            Yapıştır
          </button>
        </div>
        <button onClick={() => { setVurus(0); setMesaj(""); setEtiket("Bana İsim Ver"); busy.current=false; }}
          style={{ padding:"6px 14px", background:"transparent", color:"rgba(232,244,253,.25)", border:"1px solid rgba(232,244,253,.08)", borderRadius:7, cursor:"pointer", fontSize:11, fontFamily:"'Sora',sans-serif" }}>
          Sıfırla
        </button>
      </div>
    </>
  );
}

// ─── ODA ARKA PLAN (kitaplıklı) ───────────────────────────────────────────
function RoomBg() {
  return (
    <svg viewBox="0 0 300 360" width="300" height="360" style={{ position:"absolute", inset:0, display:"block" }}>
      <defs>
        <linearGradient id="rWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C1A0E"/><stop offset="100%" stopColor="#1A0E06"/>
        </linearGradient>
        <linearGradient id="rFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3D2010"/><stop offset="100%" stopColor="#1E0E05"/>
        </linearGradient>
        <radialGradient id="rLamp" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="rgba(255,210,130,.32)"/>
          <stop offset="60%" stopColor="rgba(255,180,80,.07)"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
        <radialGradient id="rFloorGlow" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="rgba(255,200,120,.18)"/><stop offset="100%" stopColor="transparent"/>
        </radialGradient>
        <linearGradient id="rShelf" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1A0A02"/><stop offset="20%" stopColor="#2E1408"/>
          <stop offset="80%" stopColor="#261006"/><stop offset="100%" stopColor="#120804"/>
        </linearGradient>
        <linearGradient id="rPlank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A1E08"/><stop offset="100%" stopColor="#1A0C02"/>
        </linearGradient>
      </defs>

      {/* Duvar */}
      <rect width="300" height="360" fill="url(#rWall)"/>
      {/* Tavan lambası ışığı */}
      <ellipse cx="150" cy="0" rx="200" ry="195" fill="url(#rLamp)"/>

      {/* Zemin */}
      <rect y="262" width="300" height="98" fill="url(#rFloor)"/>
      {Array.from({length:9},(_,i)=>(
        <line key={i} x1={i*38-15} y1="262" x2={i*38+25} y2="360" stroke="rgba(0,0,0,.2)" strokeWidth="1"/>
      ))}
      {[276,292,308,324,340,356].map((y,i)=>(
        <line key={i} x1="0" y1={y} x2="300" y2={y+2} stroke="rgba(255,255,255,.025)" strokeWidth="1"/>
      ))}
      <ellipse cx="150" cy="262" rx="115" ry="36" fill="url(#rFloorGlow)"/>
      {/* Süpürgelik */}
      <rect y="258" width="300" height="7" fill="#2A1204"/>
      <rect y="263" width="300" height="2" fill="#1A0A00"/>

      {/* Sol kitaplık */}
      <RoomShelf x={0} y={0} w={72} h={260}/>
      {/* Sağ kitaplık */}
      <RoomShelf x={228} y={0} w={72} h={260}/>

      {/* Orta duvar tablo */}
      <rect x="118" y="16" width="64" height="50" rx="3" fill="#2A1408"/>
      <rect x="122" y="20" width="56" height="42" rx="2" fill="#4A7A9B"/>
      <ellipse cx="137" cy="35" rx="9" ry="7" fill="#8B6E42" opacity=".7"/>
      <ellipse cx="165" cy="32" rx="12" ry="9" fill="#6B8A52" opacity=".8"/>
      <rect x="122" y="44" width="56" height="18" fill="#4A7A9B" opacity=".28"/>
      <rect x="120" y="18" width="60" height="46" rx="3" fill="none" stroke="#8B6E42" strokeWidth="3"/>
      {[[120,18],[180,18],[120,64],[180,64]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#C8A060"/>
      ))}
    </svg>
  );
}

// Kitaplık SVG bileşeni (oda içinde kullanılır)
function RoomShelf({ x, y, w, h }: { x:number; y:number; w:number; h:number }) {
  const planks = [0, .22, .44, .66, .88];
  const books = [
    [{c:"#8B1A1A",w:8,h:34},{c:"#1A3A6B",w:10,h:40},{c:"#2E7D32",w:8,h:36},{c:"#6A1B9A",w:11,h:42},{c:"#E65100",w:9,h:38},{c:"#1565C0",w:8,h:33}],
    [{c:"#B71C1C",w:11,h:38},{c:"#0D47A1",w:8,h:34},{c:"#1B5E20",w:10,h:41},{c:"#4A148C",w:8,h:36},{c:"#BF360C",w:9,h:39},{c:"#006064",w:10,h:35}],
    [{c:"#880E4F",w:9,h:36},{c:"#1A237E",w:12,h:42},{c:"#33691E",w:8,h:34},{c:"#F57F17",w:10,h:40},{c:"#37474F",w:8,h:38},{c:"#4E342E",w:9,h:35}],
    [{c:"#C62828",w:10,h:40},{c:"#283593",w:8,h:36},{c:"#2E7D32",w:11,h:42},{c:"#6A1B9A",w:9,h:34},{c:"#E65100",w:8,h:38},{c:"#00695C",w:10,h:36}],
    [{c:"#AD1457",w:8,h:34},{c:"#1565C0",w:11,h:41},{c:"#558B2F",w:9,h:38},{c:"#4527A0",w:10,h:36},{c:"#D84315",w:8,h:40},{c:"#00838F",w:8,h:34}],
  ];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="url(#rShelf)"/>
      {x===0
        ? <rect x={x+w-3} y={y} width={3} height={h} fill="rgba(0,0,0,.5)"/>
        : <rect x={x} y={y} width={3} height={h} fill="rgba(0,0,0,.5)"/>
      }
      {x===0
        ? <rect x={x} y={y} width={2} height={h} fill="rgba(255,200,100,.05)"/>
        : <rect x={x+w-2} y={y} width={2} height={h} fill="rgba(255,200,100,.05)"/>
      }
      {planks.map((pct, ri) => {
        const py = y + h * pct;
        const rowH = h * .2;
        const rowBooks = books[ri % books.length];
        let bx = x + 4;
        return (
          <g key={ri}>
            {rowBooks.map((bk, bi) => {
              const bLeft = bx; bx += bk.w + 1;
              if (bLeft + bk.w > x + w - 4) return null;
              const bTop = py + rowH - 5 - bk.h;
              return (
                <g key={bi}>
                  <rect x={bLeft} y={bTop} width={bk.w} height={bk.h} rx="1" fill={bk.c} opacity=".9"/>
                  <rect x={bLeft} y={bTop} width={2} height={bk.h} rx="1" fill="rgba(0,0,0,.3)"/>
                  <rect x={bLeft} y={bTop} width={bk.w} height={2} rx="1" fill="rgba(255,255,255,.14)"/>
                  <rect x={bLeft+bk.w-2} y={bTop} width={2} height={bk.h} fill="rgba(255,255,255,.05)"/>
                </g>
              );
            })}
            <rect x={x} y={py+rowH-5} width={w} height={5} fill="url(#rPlank)"/>
            <rect x={x} y={py+rowH-6} width={w} height={2} fill="rgba(255,200,100,.07)"/>
            <rect x={x} y={py+rowH} width={w} height={2} fill="rgba(0,0,0,.38)"/>
          </g>
        );
      })}
    </g>
  );
}

// ─── HACIYATMAZ SVG (karakter switch) ────────────────────────────────────
function HaciyatmazSVG({ karakterId, isHit, etiket, vurus }: {
  karakterId: KarakterID; isHit: boolean; etiket: string; vurus: number;
}) {
  const smile = Math.min(1, vurus / 6);
  const scX = isHit ? .88 : 1, scY = isHit ? 1.1 : 1;

  return (
    <svg viewBox="0 0 200 310" width="156" height="310"
      style={{ display:"block", margin:"0 auto", overflow:"visible" }}>
      <defs>
        {/* Taban */}
        <radialGradient id="hBase" cx="35%" cy="35%" r="68%">
          <stop offset="0%" stopColor="#282828"/><stop offset="55%" stopColor="#141414"/><stop offset="100%" stopColor="#050505"/>
        </radialGradient>
        {/* Gövde renkleri karaktere göre */}
        <radialGradient id="hBodyInsan" cx="28%" cy="22%" r="75%">
          <stop offset="0%" stopColor="#FF6A50"/><stop offset="25%" stopColor="#E83828"/><stop offset="60%" stopColor="#C21818"/><stop offset="85%" stopColor="#8A0808"/><stop offset="100%" stopColor="#500000"/>
        </radialGradient>
        <radialGradient id="hBodyAyi" cx="28%" cy="22%" r="75%">
          <stop offset="0%" stopColor="#A0845A"/><stop offset="30%" stopColor="#7A5C38"/><stop offset="65%" stopColor="#5A3C20"/><stop offset="100%" stopColor="#3A2410"/>
        </radialGradient>
        <radialGradient id="hBodyUzayli" cx="28%" cy="22%" r="75%">
          <stop offset="0%" stopColor="#30FF80"/><stop offset="30%" stopColor="#10CC50"/><stop offset="65%" stopColor="#088030"/><stop offset="100%" stopColor="#024018"/>
        </radialGradient>
        <radialGradient id="hBodyRobot" cx="28%" cy="22%" r="75%">
          <stop offset="0%" stopColor="#60A8D0"/><stop offset="30%" stopColor="#3878A8"/><stop offset="65%" stopColor="#204A78"/><stop offset="100%" stopColor="#0A2040"/>
        </radialGradient>
        <radialGradient id="hBodyIskelet" cx="28%" cy="22%" r="75%">
          <stop offset="0%" stopColor="#D0D0C0"/><stop offset="30%" stopColor="#A8A898"/><stop offset="65%" stopColor="#787868"/><stop offset="100%" stopColor="#404030"/>
        </radialGradient>
        <radialGradient id="hBodyZombi" cx="28%" cy="22%" r="75%">
          <stop offset="0%" stopColor="#7A9A50"/><stop offset="30%" stopColor="#507030"/><stop offset="65%" stopColor="#304818"/><stop offset="100%" stopColor="#182408"/>
        </radialGradient>
        <radialGradient id="hBodyCanavar" cx="28%" cy="22%" r="75%">
          <stop offset="0%" stopColor="#C85030"/><stop offset="30%" stopColor="#983020"/><stop offset="65%" stopColor="#681810"/><stop offset="100%" stopColor="#380808"/>
        </radialGradient>
        {/* Yüz */}
        <radialGradient id="hFaceInsan" cx="35%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#FFE8C0"/><stop offset="48%" stopColor="#F5C868"/><stop offset="82%" stopColor="#D49530"/><stop offset="100%" stopColor="#B07828"/>
        </radialGradient>
        <radialGradient id="hFaceAyi" cx="35%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#C8A070"/><stop offset="48%" stopColor="#A07840"/><stop offset="82%" stopColor="#7A5528"/><stop offset="100%" stopColor="#5A3810"/>
        </radialGradient>
        <radialGradient id="hFaceUzayli" cx="35%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#A0FFC0"/><stop offset="45%" stopColor="#50D880"/><stop offset="80%" stopColor="#20A850"/><stop offset="100%" stopColor="#087030"/>
        </radialGradient>
        <radialGradient id="hFaceRobot" cx="35%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#90C8E8"/><stop offset="45%" stopColor="#5898C0"/><stop offset="80%" stopColor="#306898"/><stop offset="100%" stopColor="#184060"/>
        </radialGradient>
        <radialGradient id="hFaceIskelet" cx="35%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#F0EFE0"/><stop offset="45%" stopColor="#D8D7C0"/><stop offset="80%" stopColor="#B8B7A0"/><stop offset="100%" stopColor="#908F78"/>
        </radialGradient>
        <radialGradient id="hFaceZombi" cx="35%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#98B868"/><stop offset="45%" stopColor="#708840"/><stop offset="80%" stopColor="#486020"/><stop offset="100%" stopColor="#284010"/>
        </radialGradient>
        <radialGradient id="hFaceCanavar" cx="35%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#E07850"/><stop offset="45%" stopColor="#B84828"/><stop offset="80%" stopColor="#882010"/><stop offset="100%" stopColor="#500808"/>
        </radialGradient>
        {/* Parlama */}
        <radialGradient id="hShine" cx="22%" cy="18%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,.22)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
        <radialGradient id="hFaceShine" cx="28%" cy="18%" r="48%">
          <stop offset="0%" stopColor="rgba(255,255,255,.38)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
        <filter id="hDs"><feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,.45)"/></filter>
        <filter id="hDs2"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,.35)"/></filter>
      </defs>

      {/* TABAN */}
      <ellipse cx="100" cy="295" rx="44" ry="14" fill="url(#hBase)" filter="url(#hDs)"/>
      <ellipse cx="92" cy="289" rx="22" ry="5" fill="rgba(255,255,255,.05)"/>

      {/* GÖVDE */}
      <g transform={`translate(100,180) scale(${scX},${scY}) translate(-100,-180)`} style={{transition:"transform .1s"}}>

        {/* Alt (pantolon/vücut) */}
        <path d="M38 285 C26 240 28 185 38 155 C48 128 58 118 100 118 C142 118 152 128 162 155 C172 185 174 240 162 285 Z"
          fill={karakterId==="insan"?"#1E1E2E": karakterId==="ayi"?"#2A1A0A": karakterId==="uzayli"?"#0A1A10": karakterId==="robot"?"#0A1020": karakterId==="iskelet"?"#141418": karakterId==="zombi"?"#101808":"#1A0C08"}
          filter="url(#hDs)"/>

        {/* Gövde (üst) */}
        <path d="M32 240 C20 195 22 135 34 95 C44 62 56 45 100 45 C144 45 156 62 166 95 C178 135 180 195 168 240 Z"
          fill={`url(#hBody${karakterId==="insan"?"Insan":karakterId==="ayi"?"Ayi":karakterId==="uzayli"?"Uzayli":karakterId==="robot"?"Robot":karakterId==="iskelet"?"Iskelet":karakterId==="zombi"?"Zombi":"Canavar"})`}
          filter="url(#hDs)"/>
        <path d="M32 240 C20 195 22 135 34 95 C44 62 56 45 100 45 C144 45 156 62 166 95 C178 135 180 195 168 240 Z"
          fill="url(#hShine)"/>
        <path d="M32 240 C20 195 22 135 34 95 C44 62 56 45 100 45 C144 45 156 62 166 95 C178 135 180 195 168 240 Z"
          fill="none" stroke="rgba(0,0,0,.2)" strokeWidth="1.5"/>

        {/* Karaktere özel gövde detayları */}
        {karakterId === "insan"   && <InsanGovde isHit={isHit}/>}
        {karakterId === "ayi"     && <AyiGovde isHit={isHit}/>}
        {karakterId === "uzayli"  && <UzayliGovde isHit={isHit}/>}
        {karakterId === "robot"   && <RobotGovde isHit={isHit}/>}
        {karakterId === "iskelet" && <IskeletGovde isHit={isHit}/>}
        {karakterId === "zombi"   && <ZombiGovde isHit={isHit}/>}
        {karakterId === "canavar" && <CanavarGovde isHit={isHit}/>}

        {/* BOYUN */}
        <path d="M86 43 L89 26 L111 26 L114 43 C108 48 92 48 86 43Z"
          fill={karakterId==="ayi"?"#8A6040":karakterId==="robot"?"#3A5A7A":karakterId==="iskelet"?"#D8D8C0":karakterId==="uzayli"?"#1A5A30":karakterId==="zombi"?"#3A5020":karakterId==="canavar"?"#5A2010":"#C89040"}
          stroke="rgba(0,0,0,.14)" strokeWidth=".8"/>

        {/* BAŞ */}
        <ellipse cx="100" cy="16" rx="34" ry="20"
          fill={`url(#hFace${karakterId==="insan"?"Insan":karakterId==="ayi"?"Ayi":karakterId==="uzayli"?"Uzayli":karakterId==="robot"?"Robot":karakterId==="iskelet"?"Iskelet":karakterId==="zombi"?"Zombi":"Canavar"})`}
          filter="url(#hDs)"/>
        <ellipse cx="100" cy="16" rx="34" ry="20" fill="url(#hFaceShine)"/>
        <ellipse cx="100" cy="16" rx="34" ry="20" fill="none" stroke="rgba(0,0,0,.12)" strokeWidth="1"/>

        {/* Karaktere özel yüz */}
        {karakterId === "insan"   && <InsanYuz isHit={isHit} smile={smile}/>}
        {karakterId === "ayi"     && <AyiYuz isHit={isHit} smile={smile}/>}
        {karakterId === "uzayli"  && <UzayliYuz isHit={isHit} smile={smile}/>}
        {karakterId === "robot"   && <RobotYuz isHit={isHit} smile={smile}/>}
        {karakterId === "iskelet" && <IskeletYuz isHit={isHit} smile={smile}/>}
        {karakterId === "zombi"   && <ZombiYuz isHit={isHit} smile={smile}/>}
        {karakterId === "canavar" && <CanavarYuz isHit={isHit} smile={smile}/>}

        {/* ETİKET */}
        <BagLabel etiket={etiket} vurus={vurus}/>

      </g>

      {/* Zemin gölge */}
      <ellipse cx="100" cy="300" rx={isHit?30:38} ry={isHit?6:9}
        fill="rgba(0,0,0,.5)" style={{filter:"blur(4px)",transition:"all .1s"}}/>
    </svg>
  );
}

// ─── İNSAN ────────────────────────────────────────────────────────────────
function InsanGovde({isHit}:{isHit:boolean}) {
  return (
    <g>
      {/* Düğmeler */}
      {[140,165,190,215].map((y,i)=>(
        <g key={i}>
          <circle cx="100" cy={y} r="4.5" fill="white" opacity=".88" filter="url(#hDs2)"/>
          <circle cx="100" cy={y} r="4.5" fill="none" stroke="rgba(0,0,0,.2)" strokeWidth=".8"/>
          <ellipse cx="99" cy={y-1.5} rx="2.5" ry="1.5" fill="rgba(255,255,255,.3)"/>
        </g>
      ))}
      {/* Yaka */}
      <path d="M82 55 C88 48 94 44 100 43 C106 44 112 48 118 55 L110 62 L100 70 L90 62 Z"
        fill="#F0F0F0" filter="url(#hDs2)"/>
      <path d="M82 55 C88 48 94 44 100 43 C106 44 112 48 118 55 L110 62 L100 70 L90 62 Z"
        fill="none" stroke="rgba(0,0,0,.13)" strokeWidth="1"/>
    </g>
  );
}

function InsanYuz({isHit,smile}:{isHit:boolean;smile:number}) {
  return (
    <g>
      {/* Saç */}
      <ellipse cx="100" cy="-1" rx="32" ry="11" fill="#2A1400"/>
      {[["M76 -3 C74-12 80-16 82-7",3.5],["M87 -5 C86-14 93-16 93-7",3.5],["M107 -5 C108-14 115-14 113-6",3.2],["M118 -2 C120-11 126-9 123-2",3]].map(([d,sw],i)=>(
        <path key={i} d={d as string} stroke="#2A1400" strokeWidth={sw as number} strokeLinecap="round" fill="none"/>
      ))}
      {/* Kaşlar */}
      <path d={isHit?"M76 4 Q85 1 94 4":"M76 4 Q85 2 94 5"} stroke="#2A1400" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
      <path d={isHit?"M106 4 Q115 1 124 4":"M106 5 Q115 2 124 4"} stroke="#2A1400" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
      {/* Gözler */}
      {[82,118].map((ex,i)=>(
        <g key={i}>
          <ellipse cx={ex} cy="12" rx="8" ry={isHit?2.5:7} fill="white"/>
          <ellipse cx={ex} cy="12" rx="8" ry={isHit?2.5:7} stroke="rgba(0,0,0,.14)" strokeWidth=".8" fill="none"/>
          {!isHit&&<><circle cx={ex} cy="12" r="4.5" fill="#1E0E00"/><circle cx={ex+1.5} cy="9.5" r="1.8" fill="rgba(255,255,255,.9)"/><circle cx={ex-1} cy="14.5" r=".8" fill="rgba(255,255,255,.5)"/></>}
        </g>
      ))}
      {/* Burun */}
      <path d="M97 17 C94 21 94 23 97 23" stroke="rgba(160,90,20,.5)" strokeWidth="1.7" strokeLinecap="round" fill="none"/>
      <path d="M103 17 C106 21 106 23 103 23" stroke="rgba(160,90,20,.5)" strokeWidth="1.7" strokeLinecap="round" fill="none"/>
      <path d="M96 23 Q100 21 104 23" stroke="rgba(150,80,20,.45)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      {/* Yanaklar */}
      <ellipse cx="70" cy="17" rx="9" ry="6" fill={`rgba(220,100,80,${.18+smile*.2})`}/>
      <ellipse cx="130" cy="17" rx="9" ry="6" fill={`rgba(220,100,80,${.18+smile*.2})`}/>
      {/* Ağız */}
      {isHit
        ? <ellipse cx="100" cy="27" rx="6" ry="5" fill="#C03010"/>
        : <path d={`M${82-smile*3} ${26+smile*2} Q100 ${30+smile*8} ${118+smile*3} ${26+smile*2}`} stroke="#2A1200" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      }
      {smile>.2&&!isHit&&<path d={`M${84-smile*2} ${28+smile} Q100 ${30+smile*7} ${116+smile*2} ${28+smile}`} fill="white" opacity={Math.min(1,smile*1.5)}/>}
    </g>
  );
}

// ─── AYI ──────────────────────────────────────────────────────────────────
function AyiGovde({isHit}:{isHit:boolean}) {
  return (
    <g>
      {/* Kürk doku — yatay çizgiler */}
      {[95,115,135,155,175,195,215].map((y,i)=>(
        <path key={i} d={`M${40+i} ${y} Q100 ${y+4} ${160-i} ${y}`} fill="none" stroke="rgba(0,0,0,.12)" strokeWidth="2" strokeLinecap="round"/>
      ))}
      {/* Göbek beyaz kısım */}
      <ellipse cx="100" cy="175" rx="30" ry="38" fill="rgba(200,170,120,.25)"/>
    </g>
  );
}

function AyiYuz({isHit,smile}:{isHit:boolean;smile:number}) {
  return (
    <g>
      {/* Kulaklar */}
      <circle cx="68" cy="-6" r="12" fill="#7A5C38"/>
      <circle cx="132" cy="-6" r="12" fill="#7A5C38"/>
      <circle cx="68" cy="-6" r="7" fill="#5A3C20"/>
      <circle cx="132" cy="-6" r="7" fill="#5A3C20"/>
      {/* Yüz kürk */}
      <ellipse cx="100" cy="20" rx="28" ry="16" fill="rgba(180,130,80,.3)"/>
      {/* Kaşlar */}
      <path d={isHit?"M76 3 Q85 -1 94 3":"M76 4 Q85 2 94 5"} stroke="#4A2A0A" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d={isHit?"M106 3 Q115 -1 124 3":"M106 5 Q115 2 124 4"} stroke="#4A2A0A" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Gözler */}
      {[82,118].map((ex,i)=>(
        <g key={i}>
          <ellipse cx={ex} cy="11" rx="7.5" ry={isHit?2.5:6.5} fill="white"/>
          {!isHit&&<><circle cx={ex} cy="11" r="4.5" fill="#1A0A00"/><circle cx={ex+1.5} cy="8.5" r="1.8" fill="rgba(255,255,255,.9)"/></>}
        </g>
      ))}
      {/* Ayı burnu — büyük, oval, siyah */}
      <ellipse cx="100" cy="21" rx="11" ry="7" fill="#1A1A1A"/>
      <ellipse cx="100" cy="21" rx="11" ry="7" stroke="rgba(255,255,255,.06)" strokeWidth="1" fill="none"/>
      <ellipse cx="96" cy="18" rx="4" ry="2.5" fill="rgba(255,255,255,.15)"/>
      {/* Ağız */}
      <path d="M100 27 L100 32" stroke="#2A1400" strokeWidth="1.8" strokeLinecap="round"/>
      <path d={`M${88+smile*2} ${32+smile*2} Q100 ${36+smile*4} ${112-smile*2} ${32+smile*2}`} stroke="#2A1400" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Yanaklar */}
      <ellipse cx="72" cy="20" rx="9" ry="6" fill={`rgba(180,110,70,${.2+smile*.2})`}/>
      <ellipse cx="128" cy="20" rx="9" ry="6" fill={`rgba(180,110,70,${.2+smile*.2})`}/>
    </g>
  );
}

// ─── UZAYLI ──────────────────────────────────────────────────────────────
function UzayliGovde({isHit}:{isHit:boolean}) {
  return (
    <g>
      {/* Büyük gözler için hazırlık — gövde sade, ince */}
      {/* Gövde parlama çizgisi (enerji hattı) */}
      <path d="M100 55 L100 240" stroke="rgba(100,255,150,.15)" strokeWidth="2" strokeDasharray="6 4"/>
      {/* Gövde yan enerji izleri */}
      {[130,155,180,205].map((y,i)=>(
        <path key={i} d={`M${60+i*2} ${y} Q100 ${y+3} ${140-i*2} ${y}`} fill="none" stroke="rgba(80,255,130,.12)" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
    </g>
  );
}

function UzayliYuz({isHit,smile}:{isHit:boolean;smile:number}) {
  return (
    <g>
      {/* Kafa şişkin/oval — uzaylı tipik */}
      <ellipse cx="100" cy="10" rx="38" ry="23" fill="url(#hFaceUzayli)" opacity=".3"/>
      {/* Kaşlar yok, yerine ince anten */}
      <path d="M90 -14 C86 -24 80 -30 78 -26" stroke="#20C060" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="78" cy="-26" r="3" fill="#60FF90"/>
      <path d="M110 -14 C114 -24 120 -30 122 -26" stroke="#20C060" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="122" cy="-26" r="3" fill="#60FF90"/>
      {/* Devasa gözler */}
      {[76,124].map((ex,i)=>(
        <g key={i}>
          <ellipse cx={ex} cy="10" rx={isHit?14:13} ry={isHit?4:11} fill="#000A04"/>
          <ellipse cx={ex} cy="10" rx={isHit?14:13} ry={isHit?4:11} fill="none" stroke="#20D060" strokeWidth="1.5"/>
          {!isHit&&<>
            <ellipse cx={ex} cy="10" rx="8" ry="8" fill="#003020"/>
            <ellipse cx={ex} cy="10" rx="4" ry="4" fill="#00FF80" opacity=".8"/>
            <circle cx={ex+2} cy="6" r="2.5" fill="rgba(255,255,255,.7)"/>
            <ellipse cx={ex} cy="10" rx="9" ry="9" fill="none" stroke="rgba(0,255,100,.3)" strokeWidth="1"/>
          </>}
        </g>
      ))}
      {/* Küçük burun delikleri */}
      <ellipse cx="97" cy="22" rx="2" ry="1.5" fill="rgba(0,0,0,.4)"/>
      <ellipse cx="103" cy="22" rx="2" ry="1.5" fill="rgba(0,0,0,.4)"/>
      {/* İnce çizgi ağız */}
      {isHit
        ? <ellipse cx="100" cy="28" rx="8" ry="4" fill="#005020"/>
        : <path d={`M${84+smile*2} ${27+smile*2} Q100 ${30+smile*6} ${116-smile*2} ${27+smile*2}`} stroke="#10A040" strokeWidth="2" strokeLinecap="round" fill="none"/>
      }
    </g>
  );
}

// ─── ROBOT ────────────────────────────────────────────────────────────────
function RobotGovde({isHit}:{isHit:boolean}) {
  return (
    <g>
      {/* Panel çizgileri */}
      <rect x="70" y="95" width="60" height="40" rx="4" fill="rgba(0,0,0,.2)" stroke="rgba(100,200,255,.2)" strokeWidth="1"/>
      {/* LED panel */}
      {[[78,108],[88,108],[98,108],[108,108],[78,120],[88,120],[98,120],[108,120]].map(([lx,ly],i)=>(
        <circle key={i} cx={lx} cy={ly} r="2.5" fill={isHit?"#FF4040":i%3===0?"#00FF80":i%3===1?"#FF8C00":"#40C4FF"} opacity=".8"/>
      ))}
      {/* Gövde panel çizgileri */}
      {[145,170,195,220].map((y,i)=>(
        <line key={i} x1="50" y1={y} x2="150" y2={y} stroke="rgba(100,180,255,.12)" strokeWidth="1"/>
      ))}
      {/* Anten */}
      <line x1="100" y1="45" x2="100" y2="28" stroke="#5A8AB0" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="100" cy="26" r="5" fill="#40C4FF"/>
      <circle cx="100" cy="26" r="3" fill={isHit?"#FF4040":"#80E8FF"}/>
    </g>
  );
}

function RobotYuz({isHit,smile}:{isHit:boolean;smile:number}) {
  return (
    <g>
      {/* Kare baş çerçevesi */}
      <rect x="64" y="-6" width="72" height="42" rx="6" fill="none" stroke="rgba(100,180,255,.3)" strokeWidth="1.5"/>
      {/* Kaşlar — yatay LED bar */}
      <rect x="72" y="2" width="22" height="3" rx="1.5" fill={isHit?"#FF4040":"#40C4FF"} opacity=".9"/>
      <rect x="106" y="2" width="22" height="3" rx="1.5" fill={isHit?"#FF4040":"#40C4FF"} opacity=".9"/>
      {/* Gözler — kare ekran */}
      {[76,112].map((ex,i)=>(
        <g key={i}>
          <rect x={ex-9} y="6" width="18" height={isHit?6:16} rx="3" fill="#001830"/>
          <rect x={ex-9} y="6" width="18" height={isHit?6:16} rx="3" fill="none" stroke="#40C4FF" strokeWidth="1.2"/>
          {!isHit&&<>
            <rect x={ex-6} y="9" width="12" height="10" rx="2" fill="#0050A0" opacity=".7"/>
            <rect x={ex-4} y="10" width="8" height="7" rx="1" fill="#40C4FF" opacity=".5"/>
            <circle cx={ex} cy="14" r="3" fill="#80E8FF"/>
            <circle cx={ex+1} cy="11" r="1.5" fill="rgba(255,255,255,.8)"/>
          </>}
        </g>
      ))}
      {/* Burun — küçük sensorler */}
      <circle cx="97" cy="26" r="1.5" fill="#40C4FF" opacity=".6"/>
      <circle cx="103" cy="26" r="1.5" fill="#40C4FF" opacity=".6"/>
      {/* Ağız — LED bar */}
      {isHit
        ? <rect x="80" y="28" width="40" height="6" rx="3" fill="#FF4040"/>
        : <rect x={84-smile*6} y="28" width={32+smile*12} height="5" rx="2.5"
            fill={`rgba(64,196,255,${0.6+smile*0.4})`}/>
      }
      {/* Yüz panel viti köşeler */}
      {[[66,0],[130,0],[66,34],[130,34]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="2" fill="#305878" stroke="#40C4FF" strokeWidth=".8"/>
      ))}
    </g>
  );
}

// ─── İSKELET ──────────────────────────────────────────────────────────────
function IskeletGovde({isHit}:{isHit:boolean}) {
  return (
    <g>
      {/* Kaburga kemikleri */}
      {[100,122,144,166,188].map((y,i)=>(
        <g key={i}>
          <path d={`M65 ${y} C60 ${y-5} 58 ${y+5} 65 ${y+8}`} fill="none" stroke="rgba(220,220,200,.5)" strokeWidth="3" strokeLinecap="round"/>
          <path d={`M135 ${y} C140 ${y-5} 142 ${y+5} 135 ${y+8}`} fill="none" stroke="rgba(220,220,200,.5)" strokeWidth="3" strokeLinecap="round"/>
          {/* Merkez omurga */}
          <rect x="97" y={y-2} width="6" height="10" rx="2" fill="rgba(200,200,180,.4)"/>
        </g>
      ))}
      {/* Göğüs kemiği */}
      <rect x="95" y="95" width="10" height="100" rx="4" fill="rgba(220,220,200,.35)"/>
    </g>
  );
}

function IskeletYuz({isHit,smile}:{isHit:boolean;smile:number}) {
  return (
    <g>
      {/* Kafa şeklini belirt — hafif koyu kenar */}
      <ellipse cx="100" cy="14" rx="33" ry="19" fill="none" stroke="rgba(180,180,160,.3)" strokeWidth="1.5"/>
      {/* Göz çukurları */}
      {[80,120].map((ex,i)=>(
        <g key={i}>
          <ellipse cx={ex} cy="10" rx="11" ry={isHit?3:9} fill="rgba(0,0,0,.75)"/>
          <ellipse cx={ex} cy="10" rx="11" ry={isHit?3:9} fill="none" stroke="rgba(200,200,180,.3)" strokeWidth="1"/>
          {!isHit&&<>
            {/* Göz içi hafif ışık */}
            <ellipse cx={ex} cy="10" rx="5" ry="5" fill="rgba(255,255,220,.06)"/>
          </>}
        </g>
      ))}
      {/* Burun — boş üçgen */}
      <path d="M96 20 L100 25 L104 20 Z" fill="rgba(0,0,0,.6)" stroke="rgba(200,200,180,.25)" strokeWidth="1"/>
      {/* Diş ağız — iskelet dişleri */}
      {isHit
        ? <ellipse cx="100" cy="30" rx="14" ry="6" fill="rgba(0,0,0,.7)"/>
        : <>
            <path d={`M${74+smile*2} ${27} Q100 ${30+smile*5} ${126-smile*2} ${27}`} fill="rgba(0,0,0,.7)"/>
            {/* Diş çizgileri */}
            {[80,87,94,101,108,115,122].map((tx,i)=>(
              <line key={i} x1={tx} y1="27" x2={tx} y2={28+smile*4} stroke="rgba(220,220,200,.5)" strokeWidth="1.2"/>
            ))}
            <path d={`M${74+smile*2} ${27} Q100 ${30+smile*5} ${126-smile*2} ${27}`} fill="none" stroke="rgba(200,200,180,.4)" strokeWidth="1"/>
          </>
      }
      {/* Temporal kemik çizgileri */}
      <path d="M68 -2 C65 5 66 14 68 20" stroke="rgba(180,180,160,.2)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M132 -2 C135 5 134 14 132 20" stroke="rgba(180,180,160,.2)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </g>
  );
}

// ─── ZOMBİ ────────────────────────────────────────────────────────────────
function ZombiGovde({isHit}:{isHit:boolean}) {
  return (
    <g>
      {/* Yırtık kıyafet parçaları */}
      <path d="M50 110 L44 95 L56 102 Z" fill="rgba(40,60,20,.8)"/>
      <path d="M148 125 L155 112 L143 118 Z" fill="rgba(40,60,20,.8)"/>
      <path d="M46 180 L38 165 L52 172 Z" fill="rgba(40,60,20,.8)"/>
      <path d="M152 195 L160 182 L148 188 Z" fill="rgba(40,60,20,.8)"/>
      {/* Yara izleri */}
      <path d="M75 140 L85 135 L80 145 L90 140" stroke="rgba(180,40,20,.5)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M110 165 L120 160 L115 170 L125 165" stroke="rgba(180,40,20,.5)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Çürük lekeler */}
      {[[80,120],[115,145],[70,185],[130,200]].map(([lx,ly],i)=>(
        <ellipse key={i} cx={lx} cy={ly} rx="6" ry="4" fill="rgba(100,60,0,.3)"/>
      ))}
    </g>
  );
}

function ZombiYuz({isHit,smile}:{isHit:boolean;smile:number}) {
  return (
    <g>
      {/* Çürük saç */}
      <ellipse cx="100" cy="-2" rx="30" ry="10" fill="#1A2808"/>
      <path d="M72 -3 C70-10 76-13 78-6" stroke="#1A2808" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M85 -6 C83-13 90-15 90-7" stroke="#1A2808" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M115 -5 C117-12 122-11 120-5" stroke="#1A2808" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Kaşlar — inişli çıkışlı */}
      <path d={isHit?"M74 3 Q83 -1 92 5":"M74 5 Q80 1 92 7"} stroke="#1A2808" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d={isHit?"M108 5 Q117 -1 126 3":"M108 7 Q120 1 126 5"} stroke="#1A2808" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Gözler — ölü / sarımtrak */}
      {[81,119].map((ex,i)=>(
        <g key={i}>
          <ellipse cx={ex} cy="11" rx="8" ry={isHit?2.5:7} fill="#E8E0B0"/>
          <ellipse cx={ex} cy="11" rx="8" ry={isHit?2.5:7} stroke="rgba(0,0,0,.2)" strokeWidth=".8" fill="none"/>
          {!isHit&&<>
            <circle cx={ex} cy="11" r="4" fill="#606020"/>
            <circle cx={ex} cy="11" r="2" fill="#202000"/>
            <circle cx={ex+1.5} cy="8.5" r="1.5" fill="rgba(255,255,220,.6)"/>
          </>}
        </g>
      ))}
      {/* Burun — kemikli */}
      <path d="M97 17 C94 21 95 23 98 22" stroke="rgba(80,100,40,.7)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M103 17 C106 21 105 23 102 22" stroke="rgba(80,100,40,.7)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Çürük ağız */}
      {isHit
        ? <ellipse cx="100" cy="27" rx="8" ry="5" fill="#1A3010"/>
        : <path d={`M${80+smile*2} ${26+smile*2} Q100 ${30+smile*7} ${120-smile*2} ${26+smile*2}`} stroke="#1A3010" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      }
      {/* Kırık diş */}
      {!isHit&&<>
        <path d="M92 26 L92 31 L95 31 L95 26" fill="rgba(220,215,180,.8)"/>
        <path d="M105 26 L105 29 L108 31 L108 26" fill="rgba(220,215,180,.8)"/>
      </>}
      {/* Yara / çürük leke */}
      <ellipse cx="72" cy="12" rx="7" ry="5" fill="rgba(80,120,20,.3)"/>
      <ellipse cx="128" cy="16" rx="5" ry="4" fill="rgba(80,120,20,.25)"/>
    </g>
  );
}

// ─── CANAVAR ──────────────────────────────────────────────────────────────
function CanavarGovde({isHit}:{isHit:boolean}) {
  return (
    <g>
      {/* Pul/deri doku */}
      {[95,115,135,155,175,195,215].map((y,i)=>(
        <g key={i}>
          {[-24,-12,0,12,24].map((dx,j)=>(
            <path key={j}
              d={`M${100+dx-8} ${y} Q${100+dx} ${y-7} ${100+dx+8} ${y}`}
              fill="rgba(180,80,30,.2)" stroke="rgba(255,100,40,.15)" strokeWidth="1"/>
          ))}
        </g>
      ))}
      {/* Omuz dikenleri */}
      <path d="M38 95 L28 78 L42 88 Z" fill="#8A3010" stroke="#5A1808" strokeWidth="1"/>
      <path d="M32 115 L20 100 L36 110 Z" fill="#8A3010" stroke="#5A1808" strokeWidth="1"/>
      <path d="M162 95 L172 78 L158 88 Z" fill="#8A3010" stroke="#5A1808" strokeWidth="1"/>
      <path d="M168 115 L180 100 L164 110 Z" fill="#8A3010" stroke="#5A1808" strokeWidth="1"/>
      {/* Göğüs yarığı / güç izi */}
      <path d="M100 60 L100 230" stroke="rgba(255,120,40,.18)" strokeWidth="3" strokeLinecap="round"/>
    </g>
  );
}

function CanavarYuz({isHit,smile}:{isHit:boolean;smile:number}) {
  return (
    <g>
      {/* Boynuzlar — daha kısa, sivri */}
      <path d="M78 -3 C72-15 78-22 82-12 L84 -3 Z" fill="#5A1808"/>
      <path d="M122 -3 C128-15 122-22 118-12 L116 -3 Z" fill="#5A1808"/>
      <path d="M79 -4 C74-14 79-20 82-11" stroke="rgba(255,100,40,.3)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M121 -4 C126-14 121-20 118-11" stroke="rgba(255,100,40,.3)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Kaşlar — V, öfkeli */}
      <path d={isHit?"M70 4 Q80 -2 90 3":"M70 6 Q80 1 90 5"} stroke="#3A0808" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d={isHit?"M110 3 Q120 -2 130 4":"M110 5 Q120 1 130 6"} stroke="#3A0808" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      {/* Gözler — turuncu kor */}
      {[80,120].map((ex,i)=>(
        <g key={i}>
          <ellipse cx={ex} cy="12" rx="9" ry={isHit?3:8} fill="#1A0600"/>
          <ellipse cx={ex} cy="12" rx="9" ry={isHit?3:8} fill="none" stroke="#FF6020" strokeWidth="1.5"/>
          {!isHit&&<>
            <ellipse cx={ex} cy="12" rx="5" ry="6" fill="#AA2000"/>
            <ellipse cx={ex} cy="12" rx="2.5" ry="3" fill="#FF8030"/>
            <circle cx={ex+1.5} cy="8.5" r="1.8" fill="rgba(255,220,180,.6)"/>
            <ellipse cx={ex} cy="12" rx="6" ry="7" fill="none" stroke="rgba(255,100,20,.2)" strokeWidth="1"/>
          </>}
        </g>
      ))}
      {/* Burun — pul üstü */}
      <ellipse cx="100" cy="22" rx="7" ry="4.5" fill="#3A1008"/>
      <ellipse cx="98" cy="21" rx="2.5" ry="1.5" fill="rgba(255,120,60,.2)"/>
      {/* Diş dolu ağız */}
      {isHit
        ? <ellipse cx="100" cy="30" rx="12" ry="7" fill="#1A0600"/>
        : <>
            <path d={`M${72-smile*3} ${26+smile*2} Q100 ${32+smile*8} ${128+smile*3} ${26+smile*2}`} fill="#1A0600"/>
            {!isHit&&smile>.0&&[78,85,93,100,107,115,122].map((tx,i)=>(
              <path key={i} d={`M${tx-3} ${26+smile} L${tx} ${31+smile*5} L${tx+3} ${26+smile}`} fill="rgba(240,230,200,.9)" opacity={.6+smile*.4}/>
            ))}
          </>
      }
      {/* Pul desen yanak */}
      {[[68,16],[130,16]].map(([cx,cy],i)=>(
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx="10" ry="7" fill="rgba(180,60,20,.2)"/>
          <path d={`M${cx-5} ${cy} Q${cx} ${cy-5} ${cx+5} ${cy}`} fill="none" stroke="rgba(255,100,40,.2)" strokeWidth="1.5"/>
        </g>
      ))}
    </g>
  );
}

// ─── ETİKET ───────────────────────────────────────────────────────────────
function BagLabel({etiket,vurus}:{etiket:string;vurus:number}) {
  const text = etiket.length>14 ? etiket.slice(0,13)+"…" : etiket;
  return (
    <g transform="translate(100,105)">
      <rect x="-36" y="-13" width="72" height="26" rx="5" fill="rgba(0,0,0,.4)" transform="translate(2,3)"/>
      <rect x="-36" y="-13" width="72" height="26" rx="5" fill="rgba(8,14,30,.95)"/>
      <rect x="-36" y="-13" width="72" height="26" rx="5" fill="none" stroke="rgba(245,166,35,.68)" strokeWidth="1.4"/>
      <path d="M-36,-13 L-26,-13 L-36,-5 Z" fill="rgba(245,166,35,.2)"/>
      <text x="0" y="1" textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize="10" fontWeight="700" fontFamily="'Sora',sans-serif" letterSpacing=".04em">
        {text}
      </text>
    </g>
  );
}

// ─── ELDİVEN ──────────────────────────────────────────────────────────────
function GloveSVG() {
  return (
    <svg viewBox="0 0 64 56" fill="none" style={{width:"100%",height:"100%"}}>
      <defs>
        <radialGradient id="glv" cx="28%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#FF6858"/><stop offset="40%" stopColor="#E02020"/><stop offset="80%" stopColor="#AA0808"/><stop offset="100%" stopColor="#600000"/>
        </radialGradient>
        <radialGradient id="glvSh" cx="22%" cy="20%" r="52%">
          <stop offset="0%" stopColor="rgba(255,255,255,.38)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect x="15" y="37" width="30" height="17" rx="4" fill="url(#glv)"/>
      <rect x="15" y="37" width="30" height="8" rx="4" fill="white" opacity=".9"/>
      <rect x="15" y="42" width="30" height="3" fill="#DD2020"/>
      <path d="M8 37 C2 22 4 7 14 2 C21-2 40-2 48 3 C56 9 58 24 54 37 Z" fill="url(#glv)"/>
      <path d="M8 37 C2 22 4 7 14 2 C21-2 40-2 48 3 C56 9 58 24 54 37 Z" stroke="rgba(0,0,0,.2)" strokeWidth="1.2" fill="none"/>
      <ellipse cx="55" cy="14" rx="8.5" ry="5.5" transform="rotate(28 55 14)" fill="#CC1818"/>
      {[18,24,30,37].map((x,i)=><line key={i} x1={x} y1="2" x2={x-1} y2="15" stroke="rgba(0,0,0,.2)" strokeWidth="1.6" strokeLinecap="round"/>)}
      <ellipse cx="19" cy="13" rx="11" ry="7" fill="url(#glvSh)"/>
    </svg>
  );
}