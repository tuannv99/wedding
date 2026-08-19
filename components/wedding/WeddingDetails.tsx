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
            <span className="font-display text-[clamp(4.5rem,22vw,10rem)] leading-[0.85] tracking-[0.02em] text-ink">
              {date.day}
            </span>
            <span className="font-display mt-2 text-[clamp(2.5rem,12vw,5.5rem)] leading-[0.9] tracking-[0.08em] text-taupe">
              {date.month}
            </span>
            <span className="font-display mt-3 text-[clamp(1.5rem,7vw,3rem)] leading-none tracking-[0.28em] text-ink/70">
              {date.year}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.25} className="mt-12 flex flex-col items-center gap-6">
          <span aria-hidden="true" className="h-px w-16 bg-champagne" />
          <p className="font-display text-xl tracking-[0.3em] uppercase md:text-2xl">
            {date.weekday}
          </p>
        </Reveal>

        {/* Ceremony · Reception */}
        <div className="mt-20 grid w-full max-w-2xl grid-cols-1 gap-14 sm:grid-cols-2 md:mt-24">
          {[ceremony, reception].map((event, index) => (
            <Reveal
              key={event.label}
              delay={0.15 + index * 0.12}
              className="flex flex-col items-center gap-4"
            >
              <span className="label">{event.label}</span>
              <span className="font-display text-[clamp(2.25rem,10vw,3.5rem)] leading-none tracking-[0.06em] text-ink">
                {event.time}
              </span>
            </Reveal>
          ))}
        </div>

        {/* Venue */}
        <Reveal delay={0.2} className="mt-20 flex w-full flex-col items-center md:mt-28">
          <span aria-hidden="true" className="mb-14 h-px w-full max-w-xs bg-taupe/30" />
          <span className="label">Venue</span>
          <p className="font-display mt-6 text-[clamp(1.75rem,6vw,2.75rem)] leading-tight tracking-[0.08em] text-ink">
            {venue.name}
          </p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-taupe md:text-base">
            {venue.address}
          </p>

          <a
            href={venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label mt-8 inline-flex min-h-11 items-center gap-2 border-b border-taupe/40 pb-1 transition-colors duration-500 hover:border-ink hover:text-ink"
          >
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            Xem bản đồ
          </a>
        </Reveal>
      </div>
    </section>
  );
}
