"use client";

import { useRef, useState, useEffect, useCallback, PointerEvent } from "react";

// ─── TİPLER ───────────────────────────────────────────────────────────────
type Arac = "kalem" | "firca" | "silgi";

interface Stroke {
  id: number;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: Arac;
}

interface StickerObj {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rot: number;
  scale: number;
  side: "left" | "right";
}

// ─── RENKLER ──────────────────────────────────────────────────────────────
const RENKLER = [
  "#1a1a1a", "#ffffff", "#e53935", "#f5a623",
  "#fdd835", "#43a047", "#1e88e5", "#8e24aa",
  "#00acc1", "#ff6f00", "#ad1457", "#546e7a",
];

// ─── STİCKERLAR ───────────────────────────────────────────────────────────
const STICKER_KATEGORILER = [
  {
    id: "hayvan", label: "Hayvanlar",
    emojiler: ["🐱","🐶","🦊","🐻","🐼","🐨","🦁","🐯","🐸","🐙","🦋","🐧","🦄","🐺","🦖"],
  },
  {
    id: "duygu", label: "Duygular",
    emojiler: ["😂","😭","😤","😍","🥹","😩","🤯","😎","🥺","😡","🤩","😴","🥴","😱","🤪"],
  },
  {
    id: "kalp", label: "Yıldız & Kalp",
    emojiler: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","⭐","🌟","✨","💫","🔥","💎","🎯"],
  },
];

// ─── ARAÇ BİLGİLERİ ───────────────────────────────────────────────────────
const ARAC_CONFIG: Record<Arac, { label: string; emoji: string; defaultWidth: number }> = {
  kalem: { label: "Kalem",  emoji: "✏️", defaultWidth: 2.5 },
  firca: { label: "Fırça",  emoji: "🖌️", defaultWidth: 14  },
  silgi: { label: "Silgi",  emoji: "🧹", defaultWidth: 22  },
};

let idSay = 0;
const uid = () => ++idSay;

export default function KaralamaDefteri() {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const overlayRef    = useRef<HTMLDivElement>(null);
  const isDrawing     = useRef(false);
  const currentStroke = useRef<Stroke | null>(null);
  const allStrokes    = useRef<Stroke[]>([]);

  const [arac, setArac]               = useState<Arac>("kalem");
  const [renk, setRenk]               = useState("#1a1a1a");
  const [stickers, setStickers]       = useState<StickerObj[]>([]);
  const [aktifKat, setAktifKat]       = useState<string | null>(null);
  const [dragSticker, setDragSticker] = useState<number | null>(null);
  const dragOffset = useRef<{dx:number;dy:number}>({dx:0,dy:0});

  const CANVAS_W = 340;
  const CANVAS_H = 480;

  // ── Canvas çiz ──────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    for (const stroke of allStrokes.current) {
      if (stroke.points.length < 2) continue;
      ctx.save();
      if (stroke.tool === "silgi") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else if (stroke.tool === "firca") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.55;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 1;
      }
      ctx.lineWidth   = stroke.width;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const mx = (stroke.points[i].x + stroke.points[i+1].x) / 2;
        const my = (stroke.points[i].y + stroke.points[i+1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, mx, my);
      }
      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
      ctx.restore();
    }
  }, []);

  // ── Pointer coords ───────────────────────────────────────────────────────
  function getCanvasPos(e: PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (e.clientY - rect.top)  * (CANVAS_H / rect.height),
    };
  }

  // ── Çizim olayları ───────────────────────────────────────────────────────
  function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    canvasRef.current?.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    const pos = getCanvasPos(e);
    const width = ARAC_CONFIG[arac].defaultWidth;
    currentStroke.current = {
      id: uid(), points: [pos],
      color: renk, width, tool: arac,
    };
    allStrokes.current.push(currentStroke.current);
  }

  function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || !currentStroke.current) return;
    const pos = getCanvasPos(e);
    currentStroke.current.points.push(pos);
    redraw();
  }

  function onPointerUp() {
    isDrawing.current = false;
    currentStroke.current = null;
  }

  // ── Temizle ──────────────────────────────────────────────────────────────
  function temizle() {
    allStrokes.current = [];
    redraw();
    setStickers([]);
  }

  // ── Geri al ──────────────────────────────────────────────────────────────
  function geriAl() {
    allStrokes.current = allStrokes.current.slice(0, -1);
    redraw();
  }

  // ── Sticker ekle ────────────────────────────────────────────────────────
  function stickerEkle(emoji: string) {
    const side = Math.random() > 0.5 ? "left" : "right";
    const s: StickerObj = {
      id: uid(), emoji,
      x: side === "left" ? 18 + Math.random() * 38 : CANVAS_W + 18 + Math.random() * 38,
      y: 40 + Math.random() * (CANVAS_H - 80),
      rot: (Math.random() - 0.5) * 34,
      scale: 0.85 + Math.random() * 0.55,
      side,
    };
    setStickers(p => [...p, s]);
    setAktifKat(null);
  }

  // ── Sticker sürükle ─────────────────────────────────────────────────────
  function onStickerPointerDown(e: React.PointerEvent, id: number) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragSticker(id);
    const s = stickers.find(s => s.id === id);
    if (!s || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    dragOffset.current = {
      dx: e.clientX - rect.left - s.x,
      dy: e.clientY - rect.top  - s.y,
    };
  }

  function onOverlayPointerMove(e: React.PointerEvent) {
    if (dragSticker === null || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const nx = e.clientX - rect.left - dragOffset.current.dx;
    const ny = e.clientY - rect.top  - dragOffset.current.dy;
    setStickers(p => p.map(s => s.id === dragSticker ? {...s, x: nx, y: ny} : s));
  }

  function onStickerPointerUp() { setDragSticker(null); }

  // ── İNDİR ──────────────────────────────────────────────────────────────
  async function indir() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Tüm alanı (canvas + sticker overlay) birleştiren canvas oluştur
    const out = document.createElement("canvas");
    out.width  = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    // Kraft arka plan
    ctx.fillStyle = "#C4935A";
    ctx.fillRect(0, 0, out.width, out.height);

    // Çizimler
    ctx.drawImage(canvas, 0, 0);

    // Stickerlları çiz (sadece canvas üzerindekiler)
    const overlay = overlayRef.current;
    if (overlay) {
      const rect = overlay.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      for (const s of stickers) {
        const relX = (s.x / overlay.offsetWidth) * out.width;
        const relY = (s.y / overlay.offsetHeight) * out.height;
        ctx.save();
        ctx.translate(relX, relY);
        ctx.rotate((s.rot * Math.PI) / 180);
        ctx.font = `${Math.round(32 * s.scale)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, 0, 0);
        ctx.restore();
      }
    }

    const link = document.createElement("a");
    link.download = "karalama-defteri.png";
    link.href = out.toDataURL("image/png");
    link.click();
  }

  // ── PAYLAŞ ──────────────────────────────────────────────────────────────
  async function paylas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const out = document.createElement("canvas");
    out.width  = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#C4935A";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);

    const overlay = overlayRef.current;
    if (overlay) {
      for (const s of stickers) {
        const relX = (s.x / overlay.offsetWidth) * out.width;
        const relY = (s.y / overlay.offsetHeight) * out.height;
        ctx.save();
        ctx.translate(relX, relY);
        ctx.rotate((s.rot * Math.PI) / 180);
        ctx.font = `${Math.round(32 * s.scale)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, 0, 0);
        ctx.restore();
      }
    }

    out.toBlob(async (blob) => {
      if (!blob) return;
      if (navigator.share && navigator.canShare({ files: [new File([blob], "karalama.png", { type: "image/png" })] })) {
        try {
          await navigator.share({
            title: "Karalama Defterim",
            files: [new File([blob], "karalama.png", { type: "image/png" })],
          });
        } catch {}
      } else {
        // Paylaşım desteklenmiyorsa indir
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "karalama-defteri.png";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, "image/png");
  }

  function stickerSil(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setStickers(p => p.filter(s => s.id !== id));
  }

  useEffect(() => { redraw(); }, [redraw]);

  const aktifAracWidth = ARAC_CONFIG[arac].defaultWidth;
  const cursorSize = arac === "silgi" ? 22 : arac === "firca" ? 14 : 3;

  return (
    <>
      <style>{`
        .kd-root{display:flex;flex-direction:column;align-items:center;padding:36px 20px 40px;width:100%;font-family:'Sora',sans-serif;}

        /* Araç butonu */
        .kd-tool-btn{
          display:flex;flex-direction:column;align-items:center;gap:3px;
          padding:8px 6px;border-radius:9px;cursor:pointer;
          border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);
          color:rgba(232,244,253,.5);font-family:'Sora',sans-serif;
          font-size:9px;font-weight:600;transition:all .15s;flex:1;
        }
        .kd-tool-btn:hover{background:rgba(255,255,255,.09);color:white;transform:translateY(-1px);}
        .kd-tool-btn.on{border-color:#f5a623;background:rgba(245,166,35,.13);color:#f5a623;}

        /* Renk nokta */
        .kd-color{width:22px;height:22px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .15s;flex-shrink:0;}
        .kd-color:hover{transform:scale(1.18);}
        .kd-color.on{border-color:white;transform:scale(1.22);}

        /* Sticker panel */
        .kd-sticker-btn{
          padding:7px 12px;border-radius:8px;cursor:pointer;
          border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);
          color:rgba(232,244,253,.6);font-family:'Sora',sans-serif;
          font-size:10px;font-weight:600;transition:all .15s;
        }
        .kd-sticker-btn:hover{background:rgba(255,255,255,.09);color:white;}
        .kd-sticker-btn.on{border-color:#f5a623;background:rgba(245,166,35,.13);color:#f5a623;}
        .kd-sticker-grid{
          display:flex;flex-wrap:wrap;gap:4px;padding:10px;
          background:rgba(20,30,50,.95);border-radius:12px;
          border:1px solid rgba(255,255,255,.08);
          max-width:340px;
        }
        .kd-sticker-item{
          font-size:24px;cursor:pointer;padding:4px;border-radius:7px;
          transition:transform .12s;user-select:none;
        }
        .kd-sticker-item:hover{transform:scale(1.28);}

        /* Defter gölgesi */
        .kd-notebook-shadow{
          filter: drop-shadow(0 24px 40px rgba(0,0,0,.8)) drop-shadow(0 8px 16px rgba(0,0,0,.6));
        }

        /* Sticker üzeri */
        .kd-sticker-obj{
          position:absolute;font-size:32px;cursor:grab;user-select:none;
          touch-action:none;transition:filter .15s;
          filter: drop-shadow(2px 3px 4px rgba(0,0,0,.35));
        }
        .kd-sticker-obj:hover .kd-del{opacity:1;}
        .kd-sticker-obj:active{cursor:grabbing;}
        .kd-del{
          position:absolute;top:-8px;right:-8px;width:16px;height:16px;
          background:#e53935;border-radius:50%;border:none;cursor:pointer;
          font-size:9px;color:white;display:flex;align-items:center;justify-content:center;
          opacity:0;transition:opacity .15s;font-weight:700;line-height:1;
        }

        @keyframes stickerIn{from{opacity:0;transform:scale(.4) rotate(20deg);}to{opacity:1;transform:scale(1) rotate(0deg);}}
      `}</style>

      <div className="kd-root">

        <div style={{fontSize:17,fontWeight:800,color:"white",marginBottom:4,letterSpacing:"-.02em"}}>
          📓 Karalama Defteri
        </div>
        <div style={{fontSize:11,color:"rgba(232,244,253,.35)",marginBottom:16,flexShrink:0}}>
          Çiz, karalamala, sticker yapıştır — tamamen senin.
        </div>

        {/* ── ARAÇLAR + RENKLER ── */}
        <div style={{width:"100%",maxWidth:460,marginBottom:12,flexShrink:0}}>

          {/* Araçlar */}
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {(Object.keys(ARAC_CONFIG) as Arac[]).map(a => (
              <button key={a} className={`kd-tool-btn${arac===a?" on":""}`} onClick={() => setArac(a)}>
                <span style={{fontSize:20}}>{ARAC_CONFIG[a].emoji}</span>
                {ARAC_CONFIG[a].label}
              </button>
            ))}
            {/* Geri Al */}
            <button className="kd-tool-btn" onClick={geriAl} title="Geri Al">
              <span style={{fontSize:20}}>↩️</span>
              Geri Al
            </button>
            {/* Temizle */}
            <button className="kd-tool-btn" onClick={temizle} title="Temizle">
              <span style={{fontSize:20}}>🗑️</span>
              Temizle
            </button>
          </div>

          {/* Renk Paleti */}
          <div style={{display:"flex",flexWrap:"wrap",gap:7,padding:"10px 12px",
            background:"rgba(255,255,255,.04)",borderRadius:10,
            border:"1px solid rgba(255,255,255,.07)"}}>
            {RENKLER.map(r => (
              <div key={r} className={`kd-color${renk===r?" on":""}`}
                style={{background: r, boxShadow: r==="#ffffff"?"inset 0 0 0 1px rgba(0,0,0,.2)":"none"}}
                onClick={() => { setRenk(r); if (arac === "silgi") setArac("kalem"); }}
              />
            ))}
            {/* Özel renk */}
            <div style={{position:"relative",width:22,height:22,flexShrink:0}}>
              <div style={{
                width:22,height:22,borderRadius:"50%",cursor:"pointer",
                background:"conic-gradient(red,yellow,lime,cyan,blue,magenta,red)",
                border: !RENKLER.includes(renk) ? "2px solid white" : "2px solid transparent",
                transform: !RENKLER.includes(renk) ? "scale(1.22)" : "scale(1)",
                transition:"all .15s",
              }}/>
              <input type="color" value={renk}
                onChange={e => { setRenk(e.target.value); if (arac==="silgi") setArac("kalem"); }}
                style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
            </div>
          </div>
        </div>

        {/* ── STİCKER PANELİ ── */}
        <div style={{width:"100%",maxWidth:460,marginBottom:14,flexShrink:0}}>
          <div style={{display:"flex",gap:6,marginBottom:aktifKat?8:0}}>
            {STICKER_KATEGORILER.map(k => (
              <button key={k.id}
                className={`kd-sticker-btn${aktifKat===k.id?" on":""}`}
                onClick={() => setAktifKat(aktifKat===k.id?null:k.id)}>
                {k.emojiler[0]} {k.label}
              </button>
            ))}
          </div>
          {aktifKat && (
            <div className="kd-sticker-grid">
              {STICKER_KATEGORILER.find(k=>k.id===aktifKat)?.emojiler.map(e => (
                <div key={e} className="kd-sticker-item" onClick={() => stickerEkle(e)}>{e}</div>
              ))}
            </div>
          )}
        </div>

        {/* ── DEFTER + KENAR STİCKERLAR ── */}
        <div className="kd-notebook-shadow" style={{
          display:"flex",alignItems:"flex-start",gap:0,
          position:"relative",flexShrink:0,
        }}>

          {/* Sol kenar */}
          <SidePanel side="left" width={72}/>

          {/* DEFTER ANA GÖVDE */}
          <div style={{position:"relative",flexShrink:0}}>

            {/* Spiral cilt */}
            <div style={{
              position:"absolute",left:-18,top:0,bottom:0,width:18,
              display:"flex",flexDirection:"column",justifyContent:"space-evenly",
              alignItems:"center",zIndex:20,pointerEvents:"none",
            }}>
              {Array.from({length:20}).map((_,i) => (
                <div key={i} style={{
                  width:14,height:14,borderRadius:"50%",
                  border:"2.5px solid #8B6914",
                  background:"linear-gradient(135deg,#D4A820 0%,#8B6914 60%,#5A3D08 100%)",
                  boxShadow:"1px 1px 3px rgba(0,0,0,.5),-1px -1px 2px rgba(255,200,80,.15)",
                }}/>
              ))}
            </div>

            {/* Kraft kağıt arka plan */}
            <div style={{
              width:CANVAS_W,
              background:"#C4935A",
              position:"relative",
              overflow:"hidden",
            }}>
              {/* Kraft doku */}
              <svg style={{position:"absolute",inset:0,opacity:.18,pointerEvents:"none"}}
                width={CANVAS_W} height={CANVAS_H}>
                <filter id="noise">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
                  <feColorMatrix type="saturate" values="0"/>
                </filter>
                <rect width="100%" height="100%" filter="url(#noise)" opacity="1"/>
              </svg>

              {/* Kraft renk gradyan katmanları */}
              <div style={{
                position:"absolute",inset:0,pointerEvents:"none",
                background:"linear-gradient(160deg,rgba(210,160,80,.4) 0%,transparent 45%,rgba(100,55,15,.3) 100%)",
              }}/>
              <div style={{
                position:"absolute",inset:0,pointerEvents:"none",
                background:"radial-gradient(ellipse at 30% 20%,rgba(255,210,120,.2) 0%,transparent 60%)",
              }}/>

              {/* Sayfa kenar gölgesi (sol) */}
              <div style={{position:"absolute",top:0,left:0,bottom:0,width:12,pointerEvents:"none",
                background:"linear-gradient(to right,rgba(0,0,0,.18),transparent)",zIndex:1}}/>
              {/* Sayfa kenar gölgesi (sağ) */}
              <div style={{position:"absolute",top:0,right:0,bottom:0,width:8,pointerEvents:"none",
                background:"linear-gradient(to left,rgba(0,0,0,.12),transparent)",zIndex:1}}/>

              {/* Canvas — çizim alanı */}
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                style={{
                  display:"block",position:"relative",zIndex:2,
                  cursor: arac==="silgi"
                    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect x='2' y='2' width='20' height='20' rx='4' fill='rgba(255,220,180,.8)' stroke='%23888' stroke-width='1.5'/%3E%3C/svg%3E") 12 12, crosshair`
                    : arac==="firca"
                    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='8' fill='${encodeURIComponent(renk)}' opacity='.6'/%3E%3C/svg%3E") 10 10, crosshair`
                    : "crosshair",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              />
            </div>
          </div>

          {/* Sağ kenar */}
          <SidePanel side="right" width={72}/>

          {/* STİCKER katmanı — tüm alanı kaplıyor */}
          <div
            ref={overlayRef}
            style={{
              position:"absolute",inset:0,
              pointerEvents: dragSticker !== null ? "all" : "none",
              zIndex:30,
            }}
            onPointerMove={onOverlayPointerMove}
            onPointerUp={onStickerPointerUp}
          >
            {stickers.map(s => (
              <div
                key={s.id}
                className="kd-sticker-obj"
                style={{
                  left: s.x,
                  top:  s.y,
                  transform:`translate(-50%,-50%) rotate(${s.rot}deg) scale(${s.scale})`,
                  pointerEvents:"all",
                  animation: "stickerIn .25s cubic-bezier(.34,1.5,.64,1)",
                  zIndex: dragSticker===s.id ? 50 : 31,
                }}
                onPointerDown={e => onStickerPointerDown(e, s.id)}
              >
                {s.emoji}
                <button className="kd-del"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => stickerSil(s.id, e)}>×</button>
              </div>
            ))}
          </div>

        </div>

        {/* Sticker ipucu */}
        <div style={{
          marginTop:12,display:"flex",alignItems:"center",gap:6,
          background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.07)",
          borderRadius:8,padding:"6px 12px",flexShrink:0,
        }}>
          <span style={{fontSize:14}}>👆</span>
          <span style={{fontSize:10,color:"rgba(232,244,253,.45)"}}>
            Stickerlara bas, sürükle • × ile sil
          </span>
        </div>

        {/* İndir & Paylaş */}
        <div style={{display:"flex",gap:8,marginTop:14,flexShrink:0}}>
          <button onClick={indir} style={{
            display:"flex",alignItems:"center",gap:7,
            padding:"10px 20px",borderRadius:10,cursor:"pointer",border:"none",
            background:"linear-gradient(135deg,#f5a623,#e08c10)",
            color:"#1a1a1a",fontWeight:700,fontSize:12,fontFamily:"'Sora',sans-serif",
            boxShadow:"0 4px 14px rgba(245,166,35,.35)",transition:"all .18s",
          }}>
            <span style={{fontSize:16}}>⬇️</span> İndir
          </button>
          <button onClick={paylas} style={{
            display:"flex",alignItems:"center",gap:7,
            padding:"10px 20px",borderRadius:10,cursor:"pointer",
            border:"1.5px solid rgba(255,255,255,.12)",
            background:"rgba(255,255,255,.06)",
            color:"white",fontWeight:700,fontSize:12,fontFamily:"'Sora',sans-serif",
            transition:"all .18s",
          }}>
            <span style={{fontSize:16}}>📤</span> Paylaş
          </button>
        </div>

      </div>
    </>
  );
}

// ─── YAN PANEL (kraft kenar) ──────────────────────────────────────────────
function SidePanel({ side, width }: { side: "left" | "right"; width: number }) {
  return (
    <div style={{
      width,
      height: 480,
      flexShrink: 0,
      position: "relative",
      background: side === "left"
        ? "linear-gradient(to right,#7A4F1A,#A8722A,#C4935A)"
        : "linear-gradient(to left,#7A4F1A,#A8722A,#C4935A)",
      overflow: "hidden",
    }}>
      {/* Doku */}
      <svg style={{position:"absolute",inset:0,opacity:.15,pointerEvents:"none"}}
        width={width} height={480}>
        <filter id={`noise${side}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter={`url(#noise${side})`}/>
      </svg>
      {/* İç gölge */}
      <div style={{
        position:"absolute",inset:0,pointerEvents:"none",
        background: side==="left"
          ? "linear-gradient(to right,rgba(0,0,0,.35),transparent 70%)"
          : "linear-gradient(to left,rgba(0,0,0,.35),transparent 70%)",
      }}/>
      {/* Dekoratif dikey çizgiler */}
      {Array.from({length:4}).map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          top:0,bottom:0,
          left: side==="left" ? `${20+i*14}%` : undefined,
          right: side==="right" ? `${20+i*14}%` : undefined,
          width:1,
          background:"rgba(255,200,100,.07)",
        }}/>
      ))}
    </div>
  );
}