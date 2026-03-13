"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = ["sistemimiz", "paketler", "İletişim"];

const ARACLAR = [
  { label: "🍅 Pomodoro Timer",  href: "/pomodoro" },
  { label: "🎯 Net Hesaplama",   href: "/net-hesaplama" },
  { label: "⚡ Hız Analizörü",   href: "/hiz-analizoru" },
  { label: "🎨 Duygu Atölyesi",  href: "/regulasyon" },
];

export default function Navbar() {
  const [active, setActive]             = useState("");
  const [menuOpen, setMenuOpen]         = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [araclarOpen, setAraclarOpen]   = useState(false);
  const [araclarMobil, setAraclarMobil] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname    = usePathname();
  const isHomePage  = pathname === "/";
  const isAraclarActive = ARACLAR.some(a => pathname === a.href);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 12);
    if (!isHomePage) return;
    const scrollPosition = window.scrollY + 120;
    let found = "";
    sections.forEach((section) => {
      const el = document.getElementById(section);
      if (el && scrollPosition >= el.offsetTop && scrollPosition < el.offsetTop + el.offsetHeight) {
        found = section;
      }
    });
    setActive(found);
  }, [isHomePage]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAraclarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogoClick = () => {
    if (isHomePage) window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setAraclarMobil(false);
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: scrolled ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.72)",
          borderBottom: scrolled ? "1px solid rgba(226,232,240,0.8)" : "1px solid rgba(226,232,240,0.4)",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 text-lg font-semibold tracking-tight cursor-pointer no-underline text-slate-900 hover:opacity-80 transition-opacity duration-200"
          >
            <img src="/logo.png" alt="Öğrenci Koçu Adana Logo" className="h-8 w-auto" />
            <span>Öğrenci Koçu Adana</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {sections.map((s) => (
              <a
                key={s}
                href={isHomePage ? `#${s}` : `/#${s}`}
                className={`relative py-1 transition-colors duration-200 ${
                  active === s ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                <span
                  className="absolute left-0 -bottom-1 h-[2px] bg-slate-900 rounded-full transition-all duration-300"
                  style={{ width: active === s ? "100%" : "0%" }}
                />
              </a>
            ))}

            <Link
              href="/blog"
              className={`relative py-1 transition-colors duration-200 ${
                pathname.startsWith("/blog") ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Blog
              <span
                className="absolute left-0 -bottom-1 h-[2px] bg-slate-900 rounded-full transition-all duration-300"
                style={{ width: pathname.startsWith("/blog") ? "100%" : "0%" }}
              />
            </Link>

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setAraclarOpen(o => !o)}
                className={`relative py-1 flex items-center gap-1 transition-colors duration-200 cursor-pointer bg-transparent border-none ${
                  isAraclarActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Araçlar
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transition: "transform 0.2s", transform: araclarOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span
                  className="absolute left-0 -bottom-1 h-[2px] bg-slate-900 rounded-full transition-all duration-300"
                  style={{ width: isAraclarActive ? "100%" : "0%" }}
                />
              </button>

              {araclarOpen && (
                <div
                  className="absolute top-full right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50"
                  style={{ animation: "dropIn .15s ease" }}
                >
                  <style>{`@keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
                  {ARACLAR.map(a => (
                    <Link
                      key={a.href}
                      href={a.href}
                      onClick={() => setAraclarOpen(false)}
                      className={`flex items-center px-4 py-2.5 text-sm transition-colors duration-150 ${
                        pathname === a.href
                          ? "text-slate-900 font-semibold bg-slate-50"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {a.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <a
            href={isHomePage ? "#İletişim" : "/#İletişim"}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors duration-200"
          >
            Randevu Al
          </a>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={menuOpen}
          >
            <span className={`block w-5 h-0.5 bg-slate-900 transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-900 transition-all duration-200 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-900 transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-white flex flex-col pt-24 px-8 pb-8 transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ transform: menuOpen ? "translateY(0)" : "translateY(-8px)" }}
      >
        <nav className="flex flex-col">
          {sections.map((s) => (
            <a
              key={s}
              href={isHomePage ? `#${s}` : `/#${s}`}
              onClick={closeMenu}
              className={`flex items-center justify-between py-4 border-b border-slate-100 text-lg font-medium transition-colors duration-150 ${
                active === s ? "text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {active === s && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
            </a>
          ))}

          <Link
            href="/blog"
            onClick={closeMenu}
            className={`flex items-center justify-between py-4 border-b border-slate-100 text-lg font-medium transition-colors duration-150 ${
              pathname.startsWith("/blog") ? "text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Blog
            {pathname.startsWith("/blog") && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
          </Link>

          <div className="border-b border-slate-100">
            <button
              onClick={() => setAraclarMobil(o => !o)}
              className={`w-full flex items-center justify-between py-4 text-lg font-medium transition-colors duration-150 bg-transparent border-none cursor-pointer ${
                isAraclarActive ? "text-slate-900 font-semibold" : "text-slate-600"
              }`}
            >
              <span>Araçlar</span>
              <svg
                width="16" height="16" viewBox="0 0 12 12" fill="none"
                style={{ transition: "transform 0.25s", transform: araclarMobil ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div style={{
              maxHeight: araclarMobil ? `${ARACLAR.length * 56}px` : "0px",
              overflow: "hidden",
              transition: "max-height 0.25s ease",
            }}>
              {ARACLAR.map(a => (
                <Link
                  key={a.href}
                  href={a.href}
                  onClick={closeMenu}
                  className={`flex items-center justify-between pl-5 pr-2 py-3.5 text-base font-medium transition-colors duration-150 ${
                    pathname === a.href
                      ? "text-slate-900 font-semibold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {a.label}
                  {pathname === a.href && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <a
          href={isHomePage ? "#İletişim" : "/#İletişim"}
          onClick={closeMenu}
          className="mt-auto w-full text-center px-5 py-4 bg-slate-900 text-white rounded-xl text-base font-semibold hover:bg-slate-700 transition-colors duration-200"
        >
          Randevu Al
        </a>
      </div>
    </>
  );
}