import WorkClient from "@/components/work/WorkClient";
import { getSupabaseClient } from "@/utils/supabase/client";
import { Post } from "@/types/post";
import { FlexCarouselItem } from "@/components/work/FlexCarousel";

export const revalidate = 60;

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

async function getWorkItems(): Promise<FlexCarouselItem[]> {
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
          p.images && p.images.length > 0 ? p.images[0] : p.cover_image;

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
        return [...dbItems, ...DEFAULT_WORK_ITEMS];
      }
    }
  } catch (err) {
    console.error("Error fetching work projects on server:", err);
  }

  return DEFAULT_WORK_ITEMS;
}

export default async function WorkPage() {
  const items = await getWorkItems();

  return (
    <>
      {/* SSR Image Preload directives so browser loads hero assets immediately */}
      {items.slice(0, 4).map((item) => (
        <link key={item.src} rel="preload" as="image" href={item.src} />
      ))}
      <WorkClient initialItems={items} />
    </>
  );
}
