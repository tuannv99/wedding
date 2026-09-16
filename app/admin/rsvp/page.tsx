import type { Metadata } from "next";
import { SimpleHeader } from "@/components/ui/SimpleHeader";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type RsvpResponse } from "@/lib/rsvp";
import { signOutAdmin } from "@/app/admin/actions";
import { AdminNav } from "@/app/admin/AdminNav";
import { RsvpRow } from "@/app/admin/rsvp/RsvpRow";

export const metadata: Metadata = { title: "Quản lý xác nhận tham dự" };
export const dynamic = "force-dynamic";

async function getAllRsvps(): Promise<{ rsvps: RsvpResponse[]; configured: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { rsvps: [], configured: false };

  const { data, error } = await supabase
    .from("rsvp_responses")
    .select("id, name, attending, guests, message, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/rsvp] fetch failed:", error.message);
    return { rsvps: [], configured: true };
  }

  return {
    configured: true,
    rsvps: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      attending: row.attending,
      guests: row.guests,
      message: row.message,
      createdAt: row.created_at,
    })),
  };
}

export default async function AdminRsvpPage() {
  const { rsvps, configured } = await getAllRsvps();
  const attending = rsvps.filter((r) => r.attending === "yes");
  const notAttending = rsvps.filter((r) => r.attending === "no");
  const totalGuests = attending.reduce((sum, r) => sum + r.guests, 0);

  return (
    <>
      <EnsureOpened />
      <SimpleHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-16 md:px-5">
        <div className="flex items-center justify-between gap-4">
          <h1 className="wd-h1 text-[clamp(28px,4vw,40px)]">
            Quản lý xác nhận tham dự
          </h1>
          <form action={signOutAdmin}>
            <button type="submit" className="wd-btn-ghost">
              Đăng xuất
            </button>
          </form>
        </div>

        <AdminNav active="rsvp" />

        {!configured ? (
          <p className="wd-body-sm mt-10">
            Chưa cấu hình Supabase — thêm biến môi trường rồi tải lại trang.
          </p>
        ) : rsvps.length === 0 ? (
          <p className="wd-body-sm mt-10">Chưa có ai xác nhận tham dự.</p>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-3 gap-4 border-y border-taupe/20 py-6 text-center">
              <div>
                <p className="wd-numeral wd-num text-[clamp(28px,4vw,40px)]">
                  {attending.length}
                </p>
                <p className="wd-eyebrow mt-1 text-taupe">Sẽ đến</p>
              </div>
              <div>
                <p className="wd-numeral wd-num text-[clamp(28px,4vw,40px)]">
                  {totalGuests}
                </p>
                <p className="wd-eyebrow mt-1 text-taupe">Tổng số khách</p>
              </div>
              <div>
                <p className="wd-numeral wd-num text-[clamp(28px,4vw,40px)]">
                  {notAttending.length}
                </p>
                <p className="wd-eyebrow mt-1 text-taupe">Không đến</p>
              </div>
            </div>

            <section className="mt-12">
              <h2 className="wd-label text-taupe">
                Sẽ đến ({attending.length})
              </h2>
              {attending.length === 0 ? (
                <p className="wd-body-sm mt-4">Chưa có ai xác nhận sẽ đến.</p>
              ) : (
                <ul className="mt-4">
                  {attending.map((rsvp) => (
                    <RsvpRow key={rsvp.id} rsvp={rsvp} />
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-16">
              <h2 className="wd-label text-taupe">
                Không đến ({notAttending.length})
              </h2>
              {notAttending.length === 0 ? (
                <p className="wd-body-sm mt-4">Chưa có ai báo không đến.</p>
              ) : (
                <ul className="mt-4">
                  {notAttending.map((rsvp) => (
                    <RsvpRow key={rsvp.id} rsvp={rsvp} />
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
