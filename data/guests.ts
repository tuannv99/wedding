import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Guest = {
  name: string;
  /**
   * Lời chào đứng trước tên trên thiệp, ví dụ "Gửi bạn yêu" cho bạn thân
   * thay vì "Gửi bạn" mặc định. Bỏ trống thì dùng DEFAULT_GREETING.
   */
  greeting?: string;
};

/**
 * Vài khách mẫu — chỉ dùng khi CHƯA cấu hình Supabase (dev local không có
 * .env.local) hoặc slug không có trong bảng wedding_guests. Khách thật thêm
 * qua /admin/guests, không cần sửa file này nữa.
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

export const DEFAULT_GREETING = "Gửi bạn";

export type ResolvedGuest = { name: string; greeting: string };

function fromStaticList(slug: string): ResolvedGuest | null {
  const guest = guests[slug];
  if (!guest) return null;
  return { name: guest.name, greeting: guest.greeting ?? DEFAULT_GREETING };
}

/**
 * Tên hiển thị + lời chào (đã áp mặc định) cho một slug.
 *
 * Ưu tiên đọc từ bảng wedding_guests (admin tự thêm qua /admin/guests, có
 * hiệu lực ngay không cần deploy) — rơi về danh sách mẫu ở trên nếu chưa cấu
 * hình Supabase hoặc slug không có trong bảng. Trả null nếu không tìm thấy ở
 * đâu cả; nơi gọi (app/[guest]/page.tsx) tự fallback về thiệp mặc định.
 */
export async function getGuest(slug: string): Promise<ResolvedGuest | null> {
  const normalized = slug.toLowerCase();
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("wedding_guests")
      .select("name, greeting")
      .eq("slug", normalized)
      .maybeSingle();

    if (error) console.error("[guests] fetch failed:", error.message);
    if (data) return { name: data.name, greeting: data.greeting ?? DEFAULT_GREETING };
  }

  return fromStaticList(normalized);
}
