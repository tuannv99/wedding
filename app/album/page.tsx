import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { Navigation } from "@/components/wedding/Navigation";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { wedding } from "@/lib/wedding";
import { AlbumStory } from "@/app/album/AlbumStory";

export const metadata: Metadata = {
  title: `Album · ${wedding.groom.short} & ${wedding.bride.short}`,
  description:
    "Những ngày Văn Tuấn & Mai Hoa đi chụp ảnh cưới, kể lại bằng ảnh theo thứ tự từ đầu đến cuối.",
};

const { chapters, hero: heroPhotos, closing, opening, ending } = wedding.album;

/**
 * Trang /album là một cuốn "photo diary": mở ra bằng một khoảng thở, rồi ba
 * chương theo đúng thứ tự của ngày chụp (ngoại cảnh → studio → áo dài), rồi
 * khép lại. Toàn bộ nằm trên một trang, cuộn một chiều — không mục lục, không
 * tab, không filter, không nút nhảy chương.
 *
 * Bề rộng thân trang là 1100px (hẹp hơn mức 1300px cũ): cột ảnh gọn hơn thì
 * khoảng trắng hai bên mới đủ rộng để trang đọc ra là một cuốn sách ảnh chứ
 * không phải một trang gallery kín mép.
 */
const BODY = "mx-auto w-full max-w-[1100px]";

export default function AlbumPage() {
  return (
    <>
      <EnsureOpened />
      <Navigation />

      <main className="w-full bg-ivory">
        {/* ---------------------------------------------------------------
            01 · Mở đầu — chữ giữa trang, thật nhiều khoảng trắng, rồi hai
            tấm ảnh đầu tiên lệch tầng như hai tấm rơi ra từ bìa album.
        --------------------------------------------------------------- */}
        <section className="relative isolate w-full overflow-hidden px-6 pt-28 pb-[clamp(24px,5vh,56px)] md:px-10 md:pt-[136px]">
          <BotanicalAccent
            variant="branch"
            opacity={0.3}
            depth={6}
            className="-top-[6vh] -left-[3vw] hidden h-[58vh] w-[22vh] lg:block"
          />

          <div className={BODY}>
            <Reveal className="mx-auto flex max-w-[620px] flex-col items-center text-center">
              <p className="wd-eyebrow text-taupe">{opening.eyebrow}</p>

              <h1 className="font-display mt-8 text-[clamp(1.85rem,4.4vw,3.15rem)] leading-[1.3] font-light text-ink sm:whitespace-pre-line">
                {opening.title}
              </h1>

              {/* Dòng gợi cuộn: một nét kẻ dọc mảnh + chữ nhỏ. Cố ý không mũi
                  tên, không animation nhấp nháy — chỉ đủ để nói "còn ở dưới". */}
              <span
                aria-hidden="true"
                className="mt-10 block h-[52px] w-px bg-champagne/60"
              />
              <p className="wd-eyebrow mt-5 text-[11px] tracking-[0.3em] text-taupe/85">
                {opening.hint}
              </p>
            </Reveal>

            <div className="mt-[clamp(56px,10vh,120px)] grid grid-cols-1 gap-[clamp(18px,2.6vw,40px)] sm:grid-cols-[1.55fr_1fr] sm:items-start">
              {heroPhotos.map((photo, index) => (
                <div
                  key={photo.src}
                  /* Tấm thứ hai nhỏ hơn và tụt xuống — nhịp lệch của cả trang
                     bắt đầu ngay từ đây. Mobile: đứng lẻ, thu về 74% bề ngang
                     và dạt sang phải để không đọc thành một cặp đều nhau. */
                  className={
                    index === 1
                      ? "ml-auto w-[74%] sm:mt-[clamp(32px,6vw,88px)] sm:ml-0 sm:w-[88%]"
                      : undefined
                  }
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[3px] bg-warm">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      priority
                      sizes="(max-width: 639px) 92vw, (max-width: 1023px) 48vw, 620px"
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
            02–04 · Ba chương của ngày chụp
        --------------------------------------------------------------- */}
        {/* Lớp padding NGOÀI rồi mới tới khung 1100px — đúng thứ tự như hai
            section trên/dưới. Gộp cả hai vào một thẻ thì phần chữ và ảnh của
            các chương sẽ thụt vào thêm 40px so với ảnh mở đầu và ảnh kết. */}
        <div className="w-full px-6 pt-[clamp(80px,13vh,150px)] pb-[clamp(24px,5vh,56px)] md:px-10">
          <div className={BODY}>
            <AlbumStory chapters={chapters} />
          </div>
        </div>

        {/* ---------------------------------------------------------------
            05 · Khép album — khoảng trắng lớn, hai câu cảm ơn, rồi tấm ảnh
            ngang cuối cùng.
        --------------------------------------------------------------- */}
        <section className="w-full px-6 pt-[clamp(96px,17vh,190px)] pb-[clamp(72px,11vh,130px)] md:px-10">
          <Reveal className="mx-auto flex max-w-[560px] flex-col items-center text-center">
            <p className="wd-quote text-[clamp(1.4rem,3.4vw,2.1rem)] text-ink">
              {ending.lead}
            </p>

            <p className="font-display mt-7 text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.9] font-light text-ink/70 sm:whitespace-pre-line">
              {ending.body}
            </p>
          </Reveal>

          <Reveal
            delay={0.1}
            y={18}
            className={`${BODY} mt-[clamp(56px,10vh,120px)]`}
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[3px] bg-warm">
              <Image
                src={closing.src}
                alt={closing.alt}
                fill
                loading="lazy"
                sizes="(max-width: 1023px) 92vw, 1100px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </section>

        {/* ---------------------------------------------------------------
            Chữ ký khép lại + đường về thiệp cưới
        --------------------------------------------------------------- */}
        <footer className="relative isolate w-full overflow-hidden border-t border-taupe/20 px-6 py-[clamp(72px,12vh,140px)] md:px-10">
          <BotanicalAccent
            variant="sprig"
            opacity={0.24}
            depth={5}
            className="-right-[2vw] -bottom-[6vh] hidden h-[34vh] w-[19vh] md:block"
          />

          <Reveal className="mx-auto flex max-w-[640px] flex-col items-center text-center">
            <p className="wd-display text-[clamp(2.25rem,8vw,4.5rem)] uppercase">
              {wedding.groom.short}
              <span className="mx-3 text-champagne italic lowercase">&amp;</span>
              {wedding.bride.short}
            </p>

            <span
              aria-hidden="true"
              className="mt-8 block h-px w-[64px] bg-champagne/70"
            />

            <Link href="/" className="wd-btn-ghost mt-8">
              Về thiệp cưới
            </Link>

            <Botanical variant="mark" className="mt-10 h-4 w-11 text-sage/55" />
          </Reveal>
        </footer>
      </main>
    </>
  );
}
