import type { Metadata } from "next";
import { HomeView } from "@/components/wedding/HomeView";
import { getGuest, guests } from "@/data/guests";
import { wedding } from "@/lib/wedding";

type Props = {
  params: Promise<{ guest: string }>;
};

/** Dựng sẵn trang cho từng khách trong danh sách — slug lạ vẫn render bình
 * thường nhờ dynamicParams mặc định (true), chỉ là dựng lúc request thay vì lúc build. */
export function generateStaticParams() {
  return Object.keys(guests).map((guest) => ({ guest }));
}

/**
 * Slug không có trong danh sách → getGuest trả null → trả về {} (không
 * override gì), nên trang thừa kế nguyên metadata mặc định của layout — đúng
 * yêu cầu "fallback về thiệp mặc định", kể cả phần SEO.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guest } = await params;
  const found = getGuest(guest);
  if (!found) return {};

  return { title: `${wedding.site.title} · Gửi ${found.name}` };
}

export default async function GuestInvitationPage({ params }: Props) {
  const { guest } = await params;
  const found = getGuest(guest);

  return <HomeView guestName={found?.name} guestGreeting={found?.greeting} />;
}
