"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Gate = {
  /** true khi tiêu đề của section đã viết xong — chốt luôn, không đóng lại. */
  open: boolean;
  markOpen: () => void;
};

const RevealGateContext = createContext<Gate | null>(null);

/**
 * Ranh giới của một section có tiêu đề viết chữ (TypewriterTitle).
 *
 * Không render thêm phần tử nào — chỉ là context. Mọi <Reveal> nằm trong đây
 * chờ tới khi tiêu đề viết xong mới bắt đầu hiện (đúng animation, thời lượng,
 * delay vốn có của chúng). Tiêu đề viết xong là chốt: cuộn ngược thì cả chữ tiêu
 * đề lẫn nội dung đã hiện đều giữ nguyên, không ẩn rồi hiện lại.
 *
 * Lồng được: mỗi Reveal / TypewriterTitle chỉ nghe gate gần nhất bọc nó.
 * `fallback`: chỉ tạo gate mới khi chưa có gate nào bọc ngoài (SectionHeading
 * dùng để nét lá dưới tiêu đề luôn chờ tiêu đề, kể cả khi section không bọc
 * RevealGate).
 */
export function RevealGate({
  children,
  fallback = false,
}: {
  children: ReactNode;
  fallback?: boolean;
}) {
  const parent = useContext(RevealGateContext);
  const [open, setOpen] = useState(false);
  const markOpen = useCallback(() => setOpen(true), []);
  const gate = useMemo(() => ({ open, markOpen }), [open, markOpen]);
  if (fallback && parent) return <>{children}</>;
  return <RevealGateContext.Provider value={gate}>{children}</RevealGateContext.Provider>;
}

export function useRevealGate() {
  return useContext(RevealGateContext);
}
