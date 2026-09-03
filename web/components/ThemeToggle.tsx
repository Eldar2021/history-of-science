"use client";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { THEME_KEY, type Theme } from "@/lib/theme";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readTheme(): Theme {
  const stored = document.documentElement.dataset.theme;
  return stored === "dark" || stored === "light" ? stored : systemTheme();
}

/** Re-render when the html attribute or the OS preference changes. */
function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    media.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

/** Light is primary (ADR-020); the switch flips to the other theme and remembers it per browser. */
export function ThemeToggle() {
  const t = useTranslations("nav");
  // Server snapshot is the primary theme; the client corrects it on hydration.
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode: the choice just does not persist */ }
  }

  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? t("themeLight") : t("themeDark")}
      title={dark ? t("themeLight") : t("themeDark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-pill border border-line text-secondary transition-colors duration-(--duration-press) hover:text-primary"
    >
      {/* A single point of light, per the wordmark: filled when the night theme is on. */}
      <span aria-hidden className={`h-2.5 w-2.5 rounded-full border-2 border-current ${dark ? "bg-current" : ""}`} />
    </button>
  );
}
