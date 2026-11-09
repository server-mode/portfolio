"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LangProvider, useLang } from "./lang-context";
import Header from "./header";
import Footer from "./footer";

function ScrollUi() {
  const { t } = useLang();
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setProgress(max > 0 ? Math.min(100, (y / max) * 100) : 0);
      setShowTop(y > 720);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="progress" aria-hidden="true">
        <div className="progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <button
        type="button"
        className="to-top"
        data-show={showTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t.footer.toTop}
        title={t.footer.toTop}
        tabIndex={showTop ? 0 : -1}
      >
        <span aria-hidden="true">↑</span>
      </button>
    </>
  );
}

function SkipLink() {
  const { t } = useLang();
  return (
    <a className="skip-link" href="#main">
      {t.htmlLang === "vi" ? "Tới nội dung chính" : "Skip to content"}
    </a>
  );
}

export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <ScrollUi />
      <SkipLink />
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </LangProvider>
  );
}
