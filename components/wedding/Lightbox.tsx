"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage } from "@/lib/wedding";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SWIPE_THRESHOLD = 48;

type LightboxProps = {
  images: readonly GalleryImage[];
  /** null = đang đóng. */
  index: number | null;
  onClose: () => void;
  onChange: (nextIndex: number) => void;
};

export function Lightbox({ images, index, onClose, onChange }: LightboxProps) {
  const isOpen = index !== null;
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Render qua portal thẳng vào <body>: nếu render tại chỗ (bên trong section
  // Gallery), Lightbox sẽ bị "nhốt" trong stacking context riêng của section
  // đó (do section dùng `isolate` để chứa đúng lớp botanical decoration),
  // khiến header cố định (z-50, nằm ngoài mọi isolate) đè lên trên toàn bộ
  // lightbox — nút đóng và số thứ tự ảnh bị che mất dù DOM vẫn có đủ.
  // `document` không tồn tại lúc SSR nên phải đợi mount xong mới portal.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const goPrev = useCallback(() => {
    if (index === null) return;
    onChange((index - 1 + images.length) % images.length);
  }, [images.length, index, onChange]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onChange((index + 1) % images.length);
  }, [images.length, index, onChange]);

  // Bàn phím: Esc để đóng, mũi tên để chuyển ảnh, Tab giữ focus trong lightbox
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
        return;
      }
      if (event.key === "Tab") {
        const focusables =
          containerRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables || focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, goNext, goPrev, onClose]);

  const current = index === null ? null : images[index];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && current ? (
        <motion.div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh cưới"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          className="fixed inset-0 z-60 flex flex-col bg-ink/95 backdrop-blur-sm"
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const delta =
              (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
            touchStartX.current = null;

            if (Math.abs(delta) < SWIPE_THRESHOLD) return;
            if (delta > 0) goPrev();
            else goNext();
          }}
        >
          {/* Thanh trên: số thứ tự + nút đóng */}
          <div className="flex items-center justify-between px-5 py-4 md:px-8">
            <span className="wd-eyebrow wd-num text-warm/60">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="flex h-12 w-12 items-center justify-center text-warm/80 transition-colors duration-500 hover:text-warm"
            >
              <X className="h-5 w-5" strokeWidth={1.25} aria-hidden="true" />
            </button>
          </div>

          {/* Ảnh — click vào vùng nền quanh ảnh (không phải chính ảnh) để đóng.
              Check target===currentTarget vì ảnh (fill) choán hết content-box,
              chỉ phần padding của div này mới thật sự là "nền" bắt được click. */}
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-2 md:px-20"
            onClick={(event) => {
              if (event.target === event.currentTarget) onClose();
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.src}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="relative h-full w-full"
              >
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thanh dưới: caption + điều hướng */}
          <div className="flex items-center justify-between gap-4 px-5 py-5 md:px-8">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Ảnh trước"
              className="flex h-12 w-12 shrink-0 items-center justify-center text-warm/70 transition-colors duration-500 hover:text-warm"
            >
              <ChevronLeft
                className="h-6 w-6"
                strokeWidth={1.25}
                aria-hidden="true"
              />
            </button>

            <p className="wd-eyebrow max-w-md truncate text-center text-warm/50">
              {current.alt}
            </p>

            <button
              type="button"
              onClick={goNext}
              aria-label="Ảnh tiếp theo"
              className="flex h-12 w-12 shrink-0 items-center justify-center text-warm/70 transition-colors duration-500 hover:text-warm"
            >
              <ChevronRight
                className="h-6 w-6"
                strokeWidth={1.25}
                aria-hidden="true"
              />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
