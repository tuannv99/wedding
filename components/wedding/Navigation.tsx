"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Music2, X } from "lucide-react";
import { wedding } from "@/lib/wedding";
import { scrollToSection } from "@/lib/utils";
import { useInvitation } from "@/lib/invitation";
import { useMusic } from "@/lib/music";
import { cn } from "@/lib/utils";

/**
 * Nút nhạc nằm ngay trên thanh nav (đúng bản design: nốt nhạc + đồng hồ mm:ss).
 * Chỉ là consumer của MusicProvider — phần <audio> và logic phát/dừng nằm ở
 * lib/music.tsx nên không có bản sao state nào ở đây.
 */
function MusicToggle({ className }: { className?: string }) {
  const { available, playing, elapsed, toggle } = useMusic();
  if (!available) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={
        playing
          ? `Tắt nhạc nền: ${wedding.music.title}`
          : `Bật nhạc nền: ${wedding.music.title}`
      }
      title={wedding.music.title}
      className={cn(
        "flex min-h-11 items-center gap-2.5 text-ink transition-opacity duration-500 hover:opacity-60",
        className,
      )}
    >
      <Music2
        className={cn("h-3.5 w-3.5", playing ? "text-ink" : "text-taupe")}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="wd-numeral text-[11px] leading-none tracking-[0.18em] tabular-nums text-ink/70">
        {elapsed}
      </span>
    </button>
  );
}

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(wedding.nav[0].id);
  const { opened } = useInvitation();

  // Khoá scroll + đóng bằng Escape khi menu mobile mở
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /**
   * Gạch chân mục đang xem (bản design gạch chân "HOME").
   * rootMargin kéo "đường ngắm" về khoảng 1/3 trên màn hình để mục sáng lên
   * đúng lúc section đó chiếm phần nhìn chính, không phải lúc nó vừa ló ra.
   */
  useEffect(() => {
    if (!opened) return;

    const sections = wedding.nav
      .filter((item) => "id" in item)
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [opened]);

  const goTo = useCallback((id: string) => {
    setOpen(false);
    // Chờ menu đóng xong mới cuộn để tránh giật layout
    window.setTimeout(() => scrollToSection(id), 120);
  }, []);

  // Trước khi khách bấm "Mở thiệp", trang chỉ hiện Hero — chưa cần menu.
  if (!opened) return null;

  return (
    <>
      {/* Thanh nav luôn có nền + gạch chân như bản design (không đổi theo scroll).
          will-change-transform + translateZ(0): ép header lên layer GPU riêng —
          nếu không, backdrop-blur kết hợp với các section `isolate` (từ decoration
          botanical) khiến trình duyệt phải tính lại blur/layout liên tục lúc cuộn,
          gây flicker rõ trên mobile. Không đổi gì về hiển thị. */}
      <header className="fixed inset-x-0 top-0 z-50 [transform:translateZ(0)] border-b border-taupe/20 bg-ivory/85 backdrop-blur-md will-change-transform">
        <nav
          aria-label="Điều hướng chính"
          className="mx-auto flex h-16 w-full max-w-[104rem] items-center justify-between px-6 md:h-[72px] md:px-10"
        >
          {/* Menu căn trái sát mép, đúng bản design.
              Khoảng cách phải hẹp ở md: chữ serif rộng hơn sans khá nhiều nên
              với gap cũ (36px) hàng menu chạm đúng vào nút nhạc ở 768–900px. */}
          <ul className="hidden items-center gap-5 md:flex lg:gap-8 xl:gap-11">
            {wedding.nav.map((item) => {
              // Mục có `href`: chuyển hẳn sang trang khác (vd. /wishes) —
              // không tham gia cuộn/gạch chân "đang xem" như mục có `id`.
              if ("href" in item) {
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="wd-nav-link relative inline-flex min-h-11 items-center text-[13px] text-ink/68 transition-colors duration-500 lg:text-[15px]"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              const isActive = active === item.id;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => goTo(item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      // 13px ở md rồi mới lên 15px từ lg: chữ serif rộng hơn
                      // sans nên ở 768–900px hàng menu dí sát nút nhạc.
                      "wd-nav-link relative inline-flex min-h-11 items-center text-[13px] transition-colors duration-500 lg:text-[15px]",
                      isActive ? "text-ink" : "text-ink/68",
                    )}
                  >
                    {item.label}
                    {/* Gạch chân mục đang xem — trượt mượt giữa các mục */}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-underline"
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-2.5 h-[1.5px] bg-ink"
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Mobile: tên cặp đôi giữ vai trò "về đầu trang" thay cho menu ngang */}
          <button
            type="button"
            onClick={() => goTo(wedding.nav[0].id)}
            className="font-display inline-flex min-h-11 items-center text-sm tracking-[0.28em] text-ink uppercase md:hidden"
          >
            {wedding.groom.short} &amp; {wedding.bride.short}
          </button>

          <div className="flex items-center gap-1">
            <MusicToggle />

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Đóng menu" : "Mở menu"}
              className="-mr-3 flex h-12 w-12 items-center justify-center text-ink md:hidden"
            >
              {open ? (
                <X className="h-5 w-5" strokeWidth={1.25} aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.25} aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-10 bg-ivory px-6 md:hidden"
          >
            <ul className="flex flex-col items-center gap-8">
              {wedding.nav.map((item, index) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.1 + index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {"href" in item ? (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="font-display text-center text-[1.375rem] tracking-[0.1em] text-ink uppercase"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goTo(item.id)}
                      className="font-display text-center text-[1.375rem] tracking-[0.1em] text-ink uppercase"
                    >
                      {item.label}
                    </button>
                  )}
                </motion.li>
              ))}
            </ul>

            <hr className="wd-rule" />
            <p className="wd-eyebrow wd-num">{wedding.date.display}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
