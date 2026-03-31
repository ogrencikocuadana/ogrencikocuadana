"use client";

import Navbar from "../components/Navbar";
import { useState } from "react";

const WHATSAPP_URL = "https://wa.me/905473803801?text=Merhaba%2C%20H%C4%B1zl%C4%B1%20Okuma%20program%C4%B1%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.";

const benefits = [
  {
    icon: "⚡",
    title: "Daha Hızlı, Daha Fazla",
    desc: "Ortalama okuma hızını 2-3 katına çıkararak sınavda daha fazla soruya yetişirsin.",
  },
  {
    icon: "🎯",
    title: "Odak & Kavrama",
    desc: "Sadece hız değil — okuduğunu anlama ve akılda tutma becerisi de birlikte güçlenir.",
  },
  {
    icon: "🧠",
    title: "Bilimsel Yöntem",
    desc: "Moxo Dikkat Testi ile başlıyoruz: dikkat profilini bilerek, sana özel strateji geliştiriyoruz.",
  },
  {
    icon: "📈",
    title: "Ölçülebilir İlerleme",
    desc: "Her hafta hız ve doğruluk testleriyle gelişimini somut rakamlarla görürsün.",
  },
];

const programItems = [
  {
    label: "4 Haftalık Program",
    detail:
      "Haftada 2 seans, toplamda 8 oturum. Her seans bir öncekinin üzerine inşa edilir.",
  },
  {
    label: "21 Günlük Ödev Sistemi",
    detail:
      "Günlük 10-15 dakikalık alıştırmalarla beceri kalıcı hale gelir. Rutini bozunca hatırlatıyoruz.",
  },
  {
    label: "Moxo Dikkat Testi",
    detail:
      "Program başında uluslararası geçerliliği olan Moxo testi ile dikkat profili belirlenir.",
  },
  {
    label: "Veli Raporu",
    detail:
      "Program sonunda veliye yazılı ilerleme raporu sunulur. Ne değişti, ne güçlendi — net olarak.",
  },
  {
    label: "365 Gün Yazılım Desteği",
    detail:
      "Program bitince de yalnız kalmıyorsun. Bir yıl boyunca dijital pratik materyallerine erişim açık.",
  },
];

const steps = [
  { num: "01", title: "Başvur", desc: "WhatsApp'tan bize ulaş, uygun zamanı birlikte belirleyelim." },
  { num: "02", title: "Moxo Testi", desc: "Dikkat profili çıkarılır, programa özel plan hazırlanır." },
  { num: "03", title: "8 Seans", desc: "4 hafta boyunca sistematik hızlı okuma eğitimi alırsın." },
  { num: "04", title: "Rapor & Destek", desc: "Veli raporu teslim edilir, 365 gün destek başlar." },
];

const faqs = [
  {
    q: "Kaç yaşındaki öğrenciler katılabilir?",
    a: "Program LGS (8. sınıf) ve YKS (9-12. sınıf) öğrencilerine uygundur. 11-17 yaş aralığında en verimli sonuçları alıyoruz.",
  },
  {
    q: "Seanslar yüz yüze mi, online mı?",
    a: "Adana içindeyseniz yüz yüze görüşmeyi tercih ediyoruz. Uzak ilçeler veya farklı şehirler için online seçenek de mevcut.",
  },
  {
    q: "Hızlı okuma gerçekten sınav başarısını etkiler mi?",
    a: "Türkçe ve sosyal bilimler başta olmak üzere metin ağırlıklı derslerde doğrudan etkisi görülüyor. Okuma hızı arttıkça soruya harcanan süre azalır, doğru sayısı yükselir.",
  },
  {
    q: "Program kaç haftada tamamlanıyor?",
    a: "Temel program 4 haftadır. Öğrencinin hızına ve ihtiyacına göre bireysel ek seanslar planlanabilir.",
  },
  {
    q: "Ödevler çok vakit alır mı?",
    a: "Her gün yalnızca 10-15 dakika. Yoğun sınav temposuyla çakışmayacak şekilde tasarlandı.",
  },
  {
    q: "Veliler sürece dahil oluyor mu?",
    a: "Evet. Program başında bilgilendirme yapılır, sonunda yazılı rapor verilir. Veli dilerse ara görüşme de talep edebilir.",
  },
];

export default function HizliOkuma() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />

      <main style={{ fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)", color: "#1a2e4a" }}>

        {/* ── HERO ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #1a2e4a 0%, #1e3a5f 60%, #22456e 100%)",
            color: "#fff",
            padding: "100px 24px 80px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative circle */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "320px",
              height: "320px",
              borderRadius: "50%",
              background: "rgba(245,166,35,0.08)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "-60px",
              width: "240px",
              height: "240px",
              borderRadius: "50%",
              background: "rgba(245,166,35,0.06)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", maxWidth: "720px", margin: "0 auto" }}>
            <span
              style={{
                display: "inline-block",
                background: "rgba(245,166,35,0.18)",
                color: "#f5a623",
                border: "1px solid rgba(245,166,35,0.35)",
                borderRadius: "100px",
                padding: "6px 18px",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                marginBottom: "24px",
              }}
            >
              LGS & YKS Öğrencilerine Özel
            </span>

            <h1
              style={{
                fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "20px",
                color: "#fff",
              }}
            >
              Sınavda Her Dakika Değerli —<br />
              <span style={{ color: "#f5a623" }}>Okuma Hızın Fark Yaratır</span>
            </h1>

            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.15rem)",
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.82)",
                maxWidth: "560px",
                margin: "0 auto 36px",
              }}
            >
              Bilimsel yöntemlerle geliştirilen 4 haftalık programla okuma hızını ve kavrama gücünü artır.
              Moxo Dikkat Testi ile sana özel plan, veli raporu ve 365 gün yazılım desteği dahil.
            </p>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "#f5a623",
                color: "#1a2e4a",
                fontWeight: 700,
                fontSize: "1rem",
                padding: "15px 32px",
                borderRadius: "12px",
                textDecoration: "none",
                boxShadow: "0 4px 24px rgba(245,166,35,0.35)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(245,166,35,0.45)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 24px rgba(245,166,35,0.35)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp ile Bilgi Al
            </a>

            <p style={{ marginTop: "16px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
              Ücretsiz ön görüşme • Hemen yanıt
            </p>
          </div>
        </section>

        {/* ── FAYDALAR ── */}
        <section style={{ background: "#fff", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <p style={{ textAlign: "center", color: "#f5a623", fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em", marginBottom: "12px" }}>
              NEDEN HIZLI OKUMA?
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "16px",
                color: "#1a2e4a",
              }}
            >
              Hızlı okuma bir yetenek değil, öğrenilen bir beceri
            </h2>
            <p style={{ textAlign: "center", color: "#4a6080", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 56px", fontSize: "1rem" }}>
              Araştırmalar gösteriyor: okuma hızı ve kavrama birlikte çalışırsa sınav performansı anlamlı ölçüde yükseliyor.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "24px",
              }}
            >
              {benefits.map((b) => (
                <div
                  key={b.title}
                  style={{
                    background: "#f8fbff",
                    border: "1px solid #e0eaf5",
                    borderRadius: "16px",
                    padding: "28px 24px",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(26,46,74,0.10)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "14px" }}>{b.icon}</div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      marginBottom: "10px",
                      color: "#1a2e4a",
                    }}
                  >
                    {b.title}
                  </h3>
                  <p style={{ fontSize: "0.92rem", color: "#4a6080", lineHeight: 1.65 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── KİMLER İÇİN ── */}
        <section style={{ background: "#e8f4fd", padding: "80px 24px" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <p style={{ textAlign: "center", color: "#f5a623", fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em", marginBottom: "12px" }}>
              KİMLER İÇİN UYGUN?
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "48px",
                color: "#1a2e4a",
              }}
            >
              Sınavın ne olursa olsun, bu program sana göre
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              {[
                {
                  badge: "LGS",
                  color: "#1a2e4a",
                  title: "8. Sınıf Öğrencileri",
                  items: [
                    "Türkçe'de metin sorularında süre problemi yaşayanlar",
                    "Sosyal Bilgiler okuma yükünü azaltmak isteyenler",
                    "LGS'ye 6 ay ve daha az kalanlar",
                  ],
                },
                {
                  badge: "YKS",
                  color: "#f5a623",
                  title: "9-12. Sınıf Öğrencileri",
                  items: [
                    "TYT Türkçe ve sosyal bilimlerde hız sorunu yaşayanlar",
                    "AYT'de paragraf ve edebiyat sorularında zorlananlar",
                    "Deneme sınavlarında süreyi yetiştiremeyenler",
                  ],
                },
              ].map((card) => (
                <div
                  key={card.badge}
                  style={{
                    background: "#fff",
                    borderRadius: "20px",
                    padding: "32px 28px",
                    border: "1px solid #d6e8f5",
                    boxShadow: "0 2px 16px rgba(26,46,74,0.06)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      background: card.color,
                      color: card.color === "#f5a623" ? "#1a2e4a" : "#fff",
                      fontWeight: 700,
                      fontSize: "12px",
                      padding: "4px 14px",
                      borderRadius: "100px",
                      marginBottom: "16px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {card.badge}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      marginBottom: "18px",
                      color: "#1a2e4a",
                    }}
                  >
                    {card.title}
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {card.items.map((item) => (
                      <li
                        key={item}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                          fontSize: "0.93rem",
                          color: "#4a6080",
                          lineHeight: 1.6,
                        }}
                      >
                        <span style={{ color: "#f5a623", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROGRAM İÇERİĞİ ── */}
        <section style={{ background: "#fff", padding: "80px 24px" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <p style={{ textAlign: "center", color: "#f5a623", fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em", marginBottom: "12px" }}>
              PROGRAM İÇERİĞİ
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "16px",
                color: "#1a2e4a",
              }}
            >
              4 haftada ne öğreniyorsun?
            </h2>
            <p style={{ textAlign: "center", color: "#4a6080", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 52px", fontSize: "1rem" }}>
              Her bileşen birbirini tamamlar — ölçüm, pratik, takip ve destek.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {programItems.map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    background: "#f8fbff",
                    border: "1px solid #e0eaf5",
                    borderRadius: "14px",
                    padding: "22px 24px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "#1a2e4a",
                      color: "#f5a623",
                      fontWeight: 800,
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#1a2e4a",
                        marginBottom: "6px",
                      }}
                    >
                      {item.label}
                    </p>
                    <p style={{ fontSize: "0.91rem", color: "#4a6080", lineHeight: 1.65 }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── NASIL ÇALIŞIR ── */}
        <section style={{ background: "#1a2e4a", padding: "80px 24px" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto" }}>
            <p style={{ textAlign: "center", color: "#f5a623", fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em", marginBottom: "12px" }}>
              NASIL ÇALIŞIR?
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "56px",
                color: "#fff",
              }}
            >
              Başvurudan rapora — 4 adım
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "24px",
              }}
            >
              {steps.map((step, i) => (
                <div key={step.num} style={{ position: "relative" }}>
                  {i < steps.length - 1 && (
                    <div
                      style={{
                        display: "none", // sadece büyük ekranda görünecek, JS yerine CSS media query'siz basit çözüm
                      }}
                    />
                  )}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "16px",
                      padding: "28px 22px",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                        fontSize: "2.2rem",
                        fontWeight: 800,
                        color: "#f5a623",
                        opacity: 0.5,
                        marginBottom: "12px",
                        lineHeight: 1,
                      }}
                    >
                      {step.num}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "#fff",
                        marginBottom: "10px",
                      }}
                    >
                      {step.title}
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SSS ── */}
        <section style={{ background: "#f8fbff", padding: "80px 24px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <p style={{ textAlign: "center", color: "#f5a623", fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em", marginBottom: "12px" }}>
              SIK SORULAN SORULAR
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "48px",
                color: "#1a2e4a",
              }}
            >
              Aklına takılan var mı?
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    border: "1px solid #e0eaf5",
                    borderRadius: "14px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "20px 22px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                        fontWeight: 700,
                        fontSize: "0.97rem",
                        color: "#1a2e4a",
                        lineHeight: 1.45,
                      }}
                    >
                      {faq.q}
                    </span>
                    <span
                      style={{
                        fontSize: "18px",
                        color: "#f5a623",
                        flexShrink: 0,
                        fontWeight: 700,
                        transition: "transform 0.2s",
                        transform: openFaq === i ? "rotate(45deg)" : "rotate(0)",
                        display: "inline-block",
                      }}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div
                      style={{
                        padding: "0 22px 20px",
                        fontSize: "0.92rem",
                        color: "#4a6080",
                        lineHeight: 1.7,
                        borderTop: "1px solid #e8f4fd",
                        paddingTop: "16px",
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SON CTA ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #f5a623 0%, #e8951a 100%)",
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-display, 'Bricolage Grotesque', sans-serif)",
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                fontWeight: 800,
                color: "#1a2e4a",
                marginBottom: "16px",
                lineHeight: 1.2,
              }}
            >
              Bir adımla başla — ücretsiz ön görüşme al
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "rgba(26,46,74,0.75)",
                lineHeight: 1.7,
                marginBottom: "36px",
              }}
            >
              Programın senin öğrencine uygun olup olmadığını birlikte değerlendirelim.
              Taahhüt yok, baskı yok — sadece dürüst bir görüşme.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "#1a2e4a",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                padding: "16px 36px",
                borderRadius: "12px",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(26,46,74,0.25)",
                transition: "transform 0.15s",
              }}
              onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)")}
              onMouseOut={(e) => ((e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp'tan Yaz
            </a>
            <p style={{ marginTop: "16px", fontSize: "13px", color: "rgba(26,46,74,0.55)" }}>
              Genellikle aynı gün yanıt veriyoruz
            </p>
          </div>
        </section>
      </main>
    </>
  );
}