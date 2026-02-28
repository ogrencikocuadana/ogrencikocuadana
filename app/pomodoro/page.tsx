"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface Session {
  id: string; date: string; plannedDuration: number; actualDuration: number; completedAt: string;
}
interface DailyGoal { minutes: number; animal: string; }

// ─── Sabitler ─────────────────────────────────────────────────────────────────
const PRESET_MODES = [
  { label: "Klasik",     work: 25, rest: 5,  color: "#1e3a8a", light: "#eff6ff", accent: "#3b82f6" },
  { label: "Derin Odak", work: 50, rest: 10, color: "#c2410c", light: "#fff7ed", accent: "#f97316" },
  { label: "Maraton",    work: 90, rest: 10, color: "#065f46", light: "#ecfdf5", accent: "#10b981" },
  { label: "Serbest",    work: 0,  rest: 0,  color: "#7c3aed", light: "#f5f3ff", accent: "#a78bfa" },
];

const AMBIENT_SOUNDS = [
  { id: "off",    label: "Sessiz",       icon: "🔇" },
  { id: "rain",   label: "Yağmur",       icon: "🌧️" },
  { id: "cafe",   label: "Kafe",         icon: "☕" },
  { id: "forest", label: "Orman",        icon: "🌲" },
  { id: "waves",  label: "Dalga",        icon: "🌊" },
];

// Web Audio ile ambient ses üretici
function createAmbientNode(ctx: AudioContext, type: string): AudioNode | null {
  if (type === "off") return null;
  const bufferSize = 2 * ctx.sampleRate;
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buf; source.loop = true;

  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  gain.gain.value = 0.18;

  if (type === "rain") {
    filter.type = "highpass"; filter.frequency.value = 400;
  } else if (type === "cafe") {
    filter.type = "bandpass"; filter.frequency.value = 800; filter.Q.value = 0.3; gain.gain.value = 0.12;
  } else if (type === "forest") {
    filter.type = "bandpass"; filter.frequency.value = 600; filter.Q.value = 0.5; gain.gain.value = 0.1;
  } else if (type === "waves") {
    filter.type = "lowpass"; filter.frequency.value = 300; gain.gain.value = 0.22;
  }

  source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  source.start(0);
  return gain;
}

const STORAGE_KEY = "pomodoro_sessions_v2";
const GOAL_KEY    = "pomodoro_goal_v1";
const STREAK_KEY  = "pomodoro_streak_v1";

function todayStr() { return new Date().toISOString().slice(0, 10); }
function weekStart() { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().slice(0, 10); }
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
};

function AnimalImg({ id, size = 32 }: { id: string; size?: number }) {
  return (
    <img
      src={ANIMAL_TWEMOJI[id] ?? ANIMAL_TWEMOJI["capybara"]}
      width={size} height={size}
      alt={id}
      style={{ imageRendering: "crisp-edges" }}
    />
  );
}

const ANIMALS = [
  { id: "capybara",   name: "Kapibara"   }, { id: "koala",      name: "Koala"      },
  { id: "penguin",    name: "Penguen"    }, { id: "cat",        name: "Kedi"       },
  { id: "bear",       name: "Ayı"        }, { id: "caterpillar",name: "Tırtıl"     },
  { id: "butterfly",  name: "Kelebek"   }, { id: "snail",      name: "Salyangoz"  },
  { id: "turtle",     name: "Kaplumbağa"}, { id: "chick",      name: "Civciv"     },
  { id: "rabbit",     name: "Tavşan"    },
];

// ─── Kitap ────────────────────────────────────────────────────────────────────
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
function GoalProgressBar({ todayMin, goalMin, animal }: { todayMin: number; goalMin: number; animal: string }) {
  const pct = goalMin > 0 ? Math.min(100, (todayMin / goalMin) * 100) : 0;
  // Hayvanı dolgu çubuğunun SAĞ ucuna sabitle — offset ile hizala
  const animalLeft = `calc(${Math.min(pct, 100)}% - 16px)`;

  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: ".82rem", fontWeight: 600 }}>GÜNLÜK HEDEF</span>
        <span style={{ color: "white", fontWeight: 700, fontSize: ".9rem" }}>{todayMin} / {goalMin} dk</span>
      </div>
      <div style={{ position: "relative", height: 40, background: "rgba(255,255,255,0.08)", borderRadius: 20 }}>
        {/* Dolgu */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${pct}%`, minWidth: pct > 0 ? 20 : 0,
          background: pct >= 100 ? "linear-gradient(90deg,#10b981,#34d399)" : "linear-gradient(90deg,#3b82f6,#60a5fa)",
          borderRadius: 20, transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
        }} />
        {/* Hayvan — dolgunun sağ ucunda, tam hizalı */}
        {pct > 0 && (
          <div style={{
            position: "absolute", top: "50%",
            left: animalLeft,
            transform: "translateY(-50%)",
            width: 32, height: 32,
            transition: "left 0.8s cubic-bezier(.4,0,.2,1)",
            zIndex: 3,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AnimalImg id={animal} size={30} />
          </div>
        )}
        {/* Bayrak */}
        <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: ".75rem", fontWeight: 700, color: pct >= 100 ? "#10b981" : "rgba(255,255,255,0.35)", whiteSpace: "nowrap", zIndex: 1 }}>
          {goalMin}dk 🏁
        </div>
      </div>
      <div style={{ marginTop: 6, textAlign: "center", fontSize: ".78rem", color: "rgba(255,255,255,0.35)" }}>%{Math.round(pct)} tamamlandı</div>
    </div>
  );
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

function DigitalDisplay({ value, size = 40 }: { value: string; size?: number }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: size * 0.04,
      background: "#080400",
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

function SinavTab() {
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
        <h2 style={{ color: "white", fontSize: "1.4rem", fontWeight: 800, margin: "0 0 6px" }}>🎓 Gerçek Sınav Atmosferi</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".85rem", margin: 0 }}>Sınavını seç ve gerçek koşullarda çalış</p>
      </div>

      {/* Sınav seçimi */}
      {examPhase === "idle" && (
        <div style={{ width: "100%", maxWidth: 580 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {["LGS", "YKS"].map(group => (
              <div key={group}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".72rem", fontWeight: 700, letterSpacing: ".08em", marginBottom: 8, textAlign: "center" }}>{group}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {EXAMS.filter(e => e.group === group).map(e => (
                    <button key={e.id}
                      onClick={() => setSelectedExam(e.id)}
                      style={{
                        background: selectedExam === e.id ? `${e.color}33` : "rgba(255,255,255,0.05)",
                        border: `2px solid ${selectedExam === e.id ? e.accent : "rgba(255,255,255,0.1)"}`,
                        borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                        transition: "all 0.2s", textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.4rem" }}>{e.icon}</span>
                        <div>
                          <div style={{ color: selectedExam === e.id ? e.accent : "white", fontWeight: 800, fontSize: ".95rem" }}>{e.group} — {e.label}</div>
                          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: ".78rem", marginTop: 2 }}>{e.desc}</div>
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
              background: selectedExam ? (exam?.color ?? "#3b82f6") : "rgba(255,255,255,0.1)",
              color: selectedExam ? "white" : "rgba(255,255,255,0.3)",
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
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: ".85rem", fontWeight: 700, letterSpacing: ".1em" }}>
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
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".8rem" }}>Hazır ol!</div>
          <button onClick={resetExam} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontSize: ".8rem" }}>
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
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: ".72rem", fontWeight: 700, letterSpacing: ".1em" }}>
              {examPhase === "done" ? "TAMAMLANDI" : "KALAN SÜRE"}
            </div>
            <DigitalDisplay
              value={fmtExamTime(examSeconds)}
              size={examSeconds >= 3600 ? 34 : 44}
            />
          </div>

          {/* Şimdiki saat */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: ".72rem", fontWeight: 700, letterSpacing: ".1em" }}>ŞİMDİKİ SAAT</div>
            <DigitalDisplay value={fmtClock(now)} size={32} />
          </div>

          {/* İlerleme çubuğu */}
          <div style={{ position: "relative", height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 5 }}>
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
            <button onClick={resetExam} style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: 13, color: "white", fontWeight: 600, cursor: "pointer", fontSize: ".9rem" }}>
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
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: ".72rem", fontWeight: 700, letterSpacing: ".1em" }}>ŞİMDİKİ SAAT</div>
          <DigitalDisplay value={fmtClock(now)} size={36} />
        </div>
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
  const [tab, setTab]                 = useState<"timer"|"library"|"report"|"sinav">("timer");
  const [loaded, setLoaded]           = useState(false);
  const [customWork, setCustomWork]   = useState(30);
  const [customRest, setCustomRest]   = useState(5);
  const [dailyGoal, setDailyGoal]     = useState<DailyGoal>({ minutes: 120, animal: "capybara" });
  const [showGoalSetup, setShowGoalSetup] = useState(false);
  const [tempGoal, setTempGoal]       = useState(120);
  const [tempAnimal, setTempAnimal]   = useState("capybara");
  const [ambientId, setAmbientId]     = useState("off");
  const [streak, setStreak]           = useState(0);

  const intervalRef   = useRef<ReturnType<typeof setInterval>|null>(null);
  const workStartRef  = useRef<number>(0);
  const phaseEndRef   = useRef<number>(0);
  const audioCtxRef   = useRef<AudioContext|null>(null);
  const ambientGainRef= useRef<AudioNode|null>(null);

  const mode = modeIdx === 3
    ? { label:"Serbest", work:customWork, rest:customRest, color:"#7c3aed", light:"#f5f3ff", accent:"#a78bfa" }
    : PRESET_MODES[modeIdx];

  // ─── Storage ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY); if (raw) setSessions(JSON.parse(raw));
      const g   = localStorage.getItem(GOAL_KEY);    if (g)   setDailyGoal(JSON.parse(g));
      const sk  = localStorage.getItem(STREAK_KEY);  if (sk)  setStreak(parseInt(sk));
    } catch { /* ilk kullanım */ }
    setLoaded(true);
  }, []);

  const saveSessions = useCallback((list: Session[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
  }, []);
  const saveGoal = useCallback((g: DailyGoal) => {
    try { localStorage.setItem(GOAL_KEY, JSON.stringify(g)); } catch {}
  }, []);

  // ─── Streak hesaplama ─────────────────────────────────────────────────────
  const updateStreak = useCallback((list: Session[]) => {
    const today = todayStr();
    let count = 0; let d = new Date();
    while (true) {
      const ds = d.toISOString().slice(0, 10);
      const dayMin = list.filter(s => s.date === ds).reduce((a, s) => a + s.actualDuration, 0);
      const goal = parseInt(localStorage.getItem(GOAL_KEY) ? JSON.parse(localStorage.getItem(GOAL_KEY)!).minutes : "120");
      if (ds === today || dayMin >= goal) { count++; d.setDate(d.getDate() - 1); }
      else break;
      if (count > 365) break;
    }
    setStreak(count);
    try { localStorage.setItem(STREAK_KEY, count.toString()); } catch {}
  }, []);

  // ─── Ses bildirimi ────────────────────────────────────────────────────────
  const playBeep = useCallback((type: "work_end"|"rest_end") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
  const startAmbient = useCallback((id: string) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ambientGainRef.current) (ambientGainRef.current as GainNode).gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      if (id === "off") { ambientGainRef.current = null; return; }
      ambientGainRef.current = createAmbientNode(audioCtxRef.current, id);
    } catch {}
  }, []);

  // ─── Oturum kaydet ────────────────────────────────────────────────────────
  const recordSession = useCallback((plannedDuration: number, startedAt: number) => {
    const actualDuration = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const s: Session = { id: Date.now().toString(), date: todayStr(), plannedDuration, actualDuration, completedAt: new Date().toISOString() };
    setSessions(prev => { const u = [...prev, s]; saveSessions(u); updateStreak(u); return u; });
  }, [saveSessions, updateStreak]);

  // ─── Timer ───────────────────────────────────────────────────────────────
  const startWork = useCallback(() => {
    const now = Date.now();
    workStartRef.current = now; phaseEndRef.current = now + mode.work * 60 * 1000;
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
    recordSession(mode.work, workStartRef.current);
    playBeep("work_end");
    sendNotification("Ders tamamlandı! 🎉", `${mode.work} dakika çalıştın. Mola zamanı!`);
    const now = Date.now(); phaseEndRef.current = now + mode.rest * 60 * 1000;
    setPhase("rest"); setSeconds(mode.rest * 60);
  }, [mode.work, mode.rest, recordSession, playBeep, sendNotification]);

  useEffect(() => {
    if (phase === "idle") { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((phaseEndRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        if (phase === "work") {
          recordSession(mode.work, workStartRef.current);
          playBeep("work_end");
          sendNotification("Ders tamamlandı! 🎉", `${mode.work} dakika çalıştın. Mola zamanı!`);
          const now = Date.now(); phaseEndRef.current = now + mode.rest * 60 * 1000;
          setPhase("rest"); setSeconds(mode.rest * 60);
        } else {
          playBeep("rest_end");
          sendNotification("Mola bitti! ⏰", "Tekrar çalışmaya hazır mısın?");
          setPhase("idle"); setSeconds(0);
        }
      } else { setSeconds(remaining); }
    }, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, mode.work, mode.rest, recordSession, playBeep, sendNotification]);

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
    <main style={{ minHeight: "100vh", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "white" }}>Yükleniyor...</div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a1628 0%, #0f1f4f 50%, #1a0a2e 100%)", fontFamily: "system-ui, sans-serif", position: "relative" }}>
      {goalMet && <CelebrationBg />}
      <style>{`
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.08);opacity:1} }
        @keyframes fade-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes confetti-fall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes celebrate-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} 50%{box-shadow:0 0 40px 10px rgba(16,185,129,0.3)} }
        @keyframes streak-bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @keyframes countdown-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.06);opacity:.85} }
        .fade-in { animation: fade-in 0.4s ease forwards; }
        .tab-btn { border:none;cursor:pointer;transition:all 0.2s;font-weight:600;border-radius:10px;padding:10px 14px;font-size:.8rem; }
        .mode-btn { border:2px solid;cursor:pointer;transition:all 0.25s;border-radius:14px;padding:10px 12px;text-align:center;background:none; }
        .mode-btn:hover { transform:translateY(-2px); }
        .action-btn { border:none;cursor:pointer;transition:all 0.2s;border-radius:14px;font-weight:700;font-size:1rem;padding:14px 30px; }
        .action-btn:hover { filter:brightness(1.1);transform:translateY(-1px); }
        .ambient-btn { border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);cursor:pointer;border-radius:12px;padding:10px 14px;color:rgba(255,255,255,0.7);font-size:.8rem;font-weight:600;transition:all 0.2s;display:flex;flex-direction:column;align-items:center;gap:4px; }
        .ambient-btn:hover { border-color:rgba(255,255,255,0.3); }
        .ambient-btn.active { border-color:#3b82f6;background:rgba(59,130,246,0.15);color:white; }
        input[type=range] { accent-color:#3b82f6;width:100%; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "28px 24px 0", maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <h1 style={{ color: "white", fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>⏱ Pomodoro</h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".78rem", margin: "3px 0 0" }}>Sanal Kütüphane · Öğrenci Koçu Adana</p>
            </div>
            {/* Streak */}
            {streak > 0 && (
              <div style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.35)", borderRadius: 12, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6, animation: streak >= 7 ? "streak-bounce 2s ease-in-out infinite" : "none" }}>
                <span style={{ fontSize: "1.2rem" }}>🔥</span>
                <div>
                  <div style={{ color: "#fdba74", fontWeight: 800, fontSize: "1rem", lineHeight: 1 }}>{streak}</div>
                  <div style={{ color: "rgba(253,186,116,0.6)", fontSize: ".65rem" }}>gün seri</div>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 5, background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 4 }}>
            {(["timer","library","report","sinav"] as const).map(t => (
              <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{ background: tab === t ? "white" : "transparent", color: tab === t ? "#0f1f4f" : "rgba(255,255,255,0.6)" }}>
                {t === "timer" ? "⏱ Timer" : t === "library" ? "📚 Kütüphane" : t === "report" ? "📊 Rapor" : "🎓 Sınav"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>

        {/* ── TIMER ── */}
        {tab === "timer" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>

            {/* Mod seçimi */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, width: "100%", maxWidth: 580 }}>
              {PRESET_MODES.map((m, i) => (
                <button key={i} className="mode-btn" onClick={() => { setModeIdx(i); reset(); }} style={{
                  background: modeIdx === i ? m.light : "rgba(255,255,255,0.05)",
                  borderColor: modeIdx === i ? m.color : "rgba(255,255,255,0.1)",
                  color: modeIdx === i ? m.color : "rgba(255,255,255,0.7)",
                }}>
                  <div style={{ fontWeight: 800, fontSize: ".82rem" }}>{m.label}</div>
                  <div style={{ fontSize: ".68rem", opacity: .8, marginTop: 2 }}>{i === 3 ? "Kendin ayarla" : `${m.work}dk · ${m.rest}dk`}</div>
                </button>
              ))}
            </div>

            {/* Serbest mod */}
            {modeIdx === 3 && (
              <div style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 16, padding: "18px 24px", width: "100%", maxWidth: 520 }}>
                <p style={{ color: "#c4b5fd", fontWeight: 700, fontSize: ".82rem", margin: "0 0 14px", textAlign: "center" }}>⚙️ Süreleri Belirle</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <label style={{ color: "rgba(255,255,255,0.6)", fontSize: ".76rem", fontWeight: 600 }}>DERS SÜRESİ</label>
                      <span style={{ color: "white", fontWeight: 700, fontSize: ".9rem" }}>{customWork} dk</span>
                    </div>
                    <input type="range" min={5} max={180} step={5} value={customWork} onChange={e => { setCustomWork(+e.target.value); reset(); }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <label style={{ color: "rgba(255,255,255,0.6)", fontSize: ".76rem", fontWeight: 600 }}>MOLA SÜRESİ</label>
                      <span style={{ color: "white", fontWeight: 700, fontSize: ".9rem" }}>{customRest} dk</span>
                    </div>
                    <input type="range" min={1} max={60} step={1} value={customRest} onChange={e => { setCustomRest(+e.target.value); reset(); }} />
                  </div>
                </div>
              </div>
            )}

            {/* Timer dairesi */}
            <div style={{ position: "relative", width: 220, height: 220 }}>
              {phase === "work" && <div style={{ position: "absolute", inset: -16, borderRadius: "50%", background: `radial-gradient(circle, ${mode.accent}22 0%, transparent 70%)`, animation: "pulse-ring 2s ease-in-out infinite" }} />}
              {goalMet && <div style={{ position: "absolute", inset: -8, borderRadius: "50%", animation: "celebrate-pulse 1.5s ease-in-out infinite" }} />}
              <svg width="220" height="220" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle cx="110" cy="110" r="90" fill="none" stroke={phase === "rest" ? "#10b981" : mode.accent} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "white", letterSpacing: "-2px", fontVariantNumeric: "tabular-nums" }}>
                  {phase === "idle" ? fmtTime(mode.work * 60) : fmtTime(seconds)}
                </div>
                <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,0.5)", marginTop: 4, fontWeight: 600 }}>
                  {phase === "idle" ? "Başlamaya hazır" : phase === "work" ? "🔥 Odak zamanı" : "☕ Mola"}
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {phase === "idle" && <button className="action-btn" onClick={startWork} style={{ background: mode.color, color: "white", boxShadow: `0 8px 24px ${mode.color}55` }}>▶ Başla</button>}
              {phase === "work" && <><button className="action-btn" onClick={reset} style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>✕ İptal</button><button className="action-btn" onClick={completeWork} style={{ background: "#10b981", color: "white" }}>✓ Tamamla</button></>}
              {phase === "rest" && <><button className="action-btn" onClick={reset} style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>Atla</button><button className="action-btn" onClick={startWork} style={{ background: mode.color, color: "white" }}>▶ Yeni Ders</button></>}
            </div>

            {/* Ambient ses */}
            <div style={{ width: "100%", maxWidth: 520 }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".75rem", fontWeight: 600, textAlign: "center", marginBottom: 10 }}>🎵 ODAK MÜZİĞİ</p>
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
            {dailyGoal.minutes > 0 && (
              <div style={{ width: "100%", maxWidth: 580 }}>
                <GoalProgressBar todayMin={todayMin} goalMin={dailyGoal.minutes} animal={dailyGoal.animal} />
              </div>
            )}

            {/* Motivasyon */}
            {dailyGoal.minutes > 0 && (
              <div style={{ width: "100%", maxWidth: 580, borderRadius: 14, padding: "14px 20px", textAlign: "center", background: goalMet ? "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(52,211,153,0.1))" : "rgba(255,255,255,0.05)", border: goalMet ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)", transition: "all 0.5s" }}>
                <p style={{ color: goalMet ? "#6ee7b7" : "rgba(255,255,255,0.7)", margin: 0, fontWeight: 600, fontSize: ".88rem" }}>{motivation.msg}</p>
              </div>
            )}

            {/* Dün kaçırdıysa */}
            {yMissed && (
              <div style={{ width: "100%", maxWidth: 580, borderRadius: 14, padding: "12px 20px", textAlign: "center", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)" }}>
                <p style={{ color: "#fdba74", margin: 0, fontSize: ".83rem", fontWeight: 600 }}>{TOMORROW_MSGS[new Date().getDay() % TOMORROW_MSGS.length]}</p>
              </div>
            )}

            <button onClick={() => { setTempGoal(dailyGoal.minutes); setTempAnimal(dailyGoal.animal); setShowGoalSetup(true); }}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontSize: ".78rem", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"}
            >🎯 Günlük hedef ayarla</button>
          </div>
        )}

        {/* ── KÜTÜPHANe ── */}
        {tab === "library" && (
          <div className="fade-in">
            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <h2 style={{ color: "white", fontSize: "1.3rem", fontWeight: 800, margin: "0 0 6px" }}>📚 Sanal Kütüphanem</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".82rem", margin: 0 }}>Fare ile üzerine gel — kaç dakika çalıştığını gör!</p>
            </div>
            {sessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)" }}>
                <div style={{ fontSize: "4rem", marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>Henüz kitap yok</div>
                <div style={{ fontSize: ".85rem", marginTop: 8 }}>İlk oturumunu tamamla!</div>
              </div>
            ) : (
              <>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "32px 32px 0", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: 4, minHeight: 110, paddingBottom: 12 }}>
                    {sessions.map((s, i) => <Book key={s.id} session={s} index={i} />)}
                  </div>
                  <div style={{ height: 10, background: "linear-gradient(90deg,#8b6914,#c8941a,#8b6914)", borderRadius: "0 0 4px 4px", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }} />
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
                  {[{ label:"Toplam Kitap",val:sessions.length },{ label:"Çalışılan Dk",val:sessions.reduce((a,s)=>a+s.actualDuration,0) },{ label:"Toplam Saat",val:Math.floor(sessions.reduce((a,s)=>a+s.actualDuration,0)/60) }].map((item,i)=>(
                    <div key={i} style={{ flex:1, background:"rgba(255,255,255,0.06)", borderRadius:14, padding:"14px 16px", textAlign:"center" }}>
                      <div style={{ color:"white", fontSize:"1.6rem", fontWeight:800 }}>{item.val}</div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:".78rem", marginTop:4 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── RAPOR ── */}
        {tab === "report" && (
          <div className="fade-in">
            <h2 style={{ color:"white", fontSize:"1.3rem", fontWeight:800, margin:"0 0 24px", textAlign:"center" }}>📊 Raporlar</h2>
            {dailyGoal.minutes > 0 && <div style={{ marginBottom:18 }}><GoalProgressBar todayMin={todayMin} goalMin={dailyGoal.minutes} animal={dailyGoal.animal} /></div>}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
              <div style={{ background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.3)", borderRadius:20, padding:22 }}>
                <div style={{ color:"#93c5fd", fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:10 }}>BUGÜN</div>
                <div style={{ color:"white", fontSize:"2rem", fontWeight:800 }}>{todaySessions.length}</div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:".82rem", marginTop:3 }}>oturum · {todayMin} dakika</div>
                <div style={{ marginTop:12, display:"flex", gap:5, flexWrap:"wrap" }}>
                  {todaySessions.map((s,i)=>(
                    <div key={i} style={{ background:s.plannedDuration>=90?"#065f46":s.plannedDuration>=50?"#c2410c":s.plannedDuration===0?"#7c3aed":"#1e3a8a", borderRadius:8, padding:"3px 9px", fontSize:".72rem", color:"white", fontWeight:600 }}>{s.actualDuration}dk</div>
                  ))}
                </div>
              </div>
              <div style={{ background:"rgba(249,115,22,0.12)", border:"1px solid rgba(249,115,22,0.3)", borderRadius:20, padding:22 }}>
                <div style={{ color:"#fdba74", fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:10 }}>BU HAFTA</div>
                <div style={{ color:"white", fontSize:"2rem", fontWeight:800 }}>{weekSessions.length}</div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:".82rem", marginTop:3 }}>oturum · {weekMin} dakika</div>
                <div style={{ marginTop:12, display:"flex", alignItems:"flex-end", gap:5, height:44 }}>
                  {["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map((day,i)=>{
                    const dd=new Date(); dd.setDate(dd.getDate()-dd.getDay()+1+i);
                    const ds=dd.toISOString().slice(0,10);
                    const mins=sessions.filter(s=>s.date===ds).reduce((a,s)=>a+s.actualDuration,0);
                    const maxM=Math.max(...Array.from({length:7},(_,j)=>{const d2=new Date();d2.setDate(d2.getDate()-d2.getDay()+1+j);return sessions.filter(s=>s.date===d2.toISOString().slice(0,10)).reduce((a,s)=>a+s.actualDuration,0);}),1);
                    return (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                        <div style={{ width:"100%", background:mins>0?(ds===today?"#3b82f6":"#f97316"):"rgba(255,255,255,0.1)", borderRadius:3, height:Math.max((mins/maxM)*36,mins>0?5:3), transition:"height 0.3s" }} />
                        <div style={{ color:ds===today?"white":"rgba(255,255,255,0.4)", fontSize:".62rem", fontWeight:ds===today?700:400 }}>{day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:22 }}>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:".78rem", fontWeight:700, letterSpacing:".05em", marginBottom:18 }}>TÜM ZAMANLAR</div>
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
                    <div style={{ color:"white", fontSize:"1.4rem", fontWeight:800 }}>{item.val}</div>
                    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:".72rem", marginTop:3 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SINAV ── */}
        {tab === "sinav" && (
          <SinavTab />
        )}

      </div>

      {/* ── HEDEF MODAL ── */}
      {showGoalSetup && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={e => { if (e.target===e.currentTarget) setShowGoalSetup(false); }}>
          <div style={{ background:"#0f1f4f", borderRadius:20, padding:28, maxWidth:440, width:"100%", border:"1px solid rgba(255,255,255,0.15)" }}>
            <h3 style={{ color:"white", fontSize:"1.1rem", fontWeight:800, margin:"0 0 22px", textAlign:"center" }}>🎯 Günlük Hedef Belirle</h3>
            <div style={{ marginBottom:22 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <label style={{ color:"rgba(255,255,255,0.6)", fontSize:".78rem", fontWeight:600 }}>GÜNLÜK ÇALIŞMA HEDEFİ</label>
                <span style={{ color:"white", fontWeight:800 }}>{tempGoal} dk</span>
              </div>
              <input type="range" min={30} max={480} step={10} value={tempGoal} onChange={e=>setTempGoal(+e.target.value)} />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, gap:6 }}>
                {[60,120,180,240,300].map(v=>(
                  <button key={v} onClick={()=>setTempGoal(v)} style={{ flex:1, background:tempGoal===v?"#3b82f6":"rgba(255,255,255,0.08)", border:"none", borderRadius:8, padding:"5px 0", color:"white", fontSize:".72rem", cursor:"pointer", fontWeight:600 }}>{v}dk</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ color:"rgba(255,255,255,0.6)", fontSize:".78rem", fontWeight:600, display:"block", marginBottom:12 }}>TEMSİLCİ HAYVANINI SEÇ</label>
              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                {ANIMALS.map(a=>(
                  <button key={a.id} onClick={()=>setTempAnimal(a.id)} title={a.name}
                    style={{ width:52, height:52, padding:6, border:`2px solid ${tempAnimal===a.id?"#a78bfa":"rgba(255,255,255,0.15)"}`, background:tempAnimal===a.id?"rgba(167,139,250,0.15)":"rgba(255,255,255,0.05)", cursor:"pointer", borderRadius:12, transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center" }}
                  >
                    <AnimalImg id={a.id} size={34} />
                  </button>
                ))}
              </div>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:".72rem", textAlign:"center", marginTop:8 }}>
                {ANIMALS.find(a=>a.id===tempAnimal)?.name} seçildi
              </p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowGoalSetup(false)} style={{ flex:1, background:"rgba(255,255,255,0.08)", border:"none", borderRadius:12, padding:13, color:"white", fontWeight:600, cursor:"pointer" }}>İptal</button>
              <button onClick={()=>{ const g={minutes:tempGoal,animal:tempAnimal}; setDailyGoal(g); saveGoal(g); setShowGoalSetup(false); }}
                style={{ flex:2, background:"#3b82f6", border:"none", borderRadius:12, padding:13, color:"white", fontWeight:700, cursor:"pointer" }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}