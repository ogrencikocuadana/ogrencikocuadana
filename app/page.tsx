"use client";

import React, { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
  }, []);

  return (
    <main className="font-sans bg-[#f8f9fc] text-slate-900">

      {/* HERO */}
      <section className="bg-[#f8f9fc] py-36 md:py-44 text-center">
        <div className="max-w-5xl mx-auto px-6">

          {/* ÜST BADGE */}
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-5 py-2 rounded-full mb-8">
            LGS & YKS Öğrencileri İçin Özel
          </span>

          {/* ANA BAŞLIK */}
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight mb-8">
            Sınava Hazırlıkta <span className="text-blue-700">Disiplin</span> + <br />
            <span className="text-purple-700">Psikolojik Dayanıklılık</span> = <br />
            Gerçek Performans
          </h1>

          {/* ALT AÇIKLAMA */}
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            LGS ve YKS öğrencileri için yapılandırılmış <br />
            <span className="font-medium text-slate-800">
              Akademik Performans ve Psikolojik Dayanıklılık Modeli
            </span>
          </p>

          {/* BUTONLAR */}
          <div className="flex justify-center gap-6 flex-wrap mb-20">

            <a
              href="#iletisim"
              className="px-10 py-5 bg-[#2f3e9e] text-white rounded-3xl font-semibold shadow-[0_15px_40px_rgba(0,0,0,0.15)] hover:scale-105 transition-all duration-300"
            >
              Ücretsiz Ön Görüşme Planla →
            </a>

            <a
              href="#model"
              className="px-10 py-5 border border-slate-300 rounded-3xl font-semibold hover:bg-slate-100 transition-all duration-300"
            >
              Modeli İncele →
            </a>

          </div>

          {/* ALT İSTATİSTİKLER */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-4xl mx-auto">

            <div>
              <div className="text-2xl font-bold text-[#2f3e9e]">7-8</div>
              <div className="text-sm text-slate-500 mt-1">
                Sınıf LGS
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-[#2f3e9e]">11-12</div>
              <div className="text-sm text-slate-500 mt-1">
                Sınıf YKS
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-[#2f3e9e]">30</div>
              <div className="text-sm text-slate-500 mt-1">
                Öğrenci Kapasitesi
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-[#2f3e9e]">1:1</div>
              <div className="text-sm text-slate-500 mt-1">
                Bireysel Takip
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* PROBLEM ALANI */}
      <section className="bg-white py-36 md:py-44">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-20">
            Çalışıyor… <br />
            Ama İlerlemediğini Hissediyor.
          </h2>

          <div className="grid md:grid-cols-2 gap-10">

            {/* VELİ KART */}
            <div className="reveal bg-blue-50 border border-blue-100 rounded-3xl p-10 text-left shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

              <h3 className="text-2xl font-semibold mb-6 text-blue-700">
                Velilerden Duyuyoruz:
              </h3>

              <ul className="space-y-4 text-slate-700 leading-relaxed">
                <li>• “Ders çalışıyor ama netleri artmıyor.”</li>
                <li>• “Motivasyonu bir var bir yok.”</li>
                <li>• “Sınav yaklaştıkça kaygısı artıyor.”</li>
                <li>• “Potansiyeli var ama sistem yok.”</li>
              </ul>

            </div>


            {/* ÖĞRENCİ KART */}
            <div className="reveal bg-purple-50 border border-purple-100 rounded-3xl p-10 text-left shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

              <h3 className="text-2xl font-semibold mb-6 text-purple-700">
                Öğrencilerden Duyuyoruz:
              </h3>

              <ul className="space-y-4 text-slate-700 leading-relaxed">
                <li>• “Çalışıyorum ama yetmiyor.”</li>
                <li>• “Nerede yanlış yaptığımı bilmiyorum.”</li>
                <li>• “Plan yapıyorum ama sürdüremiyorum.”</li>
                <li>• “Denemede yapamadıkça moralim düşüyor.”</li>
              </ul>

            </div>

          </div>

          {/* ALT VURGU KARTI */}
          <div className="reveal mt-20 max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">

            <p className="text-xl md:text-2xl font-medium leading-relaxed">
              Sorun bilgi eksikliği değil, <br className="hidden md:block" />
              <span className="text-amber-300 font-semibold">
                sistem ve psikolojik dayanıklılık eksikliği.
              </span>
            </p>

          </div>

        </div>
      </section>

      {/* SİSTEMLİ YAKLAŞIM */}
      <section className="bg-white py-36 md:py-44">
        <div className="max-w-7xl mx-auto px-6">

          {/* ÜST BAŞLIK ALANI */}
          <div className="text-center mb-20">

            <span className="inline-block bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold tracking-wide mb-6">
              Sistemli Yaklaşım
            </span>

            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Akademik Performans ve Psikolojik Dayanıklılık Modeli
            </h2>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Ölçülebilir ve Sürdürülebilir Bir Sistem
            </p>

          </div>


          {/* 4 MODEL KARTI */}
          <div className="grid md:grid-cols-2 gap-10">

            {/* 1 */}
            <div className="reveal bg-blue-50 border border-blue-100 rounded-3xl p-10 shadow-lg hover:-translate-y-2 transition-all duration-300">

              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-6">
                👤
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-blue-800">
                Bireysel Koçluk Sistemi
              </h3>

              <p className="text-slate-700 leading-relaxed">
                Haftalık 30 dakikalık 1:1 görüşmelerle öğrencinin plan uyumu, 
                net artışı, motivasyon düzeyi ve hedef ilerlemesi analiz edilir. 
                Her hafta yapılandırılmış geri bildirim sağlanır ve süreç güncellenir.
              </p>

            </div>


            {/* 2 */}
            <div className="reveal bg-emerald-50 border border-emerald-100 rounded-3xl p-10 shadow-lg hover:-translate-y-2 transition-all duration-300">

              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-6">
                📊
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-emerald-800">
                Sistemli Akademik Takip
              </h3>

              <p className="text-slate-700 leading-relaxed">
                Deneme sınavları sadece çözülmez; detaylı analiz edilir. 
                Net artış grafikleri, konu bazlı hata paternleri ve plan uyum yüzdesi 
                ölçülerek öğrencinin gelişimi sayısal olarak takip edilir.
              </p>

            </div>


            {/* 3 */}
            <div className="reveal bg-purple-50 border border-purple-100 rounded-3xl p-10 shadow-lg hover:-translate-y-2 transition-all duration-300">

              <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-6">
                🧠
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-purple-800">
                Psikolojik Dayanıklılık Eğitimi
              </h3>

              <p className="text-slate-700 leading-relaxed">
                Sınav kaygısı yönetimi, özgüven inşası, sürdürülebilir motivasyon 
                ve stres toleransı üzerine yapılandırılmış çalışmalar uygulanır. 
                Öğrencinin mental dayanıklılığı sistematik olarak güçlendirilir.
              </p>

            </div>


            {/* 4 */}
            <div className="reveal bg-amber-50 border border-amber-100 rounded-3xl p-10 shadow-lg hover:-translate-y-2 transition-all duration-300">

              <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl mb-6">
                🎯
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-amber-700">
                Akademik Başarı Eğitimi
              </h3>

              <p className="text-slate-700 leading-relaxed">
                Etkili ders çalışma teknikleri, tekrar sistemi, deneme stratejisi 
                ve zaman yönetimi üzerine eğitimler verilir. 
                Öğrenci sadece çalışmaz, doğru çalışmayı öğrenir.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* PAKETLER */}
      <section className="bg-slate-100 py-36 md:py-44">
        <div className="max-w-7xl mx-auto px-6">

          {/* BAŞLIK */}
          <div className="text-center mb-20">

            <span className="inline-block bg-indigo-100 text-indigo-700 px-5 py-2 rounded-full text-sm font-semibold tracking-wide mb-6">
              Paketler
            </span>

            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Size Uygun Paketi Seçin
            </h2>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Her öğrencinin ihtiyacı farklıdır. Size en uygun desteği sunuyoruz.
            </p>

          </div>


          {/* 3 PAKET */}
          <div className="grid md:grid-cols-3 gap-10">

            {/* 1. PAKET */}
            <div className="reveal bg-white rounded-3xl p-10 shadow-lg border border-slate-200 hover:-translate-y-2 transition-all duration-300">

              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-6">
                📘
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                Akademik Performans Paketi
              </h3>

              <ul className="space-y-3 text-slate-600 leading-relaxed mb-6">
                <li>• Haftalık 1:1 bireysel koçluk</li>
                <li>• Plan & program takibi</li>
                <li>• Deneme analizi</li>
                <li>• Net artış takibi</li>
                <li>• Aylık gelişim raporu</li>
              </ul>

              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">
                Ön Görüşme Planla
              </button>

            </div>


            {/* 2. PAKET - ÖNERİLEN */}
            <div className="reveal bg-indigo-600 text-white rounded-3xl p-10 shadow-2xl relative hover:-translate-y-2 transition-all duration-300">

              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-semibold px-4 py-1 rounded-full">
                ÖNERİLEN
              </span>

              <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                🚀
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                Performans & Dayanıklılık Paketi
              </h3>

              <ul className="space-y-3 text-indigo-100 leading-relaxed mb-6">
                <li>• Haftalık 1:1 bireysel koçluk</li>
                <li>• Sistemli akademik takip</li>
                <li>• Psikolojik dayanıklılık eğitimi</li>
                <li>• Akademik başarı eğitimleri</li>
                <li>• Aylık detaylı veli raporu</li>
                <li>• Canlı seminer erişimi</li>
              </ul>

              <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-semibold hover:bg-slate-100 transition">
                Ön Görüşme Planla
              </button>

            </div>


            {/* 3. PAKET */}
            <div className="reveal bg-white rounded-3xl p-10 shadow-lg border border-slate-200 hover:-translate-y-2 transition-all duration-300">

              <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl mb-6">
                ⚡
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                Hızlı Okuma Eğitimi
              </h3>

              <ul className="space-y-3 text-slate-600 leading-relaxed mb-6">
                <li>• Okuma hızı ölçüm analizi</li>
                <li>• Göz egzersizleri</li>
                <li>• Anlama oranı geliştirme</li>
                <li>• Paragraf çözüm stratejileri</li>
                <li>• Süre kazandıran teknikler</li>
              </ul>

              <button className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition">
                Detaylı Bilgi Al
              </button>

            </div>

          </div>

        </div>
      </section>


            <section className="py-20 bg-gradient-to-br from-slate-100 via-white to-accent-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-slate-100 rounded-full">
              <span className="text-primary-800 font-semibold text-sm tracking-wide">
                SÜREÇ
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 mb-4">
              Nasıl Çalışıyoruz?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sistematik ve şeffaf bir süreç ile başarıya ulaşıyoruz
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-slate-200 via-amber-200 to-slate-200" />
            <div className="space-y-12">
              <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:flex-row">
                <div className="flex-1 lg:text-right">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 lg:mr-8">
                    <div className="flex items-center gap-4 mb-4 lg:justify-end justify-start">
                      <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg lg:hidden">
                        <svg
                          className="lucide lucide-message-circle w-6 h-6 text-white"
                          fill="none"
                          height="24"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                        </svg>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-primary-950">
                        Ön Görüşme
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Ücretsiz tanışma görüşmesi ile öğrencinin mevcut durumunu,
                      hedeflerini ve ihtiyaçlarını değerlendiriyoruz.
                    </p>
                  </div>
                </div>
                <div className="relative z-10 hidden lg:flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                    <svg
                      className="lucide lucide-message-circle w-10 h-10 text-white"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    1
                  </div>
                </div>
                <div className="flex-1 lg:block hidden">
                  <div className="lg:ml-8" />
                </div>
                <div className="lg:hidden absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  1
                </div>
              </div>
              <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:flex-row-reverse">
                <div className="flex-1 lg:text-left">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 lg:ml-8">
                    <div className="flex items-center gap-4 mb-4 lg:justify-start justify-start">
                      <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg lg:hidden">
                        <svg
                          className="lucide lucide-clipboard-check w-6 h-6 text-white"
                          fill="none"
                          height="24"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg">
                          <rect height="4" rx="1" ry="1" width="8" x="8" y="2" />
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                          <path d="m9 14 2 2 4-4" />
                        </svg>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-primary-950">
                        Başlangıç Performans Analizi
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Akademik düzey, çalışma alışkanlıkları ve psikolojik hazırlık
                      detaylı olarak analiz edilir.
                    </p>
                  </div>
                </div>
                <div className="relative z-10 hidden lg:flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                    <svg
                      className="lucide lucide-clipboard-check w-10 h-10 text-white"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg">
                      <rect height="4" rx="1" ry="1" width="8" x="8" y="2" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <path d="m9 14 2 2 4-4" />
                    </svg>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    2
                  </div>
                </div>
                <div className="flex-1 lg:block hidden">
                  <div className="lg:mr-8" />
                </div>
                <div className="lg:hidden absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  2
                </div>
              </div>
              <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:flex-row">
                <div className="flex-1 lg:text-right">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 lg:mr-8">
                    <div className="flex items-center gap-4 mb-4 lg:justify-end justify-start">
                      <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg lg:hidden">
                        <svg
                          className="lucide lucide-settings w-6 h-6 text-white"
                          fill="none"
                          height="24"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-primary-950">
                        Kişisel Sistem Kurulumu
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Öğrenciye özel çalışma planı, kaynak yol haritası ve takip
                      sistemi oluşturulur.
                    </p>
                  </div>
                </div>
                <div className="relative z-10 hidden lg:flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                    <svg
                      className="lucide lucide-settings w-10 h-10 text-white"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    3
                  </div>
                </div>
                <div className="flex-1 lg:block hidden">
                  <div className="lg:ml-8" />
                </div>
                <div className="lg:hidden absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  3
                </div>
              </div>
              <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:flex-row-reverse">
                <div className="flex-1 lg:text-left">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 lg:ml-8">
                    <div className="flex items-center gap-4 mb-4 lg:justify-start justify-start">
                      <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg lg:hidden">
                        <svg
                          className="lucide lucide-target w-6 h-6 text-white"
                          fill="none"
                          height="24"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-primary-950">
                        Haftalık Disiplinli Takip
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Bireysel görüşmeler, seminerler ve deneme analizleri ile sürekli
                      gelişim sağlanır.
                    </p>
                  </div>
                </div>
                <div className="relative z-10 hidden lg:flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                    <svg
                      className="lucide lucide-target w-10 h-10 text-white"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    4
                  </div>
                </div>
                <div className="flex-1 lg:block hidden">
                  <div className="lg:mr-8" />
                </div>
                <div className="lg:hidden absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  4
                </div>
              </div>
              <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:flex-row">
                <div className="flex-1 lg:text-right">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 lg:mr-8">
                    <div className="flex items-center gap-4 mb-4 lg:justify-end justify-start">
                      <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg lg:hidden">
                        <svg
                          className="lucide lucide-file-text w-6 h-6 text-white"
                          fill="none"
                          height="24"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                          <path d="M10 9H8" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                        </svg>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-primary-950">
                        Aylık Raporlama
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Velilere detaylı performans raporu sunularak süreç şeffaf ve
                      ölçülebilir tutulur.
                    </p>
                  </div>
                </div>
                <div className="relative z-10 hidden lg:flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                    <svg
                      className="lucide lucide-file-text w-10 h-10 text-white"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="M10 9H8" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                    </svg>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    5
                  </div>
                </div>
                <div className="flex-1 lg:block hidden">
                  <div className="lg:ml-8" />
                </div>
                <div className="lg:hidden absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  5
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


<section className="py-20 bg-gradient-to-br from-slate-600 to-primary-800 relative overflow-hidden">
  <div className="absolute inset-0 bg-grid-pattern opacity-10" />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
    <div className="text-center mb-12">
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
        Bu bir motivasyon programı değil.
        <br />
        <span className="text-accent-300">Bu bir performans sistemidir.</span>
      </h2>
    </div>
    <div className="grid md:grid-cols-3 gap-8 mb-12">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
        <div className="w-16 h-16 bg-accent-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
          <svg
            className="lucide lucide-bar-chart3 w-8 h-8 text-white"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-white mb-3">
          Ölçülebilir
        </h3>
        <p className="text-primary-100 leading-relaxed">
          Her hafta ve her ay somut verilerle ilerleme takip edilir
        </p>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
        <div className="w-16 h-16 bg-accent-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
          <svg
            className="lucide lucide-file-check w-8 h-8 text-white"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="m9 15 2 2 4-4" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-white mb-3">
          Raporlanabilir
        </h3>
        <p className="text-primary-100 leading-relaxed">
          Velilere detaylı performans raporları düzenli olarak sunulur
        </p>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
        <div className="w-16 h-16 bg-accent-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
          <svg
            className="lucide lucide-trending-up w-8 h-8 text-white"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-white mb-3">
          Sürdürülebilir
        </h3>
        <p className="text-primary-100 leading-relaxed">
          Yapılandırılmış sistem sayesinde disiplin sürekli hale gelir
        </p>
      </div>
    </div>
    <div className="flex items-center justify-center gap-4 flex-wrap text-white">
      <svg
        className="lucide lucide-check-circle2 w-8 h-8 text-accent-300"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      <p className="text-xl sm:text-2xl font-semibold">
        Sistem + Disiplin + Psikolojik Dayanıklılık ={" "}
        <span className="text-accent-300">Başarı</span>
      </p>
    </div>
  </div>
</section>










      {/* PERFORMANS MESAJI */}
      <section className="relative bg-gradient-to-br from-[#2f3e9e] via-[#2b3594] to-[#1e266d] text-white py-36 md:py-44 overflow-hidden">

        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-amber-300/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-12">
            Bu bir motivasyon programı değil. <br />
            <span className="text-amber-300">Bu bir performans sistemidir.</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {["Ölçülebilir", "Raporlanabilir", "Sürdürülebilir"].map((item, i) => (
              <div
                key={i}
                className="reveal bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl"
              >
                <h4 className="font-semibold text-lg mb-3">{item}</h4>
                <p className="text-sm text-white/80">
                  Sistemli ilerleme ve disiplinli takip.
                </p>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* NEDEN BİZ + SİSTEM */}
      <section className="bg-slate-50 py-36 md:py-44">
        <div className="max-w-7xl mx-auto px-6">

          {/* NEDEN BİZ */}
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
              Neden Biz?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Çünkü biz sadece program yazmıyoruz. 
              Akademik performansı ve psikolojik dayanıklılığı birlikte inşa ediyoruz.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 mb-32">

            <div className="reveal bg-white rounded-3xl p-10 shadow-lg hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-4">Psikolojik Danışman Çift</h3>
              <p className="text-slate-600 leading-relaxed">
                Süreci sadece akademik değil, duygusal ve zihinsel boyutuyla da takip ederiz.
                Öğrenciyi bir bütün olarak ele alırız.
              </p>
            </div>

            <div className="reveal bg-white rounded-3xl p-10 shadow-lg hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-4">Butik & Sınırlı Kontenjan</h3>
              <p className="text-slate-600 leading-relaxed">
                Maksimum 30 öğrenci kapasitesiyle çalışırız.
                Her öğrenciye gerçek 1:1 takip sağlanır.
              </p>
            </div>

            <div className="reveal bg-white rounded-3xl p-10 shadow-lg hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-4">Veriye Dayalı Performans Takibi</h3>
              <p className="text-slate-600 leading-relaxed">
                Net artışı, plan uyumu, deneme analizi ve gelişim yüzdesi ölçülür.
                Süreç sezgisel değil, sistemlidir.
              </p>
            </div>

          </div>

        </div>
      </section>      


      {/* CTA */}
      <section className="relative bg-gradient-to-br from-[#2f3e9e] via-[#2b3594] to-[#1e266d] text-white py-36 md:py-44 text-center overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]"></div>

        <div className="relative max-w-5xl mx-auto px-6">

          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Yapılandırılmış bir performans modeli arıyorsanız...
          </h2>

          <a
            href="#iletisim"
            className="inline-block px-10 py-5 bg-white text-[#2f3e9e] font-semibold rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] hover:scale-105 transition-all duration-300"
          >
            Ücretsiz Ön Görüşme Planlayın →
          </a>

        </div>
      </section>











    </main>
  );
}