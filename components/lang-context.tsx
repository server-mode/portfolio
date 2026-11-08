"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { COPY, LANGS, type Copy, type Lang } from "@/lib/i18n";

type LangContextValue = {
  lang: Lang;
  t: Copy;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
};

const LangContext = createContext<LangContextValue | null>(null);
const STORAGE_KEY = "hh-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("vi");

  // Restore the visitor's choice (a ?lang= link wins), or guess once.
  useEffect(() => {
    let next: Lang | null = null;
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl === "vi" || fromUrl === "en") {
      next = fromUrl;
    } else {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === "vi" || saved === "en") next = saved;
      } catch {
        /* storage blocked — fall through to detection */
      }
    }
    if (!next) {
      const nav = (navigator.languages?.[0] || navigator.language || "vi").toLowerCase();
      next = nav.startsWith("vi") ? "vi" : "en";
    }
    setLangState(next);
  }, []);

  useEffect(() => {
    const copy = COPY[lang];
    document.documentElement.lang = copy.htmlLang;
    document.title = copy.meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", copy.meta.description);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    if (LANGS.includes(next)) setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === "vi" ? "en" : "vi"));
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({ lang, t: COPY[lang], setLang, toggleLang }),
    [lang, setLang, toggleLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
