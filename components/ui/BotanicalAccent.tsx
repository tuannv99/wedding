"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Botanical } from "@/components/ui/Botanical";
import { cn } from "@/lib/utils";

type BotanicalAccentProps = {
  variant?: "branch" | "sprig" | "mark";
  /** Vị trí + kích thước: đặt bằng utility (absolute, top/left, w/h, rotate…). */
  className?: string;
  flip?: boolean;
  /** Độ mờ cuối cùng — nhánh luôn phải nhạt hơn ảnh và chữ. */
  opacity?: number;
  /** Biên độ parallax (px). Rất nhỏ: cả trang chỉ "thở" chứ không trôi. */
  depth?: number;
};

/**
 * Đặt một nhánh botanical như một accent tuyệt đối: không chiếm layout
 * (`absolute` + `pointer-events-none`), nằm sau nội dung (`-z-10`), fade-in
 * chậm khi vào viewport và trôi 4–6px theo scroll.
 *
 * Chuyển động cố tình rất nhỏ — cảm giác một trang editorial dịch nhẹ, không
 * phải hoa bay. Tự tắt hoàn toàn khi prefers-reduced-motion.
 */
export function BotanicalAccent({
  variant = "sprig",
  className,
  flip,
  opacity = 0.45,
  depth = 5,
}: BotanicalAccentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [depth, -depth]);

  // Parallax chỉ bật SAU khi mount. useReducedMotion() phía server luôn trả
  // false, nên nếu gắn/không gắn `style` ngay ở lần render đầu thì HTML server
  // và client sẽ khác nhau với người bật prefers-reduced-motion -> React báo
  // hydration mismatch. Lần render đầu ở cả hai phía đều không có transform.
  const [parallax, setParallax] = useState(false);
  useEffect(() => setParallax(!reduceMotion), [reduceMotion]);

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      whileInView={{ opacity }}
      viewport={{ once: true, amount: 0.05, margin: "0px 0px 200px 0px" }}
      transition={{ duration: reduceMotion ? 0.3 : 1.6, ease: [0.22, 1, 0.36, 1] }}
      style={parallax ? { y } : undefined}
      className={cn(
        "pointer-events-none absolute -z-10 text-sage",
        className,
      )}
    >
      <Botanical variant={variant} flip={flip} className="h-full w-full" />
    </motion.div>
  );
}
