"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Reveal from "./reveal";
import DeskArt from "./desk-art";
import { useLang } from "./lang-context";

type FilterId = "all" | "software" | "agents" | "cli" | "code";

const ACCENTS: Record<string, string> = {
  blue: "var(--blue)",
  red: "var(--red)",
  green: "var(--green)",
  yellow: "var(--yellow)",
  ink: "var(--ink)",
};

export default function Productivity() {
  const { t } = useLang();
  const [filter, setFilter] = useState<FilterId>("all");

  const tools = t.productivity.tools;
  const items = useMemo(
    () => tools.items.filter((item) => filter === "all" || item.cat === filter),
    [tools.items, filter],
  );
  const categories = Object.fromEntries(tools.filters.map((f) => [f.id, f.label]));

  return (
    <div className="page-vintage">
      <header className="page-hero">
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <p className="eyebrow">
              <span className="eyebrow__num">P1</span>
              {t.productivity.label}
            </p>
            <h1 className="page-hero__title display">{t.productivity.title}</h1>
            <p className="lede page-hero__lede">{t.productivity.lede}</p>
            <dl className="page-hero__chips">
              {t.productivity.chips.map((chip) => (
                <div key={chip.k}>
                  <dt>{chip.k}</dt>
                  <dd>{chip.v}</dd>
                </div>
              ))}
            </dl>
            <p className="vintage-stamp">
              <span aria-hidden="true">✷</span>
              {t.productivity.stamp}
            </p>
          </div>

          <div className="page-hero__aside">
            <figure className="figure">
              <div className="desk-frame">
                <DeskArt monitors={2} extras={["plant", "speaker"]} />
              </div>
              <figcaption className="figure__cap">
                <i className="dot dot--live" aria-hidden="true" />
                {t.productivity.setup.items[t.productivity.setup.items.length - 1].title}
              </figcaption>
            </figure>
          </div>
        </div>
      </header>

      <section className="section" id="tools" aria-labelledby="tools-title">
        <div className="container">
          <Reveal>
            <div className="section__head section__head--slim">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__num">01</span>
                  {tools.label}
                </p>
                <h2 className="h2" id="tools-title">
                  {tools.title}
                </h2>
                <p className="lede">{tools.lede}</p>
              </div>
            </div>
          </Reveal>

          <div className="filters" role="group" aria-label={tools.title}>
            <button
              type="button"
              className="filter"
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              {tools.all}
            </button>
            {tools.filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className="filter"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id as FilterId)}
              >
                {f.label}
              </button>
            ))}
            <span className="filters__count" aria-live="polite">
              {tools.countLabel(items.length)}
            </span>
          </div>

          <div className="shelf">
            {items.map((item) => {
              const yellow = item.color === "yellow";
              return (
                <article
                  className="tool"
                  key={item.name}
                  style={
                    {
                      "--accent": ACCENTS[item.color] ?? "var(--ink)",
                      "--mono": yellow ? "var(--ink)" : "#fff",
                    } as CSSProperties
                  }
                >
                  <div className="tool__thumb">
                    <span className="tool__mono" aria-hidden="true">
                      {item.letter}
                    </span>
                    <span className="tool__kind">{categories[item.cat] ?? item.cat}</span>
                  </div>

                  <div className="tool__body">
                    <h3 className="tool__name">{item.name}</h3>
                    <p className="tool__desc">{item.desc}</p>
                    <p className="tool__since">
                      {tools.since} {item.since}
                    </p>
                  </div>

                  <div className="tool__foot">
                    <span className="tool__price" data-price={item.price}>
                      {item.price}
                    </span>
                    <a
                      className="tool__buy"
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {item.price === "FREE" ? tools.get : tools.buy}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--wash" id="setup" aria-labelledby="setup-title">
        <div className="container">
          <Reveal>
            <div className="section__head section__head--slim">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__num">02</span>
                  {t.productivity.setup.label}
                </p>
                <h2 className="h2" id="setup-title">
                  {t.productivity.setup.title}
                </h2>
                <p className="lede">{t.productivity.setup.lede}</p>
              </div>
            </div>
          </Reveal>

          <ol className="setups">
            {t.productivity.setup.items.map((item, index) => (
              <li key={item.year}>
                <Reveal delay={index * 60}>
                  <article className="setup">
                    <div className="setup__art">
                      <DeskArt monitors={item.monitors} extras={item.extras} />
                    </div>
                    <div className="setup__body">
                      <p className="setup__year">{item.year}</p>
                      <h3 className="setup__title">{item.title}</h3>
                      <p className="setup__note">{item.note}</p>
                      <ul className="setup__gear">
                        {item.gear.map((gear) => (
                          <li key={gear}>{gear}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="channels" aria-labelledby="channels-title">
        <div className="container">
          <Reveal>
            <div className="section__head">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__num">03</span>
                  {t.productivity.channels.label}
                </p>
                <h2 className="h2" id="channels-title">
                  {t.productivity.channels.title}
                </h2>
                <p className="lede">{t.productivity.channels.lede}</p>
              </div>
              <div className="section__aside">
                <p className="vintage-note">{t.productivity.channels.note}</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="chans" delay={60}>
            {t.productivity.channels.groups.map((group) => (
              <article className="chan-group" key={group.title}>
                <div className="chan-group__head">
                  <h3 className="chan-group__title">{group.title}</h3>
                  <span className="chan-group__count">
                    {t.productivity.channels.countLabel(group.items.length)}
                  </span>
                </div>
                <p className="chan-group__note">{group.note}</p>
                <ul className="chan-list">
                  {group.items.map((item, index) => (
                    <li key={item.href}>
                      <a
                        className="chan"
                        href={item.href}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <span className="chan__num" aria-hidden="true">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="chan__body">
                          <span className="chan__name">{item.name}</span>
                          <span className="chan__handle">{item.handle}</span>
                        </span>
                        <span className="chan__arrow" aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section section--wash">
        <div className="container">
          <Reveal>
            <div className="page-cta">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow__num">→</span>
                  {t.nav.stuff}
                </p>
                <h2 className="h2">{t.productivity.cta.title}</h2>
                <p className="lede">{t.productivity.cta.text}</p>
              </div>
              <a className="btn btn--primary" href={t.productivity.cta.href}>
                {t.productivity.cta.label}
                <span className="btn__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
