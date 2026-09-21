import { CalendarHeart, MapPin, Phone } from "lucide-react";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { BotanicalRule } from "@/components/ui/Botanical";
import { WeddingCalendar } from "@/components/wedding/WeddingCalendar";
import { buildGoogleCalendarUrl } from "@/lib/calendar";

export function WeddingDetails() {
  const { date, reception, venues, groom, bride, copy } = wedding;

  /** Ghép mỗi địa điểm với đúng SĐT liên hệ của bên đó (nhà trai ↔ chú rể, nhà gái ↔ cô dâu). */
  const parties = [
    { place: venues.groom, phone: groom.phone },
    { place: venues.bride, phone: bride.phone },
  ];

  return (
    <section
      id="the-wedding"
      className="relative isolate w-full overflow-hidden bg-ivory px-6 py-28 md:px-5 md:py-40"
    >
      {/* Branch mép trái ngang khối lịch, sprig mép phải ngang khối tiệc —
          cân bố cục theo đường chéo. Ẩn dưới lg: dưới đó nội dung đã chiếm
          gần hết bề ngang. Cỡ chuẩn hoá: branch 62vh/0.32, sprig 36vh/0.26. */}
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

        {/* Lịch tháng cưới — thay cho khối ngày dạng hàng dọc cũ, ngày cưới
            được khoanh tròn bằng đúng màu champagne đang dùng chung site. */}
        <Reveal delay={0.15} className="mt-14 w-full md:mt-16">
          <WeddingCalendar />
        </Reveal>

        <Reveal delay={0.2} className="mt-14 flex flex-col items-center">
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

        {/* Tiệc nhà trai / nhà gái: bỏ hẳn Google Map nhúng, chỉ còn giờ · thứ
            · ngày · địa chỉ dạng editorial — đúng tinh thần thiệp giấy hơn là
            một dashboard card. */}
        <Reveal delay={0.2} className="mt-20 flex w-full flex-col items-center md:mt-28">
          <BotanicalRule className="mb-14 w-full max-w-xs" lineClassName="flex-1" />
          <h3 className="wd-h1 tracking-[0.16em] uppercase">{copy.details.venueLabel}</h3>

          <div className="mt-14 grid w-full grid-cols-1 gap-16 sm:grid-cols-2 sm:gap-10">
            {parties.map(({ place, phone }) => (
              <div key={place.label} className="flex flex-col items-center">
                <span className="wd-label tracking-[0.3em] text-taupe">
                  {copy.details.partyLabel} {place.label}
                </span>

                <span className="wd-fact-label mt-9">{copy.details.atLabel}</span>
                <span className="wd-numeral mt-2 text-[clamp(2.25rem,8vw,3.5rem)] tracking-[0.02em]">
                  {reception.time}
                </span>

                <p className="wd-body-sm mt-3">
                  {date.weekday} ·{" "}
                  <span className="wd-num">
                    {date.day}/{date.month}/{date.year}
                  </span>
                </p>

                <span className="wd-label mt-10 tracking-[0.24em] text-taupe">
                  {copy.details.atHome} {place.label}
                </span>
                <p className="wd-body-sm mt-3 max-w-xs text-balance">{place.address}</p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <a
                    href={place.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wd-btn-ghost gap-3"
                  >
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    {copy.details.mapsLabel}
                  </a>
                  <a href={`tel:${phone}`} className="wd-btn-ghost gap-3">
                    <Phone className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    {copy.details.contactLabel}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
