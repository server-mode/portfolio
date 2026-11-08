"use client";

import { useLang } from "./lang-context";

function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5c2.5 0 4.5 2 4.5 4.5 0 3.2-4.5 8.5-4.5 8.5S3.5 9.2 3.5 6c0-2.5 2-4.5 4.5-4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="8" cy="6" r="1.6" fill="currentColor" />
    </svg>
  );
}

function SchoolIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1.5 6 8 2.5 14.5 6 8 9.5 1.5 6Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 7.6v3.2c0 1 1.6 1.9 3.5 1.9s3.5-.9 3.5-1.9V7.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function Hero() {
  const { t } = useLang();
  const barcode = [8, 3, 11, 4, 6, 2, 9, 5, 12, 3, 7, 4, 10, 3, 6, 8, 2, 9, 4, 7, 3, 11, 5, 4];

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__banner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/gifs/banner-skyline.gif"
          alt=""
          width={1600}
          height={280}
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className="container hero__inner">
        <div className="hero__card">
          <div className="hero__eyebrow">
            <span className="pixel-label">{t.hero.eyebrow}</span>
            <span className="chip chip--ink">
              <i className="dot dot--live" aria-hidden="true" />
              {t.hero.status}
            </span>
          </div>

          <h1 id="hero-title" className="display hero__title">
            <span>{t.hero.greeting}</span>
            <span className="accent">{t.hero.name}</span>
          </h1>

          <p className="hero__role">
            <b aria-hidden="true" />
            {t.hero.role}
          </p>

          <p className="hero__intro">{t.hero.intro}</p>

          <div className="hero__actions">
            <a href="#projects" className="btn btn--primary">
              {t.hero.ctaPrimary}
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </a>
            <a href="#contact" className="btn">
              {t.hero.ctaSecondary}
            </a>
          </div>

          <div className="hero__meta">
            <span className="hero__meta-item">
              <PinIcon />
              {t.hero.location}
            </span>
            <span className="hero__meta-item">
              <SchoolIcon />
              {t.hero.school}
            </span>
          </div>

          <dl className="stats">
            {t.stats.map((stat) => (
              <div className="stats__item" key={stat.label}>
                <dt className="stats__label">{stat.label}</dt>
                <dd className="stats__value">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="hero__aside" aria-label={t.hero.cardCode}>
          <div className="idcard">
            <div className="idcard__top">
              <span>{t.hero.cardCode}</span>
              <span aria-hidden="true">● ● ●</span>
            </div>
            <div className="idcard__photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/DSC01358-2.jpg"
                alt={t.hero.cardName}
                width={1039}
                height={1048}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="idcard__body">
              <p className="idcard__name">{t.hero.cardName}</p>
              <p className="idcard__role">{t.hero.cardRole}</p>
              <div className="idcard__rows">
                {t.hero.cardRows.map((row) => (
                  <div className="idcard__row" key={row.k}>
                    <span>{row.k}</span>
                    <span>{row.v}</span>
                  </div>
                ))}
              </div>
              <div className="idcard__barcode" aria-hidden="true">
                {barcode.map((w, i) => (
                  <i key={i} style={{ height: `${14 + (w % 5) * 3}px`, width: w > 8 ? 3 : 2 }} />
                ))}
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sticker sticker--floppy" src="/gifs/floppy.gif" alt="" width={72} height={72} />
          </div>
        </aside>
      </div>
    </section>
  );
}
