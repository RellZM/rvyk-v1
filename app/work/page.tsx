"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/utils/supabase/client";
import { Post } from "@/types/post";
import FlexCarousel, { FlexCarouselItem } from "@/components/work/FlexCarousel";

type BendPreset = "liquid" | "ribbon" | "vortex" | "arch";

const DEFAULT_WORK_ITEMS: FlexCarouselItem[] = [
  {
    src: "/work/ibl/ibl-hero.jpg",
    title: "ITS Basketball League",
    subtitle: "Frontend Developer · 2026",
    alt: "ITS Basketball League 2026",
    href: "https://ibl-its.id/",
    linkLabel: "Visit live site",
  },
  {
    src: "/work/schematics/schematics-hero.png",
    title: "Schematics 2026",
    subtitle: "Frontend Developer · 2026",
    alt: "Schematics 2026 Platform",
    href: "https://schematics-its.com/",
    linkLabel: "Visit live site",
    alignX: -0.85,
  },
  {
    src: "/work/ppl-donasi/ppl-donasi-home.png",
    title: "Donasi Anak Yatim",
    subtitle: "UI/UX Design · 2025",
    alt: "Donasi Anak Yatim UI/UX",
    href: "https://www.figma.com/design/Q2gcB2tYZGt1cGYp8v8Uxl/Donasi-Anak-Yatim?node-id=0-1&t=5CMJP9vB4UHg1XPF-1",
    linkLabel: "View on Figma",
  },
  {
    src: "/work/antasena/antasena-hero.jpg",
    title: "Antasena ITS",
    subtitle: "UI/UX Design · 2026",
    alt: "Antasena ITS Landing Page",
    href: "https://www.figma.com/design/mzUUUkD1PSQqv50609041Y/Antasena-Task?node-id=0-1&t=7VoYgcWC9OLVyftI-1",
    linkLabel: "View on Figma",
  },
  {
    src: "/work/hmmt/hmmt-desktop.png",
    title: "HMMT - Rotasi Arunika",
    subtitle: "Frontend Developer · 2026",
    alt: "HMMT Rotasi Arunika Website",
    alignX: -0.75,
  },
];

const PRESETS: BendPreset[] = ["liquid", "ribbon", "vortex", "arch"];

export default function WorkPage() {
  const [items, setItems] = useState<FlexCarouselItem[]>(DEFAULT_WORK_ITEMS);
  const [preset, setPreset] = useState<BendPreset>("liquid");
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

  useEffect(() => {
    async function fetchWorkProjects() {
      try {
        const { data, error } = await getSupabaseClient()
          .from("posts")
          .select("*")
          .eq("status", "published")
          .eq("target", "work")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const dbItems: FlexCarouselItem[] = [];

          (data as Post[]).forEach((p) => {
            const primaryImage =
              p.images && p.images.length > 0
                ? p.images[0]
                : p.cover_image;

            if (primaryImage) {
              dbItems.push({
                src: primaryImage,
                title: p.title,
                subtitle: `${p.role || p.category || "Project"} · ${
                  p.year || new Date(p.created_at).getFullYear().toString()
                }`,
                alt: p.title,
                href: p.link_url || undefined,
                linkLabel: p.link_label || "Visit live site",
              });
            }
          });

          if (dbItems.length > 0) {
            setItems([...dbItems, ...DEFAULT_WORK_ITEMS]);
          }
        }
      } catch (err) {
        console.error("Error fetching work projects:", err);
      }
    }

    fetchWorkProjects();
  }, []);

  return (
    <section className="relative flex flex-1 flex-col items-center justify-between overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-circuit opacity-[0.15]"
        aria-hidden="true"
      />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl px-4 pt-3 pb-2 sm:px-10 sm:pt-6 sm:pb-2">
        <span className="block font-mono text-[10px] tracking-widest text-foreground/45 uppercase whitespace-nowrap sm:text-xs">
          Portfolio / Selected Works
        </span>

        <div className="mt-1 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            work<span className="text-[#6A00FF]">.</span>
          </h1>

          {/* Preset Switcher Pills */}
          <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-foreground/10 bg-background/80 p-0.5 backdrop-blur-md shadow-xs sm:gap-1 sm:p-1">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPreset(p)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono capitalize transition-all duration-200 cursor-pointer sm:px-3 sm:py-1 sm:text-xs ${
                  preset === p
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* FlexCarousel Centerpiece */}
      <div className="relative z-10 flex-1 w-full min-h-[320px] sm:min-h-[360px] flex items-center justify-center">
        <FlexCarousel
          items={items}
          preset={preset}
          intro="rise"
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
