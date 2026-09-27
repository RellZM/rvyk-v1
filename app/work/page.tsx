"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Post } from "@/types/post";

type Project = {
  id?: string;
  title: string;
  year: string;
  role: string;
  description: string;
  link: { label: string; href: string } | null;
  images: string[];
};

const DEFAULT_PROJECTS: Project[] = [
  {
    title: "Donasi Anak Yatim - UI/UX",
    year: "2025",
    role: "UI/UX Design",
    description:
      "Final project for my Software Engineering (PPL) course - a simple UI/UX design for a donation app connecting donors with orphanages.",
    link: {
      label: "View on Figma",
      href: "https://www.figma.com/design/Q2gcB2tYZGt1cGYp8v8Uxl/Donasi-Anak-Yatim?node-id=0-1&t=5CMJP9vB4UHg1XPF-1",
    },
    images: ["/work/ppl-donasi/ppl-donasi-home.png", "/work/ppl-donasi/ppl-donasi-page.png"],
  },
  {
    title: "Schematics 2026",
    year: "2026",
    role: "Frontend Developer",
    description:
      "Competition registration platform for Schematics, the Informatics Engineering department's annual event - handles sign-ups for NLC and REEVA.",
    link: { label: "Visit live site", href: "https://schematics-its.com/" },
    images: [
      "/work/schematics/schematics-hero.png",
      "/work/schematics/schematics-menu.png",
      "/work/schematics/schematics-form.png",
    ],
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
    title: "Antasena ITS - Landing Page",
    year: "2026",
    role: "UI/UX Design",
    description:
      "A landing page concept I designed for the Antasena ITS Team recruitment task - Indonesia's first team turning clean energy into speed. (Didn't get in, but the design stays.)",
    link: {
      label: "View on Figma",
      href: "https://www.figma.com/design/mzUUUkD1PSQqv50609041Y/Antasena-Task?node-id=0-1&t=7VoYgcWC9OLVyftI-1",
    },
    images: ["/work/antasena/antasena-hero.png", "/work/antasena/antasena-achievement.png"],
  },
  {
    title: "HMMT - Rotasi Arunika",
    year: "2026",
    role: "Frontend Developer",
    description:
      "Profile website for Himpunan Mahasiswa Metalurgi (HMMT), covering the association's history, structure, events, and gallery.",
    link: null,
    images: ["/work/hmmt/hmmt-desktop.png", "/work/hmmt/hmmt-mobile.png"],
  },
];

export default function WorkPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);

  useEffect(() => {
    async function fetchWorkProjects() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("status", "published")
          .eq("target", "work")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const dbProjects: Project[] = (data as Post[]).map((p) => {
            const projectImages: string[] =
              p.images && p.images.length > 0
                ? p.images
                : p.cover_image
                ? [p.cover_image]
                : [];

            return {
              id: p.id,
              title: p.title,
              year: p.year || new Date(p.created_at).getFullYear().toString(),
              role: p.role || p.category || "Project",
              description: p.short_description || p.content || "",
              link: p.link_url
                ? {
                    label: p.link_label || "Visit live site",
                    href: p.link_url,
                  }
                : null,
              images: projectImages,
            };
          });

          // Combine with default projects and sort by year descending
          const combined = [...dbProjects, ...DEFAULT_PROJECTS].sort(
            (a, b) => Number(b.year) - Number(a.year)
          );
          setProjects(combined);
        }
      } catch (err) {
        console.error("Error fetching work projects:", err);
      }
    }

    fetchWorkProjects();
  }, []);

  return (
    <section className="flex-1 overflow-y-auto bg-background px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
          Work
        </h1>

        <div className="mt-8">
          {projects.map((p, i) => (
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
                  {p.year} - {p.role}
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
