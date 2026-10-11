import { type Wish } from "@/lib/wishes";

/**
 * Ngày gửi dạng dd.MM.yyyy theo giờ Việt Nam.
 *
 * Trang render hoàn toàn ở server nên không có hydration mismatch, nhưng
 * server có thể chạy ở UTC: một lời chúc gửi lúc 6h sáng giờ VN sẽ ra ngày
 * hôm trước nếu không chốt timeZone. Ngày không hợp lệ → null, card bỏ dòng
 * ngày thay vì in "NaN.NaN.NaN".
 */
const dateParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatWishDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = dateParts.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    dateTime: date.toISOString(),
    label: `${part("day")}.${part("month")}.${part("year")}`,
  };
}

/**
 * Một lời chúc như một lá thư nhỏ trong sổ lưu bút: dấu mở ngoặc → lời
 * chúc → nét kẻ → tên + ngày gửi. Chiều cao tự nhiên (trang xếp kiểu
 * masonry bằng CSS columns), hiện trọn nội dung — không cắt, không "xem thêm".
 *
 * Fade-in chỉ đổi opacity, không translate: transform trên phần tử nằm trong
 * multi-column dễ bị nháy/mất nét ở vài trình duyệt (xem .wd-wish-card).
 */
export function WishCard({ wish, index }: { wish: Wish; index: number }) {
  const date = formatWishDate(wish.createdAt);

  return (
    <li
      className="wd-wish-card mb-4 break-inside-avoid sm:mb-5 lg:mb-6"
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      <article className="rounded-[3px] border border-taupe/20 bg-warm px-6 pt-5 pb-6 transition-colors duration-200 hover:border-taupe/40 lg:px-8 lg:pt-6 lg:pb-7">
        <span
          aria-hidden="true"
          className="font-display block h-[26px] text-[40px] leading-none text-champagne select-none"
        >
          &ldquo;
        </span>
        <p className="font-display mt-2 text-[19px] leading-[1.55] font-normal whitespace-pre-line text-ink [overflow-wrap:anywhere] sm:text-[20px] lg:text-[21px]">
          {wish.message}
        </p>
        <span aria-hidden="true" className="mt-6 mb-4 block h-px w-full bg-taupe/20" />
        <footer className="text-center">
          <p className="font-display text-[16px] leading-snug font-medium text-ink [overflow-wrap:anywhere] sm:text-[17px] lg:text-[18px]">
            {wish.name}
          </p>
          {date && (
            <time
              dateTime={date.dateTime}
              className="font-display mt-1 block text-[12px] tracking-[0.14em] text-taupe lg:text-[13px]"
            >
              {date.label}
            </time>
          )}
        </footer>
      </article>
    </li>
  );
}
