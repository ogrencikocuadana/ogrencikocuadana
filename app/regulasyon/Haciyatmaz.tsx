"use client";

import { useRef, useState, useCallback } from "react";

const MESAJLAR = [
  "Devril ama kalkmayı biliyorsun.",
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

function sesCaldir(ctx: AudioContext) {
  const now = ctx.currentTime;
  const t = ["pat","kut","bam","tok"][Math.floor(Math.random()*4)];
  if (t==="pat") {
    const b=ctx.createBuffer(1,ctx.sampleRate*.09,ctx.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
    const s=ctx.createBufferSource();s.buffer=b;
    const f=ctx.createBiquadFilter();f.type="bandpass";f.frequency.value=1600;
    const g=ctx.createGain();g.gain.setValueAtTime(1.1,now);g.gain.exponentialRampToValueAtTime(.001,now+.09);
    s.connect(f);f.connect(g);g.connect(ctx.destination);s.start(now);
  } else if (t==="kut") {
    const o=ctx.createOscillator();o.type="sine";
    o.frequency.setValueAtTime(140,now);o.frequency.exponentialRampToValueAtTime(35,now+.14);
    const g=ctx.createGain();g.gain.setValueAtTime(1.5,now);g.gain.exponentialRampToValueAtTime(.001,now+.2);
    o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+.22);
  } else if (t==="bam") {
    const o=ctx.createOscillator();o.type="triangle";
    o.frequency.setValueAtTime(80,now);o.frequency.exponentialRampToValueAtTime(22,now+.28);
    const g=ctx.createGain();g.gain.setValueAtTime(2,now);g.gain.exponentialRampToValueAtTime(.001,now+.32);
    o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+.35);
  } else {
    const o=ctx.createOscillator();o.type="square";
    o.frequency.setValueAtTime(200,now);o.frequency.exponentialRampToValueAtTime(55,now+.11);
    const g=ctx.createGain();g.gain.setValueAtTime(.8,now);g.gain.exponentialRampToValueAtTime(.001,now+.15);
    o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+.17);
  }
}

export default function Haciyatmaz() {
  const [vurus, setVurus]         = useState(0);
  const [mesaj, setMesaj]         = useState("");
  const [mesajKey, setMesajKey]   = useState(0);
  const [inputVal, setInputVal]   = useState("");
  const [etiket, setEtiket]       = useState("Bana İsim Ver");
  const [tilt, setTilt]           = useState(0);
  const [squish, setSquish]       = useState(false);
  const [animKey, setAnimKey]     = useState(0);
  const [fromLeft, setFromLeft]   = useState(true);
  const [mood, setMood]           = useState<"idle"|"hit"|"happy">("idle");

  const audioCtx = useRef<AudioContext|null>(null);
  const busy     = useRef(false);
  const timer    = useRef<ReturnType<typeof setTimeout>|null>(null);

  const vur = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext||(window as any).webkitAudioContext)();
    if (audioCtx.current.state==="suspended") audioCtx.current.resume();

    const n = vurus + 1;
    setVurus(n);
    setMesaj(MESAJLAR[Math.floor(Math.random()*MESAJLAR.length)]);
    setMesajKey(k=>k+1);

    const left = Math.random() > .5;
    const deg  = (14 + Math.random()*10) * (left ? 1 : -1);
    setFromLeft(left);
    setTilt(deg);
    setSquish(true);
    setMood("hit");
    setAnimKey(k=>k+1);
    sesCaldir(audioCtx.current);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(()=>{
      setSquish(false);
      setMood(n >= 4 ? "happy" : "idle");
      setTilt(deg * -.28);
      setTimeout(()=>{ setTilt(deg*.10); setTimeout(()=>{ setTilt(0); busy.current=false; },130); },150);
    },210);
  },[vurus]);

  function yapistir() {
    const v=inputVal.trim(); if(!v) return;
    setEtiket(v); setInputVal("");
  }
  function temizle() {
    setEtiket("Bana İsim Ver"); setVurus(0); setMesaj("");
    setTilt(0); setMood("idle"); busy.current=false;
  }

  const smile = Math.min(1, vurus/6);

  return (
    <>
      <style>{`
        .hc-root{display:flex;flex-direction:column;align-items:center;padding:52px 20px 40px;width:100%;font-family:'Sora',sans-serif;}
        .hc-scene{
          position:relative;width:320px;height:400px;border-radius:22px;overflow:hidden;
          cursor:pointer;user-select:none;
          box-shadow:0 2px 0 rgba(255,255,255,0.07) inset, 0 32px 80px rgba(0,0,0,.75), 0 8px 24px rgba(0,0,0,.5);
          margin-bottom:22px;
        }
        .hc-doll{
          position:absolute;bottom:28%;left:50%;
          transform-origin:50% 100%;
          transform:translateX(-50%) rotate(var(--t,0deg));
          transition:transform .2s cubic-bezier(.34,1.4,.64,1);
          filter:drop-shadow(0 16px 28px rgba(0,0,0,.65)) drop-shadow(0 4px 8px rgba(0,0,0,.4));
        }
        .hc-floor-shadow{
          position:absolute;bottom:26.5%;left:50%;
          width:88px;height:18px;
          transform:translateX(-50%);
          background:radial-gradient(ellipse,rgba(0,0,0,.55) 0%,transparent 70%);
          filter:blur(5px);
          transition:transform .2s ease,opacity .2s ease;
          pointer-events:none;
        }
        /* Eldiven */
        .hc-glove{position:absolute;bottom:46%;width:60px;height:52px;opacity:0;pointer-events:none;}
        .hc-glove-l{left:12%;}
        .hc-glove-r{right:12%;}
        @keyframes gL{
          0%  {opacity:0;transform:scale(.25) rotate(-35deg) translate(-30px,20px);}
          35% {opacity:1;transform:scale(1.12) rotate(-5deg) translate(0,0);}
          65% {opacity:1;transform:scale(1) rotate(0deg) translate(0,0);}
          100%{opacity:0;transform:scale(.45) rotate(12deg) translate(10px,-10px);}
        }
        @keyframes gR{
          0%  {opacity:0;transform:scaleX(-1) scale(.25) rotate(-35deg) translate(-30px,20px);}
          35% {opacity:1;transform:scaleX(-1) scale(1.12) rotate(-5deg) translate(0,0);}
          65% {opacity:1;transform:scaleX(-1) scale(1) rotate(0deg) translate(0,0);}
          100%{opacity:0;transform:scaleX(-1) scale(.45) rotate(12deg) translate(10px,-10px);}
        }
        .hc-glove-l.on{animation:gL .48s ease-out forwards;}
        .hc-glove-r.on{animation:gR .48s ease-out forwards;}
        /* Impact burst */
        @keyframes burst{
          0%  {opacity:1;transform:translate(-50%,-50%) scale(.15);}
          55% {opacity:.9;transform:translate(-50%,-50%) scale(1.25);}
          100%{opacity:0;transform:translate(-50%,-50%) scale(2);}
        }
        .hc-burst{
          position:absolute;width:64px;height:64px;border-radius:50%;pointer-events:none;
          animation:burst .38s ease-out forwards;
          background:radial-gradient(circle,rgba(255,230,80,.95) 0%,rgba(255,140,20,.6) 38%,transparent 68%);
        }
        /* Mesaj */
        @keyframes msgIn{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:translateY(0);}}
        .hc-msg{
          animation:msgIn .32s ease-out;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.08);
          border-radius:14px;padding:12px 18px;
          font-size:12px;color:rgba(232,244,253,.68);
          font-style:italic;text-align:center;line-height:1.65;
          max-width:300px;width:100%;min-height:46px;margin-bottom:16px;
        }
      `}</style>

      <div className="hc-root">
        <div style={{fontSize:17,fontWeight:800,marginBottom:4,color:"white",letterSpacing:"-.02em"}}>🥊 Hacıyatmaz</div>
        <div style={{fontSize:11,color:"rgba(232,244,253,.38)",marginBottom:14}}>Bana bir isim ver, sonra istediğin kadar vur.</div>

        <div style={{fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",
          color:vurus>0?"#f5a623":"rgba(232,244,253,.2)",marginBottom:12,transition:"color .3s"}}>
          {vurus===0?"Henüz vurmadın":`${vurus} vuruş`}
        </div>

        {mesaj && <div key={mesajKey} className="hc-msg">"{mesaj}"</div>}

        {/* ── SAHNE ── */}
        <div className="hc-scene" onClick={vur} style={{"--t":`${tilt}deg`} as React.CSSProperties}>

          {/* Oda */}
          <RoomBg />

          {/* Zemin gölgesi */}
          <div className="hc-floor-shadow" style={{
            transform:`translateX(calc(-50% + ${tilt*1.8}px)) scaleX(${squish?.72:1})`,
            opacity:squish?.45:.8,
          }}/>

          {/* Eldivenler */}
          <div key={`gl${animKey}`} className={`hc-glove hc-glove-l${fromLeft?" on":""}`}><GloveSVG/></div>
          <div key={`gr${animKey}`} className={`hc-glove hc-glove-r${!fromLeft?" on":""}`}><GloveSVG/></div>

          {/* Impact */}
          {squish && (
            <div key={`b${animKey}`} className="hc-burst"
              style={{bottom:"54%", left:fromLeft?"62%":"38%"}}/>
          )}

          {/* Hacıyatmaz */}
          <div className="hc-doll" style={{"--t":`${tilt}deg`} as React.CSSProperties}>
            <DollSVG smile={smile} squish={squish} mood={mood} etiket={etiket}/>
          </div>
        </div>

        {/* Input */}
        <div style={{display:"flex",gap:8,maxWidth:300,width:"100%",marginBottom:10}}>
          <input type="text" value={inputVal} onChange={e=>setInputVal(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&yapistir()} maxLength={16} placeholder="İsim ver..."
            style={{flex:1,padding:"10px 13px",borderRadius:9,border:"1px solid rgba(255,255,255,.1)",
              background:"rgba(255,255,255,.05)",color:"white",fontSize:12,
              fontFamily:"'Sora',sans-serif",outline:"none"}}/>
          <button onClick={yapistir}
            style={{padding:"10px 16px",background:"linear-gradient(135deg,#f5a623,#e08c10)",
              color:"#1a1a1a",fontWeight:700,border:"none",borderRadius:9,cursor:"pointer",
              fontSize:12,fontFamily:"'Sora',sans-serif",boxShadow:"0 4px 12px rgba(245,166,35,.3)"}}>
            Yapıştır
          </button>
        </div>
        <button onClick={temizle}
          style={{padding:"6px 14px",background:"transparent",color:"rgba(232,244,253,.25)",
            border:"1px solid rgba(232,244,253,.08)",borderRadius:7,cursor:"pointer",
            fontSize:11,fontFamily:"'Sora',sans-serif"}}>
          Sıfırla
        </button>
      </div>
    </>
  );
}

// ─── ODA ARKA PLAN ─────────────────────────────────────────────────────────
function RoomBg() {
  return (
    <svg viewBox="0 0 320 400" width="320" height="400" style={{position:"absolute",inset:0}}>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C1A0E"/>
          <stop offset="100%" stopColor="#1A0E06"/>
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3D2010"/>
          <stop offset="100%" stopColor="#1E0E05"/>
        </linearGradient>
        <radialGradient id="lamp" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="rgba(255,210,130,0.35)"/>
          <stop offset="60%" stopColor="rgba(255,180,80,0.08)"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
        <radialGradient id="floorLight" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="rgba(255,200,120,0.2)"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
        <linearGradient id="shelfWood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1A0A02"/>
          <stop offset="20%" stopColor="#2E1408"/>
          <stop offset="80%" stopColor="#261006"/>
          <stop offset="100%" stopColor="#120804"/>
        </linearGradient>
        <linearGradient id="plank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A1E08"/>
          <stop offset="100%" stopColor="#1A0C02"/>
        </linearGradient>
      </defs>

      {/* Duvar */}
      <rect width="320" height="400" fill="url(#wall)"/>

      {/* Tavan lambası ışığı */}
      <ellipse cx="160" cy="0" rx="200" ry="200" fill="url(#lamp)"/>

      {/* Zemin */}
      <rect y="270" width="320" height="130" fill="url(#floor)"/>
      {/* Parke çizgileri */}
      {Array.from({length:9},(_,i)=>(
        <line key={i} x1={i*40-20} y1="270" x2={i*40+30} y2="400" stroke="rgba(0,0,0,.22)" strokeWidth="1"/>
      ))}
      {[285,302,318,335,352,368,385].map((y,i)=>(
        <line key={i} x1="0" y1={y} x2="320" y2={y+3} stroke="rgba(255,255,255,.03)" strokeWidth="1"/>
      ))}
      {/* Zemin ışık yansıması */}
      <ellipse cx="160" cy="270" rx="120" ry="40" fill="url(#floorLight)"/>

      {/* Süpürgelik */}
      <rect y="266" width="320" height="7" fill="#2A1204"/>
      <rect y="271" width="320" height="2" fill="#1A0A00"/>

      {/* ── SOL KİTAPLIK ── */}
      <Shelf x={0} y={0} w={78} h={268}/>

      {/* ── SAĞ KİTAPLIK ── */}
      <Shelf x={242} y={0} w={78} h={268}/>

      {/* Orta tablo */}
      <rect x="126" y="18" width="68" height="52" rx="3" fill="#2A1408"/>
      <rect x="130" y="22" width="60" height="44" rx="2" fill="#8B6E42"/>
      {/* Tablo içeriği - manzara */}
      <rect x="130" y="22" width="60" height="28" rx="2" fill="#4A7A9B"/>
      <ellipse cx="145" cy="38" rx="10" ry="8" fill="#8B6E42" opacity=".7"/>
      <ellipse cx="175" cy="35" rx="14" ry="10" fill="#6B8A52" opacity=".8"/>
      <rect x="130" y="48" width="60" height="18" fill="#4A7A9B" opacity=".3"/>
      <rect x="128" y="20" width="64" height="48" rx="3" fill="none" stroke="#8B6E42" strokeWidth="3"/>
      {/* Tablo çerçeve köşe detayları */}
      {[[128,20],[188,20],[128,66],[188,66]].map(([cx2,cy2],i)=>(
        <circle key={i} cx={cx2} cy={cy2} r="2.5" fill="#C8A060"/>
      ))}
    </svg>
  );
}

function Shelf({x,y,w,h}:{x:number,y:number,w:number,h:number}) {
  const planks = [0,.22,.44,.66,.88];
  const books = [
    [{c:"#8B1A1A",w:9,h:36},{c:"#1A3A6B",w:11,h:42},{c:"#2E7D32",w:8,h:38},{c:"#6A1B9A",w:12,h:44},{c:"#E65100",w:10,h:40},{c:"#1565C0",w:9,h:35}],
    [{c:"#B71C1C",w:12,h:40},{c:"#0D47A1",w:9,h:36},{c:"#1B5E20",w:11,h:43},{c:"#4A148C",w:8,h:38},{c:"#BF360C",w:10,h:41},{c:"#006064",w:11,h:37}],
    [{c:"#880E4F",w:10,h:38},{c:"#1A237E",w:13,h:44},{c:"#33691E",w:9,h:36},{c:"#F57F17",w:11,h:42},{c:"#37474F",w:8,h:40},{c:"#4E342E",w:10,h:37}],
    [{c:"#C62828",w:11,h:42},{c:"#283593",w:9,h:38},{c:"#2E7D32",w:12,h:44},{c:"#6A1B9A",w:10,h:36},{c:"#E65100",w:8,h:40},{c:"#00695C",w:11,h:38}],
    [{c:"#AD1457",w:9,h:36},{c:"#1565C0",w:12,h:43},{c:"#558B2F",w:10,h:40},{c:"#4527A0",w:11,h:38},{c:"#D84315",w:8,h:42},{c:"#00838F",w:9,h:36}],
  ];

  return (
    <g>
      {/* Kitaplık gövdesi */}
      <rect x={x} y={y} width={w} height={h} fill="url(#shelfWood)"/>
      {x===0
        ? <rect x={x+w-3} y={y} width={3} height={h} fill="rgba(0,0,0,.5)"/>
        : <rect x={x} y={y} width={3} height={h} fill="rgba(0,0,0,.5)"/>
      }
      {/* Iç kenar parlama */}
      {x===0
        ? <rect x={x} y={y} width={2} height={h} fill="rgba(255,200,100,.06)"/>
        : <rect x={x+w-2} y={y} width={2} height={h} fill="rgba(255,200,100,.06)"/>
      }

      {planks.map((pct,ri)=>{
        const py = y + h*pct;
        const rowH = h * .2;
        const rowBooks = books[ri % books.length];
        let bx = x + 4;
        return (
          <g key={ri}>
            {/* Kitaplar */}
            {rowBooks.map((bk,bi)=>{
              const bLeft = bx;
              bx += bk.w + 1;
              if (bLeft + bk.w > x+w-4) return null;
              const bTop = py + rowH - 5 - bk.h;
              return (
                <g key={bi}>
                  <rect x={bLeft} y={bTop} width={bk.w} height={bk.h} rx="1"
                    fill={bk.c} opacity=".92"/>
                  {/* Kitap sırt gölgesi */}
                  <rect x={bLeft} y={bTop} width={2} height={bk.h} rx="1"
                    fill="rgba(0,0,0,.35)"/>
                  {/* Kitap üst parlama */}
                  <rect x={bLeft} y={bTop} width={bk.w} height={2} rx="1"
                    fill="rgba(255,255,255,.15)"/>
                  {/* Kitap sağ kenar */}
                  <rect x={bLeft+bk.w-2} y={bTop} width={2} height={bk.h}
                    fill="rgba(255,255,255,.06)"/>
                </g>
              );
            })}
            {/* Raf tahtası */}
            <rect x={x} y={py+rowH-5} width={w} height={5} fill="url(#plank)"/>
            <rect x={x} y={py+rowH-6} width={w} height={2} fill="rgba(255,200,100,.08)"/>
            <rect x={x} y={py+rowH} width={w} height={2} fill="rgba(0,0,0,.4)"/>
          </g>
        );
      })}
    </g>
  );
}

// ─── ELDİVEN SVG ──────────────────────────────────────────────────────────
function GloveSVG() {
  return (
    <svg viewBox="0 0 60 52" fill="none" style={{width:"100%",height:"100%"}}>
      <defs>
        <radialGradient id="g1" cx="30%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FF7070"/>
          <stop offset="45%" stopColor="#DD1818"/>
          <stop offset="100%" stopColor="#660000"/>
        </radialGradient>
        <radialGradient id="g2" cx="25%" cy="22%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,.38)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect x="14" y="36" width="30" height="14" rx="4" fill="url(#g1)"/>
      <rect x="14" y="36" width="30" height="7" rx="4" fill="white" opacity=".92"/>
      <rect x="14" y="39" width="30" height="3" fill="#DD2020"/>
      <path d="M8 36 C3 22 5 8 14 3 C20-1 36-1 42 4 C50 10 52 24 48 36Z" fill="url(#g1)"/>
      <path d="M8 36 C3 22 5 8 14 3 C20-1 36-1 42 4 C50 10 52 24 48 36Z" stroke="rgba(0,0,0,.18)" strokeWidth="1.2" fill="none"/>
      <ellipse cx="49" cy="14" rx="8" ry="5.5" transform="rotate(28 49 14)" fill="#CC1818"/>
      <ellipse cx="49" cy="14" rx="8" ry="5.5" transform="rotate(28 49 14)" stroke="rgba(0,0,0,.15)" strokeWidth="1" fill="none"/>
      {[18,24,30,36].map((lx,i)=>(
        <line key={i} x1={lx} y1="3" x2={lx-1} y2="16" stroke="rgba(0,0,0,.2)" strokeWidth="1.6" strokeLinecap="round"/>
      ))}
      <ellipse cx="18" cy="12" rx="10" ry="7" fill="url(#g2)"/>
    </svg>
  );
}

// ─── HACIYATMAZ ANA SVG ────────────────────────────────────────────────────
function DollSVG({smile,squish,mood,etiket}:{smile:number;squish:boolean;mood:string;etiket:string}) {
  const W = 130, H = 240;
  const scX = squish ? .88 : 1;
  const scY = squish ? 1.1 : 1;

  // Ağız path'i — gülüşe göre değişir
  const mouthY = 124 + smile*5;
  const mouthW = 10 + smile*10;
  const mouthD = smile > .15 ? smile*7 : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}
      style={{transform:`scale(${scX},${scY})`,transformOrigin:"50% 100%",transition:"transform .12s",overflow:"visible"}}>
      <defs>
        {/* ── Taban ── */}
        <radialGradient id="taban" cx="38%" cy="35%" r="68%">
          <stop offset="0%" stopColor="#303030"/>
          <stop offset="55%" stopColor="#181818"/>
          <stop offset="100%" stopColor="#060606"/>
        </radialGradient>
        {/* ── Pantolon ── */}
        <radialGradient id="pant" cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#2E2E3E"/>
          <stop offset="50%" stopColor="#18181E"/>
          <stop offset="100%" stopColor="#08080C"/>
        </radialGradient>
        {/* ── Ceket ana renk ── */}
        <radialGradient id="coat" cx="28%" cy="22%" r="75%">
          <stop offset="0%" stopColor="#FF7050"/>
          <stop offset="22%" stopColor="#E83828"/>
          <stop offset="55%" stopColor="#C21818"/>
          <stop offset="82%" stopColor="#8A0808"/>
          <stop offset="100%" stopColor="#500000"/>
        </radialGradient>
        {/* Ceket gölge (sağ taraf) */}
        <linearGradient id="coatShadow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="60%" stopColor="transparent"/>
          <stop offset="100%" stopColor="rgba(0,0,0,.28)"/>
        </linearGradient>
        {/* Ceket parlama (sol üst) */}
        <radialGradient id="coatShine" cx="22%" cy="18%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,.22)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
        {/* ── Yüz (ten) ── */}
        <radialGradient id="face" cx="36%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#FFE8C0"/>
          <stop offset="48%" stopColor="#F5C868"/>
          <stop offset="80%" stopColor="#D9A040"/>
          <stop offset="100%" stopColor="#B88030"/>
        </radialGradient>
        {/* Yüz alt gölge (çene) */}
        <radialGradient id="faceShadow" cx="50%" cy="90%" r="50%">
          <stop offset="0%" stopColor="rgba(160,100,20,.25)"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
        {/* Yüz parlama */}
        <radialGradient id="faceShine" cx="30%" cy="18%" r="48%">
          <stop offset="0%" stopColor="rgba(255,255,255,.42)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
        {/* Yaka (beyaz) */}
        <linearGradient id="collar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5F5F5"/>
          <stop offset="100%" stopColor="#D8D8D8"/>
        </linearGradient>
        {/* Göz beyazı */}
        <radialGradient id="eyeWhite" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="100%" stopColor="#E8E8EC"/>
        </radialGradient>
        {/* İris */}
        <radialGradient id="iris" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#4A3010"/>
          <stop offset="50%" stopColor="#2A1A08"/>
          <stop offset="100%" stopColor="#0A0604"/>
        </radialGradient>
        {/* Saç */}
        <radialGradient id="hair" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#3C2208"/>
          <stop offset="60%" stopColor="#1E1004"/>
          <stop offset="100%" stopColor="#0A0602"/>
        </radialGradient>
        <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,.45)"/>
        </filter>
        <filter id="ds2" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,.35)"/>
        </filter>
      </defs>

      {/* ━━━ TABAN (yarım daire, ağır) ━━━ */}
      <ellipse cx="65" cy="228" rx="42" ry="15" fill="url(#taban)" filter="url(#ds)"/>
      <ellipse cx="58" cy="222" rx="22" ry="6" fill="rgba(255,255,255,.06)"/>
      {/* Taban kenar şeridi */}
      <ellipse cx="65" cy="228" rx="42" ry="15" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1.5"/>

      {/* ━━━ PANTOLON (alt gövde) ━━━ */}
      <path d="M28 218 C18 175 20 130 30 100 C38 76 50 68 65 68 C80 68 92 76 100 100 C110 130 112 175 102 218 Z"
        fill="url(#pant)" filter="url(#ds)"/>
      {/* Pantolon dikiş çizgisi */}
      <line x1="65" y1="70" x2="65" y2="218" stroke="rgba(255,255,255,.07)" strokeWidth="1.5"/>
      {/* Pantolon kenar gölgesi */}
      <path d="M28 218 C18 175 20 130 30 100 C38 76 50 68 65 68 C80 68 92 76 100 100 C110 130 112 175 102 218 Z"
        fill="none" stroke="rgba(0,0,0,.3)" strokeWidth="1.5"/>

      {/* ━━━ CEKET (üst gövde - daha kısa) ━━━ */}
      <path d="M25 170 C15 130 18 80 30 50 C40 26 50 16 65 16 C80 16 90 26 100 50 C112 80 115 130 105 170 Z"
        fill="url(#coat)" filter="url(#ds)"/>
      {/* Ceket gölge katmanı */}
      <path d="M25 170 C15 130 18 80 30 50 C40 26 50 16 65 16 C80 16 90 26 100 50 C112 80 115 130 105 170 Z"
        fill="url(#coatShadow)"/>
      {/* Ceket parlama */}
      <path d="M25 170 C15 130 18 80 30 50 C40 26 50 16 65 16 C80 16 90 26 100 50 C112 80 115 130 105 170 Z"
        fill="url(#coatShine)"/>
      {/* Ceket kontur */}
      <path d="M25 170 C15 130 18 80 30 50 C40 26 50 16 65 16 C80 16 90 26 100 50 C112 80 115 130 105 170 Z"
        fill="none" stroke="rgba(0,0,0,.22)" strokeWidth="1.8"/>

      {/* Yaka çizgisi (V-neck) */}
      <path d="M50 52 L65 72 L80 52" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

      {/* ── YAKA (beyaz) ── */}
      <path d="M48 52 C52 46 58 42 65 40 C72 42 78 46 82 52 L75 58 L65 66 L55 58 Z"
        fill="url(#collar)" filter="url(#ds2)"/>
      <path d="M48 52 C52 46 58 42 65 40 C72 42 78 46 82 52 L75 58 L65 66 L55 58 Z"
        fill="none" stroke="rgba(0,0,0,.15)" strokeWidth="1"/>
      {/* Kravat ipucu */}
      <path d="M61 60 L65 80 L69 60 L65 56Z" fill="#1A1A2E" opacity=".6"/>

      {/* ── DÜĞMELER ── */}
      {[90,112,134,156].map((by,i)=>(
        <g key={i}>
          <circle cx="65" cy={by} r="4.5" fill="white" opacity=".9" filter="url(#ds2)"/>
          <circle cx="65" cy={by} r="4.5" fill="none" stroke="rgba(0,0,0,.22)" strokeWidth=".8"/>
          <circle cx="63.8" cy={by-.8} r="1.3" fill="rgba(0,0,0,.22)"/>
          <circle cx="66.2" cy={by+.8} r="1.3" fill="rgba(0,0,0,.22)"/>
          {/* Düğme parlama */}
          <ellipse cx="64" cy={by-1.5} rx="2.5" ry="1.5" fill="rgba(255,255,255,.35)"/>
        </g>
      ))}

      {/* ━━━ KOLLAR & ELLER ━━━ */}
      <Arm side="left"  squish={squish}/>
      <Arm side="right" squish={squish}/>

      {/* ━━━ BOYUN ━━━ */}
      <path d="M54 38 L56 22 L74 22 L76 38 C72 42 58 42 54 38Z"
        fill="#D4A050" stroke="rgba(0,0,0,.15)" strokeWidth=".8"/>
      {/* Boyun gölge */}
      <path d="M54 38 L56 22 L74 22 L76 38 C72 42 58 42 54 38Z"
        fill="rgba(0,0,0,.12)"/>

      {/* ━━━ BAŞ ━━━ */}
      {/* Baş gölgesi (altı daha koyu) */}
      <ellipse cx="65" cy="14" rx="30" ry="18" fill="url(#faceShadow)"/>
      {/* Ana yüz */}
      <ellipse cx="65" cy="14" rx="30" ry="18" fill="url(#face)" filter="url(#ds)"/>
      {/* Yüz parlama */}
      <ellipse cx="65" cy="14" rx="30" ry="18" fill="url(#faceShine)"/>
      {/* Yüz kontur */}
      <ellipse cx="65" cy="14" rx="30" ry="18" fill="none" stroke="rgba(0,0,0,.12)" strokeWidth="1"/>
      {/* Çene gölgesi */}
      <ellipse cx="65" cy="28" rx="16" ry="5" fill="rgba(160,90,20,.18)"/>

      {/* ━━━ SAÇLAR ━━━ */}
      {/* Saç kitlesi */}
      <ellipse cx="65" cy="-2" rx="28" ry="12" fill="url(#hair)"/>
      {/* Saç tutamları — kalın, yuvarlak */}
      {[
        ["M40 -4 C38-14 44-18 46-8",3.8],
        ["M50 -7 C49-17 56-20 56-9",3.8],
        ["M65 -8 C65-18 72-18 72-8",3.5],
        ["M75 -6 C77-16 83-13 80-4",3.2],
      ].map(([d,sw],i)=>(
        <path key={i} d={d as string} stroke="url(#hair)" strokeWidth={sw as number} strokeLinecap="round" fill="none"/>
      ))}
      {/* Saç parlama */}
      <ellipse cx="55" cy="-6" rx="12" ry="6" fill="rgba(255,255,255,.09)"/>

      {/* ━━━ KAŞLAR ━━━ */}
      <path
        d={squish ? "M44 3 Q53 -1 62 3" : mood==="happy" ? "M44 2 Q53 -2 62 2" : "M44 3 Q53 1 62 3"}
        stroke="#2A1400" strokeWidth="2.8" strokeLinecap="round" fill="none"
        style={{filter:"drop-shadow(0 1px 1px rgba(0,0,0,.3)"}}
      />
      <path
        d={squish ? "M68 3 Q77 -1 86 3" : mood==="happy" ? "M68 2 Q77 -2 86 2" : "M68 3 Q77 1 86 3"}
        stroke="#2A1400" strokeWidth="2.8" strokeLinecap="round" fill="none"
        style={{filter:"drop-shadow(0 1px 1px rgba(0,0,0,.3)"}}
      />

      {/* ━━━ GÖZLER ━━━ */}
      {/* Göz gölgesi */}
      <ellipse cx="50" cy="11" rx="9" ry="8" fill="rgba(0,0,0,.08)"/>
      <ellipse cx="80" cy="11" rx="9" ry="8" fill="rgba(0,0,0,.08)"/>
      {/* Göz beyazı */}
      <ellipse cx="50" cy="10" rx="8.5" ry={squish ? 3 : 7.5} fill="url(#eyeWhite)" filter="url(#ds2)"/>
      <ellipse cx="80" cy="10" rx="8.5" ry={squish ? 3 : 7.5} fill="url(#eyeWhite)" filter="url(#ds2)"/>
      <ellipse cx="50" cy="10" rx="8.5" ry={squish ? 3 : 7.5} fill="none" stroke="rgba(0,0,0,.15)" strokeWidth=".8"/>
      <ellipse cx="80" cy="10" rx="8.5" ry={squish ? 3 : 7.5} fill="none" stroke="rgba(0,0,0,.15)" strokeWidth=".8"/>
      {!squish && (
        <>
          {/* İris */}
          <circle cx="50" cy="10" r="5.5" fill="url(#iris)"/>
          <circle cx="80" cy="10" r="5.5" fill="url(#iris)"/>
          {/* Iris detay halkası */}
          <circle cx="50" cy="10" r="5.5" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
          <circle cx="80" cy="10" r="5.5" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
          {/* Göz bebeği */}
          <circle cx="51" cy="10" r="3.2" fill="#0A0604"/>
          <circle cx="81" cy="10" r="3.2" fill="#0A0604"/>
          {/* Göz parlaması (büyük) */}
          <circle cx="53" cy="7.5" r="2.0" fill="rgba(255,255,255,.92)"/>
          <circle cx="83" cy="7.5" r="2.0" fill="rgba(255,255,255,.92)"/>
          {/* Göz parlaması (küçük) */}
          <circle cx="49" cy="13" r=".9" fill="rgba(255,255,255,.55)"/>
          <circle cx="79" cy="13" r=".9" fill="rgba(255,255,255,.55)"/>
          {/* Alt göz kapağı gölgesi */}
          <ellipse cx="50" cy="17" rx="7" ry="2.5" fill="rgba(160,100,30,.15)"/>
          <ellipse cx="80" cy="17" rx="7" ry="2.5" fill="rgba(160,100,30,.15)"/>
        </>
      )}

      {/* ━━━ BURUN ━━━ */}
      {/* Burun köprüsü */}
      <path d="M63 12 C61 16 61 18 63 20" stroke="rgba(170,100,30,.5)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M67 12 C69 16 69 18 67 20" stroke="rgba(170,100,30,.5)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Burun alt çizgisi */}
      <path d="M61 20 Q65 18 69 20" stroke="rgba(160,90,20,.45)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Burun deliği */}
      <ellipse cx="62.5" cy="20.5" rx="1.8" ry="1.2" fill="rgba(0,0,0,.2)"/>
      <ellipse cx="67.5" cy="20.5" rx="1.8" ry="1.2" fill="rgba(0,0,0,.2)"/>

      {/* ━━━ YANAKLAR ━━━ */}
      <ellipse cx="36" cy="16" rx="9" ry="6.5" fill={`rgba(220,100,80,${.18+smile*.22})`}/>
      <ellipse cx="94" cy="16" rx="9" ry="6.5" fill={`rgba(220,100,80,${.18+smile*.22})`}/>
      {/* Yanak parlaması */}
      <ellipse cx="34" cy="14" rx="5" ry="3" fill={`rgba(255,200,180,${.12+smile*.12})`}/>
      <ellipse cx="92" cy="14" rx="5" ry="3" fill={`rgba(255,200,180,${.12+smile*.12})`}/>

      {/* ━━━ AĞIZ ━━━ */}
      {squish ? (
        /* Çarpma anı — "O" şekli ağız */
        <ellipse cx="65" cy={mouthY} rx="6" ry="5" fill="#C03010"/>
      ) : smile < .12 ? (
        /* Nötr gülümseme */
        <path d="M56 125 Q65 129 74 125" stroke="#2A1200" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      ) : (
        /* Gülüş — ne kadar vurulursa o kadar mutlu */
        <g>
          {/* Ağız dışı */}
          <path
            d={`M${55-smile*3} ${mouthY-mouthD*.5} Q65 ${mouthY+mouthD} ${75+smile*3} ${mouthY-mouthD*.5}`}
            stroke="#2A1200" strokeWidth="2.4" strokeLinecap="round" fill="none"
          />
          {/* Diş */}
          {smile > .2 && (
            <path
              d={`M${57-smile*2} ${mouthY-mouthD*.3} Q65 ${mouthY+mouthD*.8} ${73+smile*2} ${mouthY-mouthD*.3}`}
              fill="white" opacity={Math.min(1,smile*1.5)}
            />
          )}
          {/* Dil */}
          {smile > .6 && (
            <ellipse cx="65" cy={mouthY+mouthD*.5} rx={4+smile*2} ry={3}
              fill="#E05050" opacity={smile}/>
          )}
        </g>
      )}

      {/* ━━━ ETİKET ━━━ */}
      <g transform="translate(65,60)">
        {/* Gölge */}
        <rect x="-38" y="9" width="76" height="24" rx="6" fill="rgba(0,0,0,.4)"/>
        {/* Arka plan */}
        <rect x="-38" y="8" width="76" height="24" rx="6" fill="rgba(8,14,30,.96)"/>
        <rect x="-38" y="8" width="76" height="24" rx="6" fill="none" stroke="rgba(245,166,35,.7)" strokeWidth="1.5"/>
        {/* Köşe katlama */}
        <path d="M-38,8 L-38,18 L-28,8 Z" fill="rgba(245,166,35,.22)"/>
        {/* İnce üst çizgi */}
        <rect x="-38" y="8" width="76" height="2" rx="1" fill="rgba(245,166,35,.12)"/>
        {/* Metin */}
        <text x="0" y="21" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="10" fontWeight="700" fontFamily="'Sora',sans-serif"
          letterSpacing="0.04em">
          {etiket.length>13 ? etiket.slice(0,12)+"…" : etiket}
        </text>
      </g>

    </svg>
  );
}

// ─── KOL & EL ─────────────────────────────────────────────────────────────
function Arm({side,squish}:{side:"left"|"right";squish:boolean}) {
  const isL = side==="left";
  // Kol koordinatları
  const ax = isL ? 22 : 108;  // kol üst başlangıç
  const ex = isL ? 14 : 116;  // el merkezi x
  const ey = 148;              // el merkezi y

  return (
    <g filter="url(#ds2)">
      {/* Kol (ceket rengi) */}
      <path
        d={isL
          ? `M30 115 C16 120 10 130 ${ax} 145 L${ax+14} 152 C${ax+22} 138 ${ax+18} 126 38 118 Z`
          : `M100 115 C114 120 120 130 ${ax} 145 L${ax-14} 152 C${ax-22} 138 ${ax-18} 126 92 118 Z`
        }
        fill="url(#coat)"
      />
      {/* Kol parlama */}
      <path
        d={isL
          ? `M30 115 C16 120 10 130 ${ax} 145 L${ax+14} 152 C${ax+22} 138 ${ax+18} 126 38 118 Z`
          : `M100 115 C114 120 120 130 ${ax} 145 L${ax-14} 152 C${ax-22} 138 ${ax-18} 126 92 118 Z`
        }
        fill="url(#coatShine)"
      />

      {/* Manşet (kol ağzı — beyaz şerit) */}
      <ellipse cx={ex} cy={ey-4} rx="10" ry="6" fill="#F0F0F0"/>
      <ellipse cx={ex} cy={ey-4} rx="10" ry="6" fill="none" stroke="rgba(0,0,0,.15)" strokeWidth="1"/>

      {/* El (ten rengi, hacimli) */}
      <ellipse cx={ex} cy={ey+6} rx="11" ry="9"
        fill="#F0C870" filter="url(#ds2)"/>
      {/* El gradyanı */}
      <ellipse cx={ex} cy={ey+6} rx="11" ry="9" fill="url(#face)" opacity=".7"/>
      {/* El kontur */}
      <ellipse cx={ex} cy={ey+6} rx="11" ry="9" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="1"/>
      {/* Parmak çizgileri */}
      {[-5,0,5].map((dx,i)=>(
        <line key={i}
          x1={ex+dx} y1={ey+1}
          x2={ex+dx} y2={ey-5}
          stroke="rgba(0,0,0,.14)" strokeWidth="1.4" strokeLinecap="round"
        />
      ))}
      {/* El parlama */}
      <ellipse cx={ex-3} cy={ey+2} rx="5" ry="3" fill="rgba(255,255,255,.22)"/>
    </g>
  );
}