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
      "YKS hazırlık sürecinde ne zaman ne yapmalısınız? Kaynak seçiminden deneme stratejisine, sınav psikolojisinden zaman yönetimine kadar TYT ve AYT hazırlığının tam rehberi.",
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
      "LGS ve YKS hazırlığında zaman yönetimi nasıl yapılır? Pomodoro tekniği, haftalık çalışma planı ve odaklanmayı artırma yöntemleriyle çalışma veriminizi ikiye katlayın.",
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

Günlük plan yerine haftalık hedef sistemi çok daha sürdürülebilir. Her hafta başında şu soruları sorun:

- Bu hafta hangi konuları tamamlayacağım?
- Kaç deneme çözeceğim?
- Hangi zayıf konularıma odaklanacağım?

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
  {
    slug: "lgs-hazirlik-rehberi",
    title: "LGS'ye Nasıl Hazırlanılır? 8. Sınıf Öğrencileri İçin Kapsamlı Rehber",
    description:
      "LGS hazırlık rehberi: ne zaman başlanmalı, hangi konulara öncelik verilmeli, deneme stratejisi nasıl kurulmalı? 8. sınıf öğrencileri için adım adım LGS çalışma planı.",
    date: "2026-02-20",
    readTime: "7 dk",
    category: "LGS Hazırlık",
    content: `
## LGS Nedir ve Neden Bu Kadar Önemli?

Liselere Geçiş Sınavı (LGS), 8. sınıf öğrencilerinin lise tercihlerini belirleyen kritik bir sınavdır. Türkiye genelinde yüz binlerce öğrencinin girdiği bu sınavda başarı, doğru hazırlık sistemiyle doğru orantılıdır.

**LGS'nin yapısı:**
- Türkçe, Matematik, Fen Bilimleri, İnkılap Tarihi, Din Kültürü, Yabancı Dil
- Toplam 90 soru, 90 dakika
- Yanlış cevaplar doğruyu götürmez

---

## 1. Ne Zaman Başlamalı?

Pek çok öğrenci hazırlığa geç başladığı için yetiştirememe paniği yaşıyor. **İdeal başlangıç 7. sınıfın sonudur.** Ama 8. sınıfın başında başlanırsa da yeterli süre vardır.

Önemli olan başlama tarihi değil, **düzenli ve sistemli çalışmaktır.**

---

## 2. Konu Önceliklendirmesi

Her konu eşit ağırlıkta değildir. LGS'de en fazla soruyu getiren konulara öncelik verin:

**Matematik:**
- Veri analizi ve olasılık
- Denklemler ve eşitsizlikler
- Üçgenler ve geometri

**Türkçe:**
- Paragraf anlama
- Dil bilgisi
- Sözcük türleri

**Fen Bilimleri:**
- Madde ve özellikleri
- Kuvvet ve hareket
- Hücre ve canlılar

---

## 3. Deneme Sınavı Stratejisi

Deneme sınavları LGS hazırlığının bel kemiğidir. Ancak deneme çözmek yetmez — **analiz şarttır.**

Her denemeden sonra yapılması gerekenler:
- Yanlış soruları not defterine yaz
- Her yanlışın sebebini belirle (bilmemek mi, dikkatsizlik mi?)
- O konuya tekrar dön

---

## 4. Son 3 Ay: Yoğunlaşma Dönemi

LGS'ye 3 ay kala strateji değişmelidir:

- Yeni konu öğrenmek yerine **tekrar ve pekiştirme**
- Haftada en az 2 tam deneme
- Zayıf konulara odaklanma
- Sınav simülasyonu (gerçek sınav koşullarında çözüm)

---

## 5. Aile Desteğinin Önemi

LGS sürecinde velilerin tutumu öğrencinin performansını doğrudan etkiler. Baskı değil, destek motivasyonu artırır.

- Karşılaştırma yapmaktan kaçının
- Küçük başarıları kutlayın
- Hataları öğrenme fırsatı olarak görün

---

## Sonuç

LGS başarısı zekadan çok sisteme bağlıdır. Doğru plan, düzenli çalışma ve psikolojik destek bir arada olduğunda sonuçlar kaçınılmaz olarak gelir. Adana'daki öğrencilerimizle yürüttüğümüz koçluk sürecinde bunu defalarca gördük.
    `,
  },
  {
    slug: "sinav-kaygisi-nasil-yenilir",
    title: "Sınav Kaygısı Nasıl Yenilir? Psikolojik Dayanıklılık Rehberi",
    description:
      "LGS ve YKS öncesi sınav kaygısıyla nasıl başa çıkılır? Nefes teknikleri, düşünce yeniden yapılandırma ve sınav günü rutini ile kaygıyı yönetmenin bilimsel yolları.",
    date: "2026-02-24",
    readTime: "6 dk",
    category: "Sınav Kaygısı",
    content: `
## Sınav Kaygısı Nedir?

Sınav öncesi yaşanan heyecan, kalp çarpıntısı, uyku sorunları veya zihnin boşalması — bunların tamamı sınav kaygısının belirtileridir. Adana'da çalıştığımız öğrencilerin büyük çoğunluğu bu sorunla karşılaşıyor.

**Önemli bir gerçek:** Hafif düzeyde kaygı aslında performansı artırır. Sorun, kaygının kontrol edilemez hale gelmesidir.

---

## Kaygının Kaynağı Nedir?

Sınav kaygısı genellikle şu düşüncelerden beslenir:

- "Ya başarısız olursam?"
- "Herkes benden daha iyi hazırlandı"
- "Bu sınav hayatımı belirleyecek"

Bu düşünceler gerçek değil, **zihnin ürettiği senaryolardır.** Ve senaryolar değiştirilebilir.

---

## 1. Nefes Tekniği: 4-7-8 Yöntemi

Kaygı anında vücudun stres tepkisini durdurmak için nefes tekniği kullanın:

- **4 saniye** burundan nefes al
- **7 saniye** nefesi tut
- **8 saniye** ağızdan yavaşça ver

Bu tekniği günde 2-3 kez, özellikle sınav öncesi uygulayın. Parasempatik sinir sistemini aktive ederek sakinleşmeyi sağlar.

---

## 2. Düşünce Yeniden Yapılandırma

Kaygı yaratan düşünceleri fark edip dönüştürün:

- "Ya başarısız olursam?" → "Hazırlandım, elimden geleni yapacağım"
- "Herkes benden iyi" → "Kendi gelişimime odaklanıyorum"
- "Bu sınav her şeyi belirler" → "Bu bir aşama, hayatımın tamamı değil"

---

## 3. Sınav Günü Rutini

Sınav sabahı için sabit bir rutin oluşturun:

- Erken kalkın, acele etmeyin
- Hafif ve sağlıklı kahvaltı yapın
- Müzik dinleyin veya kısa yürüyüş yapın
- Sınav öncesi son dakika çalışmaktan kaçının

---

## 4. Sınav Anında Kaygıyla Başa Çıkma

Sınav sırasında zihin boşalırsa:

- Kalemi bırakın, 3 derin nefes alın
- Gözlerinizi kapatın, 5 saniye
- "Ben bunu biliyorum" diye kendinize söyleyin
- Kolay sorulardan başlayarak özgüven kazanın

---

## 5. Uzun Vadeli Çözüm: Sistem Kurmak

Sınav kaygısının en kalıcı çözümü, **hazırlığa güvenmektir.** Düzenli çalışan, denemelerini analiz eden ve sistematik ilerleme kaydeden öğrenciler kaygıyı çok daha az yaşar.

Çünkü kaygı çoğunlukla "yeterince hazırlanmadım" hissinden beslenir.

---

## Sonuç

Sınav kaygısı yenilmez değil, yönetilebilir. Doğru teknikler ve sistematik hazırlık bir arada olduğunda hem performans artar hem de sınav süreci çok daha sağlıklı geçer. Bu konuda destek almak istiyorsanız, bireysel koçluk seanslarımızda kaygı yönetimini de ele alıyoruz.
    `,
  },
  {
    slug: "verimli-ders-calisma-teknikleri",
    title: "Verimli Ders Çalışmanın 7 Altın Kuralı",
    description:
      "Az çalışıp çok verim almanın yolları: aktif öğrenme, aralıklı tekrar, Feynman tekniği ve test efekti. LGS ve YKS hazırlığında verimliliği artıran bilimsel çalışma teknikleri.",
    date: "2026-03-03",
    readTime: "5 dk",
    category: "Verimli Çalışma",
    content: `
## Neden Bazı Öğrenciler Az Çalışıp Çok Başarıyor?

"O hiç çalışmıyor ama hep başarılı" — bu cümleyi muhtemelen duymuşsunuzdur. Gerçekte bu öğrenciler daha az değil, **daha verimli** çalışıyor.

Verimlilik bir yetenek değil, öğrenilebilir bir beceridir.

---

## 1. Aktif Öğrenme: Okumak Yetmez

En yaygın hata: kitabı baştan sona okuyup "çalıştım" demek. **Pasif okuma bilgiyi kalıcı kılmaz.**

Aktif öğrenme yöntemleri:
- **Feynman Tekniği:** Öğrendiğinizi sanki birine anlatıyormuş gibi kendinize açıklayın
- **Soru üretme:** Konuyu okuduktan sonra "Bu konudan ne sorulabilir?" diye düşünün
- **Özet çıkarma:** Kendi cümlelerinizle not alın

---

## 2. Aralıklı Tekrar: Unutmanın Önüne Geçin

İnsan beyni öğrenilen bilgiyi zamanla unutur. Buna "unutma eğrisi" denir. Çözüm **aralıklı tekrardır:**

- Öğrendikten 1 gün sonra tekrar et
- 3 gün sonra tekrar et
- 1 hafta sonra tekrar et
- 1 ay sonra tekrar et

Bu sistem, bilgiyi uzun süreli belleğe taşır.

---

## 3. Çalışma Ortamı: Beyin Nerede Çalışır?

Çalışma ortamı performansı doğrudan etkiler:

- **Masa düzeni:** Sadece o an çalışılan materyal masada olsun
- **Telefon:** Görüş alanı dışında, sessiz modda
- **Işık:** Doğal ışık tercih edilmeli
- **Gürültü:** Beyaz gürültü veya müziksiz ortam

---

## 4. Zor Konudan Başlayın

Öğrencilerin çoğu kolay konularla başlar, zor konuları sona bırakır. Oysa beyin sabah saatlerinde en güçlüdür. **En zor konuyu ilk sıraya alın.**

---

## 5. Test Efekti: En İyi Öğrenme Yöntemi

Araştırmalar, **test çözmenin** okumaktan çok daha etkili bir öğrenme yöntemi olduğunu gösteriyor. Konu bittikten hemen sonra test çözün — yanlışlar neyi öğrenmediğinizi gösterir.

---

## 6. Uyku: Öğrenmenin Gizli Silahı

Uyku sırasında beyin gün içinde öğrenilenleri pekiştirir. Uyku kesmek çalışma süresini artırır ama verimliliği ciddi düşürür.

**7-8 saat uyku,** 2 saat ekstra çalışmadan çok daha değerlidir.

---

## 7. Tek Konu, Tek Oturum

Birden fazla konuyu aynı anda çalışmak "çok iş yaptım" hissi verir ama öğrenmeyi engeller. **Her oturumda tek konuya odaklanın,** onu bitirin.

---

## Sonuç

Verimli çalışma alışkanlıkları kazanmak zaman alır ama bir kez oturduğunda sonuçlar dramatik şekilde değişir. Adana'daki öğrencilerimizle koçluk sürecinde bu teknikleri birlikte uyguluyoruz.
    `,
  },
  {
    slug: "telefon-bagimliligini-yenmek",
    title: "Telefon Bağımlılığını Yenmek: Öğrenciler İçin Pratik Rehber",
    description:
      "Telefon bağımlılığı sınav hazırlığını nasıl etkiler? Ekran süresini azaltmak, odaklanmayı artırmak ve sosyal medya kullanımını kontrol altına almak için kanıtlanmış yöntemler.",
    date: "2026-03-10",
    readTime: "5 dk",
    category: "Verimli Çalışma",
    content: `
## Telefon Gerçekten Bu Kadar Zararlı mı?

Kısa cevap: Evet. Uzun cevap da evet, ama neden olduğunu anlamak önemli.

Sosyal medya uygulamaları **kasıtlı olarak bağımlılık yaratacak şekilde tasarlanmıştır.** Bildirimler, sonsuz akış, beğeniler — bunların tamamı dopamin salgılatır ve tekrar tekrar kontrol etme ihtiyacı doğurur.

Adana'da çalıştığımız öğrencilerle yaptığımız gözlemlerde, telefonu masada tutanların odaklanma süresi **telefonu başka odaya bırakanların yarısı kadardır.**

---

## Telefonun Çalışmaya Etkisi

- Bir bildirim geldiğinde dikkat tam odaklanmaya geri dönmek **23 dakika** sürebilir
- Telefon görüş alanında olduğunda, açmasanız bile zihin bir kısmını ona ayırır
- Sosyal medya önce 5 dakika diye açılır, genellikle 45 dakikayla biter

---

## 1. Fiziksel Mesafe: En Etkili Yöntem

Telefonu çalışma ortamından fiziksel olarak uzaklaştırın. Başka bir odaya koyun, çantaya atın — ama masada bırakmayın.

Bu basit değişiklik, öğrencilerimizde en hızlı sonucu veren yöntemdir.

---

## 2. Odak Modu ve Uygulama Kilitleri

Telefonunuzun odak modu veya dijital sağlık özelliklerini kullanın:

- **iPhone:** Odak Modu → Çalışma profili oluşturun
- **Android:** Dijital Sağlık → Uygulama zamanlayıcıları

Sosyal medya uygulamalarına günlük 30 dakika limit koyun.

---

## 3. Telefon Kullanım Ritüeli

Telefonu tamamen yasaklamak uzun vadede işe yaramaz. Bunun yerine **planlı kullanım** deneyin:

- Pomodoro molalarında (5-10 dakika) kullanın
- Öğle arasında belirli bir süre kullanın
- Akşam yemeğinde serbestçe kullanın

Kontrollü kullanım, yasak hissini ortadan kaldırır.

---

## 4. Bildirim Temizliği

Tüm gereksiz bildirimleri kapatın. Sadece arama ve mesaj bildirimi açık kalsın. Bu tek değişiklik bile telefonu elinize alma sıklığını dramatik şekilde azaltır.

---

## 5. Alternatif Aktiviteler

Telefona uzandığınızda aslında ne hissediyorsunuz? Çoğunlukla **can sıkıntısı, kaçış isteği veya ödül arayışı.**

Bu ihtiyaçları farklı yollarla karşılayın:
- Can sıkıntısı → Kısa yürüyüş
- Kaçış isteği → Pomodoro molası
- Ödül arayışı → Bitirilen her konu için kendinizi ödüllendirin

---

## Sonuç

Telefon bağımlılığı irade meselesi değil, tasarım meselesidir. Doğru sistem kurulduğunda bu savaşı kazanmak mümkündür. Koçluk sürecimizde dijital bağımlılık yönetimini de ele alıyor, öğrencilerimizin odaklanma kapasitesini artırmalarına destek oluyoruz.
    `,
  },
  {
    slug: "psikolojik-dayaniklilik-nedir",
    title: "Psikolojik Dayanıklılık Nedir ve Öğrenciler Nasıl Geliştirebilir?",
    description:
      "Sınav başarısını belirleyen gizli faktör: psikolojik dayanıklılık. Büyüme odaklı düşünce, başarısızlıkla başa çıkma ve LGS/YKS sürecinde motivasyonu koruma rehberi.",
    date: "2026-03-17",
    readTime: "6 dk",
    category: "Psikolojik Dayanıklılık",
    content: `
## Psikolojik Dayanıklılık Nedir?

Psikolojik dayanıklılık (resilience), zorluklarla karşılaşıldığında çökmeden, mücadele ederek ilerleme kapasitesidir. Bu bir kişilik özelliği değil — **geliştirilebilir bir beceridir.**

Adana'da çalıştığımız öğrencilerle yıllar içinde öğrendik ki sınavda başarıyı belirleyen en önemli faktör bilgi değil, **zorluklara karşı gösterilen psikolojik tepkidir.**

---

## Dayanıklı Öğrencilerin Ortak Özellikleri

- Kötü bir deneme sonrasında çökmek yerine analiz yaparlar
- Başkalarıyla kendilerini kıyaslamak yerine kendi gelişimlerine odaklanırlar
- Hatayı kişilik sorunu olarak değil, öğrenme fırsatı olarak görürler
- Motivasyon düştüğünde sisteme güvenirler

---

## 1. Büyüme Odaklı Düşünce: "Henüz Yapamıyorum"

Sabit zihniyet: "Matematiği beceremiyorum."
Büyüme zihniyeti: "Matematiği **henüz** beceremiyorum."

Bu küçük kelime farkı, beynin öğrenmeye olan açıklığını değiştirir. Stanford Üniversitesi'nden Carol Dweck'in araştırmaları, büyüme zihniyetine sahip öğrencilerin zorluklarla karşılaştığında çok daha uzun süre mücadele ettiğini gösteriyor.

---

## 2. Başarısızlığı Yeniden Çerçeveleme

Kötü bir deneme sonucu aldığınızda kendinize şu soruyu sorun: **"Bu bana ne öğretiyor?"**

- Hangi konular eksik?
- Nerede zaman kaybettim?
- Bir sonraki denemede ne farklı yapacağım?

Bu sorular odağı çöküşten çözüme taşır.

---

## 3. Küçük Kazanımları Kutlayın

Büyük hedefe odaklanmak bazen bunaltıcı olabilir. Küçük kazanımları fark etmek ve kutlamak motivasyonu canlı tutar:

- Zor bir konuyu bitirdiniz → Kutlayın
- Deneme netiniz 1 arttı → Fark edin
- Planlı çalışmayı 1 hafta sürdürdünüz → Kendinizi takdir edin

---

## 4. Destek Sistemi Kurun

Psikolojik dayanıklılık yalnız geliştirilmez. Destekleyici bir çevre şarttır:

- Sizi anlayan bir veli veya öğretmen
- Birlikte çalıştığınız bir arkadaş
- Profesyonel bir koç veya danışman

---

## 5. Stres Yönetimi: Bedenle Başlayan Denge

Psikolojik dayanıklılık bedenden başlar:

- Düzenli uyku
- Fiziksel hareket (günde 20-30 dakika)
- Sağlıklı beslenme
- Doğada zaman geçirmek

Bu alışkanlıklar stres toleransını artırır.

---

## Sonuç

Psikolojik dayanıklılık, doğuştan gelen bir özellik değil, pratikle kazanılan bir beceridir. Koçluk programımızda akademik çalışmanın yanı sıra bu becerilerin geliştirilmesine de aynı önemi veriyoruz — çünkü sınav başarısı için ikisi de şart.
    `,
  },
  {
    slug: "deneme-analizi-nasil-yapilir",
    title: "Deneme Analizi Nasıl Yapılır? Net Artışının Sırrı",
    description:
      "Deneme çözmek yetmez, analiz şart. LGS ve YKS öğrencileri için hata kategorileme, öncelikli konu belirleme ve aksiyon planı oluşturma adımlarıyla deneme analizi rehberi.",
    date: "2026-03-24",
    readTime: "5 dk",
    category: "LGS Hazırlık",
    content: `
## Neden Deneme Çözmek Yetmez?

"Çok deneme çözüyorum ama netlerim artmıyor." Bu şikayeti çok sık duyuyoruz. Sorunun cevabı genellikle aynı: **deneme analizi yapılmıyor.**

Deneme çözmek hammaddeyi toplamak gibidir. Analiz ise o hammaddeyi işleyip ürüne dönüştürmektir. İkinci adım olmadan birincisi anlamsızlaşır.

---

## Deneme Analizi Kaç Aşamadan Oluşur?

Etkili bir deneme analizi 4 aşamada yapılır:

- **Aşama 1:** Hataları kategorize et
- **Aşama 2:** Hata nedenlerini belirle
- **Aşama 3:** Öncelikli konuları belirle
- **Aşama 4:** Aksiyon planı oluştur

---

## Aşama 1: Hataları Kategorize Et

Yaptığınız hataları 3 gruba ayırın:

- **Bilgi hatası:** O konuyu bilmiyorsunuz
- **Dikkat hatası:** Biliyorsunuz ama yanlış okudunuz veya acele ettiniz
- **Teknik hata:** Konuyu biliyorsunuz ama soru tipini çözemediniz

Her grup için farklı çözüm gerekir.

---

## Aşama 2: Hata Nedenlerini Belirle

Her yanlış soru için şu soruyu sorun: **"Bu soruyu neden yanlış yaptım?"**

Cevabı not edin. Zamanla bir örüntü göreceksiniz — belki hep aynı konu, belki hep son bölüm, belki hep dikkat hataları.

---

## Aşama 3: Öncelikli Konuları Belirle

Analiz sonunda hangi konulardan en çok hata yaptığınızı görürsünüz. Bu konuları öncelik sırasına koyun:

- **Yüksek öncelik:** Sık hata + Çok soru gelen konular
- **Orta öncelik:** Ara sıra hata + Orta düzey sorular
- **Düşük öncelik:** Nadiren hata + Az soru

---

## Aşama 4: Aksiyon Planı

Her analiz bir eylem planıyla bitmeli:

- "Bu hafta şu konuyu tekrar edeceğim"
- "Dikkat hatalarını azaltmak için tempo çalışması yapacağım"
- "Şu soru tipinden 50 soru daha çözeceğim"

Plan olmadan analiz boşa gider.

---

## Pratik İpucu: Hata Defteri

Bir hata defteri oluşturun. Her yanlış soruyu ve hata nedenini buraya yazın. Sınav öncesi bu defteri gözden geçirmek, en zayıf noktalarınızı hızlıca hatırlatır.

---

## Sonuç

Deneme analizi sistematik yapıldığında net artışı kaçınılmaz hale gelir. Koçluk programımızda her hafta öğrencilerimizin denemelerini birlikte analiz ediyor, aksiyon planları oluşturuyoruz. Bu süreç, başıboş çalışmayı hedefe yönelik çalışmaya dönüştürüyor.
    `,
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}