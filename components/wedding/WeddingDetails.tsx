import Image from "next/image";
import { CalendarHeart, MapPin, Phone } from "lucide-react";
import { wedding } from "@/lib/wedding";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { BotanicalRule } from "@/components/ui/Botanical";
import { WeddingCalendar } from "@/components/wedding/WeddingCalendar";
import { buildGoogleCalendarUrl } from "@/lib/calendar";

/**
 * Hai nút "Bản đồ" / "Liên hệ" phải nằm CÙNG MỘT HÀNG kể cả ở màn 360px, mà
 * cột chữ lúc đó chỉ rộng khoảng 165px. .wd-btn-ghost mặc định có padding
 * 0 40px và letter-spacing 0.26em — hai nút như vậy rộng gấp đôi chỗ có. Nên
 * ở đây thu lại bằng utility (utility thắng class ở layer components) rồi mới
 * nới dần ra khi màn rộng hơn.
 */
const PARTY_BTN =
  "wd-btn-ghost min-h-11 shrink gap-1.5 px-2.5 text-[10px] tracking-[0.06em] whitespace-nowrap " +
  "sm:gap-2 sm:px-5 sm:text-[12px] sm:tracking-[0.16em] md:px-7 md:text-[13px] md:tracking-[0.2em]";

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
      className="relative isolate w-full overflow-hidden bg-ivory px-6 py-16 md:px-5 md:py-40"
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
        <Reveal delay={0.15} className="mt-9 w-full md:mt-16">
          <WeddingCalendar />
        </Reveal>

        <Reveal delay={0.2} className="mt-9 flex flex-col items-center md:mt-14">
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
        <Reveal delay={0.2} className="mt-14 flex w-full flex-col items-center md:mt-28">
          <BotanicalRule className="mb-9 w-full max-w-xs md:mb-14" lineClassName="flex-1" />
          <h3 className="wd-h1 tracking-[0.16em] uppercase">{copy.details.venueLabel}</h3>

          {/*
            Mỗi bên tiệc là một khối hai cột CHỮ | ẢNH, đổi bên giữa nhà trai
            và nhà gái. Giữ hai cột ở cả mobile (đúng bản mockup) — cột chữ
            rộng hơn cột ảnh vì nó phải chứa cả hàng hai nút.
          */}
          <div className="mt-12 flex w-full flex-col gap-14 md:mt-16 md:gap-24">
            {parties.map(({ place, phone }, index) => {
              // Nhà gái (khối thứ hai) đảo ảnh sang trái cho bố cục so le.
              const photoFirst = index === 1;

              return (
                <div
                  key={place.label}
                  className={cn(
                    // items-stretch để cột ảnh cao bằng cột chữ — ảnh là một
                    // dải dọc cạnh khối thông tin, không phải một ô nhỏ lọt thỏm.
                    "grid items-stretch gap-4 sm:gap-8 md:grid-cols-2 md:gap-14",
                    // Cột CHỮ luôn phải là cột rộng hơn (nó chứa cả hàng hai
                    // nút). `order` chỉ đổi thứ tự hiển thị chứ không đổi bề
                    // rộng cột, nên khối đảo ảnh phải đảo luôn tỉ lệ cột.
                    photoFirst
                      ? "grid-cols-[0.88fr_1.12fr]"
                      : "grid-cols-[1.12fr_0.88fr]",
                  )}
                >
                  {/* --- Cột chữ --- */}
                  <div
                    className={cn(
                      "flex min-w-0 flex-col items-center justify-center text-center",
                      photoFirst ? "order-2" : "order-1",
                    )}
                  >
                    <h4 className="wd-label text-[13px] tracking-[0.18em] text-ink uppercase sm:text-[15px] sm:tracking-[0.26em] md:text-[17px]">
                      {copy.details.partyLabel} {place.label}
                    </h4>
                    <span
                      aria-hidden="true"
                      className="mt-3 block h-px w-[34px] bg-champagne/70"
                    />

                    <p className="wd-body-sm mt-5 text-[13px] sm:text-[15px] md:mt-6">
                      {copy.details.atLabel}{" "}
                      <span className="wd-num">{reception.time}</span>
                    </p>

                    {/* Hàng ngày tháng: thứ trong khung nhỏ · ngày/tháng cỡ lớn · năm mờ */}
                    <div className="mt-3 flex items-center justify-center gap-2 sm:mt-4 sm:gap-3">
                      <span className="rounded-[2px] border border-taupe/35 px-1.5 py-1 text-[9px] leading-none tracking-[0.06em] text-taupe uppercase sm:px-2.5 sm:text-[11px] sm:tracking-[0.1em]">
                        {date.weekday}
                      </span>
                      <span className="wd-num text-[clamp(1.35rem,5.5vw,2.5rem)] leading-none tracking-[0.02em] text-ink">
                        {date.day}/{date.month}
                      </span>
                      <span className="wd-num rounded-[2px] border border-taupe/35 px-1.5 py-1 text-[9px] leading-none tracking-[0.06em] text-taupe sm:px-2 sm:text-[11px]">
                        {date.year}
                      </span>
                    </div>

                    <p className="wd-fact-label mt-5 text-[10px] tracking-[0.18em] sm:text-[12px] sm:tracking-[0.24em] md:mt-7">
                      {copy.details.atHome} {place.label}
                    </p>
                    <p className="wd-body-sm mt-2 max-w-[26ch] text-[12px] text-balance sm:mt-3 sm:text-[15px]">
                      {place.address}
                    </p>

                    <div className="mt-5 flex w-full items-center justify-center gap-1.5 sm:mt-7 sm:gap-3">
                      <a
                        href={place.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={PARTY_BTN}
                      >
                        <MapPin
                          className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        {copy.details.mapsLabel}
                      </a>
                      <a href={`tel:${phone}`} className={PARTY_BTN}>
                        <Phone
                          className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        {copy.details.contactLabel}
                      </a>
                    </div>
                  </div>

                  {/* --- Cột ảnh --- */}
                  <div className={cn("min-w-0", photoFirst ? "order-1" : "order-2")}>
                    {/* Mobile: ảnh kéo cao bằng cột chữ (đúng bản mockup).
                        Từ md cột rộng gấp ba nên kéo cao như vậy sẽ thành một
                        khung ngang bẹt cắt mất phần lớn ảnh dọc — chuyển về
                        đúng tỉ lệ 4:5 và để cột chữ căn giữa theo nó. */}
                    <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-[3px] bg-warm sm:min-h-[320px] md:aspect-[4/5] md:h-auto md:min-h-0">
                      <Image
                        src={place.photo.src}
                        alt={place.photo.alt}
                        fill
                        loading="lazy"
                        sizes="(max-width: 767px) 40vw, 46vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
