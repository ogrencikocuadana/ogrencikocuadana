"use client";

import { useState, FormEvent, CSSProperties } from "react";
import Image from "next/image";

const D = "var(--font-display), 'Bricolage Grotesque', sans-serif";

const IconX       = () => (<svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" width="22" height="22"><path d="M18 6 6 18M6 6l12 12"/></svg>);
const IconSend    = ({ style }: { style?: CSSProperties }) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="18" height="18"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>);
const IconPhone   = ({ style }: { style?: CSSProperties }) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const IconMail    = ({ style }: { style?: CSSProperties }) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="18" height="18"><rect height="16" rx="2" width="20" x="2" y="4"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const IconUser    = ({ style }: { style?: CSSProperties }) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="18" height="18"><path d="M16 7a4 4 11-8 0 4 4 018 0zM12 14a7 7 00-7 7h14a7 7 00-7-7z"/></svg>);
const IconBook    = ({ style }: { style?: CSSProperties }) => (<svg style={style} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="18" height="18"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
const IconChevron = () => (<svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="18" height="18"><path d="m6 9 6 6 6-6"/></svg>);

function AppointmentModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ parentName: "", studentName: "", phone: "", email: "", grade: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("https://formspree.io/f/xjgeanor", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ "Veli Adı": form.parentName, "Öğrenci Adı": form.studentName, "Telefon": form.phone, "E-posta": form.email, "Sınıf": form.grade, "Mesaj": form.message }),
    });
    setSubmitted(true);
    const txt = encodeURIComponent(`Merhaba! Ön görüşme talebinde bulunmak istiyorum.\n\n👤 Veli: ${form.parentName}\n🎓 Öğrenci: ${form.studentName}\n📱 Telefon: ${form.phone}\n📚 Sınıf: ${form.grade}. Sınıf\n${form.message ? `💬 Mesaj: ${form.message}` : ""}`);
    setTimeout(() => window.open(`https://wa.me/905473803801?text=${txt}`, "_blank"), 800);
  };

  const inp: CSSProperties = { width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 11, paddingBottom: 11, border: "2px solid #e5e7eb", borderRadius: 8, fontSize: "0.95rem", outline: "none", fontFamily: "inherit", background: "white", appearance: "none" as const, color: "#111827", boxSizing: "border-box" as const };
  const lbl: CSSProperties = { display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: 6 };
  const ico: CSSProperties = { position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none", display: "flex" };

  return (
    <>
      <style>{`.h-inp:focus{border-color:#1a2e4a!important;box-shadow:0 0 0 3px rgba(26,46,74,0.1)!important}.h-inp::placeholder{color:#9ca3af!important}@keyframes hbg{from{opacity:0}to{opacity:1}}@keyframes hbox{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}@media(max-width:540px){.h-half{grid-template-columns:1fr!important}}`}</style>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 9998, animation: "hbg 0.2s ease" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 72px rgba(0,0,0,0.25)", animation: "hbox 0.28s cubic-bezier(.22,.68,0,1.2)", pointerEvents: "all" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(135deg, #1a2e4a, #243d61)", padding: "22px 26px", borderRadius: "20px 20px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontFamily: D, fontSize: "1.5rem", fontWeight: 800, color: "white", margin: "0 0 3px" }}>Ücretsiz Ön Görüşme</h2>
              <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "0.85rem" }}>Formu doldurun, en kısa sürede size dönelim</p>
            </div>
            <button onClick={onClose} aria-label="Kapat" style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", flexShrink: 0 }}><IconX /></button>
          </div>

          {submitted ? (
            <div style={{ padding: "44px 26px", textAlign: "center" }}>
              <div style={{ width: 68, height: 68, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <svg width="34" height="34" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h3 style={{ fontFamily: D, fontSize: "1.5rem", fontWeight: 800, color: "#0f1f4f", margin: "0 0 10px" }}>Talebiniz Alındı! 🎉</h3>
              <p style={{ color: "#4b5563", lineHeight: 1.7, maxWidth: 380, margin: "0 auto 8px" }}>En kısa sürede <strong style={{ color: "#1a2e4a" }}>{form.phone}</strong>&apos;dan sizi arayacağız.</p>
              <p style={{ color: "#6b7280", fontSize: "0.875rem", maxWidth: 380, margin: "0 auto 28px" }}>WhatsApp otomatik açılmadıysa <a href="https://wa.me/905473803801" target="_blank" rel="noopener noreferrer" style={{ color: "#1a2e4a", fontWeight: 600 }}>buraya tıklayın</a>.</p>
              <button onClick={onClose} style={{ background: "linear-gradient(135deg, #1a2e4a, #243d61)", color: "white", border: "none", padding: "12px 32px", borderRadius: 10, fontWeight: 700, fontSize: "1rem", cursor: "pointer", fontFamily: "inherit" }}>Kapat</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: "24px 26px 28px" }}>
              <div className="h-half" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div><label style={lbl}>Veli Adı Soyadı *</label><div style={{ position: "relative" }}><span style={ico}><IconUser /></span><input type="text" name="parentName" required placeholder="Adınız Soyadınız" value={form.parentName} onChange={handleChange} className="h-inp" style={inp} /></div></div>
                <div><label style={lbl}>Öğrenci Adı *</label><div style={{ position: "relative" }}><span style={ico}><IconUser /></span><input type="text" name="studentName" required placeholder="Öğrencinin Adı" value={form.studentName} onChange={handleChange} className="h-inp" style={inp} /></div></div>
              </div>
              <div className="h-half" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div><label style={lbl}>Telefon *</label><div style={{ position: "relative" }}><span style={ico}><IconPhone /></span><input type="tel" name="phone" required placeholder="0555 555 55 55" value={form.phone} onChange={handleChange} className="h-inp" style={inp} /></div></div>
                <div><label style={lbl}>E-posta <span style={{ fontWeight: 400, color: "#9ca3af" }}>(isteğe bağlı)</span></label><div style={{ position: "relative" }}><span style={ico}><IconMail /></span><input type="email" name="email" placeholder="ornek@email.com" value={form.email} onChange={handleChange} className="h-inp" style={inp} /></div></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Öğrencinin Sınıfı *</label>
                <div style={{ position: "relative" }}>
                  <span style={ico}><IconBook /></span>
                  <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af", display: "flex" }}><IconChevron /></span>
                  <select name="grade" required value={form.grade} onChange={handleChange} className="h-inp" style={{ ...inp, paddingRight: 36, cursor: "pointer" }}>
                    <option value="">Sınıf Seçin</option>
                    <option value="7">7. Sınıf (LGS)</option>
                    <option value="8">8. Sınıf (LGS)</option>
                    <option value="11">11. Sınıf (YKS)</option>
                    <option value="12">12. Sınıf (YKS)</option>
                    <option value="Mezun">Mezun</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={lbl}>Mesaj <span style={{ fontWeight: 400, color: "#9ca3af" }}>(isteğe bağlı)</span></label>
                <textarea name="message" rows={3} placeholder="Öğrencinin durumu, hedefleri veya sorularınız..." value={form.message} onChange={handleChange} className="h-inp" style={{ ...inp, paddingLeft: 14, resize: "none", lineHeight: 1.6 }} />
              </div>
              <button type="submit" style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #1a2e4a, #243d61)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
                <IconSend /> Ön Görüşme Talep Et
              </button>
              <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", margin: "10px 0 0" }}>🔒 Bilgileriniz yalnızca iletişim için kullanılır</p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default function HakkimizdaClient() {
  const [showModal, setShowModal] = useState(false);

  return (
    <main style={{ fontFamily: "var(--font-body), 'Plus Jakarta Sans', sans-serif" }}>
      {showModal && <AppointmentModal onClose={() => setShowModal(false)} />}

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(135deg, #f8faff 0%, #eff6ff 50%, #fff8f3 100%)", padding: "72px 20px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", border: "1.5px solid #e5e7eb", borderRadius: 9999, padding: "7px 18px", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 28, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            👥 Tanışalım
          </div>
          <h1 style={{ fontFamily: D, fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: "#0f1f4f", lineHeight: 1.15, marginBottom: 20 }}>
            Biz Kimiz?
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#4b5563", lineHeight: 1.8, maxWidth: 580, margin: "0 auto 36px" }}>
            İki uzman psikolojik danışman olarak öğrenciye sadece akademik değil,
            duygusal ve psikolojik destek de veriyoruz. Çünkü gerçek başarı
            bütüncül bir yaklaşımla geliyor.
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #1a2e4a, #243d61)", color: "white", padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(26,46,74,0.28)", fontFamily: "inherit" }}
          >
            📅 Ücretsiz Ön Görüşme Al
          </button>
        </div>
      </section>

      {/* ── DANIŞMANLAR ── */}
      <section style={{ padding: "80px 20px", background: "white" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          {/* ↓ minmax 440px → 300px ile mobil taşması çözüldü */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
            <DanismanKarti
              isim="Cumali Özdemir"
              unvan="Psikolojik Danışman & Öğrenci Koçu"
              renk="#1a2e4a" acikRenk="#e8f4fd" sinirRenk="#bfdbfe"
              foto="/cumali-ozdemir.jpeg"
              egitim={[{ okul: "Hasan Kalyoncu Üniversitesi", bolum: "Psikolojik Danışmanlık ve Rehberlik", tur: "Lisans" }]}
              deneyim="Uzman · 8 yıl deneyim"
              odak={["LGS ve YKS akademik koçluğu", "Çalışma sistemi ve zaman yönetimi", "Deneme analizi ve net takibi", "Motivasyon ve hedef belirleme"]}
              hakkinda="Öğrencinin akademik potansiyelini sisteme dönüştürmeyi hedefliyorum. Bireysel farklılıkları göz önünde bulundurarak her öğrenciye özel çalışma planı hazırlıyor, haftalık takiple süreci birlikte yönetiyoruz."
            />
            <DanismanKarti
              isim="Şükran Özdemir"
              unvan="Uzman Psikolojik Danışman & Öğrenci Koçu"
              renk="#c2410c" acikRenk="#fff7ed" sinirRenk="#fed7aa"
              foto="/sukran-ozdemir.jpeg"
              egitim={[
                { okul: "Erciyes Üniversitesi", bolum: "Psikolojik Danışmanlık ve Rehberlik", tur: "Lisans" },
                { okul: "İstanbul Cerrahpaşa Üniversitesi", bolum: "Psikolojik Danışmanlık ve Rehberlik", tur: "Yüksek Lisans" },
              ]}
              deneyim="Uzman · 8 yıl deneyim"
              odak={["Sınav kaygısı ve stres yönetimi", "Psikolojik dayanıklılık eğitimi", "Duygu düzenleme ve özgüven", "Veli danışmanlığı ve aile iletişimi"]}
              hakkinda="Öğrencinin sadece sınava değil, hayata hazırlanmasını destekliyorum. Yüksek lisans eğitimim ve 8 yıllık klinik deneyimimle sınav kaygısı, motivasyon düşüklüğü ve psikolojik engelleri birlikte aşıyoruz."
            />
          </div>
        </div>
      </section>

      {/* ── NEDEN İKİ DANIŞMAN? ── */}
      <section style={{ padding: "80px 20px", background: "linear-gradient(135deg, #f8faff, #eff6ff)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-block", marginBottom: 14, padding: "7px 18px", background: "#dbeafe", borderRadius: 9999 }}>
              <span style={{ color: "#1e40af", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.06em" }}>FARKIMIZ</span>
            </div>
            <h2 style={{ fontFamily: D, fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 14 }}>
              Neden İki Danışman Birlikte?
            </h2>
            <p style={{ fontSize: "1rem", color: "#4b5563", lineHeight: 1.8, maxWidth: 600, margin: "0 auto" }}>
              Pek çok koçluk hizmetinde ya akademik destek ya da psikolojik destek var.
              Bizde ikisi bir arada — ve bu, sonuçlara doğrudan yansıyor.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22 }}>
            {[
              { ikon: "🎯", baslik: "Akademik + Psikolojik", aciklama: "Cumali Hoca, akademik sistemi kurarken Şükran Hoca, kaygı ve motivasyon engellerini kaldırıyor. İkisi bir arada çalışınca sonuç farklı oluyor." },
              { ikon: "👨‍👩‍👧", baslik: "Aile İçin Çift Bakış", aciklama: "Hem öğrenciye hem veliye ayrı ayrı destek veriyoruz. Ebeveyn-çocuk iletişimindeki gerginlikler çözülmeden akademik başarı sürdürülebilir olmuyor." },
              { ikon: "🔄", baslik: "Sürekli İletişim", aciklama: "İki danışman olarak öğrencinin akademik ve duygusal durumunu haftalık olarak birlikte değerlendiriyor, stratejimizi güncelliyoruz." },
              { ikon: "📋", baslik: "Uzmanlaşmış Roller", aciklama: "Her birinin uzmanlık alanı net. Akademik performans ve psikolojik dayanıklılık ayrı ayrı ele alınırken bütüncül bir tablo ortaya çıkıyor." },
            ].map((m) => (
              <div key={m.baslik} style={{ background: "white", borderRadius: 16, padding: "28px 24px", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{m.ikon}</div>
                <h3 style={{ fontFamily: D, fontSize: "1rem", fontWeight: 700, color: "#0f1f4f", marginBottom: 10 }}>{m.baslik}</h3>
                <p style={{ fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.7, margin: 0 }}>{m.aciklama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FELSEFEMİZ ── */}
      <section style={{ padding: "80px 20px", background: "white" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-block", marginBottom: 14, padding: "7px 18px", background: "#ffedd5", borderRadius: 9999 }}>
            <span style={{ color: "#9a3412", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.06em" }}>FELSEFEMİZ</span>
          </div>
          <h2 style={{ fontFamily: D, fontSize: "clamp(1.7rem, 4vw, 2.5rem)", fontWeight: 800, color: "#0f1f4f", marginBottom: 28 }}>
            &ldquo;Başarı tesadüf değil, sistemin sonucudur.&rdquo;
          </h2>
          <div style={{ background: "linear-gradient(135deg, #f8faff, #eff6ff)", borderRadius: 20, padding: "36px 40px", border: "1.5px solid #bfdbfe", textAlign: "left" }}>
            {[
              "Bir öğrencinin başarısızlığının arkasında çoğunlukla bilgi eksikliği değil, sistem eksikliği yatar. Nereye bakacağını, ne zaman çalışacağını ve nasıl devam edeceğini bilmeyen öğrenci, ne kadar çalışırsa çalışsın sonuç alamaz.",
              "Biz 8 yıldır hem uzman psikolojik danışman hem öğrenci koçu olarak çalışıyoruz. Bu iki rolün bir arada olması tesadüf değil — çünkü akademik başarıyı psikolojik sağlıktan ayırmak mümkün değil.",
              "Her öğrenci farklıdır. Bu yüzden hazır program değil, kişiye özel sistem sunuyoruz. Ve bu sistemi hep birlikte, şeffaf ve ölçülebilir şekilde yönetiyoruz.",
            ].map((p, i) => (
              <p key={i} style={{ fontSize: "0.975rem", color: "#374151", lineHeight: 1.85, margin: i < 2 ? "0 0 18px" : 0 }}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 20px", background: "linear-gradient(135deg, #1a2e4a, #243d61)", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontFamily: D, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: "white", lineHeight: 1.3, marginBottom: 18 }}>
            Tanıştığımıza göre,<br />
            <span style={{ color: "#f5a623" }}>bir adım daha atalım.</span>
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 36 }}>
            İlk görüşme ücretsiz. Öğrencinin mevcut durumunu birlikte
            değerlendirelim, size uygun programı anlatalım.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowModal(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", color: "#1a2e4a", padding: "15px 32px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontFamily: "inherit" }}
            >
              📅 Ücretsiz Ön Görüşme Al
            </button>
            <a href="https://wa.me/905473803801" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "white", padding: "15px 32px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(37,211,102,0.3)" }}>
              💬 WhatsApp&apos;tan Yaz
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function DanismanKarti({ isim, unvan, renk, acikRenk, sinirRenk, foto, egitim, deneyim, odak, hakkinda }: {
  isim: string; unvan: string; renk: string; acikRenk: string; sinirRenk: string; foto: string;
  egitim: { okul: string; bolum: string; tur: string }[];
  deneyim: string; odak: string[]; hakkinda: string;
}) {
  return (
    <article style={{ background: "white", borderRadius: 22, border: `2px solid ${sinirRenk}`, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
      <div style={{ background: `linear-gradient(135deg, ${renk}, ${renk}dd)`, padding: "28px 28px 24px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.5)", flexShrink: 0, overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
          <Image src={foto} alt={`${isim} - Psikolojik Danışman`} width={80} height={80} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: D, fontSize: "1.3rem", fontWeight: 800, color: "white", margin: "0 0 4px", lineHeight: 1.2 }}>{isim}</h2>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5 }}>{unvan}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", borderRadius: 9999, padding: "3px 10px", marginTop: 8 }}>
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>🕐 {deneyim}</span>
          </div>
        </div>
      </div>
      <div style={{ padding: "24px 28px" }}>
        <p style={{ fontSize: "0.88rem", color: "#374151", lineHeight: 1.8, marginBottom: 20 }}>{hakkinda}</p>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: renk, letterSpacing: "0.08em", marginBottom: 10 }}>EĞİTİM</div>
          {egitim.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < egitim.length - 1 ? 10 : 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: renk, flexShrink: 0, marginTop: 6 }} />
              <div>
                <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#0f1f4f" }}>{e.okul}</div>
                <div style={{ fontSize: "0.76rem", color: "#6b7280" }}>{e.bolum} · {e.tur}</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: renk, letterSpacing: "0.08em", marginBottom: 10 }}>UZMANLIK ALANLARI</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {odak.map((alan) => (
              <span key={alan} style={{ background: acikRenk, border: `1px solid ${sinirRenk}`, borderRadius: 7, padding: "4px 10px", fontSize: "0.74rem", fontWeight: 600, color: renk }}>{alan}</span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}