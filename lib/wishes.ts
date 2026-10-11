/** Kiểu dữ liệu + giới hạn dùng chung giữa /api/rsvp, trang /wishes và admin. */

export type Wish = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

/**
 * Tag cache của dữ liệu trang /wishes (xem app/wishes/page.tsx). Chỗ nào ghi
 * hoặc xoá trong bảng wedding_wishes phải gọi revalidateTag(WISHES_TAG) để
 * lời chúc mới hiện ra / lời chúc bị xoá biến mất ngay.
 */
export const WISHES_TAG = "wishes";

export const WISH_NAME_MAX = 80;
export const WISH_MESSAGE_MAX = 500;

/**
 * RSVP cho phép name dài hơn (120 ký tự) và message dài hơn (1000 ký tự) so
 * với giới hạn của bảng wedding_wishes (80/500) — cắt bớt trước khi ghi sang
 * để không vi phạm CHECK constraint, không đổi giới hạn gốc của RSVP.
 */
export function toWishRow(name: string, message: string) {
  return {
    name: name.slice(0, WISH_NAME_MAX),
    message: message.slice(0, WISH_MESSAGE_MAX),
  };
}
