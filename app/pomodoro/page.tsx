"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Tipler ──────────────────────────────────────────────────────────────────
interface Session {
  id: string;
  date: string;
  plannedDuration: number; // 25, 50, 90
  actualDuration: number;  // gerçekten çalışılan dakika
  completedAt: string;
}

// ─── Sabitler ────────────────────────────────────────────────────────────────
const MODES = [
  { label: "Klasik",     work: 25, rest: 5,  color: "#1e3a8a", light: "#eff6ff", accent: "#3b82f6" },
  { label: "Derin Odak", work: 50, rest: 10, color: "#c2410c", light: "#fff7ed", accent: "#f97316" },
  { label: "Maraton",    work: 90, rest: 10, color: "#065f46", light: "#ecfdf5", accent: "#10b981" },
];

const STORAGE_KEY = "pomodoro_sessions_v2";

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

// ─── Kitap Bileşeni ──────────────────────────────────────────────────────────
function Book({ session, index }: { session: Session; index: number }) {
  // Boyutlar planlanan süreye göre
  const sizes: Record<number, { h: number; w: number }> = {
    25: { h: 60, w: 14 },
    50: { h: 80, w: 18 },
    90: { h: 100, w: 24 },
  };
  const { h, w } = sizes[session.plannedDuration] ?? { h: 60, w: 14 };

  const palettes = [
    ["#1e3a8a", "#2d4fa0"], ["#c2410c", "#d4510f"], ["#065f46", "#0a7a5c"],
    ["#4c1d95", "#6b2cb5"], ["#7c2d12", "#9a3a18"], ["#1e40af", "#2563eb"],
    ["#92400e", "#b45309"], ["#134e4a", "#0f766e"],
  ];
  const [bg, spine] = palettes[index % palettes.length];

  const label = session.plannedDuration === 25 ? "📖" : session.plannedDuration === 50 ? "📗" : "📕";

  return (
    <div
      title={`${session.plannedDuration}dk planlı · ${session.actualDuration}dk çalışıldı · ${session.date}`}
      style={{ width: w, height: h, position: "relative", cursor: "default", transition: "transform 0.2s", transformOrigin: "bottom center" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
    >
      <div style={{ position: "absolute", inset: 0, background: bg, borderRadius: "2px 4px 4px 2px", boxShadow: "inset -3px 0 6px rgba(0,0,0,0.2), 2px 2px 8px rgba(0,0,0,0.3)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: spine, borderRadius: "2px 0 0 2px" }} />
      <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", fontSize: h > 70 ? 10 : 8 }}>{label}</div>
      <div style={{ position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)", fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>
        {session.actualDuration}dk
      </div>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function PomodoroPage() {
  const [modeIdx, setModeIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "work" | "rest">("idle");
  const [seconds, setSeconds] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tab, setTab] = useState<"timer" | "library" | "report">("timer");
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workStartRef = useRef<number>(0); // çalışma başlangıç zamanı
  const mode = MODES[modeIdx];

  // ─── localStorage yükleme / kaydetme ─────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSessions(JSON.parse(raw));
    } catch { /* ilk kullanım */ }
    setLoaded(true);
  }, []);

  const saveSessions = useCallback((list: Session[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* quota */ }
  }, []);

  // ─── Oturum kaydet ────────────────────────────────────────────────────────
  const recordSession = useCallback((plannedDuration: number, startedAt: number) => {
    const actualDuration = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const s: Session = {
      id: Date.now().toString(),
      date: todayStr(),
      plannedDuration,
      actualDuration,
      completedAt: new Date().toISOString(),
    };
    setSessions(prev => { const u = [...prev, s]; saveSessions(u); return u; });
    return s;
  }, [saveSessions]);

  // ─── Timer mantığı ────────────────────────────────────────────────────────
  const startWork = useCallback(() => {
    workStartRef.current = Date.now();
    setPhase("work");
    setSeconds(mode.work * 60);
  }, [mode.work]);

  const startRest = useCallback(() => {
    setPhase("rest");
    setSeconds(mode.rest * 60);
  }, [mode.rest]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("idle");
    setSeconds(0);
  }, []);

  // Manuel tamamlama
  const completeWork = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    recordSession(mode.work, workStartRef.current);
    startRest();
  }, [mode.work, recordSession, startRest]);

  useEffect(() => {
    if (phase === "idle") { if (intervalRef.current) clearInterval(intervalRef.current); return; }

    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          if (phase === "work") {
            recordSession(mode.work, workStartRef.current);
            setPhase("rest");
            return mode.rest * 60;
          } else {
            setPhase("idle");
            return 0;
          }
        }
        return s - 1;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, mode.work, mode.rest, recordSession]);

  // ─── Rapor ────────────────────────────────────────────────────────────────
  const today = todayStr();
  const wStart = weekStart();
  const todaySessions = sessions.filter(s => s.date === today);
  const weekSessions = sessions.filter(s => s.date >= wStart);
  const todayMin = todaySessions.reduce((a, s) => a + s.actualDuration, 0);
  const weekMin = weekSessions.reduce((a, s) => a + s.actualDuration, 0);

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
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a1628 0%, #0f1f4f 50%, #1a0a2e 100%)", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.08);opacity:1} }
        @keyframes fade-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fade-in 0.4s ease forwards; }
        .tab-btn { border:none;cursor:pointer;transition:all 0.2s;font-weight:600;border-radius:10px;padding:10px 18px;font-size:.85rem; }
        .mode-btn { border:2px solid;cursor:pointer;transition:all 0.25s;border-radius:14px;padding:12px 16px;text-align:center;background:none; }
        .mode-btn:hover { transform:translateY(-2px); }
        .action-btn { border:none;cursor:pointer;transition:all 0.2s;border-radius:14px;font-weight:700;font-size:1rem;padding:14px 36px; }
        .action-btn:hover { filter:brightness(1.1);transform:translateY(-1px); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "32px 24px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>⏱ Pomodoro</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".85rem", margin: "4px 0 0" }}>Sanal Kütüphane · Öğrenci Koçu Adana</p>
          </div>
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 4 }}>
            {(["timer", "library", "report"] as const).map(t => (
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

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* ── TIMER ── */}
        {tab === "timer" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
            {/* Mod seçimi */}
            <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 560 }}>
              {MODES.map((m, i) => (
                <button key={i} className="mode-btn" onClick={() => { setModeIdx(i); reset(); }} style={{
                  flex: 1,
                  background: modeIdx === i ? m.light : "rgba(255,255,255,0.05)",
                  borderColor: modeIdx === i ? m.color : "rgba(255,255,255,0.1)",
                  color: modeIdx === i ? m.color : "rgba(255,255,255,0.7)",
                }}>
                  <div style={{ fontWeight: 800, fontSize: ".95rem" }}>{m.label}</div>
                  <div style={{ fontSize: ".75rem", opacity: .8, marginTop: 4 }}>{m.work}dk · {m.rest}dk mola</div>
                </button>
              ))}
            </div>

            {/* Daire */}
            <div style={{ position: "relative", width: 240, height: 240 }}>
              {phase === "work" && (
                <div style={{ position: "absolute", inset: -16, borderRadius: "50%", background: `radial-gradient(circle, ${mode.accent}22 0%, transparent 70%)`, animation: "pulse-ring 2s ease-in-out infinite" }} />
              )}
              <svg width="240" height="240" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                <circle cx="120" cy="120" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle cx="120" cy="120" r="90" fill="none"
                  stroke={phase === "rest" ? "#10b981" : mode.accent}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "3rem", fontWeight: 800, color: "white", letterSpacing: "-2px", fontVariantNumeric: "tabular-nums" }}>
                  {phase === "idle" ? fmtTime(mode.work * 60) : fmtTime(seconds)}
                </div>
                <div style={{ fontSize: ".85rem", color: "rgba(255,255,255,0.5)", marginTop: 6, fontWeight: 600 }}>
                  {phase === "idle" ? "Başlamaya hazır" : phase === "work" ? "🔥 Odak zamanı" : "☕ Mola"}
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {phase === "idle" && (
                <button className="action-btn" onClick={startWork} style={{ background: mode.color, color: "white", boxShadow: `0 8px 24px ${mode.color}66` }}>
                  ▶ Başla
                </button>
              )}
              {phase === "work" && (
                <>
                  <button className="action-btn" onClick={reset} style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>
                    ✕ İptal
                  </button>
                  <button className="action-btn" onClick={completeWork} style={{ background: "#10b981", color: "white" }}>
                    ✓ Tamamla
                  </button>
                </>
              )}
              {phase === "rest" && (
                <>
                  <button className="action-btn" onClick={reset} style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>
                    Atla
                  </button>
                  <button className="action-btn" onClick={startWork} style={{ background: mode.color, color: "white" }}>
                    ▶ Yeni Ders
                  </button>
                </>
              )}
            </div>

            {todaySessions.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "14px 28px", textAlign: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: ".85rem" }}>Bugün: </span>
                <span style={{ color: "white", fontWeight: 700 }}>{todaySessions.length} oturum · {todayMin} dakika</span>
              </div>
            )}
          </div>
        )}

        {/* ── KÜTÜPHANe ── */}
        {tab === "library" && (
          <div className="fade-in">
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <h2 style={{ color: "white", fontSize: "1.4rem", fontWeight: 800, margin: "0 0 8px" }}>📚 Sanal Kütüphanem</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".85rem", margin: 0 }}>
                Fare ile üzerine gel — kaç dakika çalıştığını gör!
              </p>
              {/* Açıklama */}
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
                {[{ d: 25, label: "Klasik 📖" }, { d: 50, label: "Derin Odak 📗" }, { d: 90, label: "Maraton 📕" }].map(item => (
                  <div key={item.d} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: ".78rem" }}>
                    <div style={{ width: item.d === 25 ? 10 : item.d === 50 ? 14 : 18, height: item.d === 25 ? 20 : item.d === 50 ? 26 : 32, background: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 20, padding: 28 }}>
                <div style={{ color: "#93c5fd", fontSize: ".8rem", fontWeight: 700, letterSpacing: ".05em", marginBottom: 12 }}>BUGÜN</div>
                <div style={{ color: "white", fontSize: "2.5rem", fontWeight: 800 }}>{todaySessions.length}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".85rem", marginTop: 4 }}>oturum · {todayMin} dakika</div>
                <div style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {todaySessions.map((s, i) => (
                    <div key={i} style={{ background: s.plannedDuration === 90 ? "#065f46" : s.plannedDuration === 50 ? "#c2410c" : "#1e3a8a", borderRadius: 8, padding: "4px 10px", fontSize: ".75rem", color: "white", fontWeight: 600 }}>
                      {s.actualDuration}dk
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 20, padding: 28 }}>
                <div style={{ color: "#fdba74", fontSize: ".8rem", fontWeight: 700, letterSpacing: ".05em", marginBottom: 12 }}>BU HAFTA</div>
                <div style={{ color: "white", fontSize: "2.5rem", fontWeight: 800 }}>{weekSessions.length}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".85rem", marginTop: 4 }}>oturum · {weekMin} dakika</div>
                <div style={{ marginTop: 16, display: "flex", alignItems: "flex-end", gap: 6, height: 48 }}>
                  {["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map((day, i) => {
                    const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1 + i);
                    const ds = d.toISOString().slice(0, 10);
                    const mins = sessions.filter(s => s.date === ds).reduce((a, s) => a + s.actualDuration, 0);
                    const maxMins = Math.max(...["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map((_, j) => {
                      const dd = new Date(); dd.setDate(dd.getDate() - dd.getDay() + 1 + j);
                      return sessions.filter(s => s.date === dd.toISOString().slice(0,10)).reduce((a, s) => a + s.actualDuration, 0);
                    }), 1);
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: "100%", background: mins > 0 ? "#f97316" : "rgba(255,255,255,0.1)", borderRadius: 4, height: Math.max((mins / maxMins) * 36, mins > 0 ? 6 : 4), transition: "height 0.3s" }} />
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".65rem" }}>{day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 28 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: ".8rem", fontWeight: 700, letterSpacing: ".05em", marginBottom: 20 }}>TÜM ZAMANLAR</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {[
                  { label: "Toplam Oturum", val: sessions.length },
                  { label: "Çalışılan Dakika", val: sessions.reduce((a, s) => a + s.actualDuration, 0) },
                  { label: "Toplam Saat", val: Math.floor(sessions.reduce((a, s) => a + s.actualDuration, 0) / 60) },
                  { label: "Klasik (25dk)", val: sessions.filter(s => s.plannedDuration === 25).length },
                  { label: "Derin Odak (50dk)", val: sessions.filter(s => s.plannedDuration === 50).length },
                  { label: "Maraton (90dk)", val: sessions.filter(s => s.plannedDuration === 90).length },
                  { label: "Aktif Gün", val: new Set(sessions.map(s => s.date)).size },
                  { label: "En Uzun Gün (dk)", val: Math.max(0, ...Array.from(new Set(sessions.map(s => s.date))).map(d => sessions.filter(s => s.date === d).reduce((a, s) => a + s.actualDuration, 0))) },
                  { label: "Ort. Oturum/Gün", val: new Set(sessions.map(s => s.date)).size ? Math.round(sessions.length / new Set(sessions.map(s => s.date)).size * 10) / 10 : 0 },
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
    </main>
  );
}