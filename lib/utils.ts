import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gộp class Tailwind an toàn (dùng chung cho toàn bộ component). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Cuộn mượt tới một section theo id, tôn trọng prefers-reduced-motion. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

/** Định dạng ngày kiểu "25 · 10 · 2026" — dùng chung cho lời chúc và RSVP ở trang admin. */
export function formatShortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day} · ${month} · ${year}`;
}
