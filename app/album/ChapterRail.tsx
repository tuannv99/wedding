"use client";

import { useEffect, useState } from "react";
import { Botanical } from "@/components/ui/Botanical";
import { cn } from "@/lib/utils";

type RailChapter = { id: string; title: string };

/**
 * Cột mục lục dính bên trái thân album.
 *
 * Từ lg: cột dọc `sticky`, chapter đang xem sáng lên.
 * Dưới lg: cùng dữ liệu nhưng đổ thành hàng chip cuộn ngang, dính dưới header
 * — cột 200px sẽ ăn mất quá nửa bề ngang màn hẹp nếu giữ nguyên dạng dọc.
 */
export function ChapterRail({ chapters }: { chapters: readonly RailChapter[] }) {
  const [active, setActive] = useState(chapters[0]?.id ?? "");

  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(`chapter-${c.id}`))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    // rootMargin kéo "đường ngắm" xuống khoảng 1/4 trên màn: chapter chỉ sáng
    // lên khi nó thật sự chiếm phần nhìn chính, không phải lúc vừa ló ra.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id.replace("chapter-", ""));
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <>
      {/* ---- Dạng cột dọc (lg trở lên) ---- */}
      <nav
        aria-label="Các buổi chụp"
        className="hidden lg:sticky lg:top-[132px] lg:block lg:self-start"
      >
        <p className="wd-eyebrow text-taupe">Buổi chụp</p>
        <span aria-hidden="true" className="mt-4 block h-px w-[34px] bg-champagne/70" />

        <ul className="mt-7 flex flex-col gap-5">
          {chapters.map((chapter, index) => {
            const isActive = active === chapter.id;
            return (
              <li key={chapter.id}>
                <a
                  href={`#chapter-${chapter.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "group flex items-baseline gap-3 transition-colors duration-500",
                    isActive ? "text-ink" : "text-ink/45 hover:text-ink/70",
                  )}
                >
                  <span className="wd-num text-[13px] tracking-[0.12em] tabular-nums text-champagne">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[17px] leading-tight tracking-[0.06em]">
                    {chapter.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <Botanical variant="mark" className="mt-9 h-4 w-11 text-sage/55" />
      </nav>

      {/* ---- Dạng chip ngang (dưới lg) ---- */}
      <nav
        aria-label="Các buổi chụp"
        className="sticky top-16 z-20 -mx-6 border-b border-taupe/15 bg-ivory/90 backdrop-blur-md md:top-[72px] lg:hidden"
      >
        <ul className="flex snap-x gap-2 overflow-x-auto px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {chapters.map((chapter, index) => {
            const isActive = active === chapter.id;
            return (
              <li key={chapter.id} className="snap-start">
                <a
                  href={`#chapter-${chapter.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-full border px-4 whitespace-nowrap transition-colors duration-500",
                    isActive
                      ? "border-taupe/50 text-ink"
                      : "border-taupe/20 text-ink/45",
                  )}
                >
                  <span className="wd-num text-[12px] tabular-nums text-champagne">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[15px] tracking-[0.06em]">
                    {chapter.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
