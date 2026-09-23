import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { Navigation } from "@/components/wedding/Navigation";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { wedding } from "@/lib/wedding";
import { AlbumBook } from "@/app/album/AlbumBook";

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
            01 · Mở đầu — chữ căn trái với một vạch champagne mảnh bên trái
            (thay cho khối chữ giữa trang trước đây), rồi một tổ hợp ảnh bất
            đối xứng: một tấm lớn + một tấm nhỏ hơi nghiêng "rơi" chồng lên
            góc dưới-phải, như một tấm ảnh in rời vừa rút ra khỏi phong bì đặt
            lên trên album — không còn là hai ô lưới đều nhau như bản cũ.
        --------------------------------------------------------------- */}
        <section className="relative isolate w-full overflow-hidden px-6 pt-28 pb-[clamp(24px,5vh,56px)] md:px-10 md:pt-[136px]">
          <BotanicalAccent
            variant="branch"
            opacity={0.3}
            depth={6}
            className="-top-[6vh] -left-[3vw] hidden h-[58vh] w-[22vh] lg:block"
          />

          <div className={BODY}>
            <Reveal className="max-w-[560px] border-l border-champagne/50 pl-6 md:pl-8">
              <p className="wd-eyebrow text-taupe">{opening.eyebrow}</p>

              <h1 className="font-display mt-6 text-[clamp(1.85rem,4.4vw,3.15rem)] leading-[1.3] font-light text-ink sm:whitespace-pre-line">
                {opening.title}
              </h1>
            </Reveal>

            <Reveal
              delay={0.1}
              scale={0.97}
              className="relative mt-[clamp(56px,9vh,104px)] pb-[clamp(24px,6vw,56px)]"
            >
              {/* Nhánh botanical mọc lên từ phía sau tấm ảnh nhỏ — đứng
                  trước trong DOM nên bị viền warm của tấm ảnh đè lên đúng
                  chỗ hai thứ giao nhau, đọc ra là nhánh "mọc ra từ sau ảnh"
                  chứ không phải một hình dán rời rạc bên cạnh. */}
              <BotanicalAccent
                variant="branch"
                opacity={0.55}
                depth={5}
                className="absolute top-[17%] right-[3%] hidden h-[35%] w-[13%] sm:block"
              />

              <div className="relative aspect-[2/3] w-[62%] overflow-hidden rounded-[3px] bg-warm sm:w-[58%]">
                <Image
                  src={heroPhotos[0].src}
                  alt={heroPhotos[0].alt}
                  fill
                  priority
                  sizes="(max-width: 639px) 62vw, (max-width: 1023px) 44vw, 560px"
                  className="object-cover"
                />
              </div>

              {/* Tấm thứ hai: nghiêng nhẹ, viền giấy ảnh màu warm + bóng rất
                  mờ — đúng cảm giác một tấm ảnh vừa được đặt chồng lên, không
                  phải một ô khác trong cùng một lưới. */}
              <div className="absolute -bottom-[clamp(24px,6vw,56px)] right-0 w-[40%] rotate-3 rounded-[3px] border-[6px] border-warm bg-warm shadow-[0_18px_36px_rgba(61,57,53,0.16)] sm:w-[34%]">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[1px]">
                  <Image
                    src={heroPhotos[1].src}
                    alt={heroPhotos[1].alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 639px) 32vw, (max-width: 1023px) 22vw, 260px"
                    className="object-cover"
                  />
                </div>
              </div>
            </Reveal>

            {/* Dòng gợi cuộn: chuyển xuống dưới ảnh, căn giữa trang — một nét
                kẻ dọc mảnh, chữ nhỏ, rồi một mũi tên hướng xuống. */}
            <Reveal
              delay={0.15}
              className="mt-10 flex flex-col items-center text-center sm:mt-14"
            >
              <span
                aria-hidden="true"
                className="block h-10 w-px bg-champagne/60"
              />
              <p className="wd-eyebrow mt-4 text-[11px] tracking-[0.3em] text-taupe/85">
                {opening.hint}
              </p>
              <ChevronDown
                aria-hidden="true"
                strokeWidth={1.5}
                className="mt-2 h-4 w-4 text-taupe/70"
              />
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------------------------
            02–04 · Ba chương của ngày chụp, mỗi chương là một xấp trang lật
            được. AlbumBook tự lo padding và bề ngang của mình: các trang phải
            được phép quét ra NGOÀI khung 1100px khi lật sang trái, nên không
            bọc nó trong một khung cố định như hai section trên/dưới.
        --------------------------------------------------------------- */}
        <AlbumBook chapters={chapters} />

        {/* ---------------------------------------------------------------
            05 · Khép album — khoảng trắng lớn, hai câu cảm ơn. Tấm ảnh cuối
            cùng KHÔNG còn nằm ở đây: nó chuyển xuống làm nền của footer ngay
            bên dưới, để "ảnh cuối cùng" đúng nghĩa là điều người xem nhìn
            thấy sau cùng trước khi rời trang, chứ không phải một khối ảnh ở
            giữa hai đoạn chữ.
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
        </section>

        {/* ---------------------------------------------------------------
            Chữ ký khép lại + đường về thiệp cưới — tấm ảnh cuối cùng của
            album làm nền tràn viền ở MỌI bề rộng màn, chữ đè lên trên, một
            lớp phủ ivory mờ dần để chữ vẫn đọc rõ. Đúng pattern của
            Closing.tsx ở trang chủ, kể cả phần đánh đổi: ảnh gốc là khung
            NGANG (3:2) nên ở khung dọc của điện thoại object-cover cắt mất
            phần lớn bề ngang, chỉ còn lại khoảng giữa ảnh.
        --------------------------------------------------------------- */}
        <footer className="relative isolate flex w-full flex-col items-center justify-center overflow-hidden px-5 py-16 md:min-h-[74svh] md:py-32">
          {/* Ảnh cuối album làm nền — cắt hai kiểu theo bề rộng màn, giống hệt
              footer trang chủ (components/wedding/Closing.tsx), xem ghi chú
              đầy đủ ở đó.

              Desktop: tràn viền, object-cover chỉ xén trên/dưới. */}
          <div className="absolute inset-0 -z-10 hidden md:block">
            <Image
              src={closing.src}
              alt={closing.alt}
              fill
              loading="lazy"
              sizes="100vw"
              className="object-cover object-center"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-ivory/55" />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-ivory/40 via-ivory/25 to-ivory/70"
            />
          </div>

          {/* Mobile: khung nền giữ đúng tỉ lệ gốc 3:2 và rộng hết bề ngang
              màn — ảnh không bị xén — canh giữa footer, hai mép tan vào ivory
              để vẫn đọc ra là nền nằm sau chữ. */}
          <div className="absolute inset-x-0 top-1/2 -z-10 w-full -translate-y-1/2 md:hidden">
            <div className="relative aspect-[3/2] w-full">
              <Image
                src={closing.src}
                alt={closing.alt}
                fill
                loading="lazy"
                sizes="100vw"
                className="object-cover object-center"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-ivory/45" />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(249,247,242,1)_0%,rgba(249,247,242,0.18)_18%,rgba(249,247,242,0.18)_82%,rgba(249,247,242,1)_100%)]"
              />
            </div>
          </div>

          <BotanicalAccent
            variant="sprig"
            opacity={0.24}
            depth={5}
            className="-right-[2vw] -bottom-[6vh] hidden h-[34vh] w-[19vh] md:block"
          />

          <Reveal className="flex w-full max-w-[640px] flex-col items-center px-1 text-center md:px-0">
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
