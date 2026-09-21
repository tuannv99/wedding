"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useInvitation } from "@/lib/invitation";

/**
 * Chỉ render children sau khi khách đã bấm "Mở thiệp".
 *
 * .wd-rise (wedding.css) làm nội dung nổi lên đúng nhịp cánh thiệp mở ra
 * (Hero.tsx). Bỏ qua hẳn class này khi prefers-reduced-motion: animation đó
 * có animation-delay 0.42s mà global reduced-motion override (globals.css)
 * chỉ rút ngắn animation-duration chứ không xoá delay, nếu không sẽ có một
 * nhịp nội dung "biến mất" 0.42s dù đã tắt animation.
 */
export function AfterOpen({ children }: { children: ReactNode }) {
  const { opened } = useInvitation();
  const reduceMotion = useReducedMotion();
  if (!opened) return null;
  return <div className={reduceMotion ? undefined : "wd-rise"}>{children}</div>;
}
