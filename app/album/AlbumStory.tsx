"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { Lightbox } from "@/components/wedding/Lightbox";
import type { AlbumChapter } from "@/lib/wedding";
import { cn } from "@/lib/utils";

/**
 * Thân cuốn "nhật ký ảnh cưới": mỗi buổi chụp là một chương — số chương, tên,
 * một đoạn ghi chú, rồi ảnh chảy xuống theo nhịp.
 *
 * Cố ý KHÔNG có mục lục / tab / filter / nút nhảy chương: người xem chỉ cuộn
 * từ đầu đến cuối, đọc chú thích rồi xem ảnh, đúng như lật một cuốn album.
 */

/**
 * Mọi ảnh trong public/images/album/<chapter>/ đều là ảnh DỌC tỉ lệ 2:3, còn
 * `cover`/`closing` là ảnh NGANG 3:2 (script build nén bằng fit: "inside" nên
 * không hề cắt ảnh — xem scripts/build-album-images.mjs). Khung ảnh ở đây
 * dùng đúng hai tỉ lệ đó, nhờ vậy object-cover không cắt mất phần nào của cô
 * dâu chú rể — điểm này quan trọng nhất ở mobile, nơi ảnh chiếm cả bề ngang.
 */
const PORTRAIT = "aspect-[2/3]";
const LANDSCAPE = "aspect-[3/2]";

const PORTRAIT_SIZES = "(max-width: 639px) 92vw, (max-width: 1023px) 48vw, 620px";
const LANDSCAPE_SIZES = "(max-width: 1023px) 92vw, 1100px";

/**
 * Nhịp bố cục của một chương, lặp lại theo chu kỳ 6 khối / 10 ảnh:
 *
 *   ┌────┬────┐   ┌─────┐        ┌──────┬───┐
 *   │ 1  │ 2  │   │  3  │        │  4   │ 5 │ ← lệch tầng
 *   └────┴────┘   └─────┘        └──────┴───┘
 *   (pair)        (solo trái)    (offset)
 *
 * rồi pair → solo phải → offset đảo. Một chu kỳ dài hơn số ảnh của bất kỳ
 * chương nào (18/12/3) nên không có đoạn nào lặp lại y nguyên hai lần liền.
 */
const RHYTHM = [
  "pair",
  "solo-left",
  "offset",
  "pair",
  "solo-right",
  "offset-flip",
] as const;

type BlockKind = (typeof RHYTHM)[number] | "solo-center";
type Block = { kind: BlockKind; start: number; size: number };

/** Số ảnh mỗi khối muốn nhận. */
function capacity(kind: BlockKind) {
  return kind === "pair" || kind === "offset" || kind === "offset-flip" ? 2 : 1;
}

/**
 * Chia n ảnh của một chương thành các khối theo nhịp trên.
 *
 * Tính từ SỐ LƯỢNG ảnh chứ không hard-code từng chương: thêm/bớt ảnh trong
 * lib/wedding.ts là bố cục tự xếp lại, không phải sửa file này.
 */
function buildBlocks(count: number): Block[] {
  // Chương ít ảnh (Áo dài chỉ có 3 tấm): một ảnh lớn giữa trang, phần còn lại
  // thành một cặp bên dưới — thoáng hơn, và nhịp so le sẽ vô nghĩa ở cỡ này.
  if (count <= 3) {
    const blocks: Block[] = [{ kind: "solo-center", start: 0, size: 1 }];
    if (count > 1) blocks.push({ kind: "pair", start: 1, size: count - 1 });
    return blocks;
  }

  const blocks: Block[] = [];
  let start = 0;
  let step = 0;

  while (start < count) {
    const remaining = count - start;
    let kind: BlockKind = RHYTHM[step % RHYTHM.length];
    step += 1;

    // Chỉ còn đúng 1 ảnh mà khối đang tới cần 2 -> hạ thành một ảnh đứng lẻ,
    // trái/phải xen kẽ để tấm cuối không luôn nằm cùng một bên.
    if (remaining < capacity(kind)) {
      kind = blocks.length % 2 === 0 ? "solo-left" : "solo-right";
    }

    const size = Math.min(capacity(kind), remaining);
    blocks.push({ kind, start, size });
    start += size;
  }

  return blocks;
}

/**
 * Khung của từng loại khối. Mobile (< sm) LUÔN là một cột tràn bề ngang: bố
 * cục lệch tầng chỉ có nghĩa khi còn đủ hai cột, và ảnh dọc 2:3 để full width
 * trên điện thoại là cách xem dễ nhất.
 */
const BLOCK_CLASS: Record<BlockKind, string> = {
  pair: "grid grid-cols-1 gap-[clamp(14px,1.8vw,26px)] sm:grid-cols-2",

  /*
    Khối so le: cột nhỏ (hoặc cột lớn, ở bản đảo) bị đẩy xuống 56px bằng
    `translate` chứ không phải margin — translate không tính vào layout nên hai
    ảnh vẫn đứng trên cùng một hàng lưới, chỉ thị giác là lệch. Đổi lại phải bù
    đúng 56px `padding-bottom`, nếu không ảnh lệch sẽ thò xuống khối kế tiếp.
    Chỉ bật từ lg: dưới đó mỗi khối chỉ còn 1–2 cột hẹp, lệch tầng sẽ thành
    khoảng trống lạc chỗ.
  */
  offset:
    "grid grid-cols-1 items-start gap-[clamp(14px,1.8vw,26px)] sm:grid-cols-[1.45fr_1fr] " +
    "lg:pb-[56px] lg:[&>*:nth-child(2)]:translate-y-[56px]",

  "offset-flip":
    "grid grid-cols-1 items-start gap-[clamp(14px,1.8vw,26px)] sm:grid-cols-[1fr_1.45fr] " +
    "lg:pb-[56px] lg:[&>*:nth-child(1)]:translate-y-[56px]",

  "solo-left": "sm:w-[58%]",
  "solo-right": "sm:ml-auto sm:w-[52%]",
  "solo-center": "mx-auto w-full sm:w-[64%] sm:max-w-[540px]",
};

type Props = { chapters: readonly AlbumChapter[] };

export function AlbumStory({ chapters }: Props) {
  /**
   * Lightbox chạy xuyên suốt cả album chứ không bó trong từng chương, nên phải
   * dàn phẳng toàn bộ ảnh ra một mảng và nhớ vị trí bắt đầu của mỗi chương để
   * quy ảnh thứ i của chương về đúng chỉ số toàn cục.
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
        const base = offsets[chapterIndex];
        const isLast = chapterIndex === chapters.length - 1;
        const blocks = buildBlocks(chapter.photos.length);

        return (
          <section
            key={chapter.id}
            id={`chapter-${chapter.id}`}
            aria-labelledby={`chapter-${chapter.id}-title`}
          >
            {/* --- Đầu chương: số, tên, đoạn ghi chú --- */}
            <Reveal y={16} className="max-w-[540px]">
              <p
                aria-hidden="true"
                className="wd-num text-[13px] tracking-[0.34em] text-champagne"
              >
                {String(chapterIndex + 1).padStart(2, "0")}
              </p>

              <h2
                id={`chapter-${chapter.id}-title`}
                className="wd-h1 mt-5 text-[clamp(1.35rem,2.8vw,2.1rem)] tracking-[0.18em] uppercase"
              >
                {chapter.title}
              </h2>

              <span
                aria-hidden="true"
                className="mt-6 block h-px w-[34px] bg-champagne/70"
              />

              {/*
                Đoạn ghi chú: chữ serif nhỏ, giãn dòng rộng, đọc như một mẩu
                viết tay trong album. `whitespace-pre-line` CHỈ bật từ sm —
                dấu ngắt dòng trong lib/wedding.ts được ngắt theo nhịp câu nói,
                nhưng ở màn 320–375px mấy dòng đó lại tự tràn thêm một lần nữa
                thành so le lẻ; dưới sm cứ để chữ tự xuống dòng là gọn nhất.
              */}
              <p className="font-display mt-7 text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.9] font-light text-ink/75 sm:whitespace-pre-line">
                {chapter.note}
              </p>
            </Reveal>

            {/* --- Ảnh ngang mở chương (chỉ buổi ngoại cảnh có khung ngang) --- */}
            {chapter.cover ? (
              <Reveal delay={0.08} y={18} className="mt-[clamp(32px,6vw,72px)]">
                <div
                  className={cn(
                    "relative w-full overflow-hidden rounded-[3px] bg-warm",
                    LANDSCAPE,
                  )}
                >
                  <Image
                    src={chapter.cover}
                    alt={`Ảnh mở đầu buổi chụp ${chapter.title}`}
                    fill
                    loading="lazy"
                    sizes={LANDSCAPE_SIZES}
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ) : null}

            {/* --- Ảnh của chương, xếp theo nhịp --- */}
            <div className="mt-[clamp(32px,6vw,72px)] flex flex-col gap-[clamp(18px,3vw,44px)]">
              {blocks.map((block) => (
                <div
                  key={`${chapter.id}-${block.start}`}
                  className={BLOCK_CLASS[block.kind]}
                >
                  {chapter.photos
                    .slice(block.start, block.start + block.size)
                    .map((photo, indexInBlock) => {
                      const globalIndex = base + block.start + indexInBlock;

                      return (
                        /*
                          Lớp div trần này BẮT BUỘC phải có: nhịp lệch tầng đặt
                          `translate-y` lên con trực tiếp của khối, mà Reveal
                          (Framer Motion) lại tự ghi `transform` inline lên chính
                          thẻ của nó khi chạy fade-up — inline luôn thắng class,
                          nên nếu Reveal là con trực tiếp thì độ lệch bị xoá sạch
                          ngay khi animation chạy xong.
                        */
                        <div key={photo.src}>
                          <Reveal
                            delay={indexInBlock * 0.06}
                            y={16}
                            duration={0.45}
                          >
                            <button
                              type="button"
                              onClick={() => setOpenIndex(globalIndex)}
                              aria-label={`Xem ảnh lớn: ${photo.alt}`}
                              className={cn(
                                "group relative block w-full overflow-hidden rounded-[3px] bg-warm",
                                PORTRAIT,
                              )}
                            >
                              {/* Hover chỉ làm ảnh sáng nhẹ đi — không nhấc ảnh,
                                  không đổ bóng, không zoom: trang này để xem
                                  ảnh, mọi hiệu ứng mạnh hơn đều thành tiếng ồn. */}
                              <Image
                                src={photo.src}
                                alt={photo.alt}
                                fill
                                loading="lazy"
                                sizes={PORTRAIT_SIZES}
                                className="object-cover transition-opacity duration-700 ease-out group-hover:opacity-[0.88]"
                              />
                            </button>
                          </Reveal>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>

            {/* --- Khoảng nghỉ giữa hai chương --- */}
            {!isLast ? (
              <div
                aria-hidden="true"
                className="flex items-center justify-center py-[clamp(80px,13vh,150px)]"
              >
                <Botanical variant="mark" className="h-4 w-11 text-sage/55" />
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
