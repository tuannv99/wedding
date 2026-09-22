"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Botanical } from "@/components/ui/Botanical";
import { SCROLL_SPRING } from "@/app/album/ChapterBook";

/**
 * Màn chuyển chương: KHÉP chương vừa xem lại, rồi MỞ ra chương tiếp theo.
 *
 * Dùng lại đúng hình ảnh của nút "Mở thiệp" ở trang chủ — hai cánh ivory,
 * nếp gấp champagne, con dấu botanical — nhưng đổi hẳn vai trò của nó. Ở
 * trang chủ nó là một cử chỉ mở lời; ở đây nó là dấu chấm hết của một chương
 * và dấu mở đầu của chương sau:
 *
 *   trang cuối chương cũ
 *        ↓   (khoảng lặng)
 *   hai cánh khép lại          ← "01  SANTORI YÊN SỞ"  (chương vừa khép)
 *        ↓   (giữ yên)
 *   con dấu đổi tên chương     → "02  STUDIO"          (chương sắp mở)
 *        ↓
 *   hai cánh mở ra
 *        ↓
 *   trang tiêu đề chương mới   (trang đầu tiên trong xấp giấy của nó — xem
 *                                page-plan.ts, layout "title")
 *
 * Con dấu chỉ mang số + tên chương, KHÔNG có đoạn ghi chú: đoạn ghi chú đầy
 * đủ để dành cho trang tiêu đề ngay sau, để người xem chỉ đọc nó đúng một
 * lần — trên một tờ giấy thật, không phải chữ nổi trên nền thiệp.
 *
 * Toàn bộ được TÍNH RA từ tiến độ cuộn của chính khối này, không phải một
 * animation tự chạy khi lướt qua. Nhờ vậy cuộn ngược lên là chương mới khép
 * lại và chương cũ hiện về, và dừng giữa chừng thì thiệp đứng giữa chừng.
 *
 * Khối nằm trong dòng chảy của trang (không phải overlay `fixed`): thanh nav
 * vẫn ở trên, người xem vẫn cuộn bình thường, và màn chuyển chương được đọc
 * như MỘT PHẦN của cuốn album chứ không phải một lớp phủ đặt lên nó.
 */

const PANEL_LEFT = "linear-gradient(to right, #F9F7F2, #F5F2EB)";
const PANEL_RIGHT = "linear-gradient(to left, #F9F7F2, #F5F2EB)";

/**
 * Các mốc theo tiến độ cuộn của cả màn (0 → 1). Khoảng 0 → 0.12 cố ý để
 * trống: đó là khoảng thở giữa tấm ảnh cuối cùng và lúc thiệp bắt đầu khép,
 * để chuyển chương không dính ngay vào mép ảnh.
 */
const CLOSE_IN = 0.1;
const CLOSE_OUT = 0.4;
const OPEN_IN = 0.62;
const OPEN_OUT = 0.88;

type ChapterMark = { number: string; title: string };

type Props = {
  /** Chương vừa khép lại — hiện trên con dấu lúc thiệp đóng. */
  from: ChapterMark;
  /** Chương sắp mở ra — hiện trên con dấu lúc thiệp mở, rồi mờ đi cùng lúc
      hai cánh biến mất, nhường chỗ cho trang tiêu đề của chính chương đó. */
  to: ChapterMark;
  /** Quãng cuộn dành cho cả màn, tính theo bội số chiều cao khung nhìn. */
  units: number;
};

export function ChapterSeparator({ from, to, units }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  /* Cùng lò xo với lúc lật trang (xem ChapterBook): bánh xe chuột đẩy scroll
     theo từng nấc, cho tiến độ đi qua lò xo thì hai cánh thiệp khép/mở thành
     một chuyển động liền mạch thay vì nhảy theo nấc cuộn. */
  const progress = useSpring(scrollYProgress, SCROLL_SPRING);

  /* Hai cánh: trượt vào khép kín, giữ yên, rồi xoay quanh mép ngoài mà mở. */
  const xLeft = useTransform(progress, [CLOSE_IN, CLOSE_OUT], ["-100%", "0%"]);
  const xRight = useTransform(progress, [CLOSE_IN, CLOSE_OUT], ["100%", "0%"]);
  const rotateLeft = useTransform(progress, [OPEN_IN, OPEN_OUT], [0, -108]);
  const rotateRight = useTransform(progress, [OPEN_IN, OPEN_OUT], [0, 108]);

  /* Cánh và con dấu chương mới biến mất CÙNG LÚC ở cuối màn: không còn khối
     chữ nào chờ sẵn phía sau để lấp chỗ trống, nên không được để cánh tan đi
     trước rồi bỏ trống vài khung hình trước khi trang tiêu đề (nằm ngoài
     khối này, trong ChapterBook) kịp hiện ra. */
  const FADE_OUT: [number, number] = [OPEN_OUT - 0.02, OPEN_OUT + 0.06];
  const panelOpacity = useTransform(progress, FADE_OUT, [1, 0]);

  /* Con dấu: tên chương cũ mờ đi đúng lúc tên chương mới hiện lên, rồi tên
     chương mới giữ nguyên tới khi cánh thiệp tan — không có khoảng trống
     giữa lúc thiệp mở xong và lúc trang tiêu đề của chương xuất hiện. */
  const fromOpacity = useTransform(progress, [0.28, 0.4, 0.46, 0.54], [0, 1, 1, 0]);
  const fromScale = useTransform(progress, [0.28, 0.4], [0.88, 1]);
  const toOpacity = useTransform(progress, [0.5, 0.58, ...FADE_OUT], [0, 1, 1, 0]);
  const toScale = useTransform(progress, [0.5, 0.58], [0.92, 1]);

  return (
    <div
      ref={trackRef}
      className="relative w-full"
      style={{ height: `calc(100svh + ${units} * 100svh)` }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* --- Hai cánh thiệp + con dấu --- */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ perspective: 1900 }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2"
            style={{
              x: xLeft,
              rotateY: rotateLeft,
              opacity: panelOpacity,
              transformOrigin: "left center",
              backfaceVisibility: "hidden",
              background: PANEL_LEFT,
              borderRight: "1px solid rgba(216,197,165,0.55)",
            }}
          />

          <motion.div
            className="absolute inset-y-0 right-0 w-1/2"
            style={{
              x: xRight,
              rotateY: rotateRight,
              opacity: panelOpacity,
              transformOrigin: "right center",
              backfaceVisibility: "hidden",
              background: PANEL_RIGHT,
            }}
          />

          <Seal mark={from} opacity={fromOpacity} scale={fromScale} />
          <Seal mark={to} opacity={toOpacity} scale={toScale} />
        </div>
      </div>
    </div>
  );
}

function Seal({
  mark,
  opacity,
  scale,
}: {
  mark: ChapterMark;
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ opacity, scale }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
    >
      <Botanical variant="mark" className="h-8 w-[88px] text-sage/85" />

      <span className="wd-num text-[13px] tracking-[0.34em] text-champagne">
        {mark.number}
      </span>

      <span className="wd-h1 text-[clamp(1.35rem,2.8vw,2.1rem)] tracking-[0.18em] text-ink uppercase">
        {mark.title}
      </span>
    </motion.div>
  );
}
