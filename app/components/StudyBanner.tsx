"use client";

// components/StudyBanner.tsx
//
// KULLANIM — pomodoro/page.tsx içinde:
//   import StudyBanner from "../../components/StudyBanner";
//   <StudyBanner isActive={isRunning} />

import { useEffect, useRef, useState } from "react";

interface Props {
  isActive: boolean;
}

// ── Saate göre gerçekçi aktif kullanıcı aralıkları ──────────────────
const HOUR_RANGES: [number, number][] = [
  [12,25],[12,25],[12,25],[12,25],[12,25],[12,25], // 00-05
  [30,55],[40,70],[55,85],                          // 06-08
  [80,120],[90,130],[85,130],                       // 09-11
  [95,145],[100,155],[95,150],                      // 12-14
  [90,140],[100,150],[110,160],                     // 15-17
  [120,170],[130,180],[125,175],                    // 18-20
  [110,160],[90,140],[70,110],                      // 21-23
];

function getBaseCount(): number {
  const [min, max] = HOUR_RANGES[new Date().getHours()];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nudge(current: number, delta: number, min: number, max: number): number {
  const step = Math.floor(Math.random() * (delta * 2 + 1)) - delta;
  return Math.min(max, Math.max(min, current + step));
}

// ── localStorage: bugünkü oturum sayısı ─────────────────────────────
const LS_KEY_COUNT = "sb_today_count";
const LS_KEY_DATE  = "sb_today_date";
const LS_KEY_JOINED = "sb_joined_today"; // bugün zaten join ettik mi?

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "2025-03-08"
}

function getTodayCount(): number {
  try {
    const saved = localStorage.getItem(LS_KEY_DATE);
    if (saved !== todayStr()) return 0; // yeni gün → sıfır
    return parseInt(localStorage.getItem(LS_KEY_COUNT) ?? "0", 10) || 0;
  } catch { return 0; }
}

// Sayfa yüklendiğinde veya timer başlatılınca çağrılır
// Aynı gün içinde birden fazla kez artmaması için LS_KEY_JOINED kontrolü
function incrementTodayCount(): number {
  try {
    const today = todayStr();
    // Gün değiştiyse sıfırla
    if (localStorage.getItem(LS_KEY_DATE) !== today) {
      localStorage.setItem(LS_KEY_DATE, today);
      localStorage.setItem(LS_KEY_COUNT, "0");
      localStorage.removeItem(LS_KEY_JOINED);
    }
    // Bu tarayıcı bugün zaten saydıysa artırma
    if (localStorage.getItem(LS_KEY_JOINED) === "1") {
      return getTodayCount();
    }
    const next = getTodayCount() + 1;
    localStorage.setItem(LS_KEY_COUNT, String(next));
    localStorage.setItem(LS_KEY_JOINED, "1");
    return next;
  } catch { return getTodayCount(); }
}

// ── Component ────────────────────────────────────────────────────────
export default function StudyBanner({ isActive }: Props) {
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [todayCount, setTodayCount]   = useState(0);
  const [flash, setFlash]             = useState(false);
  const timerRef                      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseRef                       = useRef<[number, number]>([80, 160]);
  const countedRef                    = useRef(false); // bu oturumda sayıldık mı?

  // İlk mount
  useEffect(() => {
    const [min, max] = HOUR_RANGES[new Date().getHours()];
    baseRef.current = [min, max];
    setActiveCount(getBaseCount());

    // localStorage'dan bugünkü sayıyı al (artırma, sadece oku)
    setTodayCount(getTodayCount());
  }, []);

  // Timer başlayınca bugün sayacını artır (sadece bir kez)
  useEffect(() => {
    if (isActive && !countedRef.current) {
      countedRef.current = true;
      const newCount = incrementTodayCount();
      setTodayCount(newCount);
    }
  }, [isActive]);

  // Aktif kullanıcı sayısını periyodik güncelle
  useEffect(() => {
    if (activeCount === null) return;

    const scheduleNext = () => {
      const delay = isActive
        ? 15_000 + Math.random() * 15_000
        : 45_000 + Math.random() * 45_000;

      timerRef.current = setTimeout(() => {
        setActiveCount(prev => {
          if (prev === null) return prev;
          const [min, max] = baseRef.current;
          const next = nudge(prev, 3, min, max);
          if (next !== prev) setFlash(true);
          return next;
        });
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isActive, activeCount === null]);

  // Flash animasyonu
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(t);
  }, [flash]);

  if (activeCount === null) return null;

  const bg     = isActive ? "rgba(16,185,129,0.08)" : "rgba(59,130,246,0.06)";
  const border = isActive ? "rgba(16,185,129,0.25)" : "rgba(59,130,246,0.18)";
  const dot    = isActive ? "#10b981" : "#3b82f6";
  const textClr = isActive ? "#065f46" : "#1e3a8a";
  const todayClr = isActive ? "#059669" : "#2563eb";

  return (
    <div style={{
      borderRadius: 14,
      background: bg,
      border: `1.5px solid ${border}`,
      overflow: "hidden",
      transition: "background 0.4s, border-color 0.4s",
    }}>
      <style>{`
        @keyframes ping {
          0%   { transform:scale(1);   opacity:.75; }
          70%  { transform:scale(2.2); opacity:0;   }
          100% { transform:scale(2.2); opacity:0;   }
        }
        @keyframes countPop {
          0%   { transform:scale(1);    }
          40%  { transform:scale(1.15); }
          100% { transform:scale(1);    }
        }
        .sb-ping { animation: ping 1.8s ease-in-out infinite; }
        .sb-pop  { animation: countPop .4s ease; }
      `}</style>

      {/* Üst satır: anlık aktif kullanıcı */}
      <div style={{
        display:"flex", alignItems:"center", gap:10,
        padding:"11px 16px",
        borderBottom: `1px solid ${border}`,
      }}>
        {/* Canlı nokta */}
        <span style={{ position:"relative", display:"inline-flex", width:10, height:10, flexShrink:0 }}>
          <span className="sb-ping" style={{
            position:"absolute", inset:0, borderRadius:"50%",
            background: dot, opacity:.5,
          }}/>
          <span style={{
            position:"relative", width:10, height:10,
            borderRadius:"50%", background: dot, display:"inline-block",
          }}/>
        </span>

        <span
          key={activeCount}
          className="sb-pop"
          style={{ fontSize:"0.82rem", fontWeight:600, color: textClr, lineHeight:1.4 }}
        >
          {isActive
            ? `Şu an ${activeCount} öğrenci seninle birlikte çalışıyor! 🔥`
            : `Şu an ${activeCount} öğrenci ders çalışıyor — sen de katıl! 📚`}
        </span>
      </div>

      {/* Alt satır: bugünkü toplam */}
      <div style={{
        display:"flex", alignItems:"center", gap:8,
        padding:"8px 16px",
      }}>
        <span style={{ fontSize:"1rem", lineHeight:1 }}>📅</span>
        <span style={{ fontSize:"0.78rem", color:"#6b7280", fontWeight:500 }}>
          Bugün{" "}
          <strong style={{ color: todayClr, fontWeight:700 }}>
            {todayCount > 0 ? todayCount : "—"}
          </strong>
          {todayCount > 0 && " öğrenci bu kütüphanede ders çalıştı"}
          {todayCount === 0 && " henüz kimse başlamamış — ilk sen ol!"}
        </span>
      </div>
    </div>
  );
}