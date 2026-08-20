import { wedding } from "@/lib/wedding";

/** yyyymmddThhmmssZ theo giờ UTC, đúng định dạng Google Calendar cần. */
function toUtcStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/** Link "Lưu ngày cưới" mở thẳng Google Calendar với sự kiện đã điền sẵn. */
export function buildGoogleCalendarUrl() {
  const start = new Date(wedding.date.target);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Lễ cưới ${wedding.groom.short} & ${wedding.bride.short}`,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: [
      `${wedding.ceremony.label}: ${wedding.ceremony.time}`,
      `${wedding.reception.label}: ${wedding.reception.time}`,
      `${wedding.venues.bride.label}: ${wedding.venues.bride.name}`,
      `${wedding.venues.groom.label}: ${wedding.venues.groom.name}`,
    ].join("\n"),
    location: `${wedding.venues.bride.name} / ${wedding.venues.groom.name}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
