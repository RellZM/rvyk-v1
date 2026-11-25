import WorkClient from "@/components/work/WorkClient";
import { FlexCarouselItem } from "@/components/work/FlexCarousel";

export const metadata = { title: "work" };

const DEFAULT_WORK_ITEMS: FlexCarouselItem[] = [
  {
    src: "/work/petrolida/petrolida-card-v2.webp",
    title: "Petrolida 2027",
    subtitle: "Frontend Developer · 2026",
    alt: "Petrolida 2027 Website",
    description:
      "I built pages and integrated the API for Petrolida, a competition organized by SPE ITS.",
    href: "https://petrolida.com/",
    linkLabel: "Visit live site",
  },
  {
    src: "/work/ibl/ibl-hero.jpg",
    title: "ITS Basketball League",
    subtitle: "Frontend Developer · 2026",
    alt: "ITS Basketball League 2026",
    description:
      "Event website for ITS Basketball League 2026. I built a real-time live score dashboard and interactive player galleries with Next.js and Tailwind CSS.",
    href: "https://ibl-its.id/",
    linkLabel: "Visit live site",
  },
  {
    src: "/work/schematics/schematics-hero.webp",
    title: "Schematics 2026",
    subtitle: "Frontend Developer · 2026",
    alt: "Schematics 2026 Platform",
    description:
      "Web platform for Schematics 2026 by ITS Informatics. I turned Figma mockups into responsive Next.js and Tailwind CSS pages and helped build a shared component library with the designers.",
    href: "https://schematics-its.com/",
    linkLabel: "Visit live site",
    alignX: -0.85,
  },
  {
    src: "/work/ppl-donasi/ppl-donasi-home.webp",
    title: "Donasi Anak Yatim",
    subtitle: "UI/UX Design · 2025",
    alt: "Donasi Anak Yatim UI/UX",
    description:
      "UI/UX design for a donation platform for orphans, covering the home page and the donation flow.",
    href: "https://www.figma.com/design/Q2gcB2tYZGt1cGYp8v8Uxl/Donasi-Anak-Yatim?node-id=0-1&t=5CMJP9vB4UHg1XPF-1",
    linkLabel: "View on Figma",
  },
  {
    src: "/work/antasena/antasena-hero.jpg",
    title: "Antasena ITS",
    subtitle: "UI/UX Design · 2026",
    alt: "Antasena ITS Landing Page",
    description:
      "Landing page design for Antasena ITS, made as a design task.",
    href: "https://www.figma.com/design/mzUUUkD1PSQqv50609041Y/Antasena-Task?node-id=0-1&t=7VoYgcWC9OLVyftI-1",
    linkLabel: "View on Figma",
  },
];

export default function WorkPage() {
  return (
    <>
      {/* SSR Image Preload directives so browser loads hero assets immediately */}
      {DEFAULT_WORK_ITEMS.slice(0, 4).map((item) => (
        <link key={item.src} rel="preload" as="image" href={item.src} />
      ))}
      <WorkClient items={DEFAULT_WORK_ITEMS} />
    </>
  );
}
