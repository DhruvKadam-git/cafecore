"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Palette, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { KDSMode, ThemeDefinition, ThemeId } from "@/lib/theme-config";

function ThemePreviewCard({
  theme,
  isActive,
  onSelect,
  isKds,
}: {
  theme: ThemeDefinition;
  isActive: boolean;
  onSelect: () => void;
  isKds: boolean;
}) {
  const { primary, sidebar, background, surface } = theme.colors;
  const { bg, surface: kdsSurface, amber, green } = theme.kds;

  const swatches = isKds
    ? theme.kdsMode === "light"
      ? [bg, kdsSurface, amber, green]
      : [amber, kdsSurface, bg, green]
    : [primary, sidebar, background, surface];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`w-full flex items-center gap-3 p-3 rounded-[14px] border transition-all duration-200 text-left cursor-pointer theme-transition ${
        isActive
          ? isKds
            ? "border-kds-amber bg-kds-amber/10 ring-2 ring-kds-amber/30"
            : "border-primary bg-primary/5 ring-2 ring-primary/30"
          : isKds
            ? "border-kds-border bg-kds-elevated hover:bg-kds-surface"
            : "border-border-custom bg-background hover:bg-surface"
      }`}
    >
      <div className="flex gap-1 shrink-0">
        {swatches.map((color, i) => (
          <div
            key={`${color}-${i}`}
            className="w-5 h-5 rounded-full border border-black/10"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[14px] font-semibold truncate ${
            isKds ? "text-kds-text" : "text-text-heading"
          }`}
        >
          {theme.name}
        </p>
        <p
          className={`text-[11px] font-medium ${
            isKds ? "text-kds-muted" : "text-text-muted"
          }`}
        >
          {theme.category}
        </p>
      </div>
      {isActive && (
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
            isKds ? "bg-kds-amber" : "bg-primary"
          }`}
        >
          <Check
            size={14}
            className={isKds ? "text-kds-action-primary-text" : "text-white"}
            strokeWidth={3}
          />
        </div>
      )}
    </button>
  );
}

function ThemeGroup({
  label,
  icon,
  themes,
  themeId,
  isKds,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  themes: ThemeDefinition[];
  themeId: ThemeId;
  isKds: boolean;
  onSelect: (id: ThemeId) => void;
}) {
  if (themes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex items-center gap-1.5 px-1 ${
          isKds ? "text-kds-muted" : "text-text-muted"
        }`}
      >
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      {themes.map((theme) => (
        <ThemePreviewCard
          key={theme.id}
          theme={theme}
          isActive={themeId === theme.id}
          isKds={isKds}
          onSelect={() => onSelect(theme.id)}
        />
      ))}
    </div>
  );
}

export function ThemeSwitcher() {
  const pathname = usePathname();
  const isKds = pathname === "/kds";
  const { themeId, themes, setTheme, isReady } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { brightThemes, darkThemes } = useMemo(() => {
    const bright = themes.filter((t) => t.kdsMode === "light");
    const dark = themes.filter((t) => t.kdsMode === "dark");
    return { brightThemes: bright, darkThemes: dark };
  }, [themes]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    fabRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (id: ThemeId) => {
      setTheme(id);
      close();
    },
    [setTheme, close]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        fabRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  if (!mounted || !isReady) return null;

  if (pathname === "/login") return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Theme selector"
          className={`w-[320px] border rounded-[20px] shadow-xl p-4 animate-theme-panel-in theme-transition ${
            isKds
              ? "bg-kds-surface border-kds-border"
              : "bg-surface border-border-custom"
          }`}
        >
          <h2
            className={`text-[16px] font-bold mb-3 ${
              isKds ? "text-kds-text" : "text-text-heading"
            }`}
          >
            Themes
          </h2>
          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto no-scrollbar">
            {isKds ? (
              <>
                <ThemeGroup
                  label="Bright"
                  icon={<Sun size={12} />}
                  themes={brightThemes}
                  themeId={themeId}
                  isKds={isKds}
                  onSelect={handleSelect}
                />
                <ThemeGroup
                  label="Dark"
                  icon={<Moon size={12} />}
                  themes={darkThemes}
                  themeId={themeId}
                  isKds={isKds}
                  onSelect={handleSelect}
                />
              </>
            ) : (
              themes.map((theme) => (
                <ThemePreviewCard
                  key={theme.id}
                  theme={theme}
                  isActive={themeId === theme.id}
                  isKds={false}
                  onSelect={() => handleSelect(theme.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      <button
        ref={fabRef}
        type="button"
        onClick={toggle}
        aria-label="Change theme"
        aria-expanded={isOpen}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 ease hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isKds
            ? "bg-kds-amber text-kds-action-primary-text focus-visible:ring-kds-amber"
            : "bg-sidebar-bg text-white focus-visible:ring-primary"
        }`}
      >
        <Palette size={22} strokeWidth={1.75} />
      </button>
    </div>,
    document.body
  );
}
