"use client";

import Reveal from "./reveal";
import { useLang } from "./lang-context";

export default function Journey() {
  const { t } = useLang();

  return (
    <section className="section" id="journey" aria-labelledby="journey-title">
      <div className="container">
        <Reveal>
          <div className="section__head">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__num">{t.journey.num}</span>
                {t.journey.label}
              </p>
              <h2 className="h2" id="journey-title">
                {t.journey.title}
              </h2>
              <p className="lede">{t.journey.lede}</p>
            </div>
          </div>
        </Reveal>

        <ol className="timeline">
          {t.journey.items.map((item, index) => (
            <li className="timeline__item" key={`${item.year}-${item.title}`} data-now={item.now === true}>
              <Reveal delay={index * 60}>
                <p className="timeline__year">
                  {item.year}
                  <span className="chip chip--soft">{item.kind}</span>
                </p>
                <div className="timeline__card">
                  <h3 className="timeline__title">{item.title}</h3>
                  <p className="timeline__text">{item.text}</p>
                  <div className="timeline__tags">
                    {item.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
