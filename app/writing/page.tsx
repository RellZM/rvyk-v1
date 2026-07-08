import PolarBear from "@/components/PolarBear";

export default function WritingPage() {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background px-6">
      <h1 className="pointer-events-none select-none text-center text-[clamp(2.5rem,10vw,7rem)] font-extrabold uppercase tracking-tight text-foreground">
        Coming Soon
      </h1>
      <p className="pointer-events-none mt-3 select-none text-center text-sm text-foreground/60 sm:text-base">
        A few hobby projects are still brewing behind the scenes — check back soon.
      </p>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <PolarBear />
      </div>
    </section>
  );
}
