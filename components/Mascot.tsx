"use client";

import { useEffect, useRef, useState } from "react";

const HEAD_SRC = "/mascot/mascot-base.svg";

const EYES_OPEN_SRC = "/mascot/eyes-open.svg";
const EYES_CLOSED_SRC = "/mascot/eyes-closed.svg";
const EYES_HOVER_SRC = "/mascot/eyes-hover.svg";
const EYES_ACTIVE_SRC = "/mascot/eyes-active.svg";

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
  const dragOrigin = useRef<{ pointer: Point; pos: Point } | null>(null);
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

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOrigin.current = { pointer: { x: e.clientX, y: e.clientY }, pos };
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragOrigin.current) return;
    const { pointer, pos: origPos } = dragOrigin.current;
    const dx = e.clientX - pointer.x;
    const dy = e.clientY - pointer.y;
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
      onPointerLeave={() => setHovering(false)}
      role="img"
      aria-label="Maskot"
      className="relative h-[clamp(11rem,20vw,22rem)] w-[clamp(11rem,20vw,22rem)] cursor-grab touch-none select-none active:cursor-grabbing"
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
        src={EYES_SRC[expression]}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
