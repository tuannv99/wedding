"use client";

import { Reveal } from "@/components/ui/Reveal";
import RsvpForm, { type RsvpData } from "@/components/wedding/RsvpForm";

/**
 * Section RSVP: chỉ lo phần khung + gọi API.
 * Toàn bộ giao diện form nằm trong RsvpForm (export từ Claude Design),
 * nên sau này đổi thiết kế form không phải đụng tới chỗ gọi API.
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
    <section id="rsvp" className="w-full bg-warm px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto w-full max-w-xl">
        <Reveal>
          <RsvpForm
            title={"WE WOULD LOVE\nTO SEE YOU"}
            submitLabel="Xác nhận"
            successTitle="Thank you ♡"
            successBody={
              "Sự hiện diện của bạn\nlà món quà tuyệt vời\nđối với chúng mình."
            }
            note="Vui lòng xác nhận trước ngày 10.09.2026 để gia đình chuẩn bị chu đáo nhất."
            onSubmit={handleSubmit}
          />
        </Reveal>
      </div>
    </section>
  );
}
