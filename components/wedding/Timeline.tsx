"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function Timeline() {
  const [activeId, setActiveId] = useState(wedding.timeline[0].id);
  const schedule =
    wedding.timeline.find((item) => item.id === activeId) ?? wedding.timeline[0];

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

        <Reveal delay={0.1} className="mt-14 flex flex-col items-center md:mt-16">
          {/* Chọn nghi lễ — gạch chân trượt đúng kiểu mục đang xem trên
              Navigation, chỉ đổi cỡ chữ cho vừa vai trò phụ của tab. */}
          <div
            role="tablist"
            aria-label="Chọn nghi lễ"
            className="flex items-center gap-8 sm:gap-12"
          >
            {wedding.timeline.map((item) => {
              const isActive = item.id === activeId;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`timeline-tab-${item.id}`}
                  aria-selected={isActive}
                  aria-controls={`timeline-panel-${item.id}`}
                  onClick={() => setActiveId(item.id)}
                  className={cn(
                    "wd-nav-link relative pb-2.5 text-[13px] tracking-[0.24em] transition-colors duration-300 sm:text-[14px]",
                    isActive ? "text-ink" : "text-ink/50",
                  )}
                >
                  {item.label}
                  {isActive ? (
                    <motion.span
                      layoutId="timeline-tab-underline"
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[1.5px] bg-ink"
                      transition={{ duration: 0.28, ease: EASE_OUT }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Nội dung đổi theo tab — fade + dịch nhẹ (~0.28s), không dùng
              vertical timeline dài như bản cũ để mỗi nghi lễ gọn trên một
              màn hình, kể cả mobile. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={schedule.id}
              role="tabpanel"
              id={`timeline-panel-${schedule.id}`}
              aria-labelledby={`timeline-tab-${schedule.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="mt-9 flex w-full flex-col items-center sm:mt-10"
            >
              <span className="wd-label tracking-[0.3em] text-taupe">
                {schedule.venue}
              </span>

              <ol className="mt-8 w-full max-w-sm sm:mt-9">
                {schedule.items.map((entry, index) => {
                  const isLast = index === schedule.items.length - 1;

                  return (
                    <li
                      key={entry.time}
                      className="relative grid grid-cols-[3.5rem_1px_1fr] items-stretch gap-x-5 sm:grid-cols-[4.5rem_1px_1fr] sm:gap-x-6"
                    >
                      <span
                        className={cn(
                          "wd-label wd-num pt-1 text-right text-[13px] text-ink/70 sm:text-sm",
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
                          "wd-body-serif -mt-0.5 text-[clamp(1.05rem,3.4vw,1.375rem)] leading-snug",
                          isLast ? "pb-0" : "pb-5 sm:pb-6",
                        )}
                      >
                        {entry.title}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
