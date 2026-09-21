import { wedding } from "@/lib/wedding";

/**
 * "Nguyễn Văn Minh" → "nguyen-van-minh": bỏ dấu tiếng Việt, chữ thường, nối
 * khoảng trắng/ký tự đặc biệt bằng "-". Dùng để tạo slug URL từ tên khách mời.
 * "đ"/"Đ" không tách dấu qua NFD (nó là một chữ cái riêng, không phải d + dấu)
 * nên phải thay tay.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * URL thiệp cá nhân hoá đầy đủ cho một slug, ví dụ
 * createGuestInvitationUrl("linh") → "https://.../linh".
 * Ưu tiên browser origin khi chạy ở client (đúng domain đang mở, kể cả preview
 * deploy trên Vercel), rơi về wedding.site.url khi chạy ở server.
 */
export function createGuestInvitationUrl(slug: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : wedding.site.url;
  return `${base.replace(/\/+$/, "")}/${slug}`;
}
