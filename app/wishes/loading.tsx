import { SimpleHeader } from "@/components/ui/SimpleHeader";

/** Chiều cao so le để skeleton giống masonry thật, không phải lưới đều. */
const CARD_HEIGHTS = [160, 220, 280, 190, 250, 170];

/**
 * Next.js tự hiện file này trong lúc Server Component của page.tsx đang
 * fetch (bao gồm cả lúc chuyển trang qua pagination) — tránh màn hình trắng.
 * Khung khớp với page.tsx (cùng padding, hero, CSS columns) để lúc dữ liệu
 * về không bị nhảy layout. animate-pulse tự tắt khi prefers-reduced-motion
 * (đã xử lý toàn site trong globals.css).
 */
export default function WishesLoading() {
  return (
    <>
      <SimpleHeader />
      <main className="w-full overflow-x-hidden bg-ivory px-6 pt-10 pb-20 sm:px-8 md:pt-14 md:pb-28 lg:px-10">
        <div className="mx-auto flex max-w-[700px] flex-col items-center text-center">
          <div className="h-6 w-28 animate-pulse rounded bg-taupe/10 sm:w-40" />
          <div className="mt-4 h-10 w-64 animate-pulse rounded bg-taupe/10 md:mt-5 md:h-14 md:w-[26rem]" />
          <div className="mt-4 h-4 w-72 max-w-full animate-pulse rounded bg-taupe/10 md:w-[26rem]" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-taupe/10 md:w-80" />
        </div>

        <div className="mx-auto mt-10 w-full max-w-[1260px] columns-1 gap-4 sm:columns-2 sm:gap-5 md:mt-14 lg:columns-3 lg:gap-6">
          {CARD_HEIGHTS.map((height, i) => (
            <div
              key={i}
              style={{ height }}
              className="mb-4 animate-pulse break-inside-avoid rounded-[3px] border border-taupe/20 bg-warm sm:mb-5 lg:mb-6"
            />
          ))}
        </div>
      </main>
    </>
  );
}
