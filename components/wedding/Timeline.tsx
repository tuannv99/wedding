import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { cn } from "@/lib/utils";

export function Timeline() {
  return (
    <section
      id="our-day"
      className="relative isolate w-full overflow-hidden bg-ivory px-6 pt-8 pb-16 md:px-5 md:pt-14 md:pb-40"
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
          titleClassName="text-[clamp(40px,5.6vw,68px)] md:text-[clamp(48px,calc(5.6vw_+_8px),76px)]"
        />

        <Reveal delay={0.1} className="mt-14 flex flex-col items-center md:mt-16">
          {/* w-fit + mx-auto: danh sách chỉ rộng vừa nội dung nên căn giữa đúng theo
            tiêu đề, thay vì một khung max-w-sm mà chữ dồn sang trái. */}
          <ol className="mx-auto w-fit max-w-full">
            {wedding.timeline.map((entry, index) => {
              const isLast = index === wedding.timeline.length - 1;

              return (
                <li
                  key={entry.time}
                  className="relative grid grid-cols-[3.5rem_1px_1fr] items-stretch gap-x-5 sm:grid-cols-[4.5rem_1px_1fr] sm:gap-x-6"
                >
                  <span
                    className={cn(
                      "wd-label wd-num pt-1 text-right text-[13px] text-ink/70 sm:text-sm md:text-[22px]",
                      isLast ? "pb-0" : "pb-5 sm:pb-6",
                    )}
                  >
                    {entry.time}
                  </span>

                  {/* Đường line mảnh + điểm mốc — đúng ngôn ngữ decoration
                      của bản cũ, chỉ rút ngắn cho vừa nhịp gọn hơn. */}
                  <span
                    aria-hidden="true"
                    className={cn("relative w-px bg-taupe/35", isLast && "h-5")}
                  >
                    <span className="absolute -top-0.5 -left-[2px] h-[5px] w-[5px] rounded-full bg-champagne" />
                  </span>

                  <span
                    className={cn(
                      "wd-body-serif -mt-0.5 text-[clamp(1.05rem,3.4vw,1.375rem)] md:text-[clamp(calc(1.05rem_+_8px),calc(3.4vw_+_8px),calc(1.375rem_+_8px))] leading-snug",
                      isLast ? "pb-0" : "pb-5 sm:pb-6",
                    )}
                  >
                    {entry.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
