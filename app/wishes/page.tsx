import type { Metadata } from "next";
import Link from "next/link";
import { SimpleHeader } from "@/components/ui/SimpleHeader";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { BotanicalRule } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type Wish } from "@/lib/wishes";
import { wedding } from "@/lib/wedding";
import { WishCard } from "@/app/wishes/WishCard";
import { WishesPagination } from "@/app/wishes/WishesPagination";

export const metadata: Metadata = {
  title: `Những lời yêu thương · ${wedding.site.title}`,
  description: "Lời chúc từ những người thân yêu gửi đến Tuấn & Hoa.",
};

// Luôn lấy dữ liệu mới — trang đổi ngay khi admin duyệt/xoá, và mỗi lần đổi
// trang (?page=n) là một request khác cần fetch lại.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

async function getApprovedWishes(
  page: number,
): Promise<{ wishes: Wish[]; total: number; configured: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { wishes: [], total: 0, configured: false };

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // { count: "exact" }: chỉ đếm, KHÔNG kéo hết dữ liệu về — range() giới hạn
  // đúng 1 trang (12 dòng) dù bảng có 10 hay 5000 lời chúc.
  const { data, error, count } = await supabase
    .from("wedding_wishes")
    .select("id, name, message, created_at, is_approved", { count: "exact" })
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[wishes] fetch failed:", error.message);
    return { wishes: [], total: 0, configured: true };
  }

  return {
    configured: true,
    total: count ?? 0,
    wishes: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      message: row.message,
      createdAt: row.created_at,
      isApproved: row.is_approved,
    })),
  };
}

/**
 * Trang này CHỈ hiển thị lời chúc đã duyệt — không có form gửi ở đây. Nơi
 * duy nhất để gửi lời chúc là ô "Lời chúc" trong form RSVP ở trang chủ (xem
 * app/api/rsvp/route.ts), cùng chảy vào bảng wedding_wishes.
 *
 * Phân trang qua URL (?page=n), render hoàn toàn ở server — hoạt động không
 * cần JS, dễ đọc bằng bàn phím/screen reader vì là link thật. Không có
 * client component nào trong trang này.
 */
export default async function WishesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Math.max(1, Math.trunc(Number(params.page)) || 1);
  const { wishes, total, configured } = await getApprovedWishes(requestedPage);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageOutOfRange = configured && total > 0 && wishes.length === 0;

  return (
    <>
      <EnsureOpened />
      <SimpleHeader />

      <main className="relative isolate w-full overflow-hidden bg-ivory px-6 pt-5 pb-28 md:px-5 md:pt-16 md:pb-40">
        <BotanicalAccent
          variant="sprig"
          opacity={0.26}
          depth={5}
          flip
          className="top-[4%] -right-[2vw] hidden h-[30vh] w-[16vh] lg:block"
        />

        {/* Hero rút gọn: divider nhỏ → title → mô tả ngắn (sát nhau, không
            chia nhỏ bằng divider thứ hai) — mục tiêu ~250-320px desktop /
            ~180-240px mobile trước khi vào grid. */}
        <div className="mx-auto flex max-w-[700px] flex-col items-center text-center">
          <BotanicalRule lineClassName="w-8 sm:w-12" />
          <h1 className="wd-h1 mt-4 text-[clamp(26px,4.5vw,44px)] tracking-[0.16em] uppercase md:mt-5">
            Những lời yêu thương
          </h1>
          <p className="wd-body-sm mx-auto mt-3 max-w-[420px]">
            Cảm ơn bạn đã dành những lời chúc tốt đẹp cho hành trình mới của
            chúng mình.
          </p>
        </div>

        <div className="mx-auto mt-5 w-full max-w-[1300px] md:mt-12">
          {!configured ? (
            <p className="wd-body-sm text-center">
              Trang lời chúc chưa được kết nối database — bạn quay lại sau
              giúp mình nhé.
            </p>
          ) : total === 0 ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="wd-body-sm">Chưa có lời chúc nào.</p>
              <p className="wd-body-sm">
                Hãy là người đầu tiên gửi lời yêu thương đến Tuấn &amp; Hoa —{" "}
                <Link href="/#rsvp" className="text-ink underline underline-offset-4">
                  để lại khi xác nhận tham dự
                </Link>
                .
              </p>
            </div>
          ) : pageOutOfRange ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="wd-body-sm">Trang này không có lời chúc nào.</p>
              <Link href="/wishes" className="text-ink underline underline-offset-4">
                Về trang đầu
              </Link>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {wishes.map((wish, index) => (
                  <WishCard key={wish.id} wish={wish} index={index} />
                ))}
              </ul>

              <WishesPagination currentPage={currentPage} totalPages={totalPages} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
