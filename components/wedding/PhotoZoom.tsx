"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Lightbox } from "@/components/wedding/Lightbox";

type PhotoZoomProps = {
  /**
   * Cả nhóm ảnh của section (vd. hai chân dung, ba ảnh chuyện) — mở lớn xong
   * lướt qua lại được trong nhóm đó, giống mosaic Gallery.
   */
  images: readonly { src: string; alt: string }[];
  /** Vị trí của ảnh này trong `images`. */
  index: number;
  className?: string;
  /** Thường là một next/image `fill` — section vẫn là server component, chỉ phần bấm mới chạy phía client. */
  children: ReactNode;
};

/**
 * Bọc một ảnh ở trang chủ thành nút bấm mở lightbox.
 *
 * Gallery tự quản lý lightbox riêng vì nó là client component sẵn; các section
 * khác (Couple, OurStory, WeddingDetails) là server component nên phần tương
 * tác được tách ra đây. Hero và footer cố ý không dùng — đó là ảnh nền chứ
 * không phải ảnh để xem.
 */
export function PhotoZoom({ images, index, className, children }: PhotoZoomProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenIndex(index)}
        aria-label={"Mở ảnh lớn: " + images[index]?.alt}
        className={cn(
          "block cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne",
          className,
        )}
      >
        {children}
      </button>

      <Lightbox
        images={images}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />
    </>
  );
}
