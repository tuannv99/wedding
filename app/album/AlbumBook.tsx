"use client";

import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { Lightbox } from "@/components/wedding/Lightbox";
import { ChapterSeparator } from "@/app/album/ChapterSeparator";
import { PageComposition } from "@/app/album/PageComposition";
import {
  ChapterBook,
  UNIT_NARROW,
  UNIT_WIDE,
} from "@/app/album/ChapterBook";
import { buildPages, type PageIntro } from "@/app/album/page-plan";
import type { AlbumChapter } from "@/lib/wedding";

/**
 * Thân cuốn album. Toàn trang được kể như MỘT cuốn photobook:
 *
 *   phần mở đầu            → bìa
 *   trang tiêu đề 01       → mở album ra
 *   lật từng trang         → ảnh Santori
 *   màn chuyển chương      → khép Santori, mở Studio
 *   trang tiêu đề 02       → mở chương Studio
 *   lật từng trang         → ảnh Studio
 *   màn chuyển chương      → khép Studio, mở Áo dài
 *   trang tiêu đề 03       → mở chương Áo dài
 *   lật từng trang         → ảnh Áo dài
 *   phần khép lại          → trang cuối
 *
 * Ba chuyển động, ba việc khác nhau, cố ý KHÔNG trộn vào nhau:
 *
 *  - Lật giấy (ChapterBook)        = sang trang trong cùng một chương, kể cả
 *                                     từ trang tiêu đề sang ảnh đầu tiên.
 *  - Khép/mở thiệp (ChapterSeparator) = sang một chương khác.
 *  - Fade-up (Reveal)              = chữ ở phần mở đầu và phần khép lại.
 *
 * Vì thế màn khép/mở thiệp CHỈ xuất hiện ở đúng hai chỗ: Santori → Studio và
 * Studio → Áo dài, và chỉ hiện đúng số + tên chương lúc thiệp đóng/mở —
 * KHÔNG kèm đoạn ghi chú. Đoạn ghi chú đầy đủ luôn nằm ở trang tiêu đề ngay
 * sau đó, y hệt cách chương 01 vẫn làm, để ba chương đọc ra là cùng một cuốn
 * sách chứ không phải chương đầu khác kiểu với hai chương sau.
 *
 * Vào chương đầu không dùng màn khép/mở thiệp (album mở ra bằng chính trang
 * tiêu đề của nó), và ra khỏi chương cuối cũng không (Áo dài lật nốt trang
 * cuối là tới lời cảm ơn — đó đã là trang cuối của album rồi).
 *
 * Cố ý KHÔNG có mục lục / tab / filter / nút nhảy chương: người xem chỉ cuộn
 * từ đầu đến cuối, đúng như cầm một cuốn album.
 */

type Props = { chapters: readonly AlbumChapter[] };

/**
 * Hai chế độ được quyết định SAU KHI mount (không phải lúc render trên
 * server), vì cả hai đều phụ thuộc vào trình duyệt:
 *
 *  - narrow: màn < 640px → mỗi trang một ảnh (xem buildPages).
 *  - flat:   prefers-reduced-motion → bỏ hẳn lật trang và khép/mở thiệp,
 *            các trang xếp dọc, nhưng RANH GIỚI GIỮA CÁC CHƯƠNG vẫn còn.
 *
 * Nhánh cấu trúc phải nằm sau mount, nếu không HTML của server và của client
 * lệch nhau → hydration mismatch (React #418). Ba chương đều nằm dưới màn hình
 * đầu tiên nên người dùng không kịp thấy lần đổi này.
 */
type Mode = { narrow: boolean; flat: boolean };

/** Quãng cuộn của một màn chuyển chương, theo bội số chiều cao khung nhìn. */
const SEPARATOR_UNITS_WIDE = 2.2;
const SEPARATOR_UNITS_NARROW = 1.9;

export function AlbumBook({ chapters }: Props) {
  const [mode, setMode] = useState<Mode>({ narrow: false, flat: false });

  useEffect(() => {
    const narrowQuery = window.matchMedia("(max-width: 639px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () =>
      setMode({ narrow: narrowQuery.matches, flat: motionQuery.matches });

    sync();
    narrowQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);

    return () => {
      narrowQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  /**
   * Lightbox chạy xuyên suốt cả album chứ không bó trong từng chương, nên phải
   * dàn phẳng toàn bộ ảnh ra một mảng và nhớ vị trí bắt đầu của mỗi chương để
   * quy ảnh thứ i của chương về đúng chỉ số toàn cục.
   * Ảnh `cover` là trang trí, cố ý KHÔNG nằm trong mảng này.
   */
  const photos = useMemo(
    () => chapters.flatMap((chapter) => chapter.photos),
    [chapters],
  );

  const intros: PageIntro[] = useMemo(
    () =>
      chapters.map((chapter, index) => ({
        number: String(index + 1).padStart(2, "0"),
        title: chapter.title,
        note: chapter.note,
        titleId: `chapter-${chapter.id}-title`,
      })),
    [chapters],
  );

  const plans = useMemo(() => {
    let base = 0;
    return chapters.map((chapter, index) => {
      // Mọi chương đều mang theo trang tiêu đề của mình — trừ khi đang ở bản
      // xếp dọc, nơi lời mở chương nào cũng là một khối chữ bình thường thay
      // vì một trang lật được.
      const titleIntro = !mode.flat ? intros[index] : undefined;
      const pages = buildPages(chapter, base, mode.narrow, titleIntro);
      base += chapter.photos.length;
      return pages;
    });
  }, [chapters, intros, mode.narrow, mode.flat]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const separatorUnits = mode.narrow
    ? SEPARATOR_UNITS_NARROW
    : SEPARATOR_UNITS_WIDE;

  return (
    <div className="w-full">
      {chapters.map((chapter, chapterIndex) => {
        const pages = plans[chapterIndex];
        const isFirst = chapterIndex === 0;

        return (
          <section
            key={chapter.id}
            id={`chapter-${chapter.id}`}
            /* aria-label chứ không phải aria-labelledby: ở bản lật trang, thẻ
               h2 nằm trong tờ giấy và tờ giấy bị gỡ khỏi DOM khi cuộn xa, nên
               một tham chiếu theo id sẽ có lúc trỏ vào khoảng không. */
            aria-label={`Buổi chụp ${chapter.title}`}
          >
            {/* Khoảng lặng khép lại chương trước. Cũng là quãng thở trước khi
                thiệp bắt đầu khép, để chuyển chương không dính vào mép ảnh. */}
            {!isFirst ? <ChapterBreak /> : null}

            {mode.flat ? (
              <>
                <ChapterIntro intro={intros[chapterIndex]} />
                <ChapterFlat pages={pages} onOpen={setOpenIndex} />
              </>
            ) : (
              <>
                {/* Chương 02, 03 mở ra từ màn khép/mở thiệp; chương 01 mở ra
                    từ chính trang tiêu đề nằm trong xấp giấy bên dưới. */}
                {!isFirst ? (
                  <ChapterSeparator
                    from={intros[chapterIndex - 1]}
                    to={intros[chapterIndex]}
                    units={separatorUnits}
                  />
                ) : null}

                <div className={isFirst ? "pt-[clamp(72px,11vh,140px)]" : undefined}>
                  <ChapterBook
                    // Đổi chế độ là đổi cả số trang → chiều cao track đổi
                    // theo, nên phải mount lại để useScroll đo lại từ đầu.
                    key={mode.narrow ? "narrow" : "wide"}
                    pages={pages}
                    unit={mode.narrow ? UNIT_NARROW : UNIT_WIDE}
                    onOpen={setOpenIndex}
                  />
                </div>
              </>
            )}
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

/** Dấu lá khép lại một chương — khoảng thở trước màn chuyển chương. */
function ChapterBreak() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center py-[clamp(80px,13vh,150px)]"
    >
      <Botanical variant="mark" className="h-4 w-11 text-sage/55" />
    </div>
  );
}

/**
 * Lời mở chương ở bản xếp dọc (prefers-reduced-motion). Đúng khối chữ đó,
 * chỉ khác là nó nằm thẳng trong dòng chảy thay vì được thiệp mở ra.
 */
function ChapterIntro({ intro }: { intro: PageIntro }) {
  return (
    <div className="w-full px-6 pt-[clamp(24px,5vh,56px)] pb-[clamp(36px,7vh,88px)] md:px-10">
      <Reveal y={16} className="mx-auto w-full max-w-[980px]">
        <div className="max-w-[540px]">
          <p
            aria-hidden="true"
            className="wd-num text-[13px] tracking-[0.34em] text-champagne"
          >
            {intro.number}
          </p>

          <h2
            id={intro.titleId}
            className="wd-h1 mt-5 text-[clamp(1.35rem,2.8vw,2.1rem)] tracking-[0.18em] uppercase"
          >
            {intro.title}
          </h2>

          <span
            aria-hidden="true"
            className="mt-6 block h-px w-[34px] bg-champagne/70"
          />

          {/*
            `whitespace-pre-line` CHỈ bật từ sm — dấu ngắt dòng trong
            lib/wedding.ts ngắt theo nhịp câu nói, nhưng ở màn 320–375px mấy
            dòng đó lại tràn thêm một lần nữa thành so le lẻ; dưới sm cứ để
            chữ tự xuống dòng là gọn nhất.
          */}
          <p className="font-display mt-7 text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.9] font-light text-ink/75 sm:whitespace-pre-line">
            {intro.note}
          </p>
        </div>
      </Reveal>
    </div>
  );
}

/**
 * Bản cho prefers-reduced-motion: đúng những composition đó, nhưng xếp dọc và
 * chỉ fade-in nhẹ — không ghim màn hình, không 3D, không chiếm thêm quãng
 * cuộn. Vẫn xem được trọn vẹn cả album và vẫn bấm mở lightbox được.
 */
function ChapterFlat({
  pages,
  onOpen,
}: {
  pages: ReturnType<typeof buildPages>;
  onOpen: (index: number) => void;
}) {
  return (
    <div className="w-full px-6 md:px-10">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-[clamp(28px,5vw,64px)]">
        {pages.map((page) => (
          <Reveal
            key={page.key}
            y={16}
            className="wd-book-flat relative h-[var(--wd-page-h)] w-full"
          >
            <PageComposition page={page} onOpen={onOpen} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
