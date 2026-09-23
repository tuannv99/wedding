"use client";

import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import RsvpForm, { type RsvpData } from "@/components/wedding/RsvpForm";

/**
 * Section RSVP: chỉ lo phần khung + gọi API.
 * Toàn bộ giao diện form nằm trong RsvpForm (export từ Claude Design),
 * nên sau này đổi thiết kế form không phải đụng tới chỗ gọi API.
 *
 * Spacing dùng chung hệ padding chuẩn của mọi section (px-6 py-28 md:px-5
 * md:py-40), nền warm white, viền trên dưới 1px taupe 20%, khung form rộng
 * tối đa 720px.
 */
export function RSVP() {
  async function handleSubmit(data: RsvpData) {
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name.trim(),
        attending: data.attending ?? "yes",
        guests: data.attending === "no" ? 0 : data.guests,
        message: data.note.trim(),
        company: data.company,
        formLoadedAt: data.formLoadedAt,
      }),
    });

    // Ném lỗi để RsvpForm hiện thông báo thay vì nhảy sang màn "cảm ơn"
    if (!response.ok) throw new Error("RSVP request failed");
  }

  return (
    <section
      id="rsvp"
      className="relative isolate w-full overflow-hidden border-y border-taupe/20 bg-ivory px-6 py-16 md:px-5 md:py-40"
    >
      {/* Branch mép phải — cỡ chuẩn hoá dùng chung toàn site: 62vh/0.32. */}
      <BotanicalAccent
        variant="branch"
        opacity={0.32}
        depth={6}
        flip
        className="top-[8%] -right-[4vw] hidden h-[62vh] w-[24vh] lg:block"
      />

      <div className="mx-auto w-full max-w-[720px]">
        <Reveal>
          <RsvpForm
            eyebrow={wedding.copy.rsvp.eyebrow}
            title={wedding.copy.rsvp.title}
            submitLabel={wedding.copy.rsvp.submitLabel}
            successTitle={wedding.copy.rsvp.successTitle}
            successBody={wedding.copy.rsvp.successBody}
            onSubmit={handleSubmit}
          />
        </Reveal>
      </div>
    </section>
  );
}
