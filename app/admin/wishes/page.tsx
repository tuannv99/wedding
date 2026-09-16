import type { Metadata } from "next";
import { SimpleHeader } from "@/components/ui/SimpleHeader";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type Wish } from "@/lib/wishes";
import { signOutAdmin } from "@/app/admin/actions";
import { AdminNav } from "@/app/admin/AdminNav";
import { WishRow } from "@/app/admin/wishes/WishRow";

export const metadata: Metadata = { title: "Quản lý lời chúc" };
export const dynamic = "force-dynamic";

async function getAllWishes(): Promise<{ wishes: Wish[]; configured: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { wishes: [], configured: false };

  const { data, error } = await supabase
    .from("wedding_wishes")
    .select("id, name, message, created_at, is_approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/wishes] fetch failed:", error.message);
    return { wishes: [], configured: true };
  }

  return {
    configured: true,
    wishes: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      message: row.message,
      createdAt: row.created_at,
      isApproved: row.is_approved,
    })),
  };
}

export default async function AdminWishesPage() {
  const { wishes, configured } = await getAllWishes();
  const pending = wishes.filter((w) => !w.isApproved);
  const approved = wishes.filter((w) => w.isApproved);

  return (
    <>
      <EnsureOpened />
      <SimpleHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-16 md:px-5">
        <div className="flex items-center justify-between gap-4">
          <h1 className="wd-h1 text-[clamp(28px,4vw,40px)]">Quản lý lời chúc</h1>
          <form action={signOutAdmin}>
            <button type="submit" className="wd-btn-ghost">
              Đăng xuất
            </button>
          </form>
        </div>

        <AdminNav active="wishes" />

        {!configured ? (
          <p className="wd-body-sm mt-10">
            Chưa cấu hình Supabase — thêm biến môi trường rồi tải lại trang.
          </p>
        ) : wishes.length === 0 ? (
          <p className="wd-body-sm mt-10">Chưa có lời chúc nào được gửi.</p>
        ) : (
          <>
            <section className="mt-12">
              <h2 className="wd-label text-taupe">
                Chưa duyệt ({pending.length})
              </h2>
              {pending.length === 0 ? (
                <p className="wd-body-sm mt-4">Không có lời chúc nào đang chờ duyệt.</p>
              ) : (
                <ul className="mt-4">
                  {pending.map((wish) => (
                    <WishRow key={wish.id} wish={wish} />
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-16">
              <h2 className="wd-label text-taupe">
                Đã duyệt ({approved.length})
              </h2>
              {approved.length === 0 ? (
                <p className="wd-body-sm mt-4">Chưa có lời chúc nào được duyệt.</p>
              ) : (
                <ul className="mt-4">
                  {approved.map((wish) => (
                    <WishRow key={wish.id} wish={wish} />
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
