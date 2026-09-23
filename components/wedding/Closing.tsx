import Image from "next/image";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { GiftCTA } from "@/components/wedding/GiftCTA";

export function Closing() {
  const { closing } = wedding.images;

  return (
    <footer className="relative isolate flex w-full flex-col items-center justify-center overflow-hidden bg-ivory px-5 py-16 md:min-h-[85svh] md:py-40">
      {/*
        Ảnh khép thiệp làm nền, chữ đè lên trên — nhưng cắt ảnh theo hai cách
        khác nhau, vì ảnh gốc là khung NGANG (2200×1467) còn màn điện thoại
        thì dọc.

        Desktop: khung nhìn cũng nằm ngang nên ảnh tràn viền được, object-cover
        chỉ xén bớt trên/dưới mà vẫn giữ nguyên bề ngang — cả hai người còn đủ.
      */}
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

      {/*
        Mobile: nếu để ảnh tràn viền cả footer thì object-cover phải xén theo
        BỀ NGANG — một footer 390×660 chỉ giữ lại đúng 37% giữa ảnh, tức mất
        hẳn chú rể ở mép phải. Nên ở đây khung nền giữ đúng tỉ lệ gốc 3:2 và
        rộng hết bề ngang màn: ảnh không bị xén một milimet nào.

        Khung đó canh giữa theo trục dọc của footer và mép trên/mép dưới tan
        dần vào ivory, nên nó vẫn là NỀN nằm sau khối chữ (đúng ý "ảnh làm
        background"), không quay lại thành một khối ảnh riêng đặt phía trên
        khối chữ như bản cũ. Chữ chạy qua ảnh ở khoảng giữa — chỗ có cô dâu,
        tà voan và vòm đá — rồi ra ngoài nền ivory ở hai đầu.
      */}
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
          {/* Ivory đặc ở đúng hai mép rồi nhạt nhanh: mép ảnh tan vào nền thay
              vì cắt ngang thành một đường thẳng. Ở khoảng giữa (18–82%) lớp
              phủ chỉ còn 0.18 — cộng với 0.45 bên trên là ~0.55, đúng bằng độ
              phủ của bản desktop. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(249,247,242,1)_0%,rgba(249,247,242,0.18)_18%,rgba(249,247,242,0.18)_82%,rgba(249,247,242,1)_100%)]"
          />
        </div>
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
      <div className="flex w-full max-w-2xl flex-col items-center px-1 text-center md:px-0">
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
