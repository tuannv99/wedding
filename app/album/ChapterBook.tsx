"use client";

import { memo, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { PageComposition } from "@/app/album/PageComposition";
import type { AlbumPageSpec } from "@/app/album/page-plan";

/**
 * Một chương = một xấp giấy lật được.
 *
 * Cách hoạt động:
 *
 *   ┌─ track (cao 100svh + N×UNIT) ─────────────┐
 *   │  ┌─ stage (sticky, cao 100svh) ────────┐  │  ← ghim lại khi track chạm
 *   │  │   ┌─ plate (perspective) ───────┐   │  │    mép trên khung nhìn
 *   │  │   │  trang N-1 … trang 1, 0     │   │  │
 *   │  │   └─────────────────────────────┘   │  │
 *   │  └─────────────────────────────────────┘  │
 *   └───────────────────────────────────────────┘
 *
 * Toàn bộ phần scroll thừa của track trở thành "tiến độ lật": p = 0…N. Trang
 * thứ i xoay rotateY 0 → -180deg quanh gáy trái khi p đi từ i+0.15 đến i+0.85
 * (hai đầu là quãng trang đứng yên cho người xem kịp nhìn).
 *
 * Vì góc xoay được TÍNH RA từ vị trí cuộn chứ không phải một animation tự
 * chạy, cuộn ngược lên là trang tự lật ngược lại, và dừng giữa chừng thì trang
 * đứng nghiêng giữa chừng — đúng như đang giữ tay ở nửa trang.
 *
 * Mặt sau trang là giấy ivory trơn, cùng màu nền trang web: khi trang đã lật
 * hẳn sang trái, cái duy nhất người xem còn thấy là vệt bóng của nó lướt qua —
 * đúng cảm giác giấy, không phải một khối 3D.
 */

/**
 * Quãng cuộn (svh) dành cho mỗi trang.
 *
 * Màn hẹp lấy quãng ngắn hơn vì ở đó mỗi trang chỉ có một ảnh nên số trang
 * nhiều gấp rưỡi — để nguyên như desktop thì cuộn hết album trên điện thoại
 * dài gần 40 màn hình.
 */
export const UNIT_WIDE = 90;
export const UNIT_NARROW = 66;

/** Trang đứng yên ở hai đầu quãng, chỉ lật trong khoảng giữa. */
const TURN_IN = 0.15;
const TURN_OUT = 0.85;

/** Quãng cuộn thêm ở cuối chương để trang cuối được nhìn lâu hơn một nhịp. */
const TAIL = 0.35;

/**
 * Số trang thật sự dựng trong DOM quanh trang đang xem.
 *
 * Mọi trang phía sau đều bị mặt giấy ivory đục của trang trên che kín, nhưng
 * trình duyệt không biết điều đó: nó vẫn giữ một lớp compositor cỡ nguyên màn
 * hình cho từng tờ. Một chương 19 trang trên điện thoại là ngót trăm MB texture
 * — đủ để máy bắt đầu giật. Giữ lại 5 tờ là vẫn đủ dày để đọc ra một xấp giấy.
 */
const KEEP_BEHIND = 1;
const KEEP_AHEAD = 3;

/**
 * Lò xo làm mượt tiến độ cuộn.
 *
 * Bánh xe chuột và trackpad đẩy scroll theo từng nấc rời rạc; góc lật bám
 * thẳng vào scrollY thì nấc nào mắt cũng thấy, thành ra "giật giật" dù không
 * hề rớt khung hình. Cho tiến độ đi qua một lò xo là chuyển động luôn liên
 * tục, và khi ngừng cuộn thì trang từ từ dừng lại thay vì khựng lại.
 */
export const SCROLL_SPRING = {
  stiffness: 100,
  damping: 28,
  mass: 0.35,
  restDelta: 0.0005,
} as const;

/**
 * Bóng đổ — chỉ còn đúng HAI lớp mang box-shadow trong cả chương.
 *
 * `box-shadow` phải được vẽ lại mỗi khi lớp chứa nó đổi hình dạng, mà một tờ
 * giấy đang xoay thì khung hình nào cũng đổi. Trước đây cả 27 mặt giấy đều
 * mang bóng riêng → 27 lần vẽ lại mỗi khung hình. Giờ:
 *
 *  - STACK_SHADOW nằm trên tấm nền, KHÔNG xoay → vẽ một lần rồi thôi. Đây là
 *    bóng của cả xấp giấy lúc nghỉ.
 *  - LIFT_SHADOW nằm trong tờ giấy nhưng chỉ đổi ĐỘ MỜ, và chỉ tờ đang lật
 *    mới có độ mờ khác 0 — nên mỗi lúc chỉ đúng một lớp phải vẽ lại.
 */
const STACK_SHADOW = "0 10px 24px rgba(61, 57, 53, 0.07)";
/* Bán kính nhoè giữ ở mức vừa phải: chi phí vẽ một vệt nhoè tăng theo bán
   kính, mà mắt gần như không phân biệt được 38px với 54px ở độ mờ này. */
const LIFT_SHADOW = "0 18px 38px rgba(61, 57, 53, 0.18)";

type Props = {
  pages: AlbumPageSpec[];
  /** Quãng cuộn mỗi trang, theo svh. */
  unit: number;
  onOpen: (index: number) => void;
};

export function ChapterBook({ pages, unit, onOpen }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const smoothed = useSpring(scrollYProgress, SCROLL_SPRING);

  const units = pages.length + TAIL;
  const progress = useTransform(smoothed, (value) => value * units);

  /*
    Trang đang xem. Dùng Math.floor chứ không phải Math.round: mốc đổi rơi
    đúng vào lúc một trang vừa lật xong và trang sau bắt đầu quãng đứng yên,
    nên việc dựng/gỡ tờ giấy không bao giờ rơi vào giữa một cú lật.

    Chốt bằng ref để cả lúc cuộn liên tục cũng chỉ gọi setState mỗi trang một
    lần, thay vì mỗi khung hình.
  */
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useMotionValueEvent(progress, "change", (value) => {
    const next = Math.min(pages.length - 1, Math.max(0, Math.floor(value)));
    if (next === activeRef.current) return;
    activeRef.current = next;
    setActive(next);
  });

  return (
    <div
      ref={trackRef}
      className="relative w-full"
      style={{ height: `calc(100svh + ${units} * ${unit}svh)` }}
    >
      <div className="wd-book-stage sticky top-0 flex h-[100svh] w-full items-center justify-center px-6 md:px-10">
        <div className="wd-book-plate relative h-[var(--wd-page-h)] w-full max-w-[980px]">
          {/* Bóng của cả xấp giấy lúc nghỉ. Nằm ngoài các tờ giấy và không
              bao giờ xoay, nên trình duyệt vẽ nó đúng một lần. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: STACK_SHADOW, zIndex: 0 }}
          />

          {/* Gáy sách: một nét champagne mảnh ở đúng trục xoay của các trang. */}
          <span
            aria-hidden="true"
            className="absolute inset-y-[5%] left-0 w-px bg-champagne/30"
            style={{ zIndex: pages.length + 1 }}
          />

          {pages.map((page, index) =>
            index >= active - KEEP_BEHIND && index <= active + KEEP_AHEAD ? (
              <BookLeaf
                key={page.key}
                page={page}
                index={index}
                total={pages.length}
                progress={progress}
                isActive={index === active}
                onOpen={onOpen}
              />
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}

type LeafProps = {
  page: AlbumPageSpec;
  index: number;
  total: number;
  progress: MotionValue<number>;
  /** Chỉ trang đang xem mới nhận click — các tờ khác đều bị che hoặc đã lật. */
  isActive: boolean;
  onOpen: (index: number) => void;
};

const BookLeaf = memo(function BookLeaf({
  page,
  index,
  total,
  progress,
  isActive,
  onOpen,
}: LeafProps) {
  // Trang cuối của chương không có gì phía sau để lật ra → nó đứng yên và
  // chương kết thúc bằng cách cuộn tiếp như bình thường.
  const isLast = index === total - 1;

  const from = index + TURN_IN;
  const mid = index + 0.5;
  const to = index + TURN_OUT;

  const rotateY = useTransform(progress, [from, to], [0, -180]);

  /* Bóng "đang nhấc lên": dày nhất lúc trang dựng gần vuông góc. Rất nhẹ —
     đây là giấy album chứ không phải một tấm thẻ bóng. */
  const lift = useTransform(progress, [from, mid, to], [0, 1, 0]);

  /* Ánh sáng đổi khi mặt giấy nghiêng đi: tối dần về phía gáy. */
  const shade = useTransform(progress, [from, mid, to], [0, 0.22, 0]);
  const shadeBack = useTransform(progress, [mid, to], [0.14, 0]);

  /* Lật xong thì tắt hẳn: trang lúc này đã nằm hẳn bên trái gáy, gần như ra
     khỏi tầm mắt, nên mờ đi ở đoạn cuối là không ai thấy — mà compositor thì
     đỡ được một lớp cho mỗi trang đã lật qua.

     Độ mờ này nằm trên MẶT SAU chứ không phải trên cả tờ giấy. Lý do là một
     quy tắc của CSS: `transform-style: preserve-3d` bị ép về `flat` ngay khi
     phần tử có opacity < 1. Đặt nó lên tờ giấy (thứ đang mang preserve-3d)
     nghĩa là đúng lúc độ mờ rời khỏi 1, không gian 3D của tờ giấy sập xuống
     phẳng, hai mặt giấy bị gộp lại và backface-visibility đổi cách xử lý —
     trình duyệt vẽ lại tờ giấy theo một kiểu khác chỉ trong một khung hình.
     Đó chính là cái nháy ở nửa trái màn hình mỗi lần một trang lật xong.

     Đặt lên mặt sau thì không còn phần tử nào vừa preserve-3d vừa mờ: quãng
     mờ này rơi vào lúc trang đã quay quá 90° nên chỉ mặt sau còn nhìn thấy,
     mặt trước đã bị backface-visibility giấu đi rồi. */
  const opacity = useTransform(progress, [to - 0.06, to], [1, 0]);

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        rotateY: isLast ? 0 : rotateY,
        pointerEvents: isActive ? "auto" : "none",
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
        zIndex: total - index,
        willChange: "transform",
      }}
    >
      {/* Bóng đổ khi tờ giấy nhấc lên — lớp riêng, chỉ đổi độ mờ. Đặt trước
          hai mặt giấy nên chỉ phần bóng tràn ra ngoài mép là nhìn thấy. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ opacity: lift, boxShadow: LIFT_SHADOW }}
      />

      {/* --- Mặt trước: composition ảnh ---
          translateZ(0.6px): hai mặt giấy nếu nằm ĐÚNG cùng một mặt phẳng thì
          trình duyệt phải tự quyết mặt nào vẽ trước ở từng khung hình, và nó
          đổi ý qua lại quanh mốc 90° — nhìn ra là giấy chớp qua chớp lại. Tách
          mỗi mặt ra trước 0.6px theo hướng nó đang quay về phía người xem là
          hết hẳn; ở perspective 1700px+ thì 0.6px không đổi gì về mặt hình. */}
      <div
        className="absolute inset-0 bg-ivory"
        style={{
          backfaceVisibility: "hidden",
          transform: "translateZ(0.6px)",
        }}
      >
        <PageComposition page={page} onOpen={onOpen} />

        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: shade,
            background:
              "linear-gradient(to right, rgba(61,57,53,0.5), rgba(61,57,53,0) 46%)",
          }}
        />
      </div>

      {/* --- Mặt sau: giấy trơn, chỉ một nét gáy ---
          Dùng `warm` chứ không phải `ivory`: chênh nhau đúng một sắc độ so với
          nền trang, vừa đủ để mắt thấy CÓ một tờ giấy đang quét qua nửa trái
          màn hình, chưa tới mức thành một khối trắng lạc chỗ. */}
      <div
        className="absolute inset-0"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg) translateZ(0.6px)",
        }}
      >
        {/* Lớp trong mới là thứ mang màu giấy và độ mờ — lớp ngoài chỉ lo chỗ
            đứng trong không gian 3D, nên opacity không bao giờ chạm vào một
            phần tử đang mang preserve-3d (xem ghi chú ở `opacity` bên trên). */}
        <motion.div
          className="absolute inset-0 bg-warm"
          style={{ opacity: isLast ? 1 : opacity }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-[5%] right-0 w-px bg-champagne/25"
          />

          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: shadeBack,
              background:
                "linear-gradient(to left, rgba(61,57,53,0.45), rgba(61,57,53,0) 52%)",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
});
