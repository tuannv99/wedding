import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gộp class Tailwind an toàn (dùng chung cho toàn bộ component). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Thời lượng cuộn khi bấm một mục menu.
 *
 * Vì sao phải tự chạy animation thay vì scrollIntoView({behavior:"smooth"}):
 * cả API đó lẫn CSS scroll-behavior đều KHÔNG cho chỉnh tốc độ — Chrome cuộn
 * hết trong khoảng 400ms bất kể quãng đường xa hay gần. Muốn chậm hơn thì chỉ
 * còn cách tự nội suy vị trí qua requestAnimationFrame.
 *
 * Ba con số dưới đây được chọn từ số đo thật, không phải ước lượng. Cuộn mặc
 * định của Chrome KHÔNG cố định mà đã tự giãn theo quãng đường — đo trên chính
 * trang này: 827px mất ~450ms, 6974px mất ~1390ms, 8689px mất ~1480ms. Nếu chỉ
 * đặt một thời lượng phẳng thì quãng ngắn chậm lại nhưng quãng dài lại NHANH
 * hơn trước, tức là sai ý "chậm hơn một chút".
 *
 * Vậy nên vẫn giãn theo quãng đường, chỉ dịch cả đường cong lên khoảng
 * 1.3–1.45 lần so với mặc định:
 *   827px  → ~650ms  (1.44×)
 *   6974px → ~1880ms (1.35×)
 *   8689px → ~1900ms (1.28×)
 */
const SCROLL_MIN_MS = 650;
const SCROLL_MAX_MS = 1900;
const SCROLL_MS_PER_PX = 0.27;

/** Chậm - nhanh - chậm, không giật ở hai đầu. */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Huỷ lượt cuộn đang chạy (nếu có) — đặt ở module để hai lần bấm liên tiếp không chồng nhau. */
let cancelActiveScroll: (() => void) | null = null;

/** Cuộn tới một section theo id, tôn trọng prefers-reduced-motion. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  cancelActiveScroll?.();
  cancelActiveScroll = null;

  /*
    scroll-margin-top của section (chừa chỗ cho header cố định) được
    scrollIntoView tự trừ, còn window.scrollTo thì không — nên phải đọc ra và
    trừ tay, nếu không tiêu đề section sẽ chui lên dưới thanh nav.
  */
  const scrollMargin =
    Number.parseFloat(window.getComputedStyle(el).scrollMarginTop) || 0;

  const start = window.scrollY;
  const maxTop = document.documentElement.scrollHeight - window.innerHeight;
  const target = Math.max(
    0,
    Math.min(maxTop, start + el.getBoundingClientRect().top - scrollMargin),
  );
  const delta = target - start;
  if (Math.abs(delta) < 1) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: target, behavior: "instant" });
    return;
  }

  const duration = Math.min(
    SCROLL_MAX_MS,
    Math.max(SCROLL_MIN_MS, Math.abs(delta) * SCROLL_MS_PER_PX),
  );
  const startedAt = performance.now();
  let frame = 0;

  // Khách tự lăn chuột / chạm màn giữa chừng thì nhường ngay, đừng giằng lại.
  const abort = () => cancelActiveScroll?.();
  window.addEventListener("wheel", abort, { passive: true });
  window.addEventListener("touchstart", abort, { passive: true });

  cancelActiveScroll = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("wheel", abort);
    window.removeEventListener("touchstart", abort);
    cancelActiveScroll = null;
  };

  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    /*
      behavior "instant" là bắt buộc: html đang đặt scroll-behavior:smooth toàn
      cục, để mặc định ("auto") thì MỖI khung hình lại tự mở một animation
      mượt riêng, hai lớp animation chồng lên nhau gây giật và không bao giờ
      tới đúng đích.
    */
    window.scrollTo({
      top: start + delta * easeInOutCubic(progress),
      behavior: "instant",
    });

    if (progress < 1) frame = requestAnimationFrame(step);
    else cancelActiveScroll?.();
  };

  frame = requestAnimationFrame(step);
}

/** Định dạng ngày kiểu "25 · 10 · 2026" — dùng chung cho lời chúc và RSVP ở trang admin. */
export function formatShortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day} · ${month} · ${year}`;
}
