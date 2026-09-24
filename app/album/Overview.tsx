"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useScrollLock } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export type OverviewTile = {
  n: number;
  src: string;
  alt: string;
  /** Hai tấm ngang (mở đầu và khép lại) chiếm hai ô thay vì một. */
  wide?: boolean;
};

/**
 * Bản đồ thị giác của cả bộ ảnh.
 *
 * Đây là câu trả lời cho đúng hai phàn nàn về trang cũ: không nhìn được tổng
 * thể, và muốn quay lại một tấm cụ thể thì phải lướt ngược rất xa. Cả 37 ô
 * nằm trong một lưới duy nhất, bấm một ô là cuộn thẳng tới tấm đó.
 *
 * Cố ý KHÔNG có filter, tab hay nhóm nào cả — có nhóm là quay lại chuyện
 * chương mục, mà chuyện đó vừa bỏ xong. Lưới này chỉ để nhìn và để bấm.
 *
 * Ảnh không bị cắt theo tỉ lệ khác: ô dọc giữ 2:3, hai ô ngang giữ 3:2 và
 * chiếm hai cột.
 */
function OverviewGrid({
  tiles,
  onPick,
  current,
  className,
}: {
  tiles: readonly OverviewTile[];
  onPick: (n: number) => void;
  /** Tấm người xem đang đứng ở đó — ô tương ứng sáng lên. */
  current?: number;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-5 gap-[6px] sm:grid-cols-7 sm:gap-2 md:grid-cols-8 md:gap-3 lg:grid-cols-10",
        className,
      )}
    >
      {tiles.map((tile) => {
        const active = current === tile.n;

        return (
          <li
            key={tile.n}
            className={cn("self-center", tile.wide && "col-span-2")}
          >
            <button
              type="button"
              onClick={() => onPick(tile.n)}
              aria-label={`Tới ảnh ${tile.n}: ${tile.alt}`}
              aria-current={active ? "true" : undefined}
              className={cn(
                "group relative block w-full overflow-hidden rounded-[2px] bg-warm",
                tile.wide ? "aspect-[3/2]" : "aspect-[2/3]",
              )}
            >
              <Image
                src={tile.src}
                alt=""
                fill
                loading="lazy"
                decoding="async"
                sizes="(max-width: 640px) 20vw, (max-width: 768px) 15vw, (max-width: 1024px) 13vw, 112px"
                className={cn(
                  "object-cover transition-opacity duration-500",
                  // Ô thường lùi lại một bước để cả lưới đọc ra là một bản đồ
                  // chứ không phải 37 tấm ảnh đang tranh nhau; rê chuột vào,
                  // hoặc đang đứng ở tấm nào, thì tấm đó rõ hẳn.
                  active
                    ? "opacity-100"
                    : "opacity-[0.82] group-hover:opacity-100",
                )}
              />

              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-[2px] transition-colors duration-500",
                  active
                    ? "ring-1 ring-champagne ring-inset"
                    : "group-hover:ring-1 group-hover:ring-taupe/45 group-hover:ring-inset",
                )}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Phần xem tổng thể nằm cố định trong mạch trang, ngay sau hero. */
export function OverviewSection({
  eyebrow,
  title,
  hint,
  tiles,
  onPick,
  current,
}: {
  eyebrow: string;
  title: string;
  hint: string;
  tiles: readonly OverviewTile[];
  onPick: (n: number) => void;
  current?: number;
}) {
  return (
    <>
      <div className="flex flex-col items-start border-l border-champagne/50 pl-5 md:pl-7">
        <p className="wd-eyebrow text-taupe">{eyebrow}</p>
        <h2 className="font-display mt-4 text-[clamp(1.5rem,3.2vw,2.25rem)] leading-[1.25] font-light text-ink">
          {title}
        </h2>
        <p className="wd-body-sm mt-3 text-[15px] text-taupe">{hint}</p>
      </div>

      <OverviewGrid
        tiles={tiles}
        onPick={onPick}
        current={current}
        className="mt-[clamp(28px,4vw,48px)]"
      />
    </>
  );
}

/**
 * Nút nổi + lớp phủ, để quay lại bản đồ mà không phải cuộn ngược lên đầu.
 *
 * Nút chỉ hiện SAU khi người xem đã đi qua phần xem tổng thể phía trên — lúc
 * còn đang nhìn thẳng vào cái lưới đó thì một nút mở lại chính nó là thừa.
 * Việc "đã đi qua hay chưa" do trang mẹ quyết định (IntersectionObserver đặt
 * trên chính section kia) và truyền xuống qua `visible`.
 */
export function OverviewControl({
  visible,
  tiles,
  onPick,
  current,
}: {
  visible: boolean;
  tiles: readonly OverviewTile[];
  onPick: (n: number) => void;
  current?: number;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const pick = useCallback(
    (n: number) => {
      // Đóng trước rồi mới cuộn: khoá cuộn được nhả ngay trong lần commit này
      // (useScrollLock đọc thẳng `open`), nên tới khung hình kế tiếp là trang
      // đã cuộn được. Cuộn trong lúc lớp phủ còn đang mờ dần là cố ý — người
      // xem thấy trang chạy tới đúng chỗ, thay vì thấy một màn ivory trống
      // rồi mới thấy nó chạy.
      setOpen(false);
      requestAnimationFrame(() => onPick(n));
    },
    [onPick],
  );

  const overlay = (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Xem tổng thể bộ ảnh"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="fixed inset-0 z-60 flex flex-col bg-ivory/97"
        >
          <div className="flex items-start justify-between px-5 pt-5 md:px-10 md:pt-7">
            <div>
              <p className="wd-eyebrow text-taupe">Our story</p>
              <p className="font-display mt-2 text-[clamp(1.15rem,2.4vw,1.6rem)] leading-tight font-light text-ink">
                {tiles.length} khoảnh khắc
              </p>
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="-mr-3 flex h-12 w-12 items-center justify-center text-ink/70 transition-colors duration-500 hover:text-ink"
            >
              <X className="h-5 w-5" strokeWidth={1.25} aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-6 pb-10 md:px-10">
            <OverviewGrid
              tiles={tiles}
              onPick={pick}
              current={current}
              className="mx-auto w-full max-w-[1100px]"
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      {/* Nút nằm giữa mép dưới trên điện thoại (ngón cái với tới được) và nép
          về góc phải trên màn rộng, nơi nó không đè lên cột ảnh ở giữa. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "fixed bottom-6 left-1/2 z-40 -translate-x-1/2 md:right-8 md:bottom-8 md:left-auto md:translate-x-0",
          "inline-flex items-center gap-3 rounded-full border border-taupe/30 bg-ivory/92 px-5 py-3 backdrop-blur-sm",
          "transition-[opacity,transform] duration-500 ease-out hover:border-taupe/60",
          visible && !open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        {/* Chín chấm nhỏ — hình của chính cái lưới mà nó mở ra. Vẽ bằng span
            thay vì mượn icon bộ ngoài để nét khớp với phần còn lại của trang. */}
        <span aria-hidden="true" className="flex flex-col gap-[3px]">
          {[0, 1, 2].map((row) => (
            <span key={row} className="flex gap-[3px]">
              {[0, 1, 2].map((col) => (
                <span key={col} className="block h-[3px] w-[3px] bg-taupe" />
              ))}
            </span>
          ))}
        </span>

        <span className="wd-eyebrow text-[11px] text-ink">Tổng thể</span>
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
