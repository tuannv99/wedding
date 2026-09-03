"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { WISH_MESSAGE_MAX, WISH_NAME_MAX } from "@/lib/wishes";

/**
 * Form gửi lời chúc ở /wishes. Cùng ngôn ngữ thiết kế với RsvpForm.tsx (input
 * underline mảnh, CTA dạng text, trạng thái sending/sent/error) nhưng không
 * tách thành component dùng chung — hai form khác field, gộp lại sẽ phải
 * nhồi thêm prop điều kiện, không đáng.
 */
export function WishForm() {
  const reduceMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Honeypot + mốc thời gian render form — cùng cơ chế chống spam với /api/wishes.
  const formLoadedAt = useRef(Date.now());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;

    if (!name.trim()) {
      setError("Bạn cho chúng mình biết tên nhé.");
      return;
    }
    if (!message.trim()) {
      setError("Bạn viết vài dòng lời chúc nhé.");
      return;
    }

    setError(null);
    setSending(true);
    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
          formLoadedAt: formLoadedAt.current,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "SEND_FAILED");
      }

      setSent(true);
      setName("");
      setMessage("");
    } catch {
      setError("Gửi chưa thành công. Bạn thử lại giúp mình nhé.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <form className="wd-form" onSubmit={handleSubmit} noValidate>
        <label className="wd-field">
          <span className="wd-field-label">Tên của bạn</span>
          <input
            className="wd-input"
            name="name"
            required
            maxLength={WISH_NAME_MAX}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        {/* Honeypot: ẩn với người thật (aria-hidden + tabIndex -1 + để ngoài
            khung nhìn thay vì display:none — vài bot bỏ qua field display:none). */}
        <label
          aria-hidden="true"
          className="absolute -left-[9999px] h-px w-px overflow-hidden"
        >
          Công ty
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            onChange={() => {}}
          />
        </label>

        <label className="wd-field mt-11">
          <span className="wd-field-label">Lời chúc</span>
          <textarea
            className="wd-textarea"
            name="message"
            required
            rows={4}
            maxLength={WISH_MESSAGE_MAX}
            placeholder="Viết lời chúc dành cho Tuấn & Hoa..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
            {sending ? "Đang gửi…" : "Gửi lời chúc"}
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
      </form>

      {/* Feedback nhẹ sau khi gửi — không thay cả form bằng một màn hình khác
          như RsvpForm (form ở đây có thể muốn gửi thêm lần nữa), chỉ chèn một
          dòng cảm ơn phía trên rồi tự mờ dần theo thời gian mở form ra lại. */}
      {sent ? (
        <motion.p
          role="status"
          className="wd-body-sm mt-6"
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.6 }}
        >
          Cảm ơn bạn đã gửi lời yêu thương đến chúng mình ♡
        </motion.p>
      ) : null}
    </div>
  );
}
