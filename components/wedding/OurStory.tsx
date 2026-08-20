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
      className="w-full bg-ivory px-6 py-28 md:px-5 md:py-40"
    >
      {/* 2 cột lệch tỉ lệ (text hẹp hơn ảnh) cho cảm giác editorial.
          Dùng 2 cột thay vì grid 12 cột: gap chỉ tính 1 lần nên không bao giờ tràn ngang. */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        {/* Text */}
        <div className="flex min-w-0 flex-col lg:pr-4">
          <SectionHeading
            label={wedding.copy.story.eyebrow}
            title={wedding.copy.story.title}
            align="left"
          />

          {/* Timeline nhỏ cho các mốc trong câu chuyện — cùng ngôn ngữ thị giác
              với "Ngày vui" phía dưới (số thứ tự + đường kẻ + điểm mốc),
              chỉ đổi điểm mốc thành hình tim cho đúng tinh thần "our story". */}
          <div className="mt-12 flex flex-col">
            {wedding.story.map((paragraph, index) => {
              const isLast = index === wedding.story.length - 1;

              return (
                <Reveal key={paragraph} delay={0.12 + index * 0.12}>
                  <div className="relative grid grid-cols-[1.75rem_1px_1fr] items-stretch gap-x-5">
                    <span className="wd-mono pt-1 text-right text-taupe">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative w-px bg-taupe/25",
                        isLast && "h-6",
                      )}
                    >
                      <span className="absolute -top-1 -left-[7px] text-[13px] leading-none text-champagne">
                        ♡
                      </span>
                    </span>

                    <p
                      className={cn(
                        "whitespace-pre-line",
                        isLast ? "wd-quote" : "wd-body-serif",
                        isLast ? "pb-0" : "pb-10",
                      )}
                    >
                      {paragraph}
                    </p>
                  </div>
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
              {wedding.copy.story.caption}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
