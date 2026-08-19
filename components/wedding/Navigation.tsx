"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { coupleShort, wedding } from "@/lib/wedding";
import { cn, scrollToSection } from "@/lib/utils";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const goTo = useCallback((id: string) => {
    setOpen(false);
    // Chờ menu đóng xong mới cuộn để tránh giật layout
    window.setTimeout(() => scrollToSection(id), 120);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-out",
          scrolled
            ? "border-b border-taupe/20 bg-ivory/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Điều hướng chính"
          className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:h-20 md:px-10"
        >
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-display inline-flex min-h-11 items-center text-sm tracking-[0.32em] text-ink uppercase transition-opacity duration-500 hover:opacity-60 md:text-base"
          >
            {coupleShort}
          </button>

          <ul className="hidden items-center gap-10 md:flex">
            {wedding.nav.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => goTo(item.id)}
                  className="wd-nav-link inline-flex min-h-11 items-center transition-colors duration-500"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

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
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.1 + index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <button
                    type="button"
                    onClick={() => goTo(item.id)}
                    className="font-display text-2xl tracking-[0.2em] text-ink uppercase"
                  >
                    {item.label}
                  </button>
                </motion.li>
              ))}
            </ul>

            <hr className="wd-rule" />
            <p className="wd-eyebrow">{wedding.date.display}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
