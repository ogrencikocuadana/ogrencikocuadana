"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Tipler ──────────────────────────────────────────────────────────────────
interface Session {
  id: string;
  date: string;
  plannedDuration: number;
  actualDuration: number;
  completedAt: string;
}

interface DailyGoal {
  minutes: number;
  animal: string;
}

// ─── Sabitler ────────────────────────────────────────────────────────────────
const PRESET_MODES = [
  { label: "Klasik",     work: 25, rest: 5,  color: "#1e3a8a", light: "#eff6ff", accent: "#3b82f6" },
  { label: "Derin Odak", work: 50, rest: 10, color: "#c2410c", light: "#fff7ed", accent: "#f97316" },
  { label: "Maraton",    work: 90, rest: 10, color: "#065f46", light: "#ecfdf5", accent: "#10b981" },
  { label: "Serbest",    work: 0,  rest: 0,  color: "#7c3aed", light: "#f5f3ff", accent: "#a78bfa" },
];

// SVG ikonlar — tüm cihazlarda çalışır
const ANIMAL_SVGS: Record<string, string> = {
  capybara: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="26" rx="14" ry="10" fill="#a0785a"/>
    <ellipse cx="20" cy="16" rx="11" ry="9" fill="#a0785a"/>
    <ellipse cx="13" cy="13" rx="3.5" ry="4.5" fill="#a0785a"/>
    <ellipse cx="27" cy="13" rx="3.5" ry="4.5" fill="#a0785a"/>
    <circle cx="16" cy="15" r="2" fill="#2d1a0e"/>
    <circle cx="24" cy="15" r="2" fill="#2d1a0e"/>
    <ellipse cx="20" cy="20" rx="4" ry="2.5" fill="#8a6347"/>
    <ellipse cx="20" cy="33" rx="5" ry="2" fill="#8a6347"/>
  </svg>`,
  koala: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="13" fill="#9e9e9e"/>
    <circle cx="9" cy="14" r="6" fill="#bdbdbd"/>
    <circle cx="31" cy="14" r="6" fill="#bdbdbd"/>
    <circle cx="9" cy="14" r="4" fill="#9e9e9e"/>
    <circle cx="31" cy="14" r="4" fill="#9e9e9e"/>
    <ellipse cx="20" cy="22" rx="6" ry="4" fill="#7a7a7a"/>
    <circle cx="16" cy="18" r="2" fill="#2d2d2d"/>
    <circle cx="24" cy="18" r="2" fill="#2d2d2d"/>
    <ellipse cx="20" cy="23" rx="2.5" ry="1.5" fill="#555"/>
  </svg>`,
  penguin: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="22" rx="12" ry="15" fill="#1a1a2e"/>
    <ellipse cx="20" cy="24" rx="7" ry="10" fill="white"/>
    <circle cx="20" cy="12" r="8" fill="#1a1a2e"/>
    <circle cx="17" cy="11" r="2" fill="white"/>
    <circle cx="23" cy="11" r="2" fill="white"/>
    <circle cx="17" cy="11" r="1" fill="#1a1a2e"/>
    <circle cx="23" cy="11" r="1" fill="#1a1a2e"/>
    <ellipse cx="20" cy="15" rx="3" ry="2" fill="#f97316"/>
    <ellipse cx="12" cy="22" rx="4" ry="2" fill="#1a1a2e" transform="rotate(-20 12 22)"/>
    <ellipse cx="28" cy="22" rx="4" ry="2" fill="#1a1a2e" transform="rotate(20 28 22)"/>
    <ellipse cx="16" cy="34" rx="3" ry="1.5" fill="#f97316"/>
    <ellipse cx="24" cy="34" rx="3" ry="1.5" fill="#f97316"/>
  </svg>`,
  cat: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="22" r="13" fill="#f4a261"/>
    <polygon points="9,14 6,4 14,10" fill="#f4a261"/>
    <polygon points="31,14 34,4 26,10" fill="#f4a261"/>
    <circle cx="16" cy="20" r="2.5" fill="#2d1a0e"/>
    <circle cx="24" cy="20" r="2.5" fill="#2d1a0e"/>
    <circle cx="16.8" cy="19.2" r="0.8" fill="white"/>
    <circle cx="24.8" cy="19.2" r="0.8" fill="white"/>
    <ellipse cx="20" cy="24" rx="2" ry="1.5" fill="#e07b54"/>
    <line x1="10" y1="22" x2="18" y2="23" stroke="#2d1a0e" strokeWidth="0.8"/>
    <line x1="10" y1="24" x2="18" y2="24" stroke="#2d1a0e" strokeWidth="0.8"/>
    <line x1="30" y1="22" x2="22" y2="23" stroke="#2d1a0e" strokeWidth="0.8"/>
    <line x1="30" y1="24" x2="22" y2="24" stroke="#2d1a0e" strokeWidth="0.8"/>
  </svg>`,
  fox: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="24" rx="13" ry="11" fill="#e8600a"/>
    <circle cx="20" cy="16" r="10" fill="#e8600a"/>
    <polygon points="11,12 5,2 13,8" fill="#e8600a"/>
    <polygon points="29,12 35,2 27,8" fill="#e8600a"/>
    <polygon points="11,12 5,2 13,8" fill="white" transform="scale(0.6) translate(9,3)"/>
    <polygon points="29,12 35,2 27,8" fill="white" transform="scale(0.6) translate(17,3)"/>
    <ellipse cx="20" cy="20" rx="7" ry="6" fill="white"/>
    <circle cx="16" cy="15" r="2" fill="#2d1a0e"/>
    <circle cx="24" cy="15" r="2" fill="#2d1a0e"/>
    <ellipse cx="20" cy="19" rx="2" ry="1.5" fill="#2d1a0e"/>
  </svg>`,
  bear: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="22" r="13" fill="#6d4c41"/>
    <circle cx="11" cy="12" r="5" fill="#6d4c41"/>
    <circle cx="29" cy="12" r="5" fill="#6d4c41"/>
    <circle cx="11" cy="12" r="3" fill="#5d4037"/>
    <circle cx="29" cy="12" r="3" fill="#5d4037"/>
    <ellipse cx="20" cy="24" rx="6" ry="4" fill="#5d4037"/>
    <circle cx="16" cy="19" r="2.5" fill="#2d1a0e"/>
    <circle cx="24" cy="19" r="2.5" fill="#2d1a0e"/>
    <circle cx="16.8" cy="18.2" r="0.8" fill="white"/>
    <circle cx="24.8" cy="18.2" r="0.8" fill="white"/>
    <ellipse cx="20" cy="25" rx="2.5" ry="1.5" fill="#3e2723"/>
  </svg>`,
};

const ANIMALS = [
  { id: "capybara", emoji: "🦫", name: "Kapibara" },
  { id: "koala",    emoji: "🐨", name: "Koala" },
  { id: "penguin",  emoji: "🐧", name: "Penguen" },
  { id: "cat",      emoji: "🐱", name: "Kedi" },
  { id: "fox",      emoji: "🦊", name: "Tilki" },
  { id: "bear",     emoji: "🐻", name: "Ayı" },
];

const STORAGE_KEY    = "pomodoro_sessions_v2";
const GOAL_KEY       = "pomodoro_goal_v1";

// ─── Motivasyon mesajları ─────────────────────────────────────────────────────
function getMotivation(pct: number, goalMet: boolean, animal: string) {
  const emoji = ANIMALS.find(a => a.id === animal)?.emoji ?? "🦫";
  if (goalMet)       return { msg: `Hedefine ulaştın! ${emoji} Muhteşemsin, tebrikler!`, type: "celebrate" };
  if (pct >= 75)     return { msg: `${emoji} Neredeyse bitti! Son vitese geç!`, type: "almost" };
  if (pct >= 50)     return { msg: `${emoji} Yarısını geçtin, harika gidiyorsun!`, type: "good" };
  if (pct >= 25)     return { msg: `${emoji} İyi başlangıç, devam et!`, type: "start" };
  if (pct > 0)       return { msg: `${emoji} İlk adımı attın, sürdür!`, type: "begin" };
  return               { msg: `${emoji} Bugün için hedefini belirle ve başla!`, type: "idle" };
}

const TOMORROW_MSGS = [
  "Yarın daha güçlü başlayacaksın! 💪",
  "Her gün yeni bir fırsat. Yarın hedefe! 🌅",
  "Bugün az oldu, yarın telafi edersin! 🚀",
  "Küçük adımlar büyük yolculuk yapar. Yarın devam! ⭐",
];

// ─── Yardımcılar ─────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().slice(0, 10); }
function weekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().slice(0, 10);
}
function fmtTime(sec: number) {
  return `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;
}

// ─── Kitap ────────────────────────────────────────────────────────────────────
function Book({ session, index }: { session: Session; index: number }) {
  const sizes: Record<number, { h: number; w: number }> = { 25: { h: 60, w: 14 }, 50: { h: 80, w: 18 }, 90: { h: 100, w: 24 } };
  const def = session.plannedDuration >= 90 ? { h: 100, w: 24 } : session.plannedDuration >= 50 ? { h: 80, w: 18 } : { h: 60, w: 14 };
  const { h, w } = sizes[session.plannedDuration] ?? def;
  const palettes = [["#1e3a8a","#2d4fa0"],["#c2410c","#d4510f"],["#065f46","#0a7a5c"],["#4c1d95","#6b2cb5"],["#7c2d12","#9a3a18"],["#1e40af","#2563eb"],["#7c3aed","#8b5cf6"],["#92400e","#b45309"]];
  const [bg, spine] = palettes[index % palettes.length];
  const icon = session.plannedDuration >= 90 ? "📕" : session.plannedDuration >= 50 ? "📗" : session.plannedDuration === 0 ? "📓" : "📖";
  return (
    <div title={`${session.plannedDuration === 0 ? "Serbest" : session.plannedDuration + "dk planlı"} · ${session.actualDuration}dk çalışıldı · ${session.date}`}
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

// ─── Progress Bar with Animal ─────────────────────────────────────────────────
function GoalProgressBar({ todayMin, goalMin, animal }: { todayMin: number; goalMin: number; animal: string }) {
  const pct = goalMin > 0 ? Math.min(100, (todayMin / goalMin) * 100) : 0;
  const barRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: ".82rem", fontWeight: 600 }}>GÜNLÜK HEDEF</span>
        <span style={{ color: "white", fontWeight: 700, fontSize: ".9rem" }}>{todayMin} / {goalMin} dk</span>
      </div>

      {/* Bar */}
      <div ref={barRef} style={{ position: "relative", height: 36, background: "rgba(255,255,255,0.08)", borderRadius: 18, overflow: "visible" }}>
        {/* Dolu kısım */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${pct}%`, minWidth: pct > 0 ? 36 : 0,
          background: pct >= 100 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #3b82f6, #60a5fa)",
          borderRadius: 18, transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
        }} />

        {/* Hayvan ikonu */}
        <div style={{
          position: "absolute", top: "50%", transform: "translateY(-50%)",
          left: `calc(${Math.max(0, Math.min(pct, 96))}% - 2px)`,
          fontSize: "1.4rem", transition: "left 0.8s cubic-bezier(.4,0,.2,1)",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          zIndex: 2, width: 32, height: 32,
        }}
          dangerouslySetInnerHTML={{ __html: ANIMAL_SVGS[animal] ?? ANIMAL_SVGS["capybara"] }}
        />

        {/* Hedef işareti */}
        <div style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          color: pct >= 100 ? "#10b981" : "rgba(255,255,255,0.4)",
          fontSize: ".75rem", fontWeight: 700, whiteSpace: "nowrap", zIndex: 1,
        }}>
          {goalMin}dk 🏁
        </div>
      </div>

      {/* Yüzde */}
      <div style={{ marginTop: 8, textAlign: "center", fontSize: ".8rem", color: "rgba(255,255,255,0.4)" }}>
        %{Math.round(pct)} tamamlandı
      </div>
    </div>
  );
}

// ─── Kutlama efekti ──────────────────────────────────────────────────────────
function CelebrationBg() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: "-20px",
          fontSize: `${1 + Math.random() * 1.5}rem`,
          animation: `confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
        }}>
          {["🎉","⭐","✨","🌟","🎊","💫"][Math.floor(Math.random() * 6)]}
        </div>
      ))}
    </div>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
export default function PomodoroPage() {
  const [modeIdx, setModeIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "work" | "rest">("idle");
  const [seconds, setSeconds] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tab, setTab] = useState<"timer" | "library" | "report">("timer");
  const [loaded, setLoaded] = useState(false);

  // Serbest mod
  const [customWork, setCustomWork] = useState(30);
  const [customRest, setCustomRest] = useState(5);

  // Hedef
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>({ minutes: 120, animal: "capybara" });
  const [showGoalSetup, setShowGoalSetup] = useState(false);
  const [tempGoal, setTempGoal] = useState(120);
  const [tempAnimal, setTempAnimal] = useState("capybara");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workStartRef = useRef<number>(0);
  const phaseEndRef = useRef<number>(0);

  const mode = modeIdx === 3
    ? { label: "Serbest", work: customWork, rest: customRest, color: "#7c3aed", light: "#f5f3ff", accent: "#a78bfa" }
    : PRESET_MODES[modeIdx];

  // ─── Storage ────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSessions(JSON.parse(raw));
      const g = localStorage.getItem(GOAL_KEY);
      if (g) setDailyGoal(JSON.parse(g));
    } catch { /* ilk kullanım */ }
    setLoaded(true);
  }, []);

  const saveSessions = useCallback((list: Session[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* quota */ }
  }, []);

  const saveGoal = useCallback((g: DailyGoal) => {
    try { localStorage.setItem(GOAL_KEY, JSON.stringify(g)); } catch { /* quota */ }
  }, []);

  // ─── Oturum kaydet ───────────────────────────────────────────────────────────
  const recordSession = useCallback((plannedDuration: number, startedAt: number) => {
    const actualDuration = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const s: Session = { id: Date.now().toString(), date: todayStr(), plannedDuration, actualDuration, completedAt: new Date().toISOString() };
    setSessions(prev => { const u = [...prev, s]; saveSessions(u); return u; });
  }, [saveSessions]);

  // ─── Timer ──────────────────────────────────────────────────────────────────
  const startWork = useCallback(() => {
    const now = Date.now();
    workStartRef.current = now;
    phaseEndRef.current = now + mode.work * 60 * 1000;
    setPhase("work");
    setSeconds(mode.work * 60);
  }, [mode.work]);

  const startRest = useCallback(() => {
    const now = Date.now();
    phaseEndRef.current = now + mode.rest * 60 * 1000;
    setPhase("rest");
    setSeconds(mode.rest * 60);
  }, [mode.rest]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("idle"); setSeconds(0);
  }, []);

  const completeWork = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    recordSession(mode.work, workStartRef.current);
    const now = Date.now();
    phaseEndRef.current = now + mode.rest * 60 * 1000;
    setPhase("rest"); setSeconds(mode.rest * 60);
  }, [mode.work, mode.rest, recordSession]);

  useEffect(() => {
    if (phase === "idle") { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((phaseEndRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        if (phase === "work") {
          recordSession(mode.work, workStartRef.current);
          const now = Date.now();
          phaseEndRef.current = now + mode.rest * 60 * 1000;
          setPhase("rest"); setSeconds(mode.rest * 60);
        } else { setPhase("idle"); setSeconds(0); }
      } else { setSeconds(remaining); }
    }, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, mode.work, mode.rest, recordSession]);

  // ─── Hesaplamalar ────────────────────────────────────────────────────────────
  const today = todayStr();
  const wStart = weekStart();
  const todaySessions = sessions.filter(s => s.date === today);
  const weekSessions = sessions.filter(s => s.date >= wStart);
  const todayMin = todaySessions.reduce((a, s) => a + s.actualDuration, 0);
  const weekMin = weekSessions.reduce((a, s) => a + s.actualDuration, 0);
  const goalPct = dailyGoal.minutes > 0 ? Math.min(100, (todayMin / dailyGoal.minutes) * 100) : 0;
  const goalMet = dailyGoal.minutes > 0 && todayMin >= dailyGoal.minutes;
  const motivation = getMotivation(goalPct, goalMet, dailyGoal.animal);

  // Dün hedef tuttu mu?
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const yesterdayMin = sessions.filter(s => s.date === yesterdayStr).reduce((a, s) => a + s.actualDuration, 0);
  const yesterdayMissed = dailyGoal.minutes > 0 && yesterdayMin < dailyGoal.minutes && yesterdayMin === 0;
  const tomorrowMsg = TOMORROW_MSGS[new Date().getDay() % TOMORROW_MSGS.length];

  const totalSec = phase === "work" ? mode.work * 60 : phase === "rest" ? mode.rest * 60 : 1;
  const progress = phase === "idle" ? 0 : ((totalSec - seconds) / totalSec) * 100;
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
        .fade-in { animation: fade-in 0.4s ease forwards; }
        .tab-btn { border:none;cursor:pointer;transition:all 0.2s;font-weight:600;border-radius:10px;padding:10px 16px;font-size:.82rem; }
        .mode-btn { border:2px solid;cursor:pointer;transition:all 0.25s;border-radius:14px;padding:12px 14px;text-align:center;background:none; }
        .mode-btn:hover { transform:translateY(-2px); }
        .action-btn { border:none;cursor:pointer;transition:all 0.2s;border-radius:14px;font-weight:700;font-size:1rem;padding:14px 32px; }
        .action-btn:hover { filter:brightness(1.1);transform:translateY(-1px); }
        .animal-btn { border:2px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);cursor:pointer;border-radius:12px;padding:10px;transition:all 0.2s;font-size:1.6rem; }
        .animal-btn:hover,.animal-btn.selected { border-color:#a78bfa;background:rgba(167,139,250,0.15); }
        input[type=number]::-webkit-inner-spin-button { opacity:1; }
        input[type=range] { accent-color: #3b82f6; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "28px 24px 0", maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ color: "white", fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>⏱ Pomodoro</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".8rem", margin: "3px 0 0" }}>Sanal Kütüphane · Öğrenci Koçu Adana</p>
          </div>
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 4 }}>
            {(["timer","library","report"] as const).map(t => (
              <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{
                background: tab === t ? "white" : "transparent",
                color: tab === t ? "#0f1f4f" : "rgba(255,255,255,0.6)",
              }}>
                {t === "timer" ? "⏱ Timer" : t === "library" ? "📚 Kütüphane" : "📊 Rapor"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>

        {/* ── TIMER ── */}
        {tab === "timer" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

            {/* Mod seçimi */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, width: "100%", maxWidth: 600 }}>
              {PRESET_MODES.map((m, i) => (
                <button key={i} className="mode-btn" onClick={() => { setModeIdx(i); reset(); }} style={{
                  background: modeIdx === i ? m.light : "rgba(255,255,255,0.05)",
                  borderColor: modeIdx === i ? m.color : "rgba(255,255,255,0.1)",
                  color: modeIdx === i ? m.color : "rgba(255,255,255,0.7)",
                }}>
                  <div style={{ fontWeight: 800, fontSize: ".85rem" }}>{m.label}</div>
                  <div style={{ fontSize: ".7rem", opacity: .8, marginTop: 3 }}>
                    {i === 3 ? "Kendin ayarla" : `${m.work}dk · ${m.rest}dk`}
                  </div>
                </button>
              ))}
            </div>

            {/* Serbest mod ayarları */}
            {modeIdx === 3 && (
              <div style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 16, padding: "20px 28px", width: "100%", maxWidth: 500 }}>
                <p style={{ color: "#c4b5fd", fontWeight: 700, fontSize: ".85rem", margin: "0 0 16px", textAlign: "center" }}>⚙️ Süreleri Belirle</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={{ color: "rgba(255,255,255,0.6)", fontSize: ".78rem", fontWeight: 600, display: "block", marginBottom: 8 }}>
                      DERS SÜRESİ
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="range" min={5} max={180} step={5} value={customWork}
                        onChange={e => { setCustomWork(+e.target.value); reset(); }}
                        style={{ flex: 1 }} />
                      <span style={{ color: "white", fontWeight: 700, fontSize: "1rem", minWidth: 50, textAlign: "right" }}>{customWork}dk</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ color: "rgba(255,255,255,0.6)", fontSize: ".78rem", fontWeight: 600, display: "block", marginBottom: 8 }}>
                      MOLA SÜRESİ
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="range" min={1} max={60} step={1} value={customRest}
                        onChange={e => { setCustomRest(+e.target.value); reset(); }}
                        style={{ flex: 1 }} />
                      <span style={{ color: "white", fontWeight: 700, fontSize: "1rem", minWidth: 50, textAlign: "right" }}>{customRest}dk</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timer dairesi */}
            <div style={{ position: "relative", width: 220, height: 220 }}>
              {phase === "work" && (
                <div style={{ position: "absolute", inset: -16, borderRadius: "50%", background: `radial-gradient(circle, ${mode.accent}22 0%, transparent 70%)`, animation: "pulse-ring 2s ease-in-out infinite" }} />
              )}
              {goalMet && (
                <div style={{ position: "absolute", inset: -8, borderRadius: "50%", animation: "celebrate-pulse 1.5s ease-in-out infinite" }} />
              )}
              <svg width="220" height="220" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle cx="110" cy="110" r="90" fill="none"
                  stroke={phase === "rest" ? "#10b981" : mode.accent}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "white", letterSpacing: "-2px", fontVariantNumeric: "tabular-nums" }}>
                  {phase === "idle" ? fmtTime(mode.work * 60) : fmtTime(seconds)}
                </div>
                <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,0.5)", marginTop: 4, fontWeight: 600 }}>
                  {phase === "idle" ? "Başlamaya hazır" : phase === "work" ? "🔥 Odak zamanı" : "☕ Mola"}
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {phase === "idle" && (
                <button className="action-btn" onClick={startWork} style={{ background: mode.color, color: "white", boxShadow: `0 8px 24px ${mode.color}55` }}>
                  ▶ Başla
                </button>
              )}
              {phase === "work" && (
                <>
                  <button className="action-btn" onClick={reset} style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>✕ İptal</button>
                  <button className="action-btn" onClick={completeWork} style={{ background: "#10b981", color: "white" }}>✓ Tamamla</button>
                </>
              )}
              {phase === "rest" && (
                <>
                  <button className="action-btn" onClick={reset} style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>Atla</button>
                  <button className="action-btn" onClick={startWork} style={{ background: mode.color, color: "white" }}>▶ Yeni Ders</button>
                </>
              )}
            </div>

            {/* Günlük hedef progress bar */}
            {dailyGoal.minutes > 0 && (
              <div style={{ width: "100%", maxWidth: 600 }}>
                <GoalProgressBar todayMin={todayMin} goalMin={dailyGoal.minutes} animal={dailyGoal.animal} />
              </div>
            )}

            {/* Motivasyon mesajı */}
            {dailyGoal.minutes > 0 && (
              <div style={{
                width: "100%", maxWidth: 600, borderRadius: 14, padding: "14px 20px", textAlign: "center",
                background: goalMet
                  ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1))"
                  : "rgba(255,255,255,0.05)",
                border: goalMet ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.5s",
              }}>
                <p style={{ color: goalMet ? "#6ee7b7" : "rgba(255,255,255,0.7)", margin: 0, fontWeight: 600, fontSize: ".9rem" }}>
                  {motivation.msg}
                </p>
              </div>
            )}

            {/* Dün hedef tutmadıysa */}
            {yesterdayMissed && (
              <div style={{ width: "100%", maxWidth: 600, borderRadius: 14, padding: "12px 20px", textAlign: "center", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)" }}>
                <p style={{ color: "#fdba74", margin: 0, fontSize: ".85rem", fontWeight: 600 }}>{tomorrowMsg}</p>
              </div>
            )}

            {/* Hedef ayarla butonu */}
            <button onClick={() => { setTempGoal(dailyGoal.minutes); setTempAnimal(dailyGoal.animal); setShowGoalSetup(true); }}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontSize: ".8rem", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"}
            >
              🎯 Günlük hedef ayarla
            </button>
          </div>
        )}

        {/* ── KÜTÜPHANe ── */}
        {tab === "library" && (
          <div className="fade-in">
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <h2 style={{ color: "white", fontSize: "1.4rem", fontWeight: 800, margin: "0 0 8px" }}>📚 Sanal Kütüphanem</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".85rem", margin: 0 }}>Fare ile üzerine gel — kaç dakika çalıştığını gör!</p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
                {[{ d: 25, label: "Klasik 📖" }, { d: 50, label: "Derin Odak 📗" }, { d: 90, label: "Maraton 📕" }, { d: 0, label: "Serbest 📓" }].map(item => (
                  <div key={item.d} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: ".75rem" }}>
                    <div style={{ width: item.d === 0 ? 12 : item.d === 25 ? 10 : item.d === 50 ? 14 : 18, height: item.d === 0 ? 22 : item.d === 25 ? 20 : item.d === 50 ? 26 : 32, background: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            {sessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)" }}>
                <div style={{ fontSize: "4rem", marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>Henüz kitap yok</div>
                <div style={{ fontSize: ".85rem", marginTop: 8 }}>İlk oturumunu tamamla, kütüphaneni doldur!</div>
              </div>
            ) : (
              <>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "32px 32px 0", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: 4, minHeight: 110, paddingBottom: 12 }}>
                    {sessions.map((s, i) => <Book key={s.id} session={s} index={i} />)}
                  </div>
                  <div style={{ height: 10, background: "linear-gradient(90deg, #8b6914, #c8941a, #8b6914)", borderRadius: "0 0 4px 4px", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }} />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                  {[
                    { label: "Toplam Kitap", val: sessions.length },
                    { label: "Çalışılan Dk", val: sessions.reduce((a, s) => a + s.actualDuration, 0) },
                    { label: "Toplam Saat", val: Math.floor(sessions.reduce((a, s) => a + s.actualDuration, 0) / 60) },
                  ].map((item, i) => (
                    <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 20px", textAlign: "center" }}>
                      <div style={{ color: "white", fontSize: "1.8rem", fontWeight: 800 }}>{item.val}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".8rem", marginTop: 4 }}>{item.label}</div>
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
            <h2 style={{ color: "white", fontSize: "1.4rem", fontWeight: 800, margin: "0 0 28px", textAlign: "center" }}>📊 Raporlar</h2>

            {/* Bugün + hedef */}
            {dailyGoal.minutes > 0 && (
              <div style={{ marginBottom: 20 }}>
                <GoalProgressBar todayMin={todayMin} goalMin={dailyGoal.minutes} animal={dailyGoal.animal} />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 20, padding: 24 }}>
                <div style={{ color: "#93c5fd", fontSize: ".8rem", fontWeight: 700, letterSpacing: ".05em", marginBottom: 12 }}>BUGÜN</div>
                <div style={{ color: "white", fontSize: "2.2rem", fontWeight: 800 }}>{todaySessions.length}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".85rem", marginTop: 4 }}>oturum · {todayMin} dakika</div>
                <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {todaySessions.map((s, i) => (
                    <div key={i} style={{ background: s.plannedDuration >= 90 ? "#065f46" : s.plannedDuration >= 50 ? "#c2410c" : s.plannedDuration === 0 ? "#7c3aed" : "#1e3a8a", borderRadius: 8, padding: "4px 10px", fontSize: ".75rem", color: "white", fontWeight: 600 }}>
                      {s.actualDuration}dk
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 20, padding: 24 }}>
                <div style={{ color: "#fdba74", fontSize: ".8rem", fontWeight: 700, letterSpacing: ".05em", marginBottom: 12 }}>BU HAFTA</div>
                <div style={{ color: "white", fontSize: "2.2rem", fontWeight: 800 }}>{weekSessions.length}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".85rem", marginTop: 4 }}>oturum · {weekMin} dakika</div>
                <div style={{ marginTop: 14, display: "flex", alignItems: "flex-end", gap: 6, height: 48 }}>
                  {["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map((day, i) => {
                    const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1 + i);
                    const ds = d.toISOString().slice(0, 10);
                    const mins = sessions.filter(s => s.date === ds).reduce((a, s) => a + s.actualDuration, 0);
                    const maxM = Math.max(...Array.from({length:7},(_,j)=>{const dd=new Date();dd.setDate(dd.getDate()-dd.getDay()+1+j);return sessions.filter(s=>s.date===dd.toISOString().slice(0,10)).reduce((a,s)=>a+s.actualDuration,0);}),1);
                    const isToday = ds === today;
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width:"100%", background: mins > 0 ? (isToday ? "#3b82f6" : "#f97316") : "rgba(255,255,255,0.1)", borderRadius: 4, height: Math.max((mins/maxM)*36, mins>0?6:4), transition:"height 0.3s" }} />
                        <div style={{ color: isToday ? "white" : "rgba(255,255,255,0.4)", fontSize: ".65rem", fontWeight: isToday ? 700 : 400 }}>{day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 24 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: ".8rem", fontWeight: 700, letterSpacing: ".05em", marginBottom: 20 }}>TÜM ZAMANLAR</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {[
                  { label: "Toplam Oturum",   val: sessions.length },
                  { label: "Çalışılan Dakika", val: sessions.reduce((a,s)=>a+s.actualDuration,0) },
                  { label: "Toplam Saat",      val: Math.floor(sessions.reduce((a,s)=>a+s.actualDuration,0)/60) },
                  { label: "Klasik (25dk)",    val: sessions.filter(s=>s.plannedDuration===25).length },
                  { label: "Derin Odak (50dk)",val: sessions.filter(s=>s.plannedDuration===50).length },
                  { label: "Maraton (90dk)",   val: sessions.filter(s=>s.plannedDuration===90).length },
                  { label: "Serbest",          val: sessions.filter(s=>s.plannedDuration===0).length },
                  { label: "Aktif Gün",        val: new Set(sessions.map(s=>s.date)).size },
                  { label: "Ort. Oturum/Gün",  val: new Set(sessions.map(s=>s.date)).size ? Math.round(sessions.length/new Set(sessions.map(s=>s.date)).size*10)/10 : 0 },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ color: "white", fontSize: "1.5rem", fontWeight: 800 }}>{item.val}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".75rem", marginTop: 4 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── HEDEF AYARLA MODAL ── */}
      {showGoalSetup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setShowGoalSetup(false); }}
        >
          <div style={{ background: "#0f1f4f", borderRadius: 20, padding: 32, maxWidth: 480, width: "100%", border: "1px solid rgba(255,255,255,0.15)" }}>
            <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: 800, margin: "0 0 24px", textAlign: "center" }}>🎯 Günlük Hedef Belirle</h3>

            {/* Dakika */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: "rgba(255,255,255,0.6)", fontSize: ".8rem", fontWeight: 600, display: "block", marginBottom: 12 }}>
                GÜNLÜK ÇALIŞMA HEDEFİ
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="range" min={30} max={480} step={10} value={tempGoal}
                  onChange={e => setTempGoal(+e.target.value)}
                  style={{ flex: 1 }} />
                <span style={{ color: "white", fontWeight: 800, fontSize: "1.1rem", minWidth: 70, textAlign: "right" }}>{tempGoal} dk</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                {[60,120,180,240,300].map(v => (
                  <button key={v} onClick={() => setTempGoal(v)} style={{
                    background: tempGoal === v ? "#3b82f6" : "rgba(255,255,255,0.08)",
                    border: "none", borderRadius: 8, padding: "5px 10px", color: "white", fontSize: ".75rem", cursor: "pointer", fontWeight: 600,
                  }}>{v}dk</button>
                ))}
              </div>
            </div>

            {/* Hayvan seçimi */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ color: "rgba(255,255,255,0.6)", fontSize: ".8rem", fontWeight: 600, display: "block", marginBottom: 12 }}>
                TEMSİLCİ HAYVANINI SEÇ
              </label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {ANIMALS.map(a => (
                  <button key={a.id}
                    onClick={() => setTempAnimal(a.id)}
                    title={a.name}
                    dangerouslySetInnerHTML={{ __html: ANIMAL_SVGS[a.id] }}
                    style={{ width: 52, height: 52, padding: 6, border: `2px solid ${tempAnimal === a.id ? "#a78bfa" : "rgba(255,255,255,0.15)"}`, background: tempAnimal === a.id ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.05)", cursor: "pointer", borderRadius: 12, transition: "all 0.2s" }}
                  />
                ))}
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".75rem", textAlign: "center", marginTop: 8 }}>
                {ANIMALS.find(a => a.id === tempAnimal)?.name} seçildi
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowGoalSetup(false)} style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12, padding: 14, color: "white", fontWeight: 600, cursor: "pointer", fontSize: ".9rem" }}>
                İptal
              </button>
              <button onClick={() => {
                const g = { minutes: tempGoal, animal: tempAnimal };
                setDailyGoal(g); saveGoal(g); setShowGoalSetup(false);
              }} style={{ flex: 2, background: "#3b82f6", border: "none", borderRadius: 12, padding: 14, color: "white", fontWeight: 700, cursor: "pointer", fontSize: ".9rem" }}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}