"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createGuest } from "@/app/admin/guests/actions";
import { slugify, createGuestInvitationUrl } from "@/lib/guest-link";

export function CreateGuestForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Slug tự chạy theo tên cho tới khi admin tự tay sửa nó.
  const effectiveSlug = slugTouched ? slug : slugify(name);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setCreatedUrl(null);

    startTransition(async () => {
      try {
        const result = await createGuest({
          name,
          slug: effectiveSlug,
          greeting: greeting.trim() || undefined,
        });
        setCreatedUrl(createGuestInvitationUrl(result.slug));
        setName("");
        setSlug("");
        setSlugTouched(false);
        setGreeting("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      }
    });
  };

  const handleCopy = async () => {
    if (!createdUrl) return;
    try {
      await navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt chặn clipboard API — bỏ qua lặng lẽ.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="wd-form mt-4 max-w-sm">
      <label className="wd-field">
        <span className="wd-field-label">Tên người nhận</span>
        <input
          className="wd-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nguyễn Văn Minh"
          required
        />
      </label>

      <label className="wd-field mt-6">
        <span className="wd-field-label">Đường dẫn</span>
        <input
          className="wd-input"
          value={effectiveSlug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          placeholder="nguyen-van-minh"
        />
      </label>

      <label className="wd-field mt-6">
        <span className="wd-field-label">Lời chào (không bắt buộc)</span>
        <input
          className="wd-input"
          value={greeting}
          onChange={(event) => setGreeting(event.target.value)}
          placeholder="Gửi bạn (mặc định)"
        />
      </label>

      <button type="submit" className="wd-btn-ghost mt-8" disabled={isPending}>
        {isPending ? "Đang tạo…" : "Tạo link"}
      </button>

      {error ? (
        <p role="alert" className="wd-body-sm mt-3 text-red-700">
          {error}
        </p>
      ) : null}

      {createdUrl ? (
        <div className="mt-6 flex flex-col items-start gap-3">
          <p className="wd-body-sm break-all">{createdUrl}</p>
          <button type="button" className="wd-btn-ghost" onClick={handleCopy}>
            {copied ? "Đã sao chép" : "Sao chép link"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
