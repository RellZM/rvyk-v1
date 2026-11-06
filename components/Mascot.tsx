"use client";

import { useEffect, useRef, useState } from "react";

const HEAD_SRC = "/mascot/mascot-base.svg";

const EYES_OPEN_SRC = "/mascot/eyes-open.svg";
const EYES_CLOSED_SRC = "/mascot/eyes-closed.svg";
const EYES_HOVER_SRC = "/mascot/eyes-hover.svg";
const EYES_ACTIVE_SRC = "/mascot/eyes-active.svg";

// Mascot baru (GIF) untuk PC / Desktop
const GIF_INACTIVE_SRC = "/mascot_new/Inactive(1).gif";
const GIF_ACTIVE_SRC = "/mascot_new/Speaking(1).gif";

const BLINK_CLOSED_MS = 140;
const BLINK_MIN_OPEN_MS = 2200;
const BLINK_MAX_OPEN_MS = 4800;

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

export default function Mascot() {
  const [blinkClosed, setBlinkClosed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const dragOrigin = useRef<{ pointer: Point; pos: Point } | null>(null);
  const [chatMessage, setChatMessage] = useState(GREETING);
  const hasGreeted = useRef(false);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setPos({ x: 0, y: 0 });
        setDragging(false);
        dragOrigin.current = null;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeout);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function pickMessage() {
    if (!hasGreeted.current) {
      hasGreeted.current = true;
      setChatMessage(GREETING);
    } else {
      setChatMessage(CHAT_LINES[Math.floor(Math.random() * CHAT_LINES.length)]);
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (window.innerWidth >= 1024) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOrigin.current = { pointer: { x: e.clientX, y: e.clientY }, pos };
    setDragging(true);
    setHovering(true);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    pickMessage();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragOrigin.current) return;
    const { pointer, pos: origPos } = dragOrigin.current;
    const dx = e.clientX - pointer.x;
    const dy = e.clientY - pointer.y;
    setPos({ x: origPos.x + dx, y: origPos.y + dy });
    setHovering(true);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragOrigin.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    // On mobile touch, keep bubble visible for 3.5s after releasing
    if (window.innerWidth < 1024) {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      bubbleTimer.current = setTimeout(() => {
        setHovering(false);
      }, 3500);
    }
  }

  function handleHoverEnter() {
    setHovering(true);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    pickMessage();
  }

  function handleHoverLeave() {
    if (window.innerWidth >= 1024) {
      setHovering(false);
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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={handleHoverEnter}
      onPointerLeave={handleHoverLeave}
      role="img"
      aria-label="Maskot"
      className="relative h-[clamp(10rem,26vh,16rem)] w-[clamp(10rem,26vh,16rem)] sm:h-[clamp(13rem,30vh,18rem)] sm:w-[clamp(13rem,30vh,18rem)] lg:h-[min(72vh,38vw,560px)] lg:w-[min(72vh,38vw,560px)] cursor-grab touch-none select-none active:cursor-grabbing lg:cursor-default lg:touch-auto lg:!transform-none"
      style={{
        transform: isDesktop ? "none" : `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        transition: dragging ? "none" : "transform 0.2s ease-out",
      }}
    >
      {/* Speech bubble - sits directly above mascot, moves along in lockstep on mobile, static on PC */}
      <div
        className={`absolute bottom-full left-1/2 mb-3 w-max max-w-64 -translate-x-1/2 rounded-2xl bg-white px-4 py-2 text-center text-sm font-medium text-black shadow-lg transition-all duration-150 ease-out z-30 pointer-events-none ${
          hovering ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        {chatMessage}
        <span
          className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white"
          aria-hidden
        />
      </div>

      {/* PC / Desktop: Mascot GIF Baru */}
      <div className="relative hidden h-full w-full lg:block">
        <img
          src={GIF_INACTIVE_SRC}
          alt="Maskot Inactive"
          draggable={false}
          className={`absolute inset-0 h-full w-full object-contain object-bottom ${
            hovering ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={GIF_ACTIVE_SRC}
          alt="Maskot Active"
          draggable={false}
          className={`absolute inset-0 h-full w-full object-contain object-bottom ${
            hovering ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Mobile: Mascot Lama (SVG Base + Eyes) */}
      <div className="relative block h-full w-full lg:hidden">
        <img src={HEAD_SRC} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
        <img
          src={EYES_SRC[expression]}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
