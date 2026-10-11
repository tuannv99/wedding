"use client";

import { useState, useTransition } from "react";
import { deleteWish } from "@/app/admin/wishes/actions";
import { type Wish } from "@/lib/wishes";
import { formatShortDate } from "@/lib/utils";

export function WishRow({ wish }: { wish: Wish }) {
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
      <p className="wd-label text-ink">{wish.name}</p>
      <p className="wd-eyebrow wd-num mt-1 text-ink/50">
        {formatShortDate(wish.createdAt)}
      </p>
      <p className="wd-body-sm mt-3 whitespace-pre-line">{wish.message}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="wd-btn-ghost disabled:opacity-40"
          disabled={isPending}
          onClick={() => {
            if (window.confirm(`Xoá lời chúc của "${wish.name}"?`)) {
              run(() => deleteWish(wish.id));
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
