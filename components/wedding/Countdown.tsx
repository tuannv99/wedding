"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { Botanical, BotanicalRule } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const UNITS: { key: keyof Remaining; label: string }[] = [
  { key: "days", label: wedding.copy.countdown.units.days },
  { key: "hours", label: wedding.copy.countdown.units.hours },
  { key: "minutes", label: wedding.copy.countdown.units.minutes },
  { key: "seconds", label: wedding.copy.countdown.units.seconds },
];

const TARGET = new Date(wedding.date.target).getTime();

function getRemaining(now: number): Remaining | null {
  const diff = TARGET - now;
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  };
}

export function Countdown() {
  /**
   * `mounted` giữ cho lần render đầu (server + client hydrate) giống nhau tuyệt đối:
   * server không biết "now" nên chỉ render placeholder "--", số thật chỉ chạy sau khi mount.
   */
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(Date.now()));

    tick();
    setMounted(true);

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isOver = mounted && remaining === null;

  return (
    <section
      aria-label="Đếm ngược tới ngày cưới"
      className="relative isolate w-full overflow-hidden bg-ivory px-6 pt-16 pb-14 md:px-5 md:pt-20 md:pb-16"
    >
      {/* Sprig mép phải — giữ cỡ 36vh, opacity tăng nhẹ so với chuẩn chung
          (0.26 → 0.30) để rõ hơn một chút trong khối Countdown → Timeline. */}
      <BotanicalAccent
        variant="sprig"
        opacity={0.3}
        depth={5}
        className="top-[20%] -right-[2vw] hidden h-[36vh] w-[20vh] lg:block"
      />

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
        <Reveal className="flex flex-col items-center gap-4">
          <span className="wd-eyebrow">{wedding.copy.countdown.eyebrow}</span>
          <Botanical variant="mark" className="h-4 w-11 text-sage/70" />
        </Reveal>

        {isOver ? (
          <Reveal delay={0.1} className="mt-14">
            <p className="wd-h1 flex flex-wrap items-center justify-center gap-4 tracking-[0.06em]">
              {wedding.copy.countdown.finished}
              <Botanical variant="mark" className="h-5 w-14 text-sage/70" />
            </p>
          </Reveal>
        ) : (
          <Reveal delay={0.1} className="mt-10 flex w-full flex-col items-center md:mt-12">
            {/*
              Luôn MỘT hàng 4 cột, kể cả mobile: khách xem trên điện thoại vẫn
              thấy ngày/giờ/phút/giây trên cùng một dòng.
              Để vừa màn hẹp thì chỉ mobile bị thu lại (gap 20px, số hạ xuống
              10vw); từ sm trở lên giữ nguyên cỡ cũ.
              Nhãn thu letter-spacing lại vì 0.4em làm chữ "NGÀY" rộng hơn
              cả con số.
            */}
            <div
              className="grid grid-cols-4 gap-x-5 sm:gap-x-12 md:gap-x-16"
              aria-live="off"
            >
              {UNITS.map(({ key, label }) => (
                <div key={key} className="flex min-w-0 flex-col items-center gap-3">
                  <span className="wd-numeral whitespace-nowrap text-[clamp(2.25rem,10vw,6.25rem)] tracking-[0.04em] tabular-nums sm:text-[clamp(3.25rem,12vw,6.25rem)]">
                    {remaining
                      ? String(remaining[key]).padStart(2, "0")
                      : "--"}
                  </span>
                  <span className="wd-eyebrow tracking-[0.18em] sm:tracking-[0.4em]">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <span className="wd-eyebrow mt-10">
              {wedding.copy.countdown.untilLabel}
            </span>
          </Reveal>
        )}

        {/* Divider rất nhỏ nối sang "NGÀY VUI" — dùng lại đúng BotanicalRule
            chung toàn site thay vì thêm asset/icon mới. */}
        <BotanicalRule className="mt-10 md:mt-12" lineClassName="w-8 sm:w-12" />
      </div>
    </section>
  );
}
