// app/hakkimizda/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// NOT: Sen dosyayı app/hakkimizda/ olarak oluşturdun — bu doğru.
// URL: ogrencikocuadana.com/hakkimizda
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Hakkımızda — Cumali & Şükran Özdemir",
  description:
    "Uzman Psikolojik Danışman Cumali Özdemir ve Uzman Psikolojik Danışman Şükran Özdemir. " +
    "Adana'da LGS ve YKS öğrencilerine akademik koçluk ve psikolojik danışmanlık hizmeti. " +
    "İki uzman danışman, 8 yıllık deneyim.",
  alternates: { canonical: "https://ogrencikocuadana.com/hakkimizda" },
  openGraph: {
    title: "Hakkımızda | Öğrenci Koçu Adana",
    description:
      "Cumali & Şükran Özdemir — İki uzman psikolojik danışman, 8 yıllık deneyim. " +
      "Adana'da LGS ve YKS öğrencilerine bütüncül destek.",
    url: "https://ogrencikocuadana.com/hakkimizda",
  },
};

// ─── JSON-LD: Person şeması ────────────────────────────────────────────────
const personJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Cumali Özdemir",
    jobTitle: "Uzman Psikolojik Danışman & Öğrenci Koçu",
    alumniOf: { "@type": "CollegeOrUniversity", name: "Hasan Kalyoncu Üniversitesi" },
    worksFor: { "@type": "LocalBusiness", name: "Öğrenci Koçu Adana" },
    url: "https://ogrencikocuadana.com/hakkimizda",
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Şükran Özdemir",
    jobTitle: "Uzman Psikolojik Danışman & Öğrenci Koçu",
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Erciyes Üniversitesi" },
      { "@type": "CollegeOrUniversity", name: "İstanbul Cerrahpaşa Üniversitesi" },
    ],
    worksFor: { "@type": "LocalBusiness", name: "Öğrenci Koçu Adana" },
    url: "https://ogrencikocuadana.com/hakkimizda",
  },
];

const D = "var(--font-display), 'Bricolage Grotesque', sans-serif";

export default function HakkimizdaPage() {
  return (
    <>
      {personJsonLd.map((p, i) => (
        <script key={i} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(p) }} />
      ))}

      <main style={{ fontFamily: "var(--font-body), 'Plus Jakarta Sans', sans-serif" }}>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section style={{
          background: "linear-gradient(135deg, #f8faff 0%, #eff6ff 50%, #fff8f3 100%)",
          padding: "72px 20px 64px", textAlign: "center",
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "white", border: "1.5px solid #e5e7eb",
              borderRadius: 9999, padding: "7px 18px",
              fontSize: "0.8rem", fontWeight: 600, color: "#374151",
              marginBottom: 28, boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}>
              👥 Tanışalım
            </div>
            <h1 style={{
              fontFamily: D,
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 800, color: "#0f1f4f",
              lineHeight: 1.15, marginBottom: 20,
            }}>
              Biz Kimiz?
            </h1>
            <p style={{
              fontSize: "1.1rem", color: "#4b5563",
              lineHeight: 1.8, maxWidth: 580, margin: "0 auto 36px",
            }}>
              İki uzman psikolojik danışman olarak öğrenciye sadece akademik değil,
              duygusal ve psikolojik destek de veriyoruz. Çünkü gerçek başarı
              bütüncül bir yaklaşımla geliyor.
            </p>
            <Link href="/#İletişim" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              color: "white", padding: "14px 32px",
              borderRadius: 10, fontWeight: 700, fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(30,58,138,0.28)",
            }}>
              📅 Ücretsiz Görüşme Al →
            </Link>
          </div>
        </section>

        {/* ── DANIŞMANLAR ──────────────────────────────────────────────── */}
        <section style={{ padding: "80px 20px", background: "white" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
              gap: 32,
            }}>

              {/* Cumali Özdemir */}
              <DanismanKarti
                isim="Cumali Özdemir"
                unvan="Uzman Psikolojik Danışman & Öğrenci Koçu"
                renk="#1e3a8a"
                acikRenk="#eff6ff"
                sinirRenk="#bfdbfe"
                foto="/cumali-ozdemir.jpeg"
                egitim={[
                  { okul: "Hasan Kalyoncu Üniversitesi", bolum: "Psikolojik Danışmanlık ve Rehberlik", tur: "Lisans" },
                ]}
                deneyim="Uzman · 8 yıl deneyim"
                odak={["LGS ve YKS akademik koçluğu", "Çalışma sistemi ve zaman yönetimi", "Deneme analizi ve net takibi", "Motivasyon ve hedef belirleme"]}
                hakkinda="Öğrencinin akademik potansiyelini sisteme dönüştürmeyi hedefliyorum.
                  Bireysel farklılıkları göz önünde bulundurarak her öğrenciye özel
                  çalışma planı hazırlıyor, haftalık takiple süreci birlikte yönetiyoruz."
              />

              {/* Şükran Özdemir */}
              <DanismanKarti
                isim="Şükran Özdemir"
                unvan="Uzman Psikolojik Danışman & Öğrenci Koçu"
                renk="#c2410c"
                acikRenk="#fff7ed"
                sinirRenk="#fed7aa"
                foto="/sukran-ozdemir.jpeg"
                egitim={[
                  { okul: "Erciyes Üniversitesi", bolum: "Psikolojik Danışmanlık ve Rehberlik", tur: "Lisans" },
                  { okul: "İstanbul Cerrahpaşa Üniversitesi", bolum: "Psikolojik Danışmanlık ve Rehberlik", tur: "Yüksek Lisans" },
                ]}
                deneyim="Uzman · 8 yıl deneyim"
                odak={["Sınav kaygısı ve stres yönetimi", "Psikolojik dayanıklılık eğitimi", "Duygu düzenleme ve özgüven", "Veli danışmanlığı ve aile iletişimi"]}
                hakkinda="Öğrencinin sadece sınava değil, hayata hazırlanmasını destekliyorum.
                  Yüksek lisans eğitimim ve 8 yıllık klinik deneyimimle sınav kaygısı,
                  motivasyon düşüklüğü ve psikolojik engelleri birlikte aşıyoruz."
              />

            </div>
          </div>
        </section>

        {/* ── NEDEN İKİ DANIŞMAN? ─────────────────────────────────────── */}
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 22 }}>
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

        {/* ── FELSEFEMİZ ──────────────────────────────────────────────── */}
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

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <section style={{ padding: "80px 20px", background: "linear-gradient(135deg, #1e3a8a, #1e40af)", textAlign: "center" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <h2 style={{ fontFamily: D, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: "white", lineHeight: 1.3, marginBottom: 18 }}>
              Tanıştığımıza göre,<br />
              <span style={{ color: "#fdba74" }}>bir adım daha atalım.</span>
            </h2>
            <p style={{ fontSize: "1rem", color: "#bfdbfe", lineHeight: 1.8, marginBottom: 36 }}>
              İlk görüşme ücretsiz. Öğrencinin mevcut durumunu birlikte
              değerlendirelim, size uygun programı anlatalım.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/#İletişim" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", color: "#1e3a8a", padding: "15px 32px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                📅 Ücretsiz Görüşme Al
              </Link>
              <a href="https://wa.me/905473803801" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "white", padding: "15px 32px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(37,211,102,0.3)" }}>
                💬 WhatsApp&apos;tan Yaz
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}

// ─── Danışman Kartı Bileşeni ───────────────────────────────────────────────
function DanismanKarti({ isim, unvan, renk, acikRenk, sinirRenk, foto, egitim, deneyim, odak, hakkinda }: {
  isim: string; unvan: string; renk: string; acikRenk: string; sinirRenk: string; foto: string;
  egitim: { okul: string; bolum: string; tur: string }[];
  deneyim: string; odak: string[]; hakkinda: string;
}) {
  return (
    <article style={{ background: "white", borderRadius: 22, border: `2px solid ${sinirRenk}`, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>

      {/* Üst renkli şerit + fotoğraf */}
      <div style={{ background: `linear-gradient(135deg, ${renk}, ${renk}dd)`, padding: "32px 32px 28px", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 92, height: 92, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.5)", flexShrink: 0, overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
          <Image
            src={foto}
            alt={`${isim} - Uzman Psikolojik Danışman`}
            width={92}
            height={92}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
          />
        </div>
        <div>
          <h2 style={{ fontFamily: D, fontSize: "1.45rem", fontWeight: 800, color: "white", margin: "0 0 6px", lineHeight: 1.2 }}>{isim}</h2>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5 }}>{unvan}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", borderRadius: 9999, padding: "3px 12px", marginTop: 10 }}>
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>🕐 {deneyim}</span>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div style={{ padding: "28px 32px" }}>
        <p style={{ fontSize: "0.92rem", color: "#374151", lineHeight: 1.8, marginBottom: 24 }}>{hakkinda}</p>

        {/* Eğitim */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: renk, letterSpacing: "0.08em", marginBottom: 12 }}>EĞİTİM</div>
          {egitim.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < egitim.length - 1 ? 12 : 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: renk, flexShrink: 0, marginTop: 6 }} />
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f1f4f" }}>{e.okul}</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{e.bolum} · {e.tur}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Uzmanlık etiketleri */}
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: renk, letterSpacing: "0.08em", marginBottom: 12 }}>UZMANLIK ALANLARI</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {odak.map((alan) => (
              <span key={alan} style={{ background: acikRenk, border: `1px solid ${sinirRenk}`, borderRadius: 8, padding: "5px 12px", fontSize: "0.78rem", fontWeight: 600, color: renk }}>
                {alan}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}