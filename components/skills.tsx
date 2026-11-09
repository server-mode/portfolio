"use client";

import type { CSSProperties } from "react";
import Reveal from "./reveal";
import { useLang } from "./lang-context";

const ACCENTS: Record<string, string> = {
  blue: "var(--blue)",
  red: "var(--red)",
  yellow: "var(--yellow)",
  green: "var(--green)",
  ink: "var(--ink)",
};

export default function Skills() {
  const { t } = useLang();

  return (
    <section className="section section--wash" id="skills" aria-labelledby="skills-title">
      <div className="container">
        <Reveal>
          <div className="section__head">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__num">{t.skills.num}</span>
                {t.skills.label}
              </p>
              <h2 className="h2" id="skills-title">
                {t.skills.title}
              </h2>
              <p className="lede">{t.skills.lede}</p>
            </div>
            <div className="section__aside">
              <figure className="figure" style={{ maxWidth: 320 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="frame-img"
                  src="/gifs/keyboard.gif"
                  alt={t.skills.keyboardCap}
                  width={480}
                  height={280}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="figure__cap">
                  <i className="dot" aria-hidden="true" />
                  {t.skills.keyboardCap}
                </figcaption>
              </figure>
            </div>
          </div>
        </Reveal>

        <Reveal className="skills" delay={80}>
          {t.skills.groups.map((group) => (
            <article
              className="skill-card"
              key={group.title}
              style={{ "--accent": group.accent } as CSSProperties}
            >
              <div className="skill-card__head">
                <h3 className="skill-card__title">{group.title}</h3>
                <span className="skill-card__count" aria-hidden="true">
                  {String(group.items.length).padStart(2, "0")} TOOLS
                </span>
              </div>

              <ul>
                {group.items.map((skill, index) => (
                  <li className="skill-row" key={skill.name}>
                    <div>
                      <div className="skill-row__name">{skill.name}</div>
                      <div className="skill-row__lvl">{skill.level}</div>
                    </div>
                    <div
                      className="skill-bar"
                      role="img"
                      aria-label={`${skill.name} — ${skill.level}`}
                    >
                      <span className="skill-bar__ticks" aria-hidden="true" />
                      <span
                        className="skill-bar__fill"
                        aria-hidden="true"
                        style={
                          {
                            "--p": skill.p,
                            "--delay": `${index * 80}ms`,
                          } as CSSProperties
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <article className="skill-card skill-card--wide">
            <div className="skill-card__head">
              <h3 className="skill-card__title">{t.skills.game.title}</h3>
              <span className="skill-card__count" aria-hidden="true">
                {t.skills.game.count}
              </span>
            </div>

            <ul className="gamedev">
              {t.skills.game.items.map((item, index) => (
                <li className="gamedev__row" key={item.name}>
                  <span className="gamedev__name">{item.name}</span>
                  <span className="gamedev__pct">{item.pct}%</span>
                  <div className="skill-bar" role="img" aria-label={`${item.name} — ${item.pct}%`}>
                    <span className="skill-bar__ticks" aria-hidden="true" />
                    <span
                      className="skill-bar__fill"
                      aria-hidden="true"
                      style={
                        {
                          "--p": item.pct / 100,
                          "--accent": ACCENTS[item.accent] ?? "var(--ink)",
                          "--delay": `${index * 70}ms`,
                        } as CSSProperties
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
