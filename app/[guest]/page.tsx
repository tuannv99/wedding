import type { Metadata } from "next";
import { HomeView } from "@/components/wedding/HomeView";
import { getGuest, guests } from "@/data/guests";
import { wedding } from "@/lib/wedding";

type Props = {
  params: Promise<{ guest: string }>;
};

/** Dựng sẵn trang cho các khách mẫu lúc build — khách admin thêm sau qua
 * /admin/guests vẫn hoạt động bình thường nhờ dynamicParams mặc định (true),
 * chỉ là dựng lúc có người mở link lần đầu thay vì lúc build. */
export function generateStaticParams() {
  return Object.keys(guests).map((guest) => ({ guest }));
}

/**
 * Slug không tồn tại → getGuest trả null → trả về {} (không override gì),
 * nên trang thừa kế nguyên metadata mặc định của layout — đúng yêu cầu
 * "fallback về thiệp mặc định", kể cả phần SEO/preview link.
 *
 * Ghi rõ cả openGraph/twitter (không chỉ `title`) vì Next.js không tự đồng
 * bộ `title` cấp trang vào các trường openGraph.title/twitter.title đã được
 * layout cha khai báo sẵn — thiếu bước này thì link Zalo/Messenger vẫn hiện
 * tiêu đề mặc định "Tuấn & Hoa..." thay vì lời chào cá nhân hoá.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guest } = await params;
  const found = await getGuest(guest);
  if (!found) return {};

  // Tiêu đề + mô tả khi gửi link qua Zalo/Messenger: đúng lời mời theo cách
  // xưng hô, vd "Gửi anh Hiếu" / "Trân trọng mời anh đến dự lễ cưới của chúng em..".
  const title = `${found.greeting} ${found.name}`;
  const description = found.message;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: `${wedding.site.url}/${guest}`,
      siteName: wedding.site.title,
      title,
      description,
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
      title,
      description,
      images: ["/images/wedding/og.jpg"],
    },
  };
}

export default async function GuestInvitationPage({ params }: Props) {
  const { guest } = await params;
  const found = await getGuest(guest);

  return <HomeView invitation={found ?? undefined} />;
}
