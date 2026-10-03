"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useScrollLock } from "@/lib/scroll-lock";
// TẠM THỜI: nạp sớm để cờ ?ft=noanim kịp tắt framer-motion trước mọi animation.
import "@/lib/flicker-test";

/**
 * Trạng thái "đã mở thiệp": ban đầu trang chỉ hiện Hero và khoá scroll,
 * chỉ khi khách bấm "Mở thiệp" mới hiện các section còn lại và mở scroll.
 */
type InvitationContextValue = {
  opened: boolean;
  open: () => void;
};

const InvitationContext = createContext<InvitationContextValue | null>(null);

export function InvitationProvider({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState(false);

  // Cùng một khoá cuộn với lightbox/menu/khung mừng cưới — xem lib/scroll-lock.ts
  // về lý do khoá trên <html> và tại sao phải đếm số lớp đang khoá.
  useScrollLock(!opened);

  const open = useCallback(() => setOpened(true), []);

  return (
    <InvitationContext.Provider value={{ opened, open }}>
      {children}
    </InvitationContext.Provider>
  );
}

export function useInvitation() {
  const ctx = useContext(InvitationContext);
  if (!ctx) {
    throw new Error("useInvitation phải được dùng trong InvitationProvider");
  }
  return ctx;
}
