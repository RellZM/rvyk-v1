"use client";

import { useRef, useState } from "react";

const GRID = 32;
const PIXEL = 10;

type Circle = { cx: number; cy: number; r: number };

const NOSE: Circle = { cx: 16, cy: 23.3, r: 1.8 };
const EYE_L: Circle = { cx: 11.2, cy: 16.8, r: 1.3 };
const EYE_R: Circle = { cx: 20.8, cy: 16.8, r: 1.3 };
const MUZZLE_FILL: Circle = { cx: 16, cy: 22.3, r: 5.3 };
const EAR_L_FILL: Circle = { cx: 7, cy: 8, r: 4 };
const EAR_R_FILL: Circle = { cx: 25, cy: 8, r: 4 };
const HEAD_FILL: Circle = { cx: 16, cy: 18, r: 11 };
const MUZZLE_OUT: Circle = { cx: 16, cy: 22.3, r: 6.1 };
const EAR_L_OUT: Circle = { cx: 7, cy: 8, r: 5 };
const EAR_R_OUT: Circle = { cx: 25, cy: 8, r: 5 };
const HEAD_OUT: Circle = { cx: 16, cy: 18, r: 12 };

function inside(x: number, y: number, c: Circle) {
  const dx = x - c.cx;
  const dy = y - c.cy;
  return dx * dx + dy * dy <= c.r * c.r;
}

function pixelColor(x: number, y: number): string | null {
  if (inside(x, y, NOSE) || inside(x, y, EYE_L) || inside(x, y, EYE_R)) return "#000000";
  if (
    inside(x, y, MUZZLE_FILL) ||
    inside(x, y, EAR_L_FILL) ||
    inside(x, y, EAR_R_FILL) ||
    inside(x, y, HEAD_FILL)
  )
    return "#ffffff";
  if (
    inside(x, y, MUZZLE_OUT) ||
    inside(x, y, EAR_L_OUT) ||
    inside(x, y, EAR_R_OUT) ||
    inside(x, y, HEAD_OUT)
  )
    return "#000000";
  return null;
}

const PIXELS = (() => {
  const list: { x: number; y: number; color: string }[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const color = pixelColor(x + 0.5, y + 0.5);
      if (color) list.push({ x, y, color });
    }
  }
  return list;
})();

type Point = { x: number; y: number };

export default function PolarBear() {
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef<{ pointer: Point; pos: Point } | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOrigin.current = { pointer: { x: e.clientX, y: e.clientY }, pos };
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragOrigin.current) return;
    const { pointer, pos: origPos } = dragOrigin.current;
    setPos({
      x: origPos.x + (e.clientX - pointer.x),
      y: origPos.y + (e.clientY - pointer.y),
    });
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragOrigin.current = null;
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="img"
      aria-label="Beruang kutub pixel"
      className="cursor-grab touch-none select-none active:cursor-grabbing"
      style={{
        width: GRID * PIXEL,
        height: GRID * PIXEL,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: dragging ? "none" : "transform 0.2s ease-out",
      }}
    >
      <svg width={GRID * PIXEL} height={GRID * PIXEL} viewBox={`0 0 ${GRID} ${GRID}`}>
        {PIXELS.map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width={1} height={1} fill={p.color} />
        ))}
      </svg>
    </div>
  );
}
