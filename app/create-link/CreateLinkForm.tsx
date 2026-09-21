"use client";

import { useState } from "react";
import { slugify, createGuestInvitationUrl } from "@/lib/guest-link";

/**
 * Công cụ nội bộ để tạo nhanh link thiệp cá nhân hoá — KHÔNG lưu gì cả (không
 * database), chỉ suy ra slug + URL từ tên nhập vào. Muốn thiệp thật sự hiện
 * đúng tên khi mở link, vẫn phải thêm slug này vào data/guests.ts rồi deploy
 * lại (xem app/[guest]/page.tsx).
 */
export function CreateLinkForm() {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const slug = slugify(name);
  const url = slug ? createGuestInvitationUrl(slug) : "";

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt chặn clipboard API (vd. http không an toàn) — bỏ qua lặng lẽ.
    }
  };

  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col items-center justify-center gap-10 bg-ivory px-6 py-20 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="wd-eyebrow">Công cụ nội bộ</span>
        <h1 className="wd-h1 text-[clamp(28px,5vw,40px)] tracking-[0.1em] uppercase">
          Tạo link gửi thiệp
        </h1>
      </div>

      <label className="wd-field w-full">
        <span className="wd-field-label">Tên người nhận</span>
        <input
          className="wd-input text-center"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nguyễn Văn Minh"
          autoFocus
        />
      </label>

      {slug ? (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <span className="wd-field-label">Link</span>
            <p className="wd-body-sm break-all">{url}</p>
          </div>

          <button type="button" onClick={handleCopy} className="wd-btn-ghost">
            {copied ? "Đã sao chép" : "Sao chép link"}
          </button>

          <p className="wd-body-sm text-ink/60">
            Để thiệp hiện đúng tên, thêm slug{" "}
            <span className="wd-num text-ink">{slug}</span> vào{" "}
            <span className="wd-num text-ink">data/guests.ts</span> rồi deploy lại.
          </p>
        </div>
      ) : null}
    </main>
  );
}
