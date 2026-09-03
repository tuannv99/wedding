import type { Metadata } from "next";
import { SimpleHeader } from "@/components/ui/SimpleHeader";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { Reveal } from "@/components/ui/Reveal";
import { BotanicalRule } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { WishForm } from "@/components/wedding/WishForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatWishDate, type Wish } from "@/lib/wishes";
import { wedding } from "@/lib/wedding";

export const metadata: Metadata = {
  title: `Những lời yêu thương · ${wedding.site.title}`,
  description: "Lời chúc từ những người thân yêu gửi đến Tuấn & Hoa.",
};

// Luôn lấy dữ liệu mới — trang này đổi ngay khi admin duyệt/xoá một lời chúc.
export const dynamic = "force-dynamic";

async function getApprovedWishes(): Promise<{ wishes: Wish[]; configured: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { wishes: [], configured: false };

  const { data, error } = await supabase
    .from("wedding_wishes")
    .select("id, name, message, created_at, is_approved")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[wishes] fetch failed:", error.message);
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

export default async function WishesPage() {
  const { wishes, configured } = await getApprovedWishes();

  return (
    <>
      <EnsureOpened />
      <SimpleHeader />

      <main className="relative isolate w-full overflow-hidden bg-ivory px-6 py-28 md:px-5 md:py-40">
        <BotanicalAccent
          variant="sprig"
          opacity={0.26}
          depth={5}
          flip
          className="top-[6%] -right-[2vw] hidden h-[36vh] w-[20vh] lg:block"
        />

        <div className="mx-auto w-full max-w-[720px]">
          <Reveal className="flex flex-col items-center text-center">
            <h1 className="wd-h1 tracking-[0.16em] uppercase">
              Những lời yêu thương
            </h1>
            <BotanicalRule className="mt-6" lineClassName="w-10 sm:w-14" />
            <p className="wd-body-sm mx-auto mt-6 max-w-[420px]">
              Cảm ơn bạn đã dành những lời chúc tốt đẹp cho hành trình mới của
              chúng mình.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-20 md:mt-24">
            <WishForm />
          </Reveal>

          <BotanicalRule className="my-20 md:my-24" />

          {!configured ? (
            <p className="wd-body-sm text-center">
              Trang lời chúc chưa được kết nối database — bạn quay lại sau
              giúp mình nhé.
            </p>
          ) : wishes.length === 0 ? (
            <Reveal className="flex flex-col items-center gap-4 text-center">
              <p className="wd-body-sm">
                Chưa có lời chúc nào được duyệt — hãy là người đầu tiên gửi
                lời yêu thương cho chúng mình!
              </p>
            </Reveal>
          ) : (
            <ul className="flex flex-col">
              {wishes.map((wish, index) => (
                <li key={wish.id}>
                  {index > 0 ? <BotanicalRule className="my-12 md:my-14" /> : null}
                  <Reveal
                    delay={Math.min(index, 3) * 0.06}
                    className="flex flex-col items-center text-center"
                  >
                    <p className="wd-body-serif text-[clamp(1.15rem,3vw,1.4rem)] leading-[1.7] whitespace-pre-line">
                      {wish.message}
                    </p>
                    <p className="wd-eyebrow mt-6">{wish.name}</p>
                    <p className="wd-eyebrow wd-num mt-2 text-ink/50">
                      {formatWishDate(wish.createdAt)}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
