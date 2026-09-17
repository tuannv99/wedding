"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

  /**
   * Nav này giờ dùng ở cả trang chủ lẫn các route thật (/album). Ngoài trang
   * chủ thì không có section nào để cuộn tới, nên mọi mục neo phải đổi thành
   * link "/#id" và scroll-spy phải tắt hẳn.
   */
  const pathname = usePathname();
  const isHome = pathname === "/";

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
    if (!opened || !isHome) return;

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
  }, [opened, isHome]);

  const goTo = useCallback((id: string) => {
    setOpen(false);
    // Chờ menu đóng xong mới cuộn để tránh giật layout
    window.setTimeout(() => scrollToSection(id), 120);
  }, []);

  // Trước khi khách bấm "Mở thiệp", trang chủ chỉ hiện Hero — chưa cần menu.
  if (!opened && isHome) return null;

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
          {/*
            Menu căn trái sát mép, đúng bản design.

            Chỉ hiện từ lg — KHÔNG phải md. Bảy mục với nhãn tiếng Việt dài
            ("Những lời yêu thương") đo được ~640px chữ ở 13px; cộng khoảng
            cách và nút nhạc thì cần ~795px, trong khi ở 768px chỉ còn ~688px
            khả dụng. Trước đây hàng menu tự xuống dòng thứ hai và bị header
            (chiều cao cố định) cắt mất — mục cuối không bấm được ở mọi bề
            ngang 768–1280px.

            Mốc xl (1280px) là mốc đo được đầu tiên còn dư chỗ (~140px) sau khi
            trừ nút nhạc; ở 1024px vẫn thiếu. Dưới xl dùng nút hamburger.
          */}
          <ul className="hidden items-center gap-6 xl:flex 2xl:gap-9">
            {wedding.nav.map((item) => {
              // Mục có `href` là route thật (/album, /wishes) -> sáng khi đang
              // đứng ở đúng route đó. Mục có `id` chỉ sáng ở trang chủ, theo
              // section đang xem.
              const isActive =
                "href" in item ? pathname === item.href : isHome && active === item.id;

              // Cỡ chữ lên dần theo bề ngang thật sự có: chữ serif rộng hơn
              // sans nên nới sớm là hàng menu lại chạm nút nhạc.
              const linkClass = cn(
                "wd-nav-link relative inline-flex min-h-11 items-center text-[14px] transition-colors duration-500 2xl:text-[15px]",
                isActive ? "text-ink" : "text-ink/68",
              );

              // Gạch chân mục đang xem — trượt mượt giữa các mục
              const underline = isActive ? (
                <motion.span
                  layoutId="nav-underline"
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-2.5 h-[1.5px] bg-ink"
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : null;

              // Ngoài trang chủ, mục neo cũng phải là link thật về "/#id":
              // section tương ứng không tồn tại trên trang này để mà cuộn tới.
              if ("href" in item || !isHome) {
                const href = "href" in item ? item.href : `/#${item.id}`;
                return (
                  <li key={item.label}>
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={linkClass}
                    >
                      {item.label}
                      {underline}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => goTo(item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={linkClass}
                  >
                    {item.label}
                    {underline}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Mobile: tên cặp đôi giữ vai trò "về đầu trang" thay cho menu ngang */}
          {isHome ? (
            <button
              type="button"
              onClick={() => goTo(wedding.nav[0].id)}
              className="font-display inline-flex min-h-11 items-center text-sm tracking-[0.28em] text-ink uppercase xl:hidden"
            >
              {wedding.groom.short} &amp; {wedding.bride.short}
            </button>
          ) : (
            <Link
              href="/"
              className="font-display inline-flex min-h-11 items-center text-sm tracking-[0.28em] text-ink uppercase xl:hidden"
            >
              {wedding.groom.short} &amp; {wedding.bride.short}
            </Link>
          )}

          <div className="flex items-center gap-1">
            <MusicToggle />

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Đóng menu" : "Mở menu"}
              className="-mr-3 flex h-12 w-12 items-center justify-center text-ink xl:hidden"
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
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-10 bg-ivory px-6 xl:hidden"
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
                  {"href" in item || !isHome ? (
                    <Link
                      href={"href" in item ? item.href : `/#${item.id}`}
                      onClick={() => setOpen(false)}
                      aria-current={
                        "href" in item && pathname === item.href ? "page" : undefined
                      }
                      className={cn(
                        "font-display text-center text-[1.375rem] tracking-[0.1em] uppercase",
                        "href" in item && pathname === item.href
                          ? "text-ink underline underline-offset-8"
                          : "text-ink",
                      )}
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
