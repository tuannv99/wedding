"use client";

import type { ReactNode } from "react";
import { useInvitation } from "@/lib/invitation";

/** Chỉ render children sau khi khách đã bấm "Mở thiệp". */
export function AfterOpen({ children }: { children: ReactNode }) {
  const { opened } = useInvitation();
  if (!opened) return null;
  return <>{children}</>;
}
