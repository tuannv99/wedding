"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { wedding } from "@/lib/wedding";
import { emitOpenInvitation } from "@/lib/events";
import { useInvitation } from "@/lib/invitation";
import { Botanical } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Nhịp "mở thiệp": che màn hình → giữ một nhịp → mở ra, tổng ~1.05s. */
const VEIL_COVER_MS = 420;
const VEIL_HOLD_MS = 180;
const VEIL_REVEAL_MS = 460;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const { hero } = wedding.images;
  const { open } = useInvitation();
  const [isOpening, setIsOpening] = useState(false);
  const [showVeil, setShowVeil] = useState(false);

  /** Mỗi phần tử xuất hiện lần lượt: ngày → tên → "&" → nút. */
  const rise = (delay: number, distance = 18) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : distance },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0.4 : 1.1,
      delay: reduceMotion ? 0 : delay,
      ease: EASE_OUT,
    },
  });

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    setShowVeil(true);

    // Phong bì "che" màn hình lại (veil mờ dần tới kín) — nút đồng thời đổi
    // sang "Đang mở…". Khi màn hình đã che kín, ta mới thật sự mở thiệp và
    // nhảy tới Our Story ở phía sau tấm che (không cần cuộn mượt vì đang bị
    // che), rồi vén tấm che ra để lộ nội dung — đúng cảm giác "mở phong bì".
    window.setTimeout(
      () => {
        if (wedding.music.startOnOpen) emitOpenInvitation();
        open();

        // open() chỉ setState — DOM của Our Story chưa kịp mount ngay trong
        // cùng tick này, nên phải đợi React commit xong rồi mới query & nhảy.
        // Dùng "instant" (không phải "auto"): html có scroll-behavior:smooth
        // toàn cục, "auto" sẽ kế thừa smooth và cuộn lộ ra ngay dưới tấm che.
        window.setTimeout(() => {
          document
            .getElementById("our-story")
            ?.scrollIntoView({ behavior: "instant", block: "start" });

          window.setTimeout(
            () => setShowVeil(false),
            reduceMotion ? 0 : VEIL_HOLD_MS,
          );
        }, 30);
      },
      reduceMotion ? 0 : VEIL_COVER_MS,
    );
  };

  return (
    <section
      id="hero"
      aria-label="Thiệp cưới Tuấn và Hoa"
      /*
        Bố cục chia đôi theo bản design: nửa trái là nền ivory + chữ, nửa phải
        là ảnh cưới tràn viền. Dưới md không chia đôi (cột hẹp sẽ bóp cả chữ lẫn
        ảnh) mà quay về ảnh nền tràn viền + chữ căn giữa đè lên.
      */
      className="relative isolate grid h-[100svh] w-full grid-cols-1 overflow-hidden md:grid-cols-[1fr_1.05fr]"
    >
      {/* Ảnh cưới: mobile = nền phía sau chữ; từ md = ô bên phải của lưới */}
      <motion.div
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0.5 : 2.2, ease: EASE_OUT }}
        className="absolute inset-0 -z-10 md:relative md:z-0 md:col-start-2 md:row-start-1 md:h-full md:w-full"
      >
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover object-center"
        />

        {/* Chỉ cần phủ ivory khi ảnh nằm DƯỚI chữ (mobile) */}
        <div aria-hidden="true" className="absolute inset-0 bg-ivory/45 md:hidden" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-ivory/70 via-ivory/20 to-ivory/80 md:hidden"
        />

        {/* Từ md: một dải chuyển ivory → ảnh cho mép nối giữa hai nửa mềm lại */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 hidden w-[12%] bg-gradient-to-r from-ivory to-transparent md:block"
        />
      </motion.div>

      {/* Nhánh botanical mọc lên từ mép trái, đi sau chữ (-z-10) */}
      <BotanicalAccent
        variant="branch"
        opacity={0.42}
        depth={6}
        flip
        className="-bottom-[6svh] -left-[8svh] h-[56svh] w-[21svh] md:-left-[5svh] md:h-[62svh] md:w-[23svh]"
      />

      <div className="flex flex-col items-center justify-center gap-[clamp(10px,2.4svh,30px)] px-6 text-center md:col-start-1 md:row-start-1 md:items-start md:px-[clamp(32px,6vw,104px)] md:text-left">
        <motion.p
          {...rise(0.4)}
          className="wd-eyebrow text-ink/70 md:tracking-[0.5em]"
        >
          {wedding.date.display}
        </motion.p>

        <h1 className="flex flex-col items-center gap-1 md:items-start md:gap-2">
          <span className="sr-only">
            {wedding.groom.name} và {wedding.bride.name} — chúng mình sẽ kết hôn
          </span>

          <motion.span
            {...rise(0.85, 24)}
            className="wd-display block uppercase md:text-[clamp(3.5rem,9.4vw,10rem)]"
          >
            {wedding.groom.short}
          </motion.span>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: reduceMotion ? 0.4 : 1.4,
              delay: reduceMotion ? 0 : 1.35,
              ease: "easeOut",
            }}
            className="font-display block text-[clamp(1.75rem,min(7vw,6svh),3.25rem)] leading-none text-champagne italic md:self-center md:pr-[0.3em] md:text-[clamp(2rem,3.2vw,3.75rem)]"
          >
            &amp;
          </motion.span>

          <motion.span
            {...rise(1.6, 24)}
            className="wd-display block uppercase md:text-[clamp(3.5rem,9.4vw,10rem)]"
          >
            {wedding.bride.short}
          </motion.span>
        </h1>

        {/* Bản design để câu này ở dạng serif nghiêng, không phải nhãn hoa */}
        <motion.p
          {...rise(2.1)}
          className="wd-quote text-[clamp(1rem,2.2vw,1.35rem)] text-ink/60"
        >
          {wedding.copy.hero.tagline}!
        </motion.p>

        {/*
          Chỉ báo cuộn kiểu bản design (gạch dọc + mũi tên + nhãn) — nhưng vẫn
          là nút "Mở thiệp" thật: đây là user gesture duy nhất hợp lệ để bật
          nhạc và mở phần nội dung phía dưới.
        */}
        <motion.div {...rise(2.45)} className="mt-[clamp(8px,2svh,28px)]">
          <motion.button
            type="button"
            onClick={handleOpen}
            disabled={isOpening}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            className="group flex flex-col items-center gap-3 md:items-start disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              className="ml-0 flex flex-col items-center md:ml-[1.35em]"
            >
              <span className="block h-[clamp(28px,5svh,60px)] w-px bg-ink/25 transition-colors duration-500 group-hover:bg-ink/50" />
              <svg
                viewBox="0 0 12 12"
                fill="none"
                className="-mt-px h-3 w-3 text-ink/40 transition-colors duration-500 group-hover:text-ink/70"
              >
                <path
                  d="M6 0v10M2 6.5 6 10.5l4-4"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isOpening ? "opening" : "idle"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="wd-eyebrow text-ink/70 transition-colors duration-500 group-hover:text-ink"
              >
                {isOpening ? "Đang mở…" : wedding.copy.hero.openButton}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>

      {/* Tấm che "mở thiệp": phủ kín màn hình trong lúc nội dung trong đổi
          sang scroll-unlocked rồi vén ra, thay cho một hiệu ứng phong bì
          tách biệt — chỉ một sắc ivory phẳng + một nét lá nhỏ ở giữa. */}
      <AnimatePresence>
        {showVeil ? (
          <motion.div
            key="opening-veil"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                duration: reduceMotion ? 0 : VEIL_COVER_MS / 1000,
                ease: EASE_OUT,
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: reduceMotion ? 0 : VEIL_REVEAL_MS / 1000,
                ease: EASE_OUT,
              },
            }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-ivory"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  duration: reduceMotion ? 0 : 0.5,
                  delay: reduceMotion ? 0 : 0.15,
                  ease: EASE_OUT,
                },
              }}
            >
              <Botanical variant="mark" className="h-5 w-14 text-sage/80" />
            </motion.span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
