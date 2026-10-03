"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { gapFor, justifyRows } from "@/app/album/justified-layout";

/**
 * Đo bề rộng khung ngay trong layout effect (trước khi trình duyệt vẽ khung
 * hình kế tiếp) thay vì trong effect thường — để lần render đã có chiều rộng
 * đúng ngay từ đầu ở các lượt điều hướng phía client, thay vì vẽ một khung
 * rỗng rồi mới nhảy vào. Trên server thì rơi về useEffect thường, vì
 * useLayoutEffect không chạy được ở đó (và sẽ in cảnh báo nếu cứ gọi thẳng).
 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export type OverviewTile = {
  n: number;
  src: string;
  alt: string;
  /** Hai tấm ngang (mở đầu và khép lại) — tỉ lệ 3:2 thay vì 2:3 như phần còn lại. */
  wide?: boolean;
};

/** Tỉ lệ rộng/cao THẬT của hai loại ảnh trong bộ — dùng để xếp hàng, không dùng để crop. */
const RATIO_PORTRAIT = 2 / 3;
const RATIO_LANDSCAPE = 3 / 2;

/**
 * Bản đồ thị giác của cả bộ ảnh — một "justified grid" kiểu editorial.
 *
 * Đây là câu trả lời cho đúng hai phàn nàn về trang cũ: không nhìn được tổng
 * thể, và muốn quay lại một tấm cụ thể thì phải lướt ngược rất xa. Mọi ô nằm
 * trong cùng một dòng ảnh liên tục, bấm một ô là `onPick` — trang mẹ mở lớn
 * tấm đó trong lightbox.
 *
 * Khác bản cũ (lưới cột cố định, mọi ô ép về chung một khung 2:3 rồi
 * object-cover cắt cho vừa): ở đây thuật toán `justifyRows` xếp ảnh theo
 * ĐÚNG tỉ lệ thật của nó, hàng nào cũng vừa khít bề ngang khung chứa — không
 * ảnh nào bị cắt, chỉ có chiều cao hàng thay đổi. Bề rộng khung được đo bằng
 * ResizeObserver nên bố cục tự vẽ lại theo màn hình lẫn theo số lượng ảnh,
 * không có gì hard-code cho riêng con số 37.
 *
 * Cố ý KHÔNG có filter, tab hay nhóm nào cả — có nhóm là quay lại chuyện
 * chương mục, mà chuyện đó vừa bỏ xong. Lưới này chỉ để nhìn và để bấm.
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rows = useMemo(() => {
    const withRatio = tiles.map((tile) => ({
      ...tile,
      ratio: tile.wide ? RATIO_LANDSCAPE : RATIO_PORTRAIT,
    }));
    return justifyRows(withRatio, width);
  }, [tiles, width]);

  const gap = gapFor(width || 1);

  return (
    <div ref={containerRef} className={className}>
      <div className="flex flex-col" style={{ rowGap: gap }}>
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex justify-start"
            style={{ height: row.height, columnGap: gap }}
          >
            {row.items.map(({ tile, width: itemWidth }) => {
              const active = current === tile.n;

              return (
                <button
                  key={tile.n}
                  type="button"
                  onClick={() => onPick(tile.n)}
                  aria-label={`Xem lớn ảnh ${tile.n}: ${tile.alt}`}
                  aria-current={active ? "true" : undefined}
                  className="group relative block shrink-0 overflow-hidden rounded-[2px] bg-warm"
                  style={{ width: itemWidth, height: row.height }}
                >
                  <Image
                    src={tile.src}
                    alt=""
                    fill
                    /* eager + sync: ô thumbnail nhỏ, tải hết từ
                       đầu thì cuộn không gặp ô nào đang chờ tải "bụp" hiện ra;
                       sync để khi iPhone xả bitmap rồi giải mã lại lúc cuộn
                       quay lại, Safari không vẽ ô trống trước (nháy). */
                    loading="eager"
                    decoding="sync"
                    sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 380px"
                    className={cn(
                      "object-cover transition-opacity duration-500",
                      // Ô thường lùi lại một bước để cả lưới đọc ra là một bản
                      // đồ chứ không phải từng ấy tấm ảnh đang tranh nhau; rê
                      // chuột vào, hoặc đang đứng ở tấm nào, thì tấm đó rõ hẳn.
                      // Chỉ trên máy có chuột: màn cảm ứng không rê được nên
                      // làm mờ chẳng để làm gì, mà 37 ô opacity < 1 bắt Safari
                      // vẽ 37 lớp trong suốt riêng mỗi khung hình cuộn.
                      active
                        ? "opacity-100"
                        : "[@media(hover:hover)_and_(pointer:fine)]:opacity-[0.86] group-hover:opacity-100",
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
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Phần xem tổng thể nằm cố định trong mạch trang, ngay sau hero. */
export function OverviewSection({
  eyebrow,
  title,
  hint,
  cta,
  tiles,
  onPick,
  current,
}: {
  eyebrow?: string;
  title?: string;
  hint?: string;
  cta?: string;
  tiles: readonly OverviewTile[];
  onPick: (n: number) => void;
  current?: number;
}) {
  // Trang /album đã đưa phần chữ lên khối mở đầu, nên ở đó lưới đứng một mình.
  const hasHeader = Boolean(eyebrow || title || hint || cta);

  return (
    <>
      {hasHeader ? (
        <div className="flex flex-col items-start border-l border-champagne/50 pl-5 md:pl-7">
          {eyebrow ? <p className="wd-eyebrow text-taupe">{eyebrow}</p> : null}
          {title ? (
            <h2 className="font-display mt-4 text-[clamp(1.5rem,3.2vw,2.25rem)] md:text-[clamp(calc(1.5rem_+_8px),calc(3.2vw_+_8px),calc(2.25rem_+_8px))] leading-[1.25] font-light text-ink">
              {title}
            </h2>
          ) : null}
          {hint ? (
            <p className="wd-body-sm mt-3 text-[15px] md:text-[23px] whitespace-pre-line text-taupe">{hint}</p>
          ) : null}
          {cta ? (
            <p className="wd-body-sm mt-2 text-[15px] md:text-[23px] text-taupe/80 italic">{cta}</p>
          ) : null}
        </div>
      ) : null}

      <OverviewGrid
        tiles={tiles}
        onPick={onPick}
        current={current}
        className={hasHeader ? "mt-[clamp(28px,4vw,48px)]" : undefined}
      />
    </>
  );
}
