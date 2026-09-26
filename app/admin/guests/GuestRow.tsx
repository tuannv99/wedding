"use client";

import { useState, useTransition } from "react";
import { deleteGuest } from "@/app/admin/guests/actions";
import { createGuestInvitationUrl } from "@/lib/guest-link";
import { formatShortDate } from "@/lib/utils";
import { buildGuestInvitation, isGuestPronoun } from "@/lib/guest-invitation";

export type GuestRecord = {
  slug: string;
  /** Họ tên đầy đủ. */
  name: string;
  /** Lời chào tự do — chỉ còn ở link tạo trước khi có cách xưng hô. */
  greeting: string | null;
  displayName: string | null;
  /** NULL ở link cũ; xem lib/guest-invitation.ts. */
  pronoun: string | null;
  createdAt: string;
};

type GuestRowProps = {
  guest: GuestRecord;
  onEdit: (guest: GuestRecord) => void;
};

export function GuestRow({ guest, onEdit }: GuestRowProps) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const url = createGuestInvitationUrl(guest.slug);
  const invitation = buildGuestInvitation(guest);
  const isLegacy = !isGuestPronoun(guest.pronoun);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt chặn clipboard API — bỏ qua lặng lẽ.
    }
  };

  const handleDelete = () => {
    if (!window.confirm(`Xoá link của "${guest.name}"?`)) return;
    setActionError(null);
    startTransition(async () => {
      try {
        const result = await deleteGuest(guest.slug);
        if (!result.ok) setActionError(result.message);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      }
    });
  };

  return (
    <li className="border-b border-taupe/20 py-6">
      <div className="min-w-0">
        <p className="wd-label text-ink">{guest.name}</p>
        <p className="wd-eyebrow wd-num mt-1 text-ink/50">
          {formatShortDate(guest.createdAt)}
        </p>
        <p className="wd-body-sm mt-3 break-all">{url}</p>
        <p className="wd-body-sm mt-1 text-taupe">
          {invitation.greeting} {invitation.name}, {invitation.message}
        </p>
        {isLegacy ? (
          <p className="wd-body-sm mt-1 text-ink/50">
            Link cũ, chưa chọn cách xưng hô. Bấm Sửa để chọn.
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="wd-btn-ghost" onClick={handleCopy}>
          {copied ? "Đã sao chép" : "Sao chép link"}
        </button>
        <button type="button" className="wd-btn-ghost" onClick={() => onEdit(guest)}>
          Sửa
        </button>
        <button
          type="button"
          className="wd-btn-ghost disabled:opacity-40"
          disabled={isPending}
          onClick={handleDelete}
        >
          Xoá
        </button>
      </div>

      {actionError ? (
        <p role="alert" className="wd-body-sm mt-2 text-red-700">
          {actionError}
        </p>
      ) : null}
    </li>
  );
}
