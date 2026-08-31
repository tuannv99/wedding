"use client";

import { useState } from "react";
import Image from "next/image";
import { wedding } from "@/lib/wedding";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { Lightbox } from "@/components/wedding/Lightbox";

/**
 * Mosaic bất đối xứng 3 cột — một ảnh lớn làm điểm nhấn, hai ảnh nhỏ xếp
 * chồng bên phải, hàng dưới ba ảnh nhỏ đều nhau. Dùng ở MỌI bề rộng màn hình
 * (kể cả mobile) để bố cục ảnh cưới trên điện thoại giống hệt trên desktop;
 * chỉ chiều cao hàng là co lại theo màn.
 *
 *   ┌───────┬───┐
 *   │       │ 2 │
 *   │   1   ├───┤
 *   │       │ 3 │
 *   ├───┬───┼───┤
 *   │ 4 │ 5 │ 6 │
 *   └───┴───┴───┘
 */
const MOSAIC_LAYOUT = [
  "col-start-1 col-span-2 row-start-1 row-span-2",
  "col-start-3 row-start-1",
  "col-start-3 row-start-2",
  "col-start-1 row-start-3",
  "col-start-2 row-start-3",
  "col-start-3 row-start-3",
];

const GALLERY_SIZES =
  "(max-width: 639px) 66vw, (max-width: 1023px) 55vw, 620px";

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="gallery"
      className="relative isolate w-full overflow-hidden bg-ivory px-6 py-28 md:px-5 md:py-40"
    >
      {/* Sprig mép trái — cỡ chuẩn hoá dùng chung toàn site: 36vh/0.26. */}
      <BotanicalAccent
        variant="sprig"
        opacity={0.26}
        depth={5}
        className="top-[6%] -left-[2vw] hidden h-[36vh] w-[20vh] lg:block"
      />

      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          label={wedding.copy.gallery.eyebrow}
          title={wedding.copy.gallery.title}
          rule={false}
          className="px-2"
        />

        <div className="mt-14 grid auto-rows-[clamp(104px,30vw,380px)] grid-cols-3 gap-2 sm:mt-16 sm:auto-rows-[clamp(180px,26vw,380px)] sm:gap-3">
          {wedding.gallery.map((image, index) => {
            return (
              <Reveal
                key={image.src}
                delay={(index % 3) * 0.08}
                y={18}
                duration={0.4}
                className={cn(MOSAIC_LAYOUT[index])}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  aria-label={"Mở ảnh lớn: " + image.alt}
                  /* Hiệu ứng "nhấc ảnh polaroid lên" khi hover: chỉ xảy ra lúc
                     hover (không phá layout masonry lúc nghỉ), tôn trọng
                     prefers-reduced-motion cho phần xoay/dịch chuyển. */
                  className="group relative block h-full w-full overflow-hidden bg-warm transition-all duration-500 ease-out hover:z-10 hover:shadow-[0_20px_45px_-15px_rgba(61,57,53,0.4)] motion-safe:hover:-translate-y-1 motion-safe:hover:rotate-[0.6deg]"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    loading="lazy"
                    sizes={GALLERY_SIZES}
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.035]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 transition-colors duration-700 group-hover:bg-ivory/10"
                  />
                </button>
              </Reveal>
            );
          })}
        </div>

        {/* Gallery thuộc về ảnh: botanical chỉ còn đúng một nét rất nhỏ khép lại. */}
        <Reveal delay={0.1} className="mt-14 flex justify-center">
          <Botanical variant="mark" className="h-4 w-11 text-sage/60" />
        </Reveal>
      </div>

      <Lightbox
        images={wedding.gallery}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />
    </section>
  );
}
