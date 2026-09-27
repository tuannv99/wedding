"use client";

import { useEffect } from "react";

/**
 * Khoá cuộn trang cho các lớp phủ toàn màn hình: lightbox, menu mobile, khung
 * thông tin mừng cưới, và cả lúc thiệp chưa được mở.
 *
 * Ba điều khác với cách cũ (mỗi nơi tự ghi `document.body.style.overflow`):
 *
 * 1. Khoá trên <html> chứ KHÔNG phải <body>. body đang mang `overflow-x: clip`
 *    (app/globals.css) — thứ chặn tràn ngang mà không biến body thành khung
 *    cuộn, nhờ đó `position: sticky` ở các trang con còn sống. Ghi
 *    `body.style.overflow = "hidden"` là ghi đè luôn cả overflow-x đó rồi trả
 *    lại bằng chuỗi rỗng, tức mỗi lần mở/đóng một lớp phủ là một lần thuộc
 *    tính overflow của body đổi qua đổi lại.
 *
 * 2. Đếm số lớp đang khoá. Trước đây mỗi lớp tự nhớ giá trị cũ rồi tự trả lại;
 *    hai lớp chồng nhau thì lớp đóng trước xoá luôn khoá của lớp còn đang mở.
 *
 * 3. Bề ngang trang KHÔNG đổi khi khoá, nhờ `scrollbar-gutter: stable` trên
 *    <html>: máng thanh cuộn luôn được chừa sẵn nên lúc thanh cuộn biến mất
 *    cũng không có cú reflow ~15px nào chạy qua cả trang.
 *
 * Riêng máy cảm ứng (iPhone/iPad/Android) KHÔNG đụng tới overflow: trên
 * iPhone, đổi overflow của <html> là Safari dỡ bỏ rồi dựng lại cả lớp cuộn của
 * trang (kèm vẽ/giải mã lại mọi ảnh đang trong màn hình), có khi còn bung thanh
 * địa chỉ làm khung nhìn đổi cao — trang phía sau nháy một cái lúc lớp phủ mở,
 * và nháy lần nữa lúc nó đóng. Ở đó chỉ chặn chính cử chỉ vuốt, layout trang
 * không đổi một pixel nào. Phần tử nào bên trong lớp phủ cần tự cuộn (ví dụ
 * khung mừng cưới dài hơn màn) thì gắn `data-scroll-lock-allow` + class
 * `overscroll-contain` để cú vuốt không lan xuống trang.
 */
let locks = 0;
let previousOverflow = "";

function isTouchDevice() {
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

function blockTouchScroll(event: TouchEvent) {
  // Hai ngón trở lên là pinch-zoom (phóng ảnh trong lightbox) — để yên.
  if (event.touches.length > 1) return;

  const target = event.target instanceof Element ? event.target : null;
  const scroller = target?.closest<HTMLElement>("[data-scroll-lock-allow]");
  if (scroller && scroller.scrollHeight > scroller.clientHeight) return;

  event.preventDefault();
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    const touch = isTouchDevice();

    if (locks === 0) {
      if (touch) {
        window.addEventListener("touchmove", blockTouchScroll, { passive: false });
      } else {
        previousOverflow = root.style.overflow;
        root.style.overflow = "hidden";
      }
    }
    locks += 1;

    return () => {
      locks -= 1;
      if (locks > 0) return;
      if (touch) window.removeEventListener("touchmove", blockTouchScroll);
      else root.style.overflow = previousOverflow;
    };
  }, [active]);
}
