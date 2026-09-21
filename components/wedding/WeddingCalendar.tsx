import { Heart } from "lucide-react";
import { wedding } from "@/lib/wedding";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** Lưới ngày trong tháng, ô trống (null) chèn đầu/cuối để căn đúng cột thứ. */
function buildCalendarDays(year: number, monthIndex: number): (number | null)[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  // JS getDay(): 0 = Chủ Nhật..6 = Thứ Bảy — quy về 0 = Thứ Hai..6 = Chủ Nhật.
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;

  const days: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

/**
 * Lịch tháng cưới, thay cho khối ngày dạng hàng dọc cũ — các ngày trong
 * `date.highlightDays` được khoanh bằng một trái tim nhỏ, dùng đúng màu
 * accent (champagne) đang dùng chung toàn site, không thêm màu mới.
 */
export function WeddingCalendar() {
  const { date } = wedding;
  const year = Number(date.year);
  const monthIndex = Number(date.month) - 1;
  const highlightDays = date.highlightDays.map(Number);
  const days = buildCalendarDays(year, monthIndex);

  return (
    <div className="mx-auto w-full max-w-[360px]">
      <p className="sr-only">
        Ngày cưới: {date.weekday}, {date.day}/{date.month}/{date.year}
      </p>

      <div className="flex flex-col items-center gap-1">
        <span className="wd-eyebrow">
          Tháng <span className="wd-num">{date.month}</span> ·{" "}
          <span className="wd-num">{date.year}</span>
        </span>
      </div>

      <div aria-hidden="true" className="mt-8 grid grid-cols-7 gap-y-2 sm:gap-y-3">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="wd-fact-label wd-num pb-2 text-center text-[11px] tracking-[0.18em]"
          >
            {label}
          </span>
        ))}

        {days.map((day, index) => {
          const isHighlighted = day !== null && highlightDays.includes(day);

          return (
            <div key={index} className="flex items-center justify-center py-0.5">
              {day ? (
                <span className="relative flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10">
                  {isHighlighted ? (
                    <Heart
                      className="absolute inset-0 h-full w-full text-champagne"
                      fill="currentColor"
                      strokeWidth={0}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span
                    className={cn(
                      "wd-num relative z-10 text-[15px] sm:text-base",
                      isHighlighted ? "font-medium text-ink" : "text-ink/70",
                    )}
                  >
                    {day}
                  </span>
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
