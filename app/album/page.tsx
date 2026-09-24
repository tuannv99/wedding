import type { Metadata } from "next";
import { EnsureOpened } from "@/components/ui/EnsureOpened";
import { Navigation } from "@/components/wedding/Navigation";
import { AlbumStory } from "@/app/album/AlbumStory";
import { wedding } from "@/lib/wedding";

export const metadata: Metadata = {
  title: `Album · ${wedding.groom.short} & ${wedding.bride.short}`,
  description:
    "Những ngày Văn Tuấn & Mai Hoa đi chụp ảnh cưới, kể lại bằng ảnh theo thứ tự từ đầu đến cuối.",
};

/**
 * Vỏ của /album. Toàn bộ thân trang nằm trong AlbumStory vì mọi phần của nó
 * đều cần chung một state phía client (ảnh đang xem, bản đồ tổng thể, lightbox)
 * — kể cả tấm ảnh mở đầu và tấm khép lại, hai tấm này cũng bấm mở lớn được và
 * cũng là đích nhảy tới từ bản đồ.
 */
export default function AlbumPage() {
  return (
    <>
      <EnsureOpened />
      <Navigation />
      <AlbumStory />
    </>
  );
}
