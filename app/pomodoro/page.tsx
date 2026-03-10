"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";

import StudyBanner from "../components/StudyBanner";

  
    

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface Session {
  id: string; date: string; plannedDuration: number; actualDuration: number; completedAt: string;
  subject?: string;
}
interface DailyGoal { minutes: number; animal: string; }
interface Task {
  id: string; date: string; text: string; subject: string; done: boolean; createdAt: string;
}

// ─── Ders Listesi ─────────────────────────────────────────────────────────────
const SUBJECT_GROUPS = [
  {
    group: "TYT",
    color: "#0e7490",
    accent: "#22d3ee",
    subjects: ["Türkçe", "Matematik", "Geometri", "Tarih", "Coğrafya", "Felsefe", "Din", "Fizik", "Kimya", "Biyoloji"],
  },
  {
    group: "AYT / SAY",
    color: "#4A6BE8",
    accent: "#818cf8",
    subjects: ["AYT Mat", "AYT Geometri", "Fizik", "Kimya", "Biyoloji"],
  },
  {
    group: "AYT / EA",
    color: "#c2410c",
    accent: "#fb923c",
    subjects: ["AYT Mat", "AYT Geometri", "Edebiyat", "Tarih 1", "Coğrafya 1"],
  },
  {
    group: "AYT / SÖZ",
    color: "#065f46",
    accent: "#34d399",
    subjects: ["Edebiyat", "Tarih 1", "Coğrafya 1", "Tarih 2", "Coğrafya 2", "Felsefe", "DKAB"],
  },
  {
    group: "LGS",
    color: "#7c3aed",
    accent: "#a78bfa",
    subjects: ["Türkçe", "Matematik", "Fen Bilimleri", "T.C. İnkılap Tarihi", "Din Kültürü", "İngilizce"],
  },
];

// Tüm benzersiz dersler (flat liste, UI'da kullanılır)
const ALL_SUBJECTS = Array.from(new Set(SUBJECT_GROUPS.flatMap(g => g.subjects)));

// Ders → renk (ilk eşleşen grubun rengi)
function subjectColor(name: string): string {
  for (const g of SUBJECT_GROUPS) {
    if (g.subjects.includes(name)) return g.accent;
  }
  return "#9B6FE8"; // özel ders
}

// ─── Sabitler ─────────────────────────────────────────────────────────────────
const PRESET_MODES = [
  { label: "Klasik",     work: 25, rest: 5,  color: "#E8454A", accent: "#E8454A", grad1: "#2e1010", grad2: "#1a0808", lightGrad1: "#fff0f0", lightGrad2: "#ffe4e4", icon: "🍅", desc: "25 dk ders · 5 dk mola" },
  { label: "Derin Odak", work: 50, rest: 10, color: "#4A9E8E", accent: "#4A9E8E", grad1: "#0d2925", grad2: "#091e1a", lightGrad1: "#e8f7f5", lightGrad2: "#d4f0eb", icon: "🧠", desc: "50 dk ders · 10 dk mola" },
  { label: "Maraton",    work: 90, rest: 10, color: "#4A6BE8", accent: "#4A6BE8", grad1: "#0d1830", grad2: "#0a1220", lightGrad1: "#edf0ff", lightGrad2: "#dde3ff", icon: "⚡", desc: "90 dk ders · 10 dk mola" },
  { label: "Serbest",    work: 0,  rest: 0,  color: "#9B6FE8", accent: "#9B6FE8", grad1: "#1e1030", grad2: "#140b22", lightGrad1: "#f3eeff", lightGrad2: "#e8ddff", icon: "🎯", desc: "Kendin belirle" },
];

const AMBIENT_SOUNDS = [
  { id: "off",      label: "Sessiz",   icon: "🔇" },
  { id: "rain",     label: "Yağmur",   icon: "🌧️" },
  { id: "fireplace",label: "Şömine",   icon: "🔥" },
  { id: "forest",   label: "Orman",    icon: "🌲" },
  { id: "ocean",    label: "Okyanus",  icon: "🌊" },
];

// Web Audio ile çok katmanlı ambient ses
function createAmbientNode(ctx: AudioContext, type: string): GainNode | null {
  if (type === "off") return null;

  const master = ctx.createGain();
  master.connect(ctx.destination);

  const makeNoise = (color: "white"|"pink"|"brown") => {
    const bufSize = 4 * ctx.sampleRate;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    if (color === "white") {
      for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    } else if (color === "pink") {
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0;
      for (let i = 0; i < bufSize; i++) {
        const w = Math.random() * 2 - 1;
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
        b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
        b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
        d[i]=(b0+b1+b2+b3+b4+b5+w*0.5362)*0.11;
      }
    } else { // brown
      let last = 0;
      for (let i = 0; i < bufSize; i++) {
        const w = Math.random() * 2 - 1;
        d[i] = (last + 0.02 * w) / 1.02; last = d[i]; d[i] *= 3.5;
      }
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; return src;
  };

  const makeOsc = (freq: number, type: OscillatorType, vol: number) => {
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq; g.gain.value = vol;
    osc.connect(g); return { osc, g };
  };

  if (type === "rain") {
    // Pembe gürültü (yağmur sesi) + hafif bas
    const src = makeNoise("pink");
    const hpf = ctx.createBiquadFilter(); hpf.type="highpass"; hpf.frequency.value=300;
    const lpf = ctx.createBiquadFilter(); lpf.type="lowpass"; lpf.frequency.value=8000;
    const g = ctx.createGain(); g.gain.value = 0.5;
    src.connect(hpf); hpf.connect(lpf); lpf.connect(g); g.connect(master);
    src.start();
    // Damla efekti: periyodik tıklamalar
    const dropGain = ctx.createGain(); dropGain.gain.value = 0.05;
    dropGain.connect(master);
    const scheduleDrops = () => {
      const now2 = ctx.currentTime;
      for (let i = 0; i < 8; i++) {
        const t = now2 + Math.random() * 2;
        const osc2 = ctx.createOscillator(); const og = ctx.createGain();
        osc2.frequency.value = 800 + Math.random()*400; osc2.type="sine";
        og.gain.setValueAtTime(0.08, t); og.gain.exponentialRampToValueAtTime(0.001, t+0.1);
        osc2.connect(og); og.connect(dropGain); osc2.start(t); osc2.stop(t+0.1);
      }
      setTimeout(scheduleDrops, 1800);
    };
    scheduleDrops();
    master.gain.value = 0.7;

  } else if (type === "fireplace") {
    // Kahverengi gürültü (ateş crackle) + alçak frekans uğultu
    const src = makeNoise("brown");
    const lpf = ctx.createBiquadFilter(); lpf.type="lowpass"; lpf.frequency.value=1200;
    const g = ctx.createGain(); g.gain.value = 0.6;
    src.connect(lpf); lpf.connect(g); g.connect(master);
    src.start();
    // Crackle: ani yüksek frekans patlamalar
    const crackleGain = ctx.createGain(); crackleGain.gain.value = 0.08;
    crackleGain.connect(master);
    const scheduleCrackle = () => {
      const now2 = ctx.currentTime;
      if (Math.random() > 0.4) {
        const osc2 = ctx.createOscillator(); const og = ctx.createGain();
        osc2.frequency.value = 2000 + Math.random()*3000; osc2.type="sawtooth";
        og.gain.setValueAtTime(0.15, now2); og.gain.exponentialRampToValueAtTime(0.001, now2+0.05);
        osc2.connect(og); og.connect(crackleGain); osc2.start(now2); osc2.stop(now2+0.05);
      }
      setTimeout(scheduleCrackle, 200 + Math.random()*600);
    };
    scheduleCrackle();
    // Alçak uğultu (ateşin hissettirdiği ısı)
    const {osc: rumble, g: rg} = makeOsc(60, "sine", 0.08);
    rumble.connect(rg); rg.connect(master); rumble.start();
    master.gain.value = 0.6;

  } else if (type === "forest") {
    // Pembe gürültü (rüzgar) + kuş sesleri
    const src = makeNoise("pink");
    const bpf = ctx.createBiquadFilter(); bpf.type="bandpass"; bpf.frequency.value=700; bpf.Q.value=0.3;
    const g = ctx.createGain(); g.gain.value = 0.25;
    src.connect(bpf); bpf.connect(g); g.connect(master);
    src.start();
    // Kuş sesi simülasyonu
    const birdGain = ctx.createGain(); birdGain.gain.value = 0.15;
    birdGain.connect(master);
    const scheduleBird = () => {
      const now2 = ctx.currentTime;
      const chirps = 2 + Math.floor(Math.random() * 4);
      const baseFreq = 2000 + Math.random() * 1500;
      for (let i = 0; i < chirps; i++) {
        const t = now2 + i * 0.15;
        const osc2 = ctx.createOscillator(); const og = ctx.createGain();
        osc2.frequency.setValueAtTime(baseFreq, t);
        osc2.frequency.linearRampToValueAtTime(baseFreq * 1.3, t + 0.08);
        osc2.type = "sine";
        og.gain.setValueAtTime(0.2, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc2.connect(og); og.connect(birdGain); osc2.start(t); osc2.stop(t + 0.12);
      }
      setTimeout(scheduleBird, 3000 + Math.random() * 5000);
    };
    scheduleBird();
    master.gain.value = 0.6;

  } else if (type === "ocean") {
    // Düşük frekanslı dalgalar — gerçekçi okyanus
    const src = makeNoise("brown");
    const lpf = ctx.createBiquadFilter(); lpf.type="lowpass"; lpf.frequency.value=600;
    const hpf = ctx.createBiquadFilter(); hpf.type="highpass"; hpf.frequency.value=60;
    const g = ctx.createGain(); g.gain.value = 0.55;
    src.connect(lpf); lpf.connect(hpf); hpf.connect(g); g.connect(master);
    src.start();
    // Dalga ritmi — LFO ile gain modülasyonu
    const lfo = ctx.createOscillator(); const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.15; lfoGain.gain.value = 0.18;
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    lfo.start();
    // Dalga köpüğü sesi
    const src2 = makeNoise("white");
    const hpf2 = ctx.createBiquadFilter(); hpf2.type="highpass"; hpf2.frequency.value=4000;
    const g2 = ctx.createGain(); g2.gain.value = 0.06;
    src2.connect(hpf2); hpf2.connect(g2); g2.connect(master);
    src2.start();
    master.gain.value = 0.65;
  }

  return master;
}

// ─── Tema sistemi ─────────────────────────────────────────────────────────────
const THEME_KEY = "pomodoro_theme_v1";

const DARK_THEME = {
  bg:          "linear-gradient(160deg, #1a1630 0%, #1e1c3a 40%, #141f3a 80%, #16261e 100%)",
  surface:     "rgba(255,255,255,0.06)",
  surface2:    "rgba(255,255,255,0.04)",
  surfaceSolid:"#1e1c2e",
  border:      "rgba(255,255,255,0.1)",
  borderSoft:  "rgba(255,255,255,0.06)",
  text:        "#F5F5F5",
  textSub:     "rgba(255,255,255,0.4)",
  textMuted:   "rgba(255,255,255,0.25)",
  navBg:       "rgba(10,8,20,0.92)",
  navBorder:   "rgba(255,255,255,0.08)",
  timerBg:     "rgba(0,0,0,0.6)",
  modalBg:     "linear-gradient(160deg,#1a1228,#12101e)",
  isDark:      true,
};

const LIGHT_THEME = {
  bg:          "linear-gradient(160deg, #f0eeff 0%, #e8f0ff 40%, #eef5ff 80%, #edfaf3 100%)",
  surface:     "rgba(255,255,255,0.85)",
  surface2:    "rgba(255,255,255,0.7)",
  surfaceSolid:"#ffffff",
  border:      "rgba(0,0,0,0.08)",
  borderSoft:  "rgba(0,0,0,0.05)",
  text:        "#1a1a2e",
  textSub:     "rgba(0,0,0,0.45)",
  textMuted:   "rgba(0,0,0,0.3)",
  navBg:       "rgba(255,255,255,0.92)",
  navBorder:   "rgba(0,0,0,0.08)",
  timerBg:     "rgba(255,255,255,0.8)",
  modalBg:     "linear-gradient(160deg,#f5f0ff,#eef0ff)",
  isDark:      false,
};

type Theme = typeof DARK_THEME;


const STORAGE_KEY   = "pomodoro_sessions_v2";
const GOAL_KEY      = "pomodoro_goal_v1";
const STREAK_KEY    = "pomodoro_streak_v1";
const LAST_SEEN_KEY = "pomodoro_last_seen_v1";
const TASKS_KEY     = "pomodoro_tasks_v1";

function todayStr() { return new Date().toISOString().slice(0, 10); }
function getTurkishDay() { return ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"][new Date().getDay()]; }
function getTurkishDate() { const months=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"]; const d=new Date(); return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`; }
function fmtMin(m: number) { if(m<60) return `${m} dk`; const h=Math.floor(m/60),r=m%60; return r>0?`${h} sa ${r} dk`:`${h} sa`; }
function weekStart() { const d = new Date(); const day = d.getDay() || 7; d.setDate(d.getDate() - day + 1); return d.toISOString().slice(0, 10); }
function fmtTime(sec: number) { return `${Math.floor(sec/60).toString().padStart(2,"0")}:${(sec%60).toString().padStart(2,"0")}`; }

function getMotivation(pct: number, goalMet: boolean, animalName: string) {
  if (goalMet)   return { msg: `${animalName} çok mutlu! Hedefine ulaştın, muhteşemsin! 🎉`, type: "celebrate" };
  if (pct >= 75) return { msg: `${animalName} neredeyse bitti diyor! Son vitese geç! 💪`, type: "almost" };
  if (pct >= 50) return { msg: `${animalName} harika gidiyorsun diyor! Yarısını geçtin!`, type: "good" };
  if (pct >= 25) return { msg: `${animalName} iyi başlangıç diyor, devam et!`, type: "start" };
  if (pct > 0)   return { msg: `${animalName} ilk adımı attın, sürdür! 🌱`, type: "begin" };
  return           { msg: `${animalName} seninle çalışmaya hazır! Hadi başlayalım!`, type: "idle" };
}

const TOMORROW_MSGS = [
  "Yarın daha güçlü başlayacaksın! 💪",
  "Her gün yeni bir fırsat. Yarın hedefe! 🌅",
  "Küçük adımlar büyük yolculuk yapar. Yarın devam! ⭐",
];

// ─── SVG Hayvanlar ────────────────────────────────────────────────────────────
// Twemoji CDN — evrensel, net ve tanınabilir
const ANIMAL_TWEMOJI: Record<string, string> = {
  capybara:    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ab.svg",
  koala:       "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f428.svg",
  penguin:     "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f427.svg",
  cat:         "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f431.svg",
  bear:        "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f43b.svg",
  caterpillar: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f41b.svg",
  butterfly:   "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f98b.svg",
  snail:       "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f40c.svg",
  turtle:      "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f422.svg",
  chick:       "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f425.svg",
  rabbit:      "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f430.svg",
  horse:       "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f434.svg",
  bee:         "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f41d.svg",
  canary:      "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f425.svg",
  eagle:       "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f985.svg",
  lion:        "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f981.svg",
};

// Bazı hayvanlara CSS filtresi uygula (renk düzeltmesi)
const ANIMAL_FILTER: Record<string, string> = {
  // Kanarya: civciv emojisini sarı-altın tona getir
  canary: "sepia(1) saturate(4) hue-rotate(5deg) brightness(1.1)",
  // Arı: biraz daha canlı
  bee: "saturate(1.4) brightness(1.05)",
};

function AnimalImg({ id, size = 32 }: { id: string; size?: number }) {
  return (
    <img
      src={ANIMAL_TWEMOJI[id] ?? ANIMAL_TWEMOJI["capybara"]}
      width={size} height={size}
      alt={id}
      style={{ imageRendering: "crisp-edges", filter: ANIMAL_FILTER[id] ?? "none" }}
    />
  );
}

const ANIMALS = [
  { id: "capybara",   name: "Kapibara"   }, { id: "koala",      name: "Koala"      },
  { id: "penguin",    name: "Penguen"    }, { id: "cat",        name: "Kedi"       },
  { id: "bear",       name: "Ayı"        }, { id: "caterpillar",name: "Tırtıl"     },
  { id: "butterfly",  name: "Kelebek"   }, { id: "snail",      name: "Salyangoz"  },
  { id: "turtle",     name: "Kaplumbağa"}, { id: "chick",      name: "Civciv"     },
  { id: "rabbit",     name: "Tavşan"    }, { id: "horse",      name: "At"         },
  { id: "bee",        name: "Arı"       }, { id: "canary",     name: "Kanarya"    },
  { id: "eagle",      name: "Kartal"    }, { id: "lion",       name: "Aslan"      },
];

// ─── Kitap ────────────────────────────────────────────────────────────────────
// Günlük toplam dakika → kitap yüksekliği (min 50, max 120)
function DailyBook({ date, minutes, index, sessionCount }: { date: string; minutes: number; index: number; sessionCount: number }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false); // tıkla = sabitlensin
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const bookRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const h = Math.min(120, Math.max(50, Math.round(minutes / 3)));
  const w = 22;
  const palettes = [
    ["#1e3a8a","#2d4fa0"],["#c2410c","#d4510f"],["#065f46","#0a7a5c"],
    ["#4c1d95","#6b2cb5"],["#7c2d12","#9a3a18"],["#1e40af","#2563eb"],
    ["#7c3aed","#8b5cf6"],["#92400e","#b45309"],["#0e7490","#0891b2"],
  ];
  const [bg, spine] = palettes[index % palettes.length];
  const d = new Date(date + "T12:00:00");
  const dayLabel = d.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" });
  const shortDay = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  const hours = Math.floor(minutes / 60);
  const mins  = minutes % 60;
  const durLabel = hours > 0 ? `${hours} sa${mins > 0 ? " " + mins + " dk" : ""}` : `${mins} dk`;

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setPinned(false);
      setOpen(false);
    }, 320); // kitap ile popup arasındaki boşluğu geçerken kapanmasın
  };

  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const handleMouseEnterBook = () => {
    cancelClose();
    if (bookRef.current) {
      const rect = bookRef.current.getBoundingClientRect();
      setPopupPos({ x: rect.left + rect.width / 2, y: rect.top - 14 });
    }
    setOpen(true);
  };

  const handleClick = () => {
    cancelClose();
    if (pinned) {
      setPinned(false);
      setOpen(false);
    } else {
      if (bookRef.current) {
        const rect = bookRef.current.getBoundingClientRect();
        setPopupPos({ x: rect.left + rect.width / 2, y: rect.top - 14 });
      }
      setPinned(true);
      setOpen(true);
    }
  };

  return (
    <>
      {/* Popup — position:fixed ile overflow kırpmasından bağımsız */}
      {open && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={pinned ? undefined : scheduleClose}
          style={{
            position: "fixed",
            left: popupPos.x,
            top: popupPos.y,
            transform: "translateX(-50%) translateY(-100%)",
            zIndex: 9999,
            minWidth: 148,
            pointerEvents: "auto",
          }}
        >
          <div style={{
            background: "rgba(10,6,24,0.98)",
            border: `1px solid ${spine}bb`,
            borderRadius: 13,
            padding: "11px 15px",
            boxShadow: `0 12px 36px rgba(0,0,0,0.65), 0 0 0 1px ${spine}22`,
            color: "#fff",
            lineHeight: 1.55,
          }}>
            <div style={{
              fontWeight: 800, fontSize: ".8rem",
              marginBottom: 8, paddingBottom: 7,
              borderBottom: `1px solid ${spine}44`,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 5,
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span>📅</span> {dayLabel}
              </span>
              {pinned && (
                <span
                  onClick={(e) => { e.stopPropagation(); setPinned(false); setOpen(false); }}
                  style={{ cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: ".75rem", lineHeight: 1, padding: "0 2px" }}
                  title="Kapat"
                >✕</span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
                <span style={{ color: "rgba(255,255,255,0.42)", fontSize: ".7rem" }}>Süre</span>
                <span style={{ fontWeight: 800, fontSize: ".83rem", color: "#a78bfa" }}>{durLabel}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
                <span style={{ color: "rgba(255,255,255,0.42)", fontSize: ".7rem" }}>Oturum</span>
                <span style={{ fontWeight: 800, fontSize: ".83rem", color: "#34d399" }}>{sessionCount}×</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
                <span style={{ color: "rgba(255,255,255,0.42)", fontSize: ".7rem" }}>Ort.</span>
                <span style={{ fontWeight: 800, fontSize: ".83rem", color: "#60a5fa" }}>{Math.round(minutes / sessionCount)} dk</span>
              </div>
            </div>
          </div>
          {/* Aşağı ok */}
          <div style={{
            width: 0, height: 0, margin: "0 auto",
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: `7px solid ${spine}bb`,
          }} />
        </div>
      )}

      {/* Kitap */}
      <div
        ref={bookRef}
        style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
        onMouseEnter={handleMouseEnterBook}
        onMouseLeave={pinned ? undefined : scheduleClose}
        onClick={handleClick}
      >
        <div style={{
          width: w, height: h, position: "relative",
          transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
          transformOrigin: "bottom center",
          transform: open ? "translateY(-10px)" : "translateY(0)",
        }}>
          <div style={{
            position: "absolute", inset: 0, background: bg,
            borderRadius: "2px 4px 4px 2px",
            boxShadow: `inset -3px 0 6px rgba(0,0,0,0.2), 3px 3px 10px rgba(0,0,0,0.35)${open ? ", 0 0 0 2px " + spine : ""}`,
            transition: "box-shadow 0.2s",
          }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: spine, borderRadius: "2px 0 0 2px" }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotate(-90deg)",
            fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.88)",
            whiteSpace: "nowrap", letterSpacing: ".3px",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}>{shortDay}</div>
        </div>
      </div>
    </>
  );
}

function Book({ session, index }: { session: Session; index: number }) {
  const h = session.plannedDuration >= 90 ? 100 : session.plannedDuration >= 50 ? 80 : 60;
  const w = session.plannedDuration >= 90 ? 24 : session.plannedDuration >= 50 ? 18 : 14;
  const palettes = [["#1e3a8a","#2d4fa0"],["#c2410c","#d4510f"],["#065f46","#0a7a5c"],["#4c1d95","#6b2cb5"],["#7c2d12","#9a3a18"],["#1e40af","#2563eb"],["#7c3aed","#8b5cf6"],["#92400e","#b45309"]];
  const [bg, spine] = palettes[index % palettes.length];
  const icon = session.plannedDuration >= 90 ? "📕" : session.plannedDuration >= 50 ? "📗" : session.plannedDuration === 0 ? "📓" : "📖";
  return (
    <div title={`${session.actualDuration}dk · ${session.date}`}
      style={{ width: w, height: h, position: "relative", cursor: "default", transition: "transform 0.2s", transformOrigin: "bottom center" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
    >
      <div style={{ position: "absolute", inset: 0, background: bg, borderRadius: "2px 4px 4px 2px", boxShadow: "inset -3px 0 6px rgba(0,0,0,0.2), 2px 2px 8px rgba(0,0,0,0.3)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: spine, borderRadius: "2px 0 0 2px" }} />
      <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", fontSize: h > 70 ? 10 : 8 }}>{icon}</div>
      <div style={{ position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)", fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{session.actualDuration}dk</div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function GoalCard({ todayMin, goalMin, animal, onPress, T, isDark }: { todayMin: number; goalMin: number; animal: string; onPress: () => void; T: Theme; isDark: boolean }) {
  const pct = goalMin > 0 ? Math.min(100, (todayMin / goalMin) * 100) : 0;
  const goalMet = pct >= 100;

  // Segment sayısı — milestone hissi verir
  const SEGMENTS = 10;
  const filledSegments = Math.round((pct / 100) * SEGMENTS);

  const motivText = goalMet
    ? "Hedefine ulaştın! 🎉"
    : pct >= 75 ? "Neredeyse bitti! 💪"
    : pct >= 50 ? "Harika gidiyorsun!"
    : pct >= 25 ? "İyi başlangıç!"
    : todayMin > 0 ? "Devam et!"
    : "Bugün çalışmaya başla!";

  const accentColor = goalMet ? "#4A9E8E" : pct >= 75 ? "#f59e0b" : "#9B6FE8";

  return (
    <div
      onClick={onPress}
      style={{
        borderRadius: 20, marginBottom: 20, overflow: "hidden",
        border: `1px solid ${goalMet ? "rgba(74,158,142,0.35)" : "rgba(155,111,232,0.2)"}`,
        cursor: "pointer",
        background: isDark
          ? `linear-gradient(135deg, ${goalMet ? "rgba(74,158,142,0.1)" : "rgba(155,111,232,0.1)"}, rgba(74,107,232,0.06))`
          : `linear-gradient(135deg, ${goalMet ? "rgba(74,158,142,0.07)" : "rgba(155,111,232,0.06)"}, rgba(74,107,232,0.04))`,
        transition: "border-color 0.5s, background 0.5s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 14 }}>
        {/* Maskot — hedef tutunca zıplar */}
        <div style={{
          width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          animation: goalMet ? "goal-bounce 0.6s ease" : "none",
        }}>
          <AnimalImg id={animal} size={58} />
        </div>

        {/* İçerik */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {goalMin === 0 ? (
            <>
              <div style={{ color: T.text, fontWeight: 700, fontSize: ".88rem", marginBottom: 3 }}>Günlük Hedef</div>
              <div style={{ color: T.textSub, fontSize: ".76rem", marginBottom: 10 }}>Hedef belirleyerek motivasyonunu artır</div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(155,111,232,0.15)", border: "1px solid rgba(155,111,232,0.3)",
                borderRadius: 8, padding: "4px 10px",
                color: "#9B6FE8", fontSize: ".76rem", fontWeight: 700,
              }}>
                <span>+</span><span>Hedef Belirle</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: T.text, fontWeight: 700, fontSize: ".88rem" }}>Günlük Hedef</span>
                <span style={{ color: T.textSub, fontSize: ".72rem" }}>✏️ düzenle</span>
              </div>

              {/* Süre göstergesi */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ color: accentColor, fontWeight: 800, fontSize: "1.15rem", transition: "color 0.5s" }}>
                  {fmtMin(todayMin)}
                </span>
                <span style={{ color: T.textMuted, fontSize: ".78rem" }}>/ {fmtMin(goalMin)}</span>
                {goalMet && <span style={{ fontSize: ".75rem", marginLeft: 2 }}>✓</span>}
              </div>

              {/* Segmentli progress bar */}
              <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                {Array.from({ length: SEGMENTS }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 5, borderRadius: 3,
                    background: i < filledSegments
                      ? (goalMet ? "#4A9E8E" : i < 7 ? "#9B6FE8" : "#f59e0b")
                      : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"),
                    transition: `background 0.3s ease ${i * 0.04}s`,
                    transform: i < filledSegments && goalMet ? "scaleY(1.3)" : "scaleY(1)",
                    transformOrigin: "center",
                  }} />
                ))}
              </div>

              {/* Motivasyon + yüzde */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ color: accentColor, fontSize: ".72rem", fontWeight: 600, transition: "color 0.5s" }}>{motivText}</div>
                <div style={{ color: T.textMuted, fontSize: ".7rem", fontWeight: 700 }}>{Math.round(pct)}%</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GoalProgressBar({ todayMin, goalMin, animal, T, isDark }: { todayMin: number; goalMin: number; animal: string; T: Theme; isDark: boolean }) {
  return <GoalCard todayMin={todayMin} goalMin={goalMin} animal={animal} onPress={() => {}} T={T} isDark={isDark} />;
}

// ─── Kutlama ──────────────────────────────────────────────────────────────────
function CelebrationBg() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: `${(i * 4.2) % 100}%`, top: "-20px", fontSize: `${1 + (i % 3) * 0.4}rem`, animation: `confetti-fall ${2.5 + (i % 4) * 0.6}s linear ${(i % 5) * 0.4}s infinite` }}>
          {["🎉","⭐","✨","🌟","🎊","💫"][i % 6]}
        </div>
      ))}
    </div>
  );
}


// ─── Dijital Saat Segmenti ────────────────────────────────────────────────────
// 7-segment display karakterleri
const SEG_MAP: Record<string, number[]> = {
  "0":[1,1,1,1,1,1,0],"1":[0,1,1,0,0,0,0],"2":[1,1,0,1,1,0,1],
  "3":[1,1,1,1,0,0,1],"4":[0,1,1,0,0,1,1],"5":[1,0,1,1,0,1,1],
  "6":[1,0,1,1,1,1,1],"7":[1,1,1,0,0,0,0],"8":[1,1,1,1,1,1,1],
  "9":[1,1,1,1,0,1,1],":":[0,0,0,0,0,0,0],
};

function SevenSeg({ char, size = 40 }: { char: string; size?: number }) {
  const segs = SEG_MAP[char] ?? [0,0,0,0,0,0,0];
  const w = size * 0.55;
  const h = size;
  const t = size * 0.08; // kalınlık
  const g = size * 0.03; // boşluk
  const on  = "#ff5500";
  const off = "#1a0800";
  const glow = `0 0 ${size*0.18}px #ff4400, 0 0 ${size*0.35}px #ff220044`;

  if (char === ":") {
    return (
      <div style={{ width: w * 0.4, height: h, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around", paddingBlock: h * 0.22 }}>
        <div style={{ width: t * 1.2, height: t * 1.2, borderRadius: "50%", background: on, boxShadow: glow }} />
        <div style={{ width: t * 1.2, height: t * 1.2, borderRadius: "50%", background: on, boxShadow: glow }} />
      </div>
    );
  }

  // Segment pozisyonları: top, top-right, bot-right, bottom, bot-left, top-left, middle
  const segStyle = (active: boolean) => ({
    background: active ? on : off,
    boxShadow: active ? glow : "none",
    borderRadius: t * 0.6,
    position: "absolute" as const,
    transition: "all 0.1s",
  });

  const hw = w - t * 2 - g * 2; // yatay segment genişliği
  const vh = (h / 2) - t * 1.5 - g; // dikey segment yüksekliği

  return (
    <div style={{ width: w, height: h, position: "relative" }}>
      {/* top */}
      <div style={{ ...segStyle(!!segs[0]), left: t + g, top: 0, width: hw, height: t }} />
      {/* top-right */}
      <div style={{ ...segStyle(!!segs[1]), right: 0, top: t + g, width: t, height: vh }} />
      {/* bot-right */}
      <div style={{ ...segStyle(!!segs[2]), right: 0, bottom: t + g, width: t, height: vh }} />
      {/* bottom */}
      <div style={{ ...segStyle(!!segs[3]), left: t + g, bottom: 0, width: hw, height: t }} />
      {/* bot-left */}
      <div style={{ ...segStyle(!!segs[4]), left: 0, bottom: t + g, width: t, height: vh }} />
      {/* top-left */}
      <div style={{ ...segStyle(!!segs[5]), left: 0, top: t + g, width: t, height: vh }} />
      {/* middle */}
      <div style={{ ...segStyle(!!segs[6]), left: t + g, top: "50%", transform: "translateY(-50%)", width: hw, height: t }} />
    </div>
  );
}

function DigitalDisplay({ value, size = 40, isDark = true }: { value: string; size?: number; isDark?: boolean }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: size * 0.04,
      background: isDark ? "#080400" : "#1a1a2e",
      borderRadius: size * 0.2,
      padding: `${size * 0.2}px ${size * 0.25}px`,
      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(255,60,0,0.08), 0 2px 4px rgba(0,0,0,0.5)",
      border: "1px solid #1a0800",
    }}>
      {value.split("").map((ch, i) => (
        <SevenSeg key={i} char={ch} size={size} />
      ))}
    </div>
  );
}

// ─── Görevler Sekmesi ────────────────────────────────────────────────────────
function TasksTab({
  tasks, onAdd, onToggle, onDelete, selectedSubject, customSubjects, T, isDark,
}: {
  tasks: Task[];
  onAdd: (text: string, subject: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  selectedSubject: string;
  customSubjects: string[];
  T: Theme;
  isDark: boolean;
}) {
  const [newText, setNewText]       = useState("");
  const [newSubject, setNewSubject] = useState(selectedSubject);
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pending   = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);
  const allSubjects = [...Array.from(new Set(SUBJECT_GROUPS.flatMap(g => g.subjects))), ...customSubjects];

  const handleAdd = () => {
    const text = newText.trim();
    if (!text) return;
    onAdd(text, newSubject);
    setNewText("");
    inputRef.current?.focus();
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Başlık */}
      <div>
        <h2 style={{ color: T.text, fontSize: "1.3rem", fontWeight: 800, margin: "0 0 4px" }}>📝 Bugünün Görevleri</h2>
        <p style={{ color: T.textSub, fontSize: ".82rem", margin: 0 }}>
          {pending.length > 0 ? `${pending.length} bekliyor · ${completed.length} tamamlandı` : completed.length > 0 ? "Tüm görevler tamamlandı! 🎉" : "Henüz görev yok. Ekle ve başla!"}
        </p>
      </div>

      {/* Görev ekleme kutusu */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 18 }}>
        {/* Ders seçici */}
        <button
          onClick={() => setShowPicker(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 7, marginBottom: 12,
            background: `${subjectColor(newSubject)}18`,
            border: `1px solid ${subjectColor(newSubject)}55`,
            borderRadius: 10, padding: "6px 12px", cursor: "pointer",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 4, background: subjectColor(newSubject) }} />
          <span style={{ color: subjectColor(newSubject), fontWeight: 700, fontSize: ".8rem" }}>{newSubject}</span>
          <span style={{ color: T.textMuted, fontSize: ".75rem" }}>▾</span>
        </button>

        {/* Mini ders picker */}
        {showPicker && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, padding: "10px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
            {allSubjects.map(s => (
              <button key={s} onClick={() => { setNewSubject(s); setShowPicker(false); }}
                style={{
                  background: newSubject === s ? `${subjectColor(s)}22` : T.surface2,
                  border: `1px solid ${newSubject === s ? subjectColor(s) : T.border}`,
                  borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                  color: newSubject === s ? subjectColor(s) : T.textSub,
                  fontSize: ".76rem", fontWeight: newSubject === s ? 700 : 400,
                }}
              >{s}</button>
            ))}
          </div>
        )}

        {/* Görev giriş alanı */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
            placeholder="Görev yaz... (ör. Türev soruları çöz)"
            style={{
              flex: 1, background: T.surface2, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "11px 14px", color: T.text,
              fontSize: ".88rem", outline: "none", fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!newText.trim()}
            style={{
              background: newText.trim() ? "#9B6FE8" : T.surface2,
              border: "none", borderRadius: 10, padding: "11px 18px",
              color: newText.trim() ? "#fff" : T.textMuted,
              fontWeight: 700, cursor: newText.trim() ? "pointer" : "default",
              fontSize: ".88rem", transition: "all 0.2s", flexShrink: 0,
            }}
          >+ Ekle</button>
        </div>
      </div>

      {/* Bekleyen görevler */}
      {pending.length > 0 && (
        <div>
          <div style={{ color: T.textSub, fontSize: ".72rem", fontWeight: 700, letterSpacing: ".08em", marginBottom: 10 }}>BEKLEYEN · {pending.length}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pending.map(task => (
              <div key={task.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: "13px 16px",
                transition: "all 0.2s",
              }}>
                {/* Checkbox */}
                <button
                  onClick={() => onToggle(task.id)}
                  style={{
                    width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                    border: `2px solid ${subjectColor(task.subject)}`,
                    background: "transparent", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                />
                {/* Ders etiketi + metin */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: subjectColor(task.subject), flexShrink: 0 }} />
                    <span style={{ color: subjectColor(task.subject), fontSize: ".7rem", fontWeight: 700 }}>{task.subject}</span>
                  </div>
                  <span style={{ color: T.text, fontSize: ".88rem", fontWeight: 500 }}>{task.text}</span>
                </div>
                {/* Sil */}
                <button
                  onClick={() => onDelete(task.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: "1rem", padding: 4, flexShrink: 0, lineHeight: 1 }}
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tamamlanan görevler */}
      {completed.length > 0 && (
        <div>
          <div style={{ color: T.textSub, fontSize: ".72rem", fontWeight: 700, letterSpacing: ".08em", marginBottom: 10 }}>TAMAMLANDI · {completed.length}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {completed.map(task => (
              <div key={task.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: T.surface2, border: `1px solid ${T.borderSoft}`,
                borderRadius: 14, padding: "13px 16px", opacity: 0.6,
              }}>
                {/* Checkbox dolu */}
                <button
                  onClick={() => onToggle(task.id)}
                  style={{
                    width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                    border: `2px solid #4A9E8E`,
                    background: "#4A9E8E", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: ".75rem",
                  }}
                >✓</button>
                {/* Metin üzeri çizili */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ color: T.textMuted, fontSize: ".7rem" }}>{task.subject}</span>
                  </div>
                  <span style={{ color: T.textMuted, fontSize: ".88rem", textDecoration: "line-through" }}>{task.text}</span>
                </div>
                {/* Sil */}
                <button
                  onClick={() => onDelete(task.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: "1rem", padding: 4, flexShrink: 0, lineHeight: 1 }}
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boş durum */}
      {tasks.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>📋</div>
          <p style={{ color: T.textSub, fontSize: ".9rem", margin: 0 }}>Bugün için görev ekle,<br />ne çalışacağını planla!</p>
        </div>
      )}
    </div>
  );
}

// ─── Sınav Sekmesi ────────────────────────────────────────────────────────────
const EXAMS = [
  {
    id: "lgs-sozel",
    group: "LGS",
    label: "Sözel",
    duration: 75,
    color: "#7c3aed",
    accent: "#a78bfa",
    icon: "📝",
    desc: "75 dakika",
  },
  {
    id: "lgs-sayisal",
    group: "LGS",
    label: "Sayısal",
    duration: 80,
    color: "#7c3aed",
    accent: "#a78bfa",
    icon: "📐",
    desc: "80 dakika",
  },
  {
    id: "yks-tyt",
    group: "YKS",
    label: "TYT",
    duration: 165,
    color: "#0e7490",
    accent: "#22d3ee",
    icon: "📋",
    desc: "165 dakika",
  },
  {
    id: "yks-ayt",
    group: "YKS",
    label: "AYT",
    duration: 180,
    color: "#0e7490",
    accent: "#22d3ee",
    icon: "🎯",
    desc: "180 dakika",
  },
];

function SinavTab({ T, isDark }: { T: Theme; isDark: boolean }) {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [examPhase, setExamPhase] = useState<"idle" | "countdown" | "running" | "done">("idle");
  const [examSeconds, setExamSeconds] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [now, setNow] = useState(new Date());
  const examEndRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    clockRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);

  const exam = EXAMS.find(e => e.id === selectedExam);

  const startExam = () => {
    if (!exam) return;
    setCountdown(5);
    setExamPhase("countdown");
    if (intervalRef.current) clearInterval(intervalRef.current);
    let c = 5;
    intervalRef.current = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(intervalRef.current!);
        // Geri sayım bitti, sınavı başlat
        const end = Date.now() + exam.duration * 60 * 1000;
        examEndRef.current = end;
        setExamPhase("running");
        setExamSeconds(exam.duration * 60);
        intervalRef.current = setInterval(() => {
          const rem = Math.max(0, Math.round((examEndRef.current - Date.now()) / 1000));
          setExamSeconds(rem);
          if (rem <= 0) {
            clearInterval(intervalRef.current!);
            setExamPhase("done");
          }
        }, 500);
      } else {
        setCountdown(c);
      }
    }, 1000);
  };

  const resetExam = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setExamPhase("idle");
    setExamSeconds(0);
    setCountdown(5);
  };

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const fmtExamTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  };

  const fmtClock = (d: Date) => {
    return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`;
  };

  const totalSec = exam ? exam.duration * 60 : 1;
  const pct = examPhase === "running" ? ((totalSec - examSeconds) / totalSec) * 100 : examPhase === "done" ? 100 : 0;
  const isUrgent = examPhase === "running" && examSeconds <= 300; // son 5 dakika

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ color: T.text, fontSize: "1.4rem", fontWeight: 800, margin: "0 0 6px" }}>🎓 Gerçek Sınav Atmosferi</h2>
        <p style={{ color: T.textSub, fontSize: ".85rem", margin: 0 }}>Sınavını seç ve gerçek koşullarda çalış</p>
      </div>

      {/* Sınav seçimi */}
      {examPhase === "idle" && (
        <div style={{ width: "100%", maxWidth: 580 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {["LGS", "YKS"].map(group => (
              <div key={group}>
                <div style={{ color: T.textSub, fontSize: ".72rem", fontWeight: 700, letterSpacing: ".08em", marginBottom: 8, textAlign: "center" }}>{group}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {EXAMS.filter(e => e.group === group).map(e => (
                    <button key={e.id}
                      onClick={() => setSelectedExam(e.id)}
                      style={{
                        background: selectedExam === e.id ? `${e.color}33` : T.surface2,
                        border: `2px solid ${selectedExam === e.id ? e.accent : T.border}`,
                        borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                        transition: "all 0.2s", textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.4rem" }}>{e.icon}</span>
                        <div>
                          <div style={{ color: selectedExam === e.id ? e.accent : T.text, fontWeight: 800, fontSize: ".95rem" }}>{e.group} — {e.label}</div>
                          <div style={{ color: T.textSub, fontSize: ".78rem", marginTop: 2 }}>{e.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={startExam}
            disabled={!selectedExam}
            style={{
              width: "100%", padding: "15px", borderRadius: 14, border: "none",
              background: selectedExam ? (exam?.color ?? "#3b82f6") : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"),
              color: selectedExam ? (isDark ? "white" : "#fff") : T.textMuted,
              fontSize: "1rem", fontWeight: 700, cursor: selectedExam ? "pointer" : "not-allowed",
              boxShadow: selectedExam ? `0 8px 24px ${exam?.color ?? "#3b82f6"}55` : "none",
              transition: "all 0.3s",
            }}
          >
            {selectedExam ? `🚀 ${exam?.group} ${exam?.label} Sınavını Başlat` : "↑ Önce bir sınav seç"}
          </button>
        </div>
      )}

      {/* ── Geri sayım ── */}
      {examPhase === "countdown" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontSize: ".85rem", fontWeight: 700, letterSpacing: ".1em" }}>
            {exam?.group} — {exam?.label} başlıyor...
          </div>
          <div style={{
            width: 140, height: 140, borderRadius: "50%",
            background: "#080400",
            border: `4px solid ${exam?.accent ?? "#ff5500"}`,
            boxShadow: `0 0 40px ${exam?.accent ?? "#ff5500"}66, inset 0 0 30px rgba(0,0,0,0.8)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "countdown-pulse 1s ease-in-out infinite",
          }}>
            <span style={{
              fontSize: "4.5rem", fontWeight: 900,
              color: "#ff5500",
              textShadow: "0 0 20px #ff4400, 0 0 40px #ff220088",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}>
              {countdown}
            </span>
          </div>
          <div style={{ color: T.textSub, fontSize: ".8rem" }}>Hazır ol!</div>
          <button onClick={resetExam} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontSize: ".8rem" }}>
            İptal
          </button>
        </div>
      )}

      {/* Çalışıyor */}
      {(examPhase === "running" || examPhase === "done") && (
        <div style={{ width: "100%", maxWidth: 580, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Sınav başlığı */}
          <div style={{ textAlign: "center" }}>
            <div style={{ color: exam?.accent, fontSize: ".82rem", fontWeight: 700, letterSpacing: ".1em", marginBottom: 4 }}>
              {exam?.group} — {exam?.label}
            </div>
            {examPhase === "done" && (
              <div style={{ color: "#10b981", fontSize: "1.1rem", fontWeight: 800 }}>✓ Süre Doldu! Tebrikler!</div>
            )}
          </div>

          {/* Geri sayım - dijital */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontSize: ".72rem", fontWeight: 700, letterSpacing: ".1em" }}>
              {examPhase === "done" ? "TAMAMLANDI" : "KALAN SÜRE"}
            </div>
            <DigitalDisplay
              value={fmtExamTime(examSeconds)}
              size={examSeconds >= 3600 ? 34 : 44}
            isDark={isDark} />
          </div>

          {/* Şimdiki saat */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontSize: ".72rem", fontWeight: 700, letterSpacing: ".1em" }}>ŞİMDİKİ SAAT</div>
            <DigitalDisplay value={fmtClock(now)} size={32} isDark={isDark} />
          </div>

          {/* İlerleme çubuğu */}
          <div style={{ position: "relative", height: 10, background: T.surface, borderRadius: 5 }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${pct}%`,
              background: examPhase === "done" ? "#10b981" : isUrgent ? "linear-gradient(90deg,#ef4444,#f97316)" : `linear-gradient(90deg,${exam?.color},${exam?.accent})`,
              borderRadius: 5,
              transition: "width 0.5s ease",
              boxShadow: isUrgent ? "0 0 12px #ef444488" : "none",
            }} />
          </div>

          {/* Son 5 dk uyarısı */}
          {isUrgent && (
            <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
              <p style={{ color: "#fca5a5", margin: 0, fontWeight: 700, fontSize: ".88rem" }}>⚠️ Son 5 dakika! Cevaplarını kontrol et!</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={resetExam} style={{ flex: 1, background: T.surface, border: "none", borderRadius: 12, padding: 13, color: T.text, fontWeight: 600, cursor: "pointer", fontSize: ".9rem" }}>
              ← Geri Dön
            </button>
            {examPhase === "running" && (
              <button onClick={resetExam} style={{ flex: 2, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 12, padding: 13, color: "#fca5a5", fontWeight: 700, cursor: "pointer", fontSize: ".9rem" }}>
                Sınavı Bitir
              </button>
            )}
          </div>
        </div>
      )}

      {/* Saat her zaman göster (idle modda) */}
      {examPhase === "idle" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontSize: ".72rem", fontWeight: 700, letterSpacing: ".1em" }}>ŞİMDİKİ SAAT</div>
          <DigitalDisplay value={fmtClock(now)} size={36} isDark={isDark} />
        </div>
      )}
    </div>
  );
}

// ─── Hayvan Yol Arkadaşı ─────────────────────────────────────────────────────
const COMPANION_MESSAGES = {
  idle:  ["Hadi başlayalım! 📚", "Seninle çalışmaya hazırım!", "Bugün harika olacak! ✨"],
  work:  ["Süper gidiyorsun! 💪", "Odaklan, yapabilirsin!", "Beraber başarırız! 🔥", "Harika! Devam et!", "Sen çalışırken ben de buradayım 📖"],
  rest:  ["Molayı hak ettin!", "Biraz nefes al 😌", "Hemen döneceğiz!", "Su iç, gözlerini dinlendir 💙"],
  done:  ["Muhteşemsin! 🎉", "Tebrikler, harika iş!", "Bunu hak ettin! ⭐"],
};

const AnimalCompanion = memo(function AnimalCompanion({ animalId, phase, isDark }: { animalId: string; phase: "idle"|"work"|"rest"; isDark: boolean }) {
  const [bubble, setBubble] = useState<string | null>(null);
  const [showBubble, setShowBubble] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getMsg = useCallback((p: string) => {
    const msgs = COMPANION_MESSAGES[p as keyof typeof COMPANION_MESSAGES] ?? COMPANION_MESSAGES.idle;
    return msgs[Math.floor(Math.random() * msgs.length)];
  }, []);

  // Faz değişince mesaj göster
  useEffect(() => {
    setBubble(getMsg(phase));
    setShowBubble(true);
    setIsStudying(phase === "work");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowBubble(false), 3500);
  }, [phase]);

  // Periyodik mesajlar
  useEffect(() => {
    const interval = setInterval(() => {
      setBubble(getMsg(phase));
      setShowBubble(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowBubble(false), 3500);
    }, 18000); // 18 saniyede bir
    return () => clearInterval(interval);
  }, [phase]);

  // Tıklanınca mesaj
  const handleClick = () => {
    setBubble(getMsg(phase));
    setShowBubble(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowBubble(false), 3000);
  };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
      onClick={handleClick}
      title="Tıkla, konuşsun!"
    >
      {/* Konuşma balonu */}
      <div style={{
        position: "absolute", bottom: "100%", left: "50%",
        marginBottom: 10, zIndex: 10,
        opacity: showBubble ? 1 : 0,
        transform: `translateX(-50%) translateY(${showBubble ? 0 : 6}px)`,
        transition: "opacity 0.3s, transform 0.3s",
        pointerEvents: "none",
        minWidth: 140, maxWidth: 200,
      }}>
        <div style={{
          background: "white", color: "#1a1a2e",
          borderRadius: 14, padding: "8px 14px",
          fontSize: ".8rem", fontWeight: 600, textAlign: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          lineHeight: 1.4,
          position: "relative",
        }}>
          {bubble}
          {/* Balonun oku */}
          <div style={{
            position: "absolute", bottom: -7, left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "7px solid white",
          }} />
        </div>
      </div>

      {/* Hayvan + sahne */}
      <div style={{
        background: "#1A1A1A",
        borderRadius: 20, padding: "14px 20px 10px",
        border: "1px solid #2A2A2A",
        transition: "box-shadow 0.3s",
        boxShadow: phase === "work" ? "0 0 20px rgba(59,130,246,0.15)" : "none",
        display: "inline-block",
      }}>
        {/* Masa üstü: hayvan + yanındaki nesneler */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>

          {/* Sol: kitaplar dik duruyor */}
          {isStudying && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, paddingBottom: 2 }}>
              {/* Dikey kitap sırtları */}
              {[
                { h: 44, w: 10, bg: "#1e3a8a" },
                { h: 38, w: 9,  bg: "#7c3aed" },
                { h: 50, w: 11, bg: "#065f46" },
                { h: 34, w: 8,  bg: "#c2410c" },
              ].map((b, i) => (
                <div key={i} style={{
                  width: b.w, height: b.h,
                  background: b.bg,
                  borderRadius: "2px 3px 3px 2px",
                  boxShadow: "inset -2px 0 4px rgba(0,0,0,0.3), 1px 1px 4px rgba(0,0,0,0.3)",
                  flexShrink: 0,
                }} />
              ))}
            </div>
          )}

          {/* Orta: hayvan oturur */}
          <div style={{ flexShrink: 0 }}>
            <AnimalImg id={animalId} size={54} />
          </div>

          {/* Sağ: mola çayı */}
          {phase === "rest" && (
            <div style={{ fontSize: "1.3rem", paddingBottom: 4, animation: "steam 2s ease-in-out infinite" }}>☕</div>
          )}
        </div>

        {/* Masa tahtası */}
        <div style={{
          height: 8, marginTop: 4,
          background: "linear-gradient(90deg, #8b6914, #c8941a, #8b6914)",
          borderRadius: 4, boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
        }} />
        {/* Masa bacakları */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 10px" }}>
          <div style={{ width: 6, height: 14, background: "#8b6914", borderRadius: "0 0 3px 3px" }} />
          <div style={{ width: 6, height: 14, background: "#8b6914", borderRadius: "0 0 3px 3px" }} />
        </div>
      </div>
      <div style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", fontSize: ".68rem", marginTop: 6 }}>
        Tıkla, konuşsun! 👆
      </div>
    </div>
  );
});


// ─── Rapor Paylaşım Butonu ────────────────────────────────────────────────────
function ReportShareButton({ todayMin, todaySessions, weekMin, totalSessions, streak, isDark, T }: {
  todayMin: number; todaySessions: number; weekMin: number;
  totalSessions: number; streak: number; isDark: boolean; T: Theme;
}) {
  const [loading, setLoading] = useState(false);

  const buildCanvas = (): Promise<HTMLCanvasElement> => new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const W = 540, H = 960;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Arka plan
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0f1f4f");
    bg.addColorStop(0.6, "#1e3a8a");
    bg.addColorStop(1, "#1a0a30");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Dekoratif daireler
    ctx.beginPath(); ctx.arc(W + 50, -50, 200, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(249,115,22,0.1)"; ctx.fill();
    ctx.beginPath(); ctx.arc(-50, H + 50, 180, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(99,102,241,0.12)"; ctx.fill();

    // Nokta grid
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    for (let x = 20; x < W; x += 32) for (let y = 20; y < H; y += 32) {
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
    };

    // Üst başlık
    ctx.fillStyle = "rgba(249,115,22,0.18)"; rr(W/2-100,130,200,34,17); ctx.fill();
    ctx.fillStyle = "#fdba74"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("✦  İSTATİSTİKLERİM  ✦", W/2, 153);

    // Tarih
    const months = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    const d = new Date();
    const dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    ctx.fillStyle = "rgba(147,197,253,0.6)"; ctx.font = "14px sans-serif";
    ctx.fillText(dateStr, W/2, 190);

    // Stat kartları
    const stats = [
      { label: "Bugün", val: todayMin > 0 ? (todayMin >= 60 ? `${Math.floor(todayMin/60)}sa ${todayMin%60}dk` : `${todayMin}dk`) : "0dk", sub: `${todaySessions} oturum`, color: "#E8454A" },
      { label: "Bu Hafta", val: weekMin > 0 ? (weekMin >= 60 ? `${Math.floor(weekMin/60)}sa` : `${weekMin}dk`) : "0dk", sub: "çalışma süresi", color: "#4A9E8E" },
      { label: "Toplam", val: `${totalSessions}`, sub: "oturum", color: "#4A6BE8" },
      { label: "Seri", val: streak > 0 ? `${streak} 🔥` : "0", sub: "günlük seri", color: "#f97316" },
    ];

    const cardW = 220, cardH = 110, gap = 20;
    const startX = (W - (cardW * 2 + gap)) / 2;
    const startY = 240;

    stats.forEach((s, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = startX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);
      ctx.fillStyle = "rgba(255,255,255,0.07)"; rr(x, y, cardW, cardH, 16); ctx.fill();
      ctx.strokeStyle = `${s.color}44`; ctx.lineWidth = 1.5; rr(x, y, cardW, cardH, 16); ctx.stroke();
      ctx.fillStyle = s.color; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(s.label.toUpperCase(), x + 16, y + 24);
      ctx.fillStyle = "white"; ctx.font = `bold 32px sans-serif`; ctx.textAlign = "center";
      ctx.fillText(s.val, x + cardW/2, y + 68);
      ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.font = "12px sans-serif";
      ctx.fillText(s.sub, x + cardW/2, y + 90);
    });

    // Streak mesajı
    if (streak >= 3) {
      const msg = streak >= 30 ? "Efsane seri! 🏆" : streak >= 14 ? "İnanılmaz! 💎" : streak >= 7 ? "Bir hafta! 🌟" : "Harika gidiyorsun!";
      ctx.fillStyle = "rgba(255,255,255,0.08)"; rr(W/2-130, 720, 260, 44, 12); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(msg, W/2, 748);
    }

    // Alt logo
    ctx.fillStyle = "rgba(255,255,255,0.05)"; rr(W/2-140, H-160, 280, 72, 16); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.88)"; ctx.font = "bold 17px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("ogrencikocuadana.com", W/2, H-130);
    ctx.fillStyle = "rgba(147,197,253,0.55)"; ctx.font = "13px sans-serif";
    ctx.fillText("LGS & YKS Öğrenci Koçluğu", W/2, H-108);

    resolve(canvas);
  });

  const handleShare = async () => {
    setLoading(true);
    try {
      const canvas = await buildCanvas();
      const fileName = `istatistikler-${new Date().toISOString().slice(0,10)}.png`;
      if (navigator.canShare) {
        try {
          const blob = await new Promise<Blob>((res, rej) =>
            canvas.toBlob(b => b ? res(b) : rej(new Error("blob")), "image/png")
          );
          const file = new File([blob], fileName, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: "Pomodoro İstatistiklerim" });
            return;
          }
        } catch (e) {
          if ((e as DOMException).name === "AbortError") return;
        }
      }
      // Fallback: indir
      const link = document.createElement("a");
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      style={{
        width: "100%", marginTop: 18,
        padding: "14px 20px",
        background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
        color: "white", border: "none", borderRadius: 14,
        fontWeight: 700, fontSize: "0.92rem", cursor: loading ? "wait" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        opacity: loading ? 0.7 : 1,
        boxShadow: "0 4px 16px rgba(30,58,138,0.3)",
        transition: "all 0.2s",
      }}
    >
      <span>📤</span>
      {loading ? "Hazırlanıyor..." : "İstatistiklerimi Paylaş"}
    </button>
  );
}

// ─── Paylaşım Modalı ──────────────────────────────────────────────────────────
function ShareModal({ minutes, streak, isDark, T, onClose }: {
  minutes: number; streak: number; isDark: boolean; T: Theme; onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  const hours = Math.floor(minutes / 60);
  const mins  = minutes % 60;
  const timeStr = hours > 0 ? `${hours} sa ${mins > 0 ? mins + " dk" : ""}` : `${minutes} dk`;
  const dateStr = getTurkishDate();

  // Canvas kart oluştur
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1080x1920 story formatı — 0.5x render
    const W = 540, H = 960;
    canvas.width  = W;
    canvas.height = H;

    // Arka plan gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0f1f4f");
    bg.addColorStop(0.5, "#1e3a8a");
    bg.addColorStop(1, "#1e1040");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Dekoratif daire — sağ üst
    ctx.beginPath();
    ctx.arc(W + 60, -60, 220, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(249,115,22,0.12)";
    ctx.fill();

    // Dekoratif daire — sol alt
    ctx.beginPath();
    ctx.arc(-60, H + 60, 200, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(99,102,241,0.15)";
    ctx.fill();

    // Nokta grid deseni
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let x = 20; x < W; x += 32) {
      for (let y = 20; y < H; y += 32) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Üst rozet — "BUGÜN TAMAMLANDI"
    const rozetY = 160;
    ctx.fillStyle = "rgba(249,115,22,0.2)";
    roundRect(ctx, W/2 - 110, rozetY - 18, 220, 36, 18);
    ctx.fill();
    ctx.fillStyle = "#fdba74";
    ctx.font = "bold 13px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✦  BUGÜN TAMAMLANDI  ✦", W/2, rozetY + 5);

    // Ana süre
    ctx.fillStyle = "white";
    ctx.font = `bold ${minutes >= 60 ? 88 : 96}px -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(timeStr.trim(), W/2, H/2 - 60);

    // "çalıştım"
    ctx.font = "300 28px -apple-system, sans-serif";
    ctx.fillStyle = "rgba(191,219,254,0.9)";
    ctx.fillText("çalıştım 📚", W/2, H/2 - 10);

    // Ayırıcı çizgi
    const grad = ctx.createLinearGradient(80, 0, W - 80, 0);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.5, "rgba(255,255,255,0.2)");
    grad.addColorStop(1, "transparent");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, H/2 + 40);
    ctx.lineTo(W - 80, H/2 + 40);
    ctx.stroke();

    // Streak bilgisi
    if (streak > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      roundRect(ctx, W/2 - 90, H/2 + 65, 180, 52, 14);
      ctx.fill();
      const streakIcon = streak >= 30 ? "🏆" : streak >= 7 ? "💎" : "🔥";
      ctx.font = "bold 22px -apple-system, sans-serif";
      ctx.fillStyle = streak >= 7 ? "#fdba74" : "#f87171";
      ctx.fillText(`${streakIcon}  ${streak} günlük seri`, W/2, H/2 + 100);
    }

    // Tarih
    ctx.font = "16px -apple-system, sans-serif";
    ctx.fillStyle = "rgba(147,197,253,0.7)";
    ctx.fillText(dateStr, W/2, H/2 + 155);

    // Alt logo alanı
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundRect(ctx, W/2 - 140, H - 160, 280, 72, 16);
    ctx.fill();

    ctx.font = "bold 18px -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText("ogrencikocuadana.com", W/2, H - 130);

    ctx.font = "13px -apple-system, sans-serif";
    ctx.fillStyle = "rgba(147,197,253,0.6)";
    ctx.fillText("LGS & YKS Öğrenci Koçluğu", W/2, H - 108);

    setGenerated(true);
  }, []);

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  const shareOrDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fileName = `pomodoro-${dateStr.replace(/ /g, "-")}.png`;
    if (navigator.canShare) {
      try {
        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob(b => b ? res(b) : rej(new Error("blob failed")), "image/png")
        );
        const file = new File([blob], fileName, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Pomodoro İstatistiklerim" });
          return;
        }
      } catch (e) {
        if ((e as DOMException).name === "AbortError") return;
      }
    }
    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: isDark ? "#1a1a2e" : "white",
          borderRadius: 24, padding: "28px 24px",
          maxWidth: 380, width: "100%",
          border: `1px solid ${T.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ color: T.text, fontWeight: 800, fontSize: "1.1rem" }}>🎉 Harika iş!</div>
            <div style={{ color: T.textSub, fontSize: "0.82rem", marginTop: 2 }}>Arkadaşlarınla paylaş</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: "1.4rem", lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Canvas önizleme */}
        <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", aspectRatio: "9/16", maxHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1f4f" }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>

        {/* Butonlar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={shareOrDownload}
            disabled={!generated}
            style={{
              width: "100%", padding: "13px 20px",
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              color: "white", border: "none", borderRadius: 12,
              fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: generated ? 1 : 0.6,
            }}
          >
            <span>📤</span> Paylaş / İndir
          </button>
          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "11px 20px",
              background: "transparent",
              color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 12,
              fontWeight: 600, fontSize: "0.88rem", cursor: "pointer",
            }}
          >
            Şimdi değil
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kütüphane Sekmesi ────────────────────────────────────────────────────────
function LibraryTab({ sessions, T, isDark }: { sessions: Session[]; T: Theme; isDark: boolean }) {
  const dayMap: Record<string, number> = {};
  const daySessionCount: Record<string, number> = {};
  sessions.forEach(s => {
    dayMap[s.date] = (dayMap[s.date] ?? 0) + s.actualDuration;
    daySessionCount[s.date] = (daySessionCount[s.date] ?? 0) + 1;
  });
  const dailyBooks = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b));
  const totalMin = sessions.reduce((a, s) => a + s.actualDuration, 0);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <h2 style={{ color: T.text, fontSize: "1.3rem", fontWeight: 800, margin: "0 0 6px" }}>📚 Sanal Kütüphanem</h2>
        <p style={{ color: T.textSub, fontSize: ".82rem", margin: 0 }}>Her kitap bir günü temsil eder · üzerine gel veya tıkla</p>
      </div>
      {dailyBooks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: T.textMuted }}>
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>Henüz kitap yok</div>
          <div style={{ fontSize: ".85rem", marginTop: 8 }}>İlk oturumunu tamamla!</div>
        </div>
      ) : (
        <>
          <div style={{ background: T.surface, borderRadius: 20, padding: "48px 24px 0", border: `1px solid ${T.border}`, overflowX: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, minHeight: 130, paddingBottom: 12, minWidth: "max-content" }}>
              {dailyBooks.map(([date, minutes], i) => (
                <DailyBook key={date} date={date} minutes={minutes} index={i} sessionCount={daySessionCount[date] ?? 1} />
              ))}
            </div>
            <div style={{ height: 10, background: "linear-gradient(90deg,#8b6914,#c8941a,#8b6914)", borderRadius: "0 0 4px 4px", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }} />
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
            {[
              { label: "Aktif Gün",     val: dailyBooks.length },
              { label: "Toplam Dakika", val: totalMin },
              { label: "Toplam Saat",   val: Math.floor(totalMin / 60) },
            ].map((item, i) => (
              <div key={i} style={{ flex: 1, background: T.surface, borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ color: T.text, fontSize: "1.6rem", fontWeight: 800 }}>{item.val}</div>
                <div style={{ color: T.textSub, fontSize: ".78rem", marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function PomodoroPage() {
  const [modeIdx, setModeIdx]         = useState(0);
  const [phase, setPhase]             = useState<"idle"|"work"|"rest">("idle");
  const [seconds, setSeconds]         = useState(0);
  const [sessions, setSessions]       = useState<Session[]>([]);
  const [tab, setTab]                 = useState<"timer"|"library"|"report"|"sinav"|"tasks">("timer");
  const [loaded, setLoaded]           = useState(false);
  const [isDark, setIsDark]           = useState(true);
  const T = isDark ? DARK_THEME : LIGHT_THEME;
  const [tasks, setTasks]             = useState<Task[]>([]);
  const [absenceMsg, setAbsenceMsg]   = useState<{days: number; msg: string} | null>(null);
  const [customWork, setCustomWork]   = useState(30);
  const [customRest, setCustomRest]   = useState(5);
  const [dailyGoal, setDailyGoal]     = useState<DailyGoal>({ minutes: 90, animal: "capybara" });
  const [showGoalSetup, setShowGoalSetup] = useState(false);
  const [tempGoal, setTempGoal]       = useState(120);
  const [tempAnimal, setTempAnimal]   = useState("capybara");
  const [ambientId, setAmbientId]     = useState("off");
  const [streak, setStreak]           = useState(0);
  const [showShare, setShowShare]     = useState(false);
  const [selectedSubject, setSelectedSubject]       = useState<string>("Matematik");
  const [customSubjects, setCustomSubjects]         = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [showSubjectPicker, setShowSubjectPicker]   = useState(false);

  const intervalRef   = useRef<ReturnType<typeof setInterval>|null>(null);
  const workStartRef  = useRef<number>(0);
  const phaseEndRef   = useRef<number>(0);
  const audioCtxRef    = useRef<AudioContext|null>(null);
  const ambientGainRef = useRef<GainNode|null>(null);
  const ambientNodes   = useRef<AudioNode[]>([]);  // tüm node'ları takip et

  const mode = modeIdx === 3
    ? { label:"Serbest", work:customWork, rest:customRest, color:"#7c3aed", light:"#f5f3ff", accent:"#a78bfa" }
    : PRESET_MODES[modeIdx];

  // ─── Storage ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const loadedSessions: Session[] = raw ? JSON.parse(raw) : [];
      if (raw) setSessions(loadedSessions);
      const g = localStorage.getItem(GOAL_KEY); if (g) setDailyGoal(JSON.parse(g));
      // Özel dersler
      const cs = localStorage.getItem("pomodoro_custom_subjects_v1");
      if (cs) setCustomSubjects(JSON.parse(cs));
      // Görevler — sadece bugünün görevlerini yükle
      const tr = localStorage.getItem(TASKS_KEY);
      if (tr) {
        const allTasks: Task[] = JSON.parse(tr);
        const todayTasks = allTasks.filter(t => t.date === todayStr());
        setTasks(todayTasks);
        localStorage.setItem(TASKS_KEY, JSON.stringify(todayTasks));
      }
      // Sayfa açılışında streak'i taze hesapla (cache eski gün yansıtabilir)
      if (loadedSessions.length > 0) {
        setTimeout(() => updateStreak(loadedSessions), 50);
      } else {
        const sk = localStorage.getItem(STREAK_KEY); if (sk) setStreak(parseInt(sk));
      }

      // Yokluk kontrolü
      const today = todayStr();
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
      if (lastSeen && lastSeen !== today) {
        const diff = Math.round((new Date(today).getTime() - new Date(lastSeen).getTime()) / 86400000);
        if (diff >= 1) {
          const animalData = localStorage.getItem(GOAL_KEY);
          const animalId = animalData ? JSON.parse(animalData).animal ?? "capybara" : "capybara";
          const ANIMAL_NAMES: Record<string,string> = {
            capybara:"Kapibara", koala:"Koala", penguin:"Penguen", cat:"Kedi",
            bear:"Ayı", caterpillar:"Tırtıl", butterfly:"Kelebek",
            snail:"Salyangoz", turtle:"Kaplumbağa", chick:"Civciv", rabbit:"Tavşan",
            horse:"At", bee:"Arı", canary:"Kanarya", eagle:"Kartal", lion:"Aslan",
          };
          const name = ANIMAL_NAMES[animalId] ?? "Arkadaşın";
          const msgs1 = [`${name} seni özledi! 😢 ${diff} gündür burada değildin.`, `Neredeydin? ${name} her gün bekledi! 🥺`];
          const msgs2 = [`${diff} gün geçti... ${name} seninle çalışmak için sabırsızlanıyor!`, `Geri döndün! ${name} çok mutlu! 🎉 Haydi kaldığımız yerden devam edelim.`];
          const msgs7 = [`${name} haftadır seni bekledi... Serisini kırdın ama her şey yeniden başlayabilir! 💪`, `Uzun zaman oldu. ${name} sevindiğin için çok mutlu! Tekrar başlamak için en iyi an şimdi! ⭐`];
          let msg = diff === 1 ? msgs1[Math.floor(Math.random()*2)] : diff < 7 ? msgs2[Math.floor(Math.random()*2)] : msgs7[Math.floor(Math.random()*2)];
          // State set etmeden önce setTimeout ile garantiye al
          setTimeout(() => setAbsenceMsg({ days: diff, msg }), 500);
        }
      }
      localStorage.setItem(LAST_SEEN_KEY, today);
      const savedTheme = localStorage.getItem(THEME_KEY); if (savedTheme) setIsDark(savedTheme === 'dark');
    } catch { /* ilk kullanım */ }
    setLoaded(true);
  }, []);

  const saveSessions = useCallback((list: Session[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
  }, []);
  const saveGoal = useCallback((g: DailyGoal) => {
    try { localStorage.setItem(GOAL_KEY, JSON.stringify(g)); } catch {}
  }, []);
  const saveTasks = useCallback((list: Task[]) => {
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(list)); } catch {}
  }, []);

  const addTask = useCallback((text: string, subject: string) => {
    const t: Task = { id: Date.now().toString(), date: todayStr(), text, subject, done: false, createdAt: new Date().toISOString() };
    setTasks(prev => { const u = [...prev, t]; saveTasks(u); return u; });
  }, [saveTasks]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => { const u = prev.map(t => t.id === id ? { ...t, done: !t.done } : t); saveTasks(u); return u; });
  }, [saveTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => { const u = prev.filter(t => t.id !== id); saveTasks(u); return u; });
  }, [saveTasks]);

  // ─── Streak hesaplama ─────────────────────────────────────────────────────
  const updateStreak = useCallback((list: Session[]) => {
    let goalMin = 90;
    try {
      const g = localStorage.getItem(GOAL_KEY);
      if (g) goalMin = JSON.parse(g).minutes ?? 90;
    } catch {}

    let count = 0;
    const d = new Date();
    // Bugünden geriye doğru gün gün kontrol
    for (let i = 0; i < 366; i++) {
      const ds = d.toISOString().slice(0, 10);
      const dayMin = list.filter(s => s.date === ds).reduce((a, s) => a + s.actualDuration, 0);
      if (dayMin >= goalMin) {
        count++;
        d.setDate(d.getDate() - 1);
      } else if (i === 0) {
        // Bugün henüz hedef tutmadıysa streak'i kırmaz, dünden kontrol et
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(count);
    try { localStorage.setItem(STREAK_KEY, count.toString()); } catch {}
  }, []);

  // ─── Ses bildirimi ────────────────────────────────────────────────────────
  const playBeep = useCallback(async (type: "work_end"|"rest_end") => {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      if (ctx.state === "suspended") await ctx.resume();
      const notes = type === "work_end" ? [523, 659, 784] : [784, 659, 523];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = "sine";
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.3);
        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.3);
      });
    } catch {}
  }, []);

  // ─── Tarayıcı bildirimi ───────────────────────────────────────────────────
  const sendNotification = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/logo.png" });
    }
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ─── Ambient ses ──────────────────────────────────────────────────────────
  const startAmbient = useCallback(async (id: string) => {
    try {
      // Mevcut context'i kapat
      if (audioCtxRef.current) {
        try { await audioCtxRef.current.close(); } catch {}
        audioCtxRef.current = null;
        ambientGainRef.current = null;
      }

      // Eski audio elementini temizle
      const oldAudio = document.getElementById("ambient-audio-ios") as HTMLAudioElement | null;
      if (oldAudio) { oldAudio.pause(); oldAudio.srcObject = null; oldAudio.remove(); }

      if (id === "off") return;

      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;

      // ── iOS Sessiz Mod Çözümü ─────────────────────────────────────────────
      // iOS, AudioContext sesini sessiz modda keser AMA <audio> elementini kesmez.
      // Çözüm: Web Audio çıkışını MediaStreamDestination'a bağla,
      // oradan bir <audio> elementine ver. <audio> "medya" sayıldığı için
      // sessiz mod onu etkilemiyor (radyonun çalışmasının sebebi de bu).
      //
      // EK: iOS AudioSession'ı "playback" moduna almak için önce boş bir
      // <audio> oynatıyoruz — bu, sistemi "bu sayfa ses çalıyor" moduna geçiriyor.

      // 1) Kısa sessiz base64 mp3 ile AudioSession'ı "playback" moduna al
      const SILENT_MP3 = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAnHIGmEAAAAAAAAAAAAAAAAA//tQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
      const unlockAudio = document.createElement("audio");
      unlockAudio.src = SILENT_MP3;
      unlockAudio.volume = 0.001; // neredeyse sessiz
      (unlockAudio as any).playsInline = true;
      try { await unlockAudio.play(); } catch {}
      unlockAudio.pause();
      unlockAudio.remove();

      // 2) Context'i resume et
      if (ctx.state === "suspended") await ctx.resume();

      // 3) Ambient ses üret
      const gainNode = createAmbientNode(ctx, id);
      ambientGainRef.current = gainNode;

      if (!gainNode) return;

      // 4) MediaStreamDestination → <audio> zinciri
      // Bu iOS'ta "medya sesi" olarak algılanır, sessiz modu bypass eder
      if ((ctx as any).createMediaStreamDestination) {
        const streamDest = (ctx as any).createMediaStreamDestination();
        gainNode.connect(streamDest);
        // ctx.destination'a da bağla (diğer cihazlar için)
        gainNode.connect(ctx.destination);

        const audioEl = document.createElement("audio");
        audioEl.id = "ambient-audio-ios";
        audioEl.srcObject = streamDest.stream;
        (audioEl as any).playsInline = true;
        audioEl.volume = 1.0;
        document.body.appendChild(audioEl);

        try {
          await audioEl.play();
        } catch {
          // Autoplay engellendi — Web Audio yine de çalıyor
        }
      }
    } catch (e) { console.warn("Audio error:", e); }
  }, []);

  // ─── Oturum kaydet ────────────────────────────────────────────────────────
  const recordSession = useCallback((plannedDuration: number, startedAt: number, forcedActual?: number, subject?: string) => {
    const actualDuration = forcedActual ?? Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const s: Session = { id: Date.now().toString(), date: todayStr(), plannedDuration, actualDuration, completedAt: new Date().toISOString(), subject };
    setSessions(prev => { const u = [...prev, s]; saveSessions(u); updateStreak(u); return u; });
  }, [saveSessions, updateStreak]);

  // ─── Sayfa geri gelince çalışma kaydını koru ──────────────────────────────
  // Kullanıcı süreyi aşıp döndüğünde gerçek çalışma süresini kaydet
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        if (workStartRef.current > 0) {
          const elapsedMin = Math.round((now - workStartRef.current) / 60000);
          // Timer zaten bitmişse (phaseEnd geçtiyse) → kaydet ve idle'a al
          if (now > phaseEndRef.current + 5000) {
            const startedAt = workStartRef.current;
            workStartRef.current = 0;
            phaseEndRef.current = 0;
            // Gerçek süreyi kaydet (planned değil actual)
            recordSession(0, startedAt, elapsedMin);
            if (intervalRef.current) clearInterval(intervalRef.current);
            setPhase("idle"); setSeconds(0);
          }
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [recordSession]);

  // ─── Timer ───────────────────────────────────────────────────────────────
  const startWork = useCallback(() => {
    const now = Date.now();
    workStartRef.current = now;
    phaseEndRef.current = now + mode.work * 60 * 1000;
    setPhase("work"); setSeconds(mode.work * 60);
  }, [mode.work]);

  const startRest = useCallback(() => {
    const now = Date.now(); phaseEndRef.current = now + mode.rest * 60 * 1000;
    setPhase("rest"); setSeconds(mode.rest * 60);
  }, [mode.rest]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("idle"); setSeconds(0);
  }, []);

  const completeWork = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const startedAt = workStartRef.current;
    workStartRef.current = 0;
    if (startedAt === 0) return;
    recordSession(mode.work, startedAt, undefined, selectedSubject);
    playBeep("work_end");
    sendNotification("Ders tamamlandı! 🎉", `${mode.work} dakika çalıştın. Mola zamanı!`);
    const now = Date.now(); phaseEndRef.current = now + mode.rest * 60 * 1000;
    setPhase("rest"); setSeconds(mode.rest * 60);
    setShowShare(true);
  }, [mode.work, mode.rest, recordSession, playBeep, sendNotification, selectedSubject]);

  useEffect(() => {
    if (phase === "idle") { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((phaseEndRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        if (phase === "work") {
          const startedAt = workStartRef.current;
          workStartRef.current = 0;
          if (startedAt > 0) recordSession(mode.work, startedAt, undefined, selectedSubject);
          playBeep("work_end");
          sendNotification("Ders tamamlandı! 🎉", `${mode.work} dakika çalıştın. Mola zamanı!`);
          const now = Date.now(); phaseEndRef.current = now + mode.rest * 60 * 1000;
          setPhase("rest"); setSeconds(mode.rest * 60);
          setShowShare(true);
        } else {
          playBeep("rest_end");
          sendNotification("Mola bitti! ⏰", "Tekrar çalışmaya hazır mısın?");
          setPhase("idle"); setSeconds(0);
        }
      } else { setSeconds(remaining); }
    }, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, mode.work, mode.rest, recordSession, playBeep, sendNotification, selectedSubject]);

  // ─── Hesaplamalar ─────────────────────────────────────────────────────────
  const today    = todayStr();
  const wStart   = weekStart();
  const todaySessions = sessions.filter(s => s.date === today);
  const weekSessions  = sessions.filter(s => s.date >= wStart);
  const todayMin = todaySessions.reduce((a, s) => a + s.actualDuration, 0);
  const weekMin  = weekSessions.reduce((a, s) => a + s.actualDuration, 0);
  const goalPct  = dailyGoal.minutes > 0 ? Math.min(100, (todayMin / dailyGoal.minutes) * 100) : 0;
  const goalMet  = dailyGoal.minutes > 0 && todayMin >= dailyGoal.minutes;
  const animalName = ANIMALS.find(a => a.id === dailyGoal.animal)?.name ?? "Kapibara";
  const motivation = getMotivation(goalPct, goalMet, animalName);

  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  const yMin = sessions.filter(s => s.date === yStr).reduce((a, s) => a + s.actualDuration, 0);
  const yMissed = dailyGoal.minutes > 0 && yMin < dailyGoal.minutes && yMin === 0;

  const totalSec   = phase === "work" ? mode.work * 60 : phase === "rest" ? mode.rest * 60 : 1;
  const progress   = phase === "idle" ? 0 : ((totalSec - seconds) / totalSec) * 100;
  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference - (progress / 100) * circumference;

  if (!loaded) return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a1630, #1e1c3a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: T.text }}>Yükleniyor...</div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, sans-serif", position: "relative" }}>
      {showShare && (
        <ShareModal
          minutes={mode.work}
          streak={streak}
          isDark={isDark}
          T={T}
          onClose={() => setShowShare(false)}
        />
      )}
      {goalMet && <CelebrationBg />}
      <style>{`
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.1);opacity:.9} }
        @keyframes fade-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes confetti-fall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes celebrate-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} 50%{box-shadow:0 0 40px 10px rgba(16,185,129,0.3)} }
        @keyframes streak-bounce { 0%,100%{transform:scale(1) rotate(-2deg)} 50%{transform:scale(1.18) rotate(2deg)} }
        @keyframes countdown-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.06);opacity:.85} }
        @keyframes goal-bounce { 0%{transform:translateY(0)} 30%{transform:translateY(-10px)} 60%{transform:translateY(-4px)} 80%{transform:translateY(-7px)} 100%{transform:translateY(0)} }
        @keyframes book-popup-in { from{opacity:0;transform:translateX(-50%) translateY(calc(-100% + 8px))} to{opacity:1;transform:translateX(-50%) translateY(-100%)} }
        @keyframes popup-in { from{opacity:0;transform:translateX(-50%) translateY(6px) scale(0.9)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
        @keyframes phase-glow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .fade-in { animation: fade-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .tab-btn { border:none;cursor:pointer;transition:all 0.2s;font-weight:600;border-radius:10px;padding:10px 14px;font-size:.8rem; }
        .mode-btn { border:2px solid;cursor:pointer;transition:all 0.25s;border-radius:14px;padding:10px 12px;text-align:center;background:none; }
        .mode-btn:hover { transform:translateY(-2px); }
        .action-btn { border:none;cursor:pointer;transition:all 0.18s cubic-bezier(0.34,1.56,0.64,1);border-radius:14px;font-weight:700;font-size:1rem;padding:14px 30px; }
        .action-btn:hover { filter:brightness(1.12);transform:translateY(-2px) scale(1.02); }
        .action-btn:active { transform:translateY(0) scale(0.97); }
        .ambient-btn { border:1px solid ${T.border};background:${T.surface};cursor:pointer;border-radius:12px;padding:10px 14px;color:${T.textSub};font-size:.8rem;font-weight:600;transition:all 0.2s;display:flex;flex-direction:column;align-items:center;gap:4px; }
        .ambient-btn:hover { border-color:${T.isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)"}; background:${T.surface2}; transform:translateY(-1px); }
        .ambient-btn.active { border-color:#9B6FE8;background:#9B6FE818;color:${T.text}; }
        input[type=range] { accent-color:#9B6FE8;width:100%; }
        .mode-card { cursor:pointer; border-radius:20px; border:1px solid ${T.border}; overflow:hidden; transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        .mode-card:hover { transform:translateY(-3px) scale(1.01); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .mode-card:active { transform:translateY(0) scale(0.98); }
        .tool-card { cursor:pointer; border-radius:20px; border:1px solid ${T.border}; overflow:hidden; transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1); flex:1; }
        .tool-card:hover { transform:translateY(-3px) scale(1.01); box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
        .tool-card:active { transform:translateY(0) scale(0.97); }
        .bottom-nav-btn { display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;background:none;border:none;padding:8px 16px;transition:all 0.2s;flex:1; }
        .bottom-nav-btn:hover { opacity:0.85; transform:translateY(-1px); }
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes float { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-5px)} }
        @keyframes writing { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(10deg)} }
        @keyframes steam { 0%,100%{opacity:1;transform:translateY(0)} 50%{opacity:0.6;transform:translateY(-3px)} }
      `}</style>

      {/* Header */}
      <div style={{ padding: "52px 20px 0", maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ color: T.text, fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.1 }}>{getTurkishDay()}</div>
            <div style={{ color: T.textSub, fontSize: ".82rem", marginTop: 3 }}>{getTurkishDate()}</div>
          </div>
          {/* Tema butonu */}
          <button
            onClick={() => { const next = !isDark; setIsDark(next); try { localStorage.setItem(THEME_KEY, next ? "dark" : "light"); } catch {} }}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s" }}
          >
            <span style={{ fontSize: "1.1rem" }}>{isDark ? "☀️" : "🌙"}</span>
            <span style={{ color: T.text, fontWeight: 700, fontSize: ".78rem" }}>{isDark ? "Gündüz" : "Gece"}</span>
          </button>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {streak > 0 && (
              <div style={{
                background: streak >= 30 ? "linear-gradient(135deg,rgba(251,191,36,0.2),rgba(245,158,11,0.12))" : streak >= 7 ? "linear-gradient(135deg,rgba(232,69,74,0.18),rgba(251,113,55,0.1))" : "rgba(232,69,74,0.12)",
                border: `1px solid ${streak >= 30 ? "rgba(251,191,36,0.5)" : streak >= 7 ? "rgba(232,69,74,0.5)" : "rgba(232,69,74,0.3)"}`,
                borderRadius: 12, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6,
                animation: streak >= 7 ? "streak-bounce 2s ease-in-out infinite" : "none",
                transition: "all 0.5s ease",
              }}>
                <span style={{ fontSize: "1.2rem" }}>{streak >= 30 ? "🏆" : streak >= 14 ? "💎" : "🔥"}</span>
                <div>
                  <div style={{ color: streak >= 30 ? "#fbbf24" : "#E8454A", fontWeight: 800, fontSize: "1rem", lineHeight: 1, transition: "color 0.5s" }}>{streak}</div>
                  <div style={{ color: streak >= 30 ? "rgba(251,191,36,0.65)" : "rgba(232,69,74,0.6)", fontSize: ".65rem" }}>
                    {streak >= 30 ? "efsane!" : streak >= 14 ? "süper seri" : streak >= 7 ? "haftalık" : "gün seri"}
                  </div>
                </div>
              </div>
            )}
            {todaySessions.length > 0 && (
              <div style={{ background: "rgba(74,158,142,0.15)", border: "1px solid rgba(74,158,142,0.35)", borderRadius: 12, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "1.2rem" }}>✅</span>
                <div>
                  <div style={{ color: "#4A9E8E", fontWeight: 800, fontSize: "1rem", lineHeight: 1 }}>{todaySessions.length}</div>
                  <div style={{ color: "rgba(74,158,142,0.6)", fontSize: ".65rem" }}>oturum</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 100px", position: "relative", zIndex: 1 }}>

        {/* ── TIMER ── */}
        {tab === "timer" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>

            {/* Çalışma modu başlığı */}
            <div style={{ color: T.textSub, fontSize: ".72rem", fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4, width: "100%" }}>ÇALIŞMA MODU</div>

            {/* Mod seçimi — Expo gradient kartlar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
              {PRESET_MODES.map((m, i) => (
                <div key={i} className="mode-card"
                  onClick={() => { setModeIdx(i); reset(); }}
                  style={{
                    background: isDark ? `linear-gradient(135deg, ${m.grad1}, ${m.grad2})` : `linear-gradient(135deg, ${m.lightGrad1}, ${m.lightGrad2})`,
                    borderColor: modeIdx === i ? m.color : "#2A2A2A",
                    boxShadow: modeIdx === i ? `0 0 0 2px ${m.color}44` : "none",
                    padding: "16px",
                  }}>
                  <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{m.icon}</div>
                  <div style={{ color: T.text, fontWeight: 800, fontSize: ".95rem", marginBottom: 3 }}>{m.label}</div>
                  <div style={{ color: m.color, fontWeight: 600, fontSize: ".72rem", marginBottom: 4 }}>{m.desc}</div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ width: 26, height: 26, borderRadius: 13, background: `${m.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem", color: m.color }}>→</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Serbest mod */}
            {modeIdx === 3 && (
              <div style={{ background: T.surface, border: `1px solid #9B6FE840`, borderRadius: 16, padding: "18px 24px", width: "100%", maxWidth: 520 }}>
                <p style={{ color: "#9B6FE8", fontWeight: 700, fontSize: ".82rem", margin: "0 0 14px", textAlign: "center" }}>⚙️ Süreleri Belirle</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <label style={{ color: T.textSub, fontSize: ".76rem", fontWeight: 600 }}>DERS SÜRESİ</label>
                      <span style={{ color: T.text, fontWeight: 700, fontSize: ".9rem" }}>{customWork} dk</span>
                    </div>
                    <input type="range" min={5} max={180} step={5} value={customWork} onChange={e => { setCustomWork(+e.target.value); reset(); }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <label style={{ color: T.textSub, fontSize: ".76rem", fontWeight: 600 }}>MOLA SÜRESİ</label>
                      <span style={{ color: T.text, fontWeight: 700, fontSize: ".9rem" }}>{customRest} dk</span>
                    </div>
                    <input type="range" min={1} max={60} step={1} value={customRest} onChange={e => { setCustomRest(+e.target.value); reset(); }} />
                  </div>
                </div>
              </div>
            )}

            {/* Yol arkadaşı */}
            <AnimalCompanion animalId={dailyGoal.animal} phase={phase === "rest" ? "rest" : phase === "work" ? "work" : "idle"} isDark={isDark} />

            {/* Timer dairesi */}
            <div style={{ position: "relative", width: 220, height: 220 }}>
              {/* Phase glow ring */}
              {phase !== "idle" && (
                <div style={{
                  position: "absolute", inset: -16, borderRadius: "50%",
                  background: `radial-gradient(circle, ${phase === "rest" ? "#4A9E8E" : mode.accent}2a 0%, transparent 70%)`,
                  animation: "pulse-ring 2.2s ease-in-out infinite",
                }} />
              )}
              {goalMet && <div style={{ position: "absolute", inset: -8, borderRadius: "50%", animation: "celebrate-pulse 1.5s ease-in-out infinite" }} />}

              {/* Track + progress ring */}
              <svg width="220" height="220" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                <circle cx="110" cy="110" r="90" fill="none" stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"} strokeWidth="12" />
                <circle
                  cx="110" cy="110" r="90" fill="none"
                  stroke={phase === "rest" ? "#4A9E8E" : mode.accent}
                  strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.6s ease" }}
                />
              </svg>

              {/* Inner face */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 2,
              }}>
                {/* Phase chip */}
                {phase !== "idle" && (
                  <div style={{
                    fontSize: ".65rem", fontWeight: 800, letterSpacing: ".08em",
                    color: phase === "rest" ? "#4A9E8E" : mode.accent,
                    background: phase === "rest" ? "rgba(74,158,142,0.12)" : `${mode.accent}18`,
                    borderRadius: 6, padding: "2px 8px", marginBottom: 4,
                    transition: "all 0.5s ease",
                  }}>
                    {phase === "work" ? "ODAK" : "MOLA"}
                  </div>
                )}
                <div style={{
                  fontSize: "2.8rem", fontWeight: 800, color: T.text,
                  letterSpacing: "-2px", fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                }}>
                  {phase === "idle" ? fmtTime(mode.work * 60) : fmtTime(seconds)}
                </div>
                <div style={{ fontSize: ".75rem", color: T.textSub, marginTop: 6, fontWeight: 600 }}>
                  {phase === "idle" ? "başlamaya hazır" : phase === "work" ? "🔥 odak zamanı" : "☕ mola zamanı"}
                </div>
              </div>
            </div>

            {/* Ders Seçici — sadece idle fazında */}
            {phase === "idle" && (
              <div style={{ width: "100%", maxWidth: 520 }}>
                <div style={{ color: T.textSub, fontSize: ".72rem", fontWeight: 700, letterSpacing: "1.5px", marginBottom: 10 }}>BUGÜN NE ÇALIŞACAKSIN?</div>
                <button
                  onClick={() => setShowSubjectPicker(true)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: T.surface, border: `1px solid ${subjectColor(selectedSubject)}55`,
                    borderRadius: 14, padding: "14px 18px", cursor: "pointer",
                    boxShadow: `0 0 0 0px ${subjectColor(selectedSubject)}33`,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = subjectColor(selectedSubject); }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${subjectColor(selectedSubject)}55`; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, background: subjectColor(selectedSubject), flexShrink: 0 }} />
                    <span style={{ color: T.text, fontWeight: 700, fontSize: ".95rem" }}>{selectedSubject}</span>
                  </div>
                  <span style={{ color: T.textMuted, fontSize: ".8rem" }}>değiştir ›</span>
                </button>
              </div>
            )}

            {/* Çalışılan ders — work/rest fazında göster */}
            {phase !== "idle" && selectedSubject && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: `${subjectColor(selectedSubject)}15`,
                border: `1px solid ${subjectColor(selectedSubject)}40`,
                borderRadius: 10, padding: "7px 14px",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: subjectColor(selectedSubject) }} />
                <span style={{ color: subjectColor(selectedSubject), fontWeight: 700, fontSize: ".82rem" }}>{selectedSubject}</span>
              </div>
            )}

            {/* Butonlar */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {phase === "idle" && <button className="action-btn" onClick={startWork} style={{ background: mode.accent, color: "#fff", boxShadow: `0 8px 28px ${mode.accent}60`, letterSpacing:".04em", minWidth: 130 }}>▶ Başla</button>}
              {phase === "work" && (
                <>
                  <button className="action-btn" onClick={reset} style={{ background: T.surface, color: T.textSub, border:`1px solid ${T.border}` }}>✕ İptal</button>
                  <button className="action-btn" onClick={completeWork} style={{ background: "#4A9E8E", color: "#fff", boxShadow:"0 8px 28px #4A9E8E55", minWidth: 140 }}>✓ Tamamla</button>
                </>
              )}
              {phase === "rest" && (
                <>
                  <button className="action-btn" onClick={reset} style={{ background: T.surface, color: T.textSub, border:`1px solid ${T.border}` }}>Atla</button>
                  <button className="action-btn" onClick={startWork} style={{ background: mode.accent, color: "#fff", boxShadow:`0 8px 28px ${mode.accent}60`, minWidth: 140 }}>▶ Yeni Ders</button>
                </>
              )}
            </div>

            {/* Sanal Kütüphane Banner */}
            <StudyBanner isActive={phase === "work"} />

            {/* Araçlar — idle modda göster */}
            {phase === "idle" && (
              <>
                <div style={{ color: T.textSub, fontSize: ".72rem", fontWeight: 700, letterSpacing: "1.5px", width: "100%" }}>ARAÇLAR</div>
                <div style={{ display: "flex", gap: 12, width: "100%" }}>
                  <div className="tool-card" onClick={() => setTab("report")} style={{ background: isDark ? "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))" : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))" }}>
                    <div style={{ padding: 18 }}>
                      <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>📊</div>
                      <div style={{ color: T.text, fontWeight: 800, fontSize: ".95rem", marginBottom: 3 }}>Rapor</div>
                      <div style={{ color: T.textSub, fontSize: ".75rem" }}>İstatistiklerini gör</div>
                    </div>
                  </div>
                  <div className="tool-card" onClick={() => setTab("sinav")} style={{ background: isDark ? "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))" : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))" }}>
                    <div style={{ padding: 18 }}>
                      <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>🎓</div>
                      <div style={{ color: T.text, fontWeight: 800, fontSize: ".95rem", marginBottom: 3 }}>Sınav</div>
                      <div style={{ color: T.textSub, fontSize: ".75rem" }}>LGS / YKS sayacı</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Ambient ses */}
            <div style={{ width: "100%", maxWidth: 520 }}>
              <p style={{ color: T.textSub, fontSize: ".72rem", fontWeight: 700, letterSpacing: "1.5px", textAlign: "center", marginBottom: 10 }}>🎵 ODAK MÜZİĞİ</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {AMBIENT_SOUNDS.map(s => (
                  <button key={s.id} className={`ambient-btn ${ambientId === s.id ? "active" : ""}`}
                    onClick={() => { setAmbientId(s.id); startAmbient(s.id); }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Günlük hedef */}
            {/* Hedef kartı — her zaman göster, tıklayınca modal açılır */}
            <div style={{ width: "100%" }}>
              <GoalCard todayMin={todayMin} goalMin={dailyGoal.minutes} animal={dailyGoal.animal} onPress={() => { setTempGoal(dailyGoal.minutes); setTempAnimal(dailyGoal.animal); setShowGoalSetup(true); }} T={T} isDark={isDark} />
            </div>

            {/* Motivasyon */}
            {dailyGoal.minutes > 0 && (
              <div style={{ width: "100%", maxWidth: 580, borderRadius: 14, padding: "14px 20px", textAlign: "center", background: goalMet ? (isDark?"#0A2E22":"#e6f7f3") : T.surface, border: goalMet ? "1px solid #4A9E8E40" : `1px solid ${T.border}`, transition: "all 0.5s" }}>
                <p style={{ color: goalMet ? "#4A9E8E" : "#888", margin: 0, fontWeight: 600, fontSize: ".88rem" }}>{motivation.msg}</p>
              </div>
            )}

            {/* Dün kaçırdıysa */}
            {yMissed && (
              <div style={{ width: "100%", maxWidth: 580, borderRadius: 14, padding: "12px 20px", textAlign: "center", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)" }}>
                <p style={{ color: "#fdba74", margin: 0, fontSize: ".83rem", fontWeight: 600 }}>{TOMORROW_MSGS[new Date().getDay() % TOMORROW_MSGS.length]}</p>
              </div>
            )}

            <button onClick={() => { setTempGoal(dailyGoal.minutes); setTempAnimal(dailyGoal.animal); setShowGoalSetup(true); }}
              style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.textSub, borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontSize: ".78rem", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
            >🎯 Günlük hedef ayarla</button>
          </div>
        )}

        {/* ── GÖREVLER ── */}
        {tab === "tasks" && (
          <TasksTab
            tasks={tasks}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            selectedSubject={selectedSubject}
            customSubjects={customSubjects}
            T={T}
            isDark={isDark}
          />
        )}

        {/* ── KÜTÜPHANe ── */}
        {tab === "library" && (
          <LibraryTab sessions={sessions} T={T} isDark={isDark} />
        )}

        {/* ── RAPOR ── */}
        {tab === "report" && (
          <div className="fade-in">
            <div style={{ color:T.textSub, fontSize:".72rem", fontWeight:700, letterSpacing:"1.5px", marginBottom:16 }}>RAPORLAR</div>
            <div style={{ marginBottom:18 }}><GoalCard todayMin={todayMin} goalMin={dailyGoal.minutes} animal={dailyGoal.animal} onPress={() => { setTempGoal(dailyGoal.minutes); setTempAnimal(dailyGoal.animal); setShowGoalSetup(true); }} T={T} isDark={isDark} /></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:22 }}>
                <div style={{ color:"#E8454A", fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:10 }}>BUGÜN</div>
                <div style={{ color:T.text, fontSize:"2rem", fontWeight:800 }}>{todaySessions.length}</div>
                <div style={{ color:T.textSub, fontSize:".82rem", marginTop:3 }}>oturum · {todayMin} dakika</div>
                <div style={{ marginTop:12, display:"flex", gap:5, flexWrap:"wrap" }}>
                  {todaySessions.map((s,i)=>(
                    <div key={i} style={{ background:s.plannedDuration>=90?"#065f46":s.plannedDuration>=50?"#c2410c":s.plannedDuration===0?"#7c3aed":"#1e3a8a", borderRadius:8, padding:"3px 9px", fontSize:".72rem", color:T.text, fontWeight:600 }}>{s.actualDuration}dk</div>
                  ))}
                </div>
              </div>
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:22 }}>
                <div style={{ color:"#4A9E8E", fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:10 }}>BU HAFTA</div>
                <div style={{ color:T.text, fontSize:"2rem", fontWeight:800 }}>{weekSessions.length}</div>
                <div style={{ color:T.textSub, fontSize:".82rem", marginTop:3 }}>oturum · {weekMin} dakika</div>
                <div style={{ marginTop:12, display:"flex", alignItems:"flex-end", gap:5, height:44 }}>
                  {["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map((day,i)=>{
                    const dd=new Date(); dd.setDate(dd.getDate()-dd.getDay()+1+i);
                    const ds=dd.toISOString().slice(0,10);
                    const mins=sessions.filter(s=>s.date===ds).reduce((a,s)=>a+s.actualDuration,0);
                    const maxM=Math.max(...Array.from({length:7},(_,j)=>{const d2=new Date();d2.setDate(d2.getDate()-d2.getDay()+1+j);return sessions.filter(s=>s.date===d2.toISOString().slice(0,10)).reduce((a,s)=>a+s.actualDuration,0);}),1);
                    return (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                        <div style={{ width:"100%", background:mins>0?(ds===today?"#9B6FE8":"#4A6BE8"):"#252525", borderRadius:3, height:Math.max((mins/maxM)*36,mins>0?5:3), transition:"height 0.3s" }} />
                        <div style={{ color:ds===today?"white":"rgba(255,255,255,0.4)", fontSize:".62rem", fontWeight:ds===today?700:400 }}>{day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:22 }}>
              <div style={{ color:T.textSub, fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:18 }}>TÜM ZAMANLAR</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
                {[
                  { label:"Toplam Oturum",   val:sessions.length },
                  { label:"Çalışılan Dakika", val:sessions.reduce((a,s)=>a+s.actualDuration,0) },
                  { label:"Toplam Saat",      val:Math.floor(sessions.reduce((a,s)=>a+s.actualDuration,0)/60) },
                  { label:"Klasik (25dk)",    val:sessions.filter(s=>s.plannedDuration===25).length },
                  { label:"Derin Odak (50dk)",val:sessions.filter(s=>s.plannedDuration===50).length },
                  { label:"Maraton (90dk)",   val:sessions.filter(s=>s.plannedDuration===90).length },
                  { label:"Serbest",          val:sessions.filter(s=>s.plannedDuration===0).length },
                  { label:"Aktif Gün",        val:new Set(sessions.map(s=>s.date)).size },
                  { label:"En Uzun Seri 🔥",  val:streak },
                ].map((item,i)=>(
                  <div key={i} style={{ textAlign:"center" }}>
                    <div style={{ color:T.text, fontSize:"1.4rem", fontWeight:800 }}>{item.val}</div>
                    <div style={{ color:T.textSub, fontSize:".72rem", marginTop:3 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── DERS DAĞILIMI ── */}
            {(() => {
              // Bu haftanın ders dağılımı
              const subjectMap: Record<string, number> = {};
              sessions.forEach(s => { const k = s.subject ?? "Diğer"; subjectMap[k] = (subjectMap[k] ?? 0) + s.actualDuration; });
              const sorted = Object.entries(subjectMap).sort((a,b) => b[1]-a[1]);
              const total  = sorted.reduce((a,b) => a + b[1], 0);
              if (sorted.length === 0) return null;

              // Haftalık ders trendi (son 7 gün × ders)
              const last7 = Array.from({length:7}, (_,i) => { const d=new Date(); d.setDate(d.getDate()-6+i); return d.toISOString().slice(0,10); });
              const top3  = sorted.slice(0,3).map(([name]) => name);

              return (
                <>
                  {/* Ders bazlı toplam */}
                  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:22, marginTop:18 }}>
                    <div style={{ color:T.textSub, fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:16 }}>📚 DERS DAĞILIMI (TÜM ZAMANLAR)</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {sorted.map(([name, mins]) => {
                        const pct = total > 0 ? (mins/total)*100 : 0;
                        const col = subjectColor(name);
                        return (
                          <div key={name}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                                <div style={{ width:8, height:8, borderRadius:4, background:col, flexShrink:0 }} />
                                <span style={{ color:T.text, fontSize:".83rem", fontWeight:600 }}>{name}</span>
                              </div>
                              <span style={{ color:T.textSub, fontSize:".78rem" }}>{fmtMin(mins)} · {Math.round(pct)}%</span>
                            </div>
                            <div style={{ height:6, borderRadius:3, background:T.surface2, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${pct}%`, background:col, borderRadius:3, transition:"width 0.6s ease" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Günlük pasta benzeri özet */}
                  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:22, marginTop:14 }}>
                    <div style={{ color:T.textSub, fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:16 }}>📅 BUGÜNKÜ DERS DAĞILIMI</div>
                    {(() => {
                      const todayMap: Record<string,number> = {};
                      todaySessions.forEach(s => { const k = s.subject ?? "Diğer"; todayMap[k] = (todayMap[k]??0) + s.actualDuration; });
                      const todaySorted = Object.entries(todayMap).sort((a,b)=>b[1]-a[1]);
                      if (todaySorted.length === 0) return <p style={{ color:T.textMuted, fontSize:".82rem", margin:0, textAlign:"center" }}>Bugün henüz oturum yok.</p>;
                      const todayTotal = todaySorted.reduce((a,b)=>a+b[1],0);
                      return (
                        <>
                          {/* Segmentli bar */}
                          <div style={{ display:"flex", height:14, borderRadius:8, overflow:"hidden", marginBottom:12, gap:2 }}>
                            {todaySorted.map(([name, mins]) => (
                              <div key={name} style={{ flex:mins, background:subjectColor(name), transition:"flex 0.5s ease" }} title={`${name}: ${mins}dk`} />
                            ))}
                          </div>
                          {/* Lejant */}
                          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                            {todaySorted.map(([name, mins]) => (
                              <div key={name} style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <div style={{ width:8, height:8, borderRadius:4, background:subjectColor(name) }} />
                                <span style={{ color:T.textSub, fontSize:".78rem" }}>{name} <strong style={{ color:T.text }}>{mins}dk</strong></span>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Haftalık ders trendi */}
                  {top3.length > 0 && (
                    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:22, marginTop:14 }}>
                      <div style={{ color:T.textSub, fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:6 }}>📈 HAFTALIK DERS TRENDİ (EN POPÜLER 3)</div>
                      {/* Lejant */}
                      <div style={{ display:"flex", gap:12, marginBottom:14, flexWrap:"wrap" }}>
                        {top3.map(name => (
                          <div key={name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                            <div style={{ width:8, height:8, borderRadius:4, background:subjectColor(name) }} />
                            <span style={{ color:T.textSub, fontSize:".74rem" }}>{name}</span>
                          </div>
                        ))}
                      </div>
                      {/* Çubuk grafik — her gün için top3 dersleri ayrı renkle */}
                      <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:80 }}>
                        {last7.map(ds => {
                          const daySessions = sessions.filter(s => s.date === ds);
                          const dayTotal    = daySessions.reduce((a,s)=>a+s.actualDuration,0);
                          const maxDay      = Math.max(...last7.map(d2 => sessions.filter(s=>s.date===d2).reduce((a,s)=>a+s.actualDuration,0)), 1);
                          const barH        = dayTotal > 0 ? Math.max((dayTotal/maxDay)*68, 6) : 0;
                          const dLabel      = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"][new Date(ds+"T12:00:00").getDay() === 0 ? 6 : new Date(ds+"T12:00:00").getDay()-1];
                          const isToday     = ds === today;

                          // Derslerin gün içi dakikasını hesapla
                          const topMins = top3.map(name => daySessions.filter(s=>(s.subject??"Diğer")===name).reduce((a,s)=>a+s.actualDuration,0));
                          const otherMin = dayTotal - topMins.reduce((a,b)=>a+b,0);

                          return (
                            <div key={ds} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                              <div style={{ width:"100%", display:"flex", flexDirection:"column-reverse", borderRadius:4, overflow:"hidden", height:barH, transition:"height 0.4s ease" }}>
                                {dayTotal === 0
                                  ? <div style={{ flex:1, background:T.surface2 }} />
                                  : <>
                                      {otherMin > 0 && <div style={{ flex:otherMin, background:"rgba(255,255,255,0.12)" }} />}
                                      {top3.map((name,i) => topMins[i]>0 && (
                                        <div key={name} style={{ flex:topMins[i], background:subjectColor(name) }} />
                                      ))}
                                    </>
                                }
                              </div>
                              <span style={{ color:isToday?T.text:T.textMuted, fontSize:".62rem", fontWeight:isToday?700:400 }}>{dLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* İstatistik paylaş */}
            <ReportShareButton
              todayMin={todayMin}
              todaySessions={todaySessions.length}
              weekMin={weekMin}
              totalSessions={sessions.length}
              streak={streak}
              isDark={isDark}
              T={T}
            />

            {/* Verileri temizle */}
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <button
                onClick={() => {
                  if (window.confirm("Tüm veriler silinecek. Emin misin?")) {
                    localStorage.removeItem("pomodoro_sessions_v2");
                    localStorage.removeItem("pomodoro_streak_v1");
                    setSessions([]);
                    setStreak(0);
                  }
                }}
                style={{ background: T.surface, border: "1px solid #E8454A30", color: "#E8454A60", borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontSize: ".78rem", transition: "all 0.2s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(239,68,68,0.7)"; el.style.color = "#ef4444"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(239,68,68,0.35)"; el.style.color = "rgba(239,68,68,0.6)"; }}
              >🗑 Tüm verileri temizle</button>
            </div>
          </div>
        )}

        {/* ── SINAV ── */}
        {tab === "sinav" && (
          <SinavTab T={T} isDark={isDark} />
        )}

      </div>

      {/* ── BOTTOM NAV ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: T.navBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${T.navBorder}`,
        display: "flex", alignItems: "center",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        zIndex: 50,
      }}>
        {([
          { key: "timer",   icon: "🍅", label: "Timer"      },
          { key: "tasks",   icon: "📝", label: "Görevler"   },
          { key: "library", icon: "📚", label: "Kütüphane"  },
          { key: "report",  icon: "📊", label: "Rapor"      },
          { key: "sinav",   icon: "🎓", label: "Sınav"      },
        ] as const).map(item => (
          <button key={item.key} className="bottom-nav-btn" onClick={() => setTab(item.key)}
            style={{ color: tab === item.key ? "#9B6FE8" : T.textMuted }}>
            <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: ".62rem", fontWeight: 700, letterSpacing: ".03em" }}>{item.label}</span>
            {tab === item.key && <div style={{ width: 4, height: 4, borderRadius: 2, background: "#9B6FE8", marginTop: 1 }} />}
          </button>
        ))}
      </nav>

      {/* ── YOKLUK MODAL ── */}
      {absenceMsg && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:T.modalBg, borderRadius:24, padding:32, maxWidth:360, width:"100%", border:"1px solid rgba(255,255,255,0.15)", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.6)" }}>
            {/* Hayvan */}
            <div style={{ fontSize:"4rem", marginBottom:8 }}>
              <AnimalImg id={dailyGoal.animal} size={72} />
            </div>
            {/* Gün sayısı */}
            <div style={{ color:T.textSub, fontSize:".78rem", fontWeight:700, letterSpacing:".1em", marginBottom:12 }}>
              {absenceMsg.days === 1 ? "1 GÜN SONRA" : `${absenceMsg.days} GÜN SONRA`}
            </div>
            {/* Mesaj */}
            <p style={{ color:T.text, fontSize:"1.05rem", fontWeight:700, margin:"0 0 24px", lineHeight:1.5 }}>
              {absenceMsg.msg}
            </p>
            {/* Buton */}
            <button
              onClick={() => setAbsenceMsg(null)}
              style={{ background:"linear-gradient(135deg,#3b82f6,#7c3aed)", border:"none", borderRadius:14, padding:"14px 32px", color:T.text, fontWeight:800, fontSize:"1rem", cursor:"pointer", width:"100%", boxShadow:"0 8px 24px rgba(59,130,246,0.4)" }}
            >
              Hadi Başlayalım! 🚀
            </button>
          </div>
        </div>
      )}

      {/* ── DERS SEÇİCİ MODAL ── */}
      {showSubjectPicker && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:100, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:16, backdropFilter:"blur(6px)" }}
          onClick={e => { if (e.target===e.currentTarget) setShowSubjectPicker(false); }}
        >
          <div style={{ background: T.modalBg, borderRadius:"24px 24px 20px 20px", padding:"24px 20px 32px", maxWidth:500, width:"100%", border:`1px solid ${T.border}`, boxShadow:"0 -8px 48px rgba(0,0,0,0.5)", maxHeight:"80vh", overflowY:"auto" }}>
            {/* Başlık */}
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ width:36, height:4, borderRadius:2, background:T.border, margin:"0 auto 16px" }} />
              <h3 style={{ color:T.text, fontSize:"1.05rem", fontWeight:800, margin:0 }}>📚 Hangi dersi çalışacaksın?</h3>
            </div>

            {/* Ders grupları */}
            {SUBJECT_GROUPS.map(group => (
              <div key={group.group} style={{ marginBottom:16 }}>
                <div style={{ color:group.accent, fontSize:".68rem", fontWeight:800, letterSpacing:".1em", marginBottom:8 }}>{group.group}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {group.subjects.map(subj => {
                    const isSelected = selectedSubject === subj;
                    return (
                      <button key={subj} onClick={() => { setSelectedSubject(subj); setShowSubjectPicker(false); }}
                        style={{
                          background: isSelected ? `${group.accent}22` : T.surface,
                          border: `1px solid ${isSelected ? group.accent : T.border}`,
                          borderRadius:10, padding:"7px 13px", cursor:"pointer",
                          color: isSelected ? group.accent : T.textSub,
                          fontSize:".8rem", fontWeight: isSelected ? 700 : 500,
                          transition:"all 0.15s",
                        }}
                      >{subj}</button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Özel dersler */}
            {customSubjects.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ color:"#9B6FE8", fontSize:".68rem", fontWeight:800, letterSpacing:".1em", marginBottom:8 }}>ÖZEL DERSLER</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {customSubjects.map(subj => {
                    const isSelected = selectedSubject === subj;
                    return (
                      <button key={subj} onClick={() => { setSelectedSubject(subj); setShowSubjectPicker(false); }}
                        style={{
                          background: isSelected ? "rgba(155,111,232,0.2)" : T.surface,
                          border: `1px solid ${isSelected ? "#9B6FE8" : T.border}`,
                          borderRadius:10, padding:"7px 13px", cursor:"pointer",
                          color: isSelected ? "#9B6FE8" : T.textSub,
                          fontSize:".8rem", fontWeight: isSelected ? 700 : 500,
                          transition:"all 0.15s",
                          display:"flex", alignItems:"center", gap:6,
                        }}
                      >
                        {subj}
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            const updated = customSubjects.filter(s => s !== subj);
                            setCustomSubjects(updated);
                            try { localStorage.setItem("pomodoro_custom_subjects_v1", JSON.stringify(updated)); } catch {}
                            if (selectedSubject === subj) setSelectedSubject("Matematik");
                          }}
                          style={{ color:"rgba(239,68,68,0.6)", fontSize:".75rem", lineHeight:1 }}
                        >✕</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Özel ders ekle */}
            <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:16, marginTop:4 }}>
              <div style={{ color:T.textSub, fontSize:".72rem", fontWeight:700, letterSpacing:".06em", marginBottom:8 }}>ÖZEL DERS EKLE</div>
              <div style={{ display:"flex", gap:8 }}>
                <input
                  value={customSubjectInput}
                  onChange={e => setCustomSubjectInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && customSubjectInput.trim()) {
                      const name = customSubjectInput.trim();
                      if (!ALL_SUBJECTS.includes(name) && !customSubjects.includes(name)) {
                        const updated = [...customSubjects, name];
                        setCustomSubjects(updated);
                        try { localStorage.setItem("pomodoro_custom_subjects_v1", JSON.stringify(updated)); } catch {}
                      }
                      setSelectedSubject(name);
                      setCustomSubjectInput("");
                      setShowSubjectPicker(false);
                    }
                  }}
                  placeholder="ör. İngilizce, Felsefe..."
                  style={{
                    flex:1, background:T.surface, border:`1px solid ${T.border}`, borderRadius:10,
                    padding:"10px 14px", color:T.text, fontSize:".88rem", outline:"none",
                    fontFamily:"inherit",
                  }}
                />
                <button
                  onClick={() => {
                    const name = customSubjectInput.trim();
                    if (!name) return;
                    if (!ALL_SUBJECTS.includes(name) && !customSubjects.includes(name)) {
                      const updated = [...customSubjects, name];
                      setCustomSubjects(updated);
                      try { localStorage.setItem("pomodoro_custom_subjects_v1", JSON.stringify(updated)); } catch {}
                    }
                    setSelectedSubject(name);
                    setCustomSubjectInput("");
                    setShowSubjectPicker(false);
                  }}
                  style={{ background:"#9B6FE8", border:"none", borderRadius:10, padding:"10px 16px", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:".88rem" }}
                >Ekle</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HEDEF MODAL ── */}
      {showGoalSetup && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(6px)" }}
          onClick={e => { if (e.target===e.currentTarget) setShowGoalSetup(false); }}
        >
          <div style={{ background: T.modalBg, borderRadius:24, padding:28, maxWidth:440, width:"100%", border:`1px solid ${T.border}`, boxShadow:"0 24px 64px rgba(0,0,0,0.5)" }}>
            {/* Başlık */}
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:"2rem", marginBottom:6 }}>🎯</div>
              <h3 style={{ color:T.text, fontSize:"1.1rem", fontWeight:800, margin:0 }}>Günlük Hedef Belirle</h3>
              <p style={{ color:T.textSub, fontSize:".78rem", margin:"4px 0 0" }}>Kendine günlük çalışma hedefi koy</p>
            </div>

            {/* Süre seçimi */}
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <label style={{ color:T.textSub, fontSize:".75rem", fontWeight:700, letterSpacing:".06em" }}>GÜNLÜK ÇALIŞMA HEDEFİ</label>
                <span style={{ color:"#9B6FE8", fontWeight:800, fontSize:"1rem" }}>{fmtMin(tempGoal)}</span>
              </div>
              <input type="range" min={30} max={480} step={10} value={tempGoal} onChange={e=>setTempGoal(+e.target.value)} />
              {/* Hızlı seçim */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, marginTop:10 }}>
                {[60,90,120,180,240].map(v=>(
                  <button key={v} onClick={()=>setTempGoal(v)} style={{
                    background: tempGoal===v ? "rgba(155,111,232,0.2)" : T.surface2,
                    border: `1px solid ${tempGoal===v ? "#9B6FE8" : T.border}`,
                    borderRadius:8, padding:"6px 0", cursor:"pointer",
                    color: tempGoal===v ? "#9B6FE8" : T.textSub,
                    fontSize:".7rem", fontWeight:700,
                    transition:"all 0.15s",
                  }}>{fmtMin(v)}</button>
                ))}
              </div>
            </div>

            {/* Hayvan seçimi */}
            <div style={{ marginBottom:22 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <label style={{ color:T.textSub, fontSize:".75rem", fontWeight:700, letterSpacing:".06em" }}>TEMSİLCİ HAYVAN</label>
                <span style={{ color:T.textSub, fontSize:".75rem" }}>
                  {ANIMALS.find(a=>a.id===tempAnimal)?.name} ✓
                </span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:6 }}>
                {ANIMALS.map(a=>(
                  <button key={a.id} onClick={()=>setTempAnimal(a.id)} title={a.name}
                    style={{
                      aspectRatio:"1", padding:5, display:"flex", alignItems:"center", justifyContent:"center",
                      border: `2px solid ${tempAnimal===a.id ? "#a78bfa" : T.border}`,
                      background: tempAnimal===a.id ? "rgba(167,139,250,0.18)" : T.surface2,
                      cursor:"pointer", borderRadius:10,
                      transition:"all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                      transform: tempAnimal===a.id ? "scale(1.12)" : "scale(1)",
                    }}
                  >
                    <AnimalImg id={a.id} size={28} />
                  </button>
                ))}
              </div>
            </div>

            {/* Kaydet / İptal */}
            <div style={{ display:"flex", gap:10 }}>
              <button
                onClick={()=>setShowGoalSetup(false)}
                style={{ flex:1, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:13, color:T.text, fontWeight:600, cursor:"pointer", fontSize:".9rem" }}
              >İptal</button>
              <button
                onClick={()=>{ const g={minutes:tempGoal,animal:tempAnimal}; setDailyGoal(g); saveGoal(g); setShowGoalSetup(false); }}
                style={{ flex:2, background:"linear-gradient(135deg,#3b82f6,#7c3aed)", border:"none", borderRadius:12, padding:13, color:"#fff", fontWeight:700, cursor:"pointer", fontSize:".9rem", boxShadow:"0 6px 20px rgba(59,130,246,0.35)" }}
              >Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}