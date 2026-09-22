"use client";

import { useState, useTransition } from "react";
import { deleteGuest } from "@/app/admin/guests/actions";
import { createGuestInvitationUrl } from "@/lib/guest-link";
import { formatShortDate } from "@/lib/utils";

export type GuestRecord = {
  slug: string;
  name: string;
  greeting: string | null;
  createdAt: string;
};

export function GuestRow({ guest }: { guest: GuestRecord }) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const url = createGuestInvitationUrl(guest.slug);

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
        await deleteGuest(guest.slug);
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
        {guest.greeting ? (
          <p className="wd-body-sm mt-1 text-taupe">Lời chào: {guest.greeting}</p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="wd-btn-ghost" onClick={handleCopy}>
          {copied ? "Đã sao chép" : "Sao chép link"}
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
