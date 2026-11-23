export const metadata = { title: "now" };

type NowEntry = {
  date: string;
  paragraphs: string[];
  rows: { label: string; body: string }[];
};

// Newest first. Add a new entry at the top; old ones stay as a log.
const ENTRIES: NowEntry[] = [
  {
    date: "November 22, 2026",
    paragraphs: [
      "I'm getting close to the end of my second semester, and most of my energy is going into growing my portfolio as a web developer, building more projects and polishing the ones I already have.",
      "On the side, I've been busy helping run a few events, like Ikarsid and Petrolida. Beyond that, I want to step outside web dev for a bit and explore new things I haven't tried yet.",
    ],
    rows: [
      { label: "Watching", body: "—" },
      { label: "Reading", body: "—" },
      { label: "Playing", body: "Paralives, Let's Build a Zoo, and LEGO Marvel Super Heroes." },
      {
        label: "Obsessed with",
        body: "Honestly, I don't know yet. I'm still figuring out what I want my future to look like.",
      },
    ],
  },
  {
    date: "July 8, 2026",
    paragraphs: [
      "I'm a second-year university student spending most of my time exploring web development and CTF. Lately I've been going deeper into both, building small projects on the web side while learning how to break things on the security side. It's a lot to juggle, but I genuinely enjoy the process of figuring things out.",
      "Alongside that, I'm preparing myself to apply for a research team. I've been turned away a few times before, and honestly it stung, but each attempt taught me something and left me a little more ready. So I'm taking my time, sharpening what I know, and giving the next chance my best shot.",
    ],
    rows: [
      { label: "Watching", body: "World Cup 2026 (Messi's last dance), and Petal of Reincarnation." },
      { label: "Reading", body: "Crime and Punishment by Fyodor Dostoyevsky." },
      { label: "Playing", body: "Paralives, Blasphemous, and Let's Play a Zoo." },
      {
        label: "Obsessed with",
        body: "Learning CTF and Pokémon VGC >.< (playing Pokémon Champions right now www.)",
      },
    ],
  },
];

export default function NowPage() {
  return (
    <section className="flex-1 overflow-y-auto bg-background px-6 py-6 sm:py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          now<span className="text-[#6A00FF]">.</span>
        </h1>
        <p className="mt-2 text-sm text-foreground/60 sm:text-base">
          What I&apos;m up to currently
        </p>

        {ENTRIES.map((entry) => (
          <div
            key={entry.date}
            className="mt-8 overflow-hidden rounded-xl border border-foreground/15 bg-foreground/[0.03]"
          >
            {/* dotted paper body */}
            <div
              className="relative py-6 pl-6 pr-5 text-[15px] leading-8 sm:py-9 sm:pl-14 sm:pr-8 sm:leading-9"
              style={{
                backgroundImage:
                  "radial-gradient(circle, var(--grid-line-soft) 1.2px, transparent 1.2px)",
                backgroundSize: "22px 22px",
                backgroundPosition: "center",
              }}
            >
              {/* header */}
              <div className="flex items-baseline justify-end">
                <span className="font-mono text-sm text-foreground/50">{entry.date}</span>
              </div>

              {/* intro paragraphs */}
              {entry.paragraphs.map((text, i) => (
                <p key={i} className={`text-foreground/90 ${i > 0 ? "mt-6 sm:mt-9" : ""}`}>
                  {text}
                </p>
              ))}

              {/* spacer line */}
              <div aria-hidden>&nbsp;</div>

              {/* status rows */}
              <dl>
                {entry.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col pb-3 sm:flex-row sm:items-baseline sm:gap-6 sm:pb-0"
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
        ))}
      </div>
    </section>
  );
}
