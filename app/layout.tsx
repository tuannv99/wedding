import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, Manrope } from "next/font/google";
import { wedding } from "@/lib/wedding";
import { InvitationProvider } from "@/lib/invitation";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500"],
  variable: "--font-manrope",
  display: "swap",
});

/** Chỉ dùng cho các con số (.wd-numeral): ngày cưới, giờ lễ, đếm ngược. */
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${cormorant.variable} ${manrope.variable} ${dmSans.variable}`}
    >
      <body>
        <InvitationProvider>{children}</InvitationProvider>
      </body>
    </html>
  );
}
