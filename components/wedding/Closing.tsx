import Image from "next/image";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";

export function Closing() {
  const { closing } = wedding.images;

  return (
    <footer className="relative flex min-h-[85svh] w-full items-center justify-center overflow-hidden px-6 py-28">
      <div className="absolute inset-0 -z-10">
        <Image
          src={closing.src}
          alt={closing.alt}
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-ivory/55" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-ivory/40 via-ivory/25 to-ivory/70"
        />
      </div>

      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <Reveal>
          <p className="label text-ink/70">With love</p>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="font-display mt-10 text-[clamp(2.5rem,12vw,5.5rem)] leading-[0.95] tracking-[0.08em] text-ink uppercase">
            {wedding.groom.short}
            <span className="mx-3 text-champagne italic lowercase">&amp;</span>
            {wedding.bride.short}
          </p>
        </Reveal>

        <Reveal delay={0.24} className="mt-10 flex flex-col items-center gap-8">
          <span aria-hidden="true" className="h-px w-16 bg-ink/25" />
          <p className="label text-ink/70">{wedding.date.display}</p>
        </Reveal>

        <Reveal delay={0.36}>
          <p className="font-display mt-14 text-[clamp(1.25rem,4.5vw,1.75rem)] leading-[1.8] whitespace-pre-line text-ink/85">
            {"Thank you for being\npart of our story."}
          </p>
        </Reveal>

        <Reveal delay={0.48}>
          <p aria-hidden="true" className="mt-10 text-2xl text-champagne">
            ♡
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
