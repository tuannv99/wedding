import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/wishes", label: "Lời chúc" },
  { href: "/admin/rsvp", label: "Xác nhận tham dự" },
  { href: "/admin/guests", label: "Khách mời" },
] as const;

/** Chuyển nhanh giữa các trang quản lý. */
export function AdminNav({ active }: { active: "wishes" | "rsvp" | "guests" }) {
  return (
    <nav aria-label="Điều hướng quản trị" className="mt-8 flex gap-6">
      {TABS.map((tab) => {
        const isActive = tab.href === `/admin/${active}`;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "wd-label border-b-2 border-transparent pb-2 text-[13px] transition-colors duration-300",
              isActive ? "border-ink text-ink" : "text-taupe hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
