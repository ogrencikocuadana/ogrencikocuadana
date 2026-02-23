export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
}

export const posts: Post[] = [
  {
    slug: "yks-hazirlik-rehberi",
    title: "YKS'ye Nasıl Hazırlanılır? Adım Adım Kapsamlı Rehber",
    description:
      "YKS'ye hazırlık sürecinde ne zaman ne yapmalısınız? Kaynak seçiminden deneme stratejisine, psikolojik dayanıklılıktan zaman yönetimine kadar her şey bu rehberde.",
    date: "2026-02-10",
    readTime: "8 dk",
    category: "YKS Hazırlık",
    content: `
## YKS'ye Hazırlık: Nereden Başlamalı?

YKS, Türkiye'nin en kapsamlı sınav sistemlerinden biri. TYT ve AYT olmak üzere iki aşamadan oluşan bu sınav, milyonlarca öğrencinin hayallerini belirliyor. Peki doğru bir hazırlık süreci nasıl olmalı?

Her şeyden önce şunu netleştirmek gerekiyor: **YKS bir bilgi yarışması değil, sistem yarışmasıdır.** Neyi ne kadar öğrendiğinizden çok, öğrendiklerinizi ne kadar sistematik kullandığınız belirleyici oluyor.

---

## 1. Hedef Belirleme: Puanım Değil, Bölümüm Belli Olsun

Hazırlığa başlamadan önce hedef bölüm ve üniversiteyi netleştirin. "Yüksek puan alayım, sonra bakarım" yaklaşımı motivasyonu düşürür.

- Hangi bölümde okumak istiyorsunuz?
- Bu bölüm TYT mi, AYT mi ağırlıklı?
- Geçen yıl bu bölüme kaçıncı sıradaki öğrenci girdi?

Bu soruların cevabı, çalışma planınızı şekillendirir.

---

## 2. Kaynak Seçimi: Az Kaynak, Çok Tekrar

Öğrencilerin yaptığı en büyük hata: çok kaynak biriktirmek. Rafları dolduran kitaplar değil, baştan sona tamamlanan kaynaklar sizi hedefe taşır.

**TYT için:**
- Temel düzey soru kitapları (önce konu pekiştirme)
- Karma denemeler (Ocak'tan itibaren)

**AYT için:**
- Seçtiğiniz alana göre konu kitapları
- Alan denemeleri (haftada en az 1)

---

## 3. Haftalık Plan: Esnek Ama Disiplinli

Katı programlar genellikle 2 haftada çöküyor. Bunun yerine **haftalık hedef sistemi** kurun:

- Haftada kaç konu işleyeceksiniz?
- Kaç deneme çözeceksiniz?
- Hangi günler tekrar yapacaksınız?

Günlük plan yerine haftalık hedef belirlemek, beklenmedik durumlarda esneklik sağlar.

---

## 4. Deneme Analizi: Yanlıştan Öğrenmek

Deneme çözmek tek başına yetmez. **Asıl gelişim, deneme analizinde yaşanır.**

Her denemeden sonra şu soruları sorun:
- Hangi konulardan hata yaptım?
- Bu hatalar bilgi eksikliğinden mi, dikkat dağınıklığından mı?
- Süre yönetimim nasıldı?

Bu analizi düzenli yapmak, net artışını hızlandırır.

---

## 5. Psikolojik Dayanıklılık: Sınavın Görünmez Bileşeni

YKS'yi kazananlarla kaybedenler arasındaki fark çoğu zaman bilgi değil, **psikolojik dayanıklılıktır.**

- Kötü bir deneme sonucu sizi yıkmasın — veri olarak değerlendirin
- Karşılaştırma yapmaktan kaçının, kendi gelişiminize odaklanın
- Motivasyon dalgalanmaları normaldir; sistem sizi taşır, motivasyon değil

---

## Sonuç

YKS hazırlığı bir sprint değil, maraton. Doğru sistem kurulduğunda sonuçlar kaçınılmaz olarak gelir. Eğer bu süreci tek başınıza yönetmekte zorlanıyorsanız, profesyonel bir akademik koç desteği almak sizi hem zaman hem de motivasyon açısından çok daha verimli kılacaktır.
    `,
  },
  {
    slug: "zaman-yonetimi-ogrenciler-icin",
    title: "Öğrenciler İçin Zaman Yönetimi: Günde 8 Saati 12 Saate Çevirin",
    description:
      "Sınava hazırlanan öğrenciler için etkili zaman yönetimi teknikleri. Pomodoro, haftalık plan şablonu ve motivasyonu koruma yöntemleri.",
    date: "2026-02-17",
    readTime: "6 dk",
    category: "Zaman Yönetimi",
    content: `
## Zaman Yönetimi Neden Bu Kadar Önemli?

"Çok çalışıyorum ama verim alamıyorum." Bu cümleyi kaç kez duydunuz ya da kendiniz söylediniz? Sorun çoğunlukla çalışma süresi değil, **çalışma kalitesidir.**

Araştırmalar gösteriyor ki odaklanılmış 6 saat, dağınık 10 saatten çok daha verimli. Peki bu odaklanmayı nasıl sağlarsınız?

---

## 1. Pomodoro Tekniği: Beyin Dostu Çalışma

Pomodoro tekniği basit ama güçlüdür:

- **25 dakika** odaklanarak çalış
- **5 dakika** mola ver
- 4 pomodoro'dan sonra **15-20 dakika** uzun mola

Bu teknik neden işe yarıyor? Beyin, uzun süreli odaklanmayı sürdürmekte zorlanır. Kısa molalar, konsantrasyonu taze tutar.

---

## 2. Sabah Bloğu: En Değerli Saatleriniz

Sabah ilk 2-3 saat, beynin en verimli olduğu dönemdir. Bu saatleri en zor konulara ayırın.

**Örnek sabah rutini:**
- 08:00 - 08:15 → Günün planını gözden geçir
- 08:15 - 10:15 → En zor konu bloğu (matematik, fizik vb.)
- 10:15 - 10:30 → Mola
- 10:30 - 12:00 → İkinci konu bloğu

---

## 3. Telefonla İlişkinizi Düzenleyin

Telefon, zaman yönetiminin en büyük düşmanı. Yapılan araştırmalara göre telefon bildirimi alan bir öğrencinin tekrar odaklanması ortalama **23 dakika** sürüyor.

Çözüm önerileri:
- Çalışma süresince telefonu başka odaya bırakın
- "Odak modu" veya "rahatsız etme" özelliğini kullanın
- Sosyal medyaya sadece belirlediğiniz mola saatlerinde girin

---

## 4. Haftalık Plan Şablonu

Günlük plan yerine haftalık hedef sistemi çok daha sürdürülebilir:

| Gün | Sabah | Öğleden Sonra | Akşam |
|-----|-------|---------------|-------|
| Pazartesi | Matematik | Türkçe | Deneme analizi |
| Salı | Fizik | Tarih | Tekrar |
| Çarşamba | Kimya | Coğrafya | Soru çözümü |
| Perşembe | Matematik | Biyoloji | Tekrar |
| Cuma | TYT denemesi | Analiz | Dinlenme |
| Cumartesi | AYT denemesi | Analiz | Serbest |
| Pazar | Zayıf konu | Tekrar | Dinlenme |

---

## 5. Enerji Yönetimi: Zaman Değil, Enerji Yönetin

Zaman yönetimi aslında enerji yönetimidir. Yorgunken çalışmak vakit kaybıdır.

- **Uyku:** 7-8 saat uyku, konsantrasyonu doğrudan etkiler
- **Beslenme:** Şekerli atıştırmalıklar kısa enerji artışı ama hızlı düşüş yaratır
- **Hareket:** Günde 20-30 dakika yürüyüş, beyin performansını artırır

---

## Sonuç

Zaman yönetimi bir yetenek değil, öğrenilebilir bir beceridir. Doğru sistem kurulduğunda hem daha az yorulursunuz hem de daha fazla verim alırsınız. Eğer bu sistemin kurulmasında destek almak isterseniz, bireysel koçluk seanslarımızda bunu birlikte yapılandırıyoruz.
    `,
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}