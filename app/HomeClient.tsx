"use client";

import { useState, useEffect, useRef, CSSProperties, ReactNode, FormEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const CountdownSection = dynamic(() => import("./CountdownSection"), { ssr: false });

interface IconProps { className?: string; style?: CSSProperties; filled?: boolean; }
interface PricingCardProps { badge: string; icon: ReactNode; iconBg: string; title: string; features: string[]; onOpen: () => void; featured?: boolean; }
interface FormData { parentName: string; studentName: string; phone: string; email: string; grade: string; message: string; }

// ─── SVG İkonlar ─────────────────────────────────────────────────────────────
const IconCalendar     = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 2v4M16 2v4"/><rect height="18" rx="2" width="18" x="3" y="4"/><path d="M3 10h18"/></svg>);
const IconArrowRight   = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>);
const IconTrendingDown = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>);
const IconBrain        = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/></svg>);
const IconAlertCircle  = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>);
const IconSmartphone   = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect height="20" rx="2" ry="2" width="14" x="5" y="2"/><path d="M12 18h.01"/></svg>);
const IconTarget       = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);
const IconBarChart     = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/></svg>);
const IconFileText     = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>);
const IconCheck        = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>);
const IconUsers        = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const IconClock        = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const IconLightbulb    = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/></svg>);
const IconSparkles     = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>);
const IconStar         = ({ style, filled }: IconProps) => (<svg style={style} fill={filled ? "white" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const IconBolt         = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>);
const IconMessageCircle= ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>);
const IconPhone        = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const IconMail         = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect height="16" rx="2" width="20" x="2" y="4"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const IconMapPin       = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>);
const IconHeart        = ({ style, filled }: IconProps) => (<svg style={style} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>);
const IconBookOpen     = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
const IconSend         = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="20" height="20"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>);
const IconX            = () => (<svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" width="22" height="22"><path d="M18 6 6 18M6 6l12 12"/></svg>);
const IconChevronDown  = () => (<svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="18" height="18"><path d="m6 9 6 6 6-6"/></svg>);
const IconUser         = ({ style }: IconProps) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 7a4 4 11-8 0 4 4 018 0zM12 14a7 7 00-7 7h14a7 7 00-7-7z"/></svg>);

const displayFont = "var(--font-display), 'Bricolage Grotesque', sans-serif";

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, delay = 0, style }: {
  children: ReactNode; delay?: number; style?: CSSProperties;
}) {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </section>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function AppointmentModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<FormData>({ parentName: "", studentName: "", phone: "", email: "", grade: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("https://formspree.io/f/xjgeanor", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ "Veli Adı": form.parentName, "Öğrenci Adı": form.studentName, "Telefon": form.phone, "E-posta": form.email, "Sınıf": form.grade, "Mesaj": form.message }) });
    setSubmitted(true);
    const txt = encodeURIComponent(`Merhaba! Ön görüşme talebinde bulunmak istiyorum.\n\n👤 Veli: ${form.parentName}\n🎓 Öğrenci: ${form.studentName}\n📱 Telefon: ${form.phone}\n📚 Sınıf: ${form.grade}. Sınıf\n${form.message ? `💬 Mesaj: ${form.message}` : ""}`);
    setTimeout(() => window.open(`https://wa.me/905473803801?text=${txt}`, "_blank"), 800);
  };
  const inp: CSSProperties = { width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12, border: "2px solid #e5e7eb", borderRadius: 8, fontSize: "0.95rem", outline: "none", fontFamily: "inherit", background: "white", transition: "border-color 0.2s", appearance: "none" as const, color: "#111827" };
  const lbl: CSSProperties = { display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: 8 };
  const ico: CSSProperties = { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" };

  return (
    <>
      <style>{`.modal-inp{color:#111827!important}.modal-inp::placeholder{color:#9ca3af!important;opacity:1}.modal-inp:focus{border-color:#1e40af!important;box-shadow:0 0 0 3px rgba(30,64,175,0.12)!important}@keyframes modal-bg-in{from{opacity:0}to{opacity:1}}@keyframes modal-box-in{from{opacity:0;transform:translateY(28px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}@media(max-width:540px){.modal-half{grid-template-columns:1fr!important}}`}</style>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", backdropFilter: "blur(5px)", zIndex: 9998, animation: "modal-bg-in 0.22s ease" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 28px 80px rgba(0,0,0,0.28)", animation: "modal-box-in 0.28s cubic-bezier(.22,.68,0,1.2)", pointerEvents: "all" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(135deg,#1e3a8a,#1e40af)", padding: "24px 28px", borderRadius: "20px 20px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontFamily: displayFont, fontSize: "1.6rem", fontWeight: 800, color: "white", margin: "0 0 4px" }}>Ücretsiz Ön Görüşme</h2>
              <p style={{ color: "#bfdbfe", margin: 0, fontSize: "0.875rem" }}>Formu doldurun, en kısa sürede size dönelim</p>
            </div>
            <button onClick={onClose} aria-label="Kapat" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", flexShrink: 0 }}><IconX /></button>
          </div>
          {submitted ? (
            <div style={{ padding: "48px 28px", textAlign: "center" }}>
              <div style={{ width: 72, height: 72, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}><svg width="36" height="36" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></div>
              <h3 style={{ fontFamily: displayFont, fontSize: "1.6rem", fontWeight: 800, color: "#0f1f4f", margin: "0 0 12px" }}>Talebiniz Alındı! 🎉</h3>
              <p style={{ color: "#4b5563", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 8px" }}>En kısa sürede <strong style={{ color: "#1e3a8a" }}>{form.phone || "belirttiğiniz numara"}</strong>&apos;dan sizi arayacağız.</p>
              <p style={{ color: "#6b7280", fontSize: "0.875rem", maxWidth: 400, margin: "0 auto 28px" }}>WhatsApp otomatik açılmadıysa <a href="https://wa.me/905473803801" target="_blank" rel="noopener noreferrer" style={{ color: "#1e3a8a", fontWeight: 600 }}>buraya tıklayın</a>.</p>
              <button onClick={onClose} style={{ background: "linear-gradient(135deg,#1e3a8a,#1e40af)", color: "white", border: "none", padding: "13px 32px", borderRadius: 10, fontWeight: 700, fontSize: "1rem", cursor: "pointer", fontFamily: "inherit" }}>Kapat</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: "28px 28px 32px" }}>
              <div className="modal-half" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <div><label style={lbl}>Veli Adı Soyadı *</label><div style={{ position: "relative" }}><span style={ico}><IconUser style={{ width: 18, height: 18 }} /></span><input type="text" name="parentName" required placeholder="Adınız Soyadınız" value={form.parentName} onChange={handleChange} className="modal-inp" style={inp} /></div></div>
                <div><label style={lbl}>Öğrenci Adı *</label><div style={{ position: "relative" }}><span style={ico}><IconUser style={{ width: 18, height: 18 }} /></span><input type="text" name="studentName" required placeholder="Öğrencinin Adı" value={form.studentName} onChange={handleChange} className="modal-inp" style={inp} /></div></div>
              </div>
              <div className="modal-half" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <div><label style={lbl}>Telefon *</label><div style={{ position: "relative" }}><span style={ico}><IconPhone style={{ width: 18, height: 18 }} /></span><input type="tel" name="phone" required placeholder="0555 555 55 55" value={form.phone} onChange={handleChange} className="modal-inp" style={inp} /></div></div>
                <div><label style={lbl}>E-posta <span style={{ fontWeight: 400, color: "#9ca3af" }}>(isteğe bağlı)</span></label><div style={{ position: "relative" }}><span style={ico}><IconMail style={{ width: 18, height: 18 }} /></span><input type="email" name="email" placeholder="ornek@email.com" value={form.email} onChange={handleChange} className="modal-inp" style={inp} /></div></div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={lbl}>Öğrencinin Sınıfı *</label>
                <div style={{ position: "relative" }}>
                  <span style={ico}><IconBookOpen style={{ width: 18, height: 18 }} /></span>
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}><IconChevronDown /></span>
                  <select name="grade" required value={form.grade} onChange={handleChange} className="modal-inp" style={{ ...inp, paddingRight: 36, cursor: "pointer" }}>
                    <option value="">Sınıf Seçin</option>
                    <option value="7">7. Sınıf (LGS)</option>
                    <option value="8">8. Sınıf (LGS)</option>
                    <option value="11">11. Sınıf (YKS)</option>
                    <option value="12">12. Sınıf (YKS)</option>
                    <option value="Mezun">Mezun</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={lbl}>Mesaj <span style={{ fontWeight: 400, color: "#9ca3af" }}>(isteğe bağlı)</span></label>
                <textarea name="message" rows={3} placeholder="Öğrencinin durumu, hedefleri veya sorularınız..." value={form.message} onChange={handleChange} className="modal-inp" style={{ ...inp, paddingLeft: 16, resize: "none", lineHeight: 1.65 }} />
              </div>
              <button type="submit" style={{ width: "100%", padding: "14px 24px", background: "linear-gradient(135deg,#1e3a8a,#1e40af)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit" }}>
                <IconSend style={{ width: 18, height: 18 }} /> Ön Görüşme Talep Et
              </button>
              <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", margin: "12px 0 0" }}>🔒 Bilgileriniz yalnızca iletişim için kullanılır</p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

// ─── WHATSAPP BUTONU ─────────────────────────────────────────────────────────
function WhatsAppButon() {
  const [hov, setHov] = useState(false);
  const [gorunur, setGorunur] = useState(false);

  // Sayfa açıldıktan 3 saniye sonra baloncuğu otomatik göster, 6 saniye sonra kapat
  useEffect(() => {
    const ac = setTimeout(() => setGorunur(true), 3000);
    const kapat = setTimeout(() => setGorunur(false), 9000);
    return () => { clearTimeout(ac); clearTimeout(kapat); };
  }, []);

  const balonAcik = hov || gorunur;

  return (
    <div
      style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", alignItems: "flex-end", gap: 12 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Baloncuk */}
      <div style={{
        background: "white",
        borderRadius: "16px 16px 4px 16px",
        padding: "12px 16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        maxWidth: 220,
        opacity: balonAcik ? 1 : 0,
        transform: balonAcik ? "translateX(0) scale(1)" : "translateX(12px) scale(0.95)",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        pointerEvents: balonAcik ? "auto" : "none",
        border: "1.5px solid #e5e7eb",
      }}>
        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a2e4a", margin: "0 0 4px", lineHeight: 1.4 }}>
          Sormak istediğin bir şey mi var? 👋
        </p>
        <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
          WhatsApp&apos;tan bize yaz,<br />hemen dönelim!
        </p>
        {/* Küçük ok */}
        <div style={{
          position: "absolute", bottom: 14, right: -8,
          width: 0, height: 0,
          borderTop: "8px solid transparent",
          borderBottom: "8px solid transparent",
          borderLeft: "8px solid white",
          filter: "drop-shadow(1px 0 1px rgba(0,0,0,0.06))",
        }} />
      </div>

      {/* Buton */}
      <a
        href="https://wa.me/905473803801?text=Merhaba,%20%C3%B6%C4%9Frenci%20ko%C3%A7lu%C4%9Fu%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile iletişime geç"
        style={{
          width: 60, height: 60,
          background: "#22c55e",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(34,197,94,0.4)",
          transition: "transform 0.2s, box-shadow 0.2s",
          textDecoration: "none",
          transform: hov ? "scale(1.08)" : "scale(1)",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <IconMessageCircle style={{ width: 28, height: 28, color: "white" }} />
        <span style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, background: "#ef4444", borderRadius: "50%" }} />
        <span className="ping" style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, background: "#ef4444", borderRadius: "50%" }} />
      </a>
    </div>
  );
}

// ─── SORUN KARTI ─────────────────────────────────────────────────────────────
function SorunKarti({ ikon, metin, renk, acik, sinir }: {
  ikon: ReactNode; metin: string; renk: string; acik: string; sinir: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 18px",
        background: hov ? acik : "white",
        borderRadius: 12,
        border: `1.5px solid ${hov ? sinir : "#e5e7eb"}`,
        transition: "all 0.2s ease",
        cursor: "default",
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: hov ? renk : "#f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "background 0.2s",
      }}>
        <span style={{ color: hov ? "white" : renk, display: "flex", transition: "color 0.2s" }}>
          {ikon}
        </span>
      </div>
      <span style={{ fontSize: "0.9rem", color: hov ? renk : "#374151", fontWeight: hov ? 600 : 500, transition: "color 0.2s" }}>
        {metin}
      </span>
    </div>
  );
}

// ─── PRICING CARD ─────────────────────────────────────────────────────────────
function PricingCard({ badge, icon, iconBg, title, features, onOpen, featured }: PricingCardProps) {
  const [hov, setHov] = useState(false);
  if (featured) {
    return (
      <div style={{ position: "relative", marginTop: -8 }}>
        <div style={{ position: "absolute", inset: -3, borderRadius: 28, background: "linear-gradient(135deg,#f97316,#1e40af,#f97316)", zIndex: 0, filter: "blur(1px)", opacity: 0.7 }} />
        <article style={{ position: "relative", zIndex: 1, background: "linear-gradient(160deg,#1e3a8a 0%,#1e40af 60%,#1a35a0 100%)", borderRadius: 26, padding: "40px 28px 32px", boxShadow: "0 20px 60px rgba(30,58,138,0.35)" }}>
          <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#f97316,#ea580c)", borderRadius: 9999, padding: "5px 18px", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <IconStar style={{ width: 12, height: 12, color: "white" }} filled /><span style={{ color: "white", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.06em" }}>ÖNERİLEN</span>
          </div>
          <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.12)", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, border: "1px solid rgba(255,255,255,0.2)" }}>{icon}</div>
          <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", borderRadius: 9999, padding: "3px 12px" }}><span style={{ color: "white", fontWeight: 700, fontSize: "0.68rem" }}>{badge}</span></div>
          <h3 style={{ fontFamily: displayFont, fontSize: "1.15rem", fontWeight: 700, color: "white", margin: "0 0 6px", lineHeight: 1.3 }}>{title}</h3>
          <p style={{ fontSize: "0.78rem", color: "rgba(191,219,254,0.8)", margin: "0 0 18px" }}>En kapsamlı program — akademik + psikolojik</p>
          <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 16 }} />
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: i === 0 ? "rgba(253,186,116,0.25)" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><IconCheck style={{ width: 10, height: 10, color: i === 0 ? "#fdba74" : "rgba(255,255,255,0.7)" }} /></div>
              <span style={{ fontSize: "0.85rem", color: i === 0 ? "#fdba74" : "rgba(255,255,255,0.88)", lineHeight: 1.55, fontWeight: i === 0 ? 600 : 400 }}>{f}</span>
            </div>
          ))}
          <button onClick={onOpen} style={{ width: "100%", padding: "13px", background: "white", color: "#1e3a8a", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", marginTop: 20, fontSize: "0.9rem", fontFamily: "inherit" }}>Ön Görüşme İste →</button>
        </article>
      </div>
    );
  }
  return (
    <article onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: "white", borderRadius: 22, padding: "32px 26px 28px", border: hov ? "2px solid #bfdbfe" : "2px solid #e5e7eb", position: "relative", transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)", transform: hov ? "translateY(-6px)" : "translateY(0)", boxShadow: hov ? "0 24px 48px rgba(30,58,138,0.10)" : "0 2px 10px rgba(0,0,0,0.04)" }}>
      <div style={{ position: "absolute", top: -12, left: 24, background: "white", border: "1.5px solid #e5e7eb", borderRadius: 9999, padding: "3px 12px" }}><span style={{ color: "#6b7280", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.08em" }}>{badge}</span></div>
      <div style={{ width: 50, height: 50, background: iconBg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontFamily: displayFont, fontSize: "1.1rem", fontWeight: 700, color: "#0f1f4f", margin: "0 0 18px", lineHeight: 1.3 }}>{title}</h3>
      <div style={{ height: 1, background: "linear-gradient(90deg,#e5e7eb,transparent)", marginBottom: 16 }} />
      {features.map((f, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 10 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><IconCheck style={{ width: 10, height: 10, color: "#2563eb" }} /></div>
          <span style={{ fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.6 }}>{f}</span>
        </div>
      ))}
      <button onClick={onOpen} style={{ width: "100%", padding: "12px", background: hov ? "#1e3a8a" : "white", color: hov ? "white" : "#1e3a8a", border: "2px solid #1e3a8a", borderRadius: 10, fontWeight: 700, cursor: "pointer", marginTop: 20, transition: "all 0.25s", fontSize: "0.875rem", fontFamily: "inherit" }}>Ön Görüşme İste</button>
    </article>
  );
}

// ─── ANA BİLEŞEN ─────────────────────────────────────────────────────────────
export default function HomeClient() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const openModal  = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const sistemTabs = [
    {
      baslik: "Bireysel performans koçluğu",
      ikon: <IconTarget style={{ width: 20, height: 20, color: "#1e3a8a" }} />,
      aciklama: "Her öğrenci için haftalık bire-bir görüşme yapılır. Öğrencinin güçlü ve zayıf yönleri belirlenerek kişiye özel akademik plan hazırlanır. Kaynak seçiminden günlük programa kadar her adım takip edilir.",
      detaylar: ["Haftalık bireysel koçluk görüşmesi", "Öğrenciye özel akademik planlama", "Kaynak ve ders takip sistemi", "Deneme analizi ve net artış takibi"],
    },
    {
      baslik: "Psikolojik dayanıklılık eğitimi",
      ikon: <IconBrain style={{ width: 20, height: 20, color: "#1e3a8a" }} />,
      aciklama: "Sınav kaygısı, motivasyon düşüklüğü ve telefon bağımlılığı akademik başarının önündeki en büyük engellerdir. Haftalık seminerlerle öğrenci bu engellerle başa çıkmayı öğrenir.",
      detaylar: ["Sınav kaygısı ve stres yönetimi", "Zaman yönetimi ve odaklanma teknikleri", "Hızlı okuma eğitimi", "Teknoloji bağımlılığı ve dikkat yönetimi"],
    },
    {
      baslik: "Sistemli akademik takip",
      ikon: <IconBarChart style={{ width: 20, height: 20, color: "#1e3a8a" }} />,
      aciklama: "İlerlemeyi sezgiyle değil, veriyle ölçüyoruz. Her ay öğrencinin net gelişimi, konu bazlı performansı ve çalışma düzeni analiz edilerek veliye şeffaf bir rapor sunulur.",
      detaylar: ["Aylık detaylı performans analizi", "Net artış odaklı değerlendirme", "Veli performans raporu", "Strateji güncellemesi ve yol haritası"],
    },
    {
      baslik: "Nasıl işliyor?",
      ikon: <IconFileText style={{ width: 20, height: 20, color: "#1e3a8a" }} />,
      aciklama: "Ücretsiz ön görüşmeyle başlıyoruz. Öğrencinin mevcut durumunu, hedeflerini ve ihtiyaçlarını birlikte değerlendiriyor, kişisel sistem kuruyoruz. Haftalık takip ve aylık raporla süreci şeffaf yönetiyoruz.",
      detaylar: ["1. Ücretsiz ön görüşme (30 dk)", "2. Başlangıç performans analizi", "3. Kişisel sistem kurulumu", "4. Haftalık takip + aylık rapor"],
    },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: var(--font-body), 'Plus Jakarta Sans', sans-serif; }
        .dot-bg { background-image: radial-gradient(#1e3a8a 1px, transparent 1px); background-size: 28px 28px; }
        .btn-main:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .btn-outline:hover { background: #eff6ff !important; border-color: #93c5fd !important; }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        .ping { animation: ping 1.5s ease-in-out infinite; }
        @media (max-width: 768px) {
          .grid-cols-3  { grid-template-columns: 1fr !important; }
          .grid-cols-2  { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .stats-grid   { grid-template-columns: repeat(2,1fr) !important; }
          .hero-h1      { font-size: 2.1rem !important; }
          .cta-grid     { grid-template-columns: 1fr !important; }
          .footer-grid  { grid-template-columns: 1fr !important; }
          .sistem-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {showModal && <AppointmentModal onClose={closeModal} />}

      <div style={{ minHeight: "100vh", background: "white" }}>

        {/* ══════ 1 — HERO ══════ */}
        <section aria-labelledby="hero-heading" style={{ background: "linear-gradient(150deg,#ffffff 0%,#eef4ff 45%,#fff8f3 100%)", padding: "130px 16px 100px", position: "relative", overflow: "hidden" }}>
          <div className="dot-bg" style={{ position: "absolute", inset: 0, opacity: 0.03 }} aria-hidden="true" />
          <div style={{ position: "absolute", top: -120, right: -80, width: 500, height: 500, background: "radial-gradient(circle,rgba(30,58,138,0.07) 0%,transparent 70%)", pointerEvents: "none" }} aria-hidden="true" />
          <div style={{ position: "absolute", bottom: -80, left: -60, width: 400, height: 400, background: "radial-gradient(circle,rgba(194,65,12,0.05) 0%,transparent 70%)", pointerEvents: "none" }} aria-hidden="true" />
          <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32, padding: "8px 18px", background: "white", borderRadius: 9999, border: "1.5px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
              <span style={{ color: "#374151", fontWeight: 600, fontSize: "0.82rem" }}>LGS &amp; YKS Öğrencileri İçin Online &amp; Yüz Yüze Özel Koçluk</span>
            </div>
            <h1 id="hero-heading" className="hero-h1" style={{ fontFamily: displayFont, fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 800, color: "#0f1f4f", lineHeight: 1.18, margin: "0 auto 24px", maxWidth: 820 }}>
              Adana&apos;nın LGS ve YKS Koçu —{" "}
              <span style={{ color: "#1d4ed8" }}>Sınav Başarısı</span> Tesadüf Değil,{" "}
              <span style={{ background: "linear-gradient(90deg,#1e3a8a,#2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sistemin Sonucudur</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#4b5563", lineHeight: 1.75, maxWidth: 580, margin: "0 auto 40px" }}>
              İki uzman psikolojik danışman olarak LGS ve YKS öğrencilerine{" "}
              <strong style={{ color: "#0f1f4f" }}>akademik koçluk + psikolojik destek</strong> sunuyoruz.
              Yüz yüze veya online, bireysel takip ve ölçülebilir sonuçlar.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
              <button onClick={openModal} className="btn-main" style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", color: "white", border: "none", padding: "16px 34px", borderRadius: 10, fontWeight: 700, fontSize: "1.05rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 6px 24px rgba(30,58,138,0.3)", transition: "all 0.25s", fontFamily: "inherit" }}>
                <IconCalendar style={{ width: 20, height: 20 }} /> Ücretsiz Ön Görüşme Al <IconArrowRight style={{ width: 18, height: 18 }} />
              </button>
              <a href="#sistemimiz" className="btn-outline" style={{ background: "white", color: "#1e3a8a", border: "2px solid #dbeafe", padding: "16px 30px", borderRadius: 10, fontWeight: 600, fontSize: "1.05rem", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", transition: "all 0.25s" }}>
                Nasıl çalışıyoruz? <IconArrowRight style={{ width: 18, height: 18 }} />
              </a>
            </div>
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, maxWidth: 720, margin: "0 auto" }}>
              {[
                { val: "LGS", label: "Öğrenci Koçluğu",   icon: "🎯", color: "#1e3a8a", bg: "#eff6ff", border: "#dbeafe" },
                { val: "YKS", label: "Öğrenci Koçluğu",   icon: "🏆", color: "#1e3a8a", bg: "#eff6ff", border: "#dbeafe" },
                { val: "30",  label: "Öğrenci Kapasitesi", icon: "👥", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
                { val: "1:1", label: "Bireysel Takip",     icon: "📊", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
              ].map((s, i) => (
                <div key={i} style={{ background: s.bg, borderRadius: 14, padding: "16px 10px", border: `1.5px solid ${s.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: "1.3rem", marginBottom: 5 }}>{s.icon}</div>
                  <div style={{ fontSize: "1.45rem", fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4, fontFamily: displayFont }}>{s.val}</div>
                  <div style={{ fontSize: "0.68rem", color: "#6b7280", fontWeight: 500, lineHeight: 1.3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ 2 — GERİ SAYIM ══════ */}
        <CountdownSection />

        {/* ══════ 3 — SORUNLAR (kompakt) ══════ */}
        <Reveal style={{ padding: "72px 16px", background: "white" }} delay={0}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <h2 style={{ fontFamily: displayFont, fontSize: "clamp(1.7rem,4vw,2.5rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>Tanıdık Geliyor mu?</h2>
              <p style={{ fontSize: "1rem", color: "#4b5563", maxWidth: 500, margin: "0 auto" }}>Birçok öğrenci ve veli bu sorunlarla karşılaşıyor</p>
            </div>
            <div className="grid-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { ikon: <IconUsers style={{ width: 16, height: 16 }} />,        metin: "Çalışıyor ama verimsiz geçiyor",          renk: "#1a2e4a", acik: "#e8f4fd", sinir: "#bfdbfe" },
                { ikon: <IconAlertCircle style={{ width: 16, height: 16 }} />,  metin: "Nereden başlayacağını bilmiyor",          renk: "#c2410c", acik: "#fff7ed", sinir: "#fed7aa" },
                { ikon: <IconBrain style={{ width: 16, height: 16 }} />,        metin: "Denemede netleri artmıyor",               renk: "#1a2e4a", acik: "#e8f4fd", sinir: "#bfdbfe" },
                { ikon: <IconSmartphone style={{ width: 16, height: 16 }} />,   metin: "Telefon ve kaygı dikkatini bölüyor",      renk: "#c2410c", acik: "#fff7ed", sinir: "#fed7aa" },
                { ikon: <IconTrendingDown style={{ width: 16, height: 16 }} />, metin: "Motivasyonu dalgalı, programsız çalışıyor", renk: "#1a2e4a", acik: "#e8f4fd", sinir: "#bfdbfe" },
                { ikon: <IconLightbulb style={{ width: 16, height: 16 }} />,    metin: "Denemede bildiğini yapamıyor",            renk: "#c2410c", acik: "#fff7ed", sinir: "#fed7aa" },
              ].map((m, i) => (
                <SorunKarti key={i} ikon={m.ikon} metin={m.metin} renk={m.renk} acik={m.acik} sinir={m.sinir} />
              ))}
            </div>
            <div style={{ background: "linear-gradient(90deg,#1a2e4a,#243d61)", borderRadius: 14, padding: "20px 28px", textAlign: "center" }}>
              <p style={{ fontSize: "1.05rem", color: "white", fontWeight: 600, margin: 0 }}>
                Sorun bilgi eksikliği değil — <strong style={{ color: "#f5a623" }}>sistem ve psikolojik dayanıklılık eksikliği.</strong>
              </p>
            </div>
          </div>
        </Reveal>

        {/* ══════ 4 — HAKKIMIZDA MİNİ ══════ */}
        <Reveal style={{ padding: "72px 16px", background: "linear-gradient(135deg,#f8faff,#eff6ff)" }} delay={50}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ display: "inline-block", marginBottom: 12, padding: "6px 16px", background: "#dbeafe", borderRadius: 9999 }}>
                <span style={{ color: "#1e40af", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.06em" }}>KİMİZ?</span>
              </div>
              <h2 style={{ fontFamily: displayFont, fontSize: "clamp(1.7rem,4vw,2.5rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>Alanında Uzman Ekibimiz</h2>
              <p style={{ fontSize: "1rem", color: "#4b5563", maxWidth: 500, margin: "0 auto" }}>İki uzman psikolojik danışman. Akademik koçluk ve psikolojik destek — ikisi bir arada.</p>
            </div>
            <div className="grid-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24, marginBottom: 32 }}>
              {[
                { isim: "Cumali Özdemir", unvan: "Psikolojik Danışman & Öğrenci Koçu", foto: "/cumali-ozdemir.jpeg", renk: "#1e3a8a", bg: "white", border: "#bfdbfe", badge: "bg", etiketler: ["LGS ve YKS akademik koçluğu", "Çalışma sistemi ve zaman yönetimi", "Deneme analizi ve net takibi", "Motivasyon ve hedef belirleme"], ozet: "Hasan Kalyoncu Üniversitesi PDR mezunu. 8 yıldır akademik koçluk, çalışma sistemi ve deneme analizi konularında uzman.", badgeMetin: "Uzman · 8 yıl deneyim" },
                { isim: "Şükran Özdemir", unvan: "Uzman Psikolojik Danışman & Öğrenci Koçu", foto: "/sukran-ozdemir.jpeg", renk: "#c2410c", bg: "white", border: "#fed7aa", badge: "turuncu", etiketler: ["Sınav kaygısı ve stres yönetimi", "Psikolojik dayanıklılık eğitimi", "Duygu düzenleme ve özgüven", "Veli danışmanlığı ve aile iletişimi"], ozet: "Erciyes Üniversitesi lisans, Cerrahpaşa Üniversitesi yüksek lisans. 8 yıldır sınav kaygısı ve psikolojik dayanıklılık uzmanı.", badgeMetin: "Uzman PDR · 8 yıl deneyim" },
              ].map((d, i) => (
                <div key={i} style={{ background: d.bg, borderRadius: 18, padding: "24px", border: `2px solid ${d.border}`, display: "flex", gap: 18, alignItems: "flex-start", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                  <div style={{ width: 76, height: 76, borderRadius: "50%", border: `3px solid ${d.border}`, flexShrink: 0, overflow: "hidden" }}>
                    <Image src={d.foto} alt={d.isim} width={76} height={76} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "inline-block", background: d.renk, color: "white", fontSize: "0.65rem", fontWeight: 700, borderRadius: 9999, padding: "2px 10px", marginBottom: 8 }}>{d.badgeMetin}</div>
                    <h3 style={{ fontFamily: displayFont, fontSize: "1.1rem", fontWeight: 800, color: "#0f1f4f", margin: "0 0 3px" }}>{d.isim}</h3>
                    {d.unvan && <p style={{ fontSize: "0.75rem", color: d.renk, fontWeight: 600, margin: "0 0 10px" }}>{d.unvan}</p>}
                    <p style={{ fontSize: "0.83rem", color: "#4b5563", lineHeight: 1.65, margin: "0 0 12px" }}>{d.ozet}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {d.etiketler.map(t => <span key={t} style={{ background: i === 0 ? "#eff6ff" : "#fff7ed", border: `1px solid ${d.border}`, borderRadius: 6, padding: "2px 9px", fontSize: "0.7rem", fontWeight: 600, color: d.renk }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <a href="/hakkimizda" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#1e3a8a", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", border: "2px solid #bfdbfe", borderRadius: 10, padding: "11px 24px", background: "white" }}>
                Hakkımızda sayfasına git <IconArrowRight style={{ width: 16, height: 16 }} />
              </a>
            </div>
          </div>
        </Reveal>

        {/* ══════ 5 — SİSTEM (tab layout) ══════ */}
        <Reveal style={{ padding: "72px 16px", background: "white" }} delay={0}>
          <div id="sistemimiz" style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ display: "inline-block", marginBottom: 12, padding: "6px 16px", background: "#dbeafe", borderRadius: 9999 }}>
                <span style={{ color: "#1e40af", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.06em" }}>SİSTEMİMİZ</span>
              </div>
              <h2 style={{ fontFamily: displayFont, fontSize: "clamp(1.7rem,4vw,2.5rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>Nasıl Çalışıyoruz?</h2>
              <p style={{ fontSize: "1rem", color: "#4b5563", maxWidth: 500, margin: "0 auto" }}>Akademik performans ve psikolojik dayanıklılık — tek çatı altında, sistematik ve ölçülebilir.</p>
            </div>

            <div className="sistem-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 0, border: "2px solid #e2e8f0", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 32px rgba(26,46,74,0.08)" }}>

              {/* Sol sekmeler — pastel lacivert zemin */}
              <div style={{ borderRight: "2px solid #e2e8f0", background: "#e8f4fd" }}>
                {sistemTabs.map((tab, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "20px 20px",
                      background: activeTab === i ? "white" : "transparent",
                      border: "none",
                      borderLeft: activeTab === i ? "4px solid #f5a623" : "4px solid transparent",
                      borderBottom: i < sistemTabs.length - 1 ? "1px solid rgba(26,46,74,0.08)" : "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: activeTab === i ? "#fff3d6" : "rgba(26,46,74,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "background 0.2s",
                    }}>
                      <span style={{ color: activeTab === i ? "#c2410c" : "#1a2e4a", display: "flex", opacity: activeTab === i ? 1 : 0.5 }}>
                        {tab.ikon}
                      </span>
                    </div>
                    <span style={{
                      fontSize: "0.875rem",
                      fontWeight: activeTab === i ? 700 : 500,
                      color: activeTab === i ? "#1a2e4a" : "#4b6282",
                      lineHeight: 1.4,
                      transition: "color 0.2s",
                    }}>
                      {tab.baslik}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sağ içerik — beyaz zemin */}
              <div style={{ padding: "36px 32px", background: "white" }}>
                {/* Aktif sekme etiketi */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "4px 14px", background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: 9999 }}>
                  <span style={{ color: "#c2410c", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.06em" }}>
                    {["01", "02", "03", "04"][activeTab]}
                  </span>
                </div>
                <h3 style={{ fontFamily: displayFont, fontSize: "1.35rem", fontWeight: 800, color: "#1a2e4a", marginBottom: 14 }}>
                  {sistemTabs[activeTab].baslik}
                </h3>
                <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: 1.8, marginBottom: 24 }}>
                  {sistemTabs[activeTab].aciklama}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sistemTabs[activeTab].detaylar.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fafafa", borderRadius: 10, border: "1.5px solid #e8f4fd" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1a2e4a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconCheck style={{ width: 12, height: 12, color: "white" }} />
                      </div>
                      <span style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{d}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={openModal}
                  style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 8, background: "#f5a623", color: "#1a2e4a", border: "none", padding: "13px 26px", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(245,166,35,0.35)", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#d4891a"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f5a623"; }}
                >
                  <IconCalendar style={{ width: 18, height: 18 }} /> Ücretsiz Ön Görüşme Al
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ══════ MİNİ CTA BANNER ══════ */}
        <Reveal style={{ padding: "0 16px 0" }} delay={0}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1.5px solid #fed7aa", borderRadius: 16, padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, background: "#c2410c", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconClock style={{ width: 22, height: 22, color: "white" }} />
                </div>
                <div>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "#7c2d12", margin: 0 }}>Kontenjan dolmadan ücretsiz ön görüşme al</p>
                  <p style={{ fontSize: "0.82rem", color: "#9a3412", margin: 0, marginTop: 2 }}>En fazla 30 öğrenciyle çalışıyoruz — ilk görüşme tamamen ücretsiz</p>
                </div>
              </div>
              <button onClick={openModal} style={{ background: "#c2410c", color: "white", border: "none", padding: "12px 26px", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", flexShrink: 0 }}>
                Hemen Görüş →
              </button>
            </div>
          </div>
        </Reveal>

        {/* ══════ 6 — PAKETLER ══════ */}
        <Reveal delay={0}>
          <div id="paketler" style={{ padding: "72px 16px" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ display: "inline-block", marginBottom: 12, padding: "6px 16px", background: "#ffedd5", borderRadius: 9999 }}>
                <span style={{ color: "#9a3412", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.06em" }}>PAKETLER</span>
              </div>
              <h2 style={{ fontFamily: displayFont, fontSize: "clamp(1.7rem,4vw,2.5rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>Size Uygun Paketi Seçin</h2>
              <p style={{ fontSize: "1rem", color: "#4b5563", maxWidth: 480, margin: "0 auto" }}>Her öğrencinin ihtiyacı farklı. Size en uygun desteği sunuyoruz.</p>
            </div>
            <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", gap: 18, alignItems: "start" }}>
              <PricingCard badge="TEMEL" icon={<IconSparkles style={{ width: 24, height: 24, color: "#1d4ed8" }} />} iconBg="#dbeafe" title="Akademik Performans Paketi" features={["Haftalık bireysel koçluk görüşmesi", "Öğrenciye özel akademik planlama", "Kaynak ve ders takip sistemi", "Deneme analiz sistemi", "Aylık performans raporu"]} onOpen={openModal} />
              <PricingCard badge="TAM DESTEK" featured icon={<IconStar style={{ width: 24, height: 24, color: "#fdba74" }} />} iconBg="" title="Akademik Performans + Psikolojik Dayanıklılık" features={["Tüm Akademik Performans özellikleri", "Haftalık online seminer", "Sınav kaygısı ve stres yönetimi", "Zaman yönetimi eğitimi", "Hızlı okuma ve dikkat eğitimi", "Detaylı gelişim takibi"]} onOpen={openModal} />
              <PricingCard badge="HIZ ODAKLI" icon={<IconBolt style={{ width: 24, height: 24, color: "#1d4ed8" }} />} iconBg="#dbeafe" title="Sınav Odaklı Hızlı Okuma Programı" features={["4 hafta uygulamalı online eğitim", "21 gün disiplinli ödev sistemi", "365 günlük yazılım desteği", "Veli rapor sistemi", "Moxo Dikkat Testi"]} onOpen={openModal} />
            </div>
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 24px", background: "#f8faff", borderRadius: 12, border: "1.5px solid #e2e8f0" }}>
              <span style={{ fontSize: "1rem" }}>👥</span>
              <p style={{ fontSize: "0.9rem", color: "#374151", margin: 0 }}><strong style={{ color: "#1e3a8a" }}>Sınırlı kontenjan:</strong> Kaliteyi korumak için en fazla <strong style={{ color: "#c2410c" }}>30 öğrenci</strong> ile çalışıyoruz.</p>
            </div>
          </div>
          </div>
        </Reveal>

        {/* ══════ 7 — GÜVEN ŞERİDİ ══════ */}
        <Reveal style={{ padding: "64px 16px", background: "linear-gradient(135deg,#f8faff,#eff6ff)" }} delay={0}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 style={{ fontFamily: displayFont, fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 12 }}>
                8 Yılda Öğrendiklerimizle Kurduk
              </h2>
              <p style={{ fontSize: "1rem", color: "#4b5563", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
                Sadece ders anlatmıyoruz. Sistemi, takibi ve psikolojik desteği birlikte sunuyoruz.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {[
                { sayi: "200+",  aciklama: "Desteklenen öğrenci",        ikon: "🎓", renk: "#1e3a8a", bg: "white",   border: "#bfdbfe" },
                { sayi: "8 yıl", aciklama: "Alanda aktif deneyim",       ikon: "📅", renk: "#1e3a8a", bg: "white",   border: "#bfdbfe" },
                { sayi: "2",     aciklama: "Uzman psikolojik danışman",   ikon: "👥", renk: "#c2410c", bg: "white",   border: "#fed7aa" },
                { sayi: "1:1",   aciklama: "Bireysel takip garantisi",    ikon: "🎯", renk: "#c2410c", bg: "white",   border: "#fed7aa" },
              ].map((m, i) => (
                <div key={i} style={{ background: m.bg, borderRadius: 16, padding: "28px 20px", border: `2px solid ${m.border}`, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{m.ikon}</div>
                  <div style={{ fontFamily: displayFont, fontSize: "2rem", fontWeight: 800, color: m.renk, lineHeight: 1, marginBottom: 8 }}>{m.sayi}</div>
                  <div style={{ fontSize: "0.82rem", color: "#4b5563", fontWeight: 500, lineHeight: 1.5 }}>{m.aciklama}</div>
                </div>
              ))}
            </div>

            {/* Google yorum linki — sonra eklenecek */}
            {/* <div style={{ marginTop: 28, textAlign: "center" }}>
              <a href="GOOGLE_YORUM_LINKI" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.875rem", fontWeight: 600, color: "#1e3a8a", textDecoration: "none", border: "1.5px solid #bfdbfe", borderRadius: 9999, padding: "8px 20px", background: "white" }}>
                ⭐ Google yorumlarımızı inceleyin
              </a>
            </div> */}
          </div>
        </Reveal>

        {/* ══════ 8 — İLETİŞİM CTA ══════ */}
        <Reveal style={{ padding: "88px 16px", background: "linear-gradient(135deg,#1e3a8a,#1e40af,#1e3a8a)", position: "relative", overflow: "hidden" }} delay={0}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 320, height: 320, background: "rgba(249,115,22,0.18)", borderRadius: "50%", filter: "blur(56px)" }} aria-hidden="true" />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 320, height: 320, background: "rgba(30,64,175,0.28)", borderRadius: "50%", filter: "blur(56px)" }} aria-hidden="true" />
          <div className="dot-bg" style={{ position: "absolute", inset: 0, opacity: 0.09 }} aria-hidden="true" />
          <div id="İletişim" style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <h2 style={{ fontFamily: displayFont, fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, color: "white", lineHeight: 1.3, marginBottom: 18 }}>
              Sıradan bir koçluk değil,<br />
              <span style={{ color: "#fdba74" }}>yapılandırılmış bir performans modeli</span><br />
              arıyorsanız...
            </h2>
            <p style={{ fontSize: "1.05rem", color: "#bfdbfe", marginBottom: 36, lineHeight: 1.75 }}>Potansiyeli sistematik bir şekilde performansa dönüştürme zamanı.</p>
            <button onClick={openModal} className="btn-main" style={{ background: "white", color: "#1e3a8a", border: "none", padding: "17px 40px", borderRadius: 12, fontWeight: 700, fontSize: "1.05rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", transition: "all 0.25s", fontFamily: "inherit" }}>
              <IconCalendar style={{ width: 20, height: 20 }} /> Ücretsiz Ön Görüşme Al <IconArrowRight style={{ width: 18, height: 18 }} />
            </button>
            <div className="cta-grid" style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {[{ val: "30", label: "Öğrenci İle Sınırlı Kontenjan" }, { val: "1:1", label: "Bireysel Takip" }, { val: "100%", label: "Ölçülebilir Sistem" }].map((item, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.09)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.18)" }}>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fdba74", marginBottom: 6, fontFamily: displayFont }}>{item.val}</div>
                  <div style={{ fontSize: "0.8rem", color: "#bfdbfe" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ══════ FOOTER ══════ */}
        <footer style={{ background: "linear-gradient(135deg,#0f1f4f,#1e3a8a)", color: "white" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto", padding: "48px 16px" }}>
            <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, marginBottom: 32 }}>
              <div>
                <p style={{ fontFamily: displayFont, fontSize: "1.35rem", fontWeight: 700, color: "#fdba74", marginBottom: 12, marginTop: 0 }}>Öğrenci Koçu Adana</p>
                <p style={{ color: "#bfdbfe", lineHeight: 1.75, margin: 0, fontSize: "0.875rem" }}>LGS ve YKS öğrencileri için yapılandırılmış Akademik Performans ve Psikolojik Dayanıklılık Modeli</p>
              </div>
              <nav aria-label="İletişim bilgileri">
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fdba74", margin: "0 0 12px", fontFamily: displayFont }}>İletişim</h3>
                {[{ Icon: IconPhone, text: "0547 380 38 01" }, { Icon: IconPhone, text: "0540 380 38 01" }, { Icon: IconMail, text: "ogrencikocuadana@gmail.com" }, { Icon: IconMapPin, text: "Adana, Türkiye" }].map(({ Icon, text }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, color: "#bfdbfe" }}><Icon style={{ width: 16, height: 16, flexShrink: 0 }} /><span style={{ fontSize: "0.875rem" }}>{text}</span></div>
                ))}
              </nav>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fdba74", margin: "0 0 12px", fontFamily: displayFont }}>Çalışma Saatleri</h3>
                {["Pazartesi – Cuma: 10:00 – 20:00", "Cumartesi: 10:00 – 17:00", "Pazar: Kapalı"].map((t, i) => <p key={i} style={{ color: "#bfdbfe", marginBottom: 8, fontSize: "0.875rem" }}>{t}</p>)}
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", margin: 0 }}>© 2026 Öğrenci Koçu Adana. Tüm hakları saklıdır.</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>Başarı için sistematik yaklaşım <IconHeart style={{ width: 13, height: 13, color: "#fb923c" }} filled /></p>
            </div>
          </div>
        </footer>

        {/* ══════ WHATSAPP ══════ */}
        <WhatsAppButon />

      </div>
    </>
  );
}