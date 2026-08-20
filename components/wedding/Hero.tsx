"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { wedding } from "@/lib/wedding";
import { scrollToSection } from "@/lib/utils";
import { emitOpenInvitation } from "@/lib/events";
import { useInvitation } from "@/lib/invitation";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const { hero } = wedding.images;
  const { open } = useInvitation();

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
    if (wedding.music.startOnOpen) emitOpenInvitation();
    open();
    // Chờ các section còn lại mount xong (sau khi mở khoá scroll) mới cuộn.
    window.setTimeout(() => scrollToSection("our-story"), 80);
  };

  return (
    <section
      id="hero"
      aria-label="Thiệp cưới Tuấn và Hoa"
      className="relative flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-6 py-[clamp(20px,6svh,112px)]"
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
          <button type="button" onClick={handleOpen} className="wd-btn-ghost">
            {wedding.copy.hero.openButton}
          </button>
        </motion.div>
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: reduceMotion ? 0 : 2.8 }}
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 h-12 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-ink/30"
      />
    </section>
  );
}
