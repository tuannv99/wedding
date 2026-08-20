"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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

  useEffect(() => {
    const { documentElement: root, body } = document;
    root.style.overflow = opened ? "" : "hidden";
    body.style.overflow = opened ? "" : "hidden";

    return () => {
      root.style.overflow = "";
      body.style.overflow = "";
    };
  }, [opened]);

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
