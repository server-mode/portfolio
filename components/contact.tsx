"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./reveal";
import { useLang } from "./lang-context";

export default function Contact() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  async function copyEmail() {
    const email = t.contact.email;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const area = document.createElement("textarea");
      area.value = email;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing else we can do */
      }
      document.body.removeChild(area);
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1900);
  }

  return (
    <>
      <div aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="strip"
          src="/gifs/strip-code.gif"
          alt=""
          width={1600}
          height={260}
          loading="lazy"
          decoding="async"
        />
      </div>

      <section className="section" id="contact" aria-labelledby="contact-title">
        <div className="container">
          <div className="contact">
            <Reveal>
              <div className="contact__panel" style={{ position: "relative" }}>
                <p className="eyebrow">
                  <span className="eyebrow__num">{t.contact.num}</span>
                  {t.contact.label}
                </p>
                <h2 className="h2" id="contact-title">
                  {t.contact.title}
                </h2>
                <p className="lede">{t.contact.lede}</p>

                <div className="contact__mail">
                  <span className="mono" style={{ color: "var(--muted)" }}>
                    {t.contact.mailLabel}
                  </span>
                  <a href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={copyEmail}
                    data-copied={copied}
                  >
                    <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
                    {copied ? t.contact.copied : t.contact.copy}
                  </button>
                </div>

                <p className="figure__cap" style={{ marginTop: 18 }}>
                  <i className="dot dot--live" aria-hidden="true" />
                  {t.contact.availability}
                </p>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div>
                <p className="mono" style={{ color: "var(--muted)", marginBottom: 10 }}>
                  {t.contact.socialsTitle}
                </p>
                <ul className="socials">
                  {t.contact.socials.map((social) => (
                    <li key={social.name}>
                      <a
                        className="social"
                        href={social.href}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <span className="social__name">
                          <span className="social__icon" aria-hidden="true">
                            {social.icon}
                          </span>
                          {social.name}
                        </span>
                        <span className="social__handle">{social.handle}</span>
                        <span className="social__arrow" aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
