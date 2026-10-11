"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ElementType } from "react";
import { useRevealGate } from "@/components/ui/RevealGate";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Mỗi ký tự viết trong bao lâu (ms) — tiêu đề ~10 ký tự viết xong trong ~0,8 giây. */
const CHAR_MS = 80;
/** Phần lẻ của một ký tự (ký tự đang viết mờ dần lên thay vì bật ra). */
const STEPS_PER_CHAR = 8;

/** Tách theo ký tự người đọc thấy (giữ nguyên dấu tiếng Việt dạng tổ hợp). */
function splitGraphemes(text: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("vi", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

type TypewriterTitleProps = {
  children: string;
  /** Thẻ tiêu đề — mặc định h2. */
  as?: ElementType;
  className?: string;
  id?: string;
};

/**
 * Tiêu đề "tự viết ra" từng ký tự: cuộn tới là tự viết một mạch cho hết
 * (CHAR_MS mỗi ký tự), không phải cuộn tiếp mới hiện đủ. Viết một lần rồi
 * thôi — cuộn ngược hay quay lại thì chữ vẫn nguyên.
 *
 * Bố cục giữ nguyên tuyệt đối: toàn bộ chữ luôn nằm trong DOM, phần chưa viết
 * chỉ opacity 0 (vẫn chiếm chỗ, vẫn xuống dòng y hệt, trình đọc màn hình vẫn
 * đọc đủ). Chỉ có ba span: đã viết | ký tự đang viết (mờ dần theo phần lẻ của
 * tiến độ, nên chữ hiện mượt chứ không bật) | chưa viết.
 *
 * Viết xong lần đầu thì mở RevealGate gần nhất — nội dung bên dưới mới bắt
 * đầu hiện. Cuộn nhanh vượt qua cũng vậy: tiêu đề đã ở trên màn hình thì
 * vẫn viết như thường rồi mở gate, không bỏ sót trạng thái nào.
 *
 * Giảm chuyển động: hiện đủ chữ và mở gate ngay.
 */
export function TypewriterTitle({
  children: text,
  as: Tag = "h2",
  className,
  id,
}: TypewriterTitleProps) {
  const chars = useMemo(() => splitGraphemes(text), [text]);
  const total = chars.length;
  const gate = useRevealGate();
  const markOpen = gate?.markOpen;
  const ref = useRef<HTMLElement>(null);
  // Server và khung hình đầu: chữ đủ — không bao giờ trắng tiêu đề nếu JS chậm.
  const [steps, setSteps] = useState(total * STEPS_PER_CHAR);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSteps(total * STEPS_PER_CHAR);
      markOpen?.();
      return;
    }

    setSteps(0);
    let frame = 0;

    const write = () => {
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / (total * CHAR_MS));
        setSteps(Math.round(progress * total * STEPS_PER_CHAR));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else markOpen?.();
      };
      frame = requestAnimationFrame(tick);
    };

    // Cùng mốc với Reveal (đáy hụt 12%): tiêu đề lên tới đó — hoặc đã nằm
    // phía trên màn hình (cuộn nhanh vượt qua) — là bắt đầu viết.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting && (entry?.boundingClientRect.top ?? 0) >= 0) return;
        observer.disconnect();
        write();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [total, markOpen]);

  const written = Math.floor(steps / STEPS_PER_CHAR);
  const partial = (steps % STEPS_PER_CHAR) / STEPS_PER_CHAR;

  return (
    <Tag ref={ref} id={id} className={className}>
      {chars.slice(0, written).join("")}
      {written < total ? (
        <>
          <span style={{ opacity: partial }}>{chars[written]}</span>
          <span style={{ opacity: 0 }}>{chars.slice(written + 1).join("")}</span>
        </>
      ) : null}
    </Tag>
  );
}
