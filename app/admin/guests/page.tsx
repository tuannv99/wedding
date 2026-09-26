import type { Metadata } from "next";
import { SimpleHeader } from "@/components/ui/SimpleHeader";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeGuestTableError } from "@/lib/supabase/errors";
import { signOutAdmin } from "@/app/admin/actions";
import { AdminNav } from "@/app/admin/AdminNav";
import { CreateGuestForm } from "@/app/admin/guests/CreateGuestForm";
import { GuestRow, type GuestRecord } from "@/app/admin/guests/GuestRow";

export const metadata: Metadata = { title: "Quản lý khách mời" };
export const dynamic = "force-dynamic";

async function getAllGuests(): Promise<{
  guests: GuestRecord[];
  configured: boolean;
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { guests: [], configured: false, error: null };

  const { data, error } = await supabase
    .from("wedding_guests")
    .select("slug, name, greeting, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/guests] fetch failed:", error.code, error.message);
    return { guests: [], configured: true, error: describeGuestTableError(error) };
  }

  return {
    configured: true,
    error: null,
    guests: (data ?? []).map((row) => ({
      slug: row.slug,
      name: row.name,
      greeting: row.greeting,
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
          <>
            <section className="mt-12">
              <h2 className="wd-label text-taupe">Tạo link mới</h2>
              <CreateGuestForm />
            </section>

            <section className="mt-16">
              <h2 className="wd-label text-taupe">Đã tạo ({guests.length})</h2>
              {guests.length === 0 ? (
                <p className="wd-body-sm mt-4">Chưa có khách mời nào.</p>
              ) : (
                <ul className="mt-4">
                  {guests.map((guest) => (
                    <GuestRow key={guest.slug} guest={guest} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
