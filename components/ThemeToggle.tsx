"use client";

import { useLayoutEffect, useState } from "react";

const THEME_KEY = "rv-theme";
type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useLayoutEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const current: Theme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next: Theme = current === "dark" ? "light" : "dark";

    const doc = document as unknown as {
      startViewTransition?: (callback: () => void) => void;
    };

    if (
      !doc.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      applyTheme(next);
      setTheme(next);
      localStorage.setItem(THEME_KEY, next);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${endRadius}px`);
    root.setAttribute("data-switching", "");

    doc.startViewTransition(() => {
      applyTheme(next);
    });

    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    requestAnimationFrame(() => root.removeAttribute("data-switching"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="flex h-5 w-5 shrink-0 items-center justify-center text-foreground/70 transition-all duration-100 ease-out hover:text-foreground active:scale-90"
    >
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
        className={`h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          theme === "light" ? "rotate-180" : "rotate-0"
        }`}
      >
        <path d="M16 .5C7.4.5.5 7.4.5 16S7.4 31.5 16 31.5 31.5 24.6 31.5 16 24.6.5 16 .5zm0 28.1V3.4C23 3.4 28.6 9 28.6 16s-5.6 12.6-12.6 12.6z" />
      </svg>
    </button>
  );
}
