import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { wedding } from "@/lib/wedding";
import { InvitationProvider } from "@/lib/invitation";
import { MusicProvider } from "@/lib/music";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "vietnamese"],
  // 600 không class nào dùng — bỏ đi để khỏi tải thừa 2 file font.
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(wedding.site.url),
  title: wedding.site.title,
  description: wedding.site.description,
  keywords: ["thiệp cưới online", "wedding invitation", "Tuấn & Hoa", "25.10.2026"],
  authors: [{ name: `${wedding.groom.name} & ${wedding.bride.name}` }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: wedding.site.url,
    siteName: wedding.site.title,
    title: wedding.site.title,
    description: wedding.site.description,
    images: [
      {
        url: "/images/wedding/og.jpg",
        width: 1200,
        height: 630,
        alt: `${wedding.groom.name} & ${wedding.bride.name} — 25.10.2026`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: wedding.site.title,
    description: wedding.site.description,
    images: ["/images/wedding/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f9f7f2",
  width: "device-width",
  initialScale: 1,
};

/**
 * Chốt "1% chiều cao màn hình" thành px (--wd-vh, dùng ở Hero/wedding.css)
 * ngay trước lần vẽ đầu tiên.
 *
 * Trong trình duyệt nhúng của Zalo/Messenger/Facebook, thanh công cụ của app
 * co lại/hiện ra khi cuộn bằng cách đổi kích thước CẢ khung webview — nên mọi
 * đơn vị vh/svh/dvh đổi theo giữa lúc đang cuộn. Hero cao 100svh vì thế cao
 * lên/thấp xuống ~50px, cả trang phía dưới bị đẩy đi và vẽ lại toàn bộ ảnh:
 * trang nháy liên tục khi cuộn. Ở đây chỉ tính lại khi BỀ NGANG đổi (xoay
 * máy); đổi chiều cao do thanh công cụ thì bỏ qua. Máy có chuột (cửa sổ
 * desktop kéo giãn) thì vẫn cập nhật theo mọi lần resize.
 */
const FREEZE_VIEWPORT_HEIGHT = `(function(){var r=document.documentElement;if(/(^| )nofreeze( |$)/.test(r.getAttribute("data-ft")||""))return;var w=-1,fine=window.matchMedia("(hover: hover) and (pointer: fine)").matches;function f(){var x=window.innerWidth;if(!fine&&x===w)return;w=x;r.style.setProperty("--wd-vh",window.innerHeight/100+"px")}f();window.addEventListener("resize",f)})();`;

/**
 * TẠM THỜI — bộ test cô lập hiện tượng nháy trên iPhone. Khách bình thường
 * không bị ảnh hưởng gì: chỉ bật khi URL có ?ft=<cờ>[,<cờ>...], ví dụ
 * /?ft=nodecode hoặc /album?ft=noimg,norise. Góc dưới trái màn hình hiện nhãn
 * "TEST: ..." để biết test đang bật. Xoá hằng này + khối CSS "Test cô lập"
 * cuối app/globals.css + class wd-hero-media ở Hero.tsx sau khi tìm ra nguyên
 * nhân.
 *
 *   nodecode    HTMLImageElement.decode() thành no-op. next/image gọi decode()
 *               cho MỌI ảnh ngay lúc ảnh tải xong (và lúc hydrate với ảnh đã
 *               tải sẵn) — nghi phạm số 1.
 *   async       Đổi mọi ảnh về decoding="async" (giá trị mặc định cũ của
 *               next/image, trước commit 0873cae).
 *   noimg       Ẩn mọi ảnh (vẫn tải, nhưng không vẽ/không giải mã) — nếu vẫn
 *               nháy thì nguyên nhân không nằm ở ảnh.
 *   norise      Tắt hiệu ứng nội dung nổi lên sau khi mở thiệp (.wd-rise).
 *   noheroanim  Tắt hiệu ứng mờ dần + thu nhỏ của ảnh Hero.
 *   nofreeze    Tắt việc chốt --wd-vh (quay về 100svh như cũ).
 */
const FLICKER_TESTS = `(function(){var ft=new URLSearchParams(location.search).get("ft");if(!ft)return;var r=document.documentElement,flags=ft.split(",");r.setAttribute("data-ft",flags.join(" "));function has(f){return flags.indexOf(f)>=0}if(has("nodecode")){HTMLImageElement.prototype.decode=function(){return Promise.resolve()}}if(has("async")){var fix=function(n){if(n.nodeType!==1)return;if(n.tagName==="IMG")n.decoding="async";else n.querySelectorAll("img").forEach(function(i){i.decoding="async"})};new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(fix)})}).observe(r,{childList:true,subtree:true})}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={cormorant.variable}
      // Script ở <head> ghi --wd-vh vào style của <html> trước khi React hydrate.
      suppressHydrationWarning
    >
      <head>
        {/* Thứ tự quan trọng: FLICKER_TESTS ghi data-ft trước, FREEZE đọc nó. */}
        <script dangerouslySetInnerHTML={{ __html: FLICKER_TESTS }} />
        <script dangerouslySetInnerHTML={{ __html: FREEZE_VIEWPORT_HEIGHT }} />
      </head>
      <body>
        <InvitationProvider>
          <MusicProvider>{children}</MusicProvider>
        </InvitationProvider>
      </body>
    </html>
  );
}
