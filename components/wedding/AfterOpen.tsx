"use client";

import type { ReactNode } from "react";
import { useInvitation } from "@/lib/invitation";

/**
 * Chỉ render children sau khi khách đã bấm "Mở thiệp".
 *
 * .wd-rise (wedding.css) làm nội dung nổi lên đúng nhịp cánh thiệp mở ra
 * (Hero.tsx). Chạy cho mọi khách, kể cả máy bật prefers-reduced-motion —
 * cùng quyết định với hiệu ứng mở thiệp; class này được loại khỏi override
 * reduced-motion trong globals.css.
 */
export function AfterOpen({ children }: { children: ReactNode }) {
  const { opened } = useInvitation();
  if (!opened) return null;
  return <div className="wd-rise">{children}</div>;
}
