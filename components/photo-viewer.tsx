"use client";

import { useEffect, useRef, useState } from "react";

type PhotoViewerProps = {
  src: string;
  large: string;
  alt: string;
  title: string;
  zoomLabel: string;
  closeLabel: string;
};

/** Thumbnail that opens the photo in a full-size in-page lightbox. */
export default function PhotoViewer({
  src,
  large,
  alt,
  title,
  zoomLabel,
  closeLabel,
}: PhotoViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setLoadedSrc(large);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, large]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="photo-trigger"
        onClick={() => setOpen(true)}
        aria-label={zoomLabel}
        title={zoomLabel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={1100} height={733} loading="lazy" decoding="async" />
      </button>

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label={title}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
      >
        <div className="lightbox__bar">
          <span className="lightbox__title">{title}</span>
          <button
            type="button"
            className="dialog__close"
            onClick={() => setOpen(false)}
            aria-label={closeLabel}
          >
            x
          </button>
        </div>
        <div className="lightbox__stage">
          {loadedSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={loadedSrc} alt={alt} width={2000} height={1333} />
          ) : null}
        </div>
      </dialog>
    </>
  );
}
