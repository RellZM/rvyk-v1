"use client";

import { useEffect, useState } from "react";
import { BLOCKS, VB_W, VB_H, type Block } from "@/components/logoBlocks";

const TRANSLATE_MS = 550; // time to travel into position, still stretched
const SCALE_MS = 240; // short, decisive snap back to normal size — starts only after landing
const FIRM_EASE = "cubic-bezier(0.33, 1, 0.68, 1)"; // decisive deceleration, no bounce/overshoot
const STRETCH_ALONG = 2.4; // elongation along travel direction only — the cross axis stays 1

const CENTER_X = VB_W / 2;
const CENTER_Y = VB_H / 2;

// Build order: R's gray stem first, then the rest of R, then V's gray
// stems, then the rest of V. Each stage is a delay window.
const STAGE_WINDOW_MS = 500;
const STAGE_GAP_MS = 700;
const STAGE_START_MS = [0, STAGE_GAP_MS, STAGE_GAP_MS * 2, STAGE_GAP_MS * 3];

const HOLD_AFTER_BUILD_MS = 500; // wait this long after the last block lands before exiting
const EXIT_MS = 700; // fade-out

// Deterministic pseudo-random so SSR and client hydration match.
function rand(seed: number): number {
  const x = Math.sin(seed * 99.13 + 17.31) * 43758.5453;
  return x - Math.floor(x);
}

// Direction is derived from each block's position relative to the logo's
// center, so blocks travel toward the center along the side they already
// sit on — this keeps flight paths from crossing. Gray stems always rise
// from the bottom regardless of position.
function travelFor(block: Block): { axis: "x" | "y"; tx: string; ty: string } {
  if (block.gray) return { axis: "y", tx: "0", ty: "110vh" };

  const cx = block.x + block.w / 2;
  const cy = block.y + block.h / 2;
  const dx = cx - CENTER_X;
  const dy = cy - CENTER_Y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return { axis: "x", tx: dx > 0 ? "110vw" : "-110vw", ty: "0" };
  }
  return { axis: "y", tx: "0", ty: dy > 0 ? "110vh" : "-110vh" };
}

// Blocks fly in fully elongated (constant stretch, no scale change during
// the flight) and only snap back to normal size once they've landed —
// `translate` and `scale` are standalone CSS properties with their own
// delay, so the two motions are sequential and distinct rather than
// blended into a single wobble.
function initialScale(axis: "x" | "y"): string {
  return axis === "x" ? `${STRETCH_ALONG} 1` : `1 ${STRETCH_ALONG}`;
}

function stageFor(block: Block): number {
  if (block.isR) return block.gray ? 0 : 1;
  return block.gray ? 2 : 3;
}

function delayFor(block: Block, i: number): number {
  return STAGE_START_MS[stageFor(block)] + Math.floor(rand(i) * STAGE_WINDOW_MS);
}

// When the last block finishes its flight + snap, hold for a beat, then exit.
const BUILD_DONE_MS = Math.max(...BLOCKS.map((b, i) => delayFor(b, i))) + TRANSLATE_MS + SCALE_MS;
const VISIBLE_MS = BUILD_DONE_MS + HOLD_AFTER_BUILD_MS;

export default function LoadingScreen() {
  const [built, setBuilt] = useState(false);
  const [phase, setPhase] = useState<"loading" | "exiting" | "done">("loading");

  useEffect(() => {
    // Already played this session: the <head> script set data-intro-played, and CSS keeps the overlay hidden.
    try {
      if (sessionStorage.getItem("rvyk_intro_played")) return;
      sessionStorage.setItem("rvyk_intro_played", "true");
    } catch {}

    // Start block animation instantly
    const animTimer = setTimeout(() => {
      setBuilt(true);
    }, 20);

    const exitTimer = setTimeout(() => {
      setPhase("exiting");
    }, VISIBLE_MS);

    const doneTimer = setTimeout(() => {
      setPhase("done");
    }, VISIBLE_MS + EXIT_MS);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  const exiting = phase === "exiting";

  return (
    <div
      className="intro-overlay fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-white px-6 ease-in-out"
      style={{
        transitionProperty: "opacity",
        transitionDuration: `${EXIT_MS}ms`,
        opacity: exiting ? 0 : 1,
      }}
    >
      <div
        className="relative"
        style={{ width: "min(70vw, 260px)", aspectRatio: `${VB_W} / ${VB_H}` }}
      >
        {BLOCKS.map((b, i) => {
          const { axis, tx, ty } = travelFor(b);
          const delay = delayFor(b, i);
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${(b.x / VB_W) * 100}%`,
                top: `${(b.y / VB_H) * 100}%`,
                width: `${(b.w / VB_W) * 100}%`,
                height: `${(b.h / VB_H) * 100}%`,
                backgroundColor: b.color,
                translate: built ? "0 0" : `${tx} ${ty}`,
                scale: built ? "1 1" : initialScale(axis),
                transitionProperty: "translate, scale",
                transitionDuration: `${TRANSLATE_MS}ms, ${SCALE_MS}ms`,
                transitionTimingFunction: `${FIRM_EASE}, ${FIRM_EASE}`,
                transitionDelay: `${delay}ms, ${delay + TRANSLATE_MS}ms`,
              } as React.CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}
