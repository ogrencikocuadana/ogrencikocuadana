"use client";

import { useRef, useEffect, useState, useCallback } from "react";

// ─── BİLİMSEL BİLGİLER ───────────────────────────────────────────────────
const BILGILER = [
  { emoji:"🧠", bilgi:"Derin nefes alma, prefrontal korteksi aktive ederek kaygıyı %40'a kadar azaltabilir." },
  { emoji:"❤️", bilgi:"4-7-8 nefesi, vagus sinirini uyararak kalp atış hızını dakikalar içinde düşürür." },
  { emoji:"💤", bilgi:"Uyumadan önce yapılan kutu nefesi, uykuya dalma süresini ortalama 7 dakika kısaltır." },
  { emoji:"⚡", bilgi:"Stres anında yapılan 3 derin nefes, kortizol seviyesini hızla düşürmeye başlar." },
  { emoji:"🫀", bilgi:"Diyafram nefesi, kan basıncını düzenler ve kalp ritmi değişkenliğini (HRV) iyileştirir." },
  { emoji:"🌿", bilgi:"Kas gevşeme egzersizleri, kronik gerginliği azaltmada ilaçsız en etkili yöntemler arasındadır." },
  { emoji:"🎯", bilgi:"Kutu nefesi, ABD Deniz Kuvvetleri SEAL'ları tarafından stres altında odak için kullanılır." },
  { emoji:"🔬", bilgi:"Düzenli nefes egzersizi yapanların amigdala aktivitesi zamanla azalır — korku tepkileri yumuşar." },
];

// ─── TEKNİKLER ────────────────────────────────────────────────────────────
type TeknikID = "478" | "kutu" | "gevseme";

interface Faz { ad: string; sure: number; renk: string; aciklama: string; }

const TEKNIKLER: Record<TeknikID, { baslik:string; emoji:string; aciklama:string; fazlar:Faz[] }> = {
  "478": {
    baslik:"4-7-8 Nefesi", emoji:"🌬️",
    aciklama:"Sinir sistemini sakinleştiren klasik teknik.",
    fazlar:[
      { ad:"Nefes Al",  sure:4, renk:"#60a5fa", aciklama:"Burnundan derin nefes al" },
      { ad:"Tut",       sure:7, renk:"#a78bfa", aciklama:"Nefesini tut, zihnini boşalt" },
      { ad:"Nefes Ver", sure:8, renk:"#34d399", aciklama:"Ağzından yavaşça ver" },
    ],
  },
  "kutu": {
    baslik:"Kutu Nefesi", emoji:"⬜",
    aciklama:"Odaklanmayı artıran denge tekniği.",
    fazlar:[
      { ad:"Al",  sure:4, renk:"#60a5fa", aciklama:"Burnundan yavaşça nefes al" },
      { ad:"Tut", sure:4, renk:"#f472b6", aciklama:"Nefesini tut, bedeni hisset" },
      { ad:"Ver", sure:4, renk:"#34d399", aciklama:"Ağzından yavaşça ver" },
      { ad:"Tut", sure:4, renk:"#fb923c", aciklama:"Bekle, boşluğu hisset" },
    ],
  },
  "gevseme": {
    baslik:"Progresif Gevşeme", emoji:"🌿",
    aciklama:"Ayaktan başlayıp kafaya: sık-bırak yöntemiyle tam gevşeme.",
    fazlar:[], // PMR kendi state'ini kullanır
  },
};

// ─── PMR ADIMLAR ──────────────────────────────────────────────────────────
interface PmrAdim { bolge:string; emoji:string; sikSure:number; birakSure:number; aciklama:string; }
const PMR_ADIMLAR: PmrAdim[] = [
  { bolge:"Ayaklar",        emoji:"🦶", sikSure:7, birakSure:15, aciklama:"Parmakları kıvır, ayakları geriyor gibi sık" },
  { bolge:"Baldırlar",      emoji:"🦵", sikSure:7, birakSure:15, aciklama:"Baldır kaslarını sıkıştır ve tut" },
  { bolge:"Uyluklar",       emoji:"🦵", sikSure:7, birakSure:15, aciklama:"Uyluk kaslarını iyice geriyor gibi sık" },
  { bolge:"Karın",          emoji:"🫃", sikSure:7, birakSure:15, aciklama:"Karnını içe çek ve sıkıştır" },
  { bolge:"Eller & Kollar", emoji:"💪", sikSure:7, birakSure:15, aciklama:"Yumrukları sık, tüm kolu ger" },
  { bolge:"Omuzlar",        emoji:"🙆", sikSure:7, birakSure:15, aciklama:"Omuzları kulaklara doğru çek ve sık" },
  { bolge:"Boyun",          emoji:"🧣", sikSure:7, birakSure:15, aciklama:"Başı hafifçe geriye yasla, boynu ger" },
  { bolge:"Yüz",            emoji:"😬", sikSure:7, birakSure:15, aciklama:"Gözleri sık kapa, dişleri sıkıştır, yüzü büz" },
  { bolge:"Tüm Vücut",      emoji:"✨", sikSure:5, birakSure:20, aciklama:"Tek tek hepsini bir arada sık... şimdi tamamen bırak" },
];

// ─── SOFT PIANO SESİ ──────────────────────────────────────────────────────
function pianoCal(audioCtx: AudioContext, notaHz = 523.25) {
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.13, now + 0.01);
  master.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
  master.connect(audioCtx.destination);

  // Ana sinüs (temel ton)
  const osc1 = audioCtx.createOscillator();
  osc1.type = "sine"; osc1.frequency.value = notaHz;
  osc1.connect(master); osc1.start(now); osc1.stop(now + 2.3);

  // 2. harmonik (yumuşak)
  const osc2 = audioCtx.createOscillator();
  const g2 = audioCtx.createGain(); g2.gain.value = 0.3;
  osc2.type = "sine"; osc2.frequency.value = notaHz * 2;
  osc2.connect(g2); g2.connect(master);
  osc2.start(now); osc2.stop(now + 1.8);

  // 3. harmonik (çok hafif)
  const osc3 = audioCtx.createOscillator();
  const g3 = audioCtx.createGain(); g3.gain.value = 0.1;
  osc3.type = "sine"; osc3.frequency.value = notaHz * 3;
  osc3.connect(g3); g3.connect(master);
  osc3.start(now); osc3.stop(now + 1.2);

  // Hafif reverb (convolver ile basit delay)
  const delay = audioCtx.createDelay(0.5);
  delay.delayTime.value = 0.18;
  const delGain = audioCtx.createGain(); delGain.gain.value = 0.15;
  master.connect(delay); delay.connect(delGain); delGain.connect(audioCtx.destination);
}

// Piano notaları — faz geçişlerinde farklı nota
const NOTALAR = [523.25, 587.33, 659.25, 698.46]; // C5, D5, E5, F5

export default function NefesEgzersizi() {
  const [teknikId, setTeknikId]   = useState<TeknikID>("478");
  const [calisyor, setCalisyor]   = useState(false);
  const [fazIdx, setFazIdx]       = useState(0);
  const [sayac, setSayac]         = useState<number|null>(null);
  const [tur, setTur]             = useState(0);
  const [prog, setProg]           = useState(0);
  const [bilgiIdx, setBilgiIdx]   = useState(0);
  const [secimEkran, setSecimEkran] = useState(true);

  // PMR state
  const [pmrAdim, setPmrAdim]     = useState(0);
  const [pmrFaz, setPmrFaz]       = useState<"sik"|"birak"|"hazir">("hazir");
  const [pmrSayac, setPmrSayac]   = useState<number|null>(null);
  const [pmrBitti, setPmrBitti]   = useState(false);

  const audioCtxRef = useRef<AudioContext|null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const stateRef    = useRef({ faz:0, tik:0, tur:0, on:false });
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const boxCanvasRef = useRef<HTMLCanvasElement>(null);
  const animRef     = useRef<number|null>(null);
  const progRef     = useRef(0);
  const fazRenkRef  = useRef("#60a5fa");
  const notaIdxRef  = useRef(0);

  const teknik = TEKNIKLER[teknikId];

  function ses(idx?: number) {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    const nota = NOTALAR[idx !== undefined ? idx % NOTALAR.length : notaIdxRef.current % NOTALAR.length];
    pianoCal(audioCtxRef.current, nota);
    notaIdxRef.current++;
  }

  // ── Bilgi döngüsü ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setBilgiIdx(i => (i+1) % BILGILER.length), 8000);
    return () => clearInterval(t);
  }, []);

  // ── Canvas: 4-7-8 daire ──────────────────────────────────────────────────
  const drawCircle = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W=220, cx=110, cy=110;
    ctx.clearRect(0,0,W,W);
    const p = progRef.current;
    const renk = fazRenkRef.current;
    // Glow
    const glow = ctx.createRadialGradient(cx,cy,50,cx,cy,108);
    glow.addColorStop(0,"transparent");
    glow.addColorStop(0.7,`${renk}18`);
    glow.addColorStop(1,`${renk}08`);
    ctx.beginPath(); ctx.arc(cx,cy,108,0,Math.PI*2);
    ctx.fillStyle=glow; ctx.fill();
    // Arka halka
    ctx.beginPath(); ctx.arc(cx,cy,80,0,Math.PI*2);
    ctx.strokeStyle="rgba(255,255,255,.06)"; ctx.lineWidth=12; ctx.stroke();
    // İlerleme
    if (calisyor||p>0) {
      ctx.beginPath(); ctx.arc(cx,cy,80,-Math.PI/2,-Math.PI/2+p*Math.PI*2);
      ctx.strokeStyle=renk; ctx.lineWidth=12; ctx.lineCap="round"; ctx.stroke();
      const angle=-Math.PI/2+p*Math.PI*2;
      const ex=cx+80*Math.cos(angle), ey=cy+80*Math.sin(angle);
      const dg=ctx.createRadialGradient(ex,ey,0,ex,ey,10);
      dg.addColorStop(0,"rgba(255,255,255,.9)"); dg.addColorStop(0.4,renk); dg.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(ex,ey,10,0,Math.PI*2); ctx.fillStyle=dg; ctx.fill();
    }
    // Balon
    const fazObj = teknik.fazlar[stateRef.current.faz]||teknik.fazlar[0];
    let r=38;
    if(calisyor){
      if(fazObj.ad.includes("Al")) r=28+p*22;
      else if(fazObj.ad.includes("Ver")) r=50-p*20;
      else r=44;
    }
    const bg=ctx.createRadialGradient(cx-r*.25,cy-r*.25,2,cx,cy,r);
    bg.addColorStop(0,`${renk}CC`); bg.addColorStop(0.5,`${renk}55`); bg.addColorStop(1,`${renk}18`);
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle=bg; ctx.fill();
    ctx.beginPath(); ctx.arc(cx-r*.3,cy-r*.3,r*.22,0,Math.PI*2);
    ctx.fillStyle="rgba(255,255,255,.28)"; ctx.fill();
  },[calisyor, teknik.fazlar]);

  // ── Canvas: Kutu karesi ───────────────────────────────────────────────────
  const drawBox = useCallback(() => {
    const canvas = boxCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W=220, pad=30;
    const side = W - pad*2;
    ctx.clearRect(0,0,W,W);

    const p = progRef.current;
    const faz = stateRef.current.faz; // 0=Al 1=Tut 2=Ver 3=Tut
    const renk = fazRenkRef.current;

    // Arka kare
    ctx.strokeStyle="rgba(255,255,255,.07)";
    ctx.lineWidth=3; ctx.lineJoin="round";
    ctx.strokeRect(pad,pad,side,side);

    // İlerleme: kare çevresi boyunca
    // Kenar sırasına göre: Al=sağ kenar, Tut1=alt kenar, Ver=sol kenar, Tut2=üst kenar
    const perim = side*4;
    // Her fazın başlangıç offseti
    const offsets = [0, side, side*2, side*3];
    const startOff = offsets[faz % 4];
    const totalDrawn = startOff + p * side;

    ctx.save();
    ctx.strokeStyle = renk;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = renk;
    ctx.shadowBlur = 8;

    // Tam kutu çevresi path
    const corners = [
      [pad, pad],
      [pad+side, pad],
      [pad+side, pad+side],
      [pad, pad+side],
      [pad, pad],
    ];

    // Çizilecek toplam uzunluk = totalDrawn (perim içinde)
    const drawLen = Math.min(totalDrawn, perim);
    ctx.beginPath();
    let drawn = 0;
    let started = false;
    for (let i = 0; i < 4; i++) {
      const [x1,y1] = corners[i];
      const [x2,y2] = corners[i+1];
      const segLen = side;
      if (drawn + segLen <= 0) { drawn += segLen; continue; }
      if (!started) { ctx.moveTo(x1,y1); started=true; }
      if (drawn + segLen <= drawLen) {
        ctx.lineTo(x2,y2);
      } else {
        const t = (drawLen - drawn) / segLen;
        ctx.lineTo(x1+(x2-x1)*t, y1+(y2-y1)*t);
        break;
      }
      drawn += segLen;
    }
    ctx.stroke();
    ctx.restore();

    // Parlayan nokta (ilerleyen köşe)
    if (calisyor) {
      let dist = totalDrawn % perim;
      let px2 = pad, py2 = pad;
      if (dist <= side) { px2 = pad + dist; py2 = pad; }
      else if (dist <= side*2) { px2 = pad+side; py2 = pad+(dist-side); }
      else if (dist <= side*3) { px2 = pad+side-(dist-side*2); py2 = pad+side; }
      else { px2 = pad; py2 = pad+side-(dist-side*3); }

      const dg = ctx.createRadialGradient(px2,py2,0,px2,py2,12);
      dg.addColorStop(0,"rgba(255,255,255,.95)");
      dg.addColorStop(0.35,renk);
      dg.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(px2,py2,12,0,Math.PI*2);
      ctx.fillStyle=dg; ctx.fill();
    }

    // Köşe noktaları
    corners.slice(0,4).forEach(([cx2,cy2]) => {
      ctx.beginPath(); ctx.arc(cx2,cy2,4,0,Math.PI*2);
      ctx.fillStyle="rgba(255,255,255,.2)"; ctx.fill();
    });

    // Faz etiketleri kenar ortasında
    const fazLabels = ["AL","TUT","VER","TUT"];
    const fazColors = ["#60a5fa","#f472b6","#34d399","#fb923c"];
    const labelPos = [
      [W/2, pad-10],
      [pad+side+14, W/2],
      [W/2, pad+side+16],
      [pad-14, W/2],
    ];
    ctx.font = "bold 9px 'Sora', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    labelPos.forEach(([lx,ly],i) => {
      ctx.fillStyle = faz===i && calisyor ? fazColors[i] : "rgba(255,255,255,.2)";
      ctx.fillText(fazLabels[i], lx, ly);
    });
  },[calisyor]);

  // ── Anim loop ─────────────────────────────────────────────────────────────
  const animLoop = useCallback(() => {
    if (teknikId==="478") drawCircle();
    else if (teknikId==="kutu") drawBox();
    animRef.current = requestAnimationFrame(animLoop);
  },[drawCircle, drawBox, teknikId]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animLoop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  },[animLoop]);

  // ── 4-7-8 / Kutu başlat ──────────────────────────────────────────────────
  function baslat() {
    ses(0);
    const s = stateRef.current;
    s.faz=0; s.tik=0; s.tur=0; s.on=true;
    setCalisyor(true); setFazIdx(0); setTur(0);
    setSayac(teknik.fazlar[0].sure);
    progRef.current=0; fazRenkRef.current=teknik.fazlar[0].renk;
    setSecimEkran(false);

    intervalRef.current = setInterval(() => {
      const s = stateRef.current; if(!s.on) return;
      s.tik++;
      const faz = teknik.fazlar[s.faz];
      progRef.current = Math.min(1, s.tik/faz.sure);
      setSayac(Math.max(1, faz.sure-s.tik+1));
      setProg(progRef.current);
      if (s.tik>=faz.sure) {
        s.tik=0;
        const next=(s.faz+1)%teknik.fazlar.length;
        s.faz=next;
        if(next===0){s.tur++;setTur(s.tur);}
        fazRenkRef.current=teknik.fazlar[next].renk;
        progRef.current=0;
        setFazIdx(next);
        setSayac(teknik.fazlar[next].sure);
        ses(next);
      }
    },1000);
  }

  function durdur() {
    stateRef.current.on=false;
    if(intervalRef.current){clearInterval(intervalRef.current);intervalRef.current=null;}
    setCalisyor(false); setSayac(null); setProg(0); setTur(0);
    progRef.current=0; fazRenkRef.current="#60a5fa";
    setSecimEkran(true);
  }

  // ── PMR başlat ───────────────────────────────────────────────────────────
  function pmrBaslat() {
    setSecimEkran(false);
    setCalisyor(true);
    setPmrAdim(0); setPmrFaz("sik"); setPmrBitti(false);
    ses(0);
    pmrCalistir(0,"sik");
  }

  function pmrCalistir(adim: number, faz: "sik"|"birak") {
    const sure = faz==="sik" ? PMR_ADIMLAR[adim].sikSure : PMR_ADIMLAR[adim].birakSure;
    setPmrSayac(sure);
    let kalan = sure;
    intervalRef.current = setInterval(() => {
      kalan--;
      setPmrSayac(kalan);
      if (kalan<=0) {
        clearInterval(intervalRef.current!);
        if (faz==="sik") {
          // Bırak fazına geç
          ses(1);
          setPmrFaz("birak");
          pmrCalistir(adim,"birak");
        } else {
          // Sonraki adım
          const sonraki = adim+1;
          if (sonraki>=PMR_ADIMLAR.length) {
            ses(3);
            setPmrBitti(true);
            setCalisyor(false);
            setPmrSayac(null);
          } else {
            ses(0);
            setPmrAdim(sonraki);
            setPmrFaz("sik");
            pmrCalistir(sonraki,"sik");
          }
        }
      }
    },1000);
  }

  function pmrDurdur() {
    if(intervalRef.current){clearInterval(intervalRef.current);intervalRef.current=null;}
    setCalisyor(false); setPmrFaz("hazir"); setPmrSayac(null); setPmrAdim(0);
    setSecimEkran(true);
  }

  useEffect(() => () => {
    if(intervalRef.current) clearInterval(intervalRef.current);
    if(animRef.current) cancelAnimationFrame(animRef.current);
  },[]);

  const aktifFaz = teknik.fazlar[fazIdx]||teknik.fazlar[0];
  const pmrAdimObj = PMR_ADIMLAR[pmrAdim];

  return (
    <>
      <style>{`
        .nf-root{display:flex;flex-direction:column;align-items:center;padding:36px 18px 52px;width:100%;font-family:'Sora',sans-serif;position:relative;}
        .nf-bg{position:fixed;inset:0;pointer-events:none;z-index:0;
          background:radial-gradient(ellipse at 50% 30%,rgba(251,191,236,.06) 0%,transparent 60%),
                     radial-gradient(ellipse at 20% 80%,rgba(167,243,208,.05) 0%,transparent 50%),
                     radial-gradient(ellipse at 80% 70%,rgba(196,181,253,.05) 0%,transparent 50%);}
        .nf-card{display:flex;flex-direction:column;gap:4px;padding:13px 14px;border-radius:13px;
          cursor:pointer;text-align:left;width:100%;border:1.5px solid rgba(255,255,255,.07);
          background:rgba(255,255,255,.04);color:white;font-family:'Sora',sans-serif;transition:all .18s;}
        .nf-card:hover{background:rgba(255,255,255,.08);transform:translateY(-1px);}
        .nf-card.on{border-color:rgba(167,139,250,.55);background:rgba(167,139,250,.09);}
        @keyframes ripple{0%{transform:scale(1);opacity:.35;}100%{transform:scale(2.4);opacity:0;}}
        .nf-ripple{position:absolute;border-radius:50%;animation:ripple 2.8s ease-out infinite;pointer-events:none;}
        @keyframes bilgiFade{0%{opacity:0;transform:translateY(6px);}100%{opacity:1;transform:translateY(0);}}
        .nf-bilgi{animation:bilgiFade .5s ease;}
        @keyframes pmrPulse{0%,100%{opacity:1;}50%{opacity:.6;}}
        .pmr-sik{animation:pmrPulse .8s ease-in-out infinite;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .nf-fade{animation:fadeIn .35s ease;}
        .nf-btn{padding:12px 36px;border:none;border-radius:13px;cursor:pointer;
          font-weight:700;font-size:13px;font-family:'Sora',sans-serif;transition:all .2s;color:white;
          background:linear-gradient(135deg,rgba(167,139,250,.9),rgba(139,92,246,.9));
          box-shadow:0 4px 20px rgba(139,92,246,.4);}
        .nf-btn:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(139,92,246,.5);}
        .nf-btn-ghost{padding:10px 24px;border:1.5px solid rgba(255,255,255,.12);border-radius:11px;
          cursor:pointer;font-weight:600;font-size:12px;font-family:'Sora',sans-serif;
          background:rgba(255,255,255,.05);color:rgba(232,244,253,.6);transition:all .2s;}
      `}</style>

      <div className="nf-bg"/>
      <div className="nf-root" style={{position:"relative",zIndex:1}}>

        {/* Başlık */}
        <div style={{textAlign:"center",marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:3,color:"rgba(216,180,254,.65)",textTransform:"uppercase",marginBottom:5}}>Mindfulness</div>
          <div style={{fontSize:18,fontWeight:800,color:"white",marginBottom:4}}>🌸 Nefes Egzersizi</div>
          <div style={{fontSize:11,color:"rgba(232,244,253,.38)",lineHeight:1.65,maxWidth:260}}>
            Gözlerini kapat. Sesi duyunca bir sonraki adıma geç.
          </div>
        </div>

        <LotusDekor/>

        {/* ── BİLİMSEL BİLGİ ── */}
        <div key={bilgiIdx} className="nf-bilgi" style={{
          width:"100%",maxWidth:340,marginBottom:16,flexShrink:0,
          background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",
          borderRadius:12,padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start",
        }}>
          <span style={{fontSize:18,flexShrink:0}}>{BILGILER[bilgiIdx].emoji}</span>
          <div>
            <div style={{fontSize:8,fontWeight:700,color:"rgba(216,180,254,.6)",letterSpacing:1.2,textTransform:"uppercase",marginBottom:3}}>Biliyor muydun?</div>
            <div style={{fontSize:10,color:"rgba(232,244,253,.55)",lineHeight:1.65}}>{BILGILER[bilgiIdx].bilgi}</div>
          </div>
        </div>

        {/* ── TEKNİK SEÇİCİ ── */}
        {secimEkran && (
          <div className="nf-fade" style={{width:"100%",maxWidth:340,marginBottom:20,display:"flex",flexDirection:"column",gap:8}}>
            {(Object.entries(TEKNIKLER) as [TeknikID, typeof TEKNIKLER[TeknikID]][]).map(([id,t])=>(
              <button key={id} className={`nf-card${teknikId===id?" on":""}`} onClick={()=>setTeknikId(id)}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>{t.emoji}</span>
                  <span style={{fontSize:13,fontWeight:700}}>{t.baslik}</span>
                  {teknikId===id&&<span style={{marginLeft:"auto",fontSize:9,color:"rgba(167,139,250,.8)",fontWeight:700}}>Seçili ✓</span>}
                </div>
                <div style={{fontSize:10,color:"rgba(232,244,253,.38)",paddingLeft:28,lineHeight:1.5}}>{t.aciklama}</div>
                {id!=="gevseme"&&(
                  <div style={{display:"flex",gap:4,paddingLeft:28,flexWrap:"wrap",marginTop:2}}>
                    {t.fazlar.map((f,i)=>(
                      <span key={i} style={{fontSize:9,padding:"2px 7px",borderRadius:10,fontWeight:600,background:`${f.renk}22`,color:f.renk,border:`1px solid ${f.renk}44`}}>
                        {f.ad} {f.sure}s
                      </span>
                    ))}
                  </div>
                )}
                {id==="gevseme"&&(
                  <div style={{display:"flex",gap:4,paddingLeft:28,flexWrap:"wrap",marginTop:2}}>
                    {PMR_ADIMLAR.slice(0,4).map((a,i)=>(
                      <span key={i} style={{fontSize:9,padding:"2px 7px",borderRadius:10,fontWeight:600,background:"rgba(52,211,153,.15)",color:"#34d399",border:"1px solid rgba(52,211,153,.3)"}}>
                        {a.emoji} {a.bolge}
                      </span>
                    ))}
                    <span style={{fontSize:9,padding:"2px 7px",borderRadius:10,color:"rgba(232,244,253,.3)"}}>+{PMR_ADIMLAR.length-4} daha</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── 4-7-8 ve KUTU CANVAS ── */}
        {(teknikId==="478"||teknikId==="kutu") && !secimEkran && (
          <div className="nf-fade" style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{position:"relative",width:220,height:220,marginBottom:14,flexShrink:0}}>
              {calisyor&&[0,1,2].map(i=>(
                <div key={i} className="nf-ripple" style={{
                  width:160,height:160,top:30,left:30,
                  border:`1.5px solid ${aktifFaz.renk}44`,
                  animationDelay:`${i*.9}s`,
                }}/>
              ))}
              {teknikId==="478"
                ? <canvas ref={canvasRef} width={220} height={220} style={{display:"block",position:"relative",zIndex:2}}/>
                : <canvas ref={boxCanvasRef} width={220} height={220} style={{display:"block",position:"relative",zIndex:2}}/>
              }
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none",zIndex:3,width:100}}>
                {calisyor?(
                  <>
                    <div style={{fontSize:12,fontWeight:800,color:"white",marginBottom:1}}>{aktifFaz.ad}</div>
                    <div style={{fontSize:30,fontWeight:900,color:aktifFaz.renk,textShadow:`0 0 20px ${aktifFaz.renk}88`,lineHeight:1}}>{sayac}</div>
                    <div style={{fontSize:9,color:"rgba(232,244,253,.4)",marginTop:3,lineHeight:1.4}}>{aktifFaz.aciklama}</div>
                  </>
                ):(
                  <div style={{fontSize:11,color:"rgba(232,244,253,.45)",lineHeight:1.5}}>
                    Başlamak için<br/><span style={{color:"rgba(216,180,254,.7)",fontWeight:700}}>dokun</span>
                  </div>
                )}
              </div>
              <div onClick={calisyor?durdur:baslat} style={{position:"absolute",inset:0,zIndex:4,cursor:"pointer"}}/>
            </div>

            {/* Faz indikatörler */}
            {calisyor&&(
              <div style={{display:"flex",gap:6,marginBottom:12}}>
                {teknik.fazlar.map((f,i)=>(
                  <div key={i} style={{height:4,borderRadius:2,transition:"all .4s",
                    width:i===fazIdx?28:14,
                    background:i===fazIdx?f.renk:"rgba(255,255,255,.14)",
                    boxShadow:i===fazIdx?`0 0 8px ${f.renk}88`:"none"}}/>
                ))}
              </div>
            )}

            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(216,180,254,.7)",padding:"4px 12px",borderRadius:20,background:"rgba(167,139,250,.1)",border:"1px solid rgba(167,139,250,.2)"}}>
                {teknik.emoji} {teknik.baslik}
              </div>
              {tur>0&&<div style={{fontSize:11,color:"rgba(251,191,236,.7)",fontWeight:700}}>{tur} tur ✓</div>}
            </div>

            <div style={{display:"flex",gap:8}}>
              <button className="nf-btn" onClick={calisyor?durdur:baslat}>
                {calisyor?"⏸ Durdur":"▶ Başla"}
              </button>
              <button className="nf-btn-ghost" onClick={durdur}>↩ Değiştir</button>
            </div>
          </div>
        )}

        {/* ── PMR (GEVŞEME) ── */}
        {teknikId==="gevseme" && !secimEkran && (
          <div className="nf-fade" style={{width:"100%",maxWidth:340}}>

            {pmrBitti ? (
              /* Bitti ekranı */
              <div style={{textAlign:"center",padding:"24px 0"}}>
                <div style={{fontSize:52,marginBottom:12}}>✨</div>
                <div style={{fontSize:17,fontWeight:800,color:"white",marginBottom:6}}>Tüm vücut gevşedi</div>
                <div style={{fontSize:11,color:"rgba(232,244,253,.45)",lineHeight:1.65,marginBottom:20}}>
                  Kasların birer birer bıraktığını hisset.<br/>Bu huzuru bir süre koru.
                </div>
                <button className="nf-btn" onClick={()=>{setPmrBitti(false);setSecimEkran(true);}}>
                  Tekrar Yap
                </button>
              </div>
            ) : (
              <>
                {/* İlerleme barı */}
                <div style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:10,color:"rgba(232,244,253,.4)"}}>İlerleme</span>
                    <span style={{fontSize:10,color:"rgba(52,211,153,.7)",fontWeight:700}}>{pmrAdim+1}/{PMR_ADIMLAR.length}</span>
                  </div>
                  <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.08)"}}>
                    <div style={{height:"100%",borderRadius:3,background:"linear-gradient(to right,#34d399,#60a5fa)",
                      width:`${((pmrAdim+(pmrFaz==="birak"?.5:0))/PMR_ADIMLAR.length)*100}%`,transition:"width .5s ease"}}/>
                  </div>
                </div>

                {/* Aktif adım */}
                <div style={{
                  background: pmrFaz==="sik" ? "rgba(251,113,133,.08)" : "rgba(52,211,153,.08)",
                  border: `1.5px solid ${pmrFaz==="sik"?"rgba(251,113,133,.3)":"rgba(52,211,153,.3)"}`,
                  borderRadius:16,padding:"20px 18px",marginBottom:14,textAlign:"center",
                }}>
                  <div style={{fontSize:48,marginBottom:8}} className={pmrFaz==="sik"?"pmr-sik":""}>
                    {pmrAdimObj.emoji}
                  </div>
                  <div style={{fontSize:16,fontWeight:800,color:"white",marginBottom:4}}>
                    {pmrAdimObj.bolge}
                  </div>
                  <div style={{
                    display:"inline-block",padding:"4px 16px",borderRadius:20,marginBottom:10,
                    background: pmrFaz==="sik" ? "rgba(251,113,133,.2)" : "rgba(52,211,153,.2)",
                    color: pmrFaz==="sik" ? "#fb7185" : "#34d399",
                    fontSize:12,fontWeight:800,letterSpacing:.5,
                  }}>
                    {pmrFaz==="sik" ? "💪 SIK!" : "😮‍💨 BIRAK!"}
                  </div>
                  <div style={{fontSize:11,color:"rgba(232,244,253,.5)",lineHeight:1.6,marginBottom:12}}>
                    {pmrAdimObj.aciklama}
                  </div>
                  {pmrSayac!==null&&(
                    <div style={{
                      fontSize:42,fontWeight:900,
                      color: pmrFaz==="sik" ? "#fb7185" : "#34d399",
                      textShadow:`0 0 24px ${pmrFaz==="sik"?"rgba(251,113,133,.5)":"rgba(52,211,153,.5)"}`,
                    }}>{pmrSayac}</div>
                  )}
                </div>

                {/* Adım listesi */}
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
                  {PMR_ADIMLAR.map((a,i)=>(
                    <div key={i} style={{
                      fontSize:18,padding:"4px",borderRadius:8,
                      opacity: i<pmrAdim?0.35 : i===pmrAdim?1 : 0.2,
                      filter: i===pmrAdim?"drop-shadow(0 0 6px rgba(52,211,153,.6))":"none",
                      transition:"all .3s",
                    }}>{a.emoji}</div>
                  ))}
                </div>

                <div style={{display:"flex",gap:8}}>
                  {!calisyor&&!pmrBitti&&(
                    <button className="nf-btn" onClick={pmrBaslat}>▶ Başla</button>
                  )}
                  <button className="nf-btn-ghost" onClick={pmrDurdur}>↩ Değiştir</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Başla butonu (seçim ekranındayken) */}
        {secimEkran&&(
          <button className="nf-btn" onClick={()=>{
            if(teknikId==="gevseme"){setSecimEkran(false);setCalisyor(false);setPmrFaz("hazir");setPmrAdim(0);setPmrBitti(false);}
            else baslat();
          }}>▶ Başla</button>
        )}

        {/* Mindfulness ipuçları */}
        {secimEkran&&(
          <div style={{marginTop:18,maxWidth:300,width:"100%",background:"rgba(255,255,255,.03)",
            border:"1px solid rgba(255,255,255,.06)",borderRadius:14,padding:"13px 15px"}}>
            <div style={{fontSize:9,fontWeight:700,color:"rgba(216,180,254,.55)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:9}}>Mindfulness İpuçları</div>
            {[
              {e:"🌸",t:"Omurganı dik tut, omuzlarını gevşet."},
              {e:"👁️",t:"Gözlerini kapat veya önüne yumuşakça bak."},
              {e:"🎵",t:"Sesi duyunca bir sonraki adıma geçtiğini bil."},
              {e:"💭",t:"Düşünceler gelirse yargılamadan bırak gitsin."},
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:i<3?7:0,alignItems:"flex-start"}}>
                <span style={{fontSize:13,flexShrink:0,marginTop:1}}>{item.e}</span>
                <span style={{fontSize:10,color:"rgba(232,244,253,.42)",lineHeight:1.6}}>{item.t}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}

// ─── LOTUS SVG ────────────────────────────────────────────────────────────
function LotusDekor() {
  return (
    <div style={{position:"relative",width:280,height:80,marginBottom:6,flexShrink:0}}>
      <svg viewBox="0 0 280 80" width="280" height="80">
        <g transform="translate(34,52)" opacity="0.32">
          {[[-26,-20,-28],[-13,-30,-13],[0,-34,0],[13,-30,13],[26,-20,28]].map(([px,py,rot],i)=>(
            <ellipse key={i} cx={px} cy={py} rx="8" ry="16" fill="none"
              stroke="#f9a8d4" strokeWidth="1.1" transform={`rotate(${rot} 0 0)`} opacity={i===2?1:.7}/>
          ))}
          <circle cx="0" cy="-9" r="4.5" fill="rgba(249,168,212,.25)" stroke="#f9a8d4" strokeWidth=".9"/>
          <path d="M0 0 C-4 9 -2 18 0 24" stroke="#86efac" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        </g>
        <g transform="translate(246,52)" opacity="0.32">
          {[[-26,-20,-28],[-13,-30,-13],[0,-34,0],[13,-30,13],[26,-20,28]].map(([px,py,rot],i)=>(
            <ellipse key={i} cx={px} cy={py} rx="8" ry="16" fill="none"
              stroke="#c4b5fd" strokeWidth="1.1" transform={`rotate(${rot} 0 0)`} opacity={i===2?1:.7}/>
          ))}
          <circle cx="0" cy="-9" r="4.5" fill="rgba(196,181,253,.25)" stroke="#c4b5fd" strokeWidth=".9"/>
          <path d="M0 0 C4 9 2 18 0 24" stroke="#86efac" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        </g>
        <g transform="translate(140,44)" opacity="0.18">
          {[[-16,-12,-18],[-7,-18,-9],[0,-20,0],[7,-18,9],[16,-12,18]].map(([px,py,rot],i)=>(
            <ellipse key={i} cx={px} cy={py} rx="5" ry="10" fill="rgba(249,168,212,.2)"
              stroke="#f9a8d4" strokeWidth=".9" transform={`rotate(${rot} 0 0)`}/>
          ))}
        </g>
        {[[48,68],[95,73],[185,71],[228,69]].map(([x,y],i)=>(
          <ellipse key={i} cx={x} cy={y} rx={10+i*2} ry="3.5"
            fill="rgba(134,239,172,.15)" stroke="rgba(134,239,172,.3)" strokeWidth=".7"/>
        ))}
      </svg>
    </div>
  );
}