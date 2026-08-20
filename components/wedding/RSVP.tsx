"use client";

import { wedding } from "@/lib/wedding";
import { Reveal } from "@/components/ui/Reveal";
import RsvpForm, { type RsvpData } from "@/components/wedding/RsvpForm";

/**
 * Section RSVP: chỉ lo phần khung + gọi API.
 * Toàn bộ giao diện form nằm trong RsvpForm (export từ Claude Design),
 * nên sau này đổi thiết kế form không phải đụng tới chỗ gọi API.
 *
 * Spacing theo spec: padding clamp(84px,13vh,168px) / clamp(24px,6vw,120px),
 * nền warm white, viền trên dưới 1px taupe 20%, khung form rộng tối đa 620px.
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
      }),
    });

    // Ném lỗi để RsvpForm hiện thông báo thay vì nhảy sang màn "cảm ơn"
    if (!response.ok) throw new Error("RSVP request failed");
  }

  return (
    <section
      id="rsvp"
      className="w-full border-y border-taupe/20 bg-ivory px-[clamp(24px,6vw,120px)] py-[clamp(84px,13vh,168px)]"
    >
      <div className="mx-auto w-full max-w-[620px]">
        <Reveal>
          <RsvpForm
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
