"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Botanical } from "@/components/ui/Botanical";
import type { AlbumPageSpec, PageItem } from "@/app/album/page-plan";

/**
 * Nội dung MẶT TRƯỚC của một trang album: đúng một composition, tối đa 2 ảnh.
 *
 * Kích thước khung ảnh không tính theo % bề ngang mà tính NGƯỢC TỪ CHIỀU CAO
 * TRANG (biến --wd-page-h, xem .wd-frame-* trong styles/wedding.css), nhờ vậy
 * một trang luôn nằm trọn trong một màn hình — điều bắt buộc khi trang sẽ bị
 * lật chứ không cuộn.
 *
 * `--wd-frame-s` là hệ số chiều cao của từng khung so với chiều cao trang:
 * 1 = cao hết trang, 0.52 = một tấm phụ nhỏ. Toàn bộ tương quan lớn/nhỏ giữa
 * các ảnh nằm ở con số này.
 */

const PORTRAIT_SIZES = "(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 480px";
const LANDSCAPE_SIZES = "(max-width: 1023px) 92vw, 1000px";

/** Khung chung: các layout chỉ khác nhau ở hệ số cỡ và cách xếp. */
const ROW =
  "absolute inset-0 flex items-center justify-center gap-[var(--wd-page-gap)]";

type FrameProps = {
  item: PageItem;
  /** Chiều cao khung = --wd-page-h × scale. */
  scale: number;
  ratio?: "portrait" | "landscape";
  className?: string;
  onOpen: (index: number) => void;
};

function Frame({
  item,
  scale,
  ratio = "portrait",
  className,
  onOpen,
}: FrameProps) {
  const style = { "--wd-frame-s": String(scale) } as CSSProperties;
  const classes = cn(
    "wd-frame",
    ratio === "landscape" ? "wd-frame-l" : "wd-frame-p",
    className,
  );

  const picture = (
    <Image
      src={item.src}
      alt={item.alt}
      fill
      loading="lazy"
      sizes={ratio === "landscape" ? LANDSCAPE_SIZES : PORTRAIT_SIZES}
      // Hover chỉ làm ảnh sáng nhẹ đi — không nhấc ảnh, không đổ bóng,
      // không zoom (giữ đúng cách ảnh cư xử ở mọi nơi khác trên site).
      className="object-cover transition-opacity duration-700 ease-out group-hover:opacity-[0.88]"
    />
  );

  // Ảnh bìa (index < 0) không nằm trong lightbox → render thẻ tĩnh.
  if (item.index < 0) {
    return (
      <div className={classes} style={style}>
        {picture}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(item.index)}
      aria-label={`Xem ảnh lớn: ${item.alt}`}
      className={cn(classes, "group block")}
      style={style}
    >
      {picture}
    </button>
  );
}

type Props = {
  page: AlbumPageSpec;
  onOpen: (index: number) => void;
};

export function PageComposition({ page, onOpen }: Props) {
  const [first, second] = page.items;
  const shared = { onOpen };

  switch (page.layout) {
    /*
      Trang tiêu đề của album — tờ giấy đầu tiên người xem gặp sau phần mở
      đầu. Lật nó ra là album mở. Dùng đúng khối chữ của lời mở chương ở mọi
      nơi khác, chỉ thêm nét lá botanical phía trên để tờ này đọc ra là một
      trang bìa chứ không phải một đoạn chữ lạc giữa trang.
    */
    case "title": {
      const intro = page.intro;
      if (!intro) return null;

      return (
        /* Lề trong của tờ giấy: chữ của một trang bìa không bao giờ chạm mép
           giấy. Các layout ảnh không cần vì chúng đều căn giữa. */
        <div className="absolute inset-0 flex items-center px-[clamp(24px,7%,72px)]">
          <div className="max-w-[540px]">
            <Botanical variant="mark" className="h-4 w-11 text-sage/55" />

            <p
              aria-hidden="true"
              className="wd-num mt-9 text-[13px] tracking-[0.34em] text-champagne"
            >
              {intro.number}
            </p>

            <h2
              id={intro.titleId}
              className="wd-h1 mt-5 text-[clamp(1.35rem,2.8vw,2.1rem)] tracking-[0.18em] uppercase"
            >
              {intro.title}
            </h2>

            <span
              aria-hidden="true"
              className="mt-6 block h-px w-[34px] bg-champagne/70"
            />

            <p className="font-display mt-7 text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.9] font-light text-ink/75 sm:whitespace-pre-line">
              {intro.note}
            </p>
          </div>
        </div>
      );
    }

    /* Ảnh bìa ngang, tràn gần hết bề ngang trang. */
    case "cover":
      return (
        <div className={ROW}>
          <Frame item={first} scale={1} ratio="landscape" {...shared} />
        </div>
      );

    /* Một ảnh dọc cao gần hết trang: điểm nhấn. Không để tròn 1 — ảnh chạm
       sát hai mép giấy thì đọc ra là ảnh bị cắt, không phải một trang album. */
    case "hero":
      return (
        <div className={ROW}>
          <Frame item={first} scale={0.94} {...shared} />
        </div>
      );

    /* Một ảnh dọc nhỏ hơn — khoảng trắng hai bên là phần của composition. */
    case "single":
      return (
        <div className={ROW}>
          <Frame item={first} scale={0.84} {...shared} />
        </div>
      );

    /* Hai ảnh ngang hàng, bằng nhau. */
    case "double":
      return (
        <div className={ROW}>
          <Frame item={first} scale={0.9} {...shared} />
          <Frame item={second} scale={0.9} {...shared} />
        </div>
      );

    /*
      Ảnh chính + ảnh phụ, cùng đứng trên một đường chân trang. Chênh lệch cỡ
      cố ý lớn (0.88 / 0.48) để mắt biết ngay tấm nào là chính — hai tấm ngang
      cỡ nhau thì đã là layout "double" rồi. Khoảng trống dồn lên góc trên bên
      phải là có chủ đích: nó là thứ giữ cho tấm nhỏ ở vai trò phụ.
    */
    case "hero-support":
      return (
        <div className={cn(ROW, "items-end pb-[clamp(18px,4vh,46px)]")}>
          <Frame item={first} scale={0.88} {...shared} />
          <Frame item={second} scale={0.48} {...shared} />
        </div>
      );

    /*
      Lệch tầng có kiểm soát: tấm lớn nhích lên, tấm nhỏ trượt xuống. Dùng
      translate (không phải margin) nên không ảnh hưởng tới phép đo của flex.
    */
    case "asymmetric":
      return (
        <div className={ROW}>
          <Frame
            item={first}
            scale={0.82}
            className="-translate-y-[5%]"
            {...shared}
          />
          <Frame
            item={second}
            scale={0.58}
            className="translate-y-[14%]"
            {...shared}
          />
        </div>
      );
  }
}
