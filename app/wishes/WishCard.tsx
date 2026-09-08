import { type Wish } from "@/lib/wishes";

/**
 * Card lời chúc tối giản cho grid nhiều cột — không card lớn, không shadow,
 * background gần như trùng nền trang (bg-warm chỉ khác ivory rất nhẹ).
 * animationDelay so le nhẹ theo thứ tự (xem .wd-wish-card trong wedding.css).
 */
export function WishCard({ wish, index }: { wish: Wish; index: number }) {
  return (
    <li
      className="wd-wish-card flex flex-col rounded-[3px] border border-taupe/20 bg-warm p-6 md:p-7"
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      <span aria-hidden="true" className="text-sm text-champagne">
        ♡
      </span>
      <p className="wd-body-serif mt-3 flex-1 text-[15px] leading-[1.7] whitespace-pre-line sm:text-base">
        {wish.message}
      </p>
      <span aria-hidden="true" className="mt-5 h-px w-full bg-taupe/20" />
      <span className="wd-label mt-4 truncate text-center text-[12px] text-ink/70">
        {wish.name}
      </span>
    </li>
  );
}
