"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Tipler ──────────────────────────────────────────────────────────────────
interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  duration: number; // dakika (25 veya 50)
  completedAt: string; // ISO string
}

interface StorageResult {
  value: string;
}

declare global {
  interface Window {
    storage?: {
      get: (key: string) => Promise<StorageResult | null>;
      set: (key: string, value: string) => Promise<StorageResult | null>;
    };
  }
}

// ─── Sabitler ────────────────────────────────────────────────────────────────
const MODES = [
  { label: "Klasik", work: 25, rest: 5, color: "#1e3a8a", light: "#eff6ff", accent: "#3b82f6" },
  { label: "Derin Odak", work: 50, rest: 10, color: "#c2410c", light: "#fff7ed", accent: "#f97316" },
  { label: "Maraton", work: 90, rest: 20, color: "#065f46", light: "#ecfdf5", accent: "#10b981" },
];

// ─── Yardımcılar ─────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function weekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().slice(0, 10);
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Kitap Bileşeni ──────────────────────────────────────────────────────────
function Book({ session, index }: { session: Session; index: number }) {
  const is50 = session.duration === 50;
  const height = is50 ? 88 : 64;
  const width = is50 ? 22 : 16;
  const colors = [
    ["#1e3a8a", "#2d4fa0"], ["#c2410c", "#d4510f"], ["#065f46", "#0a7a5c"],
    ["#4c1d95", "#6b2cb5"], ["#7c2d12", "#9a3a18"], ["#1e40af", "#2563eb"],
  ];
  const [bg, spine] = colors[index % colors.length];

  return (
    <div title={`${session.duration} dk · ${session.date}`} style={{
      width, height, position: "relative", cursor: "default",
      transition: "transform 0.2s",
      transformOrigin: "bottom center",
    }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
    >
      {/* Kitap gövdesi */}
      <div style={{
        position: "absolute", inset: 0, background: bg,
        borderRadius: "2px 4px 4px 2px",
        boxShadow: "inset -3px 0 6px rgba(0,0,0,0.2), 2px 2px 8px rgba(0,0,0,0.3)",
      }} />
      {/* Sırt */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 5,
        background: spine, borderRadius: "2px 0 0 2px",
      }} />
      {/* Süre rozeti */}
      <div style={{
        position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)",
        fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.7)",
        whiteSpace: "nowrap",
      }}>
        {session.duration}dk
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
  const mode = MODES[modeIdx];

  // ─── Storage yükleme ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage?.get("pomodoro:sessions");
        if (res?.value) setSessions(JSON.parse(res.value));
      } catch { /* ilk kullanım */ }
      setLoaded(true);
    })();
  }, []);

  const saveSessions = useCallback(async (list: Session[]) => {
    try {
      await window.storage?.set("pomodoro:sessions", JSON.stringify(list));
    } catch { /* storage yok */ }
  }, []);

  // ─── Timer mantığı ────────────────────────────────────────────────────────
  const startWork = useCallback(() => {
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

  useEffect(() => {
    if (phase === "idle") { if (intervalRef.current) clearInterval(intervalRef.current); return; }

    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          if (phase === "work") {
            // Oturum kaydet
            const newSession: Session = {
              id: Date.now().toString(),
              date: todayStr(),
              duration: mode.work,
              completedAt: new Date().toISOString(),
            };
            setSessions(prev => {
              const updated = [...prev, newSession];
              saveSessions(updated);
              return updated;
            });
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
  }, [phase, mode.work, mode.rest, saveSessions]);

  // ─── Rapor hesaplama ──────────────────────────────────────────────────────
  const today = todayStr();
  const wStart = weekStart();
  const todaySessions = sessions.filter(s => s.date === today);
  const weekSessions = sessions.filter(s => s.date >= wStart);
  const todayMin = todaySessions.reduce((a, s) => a + s.duration, 0);
  const weekMin = weekSessions.reduce((a, s) => a + s.duration, 0);

  // ─── Progress ─────────────────────────────────────────────────────────────
  const totalSec = phase === "work" ? mode.work * 60 : phase === "rest" ? mode.rest * 60 : 1;
  const progress = phase === "idle" ? 0 : ((totalSec - seconds) / totalSec) * 100;
  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference - (progress / 100) * circumference;

  if (!loaded) return (
    <main style={{ minHeight: "100vh", background: "#0f1f4f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "white", fontSize: "1.2rem" }}>Yükleniyor...</div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a1628 0%, #0f1f4f 50%, #1a0a2e 100%)", fontFamily: "system-ui, sans-serif" }}>

      <style>{`
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.08);opacity:1} }
        @keyframes fade-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fade-in 0.4s ease forwards; }
        .tab-btn { border:none;cursor:pointer;transition:all 0.2s;font-weight:600;border-radius:10px;padding:10px 22px;font-size:.9rem; }
        .tab-btn:hover { filter: brightness(1.1); }
        .mode-btn { border:2px solid;cursor:pointer;transition:all 0.25s;border-radius:14px;padding:14px 24px;text-align:center; }
        .mode-btn:hover { transform:translateY(-2px); }
        .action-btn { border:none;cursor:pointer;transition:all 0.2s;border-radius:14px;font-weight:700;font-size:1.1rem;padding:16px 40px; }
        .action-btn:hover { filter:brightness(1.1);transform:translateY(-1px); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "32px 24px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>⏱ Pomodoro</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".85rem", margin: "4px 0 0" }}>Sanal Kütüphane · Öğrenci Koçu Adana</p>
          </div>
          <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 4 }}>
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

        {/* ── TIMER TAB ── */}
        {tab === "timer" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>

            {/* Mod seçimi */}
            <div style={{ display: "flex", gap: 16, width: "100%", maxWidth: 500 }}>
              {MODES.map((m, i) => (
                <button key={i} className="mode-btn" onClick={() => { setModeIdx(i); reset(); }} style={{
                  flex: 1,
                  background: modeIdx === i ? m.light : "rgba(255,255,255,0.05)",
                  borderColor: modeIdx === i ? m.color : "rgba(255,255,255,0.1)",
                  color: modeIdx === i ? m.color : "rgba(255,255,255,0.7)",
                }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem" }}>{m.label}</div>
                  <div style={{ fontSize: ".8rem", opacity: .8, marginTop: 4 }}>{m.work}dk ders · {m.rest}dk mola</div>
                </button>
              ))}
            </div>

            {/* Timer Dairesi */}
            <div style={{ position: "relative", width: 240, height: 240 }}>
              {phase === "work" && (
                <div style={{
                  position: "absolute", inset: -16, borderRadius: "50%",
                  background: `radial-gradient(circle, ${mode.accent}22 0%, transparent 70%)`,
                  animation: "pulse-ring 2s ease-in-out infinite",
                }} />
              )}
              <svg width="240" height="240" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                <circle cx="120" cy="120" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle cx="120" cy="120" r="90" fill="none"
                  stroke={phase === "rest" ? "#10b981" : mode.accent}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ fontSize: "3rem", fontWeight: 800, color: "white", fontVariantNumeric: "tabular-nums", letterSpacing: "-2px" }}>
                  {phase === "idle" ? fmtTime(mode.work * 60) : fmtTime(seconds)}
                </div>
                <div style={{ fontSize: ".85rem", color: "rgba(255,255,255,0.5)", marginTop: 6, fontWeight: 600 }}>
                  {phase === "idle" ? "Başlamaya hazır" : phase === "work" ? "🔥 Odak zamanı" : "☕ Mola"}
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div style={{ display: "flex", gap: 12 }}>
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
                  <button className="action-btn" onClick={() => {
                    const s: Session = { id: Date.now().toString(), date: todayStr(), duration: mode.work, completedAt: new Date().toISOString() };
                    setSessions(prev => { const u = [...prev, s]; saveSessions(u); return u; });
                    startRest();
                  }} style={{ background: "#10b981", color: "white" }}>
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

            {/* Bugünkü özet */}
            {todaySessions.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "16px 28px", textAlign: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: ".85rem" }}>Bugün: </span>
                <span style={{ color: "white", fontWeight: 700 }}>{todaySessions.length} oturum · {todayMin} dakika</span>
              </div>
            )}
          </div>
        )}

        {/* ── KÜTÜPHANe TAB ── */}
        {tab === "library" && (
          <div className="fade-in">
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <h2 style={{ color: "white", fontSize: "1.4rem", fontWeight: 800, margin: "0 0 8px" }}>📚 Sanal Kütüphanem</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: ".9rem", margin: 0 }}>
                Her tamamlanan oturum bir kitap ekler. Uzun dersler daha kalın ve uzun!
              </p>
            </div>

            {sessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)" }}>
                <div style={{ fontSize: "4rem", marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>Henüz kitap yok</div>
                <div style={{ fontSize: ".85rem", marginTop: 8 }}>İlk oturumunu tamamla, kütüphaneni doldur!</div>
              </div>
            ) : (
              <>
                {/* Raf */}
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "32px 32px 0", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {/* Kitaplar */}
                  <div style={{ display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: 4, minHeight: 100, paddingBottom: 12 }}>
                    {sessions.map((s, i) => <Book key={s.id} session={s} index={i} />)}
                  </div>
                  {/* Raf tahtası */}
                  <div style={{ height: 10, background: "linear-gradient(90deg, #8b6914, #c8941a, #8b6914)", borderRadius: "0 0 4px 4px", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }} />
                </div>

                <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 20px", textAlign: "center" }}>
                    <div style={{ color: "white", fontSize: "1.8rem", fontWeight: 800 }}>{sessions.length}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".8rem", marginTop: 4 }}>Toplam Kitap</div>
                  </div>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 20px", textAlign: "center" }}>
                    <div style={{ color: "white", fontSize: "1.8rem", fontWeight: 800 }}>{sessions.reduce((a, s) => a + s.duration, 0)}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".8rem", marginTop: 4 }}>Toplam Dakika</div>
                  </div>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 20px", textAlign: "center" }}>
                    <div style={{ color: "white", fontSize: "1.8rem", fontWeight: 800 }}>{Math.floor(sessions.reduce((a, s) => a + s.duration, 0) / 60)}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".8rem", marginTop: 4 }}>Toplam Saat</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── RAPOR TAB ── */}
        {tab === "report" && (
          <div className="fade-in">
            <h2 style={{ color: "white", fontSize: "1.4rem", fontWeight: 800, margin: "0 0 28px", textAlign: "center" }}>📊 Raporlar</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              {/* Bugün */}
              <div style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 20, padding: 28 }}>
                <div style={{ color: "#93c5fd", fontSize: ".8rem", fontWeight: 700, letterSpacing: ".05em", marginBottom: 16 }}>BUGÜN</div>
                <div style={{ color: "white", fontSize: "2.5rem", fontWeight: 800 }}>{todaySessions.length}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".85rem", marginTop: 4 }}>oturum · {todayMin} dakika</div>
                <div style={{ marginTop: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {todaySessions.map((s, i) => (
                    <div key={i} style={{ background: s.duration === 50 ? "#c2410c" : "#1e3a8a", borderRadius: 8, padding: "4px 10px", fontSize: ".75rem", color: "white", fontWeight: 600 }}>
                      {s.duration}dk
                    </div>
                  ))}
                </div>
              </div>

              {/* Bu hafta */}
              <div style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 20, padding: 28 }}>
                <div style={{ color: "#fdba74", fontSize: ".8rem", fontWeight: 700, letterSpacing: ".05em", marginBottom: 16 }}>BU HAFTA</div>
                <div style={{ color: "white", fontSize: "2.5rem", fontWeight: 800 }}>{weekSessions.length}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".85rem", marginTop: 4 }}>oturum · {weekMin} dakika</div>
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 48 }}>
                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - d.getDay() + 1 + i);
                      const ds = d.toISOString().slice(0, 10);
                      const count = sessions.filter(s => s.date === ds).length;
                      const maxH = Math.max(...["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map((_, j) => {
                        const dd = new Date(); dd.setDate(dd.getDate() - dd.getDay() + 1 + j);
                        return sessions.filter(s => s.date === dd.toISOString().slice(0,10)).length;
                      }), 1);
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ width: "100%", background: count > 0 ? "#f97316" : "rgba(255,255,255,0.1)", borderRadius: 4, height: Math.max((count / maxH) * 36, count > 0 ? 6 : 4), transition: "height 0.3s" }} />
                          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: ".65rem" }}>{day}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Tüm zamanlar */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 28 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: ".8rem", fontWeight: 700, letterSpacing: ".05em", marginBottom: 20 }}>TÜM ZAMANLAR</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {[
                  { label: "Toplam Oturum", val: sessions.length },
                  { label: "Toplam Dakika", val: sessions.reduce((a, s) => a + s.duration, 0) },
                  { label: "Toplam Saat", val: Math.floor(sessions.reduce((a, s) => a + s.duration, 0) / 60) },
                  { label: "Klasik (25dk)", val: sessions.filter(s => s.duration === 25).length },
                  { label: "Derin Odak (50dk)", val: sessions.filter(s => s.duration === 50).length },
                  { label: "Maraton (90dk)", val: sessions.filter(s => s.duration === 90).length },
                  { label: "Aktif Gün", val: new Set(sessions.map(s => s.date)).size },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ color: "white", fontSize: "1.6rem", fontWeight: 800 }}>{item.val}</div>
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