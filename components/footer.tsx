"use client";

import { useLang } from "./lang-context";

const SECTIONS = ["about", "skills", "projects", "research", "journey", "contact"] as const;

export default function Footer() {
  const { t, lang, setLang } = useLang();

  return (
    <footer className="site-footer">
      <div aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="strip"
          src="/gifs/strip-ticker.gif"
          alt=""
          width={1600}
          height={100}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="container">
        <div className="footer__main">
          <div>
            <a href="#top" className="brand">
              <span className="brand__mark" aria-hidden="true">
                {t.brand.mark}
              </span>
              <span className="brand__text">
                <span className="brand__name">{t.brand.name}</span>
                <span className="brand__role">{t.brand.role}</span>
              </span>
            </a>
            <p className="footer__brand-text">{t.footer.tagline}</p>
          </div>

          <div>
            <p className="footer__col-title">{t.footer.navTitle}</p>
            <nav className="footer__links" aria-label={t.footer.navTitle}>
              {SECTIONS.map((id) => (
                <a key={id} href={`#${id}`}>
                  {t.nav[id]}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <p className="footer__col-title">{t.footer.connectTitle}</p>
            <div className="footer__links">
              {t.contact.socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {social.name}
                </a>
              ))}
              <a href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>{t.footer.rights}</span>
          <span className="footer__status">
            <i className="dot dot--live" aria-hidden="true" />
            {t.footer.built}
          </span>
          <span className="lang" role="group" aria-label={t.header.langLabel}>
            <button
              type="button"
              className="lang__btn"
              aria-pressed={lang === "vi"}
              onClick={() => setLang("vi")}
              lang="vi"
            >
              VI
            </button>
            <button
              type="button"
              className="lang__btn"
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
              lang="en"
            >
              EN
            </button>
          </span>
        </div>
      </div>
    </footer>
  );
}
