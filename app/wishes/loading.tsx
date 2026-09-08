import { SimpleHeader } from "@/components/ui/SimpleHeader";

/**
 * Next.js tự hiện file này trong lúc Server Component của page.tsx đang
 * fetch (bao gồm cả lúc chuyển trang qua pagination) — tránh màn hình trắng.
 * Skeleton rất nhẹ (animate-pulse), không spinner, tự tắt animation khi
 * prefers-reduced-motion (đã xử lý toàn site trong globals.css).
 */
export default function WishesLoading() {
  return (
    <>
      <SimpleHeader />
      <main className="w-full bg-ivory px-6 pt-5 pb-28 md:px-5 md:pt-16 md:pb-40">
        <div className="mx-auto flex max-w-[700px] flex-col items-center text-center">
          <div className="h-px w-10 animate-pulse rounded bg-taupe/15 sm:w-12" />
          <div className="mt-4 h-9 w-64 animate-pulse rounded bg-taupe/10 md:mt-5 md:h-11 md:w-80" />
          <div className="mt-3 h-3 w-72 animate-pulse rounded bg-taupe/10" />
        </div>

        <div className="mx-auto mt-5 grid w-full max-w-[1300px] grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 md:mt-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-[3px] border border-taupe/10 bg-warm/60"
            />
          ))}
        </div>
      </main>
    </>
  );
}
