import { CalendarHeart, MapPin } from "lucide-react";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BotanicalDecoration } from "@/components/ui/BotanicalDecoration";
import { buildGoogleCalendarUrl } from "@/lib/calendar";

export function WeddingDetails() {
  const { date, ceremony, reception, venues } = wedding;

  return (
    <section
      id="the-wedding"
      className="relative isolate w-full bg-ivory px-6 py-28 md:px-5 md:py-40"
    >
      <BotanicalDecoration position="top-left" size="md" />
      <BotanicalDecoration position="bottom-right" size="md" />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <SectionHeading
          label={wedding.copy.details.eyebrow}
          title={wedding.copy.details.title}
          rule={false}
        />

        {/* Ngày cưới dạng editorial: 20 / 09 / 2026 */}
        <Reveal delay={0.15} className="mt-16 md:mt-20">
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

        <Reveal delay={0.25} className="mt-12 flex flex-col items-center gap-6">
          <hr className="wd-rule w-16" />
          <p className="wd-label tracking-[0.3em]">{date.weekday}</p>

          {/* Nút nhỏ, không nổi bật — chỉ mở Google Calendar điền sẵn sự kiện */}
          <a
            href={buildGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="wd-btn-ghost mt-2 gap-3"
          >
            <CalendarHeart className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            {wedding.copy.details.calendarLabel}
          </a>
        </Reveal>

        {/* Ceremony · Reception */}
        <div className="mt-20 grid w-full max-w-2xl grid-cols-1 gap-14 sm:grid-cols-2 md:mt-24">
          {[ceremony, reception].map((event, index) => (
            <Reveal
              key={event.label}
              delay={0.15 + index * 0.12}
              className="flex flex-col items-center gap-4"
            >
              <span className="wd-eyebrow">{event.label}</span>
              <span className="wd-numeral text-[clamp(2.25rem,9vw,3.5rem)] tracking-[0.06em]">
                {event.time}
              </span>
            </Reveal>
          ))}
        </div>

        {/* Venue: nhà gái + nhà trai, mỗi bên kèm Google Map riêng */}
        <Reveal delay={0.2} className="mt-20 flex w-full flex-col items-center md:mt-28">
          <span aria-hidden="true" className="mb-14 h-px w-full max-w-xs bg-taupe/30" />
          <span className="wd-eyebrow">{wedding.copy.details.venueLabel}</span>

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
                  {wedding.copy.details.mapsLabel}
                </a>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
