"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./lang-context";

/** Home anchors + the two sub pages. Order defines the menu order. */
const NAV = [
  { id: "about", anchor: true },
  { id: "projects", anchor: true },
  { id: "research", anchor: true },
  { id: "productivity", href: "/productivity" },
  { id: "stuff", href: "/stuff-i-make" },
  { id: "contact", anchor: true },
] as const;

const SPY_SECTIONS = ["about", "projects", "research", "contact"];

export default function Header() {
  const { t, lang, setLang } = useLang();
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [spied, setSpied] = useState<string>("");

  // Highlight the section crossing the middle of the viewport (home only).
  useEffect(() => {
    if (!isHome) {
      setSpied("");
      return;
    }
    const nodes = SPY_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!nodes.length || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSpied(entry.target.id);
        }
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 },
    );

    nodes.forEach((node) => io.observe(node));

    const onScroll = () => {
      if (window.scrollY < 260) setSpied("");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome]);

  // Close the mobile panel when the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const activeId =
    pathname === "/productivity" ? "productivity" : pathname === "/stuff-i-make" ? "stuff" : spied;

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="/" className="brand" aria-label={`${t.brand.name} — ${t.brand.role}`}>
          <span className="brand__mark" aria-hidden="true">
            {t.brand.mark}
          </span>
          <span className="brand__text">
            <span className="brand__name">{t.brand.name}</span>
            <span className="brand__role">{t.brand.role}</span>
          </span>
        </a>

        <nav className="nav" id="site-nav" data-open={open} aria-label={t.nav.about}>
          {NAV.map((item) => {
            const href = "href" in item ? item.href : isHome ? `#${item.id}` : `/#${item.id}`;
            return (
              <a
                key={item.id}
                href={href}
                className="nav__link"
                data-active={activeId === item.id}
                aria-current={activeId === item.id ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {t.nav[item.id]}
              </a>
            );
          })}
        </nav>

        <div className="header__tools">
          <div className="lang" role="group" aria-label={t.header.langLabel}>
            <button
              type="button"
              className="lang__btn"
              aria-pressed={lang === "vi"}
              onClick={() => setLang("vi")}
              title={t.ui.langVi}
              lang="vi"
            >
              VI
            </button>
            <button
              type="button"
              className="lang__btn"
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
              title={t.ui.langEn}
              lang="en"
            >
              EN
            </button>
          </div>

          <a href={isHome ? "#contact" : "/#contact"} className="btn btn--primary header__cta">
            {t.header.cta}
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </a>

          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? t.header.menuClose : t.header.menuOpen}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
