import type { Metadata } from "next";
import Link from "next/link";
import { SimpleHeader } from "@/components/ui/SimpleHeader";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { BotanicalRule } from "@/components/ui/Botanical";
import { BotanicalAccent } from "@/components/ui/BotanicalAccent";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type Wish } from "@/lib/wishes";
import { coupleShort, wedding } from "@/lib/wedding";
import { cn } from "@/lib/utils";
import { WishCard } from "@/app/wishes/WishCard";
import { WishesPagination } from "@/app/wishes/WishesPagination";

export const metadata: Metadata = {
  title: `Những lời yêu thương · ${wedding.site.title}`,
  description: "Lời chúc từ những người thân yêu gửi đến Tuấn & Hoa.",
};

// Luôn lấy dữ liệu mới — lời chúc vừa gửi hiện ra ngay, lời chúc admin vừa
// xoá biến mất ngay, và mỗi lần đổi trang (?page=n) là một request khác.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

async function getWishes(
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
    .select("id, name, message, created_at", { count: "exact" })
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
    })),
  };
}

/**
 * Trang này hiển thị mọi lời chúc — gửi lên là hiện ngay, không qua duyệt;
 * admin chỉ có quyền xoá ở /admin/wishes. Không có form gửi ở đây: nơi duy
 * nhất để gửi lời chúc là ô "Lời chúc" trong form RSVP ở trang chủ (xem
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
  const { wishes, total, configured } = await getWishes(requestedPage);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageOutOfRange = configured && total > 0 && wishes.length === 0;

  return (
    <>
      <EnsureOpened />
      <SimpleHeader />

      <main className="relative isolate w-full overflow-x-hidden bg-ivory px-6 pt-10 pb-20 sm:px-8 md:pt-14 md:pb-28 lg:px-10">
        <BotanicalAccent
          variant="sprig"
          opacity={0.26}
          depth={5}
          flip
          className="top-[4%] -right-[2vw] hidden h-[30vh] w-[16vh] lg:block"
        />

        {/* Editorial hero — giữ ở mọi trạng thái (kể cả rỗng / lỗi). */}
        <header className="mx-auto flex max-w-[700px] flex-col items-center text-center">
          <BotanicalRule lineClassName="w-8 sm:w-12" />
          <p className="wd-eyebrow mt-5 text-[11px] tracking-[0.24em] sm:text-[12px] sm:tracking-[0.32em] md:text-[14px]">
            A collection of love &amp; wishes
          </p>
          <h1 className="wd-h1 mt-3 text-[clamp(30px,calc((100vw_-_48px)/8),38px)] leading-[1.1] sm:text-[42px] md:mt-4 md:text-[46px] lg:text-[54px]">
            Những lời yêu thương
          </h1>
          <p className="wd-body-sm mt-4 max-w-[460px] text-[17px] leading-[1.55] sm:text-[18px] md:text-[19px] lg:text-[20px]">
            Có những lời chúc giản dị, nhưng sẽ trở thành kỷ niệm đẹp theo
            chúng mình mãi về sau.
          </p>
          {configured && total > 0 && (
            <>
              <span aria-hidden="true" className="mt-6 block h-px w-10 bg-taupe/30" />
              <p className="font-display mt-4 text-[14px] tracking-[0.06em] text-taupe md:text-[16px]">
                {total} lời chúc được gửi đến chúng mình
              </p>
            </>
          )}
        </header>

        <div className="mx-auto mt-10 w-full max-w-[1260px] md:mt-14">
          {!configured ? (
            <p className="wd-body-sm text-center">
              Trang lời chúc chưa được kết nối database — bạn quay lại sau
              giúp mình nhé.
            </p>
          ) : total === 0 ? (
            <div className="flex flex-col items-center text-center">
              <Link href="/#rsvp" className={textLink}>
                Để lại lời chúc khi xác nhận tham dự
              </Link>
            </div>
          ) : pageOutOfRange ? (
            <div className="flex flex-col items-center text-center">
              <p className="wd-body-sm">Trang này không có lời chúc nào.</p>
              <Link href="/wishes" className={cn(textLink, "mt-4")}>
                Về trang đầu
              </Link>
            </div>
          ) : (
            <>
              {/* Masonry thuần CSS columns: card cao tự nhiên, không kéo giãn
                  theo card bên cạnh. Thứ tự DOM giữ nguyên mới nhất trước —
                  screen reader đọc đúng thứ tự; mắt đọc dọc từng cột như
                  trang sổ lưu bút, chấp nhận được với 12 lời chúc/trang. */}
              <ul className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3 lg:gap-6">
                {wishes.map((wish, index) => (
                  <WishCard key={wish.id} wish={wish} index={index} />
                ))}
              </ul>

              <WishesPagination currentPage={currentPage} totalPages={totalPages} />

              <section
                aria-label="Lời cảm ơn"
                className="mx-auto mt-16 flex max-w-[520px] flex-col items-center text-center md:mt-24"
              >
                <span aria-hidden="true" className="font-display text-[26px] leading-none text-sage">
                  ❦
                </span>
                <p className="font-display mt-5 text-[21px] leading-[1.45] text-ink italic md:text-[25px]">
                  Cảm ơn vì đã là một phần trong câu chuyện của chúng mình.
                </p>
                <p className="wd-body-sm mt-3 text-[17px] md:text-[18px]">
                  Từng lời chúc đều là một món quà thật đẹp.
                </p>
                <p className="font-display mt-6 text-[12px] tracking-[0.28em] text-taupe md:text-[14px]">
                  {coupleShort} · {wedding.date.day}.{wedding.date.month}.{wedding.date.year}
                </p>
                <Link href="/#rsvp" className={cn(textLink, "mt-6")}>
                  Gửi lời chúc tại trang xác nhận tham dự
                </Link>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

const textLink =
  "font-display inline-flex min-h-11 items-center text-[15px] text-ink-soft underline decoration-taupe/50 underline-offset-[6px] transition-colors duration-200 hover:text-ink hover:decoration-ink md:text-[17px]";
