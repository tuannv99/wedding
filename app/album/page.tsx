import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { Navigation } from "@/components/wedding/Navigation";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { wedding } from "@/lib/wedding";
import { AlbumChapters } from "@/app/album/AlbumChapters";
import { ChapterRail } from "@/app/album/ChapterRail";

export const metadata: Metadata = {
  title: `Album · ${wedding.groom.short} & ${wedding.bride.short}`,
  description:
    "Toàn bộ album ảnh cưới của Văn Tuấn & Mai Hoa, chia theo từng buổi chụp.",
};

const { chapters, hero: heroPhotos, closing } = wedding.album;
const TOTAL_PHOTOS = chapters.reduce((sum, c) => sum + c.photos.length, 0);

export default function AlbumPage() {
  return (
    <>
      <EnsureOpened />
      <Navigation />

      <main className="w-full bg-ivory">
        {/* ---------------------------------------------------------------
            Hero album
        --------------------------------------------------------------- */}
        <section className="relative isolate w-full overflow-hidden px-6 pt-24 pb-14 md:px-10 md:pt-[112px] lg:h-[76svh] lg:pb-[clamp(32px,6svh,88px)]">
          <BotanicalAccent
            variant="branch"
            opacity={0.3}
            depth={6}
            className="-top-[6vh] -left-[3vw] hidden h-[58vh] w-[22vh] lg:block"
          />

          <div className="mx-auto grid h-full w-full max-w-[1300px] grid-cols-1 items-end gap-10 lg:grid-cols-[1fr_0.92fr] lg:gap-[clamp(32px,5vw,88px)]">
            {/* --- Cột chữ --- */}
            <Reveal y={20} className="min-w-0">
              <p className="wd-eyebrow text-taupe">
                {wedding.groom.short} &amp; {wedding.bride.short} ·{" "}
                <span className="wd-num">{wedding.date.display}</span>
              </p>

              {/*
                Bản gốc dùng font script Parisienne cho chữ "Our". Font đó đã
                được gỡ khỏi dự án khi toàn site gộp về một font chữ, nên ở đây
                dùng Cormorant italic — vẫn là một nét viết nghiêng chờm xuống
                tiêu đề, nhưng không kéo thêm font thứ ba vào trang.
              */}
              <p
                aria-hidden="true"
                className="font-display mt-6 -mb-[0.34em] translate-x-[0.06em] text-[clamp(2rem,4.2vw,3.5rem)] leading-none text-taupe/85 italic"
              >
                Our
              </p>

              <h1 className="font-display text-[clamp(3.25rem,8.4vw,8.5rem)] leading-[0.95] font-light tracking-[0.09em] text-ink uppercase">
                Album
              </h1>

              <span
                aria-hidden="true"
                className="mt-7 block h-px w-[64px] bg-champagne/70"
              />

              <p className="wd-quote mt-6 max-w-[28ch] text-[clamp(1.05rem,1.8vw,1.5rem)]">
                Ba buổi chụp, <span className="wd-num">{TOTAL_PHOTOS}</span>{" "}
                khoảnh khắc chúng mình giữ lại.
              </p>

              <Link href="/" className="wd-btn-ghost mt-9">
                Về thiệp cưới
              </Link>
            </Reveal>

            {/* --- Cột ảnh: hai tấm 4:5 lệch tầng --- */}
            <Reveal
              delay={0.12}
              y={22}
              className="grid min-w-0 grid-cols-2 gap-[clamp(10px,1.4vw,18px)]"
            >
              {heroPhotos.map((photo, index) => (
                <div
                  key={photo.src}
                  className={index === 0 ? "translate-y-[-34px]" : undefined}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] bg-warm">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      priority
                      sizes="(max-width: 1023px) 46vw, 300px"
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------------------------
            Thân album: rail mục lục + các chapter
        --------------------------------------------------------------- */}
        <div className="mx-auto w-full max-w-[1300px] px-6 pb-[clamp(72px,11vh,132px)] md:px-10">
          <div className="grid grid-cols-1 gap-[clamp(24px,4vw,64px)] lg:grid-cols-[200px_minmax(0,1fr)]">
            <ChapterRail
              chapters={chapters.map((c) => ({ id: c.id, title: c.title }))}
            />
            <AlbumChapters chapters={chapters} />
          </div>

          {/* Ảnh ngang khép lại CẢ album. Cố ý nằm ngoài mọi <section> chapter:
              nó thuộc về toàn album chứ không riêng buổi chụp cuối — và buổi
              cuối (Áo dài) cũng không có khung ảnh ngang nào để dùng. */}
          <Reveal delay={0.1} y={18} className="mt-[clamp(72px,11vh,132px)]">
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[3px] bg-warm">
              <Image
                src={closing.src}
                alt={closing.alt}
                fill
                loading="lazy"
                sizes="(max-width: 1023px) 92vw, 1220px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>

        {/* ---------------------------------------------------------------
            Footer album
        --------------------------------------------------------------- */}
        <footer className="relative isolate w-full overflow-hidden border-t border-taupe/20 px-6 py-[clamp(72px,12vh,140px)] md:px-10">
          <BotanicalAccent
            variant="sprig"
            opacity={0.24}
            depth={5}
            className="-right-[2vw] -bottom-[6vh] hidden h-[34vh] w-[19vh] md:block"
          />

          <Reveal className="mx-auto flex max-w-[640px] flex-col items-center text-center">
            {/* Cố ý KHÔNG dùng chữ viết tay ở đây — chỉ Cormorant 300 viết hoa,
                giãn chữ rộng, để phần kết đọc như một dòng khắc chứ không phải
                một chữ ký thứ hai cạnh tên cô dâu chú rể. */}
            <p className="font-display text-[clamp(0.95rem,1.5vw,1.2rem)] font-light tracking-[0.14em] text-taupe uppercase">
              Thank you for looking
            </p>

            <p className="wd-display mt-8 text-[clamp(2.25rem,8vw,4.5rem)] uppercase">
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
