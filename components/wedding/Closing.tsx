import Image from "next/image";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";

export function Closing() {
  const { closing } = wedding.images;

  return (
    <footer className="relative isolate flex min-h-[85svh] w-full items-center justify-center overflow-hidden px-6 py-28">
      <div className="absolute inset-0 -z-10">
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

      {/* Hai nhánh ở hai mép dưới như bản design — nhưng cố ý lệch nhau về kích
          thước và độ mờ để không thành một cặp đối xứng kiểu template. */}
      <BotanicalAccent
        variant="branch"
        opacity={0.26}
        depth={5}
        flip
        className="-bottom-[8vh] -left-[4vw] hidden h-[52vh] w-[21vh] md:block"
      />
      <BotanicalAccent
        variant="sprig"
        opacity={0.2}
        depth={4}
        className="-right-[3vw] -bottom-[5vh] hidden h-[36vh] w-[20vh] md:block"
      />

      {/* Thứ tự theo bản design: lời cảm ơn viết tay → tên → ngày */}
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <Reveal>
          <p aria-hidden="true" className="wd-script whitespace-pre-line text-taupe/85">
            {wedding.copy.script.closing}
          </p>
          {/* Bản tiếng Việt cho phần đọc màn hình + khách không thấy font script */}
          <p className="sr-only">{wedding.copy.closing.thanks}</p>
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
          <p className="wd-eyebrow text-ink/70">{wedding.date.display}</p>
        </Reveal>

        <Reveal delay={0.42}>
          <Botanical variant="mark" className="mt-12 h-5 w-16 text-sage/75" />
        </Reveal>
      </div>
    </footer>
  );
}
