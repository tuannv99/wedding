"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { wedding } from "@/lib/wedding";
import { emitOpenInvitation } from "@/lib/events";
import { useInvitation } from "@/lib/invitation";
import { BotanicalDecoration } from "@/components/ui/BotanicalDecoration";
import { BotanicalHeart } from "@/components/ui/BotanicalHeart";

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

  /** Mỗi phần tử xuất hiện lần lượt: ngày → tên → "&" → button. */
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
      className="relative isolate flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-6 py-[clamp(20px,6svh,112px)]"
    >
      {/* Ảnh cưới nền */}
      <motion.div
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0.5 : 2.2, ease: EASE_OUT }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Overlay ivory rất nhẹ để chữ luôn đọc được */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-ivory/45"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-ivory/70 via-ivory/20 to-ivory/80"
        />
      </motion.div>

      {/* Nhánh lá mảnh ở 4 góc — chỉ trang trí, nằm sau nội dung/ảnh nền. */}
      <BotanicalDecoration position="top-left" size="md" />
      <BotanicalDecoration position="top-right" size="md" />
      <BotanicalDecoration position="bottom-left" size="sm" />
      <BotanicalDecoration position="bottom-right" size="sm" />

      <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-[clamp(10px,2.4svh,32px)] text-center">
        <motion.p {...rise(0.4)} className="wd-eyebrow text-ink/70">
          {wedding.date.display}
        </motion.p>

        <motion.span
          {...rise(0.6)}
          aria-hidden="true"
          className="block h-[clamp(20px,4svh,56px)] w-px bg-ink/25"
        />

        <h1 className="flex flex-col items-center gap-1 md:gap-2">
          <span className="sr-only">
            {wedding.groom.name} và {wedding.bride.name} — chúng mình sẽ kết hôn
          </span>

          <motion.span
            {...rise(0.85, 24)}
            className="wd-display block uppercase"
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
            className="font-display block text-[clamp(1.75rem,min(7vw,6svh),3.25rem)] leading-none text-champagne italic"
          >
            &amp;
          </motion.span>

          <motion.span
            {...rise(1.6, 24)}
            className="wd-display block uppercase"
          >
            {wedding.bride.short}
          </motion.span>
        </h1>

        <motion.p {...rise(2.1)} className="wd-eyebrow text-ink/60">
          {wedding.copy.hero.tagline}
        </motion.p>

        <motion.div {...rise(2.45)}>
          <motion.button
            type="button"
            onClick={handleOpen}
            disabled={isOpening}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            className="wd-btn-ghost disabled:opacity-60"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isOpening ? "opening" : "idle"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpening ? "Đang mở…" : wedding.copy.hero.openButton}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: reduceMotion ? 0 : 2.8 }}
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 h-12 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-ink/30"
      />

      {/* Tấm che "mở thiệp": phủ kín màn hình trong lúc nội dung trong đổi
          sang scroll-unlocked rồi vén ra, thay cho một hiệu ứng phong bì
          tách biệt — chỉ một sắc ivory phẳng + một dấu tim nhỏ ở giữa. */}
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
              className="text-2xl"
            >
              <BotanicalHeart />
            </motion.span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
