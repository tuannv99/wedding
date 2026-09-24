"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { anchorId, type StoryItem, type StoryLayout } from "@/app/album/story-plan";

/**
 * Hai thứ mà mọi khung ảnh trên trang đều cần, gom lại để khỏi phải xâu chuỗi
 * qua từng bố cục một: mở ảnh lớn, và biết tấm nào vừa được nhảy tới.
 */
export type FrameContext = {
  onOpen: (n: number) => void;
  /** Tấm vừa được bấm tới từ phần xem tổng thể — sáng viền một nhịp rồi tắt. */
  arrived: number | null;
};

type FrameProps = {
  ctx: FrameContext;
  n: number;
  src: string;
  alt: string;
  sizes: string;
  /** Bề ngang + chỗ đứng — thứ DUY NHẤT thay đổi giữa các bố cục. */
  className?: string;
  /** Ảnh ngang 3:2 (chỉ có tấm mở đầu và tấm khép lại). */
  wide?: boolean;
  /** Tải ngay thay vì đợi tới gần khung nhìn. */
  eager?: boolean;
};

/**
 * Một khung ảnh.
 *
 * Tỉ lệ luôn đúng bằng tỉ lệ file gốc — 2:3 cho ảnh dọc (1200×1800), 3:2 cho
 * hai tấm ngang (2200×1467) — nên `object-cover` ở đây không cắt gì, nó chỉ
 * lo phần lẻ do làm tròn pixel. Không bố cục nào được phép đổi tỉ lệ này:
 * muốn nhấn một tấm thì cho nó rộng hơn và chừa nhiều khoảng trắng quanh nó
 * hơn, chứ không xén vào ảnh.
 *
 * `id` là neo cuộn của ô thumbnail tương ứng bên phần xem tổng thể;
 * `data-photo` là thứ IntersectionObserver ở AlbumStory dò để biết người xem
 * đang đứng ở tấm nào.
 */
export function Frame({
  ctx,
  n,
  src,
  alt,
  sizes,
  className,
  wide,
  eager,
}: FrameProps) {
  return (
    <div className={className}>
      <button
        type="button"
        id={anchorId(n)}
        data-photo={n}
        onClick={() => ctx.onOpen(n)}
        aria-label={`Xem lớn ảnh ${n}: ${alt}`}
        className={cn(
          "wd-anchor group relative block w-full overflow-hidden rounded-[3px] bg-warm",
          wide ? "aspect-[3/2]" : "aspect-[2/3]",
        )}
      >
        {/* alt rỗng vì chính cái <button> bọc ngoài đã mang mô tả này trong
            aria-label — để cả hai thì trình đọc màn hình đọc đúng một câu hai
            lần cho mỗi tấm, nhân lên 37 tấm. */}
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          priority={eager}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="object-cover transition-opacity duration-500 group-hover:opacity-90"
        />

        {/* Viền champagne nháy lên một nhịp khi vừa nhảy tới tấm này — đủ để
            mắt bắt được "đây rồi" mà không thành một hiệu ứng riêng. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[3px] ring-inset transition-[box-shadow] duration-700",
            ctx.arrived === n ? "ring-2 ring-champagne" : "ring-0 ring-transparent",
          )}
        />
      </button>

      {/* Dấu thứ tự rất nhỏ dưới mép trái — đủ để đối chiếu với ô thumbnail
          vừa bấm, không đủ to để thành một lưới đánh số kiểu trang quản lý. */}
      <span className="wd-eyebrow wd-num mt-3 block text-[10px] tracking-[0.28em] text-taupe/70">
        {String(n).padStart(2, "0")}
      </span>
    </div>
  );
}

const SIZES = {
  hero: "(max-width: 640px) 92vw, (max-width: 1100px) 58vw, 620px",
  single: "(max-width: 640px) 76vw, (max-width: 1100px) 36vw, 400px",
  offset: "(max-width: 640px) 82vw, (max-width: 1100px) 44vw, 490px",
  pair: "(max-width: 640px) 86vw, (max-width: 1100px) 42vw, 430px",
  large: "(max-width: 640px) 80vw, (max-width: 1100px) 46vw, 510px",
  small: "(max-width: 640px) 56vw, (max-width: 1100px) 30vw, 330px",
} as const;

/**
 * Bảy bố cục. Khác nhau giữa chúng nằm gọn trong bề ngang và chỗ đứng của
 * từng khung ảnh — không cái nào ghim vào khung nhìn, không cái nào là "một
 * trang". Tất cả đều là khối nằm trong mạch cuộn bình thường của trang.
 *
 * Trên màn hẹp, mọi bố cục hai–ba ảnh đều duỗi thành một cột: nhét hai ảnh
 * dọc 2:3 vào bề ngang điện thoại thì mỗi tấm chỉ còn ~150px, xem không ra
 * gì. Nhịp ở đó đến từ chỗ các tấm rộng hẹp khác nhau và nép về hai bên khác
 * nhau, chứ không từ việc xếp cạnh nhau.
 */
export function StoryBlock({
  layout,
  items,
  first,
  ctx,
}: {
  layout: StoryLayout;
  items: readonly StoryItem[];
  /** Khối đầu tiên của dòng ảnh — tấm trong đó được tải sớm. */
  first?: boolean;
  ctx: FrameContext;
}) {
  const gap = "gap-[clamp(18px,3vw,44px)]";
  const frame = (i: number, sizes: string, className: string, eager?: boolean) => (
    <Frame
      ctx={ctx}
      n={items[i].n}
      src={items[i].photo.src}
      alt={items[i].photo.alt}
      sizes={sizes}
      className={className}
      eager={eager}
    />
  );

  switch (layout) {
    case "hero":
      return (
        <Reveal className="flex justify-center">
          {frame(0, SIZES.hero, "w-full sm:w-[min(58%,54svh)]", first)}
        </Reveal>
      );

    case "single":
      return (
        <Reveal className="flex justify-center">
          {frame(0, SIZES.single, "w-[76%] sm:w-[min(36%,40svh)]")}
        </Reveal>
      );

    case "offset-left":
    case "offset-right":
      return (
        <Reveal>
          {frame(
            0,
            SIZES.offset,
            cn(
              "w-[82%] sm:w-[min(44%,48svh)]",
              layout === "offset-left" ? "mr-auto" : "ml-auto",
            ),
          )}
        </Reveal>
      );

    case "pair":
      return (
        <Reveal>
          {/* Hẹp hơn cột chữ một nhịp: hai tấm 2:3 cạnh nhau mà trải hết
              1100px thì mỗi tấm cao gần 800px — đọc ra là hai tấm poster, chứ
              không phải hai tấm ảnh đặt cạnh nhau trong một cuốn album. */}
          <div
            className={cn(
              "mx-auto flex w-full flex-col sm:grid sm:w-[min(100%,880px)] sm:grid-cols-2 sm:items-start",
              gap,
            )}
          >
            {frame(0, SIZES.pair, "w-[86%] sm:w-full")}
            {frame(1, SIZES.pair, "w-[68%] self-end sm:w-full sm:self-auto")}
          </div>
        </Reveal>
      );

    case "asymmetric":
      return (
        <Reveal>
          <div className={cn("flex flex-col sm:flex-row sm:items-start", gap)}>
            {frame(0, SIZES.large, "w-[80%] sm:w-[46%]")}
            {/* Tấm nhỏ tụt xuống một quãng: hai tấm không bao giờ thẳng mép
                trên, nên mắt đọc ra hai nhịp chứ không phải một hàng. */}
            {frame(
              1,
              SIZES.small,
              "w-[56%] self-end sm:mt-[clamp(64px,11vw,150px)] sm:w-[30%] sm:self-auto",
            )}
          </div>
        </Reveal>
      );

    case "trio":
      return (
        <Reveal>
          <div className={cn("flex flex-col", gap)}>
            <div
              className={cn(
                "mx-auto flex w-full flex-col sm:grid sm:w-[min(100%,800px)] sm:grid-cols-2 sm:items-start",
                gap,
              )}
            >
              {frame(0, SIZES.pair, "w-[80%] sm:w-full")}
              {frame(1, SIZES.pair, "w-[64%] self-end sm:w-full sm:self-auto")}
            </div>

            {/* Tấm thứ ba lệch khỏi trục giữa một chút — canh giữa tăm tắp thì
                khối này thành một tam giác cân, quá gọn gàng so với phần còn
                lại của trang. */}
            {frame(
              2,
              SIZES.single,
              "w-[72%] self-center sm:mr-[9%] sm:ml-auto sm:w-[min(34%,38svh)] sm:self-auto",
            )}
          </div>
        </Reveal>
      );
  }
}
