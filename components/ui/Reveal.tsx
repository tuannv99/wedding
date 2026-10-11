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
/** Khối chứa một trong những thứ này thì trên máy cảm ứng KHÔNG được fade. */
const MEDIA = "img, picture, video, iframe, canvas";

/**
 * Fade-up nhẹ khi phần tử vào viewport trên máy có chuột; máy cảm ứng chỉ
 * fade khối chữ (xem cuối ghi chú này).
 *
 * Là một <div> thường + CSS transition (.wd-reveal ở wedding.css), không còn
 * là motion.div. Trên iPhone, kể cả khi đã ép hiện sẵn, framer-motion vẫn gắn
 * observer cho từng khối và đẩy animation opacity/transform mỗi lần cuộn tới:
 * Safari dựng rồi huỷ layer GPU ngay quanh ô ảnh nằm bên trong, ảnh phải vẽ
 * lại — đúng cú nháy khi cuộn tới ảnh. Giờ máy cảm ứng chỉ nhận một <div>
 * tĩnh: không observer, không animation, không layer nào được tạo ra.
 *
 * Máy cảm ứng vẫn có hiệu ứng, nhưng hẹp hơn hẳn (.wd-reveal[data-touch] ở
 * wedding.css), để không quay lại cú nháy ảnh ở trên:
 *   - Chỉ khối KHÔNG chứa ảnh (MEDIA) — layer GPU dựng/huỷ quanh một khối
 *     chữ chỉ vẽ lại chữ, không bao giờ kéo ảnh vẽ lại theo.
 *   - Chỉ opacity, không transform: khung của layer trùng đúng khung khối
 *     chữ, không dịch xuống đè lên ảnh bên dưới (Safari sẽ đẩy luôn phần bị
 *     đè lên layer riêng → ảnh vẽ lại).
 *   - Chỉ ẩn khối đang nằm DƯỚI màn hình lúc mount (callback đầu tiên của
 *     observer), nên khung hình đầu tiên không bao giờ trắng chữ; fade xong
 *     thì gỡ luôn transition, không để lại gì.
 *   - Giảm chuyển động: giữ nguyên như cũ, hiện sẵn.
 *
 * prefers-reduced-motion trên máy có chuột: override toàn cục ở globals.css
 * tắt transition, tức hiện ngay.
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
  /** Chỉ dùng trên máy cảm ứng: "pending" = đang ẩn chờ cuộn tới, "in" = đang fade. */
  const [touch, setTouch] = useState<"pending" | "in" | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!window.matchMedia(FINE_POINTER).matches) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (el.querySelector(MEDIA)) return;

      let first = true;
      // -12% ở đáy: chữ bắt đầu hiện khi đã lên hẳn trong màn hình, đúng kiểu
      // "lướt tới đâu hiện tới đó".
      const observer = new IntersectionObserver(
        ([entry]) => {
          const visible = !!entry?.isIntersecting || (entry?.boundingClientRect.top ?? 0) < 0;
          if (first) {
            first = false;
            // Đang trong (hoặc đã qua) màn hình lúc mount → để yên, không ẩn.
            if (visible) observer.disconnect();
            else setTouch("pending");
            return;
          }
          if (!visible) return;
          setTouch("in");
          observer.disconnect();
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    }

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
      data-touch={touch ?? undefined}
      // Fade xong thì bỏ hẳn transition — Safari gỡ layer, khối lại tĩnh như cũ.
      onTransitionEnd={(e) => {
        if (touch === "in" && e.target === e.currentTarget) setTouch(null);
      }}
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
