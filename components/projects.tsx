"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Reveal from "./reveal";
import PixelCover from "./pixel-cover";
import { useLang } from "./lang-context";

type FilterId = "all" | "ml" | "analytics" | "cv";

export default function Projects() {
  const { t } = useLang();
  const [filter, setFilter] = useState<FilterId>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const items = t.projects.items;
  const active = useMemo(
    () => items.filter((item) => filter === "all" || item.category === filter),
    [items, filter],
  );
  const selected = items.find((item) => item.id === openId) ?? null;

  // Native <dialog> gives us Esc handling, focus trapping and a backdrop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) {
      dialog.showModal();
      dialog.scrollTop = 0;
      const body = dialog.querySelector<HTMLElement>(".dialog__body");
      if (body) body.scrollTop = 0;
    } else if (!selected && dialog.open) {
      dialog.close();
    }
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selected]);

  return (
    <section className="section" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <Reveal>
          <div className="section__head">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__num">{t.projects.num}</span>
                {t.projects.label}
              </p>
              <h2 className="h2" id="projects-title">
                {t.projects.title}
              </h2>
              <p className="lede">{t.projects.lede}</p>
            </div>
            <div className="section__aside">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="cursor-deco"
                src="/gifs/cursor.gif"
                alt=""
                width={130}
                height={130}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </Reveal>

        <div className="filters" role="group" aria-label={t.projects.label}>
          <button
            type="button"
            className="filter"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            {t.projects.all}
          </button>
          {t.projects.filters.map((f) => (
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
            {t.projects.countLabel(active.length)}
          </span>
        </div>

        <div className="projects">
          {active.map((item) => (
            <article
              key={item.id}
              className={`project${item.featured ? " project--wide" : ""}`}
            >
              <div className="project__bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span className="project__file">{item.file}</span>
              </div>

              <div className="project__cover">
                {item.featured ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src="/gifs/window-loading.gif"
                    alt=""
                    width={640}
                    height={440}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <PixelCover variant={item.cover} />
                )}
              </div>

              <div className="project__body">
                <p className="project__kicker">{item.kicker}</p>
                <h3 className="project__title">{item.title}</h3>
                <p className="project__desc">{item.desc}</p>
                {item.featured ? (
                  <dl className="project__facts">
                    {item.facts.slice(0, 2).map((fact) => (
                      <div key={fact.k}>
                        <dt>
                          {t.projects.dialog[fact.k as "role" | "time" | "team" | "result"]}
                        </dt>
                        <dd>{fact.v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <div className="project__tags">
                  {item.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="project__foot">
                  <span className="project__metric">
                    <b>{item.metricValue}</b>
                    {item.metricLabel}
                  </span>
                  <button
                    type="button"
                    className="project__more"
                    onClick={() => setOpenId(item.id)}
                  >
                    {t.projects.more}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="dialog"
        aria-labelledby="dialog-title"
        onClose={() => setOpenId(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpenId(null);
        }}
      >
        {selected ? (
          <>
            <div className="dialog__bar">
              <i />
              <i />
              <i />
              <span>{selected.file}</span>
              <button
                type="button"
                className="dialog__close"
                onClick={() => setOpenId(null)}
                aria-label={t.projects.dialog.close}
              >
                x
              </button>
            </div>

            <div className="dialog__body">
              <p className="project__kicker">{selected.kicker}</p>
              <h3 className="dialog__title" id="dialog-title">
                {selected.title}
              </h3>
              <p className="dialog__sub">{selected.desc}</p>

              <dl className="dialog__grid">
                {selected.facts.map((fact) => (
                  <div className="dialog__fact" key={fact.k}>
                    <dt>{t.projects.dialog[fact.k as "role" | "time" | "team" | "result"]}</dt>
                    <dd>{fact.v}</dd>
                  </div>
                ))}
              </dl>

              <p className="dialog__h">{t.projects.dialog.highlightsTitle}</p>
              <ul className="dialog__list">
                {selected.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>

              <p className="dialog__h">{t.projects.dialog.stackTitle}</p>
              <div className="dialog__tags">
                {selected.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="dialog__actions">
                <a
                  className="btn btn--primary"
                  href={selected.link}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t.projects.dialog.linkLabel}
                  <span className="btn__arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
                <button type="button" className="btn" onClick={() => setOpenId(null)}>
                  {t.projects.dialog.close}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </dialog>
    </section>
  );
}
