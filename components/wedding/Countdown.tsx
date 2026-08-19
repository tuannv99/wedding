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
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
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
      className="w-full bg-ivory px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
        <Reveal className="flex flex-col items-center gap-5">
          <span className="label">Counting down</span>
          <span aria-hidden="true" className="h-px w-10 bg-champagne" />
        </Reveal>

        {isOver ? (
          <Reveal delay={0.1} className="mt-14">
            <p className="font-display text-[clamp(2rem,8vw,3.5rem)] leading-tight tracking-[0.06em] text-ink">
              Today is the day <span className="text-champagne">♡</span>
            </p>
          </Reveal>
        ) : (
          <Reveal delay={0.1} className="mt-14 w-full md:mt-16">
            <div
              className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4 sm:gap-x-4"
              aria-live="off"
            >
              {UNITS.map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center gap-3">
                  <span className="font-display text-[clamp(2.75rem,11vw,4.5rem)] leading-none tracking-[0.04em] text-ink tabular-nums">
                    {remaining
                      ? String(remaining[key]).padStart(2, "0")
                      : "--"}
                  </span>
                  <span className="label text-[0.625rem]">{label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
