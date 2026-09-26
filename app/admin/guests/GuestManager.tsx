"use client";

import { useState } from "react";
import { CreateGuestForm } from "@/app/admin/guests/CreateGuestForm";
import { GuestRow, type GuestRecord } from "@/app/admin/guests/GuestRow";

/**
 * Form + danh sách khách mời. Bấm "Sửa" ở một dòng thì form phía trên chuyển
 * sang chế độ sửa khách đó (cùng form với tạo mới — lưu là upsert theo slug).
 */
export function GuestManager({ guests }: { guests: GuestRecord[] }) {
  const [editing, setEditing] = useState<GuestRecord | null>(null);

  const handleEdit = (guest: GuestRecord) => {
    setEditing(guest);
    document.getElementById("guest-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section id="guest-form" className="mt-12 scroll-mt-24">
        <h2 className="wd-label text-taupe">
          {editing ? `Sửa link: /${editing.slug}` : "Tạo link mới"}
        </h2>
        <CreateGuestForm
          key={editing?.slug ?? "new"}
          editing={editing}
          onCancelEdit={() => setEditing(null)}
        />
      </section>

      <section className="mt-16">
        <h2 className="wd-label text-taupe">Đã tạo ({guests.length})</h2>
        {guests.length === 0 ? (
          <p className="wd-body-sm mt-4">Chưa có khách mời nào.</p>
        ) : (
          <ul className="mt-4">
            {guests.map((guest) => (
              <GuestRow key={guest.slug} guest={guest} onEdit={handleEdit} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
