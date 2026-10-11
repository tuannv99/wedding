"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode, TransitionEvent } from "react";
import { useRevealGate } from "@/components/ui/RevealGate";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Thẻ HTML dùng làm khung — ví dụ "li" khi mỗi mục của một <ol> tự hiện. */
  as?: ElementType;
  /** Style riêng của khung (gộp với các biến --wd-reveal-*). */
  style?: CSSProperties;
  /** Trễ animation (giây) để tạo hiệu ứng so le. */
  delay?: number;
  /** Khoảng dịch lên (px). Đặt 0 nếu chỉ muốn fade. */
  y?: number;
  duration?: number;
  /**
   * Không chờ tiêu đề của RevealGate bọc ngoài — dùng cho chính phần đầu
   * tiêu đề (dòng nhãn nhỏ phía trên, nét lá ngăn cách phía trên).
   */
  ignoreGate?: boolean;
};

/** Phải khớp đúng media query của .wd-reveal trong styles/wedding.css. */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
/** Khối chứa một trong những thứ này được giữ layer GPU vĩnh viễn trên máy cảm ứng. */
const MEDIA = "img, picture, video, iframe, canvas";

/**
 * "Cuộn tới đâu hiện tới đó": mỗi khối ẩn sẵn, và chỉ hiện ra khi đã lên hẳn
 * trong màn hình (đáy hụt 12%) — người xem thấy được chữ, ảnh, timeline hiện
 * dần theo nhịp cuộn của mình, chứ không phải đã hiện xong từ trước.
 *
 * Nằm trong một RevealGate (section có TypewriterTitle) thì còn thêm điều
 * kiện: tiêu đề phải viết xong. Đã vào màn hình mà tiêu đề chưa xong thì đứng
 * chờ ở trạng thái ẩn, tiêu đề xong mới chạy — vẫn đúng animation/delay cũ.
 *
 * Khối nào đang nằm trong (hoặc đã qua) màn hình lúc mount, và không phải chờ
 * tiêu đề, thì để yên, không ẩn — khung hình đầu không bao giờ trắng trơn.
 *
 * Máy có chuột: fade + dịch lên (.wd-reveal ở wedding.css).
 *
 * Máy cảm ứng: chỉ opacity, không transform — khung layer trùng đúng khung
 * khối, không dịch xuống đè lên ảnh bên dưới (Safari sẽ đẩy luôn phần bị đè
 * lên layer riêng → ảnh vẽ lại, nháy). Lý do cũ khiến ảnh từng bị loại hẳn:
 * Safari dựng rồi HUỶ layer GPU quanh ô ảnh mỗi lần animation chạy, ảnh phải
 * vẽ lại đúng lúc đang hiện → nháy. Giờ:
 *   - Lúc dựng layer khối còn opacity 0 → có vẽ lại cũng không ai thấy.
 *   - Khối có ảnh giữ layer luôn (will-change, data-media) sau khi hiện, nên
 *     không có lần huỷ nào → không có cú vẽ lại nào lúc ảnh đã hiện.
 *   - Khối chỉ có chữ: fade xong thì gỡ transition, khối lại tĩnh như cũ.
 *
 * Giảm chuyển động (prefers-reduced-motion): hiện sẵn, không ẩn gì.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  style,
  delay = 0,
  y = 24,
  duration = 1.3,
  ignoreGate = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const gate = useRevealGate();
  const gateOpen = ignoreGate || !gate || gate.open;
  // Đọc trong observer (chạy ngoài render) mà không phải gắn lại observer.
  const gateOpenRef = useRef(gateOpen);
  gateOpenRef.current = gateOpen;

  /** Đã vào màn hình (chốt). */
  const [inView, setInView] = useState(false);
  /** Chỉ máy cảm ứng: khối đang được điều khiển ẩn/hiện (không thì để tĩnh). */
  const [armed, setArmed] = useState(false);
  /** Chỉ máy cảm ứng, khối chữ: fade xong → gỡ hẳn data-touch. */
  const [settled, setSettled] = useState(false);
  const [fine, setFine] = useState(true);
  const [media, setMedia] = useState(false);
  /** Máy có chuột: hiện ngay không transition (xem .wd-rise ở dưới). */
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isFine = window.matchMedia(FINE_POINTER).matches;
    setFine(isFine);
    if (!isFine) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (el.querySelector(MEDIA)) setMedia(true);
    }

    let first = true;
    let observer: IntersectionObserver | undefined;

    /**
     * instantFirst: lần đo đầu mà khối đã trong màn hình thì hiện luôn, không
     * fade (máy cảm ứng vốn đã làm vậy ở mọi khối — để yên, không ẩn).
     */
    const observe = (instantFirst: boolean) => {
      // -12% ở đáy: khối bắt đầu hiện khi đã lên hẳn trong màn hình, đúng kiểu
      // "lướt tới đâu hiện tới đó".
      observer = new IntersectionObserver(
        ([entry]) => {
          const visible = !!entry?.isIntersecting || (entry?.boundingClientRect.top ?? 0) < 0;

          if (first) {
            first = false;
            // Đang trong (hoặc đã qua) màn hình ngay lần đo đầu và không phải
            // chờ tiêu đề → để yên, không ẩn.
            if (visible && gateOpenRef.current && (instantFirst || !isFine)) {
              if (isFine) {
                setInstant(true);
                setInView(true);
              }
              observer?.disconnect();
              return;
            }
            if (!isFine) setArmed(true);
          }
          if (!visible) return;
          setInView(true);
          observer?.disconnect();
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0 },
      );
      observer.observe(el);
    };

    // Section đầu tiên sau khi "Mở thiệp" (Lễ Thành Hôn) đã có hiệu ứng vào
    // riêng: cả khối nổi lên theo nhịp cánh thiệp mở (.wd-rise, wedding.css).
    // Lúc khối này mount trang còn ở đầu, chưa cuộn tới — đo ngay thì mọi thứ
    // "ngoài màn hình", phải chờ rồi fade thêm một lượt nữa: section nổi lên
    // trống trơn mấy giây. Nên đợi tới lúc nó bắt đầu nổi lên (trang đã cuộn
    // tới) mới đo: phần đang trong màn hình lúc đó hiện cùng section, phần
    // bên dưới (vd. cột chú rể trên điện thoại) vẫn chờ cuộn tới như thường.
    const rising = el.closest<HTMLElement>(".wd-rise > :first-child");
    const rise = rising
      ?.getAnimations()
      .find((a) => a instanceof CSSAnimation && a.animationName === "wd-rise");
    const timing = rise?.effect?.getComputedTiming();
    let onRiseStart: ((e: AnimationEvent) => void) | undefined;

    if (rising && rise && timing && rise.playState !== "finished") {
      if (Number(timing.localTime ?? 0) < Number(timing.delay ?? 0)) {
        onRiseStart = (e) => {
          if (e.target !== rising || e.animationName !== "wd-rise") return;
          rising.removeEventListener("animationstart", onRiseStart!);
          observe(true);
        };
        rising.addEventListener("animationstart", onRiseStart);
      } else {
        observe(true);
      }
    } else {
      observe(false);
    }

    return () => {
      if (rising && onRiseStart) rising.removeEventListener("animationstart", onRiseStart);
      observer?.disconnect();
    };
  }, []);

  const go = inView && gateOpen;
  const touch = !fine && armed && !settled ? (go ? "in" : "pending") : undefined;

  return (
    <Tag
      ref={ref}
      data-shown={fine && go ? "" : undefined}
      data-touch={touch}
      data-media={media ? "" : undefined}
      data-instant={instant ? "" : undefined}
      // Khối chữ fade xong thì bỏ hẳn transition — Safari gỡ layer, khối lại
      // tĩnh như cũ. Khối có ảnh giữ nguyên "in" (xem ghi chú ở trên).
      onTransitionEnd={(e: TransitionEvent) => {
        if (touch === "in" && !media && e.target === e.currentTarget) setSettled(true);
      }}
      className={cn("wd-reveal", className)}
      style={
        {
          ...style,
          "--wd-reveal-y": `${y}px`,
          "--wd-reveal-duration": `${duration}s`,
          "--wd-reveal-delay": `${delay}s`,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
