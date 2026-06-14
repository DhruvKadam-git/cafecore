"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyThemeToDocument,
  DEFAULT_THEME_ID,
  getThemeById,
  resolveThemeId,
  STORAGE_KEY,
  THEMES,
  ThemeDefinition,
  ThemeId,
} from "@/lib/theme-config";

interface ThemeContextValue {
  themeId: ThemeId;
  theme: ThemeDefinition;
  themes: ThemeDefinition[];
  setTheme: (id: ThemeId) => void;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = resolveThemeId(stored);
    if (stored && stored !== initial) {
      localStorage.setItem(STORAGE_KEY, initial);
    }
    setThemeId(initial);
    applyThemeToDocument(initial);
    setIsReady(true);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    applyThemeToDocument(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const value = useMemo(
    () => ({
      themeId,
      theme: getThemeById(themeId),
      themes: THEMES,
      setTheme,
      isReady,
    }),
    [themeId, setTheme, isReady]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
