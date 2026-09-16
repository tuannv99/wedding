"use client";

import { useState, useTransition } from "react";
import { deleteRsvp } from "@/app/admin/rsvp/actions";
import { type RsvpResponse } from "@/lib/rsvp";
import { formatShortDate } from "@/lib/utils";

export function RsvpRow({ rsvp }: { rsvp: RsvpResponse }) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  function run(action: () => Promise<void>) {
    setActionError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      }
    });
  }

  return (
    <li className="border-b border-taupe/20 py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="wd-label text-ink">{rsvp.name}</p>
          <p className="wd-eyebrow wd-num mt-1 text-ink/50">
            {formatShortDate(rsvp.createdAt)}
          </p>
          {rsvp.message ? (
            <p className="wd-body-sm mt-3 whitespace-pre-line">{rsvp.message}</p>
          ) : null}
        </div>

        <span
          className={
            "wd-eyebrow shrink-0 rounded-full border px-3 py-1 " +
            (rsvp.attending === "yes"
              ? "border-sage text-sage"
              : "border-taupe text-taupe")
          }
        >
          {rsvp.attending === "yes" ? `Đến · ${rsvp.guests} người` : "Không đến"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="wd-btn-ghost disabled:opacity-40"
          disabled={isPending}
          onClick={() => {
            if (window.confirm(`Xoá RSVP của "${rsvp.name}"?`)) {
              run(() => deleteRsvp(rsvp.id));
            }
          }}
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
