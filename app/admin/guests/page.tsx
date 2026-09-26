import type { Metadata } from "next";
import { SimpleHeader } from "@/components/ui/SimpleHeader";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  MISSING_COLUMN_CODES,
  MISSING_GUESTS_COLUMNS_MESSAGE,
  describeGuestTableError,
} from "@/lib/supabase/errors";
import { signOutAdmin } from "@/app/admin/actions";
import { AdminNav } from "@/app/admin/AdminNav";
import { GuestManager } from "@/app/admin/guests/GuestManager";
import type { GuestRecord } from "@/app/admin/guests/GuestRow";

export const metadata: Metadata = { title: "Quản lý khách mời" };
export const dynamic = "force-dynamic";

async function getAllGuests(): Promise<{
  guests: GuestRecord[];
  configured: boolean;
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { guests: [], configured: false, error: null };

  const full = await supabase
    .from("wedding_guests")
    .select("slug, name, greeting, display_name, pronoun, created_at")
    .order("created_at", { ascending: false });

  if (!full.error) {
    return {
      configured: true,
      error: null,
      guests: (full.data ?? []).map((row) => ({
        slug: row.slug,
        name: row.name,
        greeting: row.greeting,
        displayName: row.display_name,
        pronoun: row.pronoun,
        createdAt: row.created_at,
      })),
    };
  }

  console.error("[admin/guests] fetch failed:", full.error.code, full.error.message);
  if (!full.error.code || !MISSING_COLUMN_CODES.has(full.error.code)) {
    return { guests: [], configured: true, error: describeGuestTableError(full.error) };
  }

  // Chưa chạy bản schema.sql có display_name/pronoun: vẫn liệt kê khách bằng
  // các cột cũ, kèm cảnh báo cần migrate (tạo/sửa sẽ lỗi tới khi chạy xong).
  const legacy = await supabase
    .from("wedding_guests")
    .select("slug, name, greeting, created_at")
    .order("created_at", { ascending: false });

  if (legacy.error) {
    return { guests: [], configured: true, error: describeGuestTableError(legacy.error) };
  }

  return {
    configured: true,
    error: MISSING_GUESTS_COLUMNS_MESSAGE,
    guests: (legacy.data ?? []).map((row) => ({
      slug: row.slug,
      name: row.name,
      greeting: row.greeting,
      displayName: null,
      pronoun: null,
      createdAt: row.created_at,
    })),
  };
}

export default async function AdminGuestsPage() {
  const { guests, configured, error } = await getAllGuests();

  return (
    <>
      <EnsureOpened />
      <SimpleHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-16 md:px-5">
        <div className="flex items-center justify-between gap-4">
          <h1 className="wd-h1 text-[clamp(28px,4vw,40px)]">Quản lý khách mời</h1>
          <form action={signOutAdmin}>
            <button type="submit" className="wd-btn-ghost">
              Đăng xuất
            </button>
          </form>
        </div>

        <AdminNav active="guests" />

        {error ? (
          <p role="alert" className="wd-body-sm mt-10 text-red-700">
            {error}
          </p>
        ) : null}

        {!configured ? (
          <p className="wd-body-sm mt-10">
            Chưa cấu hình Supabase — thêm biến môi trường rồi tải lại trang.
          </p>
        ) : (
          <GuestManager guests={guests} />
        )}
      </main>
    </>
  );
}
