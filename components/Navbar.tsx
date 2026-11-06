"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
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
    <header className="sticky top-0 z-50 w-full shrink-0 border-b border-foreground/10 bg-background/80 backdrop-blur-md">
      <nav className="flex h-12 w-full items-center gap-1.5 px-2.5 font-mono text-xs sm:gap-3 sm:px-6 sm:text-sm">
        {/* brand pill */}
        <Link
          href="/admin"
          onDoubleClick={() => router.push("/")}
          aria-label="Admin Dashboard"
          className="flex shrink-0 items-center rounded p-1 sm:p-1.5 transition-all duration-100 ease-out hover:opacity-80 active:scale-95"
        >
          <RvLogo className="h-5 w-auto text-[#6A00FF] sm:h-6" mono mark />
        </Link>

        <span className="hidden text-foreground/20 sm:inline">│</span>

        {/* nav */}
        <ul
          ref={listRef}
          className="relative flex shrink-0 items-center gap-0.5 sm:gap-2"
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
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  prefetch={true}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={handleEnter}
                  className={`relative z-10 flex flex-row flex-nowrap items-center whitespace-nowrap shrink-0 rounded px-1.5 py-1 text-xs transition-all duration-100 ease-out active:scale-95 sm:px-2 sm:text-sm ${
                    active
                      ? "bg-[#6A00FF] font-medium text-white shadow-xs"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <span className="whitespace-nowrap select-none">
                    {item.label}
                    {active ? "\u00A0*" : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* clock + theme toggle */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-foreground/5 px-1.5 py-1 text-xs text-foreground/80 ring-1 ring-foreground/10 transition-colors duration-100 ease-out hover:bg-foreground/10 sm:gap-2 sm:px-3 sm:py-1.5">
          <span className="hidden items-center gap-2 sm:inline-flex">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
            <span className="tabular-nums">REY {time ?? "--:--"}</span>
          </span>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
