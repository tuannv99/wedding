import { MotionGlobalConfig } from "framer-motion";

/**
 * TẠM THỜI — đọc cờ test cô lập hiện tượng nháy (?ft=...). Script ở
 * app/layout.tsx ghi các cờ vào <html data-ft> trước khi React chạy; xem danh
 * sách cờ ở hằng FLICKER_TESTS trong file đó. Xoá file này cùng bộ test.
 */
export function hasFlickerFlag(flag: string): boolean {
  if (typeof document === "undefined") return false;
  const flags = document.documentElement.getAttribute("data-ft");
  return flags ? flags.split(" ").includes(flag) : false;
}

// noanim: framer-motion nhảy thẳng tới trạng thái cuối, không chạy animation
// nào (phần CSS animation/transition được tắt ở cuối app/globals.css).
if (hasFlickerFlag("noanim")) {
  MotionGlobalConfig.skipAnimations = true;
  MotionGlobalConfig.instantAnimations = true;
}
