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
];

export default function AboutPage() {
  return (
    <section className="flex-1 overflow-y-auto bg-background px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col-reverse gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">
              About / RVYK
            </span>

            <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              about
              <span className="text-[#6A00FF]">.</span>
            </h1>

            <p className="mt-4 text-lg italic text-foreground/60">
              — stargazing toward the end of voyages
            </p>

            <div className="mt-8 max-w-xl space-y-5 text-justify text-[15px] leading-8 text-foreground/85">
              <p>
                Yo, I&apos;m Rvyk, just your average student obsessed with two things: building
                stuff for the web and hacking away at CTF challenges. During the day, I might be
                tinkering with frontend, figuring out how to make the UI smooth and enjoyable to
                use, but once night hits ... I could be deep in a forensics challenge or
                reverse-engineering a binary, losing track of time completely.
              </p>
              <p>
                I&apos;m all about the details, whether it&apos;s getting a pixel just right on
                the web, or spotting the tiny flaw everyone else missed in a CTF. Both feel like
                solving a puzzle, just different flavors.
              </p>
              <p>
                Currently leveling up my skills in both worlds, always hunting for new challenges
                to break (and fix) things.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-3">
            <div
              className="h-32 w-32 shrink-0 rounded-full bg-foreground/10 bg-cover bg-center ring-1 ring-foreground/15 sm:h-36 sm:w-36"
              style={{ backgroundImage: "url(/about/photo.png)" }}
              role="img"
              aria-label="Photo"
            />
            <span className="font-mono text-xs text-foreground/40">rvyk · 01</span>
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
              <div className="mt-1 text-lg text-foreground">Reykjavik · UTC+0</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs uppercase tracking-widest text-foreground/40">
                Languages
              </div>
              <div className="mt-1 text-lg text-foreground">EN · IS</div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 max-w-2xl pb-4">
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
                className="group flex items-center justify-between gap-4 border-b border-foreground/10 py-4 transition-colors duration-150 ease-out hover:bg-foreground/3"
              >
                <div className="font-mono text-xs uppercase tracking-widest text-foreground/40 sm:w-32">
                  {c.label}
                </div>
                <div className="flex-1 text-lg text-foreground">{c.value}</div>
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
