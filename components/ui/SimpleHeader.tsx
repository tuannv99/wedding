import Link from "next/link";
import { wedding } from "@/lib/wedding";

/**
 * Header tối giản cho các trang độc lập ngoài trang chủ (/wishes, /admin/*).
 * KHÔNG dùng chung Navigation.tsx: component đó gắn với scroll-spy theo id
 * section của trang chủ và ẩn hẳn tới khi khách "Mở thiệp" — hai điều kiện
 * không có ý nghĩa ở đây.
 */
export function SimpleHeader() {
  return (
    <header className="w-full border-b border-taupe/20 bg-ivory">
      <nav
        aria-label="Điều hướng"
        className="mx-auto flex h-16 w-full max-w-[104rem] items-center justify-between px-6 md:h-[72px] md:px-10"
      >
        <Link
          href="/"
          className="font-display inline-flex min-h-11 items-center text-sm tracking-[0.28em] text-ink uppercase"
        >
          {wedding.groom.short} &amp; {wedding.bride.short}
        </Link>
        <Link href="/" className="wd-nav-link min-h-11 items-center inline-flex">
          ← Về trang thiệp
        </Link>
      </nav>
    </header>
  );
}
