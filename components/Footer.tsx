"use client";

import useHoverHighlight from "@/components/useHoverHighlight";

const SOCIALS = [
  { label: "github", href: "https://github.com/RellZM" },
  { label: "linkedin", href: "https://www.linkedin.com/in/afrel-zharif-muflih/" },
  { label: "instagram", href: "https://instagram.com/afrlzhm" },
];

export default function Footer() {
  const { listRef, style: highlightStyle, onEnter, onLeave } = useHoverHighlight();

  return (
    <footer className="w-full shrink-0 border-t border-foreground/10 bg-background/80 backdrop-blur-md">
      <div className="flex h-12 w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 font-mono text-xs text-foreground/50 sm:px-6">
        <span>© 2026 RVYK · Reykjavik</span>
        <ul
          ref={listRef}
          className="relative flex items-center gap-1 sm:gap-2"
          onMouseLeave={onLeave}
        >
          <div
            className="pointer-events-none absolute rounded bg-foreground/10 transition-all duration-150 ease-out"
            style={highlightStyle}
            aria-hidden
          />
          {SOCIALS.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={onEnter}
                className="relative z-10 rounded px-2 py-1 text-foreground/60 transition-colors duration-100 ease-out hover:text-foreground"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
