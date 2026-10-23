"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dict, format, type Dict } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
  f: (template: string, vars: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "ct-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  // Hydrate from storage / browser locale (client only).
  // Deliberate post-hydration resolution to avoid SSR/client language mismatch.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "pt") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resolving persisted language after hydration
      setLangState(stored);
      return;
    }
    const nav = window.navigator.language?.toLowerCase() ?? "pt";
    setLangState(nav.startsWith("pt") ? "pt" : "en");
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
  }, []);

  // Keep <html lang> in sync
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: dict[lang] as Dict, f: (template, vars) => format(template, vars) }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
