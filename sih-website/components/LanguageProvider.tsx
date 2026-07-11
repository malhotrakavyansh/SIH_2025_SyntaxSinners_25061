"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { SupportedLanguage, supportedLanguages } from "../lib/i18n";

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  ready: boolean;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => undefined,
  ready: false,
});

function resolveInitialLanguage(): SupportedLanguage {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("language") as SupportedLanguage | null;
    if (stored && supportedLanguages.some((entry) => entry.code === stored)) {
      return stored;
    }

    const browserCode = window.navigator.language?.slice(0, 2).toLowerCase();
    const browserMatch = supportedLanguages.find((entry) => entry.code === browserCode);
    if (browserMatch) return browserMatch.code;
  }
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = resolveInitialLanguage();
    i18n.changeLanguage(initial);
    setLanguage(initial);
    document.documentElement.lang = initial;
    setReady(true);
  }, []);

  const changeLanguage = (next: SupportedLanguage) => {
    i18n.changeLanguage(next);
    setLanguage(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("language", next);
    }
    document.documentElement.lang = next;
  };

  const contextValue = useMemo(
    () => ({ language, setLanguage: changeLanguage, ready }),
    [language, ready]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
