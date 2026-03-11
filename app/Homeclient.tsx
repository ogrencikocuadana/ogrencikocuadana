"use client";
// app/HomeClient.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Orijinal page.tsx içeriğinin tamamı buraya taşındı.
// Değişiklikler:
//   1. "use client" direktifi bu dosyada — metadata çakışması ortadan kalktı
//   2. H1/H2/H3 heading hiyerarşisi semantik olarak düzenlendi (SEO kritik)
//   3. font-family referansları Sora'ya güncellendi (Inter/Playfair kaldırıldı)
//   4. page.tsx'teki eski JSON-LD (schemaData) buradan kaldırıldı —
//      page.tsx server component'ında FAQPage + Service olarak yeniden yazıldı
//   5. Küçük erişilebilirlik düzeltmeleri (aria-label, role)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, CSSProperties, ReactNode, FormEvent } from "react";
import ReviewsCarousel from "./components/ReviewsCarousel";

// ─── Tip Tanımları ────────────────────────────────────────────────────────────
interface IconProps { className?: string; style?: CSSProperties; filled?: boolean; }
interface PricingCardProps { badge: string; icon: ReactNode; iconBg: string; iconColor: string; title: string; features: string[]; checkColor: string; onOpen: () => void; }
interface FormData { parentName: string; studentName: string; phone: string; email: string; grade: string; message: string; }

// ─── SVG İkonlar ─────────────────────────────────────────────────────────────
const IconCalendar = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 2v4M16 2v4" /><rect height="18" rx="2" width="18" x="3" y="4" /><path d="M3 10h18" /></svg>);
const IconArrowRight = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>);
const IconTrendingDown = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>);
const IconTrendingUp = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>);
const IconBrain = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375M6.003 5.125A3 3 0 0 0 6.401 6.5M3.477 10.896a4 4 0 0 1 .585-.396M19.938 10.5a4 4 0 0 1 .585.396M6 18a4 4 0 0 1-1.967-.516M19.967 17.484A4 4 0 0 1 18 18" /></svg>);
const IconAlertCircle = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>);
const IconSmartphone = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect height="20" rx="2" ry="2" width="14" x="5" y="2" /><path d="M12 18h.01" /></svg>);
const IconTarget = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>);
const IconBarChart = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" /></svg>);
const IconFileText = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" /></svg>);
const IconCheckCircle = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>);
const IconCheck = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>);
const IconUsers = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
const IconClock = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const IconLightbulb = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4" /></svg>);
const IconSparkles = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4M19 17v4M3 5h4M17 19h4" /></svg>);
const IconStar = ({ className = "w-5 h-5", style, filled = false }: IconProps) => (<svg className={className} style={style} fill={filled ? "white" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const IconBolt = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>);
const IconMessageCircle = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>);
const IconClipboardCheck = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect height="4" rx="1" ry="1" width="8" x="8" y="2" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></svg>);
const IconSettings = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>);
const IconFileCheck = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m9 15 2 2 4-4" /></svg>);
const IconHeart = ({ className = "w-5 h-5", style, filled = false }: IconProps) => (<svg className={className} style={style} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>);
const IconBookOpen = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>);
const IconPhone = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>);
const IconMail = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect height="16" rx="2" width="20" x="2" y="4" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>);
const IconMapPin = ({ className = "w-5 h-5", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>);
const IconUser = ({ className = "w-6 h-6", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 7a4 4 11-8 0 4 4 018 0zM12 14a7 7 00-7 7h14a7 7 00-7-7z" /></svg>);
const IconBook = ({ className = "w-6 h-6", style }: IconProps) => (<svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>);
const IconSend = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="20" height="20"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>);
const IconX = () => (<svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" width="22" height="22"><path d="M18 6 6 18M6 6l12 12" /></svg>);
const IconChevronDown = () => (<svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="18" height="18"><path d="m6 9 6 6 6-6" /></svg>);

// ─── Font Değişkeni (Sora) ────────────────────────────────────────────────────
// layout.tsx'te body'ye sora.className uygulandı.
// Burada display font için var(--font-sora) kullanıyoruz.
// Orijinal kodda "Playfair Display" vardı — Sora ile değiştirildi.
const displayFont = "var(--font-sora), 'Sora', sans-serif";

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({ badge, icon, iconBg, title, features, checkColor, onOpen }: PricingCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white", borderRadius: 24, padding: "36px 32px 32px",
        border: hovered ? "2px solid #bfdbfe" : "2px solid #e5e7eb",
        position: "relative", transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hovered ? "0 28px 56px rgba(30,58,138,0.10)" : "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ position: "absolute", top: -13, left: 28, background: "white", border: "1.5px solid #e5e7eb", borderRadius: 9999, padding: "4px 14px" }}>
        <span style={{ color: "#6b7280", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.08em" }}>{badge}</span>
      </div>
      <div style={{ width: 56, height: 56, background: iconBg, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, boxShadow: `0 4px 14px ${iconBg}99` }}>{icon}</div>
      {/* ✅ SEO: h3 — pricing section'daki 3. düzey başlık */}
      <h3 style={{ fontFamily: displayFont, fontSize: "1.2rem", fontWeight: 700, color: "#0f1f4f", margin: "0 0 20px", lineHeight: 1.35 }}>{title}</h3>
      <div style={{ height: 1, background: "linear-gradient(90deg, #e5e7eb, transparent)", marginBottom: 20 }} />
      {features.map((f, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            <IconCheck style={{ color: checkColor, width: 11, height: 11 }} />
          </div>
          <span style={{ fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.6 }}>{f}</span>
        </div>
      ))}
      <button
        onClick={onOpen}
        style={{ width: "100%", padding: "13px 24px", background: hovered ? "#1e3a8a" : "white", color: hovered ? "white" : "#1e3a8a", border: "2px solid #1e3a8a", borderRadius: 10, fontWeight: 700, cursor: "pointer", marginTop: 24, transition: "all 0.25s ease", fontSize: "0.9rem" }}
      >
        Ön Görüşme İste
      </button>
    </article>
  );
}

// ─── Modal Form ───────────────────────────────────────────────────────────────
function AppointmentModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<FormData>({ parentName: "", studentName: "", phone: "", email: "", grade: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("https://formspree.io/f/xjgeanor", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ "Veli Adı": form.parentName, "Öğrenci Adı": form.studentName, "Telefon": form.phone, "E-posta": form.email, "Sınıf": form.grade, "Mesaj": form.message }) });
    setSubmitted(true);
    const whatsappText = encodeURIComponent(`Merhaba! Ön görüşme talebinde bulunmak istiyorum.\n\n👤 Veli: ${form.parentName}\n🎓 Öğrenci: ${form.studentName}\n📱 Telefon: ${form.phone}\n📚 Sınıf: ${form.grade}. Sınıf\n${form.message ? `💬 Mesaj: ${form.message}` : ""}`);
    setTimeout(() => { window.open(`https://wa.me/905473803801?text=${whatsappText}`, "_blank"); }, 800);
  };
  const inp: CSSProperties = { width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12, border: "2px solid #e5e7eb", borderRadius: 8, fontSize: "0.95rem", outline: "none", fontFamily: "inherit", background: "white", transition: "border-color 0.2s, box-shadow 0.2s", appearance: "none" as const, color: "#111827" };
  const lbl: CSSProperties = { display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: 8 };
  const iconPos: CSSProperties = { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" };
  return (
    <>
      <style>{`@keyframes modal-bg-in{from{opacity:0}to{opacity:1}}@keyframes modal-box-in{from{opacity:0;transform:translateY(28px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}.modal-inp{color:#111827!important;-webkit-text-fill-color:#111827!important}.modal-inp::placeholder{color:#9ca3af!important;opacity:1}.modal-inp:-webkit-autofill{-webkit-text-fill-color:#111827!important;-webkit-box-shadow:0 0 0 100px white inset!important}.modal-inp:focus{border-color:#1e40af!important;box-shadow:0 0 0 3px rgba(30,64,175,0.12)!important}.modal-close-btn:hover{background:rgba(255,255,255,0.28)!important}.modal-submit:hover{box-shadow:0 10px 32px rgba(30,58,138,0.5)!important;filter:brightness(1.06)}@media(max-width:540px){.modal-half{grid-template-columns:1fr!important}}`}</style>
      <div role="dialog" aria-modal="true" aria-label="Ücretsiz Ön Görüşme Formu" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", backdropFilter: "blur(5px)", zIndex: 9998, animation: "modal-bg-in 0.22s ease" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 28px 80px rgba(0,0,0,0.28)", animation: "modal-box-in 0.28s cubic-bezier(.22,.68,0,1.2)", pointerEvents: "all" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)", padding: "24px 28px", borderRadius: "20px 20px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              {/* ✅ Modal başlığı h2 — ana H1'den sonra mantıklı hiyerarşi */}
              <h2 style={{ fontFamily: displayFont, fontSize: "1.65rem", fontWeight: 800, color: "white", margin: "0 0 4px" }}>Ücretsiz Ön Görüşme</h2>
              <p style={{ color: "#bfdbfe", margin: 0, fontSize: "0.9rem" }}>Formu doldurun, en kısa sürede size dönelim</p>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Modalı kapat" style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s", color: "white" }}><IconX /></button>
          </div>
          {submitted ? (
            <div style={{ padding: "52px 28px", textAlign: "center" }}>
              <div style={{ width: 76, height: 76, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 0 12px rgba(220,252,231,0.5)" }}><svg width="38" height="38" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg></div>
              <h3 style={{ fontFamily: displayFont, fontSize: "1.7rem", fontWeight: 800, color: "#0f1f4f", margin: "0 0 12px" }}>Talebiniz Alındı! 🎉</h3>
              <p style={{ color: "#4b5563", lineHeight: 1.7, maxWidth: 420, margin: "0 auto 12px" }}>En kısa sürede <strong style={{ color: "#1e3a8a" }}>{form.phone || "belirttiğiniz numara"}</strong>&apos;dan sizi arayacağız.</p>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", maxWidth: 420, margin: "0 auto 32px" }}>📧 Bilgileriniz e-posta ile iletildi. WhatsApp otomatik açılmadıysa <a href="https://wa.me/905473803801" target="_blank" rel="noopener noreferrer" style={{ color: "#1e3a8a", fontWeight: 600 }}>buraya tıklayın</a>.</p>
              <button onClick={onClose} style={{ background: "linear-gradient(135deg,#1e3a8a,#1e40af)", color: "white", border: "none", padding: "13px 36px", borderRadius: 10, fontWeight: 700, fontSize: "1rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(30,58,138,0.35)" }}>Kapat</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: "28px 28px 32px" }}>
              <div className="modal-half" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div><label style={lbl}>Veli Adı Soyadı *</label><div style={{ position: "relative" }}><span style={iconPos}><IconUser style={{ width: 18, height: 18 }} /></span><input type="text" name="parentName" required placeholder="Adınız Soyadınız" value={form.parentName} onChange={handleChange} className="modal-inp" style={inp} /></div></div>
                <div><label style={lbl}>Öğrenci Adı Soyadı *</label><div style={{ position: "relative" }}><span style={iconPos}><IconUser style={{ width: 18, height: 18 }} /></span><input type="text" name="studentName" required placeholder="Öğrencinin Adı" value={form.studentName} onChange={handleChange} className="modal-inp" style={inp} /></div></div>
              </div>
              <div className="modal-half" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div><label style={lbl}>Telefon *</label><div style={{ position: "relative" }}><span style={iconPos}><IconPhone style={{ width: 18, height: 18 }} /></span><input type="tel" name="phone" required placeholder="0555 555 55 55" value={form.phone} onChange={handleChange} className="modal-inp" style={inp} /></div></div>
                <div><label style={lbl}>E-posta <span style={{ color: "#9ca3af", fontWeight: 400 }}>(İsteğe bağlı)</span></label><div style={{ position: "relative" }}><span style={iconPos}><IconMail style={{ width: 18, height: 18 }} /></span><input type="email" name="email" placeholder="ornek@email.com" value={form.email} onChange={handleChange} className="modal-inp" style={inp} /></div></div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Öğrencinin Sınıfı *</label>
                <div style={{ position: "relative" }}><span style={iconPos}><IconBookOpen style={{ width: 18, height: 18 }} /></span><span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}><IconChevronDown /></span>
                  <select name="grade" required value={form.grade} onChange={handleChange} className="modal-inp" style={{ ...inp, paddingRight: 36, cursor: "pointer" }}>
                    <option value="">Sınıf Seçin</option><option value="7">7. Sınıf (LGS)</option><option value="8">8. Sınıf (LGS)</option><option value="11">11. Sınıf (YKS)</option><option value="12">12. Sınıf (YKS)</option><option value="Mezun">Mezun</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 28 }}><label style={lbl}>Mesajınız <span style={{ color: "#9ca3af", fontWeight: 400 }}>(İsteğe bağlı)</span></label><textarea name="message" rows={4} placeholder="Öğrencinin mevcut durumu, hedefleri veya sormak istedikleriniz..." value={form.message} onChange={handleChange} className="modal-inp" style={{ ...inp, paddingLeft: 16, resize: "none", lineHeight: 1.65 }} /></div>
              <button type="submit" className="modal-submit" style={{ width: "100%", padding: "15px 24px", background: "linear-gradient(135deg,#1e3a8a,#1e40af)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "1.05rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 16px rgba(30,58,138,0.35)", transition: "box-shadow 0.25s, filter 0.25s" }}><IconSend style={{ width: 20, height: 20 }} />Ön Görüşme Talep Et</button>
              <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#9ca3af", margin: "14px 0 0" }}>🔒 Bilgileriniz güvende — yalnızca sizinle iletişim için kullanılır.</p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Geri Sayım ───────────────────────────────────────────────────────────────
function CountdownSection() {
  const exams = [
    { name: "LGS", date: new Date("2026-06-14T09:00:00"), color: "#1e3a8a", bg: "#eff6ff", border: "#bfdbfe", tag: "8. Sınıf" },
    { name: "YKS", date: new Date("2026-06-20T10:00:00"), color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", tag: "12. Sınıf" },
  ];
  const [days, setDays] = useState<number[]>(exams.map(() => 0));
  useEffect(() => {
    const calc = () => { const now = new Date().getTime(); setDays(exams.map(e => Math.max(0, Math.ceil((e.date.getTime() - now) / (1000 * 60 * 60 * 24))))); };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, []);
  return (
    <section aria-label="Sınava geri sayım" style={{ padding: "44px 16px", background: "linear-gradient(135deg, #f8faff, #eff6ff)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <p style={{ textAlign: "center", fontSize: "0.8rem", fontWeight: 700, color: "#6b7280", letterSpacing: "0.1em", marginBottom: 20 }}>SINAVA NE KADAR KALDI?</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="grid-cols-2">
          {exams.map((exam, i) => (
            <div key={i} className="card-hover" style={{ background: exam.bg, borderRadius: 18, padding: "24px 28px", border: `2px solid ${exam.border}`, display: "flex", alignItems: "center", gap: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
              <div style={{ textAlign: "center", flexShrink: 0, minWidth: 72 }}>
                <div style={{ fontSize: "3.2rem", fontWeight: 800, color: exam.color, lineHeight: 1, fontFamily: displayFont }}>{days[i]}</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: exam.color, opacity: 0.65, marginTop: 4, letterSpacing: "0.08em" }}>GÜN</div>
              </div>
              <div style={{ width: 2, height: 52, background: exam.border, flexShrink: 0 }} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: exam.color, fontFamily: displayFont }}>{exam.name}</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, background: exam.border, color: exam.color, padding: "3px 10px", borderRadius: 9999 }}>{exam.tag}</span>
                </div>
                <div style={{ fontSize: "0.88rem", color: "#4b5563", fontWeight: 500 }}>{exam.name === "LGS" ? "14 Haziran 2026" : "20–21 Haziran 2026"}</div>
                <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 3 }}>{days[i] === 0 ? "🎉 Sınav günü!" : `${Math.floor(days[i] / 7)} hafta ${days[i] % 7} gün`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function HomeClient() {
  const [showModal, setShowModal] = useState(false);
  const openModal  = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: var(--font-sora), 'Sora', sans-serif; }
        .dot-bg { background-image: radial-gradient(#1e3a8a 1px, transparent 1px); background-size: 28px 28px; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.10); }
        .btn-main:hover  { filter: brightness(1.08); transform: translateY(-1px); }
        .btn-outline:hover { background: #eff6ff !important; border-color: #93c5fd !important; }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        .ping { animation: ping 1.5s ease-in-out infinite; }
        @media (max-width: 768px) {
          .grid-cols-3  { grid-template-columns: 1fr !important; }
          .grid-cols-2  { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .timeline-grid { grid-template-columns: 1fr !important; }
          .timeline-center { display: none !important; }
          .stats-grid   { grid-template-columns: repeat(2,1fr) !important; }
          .hero-h1      { font-size: 2.2rem !important; }
          .cta-grid     { grid-template-columns: 1fr !important; }
          .footer-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {showModal && <AppointmentModal onClose={closeModal} />}

      <div style={{ minHeight: "100vh", background: "white" }}>

        {/* ══════ HERO ══════ */}
        <section aria-labelledby="hero-heading" style={{ background: "linear-gradient(150deg, #ffffff 0%, #eef4ff 45%, #fff8f3 100%)", padding: "130px 16px 110px", position: "relative", overflow: "hidden" }}>
          <div className="dot-bg" style={{ position: "absolute", inset: 0, opacity: 0.03 }} aria-hidden="true" />
          <div style={{ position: "absolute", top: -120, right: -80, width: 500, height: 500, background: "radial-gradient(circle, rgba(30,58,138,0.07) 0%, transparent 70%)", pointerEvents: "none" }} aria-hidden="true" />
          <div style={{ position: "absolute", bottom: -80, left: -60, width: 400, height: 400, background: "radial-gradient(circle, rgba(194,65,12,0.05) 0%, transparent 70%)", pointerEvents: "none" }} aria-hidden="true" />

          <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32, padding: "8px 18px", background: "white", borderRadius: 9999, border: "1.5px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} aria-hidden="true" />
              <span style={{ color: "#374151", fontWeight: 600, fontSize: "0.82rem" }}>LGS &amp; YKS Öğrencileri İçin Online &amp; Yüz Yüze Özel Koçluk</span>
            </div>

            {/*
              ✅ SEO KRİTİK: Sayfada tek bir H1 olmalı.
              Anahtar kelimeler: "lgs koçu adana", "yks koçu adana", "sınav başarısı"
              H1 içeriği hem kullanıcıya hem Google'a sayfanın ne hakkında olduğunu söyler.
            */}
            <h1
              id="hero-heading"
              className="hero-h1"
              style={{ fontFamily: displayFont, fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 800, color: "#0f1f4f", lineHeight: 1.18, marginBottom: 28, maxWidth: 820, margin: "0 auto 28px" }}
            >
              Adana&apos;nın LGS ve YKS Koçu —{" "}
              <span style={{ color: "#1d4ed8" }}>Sınav Başarısı</span> Tesadüf Değil,{" "}
              <span style={{ background: "linear-gradient(90deg, #1e3a8a, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sistemin Sonucudur</span>
            </h1>

            <p style={{ fontSize: "1.1rem", color: "#4b5563", lineHeight: 1.75, maxWidth: 600, margin: "0 auto 44px" }}>
              LGS ve YKS öğrencileri için{" "}
              <strong style={{ color: "#0f1f4f" }}>Akademik Performans + Psikolojik Dayanıklılık</strong>{" "}
              modeli. Yüz yüze veya <strong style={{ color: "#0f1f4f" }}>online</strong>, bireysel takip ve ölçülebilir sonuçlar.
            </p>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
              <button onClick={openModal} className="btn-main" style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "white", border: "none", padding: "16px 36px", borderRadius: 10, fontWeight: 700, fontSize: "1.05rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 6px 24px rgba(30,58,138,0.3)", transition: "all 0.25s" }}>
                <IconCalendar style={{ width: 20, height: 20 }} />
                Ücretsiz Ön Görüşme Planla
                <IconArrowRight style={{ width: 18, height: 18 }} />
              </button>
              <a href="#sistemimiz" className="btn-outline" style={{ background: "white", color: "#1e3a8a", border: "2px solid #dbeafe", padding: "16px 32px", borderRadius: 10, fontWeight: 600, fontSize: "1.05rem", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", transition: "all 0.25s" }}>
                Sistemi İncele <IconArrowRight style={{ width: 18, height: 18 }} />
              </a>
            </div>

            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, maxWidth: 760, margin: "0 auto" }}>
              {[
                { val: "LGS",  label: "Öğrenci Koçluğu",   icon: "🎯", color: "#1e3a8a", bg: "#eff6ff", border: "#dbeafe" },
                { val: "YKS",  label: "Öğrenci Koçluğu",   icon: "🏆", color: "#1e3a8a", bg: "#eff6ff", border: "#dbeafe" },
                { val: "30",   label: "Öğrenci Kapasitesi", icon: "👥", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
                { val: "1:1",  label: "Bireysel Takip",     icon: "📊", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
              ].map((s, i) => (
                <div key={i} style={{ background: s.bg, borderRadius: 16, padding: "18px 12px", border: `1.5px solid ${s.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: 6 }} aria-hidden="true">{s.icon}</div>
                  <div style={{ fontSize: "1.55rem", fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 5 }}>{s.val}</div>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 500, lineHeight: 1.35 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ GERİ SAYIM ══════ */}
        <CountdownSection />

        {/* ══════ SORUNLAR ══════ */}
        <section aria-labelledby="sorunlar-heading" style={{ padding: "88px 16px", background: "white" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              {/* ✅ H2 — bölüm başlığı */}
              <h2 id="sorunlar-heading" style={{ fontFamily: displayFont, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>Tanıdık Geliyor mu?</h2>
              <p style={{ fontSize: "1.1rem", color: "#4b5563", maxWidth: 560, margin: "0 auto" }}>Birçok öğrenci ve veli bu sorunlarla karşılaşıyor</p>
            </div>
            <div className="grid-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 28, marginBottom: 28 }}>
              <div className="card-hover" style={{ background: "#eff6ff", borderRadius: 20, padding: 32, border: "2px solid #bfdbfe" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, background: "#1e3a8a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true"><IconUsers style={{ width: 24, height: 24, color: "white" }} /></div>
                  {/* ✅ H3 — alt bölüm başlığı */}
                  <h3 style={{ fontFamily: displayFont, fontSize: "1.4rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>Velilerden Duyuyoruz</h3>
                </div>
                {[{ Icon: IconTrendingDown, text: "Çalışıyor ama verimsiz geçiyor" }, { Icon: IconBrain, text: "Denemede netleri artmıyor" }, { Icon: IconAlertCircle, text: "Kaygı ve telefon dikkatini bölüyor" }, { Icon: IconTrendingDown, text: "Programlı çalışmıyor" }].map(({ Icon, text }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                    <div style={{ padding: 8, background: "white", borderRadius: 8, flexShrink: 0 }} aria-hidden="true"><Icon style={{ width: 18, height: 18, color: "#1d4ed8" }} /></div>
                    <p style={{ color: "#374151", lineHeight: 1.6, margin: 0, fontSize: "0.95rem" }}>{text}</p>
                  </div>
                ))}
              </div>
              <div className="card-hover" style={{ background: "#fff7ed", borderRadius: 20, padding: 32, border: "2px solid #fed7aa" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, background: "#c2410c", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true"><IconBook style={{ width: 24, height: 24, color: "white" }} /></div>
                  <h3 style={{ fontFamily: displayFont, fontSize: "1.4rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>Öğrencilerden Duyuyoruz</h3>
                </div>
                {[{ Icon: IconAlertCircle, text: "Nereden başlayacağımı bilmiyorum" }, { Icon: IconTrendingDown, text: "Motivasyonum dalgalı" }, { Icon: IconBrain, text: "Netlerim bir türlü artmıyor" }, { Icon: IconSmartphone, text: "Denemede bildiğimi yapamıyorum" }].map(({ Icon, text }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                    <div style={{ padding: 8, background: "white", borderRadius: 8, flexShrink: 0 }} aria-hidden="true"><Icon style={{ width: 18, height: 18, color: "#c2410c" }} /></div>
                    <p style={{ color: "#374151", lineHeight: 1.6, margin: 0, fontSize: "0.95rem" }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "linear-gradient(90deg, #1e3a8a, #1e40af)", borderRadius: 16, padding: "26px 32px", textAlign: "center", boxShadow: "0 8px 32px rgba(30,58,138,0.25)" }}>
              <p style={{ fontSize: "1.15rem", color: "white", fontWeight: 600, margin: 0 }}>Sorun bilgi eksikliği değil,{" "}<strong style={{ color: "#fdba74", fontWeight: 800 }}>sistem ve psikolojik dayanıklılık eksikliği.</strong></p>
            </div>
          </div>
        </section>

        {/* ══════ MODEL ══════ */}
        <section id="sistemimiz" aria-labelledby="sistem-heading" style={{ padding: "88px 16px", background: "linear-gradient(135deg, #f8faff, #eff6ff)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ display: "inline-block", marginBottom: 14, padding: "7px 18px", background: "#dbeafe", borderRadius: 9999 }}>
                <span style={{ color: "#1e40af", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.06em" }}>SİSTEMLİ YAKLAŞIM</span>
              </div>
              <h2 id="sistem-heading" style={{ fontFamily: displayFont, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>
                Akademik Performans ve<br />Psikolojik Dayanıklılık Modeli
              </h2>
              <p style={{ fontSize: "1.05rem", color: "#4b5563", maxWidth: 600, margin: "0 auto" }}>Üç temel sütun üzerinde yapılandırılmış, ölçülebilir ve sürdürülebilir bir sistem</p>
            </div>
            <div className="grid-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
              {[
                { iconBg: "#1e3a8a", cardBg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a", itemColor: "#2563eb", icon: <IconTarget style={{ width: 30, height: 30, color: "white" }} />, title: "Bireysel Performans Koçluğu", items: [{ icon: <IconCalendar style={{ width: 18, height: 18 }} />, text: "Haftalık bireysel görüşme" }, { icon: <IconFileText style={{ width: 18, height: 18 }} />, text: "Öğrenciye özel planlama" }, { icon: <IconCheckCircle style={{ width: 18, height: 18 }} />, text: "Kaynak takibi" }, { icon: <IconBarChart style={{ width: 18, height: 18 }} />, text: "Deneme analiz sistemi" }] },
                { iconBg: "#ea580c", cardBg: "#fff7ed", border: "#fed7aa", titleColor: "#7c2d12", itemColor: "#ea580c", icon: <IconBarChart style={{ width: 30, height: 30, color: "white" }} />, title: "Sistemli Akademik Takip", items: [{ icon: <IconFileText style={{ width: 18, height: 18 }} />, text: "Aylık analiz sistemi" }, { icon: <IconTrendingUp style={{ width: 18, height: 18 }} />, text: "Net artış odaklı değerlendirme" }, { icon: <IconUsers style={{ width: 18, height: 18 }} />, text: "Aylık veli performans raporu" }, { icon: <IconCheckCircle style={{ width: 18, height: 18 }} />, text: "Detaylı ilerleme takibi" }] },
                { iconBg: "#1e3a8a", cardBg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e3a8a", itemColor: "#2563eb", icon: <IconBrain style={{ width: 30, height: 30, color: "white" }} />, title: "Psikolojik Dayanıklılık Eğitimi", items: [{ icon: <IconClock style={{ width: 18, height: 18 }} />, text: "Haftalık online seminer" }, { icon: <IconLightbulb style={{ width: 18, height: 18 }} />, text: "Zaman yönetimi ve verimli çalışma" }, { icon: <IconBrain style={{ width: 18, height: 18 }} />, text: "Sınav kaygısı ve duygu yönetimi" }, { icon: <IconCheckCircle style={{ width: 18, height: 18 }} />, text: "Hızlı okuma eğitimi" }] },
              ].map((col, i) => (
                <article key={i} className="card-hover" style={{ background: col.cardBg, borderRadius: 20, padding: 30, border: `2px solid ${col.border}` }}>
                  <div style={{ width: 60, height: 60, background: col.iconBg, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }} aria-hidden="true">{col.icon}</div>
                  <h3 style={{ fontFamily: displayFont, fontSize: "1.25rem", fontWeight: 700, color: col.titleColor, marginBottom: 18, lineHeight: 1.3 }}>{col.title}</h3>
                  {col.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                      <span style={{ color: col.itemColor, flexShrink: 0, marginTop: 2 }} aria-hidden="true">{item.icon}</span>
                      <p style={{ color: "#374151", lineHeight: 1.55, margin: 0, fontSize: "0.9rem" }}>{item.text}</p>
                    </div>
                  ))}
                </article>
              ))}
            </div>
            <div style={{ marginTop: 40, background: "white", borderRadius: 16, padding: "24px 32px", border: "2px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 44, height: 44, background: "#ffedd5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true"><IconUsers style={{ width: 22, height: 22, color: "#c2410c" }} /></div>
              <p style={{ fontSize: "1.05rem", color: "#374151", margin: 0 }}><strong style={{ color: "#1e3a8a" }}>Sınırlı Kontenjan:</strong> Kaliteyi korumak için en fazla <strong style={{ color: "#c2410c" }}>30 öğrenci</strong> ile çalışıyoruz.</p>
            </div>
          </div>
        </section>

        {/* ══════ PAKETLER ══════ */}
        <section id="paketler" aria-labelledby="paketler-heading" style={{ padding: "88px 16px 96px", background: "linear-gradient(180deg, white 0%, #f8faff 100%)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ display: "inline-block", marginBottom: 14, padding: "7px 18px", background: "#ffedd5", borderRadius: 9999 }}>
                <span style={{ color: "#9a3412", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.06em" }}>PAKETLER</span>
              </div>
              <h2 id="paketler-heading" style={{ fontFamily: displayFont, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>Size Uygun Paketi Seçin</h2>
              <p style={{ fontSize: "1.05rem", color: "#4b5563", maxWidth: 520, margin: "0 auto" }}>Her öğrencinin ihtiyacı farklıdır. Size en uygun desteği sunuyoruz.</p>
            </div>

            <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", gap: 20, alignItems: "start" }}>
              <PricingCard
                badge="TEMEL"
                icon={<IconSparkles style={{ width: 28, height: 28, color: "#1d4ed8" }} />}
                iconBg="#dbeafe" iconColor="#1d4ed8"
                title="Akademik Performans Paketi"
                features={["Haftalık bireysel koçluk görüşmesi", "Öğrenciye özel akademik planlama", "Kaynak ve ders takip sistemi", "Deneme analiz sistemi", "Aylık performans raporu"]}
                checkColor="#2563eb"
                onOpen={openModal}
              />

              {/* Önerilen kart */}
              <div style={{ position: "relative", marginTop: -8 }}>
                <div style={{ position: "absolute", inset: -3, borderRadius: 28, background: "linear-gradient(135deg, #f97316, #1e40af, #f97316)", backgroundSize: "200% 200%", zIndex: 0, filter: "blur(1px)", opacity: 0.7 }} aria-hidden="true" />
                <article style={{ position: "relative", zIndex: 1, background: "linear-gradient(160deg, #1e3a8a 0%, #1e40af 60%, #1a35a0 100%)", borderRadius: 26, padding: "40px 32px 32px", boxShadow: "0 20px 60px rgba(30,58,138,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset" }}>
                  <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #f97316, #ea580c)", borderRadius: 9999, padding: "6px 20px", boxShadow: "0 4px 16px rgba(249,115,22,0.45)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                    <IconStar style={{ width: 13, height: 13, color: "white" }} filled />
                    <span style={{ color: "white", fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.06em" }}>ÖNERİLEN</span>
                  </div>
                  <div style={{ width: 56, height: 56, background: "rgba(255,255,255,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, border: "1px solid rgba(255,255,255,0.2)" }} aria-hidden="true">
                    <IconStar style={{ width: 28, height: 28, color: "#fdba74" }} />
                  </div>
                  <h3 style={{ fontFamily: displayFont, fontSize: "1.2rem", fontWeight: 700, color: "white", margin: "0 0 8px", lineHeight: 1.35 }}>Akademik Performans ve Psikolojik Dayanıklılık Paketi</h3>
                  <p style={{ fontSize: "0.8rem", color: "rgba(191,219,254,0.8)", margin: "0 0 22px" }}>En kapsamlı program — akademik + psikolojik destek</p>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 20 }} />
                  {[
                    { text: "Tüm Akademik Performans özellikleri", highlight: true },
                    { text: "Haftalık online seminer", highlight: false },
                    { text: "Zaman yönetimi eğitimi", highlight: false },
                    { text: "Sınav kaygısı ve stres yönetimi", highlight: false },
                    { text: "Verimli ders çalışma teknikleri", highlight: false },
                    { text: "Hızlı okuma ve teknoloji bağımlılığı", highlight: false },
                    { text: "Seminer sonrası ödevlendirme", highlight: false },
                    { text: "Detaylı gelişim takibi", highlight: false },
                  ].map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 11 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: f.highlight ? "rgba(253,186,116,0.25)" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }} aria-hidden="true">
                        <IconCheck style={{ width: 11, height: 11, color: f.highlight ? "#fdba74" : "rgba(255,255,255,0.7)" }} />
                      </div>
                      <span style={{ fontSize: "0.875rem", color: f.highlight ? "#fdba74" : "rgba(255,255,255,0.88)", lineHeight: 1.55, fontWeight: f.highlight ? 600 : 400 }}>{f.text}</span>
                    </div>
                  ))}
                  <button
                    onClick={openModal}
                    style={{ width: "100%", padding: "14px 24px", background: "white", color: "#1e3a8a", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", marginTop: 24, fontSize: "0.95rem", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", transition: "all 0.25s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
                  >
                    Ön Görüşme İste →
                  </button>
                </article>
              </div>

              <PricingCard
                badge="HIZ ODAKLI"
                icon={<IconBolt style={{ width: 28, height: 28, color: "#1d4ed8" }} />}
                iconBg="#dbeafe" iconColor="#1d4ed8"
                title="Sınav Odaklı Hızlı Okuma Programı"
                features={["4 hafta uygulamalı online eğitim", "21 gün disiplinli ödev sistemi", "365 günlük yazılım desteği", "Veli rapor sistemi", "Moxo Dikkat Testi Uygulaması"]}
                checkColor="#2563eb"
                onOpen={openModal}
              />
            </div>

            <div style={{ marginTop: 36, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "18px 28px", background: "white", borderRadius: 14, border: "1.5px solid #fed7aa", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: "1.1rem" }} aria-hidden="true">👥</span>
              <p style={{ fontSize: "0.95rem", color: "#374151", margin: 0 }}>
                <strong style={{ color: "#1e3a8a" }}>Sınırlı Kontenjan:</strong> Kaliteyi korumak için en fazla{" "}
                <strong style={{ color: "#c2410c" }}>30 öğrenci</strong> ile çalışıyoruz.
              </p>
            </div>
          </div>
        </section>

        {/* ══════ SÜREÇ ══════ */}
        <section aria-labelledby="surec-heading" style={{ padding: "88px 16px", background: "linear-gradient(135deg, #f0f4ff, #ffffff, #fff7ed)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ display: "inline-block", marginBottom: 14, padding: "7px 18px", background: "#dbeafe", borderRadius: 9999 }}>
                <span style={{ color: "#1e40af", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.06em" }}>SÜREÇ</span>
              </div>
              <h2 id="surec-heading" style={{ fontFamily: displayFont, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>Nasıl Çalışıyoruz?</h2>
              <p style={{ fontSize: "1.05rem", color: "#4b5563", maxWidth: 560, margin: "0 auto" }}>Sistematik ve şeffaf bir süreç ile başarıya ulaşıyoruz</p>
            </div>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}>
              <div className="timeline-center" style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom, #bfdbfe, #fed7aa, #bfdbfe)", transform: "translateX(-50%)", zIndex: 0 }} aria-hidden="true" />
              {[
                { num: 1, icon: <IconMessageCircle style={{ width: 36, height: 36, color: "white" }} />, title: "Ön Görüşme", desc: "Ücretsiz tanışma görüşmesi ile öğrencinin mevcut durumunu, hedeflerini ve ihtiyaçlarını değerlendiriyoruz.", right: false },
                { num: 2, icon: <IconClipboardCheck style={{ width: 36, height: 36, color: "white" }} />, title: "Başlangıç Performans Analizi", desc: "Akademik düzey, çalışma alışkanlıkları ve psikolojik hazırlık detaylı olarak analiz edilir.", right: true },
                { num: 3, icon: <IconSettings style={{ width: 36, height: 36, color: "white" }} />, title: "Kişisel Sistem Kurulumu", desc: "Öğrenciye özel çalışma planı, kaynak yol haritası ve takip sistemi oluşturulur.", right: false },
                { num: 4, icon: <IconTarget style={{ width: 36, height: 36, color: "white" }} />, title: "Haftalık Disiplinli Takip", desc: "Bireysel görüşmeler, seminerler ve deneme analizleri ile sürekli gelişim sağlanır.", right: true },
                { num: 5, icon: <IconFileText style={{ width: 36, height: 36, color: "white" }} />, title: "Aylık Raporlama", desc: "Velilere detaylı performans raporu sunularak süreç şeffaf ve ölçülebilir tutulur.", right: false },
              ].map((step) => (
                <li key={step.num} className="timeline-grid" style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", alignItems: "center", gap: 28, marginBottom: 44, position: "relative", zIndex: 1 }}>
                  <div>{!step.right && <div className="card-hover" style={{ background: "white", borderRadius: 18, padding: 26, border: "2px solid #bfdbfe", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}><h3 style={{ fontFamily: displayFont, fontSize: "1.2rem", fontWeight: 700, color: "#0f1f4f", marginBottom: 8 }}>{step.title}</h3><p style={{ color: "#4b5563", lineHeight: 1.65, margin: 0, fontSize: "0.9rem" }}>{step.desc}</p></div>}</div>
                  <div className="timeline-center" style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: 76, height: 76, background: "linear-gradient(135deg, #1e3a8a, #1e40af)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid white", boxShadow: "0 8px 24px rgba(30,58,138,0.28)", position: "relative" }} aria-label={`Adım ${step.num}`}>
                      {step.icon}
                      <div style={{ position: "absolute", top: -10, right: -10, width: 26, height: 26, background: "#f97316", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.78rem", boxShadow: "0 2px 8px rgba(249,115,22,0.4)" }} aria-hidden="true">{step.num}</div>
                    </div>
                  </div>
                  <div>{step.right && <div className="card-hover" style={{ background: "white", borderRadius: 18, padding: 26, border: "2px solid #bfdbfe", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}><h3 style={{ fontFamily: displayFont, fontSize: "1.2rem", fontWeight: 700, color: "#0f1f4f", marginBottom: 8 }}>{step.title}</h3><p style={{ color: "#4b5563", lineHeight: 1.65, margin: 0, fontSize: "0.9rem" }}>{step.desc}</p></div>}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══════ PERFORMANS SİSTEMİ ══════ */}
        <section aria-labelledby="performans-heading" style={{ padding: "88px 16px", background: "linear-gradient(135deg, #1e3a8a, #1e40af)", position: "relative", overflow: "hidden" }}>
          <div className="dot-bg" style={{ position: "absolute", inset: 0, opacity: 0.09 }} aria-hidden="true" />
          <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 id="performans-heading" style={{ fontFamily: displayFont, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "white", lineHeight: 1.3 }}>
                Sistemimiz, motivasyon programı değil.<br />
                <span style={{ color: "#fdba74" }}>Bir Performans Sistemidir.</span>
              </h2>
            </div>
            <div className="grid-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28, marginBottom: 48 }}>
              {[
                { icon: <IconBarChart style={{ width: 30, height: 30, color: "white" }} />, title: "Ölçülebilir", desc: "Her hafta ve her ay somut verilerle ilerleme takip edilir" },
                { icon: <IconFileCheck style={{ width: 30, height: 30, color: "white" }} />, title: "Raporlanabilir", desc: "Velilere detaylı performans raporları düzenli olarak sunulur" },
                { icon: <IconTrendingUp style={{ width: 30, height: 30, color: "white" }} />, title: "Sürdürülebilir", desc: "Yapılandırılmış sistem sayesinde disiplin sürekli hale gelir" },
              ].map((item, i) => (
                <article key={i} className="card-hover" style={{ background: "rgba(255,255,255,0.09)", borderRadius: 20, padding: 30, border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
                  <div style={{ width: 60, height: 60, background: "#f97316", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, boxShadow: "0 4px 14px rgba(249,115,22,0.4)" }} aria-hidden="true">{item.icon}</div>
                  <h3 style={{ fontFamily: displayFont, fontSize: "1.35rem", fontWeight: 700, color: "white", marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ color: "#bfdbfe", lineHeight: 1.65, margin: 0, fontSize: "0.92rem" }}>{item.desc}</p>
                </article>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <IconCheckCircle style={{ width: 30, height: 30, color: "#fdba74" }} aria-hidden="true" />
              <p style={{ fontSize: "1.15rem", fontWeight: 600, color: "white", margin: 0 }}>Sistem + Disiplin + Psikolojik Dayanıklılık = <strong style={{ color: "#fdba74" }}>Başarı</strong></p>
            </div>
          </div>
        </section>

        {/* ══════ VELİ & ÖĞRENCİ ══════ */}
        <section aria-labelledby="veli-ogrenci-heading" style={{ padding: "88px 16px", background: "white" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 id="veli-ogrenci-heading" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>Veli ve Öğrenciler İçin</h2>
            <div className="grid-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 40 }}>
              <div className="card-hover" style={{ background: "linear-gradient(135deg, #eff6ff, white)", borderRadius: 20, padding: 40, border: "2px solid #bfdbfe", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
                  <div style={{ width: 60, height: 60, background: "#1e3a8a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(30,58,138,0.28)" }} aria-hidden="true"><IconUsers style={{ width: 30, height: 30, color: "white" }} /></div>
                  <h3 style={{ fontFamily: displayFont, fontSize: "1.9rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>Sayın Veli</h3>
                </div>
                <p style={{ fontSize: "1.05rem", color: "#374151", lineHeight: 1.75, marginBottom: 10 }}>Çocuğunuzun <strong style={{ color: "#1e3a8a" }}>potansiyeli var.</strong></p>
                <p style={{ fontSize: "1.05rem", color: "#374151", lineHeight: 1.75, marginBottom: 22 }}>Ancak potansiyel, <strong style={{ color: "#c2410c" }}>sistemle performansa dönüşür.</strong></p>
                <div style={{ background: "white", borderRadius: 12, padding: 22, border: "1px solid #bfdbfe", marginBottom: 22 }}>
                  {[{ icon: <IconHeart style={{ width: 22, height: 22, color: "#2563eb" }} />, text: <span>Her ay <strong style={{ color: "#1e3a8a" }}>detaylı performans raporu</strong> sunuyoruz.</span> }, { icon: <IconTarget style={{ width: 22, height: 22, color: "#2563eb" }} />, text: <span>Süreç <strong style={{ color: "#1e3a8a" }}>şeffaf ve ölçülebilir.</strong></span> }].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i === 0 ? 12 : 0 }}><span style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">{item.icon}</span><p style={{ color: "#374151", lineHeight: 1.6, margin: 0 }}>{item.text}</p></div>
                  ))}
                </div>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>Birlikte, çocuğunuzun başarısını yapılandırıyoruz.</p>
              </div>
              <div className="card-hover" style={{ background: "linear-gradient(135deg, #fff7ed, white)", borderRadius: 20, padding: 40, border: "2px solid #fed7aa", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
                  <div style={{ width: 60, height: 60, background: "#c2410c", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(194,65,12,0.28)" }} aria-hidden="true"><IconBookOpen style={{ width: 30, height: 30, color: "white" }} /></div>
                  <h3 style={{ fontFamily: displayFont, fontSize: "1.9rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>Sevgili Öğrenci</h3>
                </div>
                <p style={{ fontSize: "1.05rem", color: "#374151", lineHeight: 1.75, marginBottom: 10 }}>Bu süreçte <strong style={{ color: "#1e3a8a" }}>yalnız değilsin.</strong></p>
                <p style={{ fontSize: "1.05rem", color: "#374151", lineHeight: 1.75, marginBottom: 22 }}>Ama başarı <strong style={{ color: "#c2410c" }}>tesadüf değil.</strong></p>
                <div style={{ background: "white", borderRadius: 12, padding: 22, border: "1px solid #fed7aa", marginBottom: 22 }}>
                  {[{ n: 1, text: "Seni sisteme alırız" }, { n: 2, text: "Takip ederiz" }, { n: 3, text: "Geliştiririz" }].map((item) => (
                    <div key={item.n} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}><div style={{ width: 30, height: 30, background: "#ea580c", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0, fontSize: "0.85rem" }} aria-hidden="true">{item.n}</div><p style={{ color: "#374151", fontWeight: 500, margin: 0 }}>{item.text}</p></div>
                  ))}
                </div>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f1f4f", margin: 0 }}>Sen çalış, biz sistemle destekleyelim.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ YORUMLAR ══════ */}
        <section aria-labelledby="yorumlar-heading" style={{ padding: "88px 0", background: "linear-gradient(135deg, #f8faff, #eff6ff)", overflow: "hidden" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48, padding: "0 16px" }}>
              <div style={{ display: "inline-block", marginBottom: 14, padding: "7px 18px", background: "#dbeafe", borderRadius: 9999 }}>
                <span style={{ color: "#1e40af", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.06em" }}>YORUMLAR</span>
              </div>
              <h2 id="yorumlar-heading" style={{ fontFamily: displayFont, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>Veli ve Öğrenciler Ne Diyor?</h2>
              <p style={{ fontSize: "1.05rem", color: "#4b5563", maxWidth: 560, margin: "0 auto" }}>Sistemi deneyimleyenlerin gözünden</p>
            </div>
          </div>
          <ReviewsCarousel />
        </section>

        {/* ══════ CTA ══════ */}
        <section id="İletişim" aria-labelledby="cta-heading" style={{ padding: "96px 16px", background: "linear-gradient(135deg, #1e3a8a, #1e40af, #1e3a8a)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 360, height: 360, background: "rgba(249,115,22,0.18)", borderRadius: "50%", filter: "blur(64px)" }} aria-hidden="true" />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 360, height: 360, background: "rgba(30,64,175,0.28)", borderRadius: "50%", filter: "blur(64px)" }} aria-hidden="true" />
          <div className="dot-bg" style={{ position: "absolute", inset: 0, opacity: 0.09 }} aria-hidden="true" />
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <h2 id="cta-heading" style={{ fontFamily: displayFont, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "white", lineHeight: 1.3, marginBottom: 22 }}>
              Sıradan bir koçluk değil,<br />
              <span style={{ color: "#fdba74" }}>yapılandırılmış bir performans modeli</span><br />
              arıyorsanız...
            </h2>
            <p style={{ fontSize: "1.1rem", color: "#bfdbfe", marginBottom: 40, lineHeight: 1.75 }}>Potansiyeli sistematik bir şekilde performansa dönüştürme zamanı.</p>
            <button onClick={openModal} className="btn-main" style={{ background: "white", color: "#1e3a8a", border: "none", padding: "18px 44px", borderRadius: 12, fontWeight: 700, fontSize: "1.1rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 12, margin: "0 auto", boxShadow: "0 8px 32px rgba(0,0,0,0.28)", transition: "all 0.25s" }}>
              <IconCalendar style={{ width: 22, height: 22 }} aria-hidden="true" />
              Ücretsiz Ön Görüşme Planlayın
              <IconArrowRight style={{ width: 22, height: 22 }} aria-hidden="true" />
            </button>
            <div className="cta-grid" style={{ marginTop: 52, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {[{ val: "30", label: "Öğrenci İle Sınırlı Kontenjan" }, { val: "1:1", label: "Bireysel Takip" }, { val: "100%", label: "Ölçülebilir Sistem" }].map((item, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.09)", borderRadius: 14, padding: 22, border: "1px solid rgba(255,255,255,0.18)" }}>
                  <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#fdba74", marginBottom: 7 }}>{item.val}</div>
                  <div style={{ fontSize: "0.83rem", color: "#bfdbfe" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ FOOTER ══════ */}
        <footer style={{ background: "linear-gradient(135deg, #0f1f4f, #1e3a8a)", color: "white" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 16px" }}>
            <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, marginBottom: 32 }}>
              <div>
                <p style={{ fontFamily: displayFont, fontSize: "1.45rem", fontWeight: 700, color: "#fdba74", marginBottom: 14, marginTop: 0 }}>Öğrenci Koçu Adana</p>
                <p style={{ color: "#bfdbfe", lineHeight: 1.75, margin: 0, fontSize: "0.92rem" }}>LGS ve YKS öğrencileri için yapılandırılmış Akademik Performans ve Psikolojik Dayanıklılık Modeli</p>
              </div>
              <nav aria-label="İletişim bilgileri">
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#fdba74", margin: "0 0 14px" }}>İletişim</h3>
                {[{ Icon: IconPhone, text: "0547 380 38 01" }, { Icon: IconPhone, text: "0540 380 38 01" }, { Icon: IconMail, text: "ogrencikocuadana@gmail.com" }, { Icon: IconMapPin, text: "Adana, Türkiye" }].map(({ Icon, text }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11, color: "#bfdbfe" }}><Icon style={{ width: 18, height: 18, flexShrink: 0 }} aria-hidden="true" /><span style={{ fontSize: "0.9rem" }}>{text}</span></div>
                ))}
              </nav>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#fdba74", margin: "0 0 14px" }}>Çalışma Saatleri</h3>
                {["Pazartesi – Cuma: 10:00 – 20:00", "Cumartesi: 10:00 – 17:00", "Pazar: Kapalı"].map((t, i) => (<p key={i} style={{ color: "#bfdbfe", marginBottom: 8, fontSize: "0.9rem" }}>{t}</p>))}
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.83rem", margin: 0 }}>© 2026 Öğrenci Koçu Adana. Tüm hakları saklıdır.</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.83rem", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>Başarı için sistematik yaklaşım <IconHeart style={{ width: 14, height: 14, color: "#fb923c" }} filled aria-hidden="true" /></p>
            </div>
          </div>
        </footer>

        {/* ══════ WHATSAPP ══════ */}
        <a
          href="https://wa.me/905473803801?text=Merhaba,%20bilgi%20almak%20istiyorum"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile iletişime geç"
          style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, width: 62, height: 62, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(34,197,94,0.4)", transition: "all 0.3s ease", textDecoration: "none" }}
        >
          <IconMessageCircle style={{ width: 30, height: 30, color: "white" }} aria-hidden="true" />
          <span style={{ position: "absolute", top: -4, right: -4, width: 15, height: 15, background: "#ef4444", borderRadius: "50%" }} aria-hidden="true" />
          <span className="ping" style={{ position: "absolute", top: -4, right: -4, width: 15, height: 15, background: "#ef4444", borderRadius: "50%" }} aria-hidden="true" />
        </a>
      </div>
    </>
  );
}