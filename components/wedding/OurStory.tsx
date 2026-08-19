import Image from "next/image";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

export function OurStory() {
  const { story } = wedding.images;

  return (
    <section
      id="our-story"
      className="w-full bg-ivory px-6 py-28 md:px-10 md:py-40"
    >
      {/* 2 cột lệch tỉ lệ (text hẹp hơn ảnh) cho cảm giác editorial.
          Dùng 2 cột thay vì grid 12 cột: gap chỉ tính 1 lần nên không bao giờ tràn ngang. */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        {/* Text */}
        <div className="flex min-w-0 flex-col lg:pr-4">
          <SectionHeading label="Chapter one" title="Our Story" align="left" />

          <div className="mt-12 flex flex-col gap-8">
            {wedding.story.map((paragraph, index) => {
              // Câu chốt ("And here we are...") dùng style quote italic
              const isClosingLine = index === wedding.story.length - 1;

              return (
                <Reveal key={paragraph} delay={0.12 + index * 0.12}>
                  <p
                    className={cn(
                      "whitespace-pre-line",
                      isClosingLine ? "wd-quote" : "wd-body-serif",
                    )}
                  >
                    {paragraph}
                  </p>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.5} className="mt-12">
            <p className="wd-eyebrow">
              {wedding.groom.name} &nbsp;·&nbsp; {wedding.bride.name}
            </p>
          </Reveal>
        </div>

        {/* Ảnh */}
        <Reveal delay={0.2} className="mx-auto w-full max-w-md min-w-0 lg:max-w-none">
          <figure className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-warm">
              <Image
                src={story.src}
                alt={story.alt}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <figcaption className="wd-eyebrow mt-5 text-right">
              Est. {wedding.date.year}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
