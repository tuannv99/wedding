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
 *    cuộn, nhờ đó `position: sticky` của ChapterBook còn sống. Ghi
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
 */
let locks = 0;
let previousOverflow = "";

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;

    if (locks === 0) {
      previousOverflow = root.style.overflow;
      root.style.overflow = "hidden";
    }
    locks += 1;

    return () => {
      locks -= 1;
      if (locks === 0) root.style.overflow = previousOverflow;
    };
  }, [active]);
}
