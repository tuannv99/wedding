import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

export function Timeline() {
  return (
    <section
      id="our-day"
      className="w-full bg-warm px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto w-full max-w-3xl">
        <SectionHeading label="Chương trình" title="Our Day" />

        <ol className="mt-20 md:mt-24">
          {wedding.timeline.map((item, index) => {
            const isLast = index === wedding.timeline.length - 1;

            return (
              <Reveal key={item.time} delay={index * 0.1}>
                {/* padding-bottom nằm ở cột chữ (không ở <li>) để cột line
                    có thể cao hết hàng -> đường kẻ liền mạch giữa các mốc */}
                <li className="relative grid grid-cols-[4.5rem_1px_1fr] items-stretch gap-x-6 sm:grid-cols-[7rem_1px_1fr] sm:gap-x-10">
                  <span
                    className={cn(
                      "wd-label pt-2 text-right text-taupe",
                      isLast ? "pb-0" : "pb-14 sm:pb-16",
                    )}
                  >
                    {item.time}
                  </span>

                  {/* Đường line mảnh + điểm mốc */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative w-px bg-taupe/25",
                      isLast && "h-7",
                    )}
                  >
                    <span className="absolute -top-0.5 -left-[2px] h-[5px] w-[5px] rounded-full bg-champagne" />
                  </span>

                  <span
                    className={cn(
                      "wd-h1 -mt-2 text-[clamp(1.5rem,5vw,2.25rem)] tracking-[0.04em]",
                      isLast ? "pb-0" : "pb-14 sm:pb-16",
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
