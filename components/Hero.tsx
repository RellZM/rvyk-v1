import Mascot from "@/components/Mascot";

export default function Hero() {
  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-circuit opacity-[0.15]" aria-hidden />

      <div className="relative z-10 flex flex-1 flex-col items-start justify-start gap-8 pt-[144px] pb-6 px-6 sm:px-10 sm:justify-center sm:pt-10 sm:gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:pt-0">
        <h1 className="text-[clamp(3.35rem,17.5vw,6rem)] sm:text-[clamp(4rem,11.5vw,7.5rem)] lg:text-[clamp(4.5rem,9vw,9.5rem)] font-extrabold leading-[1.06] sm:leading-[0.98] tracking-tight">
          <span className="block whitespace-nowrap text-[#6A00FF]">Make Your</span>
          <span className="relative mt-2 sm:mt-2.5 inline-block">
            <span
              className="absolute inset-0 -z-10 rounded-sm bg-[#631DC4]"
              style={{ transform: "rotate(-3.5deg)" }}
              aria-hidden
            />
            <span className="relative px-2.5 py-0.5 sm:px-3 sm:py-1 text-white">Dream</span>
          </span>
          <span className="text-white">,</span>
          <span className="block pt-3 sm:pt-4 text-[clamp(1.75rem,7.8vw,2.75rem)] sm:text-[clamp(1.85rem,5.5vw,3rem)] lg:text-[clamp(2rem,4vw,3.5rem)] text-[#6A00FF]">
            Out Of{" "}
            <span className="relative inline-block">
              Nothing.
              <span
                className="absolute left-0 right-0 top-[52%] h-[2.5px] sm:h-[3px] -translate-y-1/2 bg-white"
                aria-hidden
              />
            </span>
          </span>
        </h1>

        <div className="shrink-0 self-center lg:self-end">
          <Mascot />
        </div>
      </div>
    </section>
  );
}
