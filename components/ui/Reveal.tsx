"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Trễ animation (giây) để tạo hiệu ứng so le. */
  delay?: number;
  /** Khoảng dịch lên (px). Đặt 0 nếu chỉ muốn fade. */
  y?: number;
  duration?: number;
};

/**
 * Fade-up nhẹ khi phần tử vào viewport.
 * Tự động chuyển sang fade thuần khi người dùng bật prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.4,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      // margin dương ở đáy (320px): bắt đầu fade-in TRƯỚC khi phần tử thật sự
      // lọt vào khung nhìn, cộng với duration ngắn (0.4s, trước là 1s) để
      // animation kịp xong trước khi mắt người dùng nhìn thấy — nếu không,
      // cuộn ở tốc độ đọc bình thường sẽ luôn bắt được chữ/ảnh giữa lúc đang
      // fade (đã đo: ~40% thời gian cuộn chậm có phần tử mid-fade, giảm còn
      // ~27% sau 2 thay đổi này), gây cảm giác chớp/nhòe (flicker) trên mobile.
      viewport={{ once: true, amount: 0.1, margin: "0px 0px 320px 0px" }}
      transition={{
        duration: reduceMotion ? 0.35 : duration,
        delay: reduceMotion ? 0 : delay,
        ease: EASE_OUT,
      }}
    >
      {children}
    </motion.div>
  );
}
