"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "@/components/Navbar";

const HEAD_SRC = "/mascot/mascot-base.svg";

const EYES_OPEN_SRC = "/mascot/eyes-open.svg";
const EYES_CLOSED_SRC = "/mascot/eyes-closed.svg";
const EYES_HOVER_SRC = "/mascot/eyes-hover.svg";
const EYES_ACTIVE_SRC = "/mascot/eyes-active.svg";

const EYES_OPEN_BLUE_SRC = "/mascot/eyes-open-blue.svg";
const EYES_CLOSED_BLUE_SRC = "/mascot/eyes-closed-blue.svg";
const EYES_HOVER_BLUE_SRC = "/mascot/eyes-hover-blue.svg";
const EYES_ACTIVE_BLUE_SRC = "/mascot/eyes-active-blue.svg";

const BLINK_CLOSED_MS = 140;
const BLINK_MIN_OPEN_MS = 2200;
const BLINK_MAX_OPEN_MS = 4800;

const CLICK_MOVE_THRESHOLD_PX = 6;

// Blue eye center, measured from eyes-open-blue.svg's colored rects (206x206 viewBox).
const EYE_TARGET_X_PCT = 0.2474;
const EYE_TARGET_Y_PCT = 0.5;

const GREETING = "Hi, im Rvyk. Nice to meet u.";

const CHAT_LINES = [
  "Crazy veður today, right? Can't believe how windy it is.",
  "Þetta er ekkert weather, wait till winter comes hehe.",
  "Any plans for helgin? Maybe just relaxing at home, þú veist.",
  "Going to a rúntur this weekend?",
  "Hvað segirðu? Everything good with you?",
  "Allt gott, just chilling, you know how it is.",
  "Want to grab a kaffi later? There's this new place downtown.",
  "Have you tried the nýtt lunch place? Pretty solid.",
  "Jæja, I should get going, sé þig later!",
  "Takk fyrir spjallið (thanks for the chat), see you around!",
  "Can you believe it's bjart out at midnight? Still gets me every time.",
  "Going anywhere for the summer holiday, eða staying in Iceland?",
];

type Point = { x: number; y: number };
type Expression = "open" | "closed" | "hover" | "active";

const EYES_SRC: Record<Expression, string> = {
  open: EYES_OPEN_SRC,
  closed: EYES_CLOSED_SRC,
  hover: EYES_HOVER_SRC,
  active: EYES_ACTIVE_SRC,
};

const EYES_BLUE_SRC: Record<Expression, string> = {
  open: EYES_OPEN_BLUE_SRC,
  closed: EYES_CLOSED_BLUE_SRC,
  hover: EYES_HOVER_BLUE_SRC,
  active: EYES_ACTIVE_BLUE_SRC,
};

export default function Mascot() {
  const [blinkClosed, setBlinkClosed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [eyesBlue, setEyesBlue] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [curves, setCurves] = useState<string[]>([]);
  const dragOrigin = useRef<{ pointer: Point; pos: Point } | null>(null);
  const moved = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stubRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [chatMessage, setChatMessage] = useState(GREETING);
  const hasGreeted = useRef(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      const openFor = BLINK_MIN_OPEN_MS + Math.random() * (BLINK_MAX_OPEN_MS - BLINK_MIN_OPEN_MS);
      timeout = setTimeout(() => {
        setBlinkClosed(true);
        timeout = setTimeout(() => {
          setBlinkClosed(false);
          scheduleBlink();
        }, BLINK_CLOSED_MS);
      }, openFor);
    };

    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function recomputeCurves() {
      const root = rootRef.current;
      if (!root) return;
      const rootRect = root.getBoundingClientRect();
      const eyeX = rootRect.width * EYE_TARGET_X_PCT;
      const eyeY = rootRect.height * EYE_TARGET_Y_PCT;

      const next = stubRefs.current.map((stub) => {
        if (!stub) return null;
        const r = stub.getBoundingClientRect();
        const startX = r.right - rootRect.left;
        const startY = r.top + r.height / 2 - rootRect.top;
        const midX = startX + (eyeX - startX) * 0.5;
        return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${eyeY}, ${eyeX} ${eyeY}`;
      });

      setCurves(next.filter((d): d is string => d !== null));
    }

    recomputeCurves();
    window.addEventListener("resize", recomputeCurves);
    return () => window.removeEventListener("resize", recomputeCurves);
  }, [menuOpen]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOrigin.current = { pointer: { x: e.clientX, y: e.clientY }, pos };
    moved.current = false;
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragOrigin.current) return;
    const { pointer, pos: origPos } = dragOrigin.current;
    const dx = e.clientX - pointer.x;
    const dy = e.clientY - pointer.y;
    if (Math.hypot(dx, dy) > CLICK_MOVE_THRESHOLD_PX) moved.current = true;
    setPos({ x: origPos.x + dx, y: origPos.y + dy });
  }

  function handleHoverEnter() {
    setHovering(true);
    if (!hasGreeted.current) {
      hasGreeted.current = true;
      setChatMessage(GREETING);
    } else {
      setChatMessage(CHAT_LINES[Math.floor(Math.random() * CHAT_LINES.length)]);
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragOrigin.current = null;
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!moved.current) {
      setEyesBlue((prev) => !prev);
      setMenuOpen((prev) => !prev);
    }
  }

  const expression: Expression = dragging
    ? "active"
    : hovering
      ? "hover"
      : blinkClosed
        ? "closed"
        : "open";

  return (
    <div
      ref={rootRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={handleHoverEnter}
      onPointerLeave={() => setHovering(false)}
      role="img"
      aria-label="Maskot"
      className="relative h-55 w-55 cursor-grab touch-none select-none active:cursor-grabbing"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: dragging ? "none" : "transform 0.2s ease-out",
      }}
    >
      <div
        className={`absolute bottom-full left-1/2 mb-3 w-max max-w-56 -translate-x-1/2 rounded-2xl bg-white px-3.5 py-2 text-center text-sm font-medium text-black transition-all duration-150 ease-out ${
          hovering ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
        }`}
      >
        {chatMessage}
        <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" aria-hidden />
      </div>

      <img src={HEAD_SRC} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
      <img
        src={eyesBlue ? EYES_BLUE_SRC[expression] : EYES_SRC[expression]}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full"
      />

      <svg
        className="pointer-events-none absolute overflow-visible transition-opacity duration-150 ease-out"
        style={{ left: 0, top: 0, opacity: menuOpen ? 1 : 0 }}
        aria-hidden
      >
        {curves.map((d, i) => (
          <path
            key={NAV_ITEMS[i].href}
            d={d}
            fill="none"
            stroke="#3B82F6"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
      </svg>

      <div
        onPointerDown={(e) => e.stopPropagation()}
        className={`absolute right-full top-1/2 mr-4 flex -translate-y-1/2 flex-col gap-2.5 transition-opacity duration-150 ease-out ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {NAV_ITEMS.map((item, i) => (
          <div key={item.href} className="flex items-center">
            <Link
              href={item.href}
              className="flex items-center justify-center whitespace-nowrap rounded-full bg-[#6A00FF] px-4 py-1.5 text-sm font-bold uppercase tracking-tight text-white transition-transform duration-100 ease-out hover:scale-105 active:scale-95"
            >
              {item.label}
            </Link>
            <span
              ref={(el) => {
                stubRefs.current[i] = el;
              }}
              className="h-0.5 w-4 bg-[#3B82F6]"
              aria-hidden
            />
          </div>
        ))}
      </div>
    </div>
  );
}
