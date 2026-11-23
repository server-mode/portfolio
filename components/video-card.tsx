"use client";

import { useState } from "react";

type VideoCardProps = {
  id: string;
  title: string;
  author: string;
  url: string;
  playLabel: string;
  removeLabel?: string;
  onRemove?: () => void;
};

/** Thumbnail that swaps itself for a YouTube iframe on click. */
export default function VideoCard({
  id,
  title,
  author,
  url,
  playLabel,
  removeLabel,
  onRemove,
}: VideoCardProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className="video">
      <div className="video__frame">
        {playing ? (
          <iframe
            className="video__iframe"
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="video__thumb"
            onClick={() => setPlaying(true)}
            aria-label={`${playLabel}: ${title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              decoding="async"
            />
            <span className="video__play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {onRemove ? (
        <button
          type="button"
          className="video__del"
          onClick={onRemove}
          aria-label={`${removeLabel ?? "Remove"}: ${title}`}
          title={removeLabel}
        >
          ×
        </button>
      ) : null}

      <div className="video__body">
        <h4 className="video__title">{title}</h4>
        <p className="video__author">{author}</p>
        <a className="video__link" href={url} target="_blank" rel="noreferrer noopener">
          YouTube <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}
