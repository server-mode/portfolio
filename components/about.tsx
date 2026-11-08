"use client";

import Reveal from "./reveal";
import { useLang } from "./lang-context";

export default function About() {
  const { t } = useLang();

  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <Reveal>
          <div className="section__head">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__num">{t.about.num}</span>
                {t.about.label}
              </p>
              <h2 className="h2" id="about-title">
                {t.about.title}
              </h2>
              <p className="lede">{t.about.lede}</p>
            </div>
          </div>
        </Reveal>

        <div className="about">
          <Reveal delay={60}>
            <div className="about__copy">
              {t.about.paragraphs.map((paragraph, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
              ))}

              <dl className="facts" aria-label={t.about.factsTitle}>
                {t.about.facts.map((fact) => (
                  <div className="facts__item" key={fact.k}>
                    <dt>{fact.k}</dt>
                    <dd>{fact.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="about__aside">
              <figure className="figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="frame-img"
                  src="/gifs/crt-monitor.gif"
                  alt={t.about.monitorCap}
                  width={520}
                  height={460}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="figure__cap">
                  <i className="dot dot--live" aria-hidden="true" />
                  {t.about.monitorCap}
                </figcaption>
              </figure>
              <p className="lede" style={{ fontSize: "0.86rem" }}>
                {t.about.asideNote}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
