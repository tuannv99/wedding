"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { Lightbox } from "@/components/wedding/Lightbox";
import { OverviewSection, type OverviewTile } from "@/app/album/Overview";
import { Frame, type FrameContext } from "@/app/album/StoryBlock";
import { FIRST_INDEX } from "@/app/album/story-plan";
import { wedding } from "@/lib/wedding";

const { opening, overview, cover, photos, closing, ending } = wedding.album;

/**
 * Bề rộng thân trang. Giữ nguyên 1100px của bản cũ: cột ảnh gọn thì khoảng
 * trắng hai bên mới đủ rộng để trang đọc ra là một cuốn sách ảnh chứ không
 * phải một trang gallery kín mép.
 */
const BODY = "mx-auto w-full max-w-[1100px]";

/**
 * /album — tấm mở đầu, một lưới tổng thể cả bộ ảnh, rồi lời khép lại.
 *
 * Bản trước mô phỏng một cuốn album thật: lật trang 3D trên desktop, vuốt
 * ngang trên điện thoại, ba chương có màn chuyển chương riêng, mỗi ảnh chiếm
 * trọn một màn hình. Đẹp lúc mở ra lần đầu, nhưng người xem báo lại đúng ba
 * điều, và cả ba đều là hệ quả của chính cái mô phỏng đó:
 *
 *   - không nhìn được tổng thể bộ ảnh   → vì không bao giờ có hơn 2 tấm trên màn
 *   - muốn xem lại một tấm thì rất xa   → vì phải lật/vuốt lại từng trang một
 *   - cảm giác khó dùng                 → vì bị buộc đi theo một đường duy nhất
 *
 * Trang này bỏ hẳn phép mô phỏng đó, và bỏ luôn dòng ảnh chi tiết cuộn dọc
 * từng nằm dưới lưới: giờ lưới tổng thể là phần thân duy nhất. Bấm vào bất kỳ
 * ô nào là mở lớn đúng tấm đó trong lightbox, và từ đó lướt qua lại được cả bộ.
 */
export function AlbumStory() {
  /**
   * Cả bộ ảnh trong MỘT danh sách phẳng, đúng thứ tự người xem gặp chúng:
   * ảnh ngang mở đầu, dòng ảnh giữa (kể cả ảnh trang chủ), ảnh ngang khép lại.
   *
   * Cùng một danh sách này vừa là dữ liệu cho lưới thumbnail vừa là dữ liệu
   * cho lightbox, nên ô được bấm và bộ đếm "07 / 18" trong lightbox không có
   * cách nào lệch nhau.
   */
  const tiles = useMemo<OverviewTile[]>(
    () => [
      { n: FIRST_INDEX, src: cover.src, alt: cover.alt, wide: true },
      ...photos.map((photo, i) => ({
        n: i + 2,
        src: photo.src,
        alt: photo.alt,
        wide: "wide" in photo && photo.wide,
      })),
      { n: photos.length + 2, src: closing.src, alt: closing.alt, wide: true },
    ],
    [],
  );

  // Tấm mở đầu đã hiện to ngay phía trên nên lưới bỏ nó đi cho khỏi trùng;
  // lightbox vẫn giữ đủ cả bộ để bấm tấm mở đầu cũng mở lớn được.
  const gridTiles = useMemo(() => tiles.filter((t) => t.n !== FIRST_INDEX), [tiles]);

  const [lightbox, setLightbox] = useState<number | null>(null);

  // Lightbox nhận index 0-based, còn cả trang nói chuyện bằng số thứ tự
  // 1-based (đúng con số người xem nhìn thấy). Quy đổi gói gọn ở đúng một chỗ.
  const openLightbox = useCallback((n: number) => setLightbox(n - 1), []);

  const ctx = useMemo<FrameContext>(
    () => ({ onOpen: openLightbox, arrived: null }),
    [openLightbox],
  );

  return (
    <main className="w-full bg-ivory">
      {/* -----------------------------------------------------------------
          01 · Mở đầu.

          Chữ nằm HẲN BÊN NGOÀI ảnh, không đè lên. Tấm cover là ảnh ngang duy
          nhất ở đầu bộ và nó rất sáng: phủ một lớp ivory đủ dày để chữ đọc rõ
          thì chính tấm ảnh bị dìm đi, mà không phủ thì chữ nhạt chìm vào vùng
          sáng. Đặt chữ ở trên và để ảnh nguyên vẹn bên dưới giải quyết cả hai,
          và cũng đúng cách một trang ảnh editorial vào đề.
      ----------------------------------------------------------------- */}
      <section className="relative isolate w-full overflow-hidden px-6 pt-28 md:px-10 md:pt-[136px]">
        <BotanicalAccent
          variant="branch"
          opacity={0.28}
          depth={6}
          className="-top-[6vh] -left-[3vw] hidden h-[54vh] w-[20vh] lg:block"
        />

        <div className={BODY}>
          <Reveal className="max-w-[620px] border-l border-champagne/50 pl-6 md:pl-8">
            <p className="wd-eyebrow text-taupe">{opening.eyebrow}</p>

            <h1 className="font-display mt-6 text-[clamp(1.85rem,4.4vw,3.15rem)] md:text-[clamp(calc(1.85rem_+_8px),calc(4.4vw_+_8px),calc(3.15rem_+_8px))] leading-[1.3] font-light text-ink sm:whitespace-pre-line">
              {opening.title}
            </h1>

            <p className="wd-body-sm mt-6 max-w-[480px] text-[15px] leading-[1.9] md:text-[23px] sm:whitespace-pre-line">
              {opening.intro}
            </p>

            <p className="wd-body-sm mt-6 text-[15px] md:text-[23px] whitespace-pre-line text-taupe">
              {overview.hint}
            </p>
            <p className="wd-body-sm mt-2 text-[15px] md:text-[23px] text-taupe/80 italic">
              {overview.cta}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-[clamp(40px,7vw,80px)]">
            <Frame
              ctx={ctx}
              n={FIRST_INDEX}
              src={cover.src}
              alt={cover.alt}
              wide
              eager
              hideNumber
              sizes="(max-width: 1100px) 100vw, 1100px"
            />
          </Reveal>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          02 · Tổng thể cả bộ ảnh.

          Phần thân duy nhất của trang: người xem THẤY toàn bộ bộ ảnh cùng
          lúc, bấm ô nào thì tấm đó mở lớn trong lightbox.
      ----------------------------------------------------------------- */}
      <section className="w-full px-6 pt-[clamp(80px,12vw,150px)] md:px-10">
        <div className={BODY}>
          <Reveal>
            <OverviewSection
              tiles={gridTiles}
              onPick={openLightbox}
            />
          </Reveal>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          03 · Lời khép lại.
      ----------------------------------------------------------------- */}
      <section className="w-full px-6 pt-[clamp(110px,18vw,220px)] md:px-10">
        <Reveal className="mx-auto flex max-w-[560px] flex-col items-center text-center">
          <p className="wd-quote text-[clamp(1.4rem,3.4vw,2.1rem)] md:text-[clamp(calc(1.4rem_+_8px),calc(3.4vw_+_8px),calc(2.1rem_+_8px))] text-ink">
            {ending.lead}
          </p>

          <p className="font-display mt-6 text-[clamp(1.05rem,1.5vw,1.3rem)] md:text-[clamp(calc(1.05rem_+_8px),calc(1.5vw_+_8px),calc(1.3rem_+_8px))] leading-[1.9] font-light text-ink/70 sm:whitespace-pre-line">
            {ending.body}
          </p>
        </Reveal>
      </section>

      {/* -----------------------------------------------------------------
          Chữ ký + hai đường ra. Không CTA, không nút "xem lại album" — hết ảnh
          thì chỉ còn tên hai đứa.
      ----------------------------------------------------------------- */}
      <footer className="relative isolate flex w-full flex-col items-center px-5 pt-[clamp(80px,13vw,160px)] pb-[clamp(96px,14vw,180px)]">
        <BotanicalAccent
          variant="sprig"
          opacity={0.2}
          depth={5}
          className="-right-[2vw] bottom-[2vh] hidden h-[30vh] w-[17vh] md:block"
        />

        <Reveal className="flex w-full max-w-[640px] flex-col items-center text-center">
          <p className="wd-display text-[clamp(2.25rem,8vw,4.5rem)] md:text-[clamp(calc(2.25rem_+_8px),calc(8vw_+_8px),calc(4.5rem_+_8px))] uppercase">
            {wedding.groom.short}
            <span className="mx-3 text-champagne italic lowercase">&amp;</span>
            {wedding.bride.short}
          </p>

          <span aria-hidden="true" className="mt-8 block h-px w-[64px] bg-champagne/70" />

          <div className="mt-8 flex items-center gap-5">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0 })}
              className="wd-eyebrow inline-flex min-h-11 items-center gap-2 text-[11px] text-ink md:text-[19px] transition-colors duration-500 hover:text-taupe"
            >
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Về đầu
            </button>

            <span aria-hidden="true" className="h-3 w-px bg-champagne/70" />

            <Link
              href="/"
              className="wd-eyebrow inline-flex min-h-11 items-center text-[11px] text-ink md:text-[19px] transition-colors duration-500 hover:text-taupe"
            >
              Về thiệp cưới
            </Link>
          </div>

          <Botanical variant="mark" className="mt-10 h-4 w-11 text-sage/55" />
        </Reveal>
      </footer>

      <Lightbox
        images={tiles}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onChange={setLightbox}
      />
    </main>
  );
}
