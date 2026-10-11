"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ElementType } from "react";
import { useRevealGate } from "@/components/ui/RevealGate";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Cửa sổ cuộn để viết hết tiêu đề, tính theo mép trên của tiêu đề so với
 * chiều cao màn hình: bắt đầu khi tiêu đề vừa ló lên (92%), viết xong khi nó
 * lên tới 55% — khoảng 1/3 màn hình cuộn, đủ chậm để thấy từng chữ.
 */
const START = 0.92;
const END = 0.55;
/** Làm tròn tiến độ (theo phần của một ký tự) để không render lại mỗi pixel cuộn. */
const STEPS_PER_CHAR = 8;

/**
 * Một listener scroll/resize dùng chung cho mọi tiêu đề, gom về một lần mỗi
 * khung hình (requestAnimationFrame) — không phải mỗi tiêu đề một listener.
 */
const subscribers = new Set<() => void>();
let frame = 0;

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    subscribers.forEach((update) => update());
  });
}

function subscribe(update: () => void) {
  subscribers.add(update);
  if (subscribers.size === 1) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  return () => {
    subscribers.delete(update);
    if (subscribers.size === 0) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

/** Tiến độ 0 → 1 của tiêu đề, chỉ phụ thuộc vị trí cuộn hiện tại. */
function progressOf(el: HTMLElement) {
  const vh = window.innerHeight;
  const top = el.getBoundingClientRect().top;
  const remaining = Math.max(
    0,
    document.documentElement.scrollHeight - vh - window.scrollY,
  );

  // Đã cuộn tới đáy trang mà tiêu đề đang trong màn hình → viết xong luôn.
  if (remaining <= 1 && top < vh) return 1;

  const start = vh * START;
  // Tiêu đề gần cuối trang có thể không bao giờ lên tới 55%: lấy luôn vị trí
  // cao nhất nó lên được (lúc cuộn hết trang) làm mốc viết xong.
  const end = Math.max(vh * END, top - remaining);
  if (end >= start - 1) return top <= start ? 1 : 0;

  return Math.min(1, Math.max(0, (start - top) / (start - end)));
}

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
 * Tiêu đề "tự viết ra" từng ký tự theo đúng vị trí cuộn: cuộn xuống chữ hiện
 * dần; cuộn ngược thì chữ đã viết giữ nguyên. Không chạy theo thời gian.
 *
 * Bố cục giữ nguyên tuyệt đối: toàn bộ chữ luôn nằm trong DOM, phần chưa viết
 * chỉ opacity 0 (vẫn chiếm chỗ, vẫn xuống dòng y hệt, trình đọc màn hình vẫn
 * đọc đủ). Chỉ có ba span: đã viết | ký tự đang viết (mờ dần theo phần lẻ của
 * tiến độ, nên chữ hiện mượt chứ không bật) | chưa viết.
 *
 * Viết xong lần đầu thì mở RevealGate gần nhất — nội dung bên dưới mới bắt
 * đầu hiện. Cuộn nhanh vượt qua cũng vậy: tiến độ tính từ vị trí, vượt qua
 * cửa sổ là 1, không có trạng thái nào bị bỏ qua.
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

    // Chỉ tiến, không lùi: cuộn ngược thì chữ đã viết giữ nguyên.
    let max = 0;
    const update = () => {
      const progress = progressOf(el);
      const next = Math.round(progress * total * STEPS_PER_CHAR);
      if (next < max) return;
      max = next;
      setSteps(next);
      if (progress >= 1) markOpen?.();
    };
    update();
    return subscribe(update);
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
