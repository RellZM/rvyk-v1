import React from "react";
import Lanyard from "@/components/lanyard/Lanyard";
import {
  siTypescript,
  siJavascript,
  siPython,
  siKotlin,
  siCplusplus,
  siReact,
  siNextdotjs,
  siTailwindcss,
  siSupabase,
  siGithub,
  siFigma,
  type SimpleIcon as SimpleIconType,
} from "simple-icons";

export const metadata = { title: "about" };

const CONTACTS = [
  {
    label: "Email",
    value: "afrelzhm@gmail.com",
    href: "mailto:afrelzhm@gmail.com",
  },
  {
    label: "Github",
    value: "@RellZM",
    href: "https://github.com/RellZM",
  },
  {
    label: "LinkedIn",
    value: "Afrel Zharif Muflih",
    href: "https://www.linkedin.com/in/afrel-zharif-muflih/",
  },
];

interface TechItem {
  name: string;
  desc: string;
  icon: SimpleIconType;
}

const LANGUAGES: TechItem[] = [
  {
    name: "TypeScript",
    desc: "rvyk, web apps",
    icon: siTypescript,
  },
  {
    name: "JavaScript",
    desc: "Frontend, scripting",
    icon: siJavascript,
  },
  {
    name: "Python",
    desc: "KKA, CTF & scripts",
    icon: siPython,
  },
  {
    name: "Kotlin",
    desc: "PPB, Android apps",
    icon: siKotlin,
  },
  {
    name: "C / C++",
    desc: "BinaryShield, systems",
    icon: siCplusplus,
  },
];

const FRAMEWORKS: TechItem[] = [
  {
    name: "React",
    desc: "Component UI",
    icon: siReact,
  },
  {
    name: "Next.js",
    desc: "App Router & SSR",
    icon: siNextdotjs,
  },
  {
    name: "Tailwind CSS",
    desc: "Utility styling",
    icon: siTailwindcss,
  },
  {
    name: "Supabase",
    desc: "Database & Backend",
    icon: siSupabase,
  },
  {
    name: "GitHub / Git",
    desc: "Version control",
    icon: siGithub,
  },
  {
    name: "Figma",
    desc: "UI/UX & prototypes",
    icon: siFigma,
  },
];

function IconSvg({ icon }: { icon: SimpleIconType }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className="h-6 w-6 sm:h-7 sm:w-7 fill-current transition-transform duration-200 ease-out group-hover:scale-115"
      aria-label={icon.title}>
      <path d={icon.path} />
    </svg>
  );
}

function TechBadge({ tech }: { tech: TechItem }) {
  return (
    <div
      title={tech.name}
      aria-label={tech.name}
      className="group flex min-h-12 w-full sm:h-16 sm:w-16 items-center rounded-xl border border-foreground/10 bg-foreground/[0.02] text-foreground/75 overflow-hidden transition-all duration-300 ease-out sm:hover:w-64 hover:border-[#6A00FF]/50 hover:bg-foreground/[0.05] hover:shadow-xs active:scale-95 cursor-pointer shrink-0">
      <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center text-foreground/75 transition-colors duration-200 group-hover:text-[#6A00FF]">
        <IconSvg icon={tech.icon} />
      </div>
      {/* Mobile has no hover: label always visible in a 2-col grid. sm+: icon tile that expands on hover. */}
      <div className="flex flex-col justify-center min-w-0 py-1 pr-3 overflow-hidden sm:whitespace-nowrap sm:py-0 sm:pr-4 sm:opacity-0 sm:transition-opacity sm:duration-150 sm:group-hover:opacity-100 sm:group-hover:delay-100">
        <span className="text-xs sm:text-[13px] font-bold tracking-tight text-foreground truncate">
          {tech.name}
        </span>
        <span className="text-[10px] leading-tight sm:text-[11px] font-mono text-foreground/60 mt-0.5 sm:truncate">
          {tech.desc}
        </span>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <section className="relative flex-1 overflow-y-auto bg-background px-6 py-6 sm:py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        {/* Mobile/tablet: in flow above the text. lg+: fills the section so the card swings freely (no box edge); only the card itself takes the mouse. */}
        <div className="relative z-10 -mx-6 h-[380px] sm:-mx-10 xl:pointer-events-none xl:absolute xl:inset-0 xl:mx-0 xl:h-auto">
          <Lanyard
            frontImage="/about/card-front.jpg"
            backImage="/about/card-back-v2.png"
            cardColor="#ffffff"
            anchor={0.92}
            size={0.4}
            strapLength={0.4}
            passThrough
          />
        </div>

        <div>
          <div className="min-w-0">
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              about
              <span className="text-[#6A00FF]">.</span>
            </h1>

            <p className="mt-4 text-lg italic text-foreground/60">
              — stargazing toward the end of voyages
            </p>

            <div className="mt-8 max-w-xl space-y-5 text-[15px] sm:text-justify leading-8 text-foreground/85">
              <p>
                Yo, I&apos;m Rel or Rvyk, just your average student obsessed
                with two things: building stuff for the web and hacking away at
                CTF challenges. During the day, I might be tinkering with
                frontend, figuring out how to make the UI smooth and enjoyable
                to use, but once night hits ... I could be deep in a forensics
                challenge or reverse-engineering a binary, losing track of time
                completely.
              </p>
              <p>
                I&apos;m all about the details, whether it&apos;s getting a
                pixel just right on the web, or spotting the tiny flaw everyone
                else missed in a CTF. Both feel like solving a puzzle, just
                different flavors.
              </p>
              <p>
                Currently leveling up my skills in both worlds, always hunting
                for new challenges to break (and fix) things.
              </p>
            </div>
          </div>

        </div>

        {/* Facts */}
        <div className="mt-16 max-w-2xl">
          <div className="flex items-baseline justify-between border-b border-foreground/15 pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
              Facts
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-foreground/40">
              At a glance
            </span>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 pt-6 sm:grid-cols-2">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-foreground/40">
                Based
              </div>
              <div className="mt-1 text-lg text-foreground">
                Reykjavik · UTC+0
              </div>
            </div>
            <div className="sm:text-right">
              <div className="font-mono text-xs uppercase tracking-widest text-foreground/40">
                Languages
              </div>
              <div className="mt-1 text-lg text-foreground">EN · IS</div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-16 max-w-2xl">
          <div className="flex items-baseline justify-between border-b border-foreground/15 pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
              Tech Stack
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-foreground/40">
              Languages & Tools
            </span>
          </div>

          <div className="pt-6 space-y-6">
            <div>
              <div className="mb-3 font-mono text-[11px] uppercase tracking-wider text-foreground/40">
                Languages
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                {LANGUAGES.map((tech) => (
                  <TechBadge key={tech.name} tech={tech} />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 font-mono text-[11px] uppercase tracking-wider text-foreground/40">
                Frameworks & Ecosystem
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                {FRAMEWORKS.map((tech) => (
                  <TechBadge key={tech.name} tech={tech} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-16 max-w-2xl pb-8">
          <div className="flex items-baseline justify-between border-b border-foreground/15 pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
              Contact
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-foreground/40">
              Get in touch
            </span>
          </div>

          <div>
            {CONTACTS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 border-b border-foreground/10 py-4 transition-colors duration-150 ease-out hover:bg-foreground/3">
                <div className="font-mono text-xs uppercase tracking-widest text-foreground/40 sm:w-32">
                  {c.label}
                </div>
                <div className="min-w-0 flex-1 break-words text-base text-foreground sm:text-lg">{c.value}</div>
                <span className="text-foreground/40 transition-colors duration-150 ease-out group-hover:text-foreground">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
