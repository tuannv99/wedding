"use client";

import { useState } from "react";
import Image from "next/image";
import { wedding } from "@/lib/wedding";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Lightbox } from "@/components/wedding/Lightbox";

/**
 * Layout masonry bất đối xứng (cố tình không đều nhau).
 * Mobile: 2 cột · Desktop: 6 cột, dùng row-span để tạo nhịp editorial.
 */
const LAYOUT = [
  { mobile: "col-span-2 aspect-[4/5]", desktop: "sm:col-span-4 sm:row-span-2" },
  { mobile: "col-span-1 aspect-square", desktop: "sm:col-span-2 sm:row-span-1" },
  { mobile: "col-span-1 aspect-square", desktop: "sm:col-span-2 sm:row-span-1" },
  { mobile: "col-span-2 aspect-[3/4]", desktop: "sm:col-span-3 sm:row-span-2" },
  { mobile: "col-span-2 aspect-[3/2]", desktop: "sm:col-span-3 sm:row-span-2" },
  { mobile: "col-span-2 aspect-[2/1]", desktop: "sm:col-span-6 sm:row-span-1" },
];

const SIZES = [
  "(max-width: 640px) 100vw, 60vw",
  "(max-width: 640px) 50vw, 30vw",
  "(max-width: 640px) 50vw, 30vw",
  "(max-width: 640px) 100vw, 45vw",
  "(max-width: 640px) 100vw, 45vw",
  "100vw",
];

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="gallery"
      className="w-full bg-ivory px-4 py-28 sm:px-6 md:px-5 md:py-40"
    >
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          label={wedding.copy.gallery.eyebrow}
          title={wedding.copy.gallery.title}
          className="px-2"
        />

        <div className="mt-16 grid grid-cols-2 gap-3 sm:mt-20 sm:auto-rows-[clamp(8rem,14vw,14rem)] sm:grid-cols-6 sm:gap-4">
          {wedding.gallery.map((image, index) => {
            const layout = LAYOUT[index % LAYOUT.length];

            return (
              <Reveal
                key={image.src}
                delay={(index % 3) * 0.08}
                y={18}
                duration={0.9}
                className={cn(layout.mobile, layout.desktop, "sm:aspect-auto")}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  aria-label={"Mở ảnh lớn: " + image.alt}
                  className="group relative block h-full w-full overflow-hidden bg-warm"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    loading="lazy"
                    sizes={SIZES[index % SIZES.length]}
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

        <Reveal delay={0.1} className="mt-12 flex justify-center">
          <p className="wd-eyebrow text-center">
            {wedding.copy.gallery.hint}
          </p>
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
