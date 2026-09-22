import Image from "next/image";
import { wedding, type GalleryImage } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";

/** "CÔ DÂU" / "CHÚ RỂ": tên + ảnh lấy nguyên từ lib/wedding.ts. */
export function Couple() {
  const { bride, groom } = wedding;

  const people = [
    { label: "Cô dâu", name: bride.name, portrait: bride.portrait },
    { label: "Chú rể", name: groom.name, portrait: groom.portrait },
  ];

  return (
    <section
      id="couple"
      className="relative isolate w-full overflow-hidden bg-ivory px-6 py-16 md:px-5 md:py-[132px]"
    >
      <BotanicalAccent
        variant="sprig"
        opacity={0.26}
        depth={5}
        flip
        className="-top-[6%] -right-[3vw] hidden h-[36vh] w-[20vh] lg:block"
      />

      <div className="mx-auto w-full max-w-5xl">
        <Reveal className="flex flex-col items-center gap-4">
          <p className="wd-eyebrow tracking-[0.4em]">Lễ Thành Hôn</p>
          <hr className="wd-rule" />
        </Reveal>

        <Reveal delay={0.1} y={20} className="mt-8 md:mt-14">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-[clamp(24px,5vw,72px)]">
            {/* Cột trái */}
            <PersonColumn {...people[0]} />

            {/* Cột giữa: nét dọc trên desktop, đổi thành divider ngang dưới md */}
            <div className="flex w-full flex-row items-center justify-center gap-4 md:h-auto md:w-auto md:flex-col md:gap-5">
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-champagne/45 md:h-[clamp(40px,7vh,72px)] md:w-px md:flex-none"
              />
              <span className="font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-none text-champagne italic">
                &amp;
              </span>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-champagne/45 md:h-[clamp(40px,7vh,72px)] md:w-px md:flex-none"
              />
            </div>

            {/* Cột phải */}
            <PersonColumn {...people[1]} />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-8 flex justify-center md:mt-14">
          <Botanical variant="mark" className="h-5 w-14 text-sage/65" />
        </Reveal>
      </div>
    </section>
  );
}

type PersonColumnProps = {
  label: string;
  name: string;
  portrait: GalleryImage;
};

function PersonColumn({ label, name, portrait }: PersonColumnProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="wd-eyebrow tracking-[0.4em]">{label}</span>

      <figure className="relative mt-6 aspect-[4/5] w-full max-w-[300px] overflow-hidden bg-warm">
        <Image
          src={portrait.src}
          alt={portrait.alt}
          fill
          sizes="(max-width: 768px) 80vw, 300px"
          className="object-cover"
        />
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-ivory/94 via-ivory/72 to-ivory/0 px-4 pt-14 pb-[22px]">
          <span aria-hidden="true" className="h-px w-[34px] bg-champagne/90" />
          <span className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] font-light tracking-[0.06em] text-ink">
            {name}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
