"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Trễ animation (giây) để tạo hiệu ứng so le. */
  delay?: number;
  /** Khoảng dịch lên (px). Đặt 0 nếu chỉ muốn fade. */
  y?: number;
  duration?: number;
};

/** Phải khớp đúng media query của .wd-reveal trong styles/wedding.css. */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * Fade-up nhẹ khi phần tử vào viewport — CHỈ trên máy có chuột.
 *
 * Là một <div> thường + CSS transition (.wd-reveal ở wedding.css), không còn
 * là motion.div. Trên iPhone, kể cả khi đã ép hiện sẵn, framer-motion vẫn gắn
 * observer cho từng khối và đẩy animation opacity/transform mỗi lần cuộn tới:
 * Safari dựng rồi huỷ layer GPU ngay quanh ô ảnh nằm bên trong, ảnh phải vẽ
 * lại — đúng cú nháy khi cuộn tới ảnh. Giờ máy cảm ứng chỉ nhận một <div>
 * tĩnh: không observer, không animation, không layer nào được tạo ra.
 *
 * prefers-reduced-motion: override toàn cục ở globals.css rút transition về
 * 0.01ms, tức hiện ngay.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.4,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    // Máy cảm ứng: CSS không ẩn gì cả nên cũng không cần theo dõi.
    if (!el || !window.matchMedia(FINE_POINTER).matches) return;

    // margin dương ở đáy (320px) + duration ngắn: fade xong TRƯỚC khi phần tử
    // thật sự lọt vào khung nhìn, cuộn ở tốc độ đọc không bắt gặp giữa chừng.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px 320px 0px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown ? "" : undefined}
      className={cn("wd-reveal", className)}
      style={
        {
          "--wd-reveal-y": `${y}px`,
          "--wd-reveal-duration": `${duration}s`,
          "--wd-reveal-delay": `${delay}s`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
