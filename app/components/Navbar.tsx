"use client";

import { useEffect, useState } from "react";

const sections = ["sistemimiz", "paketler", "İletişim"];

export default function Navbar() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          if (
            scrollPosition >= element.offsetTop &&
            scrollPosition < element.offsetTop + element.offsetHeight
          ) {
            setActive(section);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <img
            src="/logo.png"
            alt="Öğrenci Koçu Adana Logo"
            className="h-8 w-auto"
          />
          <span>Öğrenci Koçu Adana</span>
        </div>

        {/* Menü */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium relative">

          {sections.map((section) => (
            <a
              key={section}
              href={`#${section}`}
              className={`relative transition ${
                active === section
                  ? "text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}

              {active === section && (
                <span className="absolute left-0 -bottom-2 w-full h-[2px] bg-slate-900 rounded-full transition-all duration-300"></span>
              )}
            </a>
          ))}

        </nav>

        {/* CTA */}
        <a
          href="#İletişim"
          className="hidden md:inline-block px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
        >
          Randevu Al
        </a>

      </div>
    </header>
  );
}
