import Link from "next/link";
import { buildPageTokens, type PageToken } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type Props = {
  currentPage: number;
  totalPages: number;
};

const cell =
  "font-display flex h-11 min-w-9 items-center justify-center px-1 text-[17px] tracking-[0.06em] sm:min-w-11 md:text-[19px]";

/**
 * Pagination đánh số kiểu editorial: ← 01 02 03 … 12 → và dòng "Trang 1 trên 5".
 *
 * Thuần Link server-rendered — không cần "use client": điều hướng trang qua
 * URL (?page=n) hoạt động không cần JS, bàn phím/screen reader dùng được
 * ngay vì đây là link thật. Chỉ tạo link tới trang hợp lệ; mũi tên ở trang
 * đầu/cuối là span mờ, không phải link chết.
 *
 * `prefetch` (đầy đủ, không chỉ tới loading.tsx): trang đích được tải sẵn khi
 * link lọt vào màn hình, bấm là hiện ngay thay vì chờ server render. Dữ liệu
 * đã cache ở server (xem page.tsx) nên tải sẵn vài trang lân cận rất rẻ.
 *
 * Mobile và từ sm trở lên dùng hai dãy số khác nhau (dãy kia display:none,
 * nên không lọt vào cây accessibility): màn 320px chỉ còn ~272px, vừa đủ cho
 * 2 mũi tên + 5 ô (siblingCount 0); từ sm mới đủ chỗ cho 7 ô (siblingCount 1).
 */
export function WishesPagination({ currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null;

  // 01, 02… cho đều nhịp chữ số; trên 99 trang thì để nguyên số.
  const label = (page: number) =>
    totalPages < 100 ? String(page).padStart(2, "0") : String(page);

  const renderTokens = (tokens: PageToken[]) =>
    tokens.map((token, i) =>
      token === "ellipsis" ? (
        <li key={`ellipsis-${i}`} aria-hidden="true" className={cn(cell, "text-taupe/70")}>
          …
        </li>
      ) : (
        <li key={token}>
          <Link
            href={`/wishes?page=${token}`}
            prefetch
            aria-label={`Trang ${token}`}
            aria-current={token === currentPage ? "page" : undefined}
            className={cn(
              cell,
              "transition-colors duration-200",
              token === currentPage ? "text-ink" : "text-taupe hover:text-ink",
            )}
          >
            <span
              className={cn(
                "border-b pb-0.5",
                token === currentPage ? "border-ink" : "border-transparent",
              )}
            >
              {label(token)}
            </span>
          </Link>
        </li>
      ),
    );

  const arrow = (direction: "prev" | "next") => {
    const target = direction === "prev" ? currentPage - 1 : currentPage + 1;
    const glyph = direction === "prev" ? "←" : "→";
    if (target < 1 || target > totalPages) {
      return (
        <span aria-hidden="true" className={cn(cell, "text-taupe/30")}>
          {glyph}
        </span>
      );
    }
    return (
      <Link
        href={`/wishes?page=${target}`}
        prefetch
        aria-label={direction === "prev" ? "Trang trước" : "Trang sau"}
        className={cn(cell, "text-taupe transition-colors duration-200 hover:text-ink")}
      >
        {glyph}
      </Link>
    );
  };

  return (
    <nav aria-label="Phân trang lời chúc" className="mt-12 flex flex-col items-center md:mt-16">
      <div className="flex items-center">
        {arrow("prev")}
        <ol className="flex items-center sm:hidden">
          {renderTokens(buildPageTokens(currentPage, totalPages, 0))}
        </ol>
        <ol className="hidden items-center sm:flex">
          {renderTokens(buildPageTokens(currentPage, totalPages, 1))}
        </ol>
        {arrow("next")}
      </div>
      <p className="font-display mt-2 text-[13px] tracking-[0.14em] text-taupe md:text-[14px]">
        Trang {currentPage} trên {totalPages}
      </p>
    </nav>
  );
}
