"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BotanicalRule } from "@/components/ui/Botanical";
import { cn } from "@/lib/utils";

export type RsvpData = {
  name: string;
  attending: "yes" | "no" | null;
  guests: number;
  note: string;
  /** Honeypot — luôn rỗng với người dùng thật, khác rỗng nếu bot tự điền hết field. */
  company: string;
  /** Thời điểm form load (ms) — submit quá nhanh sau đó là dấu hiệu bot. */
  formLoadedAt: number;
};

type Props = {
  title?: string;
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
  /** Ghi chú nhỏ dưới nút gửi (ẩn đi sau khi gửi thành công). */
  note?: string;
  /** Gọi API/DB ở đây. Trả về Promise để component tự hiện trạng thái đang gửi. */
  onSubmit?: (data: RsvpData) => void | Promise<void>;
};

export default function RsvpForm({
  title = "RẤT MONG\nĐƯỢC GẶP BẠN",
  submitLabel = "Gửi lời chúc",
  successTitle = "Cảm ơn bạn ♡",
  successBody = "Sự hiện diện của bạn là món quà tuyệt vời đối với chúng mình.",
  note,
  onSubmit,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<RsvpData>({
    name: "",
    // Mặc định chọn sẵn "Có, tôi sẽ đến" (lựa chọn đầu aria-pressed="true")
    attending: "yes",
    guests: 1,
    note: "",
    company: "",
    formLoadedAt: 0,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  // Đặt sau mount (không phải trong useState initializer) để đúng là thời
  // điểm form thực sự sẵn sàng cho người dùng tương tác trên trình duyệt.
  useEffect(() => {
    setData((d) => ({ ...d, formLoadedAt: Date.now() }));
  }, []);

  const set = <K extends keyof RsvpData>(key: K, value: RsvpData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  // Form dài co lại thành vài dòng "Cảm ơn bạn" sau khi gửi — nếu không chủ
  // động cuộn lên, vị trí cuộn cũ (đang ở gần nút Gửi, cuối form) sẽ lộ ra
  // ngay phần footer phía dưới thay vì lời cảm ơn. Focus luôn (không chỉ
  // cuộn) để trình đọc màn hình cũng thông báo đúng nội dung mới.
  useEffect(() => {
    if (!sent) return;
    successRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    successRef.current?.focus({ preventScroll: true });
  }, [sent, reduceMotion]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;

    if (!data.name.trim()) {
      setError("Bạn cho chúng mình biết tên nhé.");
      return;
    }
    if (data.attending === null) {
      setError("Bạn chọn giúp mình là có đến được hay không nhé.");
      return;
    }

    setError(null);
    setSending(true);
    try {
      await onSubmit?.(data);
      setSent(true);
    } catch {
      setError("Gửi chưa thành công. Bạn thử lại giúp mình nhé.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <motion.div
        ref={successRef}
        tabIndex={-1}
        // min-h lấp gần hết phần viewport còn lại dưới header (trừ đúng
        // chiều cao header) — nội dung cảm ơn ngắn nên nếu không ép chiều
        // cao, footer phía sau sẽ lộ lên ngay trong cùng khung nhìn.
        className="flex min-h-[calc(100svh-65px)] flex-col items-center justify-center scroll-mt-[65px] outline-none md:min-h-[calc(100svh-73px)] md:scroll-mt-[73px]"
        style={{ textAlign: "center" }}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0.3 : 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <p
          className="wd-h1"
          style={{ fontStyle: "italic", fontSize: "clamp(38px, 6vw, 68px)" }}
        >
          {successTitle}
        </p>
        <BotanicalRule className="my-6" />
        {/* 1 dòng trên desktop (đủ chỗ trong khung 720px), 2 dòng cân trên
            mobile — text-balance để trình duyệt tự chọn điểm ngắt đẹp thay
            vì ngắt cứng theo \n. */}
        <p
          className="wd-body-serif mx-auto max-w-[260px] text-balance sm:max-w-none sm:text-wrap sm:whitespace-nowrap"
          style={{
            fontSize: "clamp(19px, 2.1vw, 26px)",
            lineHeight: 1.7,
          }}
        >
          {successBody}
        </p>

        {data.note.trim() ? (
          <motion.p
            className="wd-eyebrow"
            style={{ marginTop: 28 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: reduceMotion ? 0.3 : 0.8,
              delay: reduceMotion ? 0 : 0.5,
            }}
          >
            Lời chúc của bạn đã được gửi đi ♡
          </motion.p>
        ) : null}
      </motion.div>
    );
  }

  const decGuests = () => set("guests", Math.max(1, data.guests - 1));
  const incGuests = () => set("guests", Math.min(20, data.guests + 1));

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <h2 className="wd-h1" style={{ whiteSpace: "pre-line" }}>
          {title}
        </h2>
        <BotanicalRule className="mt-[28px] mb-[clamp(40px,5vh,56px)]" />
      </div>

      <form className="wd-form" onSubmit={handleSubmit} noValidate>
        {/* Honeypot chống bot — người dùng thật không bao giờ thấy field này,
            xem .wd-hp trong styles/wedding.css. */}
        <label className="wd-hp" aria-hidden="true">
          Để trống trường này
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={data.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </label>

        <label className="wd-field">
          <span className="wd-field-label">Tên của bạn</span>
          <input
            className="wd-input"
            name="name"
            required
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </label>

        {/* Lựa chọn tham dự kiểu "đánh dấu trên thiệp" — chấm tròn nhỏ đổi
            màu accent khi chọn, không phải hai nút CTA. */}
        <fieldset
          className="wd-field mt-11"
          style={{ border: 0, padding: 0, gap: 14 }}
        >
          <legend className="wd-field-label">Bạn sẽ tham dự?</legend>
          <div className="wd-rsvp-options">
            <button
              type="button"
              className="wd-rsvp-option"
              aria-pressed={data.attending === "yes"}
              onClick={() => set("attending", "yes")}
            >
              <span className="wd-rsvp-dot" aria-hidden="true" />
              Có, tôi sẽ đến
            </button>
            <button
              type="button"
              className="wd-rsvp-option"
              aria-pressed={data.attending === "no"}
              onClick={() => set("attending", "no")}
            >
              <span className="wd-rsvp-dot" aria-hidden="true" />
              Rất tiếc, tôi không thể
            </button>
          </div>
        </fieldset>

        {/* Không đến thì không cần hỏi số người — collapse nhẹ thay vì biến mất đột ngột */}
        <AnimatePresence initial={false}>
          {data.attending !== "no" ? (
            <motion.div
              key="guests"
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
              className="mt-11"
            >
              <div className="wd-field">
                <span className="wd-field-label" id="guests-label">
                  Số người tham dự
                </span>
                <div className="wd-stepper" role="group" aria-labelledby="guests-label">
                  <button
                    type="button"
                    className="wd-stepper-btn"
                    aria-label="Giảm số người tham dự"
                    onClick={decGuests}
                    disabled={data.guests <= 1}
                  >
                    −
                  </button>
                  <span className="wd-stepper-value" aria-live="polite">
                    {data.guests}
                  </span>
                  <button
                    type="button"
                    className="wd-stepper-btn"
                    aria-label="Tăng số người tham dự"
                    onClick={incGuests}
                    disabled={data.guests >= 20}
                  >
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <label
          className={cn("wd-field", data.attending === "no" ? "mt-11" : "mt-12")}
        >
          <span className="wd-field-label">Lời chúc gửi đến Tuấn &amp; Hoa</span>
          <textarea
            className="wd-textarea"
            name="note"
            rows={3}
            placeholder="Viết lời chúc dành cho Tuấn & Hoa..."
            value={data.note}
            onChange={(e) => set("note", e.target.value)}
          />
        </label>

        {error ? (
          <p role="alert" className="wd-body-sm mt-2" style={{ textAlign: "center" }}>
            {error}
          </p>
        ) : null}

        <div className="mt-9 flex flex-col items-center gap-4">
          <span aria-hidden="true" className="h-px w-10 bg-champagne/50" />
          <button className="wd-cta" type="submit" disabled={sending}>
            {sending ? "Đang gửi…" : submitLabel}
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="wd-cta-arrow h-3 w-3">
              <path
                d="M0 6h9M5.5 2 9 6l-3.5 4"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {note ? (
          <p className="wd-body-sm mt-4" style={{ textAlign: "center" }}>
            {note}
          </p>
        ) : null}
      </form>
    </div>
  );
}
