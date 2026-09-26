"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createGuest } from "@/app/admin/guests/actions";
import type { GuestRecord } from "@/app/admin/guests/GuestRow";
import { slugify, createGuestInvitationUrl } from "@/lib/guest-link";
import {
  GUEST_PRONOUNS,
  DEFAULT_GUEST_PRONOUN,
  buildGuestInvitation,
  deriveDisplayName,
  guestPronounConfig,
  isGuestPronoun,
  type GuestPronoun,
} from "@/lib/guest-invitation";

type CreateGuestFormProps = {
  /**
   * Khách đang sửa (bấm "Sửa" ở danh sách) — form điền sẵn và khoá đường
   * dẫn, vì lưu là upsert theo slug: đổi slug sẽ thành một link mới chứ
   * không phải sửa link cũ. Nơi gọi đặt `key` theo slug để form reset khi
   * chuyển khách.
   */
  editing?: GuestRecord | null;
  onCancelEdit?: () => void;
};

export function CreateGuestForm({ editing = null, onCancelEdit }: CreateGuestFormProps) {
  const isEditing = editing !== null;

  const [name, setName] = useState(editing?.name ?? "");
  const [displayName, setDisplayName] = useState(editing?.displayName ?? "");
  const [pronoun, setPronoun] = useState<GuestPronoun>(
    isGuestPronoun(editing?.pronoun) ? editing.pronoun : DEFAULT_GUEST_PRONOUN,
  );
  const [slug, setSlug] = useState(editing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Slug tự chạy theo tên cho tới khi admin tự tay sửa nó.
  const effectiveSlug = slugTouched ? slug : slugify(name);

  // Preview dùng đúng hàm sinh lời mời của trang khách — đổi dropdown/tên là
  // thấy ngay kết quả, không cần gọi server.
  const preview = name.trim()
    ? buildGuestInvitation({ name, displayName, pronoun })
    : null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setCreatedUrl(null);

    startTransition(async () => {
      try {
        const result = await createGuest({
          name,
          slug: effectiveSlug,
          displayName: displayName.trim() || undefined,
          pronoun,
        });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setCreatedUrl(createGuestInvitationUrl(result.slug));
        if (isEditing) return;
        setName("");
        setDisplayName("");
        setSlug("");
        setSlugTouched(false);
      } catch (err) {
        // Chỉ còn lỗi mạng / action không gọi tới được — lỗi nghiệp vụ đã
        // nằm trong result.message ở trên.
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
        <span className="wd-field-label">Họ tên người nhận</span>
        <input
          className="wd-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Đỗ Ngọc Hiếu"
          required
        />
      </label>

      <label className="wd-field mt-6">
        <span className="wd-field-label">Tên hiển thị trên thiệp</span>
        <input
          className="wd-input"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder={name.trim() ? `${deriveDisplayName(name)} (tự lấy từ họ tên)` : "Hiếu"}
          maxLength={60}
        />
      </label>

      <label className="wd-field mt-6">
        <span className="wd-field-label">Cách xưng hô</span>
        <select
          className="wd-input"
          value={pronoun}
          onChange={(event) => {
            if (isGuestPronoun(event.target.value)) setPronoun(event.target.value);
          }}
        >
          {GUEST_PRONOUNS.map((value) => (
            <option key={value} value={value}>
              {guestPronounConfig[value].label}
            </option>
          ))}
        </select>
      </label>

      <label className="wd-field mt-6">
        <span className="wd-field-label">Đường dẫn</span>
        <input
          className="wd-input read-only:text-ink/50"
          value={effectiveSlug}
          readOnly={isEditing}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          placeholder="do-ngoc-hieu"
        />
      </label>

      {/* Preview: đúng hai dòng khách sẽ thấy ở đầu thiệp. */}
      <div className="mt-8 border-l border-champagne/60 pl-4">
        <p className="wd-field-label">Xem trước</p>
        {preview ? (
          <p className="wd-quote mt-3 text-[1.1rem] text-ink/80">
            <span className="block">
              {preview.greeting} <span className="text-ink">{preview.name}</span>,
            </span>
            <span className="mt-1 block">{preview.message}</span>
          </p>
        ) : (
          <p className="wd-body-sm mt-3 text-taupe">Nhập họ tên để xem lời mời.</p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="submit" className="wd-btn-ghost" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Đang lưu…"
              : "Đang tạo…"
            : isEditing
              ? "Lưu thay đổi"
              : "Tạo link"}
        </button>
        {isEditing ? (
          <button type="button" className="wd-btn-ghost" onClick={onCancelEdit}>
            {createdUrl ? "Xong" : "Huỷ sửa"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="wd-body-sm mt-3 text-red-700">
          {error}
        </p>
      ) : null}

      {createdUrl ? (
        <div className="mt-6 flex flex-col items-start gap-3">
          {isEditing ? <p className="wd-body-sm text-taupe">Đã lưu.</p> : null}
          <p className="wd-body-sm break-all">{createdUrl}</p>
          <button type="button" className="wd-btn-ghost" onClick={handleCopy}>
            {copied ? "Đã sao chép" : "Sao chép link"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
