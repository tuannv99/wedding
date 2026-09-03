import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatWishDate, type Wish } from "@/lib/wishes";

const PREVIEW_COUNT = 2;

async function getLatestWishes(): Promise<Wish[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("wedding_wishes")
    .select("id, name, message, created_at, is_approved")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(PREVIEW_COUNT);

  if (error) {
    console.error("[wishes-preview] fetch failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: row.created_at,
    isApproved: row.is_approved,
  }));
}

/**
 * Section nhỏ gần cuối trang chủ — chỉ hé 1-2 lời chúc mới nhất, xem hết thì
 * qua /wishes. Luôn render dù chưa có lời chúc nào (empty state có layout
 * riêng) chứ không ẩn hẳn section — tránh trang chủ "hụt" mất một khối khi
 * mới mở web, chưa ai gửi lời chúc.
 */
export async function WishesPreview() {
  const wishes = await getLatestWishes();

  return (
    <section
      id="wishes-preview"
      className="relative isolate w-full overflow-hidden bg-ivory px-6 py-28 md:px-5 md:py-40"
    >
      <div className="mx-auto w-full max-w-[720px]">
        <SectionHeading title="Những lời yêu thương" />

        <div className="mt-16 md:mt-20">
          {wishes.length === 0 ? (
            <Reveal className="text-center">
              <p className="wd-body-sm">
                Hãy là người đầu tiên gửi lời yêu thương cho Tuấn &amp; Hoa.
              </p>
            </Reveal>
          ) : (
            <ul className="flex flex-col gap-14 md:gap-16">
              {wishes.map((wish, index) => (
                <li key={wish.id}>
                  <Reveal delay={index * 0.08} className="flex flex-col items-center text-center">
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

        <Reveal delay={0.15} className="mt-16 flex justify-center md:mt-20">
          <Link href="/wishes" className="wd-cta">
            Xem tất cả lời chúc
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="wd-cta-arrow h-3 w-3">
              <path
                d="M0 6h9M5.5 2 9 6l-3.5 4"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
