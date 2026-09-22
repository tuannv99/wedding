import Image from "next/image";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { GiftCTA } from "@/components/wedding/GiftCTA";

export function Closing() {
  const { closing } = wedding.images;

  return (
    <footer className="relative isolate flex w-full flex-col items-center overflow-hidden bg-ivory md:min-h-[85svh] md:justify-center md:px-5 md:py-40">
      {/*
        Desktop: ảnh tràn viền phủ toàn footer, chữ đè lên như bản design.

        Mobile: ảnh gốc là khung NGANG (2200×1467, tỉ lệ ~3:2) — nhét vào một
        footer cao gần hết màn hình trên điện thoại (khung DỌC) buộc object-cover
        phải crop bỏ phần lớn bề ngang, kết quả chỉ còn thấy một mảnh nhỏ giữa
        ảnh (thường mất luôn một trong hai người). Nên ở mobile tách ảnh ra
        thành một khối riêng đúng tỉ lệ gốc (aspect-[3/2], không crop ngang),
        đặt phía trên khối chữ, thay vì làm nền tràn viền cho cả footer.
      */}
      <div className="hidden md:absolute md:inset-0 md:-z-10 md:block">
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

      <div className="relative aspect-[3/2] w-full md:hidden">
        <Image
          src={closing.src}
          alt={closing.alt}
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Mờ dần vào nền ivory ở đáy để nối mượt sang khối chữ bên dưới. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ivory"
        />
      </div>

      {/* Branch mép trái + sprig mép phải, đúng cỡ chuẩn hoá dùng chung toàn
          site: branch 62vh/0.32, sprig 36vh/0.26. */}
      <BotanicalAccent
        variant="branch"
        opacity={0.32}
        depth={5}
        flip
        className="-bottom-[8vh] -left-[4vw] hidden h-[62vh] w-[24vh] lg:block"
      />
      <BotanicalAccent
        variant="sprig"
        opacity={0.26}
        depth={4}
        className="-right-[3vw] -bottom-[5vh] hidden h-[36vh] w-[20vh] lg:block"
      />

      {/* Thứ tự theo bản design: lời cảm ơn → tên → ngày */}
      <div className="flex w-full max-w-2xl flex-col items-center px-6 pt-12 pb-16 text-center md:px-0 md:py-0">
        <Reveal>
          <p className="wd-body-serif whitespace-pre-line">
            {wedding.copy.closing.thanks}
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="wd-display mt-12 text-[clamp(2.5rem,11vw,5.5rem)] uppercase md:mt-16">
            {wedding.groom.short}
            <span className="mx-3 text-champagne italic lowercase">&amp;</span>
            {wedding.bride.short}
          </p>
        </Reveal>

        <Reveal delay={0.3} className="mt-8 flex flex-col items-center gap-7">
          <span aria-hidden="true" className="h-px w-16 bg-ink/25" />
          <p className="wd-eyebrow wd-num text-ink/70">{wedding.date.display}</p>
        </Reveal>

        <Reveal delay={0.42}>
          <Botanical variant="mark" className="mt-12 h-5 w-16 text-sage/75" />
        </Reveal>

        {/* Kín đáo, đặt cuối cùng — không phải một section mừng cưới lớn. */}
        <Reveal delay={0.5} className="mt-10">
          <GiftCTA />
        </Reveal>
      </div>
    </footer>
  );
}
