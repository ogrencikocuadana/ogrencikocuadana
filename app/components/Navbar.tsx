"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = ["sistemimiz", "paketler", "İletişim"];

const ARACLAR = [
  { label: "🍅 Pomodoro Timer", href: "/pomodoro", desc: "Odaklı çalışma tekniği" },
  { label: "🎯 Net Hesaplama", href: "/net-hesaplama", desc: "LGS, TYT, AYT puan hesabı" },
];

export default function Navbar() {
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [araclarOpen, setAraclarOpen] = useState(false);
  const araclarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAraclarActive = ARACLAR.some(a => pathname.startsWith(a.href));

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

  // Dropdown dışına tıklayınca kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (araclarRef.current && !araclarRef.current.contains(e.target as Node)) {
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

  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    ...sections.map((s) => ({
      label: s.charAt(0).toUpperCase() + s.slice(1),
      href: isHomePage ? `#${s}` : `/#${s}`,
      isActive: active === s,
      isLink: false,
    })),
    {
      label: "Blog",
      href: "/blog",
      isActive: pathname.startsWith("/blog"),
      isLink: true,
    },
  ];

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

          {/* Logo */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 text-lg font-semibold tracking-tight cursor-pointer no-underline text-slate-900 hover:opacity-80 transition-opacity duration-200"
          >
            <img src="/logo.png" alt="Öğrenci Koçu Adana Logo" className="h-8 w-auto" />
            <span>Öğrenci Koçu Adana</span>
          </Link>

          {/* Masaüstü Menü */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              link.isLink ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 transition-colors duration-200 ${
                    link.isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                  <span
                    className="absolute left-0 -bottom-1 h-[2px] bg-slate-900 rounded-full transition-all duration-300"
                    style={{ width: link.isActive ? "100%" : "0%" }}
                  />
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 transition-colors duration-200 ${
                    link.isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                  <span
                    className="absolute left-0 -bottom-1 h-[2px] bg-slate-900 rounded-full transition-all duration-300"
                    style={{ width: link.isActive ? "100%" : "0%" }}
                  />
                </a>
              )
            ))}

            {/* Araçlar dropdown */}
            <div ref={araclarRef} style={{ position: "relative" }}>
              <button
                onClick={() => setAraclarOpen(v => !v)}
                className={`relative py-1 flex items-center gap-1 transition-colors duration-200 ${
                  isAraclarActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500, fontFamily: "inherit" }}
              >
                Araçlar
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                  style={{ transition: "transform 0.2s", transform: araclarOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <span
                  className="absolute left-0 -bottom-1 h-[2px] bg-slate-900 rounded-full transition-all duration-300"
                  style={{ width: isAraclarActive ? "calc(100% - 18px)" : "0%" }}
                />
              </button>

              {araclarOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 16px)", left: "50%",
                  transform: "translateX(-50%)",
                  background: "white", borderRadius: 16,
                  border: "1px solid rgba(226,232,240,0.8)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  minWidth: 230, overflow: "hidden",
                  animation: "fadeSlideIn 0.15s ease",
                  zIndex: 100,
                }}>
                  <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateX(-50%) translateY(-6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
                  {ARACLAR.map((arac, i) => (
                    <Link
                      key={arac.href}
                      href={arac.href}
                      onClick={() => setAraclarOpen(false)}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div style={{
                        padding: "12px 18px",
                        background: pathname === arac.href ? "#f8fafc" : "white",
                        borderBottom: i < ARACLAR.length - 1 ? "1px solid #f1f5f9" : "none",
                        transition: "background 0.15s",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = pathname === arac.href ? "#f8fafc" : "white")}
                      >
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.88rem" }}>{arac.label}</div>
                        <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: 2 }}>{arac.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Masaüstü CTA */}
          <a
            href={isHomePage ? "#İletişim" : "/#İletişim"}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors duration-200"
          >
            Randevu Al
          </a>

          {/* Hamburger (mobil) */}
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

      {/* Mobil Menü */}
      <div
        className={`fixed inset-0 z-40 bg-white flex flex-col pt-24 px-8 pb-8 transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ transform: menuOpen ? "translateY(0)" : "translateY(-8px)" }}
      >
        <nav className="flex flex-col">
          {navLinks.map((link) => (
            link.isLink ? (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`flex items-center justify-between py-4 border-b border-slate-100 text-lg font-medium transition-colors duration-150 ${
                  link.isActive ? "text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
                {link.isActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`flex items-center justify-between py-4 border-b border-slate-100 text-lg font-medium transition-colors duration-150 ${
                  link.isActive ? "text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
                {link.isActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
              </a>
            )
          ))}

          {/* Mobil Araçlar */}
          <div style={{ borderBottom: "1px solid #f1f5f9" }}>
            <button
              onClick={() => setAraclarOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", background: "none", border: "none",
                padding: "16px 0", cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "1.125rem", fontWeight: isAraclarActive ? 600 : 500, color: isAraclarActive ? "#0f172a" : "#4b5563" }}>
                Araçlar
              </span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                style={{ transition: "transform 0.2s", transform: araclarOpen ? "rotate(180deg)" : "rotate(0deg)", color: "#94a3b8" }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {araclarOpen && (
              <div style={{ paddingLeft: 12, paddingBottom: 8 }}>
                {ARACLAR.map((arac) => (
                  <Link
                    key={arac.href}
                    href={arac.href}
                    onClick={closeMenu}
                    style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}
                  >
                    <span style={{ fontSize: "1rem", fontWeight: pathname === arac.href ? 600 : 400, color: pathname === arac.href ? "#0f172a" : "#6b7280" }}>
                      {arac.label}
                    </span>
                    {pathname === arac.href && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                  </Link>
                ))}
              </div>
            )}
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