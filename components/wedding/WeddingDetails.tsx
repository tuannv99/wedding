import { MapPin } from "lucide-react";
import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function WeddingDetails() {
  const { date, ceremony, reception, venue } = wedding;

  return (
    <section
      id="the-wedding"
      className="w-full bg-warm px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <SectionHeading label="Save the date" title="The Wedding" rule={false} />

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

        {/* Venue */}
        <Reveal delay={0.2} className="mt-20 flex w-full flex-col items-center md:mt-28">
          <span aria-hidden="true" className="mb-14 h-px w-full max-w-xs bg-taupe/30" />
          <span className="wd-eyebrow">Venue</span>
          <p className="wd-h1 mt-6 text-[clamp(1.75rem,5vw,2.75rem)] tracking-[0.08em]">
            {venue.name}
          </p>
          <p className="wd-body-sm mt-5 max-w-md">{venue.address}</p>

          <a
            href={venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="wd-btn-ghost mt-10 gap-3"
          >
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            Xem bản đồ
          </a>
        </Reveal>
      </div>
    </section>
  );
}
