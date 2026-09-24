"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useScrollLock } from "@/lib/scroll-lock";
/**
 * Chỉ cần src + alt. Cố ý KHÔNG dùng GalleryImage: trang chủ truyền
 * GalleryImage (có thêm width/height) còn /album truyền AlbumPhoto — kiểu hẹp
 * này nhận được cả hai mà không phải ép kiểu ở nơi gọi.
 */
type LightboxPhoto = { src: string; alt: string };

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SWIPE_THRESHOLD = 48;

type LightboxProps = {
  images: readonly LightboxPhoto[];
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

  /**
   * Khoá cuộn giữ NGUYÊN cho tới khi lớp phủ tan hẳn, không nhả ngay lúc nó
   * bắt đầu mờ đi: nhả sớm thì suốt 0.45s cuối người xem vẫn lăn được chuột,
   * và trang phía sau chạy ngay sau tấm nền đang trong suốt dần.
   */
  const [holdLock, setHoldLock] = useState(false);
  useEffect(() => {
    if (isOpen) setHoldLock(true);
  }, [isOpen]);
  useScrollLock(holdLock);

  // Mở ra thì đưa focus về nút đóng — và CHỈ lúc mở, không phải mỗi lần đổi
  // ảnh, nếu không bấm "ảnh tiếp theo" là focus lại bị giật về nút đóng.
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

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

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, goNext, goPrev, onClose]);

  const current = index === null ? null : images[index];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence onExitComplete={() => setHoldLock(false)}>
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
          /* Không có backdrop-blur ở đây, dù tấm nền trông rất hợp với nó.
             `backdrop-filter` phải đọc lại toàn bộ nội dung nằm dưới để làm
             nhoè — mà dưới lightbox của /album là mấy chục khung ảnh 2:3 —
             rồi vẽ lại cả vùng đó mỗi lần lớp nhoè được tạo ra hoặc bị gỡ bỏ.
             Cú vẽ lại rơi đúng vào khung hình cuối của hiệu ứng mờ đi, thành
             một cái "nháy" ngay lúc ảnh biến mất. Nền đã đục 95% nên phần
             nhoè chỉ tác động lên 5% còn lại: bỏ đi gần như không thấy khác. */
          className="fixed inset-0 z-60 flex flex-col bg-ink/95"
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
          {/* Thanh trên: chỉ còn nút đóng — số thứ tự đã chuyển xuống giữa
              hai nút mũi tên ở thanh dưới. */}
          <div className="flex items-center justify-end px-5 py-4 md:px-8">
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
            {/* Khung trong cùng cỡ với khung ảnh cũ — có nó thì hai tấm ảnh
                mới chồng được lên nhau lúc chuyển. */}
            <div className="relative h-full w-full">
              {/*
                Đổi ảnh là MỜ CHỒNG, không phải mode="wait".

                mode="wait" bắt tấm cũ mờ hết (0.5s) rồi mới dựng tấm mới và
                cho nó hiện lên (0.5s nữa): ở khoảng giữa, màn hình trống
                trơn — và vì tấm mới chỉ được tải lúc nó mount, nó hay nhảy
                phịch vào giữa chừng hiệu ứng thay vì hiện dần. Nhìn ra đúng
                một cái nháy mỗi lần ảnh biến mất.

                Để hai tấm cùng nằm đó và chồng mờ lên nhau thì lúc nào trên
                màn cũng có ảnh, và tấm mới có thêm nguyên quãng mờ của tấm cũ
                để kịp tải xong.

                `initial={false}`: tấm đầu tiên không tự mờ vào nữa — cả lớp
                phủ vốn đã đang mờ vào rồi, chồng hai hiệu ứng chỉ làm ảnh lên
                chậm gấp đôi.
              */}
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.src}
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  className="absolute inset-0"
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
          </div>

          {/* Thanh dưới: mũi tên tròn 44px — bộ đếm — mũi tên tròn 44px.
              Bỏ hẳn dòng caption dưới ảnh (alt vẫn còn trên <img> cho trình
              đọc màn hình), theo đúng art direction: chỉ ảnh và một con số. */}
          <div className="flex items-center justify-center gap-6 px-5 py-5 md:gap-8 md:px-8">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Ảnh trước"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-warm/25 text-warm/70 transition-colors duration-500 hover:border-warm/60 hover:text-warm"
            >
              <ChevronLeft
                className="h-5 w-5"
                strokeWidth={1.25}
                aria-hidden="true"
              />
            </button>

            <p
              className="wd-eyebrow wd-num tabular-nums text-warm/60"
              aria-live="polite"
            >
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </p>

            <button
              type="button"
              onClick={goNext}
              aria-label="Ảnh tiếp theo"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-warm/25 text-warm/70 transition-colors duration-500 hover:border-warm/60 hover:text-warm"
            >
              <ChevronRight
                className="h-5 w-5"
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
