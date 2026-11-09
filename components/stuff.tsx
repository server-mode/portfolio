"use client";

import Reveal from "./reveal";
import { useLang } from "./lang-context";

function AppIcon() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-hidden="true" shapeRendering="crispEdges">
      <rect width="64" height="64" fill="#0b0b0f" />
      <rect x="9" y="13" width="46" height="6" fill="#fbbc05" />
      <rect x="9" y="25" width="30" height="6" fill="#34a853" />
      <rect x="9" y="37" width="40" height="6" fill="#1a73e8" />
      <rect x="9" y="49" width="18" height="4" fill="#ffffff" />
      <rect x="47" y="25" width="8" height="18" fill="#ffffff" opacity="0.28" />
    </svg>
  );
}

export default function Stuff() {
  const { t } = useLang();

  return (
    <>
      <header className="page-hero">
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <p className="eyebrow">
              <span className="eyebrow__num">P2</span>
              {t.stuff.label}
            </p>
            <h1 className="page-hero__title display">{t.stuff.title}</h1>
            <p className="lede page-hero__lede">{t.stuff.lede}</p>
            <dl className="page-hero__chips">
              {t.stuff.chips.map((chip) => (
                <div key={chip.k}>
                  <dt>{chip.k}</dt>
                  <dd>{chip.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="page-hero__aside">
            <figure className="figure">
              <div className="app-icon-card">
                <span className="app__icon">
                  <AppIcon />
                </span>
                <p className="app-icon-card__name">{t.stuff.items[0].name}</p>
                <p className="app-icon-card__meta">
                  {t.stuff.items[0].version} · {t.stuff.items[0].license}
                </p>
              </div>
              <figcaption className="figure__cap">
                <i className="dot dot--live" aria-hidden="true" />
                {t.stuff.items[0].status}
              </figcaption>
            </figure>
          </div>
        </div>
      </header>

      <section className="section" id="released" aria-label={t.stuff.releasedLabel}>
        <div className="container">
          {t.stuff.items.map((app, index) => (
            <Reveal key={app.id} delay={index * 60}>
              <article className="app">
                <div className="app__top">
                  <span className="app__icon" aria-hidden="true">
                    <AppIcon />
                  </span>
                  <div className="app__ident">
                    <p className="app__meta">
                      <span className="chip chip--ink">{t.stuff.releasedLabel}</span>
                      <span className="chip chip--soft">
                        {app.version} · {app.license}
                      </span>
                    </p>
                    <h2 className="app__name">{app.name}</h2>
                    <p className="app__tagline">{app.tagline}</p>
                  </div>
                </div>

                <div className="app__grid">
                  <div className="app__shot">
                    <div className="project__bar" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <span className="project__file">{app.id}.app</span>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={app.image}
                      alt=""
                      width={640}
                      height={440}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="app__info">
                    <p className="app__desc">{app.desc}</p>
                    <h3 className="app__h">{t.stuff.featuresTitle}</h3>
                    <ul className="paper__list">
                      {app.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="app__downloads">
                  <div className="app__dl-head">
                    <h3 className="app__h">{t.stuff.downloadTitle}</h3>
                    <p className="app__note">{t.stuff.downloadNote}</p>
                  </div>

                  <div className="dl-row">
                    {app.downloads.map((dl) => (
                      <a
                        className="dl"
                        key={dl.os}
                        href={dl.href}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <span className="dl__tile" aria-hidden="true">
                          {dl.os.slice(0, 3).toUpperCase()}
                        </span>
                        <span className="dl__text">
                          <span className="dl__os">{dl.os}</span>
                          <span className="dl__file">{dl.file}</span>
                        </span>
                        <span className="dl__size">{dl.size}</span>
                        <span className="dl__arrow" aria-hidden="true">
                          ↓
                        </span>
                      </a>
                    ))}
                  </div>

                  <p className="app__req">
                    <strong>{t.stuff.requirementsTitle}:</strong> {app.requirements}
                  </p>
                </div>

                <div className="app__changelog">
                  <h3 className="app__h">{t.stuff.changelogTitle}</h3>
                  <ul className="paper__list">
                    {app.changelog.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section--wash" id="wip" aria-labelledby="wip-title">
        <div className="container">
          <Reveal>
            <div className="section__head section__head--slim">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__num">02</span>
                  {t.stuff.wip.label}
                </p>
                <h2 className="h2" id="wip-title">
                  {t.stuff.wip.title}
                </h2>
                <p className="lede">{t.stuff.wip.lede}</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="wip">
            {t.stuff.wip.items.map((item) => (
              <article className="wip__item" key={item.name}>
                <div className="wip__head">
                  <h3 className="wip__name">{item.name}</h3>
                  <span className="chip chip--soft">{item.status}</span>
                </div>
                <p className="wip__desc">{item.desc}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="page-cta">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__num">→</span>
                  {t.nav.productivity}
                </p>
                <h2 className="h2">{t.stuff.cta.title}</h2>
                <p className="lede">{t.stuff.cta.text}</p>
              </div>
              <a className="btn btn--primary" href={t.stuff.cta.href}>
                {t.stuff.cta.label}
                <span className="btn__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
