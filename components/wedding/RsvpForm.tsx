"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RsvpData = {
  name: string;
  attending: "yes" | "no" | null;
  guests: number;
  note: string;
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
  submitLabel = "Xác nhận",
  successTitle = "Cảm ơn bạn ♡",
  successBody = "Sự hiện diện của bạn\nlà món quà tuyệt vời\nđối với chúng mình.",
  note,
  onSubmit,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<RsvpData>({
    name: "",
    attending: null,
    guests: 1,
    note: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof RsvpData>(key: K, value: RsvpData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

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
        <hr className="wd-rule" style={{ margin: "32px auto" }} />
        <p
          className="wd-body-serif"
          style={{ whiteSpace: "pre-line", fontSize: "clamp(20px, 2.4vw, 27px)" }}
        >
          {successBody}
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <h2 className="wd-h1" style={{ whiteSpace: "pre-line" }}>
          {title}
        </h2>
        <hr
          className="wd-rule"
          style={{ margin: "28px auto clamp(38px, 5vh, 58px)" }}
        />
      </div>

      <form className="wd-form" onSubmit={handleSubmit} noValidate>
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

        <fieldset className="wd-field" style={{ border: 0, padding: 0, gap: 14 }}>
          <legend className="wd-field-label">Bạn sẽ tham dự?</legend>
          <div className="wd-pill-group">
            <button
              type="button"
              className="wd-pill"
              aria-pressed={data.attending === "yes"}
              onClick={() => set("attending", "yes")}
            >
              Có, tôi sẽ đến
            </button>
            <button
              type="button"
              className="wd-pill"
              aria-pressed={data.attending === "no"}
              onClick={() => set("attending", "no")}
            >
              Rất tiếc, tôi không thể
            </button>
          </div>
        </fieldset>

        {/* Không đến thì không cần hỏi số người */}
        {data.attending !== "no" ? (
          <label className="wd-field">
            <span className="wd-field-label">Số người tham dự</span>
            <input
              className="wd-input"
              name="guests"
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={data.guests}
              onChange={(e) => set("guests", Number(e.target.value))}
            />
          </label>
        ) : null}

        <label className="wd-field">
          <span className="wd-field-label">Lời nhắn</span>
          <textarea
            className="wd-textarea"
            name="note"
            rows={3}
            placeholder="Chúc hai bạn trăm năm hạnh phúc"
            value={data.note}
            onChange={(e) => set("note", e.target.value)}
          />
        </label>

        {error ? (
          <p role="alert" className="wd-body-sm" style={{ marginTop: -8 }}>
            {error}
          </p>
        ) : null}

        <button
          className="wd-btn"
          type="submit"
          disabled={sending}
          style={{ justifySelf: "center", minWidth: 240 }}
        >
          {sending ? "Đang gửi…" : submitLabel}
        </button>

        {note ? (
          <p className="wd-body-sm" style={{ textAlign: "center" }}>
            {note}
          </p>
        ) : null}
      </form>
    </div>
  );
}
