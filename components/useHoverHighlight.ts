"use client";

import { useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";

type Highlight = { left: number; top: number; width: number; height: number; visible: boolean };

/** Grey pill that slides under whichever link in a list is hovered (Navbar, Footer). */
export default function useHoverHighlight() {
  const listRef = useRef<HTMLUListElement>(null);
  const [h, setH] = useState<Highlight>({ left: 0, top: 0, width: 0, height: 0, visible: false });

  function onEnter(e: MouseEvent<HTMLElement>) {
    const list = listRef.current;
    if (!list) return;
    const target = e.currentTarget.getBoundingClientRect();
    const box = list.getBoundingClientRect();
    setH({
      left: target.left - box.left,
      top: target.top - box.top,
      width: target.width,
      height: target.height,
      visible: true,
    });
  }

  function onLeave() {
    setH((prev) => ({ ...prev, visible: false }));
  }

  const style: CSSProperties = {
    left: h.left,
    top: h.top,
    width: h.width,
    height: h.height,
    opacity: h.visible ? 1 : 0,
  };

  return { listRef, style, onEnter, onLeave };
}
