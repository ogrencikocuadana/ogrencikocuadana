"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";

import StudyBanner from "../components/StudyBanner";

  
    

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface Session {
  id: string; date: string; plannedDuration: number; actualDuration: number; completedAt: string;
  subject?: string;
  focusScore?: number;       // 0-100 hesaplanan skor
  phoneChecks?: number;      // 0=hiç, 1=1-2, 2=3-5, 3=5+
  mentalFocus?: number;      // 1-10 slider
  completionRate?: number;   // 0-100 yüzde
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
const THEME_KEY  = "pomodoro_theme_v1";

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
const TIMER_KEY     = "pomodoro_timer_v1";
const TASKS_KEY     = "pomodoro_tasks_v1";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function dateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
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

// ─── Seviye Sistemi ───────────────────────────────────────────────────────────
const PROFILE_KEY = "pomodoro_profile_v1";

type ExamType = "lgs" | "yks" | "genel";

interface UserProfile {
  name: string;
  examType: ExamType;
  joinDate: string;
}

const EXAM_LABELS: Record<ExamType, string> = {
  lgs:   "LGS",
  yks:   "YKS (TYT/AYT)",
  genel: "Genel / Diğer",
};

const LEVEL_TITLES: Record<ExamType, string[]> = {
  lgs:   ["Aday", "Azimli", "Çalışkan", "Odak Ustası", "LGS Kartalı"],
  yks:   ["Aday", "Azimli", "Çalışkan", "Odak Ustası", "YKS Kartalı"],
  genel: ["Aday", "Azimli", "Çalışkan", "Odak Ustası", "Şampiyon"],
};

// Eşikler: toplam çalışma dakikası
const LEVEL_THRESHOLDS = [0, 300, 1200, 3000, 6000]; // 0 / 5sa / 20sa / 50sa / 100sa
const LEVEL_ICONS      = ["🌱", "📖", "💡", "🔥", "🏆"];
const LEVEL_COLORS     = ["#6b7280", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];
const LEVEL_DESCS      = [
  "Yolculuk başlıyor — ilk adım en önemli adım.",
  "Düzenli çalışma alışkanlığı kazanıyorsun.",
  "Artık ciddi bir rakip sayılırsın.",
  "Odak ve disiplin senin doğanın parçası.",
  "Zirveye ulaştın. Hedefin göz önünde!",
];

function getLevel(totalMin: number) {
  let lvl = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalMin >= LEVEL_THRESHOLDS[i]) lvl = i;
  }
  return lvl;
}

function getLevelProgress(totalMin: number) {
  const lvl     = getLevel(totalMin);
  const current = LEVEL_THRESHOLDS[lvl];
  const next    = LEVEL_THRESHOLDS[lvl + 1];
  if (!next) return 100;
  return Math.round(((totalMin - current) / (next - current)) * 100);
}

// ─── Level Up Modal ───────────────────────────────────────────────────────────
const LevelUpModal = memo(function LevelUpModal({
  level, examType, T, isDark, onClose,
}: { level: number; examType: ExamType; T: Theme; isDark: boolean; onClose: () => void }) {
  const title = LEVEL_TITLES[examType][level];
  const icon  = LEVEL_ICONS[level];
  const color = LEVEL_COLORS[level];
  const desc  = LEVEL_DESCS[level];

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:24,
      backdropFilter:"blur(8px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: isDark ? "linear-gradient(145deg, #1e1c3a, #141f3a)" : "#fff",
        border:`2px solid ${color}`,
        borderRadius:28, padding:"40px 32px", maxWidth:340, width:"100%", textAlign:"center",
        boxShadow:`0 0 60px ${color}40, 0 24px 48px rgba(0,0,0,0.4)`,
        animation:"scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Parıltı halkası */}
        <div style={{ position:"relative", width:100, height:100, margin:"0 auto 24px" }}>
          <div style={{
            position:"absolute", inset:-8, borderRadius:"50%",
            background:`conic-gradient(${color}, transparent, ${color})`,
            animation:"rotate-slow 3s linear infinite", opacity:0.6,
          }} />
          <div style={{
            position:"absolute", inset:2, borderRadius:"50%",
            background: isDark ? "#1e1c3a" : "#fff",
          }} />
          <div style={{
            position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"2.8rem",
          }}>{icon}</div>
        </div>

        <div style={{ color, fontSize:".72rem", fontWeight:800, letterSpacing:".12em", marginBottom:8 }}>
          SEVİYE ATLADI!
        </div>
        <div style={{ color:T.text, fontSize:"1.6rem", fontWeight:900, marginBottom:10, lineHeight:1.1 }}>
          {title}
        </div>
        <div style={{ color:T.textSub, fontSize:".85rem", lineHeight:1.6, marginBottom:28 }}>
          {desc}
        </div>
        <button onClick={onClose} style={{
          background:`linear-gradient(135deg, ${color}, ${color}cc)`,
          border:"none", borderRadius:14, padding:"13px 32px",
          color:"#fff", fontWeight:800, fontSize:".9rem", cursor:"pointer",
          boxShadow:`0 8px 24px ${color}50`,
        }}>
          Harika! 🎉
        </button>
      </div>
    </div>
  );
});

// ─── Profil Sekmesi ───────────────────────────────────────────────────────────
function ProfileTab({
  sessions, streak, T, isDark,
}: { sessions: Session[]; streak: number; T: Theme; isDark: boolean }) {
  const [profile, setProfile]     = useState<UserProfile>({ name:"", examType:"lgs", joinDate: new Date().toISOString().slice(0,10) });
  const [editing, setEditing]     = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftExam, setDraftExam] = useState<ExamType>("lgs");
  const [levelUpShow, setLevelUpShow] = useState(false);
  const prevLevel = useRef(-1);

  const totalMin  = useMemo(() => sessions.reduce((a,s) => a+s.actualDuration, 0), [sessions]);
  const level     = getLevel(totalMin);
  const lvlPct    = getLevelProgress(totalMin);
  const title     = LEVEL_TITLES[profile.examType][level];
  const icon      = LEVEL_ICONS[level];
  const color     = LEVEL_COLORS[level];
  const nextTitle = LEVEL_TITLES[profile.examType][level + 1];
  const nextMin   = LEVEL_THRESHOLDS[level + 1];
  const remaining = nextMin ? nextMin - totalMin : 0;

  // localStorage yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        setProfile(p);
        setDraftName(p.name);
        setDraftExam(p.examType);
        prevLevel.current = getLevel(sessions.reduce((a,s) => a+s.actualDuration, 0));
      } else {
        setEditing(true); // ilk açılışta düzenleme modu
      }
    } catch {}
  }, []);

  // Seviye atlama kontrolü
  useEffect(() => {
    if (prevLevel.current === -1) { prevLevel.current = level; return; }
    if (level > prevLevel.current) {
      setLevelUpShow(true);
    }
    prevLevel.current = level;
  }, [level]);

  const saveProfile = () => {
    const p: UserProfile = { name: draftName.trim() || "Öğrenci", examType: draftExam, joinDate: profile.joinDate };
    setProfile(p);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
    setEditing(false);
  };

  // İstatistikler
  const todayStr2 = new Date().toISOString().slice(0,10);
  const weekStart2 = (() => { const d=new Date(); d.setDate(d.getDate()-d.getDay()+1); return d.toISOString().slice(0,10); })();
  const stats = useMemo(() => {
    const todayMin2 = sessions.filter(s=>s.date===todayStr2).reduce((a,s)=>a+s.actualDuration,0);
    const weekMin2  = sessions.filter(s=>s.date>=weekStart2).reduce((a,s)=>a+s.actualDuration,0);
    const totalSessions = sessions.length;
    const avgFocus = sessions.filter(s=>s.focusScore!==undefined).length > 0
      ? Math.round(sessions.filter(s=>s.focusScore!==undefined).reduce((a,s)=>a+(s.focusScore??0),0) / sessions.filter(s=>s.focusScore!==undefined).length)
      : null;
    const joinDays = Math.ceil((Date.now() - new Date(profile.joinDate).getTime()) / 86400000);
    return { todayMin2, weekMin2, totalSessions, avgFocus, joinDays };
  }, [sessions, profile.joinDate, todayStr2, weekStart2]);

  const fmtHours = (m: number) => m >= 60 ? `${Math.floor(m/60)}s ${m%60}dk` : `${m}dk`;

  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {levelUpShow && (
        <LevelUpModal level={level} examType={profile.examType} T={T} isDark={isDark} onClose={() => setLevelUpShow(false)} />
      )}

      {/* ── Profil Kartı ── */}
      <div style={{
        background: isDark
          ? `linear-gradient(135deg, ${color}22, rgba(255,255,255,0.04))`
          : `linear-gradient(135deg, ${color}15, rgba(255,255,255,0.9))`,
        border:`1.5px solid ${color}50`,
        borderRadius:24, padding:"28px 24px", textAlign:"center", position:"relative",
      }}>
        {/* Rozet ikonu */}
        <div style={{
          width:80, height:80, borderRadius:"50%", margin:"0 auto 16px",
          background:`radial-gradient(circle, ${color}30, ${color}10)`,
          border:`2px solid ${color}60`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"2.4rem", boxShadow:`0 0 24px ${color}30`,
        }}>{icon}</div>

        {editing ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12, alignItems:"center" }}>
            <input
              value={draftName}
              onChange={e => setDraftName(e.target.value)}
              placeholder="İsmin nedir?"
              maxLength={30}
              style={{
                background:T.surface, border:`1px solid ${color}60`, borderRadius:12,
                padding:"10px 16px", color:T.text, fontSize:".95rem", fontWeight:700,
                textAlign:"center", outline:"none", width:"100%", maxWidth:240,
              }}
            />
            <div style={{ display:"flex", gap:8 }}>
              {(["lgs","yks","genel"] as ExamType[]).map(et => (
                <button key={et} onClick={() => setDraftExam(et)} style={{
                  background: draftExam===et ? color : T.surface2,
                  border:`1px solid ${draftExam===et ? color : T.border}`,
                  borderRadius:10, padding:"7px 12px", cursor:"pointer",
                  color: draftExam===et ? "#fff" : T.textSub, fontSize:".72rem", fontWeight:700,
                }}>{EXAM_LABELS[et]}</button>
              ))}
            </div>
            <button onClick={saveProfile} style={{
              background:color, border:"none", borderRadius:12, padding:"10px 28px",
              color:"#fff", fontWeight:800, cursor:"pointer", fontSize:".88rem",
            }}>Kaydet</button>
          </div>
        ) : (
          <>
            <div style={{ color:T.text, fontSize:"1.4rem", fontWeight:900, marginBottom:4 }}>
              {profile.name || "Öğrenci"}
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:6 }}>
              <span style={{ background:`${color}20`, border:`1px solid ${color}40`, borderRadius:20, padding:"3px 12px", color, fontSize:".75rem", fontWeight:700 }}>
                {EXAM_LABELS[profile.examType]}
              </span>
            </div>
            <div style={{ color, fontSize:"1.05rem", fontWeight:800, marginBottom:20 }}>{title}</div>

            {/* Seviye ilerleme çubuğu */}
            <div style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ color:T.textMuted, fontSize:".68rem" }}>Seviye {level + 1}</span>
                {nextTitle && <span style={{ color:T.textMuted, fontSize:".68rem" }}>→ {nextTitle}</span>}
              </div>
              <div style={{ height:8, borderRadius:4, background:T.surface2, overflow:"hidden" }}>
                <div style={{
                  height:"100%", width:`${lvlPct}%`, borderRadius:4,
                  background:`linear-gradient(90deg, ${color}99, ${color})`,
                  transition:"width 0.8s ease", boxShadow:`0 0 8px ${color}60`,
                }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                <span style={{ color:T.textMuted, fontSize:".65rem" }}>{fmtHours(totalMin)} çalışıldı</span>
                {remaining > 0 && <span style={{ color:T.textMuted, fontSize:".65rem" }}>{fmtHours(remaining)} kaldı</span>}
                {remaining === 0 && <span style={{ color, fontSize:".65rem", fontWeight:700 }}>🏆 Maksimum seviye!</span>}
              </div>
            </div>

            <button onClick={() => { setDraftName(profile.name); setDraftExam(profile.examType); setEditing(true); }}
              style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:10, padding:"6px 16px", cursor:"pointer", color:T.textMuted, fontSize:".72rem", marginTop:8 }}>
              ✏️ Düzenle
            </button>
          </>
        )}
      </div>

      {/* ── Tüm Seviyeler ── */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:20 }}>
        <div style={{ color:T.textSub, fontSize:".72rem", fontWeight:700, letterSpacing:".07em", marginBottom:14 }}>📊 SEVİYE YOLU</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {LEVEL_TITLES[profile.examType].map((lvlTitle, i) => {
            const reached  = level >= i;
            const isCurrent = level === i;
            const lColor   = LEVEL_COLORS[i];
            const minNeeded = LEVEL_THRESHOLDS[i];
            return (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
                background: isCurrent ? `${lColor}15` : reached ? T.surface2 : "transparent",
                border:`1px solid ${isCurrent ? lColor+"60" : reached ? T.border : "transparent"}`,
                borderRadius:14, transition:"all 0.3s",
              }}>
                <div style={{
                  width:40, height:40, borderRadius:"50%", flexShrink:0,
                  background: reached ? `${lColor}25` : T.surface2,
                  border:`2px solid ${reached ? lColor : T.border}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"1.3rem", filter: reached ? "none" : "grayscale(1) opacity(0.4)",
                }}>{LEVEL_ICONS[i]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ color: reached ? T.text : T.textMuted, fontWeight: isCurrent ? 800 : 600, fontSize:".88rem" }}>{lvlTitle}</span>
                    {isCurrent && <span style={{ background:lColor, borderRadius:20, padding:"1px 8px", fontSize:".6rem", color:"#fff", fontWeight:700 }}>Şu an</span>}
                    {reached && !isCurrent && <span style={{ color:lColor, fontSize:".7rem" }}>✓</span>}
                  </div>
                  <div style={{ color:T.textMuted, fontSize:".68rem", marginTop:2 }}>
                    {minNeeded === 0 ? "Başlangıç" : `${minNeeded >= 60 ? `${Math.floor(minNeeded/60)} saat` : `${minNeeded} dk`} çalışma`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── İstatistikler ── */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:20 }}>
        <div style={{ color:T.textSub, fontSize:".72rem", fontWeight:700, letterSpacing:".07em", marginBottom:14 }}>📈 GENEL İSTATİSTİKLER</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { icon:"⏱️", label:"Toplam Çalışma",    val: fmtHours(totalMin) },
            { icon:"🔥", label:"Güncel Seri",        val: `${streak} gün` },
            { icon:"📅", label:"Bu Hafta",           val: fmtHours(stats.weekMin2) },
            { icon:"☀️", label:"Bugün",              val: fmtHours(stats.todayMin2) },
            { icon:"🎯", label:"Ort. Odak Skoru",    val: stats.avgFocus !== null ? `${stats.avgFocus}/100` : "—" },
            { icon:"📚", label:"Toplam Oturum",      val: `${stats.totalSessions}` },
          ].map((s,i) => (
            <div key={i} style={{ background:T.surface2, borderRadius:14, padding:"14px 12px", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:"1.3rem" }}>{s.icon}</span>
              <div>
                <div style={{ color:T.text, fontWeight:800, fontSize:".95rem" }}>{s.val}</div>
                <div style={{ color:T.textMuted, fontSize:".62rem" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Orman Sistemi ────────────────────────────────────────────────────────────
const FOREST_KEY = "pomodoro_forest_v1";
const TOKEN_KEY  = "pomodoro_tokens_v1";

interface ForestItem {
  id: string;
  typeId: string;
  x: number; // % of canvas width
  y: number; // % of canvas height
}
interface ForestData {
  items: ForestItem[];
  tokens: number;
  totalEarned: number;
}

const FOREST_CATALOG = [
  // ─── Ağaçlar ───
  { id:"pine",     emoji:"🌲", label:"Çam",        cost:0,   unlockAt:0,   category:"tree",     desc:"Temel ağaç" },
  { id:"tree",     emoji:"🌳", label:"Meşe",       cost:5,   unlockAt:10,  category:"tree",     desc:"10 token gerekli" },
  { id:"palm",     emoji:"🌴", label:"Palmiye",    cost:8,   unlockAt:25,  category:"tree",     desc:"25 token gerekli" },
  { id:"cherry",   emoji:"🌸", label:"Kiraz",      cost:12,  unlockAt:50,  category:"tree",     desc:"50 token gerekli" },
  { id:"cactus",   emoji:"🌵", label:"Kaktüs",     cost:6,   unlockAt:20,  category:"tree",     desc:"20 token gerekli" },
  { id:"seedling", emoji:"🌱", label:"Fidan",      cost:2,   unlockAt:5,   category:"tree",     desc:"5 token gerekli" },
  // ─── Çiçekler ───
  { id:"tulip",    emoji:"🌷", label:"Lale",       cost:4,   unlockAt:8,   category:"flower",   desc:"8 token gerekli" },
  { id:"sunflower",emoji:"🌻", label:"Ayçiçeği",  cost:6,   unlockAt:15,  category:"flower",   desc:"15 token gerekli" },
  { id:"rose",     emoji:"🌹", label:"Gül",        cost:8,   unlockAt:30,  category:"flower",   desc:"30 token gerekli" },
  { id:"mushroom", emoji:"🍄", label:"Mantar",     cost:3,   unlockAt:6,   category:"flower",   desc:"6 token gerekli" },
  // ─── Su ───
  { id:"droplet",  emoji:"💧", label:"Göl",        cost:10,  unlockAt:20,  category:"water",    desc:"20 token gerekli" },
  { id:"wave",     emoji:"🌊", label:"Nehir",      cost:15,  unlockAt:40,  category:"water",    desc:"40 token gerekli" },
  { id:"fountain", emoji:"⛲", label:"Çeşme",      cost:20,  unlockAt:60,  category:"water",    desc:"60 token gerekli" },
  // ─── Binalar ───
  { id:"school",   emoji:"🏫", label:"Okul",       cost:25,  unlockAt:75,  category:"building", desc:"75 token gerekli" },
  { id:"books",    emoji:"📚", label:"Kütüphane",  cost:30,  unlockAt:100, category:"building", desc:"100 token gerekli" },
  { id:"house",    emoji:"🏡", label:"Kulübe",     cost:18,  unlockAt:50,  category:"building", desc:"50 token gerekli" },
  // ─── Özel ───
  { id:"rainbow",  emoji:"🌈", label:"Gökkuşağı",  cost:40,  unlockAt:150, category:"special",  desc:"150 token gerekli" },
  { id:"star",     emoji:"⭐", label:"Yıldız",     cost:20,  unlockAt:80,  category:"special",  desc:"80 token gerekli" },
  { id:"moon",     emoji:"🌙", label:"Ay",         cost:15,  unlockAt:60,  category:"special",  desc:"60 token gerekli" },
  { id:"sun",      emoji:"☀️",  label:"Güneş",      cost:35,  unlockAt:120, category:"special",  desc:"120 token gerekli" },
];

const CATEGORY_LABELS: Record<string,string> = {
  tree:"🌲 Ağaçlar", flower:"🌸 Çiçekler & Bitkiler", water:"💧 Su", building:"🏛️ Binalar", special:"✨ Özel"
};

function calcTokens(session: Session): number {
  const base  = Math.floor(session.actualDuration / 5);          // her 5 dk = 1 token
  const bonus = session.focusScore ? Math.floor(session.focusScore / 20) : 0; // odak 0-100 → 0-5 bonus
  return Math.max(1, base + bonus);
}

function ForestTab({ sessions, T, isDark }: { sessions: Session[]; T: Theme; isDark: boolean }) {
  const [forest, setForest] = useState<ForestData>({ items: [], tokens: 0, totalEarned: 0 });
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ itemId: string; offsetX: number; offsetY: number } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("tree");
  const [showShop, setShowShop] = useState(false);
  const [lastEarned, setLastEarned] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const processedSessions = useRef<Set<string>>(new Set());

  // localStorage'dan yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FOREST_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForest(parsed);
      }
      // Hangi session'lar işlendi
      const processed = localStorage.getItem("forest_processed_v1");
      if (processed) processedSessions.current = new Set(JSON.parse(processed));
    } catch {}
  }, []);

  // Session'lardan token hesapla
  useEffect(() => {
    if (sessions.length === 0) return;
    let newTokens = 0;
    const newProcessed = new Set(processedSessions.current);
    sessions.forEach(s => {
      if (!newProcessed.has(s.id) && s.actualDuration >= 5) {
        newTokens += calcTokens(s);
        newProcessed.add(s.id);
      }
    });
    if (newTokens > 0) {
      processedSessions.current = newProcessed;
      try { localStorage.setItem("forest_processed_v1", JSON.stringify([...newProcessed])); } catch {}
      setForest(prev => {
        const updated = { ...prev, tokens: prev.tokens + newTokens, totalEarned: prev.totalEarned + newTokens };
        try { localStorage.setItem(FOREST_KEY, JSON.stringify(updated)); } catch {}
        return updated;
      });
      setLastEarned(newTokens);
      setTimeout(() => setLastEarned(null), 3000);
    }
  }, [sessions]);

  const saveForest = (data: ForestData) => {
    try { localStorage.setItem(FOREST_KEY, JSON.stringify(data)); } catch {}
  };

  // Öğe satın al + yerleştir
  const buyAndPlace = (typeId: string, x: number, y: number) => {
    const item = FOREST_CATALOG.find(c => c.id === typeId);
    if (!item || forest.tokens < item.cost) return;
    const newItem: ForestItem = { id: Date.now().toString(), typeId, x, y };
    const updated: ForestData = {
      ...forest,
      tokens: forest.tokens - item.cost,
      items: [...forest.items, newItem],
    };
    setForest(updated);
    saveForest(updated);
    setSelectedCatalog(null);
  };

  // Sürükleme bırakma - pozisyon güncelle
  const moveItem = (itemId: string, x: number, y: number) => {
    const updated = { ...forest, items: forest.items.map(it => it.id === itemId ? { ...it, x, y } : it) };
    setForest(updated);
    saveForest(updated);
  };

  // Öğe sil
  const removeItem = (itemId: string) => {
    const it = forest.items.find(i => i.id === itemId);
    const cat = it ? FOREST_CATALOG.find(c => c.id === it.typeId) : null;
    const refund = cat ? Math.floor(cat.cost * 0.5) : 0;
    const updated: ForestData = {
      ...forest,
      tokens: forest.tokens + refund,
      items: forest.items.filter(i => i.id !== itemId),
    };
    setForest(updated);
    saveForest(updated);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedCatalog || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    buyAndPlace(selectedCatalog, x, y);
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>, itemId: string) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const item = forest.items.find(i => i.id === itemId);
    if (!item) return;
    const elX = (item.x / 100) * rect.width + rect.left;
    const elY = (item.y / 100) * rect.height + rect.top;
    setDragging({ itemId, offsetX: e.clientX - elX, offsetY: e.clientY - elY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.min(98, Math.max(2, ((e.clientX - dragging.offsetX - rect.left) / rect.width) * 100));
    const y = Math.min(95, Math.max(2, ((e.clientY - dragging.offsetY - rect.top) / rect.height) * 100));
    setForest(prev => ({ ...prev, items: prev.items.map(it => it.id === dragging.itemId ? { ...it, x, y } : it) }));
  };

  const handleCanvasMouseUp = () => {
    if (dragging) {
      saveForest(forest);
      setDragging(null);
    }
  };

  const unlockedIds = new Set(FOREST_CATALOG.filter(c => forest.totalEarned >= c.unlockAt).map(c => c.id));
  const categories = [...new Set(FOREST_CATALOG.map(c => c.category))];

  // Arka plan rengi/degrade
  const bgStyle = isDark
    ? "linear-gradient(180deg, #0a1628 0%, #0d2318 40%, #071a10 100%)"
    : "linear-gradient(180deg, #87ceeb 0%, #a8d8a8 60%, #5a8a5a 100%)";

  const groundColor = isDark ? "#1a3a1a" : "#4a7a4a";

  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Token başlık */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h2 style={{ color:T.text, fontSize:"1.2rem", fontWeight:800, margin:0 }}>🌲 Dijital Ormanım</h2>
          <p style={{ color:T.textSub, fontSize:".75rem", margin:"3px 0 0" }}>Çalış, token kazan, ormanını büyüt</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {lastEarned && (
            <div style={{ background:"rgba(74,158,142,0.2)", border:"1px solid rgba(74,158,142,0.5)", borderRadius:10, padding:"4px 10px", fontSize:".75rem", color:"#4A9E8E", fontWeight:700, animation:"fade-in 0.3s ease" }}>
              +{lastEarned} 🪙
            </div>
          )}
          <div style={{ background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.4)", borderRadius:12, padding:"8px 14px", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:"1.2rem" }}>🪙</span>
            <div>
              <div style={{ color:"#f59e0b", fontWeight:800, fontSize:"1rem", lineHeight:1 }}>{forest.tokens}</div>
              <div style={{ color:"rgba(245,158,11,0.6)", fontSize:".6rem" }}>token</div>
            </div>
          </div>
          <button onClick={() => setShowShop(v => !v)} style={{
            background: showShop ? "rgba(155,111,232,0.2)" : T.surface,
            border:`1px solid ${showShop ? "#9B6FE8" : T.border}`,
            borderRadius:12, padding:"8px 12px", cursor:"pointer",
            color: showShop ? "#9B6FE8" : T.textSub, fontWeight:700, fontSize:".8rem",
          }}>🛒 Mağaza</button>
        </div>
      </div>

      {/* Token kazanma bilgisi */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 14px", display:"flex", gap:16 }}>
        {[
          { icon:"⏱️", text:"Her 5 dk = 1 🪙" },
          { icon:"🎯", text:"Odak 80+ = +5 bonus 🪙" },
          { icon:"🏷️", text:"Yerleştir, taşı, sat (%50 iade)" },
        ].map((h,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:5, flex:1 }}>
            <span style={{ fontSize:".9rem" }}>{h.icon}</span>
            <span style={{ color:T.textSub, fontSize:".68rem" }}>{h.text}</span>
          </div>
        ))}
      </div>

      {/* ORMAN SAHNESİ */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={{
          position:"relative", width:"100%", height:320,
          background: bgStyle,
          borderRadius:20, overflow:"hidden",
          border:`2px solid ${selectedCatalog ? "#9B6FE8" : T.border}`,
          cursor: selectedCatalog ? "crosshair" : "default",
          boxShadow: selectedCatalog ? "0 0 0 3px rgba(155,111,232,0.25)" : "none",
          transition:"border-color 0.2s, box-shadow 0.2s",
          userSelect:"none",
        }}
      >
        {/* Gökyüzü yıldızları (dark mode) */}
        {isDark && Array.from({length:20}, (_,i) => (
          <div key={i} style={{ position:"absolute", width:2, height:2, borderRadius:1, background:"rgba(255,255,255,0.6)",
            left:`${(i*37+11)%95}%`, top:`${(i*23+5)%45}%`,
            animation:`pulse-ring ${1.5+(i%3)*0.5}s ease-in-out infinite`, opacity:0.5+Math.random()*0.5 }} />
        ))}
        {/* Bulutlar (light mode) */}
        {!isDark && [15,45,70].map((left,i) => (
          <div key={i} style={{ position:"absolute", top:`${8+i*8}%`, left:`${left}%`,
            fontSize:"1.8rem", opacity:0.7, animation:`pulse-ring ${3+i}s ease-in-out infinite` }}>☁️</div>
        ))}

        {/* Zemin şeridi */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"28%",
          background: groundColor,
          borderTop:`2px solid ${isDark?"rgba(74,158,142,0.3)":"rgba(80,130,80,0.5)"}` }} />
        {/* Çim detayı */}
        {Array.from({length:12}, (_,i) => (
          <div key={i} style={{ position:"absolute", bottom:"27%", left:`${i*9+2}%`,
            fontSize:".7rem", opacity:0.7 }}>🌿</div>
        ))}

        {/* Yerleştirilen öğeler */}
        {forest.items.map(item => {
          const cat = FOREST_CATALOG.find(c => c.id === item.typeId);
          if (!cat) return null;
          return (
            <div
              key={item.id}
              onMouseDown={e => handleDragStart(e, item.id)}
              onDoubleClick={e => { e.stopPropagation(); removeItem(item.id); }}
              style={{
                position:"absolute",
                left:`${item.x}%`, top:`${item.y}%`,
                transform:"translate(-50%, -50%)",
                fontSize:"2rem", lineHeight:1,
                cursor: dragging?.itemId === item.id ? "grabbing" : "grab",
                transition: dragging?.itemId === item.id ? "none" : "filter 0.2s",
                filter: dragging?.itemId === item.id ? "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" : "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
                zIndex: dragging?.itemId === item.id ? 10 : 1,
                userSelect:"none",
              }}
              title={`${cat.label} — çift tıkla sil (${Math.floor(cat.cost*0.5)} 🪙 iade)`}
            >
              {cat.emoji}
            </div>
          );
        })}

        {/* Yerleştirme ipucu */}
        {selectedCatalog && (
          <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)",
            background:"rgba(155,111,232,0.85)", borderRadius:20, padding:"5px 14px",
            color:"#fff", fontSize:".72rem", fontWeight:700, pointerEvents:"none", backdropFilter:"blur(4px)" }}>
            Yerleştirmek için tıkla • ESC ile iptal
          </div>
        )}

        {/* Boş orman mesajı */}
        {forest.items.length === 0 && !selectedCatalog && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
            <div style={{ fontSize:"3rem", marginBottom:8, opacity:0.4 }}>🌱</div>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:".82rem", fontWeight:600 }}>Mağazadan öğe seç, ormana yerleştir</div>
          </div>
        )}
      </div>

      {/* ESC tuşu ile iptal */}
      {selectedCatalog && (
        <div style={{ textAlign:"center" }}>
          <button onClick={() => setSelectedCatalog(null)} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:".78rem", textDecoration:"underline" }}>
            İptal (ESC)
          </button>
        </div>
      )}

      {/* MAĞAZA */}
      {showShop && (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:18, marginTop:4 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ color:T.text, fontWeight:800, fontSize:".95rem" }}>🛒 Orman Mağazası</div>
            <div style={{ color:T.textMuted, fontSize:".72rem" }}>Toplam kazanılan: <b style={{color:"#f59e0b"}}>{forest.totalEarned} 🪙</b></div>
          </div>

          {/* Kategori tabs */}
          <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                background: activeCategory===cat ? "rgba(155,111,232,0.2)" : T.surface2,
                border:`1px solid ${activeCategory===cat ? "#9B6FE8" : T.border}`,
                borderRadius:20, padding:"5px 12px", cursor:"pointer", whiteSpace:"nowrap",
                color: activeCategory===cat ? "#9B6FE8" : T.textSub, fontSize:".72rem", fontWeight:700, flexShrink:0,
              }}>{CATEGORY_LABELS[cat]}</button>
            ))}
          </div>

          {/* Öğe grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {FOREST_CATALOG.filter(c => c.category === activeCategory).map(item => {
              const unlocked = unlockedIds.has(item.id);
              const canAfford = forest.tokens >= item.cost;
              const isSelected = selectedCatalog === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!unlocked || !canAfford) return;
                    setSelectedCatalog(isSelected ? null : item.id);
                    if (!isSelected) setShowShop(false);
                  }}
                  style={{
                    background: isSelected ? "rgba(155,111,232,0.2)" : unlocked && canAfford ? T.surface2 : "rgba(0,0,0,0.1)",
                    border:`1px solid ${isSelected ? "#9B6FE8" : unlocked ? (canAfford ? T.border : "rgba(232,69,74,0.3)") : "rgba(255,255,255,0.05)"}`,
                    borderRadius:14, padding:"12px 8px", cursor: unlocked && canAfford ? "pointer" : "not-allowed",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                    opacity: unlocked ? 1 : 0.5, transition:"all 0.15s",
                    transform: isSelected ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  <span style={{ fontSize:"2rem", filter: !unlocked ? "grayscale(1) opacity(0.5)" : "none" }}>{item.emoji}</span>
                  <span style={{ color: unlocked ? T.text : T.textMuted, fontSize:".72rem", fontWeight:700 }}>{item.label}</span>
                  {unlocked ? (
                    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                      <span style={{ fontSize:".65rem" }}>🪙</span>
                      <span style={{ color: canAfford ? "#f59e0b" : "#E8454A", fontSize:".72rem", fontWeight:700 }}>{item.cost}</span>
                    </div>
                  ) : (
                    <div style={{ color:T.textMuted, fontSize:".6rem", textAlign:"center" }}>{item.desc}</div>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ color:T.textMuted, fontSize:".68rem", textAlign:"center", marginTop:12 }}>
            Sahneye tıkla yerleştir · Çift tıkla kaldır (%50 iade)
          </div>
        </div>
      )}

      {/* İstatistik */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"14px 16px" }}>
        <div style={{ color:T.textSub, fontSize:".68rem", fontWeight:700, letterSpacing:".07em", marginBottom:12 }}>🌿 ORMAN İSTATİSTİKLERİ</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {[
            { label:"Toplam Token", val:forest.totalEarned, icon:"🪙" },
            { label:"Kalan Token", val:forest.tokens, icon:"💰" },
            { label:"Yerleşik Öğe", val:forest.items.length, icon:"🌲" },
          ].map((s,i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"1.3rem" }}>{s.icon}</div>
              <div style={{ color:T.text, fontWeight:800, fontSize:"1.1rem" }}>{s.val}</div>
              <div style={{ color:T.textMuted, fontSize:".62rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Timer Dairesi (izole — sadece seconds/phase değişince render edilir) ────
const TimerCircle = memo(function TimerCircle({ seconds, phase, accent, dashOffset, idleDuration, T, isDark, goalMet, circumference }: {
  seconds: number; phase: "idle"|"work"|"rest";
  accent: string; dashOffset: number; idleDuration: number; T: Theme; isDark: boolean;
  goalMet: boolean; circumference: number;
}) {

  return (
    <div style={{ position:"relative", width:220, height:220 }}>
      {phase !== "idle" && (
        <div style={{
          position:"absolute", inset:-16, borderRadius:"50%",
          background:`radial-gradient(circle, ${phase === "rest" ? "#4A9E8E" : accent}2a 0%, transparent 70%)`,
          animation:"pulse-ring 2.2s ease-in-out infinite",
        }} />
      )}
      {goalMet && <div style={{ position:"absolute", inset:-8, borderRadius:"50%", animation:"celebrate-pulse 1.5s ease-in-out infinite" }} />}

      <svg width="220" height="220" style={{ position:"absolute", inset:0, transform:"rotate(-90deg)" }}>
        <circle cx="110" cy="110" r="90" fill="none" stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"} strokeWidth="12" />
        <circle
          cx="110" cy="110" r="90" fill="none"
          stroke={phase === "rest" ? "#4A9E8E" : accent}
          strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition:"stroke-dashoffset 0.5s ease, stroke 0.6s ease" }}
        />
      </svg>

      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2 }}>
        {phase !== "idle" && (
          <div style={{
            fontSize:".65rem", fontWeight:800, letterSpacing:".08em",
            color: phase === "rest" ? "#4A9E8E" : accent,
            background: phase === "rest" ? "rgba(74,158,142,0.12)" : `${accent}18`,
            borderRadius:6, padding:"2px 8px", marginBottom:4, transition:"all 0.5s ease",
          }}>
            {phase === "work" ? "ODAK" : "MOLA"}
          </div>
        )}
        <div style={{ fontSize:"2.8rem", fontWeight:800, color:T.text, letterSpacing:"-2px", fontVariantNumeric:"tabular-nums", lineHeight:1 }}>
          {phase === "idle" ? fmtTime(idleDuration) : fmtTime(seconds)}
        </div>
        <div style={{ fontSize:".75rem", color:T.textSub, marginTop:6, fontWeight:600 }}>
          {phase === "idle" ? "başlamaya hazır" : phase === "work" ? "🔥 odak zamanı" : "☕ mola zamanı"}
        </div>
      </div>
    </div>
  );
});

// ─── Mola Aktiviteleri ───────────────────────────────────────────────────────
const BREAK_ACTIVITIES = [
  { icon: "💧", text: "Bir bardak su iç. Beyin %75 su — dehidrasyon konsantrasyonu düşürür." },
  { icon: "👁️", text: "Gözlerini kapat, 30 saniye dinlendir. Ekrana uzun bakış göz yorgunluğu yapar." },
  { icon: "🌿", text: "Pencereden dışarıya bak. Uzağa bakmak göz kaslarını gevşetir." },
  { icon: "🧘", text: "4 saniye nefes al, 4 tut, 4 ver. Üç kez tekrarla — kortizol düşer." },
  { icon: "🚶", text: "Ayağa kalk, birkaç adım at. Oturarak çalışmak kan dolaşımını yavaşlatır." },
  { icon: "🤸", text: "Boyun ve omuzlarını yavaşça gerin. Uzun oturuş kas gerginliği yaratır." },
  { icon: "😊", text: "Sevdiğin birini düşün ya da kısa bir mesaj at. Pozitif duygu odaklanmayı artırır." },
  { icon: "🎵", text: "Sevdiğin bir şarkıyı dinle. Müzik dopamin salgılar, sonraki oturuma taze başlarsın." },
  { icon: "📓", text: "Az önce öğrendiklerinden birini aklından geçir. Aktif hatırlama kalıcı öğrenmeyi güçlendirir." },
  { icon: "🍎", text: "Hafif bir şeyler atıştır — meyve veya kuruyemiş. Kan şekeri odaklanmayı etkiler." },
  { icon: "🌬️", text: "Derin bir nefes al ve yavaşça bırak. Anlık stres için en hızlı çözüm bu." },
  { icon: "✍️", text: "Bir sonraki oturumda ne çalışacağını not al. Zihin boşalır, odaklanma kolaylaşır." },
];

const BreakActivity = memo(function BreakActivity({ T, isDark }: { T: Theme; isDark: boolean }) {
  const [activity] = useState(() => BREAK_ACTIVITIES[Math.floor(Math.random() * BREAK_ACTIVITIES.length)]);
  const [done, setDone] = useState(false);

  return (
    <div style={{
      width: "100%", maxWidth: 520,
      background: isDark ? "rgba(74,158,142,0.08)" : "rgba(74,158,142,0.06)",
      border: `1px solid ${done ? "#4A9E8E66" : "rgba(74,158,142,0.25)"}`,
      borderRadius: 16, padding: "16px 18px",
      transition: "all 0.4s ease",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: "1.6rem", flexShrink: 0, marginTop: 1 }}>{activity.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#4A9E8E", fontSize: ".68rem", fontWeight: 700, letterSpacing: ".08em", marginBottom: 5 }}>☕ MOLA AKTİVİTESİ</div>
          <p style={{
            color: done ? "#4A9E8E" : T.text,
            fontSize: ".85rem", fontWeight: 500, margin: "0 0 12px", lineHeight: 1.5,
            textDecoration: done ? "line-through" : "none",
            transition: "all 0.3s",
          }}>{activity.text}</p>
          <button
            onClick={() => setDone(d => !d)}
            style={{
              background: done ? "rgba(74,158,142,0.2)" : T.surface,
              border: `1px solid ${done ? "#4A9E8E" : "rgba(74,158,142,0.3)"}`,
              borderRadius: 8, padding: "5px 12px", cursor: "pointer",
              color: done ? "#4A9E8E" : T.textSub,
              fontSize: ".75rem", fontWeight: 700, transition: "all 0.2s",
            }}
          >{done ? "✓ Yapıldı!" : "Yaptım ✓"}</button>
        </div>
      </div>
    </div>
  );
});

// ─── Odak Skoru Modalı ───────────────────────────────────────────────────────
const PHONE_OPTIONS = [
  { val: 0, label: "Hiç bakmadım", icon: "🏆" },
  { val: 1, label: "1-2 kez",      icon: "👍" },
  { val: 2, label: "3-5 kez",      icon: "😬" },
  { val: 3, label: "5+ kez",       icon: "😅" },
];

function calcFocusScore(phone: number, mental: number, completion: number): number {
  const phonePenalty = [0, 10, 30, 50][phone] ?? 0;
  const mentalNorm   = (mental / 10) * 100;
  const raw = (completion * 0.6) + (mentalNorm * 0.4) - phonePenalty;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

function scoreColor(score: number): string {
  if (score >= 80) return "#4A9E8E";
  if (score >= 60) return "#4A6BE8";
  if (score >= 40) return "#f59e0b";
  return "#E8454A";
}

function FocusModal({ T, isDark, animalId, onSave, onSkip }: {
  T: Theme; isDark: boolean; animalId: string;
  onSave: (phone: number, mental: number, completion: number) => void;
  onSkip: () => void;
}) {
  const [phone,      setPhone]      = useState(0);
  const [mental,     setMental]     = useState(7);
  const [completion, setCompletion] = useState(80);

  const preview = calcFocusScore(phone, mental, completion);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)", overflowY:"auto" }}>
      <div style={{ background:T.modalBg, borderRadius:24, padding:"28px 24px", maxWidth:400, width:"100%", border:`1px solid ${T.border}`, boxShadow:"0 24px 64px rgba(0,0,0,0.6)" }}>

        {/* Başlık */}
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <AnimalImg id={animalId} size={56} />
          <h3 style={{ color:T.text, fontSize:"1.05rem", fontWeight:800, margin:"10px 0 4px" }}>Oturum Tamamlandı! 🎉</h3>
          <p style={{ color:T.textSub, fontSize:".8rem", margin:0 }}>3 soruyu yanıtla, odak skorunu hesaplayalım</p>
        </div>

        {/* SORU 1 — Telefon */}
        <div style={{ marginBottom:20 }}>
          <div style={{ color:T.textSub, fontSize:".72rem", fontWeight:700, letterSpacing:".07em", marginBottom:10 }}>📱 TELEFONA KAÇ KEZ BAKTIN?</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {PHONE_OPTIONS.map(opt => (
              <button key={opt.val} onClick={() => setPhone(opt.val)} style={{
                background: phone === opt.val ? "rgba(155,111,232,0.2)" : T.surface,
                border: `1px solid ${phone === opt.val ? "#9B6FE8" : T.border}`,
                borderRadius:12, padding:"10px 8px", cursor:"pointer",
                display:"flex", alignItems:"center", gap:8, transition:"all 0.15s",
              }}>
                <span style={{ fontSize:"1.2rem" }}>{opt.icon}</span>
                <span style={{ color: phone === opt.val ? "#9B6FE8" : T.textSub, fontSize:".8rem", fontWeight: phone === opt.val ? 700 : 400 }}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SORU 2 — Zihinsel Durum */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ color:T.textSub, fontSize:".72rem", fontWeight:700, letterSpacing:".07em" }}>🧠 DİKKATİNİ PUANLAYALIM</div>
            <span style={{ color:"#9B6FE8", fontWeight:800, fontSize:".9rem" }}>{mental}/10</span>
          </div>
          <input type="range" min={1} max={10} step={1} value={mental} onChange={e => setMental(+e.target.value)} style={{ width:"100%", accentColor:"#9B6FE8" }} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
            <span style={{ color:T.textMuted, fontSize:".65rem" }}>Çok dağınıktı</span>
            <span style={{ color:T.textMuted, fontSize:".65rem" }}>Tam odakta</span>
          </div>
        </div>

        {/* SORU 3 — Çıktı Hedefi */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ color:T.textSub, fontSize:".72rem", fontWeight:700, letterSpacing:".07em" }}>🎯 HEDEFİNE NE KADAR ULAŞTIN?</div>
            <span style={{ color:"#9B6FE8", fontWeight:800, fontSize:".9rem" }}>%{completion}</span>
          </div>
          <input type="range" min={0} max={100} step={5} value={completion} onChange={e => setCompletion(+e.target.value)} style={{ width:"100%", accentColor:"#9B6FE8" }} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
            <span style={{ color:T.textMuted, fontSize:".65rem" }}>%0 — Hiç</span>
            <span style={{ color:T.textMuted, fontSize:".65rem" }}>%100 — Tam</span>
          </div>
        </div>

        {/* Önizleme skoru */}
        <div style={{ background: `${scoreColor(preview)}18`, border:`1px solid ${scoreColor(preview)}44`, borderRadius:14, padding:"14px 18px", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ color:T.textSub, fontSize:".78rem", fontWeight:700, letterSpacing:".06em" }}>ODAK SKORU</div>
          <div style={{ color:scoreColor(preview), fontSize:"2rem", fontWeight:800, lineHeight:1 }}>{preview}</div>
        </div>

        {/* Kaydet / Atla */}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onSkip} style={{ flex:1, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:12, color:T.textSub, cursor:"pointer", fontSize:".85rem", fontWeight:600 }}>Atla</button>
          <button onClick={() => onSave(phone, mental, completion)} style={{ flex:2, background:`linear-gradient(135deg,#3b82f6,#7c3aed)`, border:"none", borderRadius:12, padding:12, color:"#fff", cursor:"pointer", fontSize:".9rem", fontWeight:700, boxShadow:"0 6px 20px rgba(59,130,246,0.35)" }}>
            Kaydet → {preview} puan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sınav Geri Sayım Bileşeni ───────────────────────────────────────────────
const EXAM_DATES = [
  { label: "LGS",  datetime: new Date("2026-06-14T09:30:00"), color: "#7c3aed", accent: "#a78bfa", icon: "📐" },
  { label: "TYT",  datetime: new Date("2026-06-20T10:15:00"), color: "#0e7490", accent: "#22d3ee", icon: "📋" },
  { label: "AYT",  datetime: new Date("2026-06-21T10:15:00"), color: "#065f46", accent: "#34d399", icon: "🎯" },
];

function calcRemaining(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSec = Math.floor(diff / 1000);
  const days    = Math.floor(totalSec / 86400);
  const hours   = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds };
}

function ExamCountdown({ T, isDark }: { T: Theme; isDark: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", gap: 8, width: "100%" }}>
      {EXAM_DATES.map(e => {
        const rem    = calcRemaining(e.datetime);
        const isPast = !rem;
        const isClose = rem ? rem.days <= 30 : false;

        return (
          <div key={e.label} style={{
            flex: 1,
            background: isDark
              ? `linear-gradient(145deg, ${e.color}28, ${e.color}10)`
              : `linear-gradient(145deg, ${e.color}12, ${e.color}06)`,
            border: `1px solid ${isClose ? e.accent : e.color}${isClose ? "55" : "30"}`,
            borderRadius: 14, padding: "10px 8px",
            textAlign: "center",
            boxShadow: isClose ? `0 0 12px ${e.accent}18` : "none",
            transition: "border-color 0.5s, box-shadow 0.5s",
          }}>
            {/* İkon + etiket */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 6 }}>
              <span style={{ fontSize: "1rem" }}>{e.icon}</span>
              <span style={{ color: e.accent, fontWeight: 800, fontSize: ".8rem" }}>{e.label}</span>
            </div>

            {isPast ? (
              <div style={{ color: T.textMuted, fontSize: ".72rem", fontWeight: 700 }}>Tamamlandı ✓</div>
            ) : (
              <>
                {/* Gün — büyük */}
                <div style={{
                  color: e.accent, fontWeight: 900,
                  fontSize: rem.days > 99 ? "1.6rem" : "1.9rem",
                  lineHeight: 1, fontVariantNumeric: "tabular-nums",
                }}>
                  {rem.days}
                </div>
                <div style={{ color: T.textMuted, fontSize: ".6rem", marginBottom: 6 }}>gün</div>

                {/* Saat : Dk : Sn — küçük */}
                <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                  {[
                    { val: rem.hours,   unit: "sa" },
                    { val: rem.minutes, unit: "dk" },
                    { val: rem.seconds, unit: "sn" },
                  ].map(({ val, unit }, i) => (
                    <div key={unit} style={{ display: "flex", alignItems: "center", gap: i < 2 ? 4 : 0 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ color: T.textSub, fontWeight: 700, fontSize: ".72rem", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                          {String(val).padStart(2, "0")}
                        </div>
                        <div style={{ color: T.textMuted, fontSize: ".52rem" }}>{unit}</div>
                      </div>
                      {i < 2 && <span style={{ color: T.textMuted, fontSize: ".65rem", marginBottom: 6 }}>:</span>}
                    </div>
                  ))}
                </div>

                {/* Son 30 gün progress */}
                {isClose && (
                  <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: `${e.color}25`, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${100 - (rem.days / 30) * 100}%`,
                      background: e.accent, borderRadius: 2,
                      transition: "width 1s linear",
                    }} />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
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
function ReportShareButton({ todayMin, todaySessions, weekMin, totalSessions, streak, isDark, T, totalMin, topSubject, todayFocusAvg }: {
  todayMin: number; todaySessions: number; weekMin: number;
  totalSessions: number; streak: number; isDark: boolean; T: Theme;
  totalMin: number; topSubject: string; todayFocusAvg: number | null;
}) {
  const [loading, setLoading] = useState(false);

  const buildCanvas = (): Promise<HTMLCanvasElement> => new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const W = 640, H = 1200;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // ── Arka plan: derin lacivert → mor → petrol ──
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,   "#080e21");
    bg.addColorStop(0.4, "#120c2e");
    bg.addColorStop(0.75,"#0b1e35");
    bg.addColorStop(1,   "#060f1c");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Işık lekeleri
    const addGlow = (cx: number, cy: number, r: number, color: string, alpha: number) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, color.replace(")", `,${alpha})`).replace("rgb","rgba"));
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    };
    addGlow(W*0.85, H*0.08, 380, "rgb(155,111,232)", 0.22);
    addGlow(W*0.1,  H*0.55, 300, "rgb(74,158,142)",  0.16);
    addGlow(W*0.5,  H*0.88, 260, "rgb(74,107,232)",  0.14);

    // Nokta grid
    ctx.fillStyle = "rgba(255,255,255,0.018)";
    for (let x = 20; x < W; x += 32) for (let y = 20; y < H; y += 32) {
      ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI*2); ctx.fill();
    }

    // Yardımcı: yuvarlak dikdörtgen path
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
    };

    // Yardımcı: glass kart
    const glassCard = (x: number, y: number, w: number, h: number, r: number, borderColor = "rgba(255,255,255,0.08)") => {
      ctx.fillStyle = "rgba(255,255,255,0.045)"; rr(x,y,w,h,r); ctx.fill();
      ctx.strokeStyle = borderColor; ctx.lineWidth = 1; rr(x,y,w,h,r); ctx.stroke();
    };

    // ═══════════════════════════════════════════
    // 1. HEADER
    // ═══════════════════════════════════════════
    // Üst etiket
    glassCard(W/2-145, 44, 290, 44, 22, "rgba(155,111,232,0.4)");
    ctx.fillStyle = "rgba(155,111,232,0.25)"; rr(W/2-145,44,290,44,22); ctx.fill();
    ctx.fillStyle = "#c4a8f5"; ctx.font = "700 13px -apple-system,sans-serif"; ctx.textAlign = "center";
    ctx.fillText("⏱  POMODORO İSTATİSTİKLERİM", W/2, 71);

    // Büyük başlık
    ctx.fillStyle = "white"; ctx.font = "800 38px -apple-system,sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Çalışma Raporum", W/2, 130);

    // Tarih
    const months = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    const nd = new Date();
    const dayNames = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
    ctx.fillStyle = "rgba(196,168,245,0.6)"; ctx.font = "400 14px -apple-system,sans-serif";
    ctx.fillText(`${dayNames[nd.getDay()]}, ${nd.getDate()} ${months[nd.getMonth()]} ${nd.getFullYear()}`, W/2, 158);

    // Ayırıcı çizgi
    const sep = ctx.createLinearGradient(40,0,W-40,0);
    sep.addColorStop(0,"transparent"); sep.addColorStop(0.5,"rgba(155,111,232,0.4)"); sep.addColorStop(1,"transparent");
    ctx.strokeStyle = sep; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40,176); ctx.lineTo(W-40,176); ctx.stroke();

    // ═══════════════════════════════════════════
    // 2. BUGÜN KARTI (büyük hero)
    // ═══════════════════════════════════════════
    const todayCardY = 196;
    glassCard(28, todayCardY, W-56, 168, 22, "rgba(232,69,74,0.35)");
    // Sol renkli şerit
    ctx.fillStyle = "#E8454A"; ctx.beginPath();
    ctx.moveTo(28,todayCardY+22); ctx.quadraticCurveTo(28,todayCardY,28+22,todayCardY);
    ctx.lineTo(28+22,todayCardY); ctx.lineTo(28+5,todayCardY); ctx.quadraticCurveTo(28,todayCardY,28,todayCardY+22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#E8454A88"; ctx.fillRect(28, todayCardY+22, 5, 168-44);
    ctx.fillStyle = "#E8454A"; ctx.beginPath();
    ctx.moveTo(28,todayCardY+168-22); ctx.quadraticCurveTo(28,todayCardY+168,28+22,todayCardY+168);
    ctx.lineTo(28+5,todayCardY+168); ctx.quadraticCurveTo(28,todayCardY+168,28,todayCardY+168-22); ctx.closePath(); ctx.fill();

    ctx.fillStyle = "#f87171"; ctx.font = "700 11px -apple-system,sans-serif"; ctx.textAlign = "left";
    ctx.fillText("BUGÜN", 50, todayCardY+28);

    const todayFmt = todayMin >= 60 ? `${Math.floor(todayMin/60)} sa ${todayMin%60} dk` : `${todayMin} dk`;
    ctx.fillStyle = "white"; ctx.font = "800 52px -apple-system,sans-serif";
    ctx.fillText(todayFmt, 50, todayCardY+95);

    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "400 14px -apple-system,sans-serif";
    ctx.fillText(`${todaySessions} oturum tamamlandı`, 50, todayCardY+124);

    if (todayFocusAvg !== null) {
      const fc = todayFocusAvg >= 80 ? "#4A9E8E" : todayFocusAvg >= 60 ? "#9B6FE8" : "#f59e0b";
      ctx.fillStyle = `${fc}30`; rr(50,todayCardY+136,180,26,10); ctx.fill();
      ctx.strokeStyle = `${fc}60`; ctx.lineWidth = 1; rr(50,todayCardY+136,180,26,10); ctx.stroke();
      ctx.fillStyle = fc; ctx.font = "700 12px -apple-system,sans-serif";
      ctx.fillText(`🎯  Odak Skoru: ${Math.round(todayFocusAvg)} / 100`, 64, todayCardY+154);
    }

    // ═══════════════════════════════════════════
    // 3. HAFTA + TOPLAM yan yana
    // ═══════════════════════════════════════════
    const row2Y = todayCardY + 168 + 14;
    const halfW = (W-56-12)/2;

    // Hafta kartı
    glassCard(28, row2Y, halfW, 110, 18, "rgba(74,158,142,0.35)");
    ctx.fillStyle = "#4A9E8E"; ctx.font = "700 10px -apple-system,sans-serif"; ctx.textAlign = "left";
    ctx.fillText("BU HAFTA", 46, row2Y+26);
    const weekFmt = weekMin >= 60 ? `${Math.floor(weekMin/60)} sa ${weekMin%60} dk` : `${weekMin} dk`;
    ctx.fillStyle = "white"; ctx.font = "800 32px -apple-system,sans-serif";
    ctx.fillText(weekFmt, 46, row2Y+74);
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "400 11px -apple-system,sans-serif";
    ctx.fillText("çalışma süresi", 46, row2Y+96);

    // Toplam kartı
    glassCard(28+halfW+12, row2Y, halfW, 110, 18, "rgba(74,107,232,0.35)");
    ctx.fillStyle = "#4A6BE8"; ctx.font = "700 10px -apple-system,sans-serif"; ctx.textAlign = "left";
    ctx.fillText("TOPLAM", 46+halfW+12, row2Y+26);
    const totalFmt = totalMin >= 60 ? `${Math.floor(totalMin/60)} sa ${totalMin%60} dk` : `${totalMin} dk`;
    ctx.fillStyle = "white"; ctx.font = "800 32px -apple-system,sans-serif";
    ctx.fillText(totalFmt, 46+halfW+12, row2Y+74);
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "400 11px -apple-system,sans-serif";
    ctx.fillText("tüm zamanlar", 46+halfW+12, row2Y+96);

    // ═══════════════════════════════════════════
    // 4. OTURUM + SERİ yan yana
    // ═══════════════════════════════════════════
    const row3Y = row2Y + 110 + 12;

    glassCard(28, row3Y, halfW, 110, 18, "rgba(155,111,232,0.35)");
    ctx.fillStyle = "#9B6FE8"; ctx.font = "700 10px -apple-system,sans-serif"; ctx.textAlign = "left";
    ctx.fillText("TOPLAM OTURUM", 46, row3Y+26);
    ctx.fillStyle = "white"; ctx.font = "800 42px -apple-system,sans-serif";
    ctx.fillText(`${totalSessions}`, 46, row3Y+78);
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "400 11px -apple-system,sans-serif";
    ctx.fillText("oturum tamamlandı", 46, row3Y+98);

    glassCard(28+halfW+12, row3Y, halfW, 110, 18, "rgba(249,115,22,0.35)");
    ctx.fillStyle = "#f97316"; ctx.font = "700 10px -apple-system,sans-serif"; ctx.textAlign = "left";
    ctx.fillText("GÜNLÜK SERİ 🔥", 46+halfW+12, row3Y+26);
    ctx.fillStyle = "white"; ctx.font = "800 42px -apple-system,sans-serif";
    ctx.fillText(`${streak}`, 46+halfW+12, row3Y+78);
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "400 11px -apple-system,sans-serif";
    ctx.fillText("gün seri", 46+halfW+12, row3Y+98);

    // ═══════════════════════════════════════════
    // 5. EN ÇOK ÇALIŞILAN DERS
    // ═══════════════════════════════════════════
    const row4Y = row3Y + 110 + 14;
    if (topSubject) {
      glassCard(28, row4Y, W-56, 66, 16, "rgba(74,107,232,0.3)");
      ctx.fillStyle = "rgba(147,197,253,0.55)"; ctx.font = "700 10px -apple-system,sans-serif"; ctx.textAlign = "left";
      ctx.fillText("📚  EN ÇOK ÇALIŞILAN DERS", 48, row4Y+24);
      ctx.fillStyle = "white"; ctx.font = "700 18px -apple-system,sans-serif";
      ctx.fillText(topSubject, 48, row4Y+52);
    }

    // ═══════════════════════════════════════════
    // 6. MOTİVASYON BANNER
    // ═══════════════════════════════════════════
    const motivY = row4Y + (topSubject ? 80 : 14);
    const motiv = streak >= 30 ? "Efsane bir seri! Sen bir şampiyonsun 🏆" :
                  streak >= 14 ? "İki haftadır durmuyorsun! Harika 💎" :
                  streak >= 7  ? "Bir haftalık seri! Süper gidiyorsun 🌟" :
                  streak >= 3  ? "Serini koruyorsun, devam et! 🔥" :
                  totalSessions >= 50 ? "50+ oturum — gerçek bir çalışkan! 💪" :
                  todayFocusAvg !== null && todayFocusAvg >= 80 ? "Bugün tam odaktaydın! Harika iş ✨" :
                  "Her oturum seni hedefe yaklaştırıyor ✨";

    // Gradient banner
    const motivGrad = ctx.createLinearGradient(28, motivY, W-28, motivY);
    motivGrad.addColorStop(0, "rgba(155,111,232,0.2)");
    motivGrad.addColorStop(0.5, "rgba(74,107,232,0.15)");
    motivGrad.addColorStop(1, "rgba(74,158,142,0.2)");
    ctx.fillStyle = motivGrad; rr(28, motivY, W-56, 60, 16); ctx.fill();
    ctx.strokeStyle = "rgba(155,111,232,0.3)"; ctx.lineWidth = 1; rr(28, motivY, W-56, 60, 16); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.88)"; ctx.font = "700 15px -apple-system,sans-serif"; ctx.textAlign = "center";
    ctx.fillText(motiv, W/2, motivY+36);

    // ═══════════════════════════════════════════
    // 7. ALT WATERMARK
    // ═══════════════════════════════════════════
    const wmY = motivY + 78;
    // İnce ayırıcı
    const sep2 = ctx.createLinearGradient(40,0,W-40,0);
    sep2.addColorStop(0,"transparent"); sep2.addColorStop(0.5,"rgba(255,255,255,0.12)"); sep2.addColorStop(1,"transparent");
    ctx.strokeStyle = sep2; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40,wmY); ctx.lineTo(W-40,wmY); ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = "700 16px -apple-system,sans-serif"; ctx.textAlign = "center";
    ctx.fillText("ogrencikocuadana.com", W/2, wmY+36);
    ctx.fillStyle = "rgba(147,197,253,0.55)"; ctx.font = "400 12px -apple-system,sans-serif";
    ctx.fillText("LGS & YKS Öğrenci Koçluğu", W/2, wmY+58);

    // Canvas boyutunu içeriğe göre kırp
    const finalH = wmY + 80;
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = W; finalCanvas.height = finalH;
    const fCtx = finalCanvas.getContext("2d")!;
    fCtx.drawImage(canvas, 0, 0);
    resolve(finalCanvas);
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
        width: "100%", marginTop: 18, padding: "16px 20px",
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)",
        color: "white", border: "1px solid rgba(155,111,232,0.4)", borderRadius: 16,
        fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "wait" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        opacity: loading ? 0.7 : 1,
        boxShadow: "0 8px 28px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
        transition: "all 0.2s", letterSpacing: ".03em",
      }}
    >
      <span style={{ fontSize: "1.3rem" }}>{loading ? "⏳" : "📊"}</span>
      {loading ? "Görsel hazırlanıyor..." : "İstatistiklerimi Paylaş"}
    </button>
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
  const [tab, setTab] = useState<"timer"|"library"|"report"|"sinav"|"tasks"|"forest"|"profile">("timer");
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
  const [selectedSubject, setSelectedSubject]       = useState<string>("Matematik");
  const [customSubjects, setCustomSubjects]         = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [showSubjectPicker, setShowSubjectPicker]   = useState(false);
  const [showFocusModal, setShowFocusModal]         = useState(false);
  const pendingSessionId = useRef<string | null>(null);

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
      // Ziyaret & streak günlerini kaydet — en az 1 tamamlanan oturum (≥25 dk) olan günler sayılır
      // Streak: en az 25 dk çalışılan günler sayılır, updateStreak sessions'dan hesaplar
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
      // Streak'i taze hesapla
      setTimeout(() => updateStreak(loadedSessions), 50);
      const savedTheme = localStorage.getItem(THEME_KEY); if (savedTheme) setIsDark(savedTheme === 'dark');

      // ── Devam eden timer'ı geri yükle ──────────────────────────────────────
      const savedTimer = localStorage.getItem(TIMER_KEY);
      if (savedTimer) {
        try {
          const { phase: savedPhase, phaseEnd, workStart } = JSON.parse(savedTimer);
          const now = Date.now();
          const remaining = Math.round((phaseEnd - now) / 1000);
          if (remaining > 5) {
            // Süre hâlâ devam ediyor — kaldığı yerden başlat
            phaseEndRef.current  = phaseEnd;
            workStartRef.current = workStart ?? 0;
            setPhase(savedPhase);
            setSeconds(remaining);
          } else {
            // Süre dolmuş — temizle, idle'a al
            localStorage.removeItem(TIMER_KEY);
          }
        } catch { localStorage.removeItem(TIMER_KEY); }
      }
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

  const saveFocusScore = useCallback((
    sessionId: string,
    phoneChecks: number,
    mentalFocus: number,
    completionRate: number,
  ) => {
    // Formül: (tamamlanma×0.5) + (zihinsel_odak×0.3) - (telefon_cezası×0.2)
    // Telefon cezası: 0→0, 1→10, 2→30, 3→50 (0,1-2,3-5,5+)
    const phonePenalty = [0, 10, 30, 50][phoneChecks] ?? 0;
    const mentalNorm   = (mentalFocus / 10) * 100;
    const raw = (completionRate * 0.6) + (mentalNorm * 0.4) - phonePenalty;
    const focusScore   = Math.round(Math.max(0, Math.min(100, raw)));
    setShowFocusModal(false);
    pendingSessionId.current = null;
    setSessions(prev => {
      const u = prev.map(s => s.id === sessionId
        ? { ...s, focusScore, phoneChecks, mentalFocus, completionRate }
        : s
      );
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch {}
      return u;
    });
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
    // En az 25 dk çalışılan günleri bul
    const qualifyingDays = new Set(
      list.filter(s => s.actualDuration >= 25).map(s => s.date)
    );

    let count = 0;
    const d   = new Date();
    const today = d.toISOString().slice(0, 10);

    // Bugün henüz 25 dk dolmamışsa dünden başla
    if (!qualifyingDays.has(today)) {
      d.setDate(d.getDate() - 1);
    }

    for (let i = 0; i < 366; i++) {
      const ds = d.toISOString().slice(0, 10);
      if (qualifyingDays.has(ds)) {
        count++;
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
    pendingSessionId.current = s.id;
    setTimeout(() => setShowFocusModal(true), 600);
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
    try { localStorage.setItem(TIMER_KEY, JSON.stringify({ phase: "work", phaseEnd: phaseEndRef.current, workStart: now })); } catch {}
    setPhase("work"); setSeconds(mode.work * 60);
  }, [mode.work]);

  const startRest = useCallback(() => {
    const now = Date.now(); phaseEndRef.current = now + mode.rest * 60 * 1000;
    try { localStorage.setItem(TIMER_KEY, JSON.stringify({ phase: "rest", phaseEnd: phaseEndRef.current, workStart: 0 })); } catch {}
    setPhase("rest"); setSeconds(mode.rest * 60);
  }, [mode.rest]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    try { localStorage.removeItem(TIMER_KEY); } catch {}
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
    try { localStorage.setItem(TIMER_KEY, JSON.stringify({ phase: "rest", phaseEnd: phaseEndRef.current, workStart: 0 })); } catch {}
    setPhase("rest"); setSeconds(mode.rest * 60);
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
          try { localStorage.setItem(TIMER_KEY, JSON.stringify({ phase: "rest", phaseEnd: phaseEndRef.current, workStart: 0 })); } catch {}
          setPhase("rest"); setSeconds(mode.rest * 60);
        } else {
          playBeep("rest_end");
          sendNotification("Mola bitti! ⏰", "Tekrar çalışmaya hazır mısın?");
          try { localStorage.removeItem(TIMER_KEY); } catch {}
          setPhase("idle"); setSeconds(0);
        }
      } else { setSeconds(remaining); }
    }, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, mode.work, mode.rest, recordSession, playBeep, sendNotification, selectedSubject]);

  // ─── Hesaplamalar (useMemo ile optimize) ─────────────────────────────────
  const today  = useMemo(() => todayStr(), []);
  const wStart = useMemo(() => weekStart(), []);

  const todaySessions = useMemo(() => sessions.filter(s => s.date === today), [sessions, today]);
  const weekSessions  = useMemo(() => sessions.filter(s => s.date >= wStart), [sessions, wStart]);
  const todayMin  = useMemo(() => todaySessions.reduce((a,s) => a + s.actualDuration, 0), [todaySessions]);
  const weekMin   = useMemo(() => weekSessions.reduce((a,s) => a + s.actualDuration, 0), [weekSessions]);
  const goalPct   = useMemo(() => dailyGoal.minutes > 0 ? Math.min(100, (todayMin / dailyGoal.minutes) * 100) : 0, [todayMin, dailyGoal.minutes]);
  const goalMet   = useMemo(() => dailyGoal.minutes > 0 && todayMin >= dailyGoal.minutes, [todayMin, dailyGoal.minutes]);
  const animalName = useMemo(() => ANIMALS.find(a => a.id === dailyGoal.animal)?.name ?? "Kapibara", [dailyGoal.animal]);
  const motivation = useMemo(() => getMotivation(goalPct, goalMet, animalName), [goalPct, goalMet, animalName]);

  const { yMissed } = useMemo(() => {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    const yMin = sessions.filter(s => s.date === yStr).reduce((a,s) => a + s.actualDuration, 0);
    return { yMissed: dailyGoal.minutes > 0 && yMin < dailyGoal.minutes && yMin === 0 };
  }, [sessions, dailyGoal.minutes]);

  const circumference  = 2 * Math.PI * 90;
  const totalSec       = phase === "work" ? mode.work * 60 : phase === "rest" ? mode.rest * 60 : 1;
  const progress       = phase === "idle" ? 0 : ((totalSec - seconds) / totalSec) * 100;
  const dashOffset     = circumference - (progress / 100) * circumference;

  // ─── Rapor verilerini önceden hesapla ─────────────────────────────────────
  const reportData = useMemo(() => {
    const scored = sessions.filter(s => s.focusScore !== undefined);
    const todayScored = todaySessions.filter(s => s.focusScore !== undefined);
    const todayFocusAvg = todayScored.length > 0
      ? Math.round(todayScored.reduce((a,s) => a+(s.focusScore??0),0) / todayScored.length)
      : null;
    const allFocusAvg = scored.length > 0
      ? Math.round(scored.reduce((a,s) => a+(s.focusScore??0),0) / scored.length)
      : null;

    const subjectMap: Record<string,number> = {};
    sessions.forEach(s => { const k = s.subject ?? "Diğer"; subjectMap[k] = (subjectMap[k]??0) + s.actualDuration; });
    const subjectSorted = Object.entries(subjectMap).sort((a,b) => b[1]-a[1]);
    const subjectTotal  = subjectSorted.reduce((a,b) => a+b[1], 0);
    const topSubject    = subjectSorted[0]?.[0] ?? "";
    const top3Subjects  = subjectSorted.slice(0,3).map(([name]) => name);

    const last7 = Array.from({length:7}, (_,i) => {
      const d = new Date(); d.setDate(d.getDate()-6+i);
      return d.toISOString().slice(0,10);
    });

    const totalMin = sessions.reduce((a,s) => a+s.actualDuration, 0);

    return { scored, todayFocusAvg, allFocusAvg, subjectSorted, subjectTotal, topSubject, top3Subjects, last7, totalMin };
  }, [sessions, todaySessions]);

  if (!loaded) return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a1630, #1e1c3a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: T.text }}>Yükleniyor...</div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, sans-serif", position: "relative" }}>
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
        @keyframes rotate-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes scale-in { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
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
          {/* Sağ: Tema butonu */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <button
              onClick={() => { const next = !isDark; setIsDark(next); try { localStorage.setItem(THEME_KEY, next ? "dark" : "light"); } catch {} }}
              style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s" }}
            >
              <span style={{ fontSize: "1.1rem" }}>{isDark ? "☀️" : "🌙"}</span>
              <span style={{ color: T.text, fontWeight: 700, fontSize: ".78rem" }}>{isDark ? "Gündüz" : "Gece"}</span>
            </button>

            {/* Streak + oturum badge'leri */}
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

            {/* ── SINAV GERİ SAYIMI ── */}
            <ExamCountdown T={T} isDark={isDark} />

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

            {/* Sınav Geri Sayım Butonu */}
            <button
              onClick={() => setTab("sinav")}
              style={{
                width: "100%", maxWidth: 520,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 16, padding: "16px 20px", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#9B6FE8"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: "1.5rem" }}>🎓</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: T.text, fontWeight: 700, fontSize: ".9rem" }}>Sınav Geri Sayımı</div>
                  <div style={{ color: T.textSub, fontSize: ".72rem", marginTop: 2 }}>LGS · TYT · AYT</div>
                </div>
              </div>
              <span style={{ color: T.textMuted, fontSize: ".85rem" }}>›</span>
            </button>

            {/* Maskot + Timer — yan yana */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, width: "100%" }}>
              <AnimalCompanion animalId={dailyGoal.animal} phase={phase === "rest" ? "rest" : phase === "work" ? "work" : "idle"} isDark={isDark} />

              {/* Gradient ayraç */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "0 18px", flexShrink: 0 }}>
                <div style={{ width: 1, height: 36, background: `linear-gradient(to bottom, transparent, ${mode.accent}80)` }} />
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: mode.accent, opacity: 0.7, boxShadow: `0 0 8px ${mode.accent}` }} />
                <div style={{ width: 1, height: 36, background: `linear-gradient(to top, transparent, ${mode.accent}80)` }} />
              </div>

              <TimerCircle
                seconds={seconds}
                phase={phase}
                accent={mode.accent}
                dashOffset={dashOffset}
                idleDuration={mode.work * 60}
                T={T}
                isDark={isDark}
                goalMet={goalMet}
                circumference={circumference}
              />
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

            {/* Mola Aktivitesi */}
            {phase === "rest" && (
              <BreakActivity T={T} isDark={isDark} />
            )}

            {/* Sanal Kütüphane Banner */}
            <StudyBanner isActive={phase === "work"} />

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
        {tab === "forest" && (
          <ForestTab sessions={sessions} T={T} isDark={isDark} />
        )}

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

            {/* ── ODAK SKORU ── */}
            {reportData.scored.length > 0 && (
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:22, marginTop:18 }}>
                <div style={{ color:T.textSub, fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:18 }}>🎯 ODAK SKORU</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                  {[
                    { label:"BUGÜN",        val: reportData.todayFocusAvg },
                    { label:"TÜM ZAMANLAR", val: reportData.allFocusAvg   },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background:T.surface2, borderRadius:14, padding:"14px 16px", textAlign:"center" }}>
                      <div style={{ color:T.textSub, fontSize:".68rem", fontWeight:700, letterSpacing:".06em", marginBottom:8 }}>{label}</div>
                      {val !== null ? (
                        <>
                          <div style={{ color:scoreColor(val), fontSize:"1.9rem", fontWeight:800, lineHeight:1, marginBottom:6 }}>{val}</div>
                          <div style={{ height:4, borderRadius:2, background:T.surface, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${val}%`, background:scoreColor(val), borderRadius:2, transition:"width 0.6s ease" }} />
                          </div>
                        </>
                      ) : (
                        <div style={{ color:T.textMuted, fontSize:".8rem" }}>Henüz yok</div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ color:T.textSub, fontSize:".72rem", fontWeight:700, letterSpacing:".06em", marginBottom:10 }}>HAFTALIK ODAK TRENDİ</div>
                <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:72 }}>
                  {reportData.last7.map(ds => {
                    const daySc = sessions.filter(s => s.date === ds && s.focusScore !== undefined);
                    const avg   = daySc.length > 0 ? Math.round(daySc.reduce((a,s) => a+(s.focusScore??0),0)/daySc.length) : null;
                    const barH  = avg !== null ? Math.max((avg/100)*56, 6) : 0;
                    const dLabel = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"][new Date(ds+"T12:00:00").getDay()===0?6:new Date(ds+"T12:00:00").getDay()-1];
                    const col   = avg !== null ? scoreColor(avg) : T.surface2;
                    return (
                      <div key={ds} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                        {avg !== null && <div style={{ color:col, fontSize:".6rem", fontWeight:700 }}>{avg}</div>}
                        <div style={{ width:"100%", borderRadius:4, background:avg!==null?col:T.surface2, height:barH||4, transition:"height 0.4s ease", opacity:avg!==null?1:0.3 }} />
                        <span style={{ color:ds===today?T.text:T.textMuted, fontSize:".62rem", fontWeight:ds===today?700:400 }}>{dLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── DERS DAĞILIMI ── */}
            {reportData.subjectSorted.length > 0 && (
              <>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:22, marginTop:18 }}>
                  <div style={{ color:T.textSub, fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:16 }}>📚 DERS DAĞILIMI (TÜM ZAMANLAR)</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {reportData.subjectSorted.map(([name, mins]) => {
                      const pct = reportData.subjectTotal > 0 ? (mins/reportData.subjectTotal)*100 : 0;
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
                  {reportData.top3Subjects.length > 0 && (
                    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:22, marginTop:14 }}>
                      <div style={{ color:T.textSub, fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:6 }}>📈 HAFTALIK DERS TRENDİ (EN POPÜLER 3)</div>
                      <div style={{ display:"flex", gap:12, marginBottom:14, flexWrap:"wrap" }}>
                        {reportData.top3Subjects.map(name => (
                          <div key={name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                            <div style={{ width:8, height:8, borderRadius:4, background:subjectColor(name) }} />
                            <span style={{ color:T.textSub, fontSize:".74rem" }}>{name}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:80 }}>
                        {reportData.last7.map(ds => {
                          const daySessions = sessions.filter(s => s.date === ds);
                          const dayTotal    = daySessions.reduce((a,s)=>a+s.actualDuration,0);
                          const maxDay      = Math.max(...reportData.last7.map(d2 => sessions.filter(s=>s.date===d2).reduce((a,s)=>a+s.actualDuration,0)), 1);
                          const barH        = dayTotal > 0 ? Math.max((dayTotal/maxDay)*68, 6) : 0;
                          const dLabel      = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"][new Date(ds+"T12:00:00").getDay()===0?6:new Date(ds+"T12:00:00").getDay()-1];
                          const topMins     = reportData.top3Subjects.map(name => daySessions.filter(s=>(s.subject??"Diğer")===name).reduce((a,s)=>a+s.actualDuration,0));
                          const otherMin    = dayTotal - topMins.reduce((a,b)=>a+b,0);
                          return (
                            <div key={ds} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                              <div style={{ width:"100%", display:"flex", flexDirection:"column-reverse", borderRadius:4, overflow:"hidden", height:barH, transition:"height 0.4s ease" }}>
                                {dayTotal===0 ? <div style={{ flex:1, background:T.surface2 }} /> : <>
                                  {otherMin>0 && <div style={{ flex:otherMin, background:"rgba(255,255,255,0.12)" }} />}
                                  {reportData.top3Subjects.map((name,i) => topMins[i]>0 && <div key={name} style={{ flex:topMins[i], background:subjectColor(name) }} />)}
                                </>}
                              </div>
                              <span style={{ color:ds===today?T.text:T.textMuted, fontSize:".62rem", fontWeight:ds===today?700:400 }}>{dLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </>
            )}

            {/* İstatistik paylaş */}
            <ReportShareButton
              todayMin={todayMin}
              todaySessions={todaySessions.length}
              weekMin={weekMin}
              totalSessions={sessions.length}
              streak={streak}
              isDark={isDark}
              T={T}
              totalMin={reportData.totalMin}
              topSubject={reportData.topSubject}
              todayFocusAvg={reportData.todayFocusAvg}
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

            {/* ── Sanal Kütüphane ── */}
            <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 32, paddingTop: 28 }}>
              <LibraryTab sessions={sessions} T={T} isDark={isDark} />
            </div>
          </div>
        )}

        {/* ── SINAV ── */}
        {tab === "sinav" && (
          <SinavTab T={T} isDark={isDark} />
        )}

        {tab === "profile" && (
          <ProfileTab sessions={sessions} streak={streak} T={T} isDark={isDark} />
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
          { key: "forest",  icon: "🌲", label: "Orman"      },
          { key: "report",  icon: "📊", label: "Rapor"      },
          { key: "profile", icon: "👤", label: "Profil"     },
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

      {/* ── ODAK SKORU MODAL ── */}
      {showFocusModal && pendingSessionId.current && (
        <FocusModal
          T={T}
          isDark={isDark}
          animalId={dailyGoal.animal}
          onSave={(phone, mental, completion) => {
            saveFocusScore(pendingSessionId.current!, phone, mental, completion);
            setTab("report");
          }}
          onSkip={() => { setShowFocusModal(false); pendingSessionId.current = null; }}
        />
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