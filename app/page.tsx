"use client";

import { useState, CSSProperties, ReactNode } from "react";

// ─── Tip tanımları ──────────────────────────────────────────────────────────
interface IconProps {
  className?: string;
  style?: CSSProperties;
  filled?: boolean;
}

interface PricingCardProps {
  badge: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  features: string[];
  checkColor: string;
}

// ─── SVG Icon Components ────────────────────────────────────────────────────
const IconCalendar = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M8 2v4M16 2v4" /><rect height="18" rx="2" width="18" x="3" y="4" /><path d="M3 10h18" />
  </svg>
);
const IconArrowRight = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
);
const IconTrendingDown = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" />
  </svg>
);
const IconTrendingUp = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconBrain = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375M6.003 5.125A3 3 0 0 0 6.401 6.5M3.477 10.896a4 4 0 0 1 .585-.396M19.938 10.5a4 4 0 0 1 .585.396M6 18a4 4 0 0 1-1.967-.516M19.967 17.484A4 4 0 0 1 18 18" />
  </svg>
);
const IconAlertCircle = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);
const IconSmartphone = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect height="20" rx="2" ry="2" width="14" x="5" y="2" /><path d="M12 18h.01" />
  </svg>
);
const IconTarget = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const IconBarChart = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />
  </svg>
);
const IconFileText = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" />
  </svg>
);
const IconCheckCircle = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const IconCheck = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconUsers = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconClock = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconLightbulb = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4" />
  </svg>
);
const IconSparkles = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4M19 17v4M3 5h4M17 19h4" />
  </svg>
);
const IconStar = ({ className = "w-5 h-5", style, filled = false }: IconProps) => (
  <svg className={className} style={style} fill={filled ? "white" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconCrown = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);
const IconMessageCircle = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);
const IconClipboardCheck = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect height="4" rx="1" ry="1" width="8" x="8" y="2" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);
const IconSettings = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconFileCheck = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m9 15 2 2 4-4" />
  </svg>
);
const IconHeart = ({ className = "w-5 h-5", style, filled = false }: IconProps) => (
  <svg className={className} style={style} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);
const IconBookOpen = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const IconPhone = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconMail = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect height="16" rx="2" width="20" x="2" y="4" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const IconMapPin = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconUser = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconBook = ({ className = "w-6 h-6", style }: IconProps) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

// ─── Pricing Card ───────────────────────────────────────────────────────────
function PricingCard({ badge, icon, iconBg, title, features, checkColor }: PricingCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: 16,
        padding: 32,
        border: "2px solid #e5e7eb",
        position: "relative",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{
        position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
        background: "#f3f4f6", border: "1px solid #d1d5db",
        borderRadius: 9999, padding: "4px 14px",
      }}>
        <span style={{ color: "#4b5563", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.05em" }}>{badge}</span>
      </div>
      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64, background: iconBg, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          {icon}
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>{title}</h3>
      </div>
      {features.map((f, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
          <IconCheck style={{ color: checkColor, flexShrink: 0, marginTop: 2, width: 18, height: 18 }} />
          <span style={{ fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.5 }}>{f}</span>
        </div>
      ))}
      <button style={{
        width: "100%", padding: "12px 24px", background: "#1e3a8a", color: "white",
        border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer",
        marginTop: 16, transition: "all 0.3s", fontSize: "0.95rem",
      }}>
        Ön Görüşme İste
      </button>
    </div>
  );
}

// ─── Ana Bileşen ────────────────────────────────────────────────────────────
export default function OgrenciKocuAdana() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; }
        .display { font-family: 'Playfair Display', serif; }
        .dot-bg {
          background-image: radial-gradient(#1e3a8a 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
        .btn-main:hover { background: #1e40af !important; }
        .btn-outline:hover { background: #fff7ed !important; border-color: #fb923c !important; }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .ping { animation: ping 1.5s ease-in-out infinite; }
        @media (max-width: 768px) {
          .grid-cols-3 { grid-template-columns: 1fr !important; }
          .grid-cols-2 { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .timeline-grid { grid-template-columns: 1fr !important; }
          .timeline-center { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-h1 { font-size: 2rem !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "white" }}>

        {/* ══════════════════════ HERO ══════════════════════ */}
        <section style={{
          background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 55%, #fff7ed 100%)",
          padding: "120px 16px 100px",
          position: "relative", overflow: "hidden",
        }}>
          <div className="dot-bg" style={{ position: "absolute", inset: 0, opacity: 0.04 }} />
          <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <div style={{
              display: "inline-block", marginBottom: 24,
              padding: "8px 20px", background: "#ffedd5", borderRadius: 9999,
            }}>
              <span style={{ color: "#9a3412", fontWeight: 600, fontSize: "0.875rem", letterSpacing: "0.05em" }}>
                LGS &amp; YKS Öğrencileri İçin Özel
              </span>
            </div>

            <h1 className="display hero-h1" style={{
              fontSize: "clamp(2rem, 5vw, 3.75rem)",
              fontWeight: 800, color: "#0f1f4f",
              lineHeight: 1.2, marginBottom: 24, maxWidth: 900, margin: "0 auto 24px", textAlign: "center",
            }}>
              Sınava Hazırlıkta{" "} <br />
              <span style={{ color: "#1d4ed8" }}>Disiplin</span> +{" "}
              <span style={{ color: "#1d4ed8" }}>Takip</span>  <br />
              +{" "}
              <span style={{ color: "#c2410c" }}>Psikolojik Dayanıklılık</span>{" "} <br />
              ={" "}
              <span style={{
                background: "linear-gradient(90deg, #2563eb, #1e3a8a)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Gerçek Performans
              </span>
            </h1>

            <p style={{
              fontSize: "1.1rem", color: "#4b5563", lineHeight: 1.7,
              maxWidth: 680, margin: "0 auto 40px",
            }}>
              LGS ve YKS öğrencileri için yapılandırılmış{" "} <br />
              <strong style={{ color: "#0f1f4f" }}>Akademik Performans ve Psikolojik Dayanıklılık Modeli</strong>
            </p>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-main" style={{
                background: "#1e3a8a", color: "white", border: "none",
                padding: "14px 32px", borderRadius: 8, fontWeight: 600,
                fontSize: "1.05rem", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 14px rgba(30,58,138,0.3)", transition: "all 0.3s",
              }}>
                <IconCalendar style={{ width: 20, height: 20 }} />
                Ücretsiz Ön Görüşme Planla
                <IconArrowRight style={{ width: 20, height: 20 }} />
              </button>
              <a href="#sistemimiz" className="btn-outline" style={{
                background: "white", color: "#1e3a8a",
                border: "2px solid #bfdbfe", padding: "14px 32px",
                borderRadius: 8, fontWeight: 600, fontSize: "1.05rem",
                display: "inline-flex", alignItems: "center", gap: 8,
                textDecoration: "none", transition: "all 0.3s",
              }}>
                Modeli İncele
                <IconArrowRight style={{ width: 20, height: 20 }} />
              </a>
            </div>

            <div className="stats-grid" style={{
              marginTop: 64, display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)", gap: 32,
              maxWidth: 720, margin: "64px auto 0",
            }}>
              {[
                { val: "7-8",  label: "Sınıf LGS",           color: "#1e3a8a" },
                { val: "11-12", label: "Sınıf YKS",           color: "#1e3a8a" },
                { val: "30", label: "Öğrenci Kapasitesi",  color: "#c2410c" },
                { val: "1:1",  label: "Bireysel Takip",       color: "#c2410c" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.val}</div>
                  <div style={{ fontSize: "0.85rem", color: "#4b5563" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ SORUNLAR ══════════════════════ */}
        <section style={{ padding: "80px 16px", background: "white" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <h2 className="display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>
                Tanıdık Geliyor mu?
              </h2>
              <p style={{ fontSize: "1.15rem", color: "#4b5563", maxWidth: 640, margin: "0 auto" }}>
                Birçok öğrenci ve veli bu sorunlarla karşılaşıyor
              </p>
            </div>

            <div className="grid-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 32, marginBottom: 32 }}>
              {/* Veliler */}
              <div className="card-hover" style={{ background: "#eff6ff", borderRadius: 16, padding: 32, border: "2px solid #bfdbfe" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, background: "#1e3a8a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconUser style={{ width: 24, height: 24, color: "white" }} />
                  </div>
                  <h3 className="display" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>Velilerden Duyuyoruz</h3>
                </div>
                {[
                  { Icon: IconTrendingDown, text: "Çalışıyor ama verimsiz geçiyor" },
                  { Icon: IconBrain,        text: "Denemede netleri artmıyor" },
                  { Icon: IconAlertCircle, text: "Kaygı ve telefon dikkatini bölüyor" },
                  { Icon: IconTrendingDown, text: "Programlı çalışmıyor" },
                ].map(({ Icon, text }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                    <div style={{ padding: 8, background: "white", borderRadius: 8, flexShrink: 0 }}>
                      <Icon style={{ width: 20, height: 20, color: "#1d4ed8" }} />
                    </div>
                    <p style={{ color: "#374151", lineHeight: 1.6, margin: 0 }}>{text}</p>
                  </div>
                ))}
              </div>

              {/* Öğrenciler */}
              <div className="card-hover" style={{ background: "#fff7ed", borderRadius: 16, padding: 32, border: "2px solid #fed7aa" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, background: "#c2410c", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconBook style={{ width: 24, height: 24, color: "white" }} />
                  </div>
                  <h3 className="display" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>Öğrencilerden Duyuyoruz</h3>
                </div>
                {[
                  { Icon: IconAlertCircle, text: "Nereden başlayacağımı bilmiyorum" },
                  { Icon: IconTrendingDown, text: "Motivasyonum dalgalı" },
                  { Icon: IconBrain,        text: "Netlerim bir türlü artmıyor" },
                  { Icon: IconSmartphone,  text: "Denemede bildiğimi yapamıyorum" },
                ].map(({ Icon, text }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                    <div style={{ padding: 8, background: "white", borderRadius: 8, flexShrink: 0 }}>
                      <Icon style={{ width: 20, height: 20, color: "#c2410c" }} />
                    </div>
                    <p style={{ color: "#374151", lineHeight: 1.6, margin: 0 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "linear-gradient(90deg, #1e3a8a, #1e40af)",
              borderRadius: 16, padding: "28px 32px", textAlign: "center",
              boxShadow: "0 8px 32px rgba(30,58,138,0.3)",
            }}>
              <p style={{ fontSize: "1.2rem", color: "white", fontWeight: 600, margin: 0 }}>
                Sorun bilgi eksikliği değil,{" "}
                <span style={{ color: "#fdba74", fontWeight: 800 }}>sistem ve psikolojik dayanıklılık eksikliği.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════ MODEL ══════════════════════ */}
        <section id="sistemimiz" style={{ padding: "80px 16px", background: "linear-gradient(135deg, #f8faff, #eff6ff)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ display: "inline-block", marginBottom: 16, padding: "8px 20px", background: "#dbeafe", borderRadius: 9999 }}>
                <span style={{ color: "#1e40af", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.05em" }}>SİSTEMLİ YAKLAŞIM</span>
              </div>
              <h2 className="display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>
                Akademik Performans ve<br />Psikolojik Dayanıklılık Modeli
              </h2>
              <p style={{ fontSize: "1.1rem", color: "#4b5563", maxWidth: 680, margin: "0 auto" }}>
                Üç temel sütun üzerinde yapılandırılmış, ölçülebilir ve sürdürülebilir bir sistem
              </p>
            </div>

            <div className="grid-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32 }}>
              {[
                {
                  iconBg: "#1e3a8a", cardBg: "#eff6ff", border: "#bfdbfe",
                  titleColor: "#1e3a8a", itemColor: "#2563eb",
                  icon: <IconTarget style={{ width: 32, height: 32, color: "white" }} />,
                  title: "Bireysel Performans Koçluğu",
                  items: [
                    { icon: <IconCalendar style={{ width: 20, height: 20 }} />,     text: "Haftalık bireysel görüşme" },
                    { icon: <IconFileText style={{ width: 20, height: 20 }} />,     text: "Öğrenciye özel planlama" },
                    { icon: <IconCheckCircle style={{ width: 20, height: 20 }} />,  text: "Kaynak takibi" },
                    { icon: <IconBarChart style={{ width: 20, height: 20 }} />,     text: "Deneme analiz sistemi" },
                  ],
                },
                {
                  iconBg: "#ea580c", cardBg: "#fff7ed", border: "#fed7aa",
                  titleColor: "#7c2d12", itemColor: "#ea580c",
                  icon: <IconBarChart style={{ width: 32, height: 32, color: "white" }} />,
                  title: "Sistemli Akademik Takip",
                  items: [
                    { icon: <IconFileText style={{ width: 20, height: 20 }} />,     text: "Aylık analiz sistemi" },
                    { icon: <IconTrendingUp style={{ width: 20, height: 20 }} />,   text: "Net artış odaklı değerlendirme" },
                    { icon: <IconUsers style={{ width: 20, height: 20 }} />,        text: "Aylık veli performans raporu" },
                    { icon: <IconCheckCircle style={{ width: 20, height: 20 }} />,  text: "Detaylı ilerleme takibi" },
                  ],
                },
                {
                  iconBg: "#1e3a8a", cardBg: "#eff6ff", border: "#bfdbfe",
                  titleColor: "#1e3a8a", itemColor: "#2563eb",
                  icon: <IconBrain style={{ width: 32, height: 32, color: "white" }} />,
                  title: "Psikolojik Dayanıklılık Eğitimi",
                  items: [
                    { icon: <IconClock style={{ width: 20, height: 20 }} />,       text: "Haftalık online seminer" },
                    { icon: <IconLightbulb style={{ width: 20, height: 20 }} />,   text: "Sınav kaygısı ve duygu yönetimi eğitimi" },
                    { icon: <IconBrain style={{ width: 20, height: 20 }} />,       text: "Zaman yönetimi ve verimli çalışma" },
                    { icon: <IconCheckCircle style={{ width: 20, height: 20 }} />, text: "Hızlı okuma eğitimi" },
                  ],
                },
              ].map((col, i) => (
                <div key={i} className="card-hover" style={{ background: col.cardBg, borderRadius: 16, padding: 32, border: `2px solid ${col.border}` }}>
                  <div style={{
                    width: 64, height: 64, background: col.iconBg, borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}>{col.icon}</div>
                  <h3 className="display" style={{ fontSize: "1.4rem", fontWeight: 700, color: col.titleColor, marginBottom: 20 }}>
                    {col.title}
                  </h3>
                  {col.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                      <span style={{ color: col.itemColor, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                      <p style={{ color: "#374151", lineHeight: 1.6, margin: 0 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 48, background: "white", borderRadius: 16, padding: 32,
              border: "2px solid #fed7aa", boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap",
            }}>
              <div style={{ width: 48, height: 48, background: "#ffedd5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconUsers style={{ width: 24, height: 24, color: "#c2410c" }} />
              </div>
              <p style={{ fontSize: "1.1rem", color: "#374151", margin: 0 }}>
                <strong style={{ color: "#1e3a8a" }}>Sınırlı Kontenjan:</strong> Kaliteyi korumak için en fazla{" "}
                <strong style={{ color: "#c2410c" }}>30 öğrenci</strong> ile çalışıyoruz.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════ PAKETLER ══════════════════════ */}
        <section id="paketler" style={{ padding: "80px 16px", background: "white" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ display: "inline-block", marginBottom: 16, padding: "8px 20px", background: "#ffedd5", borderRadius: 9999 }}>
                <span style={{ color: "#9a3412", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.05em" }}>PAKETLER</span>
              </div>
              <h2 className="display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>
                Size Uygun Paketi Seçin
              </h2>
              <p style={{ fontSize: "1.1rem", color: "#4b5563", maxWidth: 640, margin: "0 auto" }}>
                Her öğrencinin ihtiyacı farklıdır. Size en uygun desteği sunuyoruz.
              </p>
            </div>

            <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.12fr 1fr", gap: 24, marginBottom: 32, alignItems: "start" }}>
              <PricingCard
                badge="TEMEL"
                icon={<IconSparkles style={{ width: 32, height: 32, color: "#1d4ed8" }} />}
                iconBg="#dbeafe" iconColor="#1d4ed8"
                title="Akademik Performans Paketi"
                features={["Haftalık 30 dk bireysel koçluk görüşmesi", "Kişisel akademik planlama", "Kaynak ve ders takip sistemi", "Deneme analiz sistemi", "Aylık performans raporu"]}
                checkColor="#2563eb"
              />

              {/* Önerilen (featured) */}
              <div className="card-hover" style={{
                background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
                borderRadius: 16, padding: 32, border: "2px solid #fb923c",
                position: "relative", boxShadow: "0 8px 32px rgba(30,58,138,0.35)",
              }}>
                <div style={{
                  position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(90deg, #f97316, #ea580c)",
                  borderRadius: 9999, padding: "6px 20px",
                  boxShadow: "0 4px 12px rgba(249,115,22,0.4)",
                }}>
                  <span style={{ color: "white", fontWeight: 700, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <IconStar style={{ width: 16, height: 16 }} filled /> ÖNERİLEN
                  </span>
                </div>
                <div style={{ marginTop: 16, marginBottom: 24 }}>
                  <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <IconStar style={{ width: 32, height: 32, color: "#fdba74" }} />
                  </div>
                  <h3 className="display" style={{ fontSize: "1.3rem", fontWeight: 700, color: "white", margin: 0 }}>
                    Performans + Psikolojik Dayanıklılık
                  </h3>
                </div>
                {["Tüm Akademik Performans özellikleri", "Haftalık 30 dk canlı online seminer", "Zaman ve duygu yönetimi eğitimi", "Sınav kaygısı ve stres yönetimi", "Verimli ders çalışma teknikleri", "Hızlı okuma ve teknoloji bağımlılığı", "Seminer sonrası ödevlendirme", "Detaylı gelişim takibi"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                    <IconCheck style={{ width: 18, height: 18, color: "#fdba74", flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
                <button style={{
                  width: "100%", padding: "12px 24px", background: "white", color: "#1e3a8a",
                  border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer",
                  marginTop: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.2)", fontSize: "0.95rem",
                }}>
                  Ön Görüşme İste
                </button>
              </div>

              <PricingCard
                badge="SINIRLI"
                icon={<IconCrown style={{ width: 32, height: 32, color: "#1d4ed8" }} />}
                iconBg="#dbeafe" iconColor="#1d4ed8"
                title="VIP Performans Takip"
                features={["Tüm Performans + Psikolojik özellikler", "Haftalık 45 dk bireysel görüşme", "Öncelikli destek ve iletişim", "Haftalık detaylı ilerleme raporu", "Veli ile haftalık kısa bilgilendirme", "Özel kaynak önerileri", "Motivasyon ve hedef takip sistemi", "7/24 WhatsApp destek hattı"]}
                checkColor="#2563eb"
              />
            </div>

            <div style={{
              background: "linear-gradient(90deg, #ffedd5, #fff7ed)",
              borderRadius: 16, padding: 28, textAlign: "center", border: "2px solid #fed7aa",
            }}>
              <p style={{ fontSize: "1.1rem", color: "#1a1a1a", margin: 0 }}>
                <strong style={{ color: "#1e3a8a" }}>Sınırlı Kontenjan:</strong>{" "}
                Kaliteyi korumak için en fazla<strong style={{ color: "#c2410c" }}>30 öğrenci</strong> ile çalışıyoruz.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════ SÜREÇ ══════════════════════ */}
        <section style={{ padding: "80px 16px", background: "linear-gradient(135deg, #f0f4ff, #ffffff, #fff7ed)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ display: "inline-block", marginBottom: 16, padding: "8px 20px", background: "#dbeafe", borderRadius: 9999 }}>
                <span style={{ color: "#1e40af", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.05em" }}>SÜREÇ</span>
              </div>
              <h2 className="display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>
                Nasıl Çalışıyoruz?
              </h2>
              <p style={{ fontSize: "1.1rem", color: "#4b5563", maxWidth: 640, margin: "0 auto" }}>
                Sistematik ve şeffaf bir süreç ile başarıya ulaşıyoruz
              </p>
            </div>

            <div style={{ position: "relative" }}>
              <div className="timeline-center" style={{
                position: "absolute", left: "50%", top: 0, bottom: 0,
                width: 2, background: "linear-gradient(to bottom, #bfdbfe, #fed7aa, #bfdbfe)",
                transform: "translateX(-50%)", zIndex: 0,
              }} />

              {[
                { num: 1, icon: <IconMessageCircle style={{ width: 40, height: 40, color: "white" }} />,    title: "Ön Görüşme",                  desc: "Ücretsiz tanışma görüşmesi ile öğrencinin mevcut durumunu, hedeflerini ve ihtiyaçlarını değerlendiriyoruz.", right: false },
                { num: 2, icon: <IconClipboardCheck style={{ width: 40, height: 40, color: "white" }} />,   title: "Başlangıç Performans Analizi", desc: "Akademik düzey, çalışma alışkanlıkları ve psikolojik hazırlık detaylı olarak analiz edilir.", right: true },
                { num: 3, icon: <IconSettings style={{ width: 40, height: 40, color: "white" }} />,         title: "Kişisel Sistem Kurulumu",      desc: "Öğrenciye özel çalışma planı, kaynak yol haritası ve takip sistemi oluşturulur.", right: false },
                { num: 4, icon: <IconTarget style={{ width: 40, height: 40, color: "white" }} />,           title: "Haftalık Disiplinli Takip",    desc: "Bireysel görüşmeler, seminerler ve deneme analizleri ile sürekli gelişim sağlanır.", right: true },
                { num: 5, icon: <IconFileText style={{ width: 40, height: 40, color: "white" }} />,         title: "Aylık Raporlama",              desc: "Velilere detaylı performans raporu sunularak süreç şeffaf ve ölçülebilir tutulur.", right: false },
              ].map((step) => (
                <div key={step.num} className="timeline-grid" style={{
                  display: "grid", gridTemplateColumns: "1fr 80px 1fr",
                  alignItems: "center", gap: 32, marginBottom: 48, position: "relative", zIndex: 1,
                }}>
                  <div>
                    {!step.right && (
                      <div className="card-hover" style={{ background: "white", borderRadius: 16, padding: 28, border: "2px solid #bfdbfe", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                        <h3 className="display" style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f1f4f", marginBottom: 8 }}>{step.title}</h3>
                        <p style={{ color: "#4b5563", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                      </div>
                    )}
                  </div>

                  <div className="timeline-center" style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{
                      width: 80, height: 80,
                      background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
                      borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                      border: "4px solid white", boxShadow: "0 8px 24px rgba(30,58,138,0.3)", position: "relative",
                    }}>
                      {step.icon}
                      <div style={{
                        position: "absolute", top: -10, right: -10,
                        width: 28, height: 28, background: "#f97316", borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: 700, fontSize: "0.8rem",
                        boxShadow: "0 2px 8px rgba(249,115,22,0.4)",
                      }}>{step.num}</div>
                    </div>
                  </div>

                  <div>
                    {step.right && (
                      <div className="card-hover" style={{ background: "white", borderRadius: 16, padding: 28, border: "2px solid #bfdbfe", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                        <h3 className="display" style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f1f4f", marginBottom: 8 }}>{step.title}</h3>
                        <p style={{ color: "#4b5563", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ PERFORMANS SİSTEMİ ══════════════════════ */}
        <section style={{
          padding: "80px 16px",
          background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
          position: "relative", overflow: "hidden",
        }}>
          <div className="dot-bg" style={{ position: "absolute", inset: 0, opacity: 0.1 }} />
          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 className="display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "white", lineHeight: 1.3 }}>
                Sistemimiz,<br ></br>motivasyon programı değil.<br />
                <span style={{ color: "#fdba74" }}>Bir Performans Sistemidir.</span>
              </h2>
            </div>

            <div className="grid-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, marginBottom: 48 }}>
              {[
                { icon: <IconBarChart style={{ width: 32, height: 32, color: "white" }} />,    title: "Ölçülebilir",    desc: "Her hafta ve her ay somut verilerle ilerleme takip edilir" },
                { icon: <IconFileCheck style={{ width: 32, height: 32, color: "white" }} />,   title: "Raporlanabilir", desc: "Velilere detaylı performans raporları düzenli olarak sunulur" },
                { icon: <IconTrendingUp style={{ width: 32, height: 32, color: "white" }} />,  title: "Sürdürülebilir", desc: "Yapılandırılmış sistem sayesinde disiplin sürekli hale gelir" },
              ].map((item, i) => (
                <div key={i} className="card-hover" style={{
                  background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 32,
                  border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
                }}>
                  <div style={{ width: 64, height: 64, background: "#f97316", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 4px 12px rgba(249,115,22,0.4)" }}>
                    {item.icon}
                  </div>
                  <h3 className="display" style={{ fontSize: "1.4rem", fontWeight: 700, color: "white", marginBottom: 12 }}>{item.title}</h3>
                  <p style={{ color: "#bfdbfe", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <IconCheckCircle style={{ width: 32, height: 32, color: "#fdba74" }} />
              <p style={{ fontSize: "1.2rem", fontWeight: 600, color: "white", margin: 0 }}>
                Sistem + Disiplin + Psikolojik Dayanıklılık = <span style={{ color: "#fdba74" }}>Başarı</span>
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════ VELİ & ÖĞRENCİ ══════════════════════ */}
        <section style={{ padding: "80px 16px", background: "white" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="grid-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 48 }}>
              {/* Veli */}
              <div className="card-hover" style={{
                background: "linear-gradient(135deg, #eff6ff, white)",
                borderRadius: 16, padding: 40, border: "2px solid #bfdbfe",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 64, height: 64, background: "#1e3a8a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(30,58,138,0.3)" }}>
                    <IconUsers style={{ width: 32, height: 32, color: "white" }} />
                  </div>
                  <h3 className="display" style={{ fontSize: "2rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>Sayın Veli</h3>
                </div>
                <p style={{ fontSize: "1.1rem", color: "#374151", lineHeight: 1.7, marginBottom: 12 }}>
                  Çocuğunuzun <strong style={{ color: "#1e3a8a" }}>potansiyeli var.</strong>
                </p>
                <p style={{ fontSize: "1.1rem", color: "#374151", lineHeight: 1.7, marginBottom: 24 }}>
                  Ancak potansiyel, <strong style={{ color: "#c2410c" }}>sistemle performansa dönüşür.</strong>
                </p>
                <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #bfdbfe", marginBottom: 24 }}>
                  {[
                    { icon: <IconHeart style={{ width: 24, height: 24, color: "#2563eb" }} />, text: <span>Her ay <strong style={{ color: "#1e3a8a" }}>detaylı performans raporu</strong> sunuyoruz.</span> },
                    { icon: <IconTarget style={{ width: 24, height: 24, color: "#2563eb" }} />, text: <span>Süreç <strong style={{ color: "#1e3a8a" }}>şeffaf ve ölçülebilir.</strong></span> },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i === 0 ? 12 : 0 }}>
                      <span style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                      <p style={{ color: "#374151", lineHeight: 1.6, margin: 0 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>
                  Birlikte, çocuğunuzun başarısını yapılandırıyoruz.
                </p>
              </div>

              {/* Öğrenci */}
              <div className="card-hover" style={{
                background: "linear-gradient(135deg, #fff7ed, white)",
                borderRadius: 16, padding: 40, border: "2px solid #fed7aa",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 64, height: 64, background: "#c2410c", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(194,65,12,0.3)" }}>
                    <IconBookOpen style={{ width: 32, height: 32, color: "white" }} />
                  </div>
                  <h3 className="display" style={{ fontSize: "2rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>Sevgili Öğrenci</h3>
                </div>
                <p style={{ fontSize: "1.1rem", color: "#374151", lineHeight: 1.7, marginBottom: 12 }}>
                  Bu süreçte <strong style={{ color: "#1e3a8a" }}>yalnız değilsin.</strong>
                </p>
                <p style={{ fontSize: "1.1rem", color: "#374151", lineHeight: 1.7, marginBottom: 24 }}>
                  Ama başarı <strong style={{ color: "#c2410c" }}>tesadüf değil.</strong>
                </p>
                <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #fed7aa", marginBottom: 24 }}>
                  {[
                    { n: 1, text: "Seni sisteme alırız" },
                    { n: 2, text: "Takip ederiz" },
                    { n: 3, text: "Geliştiririz" },
                  ].map((item) => (
                    <div key={item.n} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 32, height: 32, background: "#ea580c", borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: 700, flexShrink: 0, fontSize: "0.9rem",
                      }}>{item.n}</div>
                      <p style={{ color: "#374151", fontWeight: 500, margin: 0 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>
                  Sen çalış, biz sistemle destekleyelim.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ CTA ══════════════════════ */}
        <section id="İletişim" style={{
          padding: "80px 16px",
          background: "linear-gradient(135deg, #1e3a8a, #1e40af, #1e3a8a)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 384, height: 384, background: "rgba(249,115,22,0.2)", borderRadius: "50%", filter: "blur(64px)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 384, height: 384, background: "rgba(30,64,175,0.3)", borderRadius: "50%", filter: "blur(64px)" }} />
          <div className="dot-bg" style={{ position: "absolute", inset: 0, opacity: 0.1 }} />

          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <h2 className="display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "white", lineHeight: 1.3, marginBottom: 24 }}>
              Sıradan bir koçluk değil,<br />
              <span style={{ color: "#fdba74" }}>yapılandırılmış bir performans modeli</span><br />
              arıyorsanız...
            </h2>
            <p style={{ fontSize: "1.15rem", color: "#bfdbfe", marginBottom: 40, lineHeight: 1.7 }}>
              Potansiyeli sistematik bir şekilde performansa dönüştürme zamanı.
            </p>
            <button className="btn-main" style={{
              background: "white", color: "#1e3a8a", border: "none",
              padding: "18px 40px", borderRadius: 12, fontWeight: 700,
              fontSize: "1.15rem", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 12, margin: "0 auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)", transition: "all 0.3s",
            }}>
              <IconCalendar style={{ width: 24, height: 24 }} />
              Ücretsiz Ön Görüşme Planlayın
              <IconArrowRight style={{ width: 24, height: 24 }} />
            </button>

            <div className="cta-grid" style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {[
                { val: "30", label: "Öğrenci İle Sınırlı Kontenjan" },
                { val: "1:1",  label: "Bireysel Takip" },
                { val: "100%", label: "Ölçülebilir Sistem" },
              ].map((item, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 24,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fdba74", marginBottom: 8 }}>{item.val}</div>
                  <div style={{ fontSize: "0.85rem", color: "#bfdbfe" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ FOOTER ══════════════════════ */}
        <footer style={{ background: "linear-gradient(135deg, #0f1f4f, #1e3a8a)", color: "white" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 16px" }}>
            <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, marginBottom: 32 }}>
              <div>
                <h3 className="display" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fdba74", marginBottom: 16 }}>
                  Öğrenci Koçu Adana
                </h3>
                <p style={{ color: "#bfdbfe", lineHeight: 1.7, margin: 0 }}>
                  LGS ve YKS öğrencileri için yapılandırılmış Akademik Performans ve Psikolojik Dayanıklılık Modeli
                </p>
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: "1.05rem", color: "#fdba74", marginBottom: 16, margin: "0 0 16px" }}>İletişim</h4>
                {[
                  { Icon: IconPhone,  text: "0547 380 38 01" },
                  { Icon: IconMail,   text: "ogrencikocuadana@gmail.com" },
                  { Icon: IconMapPin, text: "Adana, Türkiye" },
                ].map(({ Icon, text }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, color: "#bfdbfe" }}>
                    <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: "1.05rem", color: "#fdba74", margin: "0 0 16px" }}>Çalışma Saatleri</h4>
                {["Pazartesi - Cuma: 10:00 - 20:00", "Cumartesi: 10:00 - 17:00", "Pazar: Kapalı"].map((t, i) => (
                  <p key={i} style={{ color: "#bfdbfe", marginBottom: 8 }}>{t}</p>
                ))}
              </div>
            </div>
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24,
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
            }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", margin: 0 }}>
                © 2026 Öğrenci Koçu Adana. Tüm hakları saklıdır.
              </p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                Başarı için sistematik yaklaşım{" "}
                <IconHeart style={{ width: 16, height: 16, color: "#fb923c" }} filled />
              </p>
            </div>
          </div>
        </footer>

        {/* ══════════════════════ WHATSAPP ══════════════════════ */}
        <a
          href="https://wa.me/905473803801?text=Merhaba,%20bilgi%20almak%20istiyorum"
          target="_blank"
          rel="noopener noreferrer"
        > 
        <button
          aria-label="WhatsApp ile iletişime geç"
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            width: 64, height: 64, background: "#22c55e", border: "none",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 8px 24px rgba(34,197,94,0.4)",
            transition: "all 0.3s ease",
          }}
        >
          <IconMessageCircle style={{ width: 32, height: 32, color: "white" }} />
          <span style={{
            position: "absolute", top: -4, right: -4,
            width: 16, height: 16, background: "#ef4444", borderRadius: "50%",
          }} />
          <span className="ping" style={{
            position: "absolute", top: -4, right: -4,
            width: 16, height: 16, background: "#ef4444", borderRadius: "50%",
          }} />
        </button>
        </a>

      </div>
    </>
  );
}