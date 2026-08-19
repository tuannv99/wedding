"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export type RsvpPayload = {
  name: string;
  attending: "yes" | "no";
  guests: number;
  message: string;
};

type Status = "idle" | "submitting" | "success" | "error";

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6];

export function RSVP() {
  const nameId = useId();
  const guestsId = useId();
  const messageId = useId();

  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const isSubmitting = status === "submitting";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Bạn cho chúng mình biết tên nhé.");
      return;
    }

    setError(null);
    setStatus("submitting");

    const payload: RsvpPayload = {
      name: name.trim(),
      attending,
      guests: attending === "yes" ? guests : 0,
      message: message.trim(),
    };

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Request failed");

      setStatus("success");
    } catch {
      setStatus("error");
      setError("Gửi chưa thành công. Bạn thử lại giúp mình nhé.");
    }
  }

  return (
    <section id="rsvp" className="w-full bg-warm px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto w-full max-w-xl">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
              className="flex flex-col items-center py-10 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne">
                <Check
                  className="h-5 w-5 text-champagne"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
              </span>

              <h2 className="font-display mt-10 text-[clamp(2.25rem,9vw,3.5rem)] leading-none tracking-[0.06em]">
                Thank you <span className="text-champagne">♡</span>
              </h2>

              <span aria-hidden="true" className="mt-10 h-px w-14 bg-champagne" />

              <p className="font-display mt-10 text-[clamp(1.25rem,4.5vw,1.625rem)] leading-[1.8] whitespace-pre-line text-ink/85">
                {"Sự hiện diện của bạn\nlà món quà tuyệt vời\nđối với chúng mình."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            >
              <Reveal className="flex flex-col items-center gap-5 text-center">
                <span className="label">R.S.V.P</span>
                <h2 className="text-[clamp(1.75rem,6vw,3rem)] leading-[1.15] tracking-[0.12em] uppercase">
                  We would love
                  <br />
                  to see you
                </h2>
                <span aria-hidden="true" className="h-px w-14 bg-champagne" />
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-taupe">
                  Vui lòng xác nhận trước ngày 10.09.2026 để gia đình chuẩn bị chu
                  đáo nhất.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <form onSubmit={handleSubmit} className="mt-16 flex flex-col gap-12">
                  {/* Tên */}
                  <div className="flex flex-col gap-3">
                    <label htmlFor={nameId} className="label">
                      Tên của bạn
                    </label>
                    <input
                      id={nameId}
                      name="name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      required
                      placeholder="Nguyễn Văn A"
                      className="min-h-12 w-full border-b border-taupe/40 bg-transparent pb-3 text-lg text-ink transition-colors duration-500 outline-none placeholder:text-taupe/50 focus:border-ink"
                    />
                  </div>

                  {/* Tham dự */}
                  <fieldset className="flex flex-col gap-4">
                    <legend className="label mb-1">Bạn sẽ tham dự?</legend>

                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                      {(
                        [
                          { value: "yes", label: "Có, tôi sẽ đến" },
                          { value: "no", label: "Rất tiếc, tôi không thể" },
                        ] as const
                      ).map((option) => {
                        const active = attending === option.value;

                        return (
                          <label
                            key={option.value}
                            className={cn(
                              "flex min-h-12 flex-1 cursor-pointer items-center gap-3 border px-5 py-3 text-sm transition-colors duration-500",
                              active
                                ? "border-ink/60 bg-ivory text-ink"
                                : "border-taupe/30 text-taupe hover:border-taupe/60",
                            )}
                          >
                            <input
                              type="radio"
                              name="attending"
                              value={option.value}
                              checked={active}
                              onChange={() => setAttending(option.value)}
                              className="sr-only"
                            />
                            <span
                              aria-hidden="true"
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500",
                                active ? "bg-champagne" : "bg-taupe/40",
                              )}
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Số người */}
                  <div
                    className={cn(
                      "flex flex-col gap-3 transition-opacity duration-500",
                      attending === "no" && "pointer-events-none opacity-40",
                    )}
                  >
                    <label htmlFor={guestsId} className="label">
                      Số người tham dự
                    </label>
                    <div className="relative">
                      <select
                        id={guestsId}
                        name="guests"
                        value={guests}
                        disabled={attending === "no"}
                        onChange={(event) => setGuests(Number(event.target.value))}
                        className="min-h-12 w-full appearance-none border-b border-taupe/40 bg-transparent pr-8 pb-3 text-lg text-ink transition-colors duration-500 outline-none focus:border-ink"
                      >
                        {GUEST_OPTIONS.map((value) => (
                          <option key={value} value={value}>
                            {value} người
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-1 bottom-4 h-4 w-4 text-taupe"
                        strokeWidth={1.25}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Lời nhắn */}
                  <div className="flex flex-col gap-3">
                    <label htmlFor={messageId} className="label">
                      Lời nhắn
                    </label>
                    <textarea
                      id={messageId}
                      name="message"
                      rows={3}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Chúc hai bạn trăm năm hạnh phúc..."
                      className="w-full resize-none border-b border-taupe/40 bg-transparent pb-3 text-lg leading-relaxed text-ink transition-colors duration-500 outline-none placeholder:text-taupe/50 focus:border-ink"
                    />
                  </div>

                  {error ? (
                    <p role="alert" className="text-sm text-ink/70">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-outline self-center"
                  >
                    {/* Không dùng spinner để giữ tinh thần tối giản của thiệp */}
                    <span className={cn(isSubmitting && "animate-pulse")}>
                      {isSubmitting ? "Đang gửi…" : "Xác nhận"}
                    </span>
                  </button>
                </form>
              </Reveal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
