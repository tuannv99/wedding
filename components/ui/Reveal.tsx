"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  /*
    useReducedMotion() đọc matchMedia ngay ở lần render đầu của client, còn
    trên server thì luôn là false → HTML hai bên lệch nhau đúng ở style của
    motion.div, và React báo hydration mismatch (cả site, không riêng /album).
    Vì vậy phải đợi mount xong mới đổi sang bản rút gọn — cùng cách làm với
    BotanicalAccent.
  */
  const prefersReduced = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    if (prefersReduced) setReduceMotion(true);
    // Điện thoại/tablet (không có chuột): hiện sẵn, KHÔNG fade khi cuộn tới.
    // Dù đã nới margin + rút duration ở dưới, trên iPhone vẫn nháy rõ khi cuộn:
    // phần tử ẩn sẵn, lọt vào viewport mới hiện, lại thêm transform y do
    // framer-motion tính trên main thread nên luôn trễ nhịp so với cú cuộn
    // native. Với nội dung mount sau "Mở thiệp", effect này chạy ngay lúc
    // mount — sau lưng tấm thiệp đang khép, khách không thấy bước chuyển.
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) setTouch(true);
  }, [prefersReduced]);

  return (
    <motion.div
      className={cn("wd-reveal", className)}
      initial={{ opacity: 0, y: reduceMotion ? 0 : y }}
      // animate chỉ đặt khi là máy cảm ứng: framer đẩy thẳng tới trạng thái
      // hiện (duration 0 ở transition bên dưới), whileInView thành vô hại.
      animate={touch ? { opacity: 1, y: 0 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      // margin dương ở đáy (320px): bắt đầu fade-in TRƯỚC khi phần tử thật sự
      // lọt vào khung nhìn, cộng với duration ngắn (0.4s, trước là 1s) để
      // animation kịp xong trước khi mắt người dùng nhìn thấy — nếu không,
      // cuộn ở tốc độ đọc bình thường sẽ luôn bắt được chữ/ảnh giữa lúc đang
      // fade (đã đo: ~40% thời gian cuộn chậm có phần tử mid-fade, giảm còn
      // ~27% sau 2 thay đổi này), gây cảm giác chớp/nhòe (flicker) trên mobile.
      viewport={{ once: true, amount: 0.1, margin: "0px 0px 320px 0px" }}
      transition={{
        duration: touch ? 0 : reduceMotion ? 0.35 : duration,
        delay: touch || reduceMotion ? 0 : delay,
        ease: EASE_OUT,
      }}
    >
      {children}
    </motion.div>
  );
}
