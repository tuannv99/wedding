import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { wedding } from "@/lib/wedding";
import { InvitationProvider } from "@/lib/invitation";
import { MusicProvider } from "@/lib/music";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "vietnamese"],
  // 600: chữ menu và các nhãn Lễ Thành Hôn / Cô dâu / Chú rể / Tiệc nhà…
  // (PC) cần đậm hơn 500 — thiếu file 600 thì trình duyệt tự "đậm giả".
  weight: ["300", "400", "500", "600"],
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
const FREEZE_VIEWPORT_HEIGHT = `(function(){var r=document.documentElement;var w=-1,fine=window.matchMedia("(hover: hover) and (pointer: fine)").matches;function f(){var x=window.innerWidth;if(!fine&&x===w)return;w=x;r.style.setProperty("--wd-vh",window.innerHeight/100+"px")}f();window.addEventListener("resize",f)})();`;

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
