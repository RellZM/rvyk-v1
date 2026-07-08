"use client";

import { useRef, useState } from "react";

const SOCIALS = [
  { label: "github", href: "https://github.com/RellZM" },
  { label: "linkedin", href: "https://www.linkedin.com/in/afrel-zharif-muflih/" },
  { label: "instagram", href: "https://instagram.com/afrlzhm" },
];

type Highlight = { left: number; top: number; width: number; height: number; visible: boolean };

export default function Footer() {
  const listRef = useRef<HTMLUListElement>(null);
  const [highlight, setHighlight] = useState<Highlight>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    visible: false,
  });

  function handleEnter(e: React.MouseEvent<HTMLAnchorElement>) {
    const list = listRef.current;
    if (!list) return;
    const targetRect = e.currentTarget.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    setHighlight({
      left: targetRect.left - listRect.left,
      top: targetRect.top - listRect.top,
      width: targetRect.width,
      height: targetRect.height,
      visible: true,
    });
  }

  function handleLeaveList() {
    setHighlight((h) => ({ ...h, visible: false }));
  }

  return (
    <footer className="w-full border-t border-foreground/10 bg-background/80 backdrop-blur-md">
      <div className="flex h-12 w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 font-mono text-xs text-foreground/50 sm:px-6">
        <span>© 2026 RVYK · Reykjavik</span>
        <ul
          ref={listRef}
          className="relative flex items-center gap-1 sm:gap-2"
          onMouseLeave={handleLeaveList}
        >
          <div
            className="pointer-events-none absolute rounded bg-foreground/10 transition-all duration-150 ease-out"
            style={{
              left: highlight.left,
              top: highlight.top,
              width: highlight.width,
              height: highlight.height,
              opacity: highlight.visible ? 1 : 0,
            }}
            aria-hidden
          />
          {SOCIALS.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={handleEnter}
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
