"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";

type AnimTip = "yirt" | "kes" | "yak" | "uc";

const ANIM_SECENEKLER: { id: AnimTip; emoji: string; label: string; aciklama: string }[] = [
  { id: "yirt", emoji: "✂️", label: "Yırt",  aciklama: "Sürükle → yırt" },
  { id: "kes",  emoji: "🔪", label: "Kes",   aciklama: "Tıkla → kes"    },
  { id: "yak",  emoji: "🔥", label: "Yak",   aciklama: "Bas → yak"      },
  { id: "uc",   emoji: "💨", label: "Uçur",  aciklama: "Tıkla → uçur"   },
];

interface FormData { denemeAdi: string; net: string; }

export default function DenemeYirt() {
  const [form, setForm]         = useState<FormData>({ denemeAdi: "", net: "" });
  const [animTip, setAnimTip]   = useState<AnimTip>("yirt");
  const [phase, setPhase]       = useState<"form" | "ready" | "done">("form");
  const [isDragging, setIsDragging] = useState(false);
  const [yirtPath, setYirtPath]     = useState<{x:number;y:number}[]>([]);
  const [burnSpots, setBurnSpots]   = useState<{x:number;y:number;r:number;id:number}[]>([]);
  const [burnCounter, setBurnCounter] = useState(0);

  const paperRef     = useRef<HTMLDivElement>(null);
  const leftRef      = useRef<HTMLDivElement>(null);
  const rightRef     = useRef<HTMLDivElement>(null);
  const topRef       = useRef<HTMLDivElement>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const scissors     = useRef<HTMLDivElement>(null);
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const burnInterval = useRef<ReturnType<typeof setInterval>|null>(null);
  const burnPos      = useRef<{x:number;y:number}|null>(null);
  const splitY       = useRef<number|null>(null);
  const splitX       = useRef<number|null>(null);

  const formDolu = form.denemeAdi.trim().length > 0;

  function hazirla() {
    if (!formDolu) return;
    setPhase("ready");
    setYirtPath([]);
    setBurnSpots([]);
  }

  function sifirla() {
    setPhase("form");
    setForm({ denemeAdi: "", net: "" });
    setYirtPath([]);
    setBurnSpots([]);
    setIsDragging(false);
    splitY.current = null;
    splitX.current = null;
    // GSAP temizle
    if (leftRef.current)   gsap.set(leftRef.current,   { clearProps: "all" });
    if (rightRef.current)  gsap.set(rightRef.current,  { clearProps: "all" });
    if (topRef.current)    gsap.set(topRef.current,    { clearProps: "all" });
    if (bottomRef.current) gsap.set(bottomRef.current, { clearProps: "all" });
    if (paperRef.current)  gsap.set(paperRef.current,  { clearProps: "all" });
  }

  // ── KOORDINAT HESAPLA ────────────────────────────────────────────────────
  function getRelPos(e: React.MouseEvent | React.TouchEvent): {x:number;y:number} | null {
    const el = wrapperRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  // ══ YIRT ════════════════════════════════════════════════════════════════
  function onYirtStart(e: React.MouseEvent | React.TouchEvent) {
    if (phase !== "ready" || animTip !== "yirt") return;
    e.preventDefault();
    const pos = getRelPos(e);
    if (!pos) return;
    setIsDragging(true);
    setYirtPath([pos]);
  }

  function onYirtMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDragging || animTip !== "yirt") return;
    e.preventDefault();
    const pos = getRelPos(e);
    if (!pos) return;
    setYirtPath(p => [...p, pos]);
  }

  function onYirtEnd() {
    if (!isDragging) return;
    setIsDragging(false);
    if (yirtPath.length < 8) return;
    // Yırtığın ortalama Y'sini bul → yatay mı dikey mi?
    const avgX = yirtPath.reduce((s,p)=>s+p.x,0)/yirtPath.length;
    const avgY = yirtPath.reduce((s,p)=>s+p.y,0)/yirtPath.length;
    const dx = Math.abs(yirtPath[yirtPath.length-1].x - yirtPath[0].x);
    const dy = Math.abs(yirtPath[yirtPath.length-1].y - yirtPath[0].y);

    if (dy > dx) {
      // Dikey yırtık → sol/sağ
      splitX.current = avgX;
      animYirtDikeyGSAP(avgX);
    } else {
      // Yatay yırtık → üst/alt
      splitY.current = avgY;
      animYirtYatayGSAP(avgY);
    }
  }

  function animYirtDikeyGSAP(xPct: number) {
    const el = wrapperRef.current;
    if (!el || !leftRef.current || !rightRef.current) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const tl = gsap.timeline({ onComplete: () => setTimeout(() => setPhase("done"), 200) });
    // Sol yarı
    tl.to(leftRef.current, { x: -160, rotation: -28, y: 60, opacity: 0, duration: 0.9, ease: "power3.in" }, 0.1);
    // Sağ yarı
    tl.to(rightRef.current, { x: 160, rotation: 28, y: 40, opacity: 0, duration: 0.9, ease: "power3.in" }, 0.1);
  }

  function animYirtYatayGSAP(y: number) {
    if (!topRef.current || !bottomRef.current) return;
    const tl = gsap.timeline({ onComplete: () => setTimeout(() => setPhase("done"), 200) });
    tl.to(topRef.current,    { y: -180, rotation: -14, x: -30, opacity: 0, duration: 0.95, ease: "power3.in" }, 0.1);
    tl.to(bottomRef.current, { y:  180, rotation:  14, x:  30, opacity: 0, duration: 0.95, ease: "power3.in" }, 0.1);
  }

  // ══ KES ══════════════════════════════════════════════════════════════════
  function onKes(e: React.MouseEvent | React.TouchEvent) {
    if (phase !== "ready" || animTip !== "kes") return;
    const pos = getRelPos(e);
    if (!pos || !scissors.current || !wrapperRef.current) return;

    const w = wrapperRef.current.offsetWidth;
    const h = wrapperRef.current.offsetHeight;
    const isYatay = pos.y < h * 0.6; // Üst bölge → yatay kes

    // Makası konumlandır
    gsap.set(scissors.current, {
      display: "block",
      x: isYatay ? -60 : pos.x - 20,
      y: isYatay ? pos.y - 16 : -50,
      rotation: isYatay ? 0 : 90,
      opacity: 1,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        if (scissors.current) gsap.set(scissors.current, { display: "none" });
        if (isYatay) {
          splitY.current = pos.y;
          animYirtYatayGSAP(pos.y);
        } else {
          splitX.current = pos.x;
          animYirtDikeyGSAP(pos.x);
        }
      }
    });

    // Makas geçişi
    tl.to(scissors.current, {
      x: isYatay ? w + 60 : pos.x - 20,
      y: isYatay ? pos.y - 16 : h + 50,
      duration: 0.6,
      ease: "power2.inOut",
    });
  }

  // ══ YAK ══════════════════════════════════════════════════════════════════
  function onYakStart(e: React.MouseEvent | React.TouchEvent) {
    if (phase !== "ready" || animTip !== "yak") return;
    e.preventDefault();
    const pos = getRelPos(e);
    if (!pos) return;
    burnPos.current = pos;
    addBurnSpot(pos);
    burnInterval.current = setInterval(() => {
      if (burnPos.current) addBurnSpot(burnPos.current);
    }, 80);
  }

  function onYakMove(e: React.MouseEvent | React.TouchEvent) {
    if (animTip !== "yak" || !burnInterval.current) return;
    e.preventDefault();
    const pos = getRelPos(e);
    if (pos) burnPos.current = pos;
  }

  function onYakEnd() {
    if (burnInterval.current) { clearInterval(burnInterval.current); burnInterval.current = null; }
    // Yeterince yandı mı?
    setTimeout(() => {
      setBurnSpots(spots => {
        if (spots.length > 12) animYakGSAP();
        return spots;
      });
    }, 100);
  }

  function addBurnSpot(pos: {x:number;y:number}) {
    setBurnCounter(c => c + 1);
    setBurnSpots(prev => {
      const newSpot = {
        x: pos.x + (Math.random()-0.5)*22,
        y: pos.y + (Math.random()-0.5)*22,
        r: 14 + Math.random()*22,
        id: Date.now() + Math.random(),
      };
      // Mevcut spotları büyüt
      return [...prev.map(s => ({...s, r: Math.min(s.r + 1.8, 80)})), newSpot];
    });
  }

  function animYakGSAP() {
    if (!paperRef.current) return;
    const tl = gsap.timeline({ onComplete: () => setTimeout(() => setPhase("done"), 300) });
    tl.to(paperRef.current, { opacity: 0, scale: 0.88, y: 20, duration: 1.2, ease: "power2.in" });
  }

  // ══ UÇ ═══════════════════════════════════════════════════════════════════
  function onUc() {
    if (phase !== "ready" || animTip !== "uc") return;
    if (!paperRef.current) return;
    const tl = gsap.timeline({ onComplete: () => setTimeout(() => setPhase("done"), 150) });
    tl.to(paperRef.current, {
      y: -420, x: 60, rotation: 18, opacity: 0, scale: 0.7,
      duration: 0.85, ease: "power3.in",
    });
  }

  // ── GENEL POINTER HANDLER ────────────────────────────────────────────────
  function onPointerDown(e: React.MouseEvent | React.TouchEvent) {
    if (animTip === "yirt") onYirtStart(e);
    else if (animTip === "kes") onKes(e);
    else if (animTip === "yak") onYakStart(e);
    else if (animTip === "uc") onUc();
  }

  function onPointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (animTip === "yirt") onYirtMove(e);
    else if (animTip === "yak") onYakMove(e);
  }

  function onPointerUp() {
    if (animTip === "yirt") onYirtEnd();
    else if (animTip === "yak") onYakEnd();
  }

  useEffect(() => () => {
    if (burnInterval.current) clearInterval(burnInterval.current);
  }, []);

  // Yırtma çizgisi SVG path'i
  const yirtSvgPath = yirtPath.length > 1
    ? yirtPath.map((p,i) => `${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ")
    : "";

  // Kağıt yüksekliği için ref
  const paperH = paperRef.current?.offsetHeight || 520;
  const paperW = 340;

  // Split noktaları
  const sy = splitY.current ?? paperH / 2;
  const sx = splitX.current ?? paperW / 2;

  const cursor =
    animTip === "yirt" ? "crosshair" :
    animTip === "kes"  ? "none" :
    animTip === "yak"  ? "cell" :
    "pointer";

  return (
    <>
      <style>{`
        .dy-root{display:flex;flex-direction:column;align-items:center;padding:36px 20px 40px;width:100%;font-family:'Sora',sans-serif;}
        .dy-paper-wrap{position:relative;width:340px;flex-shrink:0;cursor:${cursor};}
        .dy-paper{width:340px;background:#fff;border-radius:3px;overflow:hidden;
          box-shadow:0 2px 0 rgba(255,255,255,.07) inset,0 24px 64px rgba(0,0,0,.75),0 8px 24px rgba(0,0,0,.5);
          font-family:'Times New Roman',serif;position:relative;}

        /* Animasyon seçici */
        .dy-anim-btn{display:flex;flex-direction:column;align-items:center;gap:3px;
          padding:10px 6px;border-radius:10px;cursor:pointer;
          border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);
          color:rgba(232,244,253,.55);font-family:'Sora',sans-serif;
          font-size:10px;font-weight:600;transition:all .15s;flex:1;}
        .dy-anim-btn:hover{background:rgba(255,255,255,.09);color:white;transform:translateY(-1px);}
        .dy-anim-btn.on{border-color:#f5a623;background:rgba(245,166,35,.12);color:#f5a623;}

        /* Input */
        .dy-input{width:100%;padding:8px 12px;border-radius:8px;
          border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);
          color:white;font-family:'Sora',sans-serif;font-size:13px;outline:none;
          transition:border-color .2s;}
        .dy-input:focus{border-color:#f5a623;}
        .dy-input::placeholder{color:rgba(232,244,253,.25);}

        /* Yırtık katmanlar */
        .dy-half{position:absolute;top:0;overflow:hidden;will-change:transform;}
        .dy-half-l{left:0;}
        .dy-half-r{right:0;}
        .dy-slice-t{position:absolute;left:0;top:0;overflow:hidden;will-change:transform;}
        .dy-slice-b{position:absolute;left:0;overflow:hidden;will-change:transform;}
        .dy-inner{position:absolute;top:0;width:340px;}

        /* Makas */
        .dy-scissors{position:absolute;font-size:28px;pointer-events:none;display:none;z-index:20;user-select:none;}

        /* İpucu */
        @keyframes hint{0%,100%{opacity:.5;transform:scale(1);}50%{opacity:1;transform:scale(1.04);}}
        .dy-hint{animation:hint 1.8s ease-in-out infinite;font-size:11.5px;
          color:rgba(232,244,253,.5);text-align:center;margin-bottom:14px;font-style:italic;}

        @keyframes doneIn{from{opacity:0;transform:scale(.85) translateY(14px);}to{opacity:1;transform:scale(1) translateY(0);}}
        .dy-done{animation:doneIn .45s cubic-bezier(.34,1.4,.64,1);text-align:center;padding:28px 20px;}

        @keyframes pulse{0%,100%{box-shadow:0 4px 20px rgba(229,57,53,.45);}50%{box-shadow:0 4px 34px rgba(229,57,53,.8);}}
      `}</style>

      <div className="dy-root">

        <div style={{fontSize:17,fontWeight:800,color:"white",marginBottom:4,letterSpacing:"-.02em"}}>📄 Deneme Yırt</div>
        <div style={{fontSize:11,color:"rgba(232,244,253,.35)",marginBottom:18,flexShrink:0}}>
          Denemenin adını ve netini gir, sonra istediğin gibi yok et.
        </div>

        {/* Form */}
        {phase === "form" && (
          <div style={{width:"100%",maxWidth:340,marginBottom:20,flexShrink:0}}>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:"rgba(232,244,253,.5)",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>
                Deneme Adı *
              </div>
              <input className="dy-input" value={form.denemeAdi} onChange={e=>setForm(f=>({...f,denemeAdi:e.target.value}))}
                placeholder="örn: TYT Deneme #5 – Acil Yayıncılık" maxLength={50}/>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:"rgba(232,244,253,.5)",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>
                Net / Puan
              </div>
              <input className="dy-input" value={form.net} onChange={e=>setForm(f=>({...f,net:e.target.value}))}
                placeholder="örn: 48.75 net / 312 puan" maxLength={30}/>
            </div>
          </div>
        )}

        {/* Animasyon seçici */}
        <div style={{display:"flex",gap:6,width:"100%",maxWidth:340,marginBottom:16,flexShrink:0}}>
          {ANIM_SECENEKLER.map(a=>(
            <button key={a.id} className={`dy-anim-btn${animTip===a.id?" on":""}`}
              onClick={()=>setAnimTip(a.id)} disabled={phase==="done"}>
              <span style={{fontSize:22}}>{a.emoji}</span>
              <span>{a.label}</span>
              <span style={{fontSize:9,opacity:.6}}>{a.aciklama}</span>
            </button>
          ))}
        </div>

        {/* İpucu */}
        {phase === "ready" && (
          <div className="dy-hint">
            {animTip==="yirt" && "✂️ Kağıt üzerinde sürükle → yırtık oluşur"}
            {animTip==="kes"  && "🔪 İstediğin noktaya tıkla → makas keser"}
            {animTip==="yak"  && "🔥 Kağıda bas ve sürükle → yakan alev"}
            {animTip==="uc"   && "💨 Kağıda tıkla → uçup gitsin"}
          </div>
        )}

        {/* KAĞIT */}
        {phase !== "done" && (
          <div
            ref={wrapperRef}
            className="dy-paper-wrap"
            style={{marginBottom:20,touchAction:"none"}}
            onMouseDown={phase==="ready"?onPointerDown:undefined}
            onMouseMove={phase==="ready"?onPointerMove:undefined}
            onMouseUp={phase==="ready"?onPointerUp:undefined}
            onMouseLeave={phase==="ready"?onPointerUp:undefined}
            onTouchStart={phase==="ready"?onPointerDown:undefined}
            onTouchMove={phase==="ready"?onPointerMove:undefined}
            onTouchEnd={phase==="ready"?onPointerUp:undefined}
          >
            {/* Yırt modu — dikey split (sol/sağ) */}
            {animTip==="yirt" && splitX.current !== null && (
              <>
                <div ref={leftRef} className="dy-half dy-half-l" style={{width:sx,height:paperH}}>
                  <div className="dy-inner"><KagitIcerik form={form}/></div>
                  <YirtikKenar dikey={true} right={true} h={paperH}/>
                </div>
                <div ref={rightRef} className="dy-half dy-half-r" style={{width:paperW-sx,height:paperH}}>
                  <div className="dy-inner" style={{right:0,left:"auto"}}><KagitIcerik form={form}/></div>
                  <YirtikKenar dikey={true} right={false} h={paperH}/>
                </div>
              </>
            )}

            {/* Yırt modu — yatay split (üst/alt) */}
            {animTip==="yirt" && splitY.current !== null && (
              <>
                <div ref={topRef} className="dy-slice-t" style={{width:paperW,height:sy}}>
                  <div className="dy-inner"><KagitIcerik form={form}/></div>
                  <YirtikKenar dikey={false} right={false} h={sy} w={paperW}/>
                </div>
                <div ref={bottomRef} className="dy-slice-b" style={{width:paperW,top:sy,height:paperH-sy}}>
                  <div className="dy-inner" style={{top:"auto",bottom:0}}><KagitIcerik form={form}/></div>
                  <YirtikKenar dikey={false} right={true} h={paperH-sy} w={paperW}/>
                </div>
              </>
            )}

            {/* Ana kağıt (yırt öncesi ve diğer modlar) */}
            {(animTip !== "yirt" || (splitX.current === null && splitY.current === null)) && (
              <div ref={paperRef}>
                <KagitIcerik form={form}/>

                {/* Yanma spotları */}
                {burnSpots.length > 0 && (
                  <svg style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:5}}
                    width={paperW} height={paperH}>
                    <defs>
                      <filter id="burnBlur">
                        <feGaussianBlur stdDeviation="3.5"/>
                      </filter>
                    </defs>
                    {burnSpots.map(s=>(
                      <g key={s.id}>
                        {/* Yanmış alan */}
                        <circle cx={s.x} cy={s.y} r={s.r} fill="rgba(0,0,0,.92)" filter="url(#burnBlur)"/>
                        {/* Kor halkası */}
                        <circle cx={s.x} cy={s.y} r={s.r*.7} fill="none"
                          stroke="rgba(255,120,0,.6)" strokeWidth="3" filter="url(#burnBlur)"/>
                        {/* Alov halkası */}
                        <circle cx={s.x} cy={s.y} r={s.r*.5} fill="none"
                          stroke="rgba(255,200,0,.4)" strokeWidth="2" filter="url(#burnBlur)"/>
                      </g>
                    ))}
                  </svg>
                )}
              </div>
            )}

            {/* Yırtık çizgisi (sürüklerken) */}
            {yirtPath.length > 1 && (splitX.current === null && splitY.current === null) && (
              <svg style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:10}}
                width={paperW} height={paperH}>
                <path d={yirtSvgPath} fill="none" stroke="rgba(0,0,0,.5)" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3"/>
                <path d={yirtSvgPath} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}

            {/* Makas */}
            <div ref={scissors} className="dy-scissors">✂️</div>

          </div>
        )}

        {/* Hazırla butonu */}
        {phase === "form" && (
          <button onClick={hazirla} disabled={!formDolu} style={{
            padding:"12px 32px",
            background:formDolu?"linear-gradient(135deg,#f5a623,#e08c10)":"rgba(255,255,255,.07)",
            color:formDolu?"#1a1a1a":"rgba(255,255,255,.22)",
            fontWeight:700,border:"none",borderRadius:10,cursor:formDolu?"pointer":"default",
            fontSize:13,fontFamily:"'Sora',sans-serif",
            boxShadow:formDolu?"0 4px 16px rgba(245,166,35,.35)":"none",transition:"all .2s",
          }}>Hazırla →</button>
        )}

        {/* Done */}
        {phase === "done" && (
          <div className="dy-done">
            <div style={{fontSize:56,marginBottom:10}}>
              {animTip==="yirt"?"💢":animTip==="kes"?"✂️":animTip==="yak"?"🔥":"💨"}
            </div>
            <div style={{fontSize:18,fontWeight:800,color:"white",marginBottom:6}}>
              İyi hissettirdi, değil mi?
            </div>
            <div style={{fontSize:12,color:"rgba(232,244,253,.45)",marginBottom:8,lineHeight:1.65}}>
              <span style={{fontWeight:700,color:"rgba(232,244,253,.7)"}}>"{form.denemeAdi}"</span>
              {form.net && <><br/><span style={{color:"#f5a623"}}>{form.net}</span> — geçti gitti.</>}
            </div>
            <div style={{fontSize:11,color:"rgba(232,244,253,.3)",marginBottom:22,lineHeight:1.6}}>
              O deneme bitti. Sen devam ediyorsun.
            </div>
            <button onClick={sifirla} style={{
              padding:"11px 26px",background:"linear-gradient(135deg,#f5a623,#e08c10)",
              color:"#1a1a1a",fontWeight:700,border:"none",borderRadius:9,
              cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif",
            }}>Yeni Deneme</button>
          </div>
        )}

      </div>
    </>
  );
}

// ─── YIRTIK KENAR ────────────────────────────────────────────────────────
function YirtikKenar({dikey,right,h,w=12}:{dikey:boolean;right:boolean;h:number;w?:number}) {
  if (dikey) {
    const pts = Array.from({length:20},(_,i)=>({
      y: (i/19)*h,
      x: 4+Math.sin(i*2.3+1)*5+Math.cos(i*1.7)*3,
    }));
    const d = pts.map((p,i)=>`${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ");
    return (
      <svg style={{position:"absolute",top:0,[right?"right":"left"]:-1,width:12,height:h,zIndex:10,pointerEvents:"none"}}
        viewBox={`0 0 12 ${h}`} preserveAspectRatio="none">
        {right
          ? <path d={`${d} L 12 ${h} L 12 0 Z`} fill="white" stroke="#bbb" strokeWidth=".8"/>
          : <path d={`${d} L 0 ${h} L 0 0 Z`} fill="white" stroke="#bbb" strokeWidth=".8"/>
        }
      </svg>
    );
  } else {
    const pts = Array.from({length:20},(_,i)=>({
      x: (i/19)*w,
      y: 4+Math.sin(i*2.1+.8)*5+Math.cos(i*1.5)*3,
    }));
    const d = pts.map((p,i)=>`${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ");
    return (
      <svg style={{position:"absolute",[right?"top":"bottom"]:-1,left:0,width:w,height:12,zIndex:10,pointerEvents:"none"}}
        viewBox={`0 0 ${w} 12`} preserveAspectRatio="none">
        {right
          ? <path d={`${d} L ${w} 12 L 0 12 Z`} fill="white" stroke="#bbb" strokeWidth=".8"/>
          : <path d={`${d} L ${w} 0 L 0 0 Z`} fill="white" stroke="#bbb" strokeWidth=".8"/>
        }
      </svg>
    );
  }
}

// ─── KAĞIT İÇERİĞİ ───────────────────────────────────────────────────────
function KagitIcerik({form}:{form:FormData}) {
  return (
    <div className="dy-paper">

      {/* Kırmızı üst bant */}
      <div style={{background:"#c0392b",padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{width:44,height:36,background:"white",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:8,fontWeight:800,color:"#c0392b",textAlign:"center",lineHeight:1.2,fontFamily:"'Sora',sans-serif",letterSpacing:.5}}>
          ÖSYM
        </div>
        <div style={{textAlign:"center",flex:1,padding:"0 8px"}}>
          <div style={{fontSize:7.5,fontWeight:700,color:"white",letterSpacing:.4,lineHeight:1.5}}>YÜKSEKÖĞRETİM KURUMLARI SINAVI</div>
          <div style={{fontSize:9,fontWeight:800,color:"white",letterSpacing:.3}}>TEMEL YETERLİLİK TESTİ (TYT)</div>
        </div>
        <div style={{width:44,height:36,background:"white",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:6.5,fontWeight:700,color:"#1565c0",textAlign:"center",lineHeight:1.3,fontFamily:"'Sora',sans-serif",padding:"2px"}}>
          T.C. MEB
        </div>
      </div>

      {/* Lacivert alt şerit */}
      <div style={{background:"#1565c0",padding:"4px 14px",textAlign:"center"}}>
        <div style={{fontSize:8,color:"white",fontWeight:600,fontFamily:"'Sora',sans-serif",letterSpacing:.3}}>
          DENEME SINAVI
        </div>
      </div>

      {/* Soru kitapçığı */}
      <div style={{background:"#f5f5f0",borderBottom:"1px solid #ddd",padding:"7px 14px"}}>
        <div style={{fontSize:7,fontWeight:700,color:"#444",letterSpacing:.3,marginBottom:4,fontFamily:"'Sora',sans-serif"}}>SORU KİTAPÇIĞI NUMARASI</div>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {["A","B","C","D"].map((l,i)=>(
            <div key={i} style={{width:22,height:22,border:"1.5px solid #555",borderRadius:2,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:10,fontWeight:700,color:"#333",background:"white"}}>{l}</div>
          ))}
          <div style={{flex:1,height:22,border:"1px solid #bbb",borderRadius:2,background:"white"}}/>
        </div>
      </div>

      {/* ÖRNEK damgası */}
      <div style={{position:"absolute",top:"32%",left:"50%",
        transform:"translate(-50%,-50%) rotate(-22deg)",
        fontSize:42,fontWeight:900,color:"rgba(180,30,30,.09)",letterSpacing:3,
        pointerEvents:"none",userSelect:"none",fontFamily:"'Sora',sans-serif",whiteSpace:"nowrap",zIndex:2}}>
        ÖRNEK
      </div>

      {/* Deneme adı + Net — büyük ve belirgin */}
      <div style={{padding:"14px 16px 10px",background:"white",borderBottom:"2px solid #1565c0"}}>
        <div style={{fontSize:7,fontWeight:700,color:"#888",letterSpacing:1,textTransform:"uppercase",fontFamily:"'Sora',sans-serif",marginBottom:4}}>
          Deneme Adı
        </div>
        <div style={{fontSize:15,fontWeight:800,color:"#1a1a1a",fontFamily:"'Sora',sans-serif",lineHeight:1.3,marginBottom:10,minHeight:20}}>
          {form.denemeAdi || <span style={{color:"#ccc",fontWeight:400,fontSize:13}}>—</span>}
        </div>
        {form.net && (
          <>
            <div style={{fontSize:7,fontWeight:700,color:"#888",letterSpacing:1,textTransform:"uppercase",fontFamily:"'Sora',sans-serif",marginBottom:4}}>
              Net / Puan
            </div>
            <div style={{fontSize:22,fontWeight:900,color:"#c0392b",fontFamily:"'Sora',sans-serif",letterSpacing:-.5}}>
              {form.net}
            </div>
          </>
        )}
      </div>

      {/* Form alanları */}
      <div style={{background:"white",padding:"10px 14px 6px"}}>
        {[["T.C. KİMLİK NUMARASI",""],["ADI",""],["SOYADI",""],].map(([l],i)=>(
          <div key={i} style={{marginBottom:8}}>
            <div style={{fontSize:7,fontWeight:700,color:"#555",letterSpacing:.3,fontFamily:"'Sora',sans-serif",marginBottom:2}}>{l}</div>
            <div style={{height:16,borderBottom:"1px solid #aaa"}}/>
          </div>
        ))}
        <div style={{display:"flex",gap:10}}>
          {["SALON NO","SIRA NO"].map((l,i)=>(
            <div key={i} style={{flex:1}}>
              <div style={{fontSize:7,fontWeight:700,color:"#555",letterSpacing:.3,fontFamily:"'Sora',sans-serif",marginBottom:2}}>{l}</div>
              <div style={{height:16,borderBottom:"1px solid #aaa"}}/>
            </div>
          ))}
        </div>
      </div>

      {/* Dikkat kutusu */}
      <div style={{padding:"8px 14px",background:"#fffef8",borderTop:"1px solid #eee"}}>
        <div style={{fontSize:8,fontWeight:800,color:"#c0392b",marginBottom:4,fontFamily:"'Sora',sans-serif"}}>ADAYIN DİKKATİNE:</div>
        {[
          "T.C. Kimlik Numaranızı, adınızı, soyadınızı ve salon/sıra numaranızı cevap kâğıdına yazdınız mı?",
          "Soru Kitapçığı Numaranızı cevap kâğıdında ilgili alana işaretlediniz mi?",
          "Bu sayfanın arkasında yer alan açıklamaları dikkatlice okudunuz mu?",
        ].map((m,i)=>(
          <div key={i} style={{display:"flex",gap:5,marginBottom:3}}>
            <span style={{fontSize:7.5,fontWeight:700,color:"#1565c0",flexShrink:0,fontFamily:"'Sora',sans-serif"}}>{i+1}.</span>
            <span style={{fontSize:7.5,color:"#444",lineHeight:1.5}}>{m}</span>
          </div>
        ))}
      </div>

      {/* İmza */}
      <div style={{padding:"6px 14px 12px",background:"white",borderTop:"1px solid #ddd",display:"flex",gap:10}}>
        {["Adayın İmzası:","Kitapçık Numarası:"].map((l,i)=>(
          <div key={i} style={{flex:1}}>
            <div style={{fontSize:7,color:"#666",marginBottom:3}}>{l}</div>
            <div style={{height:14,borderBottom:"1px solid #aaa"}}/>
          </div>
        ))}
      </div>

    </div>
  );
}