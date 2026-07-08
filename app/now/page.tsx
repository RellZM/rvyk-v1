const ROWS = [
  {
    label: "Watching",
    body: "World Cup 2026 (Messi's last dance), and Petal of Reincarnation.",
  },
  {
    label: "Reading",
    body: "Crime and Punishment by Fyodor Dostoyevsky.",
  },
  {
    label: "Playing",
    body: "Paralives, Blasphemous, and Let's Play a Zoo.",
  },
  {
    label: "Obsessed with",
    body: "Learning CTF and Pokémon VGC >.< (playing Pokémon Champions right now www.)",
  },
];

export default function NowPage() {
  return (
    <section className="flex-1 overflow-y-auto bg-background px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
          Now
        </h1>
        <p className="mt-2 text-sm text-foreground/60 sm:text-base">
          What I&apos;m up to currently
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-foreground/15 bg-foreground/[0.03]">
          {/* dotted paper body */}
          <div
            className="relative py-9 pl-12 pr-6 text-[15px] leading-9 sm:pl-14 sm:pr-8"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--grid-line-soft) 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
              backgroundPosition: "center",
            }}
          >
            {/* header */}
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">
                Now
              </span>
              <span className="font-mono text-sm text-foreground/50">July 8, 2026</span>
            </div>

            {/* intro paragraph */}
            <p className="text-foreground/90">
              I&apos;m a second-year university student spending most of my time exploring web
              development and CTF. Lately I&apos;ve been going deeper into both, building small
              projects on the web side while learning how to break things on the security side. It&apos;s
              a lot to juggle, but I genuinely enjoy the process of figuring things out.
              <br />
              <br />
              Alongside that, I&apos;m preparing myself to apply for a research team. I&apos;ve been
              turned away a few times before, and honestly it stung, but each attempt taught me
              something and left me a little more ready. So I&apos;m taking my time, sharpening what
              I know, and giving the next chance my best shot.
            </p>

            {/* spacer line */}
            <div aria-hidden>&nbsp;</div>

            {/* status rows */}
            <dl>
              {ROWS.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <dt className="shrink-0 font-mono text-xs uppercase tracking-widest text-foreground/50 sm:w-36">
                    {row.label}
                  </dt>
                  <dd className="text-foreground/90">{row.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
