"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { Lightbox } from "@/components/wedding/Lightbox";
import { OverviewControl, OverviewSection, type OverviewTile } from "@/app/album/Overview";
import { Frame, StoryBlock, type FrameContext } from "@/app/album/StoryBlock";
import { anchorId, buildStory, FIRST_INDEX, LAST_INDEX } from "@/app/album/story-plan";
import { wedding } from "@/lib/wedding";
import { cn } from "@/lib/utils";

const { opening, overview, cover, photos, interludes, closing, ending } = wedding.album;

/**
 * Bề rộng thân trang. Giữ nguyên 1100px của bản cũ: cột ảnh gọn thì khoảng
 * trắng hai bên mới đủ rộng để trang đọc ra là một cuốn sách ảnh chứ không
 * phải một trang gallery kín mép.
 */
const BODY = "mx-auto w-full max-w-[1100px]";

/** Quãng nghỉ giữa hai khối ảnh — nhịp thở chính của cả trang. */
const BREATH = "mt-[clamp(72px,11vw,150px)]";

/**
 * /album — một câu chuyện ảnh cuộn dọc.
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
 * Trang này bỏ hẳn phép mô phỏng đó. Không lật giấy, không vuốt ngang, không
 * scroll-snap, không chương. Còn lại ba thứ:
 *
 *   1. Một dòng ảnh cuộn dọc bình thường, nhịp đến từ bố cục từng khối
 *      (xem story-plan.ts + StoryBlock.tsx).
 *   2. Một bản đồ 37 ô ngay sau phần mở đầu, bấm ô nào là tới đúng ảnh đó.
 *   3. Cùng bản đồ ấy, mở lại được bất cứ lúc nào bằng nút nổi ở mép màn.
 *
 * Kết quả là quãng đường từ ảnh 25 về ảnh 3 chỉ còn đúng hai cú bấm, và mọi
 * chuyển động trên trang đều là cuộn thật của trình duyệt.
 */
export function AlbumStory() {
  const sections = useMemo(() => buildStory(photos, interludes), []);

  /**
   * Cả 37 ảnh trong MỘT danh sách phẳng, đúng thứ tự người xem gặp chúng:
   * ảnh ngang mở đầu, 35 ảnh dọc, ảnh ngang khép lại.
   *
   * Cùng một danh sách này vừa là dữ liệu cho lưới thumbnail vừa là dữ liệu
   * cho lightbox, nên số thứ tự trên ô thumbnail, số dưới khung ảnh và bộ đếm
   * "07 / 37" trong lightbox không có cách nào lệch nhau.
   */
  const tiles = useMemo<OverviewTile[]>(
    () => [
      { n: FIRST_INDEX, src: cover.src, alt: cover.alt, wide: true },
      ...photos.map((photo, i) => ({ n: i + 2, src: photo.src, alt: photo.alt })),
      { n: LAST_INDEX, src: closing.src, alt: closing.alt, wide: true },
    ],
    [],
  );

  const [lightbox, setLightbox] = useState<number | null>(null);
  const [arrived, setArrived] = useState<number | null>(null);
  const [current, setCurrent] = useState(FIRST_INDEX);
  const [pastOverview, setPastOverview] = useState(false);

  const overviewRef = useRef<HTMLElement>(null);
  const arrivedTimer = useRef<number | undefined>(undefined);

  // Lightbox nhận index 0-based, còn cả trang nói chuyện bằng số thứ tự
  // 1-based (đúng con số người xem nhìn thấy). Quy đổi gói gọn ở đúng hai chỗ.
  const openLightbox = useCallback((n: number) => setLightbox(n - 1), []);

  /**
   * Nhảy tới một ảnh.
   *
   * Cố ý dùng scrollIntoView trần chứ không tự tính toạ độ rồi window.scrollTo:
   * `scroll-behavior: smooth` và `scroll-margin-top` đã nằm sẵn trong CSS
   * (globals.css + .wd-anchor), nên trình duyệt lo cả phần cuộn mượt lẫn phần
   * chừa chỗ cho thanh nav cố định — và tự chuyển sang nhảy thẳng khi người
   * dùng bật prefers-reduced-motion, không cần nhánh riêng ở đây.
   */
  const jumpTo = useCallback((n: number) => {
    document.getElementById(anchorId(n))?.scrollIntoView({ block: "start" });

    setArrived(n);
    window.clearTimeout(arrivedTimer.current);
    arrivedTimer.current = window.setTimeout(() => setArrived(null), 1800);
  }, []);

  useEffect(() => () => window.clearTimeout(arrivedTimer.current), []);

  const ctx = useMemo<FrameContext>(
    () => ({ onOpen: openLightbox, arrived }),
    [openLightbox, arrived],
  );

  /**
   * Nút nổi chỉ xuất hiện sau khi phần xem tổng thể đã trôi qua khỏi màn hình:
   * lúc còn đang nhìn thẳng vào cái lưới đó thì một nút mở lại chính nó là thừa.
   */
  useEffect(() => {
    const target = overviewRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPastOverview(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  /**
   * Ô nào trong bản đồ đang sáng — tức người xem đang đứng ở tấm nào.
   *
   * Một observer duy nhất cho cả 37 khung ảnh, ngưỡng 0 và không đọc layout ở
   * đâu khác: mọi thứ cần biết đều nằm trong entry mà trình duyệt đưa sang,
   * nên cuộn không kéo theo lần đo lại nào.
   *
   * rootMargin kéo "đường ngắm" về khoảng một phần ba trên màn hình — cùng
   * cách Navigation chọn mục đang xem, để hai chỗ không sáng lệch nhau.
   */
  useEffect(() => {
    const frames = Array.from(document.querySelectorAll<HTMLElement>("[data-photo]"));
    if (!frames.length) return;

    const visible = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(el);
          else visible.delete(el);
        }

        let top: HTMLElement | null = null;
        for (const el of visible) {
          if (!top || el.getBoundingClientRect().top < top.getBoundingClientRect().top) {
            top = el;
          }
        }

        if (top) setCurrent(Number(top.dataset.photo));
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: 0 },
    );

    frames.forEach((frame) => observer.observe(frame));
    return () => observer.disconnect();
  }, []);

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

            <h1 className="font-display mt-6 text-[clamp(1.85rem,4.4vw,3.15rem)] leading-[1.3] font-light text-ink sm:whitespace-pre-line">
              {opening.title}
            </h1>

            <p className="wd-body-sm mt-6 max-w-[480px] text-[15px] leading-[1.9]">
              {opening.intro}
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
              sizes="(max-width: 1100px) 100vw, 1100px"
            />
          </Reveal>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          02 · Bản đồ cả bộ ảnh.

          Đặt ngay sau hero chứ không giấu sau một nút: người xem phải THẤY
          toàn bộ bộ ảnh trước khi bắt đầu cuộn, đó mới là thứ trang cũ thiếu.
          Nút nổi phía dưới chỉ là đường về lại đây.
      ----------------------------------------------------------------- */}
      <section
        ref={overviewRef}
        className="w-full px-6 pt-[clamp(80px,12vw,150px)] md:px-10"
      >
        <div className={BODY}>
          <Reveal>
            <OverviewSection
              eyebrow={overview.eyebrow}
              title={overview.title}
              hint={overview.hint}
              tiles={tiles}
              onPick={jumpTo}
              current={current}
            />
          </Reveal>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          03 · Dòng ảnh.

          Một danh sách phẳng các khối, không cấp nào ở giữa. Câu chen chỉ là
          một phần tử khác trong cùng danh sách đó — nó KHÔNG mở ra một chương,
          không có số, không có tên, và đoạn ảnh sau nó không dài ngắn theo nó.
      ----------------------------------------------------------------- */}
      <div className="w-full px-6 pt-[clamp(90px,14vw,180px)] md:px-10">
        <div className={BODY}>
          {sections.map((section, i) =>
            section.kind === "photos" ? (
              <div key={section.key} className={cn(i > 0 && BREATH)}>
                <StoryBlock
                  layout={section.layout}
                  items={section.items}
                  first={i === 0}
                  ctx={ctx}
                />
              </div>
            ) : (
              <Interlude key={section.key} tone={section.tone} text={section.text} />
            ),
          )}
        </div>
      </div>

      {/* -----------------------------------------------------------------
          04 · Khép lại — tấm ngang thứ hai, để nguyên khung, chữ đặt bên dưới.

          Cùng lý do với tấm mở đầu: ảnh sáng, nên chữ đứng ngoài ảnh. Đây
          cũng là chỗ khác hẳn bản cũ — trước kia tấm này bị dùng làm nền
          footer và bị object-cover xén gần hết bề ngang trên điện thoại.
      ----------------------------------------------------------------- */}
      <section className="w-full px-6 pt-[clamp(110px,18vw,220px)] md:px-10">
        <div className={BODY}>
          <Reveal>
            <Frame
              ctx={ctx}
              n={LAST_INDEX}
              src={closing.src}
              alt={closing.alt}
              wide
              sizes="(max-width: 1100px) 100vw, 1100px"
            />
          </Reveal>

          <Reveal className="mx-auto mt-[clamp(56px,9vw,110px)] flex max-w-[560px] flex-col items-center text-center">
            <p className="wd-quote text-[clamp(1.4rem,3.4vw,2.1rem)] text-ink">
              {ending.lead}
            </p>

            <p className="font-display mt-6 text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.9] font-light text-ink/70 sm:whitespace-pre-line">
              {ending.body}
            </p>
          </Reveal>
        </div>
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
          <p className="wd-display text-[clamp(2.25rem,8vw,4.5rem)] uppercase">
            {wedding.groom.short}
            <span className="mx-3 text-champagne italic lowercase">&amp;</span>
            {wedding.bride.short}
          </p>

          <span aria-hidden="true" className="mt-8 block h-px w-[64px] bg-champagne/70" />

          <div className="mt-8 flex items-center gap-5">
            <button
              type="button"
              onClick={() => jumpTo(FIRST_INDEX)}
              className="wd-eyebrow inline-flex min-h-11 items-center gap-2 text-[11px] text-ink transition-colors duration-500 hover:text-taupe"
            >
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Về đầu
            </button>

            <span aria-hidden="true" className="h-3 w-px bg-champagne/70" />

            <Link
              href="/"
              className="wd-eyebrow inline-flex min-h-11 items-center text-[11px] text-ink transition-colors duration-500 hover:text-taupe"
            >
              Về thiệp cưới
            </Link>
          </div>

          <Botanical variant="mark" className="mt-10 h-4 w-11 text-sage/55" />
        </Reveal>
      </footer>

      <OverviewControl
        visible={pastOverview}
        tiles={tiles}
        onPick={jumpTo}
        current={current}
      />

      <Lightbox
        images={tiles}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onChange={setLightbox}
      />
    </main>
  );
}

/**
 * Một câu chen giữa hai khối ảnh.
 *
 * Đây là thứ THAY CHO màn chuyển chương cũ, và cố ý làm nhỏ hơn nhiều: không
 * số chương, không tên buổi chụp, không animation riêng, không nét kẻ chạy
 * ngang trang. Chỉ một câu, giữa một khoảng trắng rộng hơn bình thường — đúng
 * trọng lượng của một câu nói chen vào giữa lúc lật ảnh.
 */
function Interlude({ tone, text }: { tone: "quote" | "note"; text: string }) {
  return (
    <Reveal
      className={cn(
        "flex flex-col items-center text-center",
        // Rộng hơn quãng nghỉ giữa hai khối ảnh: chữ cần khoảng lặng hai đầu
        // thì mới đọc ra là một nhịp ngắt, không phải một chú thích của tấm
        // ảnh ngay trên nó.
        "mt-[clamp(96px,16vw,210px)] mb-[clamp(96px,16vw,210px)]",
      )}
    >
      {tone === "quote" ? (
        <Botanical variant="mark" className="mb-7 h-4 w-11 text-sage/45" />
      ) : (
        <span aria-hidden="true" className="mb-7 block h-px w-[40px] bg-champagne/60" />
      )}

      <p
        className={cn(
          "max-w-[600px] sm:whitespace-pre-line",
          tone === "quote"
            ? "wd-quote text-[clamp(1.35rem,3.2vw,2rem)] text-ink"
            : "font-display text-[clamp(1.1rem,1.9vw,1.45rem)] leading-[1.85] font-light text-ink/75",
        )}
      >
        {text}
      </p>
    </Reveal>
  );
}
