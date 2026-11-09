"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./reveal";
import PhotoViewer from "./photo-viewer";
import { useLang } from "./lang-context";

const INK = "#0b0b0f";
const PAPER = "#f6f7f9";
const LINE = "#e3e6ec";
const BLUE = "#1a73e8";
const YELLOW = "#fbbc05";
const GREEN = "#34a853";

function noise(i: number, salt = 1): number {
  const n = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/** A pixel "conference poster" with the three-tier memory diagram. */
function PosterArt() {
  const store = [];
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const v = noise(r * 8 + c, 5);
      store.push(
        <rect
          key={`${r}-${c}`}
          x={46 + c * 24}
          y={214 + r * 18}
          width={18}
          height={14}
          fill={v > 0.72 ? YELLOW : v > 0.45 ? BLUE : v > 0.2 ? "#cdd3db" : LINE}
        />,
      );
    }
  }

  return (
    <svg viewBox="0 0 280 372" role="img" aria-hidden="true" shapeRendering="crispEdges">
      <rect width="280" height="372" fill="#ffffff" />

      {/* conference header */}
      <rect x="14" y="14" width="252" height="5" fill={INK} />
      <rect x="14" y="26" width="10" height="10" fill={YELLOW} />
      <rect x="30" y="27" width="120" height="6" fill={INK} />
      <rect x="30" y="37" width="80" height="4" fill="#c9ced6" />
      <rect x="238" y="26" width="10" height="10" fill={BLUE} />
      <rect x="254" y="26" width="10" height="10" fill={GREEN} />

      {/* title lines */}
      <rect x="14" y="52" width="204" height="9" fill={INK} />
      <rect x="14" y="66" width="162" height="9" fill={INK} />
      <rect x="14" y="80" width="116" height="9" fill={INK} />
      <rect x="14" y="97" width="92" height="4" fill="#9aa2ae" />
      <rect x="112" y="97" width="46" height="4" fill="#c9ced6" />

      {/* diagram panel */}
      <rect x="14" y="110" width="252" height="170" fill={PAPER} stroke={INK} strokeWidth="2" />

      {/* tier 3 — working memory */}
      <rect x="80" y="122" width="120" height="30" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <rect x="88" y="130" width="8" height="8" fill={YELLOW} />
      <rect x="100" y="131" width="52" height="5" fill={INK} />
      <rect x="88" y="142" width="80" height="3" fill="#c9ced6" />
      <rect x="18" y="128" width="6" height="6" fill={INK} />
      <rect x="18" y="138" width="14" height="3" fill="#9aa2ae" />

      {/* arrow 3 -> 2 */}
      <rect x="139" y="152" width="2" height="12" fill={INK} />
      <rect x="135" y="162" width="10" height="2" fill={INK} />
      <rect x="137" y="164" width="6" height="2" fill={INK} />
      <rect x="139" y="166" width="2" height="2" fill={INK} />

      {/* tier 2 — episodic memory */}
      <rect x="56" y="170" width="76" height="28" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <rect x="64" y="178" width="6" height="6" fill={BLUE} />
      <rect x="74" y="179" width="44" height="4" fill="#3a4150" />
      <rect x="64" y="188" width="56" height="3" fill="#c9ced6" />

      <rect x="148" y="170" width="76" height="28" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <rect x="156" y="178" width="6" height="6" fill={GREEN} />
      <rect x="166" y="179" width="44" height="4" fill="#3a4150" />
      <rect x="156" y="188" width="56" height="3" fill="#c9ced6" />

      {/* arrows 2 -> 1 */}
      <rect x="93" y="198" width="2" height="10" fill={INK} />
      <rect x="89" y="204" width="10" height="2" fill={INK} />
      <rect x="185" y="198" width="2" height="10" fill={INK} />
      <rect x="181" y="204" width="10" height="2" fill={INK} />

      {/* tier 1 — external store */}
      <rect x="36" y="208" width="208" height="64" fill="#ffffff" stroke={INK} strokeWidth="2" />
      {store}
      <rect x="18" y="230" width="4" height="14" fill={INK} />

      {/* footer: caption lines + mini chart */}
      <rect x="14" y="294" width="150" height="4" fill="#9aa2ae" />
      <rect x="14" y="304" width="118" height="4" fill="#c9ced6" />
      <rect x="14" y="314" width="168" height="4" fill="#c9ced6" />
      <rect x="14" y="324" width="96" height="4" fill={LINE} />

      <rect x="190" y="294" width="76" height="34" fill={PAPER} stroke={INK} strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={197 + i * 17}
          y={322 - (8 + Math.round(noise(i, 9) * 14))}
          width={10}
          height={8 + Math.round(noise(i, 9) * 14)}
          fill={i === 2 ? BLUE : INK}
        />
      ))}

      <rect x="14" y="344" width="252" height="6" fill={INK} />
      <rect x="14" y="354" width="60" height="4" fill="#c9ced6" />
      <rect x="84" y="354" width="34" height="4" fill="#c9ced6" />
      <rect x="128" y="354" width="52" height="4" fill="#c9ced6" />
    </svg>
  );
}

export default function Research() {
  const { t } = useLang();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  async function copyBibtex(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        /* no clipboard access */
      }
      document.body.removeChild(area);
    }
    setCopiedId(id);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopiedId(null), 1900);
  }

  return (
    <section className="section section--wash" id="research" aria-labelledby="research-title">
      <div className="container">
        <Reveal>
          <div className="section__head">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__num">{t.research.num}</span>
                {t.research.label}
              </p>
              <h2 className="h2" id="research-title">
                {t.research.title}
              </h2>
              <p className="lede">{t.research.lede}</p>
            </div>
          </div>
        </Reveal>

        {t.research.items.map((item, index) => (
          <Reveal key={item.id} delay={index * 70}>
            <article className="paper">
              <div className="paper__visual">
                <p className="award-badge">
                  <span aria-hidden="true" />
                  {item.award}
                </p>

                <figure className="paper__photo">
                  <PhotoViewer
                    src={item.photo}
                    large={item.photoLarge}
                    alt={`${item.award} — ${item.venue}`}
                    title={`${item.award} · ${item.venue}`}
                    zoomLabel={t.research.labels.zoom}
                    closeLabel={t.research.labels.close}
                  />
                  <figcaption className="media-cap">
                    <span>{t.research.labels.photoCap}</span>
                    <span>{item.venue}</span>
                  </figcaption>
                </figure>

                <figure className="poster">
                  <PosterArt />
                  <figcaption className="media-cap">
                    <span>{t.research.labels.diagramCap}</span>
                    <span>EPU-HEKV</span>
                  </figcaption>
                </figure>
              </div>

              <div className="paper__body">
                <p className="paper__venue">
                  <span className="chip chip--ink">{item.venue}</span>
                  <span className="chip chip--soft">{item.venueNote}</span>
                </p>

                <h3 className="paper__title">{item.title}</h3>
                <p className="paper__authors">{item.authors}</p>

                <dl className="paper__meta">
                  <div>
                    <dt>{t.research.labels.venue}</dt>
                    <dd>{item.venue}</dd>
                  </div>
                  <div>
                    <dt>{t.research.labels.award}</dt>
                    <dd>
                      {item.award} — {item.awardNote}
                    </dd>
                  </div>
                  <div>
                    <dt>{t.research.labels.field}</dt>
                    <dd>{item.field}</dd>
                  </div>
                  <div>
                    <dt>{t.research.labels.role}</dt>
                    <dd>{item.role}</dd>
                  </div>
                </dl>

                <p className="paper__abstract">
                  <strong>{t.research.labels.abstract}.</strong> {item.abstract}
                </p>

                <ul className="paper__list">
                  {item.highlights.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <div className="paper__keywords">
                  <span>{t.research.labels.keywords}</span>
                  {item.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="paper__actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => copyBibtex(item.id, item.bibtex)}
                    data-copied={copiedId === item.id}
                  >
                    <span aria-hidden="true">{copiedId === item.id ? "✓" : "⧉"}</span>
                    {copiedId === item.id ? t.research.labels.copied : t.research.labels.copy}
                  </button>
                  <a
                    className="btn"
                    href={`mailto:${t.contact.email}?subject=${encodeURIComponent(item.title)}`}
                  >
                    {t.research.labels.contact}
                  </a>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
