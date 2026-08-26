import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { cn } from "@/lib/utils";

export function Timeline() {
  return (
    <section
      id="our-day"
      className="relative isolate w-full overflow-hidden bg-ivory px-6 pt-10 pb-28 md:px-5 md:pt-14 md:pb-40"
    >
      {/* Branch mép trái — giữ cỡ 62vh, opacity tăng nhẹ so với chuẩn chung
          (0.32 → 0.37) cho khối Countdown → Timeline rõ hơn một chút. */}
      <BotanicalAccent
        variant="branch"
        opacity={0.37}
        depth={6}
        flip
        className="top-[8%] -left-[4vw] hidden h-[62vh] w-[24vh] lg:block"
      />

      <div className="mx-auto w-full max-w-3xl">
        <SectionHeading
          label={wedding.copy.timeline.eyebrow}
          title={wedding.copy.timeline.title}
          titleClassName="text-[clamp(40px,5.6vw,68px)]"
        />

        <ol className="mt-16 md:mt-20">
          {wedding.timeline.map((item, index) => {
            const isLast = index === wedding.timeline.length - 1;

            return (
              <Reveal key={item.time} delay={index * 0.1}>
                {/* padding-bottom nằm ở cột chữ (không ở <li>) để cột line
                    có thể cao hết hàng -> đường kẻ liền mạch giữa các mốc */}
                <li className="relative grid grid-cols-[4.5rem_1px_1fr] items-stretch gap-x-6 sm:grid-cols-[7rem_1px_1fr] sm:gap-x-10">
                  <span
                    className={cn(
                      "wd-label pt-2 text-right text-ink/70",
                      isLast ? "pb-0" : "pb-12 sm:pb-14",
                    )}
                  >
                    {item.time}
                  </span>

                  {/* Đường line mảnh + điểm mốc */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative w-px bg-taupe/35",
                      isLast && "h-7",
                    )}
                  >
                    <span className="absolute -top-0.5 -left-[2px] h-[5px] w-[5px] rounded-full bg-champagne" />
                  </span>

                  <span
                    className={cn(
                      "wd-h1 -mt-2 text-[clamp(1.6rem,5.5vw,2.5rem)] tracking-[0.04em]",
                      isLast ? "pb-0" : "pb-12 sm:pb-14",
                    )}
                  >
                    {item.title}
                  </span>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
