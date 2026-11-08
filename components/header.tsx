"use client";

import { useEffect, useState } from "react";
import { useLang } from "./lang-context";

const SECTIONS = ["about", "skills", "projects", "research", "journey", "contact"] as const;

export default function Header() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  // Highlight the section currently crossing the middle of the viewport.
  useEffect(() => {
    const nodes = SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!nodes.length || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 },
    );

    nodes.forEach((node) => io.observe(node));

    const onScroll = () => {
      if (window.scrollY < 260) setActive("");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = SECTIONS.map((id) => ({ id, label: t.nav[id] }));

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="#top" className="brand" aria-label={`${t.brand.name} — ${t.brand.role}`}>
          <span className="brand__mark" aria-hidden="true">
            {t.brand.mark}
          </span>
          <span className="brand__text">
            <span className="brand__name">{t.brand.name}</span>
            <span className="brand__role">{t.brand.role}</span>
          </span>
        </a>

        <nav className="nav" id="site-nav" data-open={open} aria-label={t.nav.about}>
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="nav__link"
              data-active={active === link.id}
              aria-current={active === link.id ? "true" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
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

          <a href="#contact" className="btn btn--primary header__cta">
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
