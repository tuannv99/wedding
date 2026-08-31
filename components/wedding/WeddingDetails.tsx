import { CalendarHeart, Clock3, MapPin, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { BotanicalRule } from "@/components/ui/Botanical";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { cn } from "@/lib/utils";

/**
 * Chuỗi chỉ gồm chữ số và dấu ngăn (ngày, giờ). Dải 4 cột trộn cả số lẫn chữ
 * trong cùng một mảng `lines` (ví dụ "25 . 10 . 2026" đứng cạnh "Chủ Nhật",
 * "Xuân Phương ,Ninh Bình"), nên phải lọc từng dòng chứ không đổi font cả cụm.
 */
const IS_NUMBER = /^[0-9 .:·/-]+$/;

type Fact = {
  icon: LucideIcon;
  label: string;
  lines: string[];
};

export function WeddingDetails() {
  const { date, ceremony, reception, venues, copy } = wedding;

  /**
   * Dải thông tin nhanh 4 cột của bản design (icon nét mảnh · nhãn · giá trị),
   * ngăn nhau bằng đường kẻ dọc 1px. Dữ liệu lấy nguyên từ lib/wedding.ts —
   * không thêm thông tin mới.
   */
  const facts: Fact[] = [
    {
      icon: CalendarHeart,
      label: copy.details.facts.date,
      lines: [`${date.day} . ${date.month} . ${date.year}`, date.weekday],
    },
    {
      icon: Clock3,
      label: copy.details.facts.ceremony,
      lines: [ceremony.time],
    },
    {
      icon: Sparkles,
      label: copy.details.facts.reception,
      lines: [reception.time],
    },
    {
      icon: MapPin,
      label: copy.details.facts.venue,
      lines: [venues.bride.name, venues.groom.name],
    },
  ];

  return (
    <section
      id="the-wedding"
      className="relative isolate w-full overflow-hidden bg-ivory px-6 py-28 md:px-5 md:py-40"
    >
      {/* Branch mép trái ngang khối ngày cưới, sprig mép phải ngang khối địa
          điểm — cân bố cục theo đường chéo. Ẩn dưới lg: dưới đó nội dung đã
          chiếm gần hết bề ngang. Cỡ chuẩn hoá: branch 62vh/0.32, sprig 36vh/0.26. */}
      <BotanicalAccent
        variant="branch"
        opacity={0.32}
        depth={5}
        flip
        className="bottom-[10%] -left-[3vw] hidden h-[62vh] w-[24vh] lg:block"
      />
      <BotanicalAccent
        variant="sprig"
        opacity={0.26}
        depth={5}
        className="top-[24%] -right-[2vw] hidden h-[36vh] w-[20vh] lg:block"
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <Reveal className="flex flex-col items-center gap-4">
          <h2 className="wd-h1 tracking-[0.16em] uppercase">{copy.details.title}</h2>
        </Reveal>

        {/* Ngày cưới dạng editorial: 25 / 10 / 2026 */}
        <Reveal delay={0.15} className="mt-14 md:mt-16">
          <div className="flex flex-col items-center">
            <span className="wd-numeral tracking-[0.02em]">{date.day}</span>
            <span className="wd-numeral mt-2 text-[clamp(2.5rem,11vw,5.5rem)] tracking-[0.08em] text-taupe">
              {date.month}
            </span>
            <span className="wd-numeral mt-3 text-[clamp(1.5rem,6vw,2.75rem)] tracking-[0.28em] text-ink/70">
              {date.year}
            </span>
          </div>
        </Reveal>

        {/*
          Dải 4 cột: mobile 2×2 (4 cột ngang sẽ bóp chữ địa điểm xuống còn vài
          ký tự mỗi dòng), từ sm mới thành một hàng 4 cột như bản design.
          Đường kẻ dọc chỉ vẽ ở cột không đứng đầu hàng, nên không có kẻ thừa
          ở mép trái ở cả hai kiểu lưới.
        */}
        <Reveal delay={0.2} className="mt-16 w-full md:mt-20">
          <ul className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-y-12 sm:grid-cols-4 sm:gap-y-0">
            {facts.map((fact, index) => (
              <li
                key={fact.label}
                className={cn(
                  "flex flex-col items-center gap-3 px-3 sm:px-6",
                  index % 2 === 1 && "border-l border-taupe/25",
                  index % 4 === 0
                    ? "sm:border-l-0"
                    : "sm:border-l sm:border-taupe/25",
                )}
              >
                <fact.icon
                  className="h-5 w-5 text-ink/70"
                  strokeWidth={1}
                  aria-hidden="true"
                />
                <span className="wd-fact-label mt-1">{fact.label}</span>
                {fact.lines.map((line) => (
                  <span
                    key={line}
                    className={cn(
                      "wd-fact-value -mt-1.5 text-balance",
                      IS_NUMBER.test(line) && "wd-num",
                    )}
                  >
                    {line}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.25} className="mt-16 flex flex-col items-center">
          {/* Nút nhỏ, không nổi bật — chỉ mở Google Calendar điền sẵn sự kiện */}
          <a
            href={buildGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="wd-btn-ghost gap-3"
          >
            <CalendarHeart className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            {copy.details.calendarLabel}
          </a>
        </Reveal>

        {/* Venue: nhà gái + nhà trai, mỗi bên kèm Google Map riêng */}
        <Reveal delay={0.2} className="mt-20 flex w-full flex-col items-center md:mt-28">
          <BotanicalRule className="mb-14 w-full max-w-xs" lineClassName="flex-1" />
          <h3 className="wd-h1 tracking-[0.16em] uppercase">{copy.details.venueLabel}</h3>

          <div className="mt-10 grid w-full grid-cols-1 gap-16 sm:grid-cols-2 sm:gap-10">
            {[venues.bride, venues.groom].map((place) => (
              <div key={place.label} className="flex flex-col items-center">
                <span className="wd-label tracking-[0.3em] text-taupe">
                  {place.label}
                </span>
                <p className="wd-h1 mt-4 text-[clamp(1.5rem,4vw,2.25rem)] tracking-[0.08em]">
                  {place.name}
                </p>
                <p className="wd-body-sm mt-4 max-w-xs">{place.address}</p>

                <div className="mt-8 aspect-[4/3] w-full max-w-sm overflow-hidden bg-warm">
                  <iframe
                    src={place.mapEmbedUrl}
                    title={`Bản đồ ${place.label}: ${place.name}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full border-0"
                  />
                </div>

                <a
                  href={place.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wd-btn-ghost mt-8 gap-3"
                >
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  {copy.details.mapsLabel}
                </a>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
