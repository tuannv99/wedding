"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { Lightbox } from "@/components/wedding/Lightbox";
import type { AlbumChapter } from "@/lib/wedding";
import { cn } from "@/lib/utils";

/**
 * Độ lệch dọc của 3 cột trong mỗi chapter, theo đúng thứ tự cột trái → phải.
 *
 * Đây là điểm nhấn chính của layout nên thứ tự lệch đổi giữa các chapter —
 * cùng một nhịp lặp lại ba lần sẽ thành lưới đều trá hình.
 *
 * Cách áp dụng là `translateY` chứ không phải `padding-top`: translate không
 * tính vào layout nên cả ba cột vẫn nằm trên cùng một lưới (ảnh không bị đẩy
 * lệch hàng, gap giữ nguyên), chỉ thị giác là lệch. Đổi lại phải bù
 * `padding-bottom` bằng độ lệch lớn nhất, nếu không cột lệch sâu nhất sẽ
 * thò xuống đè vào divider phía dưới.
 */
const COLUMN_OFFSETS: Record<string, [string, string, string]> = {
  santori: ["0px", "64px", "26px"],
  studio: ["64px", "0px", "104px"],
  // Áo dài chỉ có đúng một hàng ảnh, nên nhịp lệch phải nhẹ hơn hai chapter
  // kia: lệch sâu như chúng sẽ thành một hàng ba ảnh so le chỏng chơ chứ
  // không đọc ra là nhịp của cả cột.
  "ao-dai": ["0px", "38px", "14px"],
};

const FALLBACK_OFFSETS: [string, string, string] = ["0px", "48px", "20px"];

const GRID_SIZES = "(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 350px";
const WIDE_SIZES = "(max-width: 1023px) 92vw, 1040px";

/** Hover "nhấc ảnh lên": phần dịch chuyển tự tắt khi bật prefers-reduced-motion. */
const PHOTO_HOVER =
  "transition-[transform,box-shadow] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "hover:shadow-[0_22px_46px_-18px_rgba(61,57,53,0.42)] motion-safe:hover:-translate-y-[5px]";

type Props = { chapters: readonly AlbumChapter[] };

export function AlbumChapters({ chapters }: Props) {
  /**
   * Lightbox chạy xuyên suốt cả album chứ không bó trong từng chapter, nên
   * phải dàn phẳng toàn bộ ảnh ra một mảng và nhớ vị trí bắt đầu của mỗi
   * chapter để quy ảnh thứ i của chapter về đúng chỉ số toàn cục.
   * Ảnh `cover` là trang trí, cố ý KHÔNG nằm trong mảng này.
   */
  const photos = chapters.flatMap((chapter) => chapter.photos);
  const offsets: number[] = [];
  chapters.reduce((acc, chapter) => {
    offsets.push(acc);
    return acc + chapter.photos.length;
  }, 0);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {chapters.map((chapter, chapterIndex) => {
        const [c1, c2, c3] =
          COLUMN_OFFSETS[chapter.id] ?? FALLBACK_OFFSETS;
        const deepest = `${Math.max(
          ...[c1, c2, c3].map((v) => Number.parseFloat(v) || 0),
        )}px`;
        const base = offsets[chapterIndex];
        const isLast = chapterIndex === chapters.length - 1;

        return (
          <section
            key={chapter.id}
            id={`chapter-${chapter.id}`}
            aria-label={`Buổi chụp ${chapter.title}`}
            className="scroll-mt-[128px] lg:scroll-mt-[112px]"
          >
            {/* --- Đầu chapter: số thứ tự lớn + tên + số ảnh --- */}
            <Reveal y={16}>
              <div className="flex items-end gap-4 sm:gap-7">
                <span
                  aria-hidden="true"
                  className="wd-num block text-[clamp(4.5rem,11vw,10rem)] leading-[0.78] tracking-[0.01em] text-champagne/55"
                >
                  {String(chapterIndex + 1).padStart(2, "0")}
                </span>

                <div className="pb-1 sm:pb-2">
                  <h2 className="wd-h1 text-[clamp(1.5rem,3.4vw,2.5rem)] tracking-[0.16em] uppercase">
                    {chapter.title}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="mt-3 block h-px w-[34px] bg-champagne/70"
                  />
                  <p className="wd-body-sm mt-3 text-taupe">
                    <span className="wd-num">{chapter.photos.length}</span> ảnh
                  </p>
                </div>
              </div>
            </Reveal>

            {/* --- Dải ảnh bìa tràn viền, chỉ ở chapter có khung ảnh ngang --- */}
            {chapter.cover ? (
              <Reveal delay={0.1} y={18} className="mt-9 md:mt-12">
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[3px] bg-warm">
                  <Image
                    src={chapter.cover}
                    alt={`Ảnh bìa buổi chụp ${chapter.title}`}
                    fill
                    loading="lazy"
                    sizes={WIDE_SIZES}
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ) : null}

            {/* --- Lưới ảnh, ba cột lệch tầng --- */}
            <div
              style={
                {
                  "--zz-1": c1,
                  "--zz-2": c2,
                  "--zz-3": c3,
                  "--zz-max": deepest,
                } as CSSProperties
              }
              className={cn(
                "mt-9 grid grid-cols-1 items-start gap-[clamp(14px,1.6vw,22px)] sm:grid-cols-2 md:mt-12 lg:grid-cols-3",
                // Nhịp lệch chỉ bật ở lg: dưới đó lưới còn 1–2 cột nên quy tắc
                // "cứ 3 phần tử một cột" không còn đúng với cột thật nữa.
                "lg:pb-[var(--zz-max)]",
                "lg:[&>*:nth-child(3n+1)]:translate-y-[var(--zz-1)]",
                "lg:[&>*:nth-child(3n+2)]:translate-y-[var(--zz-2)]",
                "lg:[&>*:nth-child(3n+3)]:translate-y-[var(--zz-3)]",
              )}
            >
              {chapter.photos.map((photo, photoIndex) => {
                const globalIndex = base + photoIndex;
                // Chapter 2 mở đầu cột giữa bằng một ảnh dọc cao hơn hẳn,
                // phá nhịp 4:5 đều đặn của cả trang đúng một lần.
                const isTallLead = chapterIndex === 1 && photoIndex === 1;

                return (
                  <div key={`${photo.src}-${photoIndex}`}>
                    <Reveal delay={(photoIndex % 3) * 0.08} y={18} duration={0.45}>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(globalIndex)}
                        aria-label={`Mở ảnh lớn: ${photo.alt}`}
                        className={cn(
                          "group relative block w-full overflow-hidden rounded-[3px] bg-warm",
                          isTallLead ? "aspect-[3/4]" : "aspect-[4/5]",
                          PHOTO_HOVER,
                        )}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          loading="lazy"
                          sizes={GRID_SIZES}
                          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.035]"
                        />
                      </button>
                    </Reveal>
                  </div>
                );
              })}
            </div>

            {/* --- Nhịp nghỉ giữa hai chapter --- */}
            {!isLast ? (
              <div
                aria-hidden="true"
                className="flex items-center justify-center gap-5 py-[clamp(72px,11vh,132px)]"
              >
                <span className="h-px w-[64px] bg-champagne/70" />
                <Botanical variant="mark" className="h-4 w-11 text-sage/60" />
                <span className="h-px w-[64px] bg-champagne/70" />
              </div>
            ) : null}
          </section>
        );
      })}

      <Lightbox
        images={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />
    </div>
  );
}
