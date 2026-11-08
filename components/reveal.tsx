"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
};

/**
 * Fades content in the first time it scrolls into view.
 * Content stays visible when IntersectionObserver is unavailable, and
 * reduced-motion visitors get it immediately via CSS.
 */
export default function Reveal({ children, className = "", delay = 0, style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={{ "--d": `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}
