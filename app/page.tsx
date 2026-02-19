export default function Home() {
  
  return (
    <main className="bg-white text-slate-900 overflow-x-hidden">

      {/* HERO */}
      <section className="bg-[#f4f6fb] py-32">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1 rounded-full mb-6">
            LGS & YKS Öğrencileri İçin Özel
          </span>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Sınava Hazırlıkta <span className="text-blue-700">Disiplin</span> + <br />
            <span className="text-purple-700">Psikolojik Dayanıklılık</span> = <br />
            Gerçek Performans
          </h1>

          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-10">
            LGS ve YKS öğrencileri için yapılandırılmış Akademik Performans ve
            Psikolojik Dayanıklılık Modeli
          </p>

          <div className="flex justify-center gap-4 flex-wrap mb-16">
            <a
              href="#iletisim"
              className="px-6 py-3 bg-gradient-to-br from-[#2f3e9e] via-[#2b3594] to-[#1e266d] text-white rounded-lg font-medium shadow hover:scale-105 transition"
            >
              Ücretsiz Ön Görüşme Planla →
            </a>

            <a
              href="#model"
              className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:border-slate-500 transition"
            >
              Modeli İncele →
            </a>
          </div>

          {/* İSTATİSTİKLER */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

            <div>
              <h3 className="text-xl font-bold text-[#2f3e9e]">7-8</h3>
              <p className="text-sm text-slate-500">Sınıf LGS</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#2f3e9e]">11-12</h3>
              <p className="text-sm text-slate-500">Sınıf YKS</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#2f3e9e]">20-30</h3>
              <p className="text-sm text-slate-500">Öğrenci Kapasitesi</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#2f3e9e]">1:1</h3>
              <p className="text-sm text-slate-500">Bireysel Takip</p>
            </div>

          </div>

        </div>
      </section>

      {/* TANIDIK GELİYOR MU */}
      <section className="bg-[#f4f6fb] py-24">
        <div className="max-w-6xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tanıdık Geliyor mu?
          </h2>
          <p className="text-slate-600">
            Birçok öğrenci ve veli bu sorunlarla karşılaşıyor
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">

          {/* Veliler */}
          <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 flex items-center justify-center rounded-lg font-bold">
                👤
              </div>
              <h3 className="font-semibold text-lg">Veliler için</h3>
            </div>

            <ul className="space-y-4 text-slate-600">
              <li>✔ Çalışıyor ama verim alamıyor</li>
              <li>✔ Denemede potansiyelini yansıtamıyor</li>
              <li>✔ Kaygı ve stres belirgin</li>
              <li>✔ Program sürdürülemiyor</li>
            </ul>
          </div>

          {/* Öğrenciler */}
          <div className="bg-white border border-amber-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 flex items-center justify-center rounded-lg font-bold">
                🎓
              </div>
              <h3 className="font-semibold text-lg">Öğrenciler için</h3>
            </div>

            <ul className="space-y-4 text-slate-600">
              <li>○ Nereden başlayacağını bilmiyor</li>
              <li>○ Motivasyonu dalgalı</li>
              <li>○ Netler artmıyor</li>
              <li>○ Denemede bildiğini yapamıyor</li>
            </ul>
          </div>

        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <div className="bg-gradient-to-br from-[#2f3e9e] via-[#2b3594] to-[#1e266d] text-white rounded-xl py-4 text-center font-medium shadow">
            Sorun bilgi eksikliği değil, sistem ve psikolojik dayanıklılık eksikliği.
          </div>
        </div>
      </section>

      {/* MODEL */}
      <section id="model" className="bg-white py-32">
        <div className="max-w-6xl mx-auto px-6 text-center mb-16">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1 rounded-full mb-4">
            SİSTEMİN YAPISI
          </span>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Akademik Performans ve <br /> Psikolojik Dayanıklılık Modeli
          </h2>

          <p className="text-slate-600 max-w-2xl mx-auto">
            Üç temel sütun üzerine yapılandırılmış, ölçülebilir ve sürdürülebilir bir sistem
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">

          {/* Kart 1 */}
          <div className="bg-[#f4f6fb] rounded-2xl p-8 border border-slate-200">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 flex items-center justify-center rounded-lg mb-6">
              📊
            </div>
            <h3 className="font-semibold mb-4">
              Bireysel Performans Koçluğu
            </h3>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li>• Haftalık 30 dk bireysel görüşme</li>
              <li>• Kişisel planlama</li>
              <li>• Kaygı takibi</li>
              <li>• Deneme analiz sistemi</li>
            </ul>
          </div>

          {/* Kart 2 */}
          <div className="bg-[#f4f6fb] rounded-2xl p-8 border border-slate-200">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 flex items-center justify-center rounded-lg mb-6">
              📈
            </div>
            <h3 className="font-semibold mb-4">
              Sistemli Akademik Takip
            </h3>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li>• Hedef analiz sistemi</li>
              <li>• Net artış değerlendirme</li>
              <li>• Aylık raporlama</li>
              <li>• Detaylı ilerleme takibi</li>
            </ul>
          </div>

          {/* Kart 3 */}
          <div className="bg-[#f4f6fb] rounded-2xl p-8 border border-slate-200">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-lg mb-6">
              🧠
            </div>
            <h3 className="font-semibold mb-4">
              Psikolojik Dayanıklılık Eğitimi
            </h3>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li>• Haftalık canlı oturum</li>
              <li>• Zaman ve duygu yönetimi</li>
              <li>• Sınav kaygısı yönetimi</li>
              <li>• Seminer + ödevlendirme</li>
            </ul>
          </div>

        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <div className="bg-amber-50 border border-amber-200 text-slate-700 rounded-xl py-4 text-center text-sm shadow-sm">
            Kaliteyi korumak için 20–30 öğrenci ile çalışıyoruz.
          </div>
        </div>
      </section>

     {/* PAKETLER */}
      <section className="bg-[#f4f6fb] py-28" id="paketler">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <span className="text-sm bg-slate-200 px-4 py-1 rounded-full text-slate-600">
            PAKETLER
          </span>

          <h2 className="text-4xl font-bold mt-6 mb-3">
            Size Uygun Paketi Seçin
          </h2>

          <p className="text-slate-600 mb-14">
            Her öğrencinin ihtiyacı farklıdır. Size en uygun desteği sunuyoruz.
          </p>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Paket 1 */}
            <div className="reveal bg-white rounded-2xl p-8 shadow-sm border hover:shadow-lg transition">
              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500">
                TEMEL
              </span>

              <h3 className="text-xl font-semibold mt-4 mb-6">
                Akademik Performans Paketi
              </h3>

              <ul className="text-sm text-slate-600 space-y-3 text-left mb-8">
                <li>• Haftalık 30 dk bireysel görüşme</li>
                <li>• Kişisel akademik planlama</li>
                <li>• Kaynak öneri takibi</li>
                <li>• Deneme analizi sistemi</li>
                <li>• Aylık performans raporu</li>
              </ul>

              <button className="w-full py-3 bg-slate-800 text-white rounded-lg hover:opacity-90 transition">
                Ön Görüşme İste
              </button>
            </div>


            {/* Paket 2 - ÖNERİLEN */}
            <div className="reveal bg-gradient-to-br from-[#2f3e9e] via-[#2b3594] to-[#1e266d] text-white rounded-2xl p-8 shadow-xl relative scale-105">

              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-semibold px-4 py-1 rounded-full">
                ⭐ ÖNERİLEN
              </span>

              <h3 className="text-xl font-semibold mt-6 mb-6">
                Performans + Psikolojik Dayanıklılık
              </h3>

              <ul className="text-sm space-y-3 text-left mb-8 opacity-90">
                <li>• Tüm Akademik Performans hizmetleri</li>
                <li>• Haftalık canlı online seminer</li>
                <li>• Zaman ve duygu yönetimi eğitimi</li>
                <li>• Sınav kaygısı çalışmaları</li>
                <li>• Haftalık disiplin kontrolü</li>
                <li>• Seminer sonrası ödevlendirme</li>
              </ul>

              <button className="w-full py-3 bg-white text-[#2f3e9e] font-semibold rounded-lg hover:opacity-90 transition">
                Ön Görüşme İste
              </button>
            </div>


            {/* Paket 3 */}
            <div className="reveal bg-white rounded-2xl p-8 shadow-sm border hover:shadow-lg transition">
              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500">
                SINIRLI
              </span>

              <h3 className="text-xl font-semibold mt-4 mb-6">
                VIP Performans Takip
              </h3>

              <ul className="text-sm text-slate-600 space-y-3 text-left mb-8">
                <li>• Tüm Performans + Psikolojik içerikler</li>
                <li>• Haftada 2 bireysel görüşme</li>
                <li>• Günlük deneme analizi</li>
                <li>• Motivasyon ve hedef takibi</li>
                <li>• 7/24 WhatsApp destek hattı</li>
              </ul>

              <button className="w-full py-3 bg-gradient-to-br from-[#2f3e9e] via-[#2b3594] to-[#1e266d] text-white rounded-lg hover:opacity-90 transition">
                Ön Görüşme İste
              </button>
            </div>

          </div>

          <div className="mt-12 bg-amber-50 border border-amber-200 text-amber-700 py-4 rounded-xl">
            Kaliteyi korumak için 20-30 öğrenci ile çalışıyoruz.
          </div>
        </div>
      </section>
 
      {/* NASIL ÇALIŞIYORUZ */}
      <section className="bg-white py-28">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <span className="text-sm bg-slate-100 px-4 py-1 rounded-full text-slate-600">
            SÜREÇ
          </span>

          <h2 className="text-4xl font-bold mt-6 mb-3">
            Nasıl Çalışıyoruz?
          </h2>

          <p className="text-slate-600 mb-20">
            Sistematik ve şeffaf bir süreç ile başarıya ulaşıyoruz
          </p>

          <div className="relative">

            {/* Ortadaki Çizgi */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-1 bg-slate-200 h-full"></div>

            {[
              {
                title: "Ön Görüşme",
                text: "Ücretsiz tanışma görüşmesi ile öğrencinin mevcut durumu değerlendirilir."
              },
              {
                title: "Başlangıç Performans Analizi",
                text: "Akademik düzey, çalışma alışkanlıkları ve psikolojik harita detaylı analiz edilir."
              },
              {
                title: "Kişisel Sistem Kurulumu",
                text: "Öğrenciye özel çalışma planı, kaynak yapısı ve takip sistemi oluşturulur."
              },
              {
                title: "Haftalık Disiplinli Takip",
                text: "Bireysel görüşmeler ve canlı seminerlerle sistemli gelişim sağlanır."
              },
              {
                title: "Aylık Raporlama",
                text: "Velilere detaylı performans raporu sunularak süreç şeffaf ilerletilir."
              }
            ].map((step, i) => (
              <div
                key={i}
                className={`relative mb-20 flex items-center ${
                  i % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                {/* Kart */}
                <div className="w-full md:w-5/12 bg-white border rounded-2xl shadow-sm p-6 text-left hover:shadow-lg transition">

                  <h4 className="font-semibold text-lg mb-2">
                    {step.title}
                  </h4>

                  <p className="text-slate-600 text-sm">
                    {step.text}
                  </p>
                </div>

                {/* Orta Nokta */}
                <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-[#2f3e9e] via-[#2b3594] to-[#1e266d] text-white flex items-center justify-center rounded-full font-semibold shadow">
                  {i + 1}
                </div>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* PERFORMANS MESAJI */}
      <section className="relative bg-gradient-to-br from-[#2f3e9e] via-[#2b3594] to-[#1e266d] text-white py-28 overflow-hidden">

  {/* Glow Effect */}
  <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-amber-300/10 rounded-full blur-3xl"></div>

  <div className="relative max-w-6xl mx-auto px-6 text-center">

    <h2 className="text-4xl font-bold leading-snug mb-4">
      Bu bir motivasyon programı değil. <br />
      <span className="text-amber-300">Bu bir performans sistemidir.</span>
    </h2>

    <div className="grid md:grid-cols-3 gap-8 mt-16">

      {[
        {
          title: "Ölçülebilir",
          text: "Her hafta ve her ay somut verilerle ilerleme takip edilir."
        },
        {
          title: "Raporlanabilir",
          text: "Velilere detaylı performans raporları düzenli olarak sunulur."
        },
        {
          title: "Sürdürülebilir",
          text: "Yapılandırılmış sistem sayesinde disiplinli ve sürekli gelişim sağlanır."
        }
      ].map((item, i) => (
        <div
          key={i}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl"
        >
          <h4 className="font-semibold text-lg mb-3">
            {item.title}
          </h4>
          <p className="text-sm text-white/80">
            {item.text}
          </p>
        </div>
      ))}

    </div>

    <div className="mt-12 text-amber-300 font-medium">
      Sistem + Disiplin + Psikolojik Dayanıklılık = Başarı
    </div>

  </div>
</section>


      {/* VELİ - ÖĞRENCİ */}
      <section className="bg-[#f4f6fb] py-28">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">

          {/* VELİ */}
          <div className="reveal bg-white rounded-2xl shadow-sm border p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Sayın Veli</h3>

            <p className="text-slate-600 mb-6">
              Çocuğunuzun potansiyeli var. Akademik potansiyeli, sistemle performansa dönüşür.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-slate-700 mb-6">
              ✓ Her ay detaylı performans raporu sunuyoruz. <br />
              ✓ Süreç şeffaf ve ölçülebilir.
            </div>

            <p className="text-slate-500 text-sm">
              Birlikte, çocuğunuzun başarısını yapılandırıyoruz.
            </p>
          </div>


          {/* ÖĞRENCİ */}
          <div className="reveal bg-white rounded-2xl shadow-sm border p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Sevgili Öğrenci</h3>

            <p className="text-slate-600 mb-6">
              Bu süreç yalnız değilsin. Ama başarı tesadüf değil.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-slate-700 mb-6">
              1️⃣ Seni sisteme alırız <br />
              2️⃣ Takip ederiz <br />
              3️⃣ Geliştiririz
            </div>

            <p className="text-slate-500 text-sm">
              Sen çalış, biz sistemle destekleyelim.
            </p>
          </div>

        </div>
      </section>

      {/* BÜYÜK CTA */}
      <section className="relative bg-gradient-to-br from-[#2f3e9e] via-[#2b3594] to-[#1e266d] text-white py-28 text-center overflow-hidden">

  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]"></div>

  <div className="relative max-w-5xl mx-auto px-6">

    <h2 className="text-4xl font-bold leading-snug mb-6">
      Sıradan bir koçluk değil, <br />
      <span className="text-amber-300">
        yapılandırılmış bir performans modeli
      </span>{" "}
      arıyorsanız...
    </h2>

    <p className="text-white/80 mb-10">
      Öğrencinizin potansiyelini sistematik bir şekilde performansa dönüştürme zamanı.
    </p>

    <a
      href="#iletisim"
      className="inline-block px-8 py-4 bg-white text-[#2f3e9e] font-semibold rounded-xl shadow hover:scale-105 transition"
    >
      Ücretsiz Ön Görüşme Planlayın →
    </a>

    <div className="grid grid-cols-3 gap-6 mt-16 text-sm text-white/80">
      <div>
        <div className="text-xl font-bold text-white">20-30</div>
        Sınırlı Kontenjan
      </div>
      <div>
        <div className="text-xl font-bold text-white">1:1</div>
        Bireysel Takip
      </div>
      <div>
        <div className="text-xl font-bold text-white">100%</div>
        Ölçülebilir Sistem
      </div>
    </div>

  </div>
</section>



        {/* FOOTER */}
        <footer className="bg-[#1e266d] text-white py-12">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-sm">

            <div>
              <h4 className="font-semibold mb-3">Öğrenci Koçu Adana</h4>
              <p className="text-white/70">
                LGS ve YKS öğrencileri için yapılandırılmış Akademik Performans ve Psikolojik Dayanıklılık Modeli.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">İletişim</h4>
              <p className="text-white/70">
                📞 0 547 380 38 01 <br />
                ✉ ogrencikocuadana@gmail.com <br />
                📍 Adana, Türkiye
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Çalışma Saatleri</h4>
              <p className="text-white/70">
                Pazartesi - Cuma: 09:00 - 18:00 <br />
                Cumartesi: 10:00 - 15:00
              </p>
            </div>

          </div>

          <div className="text-center text-xs text-white/50 mt-10">
            © 2026 Öğrenci Koçu Adana. Tüm hakları saklıdır.
          </div>
        </footer>







    </main>
  );
}
