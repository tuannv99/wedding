import Image from "next/image";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/** Gạch ngang — ♡ — gạch ngang, dùng dưới heading và giữa các mốc. */
function HeartRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center justify-center gap-4", className)}
    >
      <span className="h-px w-14 bg-champagne/60 sm:w-20" />
      <span className="text-[11px] leading-none text-champagne">♡</span>
      <span className="h-px w-14 bg-champagne/60 sm:w-20" />
    </div>
  );
}

export function OurStory() {
  return (
    <section id="our-story" className="w-full bg-ivory px-5 py-24 sm:px-6 md:py-32">
      <div className="mx-auto w-full max-w-4xl">
        <Reveal className="flex flex-col items-center">
          <h2 className="wd-h1 text-center tracking-[0.16em] uppercase">
            {wedding.copy.story.title}
          </h2>
          <HeartRule className="mt-6" />
        </Reveal>

        <div className="mt-14 flex flex-col md:mt-16">
          {wedding.story.map((step, index) => {
            // Mốc chẵn (02) đảo ảnh sang trái để bố cục so le
            const photoFirst = index % 2 === 1;

            return (
              <div key={step.image.src}>
                {index > 0 ? <HeartRule className="my-10 md:my-14" /> : null}

                <Reveal delay={0.1} y={20}>
                  <div className="grid grid-cols-[1fr_1.2fr] items-center gap-5 sm:gap-8 md:gap-12">
                    {/* Số thứ tự + đường kẻ + chữ.
                        Ở desktop kéo khối chữ về sát ảnh cho cặp trái/phải cân nhau. */}
                    <div
                      className={cn(
                        "min-w-0 md:max-w-[360px]",
                        photoFirst
                          ? "order-2 md:justify-self-start"
                          : "md:justify-self-end",
                      )}
                    >
                      <span className="font-display block text-[clamp(1.5rem,6.5vw,2.25rem)] leading-none tracking-[0.14em] text-champagne">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="mt-4 grid grid-cols-[1px_1fr] gap-x-4 sm:gap-x-5">
                        <span
                          aria-hidden="true"
                          className="relative w-px bg-champagne/45"
                        >
                          <span className="absolute top-2 -left-[2.5px] h-1.5 w-1.5 rounded-full bg-champagne" />
                        </span>

                        <p className="wd-body-serif text-[clamp(1.3rem,5.6vw,1.75rem)] leading-[1.55] whitespace-pre-line">
                          {step.text}
                          {step.emphasis ? (
                            <>
                              {"\n"}
                              <span className="wd-quote text-[0.92em]">
                                {step.emphasis}
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    {/* Ảnh: khung viền mảnh, bo góc.
                        Giới hạn bề rộng ở desktop để ảnh không lấn hết section. */}
                    <div
                      className={cn(
                        "min-w-0 md:w-full md:max-w-[360px]",
                        photoFirst ? "order-1 md:mr-auto" : "md:ml-auto",
                      )}
                    >
                      <div className="rounded-xl border border-champagne/45 bg-warm p-1.5">
                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-ivory">
                          <Image
                            src={step.image.src}
                            alt={step.image.alt}
                            fill
                            loading="lazy"
                            sizes="(max-width: 640px) 55vw, (max-width: 768px) 50vw, 420px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>

        {/* Chữ ký: — VĂN TUẤN · MAI HOA — */}
        <Reveal
          delay={0.15}
          className="mt-14 flex items-center justify-center gap-5 md:mt-16"
        >
          <span aria-hidden="true" className="h-px w-10 bg-champagne/60 sm:w-16" />
          <p className="wd-eyebrow text-champagne">
            {wedding.groom.name} · {wedding.bride.name}
          </p>
          <span aria-hidden="true" className="h-px w-10 bg-champagne/60 sm:w-16" />
        </Reveal>
      </div>
    </section>
  );
}
