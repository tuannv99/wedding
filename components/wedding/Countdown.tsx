"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";

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
      className="w-full bg-ivory px-6 py-24 md:px-5 md:py-32"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
        <Reveal className="flex flex-col items-center gap-5">
          <span className="wd-eyebrow">{wedding.copy.countdown.eyebrow}</span>
          <hr className="wd-rule" />
        </Reveal>

        {isOver ? (
          <Reveal delay={0.1} className="mt-14">
            <p className="wd-h1 tracking-[0.06em]">
              {wedding.copy.countdown.finished}{" "}
              <span className="text-champagne">♡</span>
            </p>
          </Reveal>
        ) : (
          <Reveal delay={0.1} className="mt-14 flex w-full flex-col items-center md:mt-16">
            {/*
              Luôn 4 cột, kể cả mobile — khách xem trên điện thoại vẫn thấy
              ngày/giờ/phút/giây trên cùng một dòng.
              Để vừa màn hẹp: gap 24px, số hạ min xuống 2.5rem
              (mốc này chỉ ăn dưới 400px nên desktop không đổi), và nhãn thu
              letter-spacing lại vì 0.4em làm chữ "NGÀY" rộng hơn cả con số.
            */}
            <div
              className="grid grid-cols-4 gap-x-6 sm:gap-x-12 md:gap-x-16"
              aria-live="off"
            >
              {UNITS.map(({ key, label }) => (
                <div key={key} className="flex min-w-0 flex-col items-center gap-3">
                  <span className="wd-numeral whitespace-nowrap text-[clamp(2.5rem,10vw,4.5rem)] tracking-[0.04em] tabular-nums">
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

            <span className="wd-eyebrow mt-12">
              {wedding.copy.countdown.untilLabel}
            </span>
          </Reveal>
        )}
      </div>
    </section>
  );
}
