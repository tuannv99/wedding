export type Guest = {
  name: string;
  /**
   * Lời chào đứng trước tên trên thiệp, ví dụ "Gửi bạn yêu" cho bạn thân
   * thay vì "Gửi bạn" mặc định. Bỏ trống thì dùng DEFAULT_GREETING.
   */
  greeting?: string;
};

/**
 * Danh sách khách mời cho link thiệp cá nhân hoá (/<slug>, xem app/[guest]/page.tsx).
 * Thêm khách mời mới: chỉ cần thêm một dòng ở đây rồi deploy lại — không phải sửa UI.
 *
 * slug (khoá) = phần nằm trong URL: không dấu, chữ thường, nối bằng "-".
 * Có thể tự tạo bằng slugify() ở lib/guest-link.ts, hoặc dùng trang /create-link.
 */
export const guests: Record<string, Guest> = {
  linh: { name: "Linh" },
  minh: { name: "Minh" },
  tuan: { name: "Tuấn" },
  "nguyen-van-minh": { name: "Nguyễn Văn Minh" },
  "tran-thi-linh": { name: "Trần Thị Linh" },
  "nguyen-van-tuan": { name: "Nguyễn Văn Tuấn" },
  "minh-giang": { name: "Minh Giang", greeting: "Gửi bạn yêu" },
};

const DEFAULT_GREETING = "Gửi bạn";

/** Tên hiển thị + lời chào (đã áp mặc định) cho một slug — null nếu slug không có trong danh sách. */
export function getGuest(slug: string): { name: string; greeting: string } | null {
  const guest = guests[slug.toLowerCase()];
  if (!guest) return null;
  return { name: guest.name, greeting: guest.greeting ?? DEFAULT_GREETING };
}
