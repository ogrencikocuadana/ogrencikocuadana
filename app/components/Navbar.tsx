"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = ["sistemimiz", "paketler", "İletişim"];

export default function Navbar() {
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!isHomePage) return;
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
  }, [isHomePage]);

  // Menü açıkken scroll kilitle
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogoClick = () => {
    if (isHomePage) window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 text-lg font-semibold tracking-tight cursor-pointer no-underline text-slate-900"
          >
            <img src="/logo.png" alt="Öğrenci Koçu Adana Logo" className="h-8 w-auto" />
            <span>Öğrenci Koçu Adana</span>
          </Link>

          {/* Masaüstü Menü */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium relative">
            {sections.map((section) => (
              <a
                key={section}
                href={isHomePage ? `#${section}` : `/#${section}`}
                className={`relative transition ${active === section ? "text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
                {active === section && (
                  <span className="absolute left-0 -bottom-2 w-full h-[2px] bg-slate-900 rounded-full transition-all duration-300"></span>
                )}
              </a>
            ))}
            <Link
              href="/blog"
              className={`relative transition ${pathname.startsWith("/blog") ? "text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              Blog
              {pathname.startsWith("/blog") && (
                <span className="absolute left-0 -bottom-2 w-full h-[2px] bg-slate-900 rounded-full transition-all duration-300"></span>
              )}
            </Link>
          </nav>

          {/* Masaüstü CTA */}
          <a
            href={isHomePage ? "#İletişim" : "/#İletişim"}
            className="hidden md:inline-block px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            Randevu Al
          </a>

          {/* Hamburger butonu (mobil) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-slate-100 transition"
            aria-label="Menü"
          >
            <span className={`block w-6 h-0.5 bg-slate-900 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-slate-900 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-slate-900 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

        </div>
      </header>

      {/* Mobil Menü */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col pt-24 px-8 pb-8">
          <nav className="flex flex-col gap-6 text-lg font-medium">
            {sections.map((section) => (
              <a
                key={section}
                href={isHomePage ? `#${section}` : `/#${section}`}
                onClick={closeMenu}
                className="text-slate-700 hover:text-slate-900 transition border-b border-slate-100 pb-4"
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </a>
            ))}
            <Link
              href="/blog"
              onClick={closeMenu}
              className="text-slate-700 hover:text-slate-900 transition border-b border-slate-100 pb-4"
            >
              Blog
            </Link>
          </nav>

          <a
            href={isHomePage ? "#İletişim" : "/#İletişim"}
            onClick={closeMenu}
            className="mt-auto w-full text-center px-5 py-4 bg-slate-900 text-white rounded-xl text-base font-semibold hover:bg-slate-800 transition"
          >
            Randevu Al
          </a>
        </div>
      )}
    </>
  );
}