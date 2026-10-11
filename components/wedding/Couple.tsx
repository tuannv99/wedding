import Image from "next/image";
import { wedding, type GalleryImage } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { PhotoZoom } from "@/components/wedding/PhotoZoom";

/** "CÔ DÂU" / "CHÚ RỂ": tên + ảnh lấy nguyên từ lib/wedding.ts. */
export function Couple() {
  const { bride, groom } = wedding;

  const people = [
    { label: "Cô dâu", name: bride.name, portrait: bride.portrait },
    { label: "Chú rể", name: groom.name, portrait: groom.portrait },
  ];
  const portraits = people.map((person) => person.portrait);

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
          <p className="wd-eyebrow tracking-[0.4em] font-semibold text-ink/85 md:text-[25px]">Lễ Thành Hôn</p>
          <hr className="wd-rule" />
        </Reveal>

        <div className="mt-8 md:mt-14">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-[clamp(24px,5vw,72px)]">
            {/* Cột trái */}
            <Reveal y={20}>
              <PersonColumn {...people[0]} portraits={portraits} index={0} />
            </Reveal>

            {/* Cột giữa: nét dọc trên desktop, đổi thành divider ngang dưới md */}
            <Reveal delay={0.08} className="flex w-full flex-row items-center justify-center gap-4 md:h-auto md:w-auto md:flex-col md:gap-5">
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-champagne/45 md:h-[clamp(40px,7vh,72px)] md:w-px md:flex-none"
              />
              <span className="font-display text-[clamp(1.75rem,3vw,2.75rem)] md:text-[clamp(calc(1.75rem_+_8px),calc(3vw_+_8px),calc(2.75rem_+_8px))] leading-none text-champagne italic">
                &amp;
              </span>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-champagne/45 md:h-[clamp(40px,7vh,72px)] md:w-px md:flex-none"
              />
            </Reveal>

            {/* Cột phải */}
            <Reveal delay={0.15} y={20}>
              <PersonColumn {...people[1]} portraits={portraits} index={1} />
            </Reveal>
          </div>
        </div>

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
  /** Cả hai chân dung — lightbox lướt qua lại được giữa cô dâu và chú rể. */
  portraits: readonly GalleryImage[];
  index: number;
};

function PersonColumn({ label, name, portrait, portraits, index }: PersonColumnProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="wd-eyebrow tracking-[0.4em] font-semibold text-ink/85 md:text-[25px]">{label}</span>

      {/* 300×425: cao hơn khung 4:5 cũ (300×375) đúng 50px ở bề ngang tối đa. */}
      <figure className="relative mt-6 aspect-[300/425] w-full max-w-[300px] overflow-hidden bg-warm">
        <PhotoZoom images={portraits} index={index} className="absolute inset-0">
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            loading="eager"
            /* sync: xem Gallery.tsx — tránh ô trống nháy khi cuộn quay lại */
            decoding="sync"
            sizes="(max-width: 768px) 80vw, 300px"
            className="object-cover"
          />
        </PhotoZoom>
        {/* pointer-events-none: bấm vào vùng tên vẫn rơi xuống nút ảnh bên dưới. */}
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-ivory/94 via-ivory/72 to-ivory/0 px-4 pt-14 pb-[22px]">
          <span className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] md:text-[clamp(calc(1.75rem_+_8px),calc(3.6vw_+_8px),calc(2.5rem_+_8px))] font-light tracking-[0.06em] text-ink">
            {name}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
