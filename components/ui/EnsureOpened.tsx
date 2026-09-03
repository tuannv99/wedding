"use client";

import { useEffect } from "react";
import { useInvitation } from "@/lib/invitation";

/**
 * InvitationProvider khoá scroll cho tới khi khách bấm "Mở thiệp" trên trang
 * chủ — nhưng provider đó bọc quanh TOÀN BỘ app (app/layout.tsx), nên các
 * trang độc lập ngoài trang chủ (/wishes, /admin/*) cũng bị khoá scroll ngay
 * từ đầu nếu không có gì gọi `open()`. Đặt component này ở đầu mỗi trang như
 * vậy để mở khoá — không render gì ra DOM.
 */
export function EnsureOpened() {
  const { opened, open } = useInvitation();

  useEffect(() => {
    if (!opened) open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
