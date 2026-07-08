import Mascot from "@/components/Mascot";

export default function Hero() {
  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-circuit opacity-[0.15]" aria-hidden />

      <div className="relative z-10 flex flex-1 flex-col items-start justify-center gap-6 px-6 sm:px-10 lg:flex-row lg:items-center lg:justify-start lg:gap-84">
        <h1 className="text-[clamp(4rem,11vw,10rem)] font-extrabold leading-[0.95] tracking-tight">
          <span className="block text-[#6A00FF]">Make Your</span>
          <span className="relative mt-2 inline-block">
            <span
              className="absolute inset-0 -z-10 rounded-sm bg-[#631DC4]"
              style={{ transform: "rotate(-3.5deg)" }}
              aria-hidden
            />
            <span className="relative px-3 py-1 text-white">Dream</span>
          </span>
          <span className="text-white">,</span>
          <span className="block pt-4 text-[clamp(2rem,4.5vw,3.5rem)] text-[#6A00FF]">
            Out Of{" "}
            <span className="relative inline-block">
              Nothing.
              <span
                className="absolute left-0 right-0 top-[52%] h-[3px] -translate-y-1/2 bg-white"
                aria-hidden
              />
            </span>
          </span>
        </h1>

        <div className="shrink-0 scale-75 lg:scale-100">
          <Mascot />
        </div>
      </div>
    </section>
  );
}
