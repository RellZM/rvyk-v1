"use client";

import { useState, useEffect } from "react";
import FlexCarousel, { FlexCarouselItem } from "@/components/work/FlexCarousel";


export default function WorkClient({
  initialItems,
}: {
  initialItems: FlexCarouselItem[];
}) {
  const [items] = useState<FlexCarouselItem[]>(initialItems);
  const [cardHeight, setCardHeight] = useState(0.5);

  useEffect(() => {
    function updateDimensions() {
      if (window.innerWidth < 640) {
        setCardHeight(0.46);
      } else if (window.innerWidth < 1024) {
        setCardHeight(0.50);
      } else {
        setCardHeight(0.54);
      }
    }

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <section className="relative flex flex-1 flex-col items-center justify-between overflow-hidden bg-background">
      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl px-4 pt-4 pb-2 sm:px-10 sm:pt-4 sm:pb-0">
        <h1 className="text-6xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl animate-[work-reveal_500ms_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none">
          work<span className="inline-block text-[#6A00FF] animate-[dot-pop_400ms_cubic-bezier(0.34,1.56,0.64,1)_220ms_both] motion-reduce:animate-none">.</span>
        </h1>
      </header>

      {/* FlexCarousel Centerpiece */}
      <div className="relative z-10 flex-1 w-full min-h-[320px] sm:min-h-[360px] flex items-center justify-center">
        <FlexCarousel
          items={items}
          preset="liquid"
          intro="none"
          cardHeight={cardHeight}
          radius={14}
          fit="landscape"
          squeeze={0.2}
          focusOnClick={true}
          captions={true}
          captureWheel={true}
          className="w-full h-full"
        />
      </div>

      {/* Subtle bottom indicator */}
      <footer className="relative z-10 pb-2 text-center sm:pb-3">
        <p className="font-mono text-[10px] tracking-wider text-foreground/30 uppercase sm:text-[11px]">
          <span className="sm:hidden">swipe to explore · tap to focus</span>
          <span className="hidden sm:inline">drag to scroll · click to focus</span>
        </p>
      </footer>
    </section>
  );
}

