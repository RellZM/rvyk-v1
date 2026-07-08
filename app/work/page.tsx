"use client";

import { useState } from "react";

type Project = {
  title: string;
  year: string;
  role: string;
  description: string;
  link: { label: string; href: string } | null;
  images: string[];
};

const PROJECTS: Project[] = [
  {
    title: "Donasi Anak Yatim — UI/UX",
    year: "2025",
    role: "UI/UX Design",
    description:
      "Final project for my Software Engineering (PPL) course — a simple UI/UX design for a donation app connecting donors with orphanages.",
    link: {
      label: "View on Figma",
      href: "https://www.figma.com/design/Q2gcB2tYZGt1cGYp8v8Uxl/Donasi-Anak-Yatim?node-id=0-1&t=5CMJP9vB4UHg1XPF-1",
    },
    images: ["/work/ppl-donasi/ppl-donasi-home.png", "/work/ppl-donasi/ppl-donasi-page.png"],
  },
  {
    title: "Antasena ITS — Landing Page",
    year: "2026",
    role: "UI/UX Design",
    description:
      "A landing page concept I designed for the Antasena ITS Team recruitment task — Indonesia's first team turning clean energy into speed. (Didn't get in, but the design stays.)",
    link: {
      label: "View on Figma",
      href: "https://www.figma.com/design/mzUUUkD1PSQqv50609041Y/Antasena-Task?node-id=0-1&t=7VoYgcWC9OLVyftI-1",
    },
    images: ["/work/antasena/antasena-hero.png", "/work/antasena/antasena-achievement.png"],
  },
  {
    title: "Personal Portfolio",
    year: "2025",
    role: "Frontend Developer",
    description: "My own portfolio site, built to showcase what I make.",
    link: { label: "Visit live site", href: "https://portofolio-afrel.vercel.app/" },
    images: [],
  },
  {
    title: "HMMT — Rotasi Arunika",
    year: "2026",
    role: "Frontend Developer",
    description:
      "Profile website for Himpunan Mahasiswa Metalurgi (HMMT), covering the association's history, structure, events, and gallery.",
    link: null,
    images: ["/work/hmmt/hmmt-desktop.png", "/work/hmmt/hmmt-mobile.png"],
  },
  {
    title: "Schematics 2026",
    year: "2026",
    role: "Frontend Developer",
    description:
      "Competition registration platform for Schematics, the Informatics Engineering department's annual event — handles sign-ups for NLC and REEVA.",
    link: null,
    images: [
      "/work/schematics/schematics-hero.png",
      "/work/schematics/schematics-menu.png",
      "/work/schematics/schematics-form.png",
    ],
  },
];

export default function WorkPage() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="flex-1 overflow-y-auto bg-background px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
          Work
        </h1>

        <div className="mt-8">
          {PROJECTS.map((p, i) => (
            <div
              key={p.title}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="border-b border-foreground/10 py-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2
                  className={`text-xl font-bold transition-colors duration-150 ease-out sm:text-2xl ${
                    hovered === i ? "text-foreground" : "text-foreground/70"
                  }`}
                >
                  {p.title}
                </h2>
                <span className="font-mono text-xs text-foreground/40">
                  {p.year} — {p.role}
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm text-foreground/60">{p.description}</p>

              {p.link && (
                <a
                  href={p.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-[#6A00FF] underline underline-offset-2 transition-opacity duration-150 ease-out hover:opacity-70"
                >
                  {p.link.label} ↗
                </a>
              )}

              {p.images.length > 0 && (
                <div
                  className="grid overflow-hidden transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: hovered === i ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                      {p.images.map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt={p.title}
                          className="h-40 w-auto shrink-0 rounded-lg object-cover ring-1 ring-foreground/10 sm:h-56"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
