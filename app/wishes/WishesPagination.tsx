import Link from "next/link";
import { buildPageTokens } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type Props = {
  currentPage: number;
  totalPages: number;
};

/**
 * Thuần Link server-rendered — không cần "use client": điều hướng trang qua
 * URL (?page=n) hoạt động không cần JS, bàn phím/screen reader dùng được
 * ngay vì đây là link thật, không phải nút bấm giả.
 *
 * Hiển thị dạng chấm tròn (không hiện số) theo tham chiếu thiết kế — nhưng
 * vẫn giữ aria-label="Trang N" trên từng Link để screen reader đọc được số
 * trang thật. Mũi tên trước/sau vẫn giữ (rất mảnh, mờ) để đảm bảo mọi trang
 * luôn tới được bằng bàn phím kể cả khi danh sách bị rút gọn bằng "…".
 */
export function WishesPagination({ currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const tokens = buildPageTokens(currentPage, totalPages);
  const arrowClass =
    "flex h-11 w-6 items-center justify-center text-[13px] transition-colors duration-300";

  return (
    <nav
      aria-label="Phân trang lời chúc"
      className="mt-14 flex flex-wrap items-center justify-center gap-1 md:mt-16"
    >
      {currentPage === 1 ? (
        <span aria-hidden="true" className={cn(arrowClass, "text-ink/15")}>
          ‹
        </span>
      ) : (
        <Link
          href={`/wishes?page=${currentPage - 1}`}
          aria-label="Trang trước"
          className={cn(arrowClass, "text-ink/35 hover:text-ink")}
        >
          ‹
        </Link>
      )}

      {tokens.map((token, i) =>
        token === "ellipsis" ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="flex h-11 w-6 items-center justify-center"
          >
            <span className="h-[3px] w-[3px] rounded-full bg-ink/25" />
          </span>
        ) : (
          <Link
            key={token}
            href={`/wishes?page=${token}`}
            aria-label={`Trang ${token}`}
            aria-current={token === currentPage ? "page" : undefined}
            className="group flex h-11 w-6 items-center justify-center"
          >
            <span
              className={cn(
                "rounded-full transition-all duration-300",
                token === currentPage
                  ? "h-[7px] w-[7px] bg-ink"
                  : "h-[6px] w-[6px] border border-ink/30 group-hover:border-ink/60",
              )}
            />
          </Link>
        ),
      )}

      {currentPage === totalPages ? (
        <span aria-hidden="true" className={cn(arrowClass, "text-ink/15")}>
          ›
        </span>
      ) : (
        <Link
          href={`/wishes?page=${currentPage + 1}`}
          aria-label="Trang sau"
          className={cn(arrowClass, "text-ink/35 hover:text-ink")}
        >
          ›
        </Link>
      )}
    </nav>
  );
}
