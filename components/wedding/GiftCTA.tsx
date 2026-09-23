"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Botanical } from "@/components/ui/Botanical";
import { CopyButton } from "@/components/ui/CopyButton";
import { weddingBankAccounts, type BankAccount } from "@/lib/wedding-bank";
import { useScrollLock } from "@/lib/scroll-lock";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function QrBlock({ account }: { account: BankAccount }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center sm:gap-2.5">
      <p className="wd-label text-ink">{account.displayName}</p>

      {account.qrImage ? (
        <div className="relative h-[168px] w-[168px] overflow-hidden bg-warm sm:h-[188px] sm:w-[188px]">
          <Image
            src={account.qrImage}
            alt={`Mã QR chuyển khoản mừng cưới cho ${account.displayName}`}
            fill
            sizes="188px"
            className="object-contain"
          />
        </div>
      ) : (
        // Placeholder: chưa có QR thật — khung nét đứt, không giả một QR có
        // thể quét nhầm ra dữ liệu vô nghĩa.
        <div
          aria-hidden="true"
          className="flex h-[168px] w-[168px] flex-col items-center justify-center gap-2 border border-dashed border-taupe/50 sm:h-[188px] sm:w-[188px]"
        >
          <Botanical variant="mark" className="h-4 w-11 text-sage/60" />
          <span className="wd-eyebrow text-taupe">QR đang cập nhật</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-1">
        <p className="wd-body-sm">{account.bankName}</p>
        <p className="wd-body-sm wd-num tracking-[0.04em]">{account.accountNumber}</p>
        <p className="wd-body-sm text-ink/60">{account.accountName}</p>
      </div>

      <CopyButton
        value={account.accountNumber}
        label="Sao chép số tài khoản"
        // Label dài hơn các nút wd-btn-ghost khác — tracking hẹp hơn một
        // chút để vừa 1 dòng; modal đã được nới rộng (xem max-w ở dưới) để
        // mỗi cột đủ chỗ thay vì phải rút ngắn chữ.
        className="tracking-[0.15em]"
      />
    </div>
  );
}

export function GiftCTA() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  // Cùng cơ chế với Lightbox.tsx: portal thẳng vào body (tránh bị nhốt trong
  // stacking context `isolate` của section), khoá scroll nền, Esc để đóng,
  // Tab không thoát khỏi modal.
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key === "Tab") {
        const focusables =
          containerRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
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
    closeRef.current?.focus();

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* CTA kín đáo — chữ + viền mảnh, không phải nút CTA lớn. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="wd-btn-ghost"
      >
        ♡ Mừng cưới
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  role="presentation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="fixed inset-0 z-60 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm sm:p-6"
                  onClick={(event) => {
                    if (event.target === event.currentTarget) setOpen(false);
                  }}
                >
                  <motion.div
                    ref={containerRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="gift-modal-title"
                    initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97, y: reduceMotion ? 0 : 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.97, y: reduceMotion ? 0 : 8 }}
                    transition={{ duration: 0.4, ease: EASE_OUT }}
                    className="relative max-h-[95svh] w-full max-w-[560px] overflow-y-auto bg-ivory px-6 py-12 sm:max-w-[780px] sm:px-10 sm:py-6"
                  >
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Đóng"
                      className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center text-ink/60 transition-colors duration-500 hover:text-ink"
                    >
                      <X className="h-5 w-5" strokeWidth={1.25} aria-hidden="true" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                      <Botanical variant="mark" className="h-5 w-14 text-sage/75" />
                      <h2
                        id="gift-modal-title"
                        className="wd-h1 mt-6 text-[clamp(28px,4vw,36px)] tracking-[0.1em] uppercase"
                      >
                        Mừng cưới
                      </h2>
                      <p className="wd-body-sm mx-auto mt-6 max-w-[380px] sm:max-w-[440px]">
                        Sự hiện diện của bạn đã là món quà quý giá đối với
                        chúng mình.
                        <br />
                        Nếu bạn muốn gửi thêm một chút yêu thương, chúng mình
                        xin chân thành cảm ơn.
                      </p>
                    </div>

                    <div className="mt-12 flex flex-col items-center gap-12 sm:mt-6 sm:flex-row sm:items-start sm:justify-center sm:gap-12">
                      <QrBlock account={weddingBankAccounts.groom} />
                      <div aria-hidden="true" className="h-px w-16 bg-taupe/25 sm:h-auto sm:w-px sm:self-stretch" />
                      <QrBlock account={weddingBankAccounts.bride} />
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
