"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RvLogo from "@/components/RvLogo";
import ThemeToggle from "@/components/ThemeToggle";

export const NAV_ITEMS = [
  { label: "writing", href: "/writing" },
  { label: "work", href: "/work" },
  { label: "now", href: "/now" },
  { label: "about", href: "/about" },
];

function formatReykjavik(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Atlantic/Reykjavik",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

type Highlight = { left: number; top: number; width: number; height: number; visible: boolean };

export default function Navbar() {
  const pathname = usePathname();
  const [time, setTime] = useState<string | null>(null);
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

  useEffect(() => {
    const update = () => setTime(formatReykjavik(new Date()));
    update();
    const id = setInterval(update, 1000 * 30);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-md">
      <nav className="flex h-12 w-full items-center gap-3 px-4 font-mono text-sm sm:px-6">
        {/* brand pill */}
        <Link
          href="/"
          aria-label="Home"
          className="flex shrink-0 items-center rounded p-1.5 transition-all duration-100 ease-out hover:opacity-80 active:scale-95"
        >
          <RvLogo className="h-6 w-auto text-[#6A00FF]" mono mark />
        </Link>

        <span className="hidden text-foreground/20 sm:inline">│</span>

        {/* nav */}
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
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={handleEnter}
                  className={
                    active
                      ? "relative z-10 rounded bg-[#6A00FF] px-2 py-1 text-white transition-all duration-100 ease-out active:scale-95"
                      : "relative z-10 rounded px-2 py-1 text-foreground/70 transition-colors duration-100 ease-out hover:text-foreground active:scale-95"
                  }
                >
                  {item.label}
                  {active ? " *" : ""}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* clock + theme toggle */}
        <div className="ml-auto hidden shrink-0 items-center gap-2 rounded-full bg-foreground/5 px-3 py-1.5 text-xs text-foreground/80 ring-1 ring-foreground/10 transition-colors duration-100 ease-out hover:bg-foreground/10 sm:flex">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
          <span className="tabular-nums">REY {time ?? "--:--"}</span>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
